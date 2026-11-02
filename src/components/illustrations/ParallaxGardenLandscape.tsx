import React, { useState, useEffect } from 'react';

interface ParallaxLandscapeProps {
  children?: React.ReactNode;
}

export const ParallaxGardenLandscape: React.FC<ParallaxLandscapeProps> = ({ children }) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMouseMove = (e: MouseEvent) => {
      if (mediaQuery.matches) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Parallax offsets (scaled delicately for subtle 60fps feel)
  const l1Offset = reducedMotion ? { x: 0, y: 0 } : { x: mouseOffset.x * 6, y: mouseOffset.y * 4 };
  const l2Offset = reducedMotion ? { x: 0, y: 0 } : { x: mouseOffset.x * 12, y: mouseOffset.y * 7 };
  const l3Offset = reducedMotion ? { x: 0, y: 0 } : { x: mouseOffset.x * 18, y: mouseOffset.y * 11 };
  const l4Offset = reducedMotion ? { x: 0, y: 0 } : { x: mouseOffset.x * 24, y: mouseOffset.y * 14 };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#FFFDF8] paper-grain select-none">
      {/* Golden-Hour Subtle Warm Vignette Frame */}
      <div className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_120px_rgba(255,201,163,0.35)]" />

      {/* ======================================================== */}
      {/* LAYER 0: Sunrise Sky Gradient & Sunburst Rays (Far Sky)  */}
      {/* ======================================================== */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-700 ease-out"
        style={{ transform: `translate3d(${l1Offset.x}px, ${l1Offset.y}px, 0)` }}
      >
        <svg
          viewBox="0 0 1440 900"
          className="w-full h-full object-cover min-w-[1200px]"
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            {/* Rich Sunrise Sky: Apricot -> Blush Pink -> Lilac -> Periwinkle */}
            <linearGradient id="sunriseSky" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#FFF2D6" />   {/* Warm butter ground */}
              <stop offset="20%" stopColor="#FFC9A3" />  {/* Saturated Apricot */}
              <stop offset="48%" stopColor="#FF9EC4" />  {/* Vivid Blush Pink */}
              <stop offset="75%" stopColor="#B79CFF" />  {/* Lilac Accent */}
              <stop offset="100%" stopColor="#8FB4FF" /> {/* Periwinkle Dawn */}
            </linearGradient>

            {/* Radiant Golden Sun Glow */}
            <radialGradient id="goldenSun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFDF0" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#FFE082" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#FFC93C" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FF9EC4" stopOpacity="0" />
            </radialGradient>

            {/* Distant Mountains Gradient */}
            <linearGradient id="purpleRidge" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#B79CFF" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#7BE0A8" stopOpacity="0.45" />
            </linearGradient>
          </defs>

          {/* Full-bleed sky rectangle */}
          <rect width="1440" height="900" fill="url(#sunriseSky)" />

          {/* Radiant Sun Light Rays spreading upward */}
          <g transform="translate(720, 390)" opacity="0.45">
            {[0, 25, 50, 75, 105, 130, 155, 180, 205, 230, 255, 285, 310, 335].map((deg, i) => (
              <polygon
                key={i}
                points="0,0 -40,-600 40,-600"
                fill="#FFF9D2"
                transform={`rotate(${deg})`}
                opacity={i % 2 === 0 ? '0.6' : '0.35'}
              />
            ))}
          </g>

          {/* Central Sun Halo */}
          <circle cx="720" cy="390" r="175" fill="url(#goldenSun)" />

          {/* Golden Sparkle Stars in the sky */}
          {[
            { cx: 320, cy: 110, s: 16, fill: '#FFC93C' },
            { cx: 580, cy: 80, s: 12, fill: '#FFFFFF' },
            { cx: 940, cy: 120, s: 15, fill: '#FF5FA2' },
            { cx: 1180, cy: 90, s: 14, fill: '#FFC93C' },
            { cx: 210, cy: 220, s: 10, fill: '#FFFFFF' },
            { cx: 1280, cy: 240, s: 12, fill: '#FFF0B8' },
          ].map((sp, i) => (
            <g key={i} transform={`translate(${sp.cx}, ${sp.cy})`}>
              <path
                d="M0 -8 Q2 -2 8 0 Q2 2 0 8 Q-2 2 -8 0 Q-2 -2 0 -8 Z"
                fill={sp.fill}
                opacity="0.85"
              />
            </g>
          ))}

          {/* Distant Mountain Silhouettes & Tree-of-Life Silhouette on horizon */}
          <path
            d="M-50 490 Q220 370 480 450 T1020 420 T1500 470 L1500 700 L-50 700 Z"
            fill="url(#purpleRidge)"
            opacity="0.9"
          />

          {/* Distant Spire silhouette on ridge */}
          <g transform="translate(690, 390) scale(0.7)" opacity="0.65">
            <rect x="0" y="20" width="30" height="30" fill="#B79CFF" stroke="#4B2A7B" strokeWidth="1.5" />
            <polygon points="15,0 0,20 30,20" fill="#9B72CF" stroke="#4B2A7B" strokeWidth="1.5" />
            <rect x="25" y="10" width="20" height="40" fill="#B79CFF" stroke="#4B2A7B" strokeWidth="1.5" />
            <polygon points="35,-5 25,10 45,10" fill="#9B72CF" stroke="#4B2A7B" strokeWidth="1.5" />
          </g>
        </svg>
      </div>

      {/* ======================================================== */}
      {/* LAYER 1: Drifting Fluffy Watercolor Clouds               */}
      {/* ======================================================== */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-500 ease-out"
        style={{ transform: `translate3d(${l2Offset.x}px, ${l2Offset.y}px, 0)` }}
      >
        <svg viewBox="0 0 1440 900" className="w-full h-full object-cover min-w-[1200px]" fill="none">
          {/* Cloud 1 Top-Left (drifting) */}
          <g className="animate-cloud-drift opacity-90" style={{ transformOrigin: '240px 140px' }}>
            <path
              d="M160 140 C160 115 185 95 215 95 C230 75 265 70 295 85 C320 65 365 70 385 95 C415 95 435 115 435 140 C435 165 410 175 380 175 L190 175 C165 175 160 160 160 140 Z"
              fill="#FFFFFF"
              stroke="#B79CFF"
              strokeWidth="2.5"
            />
            <path
              d="M175 148 C175 130 195 115 220 115 C240 100 270 100 290 115 C310 105 345 105 365 125 C390 125 405 135 405 155 L190 155 Z"
              fill="#FFC93C"
              opacity="0.35"
            />
          </g>

          {/* Cloud 2 Mid-Right */}
          <g className="animate-cloud-drift opacity-85" style={{ animationDelay: '12s', transformOrigin: '1100px 180px' }}>
            <path
              d="M1020 180 C1020 155 1045 140 1075 140 C1095 120 1135 115 1165 130 C1195 115 1235 120 1255 140 C1285 140 1305 160 1305 180 C1305 205 1280 215 1250 215 L1050 215 C1025 215 1020 200 1020 180 Z"
              fill="#FFFFFF"
              stroke="#B79CFF"
              strokeWidth="2.5"
            />
            <circle cx="1180" cy="165" r="18" fill="#FFA6CD" opacity="0.25" />
          </g>
        </svg>
      </div>

      {/* ======================================================== */}
      {/* LAYER 2: Rolling Vivid Green Hills & Winding Earth Path  */}
      {/* ======================================================== */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${l3Offset.x}px, ${l3Offset.y}px, 0)` }}
      >
        <svg
          viewBox="0 0 1440 900"
          className="w-full h-full object-cover min-w-[1200px]"
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            {/* Midground Hill: Vivid Grass Green Gradient */}
            <linearGradient id="vividMidHill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#AEE9C7" />
              <stop offset="40%" stopColor="#7BE0A8" />
              <stop offset="100%" stopColor="#52D093" />
            </linearGradient>

            {/* Foreground Lush Meadow: Deep Grass Green */}
            <linearGradient id="vividForeMeadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7BE0A8" />
              <stop offset="50%" stopColor="#52D093" />
              <stop offset="100%" stopColor="#3FC48A" />
            </linearGradient>

            {/* Rich Earth/Cobblestone Winding Path */}
            <linearGradient id="richWindingPath" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2D6" />
              <stop offset="30%" stopColor="#F7DFBA" />
              <stop offset="70%" stopColor="#E6C89C" />
              <stop offset="100%" stopColor="#C99E6B" />
            </linearGradient>
          </defs>

          {/* Upper Rolling Hill (supporting Lavender Tower on left) */}
          <path
            d="M-40 520 Q180 410 460 460 T1080 440 T1480 480 L1480 920 L-40 920 Z"
            fill="url(#vividMidHill)"
            stroke="#4B2A7B"
            strokeWidth="3.2"
          />

          {/* Lower Foreground Rolling Meadow (supporting Market and Library) */}
          <path
            d="M-50 610 Q280 540 620 610 T1260 570 T1500 620 L1500 950 L-50 950 Z"
            fill="url(#vividForeMeadow)"
            stroke="#4B2A7B"
            strokeWidth="3.5"
          />

          {/* The Storybook Winding Cobblestone / Earth Path */}
          <path
            d="M 680 910 
               C 690 850, 750 810, 770 760 
               C 790 700, 740 660, 680 640 
               C 600 610, 480 620, 390 580 
               C 320 550, 290 510, 260 480
               L 310 470
               C 350 505, 410 525, 490 540
               C 620 565, 780 580, 840 640
               C 890 690, 860 760, 820 810
               C 780 850, 760 880, 750 910 Z"
            fill="url(#richWindingPath)"
            stroke="#4B2A7B"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {/* Stepping stones / pebbles embedded along the path */}
          {[
            { cx: 720, cy: 870, r: 13 },
            { cx: 750, cy: 830, r: 11 },
            { cx: 780, cy: 770, r: 15 },
            { cx: 730, cy: 710, r: 12 },
            { cx: 670, cy: 660, r: 14 },
            { cx: 580, cy: 620, r: 13 },
            { cx: 480, cy: 590, r: 11 },
            { cx: 380, cy: 560, r: 12 },
            { cx: 300, cy: 510, r: 10 },
          ].map((st, i) => (
            <ellipse
              key={i}
              cx={st.cx}
              cy={st.cy}
              rx={st.r}
              ry={st.r * 0.65}
              fill="#FFF8EE"
              stroke="#4B2A7B"
              strokeWidth="2.2"
            />
          ))}

          {/* Wildflowers scattered across meadows with deep plum outlines */}
          {[
            { cx: 120, cy: 670, color: '#FF5FA2' },
            { cx: 180, cy: 710, color: '#FFC93C' },
            { cx: 420, cy: 700, color: '#B79CFF' },
            { cx: 520, cy: 770, color: '#FF5FA2' },
            { cx: 880, cy: 720, color: '#FFC93C' },
            { cx: 960, cy: 680, color: '#FF7F66' },
            { cx: 1120, cy: 740, color: '#B79CFF' },
            { cx: 1240, cy: 700, color: '#FFC93C' },
          ].map((fl, i) => (
            <g key={i}>
              <circle cx={fl.cx} cy={fl.cy} r="6" fill={fl.color} stroke="#4B2A7B" strokeWidth="1.8" />
              <circle cx={fl.cx} cy={fl.cy} r="2.5" fill="#FFFFFF" />
            </g>
          ))}
        </svg>
      </div>

      {/* ======================================================== */}
      {/* LAYER 3: FOREGROUND BOTANICALS FRAMING BOTTOM CORNERS    */}
      {/* ======================================================== */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-200 ease-out z-20"
        style={{ transform: `translate3d(${l4Offset.x * 1.2}px, ${l4Offset.y * 1.2}px, 0)` }}
      >
        <svg viewBox="0 0 1440 900" className="w-full h-full object-cover min-w-[1200px]" fill="none">
          {/* ==================================================== */}
          {/* BOTTOM-LEFT CORNER: Big Flowers, Grass & Mushrooms   */}
          {/* ==================================================== */}
          <g transform="translate(0, 720)">
            {/* Lush Tall Grass Tufts */}
            <path d="M10 180 Q35 70 85 40 Q55 90 40 180 Z" fill="#3FC48A" stroke="#4B2A7B" strokeWidth="2.8" />
            <path d="M40 180 Q80 80 145 60 Q105 110 80 180 Z" fill="#7BE0A8" stroke="#4B2A7B" strokeWidth="2.8" />
            <path d="M80 180 Q120 100 180 85 Q140 130 110 180 Z" fill="#20C5B5" stroke="#4B2A7B" strokeWidth="2.8" />

            {/* Red/Coral Spotted Toadstool 1 */}
            <path d="M60 160 Q63 125 75 110 Q87 125 90 160 Z" fill="#FFF8EE" stroke="#4B2A7B" strokeWidth="2.8" />
            <path d="M42 120 C42 85, 108 85, 108 120 Z" fill="#FF5FA2" stroke="#4B2A7B" strokeWidth="3" />
            <circle cx="62" cy="102" r="4.5" fill="#FFFFFF" />
            <circle cx="85" cy="98" r="5.5" fill="#FFFFFF" />
            <circle cx="95" cy="112" r="3.5" fill="#FFFFFF" />
            <circle cx="54" cy="114" r="3.5" fill="#FFFFFF" />

            {/* Smaller Toadstool 2 */}
            <path d="M102 165 Q104 140 112 128 Q120 140 122 165 Z" fill="#FFF8EE" stroke="#4B2A7B" strokeWidth="2.5" />
            <path d="M92 135 C92 110, 132 110, 132 135 Z" fill="#FF7F66" stroke="#4B2A7B" strokeWidth="2.5" />
            <circle cx="106" cy="123" r="3.5" fill="#FFFFFF" />
            <circle cx="120" cy="122" r="3" fill="#FFFFFF" />

            {/* Big Sunny Daisy Blossom */}
            <g transform="translate(130, 95)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <ellipse
                  key={i}
                  cx="0"
                  cy="-24"
                  rx="7"
                  ry="16"
                  fill="#FFFFFF"
                  stroke="#4B2A7B"
                  strokeWidth="2.5"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="0" r="14" fill="#FFC93C" stroke="#4B2A7B" strokeWidth="3" />
              <circle cx="-3" cy="-4" r="3" fill="#FFFFFF" opacity="0.8" />
            </g>

            {/* Pink Buttercup Bloom */}
            <g transform="translate(195, 135)">
              <circle cx="0" cy="0" r="15" fill="#FF5FA2" stroke="#4B2A7B" strokeWidth="2.8" />
              <circle cx="0" cy="0" r="7" fill="#FFC93C" stroke="#4B2A7B" strokeWidth="2" />
            </g>
          </g>

          {/* ==================================================== */}
          {/* BOTTOM-RIGHT CORNER: Bellflowers, Ferns & Toadstools */}
          {/* ==================================================== */}
          <g transform="translate(1220, 720)">
            {/* Arching Grass & Fern Leaves */}
            <path d="M210 180 Q180 75 110 50 Q145 100 170 180 Z" fill="#3FC48A" stroke="#4B2A7B" strokeWidth="2.8" />
            <path d="M170 180 Q140 85 70 70 Q110 120 135 180 Z" fill="#7BE0A8" stroke="#4B2A7B" strokeWidth="2.8" />

            {/* Lilac Spotted Toadstool */}
            <path d="M140 160 Q143 130 152 118 Q161 130 164 160 Z" fill="#FFF8EE" stroke="#4B2A7B" strokeWidth="2.8" />
            <path d="M125 125 C125 90, 182 90, 182 125 Z" fill="#B79CFF" stroke="#4B2A7B" strokeWidth="3" />
            <circle cx="145" cy="108" r="4.5" fill="#FFFFFF" />
            <circle cx="165" cy="105" r="4" fill="#FFFFFF" />
            <circle cx="138" cy="118" r="3" fill="#FFFFFF" />

            {/* Big Vibrant Coral Daisy */}
            <g transform="translate(90, 110)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <ellipse
                  key={i}
                  cx="0"
                  cy="-22"
                  rx="7"
                  ry="15"
                  fill="#FF7F66"
                  stroke="#4B2A7B"
                  strokeWidth="2.5"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="0" r="13" fill="#FFC93C" stroke="#4B2A7B" strokeWidth="3" />
              <circle cx="-3" cy="-3" r="2.5" fill="#FFFFFF" opacity="0.8" />
            </g>

            {/* Magenta Bellflower */}
            <g transform="translate(35, 145)">
              <circle cx="0" cy="0" r="14" fill="#FF5FA2" stroke="#4B2A7B" strokeWidth="2.8" />
              <circle cx="0" cy="0" r="6" fill="#FFF0B8" stroke="#4B2A7B" strokeWidth="1.8" />
            </g>
          </g>
        </svg>
      </div>

      {/* ======================================================== */}
      {/* LAYER 4: Animated Ambient Life (Butterflies & Fireflies) */}
      {/* ======================================================== */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-150 ease-out overflow-hidden z-20"
        style={{ transform: `translate3d(${l4Offset.x}px, ${l4Offset.y}px, 0)` }}
      >
        {/* Fireflies with glowing halos */}
        <div className="absolute top-[28%] left-[22%] w-3.5 h-3.5 rounded-full bg-[#FFC93C] shadow-[0_0_16px_#FFC93C] animate-firefly opacity-90" />
        <div className="absolute top-[42%] right-[18%] w-4 h-4 rounded-full bg-[#FFF0B8] shadow-[0_0_16px_#FFF0B8] animate-firefly opacity-95" style={{ animationDelay: '1.8s' }} />
        <div className="absolute top-[65%] left-[45%] w-3 h-3 rounded-full bg-[#FFC93C] shadow-[0_0_12px_#FFC93C] animate-firefly opacity-80" style={{ animationDelay: '3.2s' }} />
        <div className="absolute top-[75%] right-[32%] w-3.5 h-3.5 rounded-full bg-[#FFF0B8] shadow-[0_0_14px_#FFF0B8] animate-firefly opacity-90" style={{ animationDelay: '4.5s' }} />

        {/* Fluttering Vibrant Butterfly 1 */}
        <div className="absolute top-[36%] left-[32%] animate-flutter pointer-events-none opacity-90">
          <svg width="32" height="32" viewBox="0 0 30 30" fill="none">
            <path d="M15 15 C8 4, 1 11, 5 18 C9 23, 14 18, 15 15 Z" fill="#FF5FA2" stroke="#4B2A7B" strokeWidth="1.8" />
            <path d="M15 15 C22 4, 29 11, 25 18 C21 23, 16 18, 15 15 Z" fill="#B79CFF" stroke="#4B2A7B" strokeWidth="1.8" />
            <circle cx="15" cy="15" r="2" fill="#4B2A7B" />
          </svg>
        </div>

        {/* Fluttering Vibrant Butterfly 2 */}
        <div className="absolute top-[54%] right-[22%] animate-flutter pointer-events-none opacity-90" style={{ animationDelay: '2.2s' }}>
          <svg width="28" height="28" viewBox="0 0 30 30" fill="none">
            <path d="M15 15 C8 7, 3 13, 7 18 Z" fill="#FFC93C" stroke="#4B2A7B" strokeWidth="1.5" />
            <path d="M15 15 C22 7, 27 13, 23 18 Z" fill="#20C5B5" stroke="#4B2A7B" strokeWidth="1.5" />
            <circle cx="15" cy="15" r="1.8" fill="#4B2A7B" />
          </svg>
        </div>
      </div>

      {/* Main Interactive Foreground Content */}
      <div className="relative z-20 w-full min-h-screen flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};
