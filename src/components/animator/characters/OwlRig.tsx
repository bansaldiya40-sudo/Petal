import React from 'react';
import { CharacterAction, PropItem } from './types';
import { motion } from 'framer-motion';

interface OwlRigProps {
  action: CharacterAction;
  item?: PropItem;
  flipX?: boolean;
  reducedMotion?: boolean;
}

export const OwlRig: React.FC<OwlRigProps> = ({
  action,
  item,
  flipX = false,
  reducedMotion = false,
}) => {
  const isThinking = action === 'think';
  const isNodding = action === 'nod';
  const isSurprised = action === 'surprised';
  const isPointing = action === 'point';
  const isCelebrating = action === 'celebrate' || action === 'happy-dance';

  return (
    <motion.div
      className="relative w-28 h-36 flex items-center justify-center select-none"
      style={{ transform: flipX ? 'scaleX(-1)' : 'scaleX(1)' }}
      animate={
        reducedMotion
          ? {}
          : isNodding
          ? { y: [0, 6, 0] }
          : isCelebrating
          ? { y: [0, -12, 0], rotate: [-3, 3, -3] }
          : { y: [0, -3, 0] }
      }
      transition={{ repeat: Infinity, duration: isNodding ? 0.6 : 2.5 }}
    >
      <svg viewBox="0 0 100 125" className="w-full h-full overflow-visible">
        {/* Shadow */}
        <ellipse cx="50" cy="116" rx="20" ry="5" fill="#1F8C4F" opacity="0.1" />

        {/* Tail Feathers */}
        <path d="M 44 95 L 50 114 L 56 95 Z" fill="#C49A6C" stroke="#855627" strokeWidth="1.2" />

        {/* Owl Feet Claws */}
        <path d="M 38 110 L 36 116 M 42 110 L 42 116 M 46 110 L 48 116" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 54 110 L 52 116 M 58 110 L 58 116 M 62 110 L 64 116" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />

        {/* Body */}
        <ellipse cx="50" cy="80" rx="22" ry="26" fill="#EAD7BA" stroke="#855627" strokeWidth="2" />
        {/* Belly Feathers Pattern */}
        <path d="M 42 74 Q 50 78 58 74" stroke="#855627" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M 40 84 Q 50 88 60 84" stroke="#855627" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M 44 94 Q 50 98 56 94" stroke="#855627" strokeWidth="1.5" fill="none" opacity="0.5" />

        {/* Swiveling Head */}
        <motion.g
          animate={
            reducedMotion
              ? {}
              : isThinking
              ? { rotate: [0, 18, -12, 0] }
              : { rotate: [-2, 2, -2] }
          }
          transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
          style={{ originX: '50px', originY: '48px' }}
        >
          {/* Ear Tufts */}
          <polygon points="34,22 42,34 30,34" fill="#C49A6C" stroke="#855627" strokeWidth="1.5" />
          <polygon points="66,22 70,34 58,34" fill="#C49A6C" stroke="#855627" strokeWidth="1.5" />

          {/* Head Circle */}
          <circle cx="50" cy="46" r="20" fill="#EAD7BA" stroke="#855627" strokeWidth="2" />

          {/* Round Eyeglass Frames */}
          <circle cx="41" cy="44" r="9" fill="#FFFDF9" stroke="#E6B82E" strokeWidth="2.2" />
          <circle cx="59" cy="44" r="9" fill="#FFFDF9" stroke="#E6B82E" strokeWidth="2.2" />
          <line x1="50" y1="44" x2="50" y2="44" stroke="#E6B82E" strokeWidth="3" />

          {/* Eyes (Blinking Animation) */}
          <motion.circle
            cx="41"
            cy="44"
            r={isSurprised ? 4.5 : 3.5}
            fill="#4A3566"
            animate={reducedMotion ? {} : { scaleY: [1, 1, 0.1, 1] }}
            transition={{ repeat: Infinity, duration: 3.6, times: [0, 0.9, 0.93, 1] }}
          />
          <circle cx="42" cy="43" r="1" fill="#FFF" />
          <motion.circle
            cx="59"
            cy="44"
            r={isSurprised ? 4.5 : 3.5}
            fill="#4A3566"
            animate={reducedMotion ? {} : { scaleY: [1, 1, 0.1, 1] }}
            transition={{ repeat: Infinity, duration: 3.6, times: [0, 0.9, 0.93, 1] }}
          />
          <circle cx="60" cy="43" r="1" fill="#FFF" />

          {/* Cute Orange Beak */}
          <polygon points="50,48 46,56 54,56" fill="#F5A97D" stroke="#D97706" strokeWidth="1" />
        </motion.g>

        {/* Left Wing / Arm holding Magnifying Glass */}
        <motion.g
          animate={isPointing ? { rotate: -25 } : {}}
          style={{ originX: '28px', originY: '70px' }}
        >
          <path d="M 30 70 Q 18 84 28 96 Q 34 84 32 72 Z" fill="#C49A6C" stroke="#855627" strokeWidth="1.5" />
          {/* Magnifying Glass */}
          <circle cx="16" cy="94" r="8" fill="#EEFAF3" stroke="#E6B82E" strokeWidth="2" opacity="0.9" />
          <line x1="22" y1="100" x2="28" y2="108" stroke="#855627" strokeWidth="2.5" strokeLinecap="round" />
        </motion.g>

        {/* Right Wing */}
        <path d="M 70 70 Q 82 84 72 96 Q 66 84 68 72 Z" fill="#C49A6C" stroke="#855627" strokeWidth="1.5" />
      </svg>
    </motion.div>
  );
};
