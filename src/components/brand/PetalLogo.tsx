import React from 'react';

interface PetalLogoProps {
  variant?: 'hero' | 'header' | 'mark-only' | 'compact';
  size?: number; // Size for mark-only or scale reference
  className?: string;
  animate?: boolean;
}

/**
 * Petal Flower-Book SVG Icon
 * A friendly enchanted flower whose petals are open book pages in vivid pink, coral, lilac and golden center,
 * with a soft deep-plum outline (#4B2A7B).
 */
export const PetalFlowerMark: React.FC<{ size?: number; className?: string; animate?: boolean }> = ({
  size = 64,
  className = '',
  animate = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none shrink-0 ${animate ? 'hover:rotate-12 transition-transform duration-300' : ''} ${className}`}
      aria-label="Petal Flower Book Logo Mark"
    >
      <defs>
        {/* Soft inner page gradients */}
        <linearGradient id="petalPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFA6CD" />
          <stop offset="100%" stopColor="#FF5FA2" />
        </linearGradient>

        <linearGradient id="petalCoralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB3A1" />
          <stop offset="100%" stopColor="#FF7F66" />
        </linearGradient>

        <linearGradient id="petalLilacGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D8C8FF" />
          <stop offset="100%" stopColor="#B79CFF" />
        </linearGradient>

        <linearGradient id="petalTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#87EFE5" />
          <stop offset="100%" stopColor="#20C5B5" />
        </linearGradient>

        <linearGradient id="centerGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF275" />
          <stop offset="60%" stopColor="#FFC93C" />
          <stop offset="100%" stopColor="#FFA800" />
        </linearGradient>

        <filter id="markDropShadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#4B2A7B" floodOpacity="0.18" />
        </filter>
      </defs>

      <g filter="url(#markDropShadow)">
        {/* 1. TOP PETAL: OPEN BOOK SPREAD (Pink) */}
        <g transform="translate(50, 50) rotate(0) translate(-50, -50)">
          {/* Left page */}
          <path
            d="M50 48 C46 32, 32 20, 36 8 C40 4, 48 10, 50 14"
            fill="url(#petalPinkGrad)"
            stroke="#4B2A7B"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* Right page */}
          <path
            d="M50 48 C54 32, 68 20, 64 8 C60 4, 52 10, 50 14"
            fill="url(#petalPinkGrad)"
            stroke="#4B2A7B"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* Subtle page lines inside left/right book leaf */}
          <path d="M40 18 Q44 26 48 36" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
          <path d="M60 18 Q56 26 52 36" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
        </g>

        {/* 2. TOP-RIGHT PETAL: OPEN BOOK SPREAD (Coral) */}
        <g transform="translate(50, 50) rotate(72) translate(-50, -50)">
          <path
            d="M50 48 C46 32, 32 20, 36 8 C40 4, 48 10, 50 14"
            fill="url(#petalCoralGrad)"
            stroke="#4B2A7B"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path
            d="M50 48 C54 32, 68 20, 64 8 C60 4, 52 10, 50 14"
            fill="url(#petalCoralGrad)"
            stroke="#4B2A7B"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path d="M40 18 Q44 26 48 36" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
          <path d="M60 18 Q56 26 52 36" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
        </g>

        {/* 3. BOTTOM-RIGHT PETAL: OPEN BOOK SPREAD (Lilac) */}
        <g transform="translate(50, 50) rotate(144) translate(-50, -50)">
          <path
            d="M50 48 C46 32, 32 20, 36 8 C40 4, 48 10, 50 14"
            fill="url(#petalLilacGrad)"
            stroke="#4B2A7B"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path
            d="M50 48 C54 32, 68 20, 64 8 C60 4, 52 10, 50 14"
            fill="url(#petalLilacGrad)"
            stroke="#4B2A7B"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path d="M40 18 Q44 26 48 36" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
          <path d="M60 18 Q56 26 52 36" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
        </g>

        {/* 4. BOTTOM-LEFT PETAL: OPEN BOOK SPREAD (Teal / Mint) */}
        <g transform="translate(50, 50) rotate(216) translate(-50, -50)">
          <path
            d="M50 48 C46 32, 32 20, 36 8 C40 4, 48 10, 50 14"
            fill="url(#petalTealGrad)"
            stroke="#4B2A7B"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path
            d="M50 48 C54 32, 68 20, 64 8 C60 4, 52 10, 50 14"
            fill="url(#petalTealGrad)"
            stroke="#4B2A7B"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path d="M40 18 Q44 26 48 36" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
          <path d="M60 18 Q56 26 52 36" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
        </g>

        {/* 5. TOP-LEFT PETAL: OPEN BOOK SPREAD (Blush Peach) */}
        <g transform="translate(50, 50) rotate(288) translate(-50, -50)">
          <path
            d="M50 48 C46 32, 32 20, 36 8 C40 4, 48 10, 50 14"
            fill="url(#petalPinkGrad)"
            stroke="#4B2A7B"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path
            d="M50 48 C54 32, 68 20, 64 8 C60 4, 52 10, 50 14"
            fill="url(#petalPinkGrad)"
            stroke="#4B2A7B"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path d="M40 18 Q44 26 48 36" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
          <path d="M60 18 Q56 26 52 36" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
        </g>

        {/* GOLDEN SUN SEED CENTER */}
        <circle cx="50" cy="50" r="14.5" fill="url(#centerGoldGrad)" stroke="#4B2A7B" strokeWidth="2.8" />
        
        {/* Playful highlights & mini smile/spiral */}
        <path d="M45 46 Q47 43 50 43 Q53 43 55 46" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.85" />
        <circle cx="45" cy="50" r="1.5" fill="#4B2A7B" />
        <circle cx="55" cy="50" r="1.5" fill="#4B2A7B" />
        <path d="M46 54 Q50 58 54 54" stroke="#4B2A7B" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
};

export const PetalLogo: React.FC<PetalLogoProps> = ({
  variant = 'hero',
  size = 64,
  className = '',
  animate = false,
}) => {
  if (variant === 'mark-only') {
    return <PetalFlowerMark size={size} className={className} animate={animate} />;
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <PetalFlowerMark size={size || 38} animate={animate} />
        <div className="relative flex items-center">
          <span className="font-brand text-2xl text-[#4B2A7B] tracking-tight leading-none drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
            Petal
          </span>
          {/* Sparkle on 'e' */}
          <span
            className="absolute top-[-4px] left-[16px] text-[#FFC93C] text-[13px] animate-pulse pointer-events-none select-none"
            aria-hidden="true"
          >
            ✦
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className={`inline-flex items-center gap-3 group text-left ${className}`}>
        {/* Flower Mark in a soft sticker badge */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFF5E4] via-[#FFFDF9] to-[#FFF0B8] border-2 border-[#4B2A7B] shadow-[0_4px_0_#4B2A7B] flex items-center justify-center group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300">
          <PetalFlowerMark size={34} />
        </div>
        <div className="flex flex-col">
          <div className="relative inline-flex items-center">
            <span className="font-brand text-[28px] text-[#4B2A7B] tracking-tight leading-none drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
              Petal
            </span>
            {/* Sparkle on the 'e' */}
            <span
              className="absolute top-[-6px] left-[19px] text-[#FFC93C] text-[14px] font-bold animate-pulse pointer-events-none select-none drop-shadow-[0_1px_1px_rgba(75,42,123,0.3)]"
              aria-hidden="true"
            >
              ✦
            </span>
          </div>
          <span className="text-[12px] font-display font-bold text-[#855627] tracking-wider uppercase mt-0.5">
            Enchanted Garden
          </span>
        </div>
      </div>
    );
  }

  // ========================================================
  // VARIANT: HERO (Title-page layout for Home Hero)
  // ========================================================
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Blooming Book Flower Mark with layered sun glow */}
      <div className="relative mb-2 flex items-center justify-center">
        {/* Warm Golden Aura behind flower */}
        <div className="absolute w-28 h-28 rounded-full bg-gradient-to-r from-[#FFD6E0]/70 via-[#FFF0B8]/80 to-[#D9C8FF]/70 blur-xl animate-pulse pointer-events-none" />
        
        {/* Central Book-Flower with thick sticker contour */}
        <div className="relative p-2 rounded-full bg-white/80 backdrop-blur-xs border-2 border-[#4B2A7B] shadow-[0_6px_0_#4B2A7B,0_14px_24px_rgba(75,42,123,0.15)] hover:scale-105 transition-transform duration-300">
          <PetalFlowerMark size={70} animate={animate} />
        </div>
      </div>

      {/* Chunky Hand-Lettered Wordmark */}
      <div className="relative inline-block">
        <h1
          className="font-brand font-black text-6xl sm:text-7xl lg:text-7xl text-[#4B2A7B] tracking-normal leading-none select-none"
          style={{
            textShadow: '0 4px 0 #FF9EC4, 0 7px 0 #4B2A7B, 0 12px 24px rgba(75, 42, 123, 0.25)',
          }}
        >
          Petal
        </h1>

        {/* Small Magical Golden Sparkle on the "e" */}
        <span
          className="absolute top-[0px] left-[28%] sm:left-[27%] text-[#FFC93C] text-2xl sm:text-3xl animate-pulse pointer-events-none drop-shadow-[0_2px_4px_rgba(75,42,123,0.4)]"
          aria-hidden="true"
        >
          ✦
        </span>

        {/* Secondary subtle twinkle on the 'a' */}
        <span
          className="absolute top-[18px] right-[24%] text-[#FF7F66] text-sm animate-pulse pointer-events-none opacity-80"
          style={{ animationDelay: '1s' }}
          aria-hidden="true"
        >
          ✨
        </span>
      </div>

      {/* Tagline */}
      <p className="mt-2 text-[17px] sm:text-[19px] font-display font-extrabold text-[#4B2A7B] tracking-wide">
        Learn something beautiful every day
      </p>
    </div>
  );
};
