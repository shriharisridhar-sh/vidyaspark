import React, { useMemo } from "react";

/**
 * P7.1 Force and Pressure — Brick on Rubber Sheet
 *
 * Interactive SVG canvas that visualises four experiment steps:
 *   1. Setup — empty rubber sheet on supports, brick nearby
 *   2. Brick flat (broad side) — small depression
 *   3. Brick medium side — deeper depression
 *   4. Brick narrow side — maximum depression
 *
 * All transitions use CSS transitions on transform / opacity / d.
 * Receives `currentStep` (1-4) as its only required prop.
 */

/* ---------- constants per step ---------- */
const STEPS = {
  1: {
    // Brick sitting off to the right, not on the sheet
    brickX: 520,
    brickY: 155,
    brickW: 80,
    brickH: 35,
    sheetPath: "M 100 200 C 180 200, 320 200, 500 200",
    depressionDepth: 0,
    label: "",
    areaWidth: 0,
    labelOpacity: 0,
    arrowOpacity: 0,
  },
  2: {
    // Broad side down — widest, shallowest
    brickX: 260,
    brickY: 170,
    brickW: 80,
    brickH: 35,
    sheetPath: "M 100 200 C 200 200, 250 218, 300 218 C 350 218, 400 200, 500 200",
    depressionDepth: 18,
    label: "Large contact area",
    areaWidth: 80,
    labelOpacity: 1,
    arrowOpacity: 1,
  },
  3: {
    // Medium side — narrower, deeper
    brickX: 270,
    brickY: 162,
    brickW: 55,
    brickH: 50,
    sheetPath: "M 100 200 C 210 200, 260 234, 300 234 C 340 234, 390 200, 500 200",
    depressionDepth: 34,
    label: "Medium contact area",
    areaWidth: 55,
    labelOpacity: 1,
    arrowOpacity: 1,
  },
  4: {
    // Narrow side — narrowest, deepest
    brickX: 280,
    brickY: 148,
    brickW: 35,
    brickH: 70,
    sheetPath: "M 100 200 C 220 200, 272 254, 300 254 C 328 254, 380 200, 500 200",
    depressionDepth: 54,
    label: "Small contact area",
    areaWidth: 35,
    labelOpacity: 1,
    arrowOpacity: 1,
  },
};

const TRANSITION_DURATION = "1.2s";
const TRANSITION_TIMING = "cubic-bezier(0.4, 0, 0.2, 1)";

export default function P7ForcePressureCanvas({ currentStep = 1 }) {
  const step = STEPS[currentStep] || STEPS[1];

  // Depression arrow coordinates
  const arrowTopY = 200;
  const arrowBottomY = 200 + step.depressionDepth;

  // Area bracket coordinates centred on brick
  const brickCenterX = step.brickX + step.brickW / 2;
  const bracketLeft = brickCenterX - step.areaWidth / 2;
  const bracketRight = brickCenterX + step.areaWidth / 2;

  // Step title mapping
  const stepTitles = {
    1: "Setup: Empty rubber sheet with brick nearby",
    2: "Brick placed flat (broad side down)",
    3: "Brick on medium side",
    4: "Brick on narrowest side",
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
      {/* Subtle radial glow behind the scene */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          width: 500,
          height: 300,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse, rgba(230,81,0,0.06) 0%, transparent 70%)",
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
            background: "rgba(230,81,0,0.15)",
            color: "#ff8a50",
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
        viewBox="0 0 600 380"
        style={{
          width: "100%",
          maxWidth: 700,
          height: "auto",
          overflow: "visible",
        }}
      >
        <defs>
          {/* Wood grain gradient — warm brown */}
          <linearGradient id="woodGrain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a1755a" />
            <stop offset="20%" stopColor="#8d6548" />
            <stop offset="40%" stopColor="#9e7352" />
            <stop offset="60%" stopColor="#85603f" />
            <stop offset="80%" stopColor="#9a7050" />
            <stop offset="100%" stopColor="#7a5535" />
          </linearGradient>

          {/* Wood top cap gradient */}
          <linearGradient id="woodTop" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#b8896e" />
            <stop offset="50%" stopColor="#c99a7c" />
            <stop offset="100%" stopColor="#b08060" />
          </linearGradient>

          {/* Brick gradient */}
          <linearGradient id="brickGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d84315" />
            <stop offset="35%" stopColor="#bf360c" />
            <stop offset="100%" stopColor="#8e2208" />
          </linearGradient>

          {/* Brick top face — lighter for 3D look */}
          <linearGradient id="brickTop" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ef5350" />
            <stop offset="50%" stopColor="#e53935" />
            <stop offset="100%" stopColor="#d32f2f" />
          </linearGradient>

          {/* Brick side face — darker */}
          <linearGradient id="brickSide" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c62828" />
            <stop offset="100%" stopColor="#8e1c1c" />
          </linearGradient>

          {/* Rubber sheet gradient */}
          <linearGradient id="rubberGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e65100" />
            <stop offset="50%" stopColor="#ff8f00" />
            <stop offset="100%" stopColor="#e65100" />
          </linearGradient>

          {/* Shadow filter */}
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx="0" dy="4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow for rubber sheet */}
          <filter id="rubberGlow" x="-10%" y="-30%" width="120%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feComponentTransfer in="blur">
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Arrow marker — green */}
          <marker
            id="arrowGreen"
            markerWidth="8"
            markerHeight="6"
            refX="4"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#4caf50" />
          </marker>

          {/* Arrow marker — orange for annotations */}
          <marker
            id="arrowOrange"
            markerWidth="8"
            markerHeight="6"
            refX="4"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#ff9800" />
          </marker>

          {/* Brick texture pattern */}
          <pattern
            id="brickTexture"
            patternUnits="userSpaceOnUse"
            width="8"
            height="8"
          >
            <rect width="8" height="8" fill="transparent" />
            <line
              x1="0"
              y1="4"
              x2="8"
              y2="4"
              stroke="rgba(0,0,0,0.08)"
              strokeWidth="0.5"
            />
            <line
              x1="4"
              y1="0"
              x2="4"
              y2="8"
              stroke="rgba(0,0,0,0.04)"
              strokeWidth="0.5"
            />
          </pattern>

          {/* Wood texture pattern */}
          <pattern
            id="woodTexture"
            patternUnits="userSpaceOnUse"
            width="6"
            height="20"
          >
            <rect width="6" height="20" fill="transparent" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="20"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="0.8"
            />
            <line
              x1="3"
              y1="0"
              x2="3"
              y2="20"
              stroke="rgba(0,0,0,0.03)"
              strokeWidth="0.5"
            />
          </pattern>

          {/* Base / table surface gradient */}
          <linearGradient id="tableGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5d4037" />
            <stop offset="100%" stopColor="#4e342e" />
          </linearGradient>
        </defs>

        {/* ====== SCENE ====== */}

        {/* Table / base surface */}
        <rect
          x="50"
          y="310"
          width="500"
          height="14"
          rx="3"
          fill="url(#tableGrad)"
          opacity="0.7"
        />

        {/* Left wooden support */}
        <g filter="url(#dropShadow)">
          <rect
            x="80"
            y="190"
            width="24"
            height="120"
            rx="3"
            fill="url(#woodGrain)"
          />
          <rect
            x="80"
            y="190"
            width="24"
            height="120"
            rx="3"
            fill="url(#woodTexture)"
          />
          {/* Top cap */}
          <rect
            x="76"
            y="186"
            width="32"
            height="8"
            rx="2"
            fill="url(#woodTop)"
          />
        </g>

        {/* Right wooden support */}
        <g filter="url(#dropShadow)">
          <rect
            x="496"
            y="190"
            width="24"
            height="120"
            rx="3"
            fill="url(#woodGrain)"
          />
          <rect
            x="496"
            y="190"
            width="24"
            height="120"
            rx="3"
            fill="url(#woodTexture)"
          />
          {/* Top cap */}
          <rect
            x="492"
            y="186"
            width="32"
            height="8"
            rx="2"
            fill="url(#woodTop)"
          />
        </g>

        {/* Support labels */}
        <text
          x="92"
          y="330"
          textAnchor="middle"
          fill="rgba(255,255,255,0.25)"
          fontSize="9"
          fontFamily="Inter, system-ui, sans-serif"
        >
          Support
        </text>
        <text
          x="508"
          y="330"
          textAnchor="middle"
          fill="rgba(255,255,255,0.25)"
          fontSize="9"
          fontFamily="Inter, system-ui, sans-serif"
        >
          Support
        </text>

        {/* ====== RUBBER SHEET ====== */}
        {/* Glow layer beneath */}
        <path
          d={step.sheetPath}
          stroke="#ff8f00"
          strokeWidth="10"
          fill="none"
          opacity="0.15"
          strokeLinecap="round"
          style={{
            transition: `d ${TRANSITION_DURATION} ${TRANSITION_TIMING}`,
          }}
        />
        {/* Main rubber sheet */}
        <path
          d={step.sheetPath}
          stroke="url(#rubberGrad)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          style={{
            transition: `d ${TRANSITION_DURATION} ${TRANSITION_TIMING}`,
          }}
        />
        {/* Highlight on top */}
        <path
          d={step.sheetPath}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          style={{
            transition: `d ${TRANSITION_DURATION} ${TRANSITION_TIMING}`,
            transform: "translateY(-2px)",
          }}
        />

        {/* Rubber sheet label */}
        <text
          x="300"
          y="350"
          textAnchor="middle"
          fill="rgba(255,165,0,0.35)"
          fontSize="10"
          fontFamily="Inter, system-ui, sans-serif"
          letterSpacing="2"
        >
          RUBBER SHEET
        </text>

        {/* ====== BRICK ====== */}
        <g
          filter="url(#dropShadow)"
          style={{
            transition: baseTransition,
            transform: `translate(${step.brickX}px, ${step.brickY}px)`,
          }}
        >
          {/* 3D brick — right side face */}
          <path
            d={`M ${step.brickW} 0 L ${step.brickW + 10} -6 L ${step.brickW + 10} ${step.brickH - 6} L ${step.brickW} ${step.brickH} Z`}
            fill="url(#brickSide)"
            style={{ transition: baseTransition }}
          />
          {/* 3D brick — top face */}
          <path
            d={`M 0 0 L 10 -6 L ${step.brickW + 10} -6 L ${step.brickW} 0 Z`}
            fill="url(#brickTop)"
            style={{ transition: baseTransition }}
          />
          {/* Main brick face */}
          <rect
            x="0"
            y="0"
            width={step.brickW}
            height={step.brickH}
            rx="1"
            fill="url(#brickGrad)"
            style={{ transition: baseTransition }}
          />
          {/* Brick texture overlay */}
          <rect
            x="0"
            y="0"
            width={step.brickW}
            height={step.brickH}
            rx="1"
            fill="url(#brickTexture)"
            style={{ transition: baseTransition }}
          />
          {/* Mortar lines for realism */}
          <line
            x1="0"
            y1={step.brickH * 0.33}
            x2={step.brickW}
            y2={step.brickH * 0.33}
            stroke="rgba(0,0,0,0.12)"
            strokeWidth="0.8"
            style={{ transition: baseTransition }}
          />
          <line
            x1="0"
            y1={step.brickH * 0.66}
            x2={step.brickW}
            y2={step.brickH * 0.66}
            stroke="rgba(0,0,0,0.12)"
            strokeWidth="0.8"
            style={{ transition: baseTransition }}
          />
          {/* Weight label */}
          <text
            x={step.brickW / 2}
            y={step.brickH / 2 + 4}
            textAnchor="middle"
            fill="rgba(255,255,255,0.8)"
            fontSize="11"
            fontWeight="700"
            fontFamily="Inter, system-ui, sans-serif"
            style={{ transition: baseTransition }}
          >
            {currentStep === 1 ? "BRICK" : "W"}
          </text>
        </g>

        {/* ====== DEPRESSION ARROW ====== */}
        {currentStep > 1 && (
          <g
            style={{
              opacity: step.arrowOpacity,
              transition: delayedFade,
            }}
          >
            {/* Vertical arrow showing depression */}
            <line
              x1="420"
              y1={arrowTopY}
              x2="420"
              y2={arrowBottomY}
              stroke="#4caf50"
              strokeWidth="2"
              strokeDasharray="4,3"
              markerEnd="url(#arrowGreen)"
              style={{ transition: baseTransition }}
            />
            {/* Horizontal reference line at sheet level */}
            <line
              x1="390"
              y1="200"
              x2="450"
              y2="200"
              stroke="rgba(76,175,80,0.3)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            {/* Depression depth label */}
            <text
              x="445"
              y={(arrowTopY + arrowBottomY) / 2 + 4}
              fill="#4caf50"
              fontSize="10"
              fontWeight="600"
              fontFamily="Inter, system-ui, sans-serif"
              style={{ transition: baseTransition }}
            >
              {step.depressionDepth > 40
                ? "MAX"
                : step.depressionDepth > 25
                ? "MORE"
                : "LESS"}
            </text>
            <text
              x="445"
              y={(arrowTopY + arrowBottomY) / 2 + 16}
              fill="rgba(76,175,80,0.6)"
              fontSize="9"
              fontFamily="Inter, system-ui, sans-serif"
              style={{ transition: baseTransition }}
            >
              depression
            </text>
          </g>
        )}

        {/* ====== CONTACT AREA BRACKET ====== */}
        {currentStep > 1 && (
          <g
            style={{
              opacity: step.labelOpacity,
              transition: delayedFade,
            }}
          >
            {/* Bracket top line */}
            <line
              x1={bracketLeft}
              y1={step.brickY - 18}
              x2={bracketRight}
              y2={step.brickY - 18}
              stroke="#ff9800"
              strokeWidth="1.5"
              style={{ transition: baseTransition }}
            />
            {/* Left tick */}
            <line
              x1={bracketLeft}
              y1={step.brickY - 24}
              x2={bracketLeft}
              y2={step.brickY - 12}
              stroke="#ff9800"
              strokeWidth="1.5"
              style={{ transition: baseTransition }}
            />
            {/* Right tick */}
            <line
              x1={bracketRight}
              y1={step.brickY - 24}
              x2={bracketRight}
              y2={step.brickY - 12}
              stroke="#ff9800"
              strokeWidth="1.5"
              style={{ transition: baseTransition }}
            />
            {/* Area label text */}
            <text
              x={brickCenterX}
              y={step.brickY - 30}
              textAnchor="middle"
              fill="#ff9800"
              fontSize="11"
              fontWeight="600"
              fontFamily="Inter, system-ui, sans-serif"
              style={{ transition: baseTransition }}
            >
              {step.label}
            </text>
          </g>
        )}

        {/* ====== FORCE ARROW (weight) ====== */}
        {currentStep > 1 && (
          <g
            style={{
              opacity: step.arrowOpacity,
              transition: delayedFade,
            }}
          >
            <line
              x1={brickCenterX}
              y1={step.brickY - 50}
              x2={brickCenterX}
              y2={step.brickY - 8}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
              markerEnd="url(#arrowOrange)"
              style={{ transition: baseTransition }}
            />
            <text
              x={brickCenterX}
              y={step.brickY - 56}
              textAnchor="middle"
              fill="rgba(255,255,255,0.45)"
              fontSize="10"
              fontWeight="500"
              fontFamily="Inter, system-ui, sans-serif"
              style={{ transition: baseTransition }}
            >
              Same Force (Weight)
            </text>
          </g>
        )}

        {/* ====== FORMULA ANNOTATION (bottom) ====== */}
        {currentStep > 1 && (
          <g
            style={{
              opacity: step.labelOpacity * 0.8,
              transition: delayedFade,
            }}
          >
            <text
              x="300"
              y="370"
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="11"
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight="500"
            >
              Pressure = Force / Area
            </text>
            <text
              x="300"
              y="384"
              textAnchor="middle"
              fill="rgba(255,255,255,0.25)"
              fontSize="9.5"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {currentStep === 2 &&
                "Same weight, large area = low pressure = small depression"}
              {currentStep === 3 &&
                "Same weight, medium area = more pressure = deeper depression"}
              {currentStep === 4 &&
                "Same weight, small area = maximum pressure = deepest depression"}
            </text>
          </g>
        )}

        {/* ====== STEP 1 — "Place the brick" hint ====== */}
        {currentStep === 1 && (
          <g
            style={{
              opacity: 1,
              transition: `opacity 0.6s ${TRANSITION_TIMING}`,
            }}
          >
            {/* Curved arrow from brick toward sheet */}
            <path
              d="M 510 175 C 470 185, 430 195, 380 198"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="4,4"
              markerEnd="url(#arrowOrange)"
            />
            <text
              x="470"
              y="160"
              fill="rgba(255,255,255,0.3)"
              fontSize="10"
              fontFamily="Inter, system-ui, sans-serif"
              fontStyle="italic"
            >
              Place brick on sheet
            </text>
          </g>
        )}
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
                  ? "#e65100"
                  : s < currentStep
                  ? "rgba(230,81,0,0.4)"
                  : "rgba(255,255,255,0.15)",
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
