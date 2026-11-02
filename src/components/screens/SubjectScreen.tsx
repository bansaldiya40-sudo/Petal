import React, { useState, useEffect } from 'react';
import { SubjectId, Lesson, Concept, Material } from '../../types';
import { SUBJECTS } from '../../utils/subjects';
import { LavenderFairyTower, MintTreehouseLibrary, GoldenHoneyMarketStall } from '../illustrations/Landmarks';
import { MaterialPage } from '../material/MaterialPage';
import { SeedPouchModal } from '../modals/SeedPouchModal';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { recordMaterialOpened } from '../../services/api';
import {
  ArrowLeft,
  Sparkles,
  Flower2,
  Trash2,
  BookOpen,
  FileQuestion,
  Film,
  Layers,
  ArrowRight,
  Upload,
} from 'lucide-react';

interface SubjectScreenProps {
  subjectId: SubjectId;
  lessons: Lesson[];
  onBackToHome: () => void;
  onLessonCreated: (lessons: Lesson[]) => void;
  onDeleteLesson: (lessonId: string) => void;
  onConceptBloomed?: (concept: Concept) => void;
  onRefreshMaterials?: () => Promise<void>;
  reducedMotion?: boolean;
}

function toTitleCase(str: string): string {
  if (!str) return '';
  const clean = str.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  const minorWords = new Set(['and', 'or', 'the', 'a', 'an', 'in', 'on', 'of', 'for', 'to', 'at', 'by', 'vs', 'with']);
  return clean
    .toLowerCase()
    .split(' ')
    .map((word, idx) => {
      if (idx > 0 && minorWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

type SortOption = 'oldest' | 'newest' | 'name' | 'recently_opened';

export const SubjectScreen: React.FC<SubjectScreenProps> = ({
  subjectId,
  lessons,
  onBackToHome,
  onLessonCreated,
  onDeleteLesson,
  onRefreshMaterials,
  reducedMotion = false,
}) => {
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState<boolean>(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('oldest');

  const subject = SUBJECTS[subjectId];
  const subjectMaterials = (lessons as Material[]).filter((l) => l.subjectId === subjectId);

  const sortedMaterials = [...subjectMaterials].sort((a, b) => {
    if (sortBy === 'oldest') {
      return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
    }
    if (sortBy === 'newest') {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }
    if (sortBy === 'name') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'recently_opened') {
      const aTime = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : new Date(a.uploadedAt).getTime();
      const bTime = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : new Date(b.uploadedAt).getTime();
      return bTime - aTime;
    }
    return 0;
  });

  const handleOpenMaterial = (mat: Material) => {
    recordMaterialOpened(mat.id);
    setActiveMaterial(mat);
  };

  // Keep activeMaterial in sync when lessons update (e.g. from background generation poll)
  useEffect(() => {
    if (activeMaterial) {
      const updated = (lessons as Material[]).find((l) => l.id === activeMaterial.id);
      if (updated) {
        setActiveMaterial(updated);
      }
    }
  }, [lessons]);

  // If a material is open, render its Material Page
  if (activeMaterial) {
    return (
      <ErrorBoundary
        fallbackTitle="This page tripped over a root. Try again"
        onReset={async () => {
          if (onRefreshMaterials) await onRefreshMaterials();
        }}
      >
        <MaterialPage
          material={activeMaterial}
          subjectId={subjectId}
          onBackToSubject={() => setActiveMaterial(null)}
          onDeleteMaterial={(id) => {
            onDeleteLesson(id);
            setActiveMaterial(null);
          }}
          onRefreshMaterial={async () => {
            if (onRefreshMaterials) {
              await onRefreshMaterials();
            }
          }}
          reducedMotion={reducedMotion}
        />
      </ErrorBoundary>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] pt-6 pb-28 sm:pb-24 px-4 sm:px-8 md:px-12 max-w-6xl mx-auto flex flex-col justify-between">
      {/* Top Breadcrumb Back Link */}
      <div className="mb-4">
        <button
          onClick={onBackToHome}
          className="btn-storybook min-h-[48px] px-5 bg-[#FFF5E4] hover:bg-[#FFFDF0] border-2 border-[#E8D4B0] text-[#4A3566] text-[16px] shadow-sm inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5 text-[#855627]" />
          <span>Back to Garden Meadow</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* LIVELY SUBJECT HERO BANNER (The Subject's Realm)         */}
      {/* ======================================================== */}
      <div
        className={`w-full rounded-organic-lg p-6 sm:p-8 mb-8 border-[2.5px] shadow-[0_8px_0_#4B2A7B] relative overflow-hidden ${
          subjectId === 'pm2'
            ? 'bg-gradient-to-r from-[#EDE4FF] via-[#FFF5FA] to-[#D8C5FF] border-[#9B72CF]'
            : subjectId === 'mrm'
            ? 'bg-gradient-to-r from-[#D8F8F0] via-[#F0FFF9] to-[#B2EFE0] border-[#20C5B5]'
            : 'bg-gradient-to-r from-[#FFF0D4] via-[#FFF9EE] to-[#FFE0B2] border-[#FF9F43]'
        }`}
      >
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center md:text-left max-w-xl">
            {/* Subject Code Ribbon */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border-2 border-[#4B2A7B]/20 shadow-xs mb-3">
              <span className="w-3.5 h-3.5 rounded-full border border-[#4B2A7B]" style={{ backgroundColor: subject.accentHex }} />
              <span className="text-[14px] font-brand font-bold text-[#4B2A7B]">
                {subject.code} • {subject.characterName} {subject.characterTitle}
              </span>
            </div>

            <h1 className="font-brand font-bold text-3xl sm:text-4xl lg:text-[44px] text-[#4B2A7B] tracking-tight leading-tight mb-2">
              {subject.title}
            </h1>

            <p className="text-[17px] text-[#553874] font-body font-medium leading-[1.6] mb-4">
              {subject.description}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[15px] font-display font-semibold text-[#4B2A7B]">
              <span className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 border border-[#4B2A7B]/30 shadow-xs">
                <Layers className="w-4 h-4 text-[#855627]" />
                {subjectMaterials.length} {subjectMaterials.length === 1 ? 'Course Material' : 'Course Materials'}
              </span>
              <span className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 border border-[#4B2A7B]/30 shadow-xs">
                <Sparkles className="w-4 h-4 text-[#FF5FA2]" />
                3-Tab Study Pages Ready
              </span>
            </div>
          </div>

          {/* Large Hero Character Graphic */}
          <div className="w-48 sm:w-56 shrink-0 flex items-center justify-center animate-bob">
            {subjectId === 'pm2' && <LavenderFairyTower size={200} />}
            {subjectId === 'mrm' && <MintTreehouseLibrary size={200} />}
            {subjectId === 'microecon' && <GoldenHoneyMarketStall size={200} />}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MATERIALS LIST (One Clean Card Per Uploaded Deck)        */}
      {/* ======================================================== */}
      {subjectMaterials.length === 0 ? (
        /* Empty State */
        <div className="rounded-organic-lg p-10 sm:p-14 text-center bg-[#FFF5E4]/80 border-2 border-[#E8D4B0] shadow-storybook my-6">
          <div className="w-24 h-24 mx-auto mb-4 relative flex items-center justify-center animate-bob">
            <svg viewBox="0 0 80 80" className="w-20 h-20">
              <path d="M20 30 C20 18, 60 18, 60 30 L65 65 C65 72, 15 72, 15 65 Z" fill="#EAD7BA" stroke="#855627" strokeWidth="3.5" />
              <path d="M22 32 Q40 38 58 32" stroke="#855627" strokeWidth="3" />
              <circle cx="40" cy="35" r="4" fill="#F5A97D" stroke="#855627" strokeWidth="2" />
              <path d="M40 24 Q40 10 32 8" stroke="#1F8C4F" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M40 24 Q40 12 48 10" stroke="#1F8C4F" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </div>

          <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#4A3566] mb-2">
            This sanctuary soil is waiting for your syllabus
          </h3>

          <p className="text-[17px] text-[#6C538C] font-body max-w-lg mx-auto leading-[1.6] mb-6">
            Drop your lecture slides, reading PDFs, or notes into your seed pouch. Petal will transform every deck into a structured 3-tab Material page (Learn, Quiz, Visual).
          </p>

          <button
            onClick={() => setIsSeedModalOpen(true)}
            className="btn-storybook min-h-[52px] px-8 bg-gradient-to-r from-[#FFF0B8] to-[#FFD9C0] border-2 border-[#F5A97D] text-[#4A3566] text-[17px] shadow-storybook hover:shadow-storybook-hover inline-flex items-center gap-2.5"
          >
            <Flower2 className="w-5 h-5 text-[#E6B82E]" />
            <span>Plant your first notes</span>
          </button>
        </div>
      ) : (
        /* Populated State: Clean Material Cards */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#EADBBF]/60">
            <div>
              <h3 className="text-[20px] font-display font-bold text-[#4A3566]">
                Your Course Materials ({sortedMaterials.length})
              </h3>
              <span className="text-[14px] font-display font-semibold text-[#855627]">
                Tap any material to open its Learn, Quiz & Visual tabs
              </span>
            </div>

            {/* Storybook Sort Toggle */}
            <div className="flex items-center gap-2 bg-[#FFFBF4] border border-[#EADBBF] px-3 py-1.5 rounded-full shrink-0 shadow-xs">
              <span className="text-xs font-display font-bold text-[#855627]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-xs font-display font-bold text-[#4A3566] focus:outline-none cursor-pointer"
              >
                <option value="oldest">Upload Order (Oldest First)</option>
                <option value="newest">Upload Order (Newest First)</option>
                <option value="name">Name (A–Z)</option>
                <option value="recently_opened">Recently Opened</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {sortedMaterials.map((mat) => {
              const quizScore = mat.lastQuizScore;

              return (
                <div
                  key={mat.id}
                  onClick={() => handleOpenMaterial(mat)}
                  className="group p-5 sm:p-6 rounded-[28px] bg-white hover:bg-[#FFFDF9] border-[2.5px] border-[#4B2A7B]/20 hover:border-[#4B2A7B] shadow-[0_4px_0_#4B2A7B]/10 hover:shadow-[0_6px_0_#4B2A7B] transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Left: Title, Slide Count, File Details, Upload Date */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full bg-[#FFF5E4] border border-[#4B2A7B]/20 text-xs font-brand font-bold text-[#4B2A7B]">
                        🏷️ {mat.totalPages || 20} Slides • {mat.fileType?.toUpperCase()}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/90 border border-[#4B2A7B]/20 text-[11px] font-display font-semibold text-[#855627]">
                        📅 {new Date(mat.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-xs font-display font-semibold text-[#9B83BA] truncate max-w-[200px]">
                        {mat.fileName}
                      </span>
                    </div>

                    <h4 className="text-[22px] sm:text-[24px] font-brand font-bold text-[#4B2A7B] group-hover:text-[#FF5FA2] transition-colors leading-snug truncate">
                      {toTitleCase(mat.title)}
                    </h4>
                  </div>

                  {/* Middle: 3 Small Status Dots (Learn, Quiz, Visual) */}
                  <div className="flex items-center gap-4 sm:gap-6 bg-[#FFFBF4] px-4 py-2.5 rounded-2xl border-2 border-[#4B2A7B]/20 shrink-0">
                    {/* Dot 1: Learn */}
                    <div className="flex items-center gap-2 text-xs font-brand font-bold text-[#4B2A7B]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#31C48D] ring-2 ring-[#DEF7EC]" />
                      <BookOpen className="w-3.5 h-3.5 text-[#1F8C4F]" />
                      <span>Learn</span>
                    </div>

                    {/* Dot 2: Quiz */}
                    <div className="flex items-center gap-2 text-xs font-brand font-bold text-[#4B2A7B]">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          quizScore ? 'bg-[#31C48D] ring-2 ring-[#DEF7EC]' : 'bg-[#F59E0B] ring-2 ring-[#FEF3C7]'
                        }`}
                      />
                      <FileQuestion className="w-3.5 h-3.5 text-[#9B72CF]" />
                      <span>
                        Quiz {quizScore ? `(${quizScore.score}/${quizScore.total})` : ''}
                      </span>
                    </div>

                    {/* Dot 3: Visual */}
                    <div className="flex items-center gap-2 text-xs font-brand font-bold text-[#4B2A7B]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#31C48D] ring-2 ring-[#DEF7EC]" />
                      <Film className="w-3.5 h-3.5 text-[#FF7F66]" />
                      <span>Visual</span>
                    </div>
                  </div>

                  {/* Right: Open Button & Delete */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMaterial(mat);
                      }}
                      className="btn-storybook min-h-[44px] px-5 bg-gradient-to-r from-[#DBF5E7] to-[#FFF0B8] border-2 border-[#4B2A7B] text-[#1F8C4F] text-[15px] font-brand font-bold shadow-[0_3px_0_#4B2A7B] hover:translate-y-[-1px] transition-all flex items-center gap-1.5"
                    >
                      <span>Open Material</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMaterialToDelete(mat);
                      }}
                      className="w-10 h-10 rounded-full text-[#9B83BA] hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                      title="Pull this seed from the garden"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Pastel "Plant a New Seed" Button at Bottom-Right */}
      <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-30">
        <button
          onClick={() => setIsSeedModalOpen(true)}
          className="btn-storybook min-h-[48px] sm:min-h-[52px] px-5 sm:px-7 bg-gradient-to-r from-[#D9C8FF] via-[#FFD6E0] to-[#FFF0B8] border-2 border-[#B196F5] text-[#4A3566] text-[15px] sm:text-[17px] font-bold shadow-storybook-hover hover:scale-105 transition-all flex items-center gap-2"
          aria-label="Plant a new seed"
        >
          <Flower2 className="w-4 h-4 sm:w-5 h-5 text-[#9670F5] animate-spin" style={{ animationDuration: '10s' }} />
          <span>Plant a seed</span>
        </button>
      </div>

      {/* Seed Pouch Upload Modal */}
      <SeedPouchModal
        subjectId={subjectId}
        isOpen={isSeedModalOpen}
        onClose={() => setIsSeedModalOpen(false)}
        onUploadComplete={(newLessons) => {
          onLessonCreated(newLessons);
        }}
      />

      {/* Delete Seed Confirmation Modal */}
      {materialToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FFF9F2]/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-organic-md bg-[#FFF5E4] border-2 border-[#855627] p-6 shadow-storybook-hover">
            <h4 className="font-display font-bold text-[22px] text-[#4A3566] mb-2">
              Pull this seed from the garden?
            </h4>
            <p className="text-[17px] text-[#6C538C] font-body leading-[1.6] mb-5">
              This will remove "{materialToDelete.title}" and all its derived tabs permanently from your garden.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMaterialToDelete(null)}
                className="btn-storybook min-h-[48px] px-5 bg-white border border-[#E8D4B0] text-[#4A3566] text-[16px]"
              >
                Keep in garden
              </button>
              <button
                onClick={() => {
                  onDeleteLesson(materialToDelete.id);
                  setMaterialToDelete(null);
                }}
                className="btn-storybook min-h-[48px] px-5 bg-[#FFD6E0] border-2 border-[#F2A8BC] text-[#855627] font-bold text-[16px]"
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
