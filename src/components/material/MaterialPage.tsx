import React, { useState, useEffect } from 'react';
import { Material, SubjectId } from '../../types';
import { SUBJECTS } from '../../utils/subjects';
import { LearnTab } from './LearnTab';
import { QuizTab } from './QuizTab';
import { VisualTab } from './VisualTab';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { BunnyRig } from '../animator/characters/BunnyRig';
import { FairyRig } from '../animator/characters/FairyRig';
import { OwlRig } from '../animator/characters/OwlRig';
import {
  ArrowLeft,
  BookOpen,
  FileQuestion,
  Film,
  Sparkles,
  Trash2,
  Share2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { regenerateMaterial } from '../../services/api';

interface MaterialPageProps {
  material: Material;
  subjectId: SubjectId;
  onBackToSubject: () => void;
  onDeleteMaterial: (id: string) => void;
  onRefreshMaterial: () => Promise<void>;
  reducedMotion?: boolean;
}

export const MaterialPage: React.FC<MaterialPageProps> = ({
  material,
  subjectId,
  onBackToSubject,
  onDeleteMaterial,
  onRefreshMaterial,
  reducedMotion = false,
}) => {
  const [activeTab, setActiveTab] = useState<'learn' | 'quiz' | 'visual'>('learn');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  const handleRegenerate = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    try {
      await regenerateMaterial(material.id);
      await onRefreshMaterial();
    } catch (e) {
      console.error('[Regenerate Failed]', e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const subject = SUBJECTS[subjectId];

  // Auto-poll while any generation or queuing is active
  const isAnyProcessing =
    material.learnStatus === 'processing' ||
    material.learnStatus === 'queued' ||
    material.quizStatus === 'processing' ||
    material.quizStatus === 'queued' ||
    material.visualStatus === 'processing' ||
    material.visualStatus === 'queued';

  useEffect(() => {
    if (!isAnyProcessing) return;
    const interval = setInterval(() => {
      onRefreshMaterial().catch((e) => console.warn('Background poll error:', e));
    }, 2500);
    return () => clearInterval(interval);
  }, [isAnyProcessing, onRefreshMaterial]);

  return (
    <div className="relative min-h-screen bg-[#FFFDF8] text-[#3B234A] pb-24 selection:bg-[#D9C8FF]/40">
      {/* Decorative Corner Character Illustration */}
      <div className="fixed top-20 right-6 sm:right-12 z-0 opacity-25 pointer-events-none hidden md:block">
        {subjectId === 'pm2' && <FairyRig action="breathe" reducedMotion={reducedMotion} />}
        {subjectId === 'mrm' && <OwlRig action="breathe" reducedMotion={reducedMotion} />}
        {subjectId === 'microecon' && <BunnyRig action="breathe" reducedMotion={reducedMotion} />}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 relative z-10 space-y-6">
        {/* ======================================================== */}
        {/* TOP BACK BREADCRUMB & ACTIONS                            */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={onBackToSubject}
            className="btn-storybook min-h-[46px] px-5 bg-white hover:bg-[#FFFDF0] border-2 border-[#EADBBF] text-[#4A3566] text-[15px] font-bold shadow-xs inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-[#855627]" />
            <span>Back to {subject.title}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="btn-storybook min-h-[44px] px-4 bg-[#FAF5EE] hover:bg-[#F2E8D8] border-2 border-[#EADBBF] text-[#4A3566] text-xs font-display font-bold shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Regenerate all AI explanations, quizzes, and visuals from lecture slides"
            >
              {isRegenerating ? (
                <Loader2 className="w-4 h-4 text-[#855627] animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 text-[#855627]" />
              )}
              <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2.5 rounded-full text-[#855627] hover:text-red-500 hover:bg-red-50 border border-[#EADBBF] transition-colors"
              title="Delete this material"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MATERIAL HERO HEADER (40px Title, Chips)                 */}
        {/* ======================================================== */}
        <div className="space-y-3 pb-2">
          {/* Metadata Chips */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className="px-3.5 py-1 rounded-full text-xs font-display font-bold text-white shadow-xs"
              style={{ backgroundColor: subject.accentHex }}
            >
              {subject.code} • {subject.title}
            </span>

            <span className="px-3.5 py-1 rounded-full bg-white border border-[#EADBBF] text-xs font-display font-bold text-[#855627] shadow-2xs">
              🏷️ {material.totalPages} Slides • {material.fileType?.toUpperCase()}
            </span>

            <span className="px-3.5 py-1 rounded-full bg-[#DBF5E7] border border-[#83D9A7] text-xs font-display font-bold text-[#1F8C4F]">
              ✨ Grounded in Professor Slides
            </span>
          </div>

          {/* 40px Page Title in Deep Plum */}
          <h1 className="text-3xl sm:text-[40px] font-display font-bold text-[#3B234A] tracking-tight leading-tight">
            {material.title}
          </h1>
        </div>

        {/* ======================================================== */}
        {/* 3 LARGE STICKY PASTEL TABS (Min 52px tall, 18px text)    */}
        {/* ======================================================== */}
        <div className="sticky top-0 z-30 py-3 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#EADBBF]/60">
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto max-w-xl">
            {/* Tab 1: Learn */}
            <button
              onClick={() => {
                setActiveTab('learn');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 min-h-[52px] px-6 rounded-full text-[17px] sm:text-[18px] font-brand font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm ${
                activeTab === 'learn'
                  ? 'bg-gradient-to-r from-[#DBF5E7] to-[#FFF0B8] border-[2.5px] border-[#4B2A7B] text-[#1F8C4F] scale-105 shadow-[0_4px_0_#4B2A7B]'
                  : 'bg-white hover:bg-[#FFFDF0] border-2 border-[#4B2A7B]/20 text-[#4B2A7B]'
              }`}
            >
              <BookOpen className="w-5 h-5 text-current" />
              <span>Learn</span>
            </button>

            {/* Tab 2: Quiz */}
            <button
              onClick={() => {
                setActiveTab('quiz');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 min-h-[52px] px-6 rounded-full text-[17px] sm:text-[18px] font-brand font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm ${
                activeTab === 'quiz'
                  ? 'bg-gradient-to-r from-[#E7DCFF] to-[#FFD6E0] border-[2.5px] border-[#4B2A7B] text-[#6C3FE0] scale-105 shadow-[0_4px_0_#4B2A7B]'
                  : 'bg-white hover:bg-[#FFFDF0] border-2 border-[#4B2A7B]/20 text-[#4B2A7B]'
              }`}
            >
              <FileQuestion className="w-5 h-5 text-current" />
              <span>Quiz</span>
              {material.quizQuestions && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/90 text-current border border-current/20">
                  {material.quizQuestions.length} Qs
                </span>
              )}
            </button>

            {/* Tab 3: Visual */}
            <button
              onClick={() => {
                setActiveTab('visual');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 min-h-[52px] px-6 rounded-full text-[17px] sm:text-[18px] font-brand font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm ${
                activeTab === 'visual'
                  ? 'bg-gradient-to-r from-[#FFF0B8] to-[#FFD9C0] border-[2.5px] border-[#4B2A7B] text-[#855627] scale-105 shadow-[0_4px_0_#4B2A7B]'
                  : 'bg-white hover:bg-[#FFFDF0] border-2 border-[#4B2A7B]/20 text-[#4B2A7B]'
              }`}
            >
              <Film className="w-5 h-5 text-current" />
              <span>Visual</span>
              {material.visualEpisodes && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/90 text-current border border-current/20">
                  {material.visualEpisodes.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ACTIVE TAB CONTENT                                       */}
        {/* ======================================================== */}
        <div className="pt-4">
          {activeTab === 'learn' && (
            <ErrorBoundary
              fallbackTitle="This page tripped over a root. Try again"
              onReset={onRefreshMaterial}
            >
              <LearnTab
                material={material}
                subjectId={subjectId}
                onRefreshMaterial={onRefreshMaterial}
                reducedMotion={reducedMotion}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'quiz' && (
            <ErrorBoundary
              fallbackTitle="This quiz tripped over a root. Try again"
              onReset={onRefreshMaterial}
            >
              <QuizTab
                material={material}
                subjectId={subjectId}
                onRefreshMaterial={onRefreshMaterial}
                reducedMotion={reducedMotion}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'visual' && (
            <ErrorBoundary
              fallbackTitle="This visual studio tripped over a root. Try again"
              onReset={onRefreshMaterial}
            >
              <VisualTab
                material={material}
                subjectId={subjectId}
                onRefreshMaterial={onRefreshMaterial}
                reducedMotion={reducedMotion}
              />
            </ErrorBoundary>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FFF9F2]/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#FFF5E4] border-2 border-[#855627] p-6 shadow-storybook-hover">
            <h4 className="font-display font-bold text-[22px] text-[#4A3566] mb-2">
              Pull this seed from the garden?
            </h4>
            <p className="text-[17px] text-[#6C538C] font-body leading-[1.6] mb-5">
              This will permanently delete "{material.title}", its 3 tabs (Learn, Quiz, Visual), and your quiz attempts.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-storybook min-h-[46px] px-5 bg-white border border-[#EADBBF] text-[#4A3566] text-[15px]"
              >
                Keep in garden
              </button>
              <button
                onClick={() => {
                  onDeleteMaterial(material.id);
                  setShowDeleteConfirm(false);
                }}
                className="btn-storybook min-h-[46px] px-5 bg-[#FFD6E0] border-2 border-[#F2A8BC] text-[#855627] font-bold text-[15px]"
              >
                Pull seed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
