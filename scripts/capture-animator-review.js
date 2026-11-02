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

  // Clear existing and seed 3 real subject chapters
  db.exec('DELETE FROM storyboards');
  db.exec('DELETE FROM clips');
  db.exec('DELETE FROM concepts');
  db.exec('DELETE FROM lessons');
  db.exec('DELETE FROM daily_spend');

  // Insert daily spend baseline ($0.90 spent of $5.00)
  const today = new Date().toISOString().split('T')[0];
  db.prepare('INSERT OR REPLACE INTO daily_spend (date, total_spent_usd) VALUES (?, ?)').run(today, 0.90);

  const insertLesson = db.prepare(`
    INSERT INTO lessons (
      id, subject_id, chapter_title, original_filename, file_path, file_type, file_size, total_pages, uploaded_at, raw_slides_json, status, mastery_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertConcept = db.prepare(`
    INSERT INTO concepts (
      id, lesson_id, subject_id, concept_order, title, one_sentence_summary, source_slide, status,
      plain_explanation, analogy, deep_explanation, key_terms_json, examples_json, quick_check_json, animation_json, quiz_questions_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // -----------------------------------------------------------------
  // 1. MICROECONOMICS CHAPTER (Pip the Bunny - Curve-based)
  // -----------------------------------------------------------------
  const microLessonId = 'lesson-micro-elasticity';
  insertLesson.run(
    microLessonId,
    'microecon',
    'Market Dynamics & Price Elasticity',
    'Micro_Lecture3_Elasticity.pptx',
    '/data/uploads/Micro_Lecture3_Elasticity.pptx',
    'pptx',
    3500000,
    22,
    new Date().toISOString(),
    JSON.stringify([
      { slideNumber: 4, title: 'Price Elasticity & Supply/Demand Shift', content: 'Equilibrium price P* and quantity Q* occur at the intersection of supply and demand curves. Outward shifts in demand increase equilibrium price and quantity.' },
      { slideNumber: 9, title: 'Cross-Price Elasticity & Substitute Goods', content: 'Positive cross-price elasticity indicates substitute goods; negative elasticity indicates complements.' },
    ]),
    'in_progress',
    50
  );

  insertConcept.run(
    'concept-micro-curve',
    microLessonId,
    'microecon',
    1,
    'Price Elasticity & Supply/Demand Shift',
    'Equilibrium price and quantity clear where consumer demand equals producer supply.',
    4,
    'current',
    'When demand expands rightward, competition among buyers bids up the market price until quantity supplied meets demand at a new equilibrium point.',
    'Like a balance scale in Pip\'s honey stall—adding more honey coins on one side tilts the scale until extra honey jars are weighed.',
    'Price elasticity of demand determines whether a rightward demand shift results in a sharp price spike (inelastic supply) or a large volume surge (elastic supply).',
    JSON.stringify([
      { term: 'Equilibrium Price (P*)', definition: 'The unique market price where quantity demanded perfectly matches quantity supplied.' },
      { term: 'Demand Shift', definition: 'A change in non-price determinants (income, preferences) shifting the entire curve.' },
    ]),
    JSON.stringify([
      { tag: 'Agri-Markets', title: 'Seasonal Honey Harvest', scenario: 'Winter holiday surges shift demand rightward.', breakdown: 'Drives honey clearing price from 10 to 14 honey coins.' },
    ]),
    JSON.stringify({
      question: 'What happens to equilibrium price and quantity when demand shifts rightward while supply is fixed?',
      options: ['Price drops, Quantity drops', 'Price rises, Quantity rises', 'Price rises, Quantity drops', 'Price drops, Quantity rises'],
      correctAnswer: 1,
      sparkleFeedback: 'Spot on! Both equilibrium price and quantity expand to the new intersection point.',
    }),
    JSON.stringify({ title: 'Supply & Demand Shift', scenes: [] }),
    JSON.stringify([])
  );

  // -----------------------------------------------------------------
  // 2. PRODUCT MANAGEMENT 2 CHAPTER (Faye the Fairy - Flow-based)
  // -----------------------------------------------------------------
  const pmLessonId = 'lesson-pm2-flywheel';
  insertLesson.run(
    pmLessonId,
    'pm2',
    'Viral Growth Loops & Compounding Flywheels',
    'PM2_Growth_Flywheel.pptx',
    '/data/uploads/PM2_Growth_Flywheel.pptx',
    'pptx',
    4200000,
    28,
    new Date().toISOString(),
    JSON.stringify([
      { slideNumber: 7, title: 'The Viral Loop Engine & Compounding Flywheel', content: 'A viral growth loop compounds when K > 1.0. User onboarding feeds directly into peer referral loops, eliminating paid acquisition friction.' },
    ]),
    'in_progress',
    33
  );

  insertConcept.run(
    'concept-pm2-flow',
    pmLessonId,
    'pm2',
    1,
    'The Viral Loop Engine & Compounding Flywheel',
    'Growth loops compound when each active user automatically activates the succeeding generation of customers.',
    7,
    'current',
    'Unlike linear funnels that drain capital at every step, a closed growth loop channels retained users into organic referral mechanisms.',
    'Like a dandelion seed head in a spring breeze—each seed puffs off to sprout five new flowers across the meadow.',
    'K = i * c measures viral compounding. When K > 1, the user acquisition curve bends upward exponentially.',
    JSON.stringify([
      { term: 'Viral Coefficient (K)', definition: 'K = Invites Sent (i) × Conversion Rate (c). K > 1 indicates self-sustaining viral growth.' },
      { term: 'Compounding Flywheel', definition: 'A self-reinforcing business loop where customer retention directly feeds acquisition.' },
    ]),
    JSON.stringify([
      { tag: 'Indian Fintech', title: 'Google Pay (Tez)', scenario: 'Diwali stamp scratch cards required peer transfers.', breakdown: 'Propelled K-factor above 1.5 during festive seasons.' },
    ]),
    JSON.stringify({
      question: 'Why is a compounding growth loop superior to a traditional linear acquisition funnel?',
      options: ['It requires no engineering effort', 'Each cohort organically generates the next cohort with zero marginal CAC', 'It only works for B2B enterprise software', 'It guarantees zero churn forever'],
      correctAnswer: 1,
      sparkleFeedback: 'Exact! Growth loops compound without draining expensive marketing ad budgets.',
    }),
    JSON.stringify({ title: 'Growth Loop Flywheel', scenes: [] }),
    JSON.stringify([])
  );

  // -----------------------------------------------------------------
  // 3. MARKET RESEARCH METHODS CHAPTER (Barnaby the Owl - Story-based)
  // -----------------------------------------------------------------
  const mrmLessonId = 'lesson-mrm-sampling';
  insertLesson.run(
    mrmLessonId,
    'mrm',
    'Sampling Design & Unbiased Field Research',
    'MRM_Lecture5_Sampling.pptx',
    '/data/uploads/MRM_Lecture5_Sampling.pptx',
    'pptx',
    3800000,
    24,
    new Date().toISOString(),
    JSON.stringify([
      { slideNumber: 11, title: 'Unbiased Random Sampling & Confidence Intervals', content: 'Randomized probability sampling ensures every unit has a known, non-zero probability of selection. Standard error decreases proportionally with sqrt(n).' },
    ]),
    'in_progress',
    50
  );

  insertConcept.run(
    'concept-mrm-story',
    mrmLessonId,
    'mrm',
    1,
    'Unbiased Random Sampling in Field Research',
    'Probability sampling eliminates selection bias, ensuring every population member has an equal opportunity to be surveyed.',
    11,
    'current',
    'By drawing true random samples, researchers can infer population parameters with rigorous mathematical confidence intervals.',
    'Like sampling a warm pot of forest berry soup—a single well-stirred spoonful accurately reveals the entire pot\'s seasoning.',
    'Sampling bias occurs when convenient subsets are over-represented. Stratified random sampling ensures critical minority sub-segments are properly surveyed.',
    JSON.stringify([
      { term: 'Probability Sampling', definition: 'A sampling technique where every individual in the population has an equal, known probability of selection.' },
      { term: 'Sampling Error', definition: 'The margin of difference between a sample statistic and the true population parameter.' },
    ]),
    JSON.stringify([
      { tag: 'Field Research', title: 'Census Survey Audits', scenario: 'Barnaby samples woodland creatures across all tree levels.', breakdown: 'Avoids listening only to noisy birds near the forest canopy.' },
    ]),
    JSON.stringify({
      question: 'What is the primary danger of convenience sampling over true randomized sampling?',
      options: ['It costs too much to conduct', 'It introduces systematic selection bias that invalidates findings', 'It takes longer to gather data', 'Sample size n must always be 1,000,000'],
      correctAnswer: 1,
      sparkleFeedback: 'Brilliant! Convenience sampling introduces heavy selection bias and misleads strategic decisions.',
    }),
    JSON.stringify({ title: 'Unbiased Sampling Design', scenes: [] }),
    JSON.stringify([])
  );

  console.log('✅ Seeded 3 real MBA chapters into SQLite.');

  // Pre-generate storyboards for the 3 concepts so they are cached in SQLite
  console.log('🌱 Pre-generating storyboards in SQLite...');
  await fetch('http://localhost:3001/api/concepts/concept-micro-curve/storyboard', { method: 'POST' });
  await fetch('http://localhost:3001/api/concepts/concept-pm2-flow/storyboard', { method: 'POST' });
  await fetch('http://localhost:3001/api/concepts/concept-mrm-story/storyboard', { method: 'POST' });
  console.log('✨ All 3 storyboards cached in SQLite!');

  console.log('🚀 Launching Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // -----------------------------------------------------------------
  // 1. CAPTURE CARD 6 WITH PROMINENT "WATCH IT BLOOM" BUTTON
  // -----------------------------------------------------------------
  console.log('📸 1. Navigating to Microeconomics and Card 6...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));

  // Click Microeconomics Honey Stall
  await page.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('span'));
    const micro = signs.find(s => s.textContent?.includes('Microeconomics'));
    if (micro) (micro.closest('div.cursor-pointer') || micro).click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Click the stepping stone for "Price Elasticity & Supply/Demand Shift"
  await page.evaluate(() => {
    const stoneButtons = Array.from(document.querySelectorAll('button'));
    const stone = stoneButtons.find(b => b.textContent?.includes('Price Elasticity'));
    if (stone) stone.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Advance to Card 6 by clicking "Next Card" 5 times
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Next Card'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));
  }
  await new Promise((r) => setTimeout(r, 600));

  // Capture Card 6 with Prominent "Watch it bloom" Button & "Make a movie clip" Action
  console.log('📸 1b. Capturing Card 6 with Prominent "Watch it bloom" Button...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'animator_01_card6_prominent_button.png'), fullPage: false });

  // -----------------------------------------------------------------
  // 2. CLICK "WATCH IT BLOOM" -> OPEN PLAYER & CAPTURE TEMPLATE 1: CURVE SCENE
  // -----------------------------------------------------------------
  console.log('📸 2. Clicking "Watch it bloom" to open Timeline Player...');
  await page.evaluate(() => {
    const bloomBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Watch it bloom'));
    if (bloomBtn) bloomBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Pause playback so we can inspect scene
  await page.evaluate(() => {
    const pauseBtn = document.querySelector('button[aria-label="Pause"]');
    if (pauseBtn) pauseBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  // Navigate to Scene 2 (The Curve Scene)
  await page.evaluate(() => {
    const nextSceneBtn = document.querySelector('button[title="Next scene (Right Arrow)"]');
    if (nextSceneBtn) nextSceneBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  console.log('📸 2b. Capturing Template 1: Curve Scene (Microeconomics Pip Supply/Demand Shift)...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'animator_02_template_curve_scene.png'), fullPage: false });

  // -----------------------------------------------------------------
  // 3. CAPTURE TEMPLATE 6: RECAP SCENE (3 BLOOMING PETALS)
  // -----------------------------------------------------------------
  console.log('📸 3. Navigating to Scene 5 (Recap Scene)...');
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      const nextSceneBtn = document.querySelector('button[title="Next scene (Right Arrow)"]');
      if (nextSceneBtn) nextSceneBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));
  }
  await new Promise((r) => setTimeout(r, 800));

  console.log('📸 3b. Capturing Template 6: Recap Scene (3 Blooming Petals)...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'animator_03_template_recap_scene.png'), fullPage: false });

  // Close player and story card
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close animator player"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.evaluate(() => {
    const closeStory = document.querySelector('button[title="Close story"]');
    if (closeStory) closeStory.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // -----------------------------------------------------------------
  // 4. CAPTURE TEMPLATE 2: FLOW SCENE (PM2 with Faye the Fairy)
  // -----------------------------------------------------------------
  console.log('📸 4. Navigating to PM2 (Flow Scene)...');
  await page.evaluate(() => {
    const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Back to Garden'));
    if (backBtn) backBtn.click();
  });
  await new Promise((r) => setTimeout(r, 700));

  // Click PM2 Landmark
  await page.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('span'));
    const pm = signs.find(s => s.textContent?.includes('Product Management 2'));
    if (pm) (pm.closest('div.cursor-pointer') || pm).click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Open PM2 concept
  await page.evaluate(() => {
    const stoneButtons = Array.from(document.querySelectorAll('button'));
    const stone = stoneButtons.find(b => b.textContent?.includes('Viral Loop Engine'));
    if (stone) stone.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Advance to Card 6 and click "Watch it bloom"
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Next Card'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));
  }
  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate(() => {
    const bloomBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Watch it bloom'));
    if (bloomBtn) bloomBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1400));

  // Pause and go to Scene 2 (Flow Scene)
  await page.evaluate(() => {
    const pauseBtn = document.querySelector('button[aria-label="Pause"]');
    if (pauseBtn) pauseBtn.click();
  });
  await new Promise((r) => setTimeout(r, 300));
  await page.evaluate(() => {
    const nextSceneBtn = document.querySelector('button[title="Next scene (Right Arrow)"]');
    if (nextSceneBtn) nextSceneBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  console.log('📸 4b. Capturing Template 2: Flow Scene (Compounding Product Growth Loop)...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'animator_04_template_flow_scene.png'), fullPage: false });

  // Scene 3 in PM2 is Formula Scene (K = i * c)! Let's capture Template 4!
  await page.evaluate(() => {
    const nextSceneBtn = document.querySelector('button[title="Next scene (Right Arrow)"]');
    if (nextSceneBtn) nextSceneBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  console.log('📸 4c. Capturing Template 4: Formula Scene (K = i * c Viral Equation)...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'animator_05_template_formula_scene.png'), fullPage: false });

  // Close player and story card
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close animator player"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.evaluate(() => {
    const closeStory = document.querySelector('button[title="Close story"]');
    if (closeStory) closeStory.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // -----------------------------------------------------------------
  // 5. CAPTURE TEMPLATE 3: STORY SCENE (MRM with Barnaby the Owl)
  // -----------------------------------------------------------------
  console.log('📸 5. Navigating to Market Research Methods (Story Vignette Scene)...');
  await page.evaluate(() => {
    const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Back to Garden'));
    if (backBtn) backBtn.click();
  });
  await new Promise((r) => setTimeout(r, 700));

  // Click MRM Landmark
  await page.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('span'));
    const mrm = signs.find(s => s.textContent?.includes('Market Research Methods'));
    if (mrm) (mrm.closest('div.cursor-pointer') || mrm).click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Open MRM concept
  await page.evaluate(() => {
    const stoneButtons = Array.from(document.querySelectorAll('button'));
    const stone = stoneButtons.find(b => b.textContent?.includes('Unbiased Random Sampling'));
    if (stone) stone.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Advance to Card 6 and click "Watch it bloom"
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Next Card'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));
  }
  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate(() => {
    const bloomBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Watch it bloom'));
    if (bloomBtn) bloomBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1400));

  // Pause and go to Scene 4 (Story Scene Vignette: Barnaby's Forest Library)
  await page.evaluate(() => {
    const pauseBtn = document.querySelector('button[aria-label="Pause"]');
    if (pauseBtn) pauseBtn.click();
  });
  await new Promise((r) => setTimeout(r, 300));
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      const nextSceneBtn = document.querySelector('button[title="Next scene (Right Arrow)"]');
      if (nextSceneBtn) nextSceneBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));
  }
  await new Promise((r) => setTimeout(r, 800));

  console.log('📸 5b. Capturing Template 3: Story Scene (Barnaby Forest Library Vignette)...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'animator_06_template_story_scene.png'), fullPage: false });

  // Close player
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close animator player"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // -----------------------------------------------------------------
  // 6. CAPTURE TRACK 2: MOVIE CLIP CONFIRMATION MODAL WITH DAILY CAP
  // -----------------------------------------------------------------
  console.log('📸 6. Clicking "Make a movie clip" to view cost confirmation & daily spend cap...');
  await page.evaluate(() => {
    const movieBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Make a movie clip'));
    if (movieBtn) movieBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  console.log('📸 6b. Capturing Movie Clip Cost Confirmation Modal...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'animator_07_movie_clip_confirmation.png'), fullPage: false });

  // Cancel modal & close story card
  await page.evaluate(() => {
    const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Cancel'));
    if (cancelBtn) cancelBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.evaluate(() => {
    const closeStory = document.querySelector('button[title="Close story"]');
    if (closeStory) closeStory.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // -----------------------------------------------------------------
  // 7. CAPTURE QUEST MAP WITH "EXPLAINER" PLAY BADGE
  // -----------------------------------------------------------------
  console.log('📸 7. Capturing Quest Map with Explainer Play Badges...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'animator_08_quest_map_explainer_badges.png'), fullPage: false });

  // -----------------------------------------------------------------
  // 8. CAPTURE HOME SCROLL WITH "WATCH LATER" SHELF
  // -----------------------------------------------------------------
  console.log('📸 8. Navigating Home to open Scroll of the Day with Watch Later Shelf...');
  await page.evaluate(() => {
    const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Back to Garden'));
    if (backBtn) backBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // Open Scroll of the Day
  await page.evaluate(() => {
    const scrollBtn = document.querySelector('button[aria-label="Scroll of the Day"]');
    if (scrollBtn) scrollBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  console.log('📸 8b. Capturing Unfurled Scroll with Watch Later Shelf...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'animator_09_watch_later_shelf.png'), fullPage: false });

  // -----------------------------------------------------------------
  // 9. MOBILE VIEWPORT TEST (390 x 844)
  // -----------------------------------------------------------------
  console.log('📱 9. Capturing Mobile Concept Animator Player (390 x 844)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));

  // Navigate to PM2
  await page.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('span'));
    const pm = signs.find(s => s.textContent?.includes('Product Management 2'));
    if (pm) (pm.closest('div.cursor-pointer') || pm).click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Open concept on mobile
  await page.evaluate(() => {
    const stoneButtons = Array.from(document.querySelectorAll('button'));
    const stone = stoneButtons.find(b => b.textContent?.includes('Viral Loop Engine'));
    if (stone) stone.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Go to Card 6 and click "Watch it bloom"
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Next Card'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));
  }
  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate(() => {
    const bloomBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Watch it bloom'));
    if (bloomBtn) bloomBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1400));

  console.log('📱 9b. Capturing Mobile Concept Animator Player...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'animator_10_mobile_timeline_player.png'), fullPage: false });

  await page.close();
  await browser.close();

  // Copy all captured screenshots to ARTIFACT_DIR
  console.log('📂 Copying screenshots to artifacts directory...');
  const files = fs.readdirSync(SCREENSHOT_DIR);
  files.forEach((file) => {
    if (file.startsWith('animator_')) {
      fs.copyFileSync(path.join(SCREENSHOT_DIR, file), path.join(ARTIFACT_DIR, file));
    }
  });
  console.log('✨ All Concept Animator screenshots copied successfully!');
}

runCapture().catch(console.error);
