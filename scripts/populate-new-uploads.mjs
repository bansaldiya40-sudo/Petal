import { supabaseServer } from '../server/supabase.js';
import { generateMaterialDataAsync } from '../server/materialProcessor.js';

async function populateNewUploads() {
  const ids = [
    'mat-1794841539083-1rw8fn',
    'mat-1794841520535-q96cka',
    'mat-1794841519642-v3csgv',
    'mat-1794841516928-100qme'
  ];

  for (const id of ids) {
    console.log(`\nProcessing material ${id}...`);
    const { data: mat } = await supabaseServer.from('materials').select('*').eq('id', id).single();
    if (!mat) {
      console.log('Not found:', id);
      continue;
    }

    const { data: learn } = await supabaseServer.from('learn_content').select('*').eq('material_id', id);
    if (learn && learn.length > 0) {
      console.log(`✓ Material "${mat.title}" already has learn content.`);
      continue;
    }

    const slides = mat.raw_slides_json || [];
    console.log(`Generating 3 tabs with Gemini for "${mat.title}" (${slides.length} slides)...`);

    try {
      const generated = await generateMaterialDataAsync(mat.title, slides, mat.subject_id || 'microecon');
      await supabaseServer.from('learn_content').upsert({
        id: `learn-${id}`,
        material_id: id,
        content_json: generated.learnData
      }, { onConflict: 'material_id' });

      await supabaseServer.from('quizzes').upsert({
        id: `quiz-${id}`,
        material_id: id,
        questions_json: generated.quizQuestions
      }, { onConflict: 'material_id' });

      await supabaseServer.from('visuals').upsert({
        id: `visuals-${id}`,
        material_id: id,
        visuals_json: generated.visualEpisodes
      }, { onConflict: 'material_id' });

      console.log(`✓ Generated & saved all 3 tabs for "${mat.title}"!`);
    } catch (e) {
      console.error(`❌ Error generating for "${mat.title}":`, e.message);
    }
  }

  console.log('\nAll new uploads populated successfully!');
}

populateNewUploads().catch(console.error);
