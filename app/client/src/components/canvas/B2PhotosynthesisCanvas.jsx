import React, { useMemo } from 'react';

/**
 * B2 Photosynthesis — "Testing Leaves for Starch"
 *
 * Interactive SVG canvas showing how food traces back to photosynthesis.
 * Receives `currentStep` prop (1-4) and renders each stage with smooth transitions.
 *
 * Step 1: Food from plants — plate of food with arrows tracing back to plants/crops
 * Step 2: Iodine test — dropping iodine on food samples, some turning blue-black
 * Step 3: Leaf starch test — boil leaf in alcohol, test with iodine, turns blue-black
 * Step 4: Chloroplasts — zoomed-in leaf cross-section, sunlight, CO2/O2, equation
 */

const TRANSITION = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
const FADE_TRANSITION = 'opacity 1.5s ease 0.3s';
const DELAYED_FADE = 'opacity 1.5s ease 0.8s';

export default function B2PhotosynthesisCanvas({ currentStep = 1 }) {
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
            <stop offset="0%" stopColor="#0f1a10" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>

          {/* Sunlight golden gradient */}
          <linearGradient id={`sunGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD54F" />
            <stop offset="100%" stopColor="#FF8F00" />
          </linearGradient>
          <radialGradient id={`sunGlow-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF176" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#FFD54F" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FF8F00" stopOpacity="0" />
          </radialGradient>

          {/* Leaf green gradients */}
          <linearGradient id={`leafGrad-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2E7D32" />
            <stop offset="50%" stopColor="#388E3C" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
          <linearGradient id={`leafPale-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C8E6C9" />
            <stop offset="50%" stopColor="#E8F5E9" />
            <stop offset="100%" stopColor="#A5D6A7" />
          </linearGradient>

          {/* Chloroplast green */}
          <radialGradient id={`chloroplast-${uid}`}>
            <stop offset="0%" stopColor="#66BB6A" />
            <stop offset="80%" stopColor="#2E7D32" />
            <stop offset="100%" stopColor="#1B5E20" />
          </radialGradient>

          {/* Iodine brown */}
          <radialGradient id={`iodine-${uid}`}>
            <stop offset="0%" stopColor="#BF360C" />
            <stop offset="100%" stopColor="#6D4C41" />
          </radialGradient>

          {/* Starch blue-black */}
          <radialGradient id={`starch-${uid}`}>
            <stop offset="0%" stopColor="#1A237E" />
            <stop offset="100%" stopColor="#0D0D2B" />
          </radialGradient>

          {/* Plate gradient */}
          <radialGradient id={`plate-${uid}`} cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#F5F5F5" />
            <stop offset="70%" stopColor="#E0E0E0" />
            <stop offset="100%" stopColor="#BDBDBD" />
          </radialGradient>

          {/* Petri dish */}
          <linearGradient id={`petri-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(200,220,240,0.2)" />
            <stop offset="100%" stopColor="rgba(160,190,220,0.1)" />
          </linearGradient>

          {/* Beaker glass */}
          <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(180,210,240,0.15)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(180,210,240,0.15)" />
          </linearGradient>

          {/* Methanol green */}
          <linearGradient id={`methanol-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2E7D32" stopOpacity="0.7" />
          </linearGradient>

          {/* Cell wall gradient */}
          <linearGradient id={`cellWall-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A5D6A7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#81C784" stopOpacity="0.3" />
          </linearGradient>

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
          {step === 1 && 'STEP 1 \u2014 FOOD COMES FROM PLANTS'}
          {step === 2 && 'STEP 2 \u2014 IODINE TEST ON FOOD'}
          {step === 3 && 'STEP 3 \u2014 STARCH TEST ON LEAVES'}
          {step === 4 && 'STEP 4 \u2014 INSIDE THE LEAF \u2014 CHLOROPLASTS'}
        </text>

        {/* ============================================================ */}
        {/* STEP 1: FOOD FROM PLANTS                                      */}
        {/* ============================================================ */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 1 ? 1 : 0,
            transform: step === 1 ? 'translateY(0)' : 'translateY(-30px)',
            pointerEvents: step === 1 ? 'auto' : 'none',
          }}
        >
          {/* Plate of food in center */}
          <ellipse cx="400" cy="280" rx="120" ry="50" fill={`url(#plate-${uid})`} filter={`url(#shadow-${uid})`} />
          <ellipse cx="400" cy="278" rx="105" ry="42" fill="none" stroke="#BDBDBD" strokeWidth="1" opacity="0.5" />

          {/* Rice pile */}
          <g transform="translate(355, 255)">
            <ellipse cx="20" cy="12" rx="22" ry="14" fill="#FFF9C4" />
            <ellipse cx="20" cy="8" rx="18" ry="10" fill="#FFFDE7" opacity="0.8" />
            <text x="20" y="38" textAnchor="middle" fill="#FFF9C4" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">Rice</text>
          </g>

          {/* Bread slice */}
          <g transform="translate(410, 250)">
            <rect x="0" y="0" width="28" height="24" rx="4" fill="#D7A86E" />
            <rect x="2" y="2" width="24" height="3" rx="1.5" fill="#A1662F" />
            <rect x="3" y="6" width="22" height="16" rx="2" fill="#E6BE8A" />
            <text x="14" y="38" textAnchor="middle" fill="#E6BE8A" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">Bread</text>
          </g>

          {/* Potato */}
          <g transform="translate(365, 280)">
            <ellipse cx="16" cy="10" rx="18" ry="12" fill="#C9A96E" />
            <ellipse cx="14" cy="8" rx="4" ry="2" fill="#B08B4E" opacity="0.5" />
            <ellipse cx="20" cy="12" rx="3" ry="1.5" fill="#B08B4E" opacity="0.4" />
            <text x="16" y="32" textAnchor="middle" fill="#C9A96E" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">Potato</text>
          </g>

          {/* Apple */}
          <g transform="translate(415, 275)">
            <circle cx="12" cy="10" r="13" fill="#E53935" />
            <ellipse cx="12" cy="5" rx="5" ry="3" fill="#EF5350" opacity="0.5" />
            <line x1="12" y1="-3" x2="12" y2="2" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M13 -1 Q18 -5 16 -2" fill="#4CAF50" />
            <text x="12" y="32" textAnchor="middle" fill="#EF5350" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">Fruit</text>
          </g>

          {/* Plants on the sides */}
          {/* Rice paddy (left) */}
          <g transform="translate(80, 160)">
            <rect x="25" y="60" width="6" height="50" rx="2" fill="#6D4C41" />
            <rect x="20" y="90" width="16" height="24" rx="3" fill="#5D4037" />
            {/* Stalk with grains */}
            <line x1="28" y1="10" x2="28" y2="60" stroke="#66BB6A" strokeWidth="2" />
            <line x1="28" y1="20" x2="15" y2="10" stroke="#66BB6A" strokeWidth="1.5" />
            <line x1="28" y1="20" x2="41" y2="12" stroke="#66BB6A" strokeWidth="1.5" />
            <line x1="28" y1="35" x2="12" y2="28" stroke="#81C784" strokeWidth="1.5" />
            <line x1="28" y1="35" x2="44" y2="30" stroke="#81C784" strokeWidth="1.5" />
            {/* Grain clusters */}
            {[{ x: 12, y: 8 }, { x: 44, y: 10 }, { x: 9, y: 26 }, { x: 47, y: 28 }].map((g, i) => (
              <ellipse key={`grain${i}`} cx={g.x} cy={g.y} rx="5" ry="3" fill="#FDD835" opacity="0.8" />
            ))}
            <text x="28" y="125" textAnchor="middle" fill="#A5D6A7" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">Rice Plant</text>
          </g>

          {/* Wheat plant */}
          <g transform="translate(180, 170)">
            <line x1="20" y1="15" x2="20" y2="70" stroke="#7CB342" strokeWidth="2" />
            <line x1="20" y1="30" x2="8" y2="22" stroke="#8BC34A" strokeWidth="1.5" />
            <line x1="20" y1="30" x2="32" y2="24" stroke="#8BC34A" strokeWidth="1.5" />
            {/* Wheat head */}
            <ellipse cx="20" cy="10" rx="6" ry="12" fill="#F9A825" />
            {[0, 4, 8, 12, 16].map((dy, i) => (
              <line key={`wh${i}`} x1="14" y1={4 + dy} x2="26" y2={4 + dy} stroke="#F57F17" strokeWidth="0.8" opacity="0.6" />
            ))}
            <text x="20" y="85" textAnchor="middle" fill="#AED581" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">Wheat</text>
          </g>

          {/* Potato plant (right) */}
          <g transform="translate(600, 160)">
            <line x1="25" y1="20" x2="25" y2="70" stroke="#66BB6A" strokeWidth="2" />
            {/* Leaves */}
            <ellipse cx="15" cy="25" rx="12" ry="6" fill="#43A047" transform="rotate(-20,15,25)" />
            <ellipse cx="35" cy="30" rx="12" ry="6" fill="#388E3C" transform="rotate(15,35,30)" />
            <ellipse cx="18" cy="40" rx="10" ry="5" fill="#4CAF50" transform="rotate(-10,18,40)" />
            {/* Underground potatoes */}
            <rect x="5" y="70" width="40" height="2" fill="#5D4037" opacity="0.4" />
            <ellipse cx="15" cy="82" rx="10" ry="7" fill="#C9A96E" />
            <ellipse cx="35" cy="85" rx="8" ry="6" fill="#B08B4E" />
            <text x="25" y="108" textAnchor="middle" fill="#A5D6A7" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">Potato Plant</text>
          </g>

          {/* Apple tree */}
          <g transform="translate(690, 130)">
            {/* Trunk */}
            <rect x="18" y="50" width="10" height="50" rx="3" fill="#6D4C41" />
            {/* Canopy */}
            <circle cx="23" cy="30" r="30" fill="#2E7D32" />
            <circle cx="12" cy="38" r="18" fill="#388E3C" />
            <circle cx="35" cy="36" r="20" fill="#1B5E20" />
            {/* Apples */}
            <circle cx="10" cy="28" r="5" fill="#E53935" />
            <circle cx="30" cy="22" r="4" fill="#D32F2F" />
            <circle cx="38" cy="38" r="5" fill="#E53935" />
            <text x="23" y="115" textAnchor="middle" fill="#A5D6A7" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">Apple Tree</text>
          </g>

          {/* Arrows from plants to food plate */}
          {[
            { x1: 130, y1: 240, x2: 310, y2: 270, color: '#66BB6A' },
            { x1: 210, y1: 240, x2: 340, y2: 265, color: '#8BC34A' },
            { x1: 630, y1: 240, x2: 490, y2: 275, color: '#66BB6A' },
            { x1: 710, y1: 220, x2: 495, y2: 268, color: '#43A047' },
          ].map((a, i) => (
            <g key={`arrow-${i}`}>
              <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={a.color} strokeWidth="1.5" strokeDasharray="6,4" opacity="0.6">
                <animate attributeName="strokeDashoffset" values="20;0" dur="2s" repeatCount="indefinite" />
              </line>
              <circle cx={a.x2} cy={a.y2} r="3" fill={a.color} opacity="0.8" />
            </g>
          ))}

          {/* Title message */}
          <g>
            <rect x="230" y="380" width="340" height="65" rx="12" fill="rgba(46,125,50,0.12)" stroke="#4CAF50" strokeWidth="1" />
            <text x="400" y="405" textAnchor="middle" fill="#81C784" fontSize="14" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              All our food traces back to plants
            </text>
            <text x="400" y="425" textAnchor="middle" fill="#A5D6A7" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Rice, bread, potato, fruit &mdash; every food item
            </text>
            <text x="400" y="440" textAnchor="middle" fill="#A5D6A7" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              originates from plants that made it using sunlight.
            </text>
          </g>
        </g>

        {/* ============================================================ */}
        {/* STEP 2: IODINE TEST ON FOOD                                   */}
        {/* ============================================================ */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 2 ? 1 : 0,
            transform: step === 2 ? 'translateY(0)' : 'translateY(30px)',
            pointerEvents: step === 2 ? 'auto' : 'none',
          }}
        >
          {/* Lab table */}
          <rect x="60" y="400" width="680" height="20" rx="4" fill="#546E7A" filter={`url(#shadow-${uid})`} />
          <rect x="60" y="416" width="680" height="10" rx="2" fill="#37474F" />

          {/* Four petri dishes with food samples */}
          {[
            { x: 140, label: 'Potato', foodColor: '#C9A96E', starchColor: '#1A237E' },
            { x: 300, label: 'Bread', foodColor: '#D7A86E', starchColor: '#0D0D3B' },
            { x: 460, label: 'Wheat Flour', foodColor: '#F5E6D3', starchColor: '#1A237E' },
            { x: 620, label: 'Apple', foodColor: '#E57373', starchColor: '#3E2723' },
          ].map((dish, i) => (
            <g key={`dish-${i}`} transform={`translate(${dish.x}, 260)`}>
              {/* Petri dish */}
              <ellipse cx="0" cy="60" rx="55" ry="18" fill="rgba(200,220,240,0.08)" stroke="rgba(180,210,240,0.25)" strokeWidth="1.5" />
              <ellipse cx="0" cy="55" rx="48" ry="14" fill="rgba(30,30,40,0.5)" />

              {/* Food sample */}
              <ellipse cx="0" cy="52" rx="30" ry="10" fill={dish.foodColor} opacity="0.8" />

              {/* Iodine drops turning blue-black (animated) */}
              <g>
                {/* Brown iodine drop falling */}
                <circle cx="0" cy="20" r="4" fill="#BF360C" opacity="0.7">
                  <animate attributeName="cy" values="20;48" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" />
                </circle>

                {/* Blue-black starch reaction spreading */}
                <ellipse cx="0" cy="52" rx="18" ry="7" fill={dish.starchColor} opacity="0.8">
                  <animate attributeName="rx" values="5;18;18" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="ry" values="2;7;7" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;0.8;0.8" dur="3s" repeatCount="indefinite" />
                </ellipse>
              </g>

              {/* Label */}
              <text x="0" y="90" textAnchor="middle" fill="#B0BEC5" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                {dish.label}
              </text>

              {/* Blue-black indicator */}
              <text x="0" y="105" textAnchor="middle" fill="#7986CB" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                BLUE-BLACK
              </text>
            </g>
          ))}

          {/* Iodine dropper */}
          <g transform="translate(380, 60)">
            {/* Rubber bulb */}
            <ellipse cx="0" cy="0" rx="12" ry="16" fill="#5D4037" />
            <ellipse cx="0" cy="-4" rx="8" ry="10" fill="#6D4C41" opacity="0.6" />
            {/* Glass tube */}
            <rect x="-4" y="14" width="8" height="50" rx="2" fill="rgba(200,220,240,0.15)" stroke="rgba(180,210,240,0.3)" strokeWidth="1" />
            {/* Iodine inside */}
            <rect x="-3" y="20" width="6" height="38" rx="1.5" fill="#BF360C" opacity="0.6" />
            {/* Drip */}
            <circle cx="0" cy="68" r="3" fill="#BF360C">
              <animate attributeName="cy" values="68;73;68" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <text x="0" y="-22" textAnchor="middle" fill="#BCAAA4" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Iodine Solution
            </text>
          </g>

          {/* Result box */}
          <g>
            <rect x="200" y="440" width="400" height="55" rx="10" fill="rgba(26,35,126,0.15)" stroke="#5C6BC0" strokeWidth="1" />
            <text x="400" y="462" textAnchor="middle" fill="#9FA8DA" fontSize="13" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              Iodine turns BLUE-BLACK = Starch present!
            </text>
            <text x="400" y="480" textAnchor="middle" fill="#7986CB" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              All food samples contain starch from plants
            </text>
          </g>
        </g>

        {/* ============================================================ */}
        {/* STEP 3: LEAF STARCH TEST                                      */}
        {/* ============================================================ */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 3 ? 1 : 0,
            transform: step === 3 ? 'translateY(0)' : 'translateY(30px)',
            pointerEvents: step === 3 ? 'auto' : 'none',
          }}
        >
          {/* Lab bench */}
          <rect x="40" y="420" width="720" height="18" rx="3" fill="#546E7A" filter={`url(#shadow-${uid})`} />
          <rect x="40" y="434" width="720" height="8" rx="2" fill="#37474F" />

          {/* === Stage A: Boiling in water === */}
          <g transform="translate(100, 140)">
            {/* Tripod stand */}
            <line x1="40" y1="240" x2="10" y2="280" stroke="#78909C" strokeWidth="3" strokeLinecap="round" />
            <line x1="40" y1="240" x2="70" y2="280" stroke="#78909C" strokeWidth="3" strokeLinecap="round" />
            <line x1="40" y1="240" x2="40" y2="285" stroke="#78909C" strokeWidth="3" strokeLinecap="round" />
            {/* Wire gauze */}
            <rect x="15" y="235" width="50" height="4" rx="1" fill="#90A4AE" />
            <g opacity="0.3">
              {Array.from({ length: 6 }, (_, i) => (
                <line key={`wg${i}`} x1={18 + i * 8} y1="236" x2={18 + i * 8} y2="238" stroke="#B0BEC5" strokeWidth="0.5" />
              ))}
            </g>

            {/* Spirit lamp flame */}
            <rect x="30" y="290" width="20" height="14" rx="3" fill="#5D4037" />
            <rect x="38" y="282" width="4" height="10" rx="1" fill="#795548" />
            <ellipse cx="40" cy="274" rx="6" ry="10" fill="#FF6F00" opacity="0.7">
              <animate attributeName="ry" values="8;12;9;11;8" dur="0.8s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="40" cy="276" rx="3" ry="6" fill="#FFC107" opacity="0.8">
              <animate attributeName="ry" values="5;7;4;6;5" dur="0.6s" repeatCount="indefinite" />
            </ellipse>

            {/* Beaker with water */}
            <rect x="18" y="190" width="44" height="48" rx="2" fill={`url(#glass-${uid})`} stroke="rgba(180,210,240,0.3)" strokeWidth="1.5" />
            {/* Water */}
            <rect x="20" y="205" width="40" height="31" rx="1" fill="#1E88E5" opacity="0.35" />
            {/* Steam bubbles */}
            {[{ x: 30, d: 1.8 }, { x: 42, d: 2.2 }, { x: 50, d: 1.5 }].map((b, i) => (
              <circle key={`bub${i}`} cx={b.x} cy="210" r={b.d} fill="none" stroke="rgba(144,202,249,0.4)" strokeWidth="0.8">
                <animate attributeName="cy" values="228;200;228" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            ))}
            {/* Green leaf in water */}
            <ellipse cx="40" cy="220" rx="12" ry="6" fill="#388E3C" opacity="0.8" transform="rotate(-15,40,220)" />

            <text x="40" y="175" textAnchor="middle" fill="#64B5F6" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              1. Boil leaf
            </text>
            <text x="40" y="186" textAnchor="middle" fill="#64B5F6" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              in water
            </text>
          </g>

          {/* Arrow */}
          <line x1="195" y1="330" x2="240" y2="330" stroke="#66BB6A" strokeWidth="1.5" markerEnd={`url(#arrowHead-${uid})`} opacity="0.5" strokeDasharray="4,3">
            <animate attributeName="strokeDashoffset" values="14;0" dur="1.5s" repeatCount="indefinite" />
          </line>

          {/* === Stage B: Methanol extraction === */}
          <g transform="translate(280, 140)">
            {/* Beaker */}
            <rect x="10" y="210" width="50" height="55" rx="3" fill={`url(#glass-${uid})`} stroke="rgba(180,210,240,0.3)" strokeWidth="1.5" />
            {/* Methanol turning green */}
            <rect x="12" y="225" width="46" height="38" rx="2" fill={`url(#methanol-${uid})`}>
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
            </rect>
            {/* Pale leaf */}
            <ellipse cx="35" cy="240" rx="14" ry="7" fill="#C8E6C9" opacity="0.8" transform="rotate(10,35,240)" />

            <text x="35" y="195" textAnchor="middle" fill="#A5D6A7" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              2. Soak in
            </text>
            <text x="35" y="206" textAnchor="middle" fill="#A5D6A7" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              methanol
            </text>
            <text x="35" y="280" textAnchor="middle" fill="#66BB6A" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              Chlorophyll dissolves
            </text>
          </g>

          {/* Arrow */}
          <line x1="365" y1="330" x2="410" y2="330" stroke="#66BB6A" strokeWidth="1.5" opacity="0.5" strokeDasharray="4,3">
            <animate attributeName="strokeDashoffset" values="14;0" dur="1.5s" repeatCount="indefinite" />
          </line>

          {/* === Stage C: Iodine on pale leaf === */}
          <g transform="translate(440, 140)">
            {/* Filter paper */}
            <rect x="5" y="230" width="60" height="40" rx="4" fill="#F5F5F5" opacity="0.15" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

            {/* Pale leaf */}
            <path d="M35 235 Q55 230 55 250 Q55 265 35 270 Q15 265 15 250 Q15 230 35 235Z" fill={`url(#leafPale-${uid})`} opacity="0.9" />
            {/* Leaf vein */}
            <line x1="35" y1="237" x2="35" y2="268" stroke="#81C784" strokeWidth="0.8" opacity="0.5" />
            <line x1="35" y1="248" x2="22" y2="242" stroke="#81C784" strokeWidth="0.6" opacity="0.4" />
            <line x1="35" y1="255" x2="48" y2="250" stroke="#81C784" strokeWidth="0.6" opacity="0.4" />

            {/* Blue-black patches from iodine */}
            <ellipse cx="30" cy="248" rx="8" ry="5" fill="#1A237E" opacity="0.8">
              <animate attributeName="opacity" values="0;0.8;0.8" dur="3s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="40" cy="258" rx="7" ry="4" fill="#0D0D3B" opacity="0.7">
              <animate attributeName="opacity" values="0;0.7;0.7" dur="3.5s" repeatCount="indefinite" />
            </ellipse>

            {/* Dropper */}
            <rect x="32" y="195" width="6" height="30" rx="2" fill="rgba(200,220,240,0.15)" stroke="rgba(180,210,240,0.25)" strokeWidth="1" />
            <rect x="33" y="200" width="4" height="20" rx="1" fill="#BF360C" opacity="0.5" />
            <circle cx="35" cy="228" r="2.5" fill="#BF360C" opacity="0.7">
              <animate attributeName="cy" values="228;235;228" dur="2s" repeatCount="indefinite" />
            </circle>

            <text x="35" y="185" textAnchor="middle" fill="#BCAAA4" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              3. Apply iodine
            </text>
          </g>

          {/* Arrow */}
          <line x1="510" y1="330" x2="555" y2="330" stroke="#66BB6A" strokeWidth="1.5" opacity="0.5" strokeDasharray="4,3">
            <animate attributeName="strokeDashoffset" values="14;0" dur="1.5s" repeatCount="indefinite" />
          </line>

          {/* === Stage D: Result === */}
          <g transform="translate(580, 170)">
            {/* Result leaf with blue-black */}
            <path d="M40 80 Q65 70 65 100 Q65 125 40 135 Q15 125 15 100 Q15 70 40 80Z" fill={`url(#leafPale-${uid})`} opacity="0.7" />
            <ellipse cx="35" cy="100" rx="14" ry="10" fill="#1A237E" opacity="0.85" />
            <ellipse cx="45" cy="115" rx="10" ry="7" fill="#0D0D3B" opacity="0.75" />

            {/* Checkmark */}
            <circle cx="40" cy="160" r="14" fill="none" stroke="#4CAF50" strokeWidth="2" />
            <polyline points="31,160 37,166 50,153" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            <text x="40" y="60" textAnchor="middle" fill="#7986CB" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">
              BLUE-BLACK!
            </text>
            <text x="40" y="190" textAnchor="middle" fill="#A5D6A7" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Starch in leaves!
            </text>
          </g>

          {/* Conclusion box */}
          <g>
            <rect x="180" y="450" width="440" height="55" rx="10" fill="rgba(46,125,50,0.12)" stroke="#4CAF50" strokeWidth="1" />
            <text x="400" y="472" textAnchor="middle" fill="#81C784" fontSize="13" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              Leaves contain starch just like our food!
            </text>
            <text x="400" y="490" textAnchor="middle" fill="#A5D6A7" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Plants produce glucose via photosynthesis and store it as starch
            </text>
          </g>
        </g>

        {/* ============================================================ */}
        {/* STEP 4: CHLOROPLASTS — INSIDE THE LEAF                        */}
        {/* ============================================================ */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 4 ? 1 : 0,
            transform: step === 4 ? 'scale(1)' : 'scale(0.95)',
            transformOrigin: '400px 280px',
            pointerEvents: step === 4 ? 'auto' : 'none',
          }}
        >
          {/* Sun */}
          <circle cx="680" cy="80" r="35" fill={`url(#sunGlow-${uid})`} filter={`url(#glow-${uid})`} />
          <circle cx="680" cy="80" r="18" fill={`url(#sunGrad-${uid})`} />
          {/* Sun rays */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 45) * Math.PI / 180;
            return (
              <line
                key={`ray${i}`}
                x1={680 + Math.cos(angle) * 22}
                y1={80 + Math.sin(angle) * 22}
                x2={680 + Math.cos(angle) * 38}
                y2={80 + Math.sin(angle) * 38}
                stroke="#FFD54F"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
              >
                <animate attributeName="opacity" values="0.6;0.3;0.6" dur={`${1.5 + i * 0.1}s`} repeatCount="indefinite" />
              </line>
            );
          })}

          {/* Sunlight arrows going into leaf */}
          {[
            { x1: 645, y1: 100, x2: 540, y2: 180 },
            { x1: 655, y1: 110, x2: 510, y2: 200 },
            { x1: 640, y1: 115, x2: 480, y2: 215 },
          ].map((a, i) => (
            <line key={`sunray-${i}`} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="#FFD54F" strokeWidth="1.5" opacity="0.4" strokeDasharray="6,4">
              <animate attributeName="strokeDashoffset" values="20;0" dur="1.5s" repeatCount="indefinite" />
            </line>
          ))}
          <text x="620" y="140" fill="#FFD54F" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" opacity="0.8">
            Sunlight
          </text>

          {/* Leaf cross-section (main visual) */}
          <g transform="translate(120, 100)">
            {/* Outer leaf shape — cross-section rectangle */}
            <rect x="0" y="80" width="480" height="200" rx="20" fill="rgba(46,125,50,0.1)" stroke="#4CAF50" strokeWidth="1.5" opacity="0.6" />

            {/* Upper epidermis */}
            <rect x="10" y="85" width="460" height="28" rx="8" fill="rgba(129,199,132,0.15)" stroke="rgba(129,199,132,0.3)" strokeWidth="1" />
            <text x="240" y="103" textAnchor="middle" fill="#A5D6A7" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="1">
              UPPER EPIDERMIS
            </text>

            {/* Mesophyll layer */}
            <rect x="10" y="118" width="460" height="120" rx="6" fill="rgba(56,142,60,0.08)" />

            {/* Mesophyll cells with chloroplasts */}
            {[
              { cx: 70, cy: 160 }, { cx: 160, cy: 155 }, { cx: 250, cy: 165 },
              { cx: 340, cy: 158 }, { cx: 430, cy: 162 },
              { cx: 110, cy: 200 }, { cx: 200, cy: 205 }, { cx: 290, cy: 198 },
              { cx: 380, cy: 203 },
            ].map((cell, i) => (
              <g key={`cell-${i}`}>
                {/* Cell wall */}
                <ellipse cx={cell.cx} cy={cell.cy} rx="42" ry="22" fill="none" stroke="rgba(165,214,167,0.3)" strokeWidth="1" />
                {/* Cell interior */}
                <ellipse cx={cell.cx} cy={cell.cy} rx="38" ry="18" fill="rgba(200,230,201,0.05)" />
                {/* Chloroplasts (small green ovals) */}
                {[
                  { dx: -18, dy: -6 }, { dx: -8, dy: 5 }, { dx: 5, dy: -8 },
                  { dx: 15, dy: 3 }, { dx: -12, dy: 8 }, { dx: 8, dy: 8 },
                  { dx: 20, dy: -4 }, { dx: -22, dy: 2 },
                ].map((cp, j) => (
                  <ellipse
                    key={`cp-${i}-${j}`}
                    cx={cell.cx + cp.dx}
                    cy={cell.cy + cp.dy}
                    rx="5"
                    ry="3"
                    fill={`url(#chloroplast-${uid})`}
                    opacity="0.85"
                    transform={`rotate(${(i + j) * 20}, ${cell.cx + cp.dx}, ${cell.cy + cp.dy})`}
                  >
                    <animate
                      attributeName="opacity"
                      values="0.7;0.95;0.7"
                      dur={`${2 + (i + j) * 0.15}s`}
                      repeatCount="indefinite"
                    />
                  </ellipse>
                ))}
              </g>
            ))}

            {/* Label: Mesophyll cells with chloroplasts */}
            <text x="240" y="140" textAnchor="middle" fill="#66BB6A" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="1">
              MESOPHYLL TISSUE
            </text>

            {/* Pointer to chloroplast */}
            <line x1="340" y1="160" x2="410" y2="120" stroke="#81C784" strokeWidth="1" strokeDasharray="3,2" opacity="0.6" />
            <g transform="translate(410, 96)">
              <rect x="-35" y="0" width="90" height="22" rx="6" fill="rgba(102,187,106,0.2)" stroke="#66BB6A" strokeWidth="1" />
              <text x="10" y="15" textAnchor="middle" fill="#A5D6A7" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                Chloroplast
              </text>
            </g>

            {/* Lower epidermis */}
            <rect x="10" y="242" width="460" height="28" rx="8" fill="rgba(129,199,132,0.1)" stroke="rgba(129,199,132,0.2)" strokeWidth="1" />
            <text x="240" y="260" textAnchor="middle" fill="#81C784" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="1" opacity="0.7">
              LOWER EPIDERMIS
            </text>

            {/* Stomata */}
            {[120, 240, 360].map((sx, i) => (
              <g key={`stoma-${i}`} transform={`translate(${sx}, 272)`}>
                <ellipse cx="0" cy="0" rx="8" ry="4" fill="none" stroke="#66BB6A" strokeWidth="1.5" />
                <ellipse cx="-6" cy="0" rx="3" ry="6" fill="#388E3C" opacity="0.4" transform="rotate(-10)" />
                <ellipse cx="6" cy="0" rx="3" ry="6" fill="#388E3C" opacity="0.4" transform="rotate(10)" />
              </g>
            ))}
          </g>

          {/* CO2 arrows coming in */}
          <g>
            <text x="60" y="250" fill="#90A4AE" fontSize="12" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">
              CO&#x2082;
            </text>
            <line x1="85" y1="250" x2="130" y2="280" stroke="#90A4AE" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.6">
              <animate attributeName="strokeDashoffset" values="16;0" dur="2s" repeatCount="indefinite" />
            </line>
            <polygon points="130,280 124,274 128,282" fill="#90A4AE" opacity="0.6" />

            <text x="60" y="310" fill="#90A4AE" fontSize="12" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">
              H&#x2082;O
            </text>
            <line x1="88" y1="305" x2="130" y2="310" stroke="#64B5F6" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.6">
              <animate attributeName="strokeDashoffset" values="16;0" dur="2.2s" repeatCount="indefinite" />
            </line>
            <polygon points="130,310 124,306 126,314" fill="#64B5F6" opacity="0.6" />
          </g>

          {/* O2 arrows going out */}
          <g>
            <line x1="600" y1="380" x2="650" y2="400" stroke="#81D4FA" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.6">
              <animate attributeName="strokeDashoffset" values="0;16" dur="2s" repeatCount="indefinite" />
            </line>
            <text x="655" y="405" fill="#81D4FA" fontSize="12" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">
              O&#x2082;
            </text>

            {/* O2 bubbles */}
            {[{ x: 640, y: 390, d: 1.8 }, { x: 660, y: 395, d: 2.5 }, { x: 675, y: 385, d: 1.5 }].map((b, i) => (
              <circle key={`o2-${i}`} cx={b.x} cy={b.y} r={b.d} fill="none" stroke="#81D4FA" strokeWidth="0.8" opacity="0.5">
                <animate attributeName="cy" values={`${b.y};${b.y - 15};${b.y}`} dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.1;0.5" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>

          {/* Glucose produced label */}
          <g transform="translate(610, 280)">
            <rect x="0" y="0" width="110" height="32" rx="8" fill="rgba(255,213,79,0.1)" stroke="#FFD54F" strokeWidth="1" />
            <text x="55" y="14" textAnchor="middle" fill="#FFD54F" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Glucose (C&#x2086;H&#x2081;&#x2082;O&#x2086;)
            </text>
            <text x="55" y="26" textAnchor="middle" fill="#FFCA28" fontSize="8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              stored as starch
            </text>
          </g>

          {/* Photosynthesis Equation */}
          <g>
            <rect x="130" y="440" width="540" height="65" rx="12" fill="rgba(46,125,50,0.12)" stroke="#4CAF50" strokeWidth="1.5" />
            <text x="400" y="460" textAnchor="middle" fill="#81C784" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="1">
              PHOTOSYNTHESIS EQUATION
            </text>
            <text x="400" y="485" textAnchor="middle" fill="#A5D6A7" fontSize="14" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="0.5">
              6CO&#x2082; + 6H&#x2082;O {'  '}
              <tspan fill="#FFD54F" fontSize="12">&#x2192; sunlight + chlorophyll &#x2192;</tspan>
              {'  '} C&#x2086;H&#x2081;&#x2082;O&#x2086; + 6O&#x2082;
            </text>
          </g>

          {/* "Green leaves are the kitchens of plants" */}
          <text x="400" y="525" textAnchor="middle" fill="#66BB6A" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" fontStyle="italic" opacity="0.7">
            &quot;Green leaves are the kitchens of plants&quot;
          </text>
        </g>

        {/* ===== STEP INDICATOR DOTS ===== */}
        <g transform="translate(340, 530)">
          {[1, 2, 3, 4].map((s) => (
            <g key={`dot-${s}`}>
              <circle
                cx={(s - 1) * 40}
                cy="0"
                r={step === s ? 7 : 5}
                fill={step === s ? '#4CAF50' : 'rgba(255,255,255,0.15)'}
                stroke={step >= s ? '#4CAF50' : 'rgba(255,255,255,0.1)'}
                strokeWidth={step === s ? 2 : 1}
                style={{ transition: 'all 0.5s ease' }}
              />
              {step === s && (
                <circle cx={(s - 1) * 40} cy="0" r="10" fill="none" stroke="#4CAF50" strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" values="8;13;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <text
                x={(s - 1) * 40}
                y="18"
                textAnchor="middle"
                fill={step === s ? '#4CAF50' : 'rgba(255,255,255,0.3)'}
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
          B2 PHOTOSYNTHESIS
        </text>
      </svg>
    </div>
  );
}
