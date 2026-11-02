import Database from 'better-sqlite3';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve('data', 'petal.db');
const SCREENSHOT_DIR = path.resolve('public', 'screenshots');
const ARTIFACT_DIR = 'C:\\Users\\diyab\\.gemini\\antigravity\\brain\\278a08d4-dbc9-44ad-8f0e-03541b018e17';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runCapture() {
  console.log('🌿 Connecting to SQLite at', DB_PATH);
  const db = new Database(DB_PATH);

  // Clear cached storyboards so fresh character director storyboards are generated
  db.exec('DELETE FROM storyboards');

  console.log('🌱 Pre-generating character director storyboards in SQLite...');
  await fetch('http://localhost:3001/api/concepts/concept-pm2-flow/storyboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ force: true }),
  });
  await fetch('http://localhost:3001/api/concepts/concept-micro-curve/storyboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ force: true }),
  });
  await fetch('http://localhost:3001/api/concepts/concept-mrm-story/storyboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ force: true }),
  });
  console.log('✨ All 3 character director storyboards generated and cached in SQLite!');

  console.log('🚀 Launching Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // -----------------------------------------------------------------
  // 1. CAPTURE PM2: VIRAL LOOP (Act 1 Setup: Carrot Stand, Fox Invite)
  // -----------------------------------------------------------------
  console.log('📸 1. Navigating to PM2 Viral Loop...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));

  // Click PM2 Fairy Tower
  await page.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('span'));
    const pm2 = signs.find((s) => s.textContent?.includes('Product Management'));
    if (pm2) (pm2.closest('div.cursor-pointer') || pm2).click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Click stepping stone for Viral Loop
  await page.evaluate(() => {
    const stoneButtons = Array.from(document.querySelectorAll('button'));
    const stone = stoneButtons.find((b) => b.textContent?.includes('Viral Loop'));
    if (stone) stone.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Advance to Card 6
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Next Card')
      );
      if (nextBtn) nextBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));
  }
  await new Promise((r) => setTimeout(r, 500));

  // Click "Watch it bloom" to open the Character Animator Player
  await page.evaluate(() => {
    const bloomBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Watch it bloom')
    );
    if (bloomBtn) bloomBtn.click();
  });
  // Pause playback so we can capture exact beats cleanly
  await new Promise((r) => setTimeout(r, 1500));
  await page.keyboard.press('Space'); // pause

  console.log('📸 1a. Capturing PM2 Scene 1: Pip Carrot Stall & Fox Invite Pass...');
  const shot1a = path.join(SCREENSHOT_DIR, 'director_01_pm2_viral_act1_setup.png');
  await page.screenshot({ path: shot1a, fullPage: false });
  fs.copyFileSync(shot1a, path.join(ARTIFACT_DIR, 'director_01_pm2_viral_act1_setup.png'));

  // Advance to Scene 2: Meadow, Fox with Ticket, Squirrel & Crowd multiplying!
  console.log('📸 1b. Advancing to Scene 2 (Crowd Multiplying)...');
  await page.keyboard.press('ArrowRight');
  await new Promise((r) => setTimeout(r, 1000));
  const shot1b = path.join(SCREENSHOT_DIR, 'director_02_pm2_viral_act2_multiplying.png');
  await page.screenshot({ path: shot1b, fullPage: false });
  fs.copyFileSync(shot1b, path.join(ARTIFACT_DIR, 'director_02_pm2_viral_act2_multiplying.png'));

  // Advance to Scene 3: Result with K = i * c > 1 Signboard & "In Real Life" Bridge!
  console.log('📸 1c. Advancing to Scene 3 (Result & In Real Life Bridge)...');
  await page.keyboard.press('ArrowRight');
  await new Promise((r) => setTimeout(r, 1200));
  const shot1c = path.join(SCREENSHOT_DIR, 'director_03_pm2_viral_act3_result.png');
  await page.screenshot({ path: shot1c, fullPage: false });
  fs.copyFileSync(shot1c, path.join(ARTIFACT_DIR, 'director_03_pm2_viral_act3_result.png'));

  // Close player
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close storybook animator"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // Close story card modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close card"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // -----------------------------------------------------------------
  // 2. CAPTURE MICROECONOMICS: PRICE ELASTICITY
  // -----------------------------------------------------------------
  console.log('📸 2. Navigating to Microeconomics: Price Elasticity...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));

  // Click Microeconomics Honey Stall
  await page.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('span'));
    const micro = signs.find((s) => s.textContent?.includes('Microeconomics'));
    if (micro) (micro.closest('div.cursor-pointer') || micro).click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Click stepping stone
  await page.evaluate(() => {
    const stoneButtons = Array.from(document.querySelectorAll('button'));
    const stone = stoneButtons.find((b) => b.textContent?.includes('Price Elasticity'));
    if (stone) stone.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Advance to Card 6
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Next Card')
      );
      if (nextBtn) nextBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));
  }
  await new Promise((r) => setTimeout(r, 500));

  // Click "Watch it bloom"
  await page.evaluate(() => {
    const bloomBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Watch it bloom')
    );
    if (bloomBtn) bloomBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.keyboard.press('Space'); // pause

  console.log('📸 2a. Capturing Microeconomics Scene 1 (Honey 5 coins, Bee queue)...');
  const shot2a = path.join(SCREENSHOT_DIR, 'director_04_micro_elasticity_act1.png');
  await page.screenshot({ path: shot2a, fullPage: false });
  fs.copyFileSync(shot2a, path.join(ARTIFACT_DIR, 'director_04_micro_elasticity_act1.png'));

  // Advance to Scene 2 (Price 10, Bees sad)
  await page.keyboard.press('ArrowRight');
  await new Promise((r) => setTimeout(r, 1000));
  const shot2b = path.join(SCREENSHOT_DIR, 'director_05_micro_elasticity_act2_price_hike.png');
  await page.screenshot({ path: shot2b, fullPage: false });
  fs.copyFileSync(shot2b, path.join(ARTIFACT_DIR, 'director_05_micro_elasticity_act2_price_hike.png'));

  // Advance to Scene 3 (Price 4, Swarm returns, "High Price = Low Demand" signboard & In Real Life Bridge)
  await page.keyboard.press('ArrowRight');
  await new Promise((r) => setTimeout(r, 1200));
  const shot2c = path.join(SCREENSHOT_DIR, 'director_06_micro_elasticity_act3_swarm.png');
  await page.screenshot({ path: shot2c, fullPage: false });
  fs.copyFileSync(shot2c, path.join(ARTIFACT_DIR, 'director_06_micro_elasticity_act3_swarm.png'));

  // Close player & card
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close storybook animator"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close card"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // -----------------------------------------------------------------
  // 3. CAPTURE MRM: UNBIASED RANDOM SAMPLING
  // -----------------------------------------------------------------
  console.log('📸 3. Navigating to MRM: Random Sampling...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));

  // Click Treehouse Library
  await page.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('span'));
    const mrm = signs.find((s) => s.textContent?.includes('Market Research'));
    if (mrm) (mrm.closest('div.cursor-pointer') || mrm).click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Click stepping stone
  await page.evaluate(() => {
    const stoneButtons = Array.from(document.querySelectorAll('button'));
    const stone = stoneButtons.find((b) => b.textContent?.includes('Random Sampling'));
    if (stone) stone.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Advance to Card 6
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Next Card')
      );
      if (nextBtn) nextBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));
  }
  await new Promise((r) => setTimeout(r, 500));

  // Click "Watch it bloom"
  await page.evaluate(() => {
    const bloomBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Watch it bloom')
    );
    if (bloomBtn) bloomBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.keyboard.press('Space'); // pause

  console.log('📸 3a. Capturing MRM Scene 1 (Barnaby in Treehouse Library with Magnifying Glass)...');
  const shot3a = path.join(SCREENSHOT_DIR, 'director_07_mrm_sampling_act1_owl.png');
  await page.screenshot({ path: shot3a, fullPage: false });
  fs.copyFileSync(shot3a, path.join(ARTIFACT_DIR, 'director_07_mrm_sampling_act1_owl.png'));

  // Advance to Scene 2 (Fox with Berries & Squirrel with Acorns questioning sample)
  await page.keyboard.press('ArrowRight');
  await new Promise((r) => setTimeout(r, 1000));
  const shot3b = path.join(SCREENSHOT_DIR, 'director_08_mrm_sampling_act2_fox_berries.png');
  await page.screenshot({ path: shot3b, fullPage: false });
  fs.copyFileSync(shot3b, path.join(ARTIFACT_DIR, 'director_08_mrm_sampling_act2_fox_berries.png'));

  // Advance to Scene 3 (Sample Must Match Population signboard & In Real Life Bridge)
  await page.keyboard.press('ArrowRight');
  await new Promise((r) => setTimeout(r, 1200));
  const shot3c = path.join(SCREENSHOT_DIR, 'director_09_mrm_sampling_act3_representative.png');
  await page.screenshot({ path: shot3c, fullPage: false });
  fs.copyFileSync(shot3c, path.join(ARTIFACT_DIR, 'director_09_mrm_sampling_act3_representative.png'));

  // -----------------------------------------------------------------
  // 4. CAPTURE MOBILE RESPONSIVE VIEW (390 x 844)
  // -----------------------------------------------------------------
  console.log('📱 4. Setting mobile viewport 390x844...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await new Promise((r) => setTimeout(r, 600));

  const shot4 = path.join(SCREENSHOT_DIR, 'director_10_mobile_character_animator.png');
  await page.screenshot({ path: shot4, fullPage: false });
  fs.copyFileSync(shot4, path.join(ARTIFACT_DIR, 'director_10_mobile_character_animator.png'));

  await browser.close();
  console.log('🎉 Successfully captured all 10 character-driven director screenshots!');
}

runCapture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
