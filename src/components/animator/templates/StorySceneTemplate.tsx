import React from 'react';
import { StoryboardScene, SubjectId } from '../../../types';
import { motion } from 'framer-motion';
import { Sparkles, Store, Building2, Trees } from 'lucide-react';

interface StorySceneProps {
  scene: StoryboardScene;
  subjectId: SubjectId;
  reducedMotion?: boolean;
}

export const StorySceneTemplate: React.FC<StorySceneProps> = ({
  scene,
  subjectId,
  reducedMotion = false,
}) => {
  const { data } = scene;
  const elements = data.elements || [];

  return (
    <div className="w-full h-full min-h-[320px] sm:min-h-[360px] rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#FFFDF9] via-[#FFF5E4] to-[#FFF0B8]/40 border-2 border-[#E8D4B0] shadow-storybook">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 z-10">
        <div className="flex items-center gap-2">
          {subjectId === 'microecon' && <Store className="w-4 h-4 text-[#D97706]" />}
          {subjectId === 'pm2' && <Building2 className="w-4 h-4 text-[#9670F5]" />}
          {subjectId === 'mrm' && <Trees className="w-4 h-4 text-[#1F8C4F]" />}
          <span className="text-[13px] font-display font-bold text-[#4A3566]">
            {data.setting || 'Enchanted Storybook Scene'}
          </span>
        </div>
        <span className="text-[11px] font-display font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#E8D4B0] text-[#855627]">
          Story Vignette
        </span>
      </div>

      {/* Center Vignette Card */}
      <div className="my-auto z-10 max-w-xl mx-auto w-full text-center">
        {/* Character Dialogue Quote */}
        <motion.div
          initial={reducedMotion ? {} : { scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="p-4 sm:p-5 rounded-2xl bg-white/95 border-2 border-[#E8D4B0] shadow-sm mb-4 relative"
        >
          <div className="w-7 h-7 rounded-full bg-[#FFF0B8] border border-[#E6CB67] flex items-center justify-center absolute -top-3.5 left-6 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#A67C0D]" />
          </div>
          <p className="text-[16px] sm:text-[18px] font-display font-semibold text-[#4A3566] leading-relaxed italic">
            {data.characterDialogue}
          </p>
        </motion.div>

        {/* 3 Illustrated Elements in the Scene */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {elements.map((elem: any, idx: number) => (
            <motion.div
              key={idx}
              initial={reducedMotion ? {} : { y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + idx * 0.12 }}
              className="p-3 rounded-xl bg-white/90 border border-[#E8D4B0] flex flex-col items-center shadow-xs"
            >
              <div className="w-9 h-9 rounded-full bg-[#FFF5E4] border border-[#E8D4B0] flex items-center justify-center mb-1 text-[18px]">
                {elem.icon === 'jar' && '🍯'}
                {elem.icon === 'scale' && '⚖️'}
                {elem.icon === 'coins' && '🪙'}
                {elem.icon === 'stone' && '🧱'}
                {elem.icon === 'vine' && '🌿'}
                {elem.icon === 'wand' && '🪄'}
                {elem.icon === 'glass' && '🔍'}
                {elem.icon === 'scroll' && '📜'}
                {elem.icon === 'seedbox' && '📦'}
                {!['jar','scale','coins','stone','vine','wand','glass','scroll','seedbox'].includes(elem.icon) && '✨'}
              </div>
              <span className="font-display font-bold text-[12px] text-[#4A3566] leading-tight">
                {elem.name}
              </span>
              <span className="text-[10px] text-[#9B83BA] font-body mt-0.5">
                {elem.note}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Takeaway Footer */}
      <div className="text-center text-[12px] font-display font-medium text-[#4A3566] bg-[#FFF5E4] py-1.5 px-4 rounded-full border border-[#E8D4B0] self-center z-10">
        💡 {data.takeaway || 'Core lesson grounded in real customer interactions.'}
      </div>
    </div>
  );
};
