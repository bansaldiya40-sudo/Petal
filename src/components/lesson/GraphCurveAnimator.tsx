import React, { useState, useEffect } from 'react';
import { AnimationScene, SubjectId } from '../../types';
import { motion } from 'framer-motion';

interface GraphCurveAnimatorProps {
  subjectId: SubjectId;
  scene: AnimationScene;
  isPlaying: boolean;
  progressPercent: number; // 0 to 100 in current scene
}

export const GraphCurveAnimator: React.FC<GraphCurveAnimatorProps> = ({
  subjectId,
  scene,
  isPlaying,
  progressPercent,
}) => {
  // Microeconomics Curve Shift Animation
  if (subjectId === 'microecon') {
    // Progress interpolation for Demand Shift
    // In scene 1: static equilibrium
    // In scene 2-4: D1 shifts to D2
    const isShifted = scene.sceneNumber >= 2;
    const shiftOffset = isShifted ? (scene.sceneNumber === 2 ? (progressPercent / 100) * 55 : 55) : 0;

    return (
      <div className="w-full h-64 sm:h-72 bg-amber-50/50 rounded-3xl p-4 relative overflow-hidden flex flex-col justify-between border border-amber-200/60 shadow-inner">
        {/* Graph Header Label */}
        <div className="flex items-center justify-between text-xs font-display text-micro-deep">
          <span className="font-semibold">{scene.visualData?.curveShift?.label || 'Supply & Demand Equilibrium'}</span>
          <span className="font-mono bg-white/80 px-2 py-0.5 rounded-full border border-amber-200">
            P* vs Q*
          </span>
        </div>

        {/* SVG Coordinate Space */}
        <div className="relative flex-1 w-full h-full">
          <svg viewBox="0 0 340 200" className="w-full h-full overflow-visible">
            {/* Coordinate Axes */}
            {/* Y Axis (Price P) */}
            <line x1="40" y1="20" x2="40" y2="175" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
            <text x="25" y="25" fontSize="11" fontWeight="bold" fill="#78350F" fontFamily="sans-serif">Price (P)</text>

            {/* X Axis (Quantity Q) */}
            <line x1="40" y1="175" x2="310" y2="175" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
            <text x="260" y="195" fontSize="11" fontWeight="bold" fill="#78350F" fontFamily="sans-serif">Quantity (Q)</text>

            {/* Supply Curve (Upward Sloping: S) */}
            <line x1="60" y1="155" x2="270" y2="40" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
            <text x="275" y="42" fontSize="11" fontWeight="bold" fill="#059669" fontFamily="sans-serif">S</text>

            {/* Initial Demand Curve (D1: Downward Sloping) */}
            <line
              x1="60"
              y1="40"
              x2="250"
              y2="160"
              stroke="#EA580C"
              strokeWidth={isShifted ? 2 : 3.5}
              strokeDasharray={isShifted ? '4 4' : 'none'}
              strokeOpacity={isShifted ? 0.6 : 1}
              strokeLinecap="round"
            />
            <text x="254" y="166" fontSize="10" fontWeight="bold" fill="#EA580C" fontFamily="sans-serif">D₁</text>

            {/* Shifted Demand Curve (D2) */}
            {isShifted && (
              <g className="transition-all duration-300">
                <line
                  x1={60 + shiftOffset}
                  y1="40"
                  x2={250 + shiftOffset}
                  y2="160"
                  stroke="#DC2626"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <text x={254 + shiftOffset} y="166" fontSize="11" fontWeight="bold" fill="#DC2626" fontFamily="sans-serif">
                  D₂
                </text>

                {/* Shift Arrow */}
                <path
                  d={`M 150 95 L ${150 + Math.min(35, shiftOffset)} 95`}
                  stroke="#DC2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                  markerEnd="url(#arrow)"
                />
              </g>
            )}

            {/* Initial Equilibrium Point E0 */}
            <circle cx="165" cy="98" r="4.5" fill="#78350F" />
            <text x="145" y="92" fontSize="10" fontWeight="bold" fill="#78350F" fontFamily="sans-serif">E₀</text>

            {/* New Equilibrium Point E1 when shifted */}
            {isShifted && shiftOffset > 30 && (
              <g className="animate-pulse">
                <circle cx="196" cy="80" r="5.5" fill="#DC2626" />
                <text x="198" y="72" fontSize="11" fontWeight="bold" fill="#DC2626" fontFamily="sans-serif">E*</text>
                {/* Dashed projections to axes */}
                <line x1="196" y1="80" x2="40" y2="80" stroke="#DC2626" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="196" y1="80" x2="196" y2="175" stroke="#DC2626" strokeWidth="1" strokeDasharray="3 3" />
                <text x="20" y="84" fontSize="9" fontWeight="bold" fill="#DC2626" fontFamily="sans-serif">P*</text>
                <text x="190" y="190" fontSize="9" fontWeight="bold" fill="#DC2626" fontFamily="sans-serif">Q*</text>
              </g>
            )}
          </svg>
        </div>

        {/* Dynamic Status Pill */}
        <div className="text-center text-[11px] font-display font-medium text-amber-800 bg-amber-100/80 py-1 px-3 rounded-full border border-amber-200 self-center">
          {scene.sceneNumber === 1 && 'Initial State: Equilibrium P0 and Q0'}
          {scene.sceneNumber === 2 && 'Demand increases: D1 curve moves rightward to D2'}
          {scene.sceneNumber === 3 && 'Shortage at old price pushes market price upwards'}
          {scene.sceneNumber >= 4 && 'Market Clears: Higher Price (P*) and Higher Volume (Q*)'}
        </div>
      </div>
    );
  }

  // Market Research Methods: Normal Distribution / Confidence Curve
  if (subjectId === 'mrm') {
    return (
      <div className="w-full h-64 sm:h-72 bg-emerald-50/50 rounded-3xl p-4 relative overflow-hidden flex flex-col justify-between border border-emerald-200/60 shadow-inner">
        <div className="flex items-center justify-between text-xs font-display text-emerald-800">
          <span className="font-semibold">{scene.visualData?.distributionData?.sampleSize || 'Normal Sampling Distribution'}</span>
          <span className="font-mono bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
            95% Confidence Interval
          </span>
        </div>

        {/* Normal Distribution Bell Curve SVG */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 340 180" className="w-full h-full overflow-visible">
            {/* Shaded 95% Confidence Area under curve */}
            <path
              d="M 60 150 C 110 150, 120 40, 170 40 C 220 40, 230 150, 280 150 Z"
              fill="#A7F3D0"
              opacity="0.65"
            />
            {/* Bell Curve Outline */}
            <path
              d="M 20 150 C 90 150, 120 40, 170 40 C 220 40, 250 150, 320 150"
              stroke="#059669"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Mean Center Line (mu) */}
            <line x1="170" y1="40" x2="170" y2="155" stroke="#047857" strokeWidth="2" strokeDasharray="3 3" />
            <text x="166" y="168" fontSize="11" fontWeight="bold" fill="#047857" fontFamily="sans-serif">μ (Mean)</text>

            {/* Standard Deviation Boundaries (-1.96 sigma, +1.96 sigma) */}
            <line x1="95" y1="95" x2="95" y2="150" stroke="#059669" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="245" y1="95" x2="245" y2="150" stroke="#059669" strokeWidth="1.5" strokeDasharray="2 2" />
            <text x="80" y="166" fontSize="9" fontWeight="bold" fill="#059669" fontFamily="sans-serif">-1.96σ</text>
            <text x="238" y="166" fontSize="9" fontWeight="bold" fill="#059669" fontFamily="sans-serif">+1.96σ</text>

            {/* Base axis */}
            <line x1="20" y1="150" x2="320" y2="150" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="text-center text-[11px] font-display font-medium text-emerald-800 bg-emerald-100/80 py-1 px-3 rounded-full border border-emerald-200 self-center">
          Empirical Validation • p &lt; 0.05 Statistical Significance
        </div>
      </div>
    );
  }

  // Product Management 2: 2x2 Prioritization Matrix / Growth Funnel
  return (
    <div className="w-full h-64 sm:h-72 bg-purple-50/50 rounded-3xl p-4 relative overflow-hidden flex flex-col justify-between border border-purple-200/60 shadow-inner">
      <div className="flex items-center justify-between text-xs font-display text-purple-900">
        <span className="font-semibold">Value vs. Effort Prioritization Matrix</span>
        <span className="font-mono bg-white/80 px-2 py-0.5 rounded-full border border-purple-200">
          RICE Framework
        </span>
      </div>

      <div className="relative flex-1 w-full grid grid-cols-2 grid-rows-2 gap-2 my-2">
        {/* Quadrant 1: High Value, Low Effort (Quick Wins) */}
        <div className="bg-purple-200/70 rounded-2xl p-3 flex flex-col justify-between border-2 border-pm-accent shadow-sm animate-pulse">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-display font-bold text-pm-deep">✨ Quick Wins (Build!)</span>
            <span className="text-[10px] font-mono text-pm-deep font-semibold">Priority #1</span>
          </div>
          <p className="text-[10px] text-purple-800 font-body">Maximum customer impact with low sprint effort.</p>
        </div>

        {/* Quadrant 2: High Value, High Effort (Major Projects) */}
        <div className="bg-white/60 rounded-2xl p-3 flex flex-col justify-between border border-purple-200">
          <span className="text-[11px] font-display font-semibold text-purple-800">🏔️ Major Projects</span>
          <p className="text-[10px] text-purple-700 font-body">Strategic bets requiring multi-sprint planning.</p>
        </div>

        {/* Quadrant 3: Low Value, Low Effort (Fill-ins) */}
        <div className="bg-white/60 rounded-2xl p-3 flex flex-col justify-between border border-purple-200">
          <span className="text-[11px] font-display font-semibold text-purple-800">🌱 Fill-ins</span>
          <p className="text-[10px] text-purple-700 font-body">Polish items when engineers have spare time.</p>
        </div>

        {/* Quadrant 4: Low Value, High Effort (Deprioritize) */}
        <div className="bg-red-50/60 rounded-2xl p-3 flex flex-col justify-between border border-red-200">
          <span className="text-[11px] font-display font-semibold text-red-700">🚫 Thankless Tasks</span>
          <p className="text-[10px] text-red-600 font-body">High complexity with minimal user upside. Skip!</p>
        </div>
      </div>

      <div className="text-center text-[11px] font-display font-medium text-purple-900 bg-purple-100/80 py-1 px-3 rounded-full border border-purple-200 self-center">
        Strategic PM Alignment • Defending Roadmap Trade-offs
      </div>
    </div>
  );
};
