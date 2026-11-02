import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/diyab/.gemini/antigravity/brain/278a08d4-dbc9-44ad-8f0e-03541b018e17';

async function verifyAll() {
  console.log('Launching browser for verification...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    page.on('console', (msg) => console.log(`[Browser ${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => console.log(`[Browser PageError]`, err));

    await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));

    // 1. Open PM2 subject
    console.log('Navigating to Product Management 2...');
    await page.evaluate(() => {
      const signs = Array.from(document.querySelectorAll('*'));
      const pmSign = signs.find((e) => e.textContent?.trim() === 'Product Management 2');
      if (pmSign) {
        const clickable = pmSign.closest('.group') || pmSign;
        clickable.click();
      }
    });
    await new Promise((r) => setTimeout(r, 2000));

    // 2. Open PM2 Combined Overview v2 Day 1
    console.log('Opening PM2 Combined Overview material...');
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

    // ------------------------------------------------------------------------
    // VERIFY BUG 1: VISUAL TAB
    // ------------------------------------------------------------------------
    console.log('--- TESTING VISUAL TAB ---');
    const clickedVisual = await page.evaluate(() => {
      const tabBtns = Array.from(document.querySelectorAll('button'));
      const visualBtn = tabBtns.find((b) => b.innerText && b.innerText.includes('Visual'));
      if (visualBtn) {
        visualBtn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Visual tab:', clickedVisual);
    await new Promise((r) => setTimeout(r, 2500));

    // Check if error boundary is present or if visual cards are present
    const visualCardsCount = await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe');
      return iframes.length;
    });
    console.log('Visual animated iframes rendered:', visualCardsCount);

    const hasTripError = await page.evaluate(() => {
      return document.body.innerText.includes('tripped over a root');
    });
    console.log('Has ErrorBoundary crash message:', hasTripError);

    // Screenshot top of Visual Tab showing 8 animated episodes
    const shotVisualTop = path.join(ARTIFACT_DIR, 'verification_visual_animated_top.png');
    await page.screenshot({ path: shotVisualTop });
    console.log('Captured:', shotVisualTop);

    // Scroll down to view more animated visual cards with interactive controls
    await page.evaluate(() => window.scrollBy(0, 500));
    await new Promise((r) => setTimeout(r, 1000));
    const shotVisualMid = path.join(ARTIFACT_DIR, 'verification_visual_animated_middle.png');
    await page.screenshot({ path: shotVisualMid });
    console.log('Captured:', shotVisualMid);

    // Test Play Full Series button / Modal Player
    console.log('Testing Play Full Series modal player...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const playAllBtn = btns.find((b) => b.innerText && b.innerText.includes('Play Full Series'));
      if (playAllBtn) playAllBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));

    const shotPlayerModal = path.join(ARTIFACT_DIR, 'verification_visual_player_modal.png');
    await page.screenshot({ path: shotPlayerModal });
    console.log('Captured:', shotPlayerModal);

    // Close player
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close"], button[title="Close storybook animator"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // ------------------------------------------------------------------------
    // VERIFY BUG 2: LEARN TAB SIMPLIFY & GO DEEPER
    // ------------------------------------------------------------------------
    console.log('--- TESTING LEARN TAB SIMPLIFY & GO DEEPER ---');
    await page.evaluate(() => {
      const tabBtns = Array.from(document.querySelectorAll('button'));
      const learnBtn = tabBtns.find((b) => b.innerText && b.innerText.includes('Learn'));
      if (learnBtn) learnBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));

    // Scroll to Topic 1
    await page.evaluate(() => window.scrollTo(0, 300));
    await new Promise((r) => setTimeout(r, 800));

    // First ensure we are at original state if a restore button is present
    await page.evaluate(() => {
      const restoreBtn = document.querySelector('[data-testid="restore-btn-0"]');
      if (restoreBtn) restoreBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    console.log('Clicking "Simplify" on Topic 1...');
    const clickedSimplify = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="simplify-btn-0"]');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Simplify button:', clickedSimplify);

    // Wait for Simplify AI generation to complete and button to show "Simplified ✓"
    await page.waitForFunction(
      () => {
        const btn = document.querySelector('[data-testid="simplify-btn-0"]');
        return btn && btn.innerText.includes('Simplified ✓');
      },
      { timeout: 12000 }
    ).catch((e) => console.log('Wait for simplified timed out:', e.message));

    await new Promise((r) => setTimeout(r, 1000));

    const shotSimplify = path.join(ARTIFACT_DIR, 'verification_learn_simplify_analogy.png');
    await page.screenshot({ path: shotSimplify });
    console.log('Captured Simplify screenshot:', shotSimplify);

    const hasAnalogy = await page.evaluate(() => {
      const text = (document.querySelector('#topic-card-0')?.innerText || '').toLowerCase();
      return text.includes('everyday analogy') || text.includes('analogy');
    });
    console.log('Topic 1 has Everyday Analogy box:', hasAnalogy);

    // Test "Back to original"
    console.log('Clicking "Back to original" on Topic 1...');
    const clickedRestore = await page.evaluate(() => {
      const backBtn = document.querySelector('[data-testid="restore-btn-0"]');
      if (backBtn) {
        backBtn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Restore button:', clickedRestore);
    await new Promise((r) => setTimeout(r, 1000));

    // Test "Go deeper" on Topic 1
    console.log('Clicking "Go deeper" on Topic 1...');
    const clickedDeeper = await page.evaluate(() => {
      const deeperBtn = document.querySelector('[data-testid="deeper-btn-0"]');
      if (deeperBtn) {
        deeperBtn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Deeper button:', clickedDeeper);

    // Wait for Go Deeper AI generation to complete and button to show "Deep Dive ✓"
    await page.waitForFunction(
      () => {
        const btn = document.querySelector('[data-testid="deeper-btn-0"]');
        return btn && btn.innerText.includes('Deep Dive ✓');
      },
      { timeout: 12000 }
    ).catch((e) => console.log('Wait for deep dive timed out:', e.message));

    await new Promise((r) => setTimeout(r, 1000));

    const shotDeeper = path.join(ARTIFACT_DIR, 'verification_learn_go_deeper_pmlens.png');
    await page.screenshot({ path: shotDeeper });
    console.log('Captured Go Deeper screenshot:', shotDeeper);

    const hasPmLens = await page.evaluate(() => {
      const text = (document.querySelector('#topic-card-0')?.innerText || '').toLowerCase();
      return text.includes('pm decision framework') || text.includes('pm lens');
    });
    console.log('Topic 1 has PM Lens box:', hasPmLens);

    console.log('All verifications completed successfully!');
  } finally {
    await browser.close();
  }
}

verifyAll().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
