import { supabaseServer } from '../server/supabase.js';
import { generateQuizQuestions } from '../server/materialProcessor.js';

async function fixAllQuizzes() {
  console.log('Fetching all quizzes from Supabase...');
  const { data: quizzes, error } = await supabaseServer.from('quizzes').select('material_id, questions_json');
  if (error) {
    console.error('Error fetching quizzes:', error);
    return;
  }

  for (const qRow of quizzes) {
    const qs = qRow.questions_json || [];
    const isRobotic = qs.some(q => 
      !q.question || 
      q.question.includes('Assertion-Reason') || 
      q.question.includes('Rigorous measurement') || 
      q.question.includes('&amp;') ||
      q.question.includes('Unmeasured parameters')
    );

    if (!isRobotic && qs.length >= 5) {
      console.log(`✓ Material "${qRow.material_id}" already has clean authentic questions.`);
      continue;
    }

    console.log(`\nFixing robotic questions for material "${qRow.material_id}"...`);
    // Get material & learn data
    const { data: mat } = await supabaseServer.from('materials').select('*').eq('id', qRow.material_id).single();
    if (!mat) {
      console.log('  Material not found, skipping');
      continue;
    }

    const { data: learn } = await supabaseServer.from('learn_content').select('*').eq('material_id', qRow.material_id).single();
    let sections = [];
    if (learn && learn.content_json?.topics) {
      sections = learn.content_json.topics.map((t, idx) => ({
        id: `sec-${idx + 1}`,
        title: t.title,
        slidesRange: Array.isArray(t.slides) ? `Slides ${t.slides.join('–')}` : 'Slide Topic',
        slides: (mat.raw_slides_json || []).filter(s => Array.isArray(t.slides) && s.slideNumber >= t.slides[0] && s.slideNumber <= t.slides[1])
      }));
    }

    if (sections.length === 0) {
      const slides = mat.raw_slides_json || [];
      sections = [{
        id: 'sec-1',
        title: mat.title,
        slidesRange: `Slides 1–${slides.length || 1}`,
        slides
      }];
    }

    console.log(`  Calling Gemini to generate authentic PM quiz for "${mat.title}"...`);
    const newQuestions = await generateQuizQuestions(mat.title, sections);
    if (newQuestions.length > 0) {
      const { error: saveErr } = await supabaseServer.from('quizzes').upsert({
        id: `quiz-${mat.id}`,
        material_id: mat.id,
        questions_json: newQuestions
      }, { onConflict: 'material_id' });

      if (saveErr) {
        console.error('  Failed to save quiz:', saveErr.message);
      } else {
        console.log(`  ✓ Replaced with ${newQuestions.length} authentic questions! Q1: "${newQuestions[0].question.slice(0, 60)}..."`);
      }
    }
  }

  console.log('\nAll robotic quizzes replaced with authentic questions!');
}

fixAllQuizzes().catch(console.error);
