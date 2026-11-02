import puppeteer from 'puppeteer';

async function testClick() {
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
    pmSign?.closest('.group')?.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Inspect all h3s
  const h3s = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h3')).map(h => ({
      text: h.innerText,
      parentClass: h.closest('.group')?.className
    }));
  });
  console.log('Found h3s on SubjectScreen:', h3s);

  // Click the one with Tech Stacks
  const clicked = await page.evaluate(() => {
    const allH3 = Array.from(document.querySelectorAll('h3'));
    const target = allH3.find(h => h.innerText.toLowerCase().includes('tech stacks guide'));
    if (target) {
      const card = target.closest('.group');
      if (card) {
        card.click();
        return 'Clicked card container';
      }
      target.click();
      return 'Clicked h3 directly';
    }
    return 'Not found';
  });
  console.log('Click result:', clicked);
  await new Promise(r => setTimeout(r, 2000));

  const newH1 = await page.evaluate(() => document.querySelector('h1')?.innerText);
  console.log('H1 after click:', newH1);

  await browser.close();
}
testClick();
