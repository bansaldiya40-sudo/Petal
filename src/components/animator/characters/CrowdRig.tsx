import React from 'react';
import { CharacterAction, PropItem } from './types';
import { motion, AnimatePresence } from 'framer-motion';

interface CrowdRigProps {
  action: CharacterAction;
  item?: PropItem;
  flipX?: boolean;
  reducedMotion?: boolean;
}

export const CrowdRig: React.FC<CrowdRigProps> = ({
  action,
  flipX = false,
  reducedMotion = false,
}) => {
  const isMultiplying = action === 'multiply' || action === 'celebrate';
  const isSad = action === 'sad-slump' || action === 'walk-out';
  const isCheering = action === 'happy-dance' || action === 'celebrate';

  return (
    <motion.div
      className="relative w-44 h-36 flex items-end justify-center select-none"
      style={{ transform: flipX ? 'scaleX(-1)' : 'scaleX(1)' }}
      animate={
        reducedMotion
          ? {}
          : isCheering
          ? { y: [0, -6, 0] }
          : isSad
          ? { opacity: 0.35, x: 20 }
          : { y: [0, -2, 0] }
      }
      transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 160 120" className="w-full h-full overflow-visible">
        {/* Soft Crowd Shadow */}
        <ellipse cx="80" cy="112" rx="60" ry="8" fill="#4A3566" opacity="0.1" />

        {/* --- Animal 1: Little Bluebird on the left --- */}
        <motion.g
          animate={reducedMotion ? {} : { y: [0, -8, 0], rotate: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
        >
          <ellipse cx="28" cy="92" rx="11" ry="9" fill="#90CDF4" stroke="#4299E1" strokeWidth="1.2" />
          <circle cx="34" cy="88" r="6" fill="#90CDF4" stroke="#4299E1" strokeWidth="1.2" />
          <polygon points="39,87 45,89 39,91" fill="#ECC94B" />
          <circle cx="36" cy="87" r="1.2" fill="#2D3748" />
          {/* Wing flutter */}
          <path d="M 22 91 Q 17 84 27 88 Z" fill="#63B3ED" />
        </motion.g>

        {/* --- Animal 2: Tiny Hedgehog in the center-left --- */}
        <motion.g
          animate={reducedMotion ? {} : { y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
        >
          {/* Spikes */}
          <path
            d="M 44 98 Q 48 80 56 86 Q 62 76 68 85 Q 74 78 78 88 Q 84 84 84 98 Z"
            fill="#795548"
            stroke="#5D4037"
            strokeWidth="1.2"
          />
          {/* Snout */}
          <ellipse cx="50" cy="98" rx="8" ry="6" fill="#D7CCC8" stroke="#8D6E63" strokeWidth="1" />
          <circle cx="45" cy="96" r="1.5" fill="#3E2723" />
          <circle cx="48" cy="95" r="1" fill="#3E2723" />
        </motion.g>

        {/* --- Animal 3: Cheerful Forest Mouse in center --- */}
        <motion.g
          animate={reducedMotion ? {} : { y: [0, -10, 0], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: 0.1 }}
        >
          {/* Round Ears */}
          <circle cx="82" cy="74" r="5" fill="#E2E8F0" stroke="#A0AEC0" strokeWidth="1" />
          <circle cx="82" cy="74" r="2.5" fill="#FED7D7" />
          <circle cx="94" cy="74" r="5" fill="#E2E8F0" stroke="#A0AEC0" strokeWidth="1" />
          <circle cx="94" cy="74" r="2.5" fill="#FED7D7" />
          {/* Body */}
          <ellipse cx="88" cy="92" rx="10" ry="12" fill="#E2E8F0" stroke="#A0AEC0" strokeWidth="1.2" />
          {/* Head */}
          <circle cx="88" cy="80" r="7" fill="#E2E8F0" stroke="#A0AEC0" strokeWidth="1.2" />
          <circle cx="86" cy="79" r="1" fill="#2D3748" />
          <circle cx="90" cy="79" r="1" fill="#2D3748" />
          <circle cx="88" cy="82" r="1.2" fill="#E53E3E" />
          {/* Cheering hands */}
          <path d="M 82 86 L 78 80" stroke="#A0AEC0" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 94 86 L 98 80" stroke="#A0AEC0" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>

        {/* --- Animal 4 & 5: Spawn when multiplying / viral growth! --- */}
        <AnimatePresence>
          {isMultiplying && (
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            >
              {/* Little Yellow Chick */}
              <g transform="translate(110, 84)">
                <ellipse cx="12" cy="14" rx="9" ry="8" fill="#FEFCBF" stroke="#D69E2E" strokeWidth="1" />
                <circle cx="12" cy="7" r="6" fill="#FEFCBF" stroke="#D69E2E" strokeWidth="1" />
                <polygon points="17,6 22,8 17,10" fill="#DD6B20" />
                <circle cx="14" cy="6" r="1" fill="#2D3748" />
              </g>

              {/* Baby Bunny */}
              <g transform="translate(132, 76)">
                {/* Ears */}
                <ellipse cx="6" cy="6" rx="2" ry="7" fill="#FFF5F5" stroke="#FEB2B2" strokeWidth="1" />
                <ellipse cx="12" cy="6" rx="2" ry="7" fill="#FFF5F5" stroke="#FEB2B2" strokeWidth="1" />
                <circle cx="9" cy="16" r="7" fill="#FFF5F5" stroke="#FEB2B2" strokeWidth="1" />
                <ellipse cx="9" cy="24" rx="8" ry="8" fill="#FFF5F5" stroke="#FEB2B2" strokeWidth="1" />
                <circle cx="7" cy="15" r="1" fill="#2D3748" />
                <circle cx="11" cy="15" r="1" fill="#2D3748" />
              </g>

              {/* Celebration Pop Sparkles */}
              <motion.g
                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                <circle cx="122" cy="65" r="2.5" fill="#ECC94B" />
                <circle cx="142" cy="68" r="2" fill="#F687B3" />
                <circle cx="106" cy="72" r="1.8" fill="#68D391" />
              </motion.g>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </motion.div>
  );
};
