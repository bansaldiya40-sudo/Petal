import React from 'react';

interface LandmarkProps {
  className?: string;
  size?: number;
  isHovered?: boolean;
}

/**
 * Landmark 1: Product Management 2
 * A Lavender Fairy Tower with glowing stained glass windows,
 * floral vines, and Faye the builder fairy perched on the balcony waving her wand.
 */
export const LavenderFairyTower: React.FC<LandmarkProps> = ({ className = '', size = 280, isHovered = false }) => {
  return (
    <svg
      viewBox="0 0 280 340"
      width={size}
      height={size * 1.21}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-all duration-300 ${className} ${isHovered ? 'scale-105 filter drop-shadow-[0_16px_32px_rgba(177,150,245,0.6)]' : 'filter drop-shadow-[0_10px_20px_rgba(75,42,123,0.18)]'}`}
      aria-label="Lavender Fairy Tower of Product Management 2"
    >
      <defs>
        {/* Tower stone gradient */}
        <linearGradient id="towerWall" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F4EFFF" />
          <stop offset="50%" stopColor="#E7DCFF" />
          <stop offset="100%" stopColor="#D9C8FF" />
        </linearGradient>
        {/* Spire roof gradient */}
        <linearGradient id="towerRoof" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#B196F5" />
          <stop offset="100%" stopColor="#8C63E8" />
        </linearGradient>
        {/* Window glow */}
        <radialGradient id="windowGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF9D2" />
          <stop offset="60%" stopColor="#FFEAA0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFD9C0" stopOpacity="0.4" />
        </radialGradient>
        {/* Fairy wing shimmer */}
        <linearGradient id="wingShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#D9C8FF" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Ambient soft glow on hover */}
      <circle cx="140" cy="180" r="110" fill="#D9C8FF" opacity={isHovered ? 0.45 : 0.2} className="transition-opacity duration-300" />

      {/* Tower Base Hillock / Moss Mound */}
      <path
        d="M50 310 C80 290, 200 290, 230 310 C240 325, 40 325, 50 310 Z"
        fill="#CFF2E0"
        stroke="#83D9A7"
        strokeWidth="3"
      />
      {/* Tiny daisies on mound */}
      <circle cx="70" cy="312" r="3.5" fill="#FFFFFF" />
      <circle cx="70" cy="312" r="1.5" fill="#FFF0B8" />
      <circle cx="210" cy="314" r="3.5" fill="#FFFFFF" />
      <circle cx="210" cy="314" r="1.5" fill="#FFF0B8" />

      {/* Main Round Tower Body */}
      <path
        d="M92 140 L84 300 C84 305, 196 305, 196 300 L188 140 Z"
        fill="url(#towerWall)"
        stroke="#B196F5"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Stone brick accents */}
      <path d="M102 180 Q112 178 122 180" stroke="#B196F5" strokeWidth="2" strokeLinecap="round" />
      <path d="M158 195 Q168 193 178 195" stroke="#B196F5" strokeWidth="2" strokeLinecap="round" />
      <path d="M110 240 Q120 238 130 240" stroke="#B196F5" strokeWidth="2" strokeLinecap="round" />
      <path d="M150 265 Q160 263 170 265" stroke="#B196F5" strokeWidth="2" strokeLinecap="round" />

      {/* Winding Flower Vine climbing the tower */}
      <path
        d="M90 295 Q115 270 105 240 T130 190 T115 150"
        stroke="#83D9A7"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Blossom buds on vine */}
      <circle cx="106" cy="272" r="4.5" fill="#FFD6E0" stroke="#F2A8BC" strokeWidth="1.5" />
      <circle cx="104" cy="240" r="4" fill="#FFD6E0" stroke="#F2A8BC" strokeWidth="1.5" />
      <circle cx="128" cy="192" r="4.5" fill="#FFD6E0" stroke="#F2A8BC" strokeWidth="1.5" />
      <circle cx="118" cy="154" r="4" fill="#FFD6E0" stroke="#F2A8BC" strokeWidth="1.5" />

      {/* Lower Arched Wooden Door */}
      <path
        d="M120 302 L120 256 C120 244, 160 244, 160 256 L160 302 Z"
        fill="#DFC29D"
        stroke="#855627"
        strokeWidth="3"
      />
      {/* Wood plank lines & brass handle */}
      <line x1="133" y1="250" x2="133" y2="302" stroke="#855627" strokeWidth="1.8" />
      <line x1="147" y1="250" x2="147" y2="302" stroke="#855627" strokeWidth="1.8" />
      <circle cx="153" cy="278" r="2.5" fill="#FFF0B8" stroke="#855627" strokeWidth="1" />

      {/* Balcony / Mid-tier Lookout */}
      <path
        d="M80 142 C80 138, 200 138, 200 142 L194 156 C194 158, 86 158, 86 156 Z"
        fill="#E7DCFF"
        stroke="#B196F5"
        strokeWidth="3"
      />
      {/* Balcony Railing */}
      <line x1="84" y1="130" x2="196" y2="130" stroke="#B196F5" strokeWidth="3" strokeLinecap="round" />
      {[92, 112, 132, 148, 168, 188].map((x) => (
        <line key={x} x1={x} y1="130" x2={x} y2="142" stroke="#B196F5" strokeWidth="2.5" />
      ))}

      {/* Glowing Round Stained Glass Window */}
      <circle cx="140" cy="108" r="16" fill="url(#windowGlow)" stroke="#B196F5" strokeWidth="3" />
      <line x1="140" y1="92" x2="140" y2="124" stroke="#B196F5" strokeWidth="2" />
      <line x1="124" y1="108" x2="156" y2="108" stroke="#B196F5" strokeWidth="2" />

      {/* Upper Spire Roof */}
      <polygon
        points="140,24 72,130 208,130"
        fill="url(#towerRoof)"
        stroke="#6C3FE0"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Roof tile scalloped curves */}
      <path d="M88 116 Q100 110 112 116 Q124 110 136 116 Q148 110 160 116 Q172 110 184 116" stroke="#D9C8FF" strokeWidth="2" fill="none" />
      <path d="M102 96 Q114 90 126 96 Q138 90 150 96 Q162 90 174 96" stroke="#D9C8FF" strokeWidth="2" fill="none" />

      {/* Weather Vane with Golden Star */}
      <line x1="140" y1="24" x2="140" y2="6" stroke="#FFC93C" strokeWidth="3" strokeLinecap="round" />
      <polygon points="140,0 144,7 152,8 146,14 148,22 140,17 132,22 134,14 128,8 136,7" fill="#FFC93C" stroke="#4B2A7B" strokeWidth="1.5" />

      {/* Cottage Chimney on Roof Slope with Animated Smoke Puffs */}
      <g transform="translate(176, 52)">
        <rect x="0" y="0" width="16" height="24" rx="2" fill="#E8D4B0" stroke="#4B2A7B" strokeWidth="2.5" />
        <line x1="-2" y1="0" x2="18" y2="0" stroke="#4B2A7B" strokeWidth="3" strokeLinecap="round" />
        {/* Animated Smoke Puffs */}
        <circle cx="8" cy="-6" r="6" fill="#FFFFFF" opacity="0.85" className="animate-smoke" />
        <circle cx="10" cy="-14" r="8" fill="#FFF0B8" opacity="0.75" className="animate-smoke-delay" />
      </g>

      {/* Fairy Faye Flying in playful loops */}
      <g className="animate-fairy-loop" style={{ transformOrigin: '175px 125px' }}>
        {/* Fairy Wings */}
        <ellipse cx="168" cy="118" rx="11" ry="6" fill="url(#wingShimmer)" stroke="#B196F5" strokeWidth="1.2" transform="rotate(-30 168 118)" />
        <ellipse cx="188" cy="118" rx="11" ry="6" fill="url(#wingShimmer)" stroke="#B196F5" strokeWidth="1.2" transform="rotate(30 188 118)" />

        {/* Faye Dress */}
        <path d="M172 122 L178 135 L184 122 Z" fill="#9670F5" />
        {/* Head */}
        <circle cx="178" cy="116" r="6" fill="#FFD9C0" />
        <circle cx="178" cy="113" r="5" fill="#6C3FE0" />
        {/* Flower crown */}
        <circle cx="178" cy="110" r="1.5" fill="#FFD6E0" />
        {/* Face smile */}
        <circle cx="176" cy="116" r="0.8" fill="#4A3566" />
        <circle cx="180" cy="116" r="0.8" fill="#4A3566" />
        {/* Hand waving star wand */}
        <line x1="184" y1="120" x2="194" y2="110" stroke="#FFD9C0" strokeWidth="2" strokeLinecap="round" />
        <line x1="194" y1="110" x2="199" y2="103" stroke="#E6CB67" strokeWidth="1.8" />
        <polygon points="199,100 201,104 206,104 202,107 203,111 199,108 195,111 196,107 192,104 197,104" fill="#FFF0B8" stroke="#E6B82E" strokeWidth="1" />
      </g>
    </svg>
  );
};

/**
 * Landmark 2: Market Research Methods
 * A Mint Treehouse Library with an ancient blossom tree, tiny books in arched windows,
 * suspended brass lantern, and Barnaby the Owl/Fox researcher with his magnifying glass.
 */
export const MintTreehouseLibrary: React.FC<LandmarkProps> = ({ className = '', size = 280, isHovered = false }) => {
  return (
    <svg
      viewBox="0 0 280 340"
      width={size}
      height={size * 1.21}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-all duration-300 ${className} ${isHovered ? 'scale-105 filter drop-shadow-[0_16px_32px_rgba(32,197,181,0.6)]' : 'filter drop-shadow-[0_10px_20px_rgba(75,42,123,0.18)]'}`}
      aria-label="Mint Treehouse Library of Market Research Methods"
    >
      <defs>
        {/* Tree trunk wood */}
        <linearGradient id="trunkWood" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C49A6C" />
          <stop offset="50%" stopColor="#A87B4C" />
          <stop offset="100%" stopColor="#855627" />
        </linearGradient>
        {/* Mint Tree Foliage Canopy */}
        <radialGradient id="mintCanopy" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#EEFAF3" />
          <stop offset="50%" stopColor="#CFF2E0" />
          <stop offset="100%" stopColor="#83D9A7" />
        </radialGradient>
        {/* Cozy library glow */}
        <radialGradient id="libraryGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF9D2" />
          <stop offset="70%" stopColor="#FFE58F" />
          <stop offset="100%" stopColor="#F5A97D" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      {/* Ambient soft glow on hover */}
      <circle cx="140" cy="180" r="110" fill="#CFF2E0" opacity={isHovered ? 0.45 : 0.2} className="transition-opacity duration-300" />

      {/* Lush Foliage Background Puff */}
      <g>
        <circle cx="90" cy="110" r="52" fill="url(#mintCanopy)" stroke="#83D9A7" strokeWidth="3" />
        <circle cx="190" cy="105" r="56" fill="url(#mintCanopy)" stroke="#83D9A7" strokeWidth="3" />
        <circle cx="140" cy="80" r="62" fill="url(#mintCanopy)" stroke="#83D9A7" strokeWidth="3" />
        <circle cx="65" cy="160" r="42" fill="url(#mintCanopy)" stroke="#83D9A7" strokeWidth="3" />
        <circle cx="215" cy="155" r="44" fill="url(#mintCanopy)" stroke="#83D9A7" strokeWidth="3" />
      </g>

      {/* Ancient Tree Trunk & Branches */}
      <path
        d="M110 320 Q122 240 102 180 L178 180 Q158 240 170 320 Z"
        fill="url(#trunkWood)"
        stroke="#855627"
        strokeWidth="3.5"
      />
      {/* Root flares */}
      <path d="M110 320 Q90 325 70 328" stroke="#855627" strokeWidth="4" strokeLinecap="round" />
      <path d="M170 320 Q190 325 210 328" stroke="#855627" strokeWidth="4" strokeLinecap="round" />
      {/* Wood grain swirls */}
      <path d="M136 215 C132 235, 146 250, 142 275" stroke="#DFC29D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M125 255 C122 270, 128 285, 126 300" stroke="#DFC29D" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Wooden Rope Ladder hanging down */}
      <g>
        <line x1="88" y1="210" x2="88" y2="305" stroke="#B88652" strokeWidth="2" strokeDasharray="3 2" />
        <line x1="104" y1="210" x2="104" y2="305" stroke="#B88652" strokeWidth="2" strokeDasharray="3 2" />
        {[225, 245, 265, 285].map((y) => (
          <line key={y} x1="86" y1={y} x2="106" y2={y} stroke="#855627" strokeWidth="3" strokeLinecap="round" />
        ))}
      </g>

      {/* Suspended Brass Lantern */}
      <g className="animate-sway" style={{ transformOrigin: '65px 190px' }}>
        <line x1="65" y1="190" x2="65" y2="215" stroke="#B88652" strokeWidth="2" />
        <rect x="58" y="215" width="14" height="18" rx="3" fill="#FFF0B8" stroke="#855627" strokeWidth="2" />
        <circle cx="65" cy="224" r="3.5" fill="#FFD9C0" />
      </g>

      {/* The Cozy Wooden Cabin Library built into branches */}
      <rect
        x="96"
        y="140"
        width="88"
        height="74"
        rx="10"
        fill="#FFF5E4"
        stroke="#855627"
        strokeWidth="3.5"
      />
      {/* Wood plank siding */}
      <line x1="96" y1="162" x2="184" y2="162" stroke="#E8D4B0" strokeWidth="2" />
      <line x1="96" y1="184" x2="184" y2="184" stroke="#E8D4B0" strokeWidth="2" />

      {/* Library Roof (Leaf shingled gable) */}
      <polygon
        points="140,94 82,146 198,146"
        fill="#83D9A7"
        stroke="#1F8C4F"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Leaf shingles */}
      <circle cx="112" cy="132" r="8" fill="#CFF2E0" stroke="#1F8C4F" strokeWidth="1.8" />
      <circle cx="140" cy="124" r="8" fill="#CFF2E0" stroke="#1F8C4F" strokeWidth="1.8" />
      <circle cx="168" cy="132" r="8" fill="#CFF2E0" stroke="#1F8C4F" strokeWidth="1.8" />

      {/* Cozy Library Chimney with Animated Smoke */}
      <g transform="translate(165, 82)">
        <rect x="0" y="0" width="14" height="22" rx="2" fill="#E8D4B0" stroke="#4B2A7B" strokeWidth="2.5" />
        <line x1="-2" y1="0" x2="16" y2="0" stroke="#4B2A7B" strokeWidth="3" strokeLinecap="round" />
        <circle cx="7" cy="-6" r="6" fill="#FFFFFF" opacity="0.85" className="animate-smoke" />
        <circle cx="9" cy="-14" r="8" fill="#CFF2E0" opacity="0.75" className="animate-smoke-delay" />
      </g>

      {/* Arched Library Window with Bookshelves inside */}
      <path
        d="M120 204 L120 168 C120 156, 160 156, 160 168 L160 204 Z"
        fill="url(#libraryGlow)"
        stroke="#855627"
        strokeWidth="3"
      />
      {/* Tiny colorful books on the sill */}
      <rect x="126" y="185" width="5" height="15" rx="1" fill="#FFD6E0" stroke="#F2A8BC" strokeWidth="1" />
      <rect x="133" y="182" width="6" height="18" rx="1" fill="#D9C8FF" stroke="#B196F5" strokeWidth="1" />
      <rect x="141" y="187" width="5" height="13" rx="1" fill="#CBE6FF" stroke="#88C0F5" strokeWidth="1" />
      <rect x="148" y="184" width="6" height="16" rx="1" fill="#FFF0B8" stroke="#E6CB67" strokeWidth="1" />

      {/* Barnaby the Owl Scholar perched on Branch with Magnifying Glass */}
      <g className={isHovered ? 'animate-bounce' : 'animate-bob'} style={{ transformOrigin: '195px 190px' }}>
        {/* Perch branch */}
        <path d="M180 205 Q205 200 230 208" stroke="#855627" strokeWidth="4" strokeLinecap="round" />

        {/* Owl Body */}
        <ellipse cx="205" cy="184" rx="16" ry="20" fill="#EAD7BA" stroke="#855627" strokeWidth="2.5" />
        {/* Chest feathers */}
        <path d="M198 182 Q205 188 212 182" stroke="#855627" strokeWidth="1.8" fill="none" />
        <path d="M198 190 Q205 196 212 190" stroke="#855627" strokeWidth="1.8" fill="none" />

        {/* Owl Ear Tufts */}
        <polygon points="194,168 190,154 200,164" fill="#855627" />
        <polygon points="216,168 220,154 210,164" fill="#855627" />

        {/* Spectacles (Brass Glasses) */}
        <circle cx="198" cy="172" r="7" stroke="#E6B82E" strokeWidth="2" fill="#FFFFFF" />
        <circle cx="212" cy="172" r="7" stroke="#E6B82E" strokeWidth="2" fill="#FFFFFF" />
        <line x1="205" y1="172" x2="205" y2="172" stroke="#E6B82E" strokeWidth="2" />

        {/* Inquisitive Eyes with Animated Blinking */}
        <g className="animate-blink">
          <circle cx="199" cy="172" r="3" fill="#4A3566" />
          <circle cx="200" cy="171" r="1" fill="#FFFFFF" />
          <circle cx="213" cy="172" r="3" fill="#4A3566" />
          <circle cx="214" cy="171" r="1" fill="#FFFFFF" />
        </g>

        {/* Cute Beak */}
        <polygon points="205,176 202,182 208,182" fill="#F5A97D" />

        {/* Magnifying Glass held in wing */}
        <line x1="214" y1="184" x2="228" y2="198" stroke="#855627" strokeWidth="3" strokeLinecap="round" />
        <circle cx="230" cy="192" r="11" stroke="#E6B82E" strokeWidth="2.5" fill="#CBE6FF" fillOpacity="0.45" />
        <path d="M224 188 A 7 7 0 0 1 236 188" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
};

/**
 * Landmark 3: Microeconomics
 * A Golden Honey-Cottage Market Stall with striped butter canopy,
 * honey pots, wooden barrels, and Pip the bunny weighing golden coins on a balancing scale.
 */
export const GoldenHoneyMarketStall: React.FC<LandmarkProps> = ({ className = '', size = 280, isHovered = false }) => {
  return (
    <svg
      viewBox="0 0 280 340"
      width={size}
      height={size * 1.21}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-all duration-300 ${className} ${isHovered ? 'scale-105 filter drop-shadow-[0_16px_32px_rgba(255,201,60,0.65)]' : 'filter drop-shadow-[0_10px_20px_rgba(75,42,123,0.18)]'}`}
      aria-label="Golden Honey Market Stall of Microeconomics"
    >
      <defs>
        {/* Honey pot glow */}
        <linearGradient id="honeyGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF0B8" />
          <stop offset="60%" stopColor="#E6B82E" />
          <stop offset="100%" stopColor="#A67C0D" />
        </linearGradient>
        {/* Cottage stone */}
        <linearGradient id="cottageWall" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFF5E4" />
          <stop offset="100%" stopColor="#EAD7BA" />
        </linearGradient>
      </defs>

      {/* Ambient soft glow on hover */}
      <circle cx="140" cy="180" r="110" fill="#FFF0B8" opacity={isHovered ? 0.45 : 0.2} className="transition-opacity duration-300" />

      {/* Meadow Patch with Clover Flowers */}
      <ellipse cx="140" cy="305" rx="90" ry="22" fill="#CFF2E0" stroke="#83D9A7" strokeWidth="3" />
      {/* Clover leaves */}
      <circle cx="65" cy="300" r="3" fill="#83D9A7" />
      <circle cx="70" cy="300" r="3" fill="#83D9A7" />
      <circle cx="68" cy="296" r="3" fill="#83D9A7" />

      {/* Honey Cottage Wall */}
      <rect
        x="65"
        y="160"
        width="150"
        height="125"
        rx="16"
        fill="url(#cottageWall)"
        stroke="#855627"
        strokeWidth="3.5"
      />

      {/* Chimney with animated puffs of smoke */}
      <rect x="78" y="105" width="22" height="40" rx="3" fill="#DFC29D" stroke="#4B2A7B" strokeWidth="2.8" />
      <path d="M74 105 L104 105" stroke="#4B2A7B" strokeWidth="3.2" strokeLinecap="round" />
      {/* Animated chimney smoke puffs */}
      <g>
        <circle cx="89" cy="94" r="6" fill="#FFFFFF" opacity="0.85" className="animate-smoke" />
        <circle cx="93" cy="84" r="8" fill="#FFF0B8" opacity="0.75" className="animate-smoke-delay" />
      </g>

      {/* Market Counter Window */}
      <rect x="80" y="180" width="120" height="70" rx="8" fill="#FFFDF0" stroke="#4B2A7B" strokeWidth="3" />
      {/* Counter ledge */}
      <rect x="72" y="245" width="136" height="12" rx="4" fill="#B88652" stroke="#4B2A7B" strokeWidth="2.8" />

      {/* Striped Butter & Coral Scalloped Awning / Canopy */}
      <g>
        {/* Main canopy slope */}
        <polygon
          points="55,160 225,160 215,125 65,125"
          fill="#FFC93C"
          stroke="#4B2A7B"
          strokeWidth="3.2"
        />
        {/* Coral stripes */}
        <polygon points="90,160 115,160 110,125 85,125" fill="#FF7F66" />
        <polygon points="140,160 165,160 160,125 135,125" fill="#FF7F66" />
        <polygon points="190,160 215,160 210,125 185,125" fill="#FF7F66" />
        {/* Scalloped trim */}
        {[65, 87, 109, 131, 153, 175, 197, 219].map((x, i) => (
          <path
            key={i}
            d={`M${x - 11} 160 Q${x} 172 ${x + 11} 160`}
            fill={i % 2 === 0 ? '#FFC93C' : '#FF7F66'}
            stroke="#4B2A7B"
            strokeWidth="2.5"
          />
        ))}
      </g>

      {/* Little fluttering butterfly above awning */}
      <g className="animate-flutter" style={{ transformOrigin: '190px 115px' }}>
        <ellipse cx="190" cy="115" rx="5" ry="3" fill="#FF5FA2" stroke="#4B2A7B" strokeWidth="1" transform="rotate(-30 190 115)" />
        <ellipse cx="196" cy="115" rx="5" ry="3" fill="#B79CFF" stroke="#4B2A7B" strokeWidth="1" transform="rotate(30 196 115)" />
        <circle cx="193" cy="115" r="1.2" fill="#4B2A7B" />
      </g>

      {/* Honey Jars on counter */}
      <g>
        <rect x="84" y="222" width="16" height="22" rx="4" fill="url(#honeyGlow)" stroke="#4B2A7B" strokeWidth="2.2" />
        <ellipse cx="92" cy="222" rx="7" ry="2.5" fill="#FFFDF0" stroke="#4B2A7B" strokeWidth="1.5" />
        <rect x="87" y="228" width="10" height="9" rx="1.5" fill="#FFFFFF" />
        <text x="92" y="235" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#4B2A7B" fontFamily="sans-serif">¢</text>

        {/* Second Honey Jar */}
        <rect x="106" y="226" width="14" height="18" rx="4" fill="url(#honeyGlow)" stroke="#4B2A7B" strokeWidth="2.2" />
        <ellipse cx="113" cy="226" rx="6" ry="2" fill="#FFFDF0" stroke="#4B2A7B" strokeWidth="1.5" />
      </g>

      {/* Wooden Honey Dipper */}
      <line x1="126" y1="225" x2="135" y2="245" stroke="#4B2A7B" strokeWidth="2.8" strokeLinecap="round" />

      {/* Pip the Bunny weighing coins on the Balancing Scale (hopping occasionally) */}
      <g className={isHovered ? 'animate-bounce' : 'animate-hop'} style={{ transformOrigin: '175px 235px' }}>
        {/* Bunny Body */}
        <ellipse cx="168" cy="235" rx="16" ry="18" fill="#FFF8EE" stroke="#DFC29D" strokeWidth="2" />
        {/* Head */}
        <circle cx="168" cy="208" r="12" fill="#FFF8EE" stroke="#DFC29D" strokeWidth="2" />
        {/* Floppy Bunny Ears */}
        <path d="M162 198 C158 178, 148 165, 154 165 C162 165, 166 182, 166 198 Z" fill="#FFF8EE" stroke="#DFC29D" strokeWidth="1.8" />
        <path d="M160 194 C158 180, 153 172, 156 172 C160 172, 163 184, 163 194 Z" fill="#FFD6E0" />

        <path d="M174 198 C178 178, 192 168, 188 172 C182 178, 178 186, 176 198 Z" fill="#FFF8EE" stroke="#DFC29D" strokeWidth="1.8" />
        <path d="M176 194 C179 182, 186 175, 184 177 C180 182, 178 188, 177 194 Z" fill="#FFD6E0" />

        {/* Rosy Cheeks */}
        <circle cx="162" cy="212" r="2.5" fill="#FFD6E0" />
        <circle cx="174" cy="212" r="2.5" fill="#FFD6E0" />
        {/* Eyes */}
        <circle cx="164" cy="206" r="1.8" fill="#4A3566" />
        <circle cx="172" cy="206" r="1.8" fill="#4A3566" />
        {/* Bunny Nose */}
        <polygon points="168,210 166,208 170,208" fill="#F2A8BC" />

        {/* The Balancing Scale */}
        <g transform="translate(182, 218)">
          <line x1="14" y1="6" x2="14" y2="28" stroke="#855627" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="8,28 20,28 17,24 11,24" fill="#855627" />
          {/* Balance beam slightly tilted */}
          <line x1="2" y1="8" x2="26" y2="5" stroke="#B88652" strokeWidth="2" strokeLinecap="round" />
          {/* Left Pan (Demand) with golden coin */}
          <line x1="4" y1="8" x2="1" y2="16" stroke="#855627" strokeWidth="1" />
          <line x1="8" y1="8" x2="9" y2="16" stroke="#855627" strokeWidth="1" />
          <ellipse cx="5" cy="16" rx="5" ry="2" fill="#E6CB67" stroke="#855627" strokeWidth="1" />
          <circle cx="5" cy="14" r="2.5" fill="#FFF0B8" stroke="#E6B82E" strokeWidth="0.8" />

          {/* Right Pan (Supply) */}
          <line x1="20" y1="5" x2="17" y2="13" stroke="#855627" strokeWidth="1" />
          <line x1="24" y1="5" x2="25" y2="13" stroke="#855627" strokeWidth="1" />
          <ellipse cx="21" cy="13" rx="5" ry="2" fill="#E6CB67" stroke="#855627" strokeWidth="1" />
        </g>
      </g>
    </svg>
  );
};
