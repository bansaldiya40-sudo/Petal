// scripts/migrate-to-supabase.mjs
// Migrates all existing materials, learn content, quizzes, and visuals from local SQLite (petal.db) to Supabase.
import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL / SUPABASE_ANON_KEY in .env file.');
  console.log('Please add your Supabase credentials to .env before running migration:');
  console.log('SUPABASE_URL=https://your-project.supabase.co');
  console.log('SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_DIR = process.env.PETAL_DATA_DIR
  ? path.resolve(process.env.PETAL_DATA_DIR)
  : path.join(os.homedir(), 'PetalData');

const dbPath = path.join(DATA_DIR, 'petal.db');
console.log(`Connecting to local SQLite database at: ${dbPath}`);
const db = new Database(dbPath);

async function migrate() {
  const materials = db.prepare('SELECT * FROM lessons').all();
  console.log(`Found ${materials.length} material(s) in local SQLite database.`);

  for (const row of materials) {
    console.log(`\n📦 Migrating material: "${row.chapter_title}" (${row.id})...`);

    const rawSlides = JSON.parse(row.raw_slides_json || '[]');
    const learnData = row.learn_data_json ? JSON.parse(row.learn_data_json) : null;
    const quizzes = row.quiz_questions_json ? JSON.parse(row.quiz_questions_json) : [];
    const visuals = row.visual_episodes_json ? JSON.parse(row.visual_episodes_json) : [];

    // 1. Upsert material
    const { error: matErr } = await supabase.from('materials').upsert({
      id: row.id,
      subject_id: row.subject_id,
      title: row.chapter_title,
      file_url: row.file_path,
      file_name: row.original_filename || row.chapter_title,
      file_type: row.file_type || 'pptx',
      file_size: row.file_size || 0,
      total_pages: row.total_pages || rawSlides.length || 0,
      extracted_text: rawSlides.map((s) => `${s.title}\n${s.content}`).join('\n\n'),
      raw_slides_json: rawSlides,
      status: row.status || 'ready',
      created_at: row.uploaded_at || new Date().toISOString(),
      last_opened_at: row.last_opened_at || new Date().toISOString(),
    });

    if (matErr) {
      console.error(`  ❌ Failed to migrate material row:`, matErr.message);
      continue;
    }
    console.log(`  ✓ Material record saved to Supabase 'materials' table.`);

    // 2. Upsert learn_content
    if (learnData) {
      const { error: learnErr } = await supabase.from('learn_content').upsert({
        id: `learn-${row.id}`,
        material_id: row.id,
        content_json: learnData,
      }, { onConflict: 'material_id' });
      if (learnErr) console.warn(`  ⚠️ Learn content migration error:`, learnErr.message);
      else console.log(`  ✓ Learn content (topics & concepts) saved to Supabase 'learn_content'.`);
    }

    // 3. Upsert quizzes
    if (Array.isArray(quizzes) && quizzes.length > 0) {
      const { error: quizErr } = await supabase.from('quizzes').upsert({
        id: `quiz-${row.id}`,
        material_id: row.id,
        questions_json: quizzes,
      }, { onConflict: 'material_id' });
      if (quizErr) console.warn(`  ⚠️ Quizzes migration error:`, quizErr.message);
      else console.log(`  ✓ Quizzes saved to Supabase 'quizzes'.`);
    }

    // 4. Upsert visuals
    if (Array.isArray(visuals) && visuals.length > 0) {
      const { error: visErr } = await supabase.from('visuals').upsert({
        id: `visuals-${row.id}`,
        material_id: row.id,
        visuals_json: visuals,
      }, { onConflict: 'material_id' });
      if (visErr) console.warn(`  ⚠️ Visuals migration error:`, visErr.message);
      else console.log(`  ✓ Visual episodes saved to Supabase 'visuals'.`);
    }
  }

  console.log(`\n🎉 Migration to Supabase completed successfully!`);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
