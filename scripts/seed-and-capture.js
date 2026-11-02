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
  console.log('🌿 Connecting to SQLite database at', DB_PATH);
  const db = new Database(DB_PATH);

  // Clear existing lessons and populate with realistic MBA Chapter
  db.exec('DELETE FROM concepts');
  db.exec('DELETE FROM lessons');
  db.exec('DELETE FROM garden_plants');

  const lessonId = 'lesson-pm2-growth-loops';
  const insertLesson = db.prepare(`
    INSERT INTO lessons (
      id, subject_id, chapter_title, original_filename, file_path, file_type, file_size, total_pages, uploaded_at, raw_slides_json, status, mastery_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const rawSlides = [
    { slideNumber: 1, title: 'Course Overview: Product Management II', content: 'Advanced Product Strategy, Growth Dynamics, and Platform Economics. Prof. Arvind Narayanan.' },
    { slideNumber: 3, title: 'The North Star Metric', content: 'A single, crucial metric that best captures the core value your product delivers to customers. Focuses company effort on customer value rather than superficial signups.' },
    { slideNumber: 8, title: 'The Viral Loop Equation & K-Factor', content: 'K = i * c, where i is number of invites sent per customer and c is conversion rate of each invite. If K > 1, each cohort generates a larger succeeding cohort.' },
    { slideNumber: 14, title: 'Cohort Retention & The Flattening Smile Curve', content: 'True Product-Market Fit is demonstrated when the cohort retention curve flattens parallel to the X-axis. A leaky bucket can never achieve scalable LTV. Churn must be arrested through habit loops.' },
    { slideNumber: 19, title: 'Direct & Indirect Two-Sided Network Effects', content: 'Metcalfe\'s law: Value of a network is proportional to n^2. Platform moats become self-reinforcing when switching costs and liquidity barriers rise.' },
    { slideNumber: 23, title: 'Unit Economics: LTV/CAC Ratio and Payback', content: 'LTV/CAC ratio benchmarks for high-growth tech ventures: 3x is healthy, 5x is exceptional. Payback period must be under 12 months for capital efficiency.' },
  ];

  insertLesson.run(
    lessonId,
    'pm2',
    'Viral Loops & Growth Mechanics',
    'PM2_Lecture4_GrowthLoops.pptx',
    '/data/uploads/PM2_Lecture4_GrowthLoops.pptx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    4200100,
    24,
    new Date().toISOString(),
    JSON.stringify(rawSlides),
    'in_progress',
    40
  );

  const insertConcept = db.prepare(`
    INSERT INTO concepts (
      id, lesson_id, subject_id, concept_order, title, one_sentence_summary, source_slide, status,
      plain_explanation, analogy, deep_explanation, key_terms_json, examples_json, quick_check_json, animation_json, quiz_questions_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const conceptsData = [
    {
      id: 'pm2-c1',
      lessonId,
      subjectId: 'pm2',
      order: 1,
      title: 'The North Star Metric',
      oneSentence: 'The single metric that best captures the core value your product delivers to customers.',
      sourceSlide: 3,
      status: 'bloomed',
      plain: 'A North Star Metric aligns every team—product, engineering, and growth—around delivering genuine customer value, preventing vanity metrics from misleading strategic decisions.',
      analogy: "Like a ship captain's compass in foggy seas—every crew member rows toward that single constant light.",
      deep: 'By optimizing for a North Star metric (like Spotify\'s "Time Spent Listening" or Airbnb\'s "Nights Booked"), customer retention and revenue naturally follow as secondary outcomes.',
      keyTerms: [
        { term: 'North Star Metric', definition: 'A primary guiding metric that captures the exchange of value between customer and product.' },
        { term: 'Vanity Metric', definition: 'Surface statistics like total registered users or app downloads that look impressive but do not correlate with retention.' },
      ],
      examples: [
        { tag: 'Streaming Tech', title: 'Spotify', scenario: 'Tracks "Time spent listening", not app launches.', breakdown: 'Ensures users actively discover music they love.' },
        { tag: 'Quick Commerce', title: 'Swiggy', scenario: 'Monitors delivered orders per active user per month.', breakdown: 'Aligns delivery fleets and kitchen partners around repeated consumer utility.' },
      ],
      quickCheck: {
        question: 'Why is daily app downloads usually considered a vanity metric rather than a true North Star Metric?',
        options: ['Downloads are hard to measure', 'Downloads do not prove active retention or customer value', 'It only applies to B2B SaaS', 'Investors ignore download numbers'],
        correctAnswer: 1,
        sparkleFeedback: 'Spot on! A user can install an app and delete it 5 minutes later. A true North Star reflects ongoing value delivered.',
      },
      animation: {
        title: 'North Star Alignment Story',
        scenes: [
          { sceneNumber: 1, title: 'Fragmented Teams', narration: 'When teams optimize separate metrics, engineering and growth row in opposite directions.', durationSeconds: 5, visualType: 'matrix_2x2' },
          { sceneNumber: 2, title: 'Unified Focus', narration: 'A single North Star metric pulls the entire organization toward customer value.', durationSeconds: 5, visualType: 'matrix_2x2' },
        ],
      },
      quiz: [],
    },
    {
      id: 'pm2-c2',
      lessonId,
      subjectId: 'pm2',
      order: 2,
      title: 'The Viral Loop Equation (K-Factor)',
      oneSentence: 'Growth is viral when every existing user brings in more than one new user (K > 1).',
      sourceSlide: 8,
      status: 'bloomed',
      plain: 'The Viral Coefficient (K) is the engine of viral growth. When K > 1, each user cohort automatically spawns an even larger subsequent cohort without additional paid marketing.',
      analogy: 'Like a dandelion seed head in a spring breeze—each seed puffs off to sprout five new flowers across the meadow.',
      deep: 'Viral growth depends on two levers: Invitation Rate (how many friends each user invites) and Conversion Rate (how many of those invites accept and activate).',
      keyTerms: [
        { term: 'Viral Coefficient (K)', definition: 'K = Invites Sent per User (i) × Conversion Rate per Invite (c). K > 1 means viral explosion.' },
        { term: 'Viral Cycle Time', definition: 'The time it takes from a user joining to successfully inviting the next cohort of users.' },
      ],
      examples: [
        { tag: 'Fintech India', title: 'Google Pay (Tez)', scenario: 'Diwali stamp promotions and scratch cards required peer transfers.', breakdown: 'Drove viral coefficient K well above 1.5 during festive seasons.' },
        { tag: 'B2B Collaboration', title: 'Figma', scenario: 'Designers share live preview links with developers and product managers.', breakdown: 'Pulls teammates organically into the product workflow without sales friction.' },
      ],
      quickCheck: {
        question: 'If 100 users each send 4 invites, and 30% of recipients sign up, what is the Viral Coefficient (K)?',
        options: ['0.3', '1.2', '4.0', '12.0'],
        correctAnswer: 1,
        sparkleFeedback: 'Brilliant! K = 4 invites × 0.30 conversion = 1.2. Because K > 1, each cohort expands virally!',
      },
      animation: {
        title: 'Viral Loop Exponential Surge',
        scenes: [
          { sceneNumber: 1, title: 'Sub-viral Growth (K < 1)', narration: 'When K is under 1, referral growth quickly dies out without continuous marketing spend.', durationSeconds: 5, visualType: 'matrix_2x2' },
          { sceneNumber: 2, title: 'Viral Expansion (K = 1.2)', narration: 'When K breaks above 1, each cohort generates larger subsequent generations automatically.', durationSeconds: 5, visualType: 'matrix_2x2' },
        ],
      },
      quiz: [],
    },
    {
      id: 'pm2-c3',
      lessonId,
      subjectId: 'pm2',
      order: 3,
      title: 'Retention & The Smile Curve',
      oneSentence: 'Retention is the bedrock of product growth—without it, your user acquisition bucket is perpetually leaking.',
      sourceSlide: 14,
      status: 'current', // FAYE STANDS AND WAVES AT THIS STEPPING STONE!
      plain: 'Retention measures the percentage of users who return to your product over days, weeks, and months. A flattening retention curve proves you have achieved true Product-Market Fit.',
      analogy: 'A bucket with holes in the bottom. Pouring in expensive marketing water is pointless until you plug the leaks.',
      deep: 'If your cohort retention drops to zero over time, no amount of growth hacking or marketing spend will save the company. A retention curve that flattens parallel to the X-axis means you have built a sustainable core.',
      keyTerms: [
        { term: 'Cohort Retention Curve', definition: 'A graphical chart tracking the ongoing active percentage of users who joined in the same time cohort.' },
        { term: 'Smile Curve', definition: 'A rare, coveted retention phenomenon where churned users re-engage months later due to accumulated network density.' },
        { term: 'Terminal Retention Plateau', definition: 'The stable percentage where a retention curve stops dropping and runs parallel to the timeline axis.' },
      ],
      examples: [
        { tag: 'Quick Commerce (India)', title: 'Blinkit & Zepto', scenario: '10-minute grocery delivery creates high daily habit loops across urban households.', breakdown: 'Flattens 30-day cohort retention at an exceptional 38%+ core plateau.' },
        { tag: 'Enterprise SaaS', title: 'Slack', scenario: 'Teams that exchange 2,000 internal messages become deeply dependent on company message history.', breakdown: 'Retention shoots up to 93% once organizational memory is locked in.' },
        { tag: 'Fintech Gamification', title: 'CRED', scenario: 'Credit card payment cycles and reward gamification prompt habitual monthly return visits.', breakdown: 'Converts a low-frequency financial chore into a high-retention monthly routine.' },
      ],
      quickCheck: {
        question: 'What does a retention curve that flattens parallel to the horizontal axis indicate?',
        options: [
          'The app is losing all of its users',
          'The product has proven a stable core and true Product-Market Fit',
          'Customer acquisition cost has dropped to zero',
          'Marketing spend has been exhausted',
        ],
        correctAnswer: 1,
        sparkleFeedback: 'Correct! When the curve flattens instead of decaying toward zero, you have proven retention and true Product-Market Fit!',
      },
      animation: {
        title: 'Prioritizing Retention over Churn',
        scenes: [
          { sceneNumber: 1, title: 'The Leaky Bucket Dilemma', narration: 'Pouring high-cost marketing spend into low-retention funnels drains capital quickly.', durationSeconds: 6, visualType: 'matrix_2x2' },
          { sceneNumber: 2, title: 'Focusing on Quick Wins', narration: 'Fixing onboarding frictions and reinforcing Day-1 habit loops creates a flat, durable core plateau.', durationSeconds: 6, visualType: 'matrix_2x2' },
        ],
      },
      quiz: [],
    },
    {
      id: 'pm2-c4',
      lessonId,
      subjectId: 'pm2',
      order: 4,
      title: 'Network Effects & Platform Moats',
      oneSentence: 'Every new user makes the product systematically more valuable for all existing participants.',
      sourceSlide: 19,
      status: 'locked',
      plain: 'Two-sided network effects create defensive economic moats that protect market leaders from fast followers and aggressive venture-backed copycats.',
      analogy: 'Like a bustling bazaar—more buyers attract more merchants, and more merchants draw even bigger crowds.',
      deep: 'Direct network effects occur when value increases with participants on the same side. Indirect network effects occur when more participants on one side attract complementary participants on another.',
      keyTerms: [
        { term: 'Two-Sided Market', definition: 'A platform connecting two distinct user groups who provide each other with mutual network benefits.' },
        { term: 'Liquidity Moat', definition: 'When transaction speed and matching certainty become so high that new competitors cannot replicate the experience.' },
      ],
      examples: [
        { tag: 'Payments India', title: 'UPI & PhonePe', scenario: 'Merchants display QR codes because consumers have apps; consumers carry apps because all merchants accept it.', breakdown: 'Two-sided lock-in makes displacement virtually impossible.' },
      ],
      quickCheck: {
        question: 'Which type of network effect exists between Uber drivers and Uber riders?',
        options: ['Direct Network Effect', 'Indirect (Cross-Side) Network Effect', 'Negative Network Effect', 'Asymmetric Network Effect'],
        correctAnswer: 1,
        sparkleFeedback: 'Exactly! More riders attract more drivers, which in turn reduces wait times for riders.',
      },
      animation: {
        title: 'Platform Network Density',
        scenes: [
          { sceneNumber: 1, title: 'Two-Sided Density', narration: 'As both sides join the marketplace, value scales non-linearly.', durationSeconds: 5, visualType: 'matrix_2x2' },
        ],
      },
      quiz: [],
    },
    {
      id: 'pm2-c5',
      lessonId,
      subjectId: 'pm2',
      order: 5,
      title: 'Unit Economics: LTV to CAC Dynamics',
      oneSentence: 'A sustainable business requires Customer Lifetime Value (LTV) to exceed Acquisition Cost (CAC) by at least 3x.',
      sourceSlide: 23,
      status: 'locked',
      plain: 'Unit economics evaluate the direct revenues and costs associated with acquiring and serving a single customer unit before corporate overhead.',
      analogy: 'Like planting an apple tree that costs $10 to plant but yields $40 of crisp fruit every harvest season.',
      deep: 'LTV/CAC is the ultimate test of business viability. If LTV/CAC > 3 with payback under 12 months, the model can scale capital-efficiently.',
      keyTerms: [
        { term: 'Customer Acquisition Cost (CAC)', definition: 'Total sales and marketing expenses divided by the number of new customers acquired.' },
        { term: 'Lifetime Value (LTV)', definition: 'The total net profit contributed by an average customer over their relationship.' },
      ],
      examples: [
        { tag: 'Fintech India', title: 'Zerodha', scenario: 'Zero ad spend model relying entirely on product quality and word-of-mouth.', breakdown: 'Yields a nearly infinite LTV/CAC ratio compared to venture-subsidized brokers.' },
      ],
      quickCheck: {
        question: 'What is the standard benchmark LTV to CAC ratio for a healthy venture-scale business?',
        options: ['1:1', '2:1', '3:1 or higher', '10:1 or higher'],
        correctAnswer: 2,
        sparkleFeedback: 'Correct! 3:1 allows healthy margins for ongoing R&D and team expansion.',
      },
      animation: {
        title: 'LTV / CAC Payback Acceleration',
        scenes: [
          { sceneNumber: 1, title: 'Payback Dynamics', narration: 'Compressing payback time under 12 months frees up capital for reinvestment.', durationSeconds: 5, visualType: 'matrix_2x2' },
        ],
      },
      quiz: [],
    },
  ];

  conceptsData.forEach((c) => {
    insertConcept.run(
      c.id,
      c.lessonId,
      c.subjectId,
      c.order,
      c.title,
      c.oneSentence,
      c.sourceSlide,
      c.status,
      c.plain,
      c.analogy,
      c.deep,
      JSON.stringify(c.keyTerms),
      JSON.stringify(c.examples),
      JSON.stringify(c.quickCheck),
      JSON.stringify(c.animation),
      JSON.stringify(c.quiz)
    );
  });

  console.log('✅ SQLite seeded with PM2 Quest chapter.');

  console.log('🚀 Launching Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // -----------------------------------------------------------------
  // 1. DESKTOP CAPTURES (1440 x 900)
  // -----------------------------------------------------------------
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // SHOT 1: Home Screen
  console.log('📸 1. Capturing Desktop Home Screen...');
  await desktopPage.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '01_home_clean.png'), fullPage: false });

  // SHOT 2: Market Research Methods Empty State
  console.log('📸 2. Capturing MRM Empty State...');
  await desktopPage.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('span'));
    const mrm = signs.find(s => s.textContent?.includes('Market Research Methods'));
    if (mrm) (mrm.closest('div.cursor-pointer') || mrm).click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '02_subject_empty_pouch.png'), fullPage: false });

  // Go back to Home
  await desktopPage.evaluate(() => {
    const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Back to Garden'));
    if (backBtn) backBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // SHOT 3: Subject Page PM2 with Quest Map Hero
  console.log('📸 3. Navigating to PM2 Subject Page...');
  await desktopPage.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('span'));
    const pm2 = signs.find(s => s.textContent?.includes('Product Management 2'));
    if (pm2) (pm2.closest('div.cursor-pointer') || pm2).click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '03_subject_quest_map.png'), fullPage: false });

  // SHOT 4: Quest Map Stepping Stones in Full View (Scroll to Quest Map)
  console.log('📸 4. Scrolling to Stepping Stones Quest Map...');
  await desktopPage.evaluate(() => {
    const questMapHeader = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.includes('Viral Loops & Growth Mechanics'));
    if (questMapHeader) {
      questMapHeader.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  });
  await new Promise((r) => setTimeout(r, 600));
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '04_subject_quest_map_scroll.png'), fullPage: false });

  // SHOT 5: Story Card Flow - Card 1: The Idea
  console.log('📸 5. Opening Story Card: Retention & The Smile Curve...');
  await desktopPage.evaluate(() => {
    const stoneButtons = Array.from(document.querySelectorAll('button'));
    const retentionBtn = stoneButtons.find(b => b.textContent?.includes('Retention & The Smile Curve'));
    if (retentionBtn) retentionBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '05_story_card_idea.png'), fullPage: false });

  // SHOT 6: Story Card Flow - Card 2: Plain Intuition & Storybook Analogy
  console.log('📸 6. Navigating to Card 2: Intuition & Analogy...');
  await desktopPage.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Next Card'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise((r) => setTimeout(r, 700));
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '06_story_card_analogy.png'), fullPage: false });

  // SHOT 7: Story Card Flow - Card 3: Real-World Cases (Indian Startups)
  console.log('📸 7. Navigating to Card 3: Real-World Cases...');
  await desktopPage.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Next Card'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise((r) => setTimeout(r, 700));
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '07_story_card_examples.png'), fullPage: false });

  // SHOT 8: Story Card Flow - Card 4: Collectible Petals (Flipping Cards)
  console.log('📸 8. Navigating to Card 4: Collectible Petals...');
  await desktopPage.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Next Card'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  // Flip the first petal card
  await desktopPage.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div.cursor-pointer'));
    const petalCard = cards.find(c => c.textContent?.includes('Seed Petal #1'));
    if (petalCard) petalCard.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '08_story_card_petals.png'), fullPage: false });

  // SHOT 9: Story Card Flow - Card 5: Quick Check with Sparkle Feedback
  console.log('📸 9. Navigating to Card 5: Quick Check...');
  await desktopPage.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Next Card'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  // Select option B (correct)
  await desktopPage.evaluate(() => {
    const options = Array.from(document.querySelectorAll('button'));
    const correctOpt = options.find(o => o.textContent?.includes('proven a stable core and true Product-Market Fit'));
    if (correctOpt) correctOpt.click();
  });
  await new Promise((r) => setTimeout(r, 700));
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '09_story_card_quick_check.png'), fullPage: false });

  // SHOT 10: Story Card Flow - Card 6: Dynamic Animation Explainer
  console.log('📸 10. Navigating to Card 6: Dynamic Animation...');
  await desktopPage.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Next Card'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '10_story_card_animate.png'), fullPage: false });

  // SHOT 11: Quiet Source Slide Drawer
  console.log('📸 11. Opening Source Slide Drawer...');
  await desktopPage.evaluate(() => {
    const slideLink = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('from slide'));
    if (slideLink) slideLink.click();
  });
  await new Promise((r) => setTimeout(r, 700));
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '11_story_card_source_drawer.png'), fullPage: false });

  await desktopPage.close();

  // -----------------------------------------------------------------
  // 2. MOBILE CAPTURES (390 x 844)
  // -----------------------------------------------------------------
  console.log('📱 Starting Mobile Captures (390 x 844)...');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  // Mobile Shot 1: Mobile Home Story Trail
  await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '12_mobile_home.png'), fullPage: false });

  // Mobile Shot 2: Mobile Subject Screen with Quest Map
  console.log('📱 Navigating to PM2 on Mobile...');
  await mobilePage.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('span'));
    const pm2 = signs.find(s => s.textContent?.includes('Product Management 2'));
    if (pm2) (pm2.closest('div.cursor-pointer') || pm2).click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  // Scroll down to Quest Map on mobile
  await mobilePage.evaluate(() => {
    const questTitle = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.includes('Viral Loops & Growth Mechanics'));
    if (questTitle) questTitle.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise((r) => setTimeout(r, 600));
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '13_mobile_subject_quest.png'), fullPage: false });

  // Mobile Shot 3: Mobile Story Card Flow
  console.log('📱 Opening Story Card on Mobile...');
  await mobilePage.evaluate(() => {
    const stoneButtons = Array.from(document.querySelectorAll('button'));
    const retentionBtn = stoneButtons.find(b => b.textContent?.includes('Retention & The Smile Curve'));
    if (retentionBtn) retentionBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '14_mobile_story_card.png'), fullPage: false });

  await mobilePage.close();
  await browser.close();

  console.log('🎉 Copying all screenshots to Artifact directory...');
  const files = fs.readdirSync(SCREENSHOT_DIR);
  files.forEach((file) => {
    if (file.endsWith('.png')) {
      fs.copyFileSync(path.join(SCREENSHOT_DIR, file), path.join(ARTIFACT_DIR, file));
    }
  });
  console.log('✨ All screenshots copied to artifact directory successfully!');
}

runCapture().catch(console.error);
