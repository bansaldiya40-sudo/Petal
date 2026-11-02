import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';

const dbPath = path.join(os.homedir(), 'PetalData', 'petal.db');
const db = new Database(dbPath);
const row = db.prepare("SELECT value FROM settings WHERE key = ?").get('geminiKey');
const key = row.value.trim();

async function test() {
  const start = Date.now();
  console.log('Sending fetch request to gemini-3.5-flash...');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Respond with exactly: "Gemini 3.5 Flash is ready."' }] }]
    })
  });
  console.log('Status:', res.status, `in ${Date.now() - start}ms`);
  const data = await res.json();
  console.log('Candidates:', data.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
}
test().catch(e => console.error(e));
