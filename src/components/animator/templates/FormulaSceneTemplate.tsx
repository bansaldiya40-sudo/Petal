import React from 'react';
import { StoryboardScene, SubjectId } from '../../../types';
import { motion } from 'framer-motion';

interface FormulaSceneProps {
  scene: StoryboardScene;
  subjectId: SubjectId;
  reducedMotion?: boolean;
}

export const FormulaSceneTemplate: React.FC<FormulaSceneProps> = ({
  scene,
  subjectId,
  reducedMotion = false,
}) => {
  const { data } = scene;
  const terms = data.terms || [];

  return (
    <div className="w-full h-full min-h-[320px] sm:min-h-[360px] rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden bg-[#FFFDF9] border-2 border-[#E8D4B0] shadow-storybook">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-display font-bold text-[18px] sm:text-[20px] text-[#4A3566]">
          {data.formulaName || 'Mathematical Relationship'}
        </h4>
        <span className="text-[12px] font-mono text-[#855627] bg-[#FFF5E4] px-3 py-1 rounded-full border border-[#E8D4B0]">
          Analytical Equation
        </span>
      </div>

      {/* Main Centered Equation Banner */}
      <div className="my-auto text-center py-2">
        <motion.div
          initial={reducedMotion ? {} : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block px-8 py-3 rounded-3xl bg-[#FFF5E4] border-2 border-[#E8D4B0] shadow-sm mb-4"
        >
          <span className="font-display font-bold text-3xl sm:text-4xl text-[#4A3566] tracking-wider">
            {data.equation}
          </span>
        </motion.div>

        {/* Term by Term Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto w-full">
          {terms.map((t: any, idx: number) => (
            <motion.div
              key={idx}
              initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.15, duration: 0.4 }}
              className="p-3.5 rounded-2xl bg-white border-2 border-[#E8D4B0] shadow-xs text-left"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center font-display font-bold text-[12px] text-white shrink-0"
                  style={{ backgroundColor: t.highlightColor || '#9670F5' }}
                >
                  {t.symbol}
                </span>
                <span className="font-display font-bold text-[13px] text-[#4A3566]">
                  {t.label}
                </span>
              </div>
              <p className="text-[12px] text-[#6C538C] font-body leading-snug">
                {t.explanation}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benchmark Ribbon */}
      <div className="text-center text-[12px] font-display font-medium text-[#1F8C4F] bg-[#DBF5E7]/70 py-1.5 px-4 rounded-full border border-[#83D9A7] self-center">
        {data.benchmark || 'Target Benchmark: Compound Exponential Growth'}
      </div>
    </div>
  );
};
