import React from 'react';

/**
 * Floating Petal particle for subtle ambient storybook feel
 */
export const FloatingPetalsBackground: React.FC = () => {
  // 6 gentle drifting petals in the corners/edges
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Petal 1 - Lavender drift top-left */}
      <div className="absolute top-[8%] left-[5%] animate-float-slow opacity-60">
        <svg width="28" height="28" viewBox="0 0 30 30" fill="none">
          <path d="M15 2 C24 8, 28 20, 20 27 C12 28, 5 20, 15 2 Z" fill="#DDD6FE" opacity="0.75" />
        </svg>
      </div>

      {/* Petal 2 - Rose blush top-right */}
      <div className="absolute top-[14%] right-[8%] animate-float opacity-50" style={{ animationDelay: '1.5s' }}>
        <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
          <path d="M15 2 C22 10, 26 22, 18 26 C10 26, 6 18, 15 2 Z" fill="#FBCFE8" opacity="0.8" />
        </svg>
      </div>

      {/* Petal 3 - Mint leaf mid-left */}
      <div className="absolute top-[52%] left-[3%] animate-float-slow opacity-45" style={{ animationDelay: '2.5s' }}>
        <svg width="22" height="22" viewBox="0 0 30 30" fill="none">
          <path d="M5 25 C15 25, 25 15, 25 5 C15 5, 5 15, 5 25 Z" fill="#BBF7D0" opacity="0.7" />
        </svg>
      </div>

      {/* Petal 4 - Buttercup yellow bottom-right */}
      <div className="absolute bottom-[18%] right-[5%] animate-float opacity-55" style={{ animationDelay: '3.2s' }}>
        <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
          <path d="M15 2 C24 8, 28 20, 20 27 C12 28, 5 20, 15 2 Z" fill="#FEF08A" opacity="0.7" />
        </svg>
      </div>

      {/* Subtle mushroom bottom-left decoration */}
      <div className="absolute bottom-[3%] left-[2%] opacity-60">
        <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
          {/* Mushroom stem */}
          <path d="M17 24 C17 22, 23 22, 23 24 L24 36 C24 37, 16 37, 16 36 Z" fill="#FDF4E7" stroke="#E2D6C5" strokeWidth="1" />
          {/* Cap */}
          <path d="M8 24 C8 15, 32 15, 32 24 C28 25, 12 25, 8 24 Z" fill="#F472B6" />
          {/* White spots */}
          <circle cx="16" cy="19" r="2" fill="#FFFDF9" opacity="0.9" />
          <circle cx="24" cy="18" r="1.5" fill="#FFFDF9" opacity="0.9" />
          <circle cx="20" cy="22" r="1" fill="#FFFDF9" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
};

/**
 * Storybook Card Header Vine Accent
 */
export const StorybookVineDivider: React.FC<{ color?: string; className?: string }> = ({
  color = '#C4B5FD',
  className = '',
}) => {
  return (
    <svg viewBox="0 0 200 16" width="100%" height="16" fill="none" className={`overflow-visible ${className}`}>
      <path
        d="M10 8 Q50 3 100 8 T190 8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <circle cx="100" cy="8" r="3.5" fill={color} opacity="0.8" />
      {/* Tiny leaves */}
      <path d="M70 6 Q75 2 80 5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M130 6 Q125 2 120 5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
};
