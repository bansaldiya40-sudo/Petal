import { callGemini } from '../server/llmService.js';

async function test(model) {
  console.log(`Testing model ${model}...`);
  try {
    const res = await callGemini('Say "Ready" in 1 word.', '', { model, maxOutputTokens: 20 });
    console.log(`Model ${model} SUCCESS:`, res.text.trim());
    return true;
  } catch (e) {
    console.log(`Model ${model} failed:`, e.message);
    return false;
  }
}

async function run() {
  await test('gemini-3.6-flash');
  await test('gemini-3.5-flash-lite');
  await test('gemini-flash-lite-latest');
  await test('gemini-3.5-flash');
}
run();
