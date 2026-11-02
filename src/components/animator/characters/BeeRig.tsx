import React from 'react';
import { CharacterAction, PropItem } from './types';
import { motion } from 'framer-motion';

interface BeeRigProps {
  action: CharacterAction;
  item?: PropItem;
  flipX?: boolean;
  reducedMotion?: boolean;
}

export const BeeRig: React.FC<BeeRigProps> = ({
  action,
  item,
  flipX = false,
  reducedMotion = false,
}) => {
  const isFlying = action === 'fly-across' || action === 'walk-in' || action === 'walk-out';
  const isDancing = action === 'happy-dance' || action === 'celebrate';
  const isSad = action === 'sad-slump';
  const isSurprised = action === 'surprised';

  return (
    <motion.div
      className="relative w-24 h-28 flex items-center justify-center select-none"
      style={{ transform: flipX ? 'scaleX(-1)' : 'scaleX(1)' }}
      animate={
        reducedMotion
          ? {}
          : isDancing
          ? { y: [0, -18, 0], rotate: [-8, 8, -8] }
          : isSad
          ? { y: 12, rotate: 12, opacity: 0.7 }
          : isFlying
          ? { y: [0, -14, 0], x: [0, 6, 0] }
          : { y: [0, -8, 0] } // idle gentle hover
      }
      transition={{
        repeat: Infinity,
        duration: isFlying ? 0.9 : 1.4,
        ease: 'easeInOut',
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Soft shadow below */}
        <ellipse cx="50" cy="92" rx="16" ry="4" fill="#4A3566" opacity="0.1" />

        {/* Tiny Stinger */}
        <path d="M 22 55 L 14 56 L 22 59 Z" fill="#452C1E" />

        {/* Rapid Fluttering Wings */}
        <motion.path
          d="M 44 42 C 40 22, 22 10, 36 6 C 52 2, 54 26, 48 42 Z"
          fill="#D6EEFF"
          stroke="#82BFE6"
          strokeWidth="1.2"
          opacity="0.85"
          animate={reducedMotion ? {} : { scaleY: [1, 0.4, 1], rotate: [-10, -25, -10] }}
          transition={{ repeat: Infinity, duration: 0.16, ease: 'easeInOut' }}
          style={{ originX: '46px', originY: '42px' }}
        />
        <motion.path
          d="M 54 42 C 58 22, 76 10, 62 6 C 46 2, 44 26, 50 42 Z"
          fill="#D6EEFF"
          stroke="#82BFE6"
          strokeWidth="1.2"
          opacity="0.85"
          animate={reducedMotion ? {} : { scaleY: [1, 0.4, 1], rotate: [10, 25, 10] }}
          transition={{ repeat: Infinity, duration: 0.16, ease: 'easeInOut' }}
          style={{ originX: '52px', originY: '42px' }}
        />

        {/* Chubby Striped Bee Body */}
        <ellipse cx="50" cy="56" rx="26" ry="22" fill="#FED856" stroke="#D1981F" strokeWidth="1.8" />

        {/* Dark Stripes */}
        <path d="M 38 37 Q 39 56 38 75" stroke="#452C1E" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M 50 34 Q 51 56 50 78" stroke="#452C1E" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M 62 37 Q 61 56 62 75" stroke="#452C1E" strokeWidth="4.5" strokeLinecap="round" />

        {/* Cute Blushing Cheeks */}
        <ellipse cx="64" cy="62" rx="4" ry="2.5" fill="#FFA5A5" opacity="0.6" />
        <ellipse cx="76" cy="62" rx="4" ry="2.5" fill="#FFA5A5" opacity="0.6" />

        {/* Eyes (Faces Right-ish) */}
        <motion.g
          animate={reducedMotion ? {} : { scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ repeat: Infinity, duration: 2.8, times: [0, 0.88, 0.92, 0.96, 1] }}
          style={{ originY: '54px' }}
        >
          <ellipse cx="68" cy="54" rx="3" ry="4" fill="#3D291F" />
          <circle cx="67" cy="53" r="1.2" fill="#FFFFFF" />
          <ellipse cx="78" cy="54" rx="2.5" ry="3.5" fill="#3D291F" />
          <circle cx="77" cy="53" r="1" fill="#FFFFFF" />
        </motion.g>

        {/* Sweet Smile */}
        <path
          d={isSad ? 'M 70 66 Q 74 61 78 66' : 'M 70 61 Q 74 67 78 61'}
          fill="none"
          stroke="#452C1E"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Little Antennae */}
        <path d="M 68 36 Q 72 26 76 22" fill="none" stroke="#452C1E" strokeWidth="1.5" />
        <circle cx="76" cy="21" r="2.5" fill="#452C1E" />

        <path d="M 62 35 Q 64 24 67 19" fill="none" stroke="#452C1E" strokeWidth="1.5" />
        <circle cx="67" cy="18" r="2.5" fill="#452C1E" />

        {/* Tiny Paws */}
        <ellipse cx="58" cy="74" rx="3.5" ry="5" fill="#452C1E" />
        <ellipse cx="68" cy="74" rx="3.5" ry="5" fill="#452C1E" />

        {/* Tiny Prop: Coin or Honey Dipper */}
        {item === 'honey-coins' && (
          <g transform="translate(68, 68)">
            <circle cx="6" cy="6" r="6" fill="#FFDA58" stroke="#D1981F" strokeWidth="1" />
            <text x="6" y="9" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#784A0F">
              5
            </text>
          </g>
        )}
      </svg>
    </motion.div>
  );
};
