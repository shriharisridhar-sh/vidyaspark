import React, { useMemo } from 'react';

/**
 * B1 Cell & Microscope — "Onion Peel Under the Lens"
 *
 * Interactive SVG canvas showing the journey from building-blocks analogy
 * to discovering cells under a microscope.
 *
 * Step 1: Building blocks analogy — bricks build a wall, cells build an organism
 * Step 2: Slide preparation — onion peel placed on glass slide with water & cover slip
 * Step 3: Microscope observation — microscope with eyepiece, stage, light, viewing slide
 * Step 4: Cells revealed — zoomed-in rectangular onion cells with labels + celebration
 */

const TRANSITION = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
const FADE_TRANSITION = 'opacity 1.5s ease 0.3s';
const DELAYED_FADE = 'opacity 1.5s ease 0.8s';

export default function B1CellMicroscopeCanvas({ currentStep = 1 }) {
  const step = Math.max(1, Math.min(4, currentStep));

  const uid = useMemo(() => Math.random().toString(36).slice(2, 8), []);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 820,
        margin: '0 auto',
        background: '#0a0a0a',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <svg
        viewBox="0 0 800 560"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', display: 'block' }}
      >
        {/* ===== DEFS ===== */}
        <defs>
          {/* Background glow — biology teal tint */}
          <radialGradient id={`bg-${uid}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#0d1a18" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>

          {/* Brick gradient */}
          <linearGradient id={`brick-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C75B39" />
            <stop offset="100%" stopColor="#8B3A22" />
          </linearGradient>

          {/* Wall mortar */}
          <linearGradient id={`mortar-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B0A89A" />
            <stop offset="100%" stopColor="#8A8278" />
          </linearGradient>

          {/* Organism green gradient */}
          <linearGradient id={`organism-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2E7D32" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>

          {/* Glass slide */}
          <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(180,220,240,0.12)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(180,220,240,0.12)" />
          </linearGradient>

          {/* Onion peel gradient */}
          <linearGradient id={`onionPeel-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(200,180,220,0.35)" />
            <stop offset="50%" stopColor="rgba(180,160,200,0.25)" />
            <stop offset="100%" stopColor="rgba(160,140,180,0.4)" />
          </linearGradient>

          {/* Water drop gradient */}
          <radialGradient id={`water-${uid}`} cx="35%" cy="30%">
            <stop offset="0%" stopColor="rgba(100,200,255,0.7)" />
            <stop offset="100%" stopColor="rgba(30,144,255,0.4)" />
          </radialGradient>

          {/* Cover slip */}
          <linearGradient id={`coverSlip-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(220,240,255,0.2)" />
            <stop offset="100%" stopColor="rgba(200,230,255,0.08)" />
          </linearGradient>

          {/* Microscope body */}
          <linearGradient id={`scopeBody-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2C3E50" />
            <stop offset="40%" stopColor="#34495E" />
            <stop offset="100%" stopColor="#1C2833" />
          </linearGradient>
          <linearGradient id={`scopeBase-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1C2833" />
            <stop offset="100%" stopColor="#0E1A24" />
          </linearGradient>

          {/* Eyepiece lens gradient */}
          <radialGradient id={`lens-${uid}`} cx="50%" cy="40%">
            <stop offset="0%" stopColor="rgba(100,220,255,0.4)" />
            <stop offset="60%" stopColor="rgba(60,180,220,0.15)" />
            <stop offset="100%" stopColor="rgba(30,80,120,0.3)" />
          </radialGradient>

          {/* Cell wall gradient */}
          <linearGradient id={`cellWall-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#26A69A" />
            <stop offset="100%" stopColor="#00796B" />
          </linearGradient>

          {/* Cytoplasm */}
          <radialGradient id={`cytoplasm-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(129,199,132,0.35)" />
            <stop offset="100%" stopColor="rgba(76,175,80,0.15)" />
          </radialGradient>

          {/* Nucleus */}
          <radialGradient id={`nucleus-${uid}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor="#5C6BC0" />
            <stop offset="100%" stopColor="#303F9F" />
          </radialGradient>

          {/* Celebration glow */}
          <radialGradient id={`celebGlow-${uid}`}>
            <stop offset="0%" stopColor="#00E676" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00E676" stopOpacity="0" />
          </radialGradient>

          {/* Sparkle */}
          <radialGradient id={`sparkle-${uid}`}>
            <stop offset="0%" stopColor="#69F0AE" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#69F0AE" stopOpacity="0" />
          </radialGradient>

          {/* Light beam gradient */}
          <linearGradient id={`lightBeam-${uid}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(255,235,59,0.5)" />
            <stop offset="100%" stopColor="rgba(255,235,59,0)" />
          </linearGradient>

          {/* Circular view gradient */}
          <radialGradient id={`viewCircle-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(200,255,200,0.05)" />
            <stop offset="85%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
          </radialGradient>

          {/* Soft shadow */}
          <filter id={`shadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
          </filter>
          <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`bigGlow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Microscope circular clip */}
          <clipPath id={`scopeClip-${uid}`}>
            <circle cx="400" cy="280" r="150" />
          </clipPath>
        </defs>

        {/* ===== BACKGROUND ===== */}
        <rect width="800" height="560" fill={`url(#bg-${uid})`} />

        {/* Subtle biology hex grid */}
        <g opacity="0.025">
          {Array.from({ length: 12 }, (_, row) =>
            Array.from({ length: 16 }, (_, col) => {
              const x = col * 55 + (row % 2 ? 28 : 0);
              const y = row * 48;
              return (
                <polygon
                  key={`hex-${row}-${col}`}
                  points={`${x},${y - 16} ${x + 14},${y - 8} ${x + 14},${y + 8} ${x},${y + 16} ${x - 14},${y + 8} ${x - 14},${y - 8}`}
                  fill="none"
                  stroke="#4DB6AC"
                  strokeWidth="0.5"
                />
              );
            })
          )}
        </g>

        {/* ===== STEP TITLE ===== */}
        <text
          x="400"
          y="32"
          textAnchor="middle"
          fill="#00897B"
          fontSize="14"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="600"
          letterSpacing="2"
          style={{ transition: FADE_TRANSITION }}
        >
          {step === 1 && 'STEP 1 \u2014 BUILDING BLOCKS OF LIFE'}
          {step === 2 && 'STEP 2 \u2014 PREPARE THE SLIDE'}
          {step === 3 && 'STEP 3 \u2014 OBSERVE UNDER MICROSCOPE'}
          {step === 4 && 'STEP 4 \u2014 CELLS REVEALED!'}
        </text>

        {/* ================= STEP 1: BUILDING BLOCKS ANALOGY ================= */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 1 ? 1 : 0,
            transform: step === 1 ? 'translateY(0)' : 'translateY(-30px)',
          }}
        >
          {/* Left side: Bricks -> Wall */}
          <g transform="translate(80, 80)">
            {/* Label */}
            <text x="120" y="0" textAnchor="middle" fill="#FFAB91" fontSize="13"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Bricks build a Wall
            </text>

            {/* Brick wall */}
            <rect x="10" y="15" width="220" height="170" rx="4" fill={`url(#mortar-${uid})`} opacity="0.3" />
            {/* Rows of bricks */}
            {[0, 1, 2, 3, 4].map((row) =>
              [0, 1, 2, 3].map((col) => {
                const xOff = row % 2 === 1 ? 27 : 0;
                const bx = 15 + col * 54 + xOff;
                const by = 22 + row * 33;
                return (
                  <g key={`brick-${row}-${col}`}>
                    <rect x={bx} y={by} width={50} height={28} rx="2"
                      fill={`url(#brick-${uid})`} stroke="#6D2A15" strokeWidth="0.5"
                      opacity={0.85}>
                      <animate
                        attributeName="opacity"
                        values="0.7;0.9;0.7"
                        dur={`${2.5 + (row * 4 + col) * 0.15}s`}
                        repeatCount="indefinite"
                      />
                    </rect>
                    {/* Brick texture lines */}
                    <line x1={bx + 5} y1={by + 10} x2={bx + 45} y2={by + 10}
                      stroke="#6D2A15" strokeWidth="0.3" opacity="0.4" />
                  </g>
                );
              })
            )}

            {/* Arrow */}
            <line x1="110" y1="200" x2="110" y2="220" stroke="#FFAB91" strokeWidth="2" strokeDasharray="4 3" opacity="0.6" />
            <polygon points="103,218 110,228 117,218" fill="#FFAB91" opacity="0.6" />

            <text x="110" y="248" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Small units &rarr; Big structure
            </text>
          </g>

          {/* Center: Equals / analogy arrow */}
          <g transform="translate(340, 160)">
            <text x="0" y="0" textAnchor="middle" fill="#4DB6AC" fontSize="36"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="300" opacity="0.6">
              =
            </text>
            <text x="0" y="28" textAnchor="middle" fill="#4DB6AC" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.7">
              Similarly...
            </text>
          </g>

          {/* Right side: Cells -> Organism (leaf/tree) */}
          <g transform="translate(440, 80)">
            <text x="140" y="0" textAnchor="middle" fill="#69F0AE" fontSize="13"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Cells build Living Things
            </text>

            {/* Simple tree/plant shape */}
            {/* Trunk */}
            <rect x="125" y="120" width="20" height="65" rx="3" fill="#5D4037" />

            {/* Leaves - canopy */}
            <ellipse cx="135" cy="90" rx="65" ry="55" fill={`url(#organism-${uid})`} opacity="0.8">
              <animate attributeName="ry" values="55;58;55" dur="4s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="135" cy="85" rx="50" ry="40" fill="rgba(76,175,80,0.4)" />

            {/* Tiny cell shapes inside the canopy */}
            {[
              { cx: 110, cy: 70, w: 18, h: 14 },
              { cx: 135, cy: 65, w: 16, h: 12 },
              { cx: 155, cy: 72, w: 17, h: 13 },
              { cx: 120, cy: 90, w: 15, h: 12 },
              { cx: 145, cy: 88, w: 18, h: 14 },
              { cx: 130, cy: 108, w: 16, h: 12 },
            ].map((c, i) => (
              <g key={`tc-${i}`}>
                <rect x={c.cx - c.w / 2} y={c.cy - c.h / 2} width={c.w} height={c.h} rx="2"
                  fill="none" stroke="rgba(105,240,174,0.5)" strokeWidth="0.8">
                  <animate attributeName="opacity" values="0.3;0.7;0.3"
                    dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                </rect>
                <circle cx={c.cx} cy={c.cy} r="2" fill="rgba(105,240,174,0.4)">
                  <animate attributeName="opacity" values="0.3;0.6;0.3"
                    dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                </circle>
              </g>
            ))}

            {/* Question mark */}
            <text x="135" y="215" textAnchor="middle" fill="#FFD54F" fontSize="18"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">
              What are living things made of?
            </text>
          </g>

          {/* Bottom question box */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 1 ? 1 : 0 }}>
            <rect x="150" y="380" width="500" height="60" rx="12" fill="rgba(0,137,123,0.1)"
              stroke="rgba(0,137,123,0.3)" strokeWidth="1.5" />
            <text x="400" y="408" textAnchor="middle" fill="#4DB6AC" fontSize="14"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Buildings are made of bricks. Sweaters are made of threads.
            </text>
            <text x="400" y="428" textAnchor="middle" fill="#80CBC4" fontSize="13"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              What are the tiny building blocks of all living things?
            </text>
          </g>
        </g>

        {/* ================= STEP 2: SLIDE PREPARATION ================= */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 2 ? 1 : 0,
            transform: step === 2 ? 'translateY(0)' : step < 2 ? 'translateY(40px)' : 'translateY(-30px)',
          }}
        >
          {/* Table surface */}
          <rect x="60" y="400" width="680" height="20" rx="4" fill="rgba(50,50,50,0.6)"
            stroke="rgba(100,100,100,0.3)" strokeWidth="1" />

          {/* Onion on left */}
          <g transform="translate(100, 240)">
            <text x="50" y="-10" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Onion
            </text>
            {/* Onion body */}
            <ellipse cx="50" cy="50" rx="42" ry="50" fill="#C49A6C" opacity="0.8" />
            <ellipse cx="50" cy="50" rx="35" ry="43" fill="#D4A76A" opacity="0.6" />
            {/* Onion layers */}
            <path d="M50 5 Q55 25 50 50 Q45 75 50 95" fill="none" stroke="#B8860B" strokeWidth="0.7" opacity="0.5" />
            <path d="M30 15 Q40 35 35 55 Q30 75 35 90" fill="none" stroke="#B8860B" strokeWidth="0.5" opacity="0.4" />
            <path d="M70 15 Q60 35 65 55 Q70 75 65 90" fill="none" stroke="#B8860B" strokeWidth="0.5" opacity="0.4" />
            {/* Top sprout */}
            <path d="M48 5 Q45 -10 42 -20 M52 5 Q55 -10 58 -20" fill="none" stroke="#66BB6A" strokeWidth="1.5" strokeLinecap="round" />
            {/* Peel being pulled */}
            <path d="M85 30 Q100 25 115 35 Q120 40 115 50"
              fill="rgba(200,180,220,0.3)" stroke="rgba(180,160,200,0.6)" strokeWidth="1" />
            <text x="125" y="35" fill="rgba(200,180,220,0.7)" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              thin peel
            </text>
          </g>

          {/* Forceps */}
          <g transform="translate(200, 200)">
            <path d="M0 60 L15 0 L18 0 L8 55 Z" fill="#78909C" stroke="#546E7A" strokeWidth="0.5" />
            <path d="M20 60 L18 0 L21 0 L28 55 Z" fill="#90A4AE" stroke="#546E7A" strokeWidth="0.5" />
            <circle cx="14" cy="58" r="3" fill="#546E7A" />
          </g>

          {/* Arrow from peel to slide */}
          <g>
            <path d="M240 280 C280 270 310 260 340 280" fill="none" stroke="#4DB6AC" strokeWidth="1.5"
              strokeDasharray="5 4" opacity="0.5" />
            <polygon points="337,275 345,280 337,285" fill="#4DB6AC" opacity="0.5" />
          </g>

          {/* Glass slide in center */}
          <g transform="translate(320, 260)">
            <text x="100" y="-15" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Glass Slide
            </text>

            {/* Slide base */}
            <rect x="10" y="0" width="180" height="65" rx="3"
              fill={`url(#glass-${uid})`} stroke="rgba(180,220,240,0.25)" strokeWidth="1.5"
              filter={`url(#shadow-${uid})`} />
            {/* Glass highlight */}
            <rect x="20" y="5" width="4" height="55" rx="2" fill="rgba(255,255,255,0.08)" />

            {/* Onion peel specimen on slide */}
            <ellipse cx="100" cy="32" rx="45" ry="22"
              fill={`url(#onionPeel-${uid})`} stroke="rgba(180,160,200,0.3)" strokeWidth="0.8" />

            {/* Water drop */}
            <g>
              <ellipse cx="100" cy="30" rx="20" ry="12" fill={`url(#water-${uid})`} opacity="0.6">
                <animate attributeName="rx" values="18;22;18" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.7;0.5" dur="3s" repeatCount="indefinite" />
              </ellipse>
              <text x="100" y="56" textAnchor="middle" fill="rgba(100,200,255,0.6)" fontSize="9"
                fontFamily="'Inter', system-ui, sans-serif">
                water drop
              </text>
            </g>

            {/* Cover slip descending */}
            <rect x="55" y="-25" width="90" height="55" rx="2"
              fill={`url(#coverSlip-${uid})`} stroke="rgba(200,230,255,0.3)" strokeWidth="1"
              opacity="0.7">
              <animate attributeName="y" values="-25;0;0" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.7;0.7" dur="3s" repeatCount="indefinite" />
            </rect>
            <text x="100" y="-32" textAnchor="middle" fill="rgba(200,230,255,0.5)" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif">
              cover slip
            </text>
          </g>

          {/* Dropper on right */}
          <g transform="translate(580, 200)">
            <text x="30" y="-5" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif">
              Dropper
            </text>
            {/* Bulb */}
            <ellipse cx="30" cy="20" rx="14" ry="18" fill="#EF5350" opacity="0.7" />
            {/* Tube */}
            <rect x="26" y="36" width="8" height="50" rx="2" fill="rgba(200,220,240,0.15)"
              stroke="rgba(200,220,240,0.3)" strokeWidth="1" />
            {/* Drip */}
            <ellipse cx="30" cy="95" rx="4" ry="5" fill={`url(#water-${uid})`} opacity="0.7">
              <animate attributeName="cy" values="90;100;90" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" />
            </ellipse>
          </g>

          {/* Instruction note */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 2 ? 1 : 0 }}>
            <rect x="200" y="380" width="400" height="50" rx="10" fill="rgba(0,137,123,0.08)"
              stroke="rgba(0,137,123,0.25)" strokeWidth="1" />
            <text x="400" y="402" textAnchor="middle" fill="#4DB6AC" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Peel a thin layer of onion skin with forceps
            </text>
            <text x="400" y="420" textAnchor="middle" fill="#80CBC4" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Place on slide with water, then lower the cover slip gently
            </text>
          </g>
        </g>

        {/* ================= STEP 3: MICROSCOPE OBSERVATION ================= */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 3 ? 1 : 0,
            transform: step === 3 ? 'translateY(0)' : step < 3 ? 'translateY(40px)' : 'translateY(-30px)',
          }}
        >
          {/* Microscope */}
          <g transform="translate(300, 50)">
            {/* Eyepiece */}
            <rect x="85" y="10" width="30" height="20" rx="4"
              fill={`url(#scopeBody-${uid})`} stroke="#546E7A" strokeWidth="1" />
            <ellipse cx="100" cy="10" rx="16" ry="6" fill={`url(#lens-${uid})`}
              stroke="#546E7A" strokeWidth="1" />

            {/* Eye looking in */}
            <ellipse cx="100" cy="0" rx="8" ry="5" fill="rgba(255,224,178,0.6)" />
            <circle cx="100" cy="0" r="3" fill="#3E2723" />
            <circle cx="99" cy="-1" r="1" fill="white" opacity="0.6" />

            {/* Tube / arm */}
            <rect x="92" y="28" width="16" height="80" rx="3"
              fill={`url(#scopeBody-${uid})`} stroke="#455A64" strokeWidth="0.8" />

            {/* Arm curve */}
            <path d="M92 105 Q92 130 60 140" fill="none" stroke="#34495E" strokeWidth="16"
              strokeLinecap="round" />
            <path d="M108 105 Q108 130 76 140" fill="none" stroke="#455A64" strokeWidth="14"
              strokeLinecap="round" opacity="0.5" />

            {/* Objective lens */}
            <rect x="52" y="140" width="16" height="28" rx="3" fill="#37474F" stroke="#263238" strokeWidth="0.5" />
            <rect x="54" y="165" width="12" height="8" rx="2" fill="#455A64" />

            {/* Stage - the platform */}
            <rect x="10" y="178" width="120" height="10" rx="3"
              fill={`url(#scopeBody-${uid})`} stroke="#455A64" strokeWidth="1" />

            {/* Slide on stage */}
            <rect x="30" y="172" width="80" height="6" rx="1"
              fill={`url(#glass-${uid})`} stroke="rgba(180,220,240,0.3)" strokeWidth="0.8" />
            {/* Specimen glow on slide */}
            <ellipse cx="70" cy="175" rx="15" ry="3" fill="rgba(200,180,220,0.3)" />

            {/* Stage clips */}
            <rect x="25" y="176" width="8" height="6" rx="1" fill="#546E7A" />
            <rect x="107" y="176" width="8" height="6" rx="1" fill="#546E7A" />

            {/* Light source below */}
            <rect x="52" y="194" width="16" height="12" rx="2" fill="#FFD54F" opacity="0.6" />
            <ellipse cx="60" cy="194" rx="10" ry="4" fill="rgba(255,235,59,0.4)" />

            {/* Light beam going up */}
            <polygon points="50,194 70,194 65,178 55,178"
              fill={`url(#lightBeam-${uid})`} opacity="0.4">
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite" />
            </polygon>

            {/* Arm/pillar */}
            <rect x="55" y="200" width="12" height="100" rx="2" fill="#1C2833" />

            {/* Base */}
            <ellipse cx="65" cy="305" rx="65" ry="18"
              fill={`url(#scopeBase-${uid})`} stroke="#263238" strokeWidth="1" />

            {/* Focus knobs */}
            <ellipse cx="10" cy="200" rx="10" ry="14" fill="#37474F" stroke="#263238" strokeWidth="0.8" />
            <ellipse cx="10" cy="200" rx="7" ry="10" fill="#455A64" />
            <ellipse cx="120" cy="200" rx="10" ry="14" fill="#37474F" stroke="#263238" strokeWidth="0.8" />
            <ellipse cx="120" cy="200" rx="7" ry="10" fill="#455A64" />
          </g>

          {/* Label annotations */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 3 ? 1 : 0 }}>
            {/* Eyepiece label */}
            <line x1="395" y1="58" x2="480" y2="55" stroke="#80CBC4" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            <text x="485" y="58" fill="#80CBC4" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Eyepiece
            </text>

            {/* Objective label */}
            <line x1="370" y1="200" x2="480" y2="195" stroke="#80CBC4" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            <text x="485" y="198" fill="#80CBC4" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Objective Lens
            </text>

            {/* Stage label */}
            <line x1="435" y1="230" x2="480" y2="235" stroke="#80CBC4" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            <text x="485" y="238" fill="#80CBC4" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Stage + Slide
            </text>

            {/* Light label */}
            <line x1="370" y1="248" x2="480" y2="268" stroke="#80CBC4" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            <text x="485" y="271" fill="#80CBC4" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Light Source
            </text>

            {/* Focus knob label */}
            <line x1="310" y1="250" x2="230" y2="260" stroke="#80CBC4" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            <text x="155" y="263" fill="#80CBC4" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Focus Knob
            </text>
          </g>

          {/* Bottom instruction */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 3 ? 1 : 0 }}>
            <rect x="180" y="400" width="440" height="60" rx="12" fill="rgba(0,137,123,0.08)"
              stroke="rgba(0,137,123,0.25)" strokeWidth="1" />
            <text x="400" y="425" textAnchor="middle" fill="#4DB6AC" fontSize="13"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Place the slide on the stage and look through the eyepiece
            </text>
            <text x="400" y="445" textAnchor="middle" fill="#80CBC4" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Adjust the focus knob until the image becomes clear
            </text>
          </g>
        </g>

        {/* ================= STEP 4: CELLS REVEALED ================= */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 4 ? 1 : 0,
            transform: step === 4 ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          {/* Circular microscope view — dark border ring */}
          <circle cx="400" cy="260" r="168" fill="none" stroke="#1C2833" strokeWidth="20" />
          <circle cx="400" cy="260" r="158" fill="rgba(10,20,15,0.9)"
            stroke="rgba(0,137,123,0.2)" strokeWidth="2" />

          {/* Circular view vignette */}
          <circle cx="400" cy="260" r="155" fill={`url(#viewCircle-${uid})`} />

          {/* Onion cells — rectangular brick-like pattern */}
          <g clipPath={`url(#scopeClip-${uid})`}>
            {/* Background glow */}
            <circle cx="400" cy="260" r="155" fill="rgba(20,60,50,0.5)" />

            {/* Grid of rectangular onion cells */}
            {[0, 1, 2, 3, 4, 5].map((row) =>
              [0, 1, 2, 3, 4].map((col) => {
                const cellW = 62;
                const cellH = 38;
                const xOff = row % 2 === 1 ? 31 : 0;
                const cx = 260 + col * cellW + xOff;
                const cy = 170 + row * cellH;
                const nucleusX = cx + 15 + (col % 3) * 8;
                const nucleusY = cy + 12 + (row % 2) * 8;
                return (
                  <g key={`cell-${row}-${col}`}>
                    {/* Cell wall */}
                    <rect x={cx} y={cy} width={cellW} height={cellH} rx="3"
                      fill={`url(#cytoplasm-${uid})`}
                      stroke={`url(#cellWall-${uid})`}
                      strokeWidth="2.5">
                      <animate
                        attributeName="opacity"
                        values="0.8;1;0.8"
                        dur={`${3 + (row + col) * 0.2}s`}
                        repeatCount="indefinite"
                      />
                    </rect>
                    {/* Nucleus */}
                    <ellipse cx={nucleusX} cy={nucleusY} rx="8" ry="6"
                      fill={`url(#nucleus-${uid})`} opacity="0.8">
                      <animate
                        attributeName="opacity"
                        values="0.7;0.9;0.7"
                        dur={`${2.5 + row * 0.3}s`}
                        repeatCount="indefinite"
                      />
                    </ellipse>
                    {/* Nucleolus dot */}
                    <circle cx={nucleusX - 1} cy={nucleusY - 1} r="2" fill="#7986CB" opacity="0.6" />
                  </g>
                );
              })
            )}
          </g>

          {/* Cross-hairs in microscope view */}
          <line x1="400" y1="110" x2="400" y2="130" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="400" y1="390" x2="400" y2="410" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="250" y1="260" x2="270" y2="260" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="530" y1="260" x2="550" y2="260" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

          {/* Labels with leader lines */}
          {/* Cell Wall label */}
          <g style={{ transition: 'opacity 1.5s ease 0.6s', opacity: step === 4 ? 1 : 0 }}>
            <line x1="310" y1="220" x2="180" y2="180" stroke="#26A69A" strokeWidth="1.2" strokeDasharray="4 3" />
            <rect x="90" y="166" width="90" height="24" rx="6" fill="rgba(0,77,64,0.6)" stroke="#26A69A" strokeWidth="1" />
            <text x="135" y="183" textAnchor="middle" fill="#80CBC4" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Cell Wall
            </text>
          </g>

          {/* Nucleus label */}
          <g style={{ transition: 'opacity 1.5s ease 0.9s', opacity: step === 4 ? 1 : 0 }}>
            <line x1="370" y1="285" x2="180" y2="310" stroke="#5C6BC0" strokeWidth="1.2" strokeDasharray="4 3" />
            <rect x="95" y="296" width="85" height="24" rx="6" fill="rgba(40,30,90,0.6)" stroke="#5C6BC0" strokeWidth="1" />
            <text x="137" y="313" textAnchor="middle" fill="#9FA8DA" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Nucleus
            </text>
          </g>

          {/* Cytoplasm label */}
          <g style={{ transition: 'opacity 1.5s ease 1.2s', opacity: step === 4 ? 1 : 0 }}>
            <line x1="440" y1="250" x2="610" y2="200" stroke="#66BB6A" strokeWidth="1.2" strokeDasharray="4 3" />
            <rect x="585" y="186" width="105" height="24" rx="6" fill="rgba(20,60,20,0.6)" stroke="#66BB6A" strokeWidth="1" />
            <text x="637" y="203" textAnchor="middle" fill="#A5D6A7" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Cytoplasm
            </text>
          </g>

          {/* CELLS! celebration text */}
          <g style={{ transition: 'opacity 1.5s ease 1.5s', opacity: step === 4 ? 1 : 0 }}>
            <text x="400" y="460" textAnchor="middle" fill="#00E676" fontSize="32"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="800" letterSpacing="6"
              filter={`url(#bigGlow-${uid})`}>
              CELLS!
            </text>
            <text x="400" y="482" textAnchor="middle" fill="#69F0AE" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" letterSpacing="1">
              The building blocks of all living things
            </text>
          </g>

          {/* Sparkle effects around the microscope view */}
          {[
            { x: 250, y: 130 },
            { x: 555, y: 150 },
            { x: 235, y: 370 },
            { x: 570, y: 350 },
            { x: 300, y: 420 },
            { x: 510, y: 430 },
            { x: 190, y: 250 },
            { x: 620, y: 270 },
          ].map((sp, i) => (
            <g key={`sp4-${i}`} style={{ transition: `opacity 1.5s ease ${1.2 + i * 0.12}s`, opacity: step === 4 ? 1 : 0 }}>
              <circle cx={sp.x} cy={sp.y} r="5" fill={`url(#sparkle-${uid})`}>
                <animate attributeName="r" values="3;7;3" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
              </circle>
              <line x1={sp.x - 5} y1={sp.y} x2={sp.x + 5} y2={sp.y} stroke="#69F0AE" strokeWidth="1" opacity="0.5">
                <animate attributeName="opacity" values="0.5;0.15;0.5" dur={`${1.3 + i * 0.25}s`} repeatCount="indefinite" />
              </line>
              <line x1={sp.x} y1={sp.y - 5} x2={sp.x} y2={sp.y + 5} stroke="#69F0AE" strokeWidth="1" opacity="0.5">
                <animate attributeName="opacity" values="0.5;0.15;0.5" dur={`${1.3 + i * 0.25}s`} repeatCount="indefinite" />
              </line>
            </g>
          ))}

          {/* Conclusion box */}
          <g style={{ transition: 'opacity 1.5s ease 1.8s', opacity: step === 4 ? 1 : 0 }}>
            <rect x="580" y="300" width="180" height="80" rx="10" fill="rgba(0,77,64,0.15)"
              stroke="rgba(0,137,123,0.4)" strokeWidth="1" />
            <text x="670" y="325" textAnchor="middle" fill="#4DB6AC" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="1">
              ROBERT HOOKE
            </text>
            <text x="670" y="342" textAnchor="middle" fill="#80CBC4" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              First saw cells in 1665
            </text>
            <text x="670" y="356" textAnchor="middle" fill="#80CBC4" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Named them &quot;cells&quot; because
            </text>
            <text x="670" y="370" textAnchor="middle" fill="#80CBC4" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              they looked like small rooms
            </text>
          </g>
        </g>

        {/* ===== STEP INDICATOR DOTS ===== */}
        <g transform="translate(340, 530)">
          {[1, 2, 3, 4].map((s) => (
            <g key={`dot-${s}`}>
              <circle
                cx={(s - 1) * 40}
                cy="0"
                r={step === s ? 7 : 5}
                fill={step === s ? '#00897B' : 'rgba(255,255,255,0.15)'}
                stroke={step >= s ? '#00897B' : 'rgba(255,255,255,0.1)'}
                strokeWidth={step === s ? 2 : 1}
                style={{ transition: 'all 0.5s ease' }}
              />
              {step === s && (
                <circle cx={(s - 1) * 40} cy="0" r="10" fill="none" stroke="#00897B" strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" values="8;13;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <text
                x={(s - 1) * 40}
                y="18"
                textAnchor="middle"
                fill={step === s ? '#00897B' : 'rgba(255,255,255,0.3)'}
                fontSize="8"
                fontFamily="'Inter', system-ui, sans-serif"
                fontWeight={step === s ? '600' : '400'}
                style={{ transition: 'all 0.5s ease' }}
              >
                {s}
              </text>
            </g>
          ))}
          {/* Connecting line */}
          <line x1="0" y1="0" x2="120" y2="0" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </g>

        {/* ===== MODULE ID TAG ===== */}
        <text x="20" y="548" fill="rgba(255,255,255,0.12)" fontSize="9"
          fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" letterSpacing="1">
          B1 CELL &amp; MICROSCOPE
        </text>
      </svg>
    </div>
  );
}
