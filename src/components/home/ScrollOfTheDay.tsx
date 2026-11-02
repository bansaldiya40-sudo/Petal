import React, { useState, useEffect } from 'react';
import { Concept, Lesson, ExplainerSummary } from '../../types';
import { fetchRecentExplainers } from '../../services/api';
import { Sparkles, X, BookOpen, Play, HelpCircle, Flower2, Film, Clock } from 'lucide-react';

interface ScrollOfTheDayProps {
  lessons: Lesson[];
  onOpenLesson: (lessonId: string, conceptId?: string) => void;
  onPlantSeed: () => void;
}

export const ScrollOfTheDay: React.FC<ScrollOfTheDayProps> = ({
  lessons,
  onOpenLesson,
  onPlantSeed,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentExplainers, setRecentExplainers] = useState<ExplainerSummary[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchRecentExplainers().then(setRecentExplainers).catch(() => {});
    }
  }, [isOpen]);

  // Collect all concepts across lessons
  const allConcepts: { concept: Concept; lesson: Lesson }[] = [];
  lessons.forEach((l) => {
    l.concepts.forEach((c) => {
      allConcepts.push({ concept: c, lesson: l });
    });
  });

  const hasUploads = lessons.length > 0;
  const newConceptObj = allConcepts.find((item) => item.concept.status === 'locked' || item.concept.status === 'current');
  const revisionConceptObj = allConcepts.find(
    (item) => item.concept.status === 'bloomed' || item.concept.id !== newConceptObj?.concept.id
  ) || allConcepts[1];
  const quizConceptObj = allConcepts.find(
    (item) => item.concept.id !== newConceptObj?.concept.id && item.concept.id !== revisionConceptObj?.concept.id
  ) || allConcepts[0];

  // Collect weak sections from recent quizzes
  const weakSections = (lessons as any[]).flatMap((l) =>
    (l.quizAttempts || []).flatMap((a: any) => a.weakSections || []).map((ws: any) => ({
      ...ws,
      materialId: l.id,
      materialTitle: l.title,
    }))
  );
  const topWeakSection = weakSections[0];

  const questCount = hasUploads ? 3 : 0;

  return (
    <div className="relative z-30">
      {/* Illustrated Fairy Holding Parchment Scroll */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3.5 pl-3 pr-5 py-2.5 min-h-[58px] rounded-full bg-gradient-to-r from-[#FFFDF9] via-[#FFF5E4] to-[#FFF0B8] border-[2.5px] border-[#4B2A7B] shadow-[0_5px_0_#4B2A7B,0_12px_24px_rgba(75,42,123,0.18)] hover:shadow-[0_2px_0_#4B2A7B] hover:translate-y-[3px] active:translate-y-[5px] active:shadow-none transition-all duration-200 animate-bob select-none"
          title="Open Scroll of the Day"
          aria-label="Scroll of the Day"
        >
          {/* Fairy Character Holding Parchment Scroll */}
          <div className="w-11 h-11 relative flex items-center justify-center shrink-0 -ml-1">
            <svg viewBox="0 0 50 50" className="w-12 h-12 filter drop-shadow-[0_2px_4px_rgba(75,42,123,0.2)]">
              {/* Fairy Wings (Iridescent Shimmer) */}
              <ellipse cx="14" cy="18" rx="12" ry="6" fill="#D8C8FF" stroke="#4B2A7B" strokeWidth="1.8" transform="rotate(-35 14 18)" opacity="0.9" />
              <ellipse cx="36" cy="18" rx="12" ry="6" fill="#FFA6CD" stroke="#4B2A7B" strokeWidth="1.8" transform="rotate(35 36 18)" opacity="0.9" />
              <ellipse cx="16" cy="24" rx="8" ry="4" fill="#87EFE5" stroke="#4B2A7B" strokeWidth="1.5" transform="rotate(-15 16 24)" opacity="0.8" />
              <ellipse cx="34" cy="24" rx="8" ry="4" fill="#FFF275" stroke="#4B2A7B" strokeWidth="1.5" transform="rotate(15 34 24)" opacity="0.8" />

              {/* Fairy Body & Lavender Tunic */}
              <path d="M22 24 L20 38 L30 38 L28 24 Z" fill="#B79CFF" stroke="#4B2A7B" strokeWidth="2" />

              {/* Fairy Head & Cute Face */}
              <circle cx="25" cy="18" r="8" fill="#FFE2D1" stroke="#4B2A7B" strokeWidth="2" />
              {/* Lavender Hair Bun & Bangs */}
              <path d="M17 18 C17 10, 33 10, 33 18 C33 12, 29 11, 25 11 C21 11, 17 12, 17 18 Z" fill="#9B72CF" stroke="#4B2A7B" strokeWidth="1.8" />
              <circle cx="25" cy="9" r="4.5" fill="#9B72CF" stroke="#4B2A7B" strokeWidth="1.8" />
              {/* Cheerful Eyes & Blush */}
              <circle cx="22" cy="18" r="1.2" fill="#4B2A7B" />
              <circle cx="28" cy="18" r="1.2" fill="#4B2A7B" />
              <circle cx="20" cy="21" r="1.5" fill="#FF5FA2" opacity="0.7" />
              <circle cx="30" cy="21" r="1.5" fill="#FF5FA2" opacity="0.7" />

              {/* Miniature Parchment Roll in Hands */}
              <g transform="translate(14, 30)">
                <rect x="0" y="0" width="22" height="10" rx="3" fill="#FFFDF0" stroke="#4B2A7B" strokeWidth="1.8" />
                <line x1="4" y1="3" x2="18" y2="3" stroke="#FF7F66" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="4" y1="7" x2="14" y2="7" stroke="#FFC93C" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            </svg>
          </div>

          <div className="text-left pr-1">
            <span className="font-brand text-[17px] sm:text-[18px] text-[#4B2A7B] block leading-tight tracking-tight">
              Scroll of the Day
            </span>
            <span className="text-[12px] font-display font-extrabold text-[#855627] block leading-none mt-0.5">
              Daily Wisdom Quests
            </span>
          </div>

          {/* Visible Badge showing number of quests */}
          <span className="px-2.5 py-1 rounded-full bg-[#FF5FA2] text-white border-2 border-[#4B2A7B] text-xs font-brand font-black shadow-[0_2px_0_#4B2A7B] shrink-0">
            {questCount > 0 ? `${questCount} Quests` : 'New'}
          </span>
        </button>
      )}

      {/* Unfurled Parchment Scroll Modal */}
      {isOpen && (
        <div className="relative animate-fadeIn">
          <div className="w-88 sm:w-[420px] rounded-organic-md bg-[#FFF5E4] border-2 border-[#855627] shadow-[0_20px_45px_rgba(74,53,102,0.22)] p-6 relative overflow-hidden">
            {/* Wooden Scroll Dowels top & bottom */}
            <div className="absolute top-0 inset-x-0 h-3.5 bg-[#B88652] border-b border-[#855627]" />
            <div className="absolute bottom-0 inset-x-0 h-3.5 bg-[#B88652] border-t border-[#855627]" />

            {/* Header: Title & Close */}
            <div className="flex items-center justify-between pt-2 pb-3 mb-4 border-b border-[#E8D4B0]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#E6B82E]" />
                <h3 className="font-display font-bold text-[22px] text-[#4A3566]">
                  Scroll of the Day
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EAD7BA] hover:bg-[#DFC29D] text-[#855627] flex items-center justify-center transition-colors"
                title="Roll up scroll"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scroll Content */}
            {!hasUploads ? (
              /* Charming Fairy Yawn Empty State */
              <div className="py-5 text-center">
                <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <svg viewBox="0 0 60 60" className="w-16 h-16">
                    <ellipse cx="18" cy="24" rx="12" ry="6" fill="#D9C8FF" opacity="0.85" transform="rotate(-30 18 24)" />
                    <ellipse cx="42" cy="24" rx="12" ry="6" fill="#D9C8FF" opacity="0.85" transform="rotate(30 42 24)" />
                    <circle cx="30" cy="34" r="8" fill="#FFD6E0" />
                    <circle cx="30" cy="20" r="9" fill="#FFD9C0" />
                    <circle cx="30" cy="16" r="8" fill="#9670F5" />
                    <path d="M26 19 Q28 17 30 19" stroke="#4A3566" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M34 19 Q36 17 38 19" stroke="#4A3566" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <ellipse cx="32" cy="23" rx="2.5" ry="3.5" fill="#F2A8BC" />
                    <text x="44" y="14" fontSize="10" fontWeight="bold" fill="#B196F5" fontFamily="sans-serif">z</text>
                    <text x="50" y="8" fontSize="13" fontWeight="bold" fill="#B196F5" fontFamily="sans-serif">Z</text>
                  </svg>
                </div>

                <h4 className="font-display font-bold text-[20px] text-[#4A3566] mb-1.5">
                  The garden fairy is yawning...
                </h4>
                <p className="text-[17px] text-[#6C538C] font-body leading-[1.6] mb-5 max-w-[320px] mx-auto">
                  Your soil is resting. Plant your first lecture deck or syllabus notes to grow today's petals!
                </p>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    onPlantSeed();
                  }}
                  className="btn-storybook min-h-[48px] bg-gradient-to-r from-[#FFF0B8] to-[#FFD9C0] text-[#4A3566] border-2 border-[#F5A97D] text-[16px] shadow-storybook hover:shadow-storybook-hover w-full flex items-center justify-center gap-2"
                >
                  <Flower2 className="w-5 h-5 text-[#E6B82E]" />
                  <span>Plant your first notes</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 py-1">
                <span className="text-[14px] font-display font-semibold text-[#855627] block mb-1">
                  🌿 3 quests cultivated for today:
                </span>

                {/* Task 1: New Concept */}
                <div
                  onClick={() => {
                    if (newConceptObj) {
                      setIsOpen(false);
                      onOpenLesson(newConceptObj.lesson.id, newConceptObj.concept.id);
                    }
                  }}
                  className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#E8D4B0] hover:border-[#B196F5] cursor-pointer transition-all hover:-translate-y-0.5 group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] font-display font-bold px-2.5 py-0.5 rounded-full bg-[#E7DCFF] text-[#6C3FE0]">
                      1. New Concept
                    </span>
                    <BookOpen className="w-4 h-4 text-[#9670F5]" />
                  </div>
                  <h5 className="font-display font-bold text-[17px] text-[#4A3566] group-hover:text-[#6C3FE0] line-clamp-1">
                    {newConceptObj?.concept.title || 'Foundations'}
                  </h5>
                  <p className="text-[14px] text-[#9B83BA] font-body line-clamp-1 mt-0.5">
                    {newConceptObj?.concept.oneSentenceSummary}
                  </p>
                </div>

                {/* Task 2: Revision & Animation */}
                <div
                  onClick={() => {
                    if (revisionConceptObj) {
                      setIsOpen(false);
                      onOpenLesson(revisionConceptObj.lesson.id, revisionConceptObj.concept.id);
                    }
                  }}
                  className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#E8D4B0] hover:border-[#83D9A7] cursor-pointer transition-all hover:-translate-y-0.5 group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] font-display font-bold px-2.5 py-0.5 rounded-full bg-[#DBF5E7] text-[#1F8C4F]">
                      2. Revision Story
                    </span>
                    <Play className="w-4 h-4 text-[#47C27D]" />
                  </div>
                  <h5 className="font-display font-bold text-[17px] text-[#4A3566] group-hover:text-[#1F8C4F] line-clamp-1">
                    {revisionConceptObj?.concept.title || 'Review Topic'}
                  </h5>
                  <p className="text-[14px] text-[#9B83BA] font-body mt-0.5">
                    Watch the animated explainer & curve shift.
                  </p>
                </div>

                {/* Task 3: Recall Quiz or Weak Section Focus */}
                <div
                  onClick={() => {
                    if (topWeakSection) {
                      setIsOpen(false);
                      onOpenLesson(topWeakSection.materialId);
                    } else if (quizConceptObj) {
                      setIsOpen(false);
                      onOpenLesson(quizConceptObj.lesson.id, quizConceptObj.concept.id);
                    }
                  }}
                  className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#E8D4B0] hover:border-[#E6CB67] cursor-pointer transition-all hover:-translate-y-0.5 group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] font-display font-bold px-2.5 py-0.5 rounded-full bg-[#FFF8CE] text-[#A67C0D]">
                      {topWeakSection ? '3. Focus Area (From Quiz)' : '3. Recall Quiz'}
                    </span>
                    <HelpCircle className="w-4 h-4 text-[#E6B82E]" />
                  </div>
                  <h5 className="font-display font-bold text-[17px] text-[#4A3566] group-hover:text-[#A67C0D] line-clamp-1">
                    {topWeakSection
                      ? topWeakSection.sectionTitle
                      : quizConceptObj?.concept.title || '15-20 Questions'}
                  </h5>
                  <p className="text-[14px] text-[#9B83BA] font-body mt-0.5">
                    {topWeakSection
                      ? `Recommended review in ${topWeakSection.materialTitle}`
                      : 'Reinforce memory and bloom another petal.'}
                  </p>
                </div>

                {/* ======================================================== */}
                {/* WATCH LATER SHELF: RECENT ANIMATED EXPLAINERS            */}
                {/* ======================================================== */}
                {recentExplainers.length > 0 && (
                  <div className="pt-3 mt-3 border-t border-[#E8D4B0]/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-display font-bold text-[#855627] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#9670F5]" />
                        <span>Watch Later Shelf</span>
                      </span>
                      <span className="text-[11px] font-mono text-[#9B83BA]">
                        {recentExplainers.length} ready
                      </span>
                    </div>

                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {recentExplainers.map((exp) => (
                        <div
                          key={exp.conceptId}
                          onClick={() => {
                            setIsOpen(false);
                            // Find matching lesson
                            const match = allConcepts.find((c) => c.concept.id === exp.conceptId);
                            if (match) {
                              onOpenLesson(match.lesson.id, exp.conceptId);
                            }
                          }}
                          className="p-2.5 rounded-xl bg-white border border-[#E8D4B0] hover:border-[#9670F5] cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-7 h-7 rounded-full bg-[#E7DCFF] border border-[#B196F5] flex items-center justify-center shrink-0">
                              <Play className="w-3 h-3 text-[#6C3FE0] fill-[#6C3FE0]" />
                            </div>
                            <div className="overflow-hidden">
                              <h6 className="font-display font-bold text-[13px] text-[#4A3566] group-hover:text-[#6C3FE0] truncate leading-tight">
                                {exp.conceptTitle}
                              </h6>
                              <span className="text-[11px] text-[#9B83BA] font-mono block">
                                slide {exp.sourceSlide} • {exp.chapterTitle}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] font-display font-semibold text-[#9670F5] shrink-0">
                            Play
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
