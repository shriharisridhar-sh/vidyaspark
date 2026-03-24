import React, { useMemo } from 'react';

/**
 * C3 Acids & Bases — "Testing with Litmus Paper"
 *
 * Interactive SVG canvas showing litmus paper testing of household substances.
 * Receives `currentStep` prop (1-4) and renders each stage with smooth transitions.
 *
 * Step 1: Setup — Test tubes with substances + litmus paper strips
 * Step 2: Testing with Litmus — Dropper places solution on litmus, colour changes
 * Step 3: Comparing All Results — Observation sheet with all five substances
 * Step 4: Classification Chart — Acids, Bases, and Neutral categories
 */

const TRANSITION = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
const FADE_TRANSITION = 'opacity 1.5s ease 0.3s';
const DELAYED_FADE = 'opacity 1.5s ease 0.8s';

/* Chemistry purple palette */
const PURPLE = '#9C27B0';
const PURPLE_LIGHT = '#CE93D8';
const PURPLE_DARK = '#6A1B9A';
const PURPLE_GLOW = 'rgba(156,39,176,0.15)';
const ACID_RED = '#EF5350';
const BASE_BLUE = '#42A5F5';
const NEUTRAL_GREY = '#9E9E9E';

export default function C3AcidsBasesCanvas({ currentStep = 1 }) {
  const step = Math.max(1, Math.min(4, currentStep));

  const bubbleId = useMemo(() => `bubble-${Math.random().toString(36).slice(2, 8)}`, []);

  /* Substance data used across steps */
  const substances = [
    { name: 'Lemon\nJuice', shortName: 'Lemon', fill: '#FFF176', fillDark: '#F9A825', type: 'acid', litmusResult: 'red' },
    { name: 'Vinegar', shortName: 'Vinegar', fill: '#FFECB3', fillDark: '#FFB300', type: 'acid', litmusResult: 'red' },
    { name: 'Sugar\nSolution', shortName: 'Sugar', fill: '#F5F5F5', fillDark: '#E0E0E0', type: 'neutral', litmusResult: 'none' },
    { name: 'Salt\nSolution', shortName: 'Salt', fill: '#ECEFF1', fillDark: '#CFD8DC', type: 'neutral', litmusResult: 'none' },
    { name: 'Baking\nSoda', shortName: 'Baking Soda', fill: '#E0E0E0', fillDark: '#BDBDBD', type: 'base', litmusResult: 'blue' },
  ];

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
          <radialGradient id="bgGlowC3" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1a1025" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>

          {/* Table */}
          <linearGradient id="tableGradC3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B6914" />
            <stop offset="30%" stopColor="#7A5C12" />
            <stop offset="100%" stopColor="#5C4410" />
          </linearGradient>
          <linearGradient id="tableEdgeC3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6B4E10" />
            <stop offset="100%" stopColor="#3D2E0A" />
          </linearGradient>

          {/* Test tube glass */}
          <linearGradient id="glassC3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(180,210,240,0.18)" />
            <stop offset="30%" stopColor="rgba(200,225,250,0.06)" />
            <stop offset="70%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(180,210,240,0.18)" />
          </linearGradient>
          <linearGradient id="glassHighC3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Litmus red base */}
          <linearGradient id="litmusRedC3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF5350" />
            <stop offset="100%" stopColor="#C62828" />
          </linearGradient>
          {/* Litmus blue base */}
          <linearGradient id="litmusBlueC3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#42A5F5" />
            <stop offset="100%" stopColor="#1565C0" />
          </linearGradient>

          {/* Purple accent glow */}
          <radialGradient id="purpleGlowC3">
            <stop offset="0%" stopColor={PURPLE} stopOpacity="0.6" />
            <stop offset="100%" stopColor={PURPLE} stopOpacity="0" />
          </radialGradient>

          {/* Sparkle */}
          <radialGradient id="sparkleC3">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>

          {/* Filters */}
          <filter id="softShadowC3" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
          </filter>
          <filter id="glowC3" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Bubble pattern for liquids */}
          <pattern id={bubbleId} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="8" cy="10" r="1.5" fill="rgba(255,255,255,0.15)">
              <animate attributeName="cy" values="10;6;10" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="20" cy="22" r="1" fill="rgba(255,255,255,0.1)">
              <animate attributeName="cy" values="22;18;22" dur="2.5s" repeatCount="indefinite" />
            </circle>
          </pattern>
        </defs>

        {/* ===== BACKGROUND ===== */}
        <rect width="800" height="560" fill="url(#bgGlowC3)" />
        {/* Lab grid */}
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
          fill={PURPLE_LIGHT}
          fontSize="14"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="600"
          letterSpacing="2"
          style={{ transition: FADE_TRANSITION }}
        >
          {step === 1 && 'STEP 1 — SUBSTANCES AND LITMUS PAPER'}
          {step === 2 && 'STEP 2 — TESTING WITH LITMUS'}
          {step === 3 && 'STEP 3 — COMPARING ALL RESULTS'}
          {step === 4 && 'STEP 4 — ACIDS, BASES AND NEUTRAL'}
        </text>

        {/* ================================================================ */}
        {/* STEP 1: Setup — Five test tubes with substances + litmus strips  */}
        {/* ================================================================ */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 1 ? 1 : 0,
            transform: step === 1 ? 'translateY(0)' : 'translateY(-30px)',
          }}
        >
          {/* Table */}
          <rect x="40" y="410" width="720" height="22" rx="4" fill="url(#tableGradC3)" filter="url(#softShadowC3)" />
          <rect x="40" y="428" width="720" height="10" rx="2" fill="url(#tableEdgeC3)" />
          <g opacity="0.15">
            <line x1="60" y1="416" x2="740" y2="416" stroke="#3D2E0A" strokeWidth="0.5" />
            <line x1="50" y1="422" x2="750" y2="422" stroke="#3D2E0A" strokeWidth="0.5" />
          </g>

          {/* Five test tubes with liquids */}
          {substances.map((sub, i) => {
            const cx = 120 + i * 140;
            const tubeW = 36;
            const tubeH = 130;
            const tubeX = cx - tubeW / 2;
            const tubeY = 410 - tubeH;
            const liquidH = 70;
            const liquidY = tubeY + tubeH - liquidH - 6;
            return (
              <g key={`tube1-${i}`}>
                {/* Tube body */}
                <rect x={tubeX} y={tubeY} width={tubeW} height={tubeH} rx="3"
                  fill="url(#glassC3)" stroke="rgba(180,210,240,0.3)" strokeWidth="1.2" />
                {/* Rounded bottom */}
                <ellipse cx={cx} cy={tubeY + tubeH} rx={tubeW / 2} ry="6"
                  fill="url(#glassC3)" stroke="rgba(180,210,240,0.3)" strokeWidth="1.2" />
                {/* Rim */}
                <ellipse cx={cx} cy={tubeY} rx={tubeW / 2 + 2} ry="4"
                  fill="none" stroke="rgba(200,225,250,0.4)" strokeWidth="1.8" />
                {/* Reflection */}
                <rect x={tubeX + 4} y={tubeY + 8} width="3" height={tubeH - 20} rx="1.5"
                  fill="url(#glassHighC3)" opacity="0.5" />
                {/* Liquid */}
                <rect x={tubeX + 3} y={liquidY} width={tubeW - 6} height={liquidH} rx="2"
                  fill={sub.fill} opacity="0.7" />
                <rect x={tubeX + 3} y={liquidY} width={tubeW - 6} height={liquidH} rx="2"
                  fill={`url(#${bubbleId})`} opacity="0.4" />
                {/* Liquid surface highlight */}
                <rect x={tubeX + 3} y={liquidY} width={tubeW - 6} height="3" rx="1"
                  fill="rgba(255,255,255,0.3)" />
                {/* Label */}
                {sub.name.split('\n').map((line, li) => (
                  <text key={`lbl${i}-${li}`} x={cx} y={tubeY - 14 + li * 13} textAnchor="middle"
                    fill="#B0BEC5" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.85">
                    {line}
                  </text>
                ))}
              </g>
            );
          })}

          {/* Litmus paper strips at right */}
          <g transform="translate(640, 290)">
            {/* Red litmus strip */}
            <rect x="0" y="0" width="14" height="80" rx="2" fill="url(#litmusRedC3)" filter="url(#softShadowC3)" />
            <text x="7" y="95" textAnchor="middle" fill={ACID_RED} fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.8">Red</text>
            {/* Blue litmus strip */}
            <rect x="30" y="0" width="14" height="80" rx="2" fill="url(#litmusBlueC3)" filter="url(#softShadowC3)" />
            <text x="37" y="95" textAnchor="middle" fill={BASE_BLUE} fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.8">Blue</text>
            {/* Label */}
            <text x="22" y="-12" textAnchor="middle" fill={PURPLE_LIGHT} fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" opacity="0.9">Litmus Paper</text>
          </g>

          {/* Dropper */}
          <g transform="translate(580, 300)">
            {/* Rubber bulb */}
            <ellipse cx="12" cy="0" rx="10" ry="14" fill="#546E7A" />
            {/* Glass tube */}
            <rect x="8" y="14" width="8" height="50" rx="2" fill="url(#glassC3)" stroke="rgba(180,210,240,0.3)" strokeWidth="1" />
            {/* Tip */}
            <polygon points="10,64 14,74 12,64" fill="rgba(180,210,240,0.2)" stroke="rgba(180,210,240,0.3)" strokeWidth="0.8" />
            <text x="12" y="88" textAnchor="middle" fill="#B0BEC5" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.7">Dropper</text>
          </g>

          {/* Observation sheet hint */}
          <g transform="translate(580, 410)" opacity="0.6">
            <rect x="-40" y="-25" width="80" height="25" rx="3" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
            <text x="0" y="-9" textAnchor="middle" fill="#B0BEC5" fontSize="8"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">Observation Sheet</text>
          </g>
        </g>

        {/* ================================================================ */}
        {/* STEP 2: Testing — Dropper on litmus, colour changes animate      */}
        {/* ================================================================ */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 2 ? 1 : 0,
            transform: step === 2 ? 'scale(1)' : 'scale(0.92)',
            transformOrigin: '400px 300px',
          }}
        >
          {/* Central enlarged test tube with lemon juice */}
          <g transform="translate(140, 100)">
            {/* Tube */}
            <rect x="0" y="0" width="60" height="200" rx="5"
              fill="url(#glassC3)" stroke="rgba(180,210,240,0.3)" strokeWidth="2" />
            <ellipse cx="30" cy="198" rx="30" ry="8"
              fill="url(#glassC3)" stroke="rgba(180,210,240,0.3)" strokeWidth="2" />
            <ellipse cx="30" cy="2" rx="32" ry="6"
              fill="none" stroke="rgba(200,225,250,0.4)" strokeWidth="2" />
            <rect x="8" y="12" width="4" height="170" rx="2" fill="url(#glassHighC3)" opacity="0.4" />
            {/* Lemon juice liquid */}
            <rect x="4" y="120" width="52" height="76" rx="3" fill="#FFF176" opacity="0.65" />
            <rect x="4" y="120" width="52" height="76" rx="3" fill={`url(#${bubbleId})`} opacity="0.3" />
            <rect x="4" y="120" width="52" height="3" rx="1" fill="rgba(255,255,255,0.35)" />
            <text x="30" y="-12" textAnchor="middle" fill="#FFF176" fontSize="13"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">Lemon Juice</text>
          </g>

          {/* Dropper in action */}
          <g transform="translate(260, 60)">
            <ellipse cx="12" cy="0" rx="12" ry="16" fill="#546E7A" />
            <rect x="6" y="16" width="12" height="60" rx="3" fill="url(#glassC3)" stroke="rgba(180,210,240,0.3)" strokeWidth="1.2" />
            <polygon points="8,76 16,90 12,76" fill="rgba(180,210,240,0.2)" stroke="rgba(180,210,240,0.3)" strokeWidth="0.8" />
            {/* Drop falling */}
            <ellipse cx="12" cy="100" rx="4" ry="6" fill="#FFF176" opacity="0.8">
              <animate attributeName="cy" values="95;115;95" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite" />
            </ellipse>
            {/* Drop trail */}
            <line x1="12" y1="90" x2="12" y2="105" stroke="#FFF176" strokeWidth="1.5" opacity="0.3">
              <animate attributeName="y2" values="100;118;100" dur="2s" repeatCount="indefinite" />
            </line>
          </g>

          {/* Blue litmus paper — turns RED (acid) */}
          <g transform="translate(310, 130)">
            <rect x="0" y="0" width="24" height="120" rx="3" fill="url(#litmusBlueC3)" />
            {/* Colour change zone — top portion turns red */}
            <rect x="0" y="0" width="24" height="50" rx="3" fill={ACID_RED} opacity="0.9">
              <animate attributeName="opacity" values="0;0.9" dur="2s" fill="freeze" />
            </rect>
            {/* Transition gradient zone */}
            <rect x="0" y="45" width="24" height="15" rx="0"
              fill={ACID_RED} opacity="0.4">
              <animate attributeName="opacity" values="0;0.4" dur="2.5s" fill="freeze" />
            </rect>
            <text x="12" y="140" textAnchor="middle" fill={BASE_BLUE} fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.8">Blue Litmus</text>
            {/* Annotation */}
            <g style={{ transition: DELAYED_FADE, opacity: step === 2 ? 1 : 0 }}>
              <line x1="28" y1="25" x2="80" y2="15" stroke={ACID_RED} strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
              <text x="85" y="12" fill={ACID_RED} fontSize="12"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                Turns RED!
              </text>
              <text x="85" y="27" fill={ACID_RED} fontSize="10"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
                Acid detected
              </text>
            </g>
          </g>

          {/* Red litmus paper — stays RED (no change for acid) */}
          <g transform="translate(310, 300)">
            <rect x="0" y="0" width="24" height="120" rx="3" fill="url(#litmusRedC3)" />
            <text x="12" y="140" textAnchor="middle" fill={ACID_RED} fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.8">Red Litmus</text>
            {/* Annotation */}
            <g style={{ transition: DELAYED_FADE, opacity: step === 2 ? 1 : 0 }}>
              <line x1="28" y1="40" x2="80" y2="40" stroke="#9E9E9E" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
              <text x="85" y="38" fill="#9E9E9E" fontSize="12"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                No change
              </text>
              <text x="85" y="53" fill="#9E9E9E" fontSize="10"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
                Stays the same
              </text>
            </g>
          </g>

          {/* Side info box — BRA rule */}
          <g style={{ transition: 'opacity 1.5s ease 1s', opacity: step === 2 ? 1 : 0 }}>
            <rect x="520" y="120" width="230" height="130" rx="10" fill="rgba(30,20,40,0.85)"
              stroke={PURPLE_LIGHT} strokeWidth="1" opacity="0.9" />
            <text x="635" y="150" textAnchor="middle" fill={PURPLE_LIGHT} fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              REMEMBER
            </text>
            <text x="635" y="175" textAnchor="middle" fill={ACID_RED} fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Blue litmus + Acid = Red
            </text>
            <text x="635" y="195" textAnchor="middle" fill="#B0BEC5" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              (B.R.A. — Blue turns Red for Acids)
            </text>
            <text x="635" y="220" textAnchor="middle" fill={BASE_BLUE} fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Red litmus + Base = Blue
            </text>
            <text x="635" y="240" textAnchor="middle" fill="#B0BEC5" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              (R.B.B. — Red turns Blue for Bases)
            </text>
          </g>

          {/* Baking soda small demo — bottom right */}
          <g style={{ transition: 'opacity 1.5s ease 1.2s', opacity: step === 2 ? 1 : 0 }}
            transform="translate(540, 310)">
            {/* Small tube */}
            <rect x="0" y="0" width="30" height="80" rx="3"
              fill="url(#glassC3)" stroke="rgba(180,210,240,0.2)" strokeWidth="1" />
            <rect x="3" y="40" width="24" height="36" rx="2" fill="#E0E0E0" opacity="0.5" />
            <text x="15" y="-6" textAnchor="middle" fill="#B0BEC5" fontSize="8"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">Baking Soda</text>
            {/* Red litmus turning blue */}
            <rect x="40" y="5" width="14" height="60" rx="2" fill="url(#litmusRedC3)" />
            <rect x="40" y="5" width="14" height="30" rx="2" fill={BASE_BLUE} opacity="0.85">
              <animate attributeName="opacity" values="0;0.85" dur="2.5s" fill="freeze" />
            </rect>
            <text x="47" y="80" textAnchor="middle" fill={BASE_BLUE} fontSize="8"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Turns Blue!
            </text>
          </g>
        </g>

        {/* ================================================================ */}
        {/* STEP 3: Comparing Results — Observation sheet grid               */}
        {/* ================================================================ */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 3 ? 1 : 0,
            transform: step === 3 ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          {/* Observation sheet background */}
          <rect x="80" y="55" width="640" height="420" rx="12" fill="rgba(40,30,50,0.9)"
            stroke={PURPLE_DARK} strokeWidth="1.5" filter="url(#softShadowC3)" />
          <text x="400" y="85" textAnchor="middle" fill={PURPLE_LIGHT} fontSize="14"
            fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="2">
            OBSERVATION SHEET
          </text>

          {/* Column headers */}
          {['Substance', 'Red Litmus', 'Blue Litmus', 'Type'].map((h, i) => {
            const hx = 160 + i * 150;
            return (
              <text key={`hdr${i}`} x={hx} y="115" textAnchor="middle"
                fill="rgba(255,255,255,0.6)" fontSize="10"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="1">
                {h.toUpperCase()}
              </text>
            );
          })}
          <line x1="100" y1="125" x2="700" y2="125" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Result rows */}
          {substances.map((sub, i) => {
            const ry = 155 + i * 60;
            const redResult = sub.type === 'base' ? 'BLUE' : 'No change';
            const blueResult = sub.type === 'acid' ? 'RED' : 'No change';
            const redResultColor = sub.type === 'base' ? BASE_BLUE : 'rgba(255,255,255,0.4)';
            const blueResultColor = sub.type === 'acid' ? ACID_RED : 'rgba(255,255,255,0.4)';
            const typeColor = sub.type === 'acid' ? ACID_RED : sub.type === 'base' ? BASE_BLUE : NEUTRAL_GREY;
            const typeLabel = sub.type.charAt(0).toUpperCase() + sub.type.slice(1);

            return (
              <g key={`row${i}`}
                style={{ transition: `opacity 1.5s ease ${0.3 + i * 0.2}s`, opacity: step === 3 ? 1 : 0 }}>
                {/* Row bg */}
                <rect x="100" y={ry - 18} width="600" height="48" rx="6"
                  fill={i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)'} />

                {/* Substance name + mini colour swatch */}
                <circle cx="130" cy={ry + 4} r="8" fill={sub.fill} opacity="0.6" />
                <text x="160" y={ry + 8} fill="#E0E0E0" fontSize="12"
                  fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                  {sub.shortName}
                </text>

                {/* Red litmus result */}
                <text x="310" y={ry + 8} textAnchor="middle" fill={redResultColor} fontSize="12"
                  fontFamily="'Inter', system-ui, sans-serif" fontWeight={sub.type === 'base' ? '700' : '400'}>
                  {redResult}
                </text>
                {/* Mini litmus strip indicator */}
                <rect x="338" y={ry - 6} width="6" height="20" rx="1"
                  fill={sub.type === 'base' ? BASE_BLUE : ACID_RED} opacity="0.5" />

                {/* Blue litmus result */}
                <text x="460" y={ry + 8} textAnchor="middle" fill={blueResultColor} fontSize="12"
                  fontFamily="'Inter', system-ui, sans-serif" fontWeight={sub.type === 'acid' ? '700' : '400'}>
                  {blueResult}
                </text>
                <rect x="488" y={ry - 6} width="6" height="20" rx="1"
                  fill={sub.type === 'acid' ? ACID_RED : BASE_BLUE} opacity="0.5" />

                {/* Type badge */}
                <rect x={610 - 30} y={ry - 10} width="60" height="24" rx="12"
                  fill={typeColor} opacity="0.15" stroke={typeColor} strokeWidth="1" />
                <text x="610" y={ry + 6} textAnchor="middle" fill={typeColor} fontSize="11"
                  fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                  {typeLabel}
                </text>
              </g>
            );
          })}

          {/* Summary note */}
          <g style={{ transition: 'opacity 1.5s ease 1.5s', opacity: step === 3 ? 1 : 0 }}>
            <text x="400" y="460" textAnchor="middle" fill={PURPLE_LIGHT} fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.7">
              Litmus paper is an INDICATOR — it indicates whether a substance is acidic or basic
            </text>
          </g>
        </g>

        {/* ================================================================ */}
        {/* STEP 4: Classification Chart — three category columns            */}
        {/* ================================================================ */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 4 ? 1 : 0,
            transform: step === 4 ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          {/* Three category columns */}
          {[
            {
              label: 'ACIDS', color: ACID_RED, x: 130, items: ['Lemon Juice', 'Vinegar'],
              trait: 'Sour taste', litmus: 'Blue litmus turns Red',
              icon: (
                <g>
                  {/* Lemon icon */}
                  <ellipse cx="0" cy="0" rx="16" ry="12" fill="#FFF176" opacity="0.8" />
                  <path d="M-12 0 Q-16 -4 -14 0 Q-16 4 -12 0" fill="#F9A825" opacity="0.6" />
                </g>
              ),
            },
            {
              label: 'BASES', color: BASE_BLUE, x: 400, items: ['Baking Soda'],
              trait: 'Bitter taste', litmus: 'Red litmus turns Blue',
              icon: (
                <g>
                  {/* Baking soda box */}
                  <rect x="-12" y="-10" width="24" height="20" rx="3" fill="#E0E0E0" opacity="0.7" />
                  <text x="0" y="3" textAnchor="middle" fill="#616161" fontSize="6"
                    fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">BS</text>
                </g>
              ),
            },
            {
              label: 'NEUTRAL', color: NEUTRAL_GREY, x: 670, items: ['Sugar', 'Salt'],
              trait: 'Neither acid nor base', litmus: 'No change to either',
              icon: (
                <g>
                  {/* Balance scale icon */}
                  <line x1="-10" y1="0" x2="10" y2="0" stroke="#9E9E9E" strokeWidth="2" />
                  <line x1="0" y1="-8" x2="0" y2="2" stroke="#9E9E9E" strokeWidth="2" />
                  <circle cx="0" cy="-8" r="3" fill="#9E9E9E" opacity="0.5" />
                </g>
              ),
            },
          ].map((cat, ci) => (
            <g key={`cat${ci}`}
              style={{ transition: `opacity 1.5s ease ${0.3 + ci * 0.3}s`, opacity: step === 4 ? 1 : 0 }}>
              {/* Column card */}
              <rect x={cat.x - 100} y="60" width="200" height="380" rx="14"
                fill="rgba(30,20,40,0.8)" stroke={cat.color} strokeWidth="1.5" opacity="0.9" />

              {/* Header glow */}
              <rect x={cat.x - 100} y="60" width="200" height="60" rx="14"
                fill={cat.color} opacity="0.12" />
              <rect x={cat.x - 100} y="106" width="200" height="14" rx="0"
                fill={cat.color} opacity="0.12" />

              {/* Category label */}
              <text x={cat.x} y="92" textAnchor="middle" fill={cat.color} fontSize="18"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="800" letterSpacing="3">
                {cat.label}
              </text>
              <line x1={cat.x - 50} y1="105" x2={cat.x + 50} y2="105"
                stroke={cat.color} strokeWidth="1.5" opacity="0.4" />

              {/* Icon */}
              <g transform={`translate(${cat.x}, 140)`}>{cat.icon}</g>

              {/* Trait */}
              <text x={cat.x} y="175" textAnchor="middle" fill={cat.color} fontSize="11"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" opacity="0.85">
                {cat.trait}
              </text>

              {/* Litmus result */}
              <g transform={`translate(${cat.x}, 210)`}>
                {/* Mini litmus strip pair */}
                <rect x="-22" y="-12" width="10" height="28" rx="2"
                  fill={ci === 0 ? BASE_BLUE : ci === 1 ? ACID_RED : ACID_RED}
                  opacity="0.6" />
                {ci === 0 && (
                  <rect x="-22" y="-12" width="10" height="14" rx="2" fill={ACID_RED} opacity="0.9" />
                )}
                <rect x="12" y="-12" width="10" height="28" rx="2"
                  fill={ci === 0 ? ACID_RED : ci === 1 ? BASE_BLUE : BASE_BLUE}
                  opacity="0.6" />
                {ci === 1 && (
                  <rect x="12" y="-12" width="10" height="14" rx="2" fill={BASE_BLUE} opacity="0.9" />
                )}
                {/* Arrow between strips */}
                {ci < 2 && (
                  <text x="0" y="4" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="14"
                    fontFamily="'Inter', system-ui, sans-serif">→</text>
                )}
              </g>

              <text x={cat.x} y="250" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                {cat.litmus}
              </text>

              {/* Substance items */}
              {cat.items.map((item, ii) => (
                <g key={`item${ci}-${ii}`}>
                  <rect x={cat.x - 60} y={275 + ii * 45} width="120" height="34" rx="8"
                    fill={cat.color} opacity="0.1" stroke={cat.color} strokeWidth="0.8" />
                  <text x={cat.x} y={297 + ii * 45} textAnchor="middle" fill={cat.color} fontSize="13"
                    fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                    {item}
                  </text>
                </g>
              ))}
            </g>
          ))}

          {/* Conclusion bar */}
          <g style={{ transition: 'opacity 1.5s ease 1.4s', opacity: step === 4 ? 1 : 0 }}>
            <rect x="160" y="460" width="480" height="55" rx="12"
              fill={PURPLE_GLOW} stroke={PURPLE} strokeWidth="1.5" />
            <text x="400" y="484" textAnchor="middle" fill={PURPLE_LIGHT} fontSize="14"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              Litmus paper is an INDICATOR
            </text>
            <text x="400" y="502" textAnchor="middle" fill="rgba(206,147,216,0.7)" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              It indicates whether a substance is an acid or a base — no tasting needed!
            </text>
          </g>

          {/* Sparkle effects */}
          {[
            { x: 130, y: 55 },
            { x: 400, y: 55 },
            { x: 670, y: 55 },
            { x: 265, y: 460 },
            { x: 535, y: 460 },
          ].map((sp, i) => (
            <g key={`sp4-${i}`} style={{ transition: `opacity 1.5s ease ${1.2 + i * 0.15}s`, opacity: step === 4 ? 1 : 0 }}>
              <circle cx={sp.x} cy={sp.y} r="5" fill="url(#sparkleC3)">
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
                fill={step === s ? PURPLE : 'rgba(255,255,255,0.15)'}
                stroke={step >= s ? PURPLE : 'rgba(255,255,255,0.1)'}
                strokeWidth={step === s ? 2 : 1}
                style={{ transition: 'all 0.5s ease' }}
              />
              {step === s && (
                <circle cx={(s - 1) * 40} cy="0" r="10" fill="none" stroke={PURPLE} strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" values="8;13;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <text
                x={(s - 1) * 40}
                y="18"
                textAnchor="middle"
                fill={step === s ? PURPLE_LIGHT : 'rgba(255,255,255,0.3)'}
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
          C3 ACIDS AND BASES
        </text>
      </svg>
    </div>
  );
}
