import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';

const dbPath = path.join(os.homedir(), 'PetalData', 'petal.db');
const db = new Database(dbPath);
const row = db.prepare("SELECT value FROM settings WHERE key = ?").get('geminiKey');
const key = row.value.trim();

const modelsToTest = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-3-flash-preview',
  'gemma-4-31b-it',
  'gemma-4-26b-a4b-it'
];

for (const model of modelsToTest) {
  try {
    const jsonBody = JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] });
    const cmd = `curl.exe -m 8 -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}" -H "Content-Type: application/json" -d "${jsonBody.replace(/"/g, '\\"')}"`;
    const res = execSync(cmd, { encoding: 'utf-8' });
    const parsed = JSON.parse(res);
    if (parsed.error) {
      console.log(`[${model}] ERROR: ${parsed.error.code} - ${parsed.error.message.split('\n')[0]}`);
    } else if (parsed.candidates) {
      console.log(`[${model}] SUCCESS! Reply: ${parsed.candidates[0]?.content?.parts?.[0]?.text?.trim()}`);
    } else {
      console.log(`[${model}] Unknown: ${res.slice(0, 100)}`);
    }
  } catch (e) {
    console.log(`[${model}] Ex: ${e.message}`);
  }
}
