import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';

const dbPath = path.join(os.homedir(), 'PetalData', 'petal.db');
const db = new Database(dbPath);
const lesson = db.prepare("SELECT raw_slides_json, sections_json FROM lessons WHERE id = 'mat-1793548739808-dojlom'").get();
const slides = JSON.parse(lesson.raw_slides_json);
const sections = JSON.parse(lesson.sections_json);

const comparisons = [
  { secIdx: 1, slideIndices: [2], label: 'Frontend Technologies (HTML/CSS/JS)' },
  { secIdx: 2, slideIndices: [3, 4], label: 'Backend Languages & Decision Guide (Python vs Node vs Go vs Java)' },
  { secIdx: 4, slideIndices: [6], label: 'Databases (SQL vs NoSQL)' },
  { secIdx: 5, slideIndices: [7, 8], label: 'Cloud Architecture (Monolith vs Microservices)' }
];

comparisons.forEach(c => {
  const sec = sections[c.secIdx];
  const slideTexts = c.slideIndices.map(i => `[Slide ${slides[i].slideNumber}: ${slides[i].title}]\n${slides[i].content}`).join('\n\n');
  
  console.log(`\n======================================================`);
  console.log(`COMPARISON: ${c.label} (${sec.slidesRange})`);
  console.log(`======================================================`);
  console.log(`\n--- WHAT THE SLIDE ACTUALLY SAYS ---`);
  console.log(slideTexts.slice(0, 500) + '...');
  console.log(`\n--- WHAT PETAL LEARN TAB NOW SAYS ---`);
  console.log(`Title: ${sec.title}`);
  console.log(`In Simple Words: ${sec.inSimpleWords}`);
  console.log(`Analogy: ${sec.analogy}`);
  console.log(`PM Takeaway: ${sec.pmTakeaway}`);
  console.log(`Key Terms: ${sec.keyTerms?.map(k => k.term).join(', ')}`);
});
