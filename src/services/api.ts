import {
  Lesson,
  Material,
  LearnTopic,
  Concept,
  GardenPlant,
  SubjectId,
  Storyboard,
  ClipMeta,
  VideoSpendInfo,
  ExplainerSummary,
} from '../types';

export interface AppSettings {
  userName: string;
  streak: number;
  lastActiveDate: string;
  llmProvider: 'gemini' | 'claude';
  speechVoiceEnabled: boolean;
  soundEffects: boolean;
  reducedMotion: boolean;
  geminiKey?: string;
  hasGeminiKey?: boolean;
  claudeKey?: string;
  hasClaudeKey?: boolean;
  videoProvider?: string;
  videoModel?: string;
  videoApiKey?: string;
  hasVideoApiKey?: boolean;
  dailySpendCapUsd?: string | number;
  pricePerSecondUsd?: string | number;
  ttsProvider?: string;
}

export async function testAiConnection(engine = 'gemini'): Promise<{ connected: boolean; model?: string; error?: string; latencyMs?: number }> {
  try {
    const res = await fetch('/api/ai/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ engine }),
    });
    return await res.json();
  } catch (err: any) {
    return { connected: false, error: err.message || 'Network connection failed' };
  }
}

export async function checkVideoModel(model: string): Promise<{ exists: boolean; message: string; model?: string }> {
  try {
    const res = await fetch('/api/ai/check-video-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model }),
    });
    return await res.json();
  } catch (err: any) {
    return { exists: false, message: err.message || 'Failed to check model' };
  }
}

export async function fetchAiLogs(): Promise<{ logs: any[]; last: any }> {
  try {
    const res = await fetch('/api/ai/logs');
    if (!res.ok) return { logs: [], last: null };
    return await res.json();
  } catch {
    return { logs: [], last: null };
  }
}

export async function regenerateMaterial(id: string, tab: 'learn' | 'quiz' | 'visual' | 'all' = 'all'): Promise<any> {
  const res = await fetch(`/api/materials/${id}/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tab }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to regenerate material');
  }
  return await res.json();
}

export async function regenerateSection(id: string, sectionId: string): Promise<any> {
  const res = await fetch(`/api/materials/${id}/sections/${sectionId}/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to regenerate section');
  }
  return await res.json();
}

export async function adjustTopicLevel(
  materialId: string,
  topicIndex: number,
  mode: 'simplify' | 'deeper'
): Promise<{ success: boolean; topic: LearnTopic; material: Material }> {
  const doRequest = async () => {
    const res = await fetch(`/api/materials/${materialId}/topics/${topicIndex}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    if (!res.ok) {
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`RETRYABLE_${res.status}`);
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to adjust topic (${res.status})`);
    }
    return await res.json();
  };

  try {
    return await doRequest();
  } catch (err: any) {
    if (err?.message?.startsWith('RETRYABLE_')) {
      console.warn(`[adjustTopicLevel] Retrying after ${err.message}...`);
      await new Promise((r) => setTimeout(r, 1500));
      return await doRequest();
    }
    throw err;
  }
}

export async function fetchMaterialStatus(id: string): Promise<{
  id: string;
  learnStatus: string;
  quizStatus: string;
  visualStatus: string;
  errorReason?: string;
  progress?: { phase?: string; current?: number; total?: number; message?: string; percentage?: number } | null;
}> {
  const res = await fetch(`/api/materials/${id}/status`);
  if (!res.ok) throw new Error('Status fetch failed');
  return await res.json();
}

export async function fetchSettings(): Promise<AppSettings> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Settings fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('Fallback to local settings', err);
    return {
      userName: 'Diya',
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      llmProvider: 'gemini',
      speechVoiceEnabled: true,
      soundEffects: false,
      reducedMotion: false,
    };
  }
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
}

export async function fetchLessons(subjectId?: SubjectId): Promise<Lesson[]> {
  try {
    const url = subjectId ? `/api/lessons?subjectId=${subjectId}` : '/api/lessons';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Lessons fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('Error fetching lessons', err);
    return [];
  }
}

export async function fetchLessonById(id: string): Promise<Lesson | null> {
  try {
    const res = await fetch(`/api/lessons/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function uploadMaterials(files: File[], subjectId: SubjectId): Promise<Lesson[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  formData.append('subjectId', subjectId);

  const res = await fetch('/api/lessons/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Upload failed');
  }

  const data = await res.json();
  // Fetch all lessons across subjects to maintain complete state
  return await fetchLessons();
}

export interface DataStorageInfo {
  dataDir: string;
  totalMaterials: number;
  backupsCount: number;
  lastBackup: string | null;
}

export async function fetchDataStorageInfo(): Promise<DataStorageInfo | null> {
  try {
    const res = await fetch('/api/data/info');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function triggerManualBackup(): Promise<{ success: boolean; backupName?: string }> {
  try {
    const res = await fetch('/api/data/backup', { method: 'POST' });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function recordMaterialOpened(materialId: string): Promise<void> {
  try {
    await fetch(`/api/materials/${materialId}/opened`, { method: 'PATCH' });
  } catch {}
}

export async function updateLessonTitle(lessonId: string, newTitle: string): Promise<void> {
  await fetch(`/api/lessons/${lessonId}/title`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: newTitle }),
  });
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await fetch(`/api/lessons/${lessonId}`, {
    method: 'DELETE',
  });
}

export async function updateConceptStatus(conceptId: string, status: 'locked' | 'current' | 'bloomed'): Promise<void> {
  await fetch(`/api/concepts/${conceptId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function submitQuizAttempt(
  materialId: string,
  attempt: {
    score: number;
    totalQuestions: number;
    weakSections: any[];
    missedQuestionIds: string[];
  }
): Promise<any> {
  const res = await fetch(`/api/materials/${materialId}/quiz/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attempt),
  });
  return await res.json();
}

export async function generateMoreQuizQuestions(materialId: string): Promise<any> {
  const res = await fetch(`/api/materials/${materialId}/quiz/more`, {
    method: 'POST',
  });
  return await res.json();
}

export async function updateSectionLevel(
  materialId: string,
  sectionId: string,
  level: 'standard' | 'simple' | 'deep'
): Promise<any> {
  const res = await fetch(`/api/materials/${materialId}/sections/${sectionId}/level`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level }),
  });
  return await res.json();
}

export async function askSectionQuestion(
  materialId: string,
  sectionId: string,
  question: string
): Promise<{ answer: string; sourceChip: string; sectionTitle: string }> {
  const res = await fetch(`/api/materials/${materialId}/sections/${sectionId}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  return await res.json();
}

export async function fetchGarden(): Promise<{ streak: number; plants: GardenPlant[] }> {
  try {
    const res = await fetch('/api/garden');
    if (!res.ok) throw new Error('Garden fetch failed');
    return await res.json();
  } catch (err) {
    return { streak: 1, plants: [] };
  }
}

export function exportBackupUrl(): string {
  return '/api/backup/export';
}

export async function importBackupFile(file: File): Promise<void> {
  const text = await file.text();
  const json = JSON.parse(text);
  const res = await fetch('/api/backup/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(json),
  });
  if (!res.ok) throw new Error('Failed to import backup');
}

// ========================================================
// CONCEPT ANIMATOR (Track 1 & Track 2) API CLIENT
// ========================================================

export async function fetchStoryboard(conceptId: string, force = false): Promise<Storyboard> {
  const res = await fetch(`/api/concepts/${conceptId}/storyboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ force }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch storyboard');
  }
  return await res.json();
}

export async function regenerateStoryboard(conceptId: string): Promise<Storyboard> {
  const res = await fetch(`/api/concepts/${conceptId}/storyboard/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to regenerate storyboard');
  }
  return await res.json();
}

export async function fetchClips(conceptId: string): Promise<ClipMeta[]> {
  try {
    const res = await fetch(`/api/clips/${conceptId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchSpendInfo(): Promise<VideoSpendInfo> {
  const res = await fetch('/api/clips/spend');
  if (!res.ok) throw new Error('Failed to fetch spend info');
  return await res.json();
}

export async function generateVideoClip(conceptId: string, durationSeconds = 20): Promise<ClipMeta> {
  const res = await fetch('/api/clips/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conceptId, durationSeconds }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate video clip');
  }
  return await res.json();
}

export async function deleteVideoClip(clipId: string): Promise<void> {
  const res = await fetch(`/api/clips/${clipId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete clip');
}

export async function fetchRecentExplainers(): Promise<ExplainerSummary[]> {
  try {
    const res = await fetch('/api/explainers/recent');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

