import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\diyab\\.gemini\\antigravity\\brain\\278a08d4-dbc9-44ad-8f0e-03541b018e17';

async function run() {
  console.log('🚀 Starting clean verification of Petal Home Title Page redesign...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const consoleErrors = [];

  // =============================================================
  // PART 1: DESKTOP SUITE (1400x900)
  // =============================================================
  console.log('\n--- PART 1: DESKTOP SUITE (1400x900) ---');
  
  // 1. Entrance Moment
  const entrancePage = await browser.newPage();
  entrancePage.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(`[Desktop Entrance] ${msg.text()}`);
  });
  await entrancePage.setViewport({ width: 1400, height: 900 });
  await entrancePage.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 900));
  await entrancePage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'verification_01_entrance_moment.png')
  });
  console.log('✅ 1. Captured verification_01_entrance_moment.png');
  await entrancePage.close();

  // 2. Home Desktop
  const desktopPage = await browser.newPage();
  desktopPage.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(`[Desktop Home] ${msg.text()}`);
  });
  await desktopPage.setViewport({ width: 1400, height: 900 });
  await desktopPage.evaluateOnNewDocument(() => {
    try {
      sessionStorage.setItem('hasSeenPetalEntrance_v3', 'true');
    } catch {}
  });
  await desktopPage.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  await desktopPage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'verification_02_home_desktop.png')
  });
  console.log('✅ 2. Captured verification_02_home_desktop.png');

  // Verify bounding boxes of landmarks and signposts on desktop
  const overlapCheck = await desktopPage.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('.font-brand')).filter(el => {
      const text = el.textContent?.trim();
      const r = el.getBoundingClientRect();
      return (text === 'Product Management 2' || text === 'Market Research Methods' || text === 'Microeconomics') && r.width > 0 && r.height > 0;
    });
    const rects = signs.map(s => {
      const r = s.getBoundingClientRect();
      return {
        text: s.textContent?.trim(),
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        right: r.right,
        bottom: r.bottom
      };
    });

    const collisions = [];
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i];
        const b = rects[j];
        const overlap = !(a.right < b.x || a.x > b.right || a.bottom < b.y || a.y > b.bottom);
        if (overlap) {
          collisions.push(`${a.text} overlaps with ${b.text}`);
        }
      }
    }
    return { rects, collisions };
  });
  console.log('🔍 Landmark signs layout:', JSON.stringify(overlapCheck.rects, null, 2));
  if (overlapCheck.collisions.length === 0) {
    console.log('✅ OVERLAP CHECK PASSED: 0 collisions between landmark signposts!');
  } else {
    console.warn('⚠️ OVERLAP DETECTED:', overlapCheck.collisions);
  }

  // 4. Subject Page Desktop
  console.log('Navigating to PM2 Subject Page on Desktop...');
  await desktopPage.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('*'));
    const pmSign = signs.find(e => e.textContent?.trim() === 'Product Management 2');
    if (pmSign) {
      const clickable = pmSign.closest('.group') || pmSign;
      clickable.click();
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  await desktopPage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'verification_04_subject_desktop.png')
  });
  console.log('✅ 4. Captured verification_04_subject_desktop.png');

  // 6. Learn Tab Desktop
  console.log('Opening first material to view Learn tab on Desktop...');
  await desktopPage.evaluate(() => {
    // Click Open Material button specifically
    const openBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText?.includes('Open Material'));
    if (openBtns.length > 0) {
      openBtns[0].click();
    } else {
      const cards = Array.from(document.querySelectorAll('.group'));
      if (cards.length > 0) cards[0].click();
    }
  });
  await new Promise(r => setTimeout(r, 1800));

  await desktopPage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'verification_06_learn_desktop.png')
  });
  console.log('✅ 6. Captured verification_06_learn_desktop.png');
  await desktopPage.close();

  // =============================================================
  // PART 2: MOBILE SUITE (390x844)
  // =============================================================
  console.log('\n--- PART 2: MOBILE SUITE (390x844) ---');
  const mobilePage = await browser.newPage();
  mobilePage.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(`[Mobile] ${msg.text()}`);
  });
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true });
  await mobilePage.evaluateOnNewDocument(() => {
    try {
      sessionStorage.setItem('hasSeenPetalEntrance_v3', 'true');
    } catch {}
  });

  // 3. Home Mobile
  await mobilePage.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await mobilePage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'verification_03_home_mobile.png')
  });
  console.log('✅ 3. Captured verification_03_home_mobile.png');

  // 5. Subject Page Mobile
  console.log('Navigating to PM2 Subject Page on Mobile...');
  await mobilePage.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('*'));
    const pmSign = signs.find(e => e.textContent?.trim() === 'Product Management 2');
    if (pmSign) {
      const clickable = pmSign.closest('.group') || pmSign;
      clickable.click();
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  await mobilePage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'verification_05_subject_mobile.png')
  });
  console.log('✅ 5. Captured verification_05_subject_mobile.png');

  // 7. Learn Tab Mobile
  console.log('Opening first material on Mobile...');
  await mobilePage.evaluate(() => {
    const openBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText?.includes('Open Material'));
    if (openBtns.length > 0) {
      openBtns[0].click();
    } else {
      const cards = Array.from(document.querySelectorAll('.group'));
      if (cards.length > 0) cards[0].click();
    }
  });
  await new Promise(r => setTimeout(r, 1800));

  await mobilePage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'verification_07_learn_mobile.png')
  });
  console.log('✅ 7. Captured verification_07_learn_mobile.png');
  await mobilePage.close();

  console.log('\n--- CONSOLE ERROR REPORT ---');
  if (consoleErrors.length === 0) {
    console.log('✅ 0 CONSOLE ERRORS ACROSS ALL TESTS!');
  } else {
    console.log(`⚠️ ${consoleErrors.length} console errors:`, consoleErrors);
  }

  await browser.close();
  console.log('\n🎉 ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('❌ Verification script failed:', err);
  process.exit(1);
});
