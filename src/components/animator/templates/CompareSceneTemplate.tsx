import React from 'react';
import { StoryboardScene, SubjectId } from '../../../types';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface CompareSceneProps {
  scene: StoryboardScene;
  subjectId: SubjectId;
  reducedMotion?: boolean;
}

export const CompareSceneTemplate: React.FC<CompareSceneProps> = ({
  scene,
  subjectId,
  reducedMotion = false,
}) => {
  const { data } = scene;
  const left = data.leftColumn || {};
  const right = data.rightColumn || {};

  return (
    <div className="w-full h-full min-h-[320px] sm:min-h-[360px] rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden bg-[#FFFDF9] border-2 border-[#E8D4B0] shadow-storybook">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-display font-bold text-[18px] sm:text-[20px] text-[#4A3566]">
          {data.compareTitle || 'Strategic Trade-off Analysis'}
        </h4>
        <span className="text-[12px] font-display font-bold px-3 py-0.5 rounded-full bg-[#FFF5E4] border border-[#E8D4B0] text-[#855627]">
          Before vs. After
        </span>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto z-10 w-full max-w-2xl mx-auto">
        {/* Left Column (Traditional / Suboptimal) */}
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4 rounded-2xl bg-[#FFF5F5] border-2 border-[#FCA5A5] flex flex-col justify-between shadow-xs text-left"
        >
          <div>
            <span
              className="text-[11px] font-display font-bold px-2.5 py-0.5 rounded-full inline-block mb-2"
              style={{ backgroundColor: left.badgeColor || '#FEE2E2', color: left.textColor || '#991B1B' }}
            >
              {left.badge || 'Linear Approach'}
            </span>
            <h5 className="font-display font-bold text-[16px] text-[#4A3566] mb-1">
              {left.title}
            </h5>
            <p className="text-[13px] text-[#6C538C] font-body mb-3 leading-snug">
              {left.description}
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#FCA5A5]/40">
            {left.points?.map((pt: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-[12px] text-[#4A3566]">
                <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column (Modern / Optimized) */}
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="p-4 rounded-2xl bg-[#F0FDF4] border-2 border-[#86EFAC] flex flex-col justify-between shadow-sm text-left"
        >
          <div>
            <span
              className="text-[11px] font-display font-bold px-2.5 py-0.5 rounded-full inline-block mb-2"
              style={{ backgroundColor: right.badgeColor || '#DCFCE7', color: right.textColor || '#166534' }}
            >
              {right.badge || 'Enchanted Solution'}
            </span>
            <h5 className="font-display font-bold text-[16px] text-[#4A3566] mb-1">
              {right.title}
            </h5>
            <p className="text-[13px] text-[#6C538C] font-body mb-3 leading-snug">
              {right.description}
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#86EFAC]/40">
            {right.points?.map((pt: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-[12px] text-[#166534] font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Hint */}
      <div className="text-center text-[12px] font-display font-medium text-[#855627] bg-[#FFF5E4] py-1.5 px-4 rounded-full border border-[#E8D4B0] self-center">
        Comparative Advantage • Maximizing Customer Utility
      </div>
    </div>
  );
};
