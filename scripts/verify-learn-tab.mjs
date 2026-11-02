import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/diyab/.gemini/antigravity/brain/278a08d4-dbc9-44ad-8f0e-03541b018e17';

async function verify() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    page.on('console', (msg) => console.log(`[Browser ${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => console.log(`[Browser PageError] ${err.toString()}`));

    // 1. Desktop test (1440 x 960)
    await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });
    console.log('Navigating to Petal...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));

    // Click PM2 landmark
    console.log('Clicking PM2 landmark...');
    await page.evaluate(() => {
      const signs = Array.from(document.querySelectorAll('*'));
      const pmSign = signs.find((e) => e.textContent?.trim() === 'Product Management 2');
      if (pmSign) {
        const clickable = pmSign.closest('.group') || pmSign;
        clickable.click();
      }
    });
    await new Promise((r) => setTimeout(r, 2000));

    // Find card for "PM2 Combined Overview" and click its Open Material button
    console.log('Finding card for "PM2 Combined Overview"...');
    const opened = await page.evaluate(() => {
      const allCards = Array.from(document.querySelectorAll('.group'));
      for (const card of allCards) {
        if (card.innerText && card.innerText.toLowerCase().includes('pm2 combined overview')) {
          const btn = card.querySelector('button');
          if (btn) {
            btn.click();
            return true;
          }
          card.click();
          return true;
        }
      }
      return false;
    });
    console.log('Opened material:', opened);
    await new Promise((r) => setTimeout(r, 3000));

    // Wait for #deck-big-idea
    await page.waitForSelector('#deck-big-idea', { timeout: 10000 });
    console.log('Grounded Learn Tab rendered successfully with #deck-big-idea!');

    // Screenshot 1: Desktop top (Header + Big Idea + Topic 1 open with concepts & example)
    const shot1 = path.join(ARTIFACT_DIR, 'verification_01_learn_grounded_topics_top.png');
    await page.screenshot({ path: shot1 });
    console.log('Captured:', shot1);

    // Scroll to inspect Topic 1 & 2 details
    await page.evaluate(() => {
      window.scrollBy(0, 480);
    });
    await new Promise((r) => setTimeout(r, 800));
    const shot2 = path.join(ARTIFACT_DIR, 'verification_02_learn_topic_details.png');
    await page.screenshot({ path: shot2 });
    console.log('Captured:', shot2);

    // Click on Topic 2 header to expand it
    console.log('Expanding Topic 2...');
    await page.evaluate(() => {
      const t2 = document.querySelector('#topic-card-1 h2');
      if (t2) t2.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Scroll down to check middle topics
    await page.evaluate(() => {
      window.scrollBy(0, 600);
    });
    await new Promise((r) => setTimeout(r, 800));
    const shot3 = path.join(ARTIFACT_DIR, 'verification_03_learn_middle_topics.png');
    await page.screenshot({ path: shot3 });
    console.log('Captured:', shot3);

    // Scroll to bottom to view Key Takeaways & Deck Glossary
    await page.evaluate(() => {
      document.getElementById('deck-takeaways')?.scrollIntoView({ behavior: 'smooth' });
    });
    await new Promise((r) => setTimeout(r, 1200));
    const shot4 = path.join(ARTIFACT_DIR, 'verification_04_learn_takeaways_glossary.png');
    await page.screenshot({ path: shot4 });
    console.log('Captured:', shot4);

    // 2. Mobile Viewport (390 x 844)
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 800));
    const shotMobile = path.join(ARTIFACT_DIR, 'verification_05_learn_grounded_mobile.png');
    await page.screenshot({ path: shotMobile });
    console.log('Captured:', shotMobile);

    console.log('All verification screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

verify().catch((err) => {
  console.error('Verification script failed:', err);
  process.exit(1);
});
