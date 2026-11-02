import React from 'react';
import { StoryboardScene, SubjectId } from '../../../types';
import { motion } from 'framer-motion';

interface CurveSceneProps {
  scene: StoryboardScene;
  subjectId: SubjectId;
  reducedMotion?: boolean;
}

export const CurveSceneTemplate: React.FC<CurveSceneProps> = ({
  scene,
  subjectId,
  reducedMotion = false,
}) => {
  const { data } = scene;
  const isNormalDist = data.curveType === 'normal_distribution';

  return (
    <div className="w-full h-full min-h-[320px] sm:min-h-[360px] rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden bg-[#FFFDF9] border-2 border-[#E8D4B0] shadow-storybook">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-display font-bold text-[18px] sm:text-[20px] text-[#4A3566]">
          {data.chartTitle || 'Analytical Curve Visualization'}
        </h4>
        {data.isIllustrative && (
          <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF0B8] border border-[#E6CB67] text-[#855627]">
            Illustrative values
          </span>
        )}
      </div>

      {/* SVG Coordinate Space */}
      <div className="relative flex-1 w-full flex items-center justify-center my-2">
        {isNormalDist ? (
          /* Normal Distribution Gaussian Curve */
          <svg viewBox="0 0 340 180" className="w-full h-full max-h-[220px]">
            {/* Shaded 95% Confidence Interval */}
            <motion.path
              d="M 60 150 C 110 150, 120 40, 170 40 C 220 40, 230 150, 280 150 Z"
              fill="#CFF2E0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: reducedMotion ? 0 : 0.8 }}
            />
            {/* Bell Curve Outline */}
            <motion.path
              d="M 20 150 C 90 150, 120 40, 170 40 C 220 40, 250 150, 320 150"
              stroke="#1F8C4F"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: reducedMotion ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            {/* Center Mean (mu) */}
            <line x1="170" y1="40" x2="170" y2="155" stroke="#047857" strokeWidth="2" strokeDasharray="3 3" />
            <text x="166" y="170" fontSize="11" fontWeight="bold" fill="#047857" fontFamily="sans-serif">μ (Mean)</text>

            {/* Standard Error Boundaries */}
            <line x1="95" y1="95" x2="95" y2="150" stroke="#059669" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="245" y1="95" x2="245" y2="150" stroke="#059669" strokeWidth="1.5" strokeDasharray="2 2" />
            <text x="80" y="168" fontSize="9" fontWeight="bold" fill="#059669" fontFamily="sans-serif">-1.96σ</text>
            <text x="238" y="168" fontSize="9" fontWeight="bold" fill="#059669" fontFamily="sans-serif">+1.96σ</text>

            {/* Base Axis */}
            <line x1="20" y1="150" x2="320" y2="150" stroke="#855627" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          /* Supply & Demand Curve with Shift */
          <svg viewBox="0 0 340 190" className="w-full h-full max-h-[220px]">
            {/* Y Axis (Price) */}
            <line x1="45" y1="20" x2="45" y2="165" stroke="#855627" strokeWidth="2" strokeLinecap="round" />
            <text x="20" y="25" fontSize="11" fontWeight="bold" fill="#855627" fontFamily="sans-serif">Price (P)</text>

            {/* X Axis (Quantity) */}
            <line x1="45" y1="165" x2="310" y2="165" stroke="#855627" strokeWidth="2" strokeLinecap="round" />
            <text x="250" y="184" fontSize="11" fontWeight="bold" fill="#855627" fontFamily="sans-serif">Quantity (Q)</text>

            {/* Supply Curve (S) Upward */}
            <motion.line
              x1="65"
              y1="145"
              x2="275"
              y2="35"
              stroke="#1F8C4F"
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ pathLength: reducedMotion ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8 }}
            />
            <text x="280" y="38" fontSize="12" fontWeight="bold" fill="#1F8C4F" fontFamily="sans-serif">S</text>

            {/* Initial Demand Curve (D1) */}
            <line
              x1="65"
              y1="35"
              x2="250"
              y2="150"
              stroke="#EA580C"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              strokeOpacity="0.6"
              strokeLinecap="round"
            />
            <text x="254" y="156" fontSize="11" fontWeight="bold" fill="#EA580C" fontFamily="sans-serif">D₁</text>

            {/* Shifted Demand Curve (D2) */}
            <motion.line
              x1="105"
              y1="35"
              x2="290"
              y2="150"
              stroke="#DC2626"
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.8, delay: 0.3 }}
            />
            <text x="294" y="156" fontSize="12" fontWeight="bold" fill="#DC2626" fontFamily="sans-serif">D₂</text>

            {/* Initial Equilibrium E0 */}
            <circle cx="165" cy="95" r="4.5" fill="#855627" />
            <text x="145" y="88" fontSize="10" fontWeight="bold" fill="#855627" fontFamily="sans-serif">E₀</text>

            {/* Shifted Equilibrium E* */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
            >
              <circle cx="198" cy="78" r="6" fill="#DC2626" />
              <text x="202" y="70" fontSize="12" fontWeight="bold" fill="#DC2626" fontFamily="sans-serif">E*</text>
              {/* Dashed projections to axes */}
              <line x1="198" y1="78" x2="45" y2="78" stroke="#DC2626" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="198" y1="78" x2="198" y2="165" stroke="#DC2626" strokeWidth="1" strokeDasharray="3 3" />
              <text x="22" y="82" fontSize="10" fontWeight="bold" fill="#DC2626" fontFamily="sans-serif">P*</text>
              <text x="192" y="180" fontSize="10" fontWeight="bold" fill="#DC2626" fontFamily="sans-serif">Q*</text>
            </motion.g>
          </svg>
        )}
      </div>

      {/* Caption Ribbon */}
      <div className="text-center text-[12px] font-display font-medium text-[#855627] bg-[#FFF5E4] py-1.5 px-4 rounded-full border border-[#E8D4B0] self-center">
        {isNormalDist
          ? data.confidenceLevel || 'Empirical Validation • p < 0.05 Statistical Significance'
          : 'Demand Shifts Rightward • Higher Clearing Price (P*) and Higher Volume (Q*)'}
      </div>
    </div>
  );
};
