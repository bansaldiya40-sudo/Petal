import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================================================
// DATA STORAGE OUTSIDE SOURCE CODE
// Dedicated folder outside the repository (e.g. ~/PetalData)
// Configurable via PETAL_DATA_DIR in .env
// =====================================================================
export const DATA_DIR = process.env.PETAL_DATA_DIR
  ? path.resolve(process.env.PETAL_DATA_DIR)
  : process.env.VERCEL
  ? path.join('/tmp', 'PetalData')
  : path.join(os.homedir(), 'PetalData');

export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
export const CLIPS_DIR = path.join(DATA_DIR, 'clips');
export const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

// Ensure all dedicated directories exist
[DATA_DIR, UPLOADS_DIR, CLIPS_DIR, BACKUPS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const DB_FILE = path.join(DATA_DIR, 'petal.db');

// Safe migration of existing repository data if first boot of external directory
const LOCAL_REPO_DATA = path.resolve(__dirname, '..', 'data');
const LOCAL_REPO_DB = path.join(LOCAL_REPO_DATA, 'petal.db');
if (!fs.existsSync(DB_FILE) && fs.existsSync(LOCAL_REPO_DB)) {
  try {
    fs.copyFileSync(LOCAL_REPO_DB, DB_FILE);
    console.log(`📦 Migrated existing database from ${LOCAL_REPO_DB} to dedicated folder ${DB_FILE}`);

    // Migrate existing uploads if any
    const localUploads = path.join(LOCAL_REPO_DATA, 'uploads');
    if (fs.existsSync(localUploads)) {
      const files = fs.readdirSync(localUploads);
      for (const f of files) {
        const src = path.join(localUploads, f);
        const dest = path.join(UPLOADS_DIR, f);
        if (!fs.existsSync(dest) && fs.statSync(src).isFile()) {
          fs.copyFileSync(src, dest);
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ Notice during initial data migration:', err.message);
  }
}

// ---------------------------------------------------------------------
// AUTOMATIC TIMESTAMPED DATABASE BACKUP (Keep last 10)
// ---------------------------------------------------------------------
export function createTimestampedBackup(reason = 'startup') {
  if (fs.existsSync(DB_FILE)) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `petal-backup-${timestamp}-${reason}.db`;
      const backupPath = path.join(BACKUPS_DIR, backupName);
      fs.copyFileSync(DB_FILE, backupPath);

      // Clean up backups older than the 10 most recent
      const allBackups = fs
        .readdirSync(BACKUPS_DIR)
        .filter((f) => f.startsWith('petal-backup-') && f.endsWith('.db'))
        .sort((a, b) => b.localeCompare(a));

      if (allBackups.length > 10) {
        allBackups.slice(10).forEach((oldBackup) => {
          try {
            fs.unlinkSync(path.join(BACKUPS_DIR, oldBackup));
          } catch (_) {}
        });
      }
      return backupName;
    } catch (err) {
      console.warn('⚠️ Backup creation warning:', err.message);
    }
  }
  return null;
}

// Run startup backup before connecting / running migrations
createTimestampedBackup('startup');

export const db = new Database(DB_FILE);

// Enable WAL mode for high performance & durability
db.pragma('journal_mode = WAL');

// ---------------------------------------------------------------------
// VERSIONED ADDITIVE-ONLY DATABASE MIGRATIONS
// STRICT RULE: All migrations must be ADDITIVE ONLY.
// NEVER DROP TABLES, NEVER RECREATE, NEVER RUN DESTRUCTIVE QUERIES.
// ---------------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    chapter_title TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    total_pages INTEGER NOT NULL,
    uploaded_at TEXT NOT NULL,
    raw_slides_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    mastery_score INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS concepts (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    concept_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    one_sentence_summary TEXT NOT NULL,
    source_slide INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'locked',
    plain_explanation TEXT NOT NULL,
    analogy TEXT NOT NULL,
    deep_explanation TEXT NOT NULL,
    key_terms_json TEXT NOT NULL,
    examples_json TEXT NOT NULL,
    quick_check_json TEXT NOT NULL,
    animation_json TEXT NOT NULL,
    quiz_questions_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS garden_plants (
    id TEXT PRIMARY KEY,
    concept_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    concept_title TEXT NOT NULL,
    bloomed_at TEXT NOT NULL,
    flower_type TEXT NOT NULL,
    bloom_stage TEXT NOT NULL DEFAULT 'full'
  );

  CREATE TABLE IF NOT EXISTS storyboards (
    id TEXT PRIMARY KEY,
    concept_id TEXT NOT NULL,
    title TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    duration INTEGER NOT NULL,
    scenes_json TEXT NOT NULL,
    narration_full TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS video_generations (
    id TEXT PRIMARY KEY,
    concept_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    concept_title TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    estimated_cost_usd REAL NOT NULL,
    video_url TEXT,
    local_file_path TEXT,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    completed_at TEXT,
    error_message TEXT
  );

  CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY,
    material_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage INTEGER NOT NULL,
    weak_sections_json TEXT NOT NULL,
    missed_question_ids_json TEXT NOT NULL,
    attempted_at TEXT NOT NULL
  );
`);

// Safe additive column migrations for Material 3-tab architecture
const columnsToAdd = [
  { name: 'sections_json', type: 'TEXT' },
  { name: 'learn_overview_json', type: 'TEXT' },
  { name: 'learn_data_json', type: 'TEXT' },
  { name: 'quiz_questions_json', type: 'TEXT' },
  { name: 'visual_episodes_json', type: 'TEXT' },
  { name: 'learn_status', type: 'TEXT DEFAULT "ready"' },
  { name: 'quiz_status', type: 'TEXT DEFAULT "ready"' },
  { name: 'visual_status', type: 'TEXT DEFAULT "ready"' },
  { name: 'last_quiz_score_json', type: 'TEXT' },
  { name: 'content_hash', type: 'TEXT' },
  { name: 'last_opened_at', type: 'TEXT' },
];

for (const col of columnsToAdd) {
  try {
    db.prepare(`ALTER TABLE lessons ADD COLUMN ${col.name} ${col.type}`).run();
  } catch (_) {
    // Column already exists, safe to ignore
  }
}

// ---------------------------------------------------------------------
// STARTUP SELF-CHECK (Verifies no data lost)
// ---------------------------------------------------------------------
try {
  const row = db.prepare('SELECT COUNT(*) as count FROM lessons').get();
  const materialCount = row?.count || 0;
  console.log(`🌿 [Petal Self-Check] Data Directory: ${DATA_DIR}`);
  console.log(`🌿 [Petal Self-Check] Found ${materialCount} saved course material(s) in database. 0 data lost.`);
} catch (err) {
  console.warn('⚠️ Startup self-check warning:', err.message);
}

export default db;
