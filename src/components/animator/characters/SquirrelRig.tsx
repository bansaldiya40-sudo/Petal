import React from 'react';
import { CharacterAction, PropItem } from './types';
import { motion } from 'framer-motion';

interface SquirrelRigProps {
  action: CharacterAction;
  item?: PropItem;
  flipX?: boolean;
  reducedMotion?: boolean;
}

export const SquirrelRig: React.FC<SquirrelRigProps> = ({
  action,
  item,
  flipX = false,
  reducedMotion = false,
}) => {
  const isWalking = action === 'walk-in' || action === 'walk-out' || action === 'run';
  const isHopping = action === 'hop' || action === 'jump';
  const isDancing = action === 'happy-dance' || action === 'celebrate';
  const isSurprised = action === 'surprised';

  return (
    <motion.div
      className="relative w-28 h-36 flex items-center justify-center select-none"
      style={{ transform: flipX ? 'scaleX(-1)' : 'scaleX(1)' }}
      animate={
        reducedMotion
          ? {}
          : isHopping
          ? { y: [0, -30, 0], scaleY: [1, 1.15, 0.9, 1] }
          : isWalking
          ? { y: [0, -6, 0], rotate: [-2, 2, -2] }
          : isDancing
          ? { rotate: [-6, 6, -6], y: [0, -8, 0] }
          : { y: [0, -2.5, 0] }
      }
      transition={{
        repeat: isHopping ? 0 : Infinity,
        duration: isWalking ? 0.4 : isDancing ? 0.55 : 2.2,
        ease: 'easeInOut',
      }}
    >
      <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible">
        {/* Soft shadow */}
        <ellipse cx="50" cy="112" rx="18" ry="5" fill="#4A3566" opacity="0.12" />

        {/* Big Fluffy Arched Squirrel Tail with Swish Motion */}
        <motion.path
          d="M 28 92 C 10 90, -4 60, 4 35 C 10 15, 30 10, 40 22 C 45 32, 38 48, 26 56 C 18 64, 22 78, 30 86 Z"
          fill="#C4733A"
          stroke="#9E5320"
          strokeWidth="1.8"
          animate={
            reducedMotion
              ? {}
              : isDancing || isHopping
              ? { rotate: [-15, 12, -15] }
              : { rotate: [-4, 6, -4] }
          }
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          style={{ originX: '28px', originY: '90px' }}
        />

        {/* Feet */}
        <ellipse cx="42" cy="108" rx="8" ry="4" fill="#9E5320" />
        <ellipse cx="60" cy="108" rx="8" ry="4" fill="#9E5320" />

        {/* Body */}
        <path
          d="M 38 70 C 38 58, 64 58, 64 70 C 66 86, 62 106, 51 106 C 40 106, 36 86, 38 70 Z"
          fill="#C4733A"
          stroke="#9E5320"
          strokeWidth="1.8"
        />

        {/* Light Cream Belly */}
        <path
          d="M 44 68 Q 51 80 58 68 Q 60 86 51 100 Q 42 86 44 68 Z"
          fill="#FFF3E0"
          stroke="#9E5320"
          strokeWidth="1.2"
        />

        {/* Left Ear with Tuft */}
        <polygon points="38,40 46,40 40,24" fill="#C4733A" stroke="#9E5320" strokeWidth="1.4" />
        <path d="M 40 24 Q 41 18 43 20" stroke="#9E5320" strokeWidth="1.2" fill="none" />

        {/* Right Ear with Tuft */}
        <polygon points="56,40 64,40 62,24" fill="#C4733A" stroke="#9E5320" strokeWidth="1.4" />
        <path d="M 62 24 Q 63 18 65 20" stroke="#9E5320" strokeWidth="1.2" fill="none" />

        {/* Head */}
        <circle cx="51" cy="46" r="16" fill="#C4733A" stroke="#9E5320" strokeWidth="1.8" />
        <ellipse cx="51" cy="52" rx="9" ry="6" fill="#FFF3E0" />

        {/* Shiny Eyes */}
        <ellipse cx="45" cy="44" rx="2.6" ry="3.4" fill="#362217" />
        <circle cx="44" cy="43" r="1" fill="#FFFFFF" />
        <ellipse cx="57" cy="44" rx="2.6" ry="3.4" fill="#362217" />
        <circle cx="56" cy="43" r="1" fill="#FFFFFF" />

        {/* Nose & Smile */}
        <polygon points="50,49 52,49 51,51" fill="#362217" />
        <path d="M 49 52 Q 51 54 53 52" fill="none" stroke="#362217" strokeWidth="1" />

        {/* Little Paws Holding Acorn / Nut */}
        <ellipse cx="46" cy="72" rx="3.5" ry="5" fill="#9E5320" />
        <ellipse cx="56" cy="72" rx="3.5" ry="5" fill="#9E5320" />

        {/* Acorn Prop */}
        <g transform="translate(47, 68)">
          <path d="M 0 4 Q 4 11 8 4 Z" fill="#8B5A2B" />
          <path d="M -1 4 Q 4 0 9 4 Z" fill="#5C3A1E" />
          <line x1="4" y1="1" x2="4" y2="-2" stroke="#5C3A1E" strokeWidth="1" />
        </g>
      </svg>
    </motion.div>
  );
};
