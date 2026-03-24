import React from "react";

/**
 * P4 Light — Three Cardboard Experiment (Rectilinear Propagation)
 *
 * Interactive SVG canvas that visualises four experiment steps:
 *   1. Setup — three cardboard sheets with holes on stands, candle nearby
 *   2. Aligned — candle lit, light passes through all three holes, flame visible
 *   3. Displaced — first cardboard shifted, light blocked
 *   4. Restored — all realigned, flame visible again
 *
 * All transitions use CSS transitions on transform / opacity.
 * Receives `currentStep` (1-4) as its only required prop.
 */

/* ---------- layout constants ---------- */
const CANDLE_X = 80;
const EYE_X = 560;
const TABLE_Y = 290;

// Cardboard sheet positions (x centres)
const CARD_1_X_ALIGNED = 190;
const CARD_2_X = 300;
const CARD_3_X = 410;
const CARD_1_X_DISPLACED = 150; // shifted left in step 3

const CARD_W = 8;
const CARD_H = 120;
const HOLE_Y = 220; // y-centre of hole through all cards
const HOLE_R = 8;

const TRANSITION_DURATION = "1.0s";
const TRANSITION_TIMING = "cubic-bezier(0.4, 0, 0.2, 1)";

/* ---------- per-step config ---------- */
const STEPS = {
  1: {
    card1X: CARD_1_X_ALIGNED,
    candleLit: false,
    lightVisible: false,
    displaced: false,
    showThread: true,
  },
  2: {
    card1X: CARD_1_X_ALIGNED,
    candleLit: true,
    lightVisible: true,
    displaced: false,
    showThread: false,
  },
  3: {
    card1X: CARD_1_X_DISPLACED,
    candleLit: true,
    lightVisible: false,
    displaced: true,
    showThread: false,
  },
  4: {
    card1X: CARD_1_X_ALIGNED,
    candleLit: true,
    lightVisible: true,
    displaced: false,
    showThread: false,
  },
};

const stepTitles = {
  1: "Setup: Three cardboard sheets aligned with thread",
  2: "Holes aligned — candle flame visible",
  3: "First cardboard displaced — flame hidden",
  4: "Restored alignment — flame visible again",
};

export default function P4LightCanvas({ currentStep = 1 }) {
  const step = STEPS[currentStep] || STEPS[1];
  const baseTransition = `all ${TRANSITION_DURATION} ${TRANSITION_TIMING}`;
  const delayedFade = `opacity 0.6s ${TRANSITION_TIMING} 0.8s`;

  const containerStyle = {
    width: "100%",
    height: "100%",
    minHeight: 340,
    background: "#0a0a12",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, sans-serif",
  };

  /* Helper: draw one cardboard sheet with hole */
  const renderCardboard = (cx, label, idx) => {
    const x = cx - CARD_W / 2;
    const y = TABLE_Y - CARD_H;
    return (
      <g
        key={idx}
        style={{
          transition: baseTransition,
          transform: `translateX(${0}px)`,
        }}
      >
        {/* Shadow */}
        <rect
          x={x - 1}
          y={y + 4}
          width={CARD_W + 2}
          height={CARD_H}
          rx={2}
          fill="rgba(0,0,0,0.3)"
        />
        {/* Main cardboard body */}
        <rect
          x={x}
          y={y}
          width={CARD_W}
          height={CARD_H}
          rx={2}
          fill="#5c4033"
          stroke="#7a5a45"
          strokeWidth={0.8}
        />
        {/* Lighter face stripe */}
        <rect
          x={x + 1}
          y={y}
          width={CARD_W - 2}
          height={CARD_H}
          rx={1}
          fill="rgba(255,255,255,0.06)"
        />
        {/* Hole — dark circle */}
        <circle
          cx={cx}
          cy={HOLE_Y}
          r={HOLE_R}
          fill="#0a0a12"
          stroke="#3a2a1f"
          strokeWidth={1}
        />
        {/* Hole highlight ring */}
        <circle
          cx={cx}
          cy={HOLE_Y}
          r={HOLE_R + 1.5}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={0.5}
        />
        {/* Stand / base */}
        <rect
          x={cx - 16}
          y={TABLE_Y - 6}
          width={32}
          height={6}
          rx={2}
          fill="#4a3728"
        />
        {/* Label */}
        <text
          x={cx}
          y={TABLE_Y + 18}
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          fontSize={8}
          fontFamily="Inter, system-ui, sans-serif"
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <div style={containerStyle}>
      {/* Ambient glow behind scene */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "15%",
          width: 200,
          height: 200,
          transform: "translate(-50%, -50%)",
          background: step.candleLit
            ? "radial-gradient(ellipse, rgba(255,180,50,0.08) 0%, transparent 70%)"
            : "none",
          pointerEvents: "none",
          transition: baseTransition,
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
            color: "#64b5f6",
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
        viewBox="0 0 640 400"
        style={{
          width: "100%",
          maxWidth: 750,
          height: "auto",
          overflow: "visible",
        }}
      >
        <defs>
          {/* Candle flame gradient */}
          <radialGradient id="p4FlameGrad" cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fff7a0" />
            <stop offset="55%" stopColor="#ffb74d" />
            <stop offset="85%" stopColor="#ff8a00" />
            <stop offset="100%" stopColor="#e65100" stopOpacity="0" />
          </radialGradient>

          {/* Flame outer glow */}
          <radialGradient id="p4FlameGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffb74d" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#ff8a00" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ff6d00" stopOpacity="0" />
          </radialGradient>

          {/* Light beam gradient */}
          <linearGradient id="p4BeamGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffb74d" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#ffe082" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fff9c4" stopOpacity="0.1" />
          </linearGradient>

          {/* Physics blue accent gradient */}
          <linearGradient id="p4BlueAccent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#42a5f5" />
            <stop offset="100%" stopColor="#1565c0" />
          </linearGradient>

          {/* Drop shadow */}
          <filter id="p4Shadow" x="-20%" y="-20%" width="140%" height="140%">
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

          {/* Flame glow filter */}
          <filter id="p4FlameBlur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" />
          </filter>

          {/* Light beam glow */}
          <filter id="p4BeamGlow" x="-5%" y="-50%" width="110%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>

          {/* Animated beam dash */}
          <style>{`
            @keyframes p4BeamFlow {
              0% { stroke-dashoffset: 24; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes p4FlameDance {
              0%, 100% { transform: scaleX(1) translateY(0); }
              25% { transform: scaleX(0.92) translateY(-1px); }
              50% { transform: scaleX(1.05) translateY(0.5px); }
              75% { transform: scaleX(0.96) translateY(-0.5px); }
            }
          `}</style>
        </defs>

        {/* ====== TABLE SURFACE ====== */}
        <rect
          x={40}
          y={TABLE_Y}
          width={560}
          height={10}
          rx={3}
          fill="#3e2723"
          opacity={0.8}
        />
        <rect
          x={40}
          y={TABLE_Y}
          width={560}
          height={2}
          rx={1}
          fill="rgba(255,255,255,0.04)"
        />

        {/* ====== CANDLE ====== */}
        <g filter="url(#p4Shadow)">
          {/* Candle body */}
          <rect
            x={CANDLE_X - 6}
            y={HOLE_Y - 8}
            width={12}
            height={TABLE_Y - HOLE_Y + 8}
            rx={3}
            fill="#f5f0e0"
          />
          {/* Wax texture */}
          <rect
            x={CANDLE_X - 6}
            y={HOLE_Y - 8}
            width={12}
            height={TABLE_Y - HOLE_Y + 8}
            rx={3}
            fill="rgba(200,180,140,0.2)"
          />
          {/* Wick */}
          <line
            x1={CANDLE_X}
            y1={HOLE_Y - 8}
            x2={CANDLE_X}
            y2={HOLE_Y - 16}
            stroke="#333"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          {/* Candle base / holder */}
          <rect
            x={CANDLE_X - 10}
            y={TABLE_Y - 4}
            width={20}
            height={4}
            rx={1.5}
            fill="#8d6e63"
          />
        </g>
        <text
          x={CANDLE_X}
          y={TABLE_Y + 18}
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          fontSize={8}
          fontFamily="Inter, system-ui, sans-serif"
        >
          Candle
        </text>

        {/* ====== FLAME (when lit) ====== */}
        <g
          style={{
            opacity: step.candleLit ? 1 : 0,
            transition: `opacity 0.6s ${TRANSITION_TIMING}`,
          }}
        >
          {/* Large ambient glow */}
          <ellipse
            cx={CANDLE_X}
            cy={HOLE_Y - 25}
            rx={35}
            ry={40}
            fill="url(#p4FlameGlow)"
            filter="url(#p4FlameBlur)"
          />
          {/* Flame shape — teardrop */}
          <g
            style={{
              transformOrigin: `${CANDLE_X}px ${HOLE_Y - 20}px`,
              animation: step.candleLit
                ? "p4FlameDance 2s ease-in-out infinite"
                : "none",
            }}
          >
            {/* Outer flame (orange) */}
            <ellipse
              cx={CANDLE_X}
              cy={HOLE_Y - 24}
              rx={6}
              ry={12}
              fill="#ff8a00"
              opacity={0.7}
            />
            {/* Inner flame */}
            <ellipse
              cx={CANDLE_X}
              cy={HOLE_Y - 22}
              rx={3.5}
              ry={8}
              fill="url(#p4FlameGrad)"
            />
            {/* Flame tip */}
            <ellipse
              cx={CANDLE_X}
              cy={HOLE_Y - 32}
              rx={2}
              ry={4}
              fill="#ffe082"
              opacity={0.8}
            />
          </g>
        </g>

        {/* ====== THREAD (step 1 only) ====== */}
        <line
          x1={CARD_1_X_ALIGNED}
          y1={HOLE_Y}
          x2={CARD_3_X}
          y2={HOLE_Y}
          stroke="#e0e0e0"
          strokeWidth={1}
          strokeDasharray="6,4"
          opacity={step.showThread ? 0.5 : 0}
          style={{
            transition: `opacity 0.5s ${TRANSITION_TIMING}`,
          }}
        />
        {step.showThread && (
          <text
            x={(CARD_1_X_ALIGNED + CARD_3_X) / 2}
            y={HOLE_Y - 14}
            textAnchor="middle"
            fill="rgba(255,255,255,0.35)"
            fontSize={9}
            fontFamily="Inter, system-ui, sans-serif"
            fontStyle="italic"
          >
            Thread through holes
          </text>
        )}

        {/* ====== LIGHT BEAM (steps 2 & 4, when aligned) ====== */}
        <g
          style={{
            opacity: step.lightVisible ? 1 : 0,
            transition: `opacity 0.8s ${TRANSITION_TIMING} ${step.lightVisible ? "0.4s" : "0s"}`,
          }}
        >
          {/* Broad warm glow beam */}
          <line
            x1={CANDLE_X + 8}
            y1={HOLE_Y}
            x2={EYE_X - 20}
            y2={HOLE_Y}
            stroke="url(#p4BeamGrad)"
            strokeWidth={6}
            filter="url(#p4BeamGlow)"
          />
          {/* Core bright beam */}
          <line
            x1={CANDLE_X + 8}
            y1={HOLE_Y}
            x2={EYE_X - 20}
            y2={HOLE_Y}
            stroke="#ffe082"
            strokeWidth={1.5}
            opacity={0.6}
            strokeDasharray="12,12"
            style={{
              animation: step.lightVisible
                ? "p4BeamFlow 1.5s linear infinite"
                : "none",
            }}
          />
          {/* Arrow head on beam */}
          <polygon
            points={`${EYE_X - 22},${HOLE_Y - 5} ${EYE_X - 12},${HOLE_Y} ${EYE_X - 22},${HOLE_Y + 5}`}
            fill="#ffe082"
            opacity={0.5}
          />
        </g>

        {/* ====== BLOCKED INDICATOR (step 3) ====== */}
        <g
          style={{
            opacity: step.displaced ? 1 : 0,
            transition: `opacity 0.6s ${TRANSITION_TIMING} ${step.displaced ? "0.6s" : "0s"}`,
          }}
        >
          {/* Beam from candle hits displaced card */}
          <line
            x1={CANDLE_X + 8}
            y1={HOLE_Y}
            x2={CARD_1_X_DISPLACED + CARD_W / 2 + 4}
            y2={HOLE_Y}
            stroke="#ffb74d"
            strokeWidth={3}
            opacity={0.25}
            filter="url(#p4BeamGlow)"
          />
          {/* Red X mark at blocked point */}
          <g>
            <line
              x1={CARD_1_X_ALIGNED - 10}
              y1={HOLE_Y - 10}
              x2={CARD_1_X_ALIGNED + 10}
              y2={HOLE_Y + 10}
              stroke="#ef5350"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <line
              x1={CARD_1_X_ALIGNED + 10}
              y1={HOLE_Y - 10}
              x2={CARD_1_X_ALIGNED - 10}
              y2={HOLE_Y + 10}
              stroke="#ef5350"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </g>
          {/* "BLOCKED" label */}
          <text
            x={CARD_1_X_ALIGNED}
            y={HOLE_Y - 20}
            textAnchor="middle"
            fill="#ef5350"
            fontSize={10}
            fontWeight={700}
            fontFamily="Inter, system-ui, sans-serif"
            letterSpacing={1}
          >
            BLOCKED
          </text>
          {/* Dashed line showing where original hole was */}
          <line
            x1={CARD_1_X_DISPLACED}
            y1={HOLE_Y}
            x2={CARD_1_X_ALIGNED}
            y2={HOLE_Y}
            stroke="rgba(239,83,80,0.3)"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
          {/* Displacement arrow */}
          <line
            x1={CARD_1_X_ALIGNED}
            y1={TABLE_Y + 30}
            x2={CARD_1_X_DISPLACED}
            y2={TABLE_Y + 30}
            stroke="#ef5350"
            strokeWidth={1.5}
            markerEnd="url(#p4ArrowRed)"
          />
          <text
            x={(CARD_1_X_ALIGNED + CARD_1_X_DISPLACED) / 2}
            y={TABLE_Y + 44}
            textAnchor="middle"
            fill="rgba(239,83,80,0.7)"
            fontSize={8}
            fontFamily="Inter, system-ui, sans-serif"
          >
            Displaced
          </text>
        </g>

        {/* Arrow markers */}
        <defs>
          <marker
            id="p4ArrowRed"
            markerWidth="8"
            markerHeight="6"
            refX="4"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#ef5350" />
          </marker>
        </defs>

        {/* ====== CARDBOARD SHEETS ====== */}
        {/* Card 1 — the one that moves in step 3 */}
        <g
          style={{
            transition: baseTransition,
            transform: `translateX(${step.card1X - CARD_1_X_ALIGNED}px)`,
          }}
        >
          {renderCardboard(CARD_1_X_ALIGNED, "Card 1", "c1")}
        </g>
        {/* Card 2 — always centred */}
        {renderCardboard(CARD_2_X, "Card 2", "c2")}
        {/* Card 3 — always in place */}
        {renderCardboard(CARD_3_X, "Card 3", "c3")}

        {/* ====== EYE (observer) ====== */}
        <g filter="url(#p4Shadow)">
          {/* Eye outline */}
          <ellipse
            cx={EYE_X}
            cy={HOLE_Y}
            rx={16}
            ry={10}
            fill="none"
            stroke={step.lightVisible ? "#64b5f6" : "rgba(255,255,255,0.3)"}
            strokeWidth={2}
            style={{ transition: baseTransition }}
          />
          {/* Iris */}
          <circle
            cx={EYE_X}
            cy={HOLE_Y}
            r={5}
            fill={step.lightVisible ? "#1e88e5" : "#555"}
            style={{ transition: baseTransition }}
          />
          {/* Pupil */}
          <circle
            cx={EYE_X}
            cy={HOLE_Y}
            r={2.5}
            fill={step.lightVisible ? "#0d47a1" : "#222"}
            style={{ transition: baseTransition }}
          />
          {/* Glint */}
          <circle
            cx={EYE_X + 1.5}
            cy={HOLE_Y - 1.5}
            r={1}
            fill={step.lightVisible ? "#fff" : "rgba(255,255,255,0.2)"}
            style={{ transition: baseTransition }}
          />
          {/* Eyelid top line */}
          <path
            d={`M ${EYE_X - 16} ${HOLE_Y} Q ${EYE_X} ${HOLE_Y - 14} ${EYE_X + 16} ${HOLE_Y}`}
            fill="none"
            stroke={step.lightVisible ? "#64b5f6" : "rgba(255,255,255,0.3)"}
            strokeWidth={1.5}
            style={{ transition: baseTransition }}
          />
          {/* Eyelid bottom line */}
          <path
            d={`M ${EYE_X - 16} ${HOLE_Y} Q ${EYE_X} ${HOLE_Y + 14} ${EYE_X + 16} ${HOLE_Y}`}
            fill="none"
            stroke={step.lightVisible ? "#64b5f6" : "rgba(255,255,255,0.3)"}
            strokeWidth={1.5}
            style={{ transition: baseTransition }}
          />
        </g>
        {/* Eye label */}
        <text
          x={EYE_X}
          y={TABLE_Y + 18}
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          fontSize={8}
          fontFamily="Inter, system-ui, sans-serif"
        >
          Observer
        </text>

        {/* Flame visibility indicator near eye */}
        {currentStep > 1 && (
          <g
            style={{
              opacity: 1,
              transition: delayedFade,
            }}
          >
            <text
              x={EYE_X}
              y={HOLE_Y + 30}
              textAnchor="middle"
              fill={step.lightVisible ? "#66bb6a" : "#ef5350"}
              fontSize={10}
              fontWeight={700}
              fontFamily="Inter, system-ui, sans-serif"
              style={{ transition: baseTransition }}
            >
              {step.lightVisible ? "FLAME VISIBLE" : "FLAME HIDDEN"}
            </text>
          </g>
        )}

        {/* ====== STRAIGHT LINE ANNOTATION ====== */}
        {currentStep > 1 && step.lightVisible && (
          <g
            style={{
              opacity: 0.6,
              transition: delayedFade,
            }}
          >
            <line
              x1={CARD_1_X_ALIGNED}
              y1={HOLE_Y + 50}
              x2={CARD_3_X}
              y2={HOLE_Y + 50}
              stroke="#42a5f5"
              strokeWidth={1}
              strokeDasharray="4,3"
            />
            <text
              x={(CARD_1_X_ALIGNED + CARD_3_X) / 2}
              y={HOLE_Y + 65}
              textAnchor="middle"
              fill="#42a5f5"
              fontSize={9}
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight={500}
            >
              Straight-line path
            </text>
          </g>
        )}

        {/* ====== STEP 1 hint ====== */}
        {currentStep === 1 && (
          <g
            style={{
              opacity: 1,
              transition: `opacity 0.6s ${TRANSITION_TIMING}`,
            }}
          >
            <text
              x={CANDLE_X}
              y={HOLE_Y - 55}
              textAnchor="middle"
              fill="rgba(255,255,255,0.3)"
              fontSize={9}
              fontFamily="Inter, system-ui, sans-serif"
              fontStyle="italic"
            >
              Light the candle
            </text>
            {/* Small arrow down to candle wick */}
            <line
              x1={CANDLE_X}
              y1={HOLE_Y - 48}
              x2={CANDLE_X}
              y2={HOLE_Y - 20}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
          </g>
        )}

        {/* ====== FORMULA / KEY MESSAGE ====== */}
        {currentStep > 1 && (
          <g
            style={{
              opacity: 0.7,
              transition: delayedFade,
            }}
          >
            <text
              x={320}
              y={375}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize={11}
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight={500}
            >
              Light travels in a straight line — Rectilinear Propagation
            </text>
            <text
              x={320}
              y={392}
              textAnchor="middle"
              fill="rgba(255,255,255,0.25)"
              fontSize={9.5}
              fontFamily="Inter, system-ui, sans-serif"
            >
              {currentStep === 2 &&
                "All three holes aligned — light passes straight through to the eye"}
              {currentStep === 3 &&
                "Displacing one cardboard breaks the straight-line path — flame disappears"}
              {currentStep === 4 &&
                "Restoring alignment restores the straight-line path — flame reappears"}
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
                  ? "#1e88e5"
                  : s < currentStep
                  ? "rgba(30,136,229,0.4)"
                  : "rgba(255,255,255,0.15)",
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
