import React from 'react';
import { StoryboardScene, SubjectId } from '../../../types';
import { Sparkles, ArrowRight, Heart, Share2, Sprout, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface FlowSceneProps {
  scene: StoryboardScene;
  subjectId: SubjectId;
  reducedMotion?: boolean;
}

export const FlowSceneTemplate: React.FC<FlowSceneProps> = ({
  scene,
  subjectId,
  reducedMotion = false,
}) => {
  const { data } = scene;
  const steps = data.steps || [];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'sparkle': return <Sparkles className="w-5 h-5 text-[#E6B82E]" />;
      case 'heart': return <Heart className="w-5 h-5 text-[#E11D48]" />;
      case 'share': return <Share2 className="w-5 h-5 text-[#3B82F6]" />;
      case 'sprout': return <Sprout className="w-5 h-5 text-[#10B981]" />;
      default: return <CheckCircle2 className="w-5 h-5 text-[#9670F5]" />;
    }
  };

  return (
    <div className="w-full h-full min-h-[320px] sm:min-h-[360px] rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden bg-[#FFFDF9] border-2 border-[#E8D4B0] shadow-storybook">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-display font-bold text-[18px] sm:text-[20px] text-[#4A3566]">
          {data.flowTitle || 'Process Flow Engine'}
        </h4>
        {data.isCompounding && (
          <span className="text-[11px] font-display font-bold px-3 py-0.5 rounded-full bg-[#E7DCFF] border border-[#B196F5] text-[#6C3FE0]">
            Compounding Loop
          </span>
        )}
      </div>

      {/* The Flow Steps Grid/Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 my-auto z-10 w-full">
        {steps.map((step: any, idx: number) => {
          const isActive = idx === (data.activeStepIndex ?? 1);

          return (
            <motion.div
              key={idx}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.18, duration: 0.4 }}
              className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between transition-all relative ${
                isActive
                  ? 'bg-[#FFF5E4] border-[#9670F5] shadow-[0_0_16px_rgba(150,112,245,0.25)] scale-105'
                  : 'bg-white border-[#E8D4B0]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#FFF5E4] border border-[#E8D4B0] flex items-center justify-center shadow-xs">
                    {getIcon(step.icon)}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#855627]">
                    0{step.number}
                  </span>
                </div>
                <h5 className="font-display font-bold text-[14px] text-[#4A3566] leading-tight mb-1">
                  {step.title}
                </h5>
                <p className="text-[12px] text-[#6C538C] font-body leading-snug">
                  {step.description}
                </p>
              </div>

              {isActive && (
                <div className="mt-2 text-[10px] font-display font-bold text-[#6C3FE0] bg-[#E7DCFF]/70 py-0.5 px-2 rounded-full text-center">
                  Active Lever
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Progress Bar */}
      <div className="text-center text-[12px] font-display font-medium text-[#855627] bg-[#FFF5E4] py-1.5 px-4 rounded-full border border-[#E8D4B0] self-center">
        Step-by-step Execution • Synergistic Loop Acceleration
      </div>
    </div>
  );
};
