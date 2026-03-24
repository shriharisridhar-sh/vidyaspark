import React from "react";

/**
 * P2 Magnetism — Separating Mixtures with a Magnet
 *
 * Interactive SVG canvas that visualises four experiment steps:
 *   1. Setup — Table with mixtures, magnet, and iron rod nearby
 *   2. Hand Separation — Student tries to separate by hand (difficult)
 *   3. Magnet Separates — Iron filings leap to magnet, pins attracted
 *   4. Iron Rod Fails — Iron rod held over mixtures, nothing happens
 *
 * All transitions use CSS transitions on transform / opacity.
 * Receives `currentStep` (1-4) as its only required prop.
 */

const TRANSITION_DURATION = "1.2s";
const TRANSITION_TIMING = "cubic-bezier(0.4, 0, 0.2, 1)";

/* ---- colour palette (Physics blue) ---- */
const BLUE_PRIMARY = "#1565C0";
const BLUE_LIGHT = "#42A5F5";
const BLUE_GLOW = "rgba(21,101,192,0.12)";
const BLUE_ACCENT = "#90CAF9";
const RED_POLE = "#EF5350";
const BLUE_POLE = "#42A5F5";

const stepTitles = {
  1: "Setup: Mixtures, bar magnet, and iron rod on the table",
  2: "Hand separation attempt — very difficult for sand & filings",
  3: "Magnet separates iron filings and steel pins!",
  4: "Iron rod fails — it is NOT a magnet",
};

export default function P2MagnetismCanvas({ currentStep = 1 }) {
  const step = Math.max(1, Math.min(4, currentStep));

  const baseTransition = `all ${TRANSITION_DURATION} ${TRANSITION_TIMING}`;
  const delayedFade = `opacity 0.6s ${TRANSITION_TIMING} 0.9s`;

  /* ---- Magnet position per step ---- */
  const magnetPos = {
    1: { x: 420, y: 60, opacity: 1 },
    2: { x: 420, y: 60, opacity: 0.5 },
    3: { x: 200, y: 90, opacity: 1 },
    4: { x: 420, y: 60, opacity: 0.4 },
  };

  /* ---- Iron rod position per step ---- */
  const rodPos = {
    1: { x: 440, y: 130, opacity: 1 },
    2: { x: 440, y: 130, opacity: 0.5 },
    3: { x: 440, y: 130, opacity: 0.5 },
    4: { x: 200, y: 90, opacity: 1 },
  };

  /* ---- Iron filings scatter (small particles in the dish) ---- */
  const filingBasePositions = [
    { cx: 160, cy: 215 }, { cx: 175, cy: 220 }, { cx: 190, cy: 212 },
    { cx: 205, cy: 222 }, { cx: 220, cy: 216 }, { cx: 235, cy: 220 },
    { cx: 148, cy: 222 }, { cx: 165, cy: 225 }, { cx: 195, cy: 226 },
    { cx: 210, cy: 210 }, { cx: 225, cy: 224 }, { cx: 180, cy: 210 },
    { cx: 240, cy: 214 }, { cx: 155, cy: 218 }, { cx: 200, cy: 218 },
  ];

  /* When magnet is active (step 3), filings rise up toward magnet */
  const getFilingPos = (base, idx) => {
    if (step === 3) {
      const targetX = 200 + (idx % 5) * 12 - 24;
      const targetY = 110 + Math.floor(idx / 5) * 8;
      return { cx: targetX, cy: targetY };
    }
    return base;
  };

  /* ---- Steel pins in the right mixture ---- */
  const pinBasePositions = [
    { x: 380, y: 215, rot: 15 }, { x: 395, y: 220, rot: -20 },
    { x: 410, y: 212, rot: 35 }, { x: 425, y: 218, rot: -10 },
    { x: 440, y: 222, rot: 25 }, { x: 455, y: 215, rot: -30 },
  ];

  const getPinPos = (base, idx) => {
    if (step === 3) {
      return {
        x: 220 + idx * 14,
        y: 130 + (idx % 2) * 6,
        rot: 0,
      };
    }
    return base;
  };

  /* ---- Toothpick positions (always stay put) ---- */
  const toothpickPositions = [
    { x: 385, y: 224, rot: 45 }, { x: 405, y: 228, rot: -15 },
    { x: 430, y: 226, rot: 30 }, { x: 450, y: 224, rot: -40 },
  ];

  /* ---- Hand position for step 2 ---- */
  const handOpacity = step === 2 ? 1 : 0;

  /* ---- "X" failure markers for step 4 ---- */
  const failOpacity = step === 4 ? 1 : 0;

  /* ---- Magnetic field line visibility ---- */
  const fieldOpacity = step === 3 ? 1 : step === 1 ? 0.3 : 0;

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
            background: "rgba(21,101,192,0.15)",
            color: BLUE_LIGHT,
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 12px",
            borderRadius: 12,
            letterSpacing: 0.5,
          }}
        >
          STEP {step} / 4
        </span>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
          {stepTitles[step]}
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
          {/* Magnet body gradient — red pole */}
          <linearGradient id="p2magnetRed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF5350" />
            <stop offset="100%" stopColor="#C62828" />
          </linearGradient>
          {/* Magnet body gradient — blue pole */}
          <linearGradient id="p2magnetBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#42A5F5" />
            <stop offset="100%" stopColor="#1565C0" />
          </linearGradient>

          {/* Iron rod gradient */}
          <linearGradient id="p2ironRod" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#90A4AE" />
            <stop offset="30%" stopColor="#CFD8DC" />
            <stop offset="60%" stopColor="#B0BEC5" />
            <stop offset="100%" stopColor="#78909C" />
          </linearGradient>

          {/* China dish gradient */}
          <linearGradient id="p2dish" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ECEFF1" />
            <stop offset="100%" stopColor="#B0BEC5" />
          </linearGradient>

          {/* Table gradient */}
          <linearGradient id="p2table" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5D4037" />
            <stop offset="100%" stopColor="#4E342E" />
          </linearGradient>

          {/* Sand gradient */}
          <radialGradient id="p2sand" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDD835" />
            <stop offset="100%" stopColor="#F9A825" />
          </radialGradient>

          {/* Shadow filter */}
          <filter id="p2shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="3" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Magnetic field line glow */}
          <filter id="p2fieldGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feComponentTransfer in="blur">
              <feFuncA type="linear" slope="0.6" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Animated dash for field lines */}
          <style>{`
            @keyframes p2FieldDash {
              to { stroke-dashoffset: -20; }
            }
            @keyframes p2FilingPulse {
              0%, 100% { opacity: 0.7; }
              50% { opacity: 1; }
            }
            @keyframes p2HandShake {
              0%, 100% { transform: translate(0,0); }
              25% { transform: translate(2px, -1px); }
              50% { transform: translate(-1px, 1px); }
              75% { transform: translate(1px, -2px); }
            }
            @keyframes p2XPulse {
              0%, 100% { opacity: 0.8; }
              50% { opacity: 1; }
            }
          `}</style>
        </defs>

        {/* ====== TABLE SURFACE ====== */}
        <rect
          x="30"
          y="250"
          width="540"
          height="12"
          rx="3"
          fill="url(#p2table)"
          opacity="0.7"
        />
        {/* Table front edge highlight */}
        <rect
          x="30"
          y="250"
          width="540"
          height="2"
          rx="1"
          fill="rgba(255,255,255,0.06)"
        />

        {/* ====== CHINA DISH (left — sand + iron filings) ====== */}
        <g filter="url(#p2shadow)">
          {/* Dish body - ellipse */}
          <ellipse cx="195" cy="235" rx="70" ry="20" fill="url(#p2dish)" />
          {/* Dish rim highlight */}
          <ellipse
            cx="195"
            cy="233"
            rx="68"
            ry="17"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.8"
          />
          {/* Sand fill inside dish */}
          <ellipse cx="195" cy="236" rx="58" ry="12" fill="url(#p2sand)" opacity="0.6" />
        </g>

        {/* Dish label */}
        <text
          x="195"
          y="270"
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          fontSize="8"
          fontFamily="Inter, system-ui, sans-serif"
          letterSpacing="1"
        >
          SAND + IRON FILINGS
        </text>

        {/* ====== Iron filings (dark particles in the dish) ====== */}
        {filingBasePositions.map((base, idx) => {
          const pos = getFilingPos(base, idx);
          return (
            <rect
              key={`filing-${idx}`}
              x={pos.cx - 2}
              y={pos.cy - 1}
              width={4}
              height={2}
              rx="0.5"
              fill="#37474F"
              opacity={step === 3 ? 0.95 : 0.8}
              style={{
                transition: baseTransition,
                animation:
                  step === 3
                    ? `p2FilingPulse 1.5s ease-in-out ${idx * 0.08}s infinite`
                    : "none",
              }}
              transform={`rotate(${(idx * 37) % 180}, ${pos.cx}, ${pos.cy})`}
            />
          );
        })}

        {/* ====== A4 PAPER (right — steel pins + toothpicks) ====== */}
        <g filter="url(#p2shadow)">
          <rect
            x="360"
            y="210"
            width="110"
            height="44"
            rx="2"
            fill="#FAFAFA"
            opacity="0.9"
          />
          {/* Paper edge shadow */}
          <rect
            x="360"
            y="252"
            width="110"
            height="2"
            rx="1"
            fill="rgba(0,0,0,0.1)"
          />
        </g>

        {/* Paper label */}
        <text
          x="415"
          y="270"
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          fontSize="8"
          fontFamily="Inter, system-ui, sans-serif"
          letterSpacing="1"
        >
          PINS + TOOTHPICKS
        </text>

        {/* ====== Toothpicks (beige, always stay) ====== */}
        {toothpickPositions.map((tp, idx) => (
          <line
            key={`tp-${idx}`}
            x1={tp.x}
            y1={tp.y}
            x2={tp.x + 16}
            y2={tp.y + 4}
            stroke="#D7CCC8"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
            transform={`rotate(${tp.rot}, ${tp.x + 8}, ${tp.y + 2})`}
          />
        ))}

        {/* ====== Steel pins ====== */}
        {pinBasePositions.map((base, idx) => {
          const pos = getPinPos(base, idx);
          return (
            <line
              key={`pin-${idx}`}
              x1={pos.x}
              y1={pos.y}
              x2={pos.x + 12}
              y2={pos.y + 2}
              stroke="#B0BEC5"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ transition: baseTransition }}
              transform={`rotate(${pos.rot}, ${pos.x + 6}, ${pos.y + 1})`}
            />
          );
        })}

        {/* ====== BAR MAGNET ====== */}
        <g
          style={{
            transition: baseTransition,
            transform: `translate(${magnetPos[step].x}px, ${magnetPos[step].y}px)`,
            opacity: magnetPos[step].opacity,
          }}
          filter="url(#p2shadow)"
        >
          {/* Red (N) half */}
          <rect x="0" y="0" width="50" height="22" rx="3" fill="url(#p2magnetRed)" />
          <rect
            x="0"
            y="0"
            width="50"
            height="22"
            rx="3"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.5"
          />
          <text
            x="25"
            y="15"
            textAnchor="middle"
            fill="rgba(255,255,255,0.9)"
            fontSize="10"
            fontWeight="700"
            fontFamily="Inter, system-ui, sans-serif"
          >
            N
          </text>

          {/* Blue (S) half */}
          <rect x="50" y="0" width="50" height="22" rx="3" fill="url(#p2magnetBlue)" />
          <rect
            x="50"
            y="0"
            width="50"
            height="22"
            rx="3"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.5"
          />
          <text
            x="75"
            y="15"
            textAnchor="middle"
            fill="rgba(255,255,255,0.9)"
            fontSize="10"
            fontWeight="700"
            fontFamily="Inter, system-ui, sans-serif"
          >
            S
          </text>

          {/* Magnet label below */}
          <text
            x="50"
            y="36"
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="8"
            fontFamily="Inter, system-ui, sans-serif"
            letterSpacing="1"
          >
            BAR MAGNET
          </text>
        </g>

        {/* ====== MAGNETIC FIELD LINES (visible in step 1 faint, step 3 vivid) ====== */}
        <g
          style={{
            opacity: fieldOpacity,
            transition: `opacity 0.8s ${TRANSITION_TIMING}`,
          }}
          filter="url(#p2fieldGlow)"
        >
          {/* Field lines from N pole (left) curving out and around */}
          {[
            "M 220 100 C 190 80, 160 75, 140 95",
            "M 220 105 C 195 90, 170 88, 150 108",
            "M 220 110 C 200 100, 180 100, 160 118",
            "M 300 100 C 330 80, 360 75, 380 95",
            "M 300 105 C 325 90, 350 88, 370 108",
            "M 300 110 C 320 100, 340 100, 360 118",
          ].map((d, idx) => (
            <path
              key={`field-${idx}`}
              d={d}
              stroke={idx < 3 ? RED_POLE : BLUE_POLE}
              strokeWidth="1.2"
              fill="none"
              strokeDasharray="5,5"
              opacity="0.5"
              style={{
                animation: step === 3 ? `p2FieldDash 1.5s linear infinite` : "none",
                transition: baseTransition,
              }}
            />
          ))}

          {/* Downward field lines toward the dish (step 3 — attraction) */}
          {step === 3 && (
            <>
              {[
                "M 215 112 C 210 140, 200 170, 195 200",
                "M 230 112 C 225 145, 215 175, 205 200",
                "M 245 112 C 238 148, 220 178, 210 200",
                "M 260 112 C 250 150, 230 180, 215 200",
                "M 275 112 C 260 150, 240 178, 220 198",
              ].map((d, idx) => (
                <path
                  key={`field-down-${idx}`}
                  d={d}
                  stroke={BLUE_ACCENT}
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="4,4"
                  opacity="0.4"
                  style={{
                    animation: `p2FieldDash 1.2s linear ${idx * 0.15}s infinite`,
                  }}
                />
              ))}
            </>
          )}
        </g>

        {/* ====== IRON ROD ====== */}
        <g
          style={{
            transition: baseTransition,
            transform: `translate(${rodPos[step].x}px, ${rodPos[step].y}px)`,
            opacity: rodPos[step].opacity,
          }}
          filter="url(#p2shadow)"
        >
          <rect x="0" y="0" width="90" height="12" rx="6" fill="url(#p2ironRod)" />
          {/* Metallic highlight */}
          <rect
            x="10"
            y="2"
            width="70"
            height="3"
            rx="1.5"
            fill="rgba(255,255,255,0.2)"
          />
          {/* Label */}
          <text
            x="45"
            y="26"
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="8"
            fontFamily="Inter, system-ui, sans-serif"
            letterSpacing="1"
          >
            IRON ROD
          </text>
        </g>

        {/* ====== HAND (step 2) ====== */}
        <g
          style={{
            opacity: handOpacity,
            transition: `opacity 0.6s ${TRANSITION_TIMING}`,
            animation: step === 2 ? "p2HandShake 0.6s ease-in-out infinite" : "none",
          }}
        >
          {/* Simplified hand reaching into the dish */}
          {/* Arm */}
          <rect x="170" y="150" width="14" height="50" rx="7" fill="#FFAB91" opacity="0.9" />
          {/* Palm */}
          <ellipse cx="177" cy="205" rx="14" ry="10" fill="#FFAB91" opacity="0.9" />
          {/* Fingers */}
          <rect x="165" y="200" width="6" height="18" rx="3" fill="#FF8A65" opacity="0.8" />
          <rect x="173" y="202" width="6" height="20" rx="3" fill="#FF8A65" opacity="0.8" />
          <rect x="181" y="200" width="6" height="18" rx="3" fill="#FF8A65" opacity="0.8" />

          {/* Frustration indicators */}
          <text
            x="215"
            y="165"
            fill="#EF5350"
            fontSize="10"
            fontWeight="600"
            fontFamily="Inter, system-ui, sans-serif"
          >
            Too difficult!
          </text>
          <text
            x="215"
            y="178"
            fill="rgba(255,255,255,0.35)"
            fontSize="9"
            fontFamily="Inter, system-ui, sans-serif"
          >
            Particles too small
          </text>

          {/* Easier side — hand near paper */}
          <rect x="400" y="175" width="12" height="30" rx="6" fill="#FFAB91" opacity="0.7" />
          <ellipse cx="406" cy="210" rx="10" ry="8" fill="#FFAB91" opacity="0.7" />
          <text
            x="430"
            y="195"
            fill="#66BB6A"
            fontSize="10"
            fontWeight="600"
            fontFamily="Inter, system-ui, sans-serif"
          >
            Easier
          </text>
          <text
            x="430"
            y="208"
            fill="rgba(255,255,255,0.35)"
            fontSize="9"
            fontFamily="Inter, system-ui, sans-serif"
          >
            Pins are big enough
          </text>
        </g>

        {/* ====== Step 3 — Success annotations ====== */}
        {step === 3 && (
          <g
            style={{
              opacity: 1,
              transition: delayedFade,
            }}
          >
            {/* Arrow showing filings moving up */}
            <path
              d="M 195 200 C 195 170, 200 145, 210 120"
              stroke={BLUE_LIGHT}
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="4,3"
              opacity="0.6"
            />
            <text
              x="115"
              y="170"
              fill={BLUE_LIGHT}
              fontSize="9"
              fontWeight="600"
              fontFamily="Inter, system-ui, sans-serif"
            >
              Iron filings
            </text>
            <text
              x="115"
              y="182"
              fill={BLUE_LIGHT}
              fontSize="9"
              fontWeight="600"
              fontFamily="Inter, system-ui, sans-serif"
            >
              leap to magnet!
            </text>

            {/* Checkmark near pins */}
            <text
              x="340"
              y="140"
              fill="#66BB6A"
              fontSize="9"
              fontWeight="600"
              fontFamily="Inter, system-ui, sans-serif"
            >
              Steel pins attracted
            </text>

            {/* X near toothpicks */}
            <text
              x="370"
              y="245"
              fill="rgba(255,255,255,0.4)"
              fontSize="9"
              fontFamily="Inter, system-ui, sans-serif"
            >
              Plastic & sand left behind
            </text>
          </g>
        )}

        {/* ====== Step 4 — Iron rod failure indicators ====== */}
        <g
          style={{
            opacity: failOpacity,
            transition: `opacity 0.8s ${TRANSITION_TIMING}`,
            animation: step === 4 ? "p2XPulse 2s ease-in-out infinite" : "none",
          }}
        >
          {/* Big X over left dish */}
          <line x1="155" y1="195" x2="235" y2="245" stroke="#EF5350" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          <line x1="235" y1="195" x2="155" y2="245" stroke="#EF5350" strokeWidth="3" strokeLinecap="round" opacity="0.6" />

          {/* Big X over right paper */}
          <line x1="370" y1="200" x2="460" y2="245" stroke="#EF5350" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          <line x1="460" y1="200" x2="370" y2="245" stroke="#EF5350" strokeWidth="3" strokeLinecap="round" opacity="0.6" />

          {/* Label */}
          <text
            x="300"
            y="310"
            textAnchor="middle"
            fill="#EF5350"
            fontSize="11"
            fontWeight="700"
            fontFamily="Inter, system-ui, sans-serif"
          >
            Nothing is attracted!
          </text>
          <text
            x="300"
            y="325"
            textAnchor="middle"
            fill="rgba(255,255,255,0.45)"
            fontSize="9.5"
            fontFamily="Inter, system-ui, sans-serif"
          >
            The iron rod is a magnetic material but NOT a magnet
          </text>

          {/* Question mark bubbles */}
          <text
            x="160"
            y="185"
            fill="rgba(255,255,255,0.5)"
            fontSize="16"
            fontWeight="700"
            fontFamily="Inter, system-ui, sans-serif"
          >
            ?
          </text>
          <text
            x="460"
            y="195"
            fill="rgba(255,255,255,0.5)"
            fontSize="16"
            fontWeight="700"
            fontFamily="Inter, system-ui, sans-serif"
          >
            ?
          </text>
        </g>

        {/* ====== Step 1 — Setup hint ====== */}
        {step === 1 && (
          <g style={{ opacity: 1, transition: `opacity 0.6s ${TRANSITION_TIMING}` }}>
            {/* Arrow from magnet toward dish */}
            <path
              d="M 420 85 C 380 100, 320 130, 250 180"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="4,4"
            />
            <text
              x="310"
              y="125"
              fill="rgba(255,255,255,0.3)"
              fontSize="10"
              fontFamily="Inter, system-ui, sans-serif"
              fontStyle="italic"
            >
              Can these tools separate the mixtures?
            </text>
          </g>
        )}

        {/* ====== FORMULA / KEY MESSAGE (bottom) ====== */}
        {step > 1 && (
          <g
            style={{
              opacity: 0.8,
              transition: delayedFade,
            }}
          >
            <text
              x="300"
              y="355"
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="11"
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight="500"
            >
              {step === 2 && "Magnetic materials: iron, steel  |  Non-magnetic: sand, plastic"}
              {step === 3 && "A magnet attracts magnetic materials (iron filings, steel pins)"}
              {step === 4 && "A magnetic material is NOT a magnet — iron rod cannot attract"}
            </text>
            <text
              x="300"
              y="370"
              textAnchor="middle"
              fill="rgba(255,255,255,0.25)"
              fontSize="9.5"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {step === 2 && "Hand separation is easy for large objects, impossible for tiny particles"}
              {step === 3 && "Non-magnetic materials (sand, plastic toothpicks) are unaffected"}
              {step === 4 && "Only a magnet can attract — being made of iron is not enough"}
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
              width: step === s ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background:
                step === s
                  ? BLUE_PRIMARY
                  : s < step
                  ? "rgba(21,101,192,0.4)"
                  : "rgba(255,255,255,0.15)",
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
