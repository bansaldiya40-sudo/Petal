import puppeteer from 'puppeteer';

async function testVisualPlayer() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    page.on('console', (msg) => console.log(`[Browser ${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => console.log(`[Browser PageError]`, err));

    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));

    // Open PM2
    await page.evaluate(() => {
      const signs = Array.from(document.querySelectorAll('*'));
      const pmSign = signs.find((e) => e.textContent?.trim() === 'Product Management 2');
      if (pmSign) {
        const clickable = pmSign.closest('.group') || pmSign;
        clickable.click();
      }
    });
    await new Promise((r) => setTimeout(r, 2000));

    // Open PM2 Combined Overview
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
    await new Promise((r) => setTimeout(r, 2500));

    // Click Visual tab
    await page.evaluate(() => {
      const tabBtns = Array.from(document.querySelectorAll('button'));
      const visualBtn = tabBtns.find((b) => b.innerText && b.innerText.includes('Visual'));
      if (visualBtn) visualBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));

    console.log('Clicking "Watch episode" on Episode 1...');
    const clickedWatch = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const watchBtn = btns.find((b) => b.innerText && b.innerText.includes('Watch episode'));
      if (watchBtn) {
        watchBtn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Watch episode:', clickedWatch);
    await new Promise((r) => setTimeout(r, 2000));

    // Check what is rendered now (did error boundary pop up? or did player render?)
    const afterPlayInfo = await page.evaluate(() => {
      const details = document.querySelector('details');
      return {
        h3: Array.from(document.querySelectorAll('h3')).map((h) => h.innerText),
        details: details ? details.innerText : 'No details found',
        bodyTextSnippet: document.body.innerText.slice(0, 1000),
      };
    });

    console.log('After Play Click Info:', JSON.stringify(afterPlayInfo, null, 2));
  } finally {
    await browser.close();
  }
}

testVisualPlayer();
