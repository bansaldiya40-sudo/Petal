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
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies (Idempotent)
DROP POLICY IF EXISTS "Public Read Materials Bucket" ON storage.objects;
CREATE POLICY "Public Read Materials Bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'materials');

DROP POLICY IF EXISTS "Allow Upload to Materials Bucket" ON storage.objects;
CREATE POLICY "Allow Upload to Materials Bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'materials');

DROP POLICY IF EXISTS "Allow Delete from Materials Bucket" ON storage.objects;
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

-- 1. Subjects Policy
DROP POLICY IF EXISTS "Access subjects" ON public.subjects;
CREATE POLICY "Access subjects" ON public.subjects
    FOR ALL
    USING (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid())
    WITH CHECK (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid());

-- 2. Materials Policy
DROP POLICY IF EXISTS "Access materials" ON public.materials;
CREATE POLICY "Access materials" ON public.materials
    FOR ALL
    USING (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid())
    WITH CHECK (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid());

-- 3. Learn Content Policy
DROP POLICY IF EXISTS "Access learn_content" ON public.learn_content;
CREATE POLICY "Access learn_content" ON public.learn_content
    FOR ALL
    USING (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid())
    WITH CHECK (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid());

-- 4. Quizzes Policy
DROP POLICY IF EXISTS "Access quizzes" ON public.quizzes;
CREATE POLICY "Access quizzes" ON public.quizzes
    FOR ALL
    USING (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid())
    WITH CHECK (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid());

-- 5. Visuals Policy
DROP POLICY IF EXISTS "Access visuals" ON public.visuals;
CREATE POLICY "Access visuals" ON public.visuals
    FOR ALL
    USING (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid())
    WITH CHECK (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid());

-- 6. Topic Variants Policy
DROP POLICY IF EXISTS "Access topic_variants" ON public.topic_variants;
CREATE POLICY "Access topic_variants" ON public.topic_variants
    FOR ALL
    USING (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid())
    WITH CHECK (auth.uid() IS NULL OR user_id IS NULL OR user_id = auth.uid());

-- =====================================================================
-- 9. PERMISSIONS GRANTS (Allows anon and authenticated clients access)
-- =====================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
