import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PetalFlowerMark } from './PetalLogo';

interface PetalEntranceMomentProps {
  reducedMotion?: boolean;
  children: React.ReactNode;
}

export const PetalEntranceMoment: React.FC<PetalEntranceMomentProps> = ({
  reducedMotion = false,
  children,
}) => {
  const [showEntrance, setShowEntrance] = useState<boolean>(() => {
    // If reduced motion is requested or already seen this session, skip
    if (typeof window === 'undefined') return false;
    if (reducedMotion) return false;
    const hasSeen = sessionStorage.getItem('hasSeenPetalEntrance_v3');
    return hasSeen !== 'true';
  });

  const [isGlidingDown, setIsGlidingDown] = useState<boolean>(false);

  const handleFinish = () => {
    if (isGlidingDown) return;
    setIsGlidingDown(true);
    try {
      sessionStorage.setItem('hasSeenPetalEntrance_v3', 'true');
    } catch {}

    // Complete transition after glide animation
    setTimeout(() => {
      setShowEntrance(false);
    }, 650);
  };

  useEffect(() => {
    if (!showEntrance) return;

    // Auto-advance after 2.2 seconds
    const timer = setTimeout(() => {
      handleFinish();
    }, 2200);

    return () => clearTimeout(timer);
  }, [showEntrance]);

  if (!showEntrance) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background Main Garden Page (Underneath) */}
      <div className="w-full min-h-screen">
        {children}
      </div>

      {/* Full-screen Entrance Moment Overlay */}
      <AnimatePresence>
        {!isGlidingDown ? (
          <motion.div
            key="entrance-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ y: '-100%', opacity: 0.95 }}
            transition={{ duration: 0.65, ease: [0.32, 1, 0.23, 1] }}
            onClick={handleFinish}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #FFC9A3 0%, #FF9EC4 35%, #B79CFF 70%, #8FB4FF 100%)',
            }}
          >
            {/* Ambient Golden Hour Sunburst & Rays */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="w-[800px] h-[800px] rounded-full bg-radial from-[#FFFDF0] via-[#FFD6E0]/40 to-transparent blur-2xl animate-pulse" />
            </div>

            {/* Drifting Petals & Sparkles in the Sky */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[
                { top: '15%', left: '18%', delay: '0s', size: 18, color: '#FF5FA2' },
                { top: '25%', right: '22%', delay: '0.4s', size: 22, color: '#FF7F66' },
                { top: '65%', left: '26%', delay: '0.8s', size: 16, color: '#B79CFF' },
                { top: '75%', right: '30%', delay: '1.1s', size: 20, color: '#FFC93C' },
                { top: '40%', left: '12%', delay: '0.3s', size: 14, color: '#20C5B5' },
              ].map((p, i) => (
                <div
                  key={i}
                  className="absolute animate-float opacity-75"
                  style={{ top: p.top, left: p.left, right: p.right, animationDelay: p.delay }}
                >
                  <svg width={p.size} height={p.size} viewBox="0 0 20 20">
                    <path d="M10 0 C15 5, 20 10, 15 15 C10 20, 5 15, 0 10 C5 5, 10 0, 10 0 Z" fill={p.color} />
                  </svg>
                </div>
              ))}
            </div>

            {/* Skip Button in Top-Right */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFinish();
              }}
              className="absolute top-6 right-6 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-[#4B2A7B] border-2 border-[#4B2A7B] font-display font-bold text-sm shadow-[0_3px_0_#4B2A7B] transition-transform hover:scale-105 active:scale-95 z-20 flex items-center gap-1.5"
            >
              <span>Skip intro</span>
              <span className="text-xs">⏩</span>
            </button>

            {/* Central Bloom Animation Sequence */}
            <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg">
              {/* Step 1: Flower Blooms in the Centre of the Sky */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: [0, 1.2, 1], rotate: [ -45, 10, 0 ] }}
                transition={{ duration: 0.9, times: [0, 0.7, 1], ease: 'easeOut' }}
                className="relative mb-4 flex items-center justify-center"
              >
                <div className="absolute w-44 h-44 rounded-full bg-[#FFF0B8]/60 blur-xl animate-pulse" />
                <div className="relative p-3 rounded-full bg-white/90 border-3 border-[#4B2A7B] shadow-[0_10px_0_#4B2A7B,0_20px_40px_rgba(75,42,123,0.3)]">
                  <PetalFlowerMark size={110} />
                </div>
              </motion.div>

              {/* Step 2: Hand-lettered Wordmark pops */}
              <motion.div
                initial={{ opacity: 0, y: 25, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6, type: 'spring', bounce: 0.4 }}
                className="relative inline-block"
              >
                <h1
                  className="font-brand font-black text-7xl sm:text-8xl text-[#4B2A7B] tracking-normal leading-none"
                  style={{
                    textShadow: '0 5px 0 #FF9EC4, 0 9px 0 #4B2A7B, 0 16px 32px rgba(75, 42, 123, 0.35)',
                  }}
                >
                  Petal
                </h1>

                {/* Golden Sparkle on 'e' */}
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.5, 1], opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="absolute top-[-4px] left-[27%] text-[#FFC93C] text-3xl font-bold drop-shadow-[0_2px_4px_rgba(75,42,123,0.4)] pointer-events-none select-none"
                >
                  ✦
                </motion.span>
              </motion.div>

              {/* Step 3: Tagline fades in */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95, duration: 0.6 }}
                className="mt-4 text-xl sm:text-2xl font-display font-black text-[#4B2A7B] tracking-wide drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]"
              >
                Learn something beautiful every day
              </motion.p>

              {/* Gentle prompt */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0.4, 0.8] }}
                transition={{ delay: 1.4, duration: 1.5, repeat: Infinity }}
                className="mt-6 text-xs uppercase font-display font-extrabold tracking-widest text-[#4B2A7B]/80"
              >
                Tap anywhere to enter garden
              </motion.span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
