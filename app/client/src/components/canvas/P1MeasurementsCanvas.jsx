import React from "react";

/**
 * P1 — Learning to Measure: Physical Quantities
 *
 * Interactive SVG canvas that visualises four experiment steps:
 *   1. Setup — table with flowers, pens, Chart 1, glasses, scale
 *   2. Sorting by Measurable vs Subjective — flowers sorted, question mark over "beauty"
 *   3. Measuring with Standard Tools — lines with ruler, glasses with measuring cylinder
 *   4. Hand Span vs Standard Scale — two students, different hand-span results, one scale result
 *
 * Receives `currentStep` (1-4) as its only required prop.
 */

const TRANSITION_DURATION = "1.4s";
const TRANSITION_TIMING = "cubic-bezier(0.4, 0, 0.2, 1)";
const BLUE = "#2196F3";
const BLUE_LIGHT = "#64B5F6";
const BLUE_DARK = "#1565C0";
const BLUE_GLOW = "rgba(33,150,243,0.12)";

export default function P1MeasurementsCanvas({ currentStep = 1 }) {
  const stepTitles = {
    1: "Setup: Materials laid out on the table",
    2: "Sorting by measurable vs subjective qualities",
    3: "Measuring with standard tools",
    4: "Hand span vs standard scale",
  };

  const containerStyle = {
    width: "100%",
    height: "100%",
    minHeight: 340,
    background: "#0a0a0a",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, sans-serif",
  };

  const baseTransition = `all ${TRANSITION_DURATION} ${TRANSITION_TIMING}`;
  const delayedFade = `opacity 0.6s ${TRANSITION_TIMING} 0.9s`;

  return (
    <div style={containerStyle}>
      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          width: 500,
          height: 300,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(ellipse, ${BLUE_GLOW} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Step indicator label */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            background: "rgba(33,150,243,0.15)",
            color: BLUE_LIGHT,
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 12px",
            borderRadius: 12,
            letterSpacing: 0.5,
          }}
        >
          STEP {currentStep} / 4
        </span>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
          {stepTitles[currentStep]}
        </span>
      </div>

      {/* Main SVG */}
      <svg
        viewBox="0 0 600 400"
        style={{
          width: "100%",
          maxWidth: 700,
          height: "auto",
          overflow: "visible",
        }}
      >
        <defs>
          {/* Table gradient */}
          <linearGradient id="p1-tableGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5d4037" />
            <stop offset="100%" stopColor="#4e342e" />
          </linearGradient>

          {/* Blue accent gradient */}
          <linearGradient id="p1-blueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLUE_LIGHT} />
            <stop offset="100%" stopColor={BLUE_DARK} />
          </linearGradient>

          {/* Glass gradient */}
          <linearGradient id="p1-glassGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>

          {/* Water gradient */}
          <linearGradient id="p1-waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#29B6F6" />
            <stop offset="100%" stopColor="#0288D1" />
          </linearGradient>

          {/* Flower petal gradients */}
          <radialGradient id="p1-flowerRed" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#EF5350" />
            <stop offset="100%" stopColor="#C62828" />
          </radialGradient>
          <radialGradient id="p1-flowerYellow" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#FFD54F" />
            <stop offset="100%" stopColor="#F9A825" />
          </radialGradient>
          <radialGradient id="p1-flowerPurple" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#CE93D8" />
            <stop offset="100%" stopColor="#7B1FA2" />
          </radialGradient>

          {/* Ruler gradient */}
          <linearGradient id="p1-rulerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF9C4" />
            <stop offset="100%" stopColor="#F9A825" />
          </linearGradient>

          {/* Scale / measuring instrument gradient */}
          <linearGradient id="p1-scaleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#90A4AE" />
            <stop offset="100%" stopColor="#546E7A" />
          </linearGradient>

          {/* Drop shadow */}
          <filter id="p1-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="3" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.25" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow filter for highlights */}
          <filter id="p1-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feComponentTransfer in="blur">
              <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Arrow markers */}
          <marker id="p1-arrowBlue" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={BLUE} />
          </marker>
          <marker id="p1-arrowWhite" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.6)" />
          </marker>
          <marker id="p1-arrowGreen" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#4CAF50" />
          </marker>
          <marker id="p1-arrowRed" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#EF5350" />
          </marker>

          {/* Skin tone gradients for hands */}
          <linearGradient id="p1-skinA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8D6E63" />
            <stop offset="100%" stopColor="#795548" />
          </linearGradient>
          <linearGradient id="p1-skinB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#A1887F" />
            <stop offset="100%" stopColor="#8D6E63" />
          </linearGradient>
        </defs>

        {/* ====== TABLE SURFACE ====== */}
        <rect x="30" y="310" width="540" height="14" rx="3" fill="url(#p1-tableGrad)" opacity="0.7" />

        {/* ====================================================================
            STEP 1 — Setup: materials on table
           ==================================================================== */}
        <g
          style={{
            opacity: currentStep === 1 ? 1 : 0,
            transition: baseTransition,
            pointerEvents: currentStep === 1 ? "auto" : "none",
          }}
        >
          {/* Bunch of flowers — left side */}
          <g transform="translate(70, 200)">
            {/* Stems */}
            <line x1="20" y1="40" x2="15" y2="105" stroke="#388E3C" strokeWidth="2" />
            <line x1="35" y1="35" x2="35" y2="105" stroke="#388E3C" strokeWidth="2" />
            <line x1="50" y1="40" x2="55" y2="105" stroke="#2E7D32" strokeWidth="2" />
            {/* Petals */}
            <circle cx="20" cy="32" r="10" fill="url(#p1-flowerRed)" />
            <circle cx="35" cy="26" r="12" fill="url(#p1-flowerYellow)" />
            <circle cx="50" cy="32" r="10" fill="url(#p1-flowerPurple)" />
            {/* Centers */}
            <circle cx="20" cy="32" r="3" fill="#FDD835" />
            <circle cx="35" cy="26" r="4" fill="#FF8F00" />
            <circle cx="50" cy="32" r="3" fill="#FDD835" />
          </g>
          <text x="105" y="320" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="Inter, system-ui, sans-serif">Flowers</text>

          {/* Pens and pencils — centre-left */}
          <g transform="translate(180, 245)">
            {/* Pencil 1 */}
            <rect x="0" y="0" width="55" height="6" rx="1" fill="#FFC107" />
            <polygon points="55,0 62,3 55,6" fill="#FFE082" />
            <rect x="55" y="0.5" width="5" height="5" fill="#BDBDBD" />
            {/* Pen */}
            <rect x="5" y="12" width="50" height="6" rx="1" fill="#1565C0" />
            <polygon points="55,12 61,15 55,18" fill="#90CAF9" />
            {/* Pencil 2 */}
            <rect x="-3" y="24" width="52" height="6" rx="1" fill="#66BB6A" />
            <polygon points="49,24 56,27 49,30" fill="#A5D6A7" />
          </g>
          <text x="215" y="320" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="Inter, system-ui, sans-serif">Pens & Pencils</text>

          {/* Chart 1 on stand — centre */}
          <g transform="translate(285, 155)" filter="url(#p1-shadow)">
            {/* Stand pole */}
            <rect x="35" y="80" width="6" height="75" fill="#78909C" rx="1" />
            {/* Stand base */}
            <rect x="18" y="150" width="40" height="5" rx="2" fill="#546E7A" />
            {/* Chart board */}
            <rect x="0" y="0" width="76" height="80" rx="4" fill="#FAFAFA" />
            <rect x="0" y="0" width="76" height="80" rx="4" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
            {/* Lines on chart */}
            <line x1="10" y1="18" x2="50" y2="18" stroke="#333" strokeWidth="2" />
            <line x1="10" y1="30" x2="60" y2="30" stroke="#333" strokeWidth="2" />
            {/* Shapes */}
            <rect x="10" y="42" width="20" height="14" fill="none" stroke="#333" strokeWidth="1.5" />
            <rect x="40" y="42" width="26" height="10" fill="none" stroke="#333" strokeWidth="1.5" />
            <circle cx="25" cy="68" r="6" fill="none" stroke="#333" strokeWidth="1.5" />
            <rect x="42" y="60" width="14" height="14" fill="none" stroke="#333" strokeWidth="1.5" />
            {/* Label */}
            <text x="38" y="-6" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="Inter, system-ui, sans-serif">CHART 1</text>
          </g>

          {/* Two glasses — centre-right */}
          <g transform="translate(410, 220)">
            {/* Tall narrow glass */}
            <path d="M 0 0 L -4 70 L 24 70 L 20 0 Z" fill="url(#p1-glassGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <path d="M -2 30 L -4 70 L 24 70 L 22 30 Z" fill="url(#p1-waterGrad)" opacity="0.6" />
            {/* Short wide glass */}
            <path d="M 40 25 L 34 70 L 78 70 L 72 25 Z" fill="url(#p1-glassGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <path d="M 38 40 L 34 70 L 78 70 L 74 40 Z" fill="url(#p1-waterGrad)" opacity="0.6" />
          </g>
          <text x="445" y="320" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="Inter, system-ui, sans-serif">Glasses & Water</text>

          {/* Scale — far right */}
          <g transform="translate(510, 260)">
            <rect x="0" y="10" width="50" height="35" rx="3" fill="url(#p1-scaleGrad)" />
            {/* Display */}
            <rect x="8" y="15" width="34" height="12" rx="2" fill="#263238" />
            <text x="25" y="24.5" textAnchor="middle" fill="#4CAF50" fontSize="8" fontWeight="700" fontFamily="monospace">0.00</text>
            {/* Platform */}
            <rect x="-5" y="2" width="60" height="10" rx="2" fill="#78909C" />
          </g>
          <text x="535" y="320" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="Inter, system-ui, sans-serif">Scale</text>

          {/* Hint text */}
          <text x="300" y="370" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="Inter, system-ui, sans-serif" fontStyle="italic">
            All materials ready for the measurement experiment
          </text>
        </g>

        {/* ====================================================================
            STEP 2 — Sorting: Measurable vs Subjective
           ==================================================================== */}
        <g
          style={{
            opacity: currentStep === 2 ? 1 : 0,
            transition: baseTransition,
            pointerEvents: currentStep === 2 ? "auto" : "none",
          }}
        >
          {/* LEFT PANEL — Measurable: sorted by size */}
          <g transform="translate(50, 140)">
            {/* Panel background */}
            <rect x="0" y="0" width="220" height="160" rx="10" fill="rgba(33,150,243,0.06)" stroke="rgba(33,150,243,0.15)" strokeWidth="1" />
            <text x="110" y="24" textAnchor="middle" fill={BLUE_LIGHT} fontSize="11" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">MEASURABLE</text>
            <text x="110" y="38" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="Inter, system-ui, sans-serif">Everyone agrees</text>

            {/* Flowers sorted by size: small, medium, large */}
            <g transform="translate(20, 55)">
              {/* Small flower */}
              <line x1="15" y1="15" x2="15" y2="40" stroke="#388E3C" strokeWidth="1.5" />
              <circle cx="15" cy="12" r="7" fill="url(#p1-flowerPurple)" />
              <circle cx="15" cy="12" r="2" fill="#FDD835" />
              <text x="15" y="52" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7">Small</text>

              {/* Medium flower */}
              <line x1="75" y1="10" x2="75" y2="40" stroke="#388E3C" strokeWidth="1.5" />
              <circle cx="75" cy="7" r="10" fill="url(#p1-flowerYellow)" />
              <circle cx="75" cy="7" r="3" fill="#FF8F00" />
              <text x="75" y="52" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7">Medium</text>

              {/* Large flower */}
              <line x1="140" y1="5" x2="140" y2="40" stroke="#388E3C" strokeWidth="2" />
              <circle cx="140" cy="2" r="13" fill="url(#p1-flowerRed)" />
              <circle cx="140" cy="2" r="4" fill="#FDD835" />
              <text x="140" y="52" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7">Large</text>

              {/* Size arrows */}
              <line x1="30" y1="30" x2="60" y2="30" stroke={BLUE} strokeWidth="1" markerEnd="url(#p1-arrowBlue)" opacity="0.5" />
              <line x1="95" y1="30" x2="122" y2="30" stroke={BLUE} strokeWidth="1" markerEnd="url(#p1-arrowBlue)" opacity="0.5" />
            </g>

            {/* Checkmark */}
            <g transform="translate(185, 52)">
              <circle cx="0" cy="0" r="10" fill="rgba(76,175,80,0.15)" />
              <path d="M -5 0 L -2 4 L 5 -4" stroke="#4CAF50" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* Pens sorted */}
            <g transform="translate(20, 120)">
              <rect x="0" y="0" width="30" height="5" rx="1" fill="#FFC107" />
              <rect x="40" y="0" width="40" height="5" rx="1" fill="#66BB6A" />
              <rect x="90" y="0" width="50" height="5" rx="1" fill="#1565C0" />
              <text x="85" y="16" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7">Sorted by length</text>
            </g>
          </g>

          {/* RIGHT PANEL — Subjective: cannot agree */}
          <g transform="translate(330, 140)">
            {/* Panel background */}
            <rect x="0" y="0" width="220" height="160" rx="10" fill="rgba(239,83,80,0.06)" stroke="rgba(239,83,80,0.15)" strokeWidth="1" />
            <text x="110" y="24" textAnchor="middle" fill="#EF5350" fontSize="11" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">SUBJECTIVE</text>
            <text x="110" y="38" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="Inter, system-ui, sans-serif">Everyone disagrees!</text>

            {/* Three flowers with question marks */}
            <g transform="translate(20, 55)">
              <line x1="25" y1="15" x2="25" y2="40" stroke="#388E3C" strokeWidth="1.5" />
              <circle cx="25" cy="10" r="10" fill="url(#p1-flowerRed)" />
              <circle cx="25" cy="10" r="3" fill="#FDD835" />

              <line x1="85" y1="15" x2="85" y2="40" stroke="#388E3C" strokeWidth="1.5" />
              <circle cx="85" cy="10" r="10" fill="url(#p1-flowerYellow)" />
              <circle cx="85" cy="10" r="3" fill="#FF8F00" />

              <line x1="145" y1="15" x2="145" y2="40" stroke="#388E3C" strokeWidth="1.5" />
              <circle cx="145" cy="10" r="10" fill="url(#p1-flowerPurple)" />
              <circle cx="145" cy="10" r="3" fill="#FDD835" />
            </g>

            {/* Big question mark */}
            <g transform="translate(85, 80)">
              <text x="25" y="30" textAnchor="middle" fill="#EF5350" fontSize="36" fontWeight="700" fontFamily="Inter, system-ui, sans-serif" opacity="0.7">?</text>
            </g>

            {/* "Which is most beautiful?" label */}
            <text x="110" y="130" textAnchor="middle" fill="rgba(239,83,80,0.6)" fontSize="9" fontFamily="Inter, system-ui, sans-serif" fontStyle="italic">
              "Which is most beautiful?"
            </text>

            {/* X mark */}
            <g transform="translate(185, 52)">
              <circle cx="0" cy="0" r="10" fill="rgba(239,83,80,0.15)" />
              <line x1="-4" y1="-4" x2="4" y2="4" stroke="#EF5350" strokeWidth="2" strokeLinecap="round" />
              <line x1="4" y1="-4" x2="-4" y2="4" stroke="#EF5350" strokeWidth="2" strokeLinecap="round" />
            </g>
          </g>

          {/* VS divider */}
          <g>
            <text x="300" y="225" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="14" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">VS</text>
          </g>

          {/* Bottom insight */}
          <text x="300" y="340" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" fontWeight="500" fontFamily="Inter, system-ui, sans-serif">
            Physical quantities can be measured — beauty cannot!
          </text>
          <text x="300" y="358" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9.5" fontFamily="Inter, system-ui, sans-serif">
            Size, length, mass = measurable | Beauty, comfort = subjective
          </text>
        </g>

        {/* ====================================================================
            STEP 3 — Standard measurement tools
           ==================================================================== */}
        <g
          style={{
            opacity: currentStep === 3 ? 1 : 0,
            transition: baseTransition,
            pointerEvents: currentStep === 3 ? "auto" : "none",
          }}
        >
          {/* LEFT: Two line segments with ruler */}
          <g transform="translate(40, 130)">
            <rect x="0" y="0" width="240" height="180" rx="10" fill="rgba(33,150,243,0.04)" stroke="rgba(33,150,243,0.1)" strokeWidth="1" />
            <text x="120" y="22" textAnchor="middle" fill={BLUE_LIGHT} fontSize="10" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">WHICH LINE IS LONGER?</text>

            {/* Line A — appears shorter but is actually longer */}
            <g transform="translate(20, 42)">
              <text x="0" y="10" fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">A</text>
              <line x1="16" y1="7" x2="176" y2="7" stroke="#EF5350" strokeWidth="3" strokeLinecap="round" />
              {/* Inward arrows (optical illusion) */}
              <line x1="16" y1="7" x2="28" y2="0" stroke="#EF5350" strokeWidth="1.5" />
              <line x1="16" y1="7" x2="28" y2="14" stroke="#EF5350" strokeWidth="1.5" />
              <line x1="176" y1="7" x2="164" y2="0" stroke="#EF5350" strokeWidth="1.5" />
              <line x1="176" y1="7" x2="164" y2="14" stroke="#EF5350" strokeWidth="1.5" />
            </g>

            {/* Line B — appears longer but is actually shorter */}
            <g transform="translate(20, 68)">
              <text x="0" y="10" fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">B</text>
              <line x1="16" y1="7" x2="156" y2="7" stroke="#42A5F5" strokeWidth="3" strokeLinecap="round" />
              {/* Outward arrows (optical illusion) */}
              <line x1="16" y1="7" x2="4" y2="0" stroke="#42A5F5" strokeWidth="1.5" />
              <line x1="16" y1="7" x2="4" y2="14" stroke="#42A5F5" strokeWidth="1.5" />
              <line x1="156" y1="7" x2="168" y2="0" stroke="#42A5F5" strokeWidth="1.5" />
              <line x1="156" y1="7" x2="168" y2="14" stroke="#42A5F5" strokeWidth="1.5" />
            </g>

            {/* Ruler underneath */}
            <g transform="translate(30, 100)">
              <rect x="0" y="0" width="180" height="16" rx="2" fill="url(#p1-rulerGrad)" opacity="0.9" />
              {/* Tick marks */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((i) => (
                <g key={`tick-${i}`}>
                  <line x1={i * 11.25} y1="0" x2={i * 11.25} y2={i % 2 === 0 ? 8 : 5} stroke="rgba(0,0,0,0.5)" strokeWidth={i % 2 === 0 ? "0.8" : "0.4"} />
                  {i % 2 === 0 && (
                    <text x={i * 11.25} y="14" textAnchor="middle" fill="rgba(0,0,0,0.6)" fontSize="5" fontFamily="Inter, system-ui, sans-serif">{i}</text>
                  )}
                </g>
              ))}
            </g>

            {/* Result */}
            <text x="120" y="135" textAnchor="middle" fill="#4CAF50" fontSize="10" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">
              A = 16 cm | B = 14 cm
            </text>
            <text x="120" y="150" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8.5" fontFamily="Inter, system-ui, sans-serif">
              Eyes deceive, rulers don't!
            </text>

            {/* Checkmark */}
            <g transform="translate(208, 98)">
              <circle cx="0" cy="0" r="12" fill="rgba(33,150,243,0.12)" />
              <text x="0" y="4" textAnchor="middle" fill={BLUE} fontSize="11" fontFamily="Inter, system-ui, sans-serif">📏</text>
            </g>
          </g>

          {/* RIGHT: Two glasses with measuring cylinder */}
          <g transform="translate(320, 130)">
            <rect x="0" y="0" width="240" height="180" rx="10" fill="rgba(33,150,243,0.04)" stroke="rgba(33,150,243,0.1)" strokeWidth="1" />
            <text x="120" y="22" textAnchor="middle" fill={BLUE_LIGHT} fontSize="10" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">WHICH GLASS HAS MORE?</text>

            {/* Tall narrow glass */}
            <g transform="translate(20, 35)">
              <path d="M 10 0 L 6 90 L 38 90 L 34 0 Z" fill="url(#p1-glassGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
              <path d="M 8 35 L 6 90 L 38 90 L 36 35 Z" fill="url(#p1-waterGrad)" opacity="0.5" />
              {/* Water surface highlight */}
              <ellipse cx="22" cy="35" rx="14" ry="2" fill="rgba(255,255,255,0.15)" />
              <text x="22" y="105" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="Inter, system-ui, sans-serif">Tall</text>
            </g>

            {/* Short wide glass */}
            <g transform="translate(70, 35)">
              <path d="M 0 30 L -6 90 L 56 90 L 50 30 Z" fill="url(#p1-glassGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
              <path d="M -2 50 L -6 90 L 56 90 L 52 50 Z" fill="url(#p1-waterGrad)" opacity="0.5" />
              <ellipse cx="25" cy="50" rx="26" ry="2.5" fill="rgba(255,255,255,0.15)" />
              <text x="25" y="105" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="Inter, system-ui, sans-serif">Wide</text>
            </g>

            {/* Equals sign */}
            <g transform="translate(138, 80)">
              <line x1="0" y1="0" x2="16" y2="0" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="0" y1="7" x2="16" y2="7" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Measuring cylinder */}
            <g transform="translate(170, 35)">
              <rect x="0" y="0" width="30" height="90" rx="3" fill="url(#p1-glassGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
              <rect x="2" y="35" width="26" height="53" rx="2" fill="url(#p1-waterGrad)" opacity="0.5" />
              {/* Graduation marks */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <g key={`grad-${i}`}>
                  <line x1="0" y1={15 + i * 14} x2="8" y2={15 + i * 14} stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
                  <text x="34" y={18 + i * 14} fill="rgba(255,255,255,0.25)" fontSize="6" fontFamily="Inter, system-ui, sans-serif">{150 - i * 25}</text>
                </g>
              ))}
              {/* Reading label */}
              <text x="15" y="105" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="Inter, system-ui, sans-serif">100 ml</text>
            </g>

            {/* Result */}
            <text x="120" y="155" textAnchor="middle" fill="#4CAF50" fontSize="10" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">
              Both = 100 ml
            </text>
            <text x="120" y="170" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8.5" fontFamily="Inter, system-ui, sans-serif">
              Same volume, different shapes!
            </text>
          </g>

          {/* Bottom formula */}
          <text x="300" y="340" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" fontWeight="500" fontFamily="Inter, system-ui, sans-serif">
            Our eyes can be deceived — we need standard instruments
          </text>
          <text x="300" y="358" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9.5" fontFamily="Inter, system-ui, sans-serif">
            Scale for length | Measuring glass for volume | Weighing scale for mass
          </text>
        </g>

        {/* ====================================================================
            STEP 4 — Hand span vs Standard scale
           ==================================================================== */}
        <g
          style={{
            opacity: currentStep === 4 ? 1 : 0,
            transition: baseTransition,
            pointerEvents: currentStep === 4 ? "auto" : "none",
          }}
        >
          {/* Table being measured */}
          <g transform="translate(100, 210)">
            {/* Table top */}
            <rect x="0" y="0" width="400" height="12" rx="3" fill="url(#p1-tableGrad)" />
            {/* Table surface highlight */}
            <rect x="0" y="0" width="400" height="4" rx="2" fill="rgba(255,255,255,0.05)" />
            {/* Table legs */}
            <rect x="15" y="12" width="12" height="65" rx="2" fill="#5D4037" />
            <rect x="373" y="12" width="12" height="65" rx="2" fill="#5D4037" />
          </g>

          {/* Student A — left side, larger hand span */}
          <g transform="translate(110, 150)">
            {/* Hand silhouette A — larger spans */}
            <g opacity="0.8">
              {/* Hand spans marked on table */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <g key={`spanA-${i}`}>
                  {/* Span arc */}
                  <path
                    d={`M ${i * 60 + 5} 58 Q ${i * 60 + 30} 42 ${i * 60 + 55} 58`}
                    fill="none"
                    stroke="url(#p1-skinA)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                  {/* Fingertip dots */}
                  <circle cx={i * 60 + 5} cy="58" r="3" fill="url(#p1-skinA)" opacity="0.6" />
                  <circle cx={i * 60 + 55} cy="58" r="3" fill="url(#p1-skinA)" opacity="0.6" />
                </g>
              ))}
            </g>
            {/* Count label */}
            <rect x="120" y="12" width="50" height="24" rx="12" fill="rgba(239,83,80,0.12)" />
            <text x="145" y="28" textAnchor="middle" fill="#EF5350" fontSize="13" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">6</text>
            <text x="145" y="6" textAnchor="middle" fill="rgba(239,83,80,0.5)" fontSize="8" fontFamily="Inter, system-ui, sans-serif">spans</text>

            {/* Student label */}
            <text x="145" y="-8" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="500" fontFamily="Inter, system-ui, sans-serif">Student A (large hand)</text>
          </g>

          {/* Student B — right offset, smaller hand span */}
          <g transform="translate(130, 240)">
            <g opacity="0.8">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <g key={`spanB-${i}`}>
                  <path
                    d={`M ${i * 48 + 3} 30 Q ${i * 48 + 24} 18 ${i * 48 + 45} 30`}
                    fill="none"
                    stroke="url(#p1-skinB)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                  <circle cx={i * 48 + 3} cy="30" r="2.5" fill="url(#p1-skinB)" opacity="0.5" />
                  <circle cx={i * 48 + 45} cy="30" r="2.5" fill="url(#p1-skinB)" opacity="0.5" />
                </g>
              ))}
            </g>
            {/* Count label */}
            <rect x="120" y="38" width="50" height="24" rx="12" fill="rgba(239,83,80,0.12)" />
            <text x="145" y="54" textAnchor="middle" fill="#EF5350" fontSize="13" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">7</text>
            <text x="145" y="68" textAnchor="middle" fill="rgba(239,83,80,0.5)" fontSize="8" fontFamily="Inter, system-ui, sans-serif">spans</text>

            {/* Student label */}
            <text x="145" y="82" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="500" fontFamily="Inter, system-ui, sans-serif">Student B (small hand)</text>
          </g>

          {/* Not equal sign between counts */}
          <g transform="translate(295, 165)">
            <circle cx="0" cy="0" r="14" fill="rgba(239,83,80,0.1)" />
            <text x="0" y="5" textAnchor="middle" fill="#EF5350" fontSize="16" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">≠</text>
          </g>

          {/* Standard ruler at bottom */}
          <g transform="translate(130, 300)">
            {/* Green box for standard */}
            <rect x="-20" y="-22" width="360" height="50" rx="8" fill="rgba(76,175,80,0.06)" stroke="rgba(76,175,80,0.15)" strokeWidth="1" />

            {/* Ruler */}
            <rect x="0" y="0" width="320" height="14" rx="2" fill="url(#p1-rulerGrad)" opacity="0.9" />
            {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32].map((i) => (
              <g key={`ruler4-${i}`}>
                <line x1={i * 10} y1="0" x2={i * 10} y2={i % 2 === 0 ? 7 : 4} stroke="rgba(0,0,0,0.5)" strokeWidth={i % 2 === 0 ? "0.7" : "0.3"} />
                {i % 4 === 0 && (
                  <text x={i * 10} y="12" textAnchor="middle" fill="rgba(0,0,0,0.5)" fontSize="5" fontFamily="Inter, system-ui, sans-serif">{i}</text>
                )}
              </g>
            ))}

            {/* Result */}
            <text x="160" y="-8" textAnchor="middle" fill="#4CAF50" fontSize="11" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
              Standard: 120 cm — always the same!
            </text>
          </g>

          {/* Key message — large and prominent */}
          <g transform="translate(300, 375)">
            <rect x="-160" y="-18" width="320" height="30" rx="15" fill="rgba(33,150,243,0.1)" stroke="rgba(33,150,243,0.2)" strokeWidth="1" />
            <text x="0" y="2" textAnchor="middle" fill={BLUE} fontSize="13" fontWeight="700" fontFamily="Inter, system-ui, sans-serif" letterSpacing="1">
              Measurement = Number + Unit
            </text>
          </g>
        </g>
      </svg>

      {/* Step dots at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            style={{
              width: currentStep === s ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background:
                currentStep === s
                  ? BLUE
                  : s < currentStep
                  ? "rgba(33,150,243,0.4)"
                  : "rgba(255,255,255,0.15)",
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
