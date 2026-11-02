import puppeteer from 'puppeteer';

async function debug() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    page.on('console', (msg) => console.log(`[Browser ${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => console.log(`[Browser PageError] ${err.toString()}`));

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

    // Find card for "PM2 Combined Overview"
    const clicked = await page.evaluate(() => {
      const titles = Array.from(document.querySelectorAll('h4, div, span'));
      const targetTitle = titles.find((t) => t.innerText?.toLowerCase().includes('pm2 combined overview'));
      if (targetTitle) {
        const card = targetTitle.closest('.group') || targetTitle.parentElement;
        if (card) {
          card.click();
          return true;
        }
      }
      return false;
    });
    console.log('Clicked card:', clicked);
    await new Promise((r) => setTimeout(r, 3000));

    // Inspect body text or HTML
    const pageInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        h1: document.querySelector('h1')?.innerText || '',
        h2: Array.from(document.querySelectorAll('h2')).map((el) => el.innerText),
        bodySnippet: document.body.innerText.slice(0, 500),
      };
    });
    console.log('Page Info:', JSON.stringify(pageInfo, null, 2));
  } finally {
    await browser.close();
  }
}

debug();
