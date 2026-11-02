import React from 'react';

interface CharacterProps {
  className?: string;
  size?: number;
  mood?: 'happy' | 'thinking' | 'celebrating';
}

/**
 * Subject 1: Product Management 2
 * Character: Faye — The Fairy Builder
 * Lavender world, wand with glowing star, architectural crystal cube & floating sparkles
 */
export const FayeFairyBuilder: React.FC<CharacterProps> = ({ className = '', size = 200, mood = 'happy' }) => {
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-transform duration-300 hover:scale-105 ${className}`}
      aria-label="Faye the Fairy Builder, mascot of Product Management 2"
    >
      <defs>
        <radialGradient id="fayeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#DDD6FE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fayeWing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#EDE9FE" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="fayeDress" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="wandGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Ambient background soft glow */}
      <circle cx="120" cy="120" r="105" fill="url(#fayeGlow)" />

      {/* Floating sparkles */}
      <g className="animate-sparkle" style={{ transformOrigin: '120px 120px' }}>
        <circle cx="45" cy="65" r="3" fill="#DDD6FE" />
        <circle cx="195" cy="55" r="2.5" fill="#DDD6FE" />
        <circle cx="210" cy="140" r="3.5" fill="#C4B5FD" />
        <circle cx="35" cy="160" r="2" fill="#C4B5FD" />
        <path d="M40 70 L43 75 L48 78 L43 81 L40 86 L37 81 L32 78 L37 75 Z" fill="#FDE047" opacity="0.8" />
        <path d="M198 120 L200 123 L204 125 L200 127 L198 131 L196 127 L192 125 L196 123 Z" fill="#FDE047" opacity="0.85" />
      </g>

      {/* Delicate Fairy Wings */}
      {/* Left Wing */}
      <g className="animate-float">
        <path
          d="M105 105 C70 65, 30 75, 42 120 C50 145, 80 145, 105 125 Z"
          fill="url(#fayeWing)"
          stroke="#C4B5FD"
          strokeWidth="1.5"
        />
        <path d="M60 95 C75 110, 90 115, 102 118" stroke="#DDD6FE" strokeWidth="1" strokeLinecap="round" />
        <path d="M52 118 C70 122, 85 125, 102 122" stroke="#DDD6FE" strokeWidth="1" strokeLinecap="round" />

        {/* Right Wing */}
        <path
          d="M135 105 C170 65, 210 75, 198 120 C190 145, 160 145, 135 125 Z"
          fill="url(#fayeWing)"
          stroke="#C4B5FD"
          strokeWidth="1.5"
        />
        <path d="M180 95 C165 110, 150 115, 138 118" stroke="#DDD6FE" strokeWidth="1" strokeLinecap="round" />
        <path d="M188 118 C170 122, 155 125, 138 122" stroke="#DDD6FE" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Floating Blueprint Product Cube */}
      <g className="animate-float" style={{ animationDelay: '1s' }}>
        <polygon points="175,70 195,60 215,70 195,80" fill="#E0E7FF" stroke="#818CF8" strokeWidth="1.5" />
        <polygon points="175,70 195,80 195,102 175,92" fill="#C7D2FE" stroke="#818CF8" strokeWidth="1.5" />
        <polygon points="195,80 215,70 215,92 195,102" fill="#A5B4FC" stroke="#818CF8" strokeWidth="1.5" />
        <circle cx="195" cy="70" r="1.5" fill="#4F46E5" />
        <circle cx="185" cy="75" r="1.5" fill="#4F46E5" />
        <circle cx="205" cy="75" r="1.5" fill="#4F46E5" />
      </g>

      {/* Body & Dress */}
      <path
        d="M102 128 C102 128, 106 175, 100 190 C112 193, 128 193, 140 190 C134 175, 138 128, 138 128 Z"
        fill="url(#fayeDress)"
      />
      {/* Petal skirt layer */}
      <path d="M100 170 C108 178, 116 178, 120 172 C124 178, 132 178, 140 170 C138 185, 132 192, 120 193 C108 192, 102 185, 100 170 Z" fill="#6D28D9" />

      {/* Head & Face */}
      <circle cx="120" cy="100" r="28" fill="#FDE8D7" />

      {/* Cheeks */}
      <circle cx="106" cy="107" r="4.5" fill="#FDA4AF" opacity="0.6" />
      <circle cx="134" cy="107" r="4.5" fill="#FDA4AF" opacity="0.6" />

      {/* Eyes */}
      <circle cx="111" cy="100" r="3" fill="#2E1065" />
      <circle cx="112" cy="99" r="1" fill="#FFFFFF" />
      <circle cx="129" cy="100" r="3" fill="#2E1065" />
      <circle cx="130" cy="99" r="1" fill="#FFFFFF" />

      {/* Friendly Smile */}
      <path d="M116 111 Q120 115 124 111" stroke="#4C1D95" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Lavender Bob Haircut */}
      <path
        d="M92 98 C90 74, 110 68, 120 68 C130 68, 150 74, 148 98 C144 95, 138 90, 133 90 C125 90, 122 95, 120 95 C118 95, 115 90, 107 90 C102 90, 96 95, 92 98 Z"
        fill="#7C3AED"
      />
      {/* Side hair wisps */}
      <path d="M92 96 C90 108, 93 118, 96 122 C97 116, 96 106, 95 98 Z" fill="#6D28D9" />
      <path d="M148 96 C150 108, 147 118, 144 122 C143 116, 144 106, 145 98 Z" fill="#6D28D9" />

      {/* Flower Crown */}
      <circle cx="108" cy="72" r="5" fill="#F472B6" />
      <circle cx="108" cy="72" r="2" fill="#FEF08A" />
      <circle cx="120" cy="70" r="6" fill="#DDD6FE" />
      <circle cx="120" cy="70" r="2.5" fill="#FEF08A" />
      <circle cx="132" cy="72" r="5" fill="#F472B6" />
      <circle cx="132" cy="72" r="2" fill="#FEF08A" />
      {/* Tiny leaf */}
      <path d="M113 67 Q116 63 121 66 Q117 68 113 67 Z" fill="#4ADE80" />

      {/* Arms & Wand */}
      {/* Left arm holding builder wand */}
      <path d="M102 135 Q85 142 80 130" stroke="#FDE8D7" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      {/* Star Wand */}
      <g transform="rotate(-25 80 130)">
        <line x1="78" y1="145" x2="78" y2="105" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="78,94 82,103 91,104 84,110 86,119 78,114 70,119 72,110 65,104 74,103" fill="url(#wandGlow)" stroke="#F59E0B" strokeWidth="1" />
        <circle cx="78" cy="108" r="2" fill="#FFFFFF" />
      </g>

      {/* Right arm gesturing towards the cube */}
      <path d="M138 135 Q152 132 165 118" stroke="#FDE8D7" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      {/* Tiny hand */}
      <circle cx="166" cy="116" r="3.5" fill="#FDE8D7" />

      {/* Feet */}
      <ellipse cx="112" cy="198" rx="4" ry="3" fill="#A78BFA" />
      <ellipse cx="128" cy="198" rx="4" ry="3" fill="#A78BFA" />
    </svg>
  );
};

/**
 * Subject 2: Market Research Methods
 * Character: Barnaby — The Curious Owl & Fox
 * Mint/Sage world, spectacles, brass magnifying glass & inquiry sprout
 */
export const BarnabyCuriousFox: React.FC<CharacterProps> = ({ className = '', size = 200 }) => {
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-transform duration-300 hover:scale-105 ${className}`}
      aria-label="Barnaby the Curious Fox and Owl Researcher, mascot of Market Research Methods"
    >
      <defs>
        <radialGradient id="barnabyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="barnabyCoat" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="foxFur" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="glassLens" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Mint Ambient Glow */}
      <circle cx="120" cy="120" r="105" fill="url(#barnabyGlow)" />

      {/* Floating survey notes and botanical leaves */}
      <g className="animate-sparkle" style={{ transformOrigin: '120px 120px' }}>
        {/* Leaf 1 */}
        <path d="M42 85 C38 75, 48 68, 55 72 C58 80, 50 88, 42 85 Z" fill="#6EE7B7" />
        {/* Leaf 2 */}
        <path d="M195 155 C202 148, 208 155, 206 162 C200 166, 192 162, 195 155 Z" fill="#6EE7B7" />
        {/* Little Survey Star */}
        <circle cx="48" cy="145" r="2.5" fill="#34D399" />
        <circle cx="190" cy="70" r="3" fill="#34D399" />
      </g>

      {/* Bushy Fox Tail with White Tip */}
      <path
        d="M65 170 C40 165, 25 135, 38 115 C52 95, 68 115, 75 140 C80 155, 75 170, 65 170 Z"
        fill="url(#foxFur)"
      />
      <path
        d="M38 115 C33 125, 30 135, 35 140 C42 135, 48 128, 45 118 Z"
        fill="#FFFDF9"
      />

      {/* Fox Body in Mint Tweed Scholar Coat */}
      <path
        d="M85 130 C85 130, 90 190, 85 200 C105 204, 135 204, 155 200 C150 190, 155 130, 155 130 Z"
        fill="url(#barnabyCoat)"
      />
      {/* Coat Collar & Buttons */}
      <path d="M108 132 L120 152 L132 132" stroke="#FFFDF9" strokeWidth="2.5" fill="#047857" />
      <circle cx="120" cy="165" r="2" fill="#FEF08A" />
      <circle cx="120" cy="180" r="2" fill="#FEF08A" />

      {/* Head */}
      <circle cx="120" cy="98" r="34" fill="url(#foxFur)" />

      {/* Pointy Fox Ears */}
      <polygon points="92,72 82,38 108,55" fill="url(#foxFur)" />
      <polygon points="93,68 87,46 104,57" fill="#FEE2E2" />

      <polygon points="148,72 158,38 132,55" fill="url(#foxFur)" />
      <polygon points="147,68 153,46 136,57" fill="#FEE2E2" />

      {/* White Fox Muzzle & Cheeks */}
      <path
        d="M92 104 C92 122, 106 128, 120 128 C134 128, 148 122, 148 104 C140 106, 130 102, 120 105 C110 102, 100 106, 92 104 Z"
        fill="#FFFDF9"
      />

      {/* Cute Black Nose */}
      <ellipse cx="120" cy="112" rx="4.5" ry="3.5" fill="#1C1917" />
      {/* Friendly Mouth */}
      <path d="M120 116 L120 121 M116 121 Q120 124 124 121" stroke="#1C1917" strokeWidth="1.6" strokeLinecap="round" fill="none" />

      {/* Rosy Cheeks */}
      <circle cx="98" cy="112" r="4" fill="#FCA5A5" opacity="0.6" />
      <circle cx="142" cy="112" r="4" fill="#FCA5A5" opacity="0.6" />

      {/* Brass Spectacles */}
      <circle cx="106" cy="96" r="9" stroke="#D97706" strokeWidth="2" fill="none" />
      <circle cx="134" cy="96" r="9" stroke="#D97706" strokeWidth="2" fill="none" />
      <line x1="115" y1="96" x2="125" y2="96" stroke="#D97706" strokeWidth="2" />

      {/* Intelligent, curious eyes behind spectacles */}
      <circle cx="106" cy="96" r="3.5" fill="#1E293B" />
      <circle cx="107.5" cy="94.5" r="1.2" fill="#FFFFFF" />
      <circle cx="134" cy="96" r="3.5" fill="#1E293B" />
      <circle cx="135.5" cy="94.5" r="1.2" fill="#FFFFFF" />

      {/* Left arm holding the big inquiry Magnifying Glass */}
      <path d="M90 145 Q70 155 78 175" stroke="#EA580C" strokeWidth="6" strokeLinecap="round" fill="none" />

      {/* The Magnifying Glass inspecting a sprout */}
      <g className="animate-flutter" style={{ transformOrigin: '80px 175px' }}>
        {/* Handle */}
        <line x1="80" y1="185" x2="68" y2="215" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
        <circle cx="70" cy="212" r="3" fill="#D97706" />
        {/* Brass Lens Frame */}
        <circle cx="85" cy="175" r="18" stroke="#D97706" strokeWidth="3.5" fill="url(#glassLens)" />
        {/* Lens reflection glint */}
        <path d="M75 167 A 12 12 0 0 1 93 167" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" fill="none" />

        {/* Budding Inquiry Sprout seen inside/near the lens */}
        <path d="M85 182 Q86 172 85 166" stroke="#047857" strokeWidth="2" strokeLinecap="round" fill="none" />
        <ellipse cx="82" cy="168" rx="3.5" ry="2" fill="#34D399" transform="rotate(-30 82 168)" />
        <ellipse cx="88" cy="168" rx="3.5" ry="2" fill="#34D399" transform="rotate(30 88 168)" />
      </g>

      {/* Right arm holding Research Clipboard */}
      <path d="M150 145 Q168 152 165 170" stroke="#EA580C" strokeWidth="6" strokeLinecap="round" fill="none" />
      <g transform="rotate(10 165 160)">
        <rect x="156" y="145" width="22" height="32" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
        <rect x="162" y="142" width="10" height="4" rx="1.5" fill="#78350F" />
        {/* Checklist lines */}
        <line x1="161" y1="154" x2="173" y2="154" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="161" y1="160" x2="173" y2="160" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="161" y1="166" x2="170" y2="166" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Little Paws / Shoes */}
      <ellipse cx="102" cy="208" rx="6" ry="4" fill="#047857" />
      <ellipse cx="138" cy="208" rx="6" ry="4" fill="#047857" />
    </svg>
  );
};

/**
 * Subject 3: Microeconomics
 * Character: Pip — The Friendly Bunny with the Golden Coin
 * Butter yellow & peach world, long floppy ears, satchel, balancing scales & honey coin
 */
export const PipFriendlyBunny: React.FC<CharacterProps> = ({ className = '', size = 200 }) => {
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-transform duration-300 hover:scale-105 ${className}`}
      aria-label="Pip the Friendly Bunny, mascot of Microeconomics"
    >
      <defs>
        <radialGradient id="pipGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="goldCoin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="pipApron" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Butter Yellow Ambient Glow */}
      <circle cx="120" cy="120" r="105" fill="url(#pipGlow)" />

      {/* Floating Sparkles & Honey Clover */}
      <g className="animate-sparkle" style={{ transformOrigin: '120px 120px' }}>
        <circle cx="38" cy="80" r="3" fill="#FCD34D" />
        <circle cx="205" cy="75" r="2.5" fill="#FCD34D" />
        <circle cx="45" cy="170" r="2.5" fill="#FBBF24" />
        {/* Tiny clover */}
        <circle cx="198" cy="155" r="3" fill="#86EFAC" />
        <circle cx="203" cy="155" r="3" fill="#86EFAC" />
        <circle cx="200" cy="150" r="3" fill="#86EFAC" />
      </g>

      {/* Long Bunny Ears with Peach Inner Shading */}
      {/* Left Ear */}
      <g className="animate-flutter" style={{ transformOrigin: '95px 70px' }}>
        <path
          d="M96 75 C85 45, 75 10, 92 12 C108 14, 110 45, 104 75 Z"
          fill="#FFFDF9"
          stroke="#E5E7EB"
          strokeWidth="1.2"
        />
        <path
          d="M95 65 C88 45, 83 25, 93 25 C101 25, 102 45, 99 65 Z"
          fill="#FEE2E2"
        />
      </g>

      {/* Right Ear (Curved playfully) */}
      <g className="animate-flutter" style={{ transformOrigin: '145px 70px', animationDelay: '0.8s' }}>
        <path
          d="M136 75 C142 45, 160 12, 175 22 C185 32, 162 58, 144 75 Z"
          fill="#FFFDF9"
          stroke="#E5E7EB"
          strokeWidth="1.2"
        />
        <path
          d="M142 66 C147 46, 160 28, 168 34 C174 40, 158 56, 146 66 Z"
          fill="#FEE2E2"
        />
      </g>

      {/* Bunny Body */}
      <ellipse cx="120" cy="165" rx="36" ry="42" fill="#FFFDF9" stroke="#E5E7EB" strokeWidth="1" />

      {/* Butter Yellow Apron with Pocket */}
      <path
        d="M95 145 C95 145, 100 196, 120 196 C140 196, 145 145, 145 145 Z"
        fill="url(#pipApron)"
      />
      <path d="M106 130 L110 145 M134 130 L130 145" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      {/* Little Apron Pocket with a mini graph icon */}
      <rect x="110" y="162" width="20" height="15" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
      <path d="M113 172 L117 167 L122 170 L127 164" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Head */}
      <circle cx="120" cy="98" r="32" fill="#FFFDF9" stroke="#E5E7EB" strokeWidth="0.8" />

      {/* Soft Rosy Peach Cheeks */}
      <circle cx="102" cy="107" r="5.5" fill="#FDA4AF" opacity="0.65" />
      <circle cx="138" cy="107" r="5.5" fill="#FDA4AF" opacity="0.65" />

      {/* Sparkly dark eyes */}
      <ellipse cx="107" cy="97" rx="3.5" ry="4.5" fill="#292524" />
      <circle cx="108.5" cy="95" r="1.5" fill="#FFFFFF" />
      <ellipse cx="133" cy="97" rx="3.5" ry="4.5" fill="#292524" />
      <circle cx="134.5" cy="95" r="1.5" fill="#FFFFFF" />

      {/* Cute Bunny Nose & Whiskers */}
      <polygon points="120,105 116,102 124,102" fill="#F472B6" />
      <path d="M120 105 L120 110 M116 110 Q120 113 124 110" stroke="#78716C" strokeWidth="1.4" strokeLinecap="round" fill="none" />

      {/* Whiskers */}
      <line x1="90" y1="104" x2="80" y2="102" stroke="#A8A29E" strokeWidth="1" strokeLinecap="round" />
      <line x1="90" y1="108" x2="78" y2="110" stroke="#A8A29E" strokeWidth="1" strokeLinecap="round" />
      <line x1="150" y1="104" x2="160" y2="102" stroke="#A8A29E" strokeWidth="1" strokeLinecap="round" />
      <line x1="150" y1="108" x2="162" y2="110" stroke="#A8A29E" strokeWidth="1" strokeLinecap="round" />

      {/* Left arm holding the Giant Golden Honey Coin */}
      <path d="M96 142 Q75 145 68 158" stroke="#FFFDF9" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="68" cy="158" r="4.5" fill="#FDE8D7" />

      {/* The Giant Golden Honey Coin */}
      <g className="animate-float" style={{ transformOrigin: '65px 155px' }}>
        <circle cx="65" cy="152" r="18" fill="url(#goldCoin)" stroke="#D97706" strokeWidth="2" />
        <circle cx="65" cy="152" r="14" stroke="#FEF08A" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
        {/* Engraved Econ Symbol / Honey Acorn */}
        <text x="65" y="158" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#78350F" fontFamily="sans-serif">¢</text>
        {/* Shiny coin glint */}
        <circle cx="58" cy="144" r="2" fill="#FFFFFF" opacity="0.8" />
      </g>

      {/* Right arm resting on a cute Wooden Balance Scale */}
      <path d="M144 142 Q160 145 168 152" stroke="#FFFDF9" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="168" cy="152" r="4.5" fill="#FDE8D7" />

      {/* Friendly Balance Scale */}
      <g transform="translate(160, 140)">
        {/* Center post */}
        <line x1="20" y1="15" x2="20" y2="52" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
        <polygon points="12,52 28,52 24,46 16,46" fill="#92400E" />
        {/* Balance Beam (tilted slightly in microeconomic equilibrium) */}
        <line x1="2" y1="17" x2="38" y2="13" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
        {/* Left pan (Demand) */}
        <line x1="5" y1="17" x2="2" y2="28" stroke="#78716C" strokeWidth="1" />
        <line x1="9" y1="17" x2="12" y2="28" stroke="#78716C" strokeWidth="1" />
        <ellipse cx="7" cy="28" rx="6" ry="2.5" fill="#FDE68A" stroke="#B45309" strokeWidth="1" />
        {/* Right pan (Supply) */}
        <line x1="31" y1="13" x2="28" y2="24" stroke="#78716C" strokeWidth="1" />
        <line x1="35" y1="13" x2="38" y2="24" stroke="#78716C" strokeWidth="1" />
        <ellipse cx="33" cy="24" rx="6" ry="2.5" fill="#FDE68A" stroke="#B45309" strokeWidth="1" />
      </g>

      {/* Fluffy Bunny Feet */}
      <ellipse cx="106" cy="205" rx="8" ry="5.5" fill="#FFFDF9" stroke="#E5E7EB" strokeWidth="1" />
      <ellipse cx="134" cy="205" rx="8" ry="5.5" fill="#FFFDF9" stroke="#E5E7EB" strokeWidth="1" />
    </svg>
  );
};

/**
 * Blooming Streak Flower (Grows & Blooms as daily learning streak advances)
 */
export const BloomingStreakFlower: React.FC<{ streak: number; size?: number; className?: string }> = ({
  streak,
  size = 64,
  className = '',
}) => {
  const bloomPercent = Math.min(100, Math.max(20, streak * 20));

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-500 ${className}`}
      aria-label={`Learning streak flower: ${streak} day streak`}
    >
      <defs>
        <radialGradient id="flowerCenter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>

      {/* Stem and soft leaf */}
      <path d="M50 60 Q50 82 52 94" stroke="#34D399" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 78 Q38 72 40 66 Q48 70 50 78 Z" fill="#6EE7B7" />
      <path d="M51 84 Q62 80 60 74 Q53 77 51 84 Z" fill="#6EE7B7" />

      {/* Dynamic Petals based on streak */}
      {/* 5 Petals blooming around center */}
      {[0, 72, 144, 216, 288].map((angle, index) => {
        const isBloomed = streak > index || streak === 0;
        return (
          <g key={angle} transform={`rotate(${angle} 50 50)`}>
            <ellipse
              cx="50"
              cy={isBloomed ? "32" : "38"}
              rx={isBloomed ? "10" : "6"}
              ry={isBloomed ? "14" : "8"}
              fill={index % 2 === 0 ? "#F472B6" : "#C084FC"}
              opacity={isBloomed ? 0.9 : 0.4}
              className="transition-all duration-700 origin-center"
            />
          </g>
        );
      })}

      {/* Flower Golden Heart */}
      <circle cx="50" cy="50" r="11" fill="url(#flowerCenter)" stroke="#D97706" strokeWidth="1" />
      <circle cx="48" cy="48" r="3" fill="#FFFFFF" opacity="0.6" />
    </svg>
  );
};
