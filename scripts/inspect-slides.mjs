import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';

const dbPath = path.join(os.homedir(), 'PetalData', 'petal.db');
const db = new Database(dbPath);
const lesson = db.prepare("SELECT raw_slides_json FROM lessons WHERE id = 'mat-1793548739808-dojlom'").get();
const slides = JSON.parse(lesson.raw_slides_json);
slides.forEach(s => {
  console.log(`[Slide ${s.slideNumber}] Title: ${s.title}`);
  const lines = (s.content || '').split('\n').filter(Boolean);
  console.log(`   Lines: ${lines.length}, First: ${lines[0] || ''}`);
});
