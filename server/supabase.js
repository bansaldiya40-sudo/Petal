// server/supabase.js
// Backend Supabase client for persisting materials, AI content, and uploaded files to PostgreSQL and Supabase Storage.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabaseServer = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

if (isSupabaseConfigured) {
  console.log('🌿 [Petal Backend] Supabase persistence enabled with PostgreSQL & Storage.');
} else {
  console.log('ℹ️ [Petal Backend] Supabase environment variables not set. Using local SQLite fallback.');
}

/**
 * Uploads a local buffer/file to Supabase Storage bucket 'materials'
 */
export async function uploadToSupabaseStorage(
  buffer,
  materialId,
  originalFileName,
  mimeType = 'application/octet-stream'
) {
  if (!supabaseServer) return null;
  try {
    const cleanFileName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${materialId}/${Date.now()}_${cleanFileName}`;

    const { error } = await supabaseServer.storage
      .from('materials')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.warn('[Supabase Storage Server Upload Error]', error);
      return null;
    }

    const { data } = supabaseServer.storage.from('materials').getPublicUrl(storagePath);
    return data.publicUrl || null;
  } catch (err) {
    console.warn('[Supabase Storage Server Exception]', err);
    return null;
  }
}

/**
 * Upserts a material row in Supabase
 */
export async function upsertMaterialInSupabase(material) {
  if (!supabaseServer) return null;
  try {
    const { error } = await supabaseServer.from('materials').upsert({
      id: material.id,
      subject_id: material.subjectId,
      title: material.title,
      file_url: material.filePath || null,
      file_name: material.originalFilename || material.title,
      file_type: material.fileType || 'pptx',
      file_size: material.fileSize || 0,
      total_pages: material.totalPages || 0,
      extracted_text: material.rawSlides?.map((s) => `${s.title}\n${s.content}`).join('\n\n') || '',
      raw_slides_json: material.rawSlides || [],
      status: material.status || 'ready',
      last_opened_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase upsertMaterial Error]', error);
    }
  } catch (err) {
    console.warn('[Supabase upsertMaterial Exception]', err);
  }
}

/**
 * Saves AI-generated Learn Content (Topics, Key Concepts, Big Idea, Takeaways)
 */
export async function saveLearnContentToSupabase(materialId, contentJson) {
  if (!supabaseServer) return;
  try {
    await supabaseServer.from('learn_content').upsert({
      id: `learn-${materialId}`,
      material_id: materialId,
      content_json: contentJson,
    }, { onConflict: 'material_id' });
  } catch (err) {
    console.warn('[Supabase saveLearnContent Exception]', err);
  }
}

/**
 * Saves AI-generated Quiz Questions
 */
export async function saveQuizToSupabase(materialId, questionsJson) {
  if (!supabaseServer) return;
  try {
    await supabaseServer.from('quizzes').upsert({
      id: `quiz-${materialId}`,
      material_id: materialId,
      questions_json: questionsJson,
    }, { onConflict: 'material_id' });
  } catch (err) {
    console.warn('[Supabase saveQuiz Exception]', err);
  }
}

/**
 * Saves AI-generated Visual Episodes
 */
export async function saveVisualsToSupabase(materialId, visualsJson) {
  if (!supabaseServer) return;
  try {
    await supabaseServer.from('visuals').upsert({
      id: `visuals-${materialId}`,
      material_id: materialId,
      visuals_json: visualsJson,
    }, { onConflict: 'material_id' });
  } catch (err) {
    console.warn('[Supabase saveVisuals Exception]', err);
  }
}

/**
 * Saves topic variant ("Simplify" or "Go deeper")
 */
export async function saveTopicVariantToSupabase(materialId, topicId, mode, contentJson) {
  if (!supabaseServer) return;
  try {
    await supabaseServer.from('topic_variants').upsert({
      id: `var-${materialId}-${topicId}-${mode}`,
      material_id: materialId,
      topic_id: topicId,
      mode,
      content_json: contentJson,
    }, { onConflict: 'material_id,topic_id,mode' });
  } catch (err) {
    console.warn('[Supabase saveTopicVariant Exception]', err);
  }
}

/**
 * Fetches all materials from Supabase with their associated AI content
 */
export async function fetchAllMaterialsFromSupabase(subjectId) {
  if (!supabaseServer) return null;
  try {
    let query = supabaseServer.from('materials').select(`
      *,
      learn_content (*),
      quizzes (*),
      visuals (*),
      topic_variants (*)
    `).order('created_at', { ascending: false });

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    const { data, error } = await query;
    if (error || !data) return null;

    return data.map((row) => {
      const learnRow = Array.isArray(row.learn_content) ? row.learn_content[0] : row.learn_content;
      const quizRow = Array.isArray(row.quizzes) ? row.quizzes[0] : row.quizzes;
      const visualsRow = Array.isArray(row.visuals) ? row.visuals[0] : row.visuals;

      const learnData = learnRow?.content_json || null;
      const quizQuestions = quizRow?.questions_json || [];
      const visualEpisodes = visualsRow?.visuals_json || [];

      // Re-apply any saved topic variants into learnData
      if (learnData && Array.isArray(learnData.topics) && Array.isArray(row.topic_variants)) {
        row.topic_variants.forEach((v) => {
          if (learnData.topics[v.topic_id]) {
            learnData.topics[v.topic_id] = v.content_json;
          }
        });
      }

      return {
        id: row.id,
        subjectId: row.subject_id,
        title: row.title,
        chapterTitle: row.title,
        originalFilename: row.file_name || row.title,
        filePath: row.file_url || '',
        fileType: row.file_type || 'pptx',
        fileSize: Number(row.file_size) || 0,
        totalPages: Number(row.total_pages) || 0,
        uploadedAt: row.created_at,
        lastOpenedAt: row.last_opened_at || row.created_at,
        status: row.status || 'ready',
        masteryScore: 0,
        rawSlides: row.raw_slides_json || [],
        learnData: learnData || undefined,
        quizQuestions: quizQuestions.length > 0 ? quizQuestions : undefined,
        visualEpisodes: visualEpisodes.length > 0 ? visualEpisodes : undefined,
        learnStatus: learnData ? 'ready' : 'new',
        quizStatus: quizQuestions.length > 0 ? 'ready' : 'new',
        visualStatus: visualEpisodes.length > 0 ? 'ready' : 'new',
        sections: [],
        learnOverview: {
          bigPicture: learnData?.big_idea || '',
          roadmap: [],
          quickRecap: learnData?.takeaways || [],
          miniMemoryAids: [],
        },
        concepts: [],
      };
    });
  } catch (err) {
    console.warn('[Supabase fetchAllMaterials Exception]', err);
    return null;
  }
}
