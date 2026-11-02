import React from 'react';
import { CharacterAction, PropItem } from './types';
import { motion } from 'framer-motion';

interface FoxRigProps {
  action: CharacterAction;
  item?: PropItem;
  flipX?: boolean;
  reducedMotion?: boolean;
}

export const FoxRig: React.FC<FoxRigProps> = ({
  action,
  item,
  flipX = false,
  reducedMotion = false,
}) => {
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
          ? { y: [0, -28, 0], scaleY: [1, 1.1, 0.95, 1] }
          : isWalking
          ? { y: [0, -6, 0], rotate: [-2, 2, -2] }
          : isDancing
          ? { rotate: [-5, 5, -5], y: [0, -10, 0] }
          : isSad
          ? { y: 6, scaleY: 0.94 }
          : isSurprised
          ? { y: -14, scale: 1.08 }
          : { y: [0, -3, 0] } // idle breathing
      }
      transition={{
        repeat: isHopping || isSurprised ? 0 : Infinity,
        duration: isWalking ? 0.45 : isDancing ? 0.6 : 2.4,
        ease: 'easeInOut',
      }}
    >
      <svg viewBox="0 0 100 125" className="w-full h-full overflow-visible">
        {/* Soft ground shadow */}
        <ellipse cx="50" cy="116" rx="20" ry="5.5" fill="#4A3566" opacity="0.12" />

        {/* Big Bushy Fox Tail with White Tip & Pivot Motion */}
        <motion.g
          animate={
            reducedMotion
              ? {}
              : isDancing || isHopping
              ? { rotate: [-18, 18, -18] }
              : { rotate: [-6, 8, -6] }
          }
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          style={{ originX: '28px', originY: '95px' }}
        >
          {/* Main orange tail */}
          <path
            d="M 28 92 C 8 85, -2 60, 10 40 C 22 24, 38 42, 32 75 Z"
            fill="#ED7D47"
            stroke="#C95F2B"
            strokeWidth="1.8"
          />
          {/* Fluffy tail tip */}
          <path
            d="M 10 40 C 13 32, 22 24, 30 35 C 24 45, 16 48, 10 40 Z"
            fill="#FFF8F0"
            stroke="#C95F2B"
            strokeWidth="1.5"
          />
        </motion.g>

        {/* Hind Paws */}
        <ellipse cx="38" cy="112" rx="8" ry="4.5" fill="#C95F2B" />
        <ellipse cx="62" cy="112" rx="8" ry="4.5" fill="#C95F2B" />

        {/* Fox Body */}
        <path
          d="M 34 70 C 34 58, 66 58, 66 70 C 68 88, 64 108, 50 110 C 36 108, 32 88, 34 70 Z"
          fill="#ED7D47"
          stroke="#C95F2B"
          strokeWidth="1.8"
        />

        {/* Creamy Fox Bib / Chest Fur */}
        <path
          d="M 42 66 Q 50 82 58 66 Q 62 86 50 102 Q 38 86 42 66 Z"
          fill="#FFF8F0"
          stroke="#C95F2B"
          strokeWidth="1.2"
        />

        {/* Left Fox Ear */}
        <motion.g
          animate={
            reducedMotion
              ? {}
              : isSurprised
              ? { rotate: -15, scale: 1.1 }
              : { rotate: [-3, 4, -3] }
          }
          transition={{ repeat: Infinity, duration: 1.8 }}
          style={{ originX: '36px', originY: '38px' }}
        >
          <polygon points="30,42 42,42 34,16" fill="#ED7D47" stroke="#C95F2B" strokeWidth="1.6" />
          <polygon points="33,40 39,40 35,22" fill="#3D291F" />
          <polygon points="34,39 38,39 35,26" fill="#FFC9B3" />
        </motion.g>

        {/* Right Fox Ear */}
        <motion.g
          animate={
            reducedMotion
              ? {}
              : isSurprised
              ? { rotate: 15, scale: 1.1 }
              : { rotate: [3, -4, 3] }
          }
          transition={{ repeat: Infinity, duration: 2.1 }}
          style={{ originX: '64px', originY: '38px' }}
        >
          <polygon points="58,42 70,42 66,16" fill="#ED7D47" stroke="#C95F2B" strokeWidth="1.6" />
          <polygon points="61,40 67,40 65,22" fill="#3D291F" />
          <polygon points="62,39 66,39 65,26" fill="#FFC9B3" />
        </motion.g>

        {/* Fox Head */}
        <ellipse cx="50" cy="46" rx="20" ry="16" fill="#ED7D47" stroke="#C95F2B" strokeWidth="1.8" />

        {/* White Cheeks */}
        <path
          d="M 33 46 Q 30 54 38 58 Q 50 56 50 48 Z"
          fill="#FFF8F0"
          stroke="#C95F2B"
          strokeWidth="1.2"
        />
        <path
          d="M 67 46 Q 70 54 62 58 Q 50 56 50 48 Z"
          fill="#FFF8F0"
          stroke="#C95F2B"
          strokeWidth="1.2"
        />

        {/* Curious Fox Eyes */}
        <motion.g
          animate={reducedMotion ? {} : { scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.9, 0.93, 0.96, 1] }}
          style={{ originY: '45px' }}
        >
          <ellipse cx="43" cy="44" rx="2.8" ry="3.8" fill="#3A281E" />
          <circle cx="42" cy="43" r="1.1" fill="#FFFFFF" />
          <ellipse cx="57" cy="44" rx="2.8" ry="3.8" fill="#3A281E" />
          <circle cx="56" cy="43" r="1.1" fill="#FFFFFF" />
        </motion.g>

        {/* Little Snout & Nose */}
        <ellipse cx="50" cy="52" rx="4.5" ry="3" fill="#FFF8F0" />
        <ellipse cx="50" cy="50" rx="2.4" ry="1.8" fill="#3A281E" />

        {/* Curious / Happy Smile */}
        <path
          d="M 47 54 Q 50 57 53 54"
          fill="none"
          stroke="#3A281E"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Whiskers */}
        <line x1="32" y1="51" x2="25" y2="49" stroke="#DFC29D" strokeWidth="1" />
        <line x1="32" y1="54" x2="26" y2="55" stroke="#DFC29D" strokeWidth="1" />
        <line x1="68" y1="51" x2="75" y2="49" stroke="#DFC29D" strokeWidth="1" />
        <line x1="68" y1="54" x2="74" y2="55" stroke="#DFC29D" strokeWidth="1" />

        {/* Left Arm / Paw */}
        <motion.g
          animate={
            reducedMotion
              ? {}
              : isWaving
              ? { rotate: [-20, 25, -20] }
              : isPointing
              ? { rotate: 45, x: 5 }
              : { rotate: 0 }
          }
          style={{ originX: '36px', originY: '72px' }}
        >
          <ellipse cx="34" cy="76" rx="4.5" ry="9" fill="#ED7D47" stroke="#C95F2B" strokeWidth="1.5" />
          <ellipse cx="33" cy="83" rx="4" ry="3" fill="#3A281E" />
        </motion.g>

        {/* Right Arm / Paw (Holding Items) */}
        <motion.g
          animate={
            reducedMotion
              ? {}
              : isWaving
              ? { rotate: [20, -35, 20] }
              : isThinking
              ? { rotate: -40, y: -8 }
              : { rotate: 0 }
          }
          style={{ originX: '64px', originY: '72px' }}
        >
          <ellipse cx="66" cy="76" rx="4.5" ry="9" fill="#ED7D47" stroke="#C95F2B" strokeWidth="1.5" />
          <ellipse cx="67" cy="83" rx="4" ry="3" fill="#3A281E" />

          {/* Golden Ticket / Invite Voucher Prop */}
          {item === 'scroll' && (
            <motion.g
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ originX: '68px', originY: '84px' }}
            >
              <rect
                x="68"
                y="74"
                width="16"
                height="11"
                rx="2"
                fill="#FFEF9C"
                stroke="#D6A738"
                strokeWidth="1.2"
              />
              <path d="M 71 78 L 81 78" stroke="#D6A738" strokeWidth="1" strokeDasharray="1 1" />
              <circle cx="76" cy="82" r="1.5" fill="#E8963D" />
            </motion.g>
          )}

          {/* Berry Basket or Carrot */}
          {item === 'carrot' && (
            <g transform="translate(68, 76)">
              <polygon points="0,0 12,3 3,12" fill="#FF8A48" />
              <path d="M 0,0 Q -4,-4 -6,0 Q -3,-6 2,-3" fill="#52B788" />
            </g>
          )}
        </motion.g>
      </svg>
    </motion.div>
  );
};
