import React, { useMemo } from 'react';

/**
 * B5 Transport in Plants — "Diffusion, Osmosis & Root Absorption"
 *
 * Interactive SVG canvas showing how plants transport water and nutrients.
 * Receives `currentStep` prop (1-4) and renders each stage with smooth transitions.
 *
 * Step 1: Bees-in-a-box analogy + diffusion demo setup (KMnO4 in water)
 * Step 2: Four diffusion experiments (KMnO4, food colouring, spray, incense)
 * Step 3: Osmosis — potato osmometer & raisins
 * Step 4: Root absorption + active transport (toy car on slope)
 */

const TRANSITION = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
const FADE_TRANSITION = 'opacity 1.5s ease 0.3s';

export default function B5TransportPlantsCanvas({ currentStep = 1 }) {
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
        {/* ===== DEFS: Gradients, Filters ===== */}
        <defs>
          {/* Background */}
          <radialGradient id={`bg-${uid}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#0a1a18" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>

          {/* Purple KMnO4 gradient */}
          <radialGradient id={`kmno4-${uid}`} cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#CE93D8" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#7B1FA2" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#4A148C" stopOpacity="0.2" />
          </radialGradient>

          {/* Water blue */}
          <linearGradient id={`water-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(100,181,246,0.15)" />
            <stop offset="100%" stopColor="rgba(66,165,245,0.25)" />
          </linearGradient>

          {/* Beaker glass */}
          <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(180,210,240,0.2)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(180,210,240,0.2)" />
          </linearGradient>

          {/* Teal biology accent */}
          <linearGradient id={`teal-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#26A69A" />
            <stop offset="100%" stopColor="#00796B" />
          </linearGradient>

          {/* Potato brown */}
          <linearGradient id={`potato-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D7A86E" />
            <stop offset="100%" stopColor="#A1662F" />
          </linearGradient>

          {/* Root cross-section */}
          <radialGradient id={`rootXS-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A5D6A7" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#66BB6A" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2E7D32" stopOpacity="0.4" />
          </radialGradient>

          {/* Xylem blue */}
          <radialGradient id={`xylem-${uid}`}>
            <stop offset="0%" stopColor="#64B5F6" />
            <stop offset="100%" stopColor="#1565C0" />
          </radialGradient>

          {/* Phloem orange */}
          <radialGradient id={`phloem-${uid}`}>
            <stop offset="0%" stopColor="#FFB74D" />
            <stop offset="100%" stopColor="#E65100" />
          </radialGradient>

          {/* Sugar solution */}
          <linearGradient id={`sugar-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,224,178,0.4)" />
            <stop offset="100%" stopColor="rgba(255,183,77,0.6)" />
          </linearGradient>

          {/* Oil layer */}
          <linearGradient id={`oil-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,235,59,0.5)" />
            <stop offset="100%" stopColor="rgba(255,193,7,0.4)" />
          </linearGradient>

          {/* Food colour */}
          <radialGradient id={`foodColour-${uid}`} cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#EF5350" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#C62828" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#B71C1C" stopOpacity="0.15" />
          </radialGradient>

          {/* Smoke/mist */}
          <radialGradient id={`smoke-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* Filters */}
          <filter id={`shadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
          </filter>
          <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`softGlow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`purpleGlow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ===== BACKGROUND ===== */}
        <rect width="800" height="560" fill={`url(#bg-${uid})`} />

        {/* Subtle grid */}
        <g opacity="0.03">
          {Array.from({ length: 20 }, (_, i) => (
            <line key={`vg${i}`} x1={i * 40} y1="0" x2={i * 40} y2="560" stroke="#fff" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 14 }, (_, i) => (
            <line key={`hg${i}`} x1="0" y1={i * 40} x2="800" y2={i * 40} stroke="#fff" strokeWidth="0.5" />
          ))}
        </g>

        {/* ===== STEP TITLE ===== */}
        <text
          x="400"
          y="32"
          textAnchor="middle"
          fill="#E65100"
          fontSize="14"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="600"
          letterSpacing="2"
          style={{ transition: FADE_TRANSITION }}
        >
          {step === 1 && 'STEP 1 \u2014 DIFFUSION: BEES IN A BOX'}
          {step === 2 && 'STEP 2 \u2014 FOUR DIFFUSION EXPERIMENTS'}
          {step === 3 && 'STEP 3 \u2014 OSMOSIS: POTATO & RAISINS'}
          {step === 4 && 'STEP 4 \u2014 ROOT ABSORPTION & ACTIVE TRANSPORT'}
        </text>

        {/* ============================================================ */}
        {/* STEP 1: BEES IN A BOX + KMnO4 DIFFUSION SETUP               */}
        {/* ============================================================ */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 1 ? 1 : 0,
            transform: step === 1 ? 'translateY(0)' : 'translateY(-30px)',
            pointerEvents: step === 1 ? 'auto' : 'none',
          }}
        >
          {/* === LEFT SIDE: Bees in a Box === */}
          <g transform="translate(40, 55)">
            <text x="160" y="20" textAnchor="middle" fill="#26A69A" fontSize="12" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              BEES IN A BOX
            </text>

            {/* Box with screen — before */}
            <rect x="20" y="40" width="280" height="140" rx="8" fill="rgba(38,166,154,0.06)" stroke="#26A69A" strokeWidth="1.5" opacity="0.8" />
            {/* Screen divider */}
            <line x1="160" y1="40" x2="160" y2="180" stroke="#4DB6AC" strokeWidth="2" strokeDasharray="4,3" opacity="0.7" />
            <text x="160" y="195" textAnchor="middle" fill="#4DB6AC" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Screen
            </text>

            {/* Bees crowded on left side */}
            {[
              { x: 50, y: 70 }, { x: 70, y: 90 }, { x: 90, y: 75 },
              { x: 60, y: 110 }, { x: 85, y: 130 }, { x: 110, y: 100 },
              { x: 75, y: 150 }, { x: 100, y: 145 }, { x: 130, y: 85 },
              { x: 45, y: 140 }, { x: 115, y: 120 }, { x: 55, y: 85 },
            ].map((bee, i) => (
              <g key={`bee-${i}`}>
                <ellipse cx={bee.x} cy={bee.y} rx="6" ry="4" fill="#FFD54F" opacity="0.85">
                  <animate attributeName="cx" values={`${bee.x - 2};${bee.x + 2};${bee.x - 2}`} dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
                </ellipse>
                <ellipse cx={bee.x - 5} cy={bee.y - 2} rx="3" ry="2" fill="#FFF176" opacity="0.5" />
                <line x1={bee.x + 3} y1={bee.y - 3} x2={bee.x + 7} y2={bee.y - 6} stroke="#FFD54F" strokeWidth="0.5" opacity="0.6" />
                <line x1={bee.x + 5} y1={bee.y - 3} x2={bee.x + 9} y2={bee.y - 5} stroke="#FFD54F" strokeWidth="0.5" opacity="0.6" />
              </g>
            ))}

            {/* Label */}
            <text x="85" y="210" textAnchor="middle" fill="#A5D6A7" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              HIGH concentration
            </text>
            <text x="230" y="210" textAnchor="middle" fill="#80CBC4" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              LOW concentration
            </text>

            {/* Arrow showing spreading */}
            <g transform="translate(85, 230)">
              <line x1="0" y1="0" x2="130" y2="0" stroke="#26A69A" strokeWidth="1.5" markerEnd={`url(#arrowTeal-${uid})`}>
                <animate attributeName="strokeDashoffset" values="20;0" dur="2s" repeatCount="indefinite" />
              </line>
              <text x="65" y="16" textAnchor="middle" fill="#4DB6AC" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                Molecules spread out evenly
              </text>
            </g>
          </g>

          {/* === RIGHT SIDE: KMnO4 Beaker Demo === */}
          <g transform="translate(430, 55)">
            <text x="160" y="20" textAnchor="middle" fill="#CE93D8" fontSize="12" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              KMnO&#x2084; DIFFUSION
            </text>

            {/* Beaker */}
            <rect x="60" y="50" width="200" height="160" rx="4" fill={`url(#glass-${uid})`} stroke="rgba(180,210,240,0.3)" strokeWidth="1.5" />
            {/* Beaker rim */}
            <rect x="55" y="48" width="210" height="8" rx="3" fill="rgba(180,210,240,0.1)" stroke="rgba(180,210,240,0.25)" strokeWidth="1" />

            {/* Water */}
            <rect x="62" y="75" width="196" height="133" rx="2" fill={`url(#water-${uid})`} />

            {/* KMnO4 crystal dropping */}
            <rect x="155" y="58" width="10" height="6" rx="2" fill="#7B1FA2" opacity="0.9">
              <animate attributeName="y" values="58;80;80" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.9;0" dur="3s" repeatCount="indefinite" />
            </rect>

            {/* Purple diffusion cloud spreading */}
            <ellipse cx="160" cy="145" rx="30" ry="25" fill={`url(#kmno4-${uid})`} filter={`url(#purpleGlow-${uid})`}>
              <animate attributeName="rx" values="15;70;90" dur="6s" repeatCount="indefinite" />
              <animate attributeName="ry" values="12;50;65" dur="6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.5;0.25" dur="6s" repeatCount="indefinite" />
            </ellipse>

            {/* Animated particles spreading outward */}
            {[
              { x: 160, y: 140, dx: -50, dy: -30, d: 4 },
              { x: 160, y: 140, dx: 55, dy: -25, d: 5 },
              { x: 160, y: 140, dx: -40, dy: 35, d: 3.5 },
              { x: 160, y: 140, dx: 45, dy: 40, d: 4.5 },
              { x: 160, y: 140, dx: -65, dy: 5, d: 3 },
              { x: 160, y: 140, dx: 60, dy: -5, d: 3.5 },
              { x: 160, y: 140, dx: -20, dy: -45, d: 2.5 },
              { x: 160, y: 140, dx: 25, dy: 50, d: 3 },
            ].map((p, i) => (
              <circle key={`part-${i}`} cx={p.x} cy={p.y} r={p.d} fill="#CE93D8" opacity="0.6">
                <animate attributeName="cx" values={`${p.x};${p.x + p.dx}`} dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
                <animate attributeName="cy" values={`${p.y};${p.y + p.dy}`} dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.15" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
              </circle>
            ))}

            {/* Labels */}
            <text x="160" y="235" textAnchor="middle" fill="#CE93D8" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Potassium Permanganate in Water
            </text>
            <text x="160" y="250" textAnchor="middle" fill="#B39DDB" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Solid diffusing in liquid
            </text>
          </g>

          {/* Info box */}
          <g>
            <rect x="150" y="380" width="500" height="65" rx="12" fill="rgba(38,166,154,0.1)" stroke="#26A69A" strokeWidth="1" />
            <text x="400" y="405" textAnchor="middle" fill="#4DB6AC" fontSize="14" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              Diffusion: High to Low Concentration
            </text>
            <text x="400" y="425" textAnchor="middle" fill="#80CBC4" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Molecules move from crowded regions to empty regions
            </text>
            <text x="400" y="440" textAnchor="middle" fill="#80CBC4" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              until they are evenly distributed — no energy needed.
            </text>
          </g>
        </g>

        {/* ============================================================ */}
        {/* STEP 2: FOUR DIFFUSION EXPERIMENTS                            */}
        {/* ============================================================ */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 2 ? 1 : 0,
            transform: step === 2 ? 'translateY(0)' : 'translateY(30px)',
            pointerEvents: step === 2 ? 'auto' : 'none',
          }}
        >
          {/* Experiment 1: KMnO4 in water (top-left) */}
          <g transform="translate(40, 50)">
            <text x="85" y="15" textAnchor="middle" fill="#CE93D8" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              1. Solid in Liquid
            </text>
            {/* Small beaker */}
            <rect x="30" y="30" width="110" height="120" rx="3" fill={`url(#glass-${uid})`} stroke="rgba(180,210,240,0.25)" strokeWidth="1" />
            <rect x="32" y="55" width="106" height="93" rx="2" fill={`url(#water-${uid})`} />
            {/* Purple cloud */}
            <ellipse cx="85" cy="105" rx="20" ry="18" fill={`url(#kmno4-${uid})`}>
              <animate attributeName="rx" values="10;45;50" dur="5s" repeatCount="indefinite" />
              <animate attributeName="ry" values="8;38;45" dur="5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.4;0.2" dur="5s" repeatCount="indefinite" />
            </ellipse>
            {/* Crystal */}
            <rect x="82" y="55" width="6" height="4" rx="1" fill="#7B1FA2" opacity="0.9" />
            <text x="85" y="168" textAnchor="middle" fill="#B39DDB" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              KMnO&#x2084; in water
            </text>
          </g>

          {/* Experiment 2: Food colouring in water (top-right) */}
          <g transform="translate(220, 50)">
            <text x="85" y="15" textAnchor="middle" fill="#EF5350" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              2. Liquid in Liquid
            </text>
            {/* Small beaker */}
            <rect x="30" y="30" width="110" height="120" rx="3" fill={`url(#glass-${uid})`} stroke="rgba(180,210,240,0.25)" strokeWidth="1" />
            <rect x="32" y="55" width="106" height="93" rx="2" fill={`url(#water-${uid})`} />
            {/* Red food colour spreading */}
            <ellipse cx="85" cy="90" rx="15" ry="30" fill={`url(#foodColour-${uid})`}>
              <animate attributeName="rx" values="8;40;48" dur="5s" repeatCount="indefinite" />
              <animate attributeName="ry" values="15;40;45" dur="5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.35;0.15" dur="5s" repeatCount="indefinite" />
            </ellipse>
            {/* Drop falling */}
            <circle cx="85" cy="40" r="3" fill="#E53935" opacity="0.8">
              <animate attributeName="cy" values="40;60;60" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.8;0" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <text x="85" y="168" textAnchor="middle" fill="#EF9A9A" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Food colour in water
            </text>
          </g>

          {/* Experiment 3: Spray bottle mist (bottom-left) */}
          <g transform="translate(40, 240)">
            <text x="85" y="15" textAnchor="middle" fill="#81D4FA" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              3. Liquid in Gas
            </text>
            {/* Spray bottle */}
            <g transform="translate(25, 30)">
              <rect x="0" y="30" width="30" height="55" rx="4" fill="#546E7A" />
              <rect x="5" y="35" width="20" height="45" rx="2" fill="rgba(100,181,246,0.3)" />
              <rect x="8" y="15" width="14" height="18" rx="3" fill="#78909C" />
              <rect x="20" y="18" width="18" height="6" rx="2" fill="#607D8B" />
              <line x1="38" y1="21" x2="45" y2="21" stroke="#607D8B" strokeWidth="2" />
            </g>
            {/* Mist particles spreading */}
            {[
              { x: 90, y: 60, delay: 0 }, { x: 105, y: 50, delay: 0.3 },
              { x: 115, y: 70, delay: 0.6 }, { x: 100, y: 80, delay: 0.9 },
              { x: 125, y: 55, delay: 1.2 }, { x: 130, y: 75, delay: 0.5 },
              { x: 140, y: 65, delay: 0.8 }, { x: 110, y: 45, delay: 1.1 },
            ].map((m, i) => (
              <circle key={`mist-${i}`} cx={m.x} cy={m.y} r="5" fill={`url(#smoke-${uid})`} opacity="0.5">
                <animate attributeName="cx" values={`${m.x};${m.x + 20}`} dur={`${2 + m.delay}s`} repeatCount="indefinite" />
                <animate attributeName="r" values="3;8;10" dur={`${2 + m.delay}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.2;0" dur={`${2 + m.delay}s`} repeatCount="indefinite" />
              </circle>
            ))}
            <text x="85" y="115" textAnchor="middle" fill="#B3E5FC" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Spray mist in air
            </text>
          </g>

          {/* Experiment 4: Incense smoke (bottom-right) */}
          <g transform="translate(220, 240)">
            <text x="85" y="15" textAnchor="middle" fill="#FFAB91" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              4. Gas in Gas
            </text>
            {/* Incense stick */}
            <g transform="translate(55, 30)">
              <rect x="0" y="20" width="3" height="70" rx="1" fill="#8D6E63" />
              {/* Glowing tip */}
              <circle cx="1.5" cy="20" r="3" fill="#FF6E40" opacity="0.9">
                <animate attributeName="opacity" values="0.7;1;0.7" dur="1s" repeatCount="indefinite" />
              </circle>
              <circle cx="1.5" cy="20" r="5" fill="#FF6E40" opacity="0.2">
                <animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </g>
            {/* Smoke rising and spreading */}
            {[
              { x: 57, y: 42, dx: -15, dy: -40 },
              { x: 57, y: 42, dx: 10, dy: -50 },
              { x: 57, y: 42, dx: -25, dy: -30 },
              { x: 57, y: 42, dx: 20, dy: -45 },
              { x: 57, y: 42, dx: -5, dy: -55 },
              { x: 57, y: 42, dx: 30, dy: -35 },
            ].map((s, i) => (
              <circle key={`smoke-${i}`} cx={s.x} cy={s.y} r="3" fill="rgba(200,200,200,0.3)" opacity="0.4">
                <animate attributeName="cx" values={`${s.x};${s.x + s.dx}`} dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
                <animate attributeName="cy" values={`${s.y};${s.y + s.dy}`} dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
                <animate attributeName="r" values="2;8;12" dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.2;0" dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
              </circle>
            ))}
            <text x="85" y="115" textAnchor="middle" fill="#FFCCBC" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Incense smoke in air
            </text>
          </g>

          {/* Right side: Summary comparison table */}
          <g transform="translate(420, 60)">
            <rect x="0" y="0" width="340" height="300" rx="12" fill="rgba(38,166,154,0.06)" stroke="#26A69A" strokeWidth="1" />
            <text x="170" y="28" textAnchor="middle" fill="#26A69A" fontSize="13" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              DIFFUSION IN EVERY MEDIUM
            </text>

            {/* Table rows */}
            {[
              { label: 'Solid in Liquid', sub: 'KMnO\u2084 \u2192 Water', color: '#CE93D8', y: 55 },
              { label: 'Liquid in Liquid', sub: 'Food colour \u2192 Water', color: '#EF5350', y: 115 },
              { label: 'Liquid in Gas', sub: 'Spray mist \u2192 Air', color: '#81D4FA', y: 175 },
              { label: 'Gas in Gas', sub: 'Incense smoke \u2192 Air', color: '#FFAB91', y: 235 },
            ].map((row, i) => (
              <g key={`row-${i}`} transform={`translate(20, ${row.y})`}>
                <circle cx="12" cy="12" r="8" fill={row.color} opacity="0.25" />
                <circle cx="12" cy="12" r="4" fill={row.color} opacity="0.7" />
                <text x="30" y="10" fill={row.color} fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                  {row.label}
                </text>
                <text x="30" y="26" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
                  {row.sub}
                </text>
                {/* Animated arrow showing spreading */}
                <line x1="180" y1="12" x2="290" y2="12" stroke={row.color} strokeWidth="1" strokeDasharray="5,3" opacity="0.5">
                  <animate attributeName="strokeDashoffset" values="16;0" dur="2s" repeatCount="indefinite" />
                </line>
                <text x="295" y="16" fill={row.color} fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.7">
                  spreads
                </text>
              </g>
            ))}
          </g>

          {/* Bottom info */}
          <g>
            <rect x="150" y="400" width="500" height="50" rx="12" fill="rgba(38,166,154,0.1)" stroke="#26A69A" strokeWidth="1" />
            <text x="400" y="422" textAnchor="middle" fill="#4DB6AC" fontSize="13" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="0.5">
              Diffusion happens in solids, liquids, and gases
            </text>
            <text x="400" y="440" textAnchor="middle" fill="#80CBC4" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              No energy required — molecules move from high to low concentration naturally
            </text>
          </g>
        </g>

        {/* ============================================================ */}
        {/* STEP 3: OSMOSIS — POTATO OSMOMETER & RAISINS                  */}
        {/* ============================================================ */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 3 ? 1 : 0,
            transform: step === 3 ? 'translateY(0)' : 'translateY(30px)',
            pointerEvents: step === 3 ? 'auto' : 'none',
          }}
        >
          {/* === LEFT: Potato Osmometer === */}
          <g transform="translate(30, 50)">
            <text x="175" y="18" textAnchor="middle" fill="#FFB74D" fontSize="12" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              POTATO OSMOMETER
            </text>

            {/* Dish with water (sugar solution potato) */}
            <g transform="translate(20, 40)">
              {/* Water dish */}
              <ellipse cx="80" cy="200" rx="85" ry="22" fill="rgba(100,181,246,0.08)" stroke="rgba(100,181,246,0.25)" strokeWidth="1" />
              <ellipse cx="80" cy="195" rx="75" ry="16" fill="rgba(66,165,245,0.12)" />
              <text x="80" y="230" textAnchor="middle" fill="#64B5F6" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                Water dish
              </text>

              {/* Potato cup */}
              <g>
                {/* Potato body */}
                <rect x="45" y="100" width="70" height="90" rx="8" fill="#C9A96E" stroke="#A1662F" strokeWidth="1.5" />
                {/* Hollow inside */}
                <rect x="52" y="105" width="56" height="60" rx="4" fill="rgba(10,10,10,0.6)" />
                {/* Sugar solution inside */}
                <rect x="52" y="125" width="56" height="40" rx="4" fill={`url(#sugar-${uid})`} />
                {/* Sugar solution rising */}
                <rect x="52" y="125" width="56" height="40" rx="4" fill="rgba(255,183,77,0.5)">
                  <animate attributeName="y" values="135;118;118" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="height" values="30;47;47" dur="4s" repeatCount="indefinite" />
                </rect>
                {/* Pin markers showing before/after */}
                <line x1="110" y1="135" x2="125" y2="135" stroke="#EF5350" strokeWidth="1.5" />
                <text x="128" y="138" fill="#EF5350" fontSize="7" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">Before</text>
                <line x1="110" y1="118" x2="125" y2="118" stroke="#66BB6A" strokeWidth="1.5" strokeDasharray="3,2">
                  <animate attributeName="opacity" values="0;1;1" dur="4s" repeatCount="indefinite" />
                </line>
                <text x="128" y="121" fill="#66BB6A" fontSize="7" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" opacity="0.8">After</text>

                {/* Label */}
                <text x="80" y="92" textAnchor="middle" fill="#FFB74D" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                  Sugar Solution
                </text>
              </g>

              {/* Water arrows through membrane */}
              {[
                { x1: 42, y1: 190, x2: 50, y2: 160 },
                { x1: 118, y1: 190, x2: 110, y2: 160 },
                { x1: 60, y1: 195, x2: 65, y2: 165 },
                { x1: 100, y1: 195, x2: 95, y2: 165 },
              ].map((a, i) => (
                <line key={`osm-arrow-${i}`} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="#64B5F6" strokeWidth="1" strokeDasharray="4,3" opacity="0.6">
                  <animate attributeName="strokeDashoffset" values="14;0" dur="2s" repeatCount="indefinite" />
                </line>
              ))}

              {/* Water molecule dots moving in */}
              {[
                { cx: 50, cy: 185, toCy: 155 },
                { cx: 110, cy: 188, toCy: 158 },
                { cx: 75, cy: 192, toCy: 162 },
              ].map((w, i) => (
                <circle key={`wmol-${i}`} cx={w.cx} cy={w.cy} r="2.5" fill="#64B5F6" opacity="0.7">
                  <animate attributeName="cy" values={`${w.cy};${w.toCy};${w.cy}`} dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0.3;0.7" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </g>

            {/* Membrane label */}
            <text x="95" y="290" textAnchor="middle" fill="#A1662F" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="0.5">
              Semi-permeable membrane (potato skin)
            </text>
          </g>

          {/* === RIGHT: Raisins Comparison === */}
          <g transform="translate(420, 50)">
            <text x="175" y="18" textAnchor="middle" fill="#8D6E63" fontSize="12" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              RAISIN OSMOSIS
            </text>

            {/* Dry raisin */}
            <g transform="translate(30, 45)">
              <text x="55" y="0" textAnchor="middle" fill="#A1887F" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                Dry Raisin
              </text>
              {/* Shrivelled raisins */}
              {[
                { x: 30, y: 35 }, { x: 55, y: 30 }, { x: 80, y: 38 },
              ].map((r, i) => (
                <g key={`dry-${i}`}>
                  <ellipse cx={r.x} cy={r.y} rx="12" ry="8" fill="#5D4037" />
                  {/* Wrinkle lines */}
                  <path d={`M${r.x - 6},${r.y - 2} Q${r.x},${r.y + 2} ${r.x + 6},${r.y - 2}`} fill="none" stroke="#4E342E" strokeWidth="0.8" opacity="0.6" />
                  <path d={`M${r.x - 4},${r.y + 1} Q${r.x},${r.y + 5} ${r.x + 4},${r.y + 1}`} fill="none" stroke="#4E342E" strokeWidth="0.8" opacity="0.5" />
                </g>
              ))}
              <text x="55" y="60" textAnchor="middle" fill="#8D6E63" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                Small, wrinkled
              </text>
            </g>

            {/* Arrow showing transformation */}
            <g transform="translate(140, 90)">
              <text x="30" y="-8" textAnchor="middle" fill="#64B5F6" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                + Water
              </text>
              <line x1="0" y1="0" x2="60" y2="0" stroke="#64B5F6" strokeWidth="1.5" strokeDasharray="5,3">
                <animate attributeName="strokeDashoffset" values="16;0" dur="1.5s" repeatCount="indefinite" />
              </line>
              <polygon points="60,0 54,-4 54,4" fill="#64B5F6" />
            </g>

            {/* Soaked raisin */}
            <g transform="translate(220, 45)">
              <text x="55" y="0" textAnchor="middle" fill="#A1887F" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                Soaked Raisin
              </text>
              {/* Plump raisins */}
              {[
                { x: 30, y: 32 }, { x: 60, y: 28 }, { x: 90, y: 35 },
              ].map((r, i) => (
                <g key={`soak-${i}`}>
                  <ellipse cx={r.x} cy={r.y} rx="16" ry="12" fill="#7B5B3A" opacity="0.9" />
                  <ellipse cx={r.x - 3} cy={r.y - 3} rx="6" ry="4" fill="#8D6E63" opacity="0.4" />
                </g>
              ))}
              <text x="55" y="60" textAnchor="middle" fill="#A1887F" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                Plump, swollen
              </text>
            </g>

            {/* Explanation */}
            <g transform="translate(0, 140)">
              <rect x="20" y="0" width="330" height="120" rx="10" fill="rgba(100,181,246,0.06)" stroke="rgba(100,181,246,0.2)" strokeWidth="1" />
              <text x="185" y="25" textAnchor="middle" fill="#64B5F6" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">
                How Osmosis Works
              </text>
              {/* Diagram: membrane with water flowing */}
              <rect x="60" y="40" width="230" height="50" rx="6" fill="none" stroke="rgba(100,181,246,0.3)" strokeWidth="1" />
              {/* Membrane line */}
              <line x1="175" y1="40" x2="175" y2="90" stroke="#26A69A" strokeWidth="2" strokeDasharray="3,3" />
              <text x="175" y="105" textAnchor="middle" fill="#26A69A" fontSize="7" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                Semi-permeable Membrane
              </text>
              {/* Water dots on left (high concentration) */}
              {[{ x: 85, y: 55 }, { x: 100, y: 65 }, { x: 115, y: 55 }, { x: 95, y: 75 }, { x: 130, y: 68 }, { x: 80, y: 70 }, { x: 140, y: 60 }].map((d, i) => (
                <circle key={`wl-${i}`} cx={d.x} cy={d.y} r="3" fill="#64B5F6" opacity="0.6" />
              ))}
              {/* Fewer dots on right (low concentration) */}
              {[{ x: 210, y: 60 }, { x: 240, y: 70 }].map((d, i) => (
                <circle key={`wr-${i}`} cx={d.x} cy={d.y} r="3" fill="#64B5F6" opacity="0.4" />
              ))}
              {/* Water arrow through membrane */}
              <line x1="145" y1="65" x2="190" y2="65" stroke="#64B5F6" strokeWidth="1.5" strokeDasharray="4,3">
                <animate attributeName="strokeDashoffset" values="14;0" dur="1.5s" repeatCount="indefinite" />
              </line>
              <polygon points="190,65 184,61 184,69" fill="#64B5F6" opacity="0.7" />
              <text x="115" y="38" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                Dilute (more water)
              </text>
              <text x="240" y="38" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                Concentrated
              </text>
            </g>
          </g>

          {/* Bottom info box */}
          <g>
            <rect x="100" y="400" width="600" height="55" rx="12" fill="rgba(38,166,154,0.1)" stroke="#26A69A" strokeWidth="1" />
            <text x="400" y="422" textAnchor="middle" fill="#4DB6AC" fontSize="13" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="0.5">
              Osmosis = Water diffusion across a semi-permeable membrane
            </text>
            <text x="400" y="440" textAnchor="middle" fill="#80CBC4" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Water moves from dilute solution to concentrated solution through the membrane
            </text>
          </g>
        </g>

        {/* ============================================================ */}
        {/* STEP 4: ROOT ABSORPTION & ACTIVE TRANSPORT                    */}
        {/* ============================================================ */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 4 ? 1 : 0,
            transform: step === 4 ? 'translateY(0)' : 'translateY(30px)',
            pointerEvents: step === 4 ? 'auto' : 'none',
          }}
        >
          {/* === LEFT: Plant in test tube === */}
          <g transform="translate(20, 50)">
            <text x="130" y="15" textAnchor="middle" fill="#66BB6A" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              ROOT WATER ABSORPTION
            </text>

            {/* Test tube with plant (sunlight) */}
            <g transform="translate(20, 30)">
              {/* Test tube */}
              <rect x="35" y="40" width="40" height="160" rx="3" fill={`url(#glass-${uid})`} stroke="rgba(180,210,240,0.25)" strokeWidth="1" />
              <ellipse cx="55" cy="200" rx="20" ry="5" fill="rgba(180,210,240,0.15)" />
              {/* Water */}
              <rect x="37" y="70" width="36" height="126" rx="2" fill="rgba(66,165,245,0.2)" />
              {/* Oil layer */}
              <rect x="37" y="66" width="36" height="8" rx="1" fill={`url(#oil-${uid})`} />
              {/* Water level mark - before */}
              <line x1="75" y1="70" x2="88" y2="70" stroke="#EF5350" strokeWidth="1.5" />
              <text x="90" y="73" fill="#EF5350" fontSize="6" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">Start</text>
              {/* Water level mark - after (lower) */}
              <line x1="75" y1="90" x2="88" y2="90" stroke="#66BB6A" strokeWidth="1.5" strokeDasharray="3,2">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" />
              </line>
              <text x="90" y="93" fill="#66BB6A" fontSize="6" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" opacity="0.8">Now</text>

              {/* Plant */}
              <line x1="55" y1="65" x2="55" y2="20" stroke="#4CAF50" strokeWidth="2.5" />
              {/* Leaves */}
              <ellipse cx="42" cy="25" rx="14" ry="6" fill="#43A047" transform="rotate(-25,42,25)" />
              <ellipse cx="68" cy="30" rx="12" ry="5" fill="#388E3C" transform="rotate(20,68,30)" />
              <ellipse cx="45" cy="38" rx="10" ry="4" fill="#4CAF50" transform="rotate(-15,45,38)" />
              {/* Roots in water */}
              {[
                { x1: 55, y1: 70, x2: 42, y2: 130 },
                { x1: 55, y1: 70, x2: 55, y2: 140 },
                { x1: 55, y1: 70, x2: 68, y2: 125 },
              ].map((r, i) => (
                <line key={`root-${i}`} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#A5D6A7" strokeWidth="1.5" opacity="0.7" />
              ))}
              {/* Root hairs */}
              {[
                { x: 47, y: 100, dx: -6 }, { x: 45, y: 115, dx: -8 },
                { x: 63, y: 95, dx: 7 }, { x: 65, y: 110, dx: 8 },
                { x: 50, y: 125, dx: -5 }, { x: 60, y: 120, dx: 6 },
              ].map((h, i) => (
                <line key={`hair-${i}`} x1={h.x} y1={h.y} x2={h.x + h.dx} y2={h.y + 2} stroke="#C8E6C9" strokeWidth="0.8" opacity="0.5" />
              ))}

              {/* Sunlight indicator */}
              <circle cx="10" cy="15" r="12" fill="#FFD54F" opacity="0.15" />
              <circle cx="10" cy="15" r="6" fill="#FFD54F" opacity="0.4" />
              <text x="10" y="0" textAnchor="middle" fill="#FFD54F" fontSize="7" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                Sun
              </text>

              <text x="55" y="218" textAnchor="middle" fill="#A5D6A7" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                In sunlight
              </text>
              <text x="55" y="228" textAnchor="middle" fill="#66BB6A" fontSize="7" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                More absorption
              </text>
            </g>

            {/* Control tube (no plant) */}
            <g transform="translate(150, 80)">
              <rect x="20" y="40" width="30" height="120" rx="3" fill={`url(#glass-${uid})`} stroke="rgba(180,210,240,0.2)" strokeWidth="1" />
              <rect x="22" y="55" width="26" height="102" rx="2" fill="rgba(66,165,245,0.15)" />
              <rect x="22" y="52" width="26" height="6" rx="1" fill={`url(#oil-${uid})`} opacity="0.7" />
              {/* Same water level */}
              <line x1="52" y1="55" x2="62" y2="55" stroke="#EF5350" strokeWidth="1" />
              <text x="35" y="178" textAnchor="middle" fill="#78909C" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                Control
              </text>
              <text x="35" y="188" textAnchor="middle" fill="#546E7A" fontSize="7" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                No plant
              </text>
            </g>
          </g>

          {/* === CENTER: Root cross-section === */}
          <g transform="translate(260, 55)">
            <text x="95" y="15" textAnchor="middle" fill="#66BB6A" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              ROOT CROSS-SECTION
            </text>

            {/* Root circle */}
            <circle cx="95" cy="135" r="80" fill={`url(#rootXS-${uid})`} stroke="#4CAF50" strokeWidth="1.5" opacity="0.8" />

            {/* Epidermis ring */}
            <circle cx="95" cy="135" r="78" fill="none" stroke="#81C784" strokeWidth="3" opacity="0.3" />

            {/* Cortex */}
            <circle cx="95" cy="135" r="60" fill="rgba(165,214,167,0.08)" stroke="rgba(165,214,167,0.2)" strokeWidth="1" />

            {/* Endodermis */}
            <circle cx="95" cy="135" r="40" fill="none" stroke="#66BB6A" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5" />

            {/* Xylem (star shape - water transport) */}
            <g>
              <polygon points="95,105 105,125 125,135 105,145 95,165 85,145 65,135 85,125" fill={`url(#xylem-${uid})`} opacity="0.7">
                <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite" />
              </polygon>
              {/* Water dots moving up through xylem */}
              {[
                { cx: 95, cy: 160, toCy: 108 },
                { cx: 90, cy: 155, toCy: 112 },
                { cx: 100, cy: 158, toCy: 110 },
              ].map((w, i) => (
                <circle key={`xw-${i}`} cx={w.cx} cy={w.cy} r="2" fill="#90CAF9" opacity="0.7">
                  <animate attributeName="cy" values={`${w.cy};${w.toCy};${w.cy}`} dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0.3;0.7" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </g>

            {/* Phloem (circles around xylem) */}
            {[
              { cx: 75, cy: 120 }, { cx: 115, cy: 120 },
              { cx: 75, cy: 150 }, { cx: 115, cy: 150 },
            ].map((p, i) => (
              <circle key={`ph-${i}`} cx={p.cx} cy={p.cy} r="6" fill={`url(#phloem-${uid})`} opacity="0.6">
                <animate attributeName="opacity" values="0.4;0.7;0.4" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            ))}

            {/* Root hairs extending outward */}
            {[
              { angle: -30 }, { angle: -60 }, { angle: -100 },
              { angle: -140 }, { angle: 20 }, { angle: 50 },
              { angle: 80 }, { angle: 130 }, { angle: 160 },
            ].map((rh, i) => {
              const rad = (rh.angle * Math.PI) / 180;
              const x1 = 95 + 78 * Math.cos(rad);
              const y1 = 135 + 78 * Math.sin(rad);
              const x2 = 95 + 100 * Math.cos(rad);
              const y2 = 135 + 100 * Math.sin(rad);
              return (
                <line key={`rhair-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C8E6C9" strokeWidth="1" opacity="0.5" />
              );
            })}

            {/* Labels */}
            <text x="95" y="138" textAnchor="middle" fill="#90CAF9" fontSize="7" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">
              Xylem
            </text>
            <text x="130" y="152" fill="#FFB74D" fontSize="7" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Phloem
            </text>
            <text x="95" y="237" textAnchor="middle" fill="#81C784" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Root hairs absorb water
            </text>
            <text x="95" y="250" textAnchor="middle" fill="#A5D6A7" fontSize="7" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              by osmosis from soil
            </text>
          </g>

          {/* === RIGHT: Active Transport (Toy Car on Slope) === */}
          <g transform="translate(490, 50)">
            <text x="145" y="15" textAnchor="middle" fill="#FF7043" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              ACTIVE TRANSPORT
            </text>

            {/* Slope — downhill (diffusion) */}
            <g transform="translate(10, 40)">
              <text x="110" y="12" textAnchor="middle" fill="#66BB6A" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                Diffusion (easy)
              </text>
              {/* Slope */}
              <polygon points="20,120 260,180 260,190 20,190" fill="rgba(38,166,154,0.12)" stroke="#26A69A" strokeWidth="1" />
              {/* Toy car rolling down */}
              <g>
                <rect x="100" y="135" width="30" height="16" rx="4" fill="#42A5F5" opacity="0.8">
                  <animate attributeName="x" values="60;200;60" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="y" values="120;163;120" dur="4s" repeatCount="indefinite" />
                </rect>
                <circle cx="110" cy="153" r="4" fill="#1E88E5" opacity="0.7">
                  <animate attributeName="cx" values="70;210;70" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="138;178;138" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx="125" cy="153" r="4" fill="#1E88E5" opacity="0.7">
                  <animate attributeName="cx" values="85;225;85" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="138;178;138" dur="4s" repeatCount="indefinite" />
                </circle>
              </g>
              {/* Arrow */}
              <line x1="50" y1="118" x2="230" y2="168" stroke="#66BB6A" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.5">
                <animate attributeName="strokeDashoffset" values="16;0" dur="2s" repeatCount="indefinite" />
              </line>
              <text x="140" y="205" textAnchor="middle" fill="#80CBC4" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                High &#x2192; Low (no energy)
              </text>
            </g>

            {/* Slope — uphill (active transport) */}
            <g transform="translate(10, 235)">
              <text x="110" y="12" textAnchor="middle" fill="#FF7043" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                Active Transport (hard)
              </text>
              {/* Slope going up */}
              <polygon points="20,180 260,120 260,190 20,190" fill="rgba(255,112,67,0.08)" stroke="#FF7043" strokeWidth="1" />
              {/* Toy car being pushed up */}
              <g>
                <rect x="100" y="155" width="30" height="16" rx="4" fill="#EF5350" opacity="0.8">
                  <animate attributeName="x" values="60;200;60" dur="5s" repeatCount="indefinite" />
                  <animate attributeName="y" values="165;133;165" dur="5s" repeatCount="indefinite" />
                </rect>
                <circle cx="110" cy="173" r="4" fill="#C62828" opacity="0.7">
                  <animate attributeName="cx" values="70;210;70" dur="5s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="183;148;183" dur="5s" repeatCount="indefinite" />
                </circle>
                <circle cx="125" cy="173" r="4" fill="#C62828" opacity="0.7">
                  <animate attributeName="cx" values="85;225;85" dur="5s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="183;148;183" dur="5s" repeatCount="indefinite" />
                </circle>
              </g>
              {/* Push hand/arrow */}
              <text x="50" y="168" fill="#FF8A65" fontSize="14" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" opacity="0.6">
                &#x21E8;
              </text>
              {/* ATP energy burst */}
              <g transform="translate(240, 122)">
                <circle cx="0" cy="0" r="14" fill="rgba(255,112,67,0.15)" stroke="#FF7043" strokeWidth="1" />
                <text x="0" y="4" textAnchor="middle" fill="#FF7043" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="800">
                  ATP
                </text>
                <circle cx="0" cy="0" r="16" fill="none" stroke="#FF7043" strokeWidth="0.5" opacity="0.4">
                  <animate attributeName="r" values="14;20;14" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </g>
              <text x="140" y="203" textAnchor="middle" fill="#FFAB91" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                Low &#x2192; High (needs energy!)
              </text>
            </g>
          </g>

          {/* Summary comparison chart */}
          <g>
            <rect x="60" y="400" width="680" height="60" rx="12" fill="rgba(38,166,154,0.08)" stroke="#26A69A" strokeWidth="1" />
            {[
              { x: 160, label: 'Diffusion', sub: 'High \u2192 Low', color: '#4DB6AC', sub2: 'No energy' },
              { x: 400, label: 'Osmosis', sub: 'Water through membrane', color: '#64B5F6', sub2: 'No energy' },
              { x: 640, label: 'Active Transport', sub: 'Low \u2192 High', color: '#FF7043', sub2: 'Needs ATP' },
            ].map((col, i) => (
              <g key={`sum-${i}`}>
                <text x={col.x} y="420" textAnchor="middle" fill={col.color} fontSize="12" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">
                  {col.label}
                </text>
                <text x={col.x} y="436" textAnchor="middle" fill={col.color} fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
                  {col.sub}
                </text>
                <text x={col.x} y="450" textAnchor="middle" fill={col.color} fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" opacity="0.5">
                  {col.sub2}
                </text>
              </g>
            ))}
            {/* Dividers */}
            <line x1="280" y1="408" x2="280" y2="455" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="520" y1="408" x2="520" y2="455" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
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
                fill={step === s ? '#26A69A' : 'rgba(255,255,255,0.15)'}
                stroke={step >= s ? '#26A69A' : 'rgba(255,255,255,0.1)'}
                strokeWidth={step === s ? 2 : 1}
                style={{ transition: 'all 0.5s ease' }}
              />
              {step === s && (
                <circle cx={(s - 1) * 40} cy="0" r="10" fill="none" stroke="#26A69A" strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" values="8;13;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <text
                x={(s - 1) * 40}
                y="18"
                textAnchor="middle"
                fill={step === s ? '#26A69A' : 'rgba(255,255,255,0.3)'}
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
          B5 TRANSPORT IN PLANTS
        </text>
      </svg>
    </div>
  );
}
