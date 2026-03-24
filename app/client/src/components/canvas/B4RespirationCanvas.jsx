import React, { useMemo } from 'react';

/**
 * B4 Respiration — "Why Do We Need Air?"
 *
 * Interactive SVG canvas showing four activities that demonstrate
 * why we breathe constantly.
 *
 * Step 1: Breath-holding challenge — students hold breath, stopwatch ticking
 * Step 2: Exercise and breathing rate — exercise groups, bar chart comparison
 * Step 3: The body at rest — cutaway view of organs working even while still
 * Step 4: Straw breathing — restricted airflow, healthy vs damaged lungs
 */

const TRANSITION = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
const FADE_TRANSITION = 'opacity 1.5s ease 0.3s';
const DELAYED_FADE = 'opacity 1.5s ease 0.8s';
const FONT = "'Inter', system-ui, sans-serif";

export default function B4RespirationCanvas({ currentStep = 1 }) {
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
        {/* ===== DEFS ===== */}
        <defs>
          {/* Background glow — biology teal */}
          <radialGradient id={`bg-${uid}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#0d1a18" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>

          {/* Lung gradient */}
          <radialGradient id={`lung-${uid}`} cx="45%" cy="40%">
            <stop offset="0%" stopColor="#E57373" />
            <stop offset="100%" stopColor="#B71C1C" />
          </radialGradient>

          {/* Lung expanded gradient */}
          <radialGradient id={`lungExp-${uid}`} cx="45%" cy="40%">
            <stop offset="0%" stopColor="#EF9A9A" />
            <stop offset="100%" stopColor="#C62828" />
          </radialGradient>

          {/* Damaged lung gradient */}
          <radialGradient id={`lungDmg-${uid}`} cx="45%" cy="40%">
            <stop offset="0%" stopColor="#8D6E63" />
            <stop offset="100%" stopColor="#4E342E" />
          </radialGradient>

          {/* Trachea gradient */}
          <linearGradient id={`trachea-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#EF9A9A" />
            <stop offset="50%" stopColor="#FFCDD2" />
            <stop offset="100%" stopColor="#EF9A9A" />
          </linearGradient>

          {/* Heart gradient */}
          <radialGradient id={`heart-${uid}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor="#F44336" />
            <stop offset="100%" stopColor="#B71C1C" />
          </radialGradient>

          {/* Brain gradient */}
          <radialGradient id={`brain-${uid}`} cx="50%" cy="40%">
            <stop offset="0%" stopColor="#CE93D8" />
            <stop offset="100%" stopColor="#7B1FA2" />
          </radialGradient>

          {/* Stomach gradient */}
          <radialGradient id={`stomach-${uid}`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="#FFB74D" />
            <stop offset="100%" stopColor="#E65100" />
          </radialGradient>

          {/* Stopwatch face */}
          <radialGradient id={`swFace-${uid}`} cx="50%" cy="45%">
            <stop offset="0%" stopColor="#263238" />
            <stop offset="100%" stopColor="#0D1B1E" />
          </radialGradient>

          {/* Bar chart colors */}
          <linearGradient id={`barRest-${uid}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#00796B" />
            <stop offset="100%" stopColor="#4DB6AC" />
          </linearGradient>
          <linearGradient id={`barExer-${uid}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#E65100" />
            <stop offset="100%" stopColor="#FF8A65" />
          </linearGradient>

          {/* Oxygen particle gradient */}
          <radialGradient id={`o2-${uid}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor="#80DEEA" />
            <stop offset="100%" stopColor="#00ACC1" />
          </radialGradient>

          {/* Body silhouette gradient */}
          <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,137,123,0.15)" />
            <stop offset="100%" stopColor="rgba(0,77,64,0.08)" />
          </linearGradient>

          {/* Straw gradient */}
          <linearGradient id={`straw-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E0E0E0" />
            <stop offset="50%" stopColor="#FAFAFA" />
            <stop offset="100%" stopColor="#BDBDBD" />
          </linearGradient>

          {/* Filters */}
          <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`bigGlow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`shadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
          </filter>

          {/* Sparkle */}
          <radialGradient id={`sparkle-${uid}`}>
            <stop offset="0%" stopColor="#69F0AE" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#69F0AE" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ===== BACKGROUND ===== */}
        <rect width="800" height="560" fill={`url(#bg-${uid})`} />

        {/* Subtle biology hex grid */}
        <g opacity="0.025">
          {Array.from({ length: 12 }, (_, row) =>
            Array.from({ length: 16 }, (_, col) => {
              const x = col * 55 + (row % 2 ? 28 : 0);
              const y = row * 48;
              return (
                <polygon
                  key={`hex-${row}-${col}`}
                  points={`${x},${y - 16} ${x + 14},${y - 8} ${x + 14},${y + 8} ${x},${y + 16} ${x - 14},${y + 8} ${x - 14},${y - 8}`}
                  fill="none"
                  stroke="#4DB6AC"
                  strokeWidth="0.5"
                />
              );
            })
          )}
        </g>

        {/* ===== STEP TITLE ===== */}
        <text
          x="400"
          y="32"
          textAnchor="middle"
          fill="#00897B"
          fontSize="14"
          fontFamily={FONT}
          fontWeight="600"
          letterSpacing="2"
          style={{ transition: FADE_TRANSITION }}
        >
          {step === 1 && 'STEP 1 \u2014 THE BREATH-HOLDING CHALLENGE'}
          {step === 2 && 'STEP 2 \u2014 EXERCISE AND BREATHING RATE'}
          {step === 3 && 'STEP 3 \u2014 THE BODY AT REST'}
          {step === 4 && 'STEP 4 \u2014 BREATHING THROUGH A STRAW'}
        </text>

        {/* ================= STEP 1: BREATH-HOLDING CHALLENGE ================= */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 1 ? 1 : 0,
            transform: step === 1 ? 'translateY(0)' : 'translateY(-30px)',
          }}
        >
          {/* Stopwatch — center-left */}
          <g transform="translate(120, 90)">
            {/* Stopwatch body */}
            <circle cx="100" cy="130" r="75" fill={`url(#swFace-${uid})`}
              stroke="#37474F" strokeWidth="4" />
            <circle cx="100" cy="130" r="70" fill="none" stroke="#455A64" strokeWidth="1" />

            {/* Stopwatch button top */}
            <rect x="93" y="48" width="14" height="16" rx="3" fill="#455A64" stroke="#546E7A" strokeWidth="1" />

            {/* Tick marks */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const x1 = 100 + Math.cos(angle) * 62;
              const y1 = 130 + Math.sin(angle) * 62;
              const x2 = 100 + Math.cos(angle) * 68;
              const y2 = 130 + Math.sin(angle) * 68;
              return (
                <line key={`tick-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#78909C" strokeWidth={i % 3 === 0 ? 2 : 1} />
              );
            })}

            {/* Second hand — animated rotation */}
            <line x1="100" y1="130" x2="100" y2="72" stroke="#EF5350" strokeWidth="2" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate"
                from="0 100 130" to="360 100 130" dur="10s" repeatCount="indefinite" />
            </line>
            <circle cx="100" cy="130" r="4" fill="#EF5350" />

            {/* Time display */}
            <text x="100" y="165" textAnchor="middle" fill="#80CBC4" fontSize="20"
              fontFamily={FONT} fontWeight="700" letterSpacing="2">
              <animate attributeName="opacity" values="1;0.6;1" dur="1s" repeatCount="indefinite" />
              00:30
            </text>

            <text x="100" y="235" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11"
              fontFamily={FONT} fontWeight="500">
              How long can you hold it?
            </text>
          </g>

          {/* Student figures — right side */}
          <g transform="translate(400, 100)">
            {/* Student 1 — holding breath, red face */}
            <g transform="translate(0, 0)">
              {/* Body */}
              <rect x="10" y="40" width="40" height="60" rx="8" fill="rgba(0,137,123,0.15)"
                stroke="rgba(0,137,123,0.3)" strokeWidth="1" />
              {/* Head — red tint showing effort */}
              <circle cx="30" cy="25" r="20" fill="rgba(239,83,80,0.25)" stroke="rgba(239,83,80,0.5)" strokeWidth="1.5">
                <animate attributeName="fill" values="rgba(239,83,80,0.2);rgba(239,83,80,0.45);rgba(239,83,80,0.2)"
                  dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Eyes — squinting */}
              <line x1="22" y1="22" x2="28" y2="22" stroke="#FFAB91" strokeWidth="2" strokeLinecap="round" />
              <line x1="32" y1="22" x2="38" y2="22" stroke="#FFAB91" strokeWidth="2" strokeLinecap="round" />
              {/* Hand pinching nose */}
              <ellipse cx="30" cy="30" rx="5" ry="4" fill="rgba(255,171,145,0.6)" />
              {/* Speech bubble — gasp */}
              <rect x="50" y="0" width="70" height="28" rx="8" fill="rgba(239,83,80,0.15)"
                stroke="rgba(239,83,80,0.4)" strokeWidth="1" />
              <text x="85" y="19" textAnchor="middle" fill="#EF9A9A" fontSize="11"
                fontFamily={FONT} fontWeight="600">
                *gasp!*
              </text>
            </g>

            {/* Student 2 — holding breath */}
            <g transform="translate(130, 20)">
              <rect x="10" y="40" width="40" height="60" rx="8" fill="rgba(0,137,123,0.15)"
                stroke="rgba(0,137,123,0.3)" strokeWidth="1" />
              <circle cx="30" cy="25" r="20" fill="rgba(239,83,80,0.2)" stroke="rgba(239,83,80,0.4)" strokeWidth="1.5">
                <animate attributeName="fill" values="rgba(239,83,80,0.15);rgba(239,83,80,0.35);rgba(239,83,80,0.15)"
                  dur="2.3s" repeatCount="indefinite" />
              </circle>
              <line x1="22" y1="22" x2="28" y2="22" stroke="#FFAB91" strokeWidth="2" strokeLinecap="round" />
              <line x1="32" y1="22" x2="38" y2="22" stroke="#FFAB91" strokeWidth="2" strokeLinecap="round" />
              <ellipse cx="30" cy="30" rx="5" ry="4" fill="rgba(255,171,145,0.6)" />
              {/* Timer above */}
              <text x="30" y="-5" textAnchor="middle" fill="#FFD54F" fontSize="12"
                fontFamily={FONT} fontWeight="700">
                23s
              </text>
            </g>

            {/* Student 3 — already gave up, breathing */}
            <g transform="translate(260, 10)">
              <rect x="10" y="40" width="40" height="60" rx="8" fill="rgba(0,137,123,0.15)"
                stroke="rgba(0,137,123,0.3)" strokeWidth="1" />
              <circle cx="30" cy="25" r="20" fill="rgba(0,137,123,0.15)" stroke="rgba(0,137,123,0.3)" strokeWidth="1.5" />
              {/* Open mouth — breathing */}
              <circle cx="22" cy="22" r="2" fill="#80CBC4" />
              <circle cx="38" cy="22" r="2" fill="#80CBC4" />
              <ellipse cx="30" cy="32" rx="4" ry="3" fill="rgba(128,203,196,0.4)" />
              {/* Air lines exhaling */}
              <line x1="38" y1="30" x2="50" y2="28" stroke="rgba(128,203,196,0.4)" strokeWidth="1" strokeDasharray="3 2">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite" />
              </line>
              <line x1="38" y1="33" x2="52" y2="34" stroke="rgba(128,203,196,0.4)" strokeWidth="1" strokeDasharray="3 2">
                <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1.8s" repeatCount="indefinite" />
              </line>
              <text x="30" y="-5" textAnchor="middle" fill="#A5D6A7" fontSize="10"
                fontFamily={FONT} fontWeight="500">
                15s - gave up!
              </text>
            </g>
          </g>

          {/* Lungs diagram — bottom center */}
          <g transform="translate(300, 280)">
            {/* Trachea */}
            <rect x="90" y="0" width="16" height="40" rx="5" fill={`url(#trachea-${uid})`} opacity="0.6" />
            {/* Bronchi split */}
            <path d="M98 40 Q80 55 55 70" fill="none" stroke="#EF9A9A" strokeWidth="3" opacity="0.5" />
            <path d="M98 40 Q116 55 140 70" fill="none" stroke="#EF9A9A" strokeWidth="3" opacity="0.5" />
            {/* Left lung */}
            <ellipse cx="50" cy="100" rx="45" ry="55" fill={`url(#lung-${uid})`} opacity="0.5">
              <animate attributeName="rx" values="43;47;43" dur="3s" repeatCount="indefinite" />
              <animate attributeName="ry" values="53;57;53" dur="3s" repeatCount="indefinite" />
            </ellipse>
            {/* Right lung */}
            <ellipse cx="145" cy="100" rx="45" ry="55" fill={`url(#lung-${uid})`} opacity="0.5">
              <animate attributeName="rx" values="43;47;43" dur="3s" repeatCount="indefinite" />
              <animate attributeName="ry" values="53;57;53" dur="3s" repeatCount="indefinite" />
            </ellipse>
            {/* Air flow arrows — paused/blocked */}
            <text x="98" y="-8" textAnchor="middle" fill="#EF5350" fontSize="20" fontFamily={FONT} fontWeight="800">
              <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
              &#x2715;
            </text>
            <text x="98" y="-22" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9"
              fontFamily={FONT} fontWeight="500">
              Air blocked!
            </text>
          </g>

          {/* Bottom question box */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 1 ? 1 : 0 }}>
            <rect x="150" y="460" width="500" height="50" rx="12" fill="rgba(0,137,123,0.1)"
              stroke="rgba(0,137,123,0.3)" strokeWidth="1.5" />
            <text x="400" y="483" textAnchor="middle" fill="#4DB6AC" fontSize="13"
              fontFamily={FONT} fontWeight="600">
              Why can&apos;t we stop breathing? What happens if we try?
            </text>
            <text x="400" y="500" textAnchor="middle" fill="#80CBC4" fontSize="11"
              fontFamily={FONT} fontWeight="400">
              The brain forces us to breathe — it needs air to survive
            </text>
          </g>
        </g>

        {/* ================= STEP 2: EXERCISE AND BREATHING RATE ================= */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 2 ? 1 : 0,
            transform: step === 2 ? 'translateY(0)' : step < 2 ? 'translateY(40px)' : 'translateY(-30px)',
          }}
        >
          {/* Exercise figures — left side */}
          <g transform="translate(40, 60)">
            <text x="105" y="0" textAnchor="middle" fill="#FF8A65" fontSize="12"
              fontFamily={FONT} fontWeight="600" letterSpacing="1">
              3 EXERCISE GROUPS
            </text>

            {/* Jumping figure */}
            <g transform="translate(0, 20)">
              {/* Stick figure jumping */}
              <circle cx="35" cy="25" r="12" fill="none" stroke="#FF8A65" strokeWidth="2" />
              <line x1="35" y1="37" x2="35" y2="70" stroke="#FF8A65" strokeWidth="2" />
              {/* Arms up */}
              <line x1="35" y1="48" x2="15" y2="35" stroke="#FF8A65" strokeWidth="2" strokeLinecap="round" />
              <line x1="35" y1="48" x2="55" y2="35" stroke="#FF8A65" strokeWidth="2" strokeLinecap="round" />
              {/* Legs spread */}
              <line x1="35" y1="70" x2="20" y2="95" stroke="#FF8A65" strokeWidth="2" strokeLinecap="round" />
              <line x1="35" y1="70" x2="50" y2="95" stroke="#FF8A65" strokeWidth="2" strokeLinecap="round" />
              {/* Bounce animation */}
              <animateTransform attributeName="transform" type="translate"
                values="0,0;0,-8;0,0" dur="0.8s" repeatCount="indefinite" />
            </g>
            <text x="35" y="130" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9"
              fontFamily={FONT} fontWeight="500">
              Jumping
            </text>

            {/* Running figure */}
            <g transform="translate(70, 20)">
              <circle cx="35" cy="25" r="12" fill="none" stroke="#4DB6AC" strokeWidth="2" />
              <line x1="35" y1="37" x2="35" y2="65" stroke="#4DB6AC" strokeWidth="2" />
              {/* Arms swinging */}
              <line x1="35" y1="48" x2="18" y2="58" stroke="#4DB6AC" strokeWidth="2" strokeLinecap="round">
                <animate attributeName="x2" values="18;52;18" dur="0.6s" repeatCount="indefinite" />
              </line>
              <line x1="35" y1="48" x2="52" y2="58" stroke="#4DB6AC" strokeWidth="2" strokeLinecap="round">
                <animate attributeName="x2" values="52;18;52" dur="0.6s" repeatCount="indefinite" />
              </line>
              {/* Legs running */}
              <line x1="35" y1="65" x2="20" y2="90" stroke="#4DB6AC" strokeWidth="2" strokeLinecap="round">
                <animate attributeName="x2" values="20;50;20" dur="0.6s" repeatCount="indefinite" />
              </line>
              <line x1="35" y1="65" x2="50" y2="90" stroke="#4DB6AC" strokeWidth="2" strokeLinecap="round">
                <animate attributeName="x2" values="50;20;50" dur="0.6s" repeatCount="indefinite" />
              </line>
            </g>
            <text x="105" y="130" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9"
              fontFamily={FONT} fontWeight="500">
              Running
            </text>

            {/* Toe-touch figure */}
            <g transform="translate(140, 20)">
              <circle cx="35" cy="20" r="12" fill="none" stroke="#CE93D8" strokeWidth="2">
                <animate attributeName="cy" values="20;45;20" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <line x1="35" y1="32" x2="35" y2="65" stroke="#CE93D8" strokeWidth="2">
                <animate attributeName="y1" values="32;55;32" dur="1.5s" repeatCount="indefinite" />
              </line>
              {/* Arms reaching down */}
              <line x1="35" y1="48" x2="25" y2="60" stroke="#CE93D8" strokeWidth="2" strokeLinecap="round">
                <animate attributeName="y2" values="60;85;60" dur="1.5s" repeatCount="indefinite" />
              </line>
              <line x1="35" y1="48" x2="45" y2="60" stroke="#CE93D8" strokeWidth="2" strokeLinecap="round">
                <animate attributeName="y2" values="60;85;60" dur="1.5s" repeatCount="indefinite" />
              </line>
              {/* Legs */}
              <line x1="35" y1="65" x2="25" y2="90" stroke="#CE93D8" strokeWidth="2" strokeLinecap="round" />
              <line x1="35" y1="65" x2="45" y2="90" stroke="#CE93D8" strokeWidth="2" strokeLinecap="round" />
            </g>
            <text x="175" y="130" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9"
              fontFamily={FONT} fontWeight="500">
              Toe-touches
            </text>
          </g>

          {/* Breathing rate counter — center area */}
          <g transform="translate(280, 70)">
            <rect x="0" y="0" width="210" height="55" rx="10" fill="rgba(0,77,64,0.2)"
              stroke="rgba(0,137,123,0.4)" strokeWidth="1.5" />
            <text x="105" y="20" textAnchor="middle" fill="#80CBC4" fontSize="10"
              fontFamily={FONT} fontWeight="500" letterSpacing="1">
              BREATHING RATE COUNTER
            </text>
            <text x="60" y="42" textAnchor="middle" fill="#4DB6AC" fontSize="16"
              fontFamily={FONT} fontWeight="700">
              Before: 16
            </text>
            <text x="155" y="42" textAnchor="middle" fill="#FF8A65" fontSize="16"
              fontFamily={FONT} fontWeight="700">
              After: 32
            </text>
            <text x="105" y="42" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="14"
              fontFamily={FONT}>
              &#x2192;
            </text>
            <text x="105" y="42" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="10"
              fontFamily={FONT} fontWeight="400">
            </text>
          </g>

          {/* Bar chart — right side */}
          <g transform="translate(510, 55)">
            <text x="120" y="0" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="12"
              fontFamily={FONT} fontWeight="600">
              Breaths per Minute
            </text>

            {/* Y-axis */}
            <line x1="30" y1="15" x2="30" y2="210" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            {/* X-axis */}
            <line x1="30" y1="210" x2="230" y2="210" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

            {/* Y-axis labels */}
            {[0, 10, 20, 30, 40].map((v, i) => (
              <g key={`ylab-${i}`}>
                <text x="25" y={210 - i * 48 + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9"
                  fontFamily={FONT}>{v}</text>
                <line x1="28" y1={210 - i * 48} x2="230" y2={210 - i * 48}
                  stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </g>
            ))}

            {/* Bars — Jumping */}
            <rect x="45" y={210 - 16 * 4.8} width="25" height={16 * 4.8} rx="3"
              fill={`url(#barRest-${uid})`} opacity="0.7" />
            <rect x="75" y={210 - 36 * 4.8} width="25" height={36 * 4.8} rx="3"
              fill={`url(#barExer-${uid})`} opacity="0.8">
              <animate attributeName="height" values={`${34 * 4.8};${38 * 4.8};${34 * 4.8}`}
                dur="2s" repeatCount="indefinite" />
              <animate attributeName="y" values={`${210 - 34 * 4.8};${210 - 38 * 4.8};${210 - 34 * 4.8}`}
                dur="2s" repeatCount="indefinite" />
            </rect>

            {/* Bars — Running */}
            <rect x="115" y={210 - 15 * 4.8} width="25" height={15 * 4.8} rx="3"
              fill={`url(#barRest-${uid})`} opacity="0.7" />
            <rect x="145" y={210 - 34 * 4.8} width="25" height={34 * 4.8} rx="3"
              fill={`url(#barExer-${uid})`} opacity="0.8">
              <animate attributeName="height" values={`${32 * 4.8};${36 * 4.8};${32 * 4.8}`}
                dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="y" values={`${210 - 32 * 4.8};${210 - 36 * 4.8};${210 - 32 * 4.8}`}
                dur="2.2s" repeatCount="indefinite" />
            </rect>

            {/* Bars — Toe-touches */}
            <rect x="185" y={210 - 17 * 4.8} width="25" height={17 * 4.8} rx="3"
              fill={`url(#barRest-${uid})`} opacity="0.7" />
            <rect x="215" y={210 - 28 * 4.8} width="25" height={28 * 4.8} rx="3"
              fill={`url(#barExer-${uid})`} opacity="0.8">
              <animate attributeName="height" values={`${26 * 4.8};${30 * 4.8};${26 * 4.8}`}
                dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="y" values={`${210 - 26 * 4.8};${210 - 30 * 4.8};${210 - 26 * 4.8}`}
                dur="1.8s" repeatCount="indefinite" />
            </rect>

            {/* X-axis labels */}
            <text x="72" y="228" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9"
              fontFamily={FONT}>Jumping</text>
            <text x="145" y="228" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9"
              fontFamily={FONT}>Running</text>
            <text x="215" y="228" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9"
              fontFamily={FONT}>Toe-touch</text>

            {/* Legend */}
            <rect x="60" y="240" width="12" height="8" rx="2" fill={`url(#barRest-${uid})`} opacity="0.7" />
            <text x="78" y="248" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily={FONT}>Rest</text>
            <rect x="110" y="240" width="12" height="8" rx="2" fill={`url(#barExer-${uid})`} opacity="0.8" />
            <text x="128" y="248" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily={FONT}>Exercise</text>
          </g>

          {/* Animated lungs — bottom left showing expansion */}
          <g transform="translate(60, 230)">
            <text x="98" y="0" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10"
              fontFamily={FONT} fontWeight="500">
              Lungs expand faster!
            </text>
            {/* Trachea */}
            <rect x="90" y="10" width="14" height="30" rx="4" fill={`url(#trachea-${uid})`} opacity="0.5" />
            {/* Left lung */}
            <ellipse cx="60" cy="65" rx="38" ry="42" fill={`url(#lungExp-${uid})`} opacity="0.4">
              <animate attributeName="rx" values="35;42;35" dur="1s" repeatCount="indefinite" />
              <animate attributeName="ry" values="40;46;40" dur="1s" repeatCount="indefinite" />
            </ellipse>
            {/* Right lung */}
            <ellipse cx="135" cy="65" rx="38" ry="42" fill={`url(#lungExp-${uid})`} opacity="0.4">
              <animate attributeName="rx" values="35;42;35" dur="1s" repeatCount="indefinite" />
              <animate attributeName="ry" values="40;46;40" dur="1s" repeatCount="indefinite" />
            </ellipse>
            {/* O2 particles flowing in */}
            {[0, 1, 2, 3, 4].map((i) => (
              <circle key={`o2p-${i}`} r="3" fill={`url(#o2-${uid})`} opacity="0.7">
                <animate attributeName="cx" values={`${97};${50 + i * 20}`}
                  dur={`${1.2 + i * 0.15}s`} repeatCount="indefinite" />
                <animate attributeName="cy" values="5;65"
                  dur={`${1.2 + i * 0.15}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.3;0" dur={`${1.2 + i * 0.15}s`} repeatCount="indefinite" />
              </circle>
            ))}
            {/* Up arrow — faster rate */}
            <text x="195" y="60" fill="#FF8A65" fontSize="28" fontFamily={FONT} fontWeight="700">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
              &#x2191;
            </text>
            <text x="193" y="80" fill="#FF8A65" fontSize="10" fontFamily={FONT} fontWeight="500">
              2x faster
            </text>
          </g>

          {/* Bottom insight box */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 2 ? 1 : 0 }}>
            <rect x="100" y="460" width="600" height="50" rx="12" fill="rgba(0,137,123,0.1)"
              stroke="rgba(0,137,123,0.3)" strokeWidth="1.5" />
            <text x="400" y="483" textAnchor="middle" fill="#4DB6AC" fontSize="13"
              fontFamily={FONT} fontWeight="600">
              Muscles need more air when they work harder — so we breathe faster!
            </text>
            <text x="400" y="500" textAnchor="middle" fill="#80CBC4" fontSize="11"
              fontFamily={FONT} fontWeight="400">
              Breathing rate nearly doubles after just one minute of exercise
            </text>
          </g>
        </g>

        {/* ================= STEP 3: BODY AT REST ================= */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 3 ? 1 : 0,
            transform: step === 3 ? 'translateY(0)' : step < 3 ? 'translateY(40px)' : 'translateY(-30px)',
          }}
        >
          {/* Body silhouette — center */}
          <g transform="translate(250, 50)">
            {/* Sitting figure outline */}
            <path
              d="M150 60 Q150 30 150 20 Q150 0 150 0
                 M120 120 Q130 90 150 70 Q170 90 180 120
                 M150 70 L150 200
                 M150 200 Q130 240 120 280
                 M150 200 Q170 240 180 280"
              fill="none" stroke="rgba(0,137,123,0.3)" strokeWidth="2" strokeLinecap="round"
            />
            {/* Head */}
            <circle cx="150" cy="15" r="22" fill={`url(#body-${uid})`}
              stroke="rgba(0,137,123,0.3)" strokeWidth="1.5" />
            {/* Closed eyes — resting */}
            <path d="M140 12 Q143 15 146 12" fill="none" stroke="#4DB6AC" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M154 12 Q157 15 160 12" fill="none" stroke="#4DB6AC" strokeWidth="1.5" strokeLinecap="round" />

            {/* "Zzz" — sleeping/resting */}
            <text x="178" y="5" fill="#80CBC4" fontSize="14" fontFamily={FONT} fontWeight="600" opacity="0.6">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
              z
            </text>
            <text x="190" y="-5" fill="#80CBC4" fontSize="12" fontFamily={FONT} fontWeight="600" opacity="0.4">
              <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
              z
            </text>
            <text x="198" y="-15" fill="#80CBC4" fontSize="10" fontFamily={FONT} fontWeight="600" opacity="0.3">
              <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite" />
              z
            </text>

            {/* Chest breathing animation — subtle rise/fall */}
            <ellipse cx="150" cy="120" rx="35" ry="25" fill="none"
              stroke="rgba(0,137,123,0.2)" strokeWidth="1" strokeDasharray="4 3">
              <animate attributeName="ry" values="24;27;24" dur="4s" repeatCount="indefinite" />
            </ellipse>
          </g>

          {/* Internal organs — cutaway view around the silhouette */}
          {/* Brain — top */}
          <g transform="translate(240, 45)" style={{ transition: 'opacity 1.5s ease 0.3s', opacity: step === 3 ? 1 : 0 }}>
            {/* Brain shape */}
            <ellipse cx="30" cy="22" rx="28" ry="18" fill={`url(#brain-${uid})`} opacity="0.6" />
            {/* Folds */}
            <path d="M10 18 Q18 12 25 20 Q32 12 42 18" fill="none" stroke="rgba(206,147,216,0.5)" strokeWidth="1" />
            <path d="M15 26 Q22 20 30 26 Q38 20 48 26" fill="none" stroke="rgba(206,147,216,0.5)" strokeWidth="1" />
            {/* Electrical signals */}
            {[0, 1, 2].map((i) => (
              <circle key={`sig-${i}`} cx={15 + i * 15} cy={15 + (i % 2) * 10} r="2" fill="#E1BEE7" opacity="0.8">
                <animate attributeName="opacity" values="0.2;0.9;0.2"
                  dur={`${0.8 + i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="r" values="1;3;1"
                  dur={`${0.8 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            ))}
            {/* Label */}
            <rect x="-30" y="45" width="60" height="20" rx="5" fill="rgba(123,31,162,0.2)"
              stroke="rgba(206,147,216,0.4)" strokeWidth="1" />
            <text x="0" y="59" textAnchor="middle" fill="#CE93D8" fontSize="10"
              fontFamily={FONT} fontWeight="600">
              Brain
            </text>
            <text x="0" y="80" textAnchor="middle" fill="rgba(206,147,216,0.6)" fontSize="8"
              fontFamily={FONT} fontWeight="400">
              Always thinking
            </text>

            {/* Leader line to body */}
            <line x1="30" y1="40" x2="155" y2="65" stroke="rgba(206,147,216,0.3)" strokeWidth="1" strokeDasharray="4 3" />
          </g>

          {/* Heart — center-left */}
          <g transform="translate(480, 140)" style={{ transition: 'opacity 1.5s ease 0.6s', opacity: step === 3 ? 1 : 0 }}>
            {/* Heart shape */}
            <path d="M25 18 Q25 5 15 5 Q5 5 5 18 Q5 28 25 40 Q45 28 45 18 Q45 5 35 5 Q25 5 25 18"
              fill={`url(#heart-${uid})`} opacity="0.7">
              <animate attributeName="transform" type="scale"
                values="1;1.08;1" dur="0.8s" repeatCount="indefinite" />
            </path>
            {/* Pulse rings */}
            <circle cx="25" cy="22" r="20" fill="none" stroke="rgba(244,67,54,0.3)" strokeWidth="1">
              <animate attributeName="r" values="22;35;22" dur="0.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="0.8s" repeatCount="indefinite" />
            </circle>
            {/* Label */}
            <rect x="50" y="10" width="70" height="20" rx="5" fill="rgba(183,28,28,0.2)"
              stroke="rgba(244,67,54,0.4)" strokeWidth="1" />
            <text x="85" y="24" textAnchor="middle" fill="#EF9A9A" fontSize="10"
              fontFamily={FONT} fontWeight="600">
              Heart
            </text>
            <text x="85" y="45" textAnchor="middle" fill="rgba(239,154,154,0.6)" fontSize="8"
              fontFamily={FONT} fontWeight="400">
              72 beats/min
            </text>
          </g>

          {/* Lungs — center */}
          <g transform="translate(320, 170)" style={{ transition: 'opacity 1.5s ease 0.4s', opacity: step === 3 ? 1 : 0 }}>
            {/* Trachea */}
            <rect x="48" y="0" width="12" height="25" rx="4" fill={`url(#trachea-${uid})`} opacity="0.4" />
            {/* Left lung */}
            <ellipse cx="30" cy="50" rx="28" ry="35" fill={`url(#lung-${uid})`} opacity="0.35">
              <animate attributeName="rx" values="26;30;26" dur="4s" repeatCount="indefinite" />
              <animate attributeName="ry" values="33;37;33" dur="4s" repeatCount="indefinite" />
            </ellipse>
            {/* Right lung */}
            <ellipse cx="78" cy="50" rx="28" ry="35" fill={`url(#lung-${uid})`} opacity="0.35">
              <animate attributeName="rx" values="26;30;26" dur="4s" repeatCount="indefinite" />
              <animate attributeName="ry" values="33;37;33" dur="4s" repeatCount="indefinite" />
            </ellipse>
            <text x="54" y="105" textAnchor="middle" fill="#EF9A9A" fontSize="9"
              fontFamily={FONT} fontWeight="500" opacity="0.6">
              16 breaths/min
            </text>
          </g>

          {/* Stomach — bottom-left */}
          <g transform="translate(220, 260)" style={{ transition: 'opacity 1.5s ease 0.9s', opacity: step === 3 ? 1 : 0 }}>
            {/* Stomach shape */}
            <path d="M30 10 Q45 5 50 15 Q55 30 45 45 Q35 55 20 48 Q10 40 15 25 Q18 15 30 10"
              fill={`url(#stomach-${uid})`} opacity="0.5">
              <animate attributeName="opacity" values="0.4;0.6;0.4" dur="3s" repeatCount="indefinite" />
            </path>
            {/* Label */}
            <rect x="-35" y="55" width="75" height="20" rx="5" fill="rgba(230,81,0,0.15)"
              stroke="rgba(255,183,77,0.4)" strokeWidth="1" />
            <text x="2" y="69" textAnchor="middle" fill="#FFB74D" fontSize="10"
              fontFamily={FONT} fontWeight="600">
              Digestion
            </text>
            <text x="2" y="88" textAnchor="middle" fill="rgba(255,183,77,0.6)" fontSize="8"
              fontFamily={FONT} fontWeight="400">
              Always working
            </text>
            {/* Leader line */}
            <line x1="40" y1="30" x2="155" y2="170" stroke="rgba(255,183,77,0.2)" strokeWidth="1" strokeDasharray="4 3" />
          </g>

          {/* Blood vessels — flowing animation */}
          <g transform="translate(510, 250)" style={{ transition: 'opacity 1.5s ease 1.0s', opacity: step === 3 ? 1 : 0 }}>
            {/* Vessel path */}
            <path d="M0 0 Q20 20 10 40 Q0 60 20 80" fill="none" stroke="#EF5350" strokeWidth="3" opacity="0.3" />
            <path d="M30 0 Q10 20 20 40 Q30 60 10 80" fill="none" stroke="#42A5F5" strokeWidth="3" opacity="0.3" />
            {/* Blood particle */}
            <circle r="3" fill="#EF5350" opacity="0.7">
              <animateMotion dur="2s" repeatCount="indefinite" path="M0 0 Q20 20 10 40 Q0 60 20 80" />
            </circle>
            <circle r="3" fill="#42A5F5" opacity="0.7">
              <animateMotion dur="2s" repeatCount="indefinite" path="M30 0 Q10 20 20 40 Q30 60 10 80" />
            </circle>
            <rect x="-10" y="85" width="60" height="20" rx="5" fill="rgba(30,30,30,0.6)"
              stroke="rgba(239,83,80,0.3)" strokeWidth="1" />
            <text x="20" y="99" textAnchor="middle" fill="#EF9A9A" fontSize="10"
              fontFamily={FONT} fontWeight="600">
              Blood
            </text>
            <text x="20" y="118" textAnchor="middle" fill="rgba(239,154,154,0.6)" fontSize="8"
              fontFamily={FONT} fontWeight="400">
              Always flowing
            </text>
          </g>

          {/* Oxygen arrows converging to body */}
          <g opacity="0.4">
            {/* O2 text labels around the outside */}
            {[
              { x: 140, y: 130, dx: 60, dy: 30 },
              { x: 600, y: 100, dx: -50, dy: 30 },
              { x: 140, y: 380, dx: 60, dy: -20 },
              { x: 600, y: 370, dx: -50, dy: -20 },
            ].map((a, i) => (
              <g key={`o2arr-${i}`}>
                <text x={a.x} y={a.y} fill="#80DEEA" fontSize="12" fontFamily={FONT} fontWeight="700" opacity="0.6">
                  <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                  O&#x2082;
                </text>
                <line x1={a.x + 10} y1={a.y} x2={a.x + a.dx} y2={a.y + a.dy}
                  stroke="#80DEEA" strokeWidth="1" strokeDasharray="4 3" />
              </g>
            ))}
          </g>

          {/* Central message */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 3 ? 1 : 0 }}>
            <rect x="200" y="430" width="400" height="55" rx="12" fill="rgba(0,137,123,0.1)"
              stroke="rgba(0,137,123,0.3)" strokeWidth="1.5" />
            <text x="400" y="453" textAnchor="middle" fill="#4DB6AC" fontSize="13"
              fontFamily={FONT} fontWeight="600">
              Even at rest, your body never stops working
            </text>
            <text x="400" y="473" textAnchor="middle" fill="#80CBC4" fontSize="11"
              fontFamily={FONT} fontWeight="400">
              Heart, brain, lungs, digestion — all need a constant supply of fresh air
            </text>
          </g>
        </g>

        {/* ================= STEP 4: STRAW BREATHING ================= */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 4 ? 1 : 0,
            transform: step === 4 ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          {/* Split view label */}
          <line x1="400" y1="50" x2="400" y2="420" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="6 4" />

          {/* === LEFT SIDE: Student breathing through straw === */}
          <g transform="translate(50, 50)">
            <text x="165" y="10" textAnchor="middle" fill="#FF8A65" fontSize="12"
              fontFamily={FONT} fontWeight="600" letterSpacing="1">
              AFTER RUNNING
            </text>

            {/* Student figure — breathless */}
            <g transform="translate(100, 35)">
              {/* Body */}
              <rect x="-15" y="50" width="50" height="80" rx="10" fill="rgba(239,83,80,0.1)"
                stroke="rgba(239,83,80,0.3)" strokeWidth="1" />
              {/* Head — distressed */}
              <circle cx="10" cy="30" r="24" fill="rgba(239,83,80,0.15)" stroke="rgba(239,83,80,0.4)" strokeWidth="1.5">
                <animate attributeName="fill"
                  values="rgba(239,83,80,0.15);rgba(239,83,80,0.3);rgba(239,83,80,0.15)"
                  dur="1.5s" repeatCount="indefinite" />
              </circle>
              {/* Worried eyes */}
              <circle cx="2" cy="26" r="2.5" fill="#FFAB91" />
              <circle cx="18" cy="26" r="2.5" fill="#FFAB91" />
              {/* Eyebrows — worried */}
              <line x1="-2" y1="20" x2="6" y2="22" stroke="#FFAB91" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="22" y1="22" x2="14" y2="20" stroke="#FFAB91" strokeWidth="1.5" strokeLinecap="round" />

              {/* Straw from mouth */}
              <rect x="22" y="33" width="65" height="5" rx="2" fill={`url(#straw-${uid})`} opacity="0.8"
                transform="rotate(-10, 22, 35)" />
              {/* Restricted air — thin wispy lines through straw */}
              <line x1="85" y1="30" x2="100" y2="28" stroke="rgba(128,222,234,0.3)"
                strokeWidth="1" strokeDasharray="2 3">
                <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2s" repeatCount="indefinite" />
              </line>

              {/* Sweat drops */}
              <circle cx="-15" cy="22" r="2" fill="rgba(100,200,255,0.5)">
                <animate attributeName="cy" values="22;30;22" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="35" cy="18" r="1.5" fill="rgba(100,200,255,0.4)">
                <animate attributeName="cy" values="18;28;18" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite" />
              </circle>

              {/* Speech bubble — uncomfortable */}
              <rect x="-80" y="0" width="70" height="30" rx="8" fill="rgba(239,83,80,0.12)"
                stroke="rgba(239,83,80,0.35)" strokeWidth="1" />
              <text x="-45" y="14" textAnchor="middle" fill="#EF9A9A" fontSize="9"
                fontFamily={FONT} fontWeight="500">
                Can&apos;t
              </text>
              <text x="-45" y="25" textAnchor="middle" fill="#EF9A9A" fontSize="9"
                fontFamily={FONT} fontWeight="500">
                breathe!
              </text>
            </g>

            {/* Straw detail callout */}
            <g transform="translate(30, 220)">
              <rect x="0" y="0" width="280" height="40" rx="8" fill="rgba(50,50,50,0.4)"
                stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Straw cross-section */}
              <circle cx="25" cy="20" r="10" fill="none" stroke={`url(#straw-${uid})`} strokeWidth="3" />
              <circle cx="25" cy="20" r="4" fill="rgba(128,222,234,0.2)" stroke="rgba(128,222,234,0.4)" strokeWidth="1">
                <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <text x="50" y="16" fill="rgba(255,255,255,0.6)" fontSize="10"
                fontFamily={FONT} fontWeight="500">
                Only a tiny amount of air
              </text>
              <text x="50" y="30" fill="rgba(255,255,255,0.4)" fontSize="9"
                fontFamily={FONT} fontWeight="400">
                gets through the narrow straw
              </text>
            </g>

            {/* "This is how a smoker breathes" */}
            <text x="165" y="300" textAnchor="middle" fill="#FFD54F" fontSize="12"
              fontFamily={FONT} fontWeight="700">
              This is how a smoker
            </text>
            <text x="165" y="316" textAnchor="middle" fill="#FFD54F" fontSize="12"
              fontFamily={FONT} fontWeight="700">
              breathes every day
            </text>
          </g>

          {/* === RIGHT SIDE: Healthy vs Damaged Lungs === */}
          <g transform="translate(420, 50)">
            <text x="165" y="10" textAnchor="middle" fill="#80CBC4" fontSize="12"
              fontFamily={FONT} fontWeight="600" letterSpacing="1">
              LUNG COMPARISON
            </text>

            {/* Healthy lung */}
            <g transform="translate(30, 30)">
              <text x="55" y="15" textAnchor="middle" fill="#A5D6A7" fontSize="11"
                fontFamily={FONT} fontWeight="600">
                Healthy
              </text>
              {/* Lung shape */}
              <ellipse cx="55" cy="75" rx="50" ry="60" fill={`url(#lung-${uid})`} opacity="0.5">
                <animate attributeName="rx" values="48;53;48" dur="3s" repeatCount="indefinite" />
                <animate attributeName="ry" values="58;63;58" dur="3s" repeatCount="indefinite" />
              </ellipse>
              {/* Bronchial tree */}
              <path d="M55 25 L55 55 M55 45 L35 65 M55 45 L75 65 M35 65 L28 82 M35 65 L42 82 M75 65 L68 82 M75 65 L82 82"
                fill="none" stroke="#FFCDD2" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              {/* Air passage — wide open */}
              <rect x="48" y="15" width="14" height="15" rx="4" fill={`url(#trachea-${uid})`} opacity="0.5" />
              {/* Wide airflow arrows */}
              <path d="M55 5 L55 18" fill="none" stroke="#80DEEA" strokeWidth="3" markerEnd="" opacity="0.6">
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
              </path>
              <polygon points="48,16 55,6 62,16" fill="#80DEEA" opacity="0.5">
                <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
              </polygon>
              {/* Label */}
              <text x="55" y="150" textAnchor="middle" fill="#A5D6A7" fontSize="9"
                fontFamily={FONT} fontWeight="500">
                Wide air passages
              </text>
              <text x="55" y="163" textAnchor="middle" fill="#A5D6A7" fontSize="9"
                fontFamily={FONT} fontWeight="500">
                Full oxygen flow
              </text>

              {/* Checkmark */}
              <circle cx="95" cy="75" r="10" fill="rgba(76,175,80,0.2)" stroke="#66BB6A" strokeWidth="1.5" />
              <path d="M89 75 L93 80 L101 70" fill="none" stroke="#66BB6A" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* VS divider */}
            <text x="165" y="115" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="16"
              fontFamily={FONT} fontWeight="300">
              vs
            </text>

            {/* Damaged lung */}
            <g transform="translate(210, 30)">
              <text x="55" y="15" textAnchor="middle" fill="#BCAAA4" fontSize="11"
                fontFamily={FONT} fontWeight="600">
                Smoker&apos;s
              </text>
              {/* Damaged lung shape — irregular */}
              <ellipse cx="55" cy="75" rx="45" ry="55" fill={`url(#lungDmg-${uid})`} opacity="0.6" />
              {/* Dark spots — damage */}
              {[
                { cx: 40, cy: 60, r: 8 },
                { cx: 65, cy: 55, r: 6 },
                { cx: 50, cy: 85, r: 9 },
                { cx: 70, cy: 80, r: 7 },
                { cx: 35, cy: 90, r: 5 },
              ].map((spot, i) => (
                <circle key={`dmg-${i}`} cx={spot.cx} cy={spot.cy} r={spot.r}
                  fill="rgba(33,33,33,0.5)" opacity="0.6" />
              ))}
              {/* Narrowed air passage */}
              <rect x="51" y="15" width="8" height="15" rx="2" fill="rgba(141,110,99,0.5)" />
              {/* Restricted airflow — thin trickle */}
              <line x1="55" y1="5" x2="55" y2="15" stroke="rgba(128,222,234,0.2)" strokeWidth="1" strokeDasharray="2 2">
                <animate attributeName="opacity" values="0.1;0.3;0.1" dur="2s" repeatCount="indefinite" />
              </line>
              {/* Label */}
              <text x="55" y="150" textAnchor="middle" fill="#BCAAA4" fontSize="9"
                fontFamily={FONT} fontWeight="500">
                Narrowed passages
              </text>
              <text x="55" y="163" textAnchor="middle" fill="#BCAAA4" fontSize="9"
                fontFamily={FONT} fontWeight="500">
                Restricted airflow
              </text>

              {/* X mark */}
              <circle cx="-5" cy="75" r="10" fill="rgba(183,28,28,0.2)" stroke="#EF5350" strokeWidth="1.5" />
              <line x1="-10" y1="70" x2="0" y2="80" stroke="#EF5350" strokeWidth="2" strokeLinecap="round" />
              <line x1="0" y1="70" x2="-10" y2="80" stroke="#EF5350" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Effects labels */}
            <g style={{ transition: 'opacity 1.5s ease 1s', opacity: step === 4 ? 1 : 0 }}>
              {[
                { text: 'Breathlessness', y: 230, color: '#EF9A9A' },
                { text: 'Tiredness', y: 250, color: '#FFCC80' },
                { text: 'Heart problems', y: 270, color: '#EF9A9A' },
              ].map((eff, i) => (
                <g key={`eff-${i}`}>
                  <circle cx="230" cy={eff.y - 4} r="3" fill={eff.color} opacity="0.6" />
                  <text x="240" y={eff.y} fill={eff.color} fontSize="10"
                    fontFamily={FONT} fontWeight="500" opacity="0.8">
                    {eff.text}
                  </text>
                </g>
              ))}
              <text x="165" y="310" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10"
                fontFamily={FONT} fontWeight="400">
                Smoking damages lungs
              </text>
              <text x="165" y="325" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10"
                fontFamily={FONT} fontWeight="400">
                and restricts vital airflow
              </text>
            </g>
          </g>

          {/* Warning / conclusion */}
          <g style={{ transition: 'opacity 1.5s ease 1.5s', opacity: step === 4 ? 1 : 0 }}>
            <rect x="150" y="430" width="500" height="55" rx="12" fill="rgba(183,28,28,0.1)"
              stroke="rgba(239,83,80,0.3)" strokeWidth="1.5" />
            <text x="400" y="453" textAnchor="middle" fill="#EF9A9A" fontSize="14"
              fontFamily={FONT} fontWeight="700" letterSpacing="1"
              filter={`url(#glow-${uid})`}>
              SAY NO TO SMOKING
            </text>
            <text x="400" y="473" textAnchor="middle" fill="#FFAB91" fontSize="11"
              fontFamily={FONT} fontWeight="400">
              We breathe to supply air to every cell. More work = more air. Smoking restricts this vital airflow.
            </text>
          </g>

          {/* Sparkle effects */}
          {[
            { x: 100, y: 400 },
            { x: 700, y: 400 },
            { x: 200, y: 500 },
            { x: 600, y: 500 },
          ].map((sp, i) => (
            <g key={`sp4-${i}`} style={{ transition: `opacity 1.5s ease ${1.2 + i * 0.15}s`, opacity: step === 4 ? 1 : 0 }}>
              <circle cx={sp.x} cy={sp.y} r="5" fill={`url(#sparkle-${uid})`}>
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
                fill={step === s ? '#00897B' : 'rgba(255,255,255,0.15)'}
                stroke={step >= s ? '#00897B' : 'rgba(255,255,255,0.1)'}
                strokeWidth={step === s ? 2 : 1}
                style={{ transition: 'all 0.5s ease' }}
              />
              {step === s && (
                <circle cx={(s - 1) * 40} cy="0" r="10" fill="none" stroke="#00897B" strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" values="8;13;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <text
                x={(s - 1) * 40}
                y="18"
                textAnchor="middle"
                fill={step === s ? '#00897B' : 'rgba(255,255,255,0.3)'}
                fontSize="8"
                fontFamily={FONT}
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
          fontFamily={FONT} fontWeight="500" letterSpacing="1">
          B4 RESPIRATION
        </text>
      </svg>
    </div>
  );
}
