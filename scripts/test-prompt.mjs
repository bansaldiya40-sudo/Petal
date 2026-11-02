import { callGemini } from '../server/llmService.js';
import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';

const dbPath = path.join(os.homedir(), 'PetalData', 'petal.db');
const db = new Database(dbPath);
const lesson = db.prepare("SELECT raw_slides_json FROM lessons WHERE id = 'mat-1793548739808-dojlom'").get();
const slides = JSON.parse(lesson.raw_slides_json);

// Slides 4 & 5
const sectionSlides = [slides[3], slides[4]];
const combinedText = sectionSlides.map(s => `[Slide ${s.slideNumber}: ${s.title}]\n${s.content}\n${s.notes || ''}`).join('\n\n');

const prompt = `
You are Petal's expert AI Professor and Product Management Tutor.
Analyze these lecture slides faithfully:

${combinedText}

TASK: Generate an in-depth, authentic study guide section strictly grounded in the slide content provided above.
Return a STRICT JSON object matching this exact schema:
{
  "title": "Exact Chapter / Lecture Topic Name in Title Case",
  "inSimpleWords": "150-400 words explaining directly and clearly what these slides teach. Walk through comparisons, architectures, or tables step by step in plain English without marketing fluff. Do NOT start with 'In this section' or 'The core concept'. Start directly with the core subject.",
  "analogy": "One specific, highly fitting analogy that explains this concept intuitively.",
  "examples": [
    {
      "tag": "company",
      "title": "Title of example",
      "scenario": "Concrete situation naming real companies/tools mentioned in the slides or standard equivalents.",
      "breakdown": "Explanation of trade-offs, architecture, or outcome."
    }
  ],
  "keyTerms": [
    {
      "term": "Term Name",
      "definition": "Concise one-line definition extracted directly from slide context."
    }
  ],
  "commonMistakes": ["Only include if slides explicitly mention pitfalls or warnings; otherwise empty array []"],
  "examTip": "Only include if slides have exam-style rules of thumb or warnings; otherwise null",
  "formulas": ["Only include if slides contain formulas/equations; otherwise empty array []"],
  "workedExample": "Only include if slides contain calculations/numbers; otherwise null",
  "pmTakeaway": "Practical advice for Product Managers from the PM Implication box on the slides."
}

GUIDELINES:
1. Include at least ONE Indian startup or company example (e.g. Zerodha, Swiggy, UPI, Flipkart, Razorpay) if applicable to backend/system architecture.
2. Under keyTerms: provide 4-8 genuine terms from the slides.
3. Common mistakes: Notice Slide 5 has "Hiring Market Matters", "Migration Is Expensive", "COMMON STACK SELECTION MISTAKES". Extract these authentic pitfalls!
4. Worked numeric example: Slide 4 and 5 have no calculations/formulas, so formulas MUST be [] and workedExample MUST be null.
5. NO BANNED BOILERPLATE: NEVER use phrases like "In this section...", "The core concept introduced...", "Foundational arch...", "Applied Context:", "Confusing correlation with causation".
`;

async function run() {
  console.log('Sending prompt to Gemini 3.5 Flash...');
  try {
    const res = await callGemini(prompt, 'You are an expert MBA instructor. Output strictly valid JSON without markdown fences.', {
      model: 'gemini-3.5-flash-lite',
      jsonMode: true,
      task: 'test-section-generation',
      temperature: 0.2
    });
    console.log('Got response! Latency:', res.latencyMs, 'ms');
    console.log('Tokens:', res.usage);
    const parsed = JSON.parse(res.text);
    console.log('Generated Title:', parsed.title);
    console.log('In Simple Words (word count: ' + parsed.inSimpleWords.split(/\s+/).length + '):\n', parsed.inSimpleWords);
    console.log('\nAnalogy:', parsed.analogy);
    console.log('\nExamples:\n', JSON.stringify(parsed.examples, null, 2));
    console.log('\nKey terms:\n', JSON.stringify(parsed.keyTerms, null, 2));
    console.log('PM Takeaway:', parsed.pmTakeaway);
    console.log('Formulas:', parsed.formulas);
    console.log('Worked Example:', parsed.workedExample);
    console.log('Common Mistakes:', parsed.commonMistakes);
  } catch (e) {
    console.error('Error:', e);
  }
}
run();
