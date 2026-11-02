import React from 'react';
import { Concept, SubjectId } from '../../types';
import { SUBJECTS } from '../../utils/subjects';
import { Lock, Sparkles, Check, Play, BookOpen } from 'lucide-react';

interface QuestMapProps {
  subjectId: SubjectId;
  concepts: Concept[];
  onSelectConcept: (concept: Concept) => void;
}

export const QuestMap: React.FC<QuestMapProps> = ({
  subjectId,
  concepts,
  onSelectConcept,
}) => {
  const subject = SUBJECTS[subjectId];

  // Find index of current unlocked concept
  const currentIdx = concepts.findIndex((c) => c.status === 'current');
  const activeIdx = currentIdx >= 0 ? currentIdx : concepts.length - 1;

  // Calculate bloomed count
  const bloomedCount = concepts.filter((c) => c.status === 'bloomed').length;
  const progressPercent = Math.round((bloomedCount / Math.max(1, concepts.length)) * 100);

  return (
    <div className="w-full relative py-6">
      {/* Growing Botanical Vine Progress Bar */}
      <div className="max-w-2xl mx-auto mb-10 px-4">
        <div className="flex items-center justify-between text-[16px] font-display font-bold text-[#4A3566] mb-2">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.accentHex }} />
            Quest Journey Progress
          </span>
          <span className="px-3 py-0.5 rounded-full bg-[#FFF5E4] border border-[#E8D4B0] text-[14px]">
            {bloomedCount} of {concepts.length} concepts bloomed ({progressPercent}%)
          </span>
        </div>

        {/* Botanical Vine Container */}
        <div className="relative w-full h-4 rounded-full bg-[#EAD7BA]/50 p-0.5 border-2 border-[#855627]/30 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-1"
            style={{
              width: `${Math.max(8, progressPercent)}%`,
              background: `linear-gradient(90deg, #83D9A7 0%, ${subject.accentHex} 100%)`,
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
          </div>
        </div>
      </div>

      {/* The Winding Stepping Stones Path */}
      <div className="relative max-w-3xl mx-auto py-8">
        {/* SVG Background Path connecting stepping stones */}
        <div className="flex flex-col items-center gap-14 sm:gap-16 relative z-10">
          {concepts.map((concept, idx) => {
            const isCurrent = concept.status === 'current';
            const isBloomed = concept.status === 'bloomed';
            const isLocked = concept.status === 'locked';

            // Alternate stepping stone positions slightly left & right for winding feel
            const offsetClass =
              idx % 3 === 0
                ? 'sm:-translate-x-12'
                : idx % 3 === 1
                ? 'sm:translate-x-12'
                : 'sm:translate-x-0';

            return (
              <div
                key={concept.id}
                className={`relative flex items-center gap-4 transition-all duration-300 ${offsetClass}`}
              >
                {/* Character standing and waving at the CURRENT stone */}
                {isCurrent && (
                  <div className="absolute -top-14 left-2 sm:-left-20 z-20 animate-bounce">
                    <div className="w-14 sm:w-16 h-14 sm:h-16 relative flex items-center justify-center">
                      {/* Character avatar SVG waving */}
                      {subjectId === 'pm2' && (
                        <svg viewBox="0 0 60 60" className="w-14 h-14">
                          <ellipse cx="18" cy="24" rx="10" ry="5" fill="#D9C8FF" transform="rotate(-30 18 24)" />
                          <ellipse cx="42" cy="24" rx="10" ry="5" fill="#D9C8FF" transform="rotate(30 42 24)" />
                          <circle cx="30" cy="34" r="8" fill="#9670F5" />
                          <circle cx="30" cy="20" r="9" fill="#FFD9C0" />
                          <circle cx="30" cy="16" r="8" fill="#6C3FE0" />
                          <line x1="38" y1="28" x2="48" y2="16" stroke="#FFD9C0" strokeWidth="2.5" strokeLinecap="round" />
                          <polygon points="48,12 50,16 54,16 51,19 52,23 48,20 44,23 45,19 42,16 46,16" fill="#FFF0B8" />
                        </svg>
                      )}
                      {subjectId === 'mrm' && (
                        <svg viewBox="0 0 60 60" className="w-14 h-14">
                          <circle cx="30" cy="30" r="14" fill="#EAD7BA" stroke="#855627" strokeWidth="2" />
                          <circle cx="25" cy="27" r="5" stroke="#E6B82E" strokeWidth="1.5" fill="#FFF" />
                          <circle cx="35" cy="27" r="5" stroke="#E6B82E" strokeWidth="1.5" fill="#FFF" />
                          <circle cx="26" cy="27" r="2" fill="#4A3566" />
                          <circle cx="36" cy="27" r="2" fill="#4A3566" />
                          <polygon points="30,31 28,35 32,35" fill="#F5A97D" />
                        </svg>
                      )}
                      {subjectId === 'microecon' && (
                        <svg viewBox="0 0 60 60" className="w-14 h-14">
                          <ellipse cx="30" cy="34" r="12" ry="14" fill="#FFF8EE" stroke="#DFC29D" strokeWidth="1.5" />
                          <circle cx="30" cy="20" r="9" fill="#FFF8EE" stroke="#DFC29D" strokeWidth="1.5" />
                          <path d="M26 14 C22 4, 18 2, 22 4" stroke="#FFD6E0" strokeWidth="3" strokeLinecap="round" />
                          <path d="M34 14 C38 4, 42 2, 38 4" stroke="#FFD6E0" strokeWidth="3" strokeLinecap="round" />
                          <circle cx="27" cy="19" r="1.5" fill="#4A3566" />
                          <circle cx="33" cy="19" r="1.5" fill="#4A3566" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[11px] font-display font-bold px-2 py-0.5 rounded-full bg-[#FFF5E4] border border-[#855627] text-[#4A3566] shadow-sm whitespace-nowrap block mt-[-4px]">
                      Here now!
                    </span>
                  </div>
                )}

                {/* The Illustrated Stepping Stone Button */}
                <button
                  onClick={() => !isLocked && onSelectConcept(concept)}
                  disabled={isLocked}
                  className={`group relative flex items-center gap-3.5 px-6 py-4 min-h-[58px] rounded-full border-2 transition-all duration-300 text-left shadow-storybook ${
                    isBloomed
                      ? 'bg-[#FFF8EE] hover:bg-white border-[#83D9A7] hover:scale-105 hover:shadow-storybook-hover cursor-pointer'
                      : isCurrent
                      ? 'bg-[#FFF5E4] border-2 border-[#E6B82E] ring-4 ring-[#FFF0B8]/60 shadow-[0_0_24px_rgba(255,240,184,0.8)] scale-105 cursor-pointer animate-bob'
                      : 'bg-[#EAD7BA]/40 border-[#DFC29D] opacity-60 cursor-not-allowed'
                  }`}
                  aria-label={`${concept.title} - ${concept.status}`}
                >
                  {/* Stepping Stone Icon Disk */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110 ${
                      isBloomed
                        ? 'bg-[#CFF2E0] border-[#83D9A7] text-[#1F8C4F]'
                        : isCurrent
                        ? 'bg-[#FFF0B8] border-[#E6CB67] text-[#A67C0D]'
                        : 'bg-[#DFC29D] border-[#C49A6C] text-[#855627]'
                    }`}
                  >
                    {isBloomed ? (
                      <Check className="w-6 h-6 stroke-[3]" />
                    ) : isCurrent ? (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>

                  {/* Stepping Stone Text Details */}
                  <div className="max-w-[280px] sm:max-w-md">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-display font-bold uppercase tracking-wider text-[#9B83BA]">
                        Quest #{concept.conceptOrder}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.2 rounded bg-white/70 text-[#6C538C] border border-[#E8D4B0]">
                        slide {concept.sourceSlide}
                      </span>
                      {/* Explainer Available Badge */}
                      <span className="text-[11px] font-display font-semibold px-2 py-0.5 rounded-full bg-[#E7DCFF] text-[#6C3FE0] border border-[#B196F5] flex items-center gap-1 shadow-2xs" title="Concept Animator ready">
                        <Play className="w-2.5 h-2.5 fill-[#6C3FE0]" />
                        <span>Explainer</span>
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-[18px] sm:text-[20px] text-[#4A3566] leading-snug">
                      {concept.title}
                    </h4>

                    <p className="text-[14px] text-[#6C538C] font-body line-clamp-1 mt-0.5">
                      {concept.oneSentenceSummary}
                    </p>
                  </div>

                  {/* Bloomed Flower Badge on stone */}
                  {isBloomed && (
                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#FFD6E0] border border-[#F2A8BC] flex items-center justify-center shadow-sm">
                      <Sparkles className="w-4 h-4 text-[#F2A8BC]" />
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
