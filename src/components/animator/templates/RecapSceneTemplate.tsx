import React from 'react';
import { StoryboardScene, SubjectId } from '../../../types';
import { motion } from 'framer-motion';
import { Sparkles, Flower2, CheckCircle2 } from 'lucide-react';

interface RecapSceneProps {
  scene: StoryboardScene;
  subjectId: SubjectId;
  reducedMotion?: boolean;
}

export const RecapSceneTemplate: React.FC<RecapSceneProps> = ({
  scene,
  subjectId,
  reducedMotion = false,
}) => {
  const { data } = scene;
  const petals = data.petals || [];

  return (
    <div className="w-full h-full min-h-[320px] sm:min-h-[360px] rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#FFF5E4] via-[#FFFDF9] to-[#FFD6E0]/30 border-2 border-[#E8D4B0] shadow-storybook">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E6B82E]" />
          <h4 className="font-display font-bold text-[18px] sm:text-[20px] text-[#4A3566]">
            {data.recapTitle || '3 Blooming Takeaways'}
          </h4>
        </div>
        <span className="text-[12px] font-display font-bold px-3 py-0.5 rounded-full bg-[#CFF2E0] border border-[#83D9A7] text-[#1F8C4F]">
          Syllabus Mastery
        </span>
      </div>

      {/* 3 Blooming Petals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-auto z-10 w-full max-w-2xl mx-auto">
        {petals.map((petal: any, idx: number) => (
          <motion.div
            key={idx}
            initial={reducedMotion ? {} : { scale: 0.8, opacity: 0, rotate: -3 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.15 + idx * 0.18, type: 'spring', stiffness: 260, damping: 20 }}
            className="p-4 rounded-2xl bg-white/95 border-2 border-[#E8D4B0] shadow-sm flex flex-col justify-between relative text-left group hover:border-[#83D9A7] transition-colors"
          >
            {/* Blooming Flower Badge */}
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-full bg-[#FFF0B8] border border-[#E6CB67] flex items-center justify-center">
                <Flower2 className="w-4 h-4 text-[#E6B82E]" />
              </div>
              <span className="text-[11px] font-mono font-bold text-[#855627]">
                Petal #{petal.number}
              </span>
            </div>

            <h5 className="font-display font-bold text-[15px] text-[#4A3566] mb-1.5 leading-snug">
              {petal.title}
            </h5>

            <p className="text-[13px] text-[#6C538C] font-body leading-relaxed">
              {petal.content}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Closing Celebration Banner */}
      <div className="text-center text-[13px] font-display font-bold text-[#6C3FE0] bg-[#E7DCFF]/80 py-2 px-5 rounded-full border border-[#B196F5] self-center shadow-xs z-10 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#E6B82E]" />
        <span>Ready to Bloom into your Garden Meadow! 🌸</span>
      </div>
    </div>
  );
};
