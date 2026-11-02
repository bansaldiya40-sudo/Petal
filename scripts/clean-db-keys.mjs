import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';

const dbPath = path.join(os.homedir(), 'PetalData', 'petal.db');
const db = new Database(dbPath);
const res = db.prepare("DELETE FROM settings WHERE key IN ('geminiKey', 'claudeKey', 'videoApiKey')").run();
console.log('Deleted rows from settings:', res.changes);

const remaining = db.prepare("SELECT key FROM settings").all();
console.log('Remaining settings keys:', remaining.map(r => r.key));
