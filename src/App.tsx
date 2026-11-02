import React, { useState, useEffect } from 'react';
import { SubjectId, Lesson, Concept, GardenPlant } from './types';
import {
  fetchSettings,
  saveSettings,
  fetchLessons,
  deleteLesson,
  updateConceptStatus,
  fetchGarden,
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
  const [currentScreen, setCurrentScreen] = useState<'home' | 'subject' | 'progress'>('home');
  const [activeSubjectId, setActiveSubjectId] = useState<SubjectId>('pm2');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  const [lessons, setLessons] = useState<Lesson[]>([]);
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

  // Load persistent data from SQLite backend on mount
  useEffect(() => {
    async function loadAllData() {
      const [fetchedSettings, fetchedLessons, fetchedGarden] = await Promise.all([
        fetchSettings(),
        fetchLessons(),
        fetchGarden(),
      ]);

      if (fetchedSettings) setSettings(fetchedSettings);
      if (fetchedLessons) setLessons(fetchedLessons);
      if (fetchedGarden) setGardenData(fetchedGarden);
    }
    loadAllData();
  }, []);

  // Handlers
  const handleSelectSubject = (subjectId: SubjectId) => {
    setActiveSubjectId(subjectId);
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

  const handleLessonCreated = async () => {
    const updated = await fetchLessons();
    setLessons(updated);
    triggerPetalsCelebration();
  };

  const handleDeleteLesson = async (lessonId: string) => {
    await deleteLesson(lessonId);
    const updated = await fetchLessons();
    setLessons(updated);
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
                onBackToHome={() => setCurrentScreen('home')}
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
