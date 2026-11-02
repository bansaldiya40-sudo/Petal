import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('public', 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function captureNewHome() {
  console.log('📸 Capturing new Storybook Home Screen (Desktop & Mobile)...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Viewport (1440 x 900)
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1200));

    console.log('📸 1. Capturing Desktop Home Scene...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'new_home_desktop.png'),
      fullPage: false,
    });

    // 2. Desktop Viewport with Scroll of the Day unfurled
    console.log('📸 2. Unfurling Scroll of the Day on Desktop...');
    await page.evaluate(() => {
      const scrollBtn = document.querySelector('button[aria-label="Scroll of the Day"]');
      if (scrollBtn) scrollBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'new_home_scroll_unfurled.png'),
      fullPage: false,
    });

    // 3. Mobile Viewport (390 x 844)
    console.log('📸 3. Capturing Mobile Home Scene...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1200));

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'new_home_mobile.png'),
      fullPage: false,
    });

    console.log('✅ All Home screen screenshots captured successfully!');
  } catch (err) {
    console.error('❌ Capture error:', err);
  } finally {
    await browser.close();
  }
}

captureNewHome();
