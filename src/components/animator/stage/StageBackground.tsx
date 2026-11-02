import React from 'react';
import { motion } from 'framer-motion';

interface StageBackgroundProps {
  type: 'market' | 'meadow' | 'treehouse_interior' | 'tower_room';
  camera?: 'static' | 'pan-left' | 'pan-right' | 'zoom-in' | 'zoom-on-bunny' | 'zoom-on-actor';
  reducedMotion?: boolean;
}

export const StageBackground: React.FC<StageBackgroundProps> = ({
  type,
  camera = 'static',
  reducedMotion = false,
}) => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
      {type === 'market' && (
        <svg viewBox="0 0 800 450" className="w-full h-full object-cover preserve-3d">
          <defs>
            <linearGradient id="marketSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF2E2" />
              <stop offset="60%" stopColor="#FFF8EE" />
              <stop offset="100%" stopColor="#E2F5E9" />
            </linearGradient>
            <linearGradient id="canopyStripe1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFAA8A" />
              <stop offset="100%" stopColor="#FF8F6B" />
            </linearGradient>
            <linearGradient id="canopyStripe2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFBF2" />
              <stop offset="100%" stopColor="#F5EFE0" />
            </linearGradient>
            <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E0B68A" />
              <stop offset="100%" stopColor="#B88A58" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width="800" height="450" fill="url(#marketSky)" />

          {/* Distant soft trees */}
          <ellipse cx="120" cy="220" rx="90" ry="70" fill="#BCEAD0" opacity="0.6" />
          <ellipse cx="240" cy="200" rx="110" ry="80" fill="#CFEFE0" opacity="0.5" />
          <ellipse cx="680" cy="210" rx="100" ry="75" fill="#BCEAD0" opacity="0.6" />

          {/* Rolling Grassy Hills */}
          <path d="M 0 240 Q 200 200 450 250 Q 650 280 800 230 L 800 450 L 0 450 Z" fill="#D8F3DC" />
          <path d="M 0 300 Q 300 280 500 320 Q 700 340 800 290 L 800 450 L 0 450 Z" fill="#B7E4C7" />

          {/* Cobblestone Market Square Ground */}
          <path d="M 0 350 Q 400 330 800 350 L 800 450 L 0 450 Z" fill="#E8DBC5" />
          <ellipse cx="320" cy="390" rx="28" ry="10" fill="#DFD0B8" opacity="0.7" />
          <ellipse cx="480" cy="405" rx="35" ry="12" fill="#DFD0B8" opacity="0.7" />
          <ellipse cx="620" cy="385" rx="30" ry="9" fill="#DFD0B8" opacity="0.7" />

          {/* Pip's Honey & Carrot Market Stall (Placed left-center) */}
          <g transform="translate(60, 110)">
            {/* Wooden Support Posts */}
            <rect x="20" y="50" width="12" height="230" fill="url(#woodGrad)" rx="3" />
            <rect x="260" y="50" width="12" height="230" fill="url(#woodGrad)" rx="3" />

            {/* Pastel Striped Awning Canopy */}
            <path d="M 0 40 Q 145 15 290 40 L 290 90 Q 145 75 0 90 Z" fill="url(#canopyStripe1)" />
            {/* Scalloped edge */}
            <path
              d="M 0 90 Q 24 105 48 90 Q 72 105 96 90 Q 120 105 145 90 Q 170 105 194 90 Q 218 105 242 90 Q 266 105 290 90"
              fill="none"
              stroke="#E87650"
              strokeWidth="2.5"
            />
            {/* Awning stripes */}
            <path d="M 48 30 L 48 90" stroke="url(#canopyStripe2)" strokeWidth="18" opacity="0.9" />
            <path d="M 145 22 L 145 88" stroke="url(#canopyStripe2)" strokeWidth="18" opacity="0.9" />
            <path d="M 242 30 L 242 90" stroke="url(#canopyStripe2)" strokeWidth="18" opacity="0.9" />

            {/* Bunting Flags */}
            <polygon points="30,92 50,118 70,92" fill="#FED856" />
            <polygon points="80,92 100,118 120,92" fill="#A8E6CF" />
            <polygon points="130,92 150,118 170,92" fill="#FFD3B6" />
            <polygon points="180,92 200,118 220,92" fill="#DED2F9" />

            {/* Counter Table */}
            <rect x="5" y="195" width="280" height="75" fill="url(#woodGrad)" rx="6" />
            <rect x="0" y="190" width="290" height="14" fill="#C99B6A" rx="4" />

            {/* Baskets & Jars on Counter */}
            <rect x="25" y="165" width="40" height="26" fill="#D9A874" rx="4" />
            <circle cx="35" cy="162" r="5" fill="#FF8A48" />
            <circle cx="45" cy="160" r="6" fill="#FF8A48" />
            <circle cx="55" cy="163" r="5" fill="#FF8A48" />

            {/* Golden Honey Pots */}
            <ellipse cx="230" cy="176" rx="14" ry="16" fill="#FED856" stroke="#D1981F" strokeWidth="1.5" />
            <ellipse cx="230" cy="162" rx="10" ry="3" fill="#FFEAA7" />
            <rect x="222" y="157" width="16" height="5" fill="#D1981F" rx="2" />
            <text x="230" y="180" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#784A0F">
              🍯
            </text>
          </g>

          {/* Wildflowers near path */}
          <circle cx="680" cy="370" r="5" fill="#FF85A1" />
          <circle cx="688" cy="375" r="4" fill="#FED856" />
          <circle cx="720" cy="385" r="6" fill="#A8DADC" />
        </svg>
      )}

      {type === 'meadow' && (
        <svg viewBox="0 0 800 450" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="meadowSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF0E6" />
              <stop offset="45%" stopColor="#F5EDFA" />
              <stop offset="100%" stopColor="#E2F5E9" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width="800" height="450" fill="url(#meadowSky)" />

          {/* Soft floating clouds */}
          <ellipse cx="200" cy="80" rx="70" ry="24" fill="#FFFFFF" opacity="0.65" />
          <ellipse cx="620" cy="95" rx="85" ry="28" fill="#FFFFFF" opacity="0.65" />

          {/* Distant pastel hills & fairy spire */}
          <path d="M 0 200 Q 250 150 500 210 Q 700 240 800 190 L 800 450 L 0 450 Z" fill="#D3E2F8" opacity="0.5" />
          <path d="M 0 240 Q 300 200 600 260 Q 750 280 800 240 L 800 450 L 0 450 Z" fill="#D8F3DC" />

          {/* Winding Garden Path */}
          <path
            d="M 120 450 C 260 380, 280 320, 420 280 C 490 260, 520 250, 540 240 L 590 240 C 560 260, 520 280, 480 320 C 380 390, 320 420, 240 450 Z"
            fill="#FFF5DE"
            stroke="#EADBBF"
            strokeWidth="1.5"
          />

          {/* Foreground lush lawn */}
          <path d="M 0 340 Q 400 320 800 350 L 800 450 L 0 450 Z" fill="#B7E4C7" />

          {/* Mushrooms & Wildflowers */}
          <g transform="translate(140, 370)">
            <ellipse cx="10" cy="18" rx="3" ry="8" fill="#FFFDF8" />
            <path d="M 0 16 Q 10 2 20 16 Z" fill="#FF7B90" />
            <circle cx="7" cy="11" r="1.5" fill="#FFFFFF" />
            <circle cx="14" cy="10" r="1.5" fill="#FFFFFF" />
          </g>

          <g transform="translate(710, 360)">
            <ellipse cx="10" cy="18" rx="3" ry="8" fill="#FFFDF8" />
            <path d="M 0 16 Q 10 2 20 16 Z" fill="#9670F5" />
            <circle cx="7" cy="11" r="1.5" fill="#FFFFFF" />
            <circle cx="13" cy="9" r="1.5" fill="#FFFFFF" />
          </g>
        </svg>
      )}

      {type === 'treehouse_interior' && (
        <svg viewBox="0 0 800 450" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="treeWall" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F9EDE0" />
              <stop offset="100%" stopColor="#ECD5BF" />
            </linearGradient>
            <linearGradient id="windowView" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D8F3DC" />
              <stop offset="100%" stopColor="#95D5B2" />
            </linearGradient>
          </defs>

          {/* Cozy curved treehouse interior walls */}
          <rect width="800" height="450" fill="url(#treeWall)" />

          {/* Big round sunny window in center */}
          <circle cx="400" cy="160" r="110" fill="url(#windowView)" stroke="#C69E76" strokeWidth="12" />
          {/* Window pane crosses */}
          <line x1="400" y1="50" x2="400" y2="270" stroke="#C69E76" strokeWidth="6" />
          <line x1="290" y1="160" x2="510" y2="160" stroke="#C69E76" strokeWidth="6" />

          {/* Sunny leaves outside window */}
          <circle cx="340" cy="120" r="24" fill="#74C69D" opacity="0.6" />
          <circle cx="450" cy="110" r="28" fill="#52B788" opacity="0.5" />

          {/* Bookshelves on the left */}
          <g transform="translate(30, 80)">
            <rect x="0" y="0" width="160" height="260" fill="#B98858" rx="6" />
            {/* Shelf planks */}
            <rect x="6" y="80" width="148" height="10" fill="#9E6E3E" rx="2" />
            <rect x="6" y="160" width="148" height="10" fill="#9E6E3E" rx="2" />
            {/* Pastel books */}
            <rect x="15" y="32" width="16" height="48" fill="#F8AD9D" rx="2" />
            <rect x="33" y="24" width="20" height="56" fill="#A8DADC" rx="2" />
            <rect x="55" y="36" width="18" height="44" fill="#CDB4DB" rx="2" />
            <rect x="75" y="20" width="22" height="60" fill="#FFE5D9" rx="2" />
            <rect x="100" y="30" width="14" height="50" fill="#B5E48C" rx="2" />

            <rect x="18" y="115" width="22" height="45" fill="#B5E48C" rx="2" />
            <rect x="42" y="105" width="18" height="55" fill="#F8AD9D" rx="2" />
            <rect x="62" y="112" width="26" height="48" fill="#A8DADC" rx="2" />
            <rect x="90" y="120" width="16" height="40" fill="#CDB4DB" rx="2" />
          </g>

          {/* Hanging amber lantern */}
          <line x1="680" y1="0" x2="680" y2="100" stroke="#9E6E3E" strokeWidth="2.5" />
          <polygon points="665,100 695,100 690,135 670,135" fill="#FFEAA7" stroke="#D4A373" strokeWidth="2" />
          <circle cx="680" cy="118" r="10" fill="#FED856" opacity="0.6" filter="blur(3px)" />

          {/* Barnaby's research study desk & wooden floor */}
          <path d="M 0 360 L 800 360 L 800 450 L 0 450 Z" fill="#D4A373" />
          <rect x="220" y="310" width="360" height="70" fill="#B98858" rx="6" />
          <rect x="210" y="302" width="380" height="14" fill="#9E6E3E" rx="3" />

          {/* Rolled parchment & sample test jars */}
          <ellipse cx="260" cy="300" rx="14" ry="4" fill="#FFF5DE" stroke="#EADBBF" strokeWidth="1" />
          <rect x="500" y="280" width="16" height="22" fill="#D3E2F8" rx="3" stroke="#90CDF4" strokeWidth="1" />
        </svg>
      )}

      {type === 'tower_room' && (
        <svg viewBox="0 0 800 450" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="towerSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E9D5FF" />
              <stop offset="60%" stopColor="#F5D0FE" />
              <stop offset="100%" stopColor="#FED7AA" />
            </linearGradient>
            <linearGradient id="stoneWall" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F1EFF8" />
              <stop offset="100%" stopColor="#E4DFEE" />
            </linearGradient>
          </defs>

          {/* Stone Tower Wall */}
          <rect width="800" height="450" fill="url(#stoneWall)" />

          {/* Grand Arched Stone Window overlooking magical twilight */}
          <path
            d="M 280 340 L 280 180 Q 400 40 520 180 L 520 340 Z"
            fill="url(#towerSky)"
            stroke="#D6CDE2"
            strokeWidth="14"
          />

          {/* Distant magical castle silhouette & stars */}
          <circle cx="340" cy="150" r="1.5" fill="#FFFFFF" />
          <circle cx="460" cy="120" r="2" fill="#FFFFFF" />
          <circle cx="480" cy="180" r="1.5" fill="#FFFFFF" />
          <polygon points="380,240 384,210 388,240" fill="#C084FC" opacity="0.6" />
          <polygon points="410,230 416,190 422,230" fill="#C084FC" opacity="0.6" />

          {/* Workbench Table */}
          <path d="M 0 370 L 800 370 L 800 450 L 0 450 Z" fill="#DDD6FE" />
          <rect x="220" y="325" width="360" height="60" fill="#C4B5FD" rx="6" />
          <rect x="200" y="318" width="400" height="12" fill="#A78BFA" rx="3" />

          {/* Blueprint Scroll on table */}
          <rect x="260" y="312" width="120" height="14" fill="#EDE9FE" rx="2" stroke="#8B5CF6" strokeWidth="1" />
          <line x1="280" y1="319" x2="360" y2="319" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 2" />

          {/* Crystal wand stand */}
          <polygon points="480,318 495,290 510,318" fill="#F472B6" opacity="0.8" />
          <circle cx="495" cy="285" r="5" fill="#FDE047" />
        </svg>
      )}
    </div>
  );
};
