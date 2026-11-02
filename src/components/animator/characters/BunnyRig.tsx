import React from 'react';
import { CharacterAction, PropItem } from './types';
import { motion } from 'framer-motion';

interface BunnyRigProps {
  action: CharacterAction;
  item?: PropItem;
  flipX?: boolean;
  reducedMotion?: boolean;
}

export const BunnyRig: React.FC<BunnyRigProps> = ({
  action,
  item,
  flipX = false,
  reducedMotion = false,
}) => {
  // Action state derived animations
  const isWalking = action === 'walk-in' || action === 'walk-out' || action === 'run';
  const isHopping = action === 'hop' || action === 'jump';
  const isDancing = action === 'happy-dance' || action === 'celebrate';
  const isThinking = action === 'think';
  const isSad = action === 'sad-slump';
  const isWaving = action === 'wave';
  const isPointing = action === 'point';
  const isSurprised = action === 'surprised';

  return (
    <motion.div
      className="relative w-28 h-36 flex items-center justify-center select-none"
      style={{ transform: flipX ? 'scaleX(-1)' : 'scaleX(1)' }}
      animate={
        reducedMotion
          ? {}
          : isHopping
          ? { y: [0, -32, 0], scaleY: [1, 1.15, 0.9, 1] }
          : isWalking
          ? { y: [0, -8, 0], rotate: [-2, 2, -2] }
          : isDancing
          ? { rotate: [-6, 6, -6], y: [0, -10, 0] }
          : isSad
          ? { y: 8, scaleY: 0.92 }
          : isSurprised
          ? { y: -16, scale: 1.1 }
          : { y: [0, -3, 0] } // idle breathing
      }
      transition={{
        repeat: isHopping || isSurprised ? 0 : Infinity,
        duration: isWalking ? 0.45 : isDancing ? 0.6 : 2.5,
        ease: 'easeInOut',
      }}
    >
      <svg viewBox="0 0 100 125" className="w-full h-full overflow-visible">
        {/* Shadow */}
        <ellipse cx="50" cy="116" rx="22" ry="6" fill="#4A3566" opacity="0.12" />

        {/* Fluffy Tail */}
        <motion.circle
          cx="28"
          cy="92"
          r="8"
          fill="#FFFDF9"
          stroke="#DFC29D"
          strokeWidth="1.5"
          animate={reducedMotion ? {} : { scale: [1, 1.15, 1], x: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />

        {/* Bunny Feet */}
        <ellipse cx="40" cy="112" rx="9" ry="5" fill="#FFFDF9" stroke="#DFC29D" strokeWidth="1.5" />
        <ellipse cx="60" cy="112" rx="9" ry="5" fill="#FFFDF9" stroke="#DFC29D" strokeWidth="1.5" />

        {/* Body */}
        <ellipse cx="50" cy="85" rx="20" ry="24" fill="#FFF8EE" stroke="#DFC29D" strokeWidth="2" />

        {/* Honey / Carrot Gardener Apron */}
        <path
          d="M 38 72 L 62 72 L 66 100 L 34 100 Z"
          fill="#CFF2E0"
          stroke="#83D9A7"
          strokeWidth="1.5"
        />
        {/* Apron Pocket */}
        <path d="M 43 86 Q 50 94 57 86 Z" fill="#EEFAF3" stroke="#83D9A7" strokeWidth="1.2" />

        {/* Left Ear with Pivot & Bounce */}
        <motion.g
          animate={
            reducedMotion
              ? {}
              : isHopping || isSurprised
              ? { rotate: [-10, -25, -10] }
              : isSad
              ? { rotate: -35 }
              : { rotate: [-4, 4, -4] }
          }
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          style={{ originX: '42px', originY: '42px' }}
        >
          <path
            d="M 42 42 C 34 15, 30 2, 38 4 C 44 6, 46 22, 45 42 Z"
            fill="#FFF8EE"
            stroke="#DFC29D"
            strokeWidth="2"
          />
          <path d="M 40 38 C 36 20, 34 10, 38 8 C 41 10, 43 24, 42 38 Z" fill="#FFD6E0" opacity="0.8" />
        </motion.g>

        {/* Right Ear with Pivot & Bounce */}
        <motion.g
          animate={
            reducedMotion
              ? {}
              : isHopping || isSurprised
              ? { rotate: [10, 25, 10] }
              : isSad
              ? { rotate: 35 }
              : { rotate: [4, -4, 4] }
          }
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          style={{ originX: '58px', originY: '42px' }}
        >
          <path
            d="M 58 42 C 66 15, 70 2, 62 4 C 56 6, 54 22, 55 42 Z"
            fill="#FFF8EE"
            stroke="#DFC29D"
            strokeWidth="2"
          />
          <path d="M 60 38 C 64 20, 66 10, 62 8 C 59 10, 57 24, 58 38 Z" fill="#FFD6E0" opacity="0.8" />
        </motion.g>

        {/* Head */}
        <motion.g
          animate={
            isThinking
              ? { rotate: 12, y: -2 }
              : isSad
              ? { y: 4, rotate: -4 }
              : isWaving
              ? { rotate: [0, -3, 0] }
              : {}
          }
        >
          <circle cx="50" cy="48" r="19" fill="#FFF8EE" stroke="#DFC29D" strokeWidth="2" />
          {/* Cheeks */}
          <circle cx="39" cy="54" r="4.5" fill="#FFD6E0" opacity="0.6" />
          <circle cx="61" cy="54" r="4.5" fill="#FFD6E0" opacity="0.6" />

          {/* Eyes (Blinking Animation) */}
          <motion.ellipse
            cx="43"
            cy="46"
            rx="2.2"
            ry={isSurprised ? 3.5 : 3}
            fill="#4A3566"
            animate={reducedMotion ? {} : { scaleY: [1, 1, 0.1, 1] }}
            transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.9, 0.93, 1] }}
          />
          <motion.ellipse
            cx="57"
            cy="46"
            rx="2.2"
            ry={isSurprised ? 3.5 : 3}
            fill="#4A3566"
            animate={reducedMotion ? {} : { scaleY: [1, 1, 0.1, 1] }}
            transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.9, 0.93, 1] }}
          />

          {/* Pink Nose & Whiskers */}
          <polygon points="50,51 47,48 53,48" fill="#F5A97D" />
          <path d="M 50 51 Q 47 55 45 53" stroke="#855627" strokeWidth="1.2" fill="none" />
          <path d="M 50 51 Q 53 55 55 53" stroke="#855627" strokeWidth="1.2" fill="none" />

          {/* Whiskers */}
          <line x1="33" y1="50" x2="23" y2="48" stroke="#DFC29D" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="33" y1="53" x2="24" y2="54" stroke="#DFC29D" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="67" y1="50" x2="77" y2="48" stroke="#DFC29D" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="67" y1="53" x2="76" y2="54" stroke="#DFC29D" strokeWidth="1.2" strokeLinecap="round" />
        </motion.g>

        {/* Left Arm / Paw */}
        <motion.path
          d="M 33 75 Q 26 82 32 88"
          stroke="#FFF8EE"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          animate={
            isWaving
              ? { d: 'M 33 75 Q 16 60 22 45', rotate: [-10, 15, -10] }
              : isThinking
              ? { d: 'M 33 75 Q 38 60 44 54' }
              : {}
          }
          transition={{ repeat: isWaving ? Infinity : 0, duration: 0.6 }}
        />

        {/* Right Arm / Paw */}
        <motion.path
          d="M 67 75 Q 74 82 68 88"
          stroke="#FFF8EE"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          animate={
            isPointing
              ? { d: 'M 67 75 Q 85 70 95 68' }
              : isDancing
              ? { d: 'M 67 75 Q 82 60 76 48' }
              : {}
          }
        />

        {/* Held Prop if carrying */}
        {item === 'carrot' && (
          <g transform="translate(68, 70) rotate(25)">
            <polygon points="0,0 8,24 -8,24" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
            <path d="M 0 0 Q -4 -8 -6 -10 M 0 0 Q 0 -9 2 -11 M 0 0 Q 4 -8 6 -9" stroke="#10B981" strokeWidth="1.5" />
          </g>
        )}
        {item === 'carrot-basket' && (
          <g transform="translate(56, 75)">
            <ellipse cx="10" cy="12" rx="14" ry="9" fill="#EAD7BA" stroke="#855627" strokeWidth="1.5" />
            <polygon points="4,4 7,-8 11,-8" fill="#F59E0B" />
            <polygon points="12,5 15,-6 18,-6" fill="#F59E0B" />
            <path d="M 3 6 Q 10 -4 18 6" stroke="#855627" strokeWidth="1.5" fill="none" />
          </g>
        )}
        {item === 'honey-jar' && (
          <g transform="translate(62, 70)">
            <rect x="0" y="4" width="16" height="18" rx="4" fill="#FFF0B8" stroke="#E6B82E" strokeWidth="1.5" />
            <rect x="3" y="0" width="10" height="4" rx="1.5" fill="#F5A97D" stroke="#855627" strokeWidth="1" />
            <text x="5" y="16" fontSize="9">🍯</text>
          </g>
        )}
      </svg>
    </motion.div>
  );
};
