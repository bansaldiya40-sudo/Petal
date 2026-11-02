import React from 'react';
import { CharacterAction, PropItem } from './types';
import { motion } from 'framer-motion';

interface FairyRigProps {
  action: CharacterAction;
  item?: PropItem;
  flipX?: boolean;
  reducedMotion?: boolean;
}

export const FairyRig: React.FC<FairyRigProps> = ({
  action,
  item,
  flipX = false,
  reducedMotion = false,
}) => {
  const isWaving = action === 'wave';
  const isPointing = action === 'point';
  const isFlying = action === 'fly-across';
  const isThinking = action === 'think';
  const isCelebrating = action === 'celebrate' || action === 'happy-dance';
  const isSurprised = action === 'surprised';

  return (
    <motion.div
      className="relative w-28 h-36 flex items-center justify-center select-none"
      style={{ transform: flipX ? 'scaleX(-1)' : 'scaleX(1)' }}
      animate={
        reducedMotion
          ? {}
          : isFlying
          ? { y: [0, -20, 0], x: [0, 8, 0] }
          : isCelebrating
          ? { y: [0, -14, 0], rotate: [-4, 4, -4] }
          : { y: [0, -8, 0] } // gentle hovering float
      }
      transition={{
        repeat: Infinity,
        duration: isFlying ? 1.5 : 2.2,
        ease: 'easeInOut',
      }}
    >
      <svg viewBox="0 0 100 125" className="w-full h-full overflow-visible">
        {/* Shadow */}
        <ellipse cx="50" cy="116" rx="18" ry="4.5" fill="#9670F5" opacity="0.1" />

        {/* Fluttering Left Wing */}
        <motion.path
          d="M 44 65 C 10 40, 2 20, 24 28 C 36 34, 42 55, 45 65 Z"
          fill="#D9C8FF"
          stroke="#B196F5"
          strokeWidth="1.2"
          opacity="0.8"
          animate={reducedMotion ? {} : { scaleX: [1, 0.4, 1], rotate: [-10, -25, -10] }}
          transition={{ repeat: Infinity, duration: 0.28, ease: 'easeInOut' }}
          style={{ originX: '45px', originY: '65px' }}
        />

        {/* Fluttering Right Wing */}
        <motion.path
          d="M 56 65 C 90 40, 98 20, 76 28 C 64 34, 58 55, 55 65 Z"
          fill="#D9C8FF"
          stroke="#B196F5"
          strokeWidth="1.2"
          opacity="0.8"
          animate={reducedMotion ? {} : { scaleX: [1, 0.4, 1], rotate: [10, 25, 10] }}
          transition={{ repeat: Infinity, duration: 0.28, ease: 'easeInOut' }}
          style={{ originX: '55px', originY: '65px' }}
        />

        {/* Fairy Legs / Slippers */}
        <line x1="44" y1="95" x2="42" y2="110" stroke="#FFD9C0" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="40" cy="112" rx="4" ry="2.5" fill="#B196F5" />
        <line x1="56" y1="95" x2="58" y2="110" stroke="#FFD9C0" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="60" cy="112" rx="4" ry="2.5" fill="#B196F5" />

        {/* Fairy Builder Tunic / Dress */}
        <path
          d="M 40 68 Q 50 64 60 68 L 68 96 Q 50 102 32 96 Z"
          fill="#9670F5"
          stroke="#6C3FE0"
          strokeWidth="1.5"
        />

        {/* Builder Toolbelt with Gold Pouch */}
        <path d="M 36 78 Q 50 82 64 78" stroke="#F5A97D" strokeWidth="3" fill="none" />
        <rect x="47" y="77" width="7" height="6" rx="1.5" fill="#FFF0B8" stroke="#E6B82E" strokeWidth="1" />

        {/* Head and Hair */}
        <circle cx="50" cy="46" r="15" fill="#FFD9C0" />
        {/* Lavender Hair Bun */}
        <circle cx="50" cy="34" r="14" fill="#6C3FE0" />
        <circle cx="50" cy="22" r="7" fill="#6C3FE0" />
        {/* Flower Tiara */}
        <circle cx="44" cy="33" r="3" fill="#FFF0B8" />
        <circle cx="50" cy="31" r="3.5" fill="#FFD6E0" />
        <circle cx="56" cy="33" r="3" fill="#CFF2E0" />

        {/* Cheeks */}
        <circle cx="42" cy="50" r="3.5" fill="#FFD6E0" opacity="0.7" />
        <circle cx="58" cy="50" r="3.5" fill="#FFD6E0" opacity="0.7" />

        {/* Eyes (Blinking Animation) */}
        <motion.ellipse
          cx="45"
          cy="45"
          rx="1.8"
          ry={isSurprised ? 3 : 2.5}
          fill="#4A3566"
          animate={reducedMotion ? {} : { scaleY: [1, 1, 0.1, 1] }}
          transition={{ repeat: Infinity, duration: 3.8, times: [0, 0.9, 0.93, 1] }}
        />
        <motion.ellipse
          cx="55"
          cy="45"
          rx="1.8"
          ry={isSurprised ? 3 : 2.5}
          fill="#4A3566"
          animate={reducedMotion ? {} : { scaleY: [1, 1, 0.1, 1] }}
          transition={{ repeat: Infinity, duration: 3.8, times: [0, 0.9, 0.93, 1] }}
        />
        <path d="M 48 53 Q 50 56 52 53" stroke="#855627" strokeWidth="1.2" fill="none" />

        {/* Left Arm / Sparkle Wand Hand */}
        <motion.g
          animate={
            isWaving
              ? { rotate: [-15, 20, -15] }
              : isPointing
              ? { rotate: -30 }
              : { rotate: [0, 6, 0] }
          }
          style={{ originX: '36px', originY: '68px' }}
        >
          <line x1="36" y1="68" x2="24" y2="52" stroke="#FFD9C0" strokeWidth="4" strokeLinecap="round" />
          {/* Wand with Golden Star Tip */}
          <line x1="24" y1="52" x2="16" y2="36" stroke="#855627" strokeWidth="2" strokeLinecap="round" />
          <polygon
            points="16,32 18,36 22,36 19,39 20,43 16,40 12,43 13,39 10,36 14,36"
            fill="#FFF0B8"
            stroke="#E6B82E"
            strokeWidth="1"
          />
        </motion.g>

        {/* Right Arm */}
        <motion.line
          x1="64"
          y1="68"
          x2="76"
          y2="76"
          stroke="#FFD9C0"
          strokeWidth="4"
          strokeLinecap="round"
          animate={isCelebrating ? { x2: 78, y2: 50 } : {}}
        />

        {/* Held Prop */}
        {item === 'scroll' && (
          <g transform="translate(68, 65)">
            <rect x="0" y="0" width="12" height="18" rx="2" fill="#FFF8EE" stroke="#855627" strokeWidth="1" />
            <line x1="2" y1="5" x2="10" y2="5" stroke="#9670F5" strokeWidth="1" />
            <line x1="2" y1="9" x2="10" y2="9" stroke="#9670F5" strokeWidth="1" />
          </g>
        )}
      </svg>
    </motion.div>
  );
};
