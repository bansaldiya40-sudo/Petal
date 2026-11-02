import React from 'react';
import { CharacterId, CharacterAction, PropItem } from './types';
import { BunnyRig } from './BunnyRig';
import { FairyRig } from './FairyRig';
import { OwlRig } from './OwlRig';
import { FoxRig } from './FoxRig';
import { BeeRig } from './BeeRig';
import { SquirrelRig } from './SquirrelRig';
import { CrowdRig } from './CrowdRig';
import { motion, AnimatePresence } from 'framer-motion';

interface CharacterRendererProps {
  id: CharacterId;
  action: CharacterAction;
  item?: PropItem;
  say?: string;
  flipX?: boolean;
  scale?: number;
  reducedMotion?: boolean;
}

export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  id,
  action,
  item,
  say,
  flipX = false,
  scale = 1,
  reducedMotion = false,
}) => {
  const isThinking = action === 'think';

  const renderRig = () => {
    switch (id) {
      case 'bunny':
        return <BunnyRig action={action} item={item} flipX={flipX} reducedMotion={reducedMotion} />;
      case 'fairy':
        return <FairyRig action={action} item={item} flipX={flipX} reducedMotion={reducedMotion} />;
      case 'owl':
        return <OwlRig action={action} item={item} flipX={flipX} reducedMotion={reducedMotion} />;
      case 'fox':
        return <FoxRig action={action} item={item} flipX={flipX} reducedMotion={reducedMotion} />;
      case 'bee':
        return <BeeRig action={action} item={item} flipX={flipX} reducedMotion={reducedMotion} />;
      case 'squirrel':
        return <SquirrelRig action={action} item={item} flipX={flipX} reducedMotion={reducedMotion} />;
      case 'crowd':
        return <CrowdRig action={action} item={item} flipX={flipX} reducedMotion={reducedMotion} />;
      default:
        return <BunnyRig action={action} item={item} flipX={flipX} reducedMotion={reducedMotion} />;
    }
  };

  return (
    <div
      className="relative flex flex-col items-center select-none"
      style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}
    >
      {/* Speech / Thought Bubble Floating Above */}
      <AnimatePresence>
        {say && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.85 }}
            transition={{ type: 'spring', damping: 14, stiffness: 220 }}
            className="absolute -top-12 z-20 whitespace-nowrap bg-white/95 backdrop-blur-sm border-2 border-primary/20 shadow-lg px-3 py-1.5 rounded-2xl text-[14px] sm:text-[15px] font-bold text-text-primary flex items-center gap-1.5"
          >
            <span>💬</span>
            <span>"{say}"</span>
            {/* Bubble arrow pointing down */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white" />
          </motion.div>
        )}

        {isThinking && !say && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="absolute -top-10 z-20 flex flex-col items-center"
          >
            <div className="bg-white/90 border border-primary/20 shadow px-2.5 py-1 rounded-full text-xs font-semibold text-primary/80">
              💭 Hmm...
            </div>
            <div className="w-2 h-2 rounded-full bg-white/90 border border-primary/20 mt-0.5" />
            <div className="w-1 h-1 rounded-full bg-white/90 border border-primary/20 mt-0.5" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Character Rig */}
      {renderRig()}
    </div>
  );
};
