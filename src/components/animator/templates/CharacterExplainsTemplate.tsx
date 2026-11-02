import React from 'react';
import { StoryboardScene, SubjectId } from '../../../types';
import { Sparkles, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface CharacterExplainsProps {
  scene: StoryboardScene;
  subjectId: SubjectId;
  reducedMotion?: boolean;
}

export const CharacterExplainsTemplate: React.FC<CharacterExplainsProps> = ({
  scene,
  subjectId,
  reducedMotion = false,
}) => {
  const data = (scene && scene.data) || {
    badge: (scene as any)?.focusConcept || 'Enchanted Guide Intro',
    subheadline: (scene as any)?.location || 'Slide Concept',
    characterName: (scene as any)?.characterMood || 'Guide',
    headline: (scene as any)?.focusConcept || (scene as any)?.title || 'Key Concept',
    speechBubble: (scene as any)?.dialogue || (scene as any)?.narration || 'Explaining this concept step by step.',
  };

  return (
    <div className="w-full h-full min-h-[320px] sm:min-h-[360px] rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#FFF5E4] via-[#FFFDF9] to-[#FFF0B8]/40 border-2 border-[#E8D4B0] shadow-storybook">
      {/* Top Meta Badge */}
      <div className="flex items-center justify-between z-10">
        <span className="text-[13px] font-display font-bold px-3.5 py-1 rounded-full bg-white/90 border border-[#E8D4B0] text-[#6C3FE0] shadow-sm inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#E6B82E]" />
          <span>{data.badge || 'Enchanted Guide Intro'}</span>
        </span>
        <span className="text-[12px] font-mono text-[#855627] bg-[#FFF5E4] px-2.5 py-0.5 rounded-full border border-[#E8D4B0]">
          {data.subheadline || 'Slide Concept'}
        </span>
      </div>

      {/* Center Region: Character + Speech Bubble */}
      <div className="flex flex-col sm:flex-row items-center gap-6 my-auto z-10 max-w-xl mx-auto w-full">
        {/* Character Avatar with Pose */}
        <motion.div
          animate={reducedMotion ? {} : { y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white border-2 border-[#E8D4B0] shadow-storybook flex items-center justify-center shrink-0 relative"
        >
          {subjectId === 'pm2' && (
            <svg viewBox="0 0 60 60" className="w-20 h-20">
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
            <svg viewBox="0 0 60 60" className="w-20 h-20">
              <circle cx="30" cy="30" r="14" fill="#EAD7BA" stroke="#855627" strokeWidth="2" />
              <circle cx="25" cy="27" r="5" stroke="#E6B82E" strokeWidth="1.5" fill="#FFF" />
              <circle cx="35" cy="27" r="5" stroke="#E6B82E" strokeWidth="1.5" fill="#FFF" />
              <circle cx="26" cy="27" r="2" fill="#4A3566" />
              <circle cx="36" cy="27" r="2" fill="#4A3566" />
              <polygon points="30,31 28,35 32,35" fill="#F5A97D" />
            </svg>
          )}
          {subjectId === 'microecon' && (
            <svg viewBox="0 0 60 60" className="w-20 h-20">
              <ellipse cx="30" cy="34" r="12" ry="14" fill="#FFF8EE" stroke="#DFC29D" strokeWidth="1.5" />
              <circle cx="30" cy="20" r="9" fill="#FFF8EE" stroke="#DFC29D" strokeWidth="1.5" />
              <path d="M26 14 C22 4, 18 2, 22 4" stroke="#FFD6E0" strokeWidth="3" strokeLinecap="round" />
              <path d="M34 14 C38 4, 42 2, 38 4" stroke="#FFD6E0" strokeWidth="3" strokeLinecap="round" />
              <circle cx="27" cy="19" r="1.5" fill="#4A3566" />
              <circle cx="33" cy="19" r="1.5" fill="#4A3566" />
            </svg>
          )}
          <span className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-[#FFF5E4] border border-[#855627] text-[10px] font-display font-bold text-[#4A3566] shadow-sm">
            {data.characterName || 'Guide'}
          </span>
        </motion.div>

        {/* Speech Bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex-1 p-5 rounded-2xl bg-white/95 border-2 border-[#E8D4B0] shadow-sm relative text-left"
        >
          <h4 className="font-display font-bold text-[19px] sm:text-[21px] text-[#4A3566] leading-snug mb-2">
            {data.headline}
          </h4>
          <p className="text-[16px] sm:text-[17px] text-[#6C538C] font-body leading-[1.6]">
            {data.speechBubble}
          </p>
        </motion.div>
      </div>

      {/* Bottom Hint */}
      <div className="text-center text-[13px] font-display font-medium text-[#9B83BA] z-10">
        Scene 1 • Concept Introduction
      </div>
    </div>
  );
};
