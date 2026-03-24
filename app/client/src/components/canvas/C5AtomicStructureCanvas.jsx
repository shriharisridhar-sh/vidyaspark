import React, { useMemo } from 'react';

/**
 * C5.1 Atomic Structure — "How Small Is an Atom?"
 *
 * Interactive SVG canvas showing the paper-cutting experiment to grasp atomic scale.
 * Receives `currentStep` prop (1-4) and renders each stage with smooth transitions.
 *
 * Step 1: Setup — 28cm paper square, scissors, meter rule on table
 * Step 2: Cutting Begins — paper halved repeatedly, cuts 1-10 shown
 * Step 3: Reaching the Limit — size comparison chart (football to pencil lead)
 * Step 4: Journey to the Atom — zoom animation from hair to 0.1nm atom
 */

const TRANSITION = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
const FADE_TRANSITION = 'opacity 1.5s ease 0.3s';
const DELAYED_FADE = 'opacity 1.5s ease 0.8s';

export default function C5AtomicStructureCanvas({ currentStep = 1 }) {
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
        {/* ===== DEFS: Gradients, Filters ===== */}
        <defs>
          {/* Background — Chemistry purple */}
          <radialGradient id={`bg-${uniqueId}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1a1228" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>

          {/* Table wood gradient */}
          <linearGradient id={`table-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B6914" />
            <stop offset="30%" stopColor="#7A5C12" />
            <stop offset="100%" stopColor="#5C4410" />
          </linearGradient>
          <linearGradient id={`tableEdge-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6B4E10" />
            <stop offset="100%" stopColor="#3D2E0A" />
          </linearGradient>

          {/* Paper gradient */}
          <linearGradient id={`paper-${uniqueId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FAFAFA" />
            <stop offset="50%" stopColor="#F0F0F0" />
            <stop offset="100%" stopColor="#E8E8E8" />
          </linearGradient>

          {/* Scissors metal */}
          <linearGradient id={`metal-${uniqueId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#B0BEC5" />
            <stop offset="50%" stopColor="#CFD8DC" />
            <stop offset="100%" stopColor="#90A4AE" />
          </linearGradient>

          {/* Purple glow for chemistry */}
          <radialGradient id={`purpleGlow-${uniqueId}`}>
            <stop offset="0%" stopColor="#7C4DFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7C4DFF" stopOpacity="0" />
          </radialGradient>

          {/* Atom glow */}
          <radialGradient id={`atomGlow-${uniqueId}`}>
            <stop offset="0%" stopColor="#E040FB" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#AA00FF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#AA00FF" stopOpacity="0" />
          </radialGradient>

          {/* Nucleus glow */}
          <radialGradient id={`nucleusGlow-${uniqueId}`}>
            <stop offset="0%" stopColor="#FF6D00" stopOpacity="1" />
            <stop offset="60%" stopColor="#E65100" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#BF360C" stopOpacity="0" />
          </radialGradient>

          {/* Sparkle */}
          <radialGradient id={`sparkle-${uniqueId}`}>
            <stop offset="0%" stopColor="#B388FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#B388FF" stopOpacity="0" />
          </radialGradient>

          {/* Zoom ring gradient */}
          <linearGradient id={`zoomRing-${uniqueId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C4DFF" />
            <stop offset="100%" stopColor="#E040FB" />
          </linearGradient>

          {/* Soft shadow filter */}
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
          <filter id={`softGlow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ===== BACKGROUND ===== */}
        <rect width="800" height="560" fill={`url(#bg-${uniqueId})`} />

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
          fill="#B388FF"
          fontSize="14"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="600"
          letterSpacing="2"
          style={{ transition: FADE_TRANSITION }}
        >
          {step === 1 && 'STEP 1 \u2014 SETUP MATERIALS'}
          {step === 2 && 'STEP 2 \u2014 CUTTING BEGINS'}
          {step === 3 && 'STEP 3 \u2014 SIZE COMPARISON'}
          {step === 4 && 'STEP 4 \u2014 JOURNEY TO THE ATOM'}
        </text>

        {/* ===== STEP 1: SETUP — Paper, Scissors, Ruler on Table ===== */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 1 ? 1 : 0,
            transform: step === 1 ? 'translateY(0)' : 'translateY(-30px)',
          }}
        >
          {/* Wooden table surface */}
          <rect x="60" y="400" width="680" height="24" rx="4" fill={`url(#table-${uniqueId})`} filter={`url(#shadow-${uniqueId})`} />
          <rect x="60" y="420" width="680" height="12" rx="2" fill={`url(#tableEdge-${uniqueId})`} />
          {/* Wood grain lines */}
          <g opacity="0.15">
            <line x1="100" y1="406" x2="700" y2="406" stroke="#3D2E0A" strokeWidth="0.5" />
            <line x1="80" y1="412" x2="720" y2="411" stroke="#3D2E0A" strokeWidth="0.5" />
          </g>

          {/* 28cm Paper Square — large, prominent */}
          <g transform="translate(250, 140)">
            {/* Shadow */}
            <rect x="4" y="4" width="180" height="180" rx="2" fill="rgba(0,0,0,0.3)" />
            {/* Paper */}
            <rect x="0" y="0" width="180" height="180" rx="2" fill={`url(#paper-${uniqueId})`} stroke="rgba(200,200,200,0.5)" strokeWidth="1" />
            {/* Grid lines on paper */}
            <g opacity="0.08">
              {Array.from({ length: 9 }, (_, i) => (
                <line key={`pg${i}`} x1={(i + 1) * 20} y1="0" x2={(i + 1) * 20} y2="180" stroke="#333" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 9 }, (_, i) => (
                <line key={`pgh${i}`} x1="0" y1={(i + 1) * 20} x2="180" y2={(i + 1) * 20} stroke="#333" strokeWidth="0.5" />
              ))}
            </g>
            {/* Size label */}
            <text x="90" y="100" textAnchor="middle" fill="#666" fontSize="16" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              28 cm
            </text>
            {/* Double arrow */}
            <line x1="10" y1="190" x2="170" y2="190" stroke="#B388FF" strokeWidth="1.5" />
            <polygon points="10,190 18,186 18,194" fill="#B388FF" />
            <polygon points="170,190 162,186 162,194" fill="#B388FF" />
            <text x="90" y="206" textAnchor="middle" fill="#B388FF" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              28 cm x 28 cm
            </text>
          </g>

          {/* Scissors */}
          <g transform="translate(120, 280)">
            {/* Blade 1 */}
            <path d="M30 20 L80 5 L82 12 L32 25Z" fill={`url(#metal-${uniqueId})`} stroke="#78909C" strokeWidth="0.5" />
            {/* Blade 2 */}
            <path d="M30 30 L80 45 L82 38 L32 25Z" fill={`url(#metal-${uniqueId})`} stroke="#78909C" strokeWidth="0.5" />
            {/* Pivot */}
            <circle cx="30" cy="25" r="4" fill="#546E7A" stroke="#37474F" strokeWidth="1" />
            {/* Handle 1 */}
            <ellipse cx="12" cy="14" rx="14" ry="8" fill="#E53935" stroke="#C62828" strokeWidth="1" />
            {/* Handle 2 */}
            <ellipse cx="12" cy="36" rx="14" ry="8" fill="#E53935" stroke="#C62828" strokeWidth="1" />
            <text x="40" y="65" textAnchor="middle" fill="#EF9A9A" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.8">
              Scissors
            </text>
          </g>

          {/* Meter rule */}
          <g transform="translate(510, 160)">
            <rect x="0" y="0" width="160" height="22" rx="2" fill="#FFF8E1" stroke="#F9A825" strokeWidth="1" />
            {/* Ruler markings */}
            {Array.from({ length: 16 }, (_, i) => (
              <g key={`rm${i}`}>
                <line x1={i * 10 + 5} y1="16" x2={i * 10 + 5} y2="22" stroke="#795548" strokeWidth="0.8" />
                {i % 5 === 0 && (
                  <line x1={i * 10 + 5} y1="12" x2={i * 10 + 5} y2="22" stroke="#795548" strokeWidth="1.2" />
                )}
              </g>
            ))}
            <text x="80" y="12" textAnchor="middle" fill="#795548" fontSize="7" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              cm
            </text>
            <text x="80" y="38" textAnchor="middle" fill="#FFD54F" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.8">
              Meter Rule
            </text>
          </g>

          {/* Size Comparison Chart (on wall) */}
          <g transform="translate(520, 250)">
            <rect x="0" y="0" width="160" height="120" rx="6" fill="rgba(30,20,50,0.7)" stroke="rgba(179,136,255,0.3)" strokeWidth="1" />
            <text x="80" y="18" textAnchor="middle" fill="#CE93D8" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="1">
              SIZE CHART
            </text>
            <line x1="10" y1="24" x2="150" y2="24" stroke="rgba(179,136,255,0.2)" strokeWidth="0.5" />
            {[
              { label: 'Cut 1', size: '14 cm', y: 40 },
              { label: 'Cut 4', size: '1.75 cm', y: 56 },
              { label: 'Cut 8', size: '1 mm', y: 72 },
              { label: 'Cut 10', size: '0.25 mm', y: 88 },
              { label: 'Cut 31', size: '0.1 nm', y: 104 },
            ].map((row) => (
              <g key={row.label}>
                <text x="15" y={row.y} fill="#B0BEC5" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
                  {row.label}
                </text>
                <text x="145" y={row.y} textAnchor="end" fill="#CE93D8" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                  {row.size}
                </text>
              </g>
            ))}
          </g>

          {/* Main label */}
          <text x="340" y="385" textAnchor="middle" fill="#E1BEE7" fontSize="12" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
            Students sit in groups of 3, each with paper and scissors
          </text>
        </g>

        {/* ===== STEP 2: CUTTING BEGINS — Paper getting smaller ===== */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 2 ? 1 : 0,
            transform: step === 2 ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          {/* Show progressive cuts from left to right */}
          {[
            { cut: 0, size: 160, label: 'Start', sizeText: '28 cm', x: 40, color: '#E8E8E8' },
            { cut: 1, size: 120, label: 'Cut 1', sizeText: '14 cm', x: 160, color: '#E0E0E0' },
            { cut: 2, size: 90, label: 'Cut 2', sizeText: '7 cm', x: 290, color: '#D8D8D8' },
            { cut: 4, size: 55, label: 'Cut 4', sizeText: '1.75 cm', x: 410, color: '#D0D0D0' },
            { cut: 8, size: 25, label: 'Cut 8', sizeText: '1 mm', x: 520, color: '#C8C8C8' },
            { cut: 10, size: 10, label: 'Cut 10', sizeText: '0.25 mm', x: 610, color: '#C0C0C0' },
          ].map((p, i) => (
            <g key={`cut-${i}`} style={{ transition: `opacity 1.2s ease ${i * 0.2}s`, opacity: step === 2 ? 1 : 0 }}>
              {/* Paper square */}
              <rect
                x={p.x + (80 - p.size / 2)}
                y={220 - p.size / 2}
                width={p.size}
                height={p.size}
                rx="2"
                fill={p.color}
                stroke="rgba(150,150,150,0.4)"
                strokeWidth="1"
                filter={p.size > 20 ? `url(#shadow-${uniqueId})` : undefined}
              />
              {/* Dashed cut line on paper */}
              {p.size > 30 && (
                <line
                  x1={p.x + 80}
                  y1={220 - p.size / 2 + 4}
                  x2={p.x + 80}
                  y2={220 + p.size / 2 - 4}
                  stroke="#E53935"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  opacity="0.6"
                />
              )}
              {/* Cut number */}
              <text
                x={p.x + 80}
                y={220 + p.size / 2 + 20}
                textAnchor="middle"
                fill="#CE93D8"
                fontSize="12"
                fontFamily="'Inter', system-ui, sans-serif"
                fontWeight="600"
              >
                {p.label}
              </text>
              {/* Size label */}
              <text
                x={p.x + 80}
                y={220 + p.size / 2 + 36}
                textAnchor="middle"
                fill="#B0BEC5"
                fontSize="10"
                fontFamily="'Inter', system-ui, sans-serif"
                fontWeight="400"
              >
                {p.sizeText}
              </text>
            </g>
          ))}

          {/* Arrows between papers */}
          {[200, 340, 460, 560, 650].map((ax, i) => (
            <g key={`arr-${i}`} opacity="0.5">
              <line x1={ax} y1="220" x2={ax + 20} y2="220" stroke="#B388FF" strokeWidth="1.5" />
              <polygon points={`${ax + 20},220 ${ax + 14},216 ${ax + 14},224`} fill="#B388FF" />
            </g>
          ))}

          {/* Scissors icon cutting */}
          <g transform="translate(680, 205)" opacity="0.6">
            <text fontSize="24" fill="#EF9A9A">&#9986;</text>
          </g>

          {/* Cut counter */}
          <g>
            <rect x="300" y="340" width="200" height="50" rx="10" fill="rgba(30,20,50,0.7)" stroke="rgba(179,136,255,0.3)" strokeWidth="1" />
            <text x="400" y="362" textAnchor="middle" fill="#CE93D8" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="1">
              EACH CUT = HALF THE SIZE
            </text>
            <text x="400" y="380" textAnchor="middle" fill="#B0BEC5" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              28 cm &rarr; 14 cm &rarr; 7 cm &rarr; ...
            </text>
          </g>

          {/* Annotation */}
          <text
            x="400"
            y="430"
            textAnchor="middle"
            fill="#E1BEE7"
            fontSize="12"
            fontFamily="'Inter', system-ui, sans-serif"
            fontWeight="400"
            opacity="0.7"
            style={{ transition: DELAYED_FADE, opacity: step === 2 ? 0.7 : 0 }}
          >
            By cut 10, the paper is just 0.25 mm &mdash; thinner than pencil lead!
          </text>

          {/* "How much further?" hint */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 2 ? 1 : 0 }}>
            <text x="400" y="460" textAnchor="middle" fill="#7C4DFF" fontSize="13" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              But an atom needs 21 MORE cuts beyond this...
            </text>
          </g>
        </g>

        {/* ===== STEP 3: SIZE COMPARISON CHART ===== */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 3 ? 1 : 0,
            transform: step === 3 ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          {/* Vertical scale bar on left */}
          <line x1="80" y1="70" x2="80" y2="470" stroke="rgba(179,136,255,0.3)" strokeWidth="2" />
          <polygon points="80,65 75,75 85,75" fill="#B388FF" />
          <text x="80" y="58" textAnchor="middle" fill="#B388FF" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
            SMALLER
          </text>
          <polygon points="80,475 75,465 85,465" fill="#B388FF" />
          <text x="80" y="492" textAnchor="middle" fill="#B388FF" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
            BIGGER
          </text>

          {/* Size comparison items — from big (bottom) to small (top) */}
          {[
            { label: 'Football', size: '22 cm', y: 440, iconW: 50, iconH: 32, color: '#8D6E63', cut: '~0', emoji: null },
            { label: "Child's Hand", size: '14 cm', y: 380, iconW: 36, iconH: 36, color: '#FFAB91', cut: '1', emoji: null },
            { label: 'Watch Face', size: '3.5 cm', y: 320, iconW: 24, iconH: 24, color: '#90A4AE', cut: '3', emoji: null },
            { label: 'Mustard Seed', size: '4.4 mm', y: 260, iconW: 10, iconH: 10, color: '#FDD835', cut: '6', emoji: null },
            { label: 'Thread', size: '1 mm', y: 200, iconW: 6, iconH: 6, color: '#E0E0E0', cut: '8', emoji: null },
            { label: 'Pencil Lead', size: '0.25 mm', y: 140, iconW: 4, iconH: 4, color: '#757575', cut: '10', emoji: null },
            { label: 'Hair', size: '0.06 mm', y: 90, iconW: 2, iconH: 16, color: '#5D4037', cut: '12', emoji: null },
          ].map((item, i) => (
            <g key={`comp-${i}`} style={{ transition: `opacity 1s ease ${i * 0.15}s`, opacity: step === 3 ? 1 : 0 }}>
              {/* Tick mark on scale bar */}
              <line x1="73" y1={item.y} x2="87" y2={item.y} stroke="rgba(179,136,255,0.5)" strokeWidth="1.5" />
              {/* Connecting line */}
              <line x1="90" y1={item.y} x2="155" y2={item.y} stroke="rgba(179,136,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />

              {/* Icon representation (circle scaled by relative size) */}
              <circle
                cx="190"
                cy={item.y}
                r={Math.max(2, item.iconW / 2)}
                fill={item.color}
                opacity="0.8"
                filter={item.iconW > 15 ? `url(#shadow-${uniqueId})` : undefined}
              />

              {/* Label */}
              <text x="230" y={item.y + 4} fill="#E1BEE7" fontSize="12" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                {item.label}
              </text>

              {/* Size */}
              <text x="380" y={item.y + 4} fill="#B0BEC5" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
                {item.size}
              </text>

              {/* Cut number */}
              <text x="480" y={item.y + 4} fill="#CE93D8" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
                Cut {item.cut}
              </text>
            </g>
          ))}

          {/* Scissors limit line */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 3 ? 1 : 0 }}>
            <line x1="100" y1="165" x2="520" y2="165" stroke="#EF5350" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.6" />
            <rect x="530" y="152" width="190" height="26" rx="6" fill="rgba(239,83,80,0.15)" stroke="#EF5350" strokeWidth="1" />
            <text x="625" y="169" textAnchor="middle" fill="#EF5350" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              SCISSORS LIMIT (Cut 10)
            </text>
          </g>

          {/* Column headers */}
          <g opacity="0.5">
            <text x="190" y="60" textAnchor="middle" fill="#B388FF" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="1">
              OBJECT
            </text>
            <text x="380" y="60" fill="#B388FF" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="1">
              SIZE
            </text>
            <text x="480" y="60" fill="#B388FF" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="1">
              CUT #
            </text>
          </g>

          {/* Below the scissors limit — what comes next? */}
          <g style={{ transition: 'opacity 1.5s ease 1.2s', opacity: step === 3 ? 1 : 0 }}>
            <rect x="540" y="380" width="210" height="80" rx="10" fill="rgba(30,20,50,0.8)" stroke="rgba(124,77,255,0.4)" strokeWidth="1" />
            <text x="645" y="402" textAnchor="middle" fill="#B388FF" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Beyond scissors...
            </text>
            <text x="645" y="420" textAnchor="middle" fill="#B0BEC5" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Cut 18 = Bacteria (1 &mu;m)
            </text>
            <text x="645" y="436" textAnchor="middle" fill="#B0BEC5" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Cut 24 = Electron microscope
            </text>
            <text x="645" y="452" textAnchor="middle" fill="#E040FB" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">
              Cut 31 = ATOM (0.1 nm)
            </text>
          </g>
        </g>

        {/* ===== STEP 4: JOURNEY TO THE ATOM — Zoom Animation ===== */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 4 ? 1 : 0,
            transform: step === 4 ? 'scale(1)' : 'scale(0.9)',
            transformOrigin: '400px 280px',
          }}
        >
          {/* Concentric zoom circles — representing zooming deeper */}
          {[
            { r: 220, label: 'Cut 10: Pencil Lead (0.25 mm)', color: 'rgba(179,136,255,0.08)', textColor: '#9E9E9E', labelR: 210 },
            { r: 170, label: 'Cut 12: Human Hair (60 \u00B5m)', color: 'rgba(179,136,255,0.1)', textColor: '#B0BEC5', labelR: 162 },
            { r: 130, label: 'Cut 18: Bacteria (1 \u00B5m)', color: 'rgba(179,136,255,0.12)', textColor: '#CE93D8', labelR: 122 },
            { r: 90, label: 'Cut 24: Electron Microscope (15 nm)', color: 'rgba(224,64,251,0.1)', textColor: '#E040FB', labelR: 84 },
          ].map((ring, i) => (
            <g key={`ring-${i}`} style={{ transition: `opacity 1.2s ease ${0.3 + i * 0.25}s`, opacity: step === 4 ? 1 : 0 }}>
              <circle cx="400" cy="250" r={ring.r} fill="none" stroke={ring.textColor} strokeWidth="1" strokeDasharray="6 4" opacity="0.4">
                <animate
                  attributeName="r"
                  values={`${ring.r};${ring.r + 3};${ring.r}`}
                  dur={`${3 + i * 0.5}s`}
                  repeatCount="indefinite"
                />
              </circle>
              {/* Label along top of circle */}
              <text
                x="400"
                y={250 - ring.labelR}
                textAnchor="middle"
                fill={ring.textColor}
                fontSize="9"
                fontFamily="'Inter', system-ui, sans-serif"
                fontWeight="400"
                opacity="0.7"
              >
                {ring.label}
              </text>
            </g>
          ))}

          {/* Center: The ATOM — glowing nucleus + electron orbits */}
          <g style={{ transition: 'opacity 1.5s ease 1.2s', opacity: step === 4 ? 1 : 0 }}>
            {/* Outer glow */}
            <circle cx="400" cy="250" r="45" fill={`url(#atomGlow-${uniqueId})`} filter={`url(#softGlow-${uniqueId})`}>
              <animate attributeName="r" values="42;50;42" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite" />
            </circle>

            {/* Electron orbit paths */}
            {[0, 60, 120].map((angle, i) => (
              <g key={`orbit-${i}`} transform={`rotate(${angle}, 400, 250)`}>
                <ellipse cx="400" cy="250" rx="38" ry="14" fill="none" stroke="rgba(179,136,255,0.35)" strokeWidth="1">
                  <animate attributeName="opacity" values="0.35;0.15;0.35" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                </ellipse>
                {/* Electron */}
                <circle cx="400" cy="250" r="3" fill="#64B5F6" filter={`url(#glow-${uniqueId})`}>
                  <animateMotion
                    path={`M-38,0 A38,14 0 1 1 38,0 A38,14 0 1 1 -38,0`}
                    dur={`${1.5 + i * 0.5}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            ))}

            {/* Nucleus */}
            <circle cx="400" cy="250" r="10" fill={`url(#nucleusGlow-${uniqueId})`} filter={`url(#glow-${uniqueId})`}>
              <animate attributeName="r" values="9;12;9" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Proton / neutron dots */}
            <circle cx="397" cy="248" r="4" fill="#FF6D00" opacity="0.9" />
            <circle cx="403" cy="248" r="4" fill="#FF8F00" opacity="0.9" />
            <circle cx="400" cy="254" r="4" fill="#EF6C00" opacity="0.8" />
          </g>

          {/* "0.1 nm" label below atom */}
          <g style={{ transition: 'opacity 1.5s ease 1.5s', opacity: step === 4 ? 1 : 0 }}>
            <text x="400" y="310" textAnchor="middle" fill="#E040FB" fontSize="20" fontFamily="'Inter', system-ui, sans-serif" fontWeight="800" letterSpacing="2" filter={`url(#glow-${uniqueId})`}>
              0.1 nm
            </text>
            <text x="400" y="328" textAnchor="middle" fill="#CE93D8" fontSize="12" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              The size of an atom
            </text>
          </g>

          {/* Sparkle effects */}
          {[
            { x: 340, y: 210 },
            { x: 460, y: 220 },
            { x: 370, y: 290 },
            { x: 435, y: 275 },
            { x: 355, y: 240 },
          ].map((sp, i) => (
            <g key={`sp-${i}`} style={{ transition: `opacity 1.5s ease ${1.3 + i * 0.15}s`, opacity: step === 4 ? 1 : 0 }}>
              <circle cx={sp.x} cy={sp.y} r="5" fill={`url(#sparkle-${uniqueId})`}>
                <animate attributeName="r" values="2;6;2" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
              </circle>
              <line x1={sp.x - 3} y1={sp.y} x2={sp.x + 3} y2={sp.y} stroke="#B388FF" strokeWidth="1" opacity="0.5">
                <animate attributeName="opacity" values="0.5;0.15;0.5" dur={`${1.2 + i * 0.3}s`} repeatCount="indefinite" />
              </line>
              <line x1={sp.x} y1={sp.y - 3} x2={sp.x} y2={sp.y + 3} stroke="#B388FF" strokeWidth="1" opacity="0.5">
                <animate attributeName="opacity" values="0.5;0.15;0.5" dur={`${1.2 + i * 0.3}s`} repeatCount="indefinite" />
              </line>
            </g>
          ))}

          {/* Main conclusion box */}
          <g style={{ transition: 'opacity 1.5s ease 1.6s', opacity: step === 4 ? 1 : 0 }}>
            <rect x="230" y="400" width="340" height="80" rx="12" fill="rgba(124,77,255,0.12)" stroke="#7C4DFF" strokeWidth="1.5" />
            <text x="400" y="424" textAnchor="middle" fill="#B388FF" fontSize="14" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              31 cuts to reach an atom
            </text>
            <text x="400" y="444" textAnchor="middle" fill="#CE93D8" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Atomic radius is measured in nanometres
            </text>
            <text x="400" y="462" textAnchor="middle" fill="#CE93D8" fontSize="11" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              1 nm = 10&#8315;&#8313; metres &mdash; invisible to any microscope
            </text>
          </g>

          {/* Side info box */}
          <g style={{ transition: 'opacity 1.5s ease 1.4s', opacity: step === 4 ? 1 : 0 }}>
            <rect x="600" y="100" width="170" height="100" rx="10" fill="rgba(30,20,50,0.8)" stroke="rgba(224,64,251,0.3)" strokeWidth="1" />
            <text x="685" y="122" textAnchor="middle" fill="#E040FB" fontSize="10" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="1">
              DID YOU KNOW?
            </text>
            <text x="685" y="142" textAnchor="middle" fill="#B0BEC5" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Even powerful optical
            </text>
            <text x="685" y="155" textAnchor="middle" fill="#B0BEC5" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              microscopes cannot see atoms
            </text>
            <text x="685" y="168" textAnchor="middle" fill="#B0BEC5" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              because atoms are smaller
            </text>
            <text x="685" y="181" textAnchor="middle" fill="#B0BEC5" fontSize="9" fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              than visible light wavelength
            </text>
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
                fill={step === s ? '#7C4DFF' : 'rgba(255,255,255,0.15)'}
                stroke={step >= s ? '#7C4DFF' : 'rgba(255,255,255,0.1)'}
                strokeWidth={step === s ? 2 : 1}
                style={{ transition: 'all 0.5s ease' }}
              />
              {step === s && (
                <circle cx={(s - 1) * 40} cy="0" r="10" fill="none" stroke="#7C4DFF" strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" values="8;13;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <text
                x={(s - 1) * 40}
                y="18"
                textAnchor="middle"
                fill={step === s ? '#7C4DFF' : 'rgba(255,255,255,0.3)'}
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
          C5.1 ATOMIC STRUCTURE
        </text>
      </svg>
    </div>
  );
}
