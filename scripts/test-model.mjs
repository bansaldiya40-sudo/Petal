import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';

const dbPath = path.join(os.homedir(), 'PetalData', 'petal.db');
const db = new Database(dbPath);
const row = db.prepare("SELECT value FROM settings WHERE key = 'geminiKey'").get();
const key = row?.value?.trim();

async function test(modelName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
  const start = Date.now();
  console.log(`Starting test for ${modelName}...`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Respond with exactly: "OK"' }] }]
      })
    });
    const duration = Date.now() - start;
    console.log(modelName, 'status:', res.status, `took ${duration}ms`);
    const data = await res.json();
    console.log(modelName, 'reply:', data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || JSON.stringify(data));
  } catch (e) {
    console.log(modelName, 'error:', e.message);
  }
}

async function run() {
  await test('gemini-3.8-flash');
  await test('gemini-3.5-flash-lite');
}
run();
