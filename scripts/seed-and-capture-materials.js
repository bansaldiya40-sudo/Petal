import Database from 'better-sqlite3';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { generateMaterialData } from '../server/materialProcessor.js';

const DB_PATH = path.resolve('data', 'petal.db');
const SCREENSHOT_DIR = path.resolve('public', 'screenshots');
const ARTIFACT_DIR = 'C:\\Users\\diyab\\.gemini\\antigravity\\brain\\278a08d4-dbc9-44ad-8f0e-03541b018e17';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function seedAndCapture() {
  console.log('🌿 Connecting to SQLite database...');
  const db = new Database(DB_PATH);

  // Clear existing data
  db.exec('DELETE FROM quiz_attempts');
  db.exec('DELETE FROM storyboards');
  db.exec('DELETE FROM clips');
  db.exec('DELETE FROM concepts');
  db.exec('DELETE FROM lessons');

  const insertLesson = db.prepare(`
    INSERT INTO lessons (
      id, subject_id, chapter_title, original_filename, file_path, file_type, file_size, total_pages, uploaded_at, raw_slides_json, status, mastery_score,
      sections_json, learn_overview_json, quiz_questions_json, visual_episodes_json, learn_status, quiz_status, visual_status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // -------------------------------------------------------------
  // 1. PRODUCT MANAGEMENT 2 (24 slides, 6 sections)
  // -------------------------------------------------------------
  const pm2Slides = [
    { slideNumber: 1, title: 'Product Strategy & The Product-Market Fit Engine', content: 'Product-market fit occurs when product value resonates deeply with a sustainable target customer cohort.' },
    { slideNumber: 2, title: 'Core Customer Problem Definition', content: 'Frame user pain points as quantifiable job-to-be-done statements rather than feature requests.' },
    { slideNumber: 3, title: 'Value Hypothesis vs Growth Hypothesis', content: 'Value hypothesis tests if users experience delight; growth hypothesis tests how quickly users discover the product.' },
    { slideNumber: 4, title: 'Validating Value Before Pouring Growth Capital', content: 'Scaling acquisition into an unvalidated value engine burns cash and creates catastrophic cohort churn.' },
    { slideNumber: 5, title: 'The Viral Loop Engine & Referral Mechanics', content: 'Compounding viral growth is governed by the formula K = i × c, where i is invitations sent and c is conversion.' },
    { slideNumber: 6, title: 'Incentive Alignment in Peer-to-Peer Invites', content: 'Two-sided referral incentives reward both the sender and recipient, sharply raising conversion probability.' },
    { slideNumber: 7, title: 'Viral Cycle Time & Propagation Speed', content: 'Shorter viral cycle time accelerates compounding exponential growth waves.' },
    { slideNumber: 8, title: 'Organic Word-of-Mouth vs Paid Acquisition', content: 'High-K viral loops amortize acquisition spend, driving blended customer acquisition cost (CAC) toward zero.' },
    { slideNumber: 9, title: 'Churn Diagnostics & Cohort Retention Curves', content: 'Retention curves that flatten asymptotically parallel to the x-axis signal true product-market fit.' },
    { slideNumber: 10, title: 'Analyzing Drop-off in 30-Day Cohorts', content: 'Day 1, Day 7, and Day 30 retention metrics pinpoint exactly where onboarding friction causes abandonment.' },
    { slideNumber: 11, title: 'Smile Curves vs Downward Sloping Churn', content: 'Smile retention curves emerge when resurrected churned users return due to network effects or notifications.' },
    { slideNumber: 12, title: 'Net Retention Rate & Expansion Revenue', content: 'Net Dollar Retention (NDR) exceeding 100% indicates that account expansion outpaces customer churn.' },
    { slideNumber: 13, title: 'Feature Prioritization & RICE Scoring Framework', content: 'RICE score = (Reach × Impact × Confidence) / Effort, giving objective ranking to competing roadmap initiatives.' },
    { slideNumber: 14, title: 'Quantifying Reach & Expected Impact Levels', content: 'Reach estimates the number of quarterly users affected; impact uses a calibrated scale from 0.25 to 3.0.' },
    { slideNumber: 15, title: 'Calibrating Confidence & Estimating Sprint Effort', content: 'Confidence scores discount initiatives supported only by gut feel; effort is measured in person-weeks.' },
    { slideNumber: 16, title: 'Avoiding Executive Pet Projects with Scoring', content: 'Objective scoring matrices protect engineering sprint velocity from unvalidated stakeholder whims.' },
    { slideNumber: 17, title: 'Unit Economics: LTV/CAC Ratio & Payback Period', content: 'Customer Lifetime Value (LTV) must exceed Customer Acquisition Cost (CAC) by at least 3x for venture viability.' },
    { slideNumber: 18, title: 'Calculating LTV from Gross Margin and Churn', content: 'LTV = (ARPU × Gross Margin %) / Churn Rate. Reducing churn yields exponential expansion in lifetime value.' },
    { slideNumber: 19, title: 'CAC Payback Period & Working Capital Strain', content: 'Payback period under 12 months allows reinvestment of cash flow into growth without external debt.' },
    { slideNumber: 20, title: 'Contribution Margin per Transaction Cohort', content: 'Positive contribution margin confirms that unit economics remain profitable before factoring fixed overhead.' },
    { slideNumber: 21, title: 'Product Experimentation & North Star Metrics', content: 'A single North Star Metric aligns product teams around the core mechanism delivering customer value.' },
    { slideNumber: 22, title: 'Hypothesis Formulation & A/B Test Power', content: 'Statistically powered split tests isolate causal treatment effects from secular seasonal noise.' },
    { slideNumber: 23, title: 'Leading Indicators vs Lagging Financials', content: 'Weekly active core action completion precedes monthly recurring revenue (MRR) changes by 60 to 90 days.' },
    { slideNumber: 24, title: 'Summary: Product Leadership Execution Playbook', content: 'Grounded product management continuously balances customer empathy, quantitative metrics, and engineering velocity.' },
  ];

  const pm2Data = generateMaterialData(
    'Product Strategy, Viral Loops & Retention Mechanics',
    pm2Slides,
    'pm2'
  );

  insertLesson.run(
    'mat-pm2-viral',
    'pm2',
    'Product Strategy, Viral Loops & Retention Mechanics',
    'PM2_Lecture4_ViralLoops_Strategy.pptx',
    '/data/uploads/PM2_Lecture4_ViralLoops_Strategy.pptx',
    'pptx',
    4200000,
    24,
    new Date().toISOString(),
    JSON.stringify(pm2Slides),
    'ready',
    0,
    JSON.stringify(pm2Data.sections),
    JSON.stringify(pm2Data.learnOverview),
    JSON.stringify(pm2Data.quizQuestions),
    JSON.stringify(pm2Data.visualEpisodes),
    'completed',
    'ready',
    'ready'
  );

  // -------------------------------------------------------------
  // 2. MICROECONOMICS (22 slides, 6 sections)
  // -------------------------------------------------------------
  const microSlides = [
    { slideNumber: 1, title: 'Market Equilibrium & Price Formation', content: 'Market equilibrium occurs at price P* and quantity Q* where market demand curve intersects market supply curve.' },
    { slideNumber: 2, title: 'Law of Demand and Downward Sloping Curves', content: 'Holding other factors constant (ceteris paribus), an increase in price leads to a reduction in quantity demanded.' },
    { slideNumber: 3, title: 'Supply Curve Shifts vs Movements Along Curve', content: 'Input cost shocks shift the supply curve; price changes cause movements along the existing supply curve.' },
    { slideNumber: 4, title: 'Consumer and Producer Surplus at Clearing Price', content: 'Total economic surplus is maximized at competitive equilibrium where marginal benefit equals marginal cost.' },
    { slideNumber: 5, title: 'Price Elasticity of Demand & Midpoint Formula', content: 'Price elasticity Ed = (%ΔQ) / (%ΔP). Calculated via midpoint formula: [(Q₂-Q₁)/Q_avg] / [(P₂-P₁)/P_avg].' },
    { slideNumber: 6, title: 'Elastic, Inelastic, and Unit Elastic Regions', content: 'Demand is elastic when |Ed| > 1, inelastic when |Ed| < 1, and unit elastic when |Ed| = 1.' },
    { slideNumber: 7, title: 'Determinants of Demand Elasticity', content: 'Availability of close substitutes, budget share, and time horizon dictate consumer price sensitivity.' },
    { slideNumber: 8, title: 'Short-run vs Long-run Elasticity Dynamics', content: 'In the long run, consumers find alternative substitutes, making long-run demand significantly more elastic.' },
    { slideNumber: 9, title: 'Total Revenue Test & Strategic Pricing Power', content: 'Total revenue TR = P × Q. If demand is elastic, raising price lowers total revenue; if inelastic, raising price increases revenue.' },
    { slideNumber: 10, title: 'Unit Elastic Peak of Total Revenue', content: 'Total revenue reaches its mathematical peak where price elasticity of demand equals exactly -1.0.' },
    { slideNumber: 11, title: 'Pricing Strategies for Inelastic Goods', content: 'Firms with essential or patent-protected goods exercise pricing power without risking significant demand destruction.' },
    { slideNumber: 12, title: 'Marginal Revenue & Elasticity Relationship', content: 'MR = P × [1 - (1 / |Ed|)]. Marginal revenue is positive when demand is elastic, zero at unit elasticity, negative when inelastic.' },
    { slideNumber: 13, title: 'Cross-Price Elasticity & Substitute Goods', content: 'Cross-price elasticity Exy = (%ΔQx) / (%ΔPy). Positive Exy signals substitute goods; negative Exy signals complementary goods.' },
    { slideNumber: 14, title: 'Income Elasticity of Demand (Normal vs Inferior)', content: 'Normal goods exhibit Ey > 0 (luxury goods Ey > 1); inferior goods exhibit negative income elasticity Ey < 0.' },
    { slideNumber: 15, title: 'Complementary Goods & Ecosystem Bundling', content: 'When complement product prices fall, demand curves for core system products shift sharply to the right.' },
    { slideNumber: 16, title: 'Empirical Estimation of Cross-Elasticities', content: 'Econometric regression isolates cross-price coefficients while controlling for household income and seasonal trends.' },
    { slideNumber: 17, title: 'Price Discrimination: First, Second, and Third Degree', content: 'Firms with market power segment consumers to capture consumer surplus without destroying market clearing volume.' },
    { slideNumber: 18, title: 'Third-degree Segmentation (Student / Geography)', content: 'Charging lower prices to price-sensitive groups (students) and higher prices to inelastic buyers maximizes profit.' },
    { slideNumber: 19, title: 'Version-based Second-degree Discrimination', content: 'Self-selection menus (business class vs economy) induce high-willingness-to-pay buyers to self-identify.' },
    { slideNumber: 20, title: 'Deadweight Loss & Welfare Losses from Market Power', content: 'Monopolistic restriction of output below competitive levels creates deadweight loss, reducing societal welfare.' },
    { slideNumber: 21, title: 'Tax Incidence and Elasticity Distribution', content: 'The burden of a tax falls more heavily on whichever side of the market is less elastic (inelastic buyers bear more).' },
    { slideNumber: 22, title: 'Summary: Microeconomic Foundations for Managers', content: 'Managerial success requires evaluating demand elasticity before modifying price tags or signing vendor contracts.' },
  ];

  const microData = generateMaterialData(
    'Market Equilibrium, Price Elasticity & Pricing Power',
    microSlides,
    'microecon'
  );

  insertLesson.run(
    'mat-micro-elasticity',
    'microecon',
    'Market Equilibrium, Price Elasticity & Pricing Power',
    'Micro_Lecture3_Elasticity_Pricing.pptx',
    '/data/uploads/Micro_Lecture3_Elasticity_Pricing.pptx',
    'pptx',
    3800000,
    22,
    new Date().toISOString(),
    JSON.stringify(microSlides),
    'ready',
    0,
    JSON.stringify(microData.sections),
    JSON.stringify(microData.learnOverview),
    JSON.stringify(microData.quizQuestions),
    JSON.stringify(microData.visualEpisodes),
    'completed',
    'ready',
    'ready'
  );

  // -------------------------------------------------------------
  // 3. MARKET RESEARCH METHODS (20 slides, 5 sections)
  // -------------------------------------------------------------
  const mrmSlides = [
    { slideNumber: 1, title: 'Research Design & Scientific Method in Business', content: 'Rigorous market research connects management problems to empirical investigation, testing falsifiable hypotheses.' },
    { slideNumber: 2, title: 'Exploratory vs Descriptive vs Causal Research', content: 'Exploratory research uncovers qualitative problem dimensions; descriptive quantifies prevalence; causal isolates effects.' },
    { slideNumber: 3, title: 'Qualitative Inquiry (Focus Groups & Ethnography)', content: 'In-depth interviews uncover underlying emotional mental models and vocabulary before structured surveys.' },
    { slideNumber: 4, title: 'Translating Management Dilemmas into Research Objectives', content: 'A vague business symptom (declining sales) must be translated into specific information needs (evaluating price sensitivity).' },
    { slideNumber: 5, title: 'Probability Sampling: Simple Random & Stratified', content: 'In probability sampling, every element in the target population has a known, non-zero chance of selection.' },
    { slideNumber: 6, title: 'Stratified Sampling vs Cluster Sampling', content: 'Stratified sampling samples within homogeneous sub-groups; cluster sampling samples across heterogeneous clusters.' },
    { slideNumber: 7, title: 'Sample Size Determination & Confidence Intervals', content: 'Sample size n = (Z² × p × (1-p)) / e². For 95% confidence and ±5% margin of error, n ≈ 384 respondents.' },
    { slideNumber: 8, title: 'Standard Error & The Central Limit Theorem', content: 'As sample size increases, the distribution of sample means approaches normality, regardless of population shape.' },
    { slideNumber: 9, title: 'Non-Sampling Errors & Selection / Non-Response Bias', content: 'Convenience sampling introduces severe selection bias that invalidates statistical inference back to population.' },
    { slideNumber: 10, title: 'The Literary Digest Poll Trap of 1936', content: 'Surveying only telephone and automobile owners during the Great Depression produced a catastrophic 19% forecasting error.' },
    { slideNumber: 11, title: 'Mitigating Non-Response and Attrition in Field Surveys', content: 'Follow-up waves, incentives, and replacement sampling weights correct for demographic non-response skew.' },
    { slideNumber: 12, title: 'Response Bias and Social Desirability Distortions', content: 'Respondents over-report virtuous behaviors (healthy eating, charity) and under-report stigmatized purchases.' },
    { slideNumber: 13, title: 'Questionnaire Design & Likert Scale Reliability', content: 'Balanced Likert scales with clear anchor definitions reduce midpoint clustering and acquiescence bias.' },
    { slideNumber: 14, title: 'Avoiding Double-Barreled and Leading Questions', content: 'Questions must measure exactly one construct; leading syntax invalidates measurement validity.' },
    { slideNumber: 15, title: 'Pre-testing Survey Instruments with Pilot Cohorts', content: 'Pilot testing on 20-30 respondents reveals ambiguous terminology and survey drop-off friction before full fielding.' },
    { slideNumber: 16, title: 'Cronbach Alpha & Internal Consistency Reliability', content: 'Cronbach alpha above 0.70 confirms that survey items reliably measure the same underlying construct.' },
    { slideNumber: 17, title: 'Conjoint Analysis & Customer Part-Worth Utilities', content: 'Conjoint analysis measures customer trade-offs by presenting realistic product profiles with varied attribute bundles.' },
    { slideNumber: 18, title: 'Estimating Attribute Importance & Willingness to Pay', content: 'Part-worth utility spreads determine whether consumers value brand, price, or functional features most.' },
    { slideNumber: 19, title: 'Market Simulation and Market Share Forecasting', content: 'Logit choice models simulate market share distribution when competitive products alter price or features.' },
    { slideNumber: 20, title: 'Summary: Executive Market Research Deliverables', content: 'High-confidence research design equips executive leadership with defensible consumer signals and minimized risk.' },
  ];

  const mrmData = generateMaterialData(
    'Research Design, Sampling Methods & Field Inquiry',
    mrmSlides,
    'mrm'
  );

  insertLesson.run(
    'mat-mrm-sampling',
    'mrm',
    'Research Design, Sampling Methods & Field Inquiry',
    'MRM_Lecture2_Sampling_Design.pptx',
    '/data/uploads/MRM_Lecture2_Sampling_Design.pptx',
    'pptx',
    3500000,
    20,
    new Date().toISOString(),
    JSON.stringify(mrmSlides),
    'ready',
    0,
    JSON.stringify(mrmData.sections),
    JSON.stringify(mrmData.learnOverview),
    JSON.stringify(mrmData.quizQuestions),
    JSON.stringify(mrmData.visualEpisodes),
    'completed',
    'ready',
    'ready'
  );

  console.log('✅ 3 Real MBA Lecture Decks Seeded Successfully into SQLite!');

  // Pre-seed a sample quiz attempt for PM2 so weak section feeding can be verified
  db.prepare(`
    INSERT INTO quiz_attempts (id, material_id, score, total_questions, percentage, weak_sections_json, missed_question_ids_json, attempted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'qa-seed-pm2',
    'mat-pm2-viral',
    14,
    18,
    78,
    JSON.stringify([
      { sectionId: 'sec-3', sectionTitle: 'Churn Diagnostics & Cohort Retention Curves', correct: 1, total: 3 },
    ]),
    JSON.stringify(['q-sec-3-2', 'q-sec-3-3']),
    new Date().toISOString()
  );

  db.prepare(`
    UPDATE lessons SET
      last_quiz_score_json = ?,
      quiz_status = ?
    WHERE id = ?
  `).run(JSON.stringify({ score: 14, total: 18 }), 'attempted', 'mat-pm2-viral');

  console.log('✨ Seeded quiz attempt with weak section in PM2.');

  // -------------------------------------------------------------
  // PUPPETEER SCREENSHOT VERIFICATION
  // -------------------------------------------------------------
  console.log('🚀 Launching Puppeteer for comprehensive Material Page verification...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950, deviceScaleFactor: 2 });

  // -------------------------------------------------------------
  // SHOT 1: SUBJECT SCREEN SHOWING CLEAN MATERIAL CARD WITH 3 STATUS DOTS
  // -------------------------------------------------------------
  console.log('📸 1. Capturing Subject Screen with Clean Material Card & 3 Status Dots...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));

  // Click PM2 landmark
  await page.evaluate(() => {
    const signs = Array.from(document.querySelectorAll('span'));
    const pm2 = signs.find((s) => s.textContent?.includes('Product Management'));
    if (pm2) (pm2.closest('div.cursor-pointer') || pm2).click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  const shot1 = path.join(SCREENSHOT_DIR, 'material_01_subject_page_clean_cards.png');
  await page.screenshot({ path: shot1, fullPage: false });
  fs.copyFileSync(shot1, path.join(ARTIFACT_DIR, 'material_01_subject_page_clean_cards.png'));

  // -------------------------------------------------------------
  // SHOT 2: LEARN TAB - TOP OF PAGE (40px title, sticky tabs, big picture, roadmap)
  // -------------------------------------------------------------
  console.log('📸 2. Opening Material Page -> Capturing Learn Tab (Top of Page)...');
  await page.evaluate(() => {
    const openBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Open Material')
    );
    if (openBtn) openBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  const shot2 = path.join(SCREENSHOT_DIR, 'material_02_learn_tab_top_page.png');
  await page.screenshot({ path: shot2, fullPage: false });
  fs.copyFileSync(shot2, path.join(ARTIFACT_DIR, 'material_02_learn_tab_top_page.png'));

  // -------------------------------------------------------------
  // SHOT 3: LEARN TAB - MID SECTION (Examples, formulas, key terms, common mistakes)
  // -------------------------------------------------------------
  console.log('📸 3. Scrolling to Mid-Section of Learn Tab...');
  await page.evaluate(() => {
    window.scrollTo({ top: 900, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 800));

  const shot3 = path.join(SCREENSHOT_DIR, 'material_03_learn_tab_mid_section.png');
  await page.screenshot({ path: shot3, fullPage: false });
  fs.copyFileSync(shot3, path.join(ARTIFACT_DIR, 'material_03_learn_tab_mid_section.png'));

  // -------------------------------------------------------------
  // SHOT 4: QUIZ TAB - QUESTION SCREEN (20px text, difficulty badge, source chip, timer)
  // -------------------------------------------------------------
  console.log('📸 4. Switching to Quiz Tab -> Capturing Question Screen...');
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 400));

  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const quizTab = tabs.find((b) => b.textContent?.includes('Quiz'));
    if (quizTab) quizTab.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  const shot4 = path.join(SCREENSHOT_DIR, 'material_04_quiz_tab_question.png');
  await page.screenshot({ path: shot4, fullPage: false });
  fs.copyFileSync(shot4, path.join(ARTIFACT_DIR, 'material_04_quiz_tab_question.png'));

  // -------------------------------------------------------------
  // SHOT 5: QUIZ TAB - ANSWERED & EXPLANATION SCREEN (Sparkle, step-by-step, wrong choices analysis)
  // -------------------------------------------------------------
  console.log('📸 5. Answering Quiz Question -> Capturing Step-by-Step Explanation & Wrong Choices...');
  await page.evaluate(() => {
    // Select first option (which is set as correct in our generator)
    const options = Array.from(document.querySelectorAll('button')).filter((b) =>
      b.textContent?.includes('A') || b.textContent?.includes('Short-term')
    );
    if (options[0]) options[0].click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  const shot5 = path.join(SCREENSHOT_DIR, 'material_05_quiz_tab_explanation.png');
  await page.screenshot({ path: shot5, fullPage: false });
  fs.copyFileSync(shot5, path.join(ARTIFACT_DIR, 'material_05_quiz_tab_explanation.png'));

  // -------------------------------------------------------------
  // SHOT 6: VISUAL TAB - EPISODE LIST (Mini-series cards & Play All button)
  // -------------------------------------------------------------
  console.log('📸 6. Switching to Visual Tab -> Capturing Episode Mini-Series List...');
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const tabs = Array.from(document.querySelectorAll('button'));
    const visualTab = tabs.find((b) => b.textContent?.includes('Visual'));
    if (visualTab) visualTab.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  const shot6 = path.join(SCREENSHOT_DIR, 'material_06_visual_tab_episode_list.png');
  await page.screenshot({ path: shot6, fullPage: false });
  fs.copyFileSync(shot6, path.join(ARTIFACT_DIR, 'material_06_visual_tab_episode_list.png'));

  // -------------------------------------------------------------
  // SHOT 7: VISUAL TAB - PLAYING EPISODE (Rigged character player with swinging formula signboard)
  // -------------------------------------------------------------
  console.log('📸 7. Clicking "Watch Episode" -> Capturing Playing Episode in Light-Theme Player...');
  await page.evaluate(() => {
    const watchBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Watch episode')
    );
    if (watchBtn) watchBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.keyboard.press('Space'); // pause for clean frame

  const shot7 = path.join(SCREENSHOT_DIR, 'material_07_visual_tab_playing_episode.png');
  await page.screenshot({ path: shot7, fullPage: false });
  fs.copyFileSync(shot7, path.join(ARTIFACT_DIR, 'material_07_visual_tab_playing_episode.png'));

  // Close player
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close storybook animator"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // -------------------------------------------------------------
  // SHOT 8: MOBILE RESPONSIVE VIEW (390 x 844)
  // -------------------------------------------------------------
  console.log('📱 8. Setting Mobile Viewport 390x844 -> Capturing Material Page on Mobile...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const learnTab = tabs.find((b) => b.textContent?.includes('Learn'));
    if (learnTab) learnTab.click();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 800));

  const shot8 = path.join(SCREENSHOT_DIR, 'material_08_mobile_material_page.png');
  await page.screenshot({ path: shot8, fullPage: false });
  fs.copyFileSync(shot8, path.join(ARTIFACT_DIR, 'material_08_mobile_material_page.png'));

  // -------------------------------------------------------------
  // SHOT 9: HOME SCREEN SHOWING SCROLL OF THE DAY WITH WEAK SECTION RECOMMENDATION
  // -------------------------------------------------------------
  console.log('📸 9. Capturing Home Screen Scroll of the Day with Weak Section Focus...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));

  // Open scroll of the day
  await page.evaluate(() => {
    const scrollBtn = document.querySelector('button[title="Open Scroll of the Day"]');
    if (scrollBtn) scrollBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  const shot9 = path.join(SCREENSHOT_DIR, 'material_09_home_scroll_weak_section.png');
  await page.screenshot({ path: shot9, fullPage: false });
  fs.copyFileSync(shot9, path.join(ARTIFACT_DIR, 'material_09_home_scroll_weak_section.png'));

  await browser.close();
  console.log('🎉 All 9 Material Page verification screenshots successfully captured!');
}

seedAndCapture().catch((err) => {
  console.error('Seed and capture error:', err);
  process.exit(1);
});
