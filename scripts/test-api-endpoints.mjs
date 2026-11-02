async function testEndpoints() {
  console.log('--- 1. Testing GET /api/settings ---');
  const res1 = await fetch('http://localhost:3001/api/settings');
  const s = await res1.json();
  console.log('hasGeminiKey:', s.hasGeminiKey);
  console.log('geminiKey (masked):', s.geminiKey);
  console.log('Raw key exposed?', s.geminiKey?.includes('AQ') || s.geminiKey?.includes('AIza'));

  console.log('\n--- 2. Testing POST /api/ai/test ---');
  const res2 = await fetch('http://localhost:3001/api/ai/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ engine: 'gemini' })
  });
  const t = await res2.json();
  console.log('AI Test Result:', t);

  console.log('\n--- 3. Testing POST /api/ai/check-video-model ---');
  const res3 = await fetch('http://localhost:3001/api/ai/check-video-model', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'veo-2.0-generate-001' })
  });
  const v = await res3.json();
  console.log('Video Model Result:', v);

  console.log('\n--- 4. Testing GET /api/backup/export ---');
  const res4 = await fetch('http://localhost:3001/api/backup/export');
  const backup = await res4.json();
  console.log('Backup settings keys:', backup.settings?.map(r => r.key));
  const hasSecretsInBackup = backup.settings?.some(r => /key|secret|token|pass/i.test(r.key));
  console.log('Contains secrets in backup?', hasSecretsInBackup);
}
testEndpoints();
