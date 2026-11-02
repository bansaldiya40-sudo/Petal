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
  await new Promise(r => setTimeout(r, 2000));

  // Step 1: Click the PM2 landmark
  console.log('Finding and clicking PM2 landmark...');
  await page.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('*'));
    const pmSign = signs.find(e => e.textContent?.trim() === 'Product Management 2');
    if (pmSign) {
      const clickable = pmSign.closest('.group') || pmSign;
      clickable.click();
    }
  });
  await new Promise(r => setTimeout(r, 2000));

  // Step 2: Check current screen by checking titles
  const screenTitle = await page.evaluate(() => document.body.innerText.slice(0, 300));
  console.log('Current screen text preview:\n', screenTitle.replace(/\n/g, ' '));

  // Step 3: Click "Open Material" on "Pm2 Tech Stacks Guide"
  console.log('Clicking Open Material on Pm2 Tech Stacks Guide...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div'));
    const pm2Card = cards.find(c => c.textContent?.includes('Pm2 Tech Stacks Guide') && c.querySelector('button'));
    if (pm2Card) {
      const openBtn = Array.from(pm2Card.querySelectorAll('button')).find(b => b.textContent?.includes('Open Material'));
      if (openBtn) {
        openBtn.click();
      } else {
        pm2Card.click();
      }
    }
  });
  await new Promise(r => setTimeout(r, 2500));

  // Step 4: Screenshot top of Learn tab
  const shot1 = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'brain', '278a08d4-dbc9-44ad-8f0e-03541b018e17', 'verification_01_real_ai_pm2_learn_top.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved top screenshot:', shot1);

  // Scroll to Chapter 2 & Chapter 3-7 (Frontend & Backend Decision Guide)
  await page.evaluate(() => window.scrollBy(0, 1100));
  await new Promise(r => setTimeout(r, 800));
  const shot2 = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'brain', '278a08d4-dbc9-44ad-8f0e-03541b018e17', 'verification_02_real_ai_pm2_frontend_backend.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved frontend & backend screenshot:', shot2);

  // Scroll to Chapter 9 & Chapter 10 (Databases & Cloud Architecture Monolith vs Microservices)
  await page.evaluate(() => window.scrollBy(0, 1400));
  await new Promise(r => setTimeout(r, 800));
  const shot3 = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'brain', '278a08d4-dbc9-44ad-8f0e-03541b018e17', 'verification_03_real_ai_pm2_databases_cloud.png');
  await page.screenshot({ path: shot3 });
  console.log('Saved databases & cloud screenshot:', shot3);

  await browser.close();
}
run().catch(e => console.error(e));
