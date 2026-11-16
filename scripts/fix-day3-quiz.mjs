import { supabaseServer } from '../server/supabase.js';
import { generateQuizQuestions } from '../server/materialProcessor.js';

async function updateQuiz() {
  const materialId = 'mat-1793548731476-r5v9dp';
  console.log('Fetching material from Supabase...');
  const { data: mat } = await supabaseServer.from('materials').select('*').eq('id', materialId).single();
  const { data: learn } = await supabaseServer.from('learn_content').select('*').eq('material_id', materialId).single();

  const sections = learn.content_json.topics.map((t, idx) => ({
    id: `sec-${idx + 1}`,
    title: t.title,
    slidesRange: `Slides ${t.slides.join('–')}`,
    slides: (mat.raw_slides_json || []).filter(s => s.slideNumber >= t.slides[0] && s.slideNumber <= t.slides[1])
  }));

  console.log(`Generating authentic PM quiz questions with Gemini for "${mat.title}"...`);
  const questions = await generateQuizQuestions(mat.title, sections);
  console.log(`Generated ${questions.length} authentic questions.`);

  const { error } = await supabaseServer.from('quizzes').upsert({
    id: `quiz-${materialId}`,
    material_id: materialId,
    questions_json: questions
  }, { onConflict: 'material_id' });

  if (error) {
    console.error('Quiz save error:', error);
  } else {
    console.log('✓ Successfully saved authentic quiz questions to Supabase!');
  }
}

updateQuiz().catch(console.error);
