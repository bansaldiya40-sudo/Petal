import { testAiConnection, getSecrets, saveSecrets } from '../server/llmService.js';
import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';

const dbPath = path.join(os.homedir(), 'PetalData', 'petal.db');
const db = new Database(dbPath);
const row = db.prepare("SELECT value FROM settings WHERE key = 'geminiKey'").get();
if (row?.value) {
  saveSecrets({ geminiKey: row.value.trim() });
  console.log('Saved secret to secrets.json');
}

async function run() {
  console.log('Testing AI connection...');
  const res = await testAiConnection('gemini');
  console.log('Result:', res);
}
run();
