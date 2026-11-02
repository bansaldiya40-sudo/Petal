import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';

const dbPath = path.join(os.homedir(), 'PetalData', 'petal.db');
const db = new Database(dbPath);
const row = db.prepare("SELECT value FROM settings WHERE key = ?").get('geminiKey');
const key = row.value.trim();

try {
  const jsonBody = JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] });
  const cmd = `curl.exe -m 15 -v -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${key}" -H "Content-Type: application/json" -d "${jsonBody.replace(/"/g, '\\"')}"`;
  console.log('Running curl...');
  const out = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
  console.log('Output:\n', out);
} catch (e) {
  console.log('Error status:', e.status);
  console.log('Stderr:\n', e.stderr?.toString());
  console.log('Stdout:\n', e.stdout?.toString());
}
