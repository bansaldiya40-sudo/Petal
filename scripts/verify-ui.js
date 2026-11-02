import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('public', 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runVerification() {
  console.log('🚀 Starting UI Verification with Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,960'],
    defaultViewport: { width: 1280, height: 960 },
  });

  const page = await browser.newPage();

  // Listen to console errors if any
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('Browser console error:', msg.text());
    }
  });

  try {
    // 1. Visit Design System Showcase
    console.log('📸 1. Capturing Design System Showcase...');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_design_system.png'), fullPage: true });

    // 2. Click "Tokens" tab on Design System
    console.log('📸 2. Capturing Design System Tokens...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tokenBtn = buttons.find((b) => b.textContent?.includes('Color & Typography Tokens'));
      tokenBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_design_tokens.png'), fullPage: true });

    // 3. Click "Enter Today's Garden" (Home Screen Empty State)
    console.log('📸 3. Capturing Home Screen (Clean Empty State)...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const homeBtn = buttons.find((b) => b.textContent?.includes("Enter Today's Garden") || b.textContent?.includes('Garden'));
      homeBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_home_empty.png'), fullPage: true });

    // 4. Click Product Management 2 Subject Card
    console.log('📸 4. Capturing Subject Screen (PM2 Empty State)...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const plantBtn = buttons.find((b) => b.textContent?.includes('Plant seed'));
      plantBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_subject_pm2.png'), fullPage: true });

    // 5. Load sample content for verification of active screens
    console.log('🌱 5. Loading sample syllabus for verification...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const sampleBtn = buttons.find((b) => b.textContent?.includes('Load Sample Syllabus'));
      sampleBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Return to Home to see populated "Today's 3 Petals"
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const gardenBtn = buttons.find((b) => b.textContent?.includes('Garden'));
      gardenBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_home_active_petals.png'), fullPage: true });

    // 6. Enter Subject Screen with populated chapters
    console.log('📸 6. Capturing Subject Screen with Chapters...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const openBtn = buttons.find((b) => b.textContent?.includes('Open Chapters'));
      openBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_subject_with_chapters.png'), fullPage: true });

    // 7. Open Lesson Screen (Split View: Slide on left, AI Tutor Explain on right)
    console.log('📸 7. Capturing Lesson Screen (Explain Tab)...');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.glass-card-hover'));
      if (cards[0]) cards[0].click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_lesson_explain.png'), fullPage: true });

    // 8. Click "Examples" tab in Lesson
    console.log('📸 8. Capturing Lesson Screen (Examples Tab with Indian Market case)...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const exBtn = buttons.find((b) => b.textContent?.toLowerCase() === 'examples');
      exBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_lesson_examples.png'), fullPage: true });

    // 9. Click "Animate" tab in Lesson
    console.log('📸 9. Capturing Lesson Screen (Animate Tab with Storyboard & Graph)...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const animBtn = buttons.find((b) => b.textContent?.toLowerCase() === 'animate');
      animBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_lesson_animate.png'), fullPage: true });

    // 10. Click "Quiz" tab in Lesson
    console.log('📸 10. Capturing Lesson Screen (Quiz Tab)...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const quizBtn = buttons.find((b) => b.textContent?.toLowerCase() === 'quiz');
      quizBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_lesson_quiz.png'), fullPage: true });

    // 11. Navigate to Living Meadow (Progress Page)
    console.log('📸 11. Capturing Living Meadow (Progress Page with blooming flowers)...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const meadowBtn = buttons.find((b) => b.textContent?.includes('Living Meadow'));
      meadowBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_progress_meadow.png'), fullPage: true });

    // 12. Finally: Reset LMS to Clean Empty State
    console.log('🧹 12. Resetting Petal to clean empty state (as required for final app)...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const resetBtn = buttons.find((b) => b.textContent?.includes('Reset to Clean Empty State'));
      resetBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_final_clean_empty_state.png'), fullPage: true });

    console.log('✅ UI Verification completed successfully! All screenshots captured.');
  } catch (err) {
    console.error('❌ Verification failed:', err);
  } finally {
    await browser.close();
  }
}

runVerification();
