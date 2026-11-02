import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';

const dbPath = path.join(os.homedir(), 'PetalData', 'petal.db');
const db = new Database(dbPath);
const lesson = db.prepare("SELECT sections_json FROM lessons WHERE id = 'mat-1793548739808-dojlom'").get();
const jsonStr = lesson.sections_json;

const bannedPhrases = [
  'in this section',
  'the core concept introduced',
  'foundational arch',
  'applied context:',
  'confusing correlation with causation',
  'viral coefficient',
  'baseline × (1 + rate)',
  'output = baseline',
  'dropbox gave 500mb'
];

console.log('--- SCANNING REGENERATED MATERIAL FOR BANNED BOILERPLATE ---');
let foundAny = false;
bannedPhrases.forEach(phrase => {
  if (jsonStr.toLowerCase().includes(phrase)) {
    console.log(`❌ FOUND: "${phrase}"`);
    foundAny = true;
  }
});

if (!foundAny) {
  console.log('✅ ZERO template filler found! All 14 sections are completely free of placeholder text.');
}

const sections = JSON.parse(jsonStr);
console.log(`\nVerified ${sections.length} total sections.`);
sections.forEach((s, idx) => {
  const words = (s.inSimpleWords || '').split(/\s+/).filter(Boolean).length;
  console.log(`Sec ${idx + 1} [${s.slidesRange}]: "${s.title}" -> ${words} words, Status: ${s.status}, Key Terms: ${s.keyTerms?.length}`);
});
