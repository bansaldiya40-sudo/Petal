import { callGemini } from '../server/llmService.js';
import AdmZip from 'adm-zip';

function extractPptx(filePath) {
  const zip = new AdmZip(filePath);
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
            .map(t => t.replace(/<[^>]+>/g, '').trim())
            .filter(t => t.length > 0 && !/^\d+$/.test(t));
          notes = noteTexts.join(' ');
        }
      }
    }

    // Elements
    const elements = [];
    const getParagraphs = (containerXml) => {
      const paras = containerXml.match(/<a:p[\s\S]*?<\/a:p>/gi) || [];
      return paras.map(p => {
        const runs = (p.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [])
          .map(t => t.replace(/<[^>]+>/g, ''))
          .join('');
        return runs.trim();
      }).filter(Boolean);
    };

    const getOffset = (elXml) => {
      const offMatch = elXml.match(/<a:off\s+x="(\d+)"\s+y="(\d+)"/i);
      return offMatch ? { x: parseInt(offMatch[1], 10), y: parseInt(offMatch[2], 10) } : { x: 0, y: 0 };
    };

    // Shapes
    const shapes = xml.match(/<p:sp[\s\S]*?<\/p:sp>/gi) || [];
    for (const sp of shapes) {
      const off = getOffset(sp);
      const paras = getParagraphs(sp);
      if (paras.length > 0) {
        elements.push({
          type: 'text',
          y: off.y,
          x: off.x,
          text: paras.join('\n')
        });
      }
    }

    // Tables
    const graphicFrames = xml.match(/<p:graphicFrame[\s\S]*?<\/p:graphicFrame>/gi) || [];
    for (const gf of graphicFrames) {
      if (gf.includes('a:tbl')) {
        const off = getOffset(gf);
        const rows = gf.match(/<a:tr[\s\S]*?<\/a:tr>/gi) || [];
        const tableLines = [];
        rows.forEach((r, rIdx) => {
          const cells = r.match(/<a:tc[\s\S]*?<\/a:tc>/gi) || [];
          const cellTexts = cells.map(c => {
            const paras = getParagraphs(c);
            return paras.join(' ').replace(/\|/g, '-');
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
            text: tableLines.join('\n')
          });
        }
      }
    }

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

    const fullContent = elements.map(e => e.text).join('\n\n');

    parsedSlides.push({
      slideNumber: slideNum,
      title: title || `Slide ${slideNum}`,
      content: fullContent,
      notes: notes || undefined
    });
  });

  return parsedSlides;
}

async function testGeneration() {
  console.log('📖 Extracting PPTX...');
  const slides = extractPptx('data/uploads/1793529248885-1wllnf-PM2-Combined-Overview-v2 - Day 1.pptx');
  console.log(`Extracted ${slides.length} slides.`);

  // Build slide-by-slide structured input
  const structuredInput = slides.map(s => {
    let text = `Slide ${s.slideNumber}: ${s.title}\n${s.content}`;
    if (s.notes) text += `\nSpeaker Notes: ${s.notes}`;
    return text;
  }).join('\n\n---\n\n');

  console.log('\nTotal structured input length:', structuredInput.length, 'characters.');

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

  console.log('\n🤖 Calling Gemini with full deck...');
  const start = Date.now();
  const res = await callGemini(prompt, 'Output strictly valid JSON conforming to the requested schema. Do not wrap in markdown fences.', {
    jsonMode: true,
    maxOutputTokens: 8192,
    temperature: 0.2,
    task: 'learn-topics-generation'
  });
  console.log(`⏱️ Completed in ${Date.now() - start}ms.`);

  const parsed = JSON.parse(res.text);
  console.log('\n=== GENERATED RESULT ===');
  console.log('Deck Title:', parsed.deck_title);
  console.log('Big Idea:', parsed.big_idea);
  console.log(`Topics count: ${parsed.topics.length}`);
  parsed.topics.forEach((t, i) => {
    console.log(`\nTopic ${i + 1}: "${t.title}" (Slides ${t.slides.join('–')})`);
    console.log(`  Summary: ${t.summary}`);
    console.log(`  Key concepts (${t.key_concepts.length}):`, t.key_concepts.map(k => k.term).join(', '));
    if (t.comparison_table) {
      console.log(`  Comparison Table: ${t.comparison_table.headers.join(' | ')} (${t.comparison_table.rows.length} rows)`);
    }
    console.log(`  Example: ${t.example}`);
    console.log(`  Why it matters: ${t.why_it_matters}`);
    console.log(`  Common confusion: ${t.common_confusion}`);
  });
  console.log('\nKey Takeaways count:', parsed.key_takeaways.length);
  console.log('Glossary count:', parsed.glossary.length);
}

testGeneration().catch(e => {
  console.error('Test generation failed:', e);
});
