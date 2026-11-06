// src/services/supabase.ts
// Supabase client and data service for Petal persistence, storage, and authentication.
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Material, LearnData, MaterialQuizQuestion, MaterialVisualEpisode, LearnTopic } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// -------------------------------------------------------------
// 1. AUTHENTICATION HELPERS
// -------------------------------------------------------------

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user || null;
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured yet');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured yet');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase is not configured yet');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!supabase) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => subscription.unsubscribe();
}

// -------------------------------------------------------------
// 2. STORAGE (Upload original PPT / PDF / DOCX)
// -------------------------------------------------------------

export async function uploadFileToSupabaseStorage(
  file: File,
  materialId: string
): Promise<string | null> {
  if (!supabase) return null;
  try {
    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${materialId}/${Date.now()}_${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('[Supabase Storage Upload Error]', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('materials').getPublicUrl(filePath);
    return data.publicUrl || null;
  } catch (err) {
    console.warn('[Supabase Storage Exception]', err);
    return null;
  }
}

// -------------------------------------------------------------
// 3. MATERIALS (PostgreSQL)
// -------------------------------------------------------------

export async function fetchMaterialsFromSupabase(subjectId?: string): Promise<Material[]> {
  if (!supabase) return [];
  try {
    let query = supabase.from('materials').select(`
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
    if (error) {
      console.warn('[Supabase fetchMaterials Error]', error);
      return [];
    }

    return (data || []).map((row) => mapSupabaseRowToMaterial(row));
  } catch (err) {
    console.warn('[Supabase fetchMaterials Exception]', err);
    return [];
  }
}

export async function fetchSingleMaterialFromSupabase(materialId: string): Promise<Material | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('materials')
      .select(`
        *,
        learn_content (*),
        quizzes (*),
        visuals (*),
        topic_variants (*)
      `)
      .eq('id', materialId)
      .single();

    if (error || !data) return null;
    return mapSupabaseRowToMaterial(data);
  } catch {
    return null;
  }
}

export async function saveMaterialToSupabase(material: Partial<Material> & { id: string; subjectId: any; title: string }) {
  if (!supabase) return;
  const user = await getCurrentUser();
  await supabase.from('materials').upsert({
    id: material.id,
    subject_id: material.subjectId,
    title: material.title,
    file_url: material.filePath || null,
    file_name: material.fileName || (material as any).originalFilename || material.title,
    file_type: material.fileType || 'pptx',
    file_size: material.fileSize || 0,
    total_pages: material.totalPages || 0,
    extracted_text: material.rawSlides?.map((s: any) => `${s.title}\n${s.content}`).join('\n\n') || '',
    raw_slides_json: material.rawSlides || [],
    status: material.status || 'ready',
    last_opened_at: new Date().toISOString(),
    user_id: user?.id || null,
  });
}

// -------------------------------------------------------------
// 4. SAVE & LOAD AI-GENERATED CONTENT (Cache-First)
// -------------------------------------------------------------

export async function saveLearnContentToSupabase(materialId: string, learnData: LearnData) {
  if (!supabase) return;
  const user = await getCurrentUser();
  await supabase.from('learn_content').upsert({
    id: `learn-${materialId}`,
    material_id: materialId,
    content_json: learnData,
    user_id: user?.id || null,
  }, { onConflict: 'material_id' });
}

export async function saveQuizToSupabase(materialId: string, questions: MaterialQuizQuestion[]) {
  if (!supabase) return;
  const user = await getCurrentUser();
  await supabase.from('quizzes').upsert({
    id: `quiz-${materialId}`,
    material_id: materialId,
    questions_json: questions,
    user_id: user?.id || null,
  }, { onConflict: 'material_id' });
}

export async function saveVisualsToSupabase(materialId: string, visuals: MaterialVisualEpisode[]) {
  if (!supabase) return;
  const user = await getCurrentUser();
  await supabase.from('visuals').upsert({
    id: `visuals-${materialId}`,
    material_id: materialId,
    visuals_json: visuals,
    user_id: user?.id || null,
  }, { onConflict: 'material_id' });
}

export async function saveTopicVariantToSupabase(
  materialId: string,
  topicId: number,
  mode: 'simplify' | 'deeper',
  content: LearnTopic
) {
  if (!supabase) return;
  const user = await getCurrentUser();
  await supabase.from('topic_variants').upsert({
    id: `var-${materialId}-${topicId}-${mode}`,
    material_id: materialId,
    topic_id: topicId,
    mode,
    content_json: content,
    user_id: user?.id || null,
  }, { onConflict: 'material_id,topic_id,mode' });
}

export async function fetchTopicVariantsFromSupabase(materialId: string): Promise<Record<number, LearnTopic>> {
  if (!supabase) return {};
  try {
    const { data } = await supabase
      .from('topic_variants')
      .select('*')
      .eq('material_id', materialId);

    const variants: Record<number, LearnTopic> = {};
    (data || []).forEach((row) => {
      variants[row.topic_id] = row.content_json;
    });
    return variants;
  } catch {
    return {};
  }
}

// -------------------------------------------------------------
// 5. MAPPER HELPER (Supabase Rows -> Petal Material Type)
// -------------------------------------------------------------

function mapSupabaseRowToMaterial(row: any): Material {
  const learnContentRow = Array.isArray(row.learn_content) ? row.learn_content[0] : row.learn_content;
  const quizRow = Array.isArray(row.quizzes) ? row.quizzes[0] : row.quizzes;
  const visualsRow = Array.isArray(row.visuals) ? row.visuals[0] : row.visuals;

  const learnData: LearnData | null = learnContentRow?.content_json || null;
  const quizQuestions: MaterialQuizQuestion[] = quizRow?.questions_json || [];
  const visualEpisodes: MaterialVisualEpisode[] = visualsRow?.visuals_json || [];

  return {
    id: row.id,
    subjectId: row.subject_id,
    title: row.title,
    fileName: row.file_name || row.title,
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
    quizQuestions: quizQuestions,
    visualEpisodes: visualEpisodes,
    quizAttempts: [],
    learnStatus: learnData ? 'ready' : 'empty',
    quizStatus: quizQuestions.length > 0 ? 'ready' : 'empty',
    visualStatus: visualEpisodes.length > 0 ? 'ready' : 'empty',
    sections: [],
    learnOverview: {
      bigPicture: learnData?.big_idea || '',
      roadmap: [],
      quickRecap: learnData?.key_takeaways || [],
      miniMemoryAids: [],
    },
    concepts: [],
  };
}
