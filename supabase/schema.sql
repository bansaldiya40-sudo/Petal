-- =====================================================================
-- PETAL SUPABASE POSTGRESQL & STORAGE SCHEMA
-- =====================================================================
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()
);

-- Seed Default Subjects
INSERT INTO public.subjects (id, name) VALUES
    ('pm2', 'Product Management 2'),
    ('mrm', 'Market Research Methods'),
    ('microecon', 'Microeconomics')
ON CONFLICT (id) DO NOTHING;

-- 3. MATERIALS TABLE (Lectures, PPTX, PDF, Notes)
CREATE TABLE IF NOT EXISTS public.materials (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT,
    file_name TEXT,
    file_type TEXT,
    file_size BIGINT DEFAULT 0,
    total_pages INTEGER DEFAULT 0,
    extracted_text TEXT,
    raw_slides_json JSONB,
    status TEXT DEFAULT 'ready',
    last_opened_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()
);

-- 4. LEARN CONTENT TABLE (AI-generated Topics, Key Concepts, Big Idea, Takeaways)
CREATE TABLE IF NOT EXISTS public.learn_content (
    id TEXT PRIMARY KEY,
    material_id TEXT NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    content_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    CONSTRAINT unique_material_learn UNIQUE (material_id)
);

-- 5. QUIZZES TABLE (AI-generated MCQ Questions & Explanations)
CREATE TABLE IF NOT EXISTS public.quizzes (
    id TEXT PRIMARY KEY,
    material_id TEXT NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    questions_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    CONSTRAINT unique_material_quiz UNIQUE (material_id)
);

-- 6. VISUALS TABLE (AI-generated 8 Animated Episodes & Scenes)
CREATE TABLE IF NOT EXISTS public.visuals (
    id TEXT PRIMARY KEY,
    material_id TEXT NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    visuals_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    CONSTRAINT unique_material_visuals UNIQUE (material_id)
);

-- 7. TOPIC VARIANTS TABLE (Saved "Simplify" Everyday Analogies & "Go deeper" PM Lens)
CREATE TABLE IF NOT EXISTS public.topic_variants (
    id TEXT PRIMARY KEY,
    material_id TEXT NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('simplify', 'deeper')),
    content_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    CONSTRAINT unique_topic_variant UNIQUE (material_id, topic_id, mode)
);

-- 8. STORAGE BUCKET: materials (for raw PPT, PDF, DOCX uploads)
-- Note: Supabase Storage bucket creation
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policy: Allow public read
CREATE POLICY "Public Read Materials Bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'materials');

-- Storage Policy: Allow upload
CREATE POLICY "Allow Upload to Materials Bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'materials');

-- Storage Policy: Allow delete
CREATE POLICY "Allow Delete from Materials Bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'materials');

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_variants ENABLE ROW LEVEL SECURITY;

-- Permissive policy allowing users to read & write their own data,
-- or fallback to public/demo rows when user_id is NULL or anonymous.
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('subjects', 'materials', 'learn_content', 'quizzes', 'visuals', 'topic_variants')
    LOOP
        EXECUTE format('
            DROP POLICY IF EXISTS "Users can read own or shared %I" ON public.%I;
            CREATE POLICY "Users can read own or shared %I" ON public.%I
            FOR SELECT USING (
                auth.uid() IS NULL 
                OR user_id IS NULL 
                OR user_id = auth.uid()
            );

            DROP POLICY IF EXISTS "Users can insert own %I" ON public.%I;
            CREATE POLICY "Users can insert own %I" ON public.%I
            FOR INSERT WITH CHECK (
                auth.uid() IS NULL 
                OR user_id IS NULL 
                OR user_id = auth.uid()
            );

            DROP POLICY IF EXISTS "Users can update own %I" ON public.%I;
            CREATE POLICY "Users can update own %I" ON public.%I
            FOR UPDATE USING (
                auth.uid() IS NULL 
                OR user_id IS NULL 
                OR user_id = auth.uid()
            );

            DROP POLICY IF EXISTS "Users can delete own %I" ON public.%I;
            CREATE POLICY "Users can delete own %I" ON public.%I
            FOR DELETE USING (
                auth.uid() IS NULL 
                OR user_id IS NULL 
                OR user_id = auth.uid()
            );
        ', t, t, t, t, t, t, t, t);
    END LOOP;
END $$;
