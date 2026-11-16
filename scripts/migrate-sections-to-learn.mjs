import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://ucknchxmkdhxgegorrjv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_wkyjAPzxgb0Z4yFCCi6R_w_CLM52pDW';

const supabase = createClient(supabaseUrl, supabaseKey);
const dbPath = path.join(os.homedir(), 'PetalData', 'petal.db');
const db = new Database(dbPath);

function parseSlideRange(rangeStr) {
  if (!rangeStr) return [1, 1];
  const nums = rangeStr.match(/\d+/g);
  if (!nums || nums.length === 0) return [1, 1];
  if (nums.length === 1) return [parseInt(nums[0], 10), parseInt(nums[0], 10)];
  return [parseInt(nums[0], 10), parseInt(nums[1], 10)];
}

function cleanHtml(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function run() {
  const { data: existingLearns } = await supabase.from('learn_content').select('material_id');
  const existingIds = new Set((existingLearns || []).map(l => l.material_id));

  const rows = db.prepare('SELECT * FROM lessons').all();
  console.log(`Checking ${rows.length} materials from local SQLite...`);

  for (const row of rows) {
    if (existingIds.has(row.id)) {
      console.log(`✓ Material "${row.chapter_title}" already has learn_content.`);
      continue;
    }

    const sections = row.sections_json ? JSON.parse(row.sections_json) : [];
    const overview = row.learn_overview_json ? JSON.parse(row.learn_overview_json) : {};

    if (sections.length === 0) {
      console.log(`⚠️ Skipping "${row.chapter_title}" (no sections)`);
      continue;
    }

    console.log(`Migrating learn_content for "${row.chapter_title}" (${sections.length} topics)...`);

    const topics = sections.map((sec, idx) => {
      const title = cleanHtml(sec.title || `Topic ${idx + 1}`);
      const summary = cleanHtml(sec.inSimpleWords || '');
      const analogy = cleanHtml(sec.analogy || '');
      const example = sec.examples?.[0]?.scenario ? cleanHtml(sec.examples[0].scenario) : '';
      const pm_lens = cleanHtml(sec.examTip || `Focus on managerial trade-offs and decision criteria for ${title}.`);
      const key_concepts = (sec.keyTerms || []).map(kt => ({
        term: cleanHtml(kt.term),
        meaning: cleanHtml(kt.definition)
      }));
      const common_confusion = sec.commonMistakes?.[0] ? cleanHtml(sec.commonMistakes[0]) : '';
      const edge_cases = (sec.commonMistakes || []).map(cleanHtml);

      return {
        id: idx + 1,
        title,
        slides: parseSlideRange(sec.slidesRange),
        summary,
        analogy,
        example,
        pm_lens,
        why_it_matters: summary,
        extra_detail: summary,
        key_concepts,
        common_confusion,
        edge_cases,
        comparison_table: null
      };
    });

    const learnData = {
      deck_title: cleanHtml(row.chapter_title),
      big_idea: cleanHtml(overview.bigPicture || `Grounded study guide covering all slides for ${row.chapter_title}.`),
      key_takeaways: (overview.quickRecap || []).map(cleanHtml),
      glossary: topics.flatMap(t => t.key_concepts),
      topics
    };

    const { error } = await supabase.from('learn_content').upsert({
      id: `learn-${row.id}`,
      material_id: row.id,
      content_json: learnData
    }, { onConflict: 'material_id' });

    if (error) {
      console.error(`  ❌ Failed for "${row.chapter_title}":`, error.message);
    } else {
      console.log(`  ✓ Successfully uploaded learn_content for "${row.chapter_title}"!`);
    }
  }

  console.log('\nMigration complete!');
}

run().catch(console.error);
