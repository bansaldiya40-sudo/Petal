import puppeteer from 'puppeteer';
import path from 'path';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1080 });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Click PM2 landmark
  await page.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('*'));
    const pmSign = signs.find(e => e.textContent?.trim() === 'Product Management 2');
    if (pmSign) {
      const clickable = pmSign.closest('.group') || pmSign;
      clickable.click();
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  // Find exact card for "Pm2 Tech Stacks Guide"
  console.log('Finding exact card for "Pm2 Tech Stacks Guide"...');
  await page.evaluate(() => {
    const titles = Array.from(document.querySelectorAll('h4'));
    const targetTitle = titles.find(t => t.innerText?.toLowerCase().includes('tech stacks guide'));
    if (targetTitle) {
      const card = targetTitle.closest('.group');
      if (card) {
        card.click();
      } else {
        targetTitle.click();
      }
    }
  });
  await new Promise(r => setTimeout(r, 2000));

  // Verify we are on Pm2 Tech Stacks Guide
  const pageTitle = await page.evaluate(() => document.querySelector('h1')?.innerText || '');
  console.log('Opened Material Title:', pageTitle);

  // 1. Screenshot top of Learn tab (Big picture + Roadmap + Section 1 & 2)
  const shot1 = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'brain', '278a08d4-dbc9-44ad-8f0e-03541b018e17', 'verification_01_real_ai_pm2_learn_top.png');
  await page.screenshot({ path: shot1 });
  console.log('Captured top screenshot:', shot1);

  // 2. Scroll to Section 2 (Frontend) and Section 3 (Backend Decision Guide)
  await page.evaluate(() => {
    const sec2 = document.getElementById('sec-2');
    if (sec2) sec2.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 1000));
  const shot2 = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'brain', '278a08d4-dbc9-44ad-8f0e-03541b018e17', 'verification_02_real_ai_pm2_frontend_backend.png');
  await page.screenshot({ path: shot2 });
  console.log('Captured frontend & backend screenshot:', shot2);

  // 3. Scroll to Section 5 (Databases) and Section 6 (Cloud Architecture)
  await page.evaluate(() => {
    const sec5 = document.getElementById('sec-5');
    if (sec5) sec5.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 1000));
  const shot3 = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'brain', '278a08d4-dbc9-44ad-8f0e-03541b018e17', 'verification_03_real_ai_pm2_databases_cloud.png');
  await page.screenshot({ path: shot3 });
  console.log('Captured databases & cloud screenshot:', shot3);

  await browser.close();
  console.log('Done capturing screenshots for Pm2 Tech Stacks Guide!');
}
run().catch(e => console.error(e));
