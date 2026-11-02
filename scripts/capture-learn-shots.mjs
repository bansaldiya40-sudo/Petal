import puppeteer from 'puppeteer';
import path from 'path';

async function captureLearn() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1080 });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Click Product Management 2 pill
  console.log('Clicking Product Management 2...');
  const clickedPill = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*')).find(
      e => e.textContent?.trim().includes('Product Management 2') && e.tagName !== 'SCRIPT' && e.tagName !== 'STYLE' && (e.onclick || e.getAttribute('role') === 'button' || e.tagName === 'BUTTON' || e.classList.contains('cursor-pointer') || e.closest('button') || e.closest('.cursor-pointer'))
    );
    const target = el ? (el.closest('button') || el.closest('.cursor-pointer') || el) : null;
    if (target) {
      target.click();
      return true;
    }
    return false;
  });
  console.log('Clicked PM2 pill:', clickedPill);
  await new Promise(r => setTimeout(r, 1500));

  // Click "Pm2 Tech Stacks Guide" card
  console.log('Clicking Tech Stacks material card...');
  const clickedCard = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*')).find(
      e => e.textContent?.includes('Pm2 Tech Stacks Guide') && (e.onclick || e.closest('button') || e.closest('.cursor-pointer') || e.getAttribute('role') === 'button')
    );
    const target = el ? (el.closest('button') || el.closest('.cursor-pointer') || el) : null;
    if (target) {
      target.click();
      return true;
    }
    return false;
  });
  console.log('Clicked card:', clickedCard);
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot Learn tab header + first sections
  const shot1 = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'brain', '278a08d4-dbc9-44ad-8f0e-03541b018e17', 'verification_01_real_ai_pm2_learn_top.png');
  await page.screenshot({ path: shot1 });
  console.log('Captured top of Learn tab:', shot1);

  // Scroll down to Section 2 & 3 (Frontend & Backend Decision Guide)
  await page.evaluate(() => {
    window.scrollBy(0, 1000);
  });
  await new Promise(r => setTimeout(r, 800));

  const shot2 = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'brain', '278a08d4-dbc9-44ad-8f0e-03541b018e17', 'verification_02_real_ai_pm2_frontend_backend.png');
  await page.screenshot({ path: shot2 });
  console.log('Captured frontend & backend sections:', shot2);

  // Scroll down to Section 5 & 6 (Databases & Monolith vs Microservices)
  await page.evaluate(() => {
    window.scrollBy(0, 1200);
  });
  await new Promise(r => setTimeout(r, 800));

  const shot3 = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'brain', '278a08d4-dbc9-44ad-8f0e-03541b018e17', 'verification_03_real_ai_pm2_databases_cloud.png');
  await page.screenshot({ path: shot3 });
  console.log('Captured databases & cloud sections:', shot3);

  await browser.close();
  console.log('Finished capturing all Learn tab verification images!');
}
captureLearn().catch(e => console.error(e));
