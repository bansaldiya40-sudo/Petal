import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/diyab/.gemini/antigravity/brain/278a08d4-dbc9-44ad-8f0e-03541b018e17';

async function captureTables() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));

    // Click PM2 landmark
    await page.evaluate(() => {
      const signs = Array.from(document.querySelectorAll('*'));
      const pmSign = signs.find((e) => e.textContent?.trim() === 'Product Management 2');
      if (pmSign) {
        const clickable = pmSign.closest('.group') || pmSign;
        clickable.click();
      }
    });
    await new Promise((r) => setTimeout(r, 2000));

    // Open material
    await page.evaluate(() => {
      const allCards = Array.from(document.querySelectorAll('.group'));
      for (const card of allCards) {
        if (card.innerText && card.innerText.toLowerCase().includes('pm2 combined overview')) {
          const btn = card.querySelector('button');
          if (btn) btn.click();
          else card.click();
          return;
        }
      }
    });
    await new Promise((r) => setTimeout(r, 3000));

    await page.waitForSelector('#deck-big-idea');

    // Expand all topics to view tables
    console.log('Expanding all topics...');
    await page.evaluate(() => {
      const expandBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.innerText && b.innerText.includes('Expand all')
      );
      if (expandBtn) expandBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Scroll to Topic 3 (The Front-End Tech Stack)
    await page.evaluate(() => {
      document.getElementById('topic-card-2')?.scrollIntoView({ behavior: 'smooth' });
    });
    await new Promise((r) => setTimeout(r, 1200));

    const shotTopic3 = path.join(ARTIFACT_DIR, 'verification_06_learn_topic3_table.png');
    await page.screenshot({ path: shotTopic3 });
    console.log('Captured Topic 3 Table:', shotTopic3);

    // Scroll to Topic 5 (Architecture Patterns Table)
    await page.evaluate(() => {
      document.getElementById('topic-card-4')?.scrollIntoView({ behavior: 'smooth' });
    });
    await new Promise((r) => setTimeout(r, 1200));

    const shotTopic5 = path.join(ARTIFACT_DIR, 'verification_07_learn_topic5_table.png');
    await page.screenshot({ path: shotTopic5 });
    console.log('Captured Topic 5 Table:', shotTopic5);

    // Scroll to Topic 7 (Mobile Platforms Table)
    await page.evaluate(() => {
      document.getElementById('topic-card-6')?.scrollIntoView({ behavior: 'smooth' });
    });
    await new Promise((r) => setTimeout(r, 1200));

    const shotTopic7 = path.join(ARTIFACT_DIR, 'verification_08_learn_topic7_table.png');
    await page.screenshot({ path: shotTopic7 });
    console.log('Captured Topic 7 Table:', shotTopic7);
  } finally {
    await browser.close();
  }
}

captureTables().catch((err) => {
  console.error(err);
  process.exit(1);
});
