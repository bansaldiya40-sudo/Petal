import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';

const dbPath = path.join(os.homedir(), 'PetalData', 'petal.db');
const db = new Database(dbPath);
const lessons = db.prepare("SELECT id, chapter_title, subject_id, total_pages, file_path FROM lessons").all();
console.log('Lessons:', lessons);
