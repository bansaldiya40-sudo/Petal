import puppeteer from 'puppeteer';
import path from 'path';

async function testScreenshots() {
  console.log('Launching browser to capture verification screenshots...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Visit material page for PM2 Tech Stacks Guide
  console.log('Navigating to material page...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Click PM2 landmark or navigate
  await page.evaluate(() => {
    // Look for landmark button for PM2 or click subject
    const btns = Array.from(document.querySelectorAll('button'));
    const pm2Btn = btns.find(b => b.innerText.includes('Product Management') || b.innerText.includes('PM2'));
    if (pm2Btn) pm2Btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Click the Tech Stacks Guide card
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('button, div[role="button"]'));
    const techStack = cards.find(c => c.innerText.includes('Tech Stacks') || c.innerText.includes('Technology Stacks'));
    if (techStack) techStack.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Capture Learn tab
  const learnShot = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'brain', '278a08d4-dbc9-44ad-8f0e-03541b018e17', 'verification_real_ai_learn_tab.png');
  await page.screenshot({ path: learnShot, fullPage: false });
  console.log('Saved learn tab screenshot:', learnShot);

  // 2. Open Settings modal
  await page.evaluate(() => {
    const settingsBtn = document.querySelector('button[aria-label="Garden Settings"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Settings'));
    if (settingsBtn) settingsBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click Test Connection button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const testBtn = btns.find(b => b.innerText.includes('Test connection'));
    if (testBtn) testBtn.click();
  });
  await new Promise(r => setTimeout(r, 2500));

  const settingsShot = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'brain', '278a08d4-dbc9-44ad-8f0e-03541b018e17', 'verification_settings_ai_connection_test.png');
  await page.screenshot({ path: settingsShot, fullPage: false });
  console.log('Saved settings screenshot:', settingsShot);

  await browser.close();
  console.log('Finished capturing screenshots!');
}
testScreenshots().catch(e => console.error(e));
