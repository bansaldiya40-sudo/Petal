import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Small Swinging Signboard Prop (Holds formula or takeaway max 6 words) ---
interface SignboardPropProps {
  text?: string;
  position?: 'top-right' | 'top-left' | 'center-top';
  reducedMotion?: boolean;
}

export const SignboardProp: React.FC<SignboardPropProps> = ({
  text,
  position = 'top-right',
  reducedMotion = false,
}) => {
  if (!text) return null;

  const posClasses =
    position === 'top-left'
      ? 'top-2 left-2 sm:top-3 sm:left-6'
      : position === 'center-top'
      ? 'top-2 left-1/2 -translate-x-1/2 sm:top-3'
      : 'top-2 right-2 sm:top-3 sm:right-6';

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      transition={{ type: 'spring', damping: 14, stiffness: 180 }}
      className={`absolute z-30 flex flex-col items-center select-none pointer-events-none scale-75 sm:scale-100 origin-top-right ${posClasses}`}
    >
      {/* Hanging vines */}
      <div className="flex gap-6 sm:gap-12 w-full justify-center">
        <div className="w-0.5 h-2.5 sm:h-5 bg-[#689F38] relative">
          <div className="absolute -left-1 top-1 sm:top-2 w-1.5 h-1.5 bg-[#8BC34A] rounded-full" />
        </div>
        <div className="w-0.5 h-2.5 sm:h-5 bg-[#689F38] relative">
          <div className="absolute -right-1 top-1 sm:top-2 w-1.5 h-1.5 bg-[#8BC34A] rounded-full" />
        </div>
      </div>

      {/* Swaying Wooden Signboard */}
      <motion.div
        animate={reducedMotion ? {} : { rotate: [-2, 2.5, -2] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        style={{ originY: '0%' }}
        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#FFFDF7] border-2 border-[#D4A373] shadow-md rounded-xl flex items-center gap-1.5 sm:gap-2 max-w-[210px] sm:max-w-[260px] text-center"
      >
        <span className="text-sm sm:text-base">🏷️</span>
        <span className="font-serif font-bold text-xs sm:text-sm md:text-base text-[#5D4037] tracking-tight leading-tight">
          {text}
        </span>
      </motion.div>
    </motion.div>
  );
};

// --- Tipping Balance Scale Prop ---
interface ScalePropProps {
  tipped?: 'left' | 'right' | 'balanced';
}

export const ScaleProp: React.FC<ScalePropProps> = ({ tipped = 'balanced' }) => {
  const rotation = tipped === 'left' ? -15 : tipped === 'right' ? 15 : 0;

  return (
    <div className="w-24 h-24 relative select-none">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Base & Stand */}
        <path d="M 35 95 L 65 95 L 53 45 L 47 45 Z" fill="#D4A373" stroke="#9E6E3E" strokeWidth="1.5" />
        <circle cx="50" cy="40" r="4" fill="#E8B923" stroke="#A67C00" strokeWidth="1.5" />

        {/* Tilting Beam */}
        <motion.g
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', damping: 10, stiffness: 120 }}
          style={{ originX: '50px', originY: '40px' }}
        >
          <line x1="15" y1="40" x2="85" y2="40" stroke="#E8B923" strokeWidth="3" strokeLinecap="round" />

          {/* Left Pan */}
          <line x1="20" y1="40" x2="12" y2="60" stroke="#A67C00" strokeWidth="1" />
          <line x1="20" y1="40" x2="28" y2="60" stroke="#A67C00" strokeWidth="1" />
          <path d="M 8 60 Q 20 68 32 60 Z" fill="#FED856" stroke="#D1981F" strokeWidth="1.2" />

          {/* Right Pan */}
          <line x1="80" y1="40" x2="72" y2="60" stroke="#A67C00" strokeWidth="1" />
          <line x1="80" y1="40" x2="88" y2="60" stroke="#A67C00" strokeWidth="1" />
          <path d="M 68 60 Q 80 68 92 60 Z" fill="#FED856" stroke="#D1981F" strokeWidth="1.2" />
        </motion.g>
      </svg>
    </div>
  );
};

// --- Stack of Golden Coins Prop ---
export const CoinsProp: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="flex flex-col-reverse items-center -space-y-3">
      {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, y: -10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: i * 0.1, type: 'spring' }}
          className="w-7 h-4 bg-[#FED856] border border-[#D1981F] rounded-full shadow-sm flex items-center justify-center"
        >
          <span className="text-[9px] font-bold text-[#784A0F]">🍯</span>
        </motion.div>
      ))}
    </div>
  );
};
