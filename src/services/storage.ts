import { get, set } from 'idb-keyval';
import { Lesson, SubjectId, UserLearningState, GardenPlant, Concept } from '../types';

const LESSONS_KEY = 'petal_lessons_v1';
const LEARNING_STATE_KEY = 'petal_learning_state_v1';
const SETTINGS_KEY = 'petal_settings_v1';

export interface AppSettings {
  llmProvider: 'gemini' | 'claude' | 'local';
  geminiKey?: string;
  claudeKey?: string;
  speechVoiceEnabled: boolean;
  speechRate: number;
}

const DEFAULT_LEARNING_STATE: UserLearningState = {
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  plants: [],
  weakConceptIds: [],
};

const DEFAULT_SETTINGS: AppSettings = {
  llmProvider: 'local',
  speechVoiceEnabled: true,
  speechRate: 1.0,
};

// --- Lessons Storage ---

export async function getAllLessons(): Promise<Lesson[]> {
  try {
    const lessons = await get<Lesson[]>(LESSONS_KEY);
    return lessons || [];
  } catch (err) {
    console.error('Failed to load lessons from IndexedDB', err);
    return [];
  }
}

export async function getLessonsBySubject(subjectId: SubjectId): Promise<Lesson[]> {
  const all = await getAllLessons();
  return all.filter((l) => l.subjectId === subjectId);
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const all = await getAllLessons();
  return all.find((l) => l.id === id) || null;
}

export async function saveLesson(lesson: Lesson): Promise<void> {
  const all = await getAllLessons();
  const index = all.findIndex((l) => l.id === lesson.id);
  if (index >= 0) {
    all[index] = lesson;
  } else {
    all.push(lesson);
  }
  await set(LESSONS_KEY, all);
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const all = await getAllLessons();
  const updated = all.filter((l) => l.id !== lessonId);
  await set(LESSONS_KEY, updated);
}

export async function updateConceptInLesson(
  lessonId: string,
  conceptId: string,
  updater: (concept: Concept) => Concept
): Promise<Concept | null> {
  const all = await getAllLessons();
  const lesson = all.find((l) => l.id === lessonId);
  if (!lesson) return null;

  const concept = lesson.concepts.find((c) => c.id === conceptId);
  if (!concept) return null;

  const updatedConcept = updater(concept);
  const conceptIdx = lesson.concepts.findIndex((c) => c.id === conceptId);
  lesson.concepts[conceptIdx] = updatedConcept;

  // recalculate lesson mastery
  const masteredCount = lesson.concepts.filter((c) => c.status === 'mastered' || c.status === 'bloomed').length;
  lesson.masteryScore = Math.round((masteredCount / Math.max(1, lesson.concepts.length)) * 100);
  if (lesson.masteryScore === 100) {
    lesson.status = 'mastered';
  } else if (lesson.masteryScore > 0) {
    lesson.status = 'in_progress';
  }

  await set(LESSONS_KEY, all);
  return updatedConcept;
}

// --- Learning State & Garden Storage ---

export async function getLearningState(): Promise<UserLearningState> {
  try {
    const state = await get<UserLearningState>(LEARNING_STATE_KEY);
    return state || DEFAULT_LEARNING_STATE;
  } catch (err) {
    return DEFAULT_LEARNING_STATE;
  }
}

export async function saveLearningState(state: UserLearningState): Promise<void> {
  await set(LEARNING_STATE_KEY, state);
}

export async function bloomNewPlantForConcept(concept: Concept): Promise<GardenPlant> {
  const state = await getLearningState();
  const flowerTypes: Record<string, string> = {
    pm2: 'lavender_orchid',
    mrm: 'mint_clover',
    microecon: 'golden_sunflower',
  };

  // Check if plant already exists for concept
  const existing = state.plants.find((p: GardenPlant) => p.conceptId === concept.id);
  if (existing) return existing;

  // Random gentle scatter in meadow
  const x = Math.floor(Math.random() * 80) + 10; // 10% - 90%
  const y = Math.floor(Math.random() * 60) + 25; // 25% - 85%

  const newPlant: GardenPlant = {
    id: `plant-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    conceptId: concept.id,
    conceptTitle: concept.title,
    subjectId: concept.subjectId,
    flowerType: flowerTypes[concept.subjectId] || 'mint_clover',
    bloomedAt: new Date().toISOString(),
    xPercent: x,
    yPercent: y,
    scale: 0.9 + Math.random() * 0.25,
  };

  state.plants.push(newPlant);
  await saveLearningState(state);
  return newPlant;
}

// --- App Settings (LLM Keys, Voice, etc.) ---

export async function getSettings(): Promise<AppSettings> {
  try {
    const s = await get<AppSettings>(SETTINGS_KEY);
    return { ...DEFAULT_SETTINGS, ...(s || {}) };
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await set(SETTINGS_KEY, settings);
}

// Clear all data (for resetting to empty state)
export async function clearAllLocalData(): Promise<void> {
  await set(LESSONS_KEY, []);
  await set(LEARNING_STATE_KEY, DEFAULT_LEARNING_STATE);
}
