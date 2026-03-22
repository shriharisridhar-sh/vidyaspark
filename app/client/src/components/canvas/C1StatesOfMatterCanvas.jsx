import React, { useMemo } from 'react';

/**
 * C1.1 States of Matter — "Does Air Occupy Space?"
 *
 * Interactive SVG canvas showing the classic tissue-in-inverted-test-tube experiment.
 * Receives `currentStep` prop (1-4) and renders each stage with smooth transitions.
 *
 * Step 1: Materials laid out — test tube, tissue paper, water trough
 * Step 2: Tissue paper stuffed into bottom of test tube
 * Step 3: Test tube inverted mouth-down in water — air trapped, water stays out
 * Step 4: Paper removed — still dry! Air occupied the space.
 */

const TRANSITION = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
const FADE_TRANSITION = 'opacity 1.5s ease 0.3s';
const DELAYED_FADE = 'opacity 1.5s ease 0.8s';

export default function C1StatesOfMatterCanvas({ currentStep = 1 }) {
  const step = Math.max(1, Math.min(4, currentStep));

  const rippleId = useMemo(() => `ripple-${Math.random().toString(36).slice(2, 8)}`, []);

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
        {/* ===== DEFS: Gradients, Filters, Patterns ===== */}
        <defs>
          {/* Background gradient */}
          <radialGradient id="bgGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1a1520" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>

          {/* Table wood gradient */}
          <linearGradient id="tableGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B6914" />
            <stop offset="30%" stopColor="#7A5C12" />
            <stop offset="100%" stopColor="#5C4410" />
          </linearGradient>
          <linearGradient id="tableEdge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6B4E10" />
            <stop offset="100%" stopColor="#3D2E0A" />
          </linearGradient>

          {/* Glass test tube gradient */}
          <linearGradient id="glassBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(180,210,240,0.15)" />
            <stop offset="25%" stopColor="rgba(200,225,250,0.08)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="75%" stopColor="rgba(180,210,240,0.12)" />
            <stop offset="100%" stopColor="rgba(160,195,230,0.18)" />
          </linearGradient>

          {/* Glass reflection highlight */}
          <linearGradient id="glassHighlight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Water gradient */}
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E90FF" stopOpacity="0.7" />
            <stop offset="40%" stopColor="#1565C0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0D47A1" stopOpacity="0.9" />
          </linearGradient>

          {/* Water surface shimmer */}
          <linearGradient id="waterSurface" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(100,181,246,0.5)" />
            <stop offset="50%" stopColor="rgba(144,202,249,0.7)" />
            <stop offset="100%" stopColor="rgba(100,181,246,0.5)" />
          </linearGradient>

          {/* Tissue paper gradient */}
          <linearGradient id="tissueGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FAF0E6" />
            <stop offset="50%" stopColor="#F5E6D3" />
            <stop offset="100%" stopColor="#EDD8C0" />
          </linearGradient>

          {/* Sparkle glow */}
          <radialGradient id="sparkleGlow">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>

          {/* Air molecule gradient */}
          <radialGradient id="airMolecule">
            <stop offset="0%" stopColor="rgba(200,230,255,0.4)" />
            <stop offset="100%" stopColor="rgba(150,200,255,0.05)" />
          </radialGradient>

          {/* Trough gradient */}
          <linearGradient id="troughGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#546E7A" />
            <stop offset="100%" stopColor="#37474F" />
          </linearGradient>
          <linearGradient id="troughInner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#455A64" />
            <stop offset="100%" stopColor="#263238" />
          </linearGradient>

          {/* Soft shadow filter */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
          </filter>
          <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Water ripple pattern */}
          <pattern id={rippleId} x="0" y="0" width="80" height="12" patternUnits="userSpaceOnUse">
            <path
              d="M0 6 Q20 2 40 6 Q60 10 80 6"
              fill="none"
              stroke="rgba(144,202,249,0.3)"
              strokeWidth="1"
            >
              <animate
                attributeName="d"
                values="M0 6 Q20 2 40 6 Q60 10 80 6;M0 6 Q20 10 40 6 Q60 2 80 6;M0 6 Q20 2 40 6 Q60 10 80 6"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>
          </pattern>

          {/* Clip for water inside trough */}
          <clipPath id="troughClip">
            <rect x="200" y="340" width="400" height="140" rx="8" />
          </clipPath>
          <clipPath id="troughClipStep3">
            <rect x="250" y="250" width="300" height="230" rx="8" />
          </clipPath>
        </defs>

        {/* ===== BACKGROUND ===== */}
        <rect width="800" height="560" fill="url(#bgGlow)" />

        {/* Subtle grid lines for lab feel */}
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
          {step === 1 && 'STEP 1 — GATHER MATERIALS'}
          {step === 2 && 'STEP 2 — STUFF THE PAPER'}
          {step === 3 && 'STEP 3 — INVERT IN WATER'}
          {step === 4 && 'STEP 4 — OBSERVE THE RESULT'}
        </text>

        {/* ===== STEP 1 & 2: TABLE SCENE ===== */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step <= 2 ? 1 : 0,
            transform: step <= 2 ? 'translateY(0)' : 'translateY(-30px)',
          }}
        >
          {/* Wooden table surface */}
          <rect x="60" y="380" width="680" height="24" rx="4" fill="url(#tableGrad)" filter="url(#softShadow)" />
          <rect x="60" y="400" width="680" height="12" rx="2" fill="url(#tableEdge)" />
          {/* Wood grain lines */}
          <g opacity="0.15">
            <line x1="100" y1="386" x2="700" y2="386" stroke="#3D2E0A" strokeWidth="0.5" />
            <line x1="80" y1="392" x2="720" y2="391" stroke="#3D2E0A" strokeWidth="0.5" />
          </g>

          {/* ===== WATER TROUGH (on table) ===== */}
          <g>
            {/* Trough body */}
            <rect x="440" y="290" width="220" height="92" rx="10" fill="url(#troughGrad)" filter="url(#softShadow)" />
            <rect x="450" y="298" width="200" height="76" rx="6" fill="url(#troughInner)" />

            {/* Water fill */}
            <rect x="452" y="318" width="196" height="54" rx="4" fill="url(#waterGrad)" />
            {/* Water surface ripple */}
            <rect x="452" y="316" width="196" height="14" rx="2" fill={`url(#${rippleId})`} opacity="0.6" />
            {/* Surface highlight */}
            <rect x="452" y="316" width="196" height="3" rx="1" fill="url(#waterSurface)" opacity="0.5" />

            {/* Label */}
            <text x="550" y="284" textAnchor="middle" fill="#90CAF9" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.8">
              Water Trough
            </text>
          </g>

          {/* ===== TEST TUBE (upright on table, step 1) ===== */}
          <g
            style={{
              transition: TRANSITION,
              opacity: step === 1 ? 1 : 0,
              transform: step === 1 ? 'translateX(0)' : 'translateX(40px)',
            }}
          >
            {/* Test tube body */}
            <rect x="230" y="200" width="40" height="178" rx="3" fill="url(#glassBody)" stroke="rgba(180,210,240,0.3)" strokeWidth="1.5" />
            {/* Rounded bottom */}
            <ellipse cx="250" cy="378" rx="20" ry="8" fill="url(#glassBody)" stroke="rgba(180,210,240,0.3)" strokeWidth="1.5" />
            {/* Glass rim */}
            <ellipse cx="250" cy="200" rx="22" ry="5" fill="none" stroke="rgba(200,225,250,0.4)" strokeWidth="2" />
            {/* Reflection stripe */}
            <rect x="240" y="210" width="4" height="155" rx="2" fill="url(#glassHighlight)" opacity="0.5" />
            {/* Label */}
            <text x="250" y="190" textAnchor="middle" fill="#B0BEC5" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.8">
              Glass Test Tube
            </text>
          </g>

          {/* ===== TISSUE PAPER (on table, step 1) ===== */}
          <g
            style={{
              transition: TRANSITION,
              opacity: step === 1 ? 1 : 0,
            }}
          >
            {/* Crumpled tissue paper */}
            <g transform="translate(130, 340)">
              <ellipse cx="30" cy="20" rx="32" ry="22" fill="url(#tissueGrad)" filter="url(#softShadow)" />
              {/* Crumple folds */}
              <path d="M10 15 Q20 8 30 18 Q40 10 50 16" fill="none" stroke="#D4C4B0" strokeWidth="0.8" />
              <path d="M15 25 Q25 20 35 28 Q42 22 48 26" fill="none" stroke="#D4C4B0" strokeWidth="0.6" />
              <path d="M20 12 Q28 6 36 14" fill="none" stroke="#E0D0BC" strokeWidth="0.5" />
            </g>
            <text x="160" y="330" textAnchor="middle" fill="#D7CCC8" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.8">
              Tissue Paper
            </text>
          </g>

          {/* ===== TEST TUBE WITH PAPER STUFFED (step 2) ===== */}
          <g
            style={{
              transition: TRANSITION,
              opacity: step === 2 ? 1 : 0,
              transform: step === 2 ? 'scale(1)' : 'scale(0.9)',
              transformOrigin: '300px 300px',
            }}
          >
            {/* Enlarged close-up test tube */}
            <rect x="260" y="160" width="80" height="218" rx="5" fill="url(#glassBody)" stroke="rgba(180,210,240,0.3)" strokeWidth="2" />
            {/* Rounded bottom */}
            <ellipse cx="300" cy="376" rx="40" ry="10" fill="url(#glassBody)" stroke="rgba(180,210,240,0.3)" strokeWidth="2" />
            {/* Glass rim */}
            <ellipse cx="300" cy="160" rx="42" ry="8" fill="none" stroke="rgba(200,225,250,0.45)" strokeWidth="2.5" />
            {/* Reflection stripe */}
            <rect x="278" y="172" width="6" height="190" rx="3" fill="url(#glassHighlight)" opacity="0.45" />

            {/* Tissue paper stuffed at bottom */}
            <g>
              <ellipse cx="300" cy="355" rx="34" ry="18" fill="url(#tissueGrad)" />
              <ellipse cx="300" cy="340" rx="30" ry="14" fill="#F5E6D3" />
              <ellipse cx="300" cy="328" rx="26" ry="10" fill="#FAF0E6" opacity="0.7" />
              {/* Crumple details */}
              <path d="M275 348 Q290 340 300 350 Q310 342 325 348" fill="none" stroke="#D4C4B0" strokeWidth="1" />
              <path d="M280 338 Q295 332 310 340" fill="none" stroke="#D4C4B0" strokeWidth="0.8" />
            </g>

            {/* Arrow showing stuffing direction */}
            <g opacity="0.7">
              <line x1="300" y1="260" x2="300" y2="310" stroke="#E65100" strokeWidth="2" markerEnd="url(#arrowEnd)" />
              <polygon points="293,308 300,322 307,308" fill="#E65100" />
            </g>

            {/* Annotation */}
            <text x="390" y="340" fill="#FFB74D" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500"
              style={{ transition: DELAYED_FADE, opacity: step === 2 ? 0.9 : 0 }}>
              Paper wedged tightly
            </text>
            <text x="390" y="356" fill="#FFB74D" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400"
              style={{ transition: DELAYED_FADE, opacity: step === 2 ? 0.7 : 0 }}>
              at the bottom
            </text>
            <line x1="340" y1="348" x2="385" y2="348" stroke="#FFB74D" strokeWidth="1" strokeDasharray="4 3"
              style={{ transition: DELAYED_FADE, opacity: step === 2 ? 0.5 : 0 }} />
          </g>
        </g>

        {/* ===== STEP 3: INVERTED IN WATER ===== */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 3 ? 1 : 0,
            transform: step === 3 ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          {/* Large water trough — central */}
          <rect x="200" y="320" width="400" height="180" rx="12" fill="url(#troughGrad)" filter="url(#softShadow)" />
          <rect x="212" y="330" width="376" height="160" rx="8" fill="url(#troughInner)" />

          {/* Water body */}
          <rect x="214" y="360" width="372" height="128" rx="6" fill="url(#waterGrad)" />
          {/* Water surface */}
          <rect x="214" y="356" width="372" height="16" rx="3" fill={`url(#${rippleId})`} opacity="0.7" />
          <rect x="214" y="356" width="372" height="4" rx="2" fill="url(#waterSurface)" opacity="0.5" />

          {/* Water surface label */}
          <text x="560" y="352" fill="#64B5F6" fontSize="10"
            fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.6">
            water level
          </text>
          <line x1="490" y1="358" x2="555" y2="352" stroke="#64B5F6" strokeWidth="0.5" opacity="0.4" />

          {/* Inverted test tube submerged */}
          <g>
            {/* Test tube body — inverted (mouth down) */}
            <rect x="370" y="220" width="60" height="240" rx="4" fill="url(#glassBody)" stroke="rgba(180,210,240,0.3)" strokeWidth="2" />
            {/* Open mouth at bottom (submerged) */}
            <ellipse cx="400" cy="460" rx="30" ry="6" fill="none" stroke="rgba(180,210,240,0.25)" strokeWidth="1.5" />
            {/* Closed top (rounded) */}
            <ellipse cx="400" cy="222" rx="30" ry="10" fill="url(#glassBody)" stroke="rgba(180,210,240,0.3)" strokeWidth="2" />
            {/* Reflection */}
            <rect x="382" y="230" width="5" height="210" rx="2.5" fill="url(#glassHighlight)" opacity="0.4" />

            {/* Tissue paper at closed top */}
            <ellipse cx="400" cy="240" rx="24" ry="14" fill="url(#tissueGrad)" opacity="0.9" />
            <ellipse cx="400" cy="233" rx="20" ry="10" fill="#F5E6D3" opacity="0.8" />
            <path d="M382 238 Q392 232 400 240 Q408 234 418 238" fill="none" stroke="#D4C4B0" strokeWidth="0.8" />

            {/* Air space inside tube (above water line) — slightly lighter area */}
            <rect x="372" y="260" width="56" height="96" fill="rgba(200,230,255,0.04)" rx="2" />

            {/* Air molecules */}
            {[
              { cx: 390, cy: 280, r: 5 },
              { cx: 410, cy: 295, r: 4 },
              { cx: 395, cy: 310, r: 3.5 },
              { cx: 415, cy: 275, r: 3 },
              { cx: 385, cy: 330, r: 4.5 },
              { cx: 408, cy: 320, r: 3 },
              { cx: 398, cy: 345, r: 4 },
              { cx: 416, cy: 340, r: 3.5 },
            ].map((mol, i) => (
              <circle key={`air3-${i}`} cx={mol.cx} cy={mol.cy} r={mol.r} fill="url(#airMolecule)" stroke="rgba(180,215,255,0.25)" strokeWidth="0.5">
                <animate
                  attributeName="cy"
                  values={`${mol.cy};${mol.cy - 3};${mol.cy + 2};${mol.cy}`}
                  dur={`${2.5 + i * 0.3}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.7;1;0.6;0.7"
                  dur={`${2 + i * 0.2}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}

            {/* Water line inside tube is LOWER than outside — air pushes it down */}
            {/* Inside-tube water starts at ~358, showing displacement */}
            <rect x="372" y="380" width="56" height="78" rx="2" fill="rgba(30,144,255,0.3)" />

            {/* Air pocket boundary line */}
            <line x1="372" y1="358" x2="428" y2="358" stroke="rgba(144,202,249,0.4)" strokeWidth="1" strokeDasharray="3 3" />
          </g>

          {/* Annotation: Air trapped */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 3 ? 1 : 0 }}>
            <line x1="432" y1="300" x2="490" y2="280" stroke="#81D4FA" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
            <text x="495" y="275" fill="#81D4FA" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Trapped air
            </text>
            <text x="495" y="291" fill="#81D4FA" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              prevents water entry
            </text>
          </g>

          {/* Annotation: Water cannot enter */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 3 ? 1 : 0 }}>
            <line x1="370" y1="420" x2="280" y2="430" stroke="#EF9A9A" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            <text x="200" y="428" fill="#EF9A9A" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Water stays out!
            </text>
          </g>

          {/* Annotation: Paper stays dry */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 3 ? 1 : 0 }}>
            <line x1="400" y1="220" x2="320" y2="200" stroke="#FFB74D" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            <text x="230" y="196" fill="#FFB74D" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Paper stays dry at top
            </text>
          </g>
        </g>

        {/* ===== STEP 4: REVEAL — PAPER IS DRY ===== */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 4 ? 1 : 0,
            transform: step === 4 ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          {/* Test tube on left — pulled out, upright */}
          <g>
            <rect x="160" y="180" width="60" height="200" rx="4" fill="url(#glassBody)" stroke="rgba(180,210,240,0.3)" strokeWidth="2" />
            <ellipse cx="190" cy="378" rx="30" ry="10" fill="url(#glassBody)" stroke="rgba(180,210,240,0.3)" strokeWidth="2" />
            <ellipse cx="190" cy="182" rx="32" ry="7" fill="none" stroke="rgba(200,225,250,0.4)" strokeWidth="2" />
            <rect x="178" y="192" width="5" height="175" rx="2.5" fill="url(#glassHighlight)" opacity="0.4" />

            {/* Air molecules still visible inside */}
            {[
              { cx: 182, cy: 220, r: 4 },
              { cx: 198, cy: 250, r: 3.5 },
              { cx: 185, cy: 280, r: 3 },
              { cx: 200, cy: 310, r: 4 },
              { cx: 188, cy: 340, r: 3.5 },
              { cx: 196, cy: 360, r: 3 },
            ].map((mol, i) => (
              <circle key={`air4-${i}`} cx={mol.cx} cy={mol.cy} r={mol.r} fill="url(#airMolecule)" stroke="rgba(180,215,255,0.2)" strokeWidth="0.5">
                <animate
                  attributeName="cy"
                  values={`${mol.cy};${mol.cy - 2};${mol.cy + 2};${mol.cy}`}
                  dur={`${2 + i * 0.4}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}

            {/* Label: Air molecules */}
            <text x="190" y="165" textAnchor="middle" fill="#81D4FA" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.7"
              style={{ transition: DELAYED_FADE, opacity: step === 4 ? 0.8 : 0 }}>
              Air molecules
            </text>
          </g>

          {/* Tissue paper — removed and displayed */}
          <g transform="translate(350, 260)">
            {/* Paper */}
            <ellipse cx="60" cy="40" rx="55" ry="35" fill="url(#tissueGrad)" filter="url(#softShadow)" />
            <ellipse cx="60" cy="32" rx="45" ry="25" fill="#FAF0E6" opacity="0.8" />
            <path d="M25 35 Q40 25 60 38 Q78 27 95 35" fill="none" stroke="#D4C4B0" strokeWidth="1" />
            <path d="M30 45 Q50 38 70 47 Q85 40 90 45" fill="none" stroke="#D4C4B0" strokeWidth="0.7" />

            {/* DRY label with emphasis */}
            <text x="60" y="95" textAnchor="middle" fill="#4CAF50" fontSize="22"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="800" letterSpacing="3"
              style={{ transition: DELAYED_FADE, opacity: step === 4 ? 1 : 0 }}>
              STILL DRY!
            </text>

            {/* Checkmark */}
            <g style={{ transition: 'opacity 1.5s ease 1.2s', opacity: step === 4 ? 1 : 0 }}>
              <circle cx="60" cy="120" r="14" fill="none" stroke="#4CAF50" strokeWidth="2" />
              <polyline points="51,120 57,126 70,113" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>

          {/* Sparkle effects */}
          {[
            { x: 320, y: 240 },
            { x: 450, y: 270 },
            { x: 380, y: 220 },
            { x: 440, y: 310 },
            { x: 350, y: 330 },
          ].map((sp, i) => (
            <g key={`sp-${i}`} style={{ transition: `opacity 1.5s ease ${1 + i * 0.15}s`, opacity: step === 4 ? 1 : 0 }}>
              <circle cx={sp.x} cy={sp.y} r="6" fill="url(#sparkleGlow)">
                <animate
                  attributeName="r"
                  values="3;7;3"
                  dur={`${1.5 + i * 0.2}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.8;0.3;0.8"
                  dur={`${1.5 + i * 0.2}s`}
                  repeatCount="indefinite"
                />
              </circle>
              {/* Star sparkle */}
              <line x1={sp.x - 4} y1={sp.y} x2={sp.x + 4} y2={sp.y} stroke="#FFD700" strokeWidth="1" opacity="0.6">
                <animate attributeName="opacity" values="0.6;0.2;0.6" dur={`${1.2 + i * 0.3}s`} repeatCount="indefinite" />
              </line>
              <line x1={sp.x} y1={sp.y - 4} x2={sp.x} y2={sp.y + 4} stroke="#FFD700" strokeWidth="1" opacity="0.6">
                <animate attributeName="opacity" values="0.6;0.2;0.6" dur={`${1.2 + i * 0.3}s`} repeatCount="indefinite" />
              </line>
            </g>
          ))}

          {/* Main conclusion box */}
          <g style={{ transition: 'opacity 1.5s ease 1s', opacity: step === 4 ? 1 : 0 }}>
            <rect x="230" y="400" width="340" height="70" rx="12" fill="rgba(230,81,0,0.12)" stroke="#E65100" strokeWidth="1.5" />
            <text x="400" y="428" textAnchor="middle" fill="#FF8A65" fontSize="15"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              Air occupied the space
            </text>
            <text x="400" y="450" textAnchor="middle" fill="#FFAB91" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              inside the test tube, keeping the water out
            </text>
            <text x="400" y="464" textAnchor="middle" fill="#FFAB91" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              and the paper completely dry.
            </text>
          </g>

          {/* Air molecule diagram annotation */}
          <g style={{ transition: 'opacity 1.5s ease 1.3s', opacity: step === 4 ? 1 : 0 }}>
            <rect x="530" y="170" width="210" height="120" rx="10" fill="rgba(30,30,40,0.8)" stroke="rgba(129,212,250,0.3)" strokeWidth="1" />
            <text x="635" y="195" textAnchor="middle" fill="#81D4FA" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="1">
              WHY IT WORKS
            </text>
            <text x="635" y="215" textAnchor="middle" fill="#B0BEC5" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Air is matter. It has mass
            </text>
            <text x="635" y="230" textAnchor="middle" fill="#B0BEC5" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              and occupies space. The trapped
            </text>
            <text x="635" y="245" textAnchor="middle" fill="#B0BEC5" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              air inside the tube prevents
            </text>
            <text x="635" y="260" textAnchor="middle" fill="#B0BEC5" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              water from entering.
            </text>
            {/* Mini air molecule icons */}
            {[570, 595, 620, 645, 670, 695].map((mx, i) => (
              <circle key={`mini-${i}`} cx={mx} cy="278" r="4" fill="url(#airMolecule)" stroke="rgba(180,215,255,0.3)" strokeWidth="0.5">
                <animate attributeName="opacity" values="0.5;1;0.5" dur={`${1 + i * 0.15}s`} repeatCount="indefinite" />
              </circle>
            ))}
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
                fill={step === s ? '#E65100' : 'rgba(255,255,255,0.15)'}
                stroke={step >= s ? '#E65100' : 'rgba(255,255,255,0.1)'}
                strokeWidth={step === s ? 2 : 1}
                style={{ transition: 'all 0.5s ease' }}
              />
              {step === s && (
                <circle cx={(s - 1) * 40} cy="0" r="10" fill="none" stroke="#E65100" strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" values="8;13;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <text
                x={(s - 1) * 40}
                y="18"
                textAnchor="middle"
                fill={step === s ? '#E65100' : 'rgba(255,255,255,0.3)'}
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
          C1.1 STATES OF MATTER
        </text>
      </svg>
    </div>
  );
}
