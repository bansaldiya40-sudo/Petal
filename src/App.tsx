import React, { useState, useEffect } from 'react';
import { SubjectId, Lesson, Concept, GardenPlant } from './types';
import {
  fetchSettings,
  saveSettings,
  fetchLessons,
  deleteLesson,
  updateConceptStatus,
  fetchGarden,
  getCachedLessons,
  AppSettings,
} from './services/api';
import { TopNav } from './components/navigation/TopNav';
import { HomeScreen } from './components/screens/HomeScreen';
import { SubjectScreen } from './components/screens/SubjectScreen';
import { ProgressGardenScreen } from './components/screens/ProgressGardenScreen';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PetalEntranceMoment } from './components/brand/PetalEntranceMoment';
import { triggerPetalsCelebration } from './utils/confetti';

// Persistent storybook LMS with sacred data isolation outside project
export function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'subject' | 'progress'>(() => {
    return (localStorage.getItem('petal_current_screen') as any) || 'home';
  });
  const [activeSubjectId, setActiveSubjectId] = useState<SubjectId>(() => {
    return (localStorage.getItem('petal_active_subject') as SubjectId) || 'pm2';
  });
  const [activeLessonId, setActiveLessonId] = useState<string | null>(() => {
    return localStorage.getItem('petal_active_lesson') || null;
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => getCachedLessons());
  const [gardenData, setGardenData] = useState<{ streak: number; plants: GardenPlant[] }>({
    streak: 1,
    plants: [],
  });

  const [settings, setSettings] = useState<AppSettings>({
    userName: 'Diya',
    streak: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    llmProvider: 'gemini',
    speechVoiceEnabled: true,
    soundEffects: false,
    reducedMotion: false,
  });

  // Persist navigation states across browser reloads
  useEffect(() => {
    localStorage.setItem('petal_current_screen', currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    localStorage.setItem('petal_active_subject', activeSubjectId);
  }, [activeSubjectId]);

  useEffect(() => {
    if (activeLessonId) {
      localStorage.setItem('petal_active_lesson', activeLessonId);
    } else {
      localStorage.removeItem('petal_active_lesson');
    }
  }, [activeLessonId]);

  // Load persistent data from Supabase / SQLite backend on mount
  useEffect(() => {
    async function loadAllData() {
      const [fetchedSettings, fetchedLessons, fetchedGarden] = await Promise.all([
        fetchSettings(),
        fetchLessons(),
        fetchGarden(),
      ]);

      if (fetchedSettings) setSettings(fetchedSettings);
      if (fetchedLessons && fetchedLessons.length > 0) setLessons(fetchedLessons);
      if (fetchedGarden) setGardenData(fetchedGarden);
    }
    loadAllData();
  }, []);

  // Handlers
  const handleSelectSubject = (subjectId: SubjectId) => {
    setActiveSubjectId(subjectId);
    setActiveLessonId(null);
    setCurrentScreen('subject');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLesson = (lessonId: string) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (lesson) {
      setActiveSubjectId(lesson.subjectId);
      setActiveLessonId(lessonId);
      setCurrentScreen('subject');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLessonCreated = async (newLessons?: Lesson[]) => {
    // 1. Optimistic instant UI update
    if (newLessons && newLessons.length > 0) {
      setLessons((prev) => {
        const existingIds = new Set(prev.map((l) => l.id));
        const additions = newLessons.filter((l) => !existingIds.has(l.id));
        return [...additions, ...prev];
      });
    }
    // 2. Sync with cloud Supabase
    const updated = await fetchLessons();
    if (updated && updated.length > 0) {
      setLessons(updated);
    }
    triggerPetalsCelebration();
  };

  const handleDeleteLesson = async (lessonId: string) => {
    // 1. Optimistic removal for instant UI feedback
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    if (activeLessonId === lessonId) {
      setActiveLessonId(null);
    }
    // 2. Cascade delete from Supabase, cache, and backend
    await deleteLesson(lessonId);
    // 3. Sync with fresh collection
    const updated = await fetchLessons();
    if (updated) {
      setLessons(updated);
    }
  };

  const handleConceptBloomed = async (concept: Concept) => {
    await updateConceptStatus(concept.id, 'bloomed');
    // Refresh lessons & garden from SQLite backend
    const [updatedLessons, updatedGarden] = await Promise.all([
      fetchLessons(),
      fetchGarden(),
    ]);
    setLessons(updatedLessons);
    setGardenData(updatedGarden);
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleResetData = async () => {
    // Delete all lessons
    for (const l of lessons) {
      await deleteLesson(l.id);
    }
    const updated = await fetchLessons();
    const updatedGarden = await fetchGarden();
    setLessons(updated);
    setGardenData(updatedGarden);
    setCurrentScreen('home');
  };

  return (
    <PetalEntranceMoment reducedMotion={settings.reducedMotion}>
      <div className="min-h-screen flex flex-col justify-between selection:bg-[#D9C8FF]/40 text-[#4A3566]">
        {/* Top Illustrated Navigation (Logo + 3 Tokens on Right) */}
        <TopNav
          currentScreen={currentScreen}
          onNavigate={(screen) => {
            if (screen === 'home' || screen === 'progress') {
              setCurrentScreen(screen);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          streak={gardenData.streak}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onResetData={handleResetData}
        />

        {/* Main Screen Views */}
        <main className="flex-1">
          <ErrorBoundary fallbackTitle="This page tripped over a root. Try again">
            {currentScreen === 'home' && (
              <HomeScreen
                userName={settings.userName || 'Diya'}
                lessons={lessons}
                streak={gardenData.streak}
                onSelectSubject={handleSelectSubject}
                onOpenLesson={handleOpenLesson}
                onPlantSeed={(subId) => {
                  setActiveSubjectId(subId);
                  setCurrentScreen('subject');
                }}
              />
            )}

            {currentScreen === 'subject' && (
              <SubjectScreen
                subjectId={activeSubjectId}
                lessons={lessons}
                initialMaterialId={activeLessonId}
                onActiveMaterialChange={setActiveLessonId}
                onBackToHome={() => {
                  setActiveLessonId(null);
                  setCurrentScreen('home');
                }}
                onLessonCreated={handleLessonCreated}
                onDeleteLesson={handleDeleteLesson}
                onConceptBloomed={handleConceptBloomed}
                onRefreshMaterials={async () => {
                  const updated = await fetchLessons();
                  setLessons(updated);
                }}
              />
            )}

            {currentScreen === 'progress' && (
              <ProgressGardenScreen
                plants={gardenData.plants}
                streak={gardenData.streak}
                onPlantSeed={() => {
                  setActiveSubjectId('pm2');
                  setCurrentScreen('subject');
                }}
              />
            )}
          </ErrorBoundary>
        </main>
      </div>
    </PetalEntranceMoment>
  );
}

export default App;
