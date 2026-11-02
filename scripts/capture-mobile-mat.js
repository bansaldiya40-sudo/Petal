import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Navigate to PM2
  const clickedLandmark = await page.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('span'));
    const pm2 = signs.find(s => s.textContent && s.textContent.includes('Product Management'));
    if (pm2) {
      const target = pm2.closest('div.cursor-pointer') || pm2;
      target.scrollIntoView({ behavior: 'instant', block: 'center' });
      target.click();
      return true;
    }
    return false;
  });
  console.log('Clicked PM2 landmark:', clickedLandmark);
  await new Promise(r => setTimeout(r, 1500));

  // Click on "Open Material"
  const clickedOpen = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const openBtn = btns.find(b => b.textContent && b.textContent.includes('Open Material'));
    if (openBtn) {
      openBtn.scrollIntoView({ behavior: 'instant', block: 'center' });
      openBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Open Material:', clickedOpen);
  await new Promise(r => setTimeout(r, 1500));

  const dest1 = path.resolve('public', 'screenshots', 'material_08_mobile_material_page.png');
  const dest2 = 'C:\\Users\\diyab\\.gemini\\antigravity\\brain\\278a08d4-dbc9-44ad-8f0e-03541b018e17\\material_08_mobile_material_page.png';
  await page.screenshot({ path: dest1 });
  fs.copyFileSync(dest1, dest2);
  console.log('✨ Recaptured mobile screenshot on Material page!');
  await browser.close();
})();
