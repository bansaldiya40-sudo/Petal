// server/materialProcessor.js
// Faithfully constructs grounded, authentic 3-tab Material experiences
// (Learn, Quiz, Visual) using real LLM generation strictly from lecture slides.
import crypto from 'crypto';
import AdmZip from 'adm-zip';
import { callGemini } from './llmService.js';

// -------------------------------------------------------------
// HELPER: CLEAN TITLE CASE
// -------------------------------------------------------------
export function toTitleCase(str) {
  if (!str) return '';
  const clean = str.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  const minorWords = new Set(['and', 'or', 'the', 'a', 'an', 'in', 'on', 'of', 'for', 'to', 'at', 'by', 'vs', 'with']);
  return clean
    .toLowerCase()
    .split(' ')
    .map((word, idx) => {
      if (idx > 0 && minorWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function cleanHeading(title) {
  if (!title) return '';
  return title
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .replace(/^slide\s*\d+[:\-]?\s*/i, '')
    .trim();
}

export function computeContentHash(slides, materialId = '') {
  const content = JSON.stringify(slides || []) + String(materialId);
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

// -------------------------------------------------------------
// 1. EXTRACT FULL SLIDE DECK (Tables, Shapes, Notes)
// -------------------------------------------------------------
export function extractPptxSlides(buffer) {
  const zip = new AdmZip(buffer);
  const slideEntries = zip.getEntries()
    .filter((e) => /^ppt\/slides\/slide\d+\.xml$/i.test(e.entryName))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.entryName.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });

  const parsedSlides = [];

  slideEntries.forEach((entry, idx) => {
    const slideNum = idx + 1;
    const xml = entry.getData().toString('utf8');

    // Notes
    let notes = '';
    const relEntry = zip.getEntry(`ppt/slides/_rels/slide${slideNum}.xml.rels`);
    if (relEntry) {
      const relXml = relEntry.getData().toString('utf8');
      const noteTargetMatch = relXml.match(/Target="(\.\.\/notesSlides\/notesSlide\d+\.xml)"/i);
      if (noteTargetMatch) {
        const notePath = 'ppt/' + noteTargetMatch[1].replace('../', '');
        const noteEntry = zip.getEntry(notePath);
        if (noteEntry) {
          const noteXml = noteEntry.getData().toString('utf8');
          const noteTexts = (noteXml.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [])
            .map((t) => t.replace(/<[^>]+>/g, '').trim())
            .filter((t) => t.length > 0 && !/^\d+$/.test(t));
          notes = noteTexts.join(' ');
        }
      }
    }

    const elements = [];
    const getParagraphs = (containerXml) => {
      const paras = containerXml.match(/<a:p[\s\S]*?<\/a:p>/gi) || [];
      return paras.map((p) => {
        const runs = (p.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [])
          .map((t) => t.replace(/<[^>]+>/g, ''))
          .join('');
        return runs.trim();
      }).filter(Boolean);
    };

    const getOffset = (elXml) => {
      const offMatch = elXml.match(/<a:off\s+x="(\d+)"\s+y="(\d+)"/i);
      return offMatch ? { x: parseInt(offMatch[1], 10), y: parseInt(offMatch[2], 10) } : { x: 0, y: 0 };
    };

    // 1. Shapes (<p:sp>)
    const shapes = xml.match(/<p:sp[\s\S]*?<\/p:sp>/gi) || [];
    for (const sp of shapes) {
      const off = getOffset(sp);
      const paras = getParagraphs(sp);
      if (paras.length > 0) {
        elements.push({
          type: 'text',
          y: off.y,
          x: off.x,
          text: paras.join('\n'),
        });
      }
    }

    // 2. Tables (<a:tbl> inside <p:graphicFrame>)
    const graphicFrames = xml.match(/<p:graphicFrame[\s\S]*?<\/p:graphicFrame>/gi) || [];
    for (const gf of graphicFrames) {
      if (gf.includes('a:tbl')) {
        const off = getOffset(gf);
        const rows = gf.match(/<a:tr[\s\S]*?<\/a:tr>/gi) || [];
        const tableLines = [];
        rows.forEach((r, rIdx) => {
          const cells = r.match(/<a:tc[\s\S]*?<\/a:tc>/gi) || [];
          const cellTexts = cells.map((c) => {
            const paras = getParagraphs(c);
            return paras.join(' ').replace(/\|/g, '-').trim();
          });
          tableLines.push(cellTexts.join(' | '));
          if (rIdx === 0) {
            tableLines.push(cellTexts.map(() => '---').join(' | '));
          }
        });

        if (tableLines.length > 0) {
          elements.push({
            type: 'table',
            y: off.y,
            x: off.x,
            text: tableLines.join('\n'),
          });
        }
      }
    }

    // Sort top to bottom
    elements.sort((a, b) => a.y - b.y || a.x - b.x);

    let titleParts = [];
    elements.forEach((el) => {
      if (el.type === 'text' && el.y < 1600000 && titleParts.length < 2 && el.text.length < 120 && !el.text.includes('\n')) {
        titleParts.push(el.text);
      }
    });

    let title = titleParts.join(' — ');
    if (!title && elements.length > 0) {
      title = elements[0].text.split('\n')[0].slice(0, 100);
    }

    const fullContent = elements.map((e) => e.text).join('\n\n');

    parsedSlides.push({
      slideNumber: slideNum,
      title: title || `Slide ${slideNum}`,
      content: fullContent,
      notes: notes || undefined,
    });
  });

  return parsedSlides;
}

// -------------------------------------------------------------
// 2. CONVERT TOPICS TO COMPATIBLE SECTIONS (for Quiz & Visual)
// -------------------------------------------------------------
export function topicsToSections(topics, slides) {
  if (!Array.isArray(topics) || topics.length === 0) return [];

  return topics.map((t, idx) => {
    const startNum = Array.isArray(t.slides) && t.slides[0] ? t.slides[0] : idx + 1;
    const endNum = Array.isArray(t.slides) && t.slides[1] ? t.slides[1] : startNum;
    const slidesRange = startNum === endNum ? `Slide ${startNum}` : `Slides ${startNum}–${endNum}`;

    const matchedSlides = (slides || []).filter(
      (s) => s.slideNumber >= startNum && s.slideNumber <= endNum
    );

    return {
      id: `sec-${idx + 1}`,
      sectionOrder: idx + 1,
      title: t.title || `Topic ${idx + 1}`,
      slidesRange,
      startSlide: startNum,
      endSlide: endNum,
      slides: matchedSlides.length > 0 ? matchedSlides : [{ slideNumber: startNum, title: t.title, content: t.summary || '' }],
      inSimpleWords: t.summary || '',
      keyTerms: (t.key_concepts || []).map((k) => ({ term: k.term, definition: k.meaning })),
      examples: t.example
        ? [
            {
              tag: 'company',
              title: 'Grounded Example from Slides',
              scenario: t.example,
              breakdown: t.why_it_matters || '',
            },
          ]
        : [],
      extraExamples: [],
      commonMistakes: t.common_confusion ? [t.common_confusion] : [],
      examTip: t.why_it_matters || '',
      pmTakeaway: t.why_it_matters || '',
      comparisonTable: t.comparison_table || null,
      status: 'ready',
    };
  });
}

// Backward-compatibility fallback
export function groupSlidesIntoSections(slides) {
  if (!slides || slides.length === 0) return [];
  const chunkSize = Math.max(1, Math.min(3, Math.ceil(slides.length / 6)));
  const sections = [];
  for (let i = 0; i < slides.length; i += chunkSize) {
    const chunk = slides.slice(i, i + chunkSize);
    const startNum = chunk[0].slideNumber;
    const endNum = chunk[chunk.length - 1].slideNumber;
    const title = chunk[0].title || `Section ${Math.floor(i / chunkSize) + 1}`;
    sections.push({
      id: `sec-${sections.length + 1}`,
      sectionOrder: sections.length + 1,
      title: cleanHeading(title),
      slidesRange: startNum === endNum ? `Slide ${startNum}` : `Slides ${startNum}–${endNum}`,
      startSlide: startNum,
      endSlide: endNum,
      slides: chunk,
    });
  }
  return sections;
}

// -------------------------------------------------------------
// 3. GENERATE GROUNDED LEARN DATA (Core LLM Pipeline)
// -------------------------------------------------------------
export async function generateGroundedLearnData(materialTitle, slides, subjectId, progressCallback) {
  if (progressCallback) {
    progressCallback({
      phase: 'reading',
      current: 1,
      total: slides.length,
      message: `Reading and structuring ${slides.length} slides with full tables & notes...`,
    });
  }

  // Format structured input slide-by-slide
  const structuredInput = slides.map((s) => {
    let text = `Slide ${s.slideNumber}: ${s.title}\n${s.content}`;
    if (s.notes) text += `\nSpeaker Notes: ${s.notes}`;
    return text;
  }).join('\n\n---\n\n');

  const prompt = `You are Petal's expert AI Professor and Product Management Tutor.
Analyze the complete slide deck provided below and create a grounded, high-quality, comprehensive study guide.

SLIDE DECK CONTENT:
"""
${structuredInput}
"""

TASK & SCHEMA SPECIFICATION:
Return a STRICT JSON object matching this schema exactly:
{
  "deck_title": "Clean, complete title of this deck",
  "big_idea": "1-2 sentences: what this whole deck is about and why it matters",
  "topics": [
    {
      "title": "Clean, complete, human-readable topic title",
      "slides": [3, 6],
      "summary": "One plain-English sentence",
      "key_concepts": [
        { "term": "Concept Name", "meaning": "simple words, max 20 words" }
      ],
      "comparison_table": {
        "headers": ["Header 1", "Header 2"],
        "rows": [
          ["Row 1 Col 1", "Row 1 Col 2"]
        ]
      },
      "example": "A real example taken from the slides (company, product, scenario)",
      "why_it_matters": "Why a learner in this course should care",
      "common_confusion": "One mistake or mix-up specific to this topic"
    }
  ],
  "key_takeaways": [
    "Takeaway 1",
    "Takeaway 2",
    "Takeaway 3"
  ],
  "glossary": [
    { "term": "Term", "meaning": "Clear definition based on slides" }
  ]
}

STRICT CONTENT & GROUPING RULES:
1. GROUPING:
   - Group substantive slides into 5 to 8 topics based on what they actually cover (each topic spanning 1 to 4 slides).
   - In "slides", record [startSlideNumber, endSlideNumber] (e.g. [3, 3] or [4, 5] or [6, 8]).
   - Skip title slides, agenda slides, and thank-you slides, but use the agenda to inform the topic order.
   - Name each topic with a clean, complete, human-readable title. Never cut off a title mid-sentence.
2. COMPARISON TABLE:
   - "comparison_table" is OPTIONAL. Include it ONLY when the slides contain an actual comparison (for example SQL vs NoSQL, Monolith vs Microservices, Native vs Cross-Platform vs PWA, REST vs GraphQL, etc.). If no comparison is in those slides, omit this field or set it to null.
3. KEY CONCEPTS:
   - Provide 3-7 key concepts per topic.
   - Every term must be a genuine concept from the slides (never a single stray word). Meaning must be simple words, max 20 words.
4. STRICT GROUNDING:
   - Use ONLY information from the uploaded slides. Do NOT add outside facts, ungrounded claims, or generic templates.
   - Keep the professor's real examples (company names like Instagram, Netflix, Facebook, Airbnb, Stripe, Spotify; metrics; tools) exactly as the slides give them.
   - Never output placeholder or template boilerplate (e.g., "Think of it like a foundational arch", "Worked Numeric Scenario", "Confusing correlation with causation").
   - Do NOT mention slide ranges (e.g., "in slides 3 to 6") in the explanation text.
`;

  if (progressCallback) {
    progressCallback({
      phase: 'learn',
      current: 1,
      total: slides.length,
      message: `Synthesizing grounded topics across ${slides.length} slides...`,
    });
  }

  const res = await callGemini(prompt, 'Output strictly valid JSON conforming to the requested schema. Do not wrap in markdown fences.', {
    jsonMode: true,
    maxOutputTokens: 8192,
    temperature: 0.2,
    task: 'learn-topics-generation',
  });

  let learnData;
  try {
    learnData = JSON.parse(res.text);
  } catch (parseErr) {
    // Attempt cleaning potential leading/trailing markdown fences
    const cleanText = res.text.replace(/^```json/i, '').replace(/```$/i, '').trim();
    learnData = JSON.parse(cleanText);
  }

  // Ensure robust schema fallbacks
  learnData.deck_title = learnData.deck_title || toTitleCase(materialTitle);
  learnData.big_idea = learnData.big_idea || `Grounded study guide for ${learnData.deck_title}.`;
  learnData.topics = Array.isArray(learnData.topics) ? learnData.topics : [];
  learnData.key_takeaways = Array.isArray(learnData.key_takeaways) ? learnData.key_takeaways : [];
  learnData.glossary = Array.isArray(learnData.glossary) ? learnData.glossary : [];

  // Convert topics to sections for quizzes and visual episodes
  const sections = topicsToSections(learnData.topics, slides);

  const learnOverview = {
    bigPicture: learnData.big_idea,
    roadmap: learnData.topics.map((t, idx) => ({
      sectionId: `sec-${idx + 1}`,
      title: t.title,
      summary: Array.isArray(t.slides) ? `Slides ${t.slides.join('–')}` : t.summary,
    })),
    quickRecap: learnData.key_takeaways,
    miniMemoryAids: learnData.glossary.slice(0, 8).map((g) => ({
      sectionTitle: g.term,
      aid: g.meaning,
    })),
  };

  // Generate Quiz
  if (progressCallback) {
    progressCallback({ phase: 'quiz', message: 'Formulating grounded exam questions...' });
  }
  const quizQuestions = await generateQuizQuestions(materialTitle, sections);

  // Generate Visual Episodes
  if (progressCallback) {
    progressCallback({ phase: 'visual', message: 'Composing animated visual explainer episodes...' });
  }
  const visualEpisodes = await generateVisualEpisodes(materialTitle, sections, subjectId);

  return {
    learnData,
    sections,
    learnOverview,
    quizQuestions,
    visualEpisodes,
    contentHash: computeContentHash(slides),
  };
}

// -------------------------------------------------------------
// 4. TOPIC LEVEL ADJUSTMENT ("Simplify" and "Go deeper")
// -------------------------------------------------------------
export async function adjustSingleTopic(topic, slides, mode = 'simplify') {
  const startNum = Array.isArray(topic.slides) ? topic.slides[0] : 1;
  const endNum = Array.isArray(topic.slides) ? (topic.slides[1] || startNum) : startNum;

  const topicSlides = (slides || []).filter(
    (s) => s.slideNumber >= startNum && s.slideNumber <= endNum
  );

  const slideContext = topicSlides.length > 0
    ? topicSlides.map((s) => `Slide ${s.slideNumber}: ${s.title}\n${s.content}`).join('\n\n')
    : `Topic: ${topic.title}\nSummary: ${topic.summary}`;

  let taskInstructions = '';
  let targetSchema = '';

  if (mode === 'simplify') {
    taskInstructions = `TASK (SIMPLIFY):
1. Rewrite this topic's summary and key concepts in simpler words and shorter sentences for a smart beginner.
2. Max 20 words per key concept.
3. Generate an everyday relatable ANALOGY comparing the concept to ordinary life (e.g. restaurant kitchen, traffic system, post office, library).
4. Retain all real examples from the lecture slides.`;

    targetSchema = `{
  "title": "${topic.title}",
  "slides": [${startNum}, ${endNum}],
  "summary": "One punchy, crystal-clear sentence",
  "analogy": "An everyday relatable analogy explaining this topic simply",
  "key_concepts": [
    { "term": "Concept Name", "meaning": "simple words, max 20 words" }
  ],
  "comparison_table": ${topic.comparison_table ? JSON.stringify(topic.comparison_table) : 'null'},
  "example": "A real example taken from the slides (company, product, scenario)",
  "why_it_matters": "Why a learner in this course should care",
  "common_confusion": "One mistake or mix-up specific to this topic"
}`;
  } else {
    taskInstructions = `TASK (GO DEEPER):
1. Add extra architectural detail, technical trade-offs, and scalability nuances strictly from the lecture slides.
2. Detail 1-2 specific edge cases or failure modes mentioned in the slides.
3. Provide a dedicated "PM Lens" section explaining how a Product Manager evaluates trade-offs, sizing, tech debt, and roadmap priorities for this topic.
4. Retain all real examples from the lecture slides.`;

    targetSchema = `{
  "title": "${topic.title}",
  "slides": [${startNum}, ${endNum}],
  "summary": "Technical in-depth overview grounded in the lecture slides",
  "extra_detail": "Deep dive into architectural trade-offs, mechanics, and bottlenecks strictly from the slides",
  "edge_cases": [
    "Specific edge case, failure scenario, or gotcha from the slides"
  ],
  "pm_lens": "PM Decision Framework: how to evaluate trade-offs, prioritization, and team decisions strictly from the slides",
  "key_concepts": [
    { "term": "Concept Name", "meaning": "concise, technically rigorous definition" }
  ],
  "comparison_table": ${topic.comparison_table ? JSON.stringify(topic.comparison_table) : 'null'},
  "example": "A real example taken from the slides (company, product, scenario)",
  "why_it_matters": "Why a learner in this course should care",
  "common_confusion": "One mistake or mix-up specific to this topic"
}`;
  }

  const prompt = `You are Petal's expert AI Professor.
Target Topic: "${topic.title}" (Slides ${startNum}–${endNum})

Current Topic JSON:
${JSON.stringify(topic, null, 2)}

Relevant Lecture Slides:
"""
${slideContext}
"""

${taskInstructions}

Return STRICT JSON matching the schema:
${targetSchema}

RULES:
- Grounded ONLY in the lecture slides.
- Never output generic template filler.
- Comparison table is optional (keep it only if the slides contain a real comparison).
`;

  const res = await callGemini(prompt, 'Output strictly valid JSON. No markdown fences.', {
    jsonMode: true,
    maxOutputTokens: 3500,
    temperature: 0.2,
    task: `adjust-topic-${mode}`,
  });

  try {
    const clean = res.text.replace(/^```json/i, '').replace(/```$/i, '').trim();
    const updated = JSON.parse(clean);
    const cleanTopic = { ...topic };
    if (mode === 'simplify') {
      delete cleanTopic.extra_detail;
      delete cleanTopic.edge_cases;
      delete cleanTopic.pm_lens;
    } else if (mode === 'deeper') {
      delete cleanTopic.analogy;
    }

    return {
      ...cleanTopic,
      ...updated,
      analogy: mode === 'simplify' ? (updated.analogy || updated.everyday_analogy || updated.analogy_text || cleanTopic.analogy) : undefined,
      mode,
      slides: [startNum, endNum],
    };
  } catch (e) {
    const clean = res.text.replace(/^```json/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(clean);
    return {
      ...topic,
      ...parsed,
      mode,
      slides: [startNum, endNum],
    };
  }
}

export async function generateSingleSection(section, subjectId) {
  const slides = section.slides || [];
  const fakeTopic = {
    title: section.title,
    slides: [section.startSlide || 1, section.endSlide || 1],
    summary: section.inSimpleWords || section.title,
    key_concepts: Array.isArray(section.keyTerms) ? section.keyTerms.map(k => typeof k === 'string' ? { term: k, meaning: '' } : k) : [],
    example: section.examples?.[0]?.text || '',
    why_it_matters: section.pmTakeaway || '',
    common_confusion: section.commonMistakes?.[0] || '',
  };
  const adjusted = await adjustSingleTopic(fakeTopic, slides, 'simplify');
  const [updatedSec] = topicsToSections([adjusted], slides);
  return { ...section, ...updatedSec, status: 'ready' };
}

// -------------------------------------------------------------
// 5. QUIZ QUESTIONS GENERATION (Grounding on Sections/Topics)
// -------------------------------------------------------------
export async function generateQuizQuestions(materialTitle, sections) {
  if (!Array.isArray(sections) || sections.length === 0) return [];

  const sectionsContext = sections
    .map(
      (sec) =>
        `[Section ${sec.id}: ${sec.title} | ${sec.slidesRange}]\n${(sec.slides || [])
          .map((s) => `Slide ${s.slideNumber}: ${s.content}`)
          .join('\n')}`
    )
    .join('\n\n');

  const prompt = `
Lecture Title: "${materialTitle}"
Lecture Content Across All Topics:
"""
${sectionsContext}
"""

TASK: Generate 10-12 high-quality, authentic multiple-choice quiz questions strictly testing the key concepts, trade-offs, and frameworks in these slides.
MANDATORY REQUIREMENTS:
1. Every question MUST include a "slideReference" stating the exact slide where the concept appears (e.g. "Slide 4", "Slide 9", "Slide 12").
2. Set "sourceChip" to the exact slide reference (e.g. "Slide 4").
3. Set "sectionTitle" to the corresponding topic title.
4. Set "sectionId" to the corresponding section id (e.g. "sec-1", "sec-2", "sec-3").
5. The explanation must directly cite what the slide stated.
6. The questions must test real PM decision scenarios, architecture choices, numbers, or frameworks from the slides.

Return JSON:
{
  "questions": [
    {
      "id": "q1",
      "sectionId": "sec-1",
      "sectionTitle": "Title",
      "slideReference": "Slide 4",
      "sourceChip": "Slide 4",
      "difficulty": "hard",
      "type": "scenario_mcq",
      "question": "Scenario question testing trade-offs from slides",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanationSimple": "Explanation citing slide facts."
    }
  ]
}
`;

  try {
    const res = await callGemini(prompt, 'Output strictly valid JSON without markdown fences.', {
      jsonMode: true,
      task: 'generate-quiz',
      temperature: 0.2,
      maxOutputTokens: 5500,
    });

    let questions = [];
    try {
      const parsed = JSON.parse(res.text);
      questions = parsed.questions || [];
    } catch (parseErr) {
      const objMatches = res.text.match(/\{[^{}]*"question"[^{}]*\}/g) || [];
      for (const m of objMatches) {
        try {
          const item = JSON.parse(m);
          if (item.question && item.options) questions.push(item);
        } catch (_) {}
      }
    }

    return questions.map((q, idx) => ({
      id: `q-${idx + 1}`,
      sectionId: q.sectionId || sections[idx % sections.length]?.id || 'sec-1',
      sectionTitle: q.sectionTitle || sections[idx % sections.length]?.title || 'Lecture Topic',
      slideReference: q.slideReference || q.sourceChip || 'Slide Reference',
      sourceChip: q.slideReference || q.sourceChip || 'Slide Reference',
      difficulty: q.difficulty || (idx % 3 === 0 ? 'very_hard' : idx % 2 === 0 ? 'hard' : 'medium'),
      type: q.type || 'scenario_mcq',
      question: q.question,
      options: q.options || [],
      correctAnswerIndex:
        typeof q.correctAnswerIndex === 'number'
          ? q.correctAnswerIndex
          : typeof q.correctIndex === 'number'
          ? q.correctIndex
          : 0,
      explanationSimple: q.explanationSimple || q.explanation || 'Based directly on the lecture slide content.',
    }));
  } catch (err) {
    console.warn('Quiz generation error:', err.message);
    return [];
  }
}

// -------------------------------------------------------------
// 6. VISUAL EPISODES GENERATION & ANIMATION BUILDER
// -------------------------------------------------------------

function buildEpisodeAnimationHtml(sec, idx, character, subjectId) {
  const title = (sec.title || `Visual Episode ${idx + 1}`).replace(/^CHAPTER(S)?\s*[\d–]+:\s*/i, '');
  const slides = sec.slidesRange || `Slide ${idx + 1}`;
  const lower = title.toLowerCase();

  // Color scheme matching Petal light garden theme
  const primaryPlum = '#3B2252';
  const lilac = '#6C3FE0';
  const emerald = '#10B981';
  const amber = '#F59E0B';
  const sky = '#0284C7';
  const bgCream = '#FFFDF9';

  let diagramSvg = '';
  let step1Desc = 'Client sends request via HTTPS';
  let step2Desc = 'Server processes logic & queries database';
  let step3Desc = 'Response returned and rendered';

  if (lower.includes('layer') || lower.includes('web') || idx === 0) {
    step1Desc = 'Client: User action triggers HTTPS request';
    step2Desc = 'Server: Validates business rules & authorization';
    step3Desc = 'Database: Queries state & returns JSON payload';
    diagramSvg = `
      <svg viewBox="0 0 540 220" width="100%" height="100%" style="overflow: visible;">
        <defs>
          <linearGradient id="gClient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E7DCFF"/><stop offset="100%" stop-color="#C7B2F5"/></linearGradient>
          <linearGradient id="gServer" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFF0B8"/><stop offset="100%" stop-color="#FED7AA"/></linearGradient>
          <linearGradient id="gDb" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#DBF5E7"/><stop offset="100%" stop-color="#A7F3D0"/></linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#4B2A7B" flood-opacity="0.08"/></filter>
        </defs>

        <!-- Connecting Data Pipes -->
        <path d="M 140 110 L 250 110" stroke="#CBD5E1" stroke-width="4" stroke-dasharray="6,6" id="path1"/>
        <path d="M 290 110 L 400 110" stroke="#CBD5E1" stroke-width="4" stroke-dasharray="6,6" id="path2"/>

        <!-- Animated Data Packets -->
        <circle id="pkt1" r="7" fill="${lilac}">
          <animateMotion path="M 140 110 L 250 110" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle id="pkt2" r="7" fill="${emerald}">
          <animateMotion path="M 290 110 L 400 110" dur="2s" begin="0.8s" repeatCount="indefinite" />
        </circle>
        <circle id="pkt3" r="6" fill="#F43F5E">
          <animateMotion path="M 400 120 L 290 120" dur="2s" begin="1.4s" repeatCount="indefinite" />
        </circle>
        <circle id="pkt4" r="6" fill="${lilac}">
          <animateMotion path="M 250 120 L 140 120" dur="2s" begin="2.0s" repeatCount="indefinite" />
        </circle>

        <!-- Node 1: Client -->
        <g transform="translate(40, 50)" filter="url(#shadow)">
          <rect width="100" height="120" rx="18" fill="url(#gClient)" stroke="#B196F5" stroke-width="2"/>
          <rect x="15" y="15" width="70" height="50" rx="8" fill="#FFFFFF" stroke="#D8C7F5"/>
          <circle cx="50" cy="40" r="12" fill="#E7DCFF"/>
          <text x="50" y="85" font-size="13" font-weight="bold" fill="${primaryPlum}" text-anchor="middle" font-family="system-ui">Client</text>
          <text x="50" y="100" font-size="10" fill="#6C538C" text-anchor="middle" font-family="system-ui">Browser / Mobile</text>
        </g>

        <!-- Node 2: Server -->
        <g transform="translate(220, 50)" filter="url(#shadow)">
          <rect width="100" height="120" rx="18" fill="url(#gServer)" stroke="#F59E0B" stroke-width="2"/>
          <rect x="15" y="15" width="70" height="50" rx="8" fill="#FFFFFF" stroke="#FDE68A"/>
          <path d="M 25 30 L 75 30 M 25 40 L 75 40 M 25 50 L 55 50" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
          <text x="50" y="85" font-size="13" font-weight="bold" fill="${primaryPlum}" text-anchor="middle" font-family="system-ui">Server</text>
          <text x="50" y="100" font-size="10" fill="#855627" text-anchor="middle" font-family="system-ui">Business Logic</text>
        </g>

        <!-- Node 3: Database -->
        <g transform="translate(400, 50)" filter="url(#shadow)">
          <rect width="100" height="120" rx="18" fill="url(#gDb)" stroke="#10B981" stroke-width="2"/>
          <ellipse cx="50" cy="25" rx="30" ry="10" fill="#FFFFFF" stroke="#6EE7B7"/>
          <path d="M 20 25 V 55 A 30 10 0 0 0 80 55 V 25" fill="#FFFFFF" stroke="#6EE7B7"/>
          <text x="50" y="85" font-size="13" font-weight="bold" fill="${primaryPlum}" text-anchor="middle" font-family="system-ui">Database</text>
          <text x="50" y="100" font-size="10" fill="#065F46" text-anchor="middle" font-family="system-ui">Permanent Store</text>
        </g>
      </svg>
    `;
  } else if (lower.includes('speed') || lower.includes('cach') || lower.includes('cdn') || idx === 1) {
    step1Desc = 'Client requests static asset or video chunk';
    step2Desc = 'Edge CDN hits cache in 15ms near user';
    step3Desc = 'Origin Server called only on cache miss';
    diagramSvg = `
      <svg viewBox="0 0 540 220" width="100%" height="100%" style="overflow: visible;">
        <defs>
          <filter id="shadow2" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#4B2A7B" flood-opacity="0.08"/></filter>
        </defs>

        <!-- CDN Path (Fast Hit) -->
        <path d="M 120 110 Q 230 40 330 80" stroke="${emerald}" stroke-width="3" fill="none" stroke-dasharray="4,4"/>
        <!-- Origin Path (Slow Miss) -->
        <path d="M 120 110 Q 280 180 430 110" stroke="#CBD5E1" stroke-width="2" fill="none" stroke-dasharray="4,4"/>

        <!-- Fast CDN Packet -->
        <circle r="7" fill="${emerald}">
          <animateMotion path="M 120 110 Q 230 40 330 80 Q 230 40 120 110" dur="2.4s" repeatCount="indefinite"/>
        </circle>

        <!-- User -->
        <g transform="translate(30, 60)" filter="url(#shadow2)">
          <rect width="90" height="100" rx="16" fill="#E7DCFF" stroke="#B196F5" stroke-width="2"/>
          <circle cx="45" cy="35" r="16" fill="#FFFFFF"/>
          <text x="45" y="75" font-size="12" font-weight="bold" fill="${primaryPlum}" text-anchor="middle" font-family="system-ui">User / Client</text>
          <text x="45" y="90" font-size="9" fill="#6C538C" text-anchor="middle" font-family="system-ui">In Bengaluru</text>
        </g>

        <!-- CDN Edge Server -->
        <g transform="translate(250, 20)" filter="url(#shadow2)">
          <rect width="110" height="100" rx="16" fill="#DBF5E7" stroke="${emerald}" stroke-width="2.5"/>
          <rect x="15" y="12" width="80" height="24" rx="6" fill="#FFFFFF"/>
          <text x="55" y="28" font-size="11" font-weight="bold" fill="${emerald}" text-anchor="middle" font-family="system-ui">⚡ CDN EDGE</text>
          <text x="55" y="60" font-size="11" font-weight="bold" fill="${primaryPlum}" text-anchor="middle" font-family="system-ui">Cache HIT: 15ms</text>
          <text x="55" y="78" font-size="9" fill="#047857" text-anchor="middle" font-family="system-ui">Netflix / Cloudflare</text>
        </g>

        <!-- Origin Server -->
        <g transform="translate(420, 60)" filter="url(#shadow2)">
          <rect width="90" height="100" rx="16" fill="#FFF0B8" stroke="#F59E0B" stroke-width="2"/>
          <rect x="15" y="15" width="60" height="30" rx="6" fill="#FFFFFF"/>
          <text x="45" y="75" font-size="11" font-weight="bold" fill="${primaryPlum}" text-anchor="middle" font-family="system-ui">Origin Server</text>
          <text x="45" y="90" font-size="9" fill="#855627" text-anchor="middle" font-family="system-ui">US Central • 350ms</text>
        </g>
      </svg>
    `;
  } else if (lower.includes('front') || lower.includes('render') || idx === 2) {
    step1Desc = 'State changes in React / UI framework';
    step2Desc = 'Virtual DOM compares & diffs changes in memory';
    step3Desc = 'Batched patch updates real browser DOM once';
    diagramSvg = `
      <svg viewBox="0 0 540 220" width="100%" height="100%" style="overflow: visible;">
        <defs>
          <filter id="shadow3" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#4B2A7B" flood-opacity="0.08"/></filter>
        </defs>

        <!-- Arrow 1 -->
        <path d="M 150 110 L 220 110" stroke="${sky}" stroke-width="3" marker-end="url(#arrow)"/>
        <!-- Arrow 2 -->
        <path d="M 340 110 L 410 110" stroke="${emerald}" stroke-width="3"/>

        <circle r="6" fill="${sky}">
          <animateMotion path="M 150 110 L 220 110" dur="1.8s" repeatCount="indefinite"/>
        </circle>
        <circle r="6" fill="${emerald}">
          <animateMotion path="M 340 110 L 410 110" dur="1.8s" begin="0.9s" repeatCount="indefinite"/>
        </circle>

        <!-- Box 1: Component State -->
        <g transform="translate(30, 50)" filter="url(#shadow3)">
          <rect width="120" height="110" rx="16" fill="#F0F9FF" stroke="${sky}" stroke-width="2"/>
          <text x="60" y="35" font-size="13" font-weight="bold" fill="${sky}" text-anchor="middle" font-family="system-ui">State Change</text>
          <rect x="20" y="50" width="80" height="20" rx="6" fill="#FFFFFF"/>
          <text x="60" y="64" font-size="10" font-family="monospace" fill="${primaryPlum}" text-anchor="middle">count: 42 ➔ 43</text>
          <text x="60" y="92" font-size="9" fill="#0369A1" text-anchor="middle" font-family="system-ui">Instant in RAM</text>
        </g>

        <!-- Box 2: Virtual DOM -->
        <g transform="translate(220, 45)" filter="url(#shadow3)">
          <rect width="120" height="120" rx="16" fill="#FAF5FF" stroke="${lilac}" stroke-width="2"/>
          <text x="60" y="30" font-size="13" font-weight="bold" fill="${lilac}" text-anchor="middle" font-family="system-ui">Virtual DOM</text>
          <circle cx="60" cy="55" r="10" fill="#E9D5FF"/>
          <circle cx="40" cy="85" r="8" fill="#DDD6FE"/>
          <circle cx="80" cy="85" r="8" fill="${emerald}"/>
          <text x="60" y="110" font-size="9" fill="#6D28D9" text-anchor="middle" font-family="system-ui">Tree Diff (Fast)</text>
        </g>

        <!-- Box 3: Real Browser DOM -->
        <g transform="translate(410, 50)" filter="url(#shadow3)">
          <rect width="100" height="110" rx="16" fill="#ECFDF5" stroke="${emerald}" stroke-width="2"/>
          <text x="50" y="35" font-size="13" font-weight="bold" fill="${emerald}" text-anchor="middle" font-family="system-ui">Real DOM</text>
          <rect x="15" y="50" width="70" height="22" rx="6" fill="#FFFFFF" stroke="${emerald}"/>
          <text x="50" y="65" font-size="10" font-weight="bold" fill="${emerald}" text-anchor="middle" font-family="system-ui">Single Patch</text>
          <text x="50" y="92" font-size="9" fill="#047857" text-anchor="middle" font-family="system-ui">No Full Reflow</text>
        </g>
      </svg>
    `;
  } else if (lower.includes('arch') || lower.includes('microservice') || idx === 4) {
    step1Desc = 'Client API request hits API Gateway / Router';
    step2Desc = 'Traffic routed to independent microservices';
    step3Desc = 'Services scale independently with Docker/K8s';
    diagramSvg = `
      <svg viewBox="0 0 540 220" width="100%" height="100%" style="overflow: visible;">
        <!-- Router -->
        <g transform="translate(40, 70)">
          <rect width="100" height="80" rx="14" fill="#F3ECFB" stroke="${lilac}" stroke-width="2"/>
          <text x="50" y="35" font-size="12" font-weight="bold" fill="${lilac}" text-anchor="middle" font-family="system-ui">API Gateway</text>
          <text x="50" y="55" font-size="10" fill="#6C538C" text-anchor="middle" font-family="system-ui">Traffic Router</text>
        </g>

        <!-- Paths -->
        <path d="M 140 100 L 250 50" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="4,4"/>
        <path d="M 140 110 L 250 110" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="4,4"/>
        <path d="M 140 120 L 250 170" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="4,4"/>

        <!-- Service 1: Auth -->
        <g transform="translate(250, 20)">
          <rect width="130" height="55" rx="12" fill="#DBF5E7" stroke="${emerald}" stroke-width="1.5"/>
          <text x="65" y="25" font-size="11" font-weight="bold" fill="${emerald}" text-anchor="middle" font-family="system-ui">Auth Service 🔑</text>
          <text x="65" y="42" font-size="9" fill="#047857" text-anchor="middle" font-family="system-ui">Containerized • Auto-scaled</text>
        </g>

        <!-- Service 2: Orders -->
        <g transform="translate(250, 85)">
          <rect width="130" height="55" rx="12" fill="#FFF0B8" stroke="#F59E0B" stroke-width="1.5"/>
          <text x="65" y="25" font-size="11" font-weight="bold" fill="#B45309" text-anchor="middle" font-family="system-ui">Orders Service 📦</text>
          <text x="65" y="42" font-size="9" fill="#78350F" text-anchor="middle" font-family="system-ui">Independent deployment</text>
        </g>

        <!-- Service 3: Payments -->
        <g transform="translate(250, 150)">
          <rect width="130" height="55" rx="12" fill="#F0F9FF" stroke="${sky}" stroke-width="1.5"/>
          <text x="65" y="25" font-size="11" font-weight="bold" fill="${sky}" text-anchor="middle" font-family="system-ui">Payments Service 💳</text>
          <text x="65" y="42" font-size="9" fill="#0369A1" text-anchor="middle" font-family="system-ui">Zero downtime updates</text>
        </g>

        <!-- Animated dots -->
        <circle r="5" fill="${emerald}"><animateMotion path="M 140 100 L 250 50" dur="2s" repeatCount="indefinite"/></circle>
        <circle r="5" fill="#F59E0B"><animateMotion path="M 140 110 L 250 110" dur="2s" begin="0.6s" repeatCount="indefinite"/></circle>
        <circle r="5" fill="${sky}"><animateMotion path="M 140 120 L 250 170" dur="2s" begin="1.2s" repeatCount="indefinite"/></circle>
      </svg>
    `;
  } else {
    // Universal 3-Phase Interactive Architecture Diagram
    step1Desc = 'Client / Input triggers framework action';
    step2Desc = 'Core engine executes trade-offs & state updates';
    step3Desc = 'Output delivered with metrics & observability';
    diagramSvg = `
      <svg viewBox="0 0 540 220" width="100%" height="100%" style="overflow: visible;">
        <defs>
          <filter id="genShadow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#4B2A7B" flood-opacity="0.08"/></filter>
        </defs>

        <path d="M 140 110 L 230 110" stroke="#CBD5E1" stroke-width="3" stroke-dasharray="6,6"/>
        <path d="M 330 110 L 420 110" stroke="#CBD5E1" stroke-width="3" stroke-dasharray="6,6"/>

        <circle r="7" fill="${lilac}"><animateMotion path="M 140 110 L 230 110" dur="1.8s" repeatCount="indefinite"/></circle>
        <circle r="7" fill="${emerald}"><animateMotion path="M 330 110 L 420 110" dur="1.8s" begin="0.9s" repeatCount="indefinite"/></circle>

        <!-- Box 1 -->
        <g transform="translate(30, 55)" filter="url(#genShadow)">
          <rect width="110" height="105" rx="16" fill="#F3ECFB" stroke="${lilac}" stroke-width="2"/>
          <text x="55" y="35" font-size="12" font-weight="bold" fill="${lilac}" text-anchor="middle" font-family="system-ui">1. Input Stage</text>
          <rect x="15" y="48" width="80" height="24" rx="6" fill="#FFFFFF"/>
          <text x="55" y="64" font-size="10" font-family="system-ui" fill="${primaryPlum}" text-anchor="middle">User Action</text>
          <text x="55" y="90" font-size="9" fill="#6C538C" text-anchor="middle" font-family="system-ui">${slides}</text>
        </g>

        <!-- Box 2 -->
        <g transform="translate(230, 45)" filter="url(#genShadow)">
          <rect width="120" height="120" rx="18" fill="#FFF0B8" stroke="#F59E0B" stroke-width="2.5"/>
          <text x="60" y="32" font-size="12" font-weight="bold" fill="#B45309" text-anchor="middle" font-family="system-ui">2. Engine Core</text>
          <circle cx="60" cy="62" r="14" fill="#FFFFFF" stroke="#F59E0B"/>
          <text x="60" y="67" font-size="12" text-anchor="middle">⚙️</text>
          <text x="60" y="94" font-size="10" font-weight="bold" fill="${primaryPlum}" text-anchor="middle" font-family="system-ui">Trade-offs</text>
          <text x="60" y="108" font-size="8" fill="#855627" text-anchor="middle" font-family="system-ui">Performance • Speed</text>
        </g>

        <!-- Box 3 -->
        <g transform="translate(410, 55)" filter="url(#genShadow)">
          <rect width="105" height="105" rx="16" fill="#DBF5E7" stroke="${emerald}" stroke-width="2"/>
          <text x="52" y="35" font-size="12" font-weight="bold" fill="${emerald}" text-anchor="middle" font-family="system-ui">3. Result</text>
          <rect x="15" y="48" width="75" height="24" rx="6" fill="#FFFFFF"/>
          <text x="52" y="64" font-size="10" font-family="system-ui" fill="${emerald}" text-anchor="middle">✓ Delivered</text>
          <text x="52" y="90" font-size="9" fill="#047857" text-anchor="middle" font-family="system-ui">PM Impact</text>
        </g>
      </svg>
    `;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${bgCream};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: ${primaryPlum};
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 12px 16px;
      user-select: none;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: ${lilac};
      border-bottom: 1px solid #F2E8D8;
      padding-bottom: 8px;
    }
    .live-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      background: #ECFDF5;
      color: ${emerald};
      border-radius: 999px;
      border: 1px solid #A7F3D0;
      font-size: 10px;
    }
    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${emerald};
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { opacity: 0.4; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.2); }
      100% { opacity: 0.4; transform: scale(0.9); }
    }
    .stage {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      margin: 4px 0;
    }
    .footer-steps {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      background: #FFFFFF;
      border: 1px solid #EFE5D5;
      border-radius: 12px;
      padding: 8px 12px;
      font-size: 11px;
      color: #6C538C;
    }
    .step-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .step-num {
      font-weight: 800;
      font-size: 10px;
      color: ${lilac};
      text-transform: uppercase;
    }
    .step-text {
      line-height: 1.25;
      color: ${primaryPlum};
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <span>${character} • Episode ${idx + 1} (${slides})</span>
    <span class="live-badge"><span class="live-dot"></span>Interactive Visual</span>
  </div>

  <div class="stage" id="stageContainer">
    ${diagramSvg}
  </div>

  <div class="footer-steps">
    <div class="step-item">
      <span class="step-num">Step 1</span>
      <span class="step-text">${step1Desc}</span>
    </div>
    <div class="step-item">
      <span class="step-num">Step 2</span>
      <span class="step-text">${step2Desc}</span>
    </div>
    <div class="step-item">
      <span class="step-num">Step 3</span>
      <span class="step-text">${step3Desc}</span>
    </div>
  </div>

  <script>
    let isPaused = false;
    window.addEventListener('message', function(e) {
      const svg = document.querySelector('svg');
      if (!svg) return;
      if (e.data === 'pause') {
        svg.pauseAnimations();
        isPaused = true;
      } else if (e.data === 'play') {
        svg.unpauseAnimations();
        isPaused = false;
      } else if (e.data === 'replay' || e.data === 'restart') {
        svg.setCurrentTime(0);
        svg.unpauseAnimations();
        isPaused = false;
      }
    });
  </script>
</body>
</html>`;
}

// -------------------------------------------------------------
// 6. VISUAL EPISODES GENERATION
// -------------------------------------------------------------
export async function generateVisualEpisodes(materialTitle, sections, subjectId) {
  const character = subjectId === 'pm2' ? 'Fairy Builder' : subjectId === 'mrm' ? 'Owl Researcher' : 'Bunny Merchant';
  const stageThumbnails = ['meadow', 'tower_room', 'market', 'treehouse_interior'];

  const episodes = (sections || []).slice(0, 8).map((sec, idx) => {
    const rawRange = sec.slidesRange || `Slide ${idx + 1}`;
    const cleanTitle = (sec.title || `Section ${idx + 1}`).replace(/^CHAPTER(S)?\s*[\d–]+:\s*/i, '');
    const bg = stageThumbnails[idx % stageThumbnails.length];

    const animationHtml = buildEpisodeAnimationHtml(sec, idx, character, subjectId);

    return {
      id: `ep-${idx + 1}`,
      episodeNumber: idx + 1,
      sectionId: sec.id || `sec-${idx + 1}`,
      sectionTitle: cleanTitle,
      slidesRange: rawRange,
      title: cleanTitle,
      durationSeconds: 24,
      narration: `In this visual episode, ${character} explores ${cleanTitle} (${rawRange}), illustrating key technical trade-offs and decisions directly from the slides.`,
      character,
      thumbnailType: bg,
      takeawayProp: rawRange,
      inRealLifeBridge: `Applying the architectural trade-offs of ${cleanTitle} in real-world product decisions.`,
      animationHtml,
      directorScene: {
        background: bg,
        camera: 'static',
        location: bg,
        dialogue: `Welcome to ${cleanTitle}! Let's walk through the core engineering trade-offs taught in ${rawRange}.`,
        characterMood: 'explaining',
        focusConcept: cleanTitle,
        actors: [
          { id: subjectId === 'pm2' ? 'fairy' : 'owl', position: 'center', scale: 1 },
        ],
        beats: [
          { t: 0.5, actor: subjectId === 'pm2' ? 'fairy' : 'owl', action: 'wave', say: `Welcome to ${cleanTitle}!` },
          { t: 4.0, actor: subjectId === 'pm2' ? 'fairy' : 'owl', action: 'point', say: `Notice the core trade-offs in ${rawRange}.` },
        ],
        caption: `${character} demonstrates ${cleanTitle} (${rawRange})`,
        takeaway_prop: rawRange,
        data: {
          badge: cleanTitle,
          subheadline: rawRange,
          characterName: character,
          headline: cleanTitle,
          speechBubble: `Welcome to ${cleanTitle}! We explore the key mechanisms from ${rawRange}.`,
        },
      },
      scenes: [
        {
          sceneOrder: 1,
          title: `Core Architecture: ${rawRange}`,
          durationSeconds: 8,
          narration: `${character} introduces the architectural components of ${cleanTitle} directly from ${rawRange}.`,
        },
        {
          sceneOrder: 2,
          title: 'Evaluating Performance & Cost Trade-offs',
          durationSeconds: 8,
          narration: `Weighing developer velocity, runtime efficiency, and infrastructure costs based on lecture metrics.`,
        },
        {
          sceneOrder: 3,
          title: 'PM Decision Framework',
          durationSeconds: 8,
          narration: `How product leaders use these technical dimensions to make defensible roadmap and hiring decisions.`,
        },
      ],
    };
  });

  return episodes;
}

// -------------------------------------------------------------
// 7. MAIN ASYNC MATERIAL GENERATOR
// -------------------------------------------------------------
export async function generateMaterialDataAsync(materialTitle, slides, subjectId, progressCallback) {
  return generateGroundedLearnData(materialTitle, slides, subjectId, progressCallback);
}
