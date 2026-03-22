import React from "react";

/**
 * P3 Sound — What is Sound: Vibrating Ruler & Voice Box
 *
 * Interactive SVG canvas that visualises four experiment steps:
 *   1. Setup — ruler on table edge, throat silhouette, balloon laid out as materials
 *   2. Vibrating ruler — ruler clamped to table, vibrating with wave lines emanating
 *   3. Vocal cords — cross-section of throat with vibrating vocal cords, hand touching
 *   4. Balloon — stretched balloon releasing air with animated sound waves
 *
 * All transitions use CSS transitions on transform / opacity.
 * Receives `currentStep` (1-4) as its only required prop.
 */

const TRANSITION_DURATION = "1.2s";
const TRANSITION_TIMING = "cubic-bezier(0.4, 0, 0.2, 1)";

const stepTitles = {
  1: "Setup: Materials — ruler, voice box, balloon",
  2: "Vibrating ruler produces sound",
  3: "Feeling the voice box vibrations",
  4: "Balloon membrane vibrates to produce sound",
};

export default function P3SoundCanvas({ currentStep = 1 }) {
  const baseTransition = `all ${TRANSITION_DURATION} ${TRANSITION_TIMING}`;
  const delayedFade = `opacity 0.6s ${TRANSITION_TIMING} 0.9s`;

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
      {/* Subtle radial glow — physics blue */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          width: 500,
          height: 300,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse, rgba(33,150,243,0.07) 0%, transparent 70%)",
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
        viewBox="0 0 600 400"
        style={{
          width: "100%",
          maxWidth: 700,
          height: "auto",
          overflow: "visible",
        }}
      >
        <defs>
          {/* Physics blue gradient */}
          <linearGradient id="p3-blueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#42a5f5" />
            <stop offset="100%" stopColor="#1565c0" />
          </linearGradient>

          {/* Deep blue gradient for accents */}
          <linearGradient id="p3-deepBlue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e88e5" />
            <stop offset="100%" stopColor="#0d47a1" />
          </linearGradient>

          {/* Table wood gradient */}
          <linearGradient id="p3-woodGrain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8d6e63" />
            <stop offset="50%" stopColor="#795548" />
            <stop offset="100%" stopColor="#6d4c41" />
          </linearGradient>
          <linearGradient id="p3-woodTop" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a1887f" />
            <stop offset="50%" stopColor="#bcaaa4" />
            <stop offset="100%" stopColor="#a1887f" />
          </linearGradient>

          {/* Ruler gradient — yellow plastic */}
          <linearGradient id="p3-rulerGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffd54f" />
            <stop offset="50%" stopColor="#ffee58" />
            <stop offset="100%" stopColor="#ffd54f" />
          </linearGradient>

          {/* Skin tone gradient */}
          <linearGradient id="p3-skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4a574" />
            <stop offset="100%" stopColor="#c68c5a" />
          </linearGradient>

          {/* Throat interior gradient */}
          <linearGradient id="p3-throatGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef9a9a" />
            <stop offset="50%" stopColor="#e57373" />
            <stop offset="100%" stopColor="#ef5350" />
          </linearGradient>

          {/* Balloon gradient — red */}
          <radialGradient id="p3-balloonGrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#ef5350" />
            <stop offset="60%" stopColor="#e53935" />
            <stop offset="100%" stopColor="#c62828" />
          </radialGradient>

          {/* Balloon gradient — deflating */}
          <radialGradient id="p3-balloonDeflated" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#ef5350" />
            <stop offset="100%" stopColor="#b71c1c" />
          </radialGradient>

          {/* Sound wave gradient */}
          <linearGradient id="p3-waveGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#42a5f5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#42a5f5" stopOpacity="0" />
          </linearGradient>

          {/* Drop shadow filter */}
          <filter id="p3-shadow" x="-20%" y="-20%" width="140%" height="140%">
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

          {/* Glow filter for sound waves */}
          <filter id="p3-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feComponentTransfer in="blur">
              <feFuncA type="linear" slope="0.6" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ============================================================ */}
        {/* STEP 1 — SETUP: materials laid out                          */}
        {/* ============================================================ */}
        <g
          style={{
            opacity: currentStep === 1 ? 1 : 0,
            transition: baseTransition,
            pointerEvents: currentStep === 1 ? "auto" : "none",
          }}
        >
          {/* Table surface */}
          <rect x="30" y="240" width="540" height="16" rx="3" fill="url(#p3-woodGrain)" />
          <rect x="30" y="236" width="540" height="6" rx="2" fill="url(#p3-woodTop)" />
          {/* Table legs */}
          <rect x="60" y="256" width="14" height="60" rx="2" fill="url(#p3-woodGrain)" opacity="0.8" />
          <rect x="526" y="256" width="14" height="60" rx="2" fill="url(#p3-woodGrain)" opacity="0.8" />

          {/* Ruler on table */}
          <g filter="url(#p3-shadow)">
            <rect x="60" y="218" width="160" height="18" rx="2" fill="url(#p3-rulerGrad)" />
            {/* Ruler markings */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
              <line
                key={`mark-${i}`}
                x1={70 + i * 10}
                y1={218}
                x2={70 + i * 10}
                y2={i % 5 === 0 ? 226 : 222}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth={i % 5 === 0 ? 0.8 : 0.5}
              />
            ))}
            <text x="140" y="232" textAnchor="middle" fill="rgba(0,0,0,0.5)" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
              cm
            </text>
          </g>
          {/* Ruler label */}
          <text x="140" y="210" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="Inter, system-ui, sans-serif">
            Plastic Ruler
          </text>

          {/* Throat / person silhouette */}
          <g transform="translate(300, 120)">
            {/* Head circle */}
            <circle cx="0" cy="0" r="30" fill="url(#p3-skinGrad)" opacity="0.8" />
            {/* Neck */}
            <rect x="-12" y="28" width="24" height="40" rx="8" fill="url(#p3-skinGrad)" opacity="0.8" />
            {/* Shoulders */}
            <path d="M -12 65 C -12 65, -50 80, -55 100 L 55 100 C 50 80, 12 65, 12 65" fill="#5c6bc0" opacity="0.7" />
            {/* Throat indicator */}
            <circle cx="0" cy="44" r="4" fill="none" stroke="#42a5f5" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.7" />
          </g>
          <text x="300" y="235" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="Inter, system-ui, sans-serif">
            Your Throat
          </text>

          {/* Balloon */}
          <g transform="translate(480, 190)">
            <ellipse cx="0" cy="-20" rx="30" ry="38" fill="url(#p3-balloonGrad)" opacity="0.85" />
            {/* Balloon knot */}
            <path d="M -4 18 L 0 24 L 4 18" fill="#c62828" />
            {/* String */}
            <line x1="0" y1="24" x2="0" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            {/* Highlight */}
            <ellipse cx="-10" cy="-30" rx="6" ry="10" fill="rgba(255,255,255,0.2)" />
          </g>
          <text x="480" y="252" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="Inter, system-ui, sans-serif">
            Balloon
          </text>

          {/* "Materials ready" hint */}
          <text x="300" y="340" textAnchor="middle" fill="rgba(100,181,246,0.4)" fontSize="11" fontFamily="Inter, system-ui, sans-serif" fontStyle="italic">
            Materials: plastic ruler, your voice box, and a balloon
          </text>
        </g>

        {/* ============================================================ */}
        {/* STEP 2 — VIBRATING RULER                                     */}
        {/* ============================================================ */}
        <g
          style={{
            opacity: currentStep === 2 ? 1 : 0,
            transition: baseTransition,
            pointerEvents: currentStep === 2 ? "auto" : "none",
          }}
        >
          {/* Table */}
          <rect x="30" y="230" width="300" height="20" rx="3" fill="url(#p3-woodGrain)" />
          <rect x="30" y="226" width="300" height="6" rx="2" fill="url(#p3-woodTop)" />
          <rect x="60" y="250" width="14" height="70" rx="2" fill="url(#p3-woodGrain)" opacity="0.8" />
          <rect x="286" y="250" width="14" height="70" rx="2" fill="url(#p3-woodGrain)" opacity="0.8" />

          {/* Clamp hand silhouette on table edge */}
          <g transform="translate(280, 190)">
            <path
              d="M -10 30 C -10 20, -5 10, 5 8 L 20 8 L 20 40 L 5 40 C -5 40, -10 38, -10 30"
              fill="url(#p3-skinGrad)"
              opacity="0.7"
            />
            {/* Thumb */}
            <ellipse cx="8" cy="6" rx="8" ry="5" fill="url(#p3-skinGrad)" opacity="0.7" />
          </g>

          {/* Ruler — clamped portion on table */}
          <rect x="200" y="212" width="130" height="14" rx="2" fill="url(#p3-rulerGrad)" opacity="0.9" />

          {/* Ruler — vibrating free end with animation */}
          <g>
            <rect
              x="330"
              y="212"
              width="120"
              height="14"
              rx="2"
              fill="url(#p3-rulerGrad)"
              style={{ transformOrigin: "330px 219px" }}
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 330 219; 4 330 219; -4 330 219; 3 330 219; -3 330 219; 0 330 219"
                dur="0.3s"
                repeatCount="indefinite"
              />
            </rect>
            {/* Ruler markings on free end */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
              <line
                key={`fmark-${i}`}
                x1={335 + i * 10}
                y1={212}
                x2={335 + i * 10}
                y2={i % 5 === 0 ? 220 : 216}
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="0.5"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 330 219; 4 330 219; -4 330 219; 3 330 219; -3 330 219; 0 330 219"
                  dur="0.3s"
                  repeatCount="indefinite"
                />
              </line>
            ))}

            {/* Motion blur lines — vibration indicator */}
            <line x1="450" y1="200" x2="450" y2="238" stroke="rgba(100,181,246,0.3)" strokeWidth="1" strokeDasharray="2,3">
              <animate attributeName="opacity" values="0.5;0.1;0.5" dur="0.15s" repeatCount="indefinite" />
            </line>
            <line x1="430" y1="202" x2="430" y2="236" stroke="rgba(100,181,246,0.2)" strokeWidth="1" strokeDasharray="2,3">
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="0.18s" repeatCount="indefinite" />
            </line>
          </g>

          {/* Sound waves radiating from ruler tip */}
          <g filter="url(#p3-glow)">
            {[1, 2, 3, 4].map((i) => (
              <path
                key={`wave-r-${i}`}
                d={`M ${460 + i * 20} ${219 - i * 12} Q ${470 + i * 20} 219, ${460 + i * 20} ${219 + i * 12}`}
                fill="none"
                stroke="#42a5f5"
                strokeWidth={2.5 - i * 0.4}
                strokeLinecap="round"
              >
                <animate
                  attributeName="opacity"
                  values="0.7;0.1;0.7"
                  dur={`${1 + i * 0.3}s`}
                  repeatCount="indefinite"
                />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 8,0; 0,0"
                  dur={`${1 + i * 0.3}s`}
                  repeatCount="indefinite"
                />
              </path>
            ))}
          </g>

          {/* Vibration label */}
          <text x="400" y="170" textAnchor="middle" fill="#64b5f6" fontSize="11" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">
            Vibrating!
          </text>
          <path d="M 400 174 L 420 200" stroke="rgba(100,181,246,0.4)" strokeWidth="1" strokeDasharray="3,2" />

          {/* "Sound" label near waves */}
          <text x="530" y="215" textAnchor="middle" fill="rgba(100,181,246,0.6)" fontSize="10" fontFamily="Inter, system-ui, sans-serif">
            Sound
          </text>
          <text x="530" y="228" textAnchor="middle" fill="rgba(100,181,246,0.6)" fontSize="10" fontFamily="Inter, system-ui, sans-serif">
            Waves
          </text>

          {/* Table edge label */}
          <text x="165" y="265" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="Inter, system-ui, sans-serif" letterSpacing="1">
            TABLE EDGE
          </text>

          {/* Annotation text at bottom */}
          <text x="300" y="340" textAnchor="middle" fill="rgba(100,181,246,0.5)" fontSize="11" fontFamily="Inter, system-ui, sans-serif">
            The ruler vibrates to and fro, producing a buzzing sound
          </text>
          <text x="300" y="358" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="Inter, system-ui, sans-serif">
            Vibration = back-and-forth motion = SOUND
          </text>
        </g>

        {/* ============================================================ */}
        {/* STEP 3 — VOCAL CORDS / VOICE BOX                            */}
        {/* ============================================================ */}
        <g
          style={{
            opacity: currentStep === 3 ? 1 : 0,
            transition: baseTransition,
            pointerEvents: currentStep === 3 ? "auto" : "none",
          }}
        >
          {/* Throat cross-section — outer shape */}
          <g transform="translate(200, 60)">
            {/* Neck outline */}
            <path
              d="M 60 0 C 90 0, 120 10, 130 40 L 135 120 C 135 160, 120 180, 100 200
                 L 100 240 C 100 250, 80 260, 60 260
                 C 40 260, 20 250, 20 240 L 20 200
                 C 0 180, -15 160, -15 120 L -10 40 C 0 10, 30 0, 60 0"
              fill="url(#p3-skinGrad)"
              opacity="0.5"
              stroke="rgba(196,145,100,0.4)"
              strokeWidth="1"
            />

            {/* Interior throat/trachea tube */}
            <path
              d="M 40 30 C 40 30, 35 60, 35 100 L 35 220
                 C 35 230, 50 240, 60 240
                 C 70 240, 85 230, 85 220 L 85 100 C 85 60, 80 30, 80 30"
              fill="url(#p3-throatGrad)"
              opacity="0.4"
              stroke="rgba(239,83,80,0.3)"
              strokeWidth="1"
            />

            {/* Vocal cords — the vibrating part */}
            <g transform="translate(60, 130)">
              {/* Left vocal cord */}
              <path d="M -22 -3 C -12 -6, -4 -2, 0 0" stroke="#e53935" strokeWidth="3" fill="none">
                <animate
                  attributeName="d"
                  values="M -22 -3 C -12 -6, -4 -2, 0 0;
                          M -22 -3 C -12 -8, -4 -4, -1 -2;
                          M -22 -3 C -12 -2, -4 2, 1 2;
                          M -22 -3 C -12 -6, -4 -2, 0 0"
                  dur="0.15s"
                  repeatCount="indefinite"
                />
              </path>
              {/* Right vocal cord */}
              <path d="M 0 0 C 4 -2, 12 -6, 22 -3" stroke="#e53935" strokeWidth="3" fill="none">
                <animate
                  attributeName="d"
                  values="M 0 0 C 4 -2, 12 -6, 22 -3;
                          M -1 -2 C 4 -4, 12 -8, 22 -3;
                          M 1 2 C 4 2, 12 -2, 22 -3;
                          M 0 0 C 4 -2, 12 -6, 22 -3"
                  dur="0.15s"
                  repeatCount="indefinite"
                />
              </path>

              {/* Gap between cords — opening vibrating */}
              <ellipse cx="0" cy="-1" rx="2" ry="3" fill="#b71c1c" opacity="0.6">
                <animate
                  attributeName="rx"
                  values="2;4;1;3;2"
                  dur="0.15s"
                  repeatCount="indefinite"
                />
              </ellipse>

              {/* Vibration energy indicator lines */}
              {[1, 2, 3].map((i) => (
                <circle
                  key={`vc-wave-${i}`}
                  cx="0"
                  cy="-1"
                  r={6 + i * 6}
                  fill="none"
                  stroke="#42a5f5"
                  strokeWidth={1.5 - i * 0.3}
                >
                  <animate
                    attributeName="opacity"
                    values="0.5;0.1;0.5"
                    dur={`${0.6 + i * 0.3}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="r"
                    values={`${6 + i * 6};${10 + i * 6};${6 + i * 6}`}
                    dur={`${0.6 + i * 0.3}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
            </g>

            {/* Label: Vocal Cords */}
            <line x1="110" y1="130" x2="140" y2="130" stroke="rgba(100,181,246,0.5)" strokeWidth="1" strokeDasharray="3,2" />
            <text x="145" y="126" fill="#64b5f6" fontSize="10" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">
              Vocal Cords
            </text>
            <text x="145" y="140" fill="rgba(100,181,246,0.5)" fontSize="9" fontFamily="Inter, system-ui, sans-serif">
              (Vibrating!)
            </text>
          </g>

          {/* Hand touching throat — right side */}
          <g transform="translate(380, 140)">
            {/* Forearm */}
            <path
              d="M 80 80 C 60 60, 40 30, 20 10"
              stroke="url(#p3-skinGrad)"
              strokeWidth="20"
              strokeLinecap="round"
              fill="none"
              opacity="0.7"
            />
            {/* Hand / fingers on throat */}
            <g transform="translate(0, 0)">
              {/* Four fingers */}
              {[0, 1, 2, 3].map((i) => (
                <ellipse
                  key={`finger-${i}`}
                  cx={8 + i * 10}
                  cy={4 + i * 3}
                  rx="6"
                  ry="14"
                  fill="url(#p3-skinGrad)"
                  opacity="0.8"
                  transform={`rotate(${-15 + i * 5} ${8 + i * 10} ${4 + i * 3})`}
                />
              ))}
            </g>

            {/* Vibration feedback indicators on fingers */}
            {[0, 1, 2].map((i) => (
              <g key={`vib-${i}`}>
                <line
                  x1={12 + i * 10}
                  y1={-10 - i * 2}
                  x2={12 + i * 10}
                  y2={-18 - i * 2}
                  stroke="#42a5f5"
                  strokeWidth="1.5"
                >
                  <animate
                    attributeName="opacity"
                    values="0.8;0.2;0.8"
                    dur={`${0.3 + i * 0.1}s`}
                    repeatCount="indefinite"
                  />
                </line>
              </g>
            ))}
          </g>

          {/* "Feel the vibration" callout */}
          <text x="450" y="120" textAnchor="middle" fill="#64b5f6" fontSize="11" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">
            Feel the vibration!
          </text>
          <text x="450" y="136" textAnchor="middle" fill="rgba(100,181,246,0.5)" fontSize="9" fontFamily="Inter, system-ui, sans-serif">
            Place fingers on your throat
          </text>

          {/* Speaking indicator — mouth sound waves */}
          <g transform="translate(200, 60)">
            <text x="60" y="-12" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="Inter, system-ui, sans-serif">
              Speaking...
            </text>
            {[1, 2, 3].map((i) => (
              <path
                key={`mouth-wave-${i}`}
                d={`M ${60 - i * 15} ${-20 - i * 8} Q 60 ${-28 - i * 8}, ${60 + i * 15} ${-20 - i * 8}`}
                fill="none"
                stroke="#42a5f5"
                strokeWidth={1.5 - i * 0.3}
                strokeLinecap="round"
              >
                <animate
                  attributeName="opacity"
                  values="0.5;0.15;0.5"
                  dur={`${0.8 + i * 0.4}s`}
                  repeatCount="indefinite"
                />
              </path>
            ))}
          </g>

          {/* Bottom annotation */}
          <text x="300" y="345" textAnchor="middle" fill="rgba(100,181,246,0.5)" fontSize="11" fontFamily="Inter, system-ui, sans-serif">
            Vocal cords vibrate when you speak — stop speaking, vibrations stop
          </text>
          <text x="300" y="363" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="Inter, system-ui, sans-serif">
            Voice = vibration of vocal cords
          </text>
        </g>

        {/* ============================================================ */}
        {/* STEP 4 — BALLOON SOUND                                       */}
        {/* ============================================================ */}
        <g
          style={{
            opacity: currentStep === 4 ? 1 : 0,
            transition: baseTransition,
            pointerEvents: currentStep === 4 ? "auto" : "none",
          }}
        >
          {/* Hand holding balloon */}
          <g transform="translate(200, 100)">
            {/* Forearm from left */}
            <path
              d="M -60 100 C -30 80, 0 60, 20 50"
              stroke="url(#p3-skinGrad)"
              strokeWidth="22"
              strokeLinecap="round"
              fill="none"
              opacity="0.7"
            />
            {/* Fingers pinching balloon neck */}
            <ellipse cx="28" cy="44" rx="8" ry="12" fill="url(#p3-skinGrad)" opacity="0.8" transform="rotate(-20 28 44)" />
            <ellipse cx="42" cy="42" rx="7" ry="11" fill="url(#p3-skinGrad)" opacity="0.8" transform="rotate(10 42 42)" />
          </g>

          {/* Balloon — partially deflated, stretched opening */}
          <g transform="translate(300, 150)">
            {/* Balloon body — slightly wrinkled from deflation */}
            <ellipse cx="0" cy="0" rx="55" ry="70" fill="url(#p3-balloonDeflated)" opacity="0.85">
              <animate
                attributeName="rx"
                values="55;52;55;53;55"
                dur="0.4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="ry"
                values="70;67;70;68;70"
                dur="0.4s"
                repeatCount="indefinite"
              />
            </ellipse>

            {/* Balloon highlight */}
            <ellipse cx="-15" cy="-25" rx="12" ry="18" fill="rgba(255,255,255,0.15)" />

            {/* Balloon neck — stretched opening */}
            <path d="M -8 70 C -8 80, -14 90, -20 95" stroke="#c62828" strokeWidth="5" fill="none" strokeLinecap="round">
              <animate
                attributeName="d"
                values="M -8 70 C -8 80, -14 90, -20 95;
                        M -8 70 C -8 82, -16 92, -22 96;
                        M -8 70 C -8 78, -12 88, -18 94;
                        M -8 70 C -8 80, -14 90, -20 95"
                dur="0.2s"
                repeatCount="indefinite"
              />
            </path>

            {/* Air escaping — animated lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={`air-${i}`}
                x1={-22 - i * 4}
                y1={96 + i * 3}
                x2={-35 - i * 8}
                y2={105 + i * 6}
                stroke="rgba(100,181,246,0.5)"
                strokeWidth={2 - i * 0.3}
                strokeLinecap="round"
              >
                <animate
                  attributeName="opacity"
                  values="0.7;0.1;0.7"
                  dur={`${0.3 + i * 0.15}s`}
                  repeatCount="indefinite"
                />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -6,4; 0,0"
                  dur={`${0.3 + i * 0.15}s`}
                  repeatCount="indefinite"
                />
              </line>
            ))}

            {/* Vibrating membrane label */}
            <line x1="58" y1="0" x2="90" y2="-10" stroke="rgba(100,181,246,0.4)" strokeWidth="1" strokeDasharray="3,2" />
            <text x="95" y="-14" fill="#64b5f6" fontSize="10" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">
              Membrane
            </text>
            <text x="95" y="-2" fill="rgba(100,181,246,0.5)" fontSize="9" fontFamily="Inter, system-ui, sans-serif">
              Vibrating!
            </text>
          </g>

          {/* Sound waves radiating from balloon opening */}
          <g filter="url(#p3-glow)">
            {[1, 2, 3, 4, 5].map((i) => (
              <path
                key={`bwave-${i}`}
                d={`M ${255 - i * 14} ${260 + i * 10}
                    Q ${250 - i * 18} ${270 + i * 14}, ${258 - i * 14} ${280 + i * 18}`}
                fill="none"
                stroke="#42a5f5"
                strokeWidth={2.5 - i * 0.35}
                strokeLinecap="round"
              >
                <animate
                  attributeName="opacity"
                  values="0.6;0.1;0.6"
                  dur={`${0.6 + i * 0.25}s`}
                  repeatCount="indefinite"
                />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -5,4; 0,0"
                  dur={`${0.6 + i * 0.25}s`}
                  repeatCount="indefinite"
                />
              </path>
            ))}
          </g>

          {/* Sound label */}
          <text x="180" y="330" textAnchor="middle" fill="rgba(100,181,246,0.6)" fontSize="10" fontFamily="Inter, system-ui, sans-serif">
            Sound Waves
          </text>

          {/* Squealing sound visual indicator */}
          <g transform="translate(300, 50)">
            <text x="0" y="0" textAnchor="middle" fill="#64b5f6" fontSize="13" fontWeight="700" fontFamily="Inter, system-ui, sans-serif" letterSpacing="2">
              SQUEAL!
            </text>
            {/* Musical note icons */}
            <text x="-60" y="-5" fill="rgba(100,181,246,0.4)" fontSize="16" fontFamily="serif">
              ♪
              <animate attributeName="opacity" values="0.5;0.2;0.5" dur="0.8s" repeatCount="indefinite" />
            </text>
            <text x="55" y="5" fill="rgba(100,181,246,0.4)" fontSize="14" fontFamily="serif">
              ♫
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1s" repeatCount="indefinite" />
            </text>
          </g>

          {/* Conclusion banner */}
          <g>
            <rect x="120" y="348" width="360" height="34" rx="8" fill="rgba(33,150,243,0.1)" stroke="rgba(100,181,246,0.25)" strokeWidth="1" />
            <text x="300" y="362" textAnchor="middle" fill="#64b5f6" fontSize="11" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">
              Conclusion: Sound is produced by vibrating bodies
            </text>
            <text x="300" y="377" textAnchor="middle" fill="rgba(100,181,246,0.5)" fontSize="9" fontFamily="Inter, system-ui, sans-serif">
              Ruler vibrates, vocal cords vibrate, balloon membrane vibrates = SOUND
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
                  ? "#1e88e5"
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
