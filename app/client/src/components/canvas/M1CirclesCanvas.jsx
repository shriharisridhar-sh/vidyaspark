import { useState, useEffect } from 'react';

/**
 * M1CirclesCanvas — Interactive SVG canvas for M1 Circles: Terminology and Properties
 *
 * ABL Experiment: Students learn circle terminology through paper folding and thread
 * activities, discover pi by measuring circumference/diameter ratios, verify the
 * diameter is the longest chord, and prove central angle = 2x inscribed angle.
 *
 * Steps:
 *   1. Parts of a Circle — labelled circle with radius, diameter, chord, arc, tangent, secant
 *   2. Folding to Find Centre and Diameter — paper folding creases intersect at centre
 *   3. Measuring Circumference and Diameter — three circles, C/d ratio table showing pi
 *   4. The Diameter is the Longest Chord — multiple chords compared
 *   5. Central Angle is Twice the Inscribed Angle — geometric proof
 */

// --- Color palette (Math orange scheme) ---
const COLORS = {
  bg: '#0a0a0a',
  paper: '#1a1a2e',
  paperBorder: '#2a2a4e',
  orange: '#E65100',
  orangeLight: '#FF8A65',
  orangeDark: '#BF360C',
  gold: '#FFA726',
  goldDark: '#F57C00',
  radius: '#FF7043',
  diameter: '#EF5350',
  chord: '#AB47BC',
  arc: '#42A5F5',
  arcMinor: '#29B6F6',
  tangent: '#66BB6A',
  secant: '#FFCA28',
  centre: '#FFEB3B',
  circle: '#FF8A65',
  circleFill: '#E65100',
  text: '#e2e8f0',
  textDim: '#64748b',
  sparkle: '#fbbf24',
  accent: '#E65100',
  line: '#94a3b8',
  piColor: '#4FC3F7',
  proof: '#CE93D8',
};

// --- Sparkle/star ---
function Sparkle({ cx, cy, size = 6, color = COLORS.sparkle, delay = 0 }) {
  return (
    <g style={{ animation: `sparkle 1.5s ease-in-out ${delay}s infinite`, transformOrigin: `${cx}px ${cy}px` }}>
      <line x1={cx} y1={cy - size} x2={cx} y2={cy + size} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={cx - size} y1={cy} x2={cx + size} y2={cy} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={cx - size * 0.6} y1={cy - size * 0.6} x2={cx + size * 0.6} y2={cy + size * 0.6} stroke={color} strokeWidth={1} strokeLinecap="round" />
      <line x1={cx + size * 0.6} y1={cy - size * 0.6} x2={cx - size * 0.6} y2={cy + size * 0.6} stroke={color} strokeWidth={1} strokeLinecap="round" />
    </g>
  );
}

// --- Arrow tip helper ---
function arrowHead(x, y, angle, size = 8, color = COLORS.text) {
  const rad = (angle * Math.PI) / 180;
  const x1 = x - size * Math.cos(rad - 0.4);
  const y1 = y - size * Math.sin(rad - 0.4);
  const x2 = x - size * Math.cos(rad + 0.4);
  const y2 = y - size * Math.sin(rad + 0.4);
  return <polygon points={`${x},${y} ${x1},${y1} ${x2},${y2}`} fill={color} />;
}

// --- Angle arc helper ---
function AngleArc({ cx, cy, radius, startAngle, endAngle, color, strokeWidth = 2.5, fill = 'none', fillOpacity = 0 }) {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  const sweep = endAngle - startAngle > 180 ? 1 : 0;
  const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${sweep} 1 ${x2} ${y2}`;
  if (fill !== 'none') {
    const dFill = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${sweep} 1 ${x2} ${y2} Z`;
    return (
      <g>
        <path d={dFill} fill={fill} opacity={fillOpacity} />
        <path d={d} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  return <path d={d} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />;
}

// ===========================
// Step 1: Parts of a Circle
// ===========================
function Step1Terminology({ visible }) {
  const cx = 350, cy = 235, r = 120;
  // Chord endpoints (not through centre)
  const chordAngle1 = 200, chordAngle2 = 310;
  const chordX1 = cx + r * Math.cos((chordAngle1 * Math.PI) / 180);
  const chordY1 = cy + r * Math.sin((chordAngle1 * Math.PI) / 180);
  const chordX2 = cx + r * Math.cos((chordAngle2 * Math.PI) / 180);
  const chordY2 = cy + r * Math.sin((chordAngle2 * Math.PI) / 180);
  // Tangent point at top
  const tanAngle = 90;
  const tanX = cx + r * Math.cos((tanAngle * Math.PI) / 180);
  const tanY = cy - r;
  // Secant endpoints
  const secAngle1 = 140, secAngle2 = 30;
  const secX1 = cx + (r + 60) * Math.cos((secAngle1 * Math.PI) / 180);
  const secY1 = cy + (r + 60) * Math.sin((secAngle1 * Math.PI) / 180);
  const secX2 = cx + (r + 60) * Math.cos((-secAngle2 * Math.PI) / 180);
  const secY2 = cy + (r + 60) * Math.sin((-secAngle2 * Math.PI) / 180);
  // Arc highlight (minor arc between chord endpoints)
  const arcStart = chordAngle1;
  const arcEnd = chordAngle2;

  return (
    <g
      className="canvas-step"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.9)',
        transition: 'opacity 1.2s ease, transform 1.2s ease',
      }}
    >
      {/* Title */}
      <text x={400} y={50} textAnchor="middle" fill={COLORS.text} fontSize={20} fontWeight={700} fontFamily="sans-serif">
        Parts of a Circle
      </text>
      <text x={400} y={73} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif">
        Key terminology: centre, radius, diameter, chord, arc, tangent, secant
      </text>

      {/* Main circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.circle} strokeWidth={3} opacity={0.9} />
      <circle cx={cx} cy={cy} r={r} fill={COLORS.circleFill} opacity={0.08} />

      {/* Centre point */}
      <circle cx={cx} cy={cy} r={4} fill={COLORS.centre} />
      <text x={cx + 10} y={cy - 8} fill={COLORS.centre} fontSize={12} fontWeight={600} fontFamily="sans-serif">O</text>
      <text x={cx + 10} y={cy + 3} fill={COLORS.textDim} fontSize={9} fontFamily="sans-serif">(centre)</text>

      {/* Radius — from centre to right edge */}
      <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={COLORS.radius} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx + r} cy={cy} r={3} fill={COLORS.radius} />
      <text x={cx + r / 2} y={cy - 10} textAnchor="middle" fill={COLORS.radius} fontSize={12} fontWeight={600} fontFamily="sans-serif">
        radius (r)
      </text>

      {/* Diameter — vertical through centre */}
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={COLORS.diameter} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="8,4" />
      <circle cx={cx} cy={cy - r} r={3} fill={COLORS.diameter} />
      <circle cx={cx} cy={cy + r} r={3} fill={COLORS.diameter} />
      <text x={cx - 16} y={cy + r / 2 + 40} textAnchor="end" fill={COLORS.diameter} fontSize={12} fontWeight={600} fontFamily="sans-serif" transform={`rotate(-90, ${cx - 16}, ${cy})`}>
        diameter (d = 2r)
      </text>

      {/* Chord */}
      <line x1={chordX1} y1={chordY1} x2={chordX2} y2={chordY2} stroke={COLORS.chord} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={chordX1} cy={chordY1} r={3} fill={COLORS.chord} />
      <circle cx={chordX2} cy={chordY2} r={3} fill={COLORS.chord} />
      <text x={(chordX1 + chordX2) / 2 - 30} y={(chordY1 + chordY2) / 2 + 20} fill={COLORS.chord} fontSize={12} fontWeight={600} fontFamily="sans-serif">
        chord
      </text>

      {/* Minor arc highlight */}
      <AngleArc cx={cx} cy={cy} radius={r + 6} startAngle={arcStart} endAngle={arcEnd} color={COLORS.arc} strokeWidth={5} />
      <text x={cx - r - 28} y={cy + 40} fill={COLORS.arc} fontSize={11} fontWeight={600} fontFamily="sans-serif">
        minor arc
      </text>

      {/* Major arc label */}
      <text x={cx + r + 15} y={cy - 60} fill={COLORS.arcMinor} fontSize={11} fontWeight={600} fontFamily="sans-serif">
        major arc
      </text>
      <path d={`M ${cx + r + 12} ${cy - 50} Q ${cx + r + 30} ${cy - 20} ${cx + r + 5} ${cy + 10}`}
        fill="none" stroke={COLORS.arcMinor} strokeWidth={1} strokeDasharray="3,3" opacity={0.6} />

      {/* Tangent line at top */}
      <line x1={tanX - 90} y1={tanY} x2={tanX + 90} y2={tanY} stroke={COLORS.tangent} strokeWidth={2} strokeLinecap="round" />
      <circle cx={tanX} cy={tanY} r={3.5} fill={COLORS.tangent} />
      <text x={tanX + 55} y={tanY - 8} fill={COLORS.tangent} fontSize={12} fontWeight={600} fontFamily="sans-serif">
        tangent
      </text>
      <text x={tanX + 55} y={tanY + 6} fill={COLORS.textDim} fontSize={9} fontFamily="sans-serif">
        (touches at 1 point)
      </text>

      {/* Secant line */}
      <line x1={secX1} y1={secY1} x2={secX2} y2={secY2} stroke={COLORS.secant} strokeWidth={2} strokeLinecap="round" strokeDasharray="6,4" />
      {/* Secant intersection points on circle */}
      {(() => {
        const sAngle1 = 145, sAngle2 = 25;
        const sx1 = cx + r * Math.cos((sAngle1 * Math.PI) / 180);
        const sy1 = cy + r * Math.sin((sAngle1 * Math.PI) / 180);
        const sx2 = cx + r * Math.cos((-sAngle2 * Math.PI) / 180);
        const sy2 = cy + r * Math.sin((-sAngle2 * Math.PI) / 180);
        return (
          <>
            <circle cx={sx1} cy={sy1} r={3} fill={COLORS.secant} />
            <circle cx={sx2} cy={sy2} r={3} fill={COLORS.secant} />
          </>
        );
      })()}
      <text x={secX2 + 8} y={secY2 + 4} fill={COLORS.secant} fontSize={12} fontWeight={600} fontFamily="sans-serif">
        secant
      </text>
      <text x={secX2 + 8} y={secY2 + 17} fill={COLORS.textDim} fontSize={9} fontFamily="sans-serif">
        (crosses at 2 points)
      </text>

      {/* Connecting question */}
      <text x={400} y={435} textAnchor="middle" fill={COLORS.accent} fontSize={14} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 1.5s' }}>
        Can you find circles around you? Wheels, bangles, coins...
      </text>
    </g>
  );
}

// ===========================
// Step 2: Folding to Find Centre
// ===========================
function Step2Folding({ visible }) {
  const cx = 400, cy = 230, r = 110;

  return (
    <g
      className="canvas-step"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.95)',
        transition: 'opacity 1.2s ease, transform 1.2s ease',
      }}
    >
      {/* Title */}
      <text x={400} y={50} textAnchor="middle" fill={COLORS.text} fontSize={20} fontWeight={700} fontFamily="sans-serif">
        Folding to Find Centre and Diameter
      </text>
      <text x={400} y={73} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif">
        Fold a paper circle in half — the crease is a diameter
      </text>

      {/* Paper circle */}
      <circle cx={cx} cy={cy} r={r} fill={COLORS.circleFill} opacity={0.12} stroke={COLORS.circle} strokeWidth={3} />

      {/* First fold crease (horizontal diameter) */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.5s' }}>
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy}
          stroke={COLORS.diameter} strokeWidth={2} strokeDasharray="10,5" />
        <text x={cx + r + 8} y={cy + 5} fill={COLORS.diameter} fontSize={11} fontWeight={600} fontFamily="sans-serif">
          1st fold
        </text>
        <text x={cx + r + 8} y={cy + 18} fill={COLORS.textDim} fontSize={9} fontFamily="sans-serif">
          (diameter)
        </text>
      </g>

      {/* Second fold crease (tilted diameter) */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.2s' }}>
        <line
          x1={cx + r * Math.cos((60 * Math.PI) / 180)} y1={cy - r * Math.sin((60 * Math.PI) / 180)}
          x2={cx - r * Math.cos((60 * Math.PI) / 180)} y2={cy + r * Math.sin((60 * Math.PI) / 180)}
          stroke={COLORS.gold} strokeWidth={2} strokeDasharray="10,5"
        />
        <text x={cx + r * Math.cos((60 * Math.PI) / 180) + 8} y={cy - r * Math.sin((60 * Math.PI) / 180) + 4}
          fill={COLORS.gold} fontSize={11} fontWeight={600} fontFamily="sans-serif">
          2nd fold
        </text>
      </g>

      {/* Centre point where folds intersect */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 2s' }}>
        <circle cx={cx} cy={cy} r={6} fill={COLORS.centre} opacity={0.3} />
        <circle cx={cx} cy={cy} r={3.5} fill={COLORS.centre} />
        <text x={cx} y={cy - 14} textAnchor="middle" fill={COLORS.centre} fontSize={14} fontWeight={700} fontFamily="sans-serif">
          Centre!
        </text>
        {/* Glow ring */}
        <circle cx={cx} cy={cy} r={14} fill="none" stroke={COLORS.centre} strokeWidth={1.5} opacity={0.4}
          strokeDasharray="3,3" />
      </g>

      {/* Thread showing radius in all directions */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.2s ease 2.5s' }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const ex = cx + (r - 10) * Math.cos(rad);
          const ey = cy + (r - 10) * Math.sin(rad);
          return (
            <line key={angle} x1={cx} y1={cy} x2={ex} y2={ey}
              stroke={COLORS.radius} strokeWidth={1} opacity={0.25} strokeDasharray="4,4" />
          );
        })}
        <text x={cx} y={cy + r + 30} textAnchor="middle" fill={COLORS.radius} fontSize={12} fontWeight={600} fontFamily="sans-serif">
          All radii are equal — that is the definition of a circle!
        </text>
      </g>

      {/* Fold arrow illustration */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 0.8s' }}>
        <path d={`M ${cx - 40} ${cy - r - 25} C ${cx - 20} ${cy - r - 40} ${cx + 20} ${cy - r - 40} ${cx + 40} ${cy - r - 25}`}
          fill="none" stroke={COLORS.textDim} strokeWidth={1.5} strokeDasharray="4,3" />
        {arrowHead(cx + 40, cy - r - 25, -30, 7, COLORS.textDim)}
        <text x={cx} y={cy - r - 42} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
          fold
        </text>
      </g>

      {/* Question */}
      <text x={400} y={430} textAnchor="middle" fill={COLORS.accent} fontSize={14} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 3s' }}>
        Two folds are enough to find the exact centre!
      </text>
    </g>
  );
}

// ===========================
// Step 3: Circumference / Diameter = Pi
// ===========================
function Step3Pi({ visible }) {
  const circles = [
    { cx: 140, cy: 200, r: 40, C: '15.7', D: '5.0', label: 'Small' },
    { cx: 330, cy: 200, r: 56, C: '22.0', D: '7.0', label: 'Medium' },
    { cx: 560, cy: 200, r: 80, C: '31.4', D: '10.0', label: 'Large' },
  ];

  return (
    <g
      className="canvas-step"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.95)',
        transition: 'opacity 1.2s ease, transform 1.2s ease',
      }}
    >
      {/* Title */}
      <text x={400} y={50} textAnchor="middle" fill={COLORS.text} fontSize={20} fontWeight={700} fontFamily="sans-serif">
        Discovering Pi (π)
      </text>
      <text x={400} y={73} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif">
        Measure circumference and diameter of different circles
      </text>

      {/* Three circles with thread wrapping animation */}
      {circles.map((c, i) => (
        <g key={i} style={{ opacity: visible ? 1 : 0, transition: `opacity 1s ease ${0.5 + i * 0.4}s` }}>
          {/* Circle */}
          <circle cx={c.cx} cy={c.cy} r={c.r} fill={COLORS.circleFill} opacity={0.1}
            stroke={COLORS.circle} strokeWidth={2.5} />
          {/* Diameter line */}
          <line x1={c.cx - c.r} y1={c.cy} x2={c.cx + c.r} y2={c.cy}
            stroke={COLORS.diameter} strokeWidth={1.5} strokeDasharray="5,3" />
          {/* Thread around circumference */}
          <circle cx={c.cx} cy={c.cy} r={c.r + 4} fill="none"
            stroke={COLORS.piColor} strokeWidth={3} opacity={0.5}
            strokeDasharray={`${2 * Math.PI * c.r * 0.7} ${2 * Math.PI * c.r * 0.3}`}
            strokeLinecap="round"
            style={{
              transition: `stroke-dasharray 2s ease ${1 + i * 0.4}s`,
            }}
          />
          {/* Label */}
          <text x={c.cx} y={c.cy + c.r + 22} textAnchor="middle" fill={COLORS.text} fontSize={12} fontWeight={600} fontFamily="sans-serif">
            {c.label}
          </text>
        </g>
      ))}

      {/* Results table */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.2s ease 1.8s' }}>
        {/* Table header */}
        <rect x={100} y={290} width={600} height={30} rx={6} fill={COLORS.orange} opacity={0.2} />
        <text x={200} y={310} textAnchor="middle" fill={COLORS.orangeLight} fontSize={12} fontWeight={700} fontFamily="sans-serif">Circle</text>
        <text x={330} y={310} textAnchor="middle" fill={COLORS.piColor} fontSize={12} fontWeight={700} fontFamily="sans-serif">Circumference (C)</text>
        <text x={460} y={310} textAnchor="middle" fill={COLORS.diameter} fontSize={12} fontWeight={700} fontFamily="sans-serif">Diameter (D)</text>
        <text x={590} y={310} textAnchor="middle" fill={COLORS.sparkle} fontSize={12} fontWeight={700} fontFamily="sans-serif">C / D</text>

        {/* Table rows */}
        {circles.map((c, i) => {
          const y = 340 + i * 28;
          return (
            <g key={i} style={{ opacity: visible ? 1 : 0, transition: `opacity 1s ease ${2.2 + i * 0.3}s` }}>
              <line x1={110} y1={y + 10} x2={690} y2={y + 10} stroke={COLORS.textDim} strokeWidth={0.5} opacity={0.3} />
              <text x={200} y={y} textAnchor="middle" fill={COLORS.text} fontSize={12} fontFamily="sans-serif">{c.label}</text>
              <text x={330} y={y} textAnchor="middle" fill={COLORS.piColor} fontSize={12} fontFamily="sans-serif">{c.C} cm</text>
              <text x={460} y={y} textAnchor="middle" fill={COLORS.diameter} fontSize={12} fontFamily="sans-serif">{c.D} cm</text>
              <text x={590} y={y} textAnchor="middle" fill={COLORS.sparkle} fontSize={13} fontWeight={700} fontFamily="sans-serif">3.14</text>
            </g>
          );
        })}
      </g>

      {/* Pi reveal */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 3.2s' }}>
        <rect x={250} y={410} width={300} height={48} rx={12} fill={COLORS.paper} stroke={COLORS.piColor} strokeWidth={2} />
        <text x={400} y={440} textAnchor="middle" fill={COLORS.text} fontSize={20} fontWeight={700} fontFamily="sans-serif">
          <tspan fill={COLORS.piColor}>C</tspan>
          <tspan fill={COLORS.textDim}> / </tspan>
          <tspan fill={COLORS.diameter}>D</tspan>
          <tspan fill={COLORS.textDim}> = </tspan>
          <tspan fill={COLORS.sparkle} fontSize={24}>π ≈ 3.14</tspan>
        </text>
      </g>

      {/* Sparkles around pi */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 3.5s' }}>
        <Sparkle cx={240} cy={420} size={6} delay={0} />
        <Sparkle cx={560} cy={420} size={6} delay={0.3} />
        <Sparkle cx={250} cy={445} size={5} delay={0.6} />
        <Sparkle cx={550} cy={445} size={5} delay={0.9} />
      </g>
    </g>
  );
}

// ===========================
// Step 4: Diameter is the Longest Chord
// ===========================
function Step4LongestChord({ visible }) {
  const cx = 400, cy = 230, r = 130;

  // Several chords at various positions, plus the diameter
  const chords = [
    { a1: 160, a2: 250, color: COLORS.chord, label: '8.2 cm' },
    { a1: 120, a2: 310, color: '#7E57C2', label: '10.5 cm' },
    { a1: 200, a2: 350, color: '#5C6BC0', label: '9.0 cm' },
    { a1: 70, a2: 240, color: '#26A69A', label: '11.3 cm' },
  ];

  return (
    <g
      className="canvas-step"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.95)',
        transition: 'opacity 1.2s ease, transform 1.2s ease',
      }}
    >
      {/* Title */}
      <text x={400} y={50} textAnchor="middle" fill={COLORS.text} fontSize={20} fontWeight={700} fontFamily="sans-serif">
        The Diameter is the Longest Chord
      </text>
      <text x={400} y={73} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif">
        Draw several chords and measure — which one is longest?
      </text>

      {/* Main circle */}
      <circle cx={cx} cy={cy} r={r} fill={COLORS.circleFill} opacity={0.08} stroke={COLORS.circle} strokeWidth={2.5} />

      {/* Centre */}
      <circle cx={cx} cy={cy} r={3} fill={COLORS.centre} />

      {/* Regular chords */}
      {chords.map((ch, i) => {
        const x1 = cx + r * Math.cos((ch.a1 * Math.PI) / 180);
        const y1 = cy + r * Math.sin((ch.a1 * Math.PI) / 180);
        const x2 = cx + r * Math.cos((ch.a2 * Math.PI) / 180);
        const y2 = cy + r * Math.sin((ch.a2 * Math.PI) / 180);
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        return (
          <g key={i} style={{ opacity: visible ? 1 : 0, transition: `opacity 1s ease ${0.5 + i * 0.3}s` }}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ch.color} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
            <circle cx={x1} cy={y1} r={2.5} fill={ch.color} />
            <circle cx={x2} cy={y2} r={2.5} fill={ch.color} />
            <text x={mx + 12} y={my - 6} fill={ch.color} fontSize={10} fontFamily="sans-serif" opacity={0.8}>
              {ch.label}
            </text>
          </g>
        );
      })}

      {/* Diameter — the longest chord, through centre */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.2s ease 2s' }}>
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy}
          stroke={COLORS.diameter} strokeWidth={3.5} strokeLinecap="round" />
        <circle cx={cx - r} cy={cy} r={3.5} fill={COLORS.diameter} />
        <circle cx={cx + r} cy={cy} r={3.5} fill={COLORS.diameter} />
        {/* Glow on diameter */}
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy}
          stroke={COLORS.diameter} strokeWidth={8} strokeLinecap="round" opacity={0.15} />
        <text x={cx} y={cy - 14} textAnchor="middle" fill={COLORS.diameter} fontSize={14} fontWeight={700} fontFamily="sans-serif">
          Diameter = 13.0 cm
        </text>
        {/* Crown / highlight indicator */}
        <text x={cx} y={cy - 30} textAnchor="middle" fill={COLORS.sparkle} fontSize={11} fontWeight={700} fontFamily="sans-serif">
          LONGEST!
        </text>
      </g>

      {/* Comparison box */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 2.5s' }}>
        <rect x={230} y={385} width={340} height={52} rx={12} fill={COLORS.paper} stroke={COLORS.diameter} strokeWidth={2} />
        <text x={400} y={408} textAnchor="middle" fill={COLORS.text} fontSize={13} fontFamily="sans-serif">
          The diameter passes through the centre,
        </text>
        <text x={400} y={426} textAnchor="middle" fill={COLORS.diameter} fontSize={14} fontWeight={700} fontFamily="sans-serif">
          making it always the longest chord.
        </text>
      </g>

      {/* Sparkles */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 3s' }}>
        <Sparkle cx={cx - r - 20} cy={cy} size={6} delay={0} />
        <Sparkle cx={cx + r + 20} cy={cy} size={6} delay={0.3} />
      </g>
    </g>
  );
}

// ===========================
// Step 5: Central Angle = 2x Inscribed Angle
// ===========================
function Step5Angles({ visible }) {
  const cx = 400, cy = 240, r = 130;
  // Arc AB
  const angleA = -40; // point A on circle
  const angleB = -140; // point B on circle
  // Point C on circumference (major arc side)
  const angleC = 80;
  // Central angle AOB
  const ax = cx + r * Math.cos((angleA * Math.PI) / 180);
  const ay = cy + r * Math.sin((angleA * Math.PI) / 180);
  const bx = cx + r * Math.cos((angleB * Math.PI) / 180);
  const by = cy + r * Math.sin((angleB * Math.PI) / 180);
  const ccx = cx + r * Math.cos((angleC * Math.PI) / 180);
  const ccy = cy + r * Math.sin((angleC * Math.PI) / 180);

  // Central angle value
  const centralAngle = Math.abs(angleA - angleB);
  const inscribedAngle = centralAngle / 2;

  return (
    <g
      className="canvas-step"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.95)',
        transition: 'opacity 1.2s ease, transform 1.2s ease',
      }}
    >
      {/* Title */}
      <text x={400} y={48} textAnchor="middle" fill={COLORS.sparkle} fontSize={20} fontWeight={700} fontFamily="sans-serif">
        Central Angle = 2 × Inscribed Angle
      </text>
      <text x={400} y={71} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif">
        The angle at the centre is always twice the angle at the circumference
      </text>

      {/* Main circle */}
      <circle cx={cx} cy={cy} r={r} fill={COLORS.circleFill} opacity={0.08} stroke={COLORS.circle} strokeWidth={2.5} />

      {/* Centre */}
      <circle cx={cx} cy={cy} r={4} fill={COLORS.centre} />
      <text x={cx + 8} y={cy - 6} fill={COLORS.centre} fontSize={13} fontWeight={700} fontFamily="sans-serif">O</text>

      {/* Arc AB (highlighted) */}
      <AngleArc cx={cx} cy={cy} radius={r + 5} startAngle={angleB} endAngle={angleA} color={COLORS.arc} strokeWidth={5} />

      {/* Points A and B */}
      <circle cx={ax} cy={ay} r={5} fill={COLORS.orangeLight} />
      <text x={ax + 14} y={ay + 5} fill={COLORS.orangeLight} fontSize={14} fontWeight={700} fontFamily="sans-serif">A</text>

      <circle cx={bx} cy={by} r={5} fill={COLORS.orangeLight} />
      <text x={bx - 20} y={by + 5} fill={COLORS.orangeLight} fontSize={14} fontWeight={700} fontFamily="sans-serif">B</text>

      {/* Central angle lines OA and OB */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.8s' }}>
        <line x1={cx} y1={cy} x2={ax} y2={ay} stroke={COLORS.diameter} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={bx} y2={by} stroke={COLORS.diameter} strokeWidth={2.5} strokeLinecap="round" />
        {/* Central angle arc */}
        <AngleArc cx={cx} cy={cy} radius={30} startAngle={angleB} endAngle={angleA}
          color={COLORS.diameter} strokeWidth={3} fill={COLORS.diameter} fillOpacity={0.15} />
        <text x={cx + 3} y={cy - 32} textAnchor="middle" fill={COLORS.diameter} fontSize={13} fontWeight={700} fontFamily="sans-serif">
          {centralAngle}°
        </text>
      </g>

      {/* Point C on circumference */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.5s' }}>
        <circle cx={ccx} cy={ccy} r={5} fill={COLORS.proof} />
        <text x={ccx + 8} y={ccy + 18} fill={COLORS.proof} fontSize={14} fontWeight={700} fontFamily="sans-serif">C</text>

        {/* Inscribed angle lines CA and CB */}
        <line x1={ccx} y1={ccy} x2={ax} y2={ay} stroke={COLORS.proof} strokeWidth={2} strokeLinecap="round" />
        <line x1={ccx} y1={ccy} x2={bx} y2={by} stroke={COLORS.proof} strokeWidth={2} strokeLinecap="round" />

        {/* Inscribed angle arc at C */}
        {(() => {
          const angleToCa = Math.atan2(ay - ccy, ax - ccx) * (180 / Math.PI);
          const angleToCb = Math.atan2(by - ccy, bx - ccx) * (180 / Math.PI);
          return (
            <AngleArc cx={ccx} cy={ccy} radius={25} startAngle={angleToCb} endAngle={angleToCa}
              color={COLORS.proof} strokeWidth={3} fill={COLORS.proof} fillOpacity={0.15} />
          );
        })()}
        <text x={ccx - 25} y={ccy + 35} textAnchor="middle" fill={COLORS.proof} fontSize={13} fontWeight={700} fontFamily="sans-serif">
          {inscribedAngle}°
        </text>
      </g>

      {/* Formula reveal */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 2.5s' }}>
        <rect x={220} y={395} width={360} height={52} rx={12} fill={COLORS.paper} stroke={COLORS.sparkle} strokeWidth={2} />
        <text x={400} y={416} textAnchor="middle" fill={COLORS.textDim} fontSize={12} fontFamily="sans-serif">
          Central angle AOB
        </text>
        <text x={400} y={438} textAnchor="middle" fill={COLORS.text} fontSize={20} fontWeight={700} fontFamily="sans-serif">
          <tspan fill={COLORS.diameter}>{centralAngle}°</tspan>
          <tspan fill={COLORS.textDim}> = 2 × </tspan>
          <tspan fill={COLORS.proof}>{inscribedAngle}°</tspan>
          <tspan fill={COLORS.textDim}> ✓</tspan>
        </text>
      </g>

      {/* Sparkles */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 3s' }}>
        <Sparkle cx={180} cy={150} size={7} delay={0} />
        <Sparkle cx={620} cy={130} size={6} delay={0.3} />
        <Sparkle cx={160} cy={380} size={5} delay={0.6} />
        <Sparkle cx={660} cy={360} size={8} delay={0.2} />
        <Sparkle cx={300} cy={100} size={5} delay={0.9} />
        <Sparkle cx={520} cy={410} size={6} delay={0.5} />
      </g>
    </g>
  );
}

// ========================================
// Main Component
// ========================================
export default function M1CirclesCanvas({ currentStep = 1 }) {
  const [activeStep, setActiveStep] = useState(currentStep);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (currentStep !== activeStep) {
      setTransitioning(true);
      const timer = setTimeout(() => {
        setActiveStep(currentStep);
        setTransitioning(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentStep, activeStep]);

  const step = transitioning ? 0 : activeStep;
  const totalSteps = 5;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: COLORS.bg,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Inline keyframes */}
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
        }
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <svg
        viewBox="0 0 800 480"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
      >
        {/* Definitions */}
        <defs>
          {/* Paper texture pattern */}
          <pattern id="circPaperTexture" patternUnits="userSpaceOnUse" width={6} height={6}>
            <rect width={6} height={6} fill={COLORS.paper} />
            <circle cx={1} cy={1} r={0.4} fill="#ffffff" opacity={0.03} />
            <circle cx={4} cy={4} r={0.3} fill="#ffffff" opacity={0.02} />
          </pattern>

          {/* Subtle grid pattern */}
          <pattern id="circGridPattern" patternUnits="userSpaceOnUse" width={40} height={40}>
            <line x1={0} y1={40} x2={40} y2={40} stroke="#ffffff" strokeWidth={0.3} opacity={0.04} />
            <line x1={40} y1={0} x2={40} y2={40} stroke="#ffffff" strokeWidth={0.3} opacity={0.04} />
          </pattern>

          {/* Glow filter */}
          <filter id="circGlow">
            <feGaussianBlur stdDeviation={3} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={800} height={480} fill={COLORS.bg} />

        {/* Paper work surface */}
        <rect x={20} y={20} width={760} height={440} rx={16} ry={16}
          fill="url(#circPaperTexture)"
          stroke={COLORS.paperBorder}
          strokeWidth={1.5}
        />
        <rect x={20} y={20} width={760} height={440} rx={16} ry={16}
          fill="url(#circGridPattern)"
        />

        {/* Step indicator dots */}
        <g transform="translate(400, 468)">
          {[1, 2, 3, 4, 5].map((s) => (
            <circle
              key={s}
              cx={(s - 3) * 24}
              cy={0}
              r={activeStep === s ? 5 : 3.5}
              fill={activeStep === s ? COLORS.accent : COLORS.textDim}
              opacity={activeStep === s ? 1 : 0.4}
              style={{ transition: 'all 0.5s ease' }}
            />
          ))}
        </g>

        {/* Render the active step */}
        <Step1Terminology visible={step === 1} />
        <Step2Folding visible={step === 2} />
        <Step3Pi visible={step === 3} />
        <Step4LongestChord visible={step === 4} />
        <Step5Angles visible={step === 5} />
      </svg>
    </div>
  );
}
