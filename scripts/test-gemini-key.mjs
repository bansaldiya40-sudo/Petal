import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';

const dbPath = path.join(os.homedir(), 'PetalData', 'petal.db');
const db = new Database(dbPath);
const row = db.prepare("SELECT value FROM settings WHERE key = 'geminiKey'").get();
const key = row.value.trim();

async function testGeneration() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${key}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Respond with exactly: {"status":"connected","model":"gemini-3.8-flash"}' }] }]
      })
    });
    console.log('Generate HTTP Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Result:', data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) {
    console.log('Error:', err.message);
  }
}

testGeneration();
