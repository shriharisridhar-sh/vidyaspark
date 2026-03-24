import React, { useMemo } from 'react';

/**
 * C4 Chemical Reactions — Physical vs Chemical Changes
 *
 * Interactive SVG canvas showing sulphur burning, sugar comparison, and evidence summary.
 * Receives `currentStep` prop (1-4) and renders each stage with smooth transitions.
 *
 * Step 1: Setup — Lab table with gas jar, flower, sulphur, spirit lamp, sugar, spatula
 * Step 2: Burning Sulphur — Flame, SO2 fumes, flower fading, black residue
 * Step 3: Sugar Comparison — Dissolving (physical) vs Caramelizing (chemical) side by side
 * Step 4: Evidence Summary — Signs of chemical change with all evidence displayed
 */

const TRANSITION = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
const FADE_TRANSITION = 'opacity 1.5s ease 0.3s';
const DELAYED_FADE = 'opacity 1.5s ease 0.8s';

export default function C4ChemicalReactionsCanvas({ currentStep = 1 }) {
  const step = Math.max(1, Math.min(4, currentStep));

  const uniqueId = useMemo(() => Math.random().toString(36).slice(2, 8), []);

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
          {/* Background */}
          <radialGradient id={`bg-${uniqueId}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1a1025" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>

          {/* Table */}
          <linearGradient id={`table-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B6914" />
            <stop offset="30%" stopColor="#7A5C12" />
            <stop offset="100%" stopColor="#5C4410" />
          </linearGradient>
          <linearGradient id={`tableEdge-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6B4E10" />
            <stop offset="100%" stopColor="#3D2E0A" />
          </linearGradient>

          {/* Glass jar */}
          <linearGradient id={`glass-${uniqueId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(180,210,240,0.15)" />
            <stop offset="25%" stopColor="rgba(200,225,250,0.08)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="75%" stopColor="rgba(180,210,240,0.12)" />
            <stop offset="100%" stopColor="rgba(160,195,230,0.18)" />
          </linearGradient>
          <linearGradient id={`glassHL-${uniqueId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Flame gradient */}
          <radialGradient id={`flame-${uniqueId}`} cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#FFEB3B" />
            <stop offset="40%" stopColor="#FF9800" />
            <stop offset="80%" stopColor="#F44336" />
            <stop offset="100%" stopColor="#F4433600" />
          </radialGradient>
          <radialGradient id={`flameInner-${uniqueId}`} cx="50%" cy="70%" r="40%">
            <stop offset="0%" stopColor="#FFF9C4" />
            <stop offset="60%" stopColor="#FFEB3B" />
            <stop offset="100%" stopColor="#FF980000" />
          </radialGradient>

          {/* Sulphur yellow */}
          <radialGradient id={`sulphur-${uniqueId}`}>
            <stop offset="0%" stopColor="#FFEE58" />
            <stop offset="100%" stopColor="#F9A825" />
          </radialGradient>

          {/* SO2 fume */}
          <radialGradient id={`fume-${uniqueId}`}>
            <stop offset="0%" stopColor="#FFEB3B" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFEB3B" stopOpacity="0" />
          </radialGradient>

          {/* Sugar gradient */}
          <linearGradient id={`sugar-${uniqueId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FAFAFA" />
            <stop offset="100%" stopColor="#E0E0E0" />
          </linearGradient>

          {/* Water */}
          <linearGradient id={`water-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E90FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0D47A1" stopOpacity="0.85" />
          </linearGradient>

          {/* Caramel gradient */}
          <linearGradient id={`caramel-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6D4C41" />
            <stop offset="100%" stopColor="#3E2723" />
          </linearGradient>

          {/* Purple glow for chemistry */}
          <radialGradient id={`purpleGlow-${uniqueId}`}>
            <stop offset="0%" stopColor="#9C27B0" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#9C27B0" stopOpacity="0" />
          </radialGradient>

          {/* Spirit lamp base */}
          <linearGradient id={`lamp-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78909C" />
            <stop offset="100%" stopColor="#455A64" />
          </linearGradient>

          {/* Hibiscus flower */}
          <radialGradient id={`flower-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E91E63" />
            <stop offset="70%" stopColor="#C2185B" />
            <stop offset="100%" stopColor="#880E4F" />
          </radialGradient>
          <radialGradient id={`flowerFaded-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#BDBDBD" />
            <stop offset="70%" stopColor="#9E9E9E" />
            <stop offset="100%" stopColor="#757575" />
          </radialGradient>

          {/* Filters */}
          <filter id={`shadow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
          </filter>
          <filter id={`glow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`flameGlow-${uniqueId}`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ===== BACKGROUND ===== */}
        <rect width="800" height="560" fill={`url(#bg-${uniqueId})`} />

        {/* Subtle grid for lab feel */}
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
          fill="#9C27B0"
          fontSize="14"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="600"
          letterSpacing="2"
          style={{ transition: FADE_TRANSITION }}
        >
          {step === 1 && 'STEP 1 — SETUP & MATERIALS'}
          {step === 2 && 'STEP 2 — BURNING SULPHUR'}
          {step === 3 && 'STEP 3 — SUGAR: PHYSICAL vs CHEMICAL'}
          {step === 4 && 'STEP 4 — THE EVIDENCE'}
        </text>

        {/* ================================================================ */}
        {/* STEP 1: SETUP                                                    */}
        {/* ================================================================ */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 1 ? 1 : 0,
            transform: step === 1 ? 'translateY(0)' : 'translateY(-30px)',
          }}
        >
          {/* Table */}
          <rect x="60" y="400" width="680" height="24" rx="4" fill={`url(#table-${uniqueId})`} filter={`url(#shadow-${uniqueId})`} />
          <rect x="60" y="420" width="680" height="12" rx="2" fill={`url(#tableEdge-${uniqueId})`} />
          <g opacity="0.15">
            <line x1="100" y1="406" x2="700" y2="406" stroke="#3D2E0A" strokeWidth="0.5" />
            <line x1="80" y1="412" x2="720" y2="411" stroke="#3D2E0A" strokeWidth="0.5" />
          </g>

          {/* Gas Jar with Flower */}
          <g>
            {/* Jar body */}
            <rect x="120" y="230" width="100" height="170" rx="6" fill={`url(#glass-${uniqueId})`} stroke="rgba(180,210,240,0.3)" strokeWidth="1.5" />
            {/* Jar rim */}
            <rect x="115" y="225" width="110" height="10" rx="3" fill="rgba(180,210,240,0.15)" stroke="rgba(180,210,240,0.3)" strokeWidth="1" />
            {/* Jar bottom */}
            <rect x="120" y="394" width="100" height="6" rx="3" fill="rgba(180,210,240,0.1)" />
            {/* Glass reflection */}
            <rect x="132" y="240" width="4" height="145" rx="2" fill={`url(#glassHL-${uniqueId})`} opacity="0.5" />

            {/* Hibiscus flower inside jar */}
            <g transform="translate(170, 330)">
              {/* Stem */}
              <line x1="0" y1="0" x2="0" y2="50" stroke="#4CAF50" strokeWidth="2.5" />
              <ellipse cx="-12" cy="25" rx="8" ry="5" fill="#66BB6A" transform="rotate(-25, -12, 25)" />
              {/* Petals */}
              {[0, 72, 144, 216, 288].map((angle, i) => (
                <ellipse
                  key={`petal-${i}`}
                  cx="0"
                  cy="-14"
                  rx="10"
                  ry="16"
                  fill={`url(#flower-${uniqueId})`}
                  transform={`rotate(${angle}, 0, 0)`}
                  opacity="0.9"
                />
              ))}
              {/* Center */}
              <circle cx="0" cy="0" r="6" fill="#FFEB3B" />
              <circle cx="0" cy="0" r="3" fill="#FF9800" />
            </g>

            <text x="170" y="218" textAnchor="middle" fill="#CE93D8" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.8">
              Gas Jar + Flower
            </text>
          </g>

          {/* Sulphur Powder on Deflagrating Spoon */}
          <g>
            {/* Spoon handle */}
            <rect x="310" y="360" width="80" height="5" rx="2" fill="#90A4AE" />
            {/* Spoon bowl */}
            <ellipse cx="305" cy="362" rx="18" ry="10" fill="#78909C" />
            <ellipse cx="305" cy="360" rx="16" ry="8" fill="#546E7A" />
            {/* Sulphur powder */}
            <ellipse cx="305" cy="358" rx="12" ry="5" fill={`url(#sulphur-${uniqueId})`} />

            <text x="340" y="345" textAnchor="middle" fill="#FFEE58" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.8">
              Sulphur Powder
            </text>
          </g>

          {/* Spirit Lamp */}
          <g transform="translate(460, 340)">
            {/* Lamp body */}
            <rect x="-20" y="20" width="40" height="40" rx="4" fill={`url(#lamp-${uniqueId})`} />
            <ellipse cx="0" cy="20" rx="22" ry="6" fill="#78909C" />
            <ellipse cx="0" cy="60" rx="24" ry="5" fill="#455A64" />
            {/* Wick tube */}
            <rect x="-3" y="8" width="6" height="14" rx="2" fill="#546E7A" />
            {/* Wick */}
            <rect x="-1.5" y="4" width="3" height="8" rx="1" fill="#424242" />

            <text x="0" y="-5" textAnchor="middle" fill="#B0BEC5" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.8">
              Spirit Lamp
            </text>
          </g>

          {/* Sugar + Spatula */}
          <g>
            {/* China dish */}
            <ellipse cx="600" cy="385" rx="35" ry="12" fill="#ECEFF1" stroke="#CFD8DC" strokeWidth="1" />
            <ellipse cx="600" cy="383" rx="30" ry="8" fill="#FAFAFA" />
            {/* Sugar pile */}
            <ellipse cx="600" cy="378" rx="18" ry="6" fill={`url(#sugar-${uniqueId})`} />
            {/* Sugar granule sparkles */}
            {[{x: 594, y: 376}, {x: 606, y: 377}, {x: 600, y: 374}].map((g, i) => (
              <circle key={`sg-${i}`} cx={g.x} cy={g.y} r="1" fill="#FFF" opacity="0.7">
                <animate attributeName="opacity" values="0.7;0.3;0.7" dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            ))}

            {/* Spatula */}
            <rect x="640" y="365" width="60" height="4" rx="1.5" fill="#90A4AE" transform="rotate(-10, 640, 365)" />

            <text x="620" y="350" textAnchor="middle" fill="#B0BEC5" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.8">
              Sugar + Spatula
            </text>
          </g>

          {/* Safety Goggles */}
          <g transform="translate(280, 260)">
            <ellipse cx="0" cy="0" rx="18" ry="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <ellipse cx="40" cy="0" rx="18" ry="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <line x1="18" y1="0" x2="22" y2="0" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <ellipse cx="0" cy="0" rx="15" ry="11" fill="rgba(100,181,246,0.08)" />
            <ellipse cx="40" cy="0" rx="15" ry="11" fill="rgba(100,181,246,0.08)" />
            <text x="20" y="-22" textAnchor="middle" fill="#B0BEC5" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.7">
              Safety Goggles
            </text>
          </g>

          {/* Safety note */}
          <g>
            <rect x="200" y="445" width="400" height="36" rx="8" fill="rgba(156,39,176,0.08)" stroke="#9C27B0" strokeWidth="1" strokeDasharray="4 3" />
            <text x="400" y="467" textAnchor="middle" fill="#CE93D8" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Wear safety goggles and gloves. Keep students at safe distance.
            </text>
          </g>
        </g>

        {/* ================================================================ */}
        {/* STEP 2: BURNING SULPHUR                                          */}
        {/* ================================================================ */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 2 ? 1 : 0,
            transform: step === 2 ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          {/* Table */}
          <rect x="100" y="440" width="600" height="20" rx="4" fill={`url(#table-${uniqueId})`} filter={`url(#shadow-${uniqueId})`} />
          <rect x="100" y="456" width="600" height="10" rx="2" fill={`url(#tableEdge-${uniqueId})`} />

          {/* Gas jar — larger, central */}
          <g>
            <rect x="280" y="160" width="160" height="280" rx="8" fill={`url(#glass-${uniqueId})`} stroke="rgba(180,210,240,0.3)" strokeWidth="2" />
            <rect x="274" y="153" width="172" height="14" rx="4" fill="rgba(180,210,240,0.15)" stroke="rgba(180,210,240,0.3)" strokeWidth="1" />
            <rect x="280" y="434" width="160" height="6" rx="3" fill="rgba(180,210,240,0.1)" />
            <rect x="296" y="174" width="5" height="250" rx="2.5" fill={`url(#glassHL-${uniqueId})`} opacity="0.4" />
          </g>

          {/* Fading flower inside jar */}
          <g transform="translate(360, 340)">
            <line x1="0" y1="0" x2="0" y2="60" stroke="#8BC34A" strokeWidth="2.5" opacity="0.6" />
            <ellipse cx="-10" cy="30" rx="7" ry="4" fill="#8BC34A" opacity="0.5" transform="rotate(-25, -10, 30)" />
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <ellipse
                key={`fpetal-${i}`}
                cx="0"
                cy="-14"
                rx="12"
                ry="18"
                fill={`url(#flowerFaded-${uniqueId})`}
                transform={`rotate(${angle}, 0, 0)`}
                opacity="0.7"
              >
                <animate
                  attributeName="opacity"
                  values="0.9;0.5;0.4"
                  dur="4s"
                  fill="freeze"
                  repeatCount="1"
                />
              </ellipse>
            ))}
            <circle cx="0" cy="0" r="7" fill="#BDBDBD" />
            <circle cx="0" cy="0" r="3.5" fill="#9E9E9E" />
          </g>

          {/* Deflagrating spoon inside jar with burning sulphur */}
          <g>
            {/* Spoon handle extending out of jar */}
            <rect x="360" y="145" width="120" height="5" rx="2" fill="#90A4AE" transform="rotate(15, 360, 147)" />
            {/* Spoon bowl */}
            <ellipse cx="358" cy="195" rx="16" ry="10" fill="#546E7A" />

            {/* Black residue forming */}
            <ellipse cx="358" cy="193" rx="10" ry="5" fill="#37474F" opacity="0.7" />

            {/* Flame on sulphur */}
            <g filter={`url(#flameGlow-${uniqueId})`}>
              <ellipse cx="358" cy="175" rx="12" ry="20" fill={`url(#flame-${uniqueId})`} opacity="0.9">
                <animate attributeName="ry" values="18;22;16;20;18" dur="0.6s" repeatCount="indefinite" />
                <animate attributeName="rx" values="10;14;11;13;10" dur="0.7s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="358" cy="178" rx="6" ry="12" fill={`url(#flameInner-${uniqueId})`} opacity="0.8">
                <animate attributeName="ry" values="10;14;11;10" dur="0.5s" repeatCount="indefinite" />
              </ellipse>
            </g>
          </g>

          {/* SO2 Fume particles filling the jar */}
          {[
            { cx: 320, cy: 220, r: 25 },
            { cx: 390, cy: 240, r: 20 },
            { cx: 340, cy: 270, r: 22 },
            { cx: 410, cy: 210, r: 18 },
            { cx: 370, cy: 300, r: 20 },
            { cx: 310, cy: 310, r: 16 },
            { cx: 420, cy: 280, r: 14 },
            { cx: 350, cy: 190, r: 15 },
            { cx: 395, cy: 320, r: 18 },
            { cx: 330, cy: 250, r: 12 },
          ].map((p, i) => (
            <circle key={`fume-${i}`} cx={p.cx} cy={p.cy} r={p.r} fill={`url(#fume-${uniqueId})`}>
              <animate
                attributeName="cy"
                values={`${p.cy};${p.cy - 8};${p.cy - 3};${p.cy}`}
                dur={`${2.5 + i * 0.3}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.5;0.8;0.4;0.5"
                dur={`${2 + i * 0.25}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values={`${p.r};${p.r + 4};${p.r - 2};${p.r}`}
                dur={`${3 + i * 0.2}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}

          {/* Annotations */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 2 ? 1 : 0 }}>
            {/* Flame label */}
            <line x1="370" y1="170" x2="510" y2="120" stroke="#FFAB91" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
            <text x="515" y="115" fill="#FFAB91" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Sulphur burns
            </text>
            <text x="515" y="131" fill="#FFAB91" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              with blue-yellow flame
            </text>

            {/* Fume label */}
            <line x1="310" y1="250" x2="180" y2="230" stroke="#FFF59D" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
            <text x="90" y="225" fill="#FFF59D" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              SO&#8322; gas forms
            </text>
            <text x="90" y="241" fill="#FFF59D" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              (yellow fumes)
            </text>

            {/* Flower fading */}
            <line x1="380" y1="340" x2="520" y2="350" stroke="#EF9A9A" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
            <text x="525" y="345" fill="#EF9A9A" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Flower colour fades!
            </text>
            <text x="525" y="361" fill="#EF9A9A" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              SO&#8322; bleaches the petals
            </text>

            {/* Residue label */}
            <line x1="358" y1="200" x2="185" y2="310" stroke="#90A4AE" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            <text x="90" y="308" fill="#90A4AE" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Black residue remains
            </text>
            <text x="90" y="323" fill="#90A4AE" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              Sulphur does NOT re-form
            </text>
          </g>

          {/* Chemical change badge */}
          <g style={{ transition: 'opacity 1.5s ease 1s', opacity: step === 2 ? 1 : 0 }}>
            <rect x="240" y="475" width="320" height="40" rx="10" fill="rgba(156,39,176,0.12)" stroke="#9C27B0" strokeWidth="1.5" />
            <text x="400" y="500" textAnchor="middle" fill="#CE93D8" fontSize="13"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              CHEMICAL CHANGE — New substance formed!
            </text>
          </g>
        </g>

        {/* ================================================================ */}
        {/* STEP 3: SUGAR COMPARISON                                         */}
        {/* ================================================================ */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 3 ? 1 : 0,
            transform: step === 3 ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          {/* Divider line */}
          <line x1="400" y1="60" x2="400" y2="480" stroke="rgba(156,39,176,0.3)" strokeWidth="1" strokeDasharray="6 4" />
          <text x="400" y="55" textAnchor="middle" fill="#9C27B0" fontSize="10"
            fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="2" opacity="0.6">
            VS
          </text>

          {/* ---- LEFT SIDE: Physical Change (dissolving) ---- */}
          <g>
            <text x="200" y="78" textAnchor="middle" fill="#4CAF50" fontSize="13"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              PHYSICAL CHANGE
            </text>
            <text x="200" y="95" textAnchor="middle" fill="#81C784" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Sugar dissolves in water
            </text>

            {/* Beaker with water and sugar */}
            <g transform="translate(140, 120)">
              {/* Beaker */}
              <rect x="20" y="30" width="100" height="130" rx="4" fill={`url(#glass-${uniqueId})`} stroke="rgba(180,210,240,0.3)" strokeWidth="1.5" />
              <rect x="15" y="24" width="110" height="10" rx="3" fill="rgba(180,210,240,0.12)" stroke="rgba(180,210,240,0.25)" strokeWidth="1" />
              <rect x="28" y="40" width="4" height="110" rx="2" fill={`url(#glassHL-${uniqueId})`} opacity="0.4" />

              {/* Water filling the beaker */}
              <rect x="22" y="70" width="96" height="88" rx="3" fill={`url(#water-${uniqueId})`} />
              {/* Water surface shimmer */}
              <rect x="22" y="68" width="96" height="6" rx="2" fill="rgba(100,181,246,0.4)">
                <animate attributeName="opacity" values="0.4;0.6;0.4" dur="2s" repeatCount="indefinite" />
              </rect>

              {/* Sugar granules dissolving — swirling particles */}
              {[
                { cx: 50, cy: 100, delay: 0 },
                { cx: 80, cy: 110, delay: 0.3 },
                { cx: 60, cy: 130, delay: 0.6 },
                { cx: 90, cy: 95, delay: 0.9 },
                { cx: 45, cy: 120, delay: 1.2 },
                { cx: 100, cy: 125, delay: 0.5 },
                { cx: 70, cy: 140, delay: 0.8 },
              ].map((s, i) => (
                <circle key={`diss-${i}`} cx={s.cx} cy={s.cy} r="2" fill="#FAFAFA" opacity="0.6">
                  <animate
                    attributeName="cx"
                    values={`${s.cx};${s.cx + 10};${s.cx - 5};${s.cx}`}
                    dur={`${3 + i * 0.2}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    values={`${s.cy};${s.cy + 5};${s.cy - 3};${s.cy}`}
                    dur={`${2.5 + i * 0.3}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.7;0.4;0.7"
                    dur={`${2 + i * 0.2}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
            </g>

            {/* Arrow down: boil & cool */}
            <g>
              <line x1="200" y1="285" x2="200" y2="320" stroke="#4CAF50" strokeWidth="2" />
              <polygon points="193,318 200,330 207,318" fill="#4CAF50" />
              <text x="260" y="305" fill="#81C784" fontSize="10"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                Boil &amp; Cool
              </text>
            </g>

            {/* Re-crystallized sugar */}
            <g transform="translate(140, 340)">
              {/* Dish */}
              <ellipse cx="60" cy="50" rx="50" ry="16" fill="#ECEFF1" stroke="#CFD8DC" strokeWidth="1" />
              <ellipse cx="60" cy="46" rx="42" ry="10" fill="#FAFAFA" />
              {/* Sugar crystals re-formed */}
              {[
                { x: 45, y: 42, w: 10, h: 7 },
                { x: 58, y: 40, w: 12, h: 8 },
                { x: 72, y: 43, w: 9, h: 6 },
                { x: 52, y: 38, w: 8, h: 6 },
              ].map((c, i) => (
                <rect key={`crystal-${i}`} x={c.x} y={c.y} width={c.w} height={c.h} rx="1"
                  fill="#FAFAFA" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" opacity="0.9">
                  <animate attributeName="opacity" values="0.9;0.6;0.9" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
                </rect>
              ))}
            </g>

            {/* Result label */}
            <g style={{ transition: DELAYED_FADE, opacity: step === 3 ? 1 : 0 }}>
              <rect x="110" y="420" width="180" height="50" rx="8" fill="rgba(76,175,80,0.1)" stroke="#4CAF50" strokeWidth="1.5" />
              <text x="200" y="442" textAnchor="middle" fill="#81C784" fontSize="12"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">
                Sugar recovered!
              </text>
              <text x="200" y="458" textAnchor="middle" fill="#A5D6A7" fontSize="10"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
                Reversible — same substance
              </text>
            </g>
          </g>

          {/* ---- RIGHT SIDE: Chemical Change (caramelizing) ---- */}
          <g>
            <text x="600" y="78" textAnchor="middle" fill="#F44336" fontSize="13"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              CHEMICAL CHANGE
            </text>
            <text x="600" y="95" textAnchor="middle" fill="#EF9A9A" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Sugar heated directly
            </text>

            {/* Spatula over flame */}
            <g transform="translate(530, 120)">
              {/* Spatula */}
              <rect x="20" y="60" width="110" height="6" rx="2" fill="#90A4AE" transform="rotate(-5, 75, 63)" />
              <ellipse cx="28" cy="62" rx="22" ry="10" fill="#78909C" />

              {/* Sugar changing color — brown to black gradient */}
              <ellipse cx="28" cy="58" rx="16" ry="6" fill={`url(#caramel-${uniqueId})`}>
                <animate
                  attributeName="fill"
                  values="#E0E0E0;#A1887F;#6D4C41;#3E2723;#212121"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </ellipse>

              {/* Flame under spatula */}
              <g filter={`url(#flameGlow-${uniqueId})`}>
                <ellipse cx="28" cy="90" rx="14" ry="22" fill={`url(#flame-${uniqueId})`} opacity="0.85">
                  <animate attributeName="ry" values="20;24;18;22;20" dur="0.7s" repeatCount="indefinite" />
                  <animate attributeName="rx" values="12;15;11;14;12" dur="0.6s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="28" cy="94" rx="6" ry="12" fill={`url(#flameInner-${uniqueId})`} opacity="0.8">
                  <animate attributeName="ry" values="10;14;9;12;10" dur="0.5s" repeatCount="indefinite" />
                </ellipse>
              </g>

              {/* Spirit lamp base */}
              <rect x="8" y="112" width="40" height="30" rx="4" fill={`url(#lamp-${uniqueId})`} />
              <ellipse cx="28" cy="112" rx="22" ry="5" fill="#78909C" />
            </g>

            {/* Rising fumes from caramelizing sugar */}
            {[
              { cx: 558, cy: 160, r: 8 },
              { cx: 570, cy: 140, r: 10 },
              { cx: 548, cy: 130, r: 7 },
              { cx: 575, cy: 118, r: 9 },
              { cx: 555, cy: 110, r: 6 },
            ].map((f, i) => (
              <circle key={`cfume-${i}`} cx={f.cx} cy={f.cy} r={f.r} fill="rgba(158,158,158,0.2)" stroke="rgba(158,158,158,0.1)" strokeWidth="0.5">
                <animate
                  attributeName="cy"
                  values={`${f.cy};${f.cy - 15};${f.cy - 8};${f.cy}`}
                  dur={`${2.5 + i * 0.4}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.4;0.15;0.3;0.4"
                  dur={`${2 + i * 0.3}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}

            {/* Arrow down: result */}
            <g>
              <line x1="600" y1="285" x2="600" y2="320" stroke="#F44336" strokeWidth="2" />
              <polygon points="593,318 600,330 607,318" fill="#F44336" />
              <text x="650" y="305" fill="#EF9A9A" fontSize="10"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                Keeps heating
              </text>
            </g>

            {/* Carbon residue — black lump */}
            <g transform="translate(540, 340)">
              {/* Spatula with residue */}
              <ellipse cx="60" cy="50" rx="28" ry="12" fill="#78909C" />
              <ellipse cx="60" cy="46" rx="22" ry="8" fill="#212121" />
              {/* Carbon texture */}
              <circle cx="52" cy="44" r="3" fill="#1a1a1a" />
              <circle cx="62" cy="43" r="4" fill="#0d0d0d" />
              <circle cx="70" cy="45" r="2.5" fill="#1a1a1a" />
              {/* Smoke wisps */}
              {[0, 1, 2].map((i) => (
                <path key={`smoke-${i}`}
                  d={`M${55 + i * 8},40 Q${58 + i * 8},30 ${52 + i * 8},20`}
                  fill="none" stroke="rgba(158,158,158,0.3)" strokeWidth="1.5" strokeLinecap="round">
                  <animate
                    attributeName="d"
                    values={`M${55 + i * 8},40 Q${58 + i * 8},30 ${52 + i * 8},20;M${55 + i * 8},40 Q${52 + i * 8},28 ${58 + i * 8},16;M${55 + i * 8},40 Q${58 + i * 8},30 ${52 + i * 8},20`}
                    dur={`${2 + i * 0.4}s`}
                    repeatCount="indefinite"
                  />
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                </path>
              ))}
            </g>

            {/* Result label */}
            <g style={{ transition: DELAYED_FADE, opacity: step === 3 ? 1 : 0 }}>
              <rect x="510" y="420" width="180" height="50" rx="8" fill="rgba(244,67,54,0.1)" stroke="#F44336" strokeWidth="1.5" />
              <text x="600" y="442" textAnchor="middle" fill="#EF9A9A" fontSize="12"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">
                Carbon residue left!
              </text>
              <text x="600" y="458" textAnchor="middle" fill="#FFAB91" fontSize="10"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
                Irreversible — new substance
              </text>
            </g>
          </g>
        </g>

        {/* ================================================================ */}
        {/* STEP 4: EVIDENCE SUMMARY                                         */}
        {/* ================================================================ */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 4 ? 1 : 0,
            transform: step === 4 ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          {/* Four evidence panels in a 2x2 grid */}

          {/* Panel 1: Faded flower (top-left) */}
          <g transform="translate(50, 55)">
            <rect x="0" y="0" width="170" height="175" rx="12" fill="rgba(30,30,40,0.7)" stroke="rgba(156,39,176,0.3)" strokeWidth="1" />
            <text x="85" y="25" textAnchor="middle" fill="#CE93D8" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Faded Flower
            </text>

            {/* Mini faded flower */}
            <g transform="translate(85, 100)">
              <line x1="0" y1="0" x2="0" y2="35" stroke="#8BC34A" strokeWidth="2" opacity="0.5" />
              {[0, 72, 144, 216, 288].map((angle, i) => (
                <ellipse
                  key={`ef-${i}`}
                  cx="0"
                  cy="-10"
                  rx="8"
                  ry="13"
                  fill="#9E9E9E"
                  transform={`rotate(${angle}, 0, 0)`}
                  opacity="0.6"
                />
              ))}
              <circle cx="0" cy="0" r="5" fill="#BDBDBD" />
            </g>

            <text x="85" y="155" textAnchor="middle" fill="#EF9A9A" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500"
              style={{ transition: DELAYED_FADE, opacity: step === 4 ? 1 : 0 }}>
              Colour changed
            </text>
            <text x="85" y="168" textAnchor="middle" fill="#EF9A9A" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              by SO&#8322; gas
            </text>
          </g>

          {/* Panel 2: Black sulphur residue (top-right) */}
          <g transform="translate(240, 55)">
            <rect x="0" y="0" width="170" height="175" rx="12" fill="rgba(30,30,40,0.7)" stroke="rgba(156,39,176,0.3)" strokeWidth="1" />
            <text x="85" y="25" textAnchor="middle" fill="#CE93D8" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Sulphur Residue
            </text>

            {/* Mini spoon with black residue */}
            <g transform="translate(85, 95)">
              <rect x="-30" y="8" width="60" height="4" rx="1.5" fill="#78909C" />
              <ellipse cx="-32" cy="8" rx="14" ry="9" fill="#546E7A" />
              <ellipse cx="-32" cy="5" rx="10" ry="6" fill="#212121" />
              {/* Arrow showing: was yellow, now black */}
              <text x="-32" y="-15" textAnchor="middle" fill="#FFEE58" fontSize="9"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                Was yellow
              </text>
              <text x="-32" y="30" textAnchor="middle" fill="#757575" fontSize="9"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                Now black
              </text>
            </g>

            <text x="85" y="155" textAnchor="middle" fill="#FFAB91" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500"
              style={{ transition: DELAYED_FADE, opacity: step === 4 ? 1 : 0 }}>
              New substance formed
            </text>
            <text x="85" y="168" textAnchor="middle" fill="#FFAB91" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              Sulphur cannot re-form
            </text>
          </g>

          {/* Panel 3: Caramelized sugar (bottom-left) */}
          <g transform="translate(430, 55)">
            <rect x="0" y="0" width="170" height="175" rx="12" fill="rgba(30,30,40,0.7)" stroke="rgba(156,39,176,0.3)" strokeWidth="1" />
            <text x="85" y="25" textAnchor="middle" fill="#CE93D8" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Caramelized Sugar
            </text>

            {/* Mini spatula with carbon */}
            <g transform="translate(85, 95)">
              <ellipse cx="0" cy="5" rx="20" ry="10" fill="#78909C" />
              <ellipse cx="0" cy="2" rx="15" ry="6" fill="#1a1a1a" />
              {/* Smoke wisps */}
              {[0, 1].map((i) => (
                <path key={`ms-${i}`}
                  d={`M${-5 + i * 10},0 Q${-2 + i * 10},-12 ${-7 + i * 10},-20`}
                  fill="none" stroke="rgba(158,158,158,0.25)" strokeWidth="1.5" strokeLinecap="round">
                  <animate
                    attributeName="opacity"
                    values="0.25;0.1;0.25"
                    dur={`${1.5 + i * 0.4}s`}
                    repeatCount="indefinite"
                  />
                </path>
              ))}
              <text x="0" y="-25" textAnchor="middle" fill="#FAFAFA" fontSize="9"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                Was white
              </text>
              <text x="0" y="25" textAnchor="middle" fill="#757575" fontSize="9"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                Now black carbon
              </text>
            </g>

            <text x="85" y="155" textAnchor="middle" fill="#FFF59D" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500"
              style={{ transition: DELAYED_FADE, opacity: step === 4 ? 1 : 0 }}>
              Energy released
            </text>
            <text x="85" y="168" textAnchor="middle" fill="#FFF59D" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              Heat + fumes produced
            </text>
          </g>

          {/* Panel 4: Magnesium oxide (bottom-right) */}
          <g transform="translate(620, 55)">
            <rect x="0" y="0" width="150" height="175" rx="12" fill="rgba(30,30,40,0.7)" stroke="rgba(156,39,176,0.3)" strokeWidth="1" />
            <text x="75" y="25" textAnchor="middle" fill="#CE93D8" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Magnesium Oxide
            </text>

            {/* Bright flash / white powder */}
            <g transform="translate(75, 90)">
              {/* White powder */}
              <ellipse cx="0" cy="10" rx="20" ry="8" fill="#E0E0E0" />
              <ellipse cx="0" cy="8" rx="15" ry="5" fill="#FAFAFA" />
              {/* Bright light rays */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <line key={`ray-${i}`}
                  x1="0" y1="0"
                  x2={Math.cos(angle * Math.PI / 180) * 22}
                  y2={Math.sin(angle * Math.PI / 180) * 22 - 5}
                  stroke="#FFF" strokeWidth="1.5" opacity="0.3">
                  <animate attributeName="opacity" values="0.3;0.6;0.3" dur={`${1 + i * 0.1}s`} repeatCount="indefinite" />
                </line>
              ))}
              <circle cx="0" cy="-5" r="8" fill="#FFF" opacity="0.15">
                <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.15;0.3;0.15" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </g>

            <text x="75" y="148" textAnchor="middle" fill="#81D4FA" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500"
              style={{ transition: DELAYED_FADE, opacity: step === 4 ? 1 : 0 }}>
              Bright light emitted
            </text>
            <text x="75" y="161" textAnchor="middle" fill="#81D4FA" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              White MgO powder left
            </text>
          </g>

          {/* Signs of Chemical Change — summary box */}
          <g style={{ transition: 'opacity 1.5s ease 0.6s', opacity: step === 4 ? 1 : 0 }}>
            <rect x="80" y="260" width="640" height="120" rx="14" fill="rgba(156,39,176,0.08)" stroke="#9C27B0" strokeWidth="1.5" />
            <text x="400" y="290" textAnchor="middle" fill="#CE93D8" fontSize="14"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              SIGNS OF CHEMICAL CHANGE
            </text>

            {/* Four signs as icons + text */}
            {[
              { icon: '🔴', text: 'Change in colour', x: 170 },
              { icon: '💨', text: 'Gas or fumes released', x: 330 },
              { icon: '🔥', text: 'Energy released / absorbed', x: 500 },
              { icon: '🆕', text: 'New substance formed', x: 660 },
            ].map((sign, i) => (
              <g key={`sign-${i}`} style={{ transition: `opacity 1.5s ease ${0.8 + i * 0.2}s`, opacity: step === 4 ? 1 : 0 }}>
                <circle cx={sign.x} cy="330" r="16" fill="rgba(156,39,176,0.15)" stroke="rgba(206,147,216,0.3)" strokeWidth="1" />
                <text x={sign.x} y="335" textAnchor="middle" fontSize="14">{sign.icon}</text>
                <text x={sign.x} y="360" textAnchor="middle" fill="#B0BEC5" fontSize="9"
                  fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                  {sign.text}
                </text>
              </g>
            ))}
          </g>

          {/* Conclusion box */}
          <g style={{ transition: 'opacity 1.5s ease 1.2s', opacity: step === 4 ? 1 : 0 }}>
            <rect x="150" y="400" width="500" height="70" rx="12" fill="rgba(156,39,176,0.12)" stroke="#9C27B0" strokeWidth="1.5" />
            <text x="400" y="428" textAnchor="middle" fill="#E1BEE7" fontSize="14"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              Chemical changes are permanent &amp; irreversible
            </text>
            <text x="400" y="450" textAnchor="middle" fill="#CE93D8" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              New substances with different properties are formed.
            </text>
            <text x="400" y="464" textAnchor="middle" fill="#CE93D8" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Physical changes are temporary &amp; reversible — no new substance.
            </text>
          </g>

          {/* Sparkle effects */}
          {[
            { x: 135, y: 245 },
            { x: 325, y: 245 },
            { x: 515, y: 245 },
            { x: 695, y: 245 },
          ].map((sp, i) => (
            <g key={`sp4-${i}`} style={{ transition: `opacity 1.5s ease ${1 + i * 0.15}s`, opacity: step === 4 ? 1 : 0 }}>
              <circle cx={sp.x} cy={sp.y} r="5" fill={`url(#purpleGlow-${uniqueId})`}>
                <animate attributeName="r" values="3;7;3" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}
        </g>

        {/* ===== STEP INDICATOR DOTS ===== */}
        <g transform="translate(340, 530)">
          {[1, 2, 3, 4].map((s) => (
            <g key={`dot-${s}`}>
              <circle
                cx={(s - 1) * 40}
                cy="0"
                r={step === s ? 7 : 5}
                fill={step === s ? '#9C27B0' : 'rgba(255,255,255,0.15)'}
                stroke={step >= s ? '#9C27B0' : 'rgba(255,255,255,0.1)'}
                strokeWidth={step === s ? 2 : 1}
                style={{ transition: 'all 0.5s ease' }}
              />
              {step === s && (
                <circle cx={(s - 1) * 40} cy="0" r="10" fill="none" stroke="#9C27B0" strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" values="8;13;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <text
                x={(s - 1) * 40}
                y="18"
                textAnchor="middle"
                fill={step === s ? '#9C27B0' : 'rgba(255,255,255,0.3)'}
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
          C4 CHEMICAL REACTIONS
        </text>
      </svg>
    </div>
  );
}
