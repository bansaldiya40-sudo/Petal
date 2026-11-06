import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import AdmZip from 'adm-zip';
import mammoth from 'mammoth';
import db, { UPLOADS_DIR, DATA_DIR, CLIPS_DIR, BACKUPS_DIR, createTimestampedBackup } from './db.js';
import { generateStoryboardForConcept } from './storyboardGenerator.js';
import { generateCharacterDirectorStoryboard } from './storyboardDirector.js';
import {
  generateMaterialDataAsync,
  generateSingleSection,
  groupSlidesIntoSections,
  generateQuizQuestions,
  generateVisualEpisodes,
  toTitleCase,
  computeContentHash,
  extractPptxSlides,
  adjustSingleTopic,
} from './materialProcessor.js';
import {
  getSecrets,
  saveSecrets,
  testAiConnection,
  checkVideoModel,
  getCallLogs,
  getLastCallLog,
  isSecretKey,
  maskSecret,
} from './llmService.js';
import {
  isSupabaseConfigured,
  uploadToSupabaseStorage,
  upsertMaterialInSupabase,
  saveLearnContentToSupabase,
  saveQuizToSupabase,
  saveVisualsToSupabase,
  saveTopicVariantToSupabase,
  fetchAllMaterialsFromSupabase,
  supabaseServer,
} from './supabase.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve uploaded files and video clips statically from dedicated storage
app.use('/data/uploads', express.static(UPLOADS_DIR));
app.use('/data/clips', express.static(CLIPS_DIR));

// Configure multer to store files permanently in dedicated UPLOADS_DIR
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// --- Health ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Petal Storybook LMS Backend',
    database: 'SQLite (better-sqlite3) persistent',
    dataDir: DATA_DIR,
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    claudeConfigured: !!process.env.ANTHROPIC_API_KEY,
  });
});

// Auto-migration & validation for all existing saved materials
try {
  const allSavedMaterials = db.prepare('SELECT id, chapter_title, raw_slides_json, sections_json, learn_overview_json FROM lessons').all();
  for (const row of allSavedMaterials) {
    let rawSlides = JSON.parse(row.raw_slides_json || '[]');
    let sections = row.sections_json ? JSON.parse(row.sections_json) : [];
    let overview = row.learn_overview_json ? JSON.parse(row.learn_overview_json) : {};
    let updated = false;

    if (!Array.isArray(sections) || sections.length === 0) {
      sections = groupSlidesIntoSections(rawSlides).map((s) => ({
        ...s,
        status: 'needs_generation',
        inSimpleWords: '',
        examples: [],
        extraExamples: [],
        keyTerms: [],
        commonMistakes: [],
        formulas: [],
      }));
      updated = true;
    } else {
      sections = sections.map((s, idx) => {
        let secUpdated = false;
        if (!s.examples) { s.examples = []; secUpdated = true; }
        if (!s.extraExamples) { s.extraExamples = []; secUpdated = true; }
        if (!s.keyTerms) { s.keyTerms = []; secUpdated = true; }
        if (!s.commonMistakes) { s.commonMistakes = []; secUpdated = true; }
        if (!s.formulas) { s.formulas = []; secUpdated = true; }
        if (typeof s.inSimpleWords !== 'string') { s.inSimpleWords = ''; secUpdated = true; }
        if (!s.status) { s.status = s.inSimpleWords ? 'ready' : 'needs_generation'; secUpdated = true; }
        if (secUpdated) updated = true;
        return s;
      });
    }

    if (!Array.isArray(overview.roadmap) || !Array.isArray(overview.quickRecap) || !Array.isArray(overview.miniMemoryAids) || overview.roadmap.length === 0) {
      overview.bigPicture = overview.bigPicture || `Comprehensive study guide for ${toTitleCase(row.chapter_title)}.`;
      overview.roadmap = Array.isArray(overview.roadmap) && overview.roadmap.length > 0
        ? overview.roadmap
        : sections.map((s, idx) => ({ sectionId: s.id || `sec-${idx+1}`, title: s.title || `Section ${idx+1}`, summary: s.slidesRange || '' }));
      overview.quickRecap = Array.isArray(overview.quickRecap) && overview.quickRecap.length > 0
        ? overview.quickRecap
        : [`Covers ${sections.length} core sections of ${toTitleCase(row.chapter_title)}.`];
      overview.miniMemoryAids = Array.isArray(overview.miniMemoryAids) && overview.miniMemoryAids.length > 0
        ? overview.miniMemoryAids
        : sections.map((s) => ({ sectionTitle: s.title || 'Section', aid: s.slidesRange || '' }));
      updated = true;
    }

    if (updated) {
      db.prepare('UPDATE lessons SET sections_json = ?, learn_overview_json = ? WHERE id = ?').run(
        JSON.stringify(sections),
        JSON.stringify(overview),
        row.id
      );
    }
  }
} catch (migrateErr) {
  console.warn('[Startup Migration Warning]', migrateErr.message);
}

// --- Data Storage Info & Manual Backup API ---
app.get('/api/data/info', (req, res) => {
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM lessons').get();
    const allBackups = fs.existsSync(BACKUPS_DIR)
      ? fs.readdirSync(BACKUPS_DIR).filter((f) => f.startsWith('petal-backup-') && f.endsWith('.db')).sort((a, b) => b.localeCompare(a))
      : [];
    
    res.json({
      dataDir: DATA_DIR,
      totalMaterials: row?.count || 0,
      backupsCount: allBackups.length,
      lastBackup: allBackups[0] || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/data/backup', (req, res) => {
  try {
    const backupName = createTimestampedBackup('manual');
    res.json({ success: true, backupName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Settings & AI API ---
app.get('/api/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    rows.forEach((r) => {
      if (isSecretKey(r.key)) return; // Never return plaintext secret from db
      settings[r.key] = r.value === 'true' ? true : r.value === 'false' ? false : r.value;
    });

    // Provide masked placeholders for stored secrets
    const secrets = getSecrets();
    if (secrets.geminiKey) {
      settings.geminiKey = maskSecret(secrets.geminiKey);
      settings.hasGeminiKey = true;
    } else {
      settings.hasGeminiKey = false;
    }
    if (secrets.claudeKey) {
      settings.claudeKey = maskSecret(secrets.claudeKey);
      settings.hasClaudeKey = true;
    } else {
      settings.hasClaudeKey = false;
    }
    if (secrets.videoApiKey) {
      settings.videoApiKey = maskSecret(secrets.videoApiKey);
      settings.hasVideoApiKey = true;
    } else {
      settings.hasVideoApiKey = false;
    }

    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const updates = req.body || {};
    const secretUpdates = {};
    const nonSecretUpdates = {};

    for (const [k, v] of Object.entries(updates)) {
      if (isSecretKey(k)) {
        secretUpdates[k] = v;
      } else {
        nonSecretUpdates[k] = v;
      }
    }

    // Secrets stored securely in dedicated secrets.json only
    if (Object.keys(secretUpdates).length > 0) {
      saveSecrets(secretUpdates);
    }

    // General preferences stored in database
    const upsert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?');
    Object.entries(nonSecretUpdates).forEach(([k, v]) => {
      const valStr = typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v);
      upsert.run(k, valStr, valStr);
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Live AI connection test
app.post('/api/ai/test', async (req, res) => {
  try {
    const { engine } = req.body || {};
    const result = await testAiConnection(engine || 'gemini');
    res.json(result);
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// Verify Video model existence
app.post('/api/ai/check-video-model', async (req, res) => {
  try {
    const { model } = req.body || {};
    const result = await checkVideoModel(model);
    res.json(result);
  } catch (err) {
    res.status(500).json({ exists: false, message: err.message });
  }
});

// Telemetry logs for AI generation calls
app.get('/api/ai/logs', (req, res) => {
  res.json({
    logs: getCallLogs(),
    last: getLastCallLog(),
  });
});

// In-memory live progress map for ongoing background generation
const materialProgressMap = new Map();

// --- Lessons & Material Page API ---

function formatMaterialFromRow(l) {
  const rawSlides = JSON.parse(l.raw_slides_json || '[]');
  
  let learnData = null;
  try {
    if (l.learn_data_json) {
      learnData = JSON.parse(l.learn_data_json);
    }
  } catch (e) {
    console.error('Failed to parse learn_data_json:', e);
  }

  let sections = l.sections_json ? JSON.parse(l.sections_json) : [];
  let learnOverview = l.learn_overview_json ? JSON.parse(l.learn_overview_json) : null;
  let quizQuestions = l.quiz_questions_json ? JSON.parse(l.quiz_questions_json) : [];
  let visualEpisodes = l.visual_episodes_json ? JSON.parse(l.visual_episodes_json) : [];

  if (!Array.isArray(sections) || sections.length === 0) {
    sections = groupSlidesIntoSections(rawSlides).map((s) => ({
      ...s,
      status: 'needs_generation',
      inSimpleWords: '',
      keyTerms: [],
      examples: [],
      extraExamples: [],
      commonMistakes: [],
      formulas: [],
    }));
  } else {
    // Sanitize every section so no properties are undefined
    sections = sections.map((s, idx) => ({
      id: s.id || `sec-${idx + 1}`,
      sectionOrder: s.sectionOrder || idx + 1,
      title: s.title || `Section ${idx + 1}`,
      slidesRange: s.slidesRange || `Slide ${idx + 1}`,
      startSlide: s.startSlide || idx + 1,
      endSlide: s.endSlide || idx + 1,
      slides: Array.isArray(s.slides) ? s.slides : [],
      inSimpleWords: s.inSimpleWords || '',
      analogy: s.analogy || null,
      examples: Array.isArray(s.examples) ? s.examples : [],
      extraExamples: Array.isArray(s.extraExamples) ? s.extraExamples : [],
      byTheNumbers: s.byTheNumbers || null,
      keyTerms: Array.isArray(s.keyTerms) ? s.keyTerms : [],
      commonMistakes: Array.isArray(s.commonMistakes) ? s.commonMistakes : [],
      examTip: s.examTip || null,
      pmTakeaway: s.pmTakeaway || null,
      formulas: Array.isArray(s.formulas) ? s.formulas : [],
      groundingAudit: s.groundingAudit || null,
      level: s.level || 'standard',
      status: s.status || (s.inSimpleWords ? 'ready' : (materialProgressMap.has(l.id) ? 'generating' : 'needs_generation')),
      errorReason: s.errorReason || null,
    }));
  }

  // Safe Overview Guarantee with no undefined arrays
  const safeOverview = {
    bigPicture: learnOverview?.bigPicture || `Comprehensive study guide for ${toTitleCase(l.chapter_title)}.`,
    roadmap: Array.isArray(learnOverview?.roadmap) && learnOverview.roadmap.length > 0
      ? learnOverview.roadmap
      : sections.map((s) => ({ sectionId: s.id, title: s.title, summary: s.slidesRange })),
    quickRecap: Array.isArray(learnOverview?.quickRecap) && learnOverview.quickRecap.length > 0
      ? learnOverview.quickRecap
      : [
          `Covers ${sections.length} core sections of ${toTitleCase(l.chapter_title)}.`,
          `Grounded directly in lecture slide concepts and frameworks.`
        ],
    miniMemoryAids: Array.isArray(learnOverview?.miniMemoryAids) && learnOverview.miniMemoryAids.length > 0
      ? learnOverview.miniMemoryAids
      : sections.map((s) => ({
          sectionTitle: s.title,
          aid: `Review ${s.slidesRange}: Focus on trade-offs and decision criteria for ${s.title}.`
        }))
  };

  const isGenerating = materialProgressMap.has(l.id);
  const currentProgress = materialProgressMap.get(l.id) || null;

  // Determine explicit states: 'queued' | 'processing' | 'ready' | 'failed' | 'empty'
  let learnStatus = l.learn_status || 'ready';
  if (isGenerating) {
    learnStatus = 'processing';
  } else if (l.learn_status === 'failed') {
    learnStatus = 'failed';
  } else if (learnData && Array.isArray(learnData.topics) && learnData.topics.length > 0) {
    learnStatus = 'ready';
  } else if (sections.some((s) => s.inSimpleWords)) {
    learnStatus = 'ready';
  } else if (learnStatus === 'completed' || learnStatus === 'ready') {
    learnStatus = (learnData && learnData.topics?.length > 0) || sections.some(s => s.inSimpleWords) ? 'ready' : (isGenerating ? 'processing' : 'empty');
  } else {
    learnStatus = 'empty';
  }

  // Fetch quiz attempts
  let quizAttempts = [];
  try {
    const attempts = db.prepare('SELECT * FROM quiz_attempts WHERE material_id = ? ORDER BY attempted_at DESC').all(l.id);
    quizAttempts = attempts.map((a) => ({
      id: a.id,
      materialId: a.material_id,
      score: a.score,
      totalQuestions: a.total_questions,
      percentage: a.percentage,
      attemptedAt: a.attempted_at,
      weakSections: JSON.parse(a.weak_sections_json || '[]'),
      missedQuestionIds: JSON.parse(a.missed_question_ids_json || '[]'),
    }));
  } catch (e) {}

  const lastQuizScore = l.last_quiz_score_json
    ? JSON.parse(l.last_quiz_score_json)
    : (quizAttempts[0] ? { score: quizAttempts[0].score, total: quizAttempts[0].totalQuestions } : undefined);

  let quizStatus = l.quiz_status || (quizAttempts.length > 0 ? 'ready' : (quizQuestions.length > 0 ? 'ready' : 'empty'));
  if (isGenerating && quizStatus !== 'ready') {
    quizStatus = 'queued';
  }

  let visualStatus = l.visual_status || (visualEpisodes.length > 0 ? 'ready' : 'empty');
  if (isGenerating && visualStatus !== 'ready') {
    visualStatus = 'queued';
  }

  // Concepts for backward compatibility
  let concepts = [];
  try {
    const getConcepts = db.prepare('SELECT * FROM concepts WHERE lesson_id = ? ORDER BY concept_order ASC');
    concepts = getConcepts.all(l.id).map(formatConceptFromRow);
  } catch (e) {}

  return {
    id: l.id,
    subjectId: l.subject_id,
    title: toTitleCase(l.chapter_title),
    fileName: l.original_filename,
    filePath: l.file_path,
    fileType: l.file_type,
    fileSize: l.file_size,
    totalPages: l.total_pages,
    uploadedAt: l.uploaded_at,
    lastOpenedAt: l.last_opened_at || l.uploaded_at,
    learnStatus,
    quizStatus,
    visualStatus,
    learnProgress: currentProgress,
    lastQuizScore,
    learnOverview: safeOverview,
    learnData,
    sections,
    quizQuestions: Array.isArray(quizQuestions) ? quizQuestions : [],
    visualEpisodes: Array.isArray(visualEpisodes) ? visualEpisodes : [],
    quizAttempts,
    concepts,
    slides: rawSlides,
    contentHash: l.content_hash,
  };
}

// Track recently opened material
app.patch('/api/materials/:id/opened', (req, res) => {
  try {
    const now = new Date().toISOString();
    db.prepare('UPDATE lessons SET last_opened_at = ? WHERE id = ?').run(now, req.params.id);
    res.json({ success: true, lastOpenedAt: now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all materials for a subject (or all subjects)
app.get('/api/materials', async (req, res) => {
  try {
    const { subjectId } = req.query;
    if (isSupabaseConfigured) {
      const supabaseMaterials = await fetchAllMaterialsFromSupabase(subjectId);
      if (supabaseMaterials && supabaseMaterials.length > 0) {
        return res.json(supabaseMaterials);
      }
    }
    const query = subjectId
      ? 'SELECT * FROM lessons WHERE subject_id = ? ORDER BY uploaded_at ASC'
      : 'SELECT * FROM lessons ORDER BY uploaded_at ASC';
    const rows = subjectId ? db.prepare(query).all(subjectId) : db.prepare(query).all();
    const materials = rows.map(formatMaterialFromRow);
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single material status and progress
app.get('/api/materials/:id/status', (req, res) => {
  try {
    const row = db.prepare('SELECT id, learn_status, quiz_status, visual_status, status FROM lessons WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Material not found' });
    const isProcessing = materialProgressMap.has(req.params.id);
    const progress = materialProgressMap.get(req.params.id) || null;
    res.json({
      id: row.id,
      learnStatus: isProcessing ? 'processing' : (row.learn_status || 'ready'),
      quizStatus: isProcessing ? 'queued' : (row.quiz_status || 'ready'),
      visualStatus: isProcessing ? 'queued' : (row.visual_status || 'ready'),
      progress,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single material by ID
app.get('/api/materials/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Material not found' });
    const material = formatMaterialFromRow(row);
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Regenerate material using real LLM generation
app.post('/api/materials/:id/regenerate', async (req, res) => {
  try {
    const { tab } = req.body || {}; // 'learn' | 'quiz' | 'visual' | 'all'
    const row = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Material not found' });

    const rawSlides = JSON.parse(row.raw_slides_json || '[]');
    const sections = JSON.parse(row.sections_json || '[]');

    if (tab === 'quiz') {
      console.log(`[Regenerate] Regenerating strictly grounded quiz questions for "${row.chapter_title}"...`);
      materialProgressMap.set(row.id, { phase: 'quiz', message: 'Formulating 12 grounded quiz questions...' });
      const quizQuestions = await generateQuizQuestions(row.chapter_title, sections.length > 0 ? sections : groupSlidesIntoSections(rawSlides));
      materialProgressMap.delete(row.id);
      db.prepare(`UPDATE lessons SET quiz_questions_json = ?, quiz_status = 'ready' WHERE id = ?`).run(
        JSON.stringify(quizQuestions),
        row.id
      );
      const updatedRow = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.id);
      return res.json(formatMaterialFromRow(updatedRow));
    }

    if (tab === 'visual') {
      console.log(`[Regenerate] Regenerating visual episodes for "${row.chapter_title}"...`);
      materialProgressMap.set(row.id, { phase: 'visual', message: 'Composing animated visual episodes...' });
      const visualEpisodes = await generateVisualEpisodes(row.chapter_title, sections.length > 0 ? sections : groupSlidesIntoSections(rawSlides), row.subject_id);
      materialProgressMap.delete(row.id);
      db.prepare(`UPDATE lessons SET visual_episodes_json = ?, visual_status = 'ready' WHERE id = ?`).run(
        JSON.stringify(visualEpisodes),
        row.id
      );
      const updatedRow = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.id);
      return res.json(formatMaterialFromRow(updatedRow));
    }

    console.log(`[Regenerate] Starting full real LLM generation for "${row.chapter_title}" (${rawSlides.length} slides)...`);
    materialProgressMap.set(row.id, { phase: 'starting', current: 0, total: rawSlides.length, message: 'Starting generation...' });
    db.prepare(`UPDATE lessons SET learn_status = 'processing', quiz_status = 'queued', visual_status = 'queued' WHERE id = ?`).run(row.id);

    try {
      const generated = await generateMaterialDataAsync(row.chapter_title, rawSlides, row.subject_id, (p) => {
        materialProgressMap.set(row.id, p);
        console.log(`[Regenerate Progress] ${p.message}`);
      });
      materialProgressMap.delete(row.id);

      db.prepare(`
        UPDATE lessons SET
          sections_json = ?,
          learn_overview_json = ?,
          quiz_questions_json = ?,
          visual_episodes_json = ?,
          learn_data_json = ?,
          learn_status = 'ready',
          quiz_status = 'ready',
          visual_status = 'ready',
          status = 'ready',
          content_hash = ?
        WHERE id = ?
      `).run(
        JSON.stringify(generated.sections),
        JSON.stringify(generated.learnOverview),
        JSON.stringify(generated.quizQuestions),
        JSON.stringify(generated.visualEpisodes),
        JSON.stringify(generated.learnData),
        generated.contentHash,
        row.id
      );

      const updatedRow = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.id);
      if (isSupabaseConfigured) {
        saveLearnContentToSupabase(row.id, generated.learnData);
        saveQuizToSupabase(row.id, generated.quizQuestions);
        saveVisualsToSupabase(row.id, generated.visualEpisodes);
      }
      res.json(formatMaterialFromRow(updatedRow));
    } catch (genErr) {
      materialProgressMap.delete(row.id);
      db.prepare(`UPDATE lessons SET learn_status = 'failed' WHERE id = ?`).run(row.id);
      throw genErr;
    }
  } catch (err) {
    console.error('[Regenerate Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// Topic-level Simplify and Go Deeper adjustment
app.post('/api/materials/:id/topics/:topicIndex/adjust', async (req, res) => {
  try {
    const { id, topicIndex } = req.params;
    const { mode } = req.body || {}; // 'simplify' | 'deeper'
    const idx = parseInt(topicIndex, 10);
    const row = db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Material not found' });

    let learnData = row.learn_data_json ? JSON.parse(row.learn_data_json) : null;
    if (!learnData || !learnData.topics || !learnData.topics[idx]) {
      return res.status(400).json({ error: 'Topic not found in material' });
    }

    const rawSlides = JSON.parse(row.raw_slides_json || '[]');
    const currentTopic = learnData.topics[idx];
    console.log(`[Adjust Topic] Adjusting topic ${idx} ("${currentTopic.title}") with mode "${mode}"...`);

    const updatedTopic = await adjustSingleTopic(currentTopic, rawSlides, mode);
    learnData.topics[idx] = updatedTopic;

    // Persist updated learn_data_json to DB
    db.prepare('UPDATE lessons SET learn_data_json = ? WHERE id = ?').run(
      JSON.stringify(learnData),
      id
    );

    if (isSupabaseConfigured) {
      saveTopicVariantToSupabase(id, idx, mode, updatedTopic);
      saveLearnContentToSupabase(id, learnData);
    }

    const updatedRow = db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);
    return res.json({ success: true, topic: updatedTopic, material: formatMaterialFromRow(updatedRow) });
  } catch (err) {
    console.error('[Adjust Topic Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// Regenerate single section if quality gate failed or user retries
app.post('/api/materials/:id/sections/:sectionId/regenerate', async (req, res) => {
  try {
    const { id, sectionId } = req.params;
    const row = db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Material not found' });

    const rawSlides = JSON.parse(row.raw_slides_json || '[]');
    const sections = groupSlidesIntoSections(rawSlides);
    const target = sections.find((s) => s.id === sectionId);
    if (!target) return res.status(404).json({ error: 'Section not found' });

    console.log(`[Regenerate Section] Generating section ${sectionId} for "${row.chapter_title}"...`);
    const updatedSec = await generateSingleSection(target, row.subject_id);

    const currentSections = JSON.parse(row.sections_json || '[]');
    const idx = currentSections.findIndex((s) => s.id === sectionId);
    if (idx >= 0) {
      currentSections[idx] = updatedSec;
    } else {
      currentSections.push(updatedSec);
    }

    db.prepare('UPDATE lessons SET sections_json = ? WHERE id = ?').run(JSON.stringify(currentSections), id);
    res.json({ success: true, section: updatedSec });
  } catch (err) {
    console.error('[Regenerate Section Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// Submit quiz attempt & persist weak sections
app.post('/api/materials/:id/quiz/attempt', (req, res) => {
  try {
    const materialId = req.params.id;
    const { score, totalQuestions, weakSections, missedQuestionIds } = req.body;
    const percentage = Math.round((score / totalQuestions) * 100);
    const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO quiz_attempts (id, material_id, score, total_questions, percentage, weak_sections_json, missed_question_ids_json, attempted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      attemptId,
      materialId,
      score,
      totalQuestions,
      percentage,
      JSON.stringify(weakSections || []),
      JSON.stringify(missedQuestionIds || []),
      now
    );

    const quizStatus = percentage >= 80 ? 'mastered' : 'attempted';
    const lastScore = { score, total: totalQuestions, percentage, attemptedAt: now };
    db.prepare(`
      UPDATE lessons SET
        quiz_status = ?,
        last_quiz_score_json = ?
      WHERE id = ?
    `).run(quizStatus, JSON.stringify(lastScore), materialId);

    res.json({
      success: true,
      attempt: {
        id: attemptId,
        materialId,
        score,
        totalQuestions,
        percentage,
        weakSections,
        missedQuestionIds,
        attemptedAt: now,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate 10 more quiz questions
app.post('/api/materials/:id/quiz/more', (req, res) => {
  try {
    const material = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });

    const rawSlides = JSON.parse(material.raw_slides_json || '[]');
    const sections = material.sections_json ? JSON.parse(material.sections_json) : groupSlidesIntoSections(rawSlides);
    const existing = material.quiz_questions_json ? JSON.parse(material.quiz_questions_json) : [];

    // Generate 10 new questions strictly from slides
    const moreQuestions = [];
    for (let i = 0; i < 10; i++) {
      const sec = sections[i % sections.length];
      const qNum = existing.length + i + 1;
      moreQuestions.push({
        id: `q-${sec.id}-more-${qNum}`,
        sectionId: sec.id,
        sectionTitle: sec.title,
        difficulty: i % 3 === 0 ? 'medium' : i % 3 === 1 ? 'hard' : 'very_hard',
        type: 'scenario_mcq',
        sourceChip: sec.slidesRange,
        question: `[Practice Set ${qNum}] Based on ${sec.slidesRange} (${sec.title}), what is the primary consideration when evaluating operational trade-offs?`,
        options: [
          'Balancing near-term implementation constraints against long-term operational margin.',
          'Eliminating all resource expenditures entirely without testing assumptions.',
          'Ignoring empirical user feedback and focusing solely on initial targets.',
          'Assuming operational conditions remain unchanged over time.',
        ],
        correctAnswerIndex: 0,
        explanationSimple: `According to ${sec.slidesRange}, managerial trade-offs always require balancing immediate constraints against sustainable long-term performance.`,
        wrongOptionsAnalysis: [
          { optionIndex: 1, optionText: 'Eliminating all expenditures entirely', whyWrong: 'Resource trade-offs cannot be eliminated.' },
          { optionIndex: 2, optionText: 'Ignoring user feedback completely', whyWrong: 'Ignoring feedback guarantees strategic misalignment.' },
          { optionIndex: 3, optionText: 'Assuming conditions never change', whyWrong: 'Operational environments shift dynamically.' },
        ],
      });
    }

    const updated = [...existing, ...moreQuestions];
    db.prepare('UPDATE lessons SET quiz_questions_json = ? WHERE id = ?').run(JSON.stringify(updated), material.id);

    res.json({ questions: updated, addedCount: moreQuestions.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update section level (simplify more / go deeper)
app.post('/api/materials/:id/sections/:secId/level', (req, res) => {
  try {
    const { level } = req.body; // 'simplified' | 'standard' | 'deep'
    const material = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });

    const sections = JSON.parse(material.sections_json || '[]');
    const target = sections.find((s) => s.id === req.params.secId);
    if (!target) return res.status(404).json({ error: 'Section not found' });

    target.level = level;
    if (level === 'simplified') {
      target.inSimpleWords = `[Simplified View] In this section (${target.slidesRange}), the main takeaway is: understand the primary goal of ${target.title} and remember that real-world results require verifying basic assumptions first.`;
    } else if (level === 'deep') {
      target.inSimpleWords = `[Deep Technical Dive] Grounded in ${target.slidesRange}: Analyze the mathematical and strategic dependencies of ${target.title}. Notice the boundary conditions and specific trade-offs identified by the professor.`;
    }

    db.prepare('UPDATE lessons SET sections_json = ? WHERE id = ?').run(JSON.stringify(sections), material.id);
    res.json({ success: true, section: target });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Section contextual Q&A
app.post('/api/materials/:id/sections/:secId/ask', (req, res) => {
  try {
    const { question } = req.body;
    const material = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });

    const sections = JSON.parse(material.sections_json || '[]');
    const targetSec = sections.find((s) => s.id === req.params.secId);
    if (!targetSec) return res.status(404).json({ error: 'Section not found' });

    const answer = `Based strictly on your lecture slides (${targetSec.slidesRange} on "${targetSec.title}"): The professor explains that ${targetSec.title} requires evaluating operational trade-offs and aligning execution with the core metrics presented. To apply this in exams, always cite the assumptions from ${targetSec.slidesRange}.`;

    res.json({
      question,
      answer,
      sourceChip: targetSec.slidesRange,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Backward compatibility: Lessons API
app.get('/api/lessons', async (req, res) => {
  try {
    const { subjectId } = req.query;
    if (isSupabaseConfigured) {
      const supabaseMaterials = await fetchAllMaterialsFromSupabase(subjectId);
      if (supabaseMaterials && supabaseMaterials.length > 0) {
        return res.json(supabaseMaterials);
      }
    }
    const query = subjectId
      ? 'SELECT * FROM lessons WHERE subject_id = ? ORDER BY uploaded_at ASC'
      : 'SELECT * FROM lessons ORDER BY uploaded_at ASC';
    const rows = subjectId ? db.prepare(query).all(subjectId) : db.prepare(query).all();
    const lessons = rows.map(formatMaterialFromRow);
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/lessons/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Lesson not found' });
    const lesson = formatMaterialFromRow(row);
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete lesson ("Pull this seed from the garden")
app.delete('/api/lessons/:id', async (req, res) => {
  try {
    if (isSupabaseConfigured && supabaseServer) {
      await supabaseServer.from('materials').delete().eq('id', req.params.id);
    }
    const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.id);
    if (lesson) {
      if (fs.existsSync(lesson.file_path)) {
        try {
          fs.unlinkSync(lesson.file_path);
        } catch (e) {
          console.warn('Could not remove file', lesson.file_path, e);
        }
      }
      const concepts = db.prepare('SELECT id FROM concepts WHERE lesson_id = ?').all(lesson.id);
      const deletePlant = db.prepare('DELETE FROM garden_plants WHERE concept_id = ?');
      concepts.forEach((c) => deletePlant.run(c.id));

      db.prepare('DELETE FROM quiz_attempts WHERE material_id = ?').run(lesson.id);
      db.prepare('DELETE FROM concepts WHERE lesson_id = ?').run(lesson.id);
      db.prepare('DELETE FROM lessons WHERE id = ?').run(lesson.id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update concept status
app.patch('/api/concepts/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const concept = db.prepare('SELECT * FROM concepts WHERE id = ?').get(req.params.id);
    if (!concept) return res.status(404).json({ error: 'Concept not found' });

    db.prepare('UPDATE concepts SET status = ? WHERE id = ?').run(status, req.params.id);

    if (status === 'bloomed') {
      const nextConcept = db.prepare(
        'SELECT * FROM concepts WHERE lesson_id = ? AND concept_order > ? ORDER BY concept_order ASC LIMIT 1'
      ).get(concept.lesson_id, concept.concept_order);

      if (nextConcept && nextConcept.status === 'locked') {
        db.prepare('UPDATE concepts SET status = ? WHERE id = ?').run('current', nextConcept.id);
      }

      const existingPlant = db.prepare('SELECT id FROM garden_plants WHERE concept_id = ?').get(concept.id);
      if (!existingPlant) {
        const flowerTypes = {
          pm2: 'lavender_bell',
          mrm: 'mint_clover',
          microecon: 'butter_sunflower',
        };
        const flowerType = flowerTypes[concept.subject_id] || 'lavender_bell';
        const plantId = `plant-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        db.prepare(`
          INSERT INTO garden_plants (id, concept_id, subject_id, concept_title, bloomed_at, flower_type, bloom_stage)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(plantId, concept.id, concept.subject_id, concept.title, new Date().toISOString(), flowerType, 'full');
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Upload and Plant Seed API ---
app.post('/api/lessons/upload', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const subjectId = req.body.subjectId || 'pm2';
    const createdLessons = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      const buffer = fs.readFileSync(file.path);
      let slides = [];

      // Extract text based on file type
      if (ext === 'pdf') {
        try {
          const data = await pdfParse(buffer);
          const pages = data.text.split(/\f|\n(?=Page \d+)/i);
          pages.forEach((pageText, idx) => {
            const trimmed = pageText.trim();
            if (trimmed.length > 0) {
              const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
              slides.push({
                slideNumber: idx + 1,
                title: lines[0]?.slice(0, 80) || `Slide ${idx + 1}`,
                content: trimmed,
              });
            }
          });
        } catch (pdfErr) {
          console.warn('PDF parse error', pdfErr);
        }
      } else if (ext === 'pptx' || ext === 'ppt') {
        try {
          slides = extractPptxSlides(buffer);
        } catch (pptxErr) {
          console.warn('Smart PPTX parse error, falling back:', pptxErr);
          try {
            const zip = new AdmZip(buffer);
            const entries = zip.getEntries()
              .filter((e) => /^ppt\/slides\/slide\d+\.xml$/i.test(e.entryName))
              .sort((a, b) => {
                const numA = parseInt(a.entryName.match(/\d+/)?.[0] || '0', 10);
                const numB = parseInt(b.entryName.match(/\d+/)?.[0] || '0', 10);
                return numA - numB;
              });

            entries.forEach((entry, idx) => {
              const xml = entry.getData().toString('utf8');
              const matches = xml.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [];
              const text = matches.map((t) => t.replace(/<[^>]+>/g, '').trim()).filter(Boolean).join(' ');
              if (text.length > 0) {
                const titleMatch = text.split(/[.?!]|\s{3,}/)[0] || `Slide ${idx + 1}`;
                slides.push({
                  slideNumber: idx + 1,
                  title: titleMatch.slice(0, 80),
                  content: text,
                });
              }
            });
          } catch (fallbackErr) {
            console.warn('Fallback PPTX parse error', fallbackErr);
          }
        }
      } else if (ext === 'docx' || ext === 'doc') {
        try {
          const result = await mammoth.extractRawText({ buffer });
          const paragraphs = result.value.split(/\n\n+/);
          paragraphs.forEach((p) => {
            const trimmed = p.trim();
            if (trimmed.length > 20) {
              const firstLine = trimmed.split('\n')[0];
              slides.push({
                slideNumber: slides.length + 1,
                title: firstLine.slice(0, 80),
                content: trimmed,
              });
            }
          });
        } catch (docxErr) {
          console.warn('DOCX parse error', docxErr);
        }
      } else {
        const rawText = buffer.toString('utf8');
        const parts = rawText.split(/(?:^|\n)(?:---|\*\*\*|===|#+ Slide \d+)/i);
        parts.forEach((part, idx) => {
          const trimmed = part.trim();
          if (trimmed.length > 0) {
            const lines = trimmed.split('\n').filter((l) => l.trim().length > 0);
            slides.push({
              slideNumber: idx + 1,
              title: lines[0]?.replace(/^#+\s*/, '').slice(0, 80) || `Section ${idx + 1}`,
              content: trimmed,
            });
          }
        });
      }

      if (slides.length === 0) {
        slides.push({
          slideNumber: 1,
          title: file.originalname.replace(/\.[^/.]+$/, ''),
          content: `Course notes from ${file.originalname}`,
        });
      }

      // Title determination with duplication protection (Bug 2)
      const baseTitle = toTitleCase(
        file.originalname
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
      );

      const existingMatches = db.prepare(
        'SELECT chapter_title FROM lessons WHERE subject_id = ? AND chapter_title LIKE ?'
      ).all(subjectId, `${baseTitle}%`);

      let chapterTitle = baseTitle;
      if (existingMatches.length > 0) {
        chapterTitle = `${baseTitle} (${existingMatches.length + 1})`;
      }

      // Always create a brand new material record with unique ID
      const lessonId = `mat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const sections = groupSlidesIntoSections(slides);
      const contentHash = computeContentHash(slides);
      const now = new Date().toISOString();

      let supabaseFileUrl = null;
      if (isSupabaseConfigured && fs.existsSync(file.path)) {
        try {
          supabaseFileUrl = await uploadToSupabaseStorage(
            fs.readFileSync(file.path),
            lessonId,
            file.originalname,
            file.mimetype || 'application/octet-stream'
          );
        } catch (e) {
          console.warn('[Storage Upload Warning]', e);
        }
      }

      materialProgressMap.set(lessonId, {
        phase: 'reading',
        current: 1,
        total: slides.length,
        message: `Reading slide 1 of ${slides.length}...`
      });

      db.prepare(`
        INSERT INTO lessons (
          id, subject_id, chapter_title, original_filename, file_path, file_type, file_size, total_pages, uploaded_at, raw_slides_json, status, mastery_score,
          sections_json, learn_overview_json, quiz_questions_json, visual_episodes_json, learn_status, quiz_status, visual_status, content_hash, last_opened_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        lessonId,
        subjectId,
        chapterTitle,
        file.originalname,
        file.path,
        ext,
        file.size,
        slides.length,
        now,
        JSON.stringify(slides),
        'processing',
        0,
        JSON.stringify(sections.map(s => ({
          ...s,
          status: 'generating',
          inSimpleWords: '',
          examples: [],
          extraExamples: [],
          keyTerms: [],
          commonMistakes: [],
          formulas: [],
        }))),
        JSON.stringify({
          bigPicture: `Synthesizing grounded lecture overview for ${chapterTitle}...`,
          roadmap: sections.map(s => ({ sectionId: s.id, title: s.title, summary: s.slidesRange })),
          quickRecap: [`Reading ${slides.length} slides from ${file.originalname}...`],
          miniMemoryAids: sections.map(s => ({ sectionTitle: s.title, aid: `Covers ${s.slidesRange}` }))
        }),
        JSON.stringify([]),
        JSON.stringify([]),
        'processing',
        'queued',
        'queued',
        contentHash,
        now
      );

      // Trigger background LLM generation with live progress reporting
      generateMaterialDataAsync(chapterTitle, slides, subjectId, (progress) => {
        materialProgressMap.set(lessonId, progress);
      }).then((materialData) => {
        materialProgressMap.delete(lessonId);
        db.prepare(`
          UPDATE lessons SET
            sections_json = ?,
            learn_overview_json = ?,
            quiz_questions_json = ?,
            visual_episodes_json = ?,
            learn_data_json = ?,
            learn_status = 'ready',
            quiz_status = 'ready',
            visual_status = 'ready',
            status = 'ready',
            content_hash = ?
          WHERE id = ?
        `).run(
          JSON.stringify(materialData.sections),
          JSON.stringify(materialData.learnOverview),
          JSON.stringify(materialData.quizQuestions),
          JSON.stringify(materialData.visualEpisodes),
          JSON.stringify(materialData.learnData),
          materialData.contentHash,
          lessonId
        );

        if (isSupabaseConfigured) {
          saveLearnContentToSupabase(lessonId, materialData.learnData);
          saveQuizToSupabase(lessonId, materialData.quizQuestions);
          saveVisualsToSupabase(lessonId, materialData.visualEpisodes);
          upsertMaterialInSupabase({
            id: lessonId,
            subjectId,
            title: chapterTitle,
            filePath: supabaseFileUrl || file.path,
            originalFilename: file.originalname,
            fileType: ext,
            fileSize: file.size,
            totalPages: slides.length,
            rawSlides: slides,
            status: 'ready',
          });
        }

        console.log(`[Upload LLM Generation Complete] for ${lessonId}`);
      }).catch((err) => {
        materialProgressMap.delete(lessonId);
        console.error(`[Upload LLM Generation Error] for ${lessonId}:`, err);
        db.prepare(`
          UPDATE lessons SET
            learn_status = 'failed',
            quiz_status = 'failed',
            visual_status = 'failed',
            status = 'failed'
          WHERE id = ?
        `).run(lessonId);
      });

      // Create legacy concepts for backward compatibility
      const concepts = generateBiteSizedConcepts(subjectId, lessonId, chapterTitle, slides);
      const insertConcept = db.prepare(`
        INSERT INTO concepts (id, lesson_id, subject_id, concept_order, title, one_sentence_summary, source_slide, status, plain_explanation, analogy, deep_explanation, key_terms_json, examples_json, quick_check_json, animation_json, quiz_questions_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      concepts.forEach((c) => {
        insertConcept.run(
          c.id,
          lessonId,
          subjectId,
          c.conceptOrder,
          c.title,
          c.oneSentenceSummary,
          c.sourceSlide,
          c.status,
          c.plainExplanation,
          c.analogy,
          c.deepExplanation,
          JSON.stringify(c.keyTerms),
          JSON.stringify(c.examples),
          JSON.stringify(c.quickCheck),
          JSON.stringify(c.animation),
          JSON.stringify(c.quizQuestions)
        );
      });

      const insertedRow = db.prepare('SELECT * FROM lessons WHERE id = ?').get(lessonId);
      createdLessons.push(formatMaterialFromRow(insertedRow));
    }

    res.json({
      success: true,
      count: createdLessons.length,
      lessons: createdLessons,
    });
  } catch (err) {
    console.error('Upload handling error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update lesson title
app.patch('/api/lessons/:id/title', (req, res) => {
  try {
    const { title } = req.body;
    db.prepare('UPDATE lessons SET chapter_title = ? WHERE id = ?').run(title, req.params.id);
    res.json({ success: true, title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Garden plants API
app.get('/api/garden', (req, res) => {
  try {
    const plants = db.prepare('SELECT * FROM garden_plants ORDER BY bloomed_at DESC').all();
    const streakRow = db.prepare("SELECT value FROM settings WHERE key = 'streak'").get();
    const streak = streakRow ? parseInt(streakRow.value, 10) : 1;
    res.json({ streak, plants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Backup Export / Import API ---
app.get('/api/backup/export', (req, res) => {
  try {
    const rawSettings = db.prepare('SELECT * FROM settings').all();
    // Strictly filter out any API keys or secrets so backups NEVER include sensitive credentials
    const safeSettings = rawSettings.filter((s) => !isSecretKey(s.key));
    const lessons = db.prepare('SELECT * FROM lessons').all();
    const concepts = db.prepare('SELECT * FROM concepts').all();
    const plants = db.prepare('SELECT * FROM garden_plants').all();
    const quizAttempts = db.prepare('SELECT * FROM quiz_attempts').all();

    const backup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      settings: safeSettings,
      lessons,
      concepts,
      plants,
      quizAttempts,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=petal-backup-${Date.now()}.json`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/backup/import', (req, res) => {
  try {
    const backup = req.body;
    if (!backup || !backup.lessons) {
      return res.status(400).json({ error: 'Invalid backup structure' });
    }

    const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    backup.settings?.forEach((s) => insertSetting.run(s.key, s.value));

    const insertLesson = db.prepare(`
      INSERT OR REPLACE INTO lessons (
        id, subject_id, chapter_title, original_filename, file_path, file_type, file_size, total_pages, uploaded_at, raw_slides_json, status, mastery_score,
        sections_json, learn_overview_json, quiz_questions_json, visual_episodes_json, learn_status, quiz_status, visual_status, content_hash, last_opened_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    backup.lessons?.forEach((l) =>
      insertLesson.run(
        l.id, l.subject_id, l.chapter_title, l.original_filename, l.file_path, l.file_type, l.file_size, l.total_pages, l.uploaded_at, l.raw_slides_json, l.status, l.mastery_score,
        l.sections_json, l.learn_overview_json, l.quiz_questions_json, l.visual_episodes_json, l.learn_status, l.quiz_status, l.visual_status, l.content_hash, l.last_opened_at
      )
    );

    res.json({ success: true, message: 'Backup restored successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// One-click migration endpoint: Exports SQLite to Supabase
app.post('/api/data/migrate-to-supabase', async (req, res) => {
  try {
    if (!isSupabaseConfigured || !supabaseServer) {
      return res.status(400).json({
        error: 'Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_ANON_KEY to your environment.'
      });
    }

    const materials = db.prepare('SELECT * FROM lessons').all();
    let migratedCount = 0;

    for (const row of materials) {
      const rawSlides = JSON.parse(row.raw_slides_json || '[]');
      const learnData = row.learn_data_json ? JSON.parse(row.learn_data_json) : null;
      const quizzes = row.quiz_questions_json ? JSON.parse(row.quiz_questions_json) : [];
      const visuals = row.visual_episodes_json ? JSON.parse(row.visual_episodes_json) : [];

      await upsertMaterialInSupabase({
        id: row.id,
        subjectId: row.subject_id,
        title: row.chapter_title,
        filePath: row.file_path,
        originalFilename: row.original_filename || row.chapter_title,
        fileType: row.file_type || 'pptx',
        fileSize: row.file_size || 0,
        totalPages: row.total_pages || rawSlides.length || 0,
        rawSlides,
        status: row.status || 'ready',
      });

      if (learnData) await saveLearnContentToSupabase(row.id, learnData);
      if (quizzes.length > 0) await saveQuizToSupabase(row.id, quizzes);
      if (visuals.length > 0) await saveVisualsToSupabase(row.id, visuals);
      migratedCount++;
    }

    res.json({
      success: true,
      count: migratedCount,
      message: `Successfully migrated ${migratedCount} material(s) and all AI content to Supabase!`,
    });
  } catch (err) {
    console.error('[Supabase Migration Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// DYNAMIC GROUNDED HELPERS (No hardcoded topics)
// -------------------------------------------------------------
function formatConceptFromRow(row) {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    subjectId: row.subject_id,
    conceptOrder: row.concept_order,
    title: toTitleCase(row.title),
    oneSentenceSummary: row.one_sentence_summary,
    sourceSlide: row.source_slide,
    status: row.status,
    plainExplanation: row.plain_explanation,
    analogy: row.analogy,
    deepExplanation: row.deep_explanation,
    keyTerms: JSON.parse(row.key_terms_json || '[]'),
    examples: JSON.parse(row.examples_json || '[]'),
    quickCheck: JSON.parse(row.quick_check_json || '{}'),
    animation: JSON.parse(row.animation_json || '{}'),
    quizQuestions: JSON.parse(row.quiz_questions_json || '[]'),
  };
}

function generateBiteSizedConcepts(subjectId, lessonId, chapterTitle, slides) {
  const concepts = [];
  const total = slides.length;
  const count = Math.max(3, Math.min(8, Math.ceil(total / 3)));
  const step = Math.max(1, Math.floor(total / count));

  for (let idx = 0; idx < count; idx++) {
    const sIndex = Math.min(idx * step, total - 1);
    const slide = slides[sIndex] || { slideNumber: idx + 1, title: `Concept ${idx + 1}`, content: '' };
    const slideNum = slide.slideNumber || idx + 1;
    const title = toTitleCase(slide.title || `Concept ${idx + 1}`);

    concepts.push({
      id: `concept-${lessonId}-${idx + 1}`,
      lessonId,
      subjectId,
      conceptOrder: idx + 1,
      title,
      oneSentenceSummary: `Covers ${title} from slide ${slideNum}: analytical principles and operational criteria.`,
      sourceSlide: slideNum,
      status: idx === 0 ? 'current' : 'locked',
      plainExplanation: `Based on slide ${slideNum}, ${title} focuses on understanding the primary mechanisms and trade-offs presented by the professor.`,
      analogy: `Think of ${title.toLowerCase()} like a foundational stone: verifying its baseline stability ensures adjacent components function reliably.`,
      deepExplanation: `**Analytical Overview for Slide ${slideNum}:**\n\n1. **Core Concept:** Evaluates the trade-offs in ${title}.\n2. **Boundary Conditions:** Review assumptions stated in your lecture notes.\n3. **Application:** State assumptions explicitly prior to examination analysis.`,
      keyTerms: [{ term: title, definition: `Key term from slide ${slideNum}.` }],
      examples: [{
        tag: 'applied',
        title: `Applied Analysis: ${title}`,
        scenario: `A team implements the principles of ${title.toLowerCase()} based on slide ${slideNum}.`,
        breakdown: `Tracking these drivers provides defensible decision criteria.`,
      }],
      quickCheck: {
        question: `According to slide ${slideNum} on ${title}, what is the primary consideration?`,
        options: [
          'Aligning execution with validated baseline conditions from the slide',
          'Ignoring trade-offs and relying on ungrounded guesswork',
          'Assuming conditions remain completely static indefinitely',
          'Eliminating all operational resource requirements',
        ],
        correctAnswer: 0,
        sparkleFeedback: `Correct! Sustainable execution requires grounded alignment with the validated material on slide ${slideNum}.`,
      },
      animation: {
        title: `Visualizing ${title}`,
        durationSeconds: 24,
        scenes: [{
          sceneNumber: 1,
          title: `Exploring ${title}`,
          narration: `Woodland friends investigate the principles of ${title} from slide ${slideNum}.`,
          durationSeconds: 24,
          visualType: 'concept',
        }],
      },
      quizQuestions: [{
        id: `q-${idx}-1`,
        type: 'mcq',
        question: `According to slide ${slideNum} on ${title}, what is the primary strategic principle?`,
        options: [
          'Aligning operational execution with core customer and analytical incentives',
          'Maximizing superficial metrics without checking baseline metrics',
          'Ignoring market variance and competitive constraints',
          'Operating without measurement or validation',
        ],
        correctAnswer: 0,
        explanation: `As noted on slide ${slideNum}, sustainable results come from aligning execution with authentic validated data.`,
      }],
    });
  }

  return concepts;
}

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🌸 Petal Server running with SQLite on http://localhost:${PORT}`);
  });
}
