import { useState, useEffect } from 'react';

/**
 * M1QuadrilateralsCanvas — Interactive SVG canvas for M1 Quadrilaterals: Types & Angle Sum Property
 *
 * ABL Experiment: Students classify five types of quadrilaterals, build them with geosticks,
 * measure all four interior angles, and discover that A + B + C + D = 360 degrees.
 *
 * Steps:
 *   1. Five types of quadrilaterals — trapezium, parallelogram, rhombus, rectangle, square
 *   2. Measuring angles — parallelogram with protractor, all 4 angles measured
 *   3. Cutting corners — 4 corners labelled A, B, C, D cut with scissors
 *   4. 360° proof — 4 colored angle pieces arranged around a point forming full circle
 */

// --- Color palette (math orange family) ---
const COLORS = {
  bg: '#0a0a0a',
  paper: '#1a1a2e',
  paperBorder: '#2a2a4e',
  trapezium: '#f97316',
  trapeziumDark: '#c2410c',
  parallelogram: '#3b82f6',
  parallelogramDark: '#1d4ed8',
  rhombus: '#8b5cf6',
  rhombusDark: '#6d28d9',
  rectangle: '#10b981',
  rectangleDark: '#047857',
  square: '#ef4444',
  squareDark: '#b91c1c',
  angleA: '#ef4444',
  angleB: '#3b82f6',
  angleC: '#eab308',
  angleD: '#10b981',
  line: '#94a3b8',
  text: '#e2e8f0',
  textDim: '#64748b',
  sparkle: '#fbbf24',
  accent: '#E65100',
};

// --- Angle arc helper ---
function AngleArc({ cx, cy, radius, startAngle, endAngle, color, strokeWidth = 2.5 }) {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  const sweep = endAngle - startAngle > 180 ? 1 : 0;
  const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${sweep} 1 ${x2} ${y2}`;
  return <path d={d} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />;
}

// --- Filled angle wedge helper ---
function AngleWedge({ cx, cy, radius, startAngle, endAngle, color, opacity = 0.4 }) {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  return <path d={d} fill={color} opacity={opacity} />;
}

// --- Right angle marker ---
function RightAngleMarker({ cx, cy, size = 10, rotation = 0, color = COLORS.rectangle }) {
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const transform = (x, y) => [cx + x * cos - y * sin, cy + x * sin + y * cos];
  const [x1, y1] = transform(size, 0);
  const [x2, y2] = transform(size, -size);
  const [x3, y3] = transform(0, -size);
  return (
    <polyline
      points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  );
}

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

// --- Scissors Icon ---
function ScissorsIcon({ x, y, size = 40, opacity = 1 }) {
  const s = size / 40;
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`} opacity={opacity}>
      <ellipse cx={-8} cy={14} rx={6} ry={8} fill="none" stroke="#94a3b8" strokeWidth={2} transform="rotate(-15, -8, 14)" />
      <line x1={-4} y1={8} x2={4} y2={-12} stroke="#cbd5e1" strokeWidth={2.5} strokeLinecap="round" />
      <ellipse cx={8} cy={14} rx={6} ry={8} fill="none" stroke="#94a3b8" strokeWidth={2} transform="rotate(15, 8, 14)" />
      <line x1={4} y1={8} x2={-4} y2={-12} stroke="#cbd5e1" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={0} cy={0} r={3} fill="#475569" stroke="#94a3b8" strokeWidth={1.5} />
    </g>
  );
}

// --- Parallel marks (small arrows on sides) ---
function ParallelMarks({ x1, y1, x2, y2, count = 1, color = COLORS.text }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / len;
  const ny = dy / len;
  const marks = [];
  for (let i = 0; i < count; i++) {
    const offset = (i - (count - 1) / 2) * 6;
    const cx = mx + nx * offset;
    const cy = my + ny * offset;
    marks.push(
      <g key={i}>
        <line x1={cx - ny * 5 - nx * 3} y1={cy + nx * 5 - ny * 3} x2={cx} y2={cy} stroke={color} strokeWidth={1.5} />
        <line x1={cx} y1={cy} x2={cx - ny * 5 + nx * 3} y2={cy + nx * 5 + ny * 3} stroke={color} strokeWidth={1.5} />
      </g>
    );
  }
  return <g>{marks}</g>;
}


// ========================================
// Step 1: Five Types of Quadrilaterals
// ========================================
function Step1Types({ visible }) {
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
      <text x={400} y={52} textAnchor="middle" fill={COLORS.text} fontSize={20} fontWeight={700} fontFamily="sans-serif">
        Five Types of Quadrilaterals
      </text>
      <text x={400} y={74} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif">
        Every quadrilateral has 4 sides, 4 vertices, and 4 interior angles
      </text>

      {/* --- Trapezium --- top-left */}
      <g transform="translate(130, 190)">
        <polygon
          points="-20,-50 40,-50 60,30 -50,30"
          fill="url(#gradTrapezium)"
          stroke={COLORS.trapezium}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <ParallelMarks x1={-20} y1={-50} x2={40} y2={-50} count={1} color={COLORS.trapezium} />
        <ParallelMarks x1={-50} y1={30} x2={60} y2={30} count={1} color={COLORS.trapezium} />
        <text x={5} y={62} textAnchor="middle" fill={COLORS.trapezium} fontSize={13} fontWeight={600} fontFamily="sans-serif">
          Trapezium
        </text>
        <text x={5} y={78} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
          One pair parallel
        </text>
      </g>

      {/* --- Parallelogram --- top-right */}
      <g transform="translate(310, 190)">
        <polygon
          points="-15,-45 55,-45 75,30 5,30"
          fill="url(#gradParallelogram)"
          stroke={COLORS.parallelogram}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <ParallelMarks x1={-15} y1={-45} x2={55} y2={-45} count={1} color={COLORS.parallelogram} />
        <ParallelMarks x1={5} y1={30} x2={75} y2={30} count={1} color={COLORS.parallelogram} />
        <ParallelMarks x1={-15} y1={-45} x2={5} y2={30} count={2} color={COLORS.parallelogram} />
        <ParallelMarks x1={55} y1={-45} x2={75} y2={30} count={2} color={COLORS.parallelogram} />
        <text x={30} y={62} textAnchor="middle" fill={COLORS.parallelogram} fontSize={13} fontWeight={600} fontFamily="sans-serif">
          Parallelogram
        </text>
        <text x={30} y={78} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
          Both pairs parallel
        </text>
      </g>

      {/* --- Rhombus --- center */}
      <g transform="translate(510, 190)">
        <polygon
          points="0,-55 50,0 0,55 -50,0"
          fill="url(#gradRhombus)"
          stroke={COLORS.rhombus}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {/* Equal side tick marks */}
        <line x1={20} y1={-30} x2={28} y2={-24} stroke={COLORS.rhombus} strokeWidth={1.5} />
        <line x1={20} y1={30} x2={28} y2={24} stroke={COLORS.rhombus} strokeWidth={1.5} />
        <line x1={-20} y1={-30} x2={-28} y2={-24} stroke={COLORS.rhombus} strokeWidth={1.5} />
        <line x1={-20} y1={30} x2={-28} y2={24} stroke={COLORS.rhombus} strokeWidth={1.5} />
        <text x={0} y={82} textAnchor="middle" fill={COLORS.rhombus} fontSize={13} fontWeight={600} fontFamily="sans-serif">
          Rhombus
        </text>
        <text x={0} y={98} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
          All sides equal
        </text>
      </g>

      {/* --- Rectangle --- bottom-left */}
      <g transform="translate(200, 355)">
        <rect x={-55} y={-35} width={110} height={70} rx={2}
          fill="url(#gradRectangle)"
          stroke={COLORS.rectangle}
          strokeWidth={2.5}
        />
        <RightAngleMarker cx={-55} cy={-35} size={8} rotation={0} color={COLORS.rectangle} />
        <RightAngleMarker cx={55} cy={-35} size={8} rotation={90} color={COLORS.rectangle} />
        <RightAngleMarker cx={55} cy={35} size={8} rotation={180} color={COLORS.rectangle} />
        <RightAngleMarker cx={-55} cy={35} size={8} rotation={270} color={COLORS.rectangle} />
        <text x={0} y={58} textAnchor="middle" fill={COLORS.rectangle} fontSize={13} fontWeight={600} fontFamily="sans-serif">
          Rectangle
        </text>
        <text x={0} y={74} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
          All angles 90°
        </text>
      </g>

      {/* --- Square --- bottom-right */}
      <g transform="translate(460, 355)">
        <rect x={-38} y={-38} width={76} height={76} rx={2}
          fill="url(#gradSquare)"
          stroke={COLORS.square}
          strokeWidth={2.5}
        />
        <RightAngleMarker cx={-38} cy={-38} size={8} rotation={0} color={COLORS.square} />
        <RightAngleMarker cx={38} cy={-38} size={8} rotation={90} color={COLORS.square} />
        <RightAngleMarker cx={38} cy={38} size={8} rotation={180} color={COLORS.square} />
        <RightAngleMarker cx={-38} cy={38} size={8} rotation={270} color={COLORS.square} />
        {/* Equal side tick marks */}
        <line x1={-2} y1={-38} x2={2} y2={-38} stroke={COLORS.square} strokeWidth={2} transform="rotate(0, 0, -38)" />
        <line x1={-2} y1={38} x2={2} y2={38} stroke={COLORS.square} strokeWidth={2} />
        <line x1={-38} y1={-2} x2={-38} y2={2} stroke={COLORS.square} strokeWidth={2} />
        <line x1={38} y1={-2} x2={38} y2={2} stroke={COLORS.square} strokeWidth={2} />
        <text x={0} y={60} textAnchor="middle" fill={COLORS.square} fontSize={13} fontWeight={600} fontFamily="sans-serif">
          Square
        </text>
        <text x={0} y={76} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
          All equal, all 90°
        </text>
      </g>

      {/* Connecting thought */}
      <text x={400} y={448} textAnchor="middle" fill={COLORS.accent} fontSize={14} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 1.5s' }}>
        Do all these different shapes share a common angle property?
      </text>
    </g>
  );
}


// ========================================
// Step 2: Measuring Angles with Protractor
// ========================================
function Step2Measuring({ visible }) {
  // Protractor tick marks for a full protractor at vertex
  function ProtractorAtVertex({ cx, cy, radius, rotation, measuredAngle, color, label }) {
    const ticks = [];
    for (let deg = 0; deg <= 180; deg += 10) {
      const rad = ((deg + rotation) * Math.PI) / 180;
      const r1 = deg % 30 === 0 ? radius - 8 : radius - 4;
      const r2 = radius;
      const x1 = cx + r1 * Math.cos(rad);
      const y1 = cy + r1 * Math.sin(rad);
      const x2 = cx + r2 * Math.cos(rad);
      const y2 = cy + r2 * Math.sin(rad);
      ticks.push(
        <line key={`tick-${deg}`} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={COLORS.textDim} strokeWidth={deg % 30 === 0 ? 1 : 0.5} opacity={0.6} />
      );
    }
    const startRad = (rotation * Math.PI) / 180;
    const endRad = ((rotation + 180) * Math.PI) / 180;
    const sx = cx + radius * Math.cos(startRad);
    const sy = cy + radius * Math.sin(startRad);
    const ex = cx + radius * Math.cos(endRad);
    const ey = cy + radius * Math.sin(endRad);

    return (
      <g>
        <path
          d={`M ${sx} ${sy} A ${radius} ${radius} 0 0 1 ${ex} ${ey}`}
          fill="none" stroke={color} strokeWidth={1.5} opacity={0.4}
        />
        {ticks}
        <AngleArc cx={cx} cy={cy} radius={radius - 12} startAngle={rotation} endAngle={rotation + measuredAngle} color={color} strokeWidth={3} />
        <text x={cx} y={cy - radius - 6} textAnchor="middle" fill={color} fontSize={14} fontWeight={700} fontFamily="sans-serif">
          {label}: {measuredAngle}°
        </text>
      </g>
    );
  }

  // Parallelogram vertices
  const pA = { x: 250, y: 160 }; // top-left
  const pB = { x: 530, y: 160 }; // top-right
  const pC = { x: 580, y: 320 }; // bottom-right
  const pD = { x: 300, y: 320 }; // bottom-left

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
      <text x={400} y={52} textAnchor="middle" fill={COLORS.text} fontSize={20} fontWeight={700} fontFamily="sans-serif">
        Measuring All Four Angles
      </text>
      <text x={400} y={74} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif">
        Use protractors to measure each interior angle of the parallelogram
      </text>

      {/* Parallelogram */}
      <polygon
        points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`}
        fill="url(#gradParallelogram)"
        stroke={COLORS.parallelogram}
        strokeWidth={3}
        strokeLinejoin="round"
      />

      {/* Geostick screws at vertices */}
      {[pA, pB, pC, pD].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={5} fill="#475569" stroke="#94a3b8" strokeWidth={1.5} />
          <circle cx={p.x} cy={p.y} r={2} fill="#94a3b8" />
        </g>
      ))}

      {/* Angle arcs and labels at each vertex */}
      {/* A (top-left): angle between DA and AB */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.5s' }}>
        <AngleArc cx={pA.x} cy={pA.y} radius={28} startAngle={-17} endAngle={0} color={COLORS.angleA} strokeWidth={3} />
        <AngleArc cx={pA.x} cy={pA.y} radius={28} startAngle={-73} endAngle={-17} color={COLORS.angleA} strokeWidth={3} />
        <AngleWedge cx={pA.x} cy={pA.y} radius={28} startAngle={-73} endAngle={0} color={COLORS.angleA} opacity={0.25} />
        <text x={pA.x + 36} y={pA.y - 10} fill={COLORS.angleA} fontSize={15} fontWeight={700} fontFamily="sans-serif">A</text>
        <text x={pA.x + 36} y={pA.y + 6} fill={COLORS.angleA} fontSize={12} fontFamily="sans-serif">73°</text>
      </g>

      {/* B (top-right): angle between AB and BC */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.9s' }}>
        <AngleArc cx={pB.x} cy={pB.y} radius={28} startAngle={162} endAngle={180} color={COLORS.angleB} strokeWidth={3} />
        <AngleArc cx={pB.x} cy={pB.y} radius={28} startAngle={73} endAngle={162} color={COLORS.angleB} strokeWidth={3} />
        <AngleWedge cx={pB.x} cy={pB.y} radius={28} startAngle={73} endAngle={180} color={COLORS.angleB} opacity={0.25} />
        <text x={pB.x - 42} y={pB.y - 10} fill={COLORS.angleB} fontSize={15} fontWeight={700} fontFamily="sans-serif">B</text>
        <text x={pB.x - 42} y={pB.y + 6} fill={COLORS.angleB} fontSize={12} fontFamily="sans-serif">107°</text>
      </g>

      {/* C (bottom-right): angle between BC and CD */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.3s' }}>
        <AngleArc cx={pC.x} cy={pC.y} radius={28} startAngle={180} endAngle={253} color={COLORS.angleC} strokeWidth={3} />
        <AngleWedge cx={pC.x} cy={pC.y} radius={28} startAngle={180} endAngle={253} color={COLORS.angleC} opacity={0.25} />
        <text x={pC.x - 42} y={pC.y + 18} fill={COLORS.angleC} fontSize={15} fontWeight={700} fontFamily="sans-serif">C</text>
        <text x={pC.x - 42} y={pC.y + 34} fill={COLORS.angleC} fontSize={12} fontFamily="sans-serif">73°</text>
      </g>

      {/* D (bottom-left): angle between CD and DA */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.7s' }}>
        <AngleArc cx={pD.x} cy={pD.y} radius={28} startAngle={-17} endAngle={90} color={COLORS.angleD} strokeWidth={3} />
        <AngleWedge cx={pD.x} cy={pD.y} radius={28} startAngle={-17} endAngle={90} color={COLORS.angleD} opacity={0.25} />
        <text x={pD.x + 36} y={pD.y + 18} fill={COLORS.angleD} fontSize={15} fontWeight={700} fontFamily="sans-serif">D</text>
        <text x={pD.x + 36} y={pD.y + 34} fill={COLORS.angleD} fontSize={12} fontFamily="sans-serif">107°</text>
      </g>

      {/* Measurement table */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 2s' }}>
        <rect x={240} y={365} width={320} height={46} rx={10} fill={COLORS.paper} stroke={COLORS.paperBorder} strokeWidth={1.5} />
        <text x={400} y={395} textAnchor="middle" fill={COLORS.text} fontSize={16} fontWeight={600} fontFamily="sans-serif">
          <tspan fill={COLORS.angleA}>73°</tspan>
          <tspan fill={COLORS.textDim}> + </tspan>
          <tspan fill={COLORS.angleB}>107°</tspan>
          <tspan fill={COLORS.textDim}> + </tspan>
          <tspan fill={COLORS.angleC}>73°</tspan>
          <tspan fill={COLORS.textDim}> + </tspan>
          <tspan fill={COLORS.angleD}>107°</tspan>
          <tspan fill={COLORS.textDim}> = </tspan>
          <tspan fill={COLORS.accent} fontWeight={700}>???</tspan>
        </text>
      </g>

      {/* Instruction */}
      <text x={400} y={440} textAnchor="middle" fill={COLORS.accent} fontSize={14} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 2.5s' }}>
        Add them up — what do you get?
      </text>
    </g>
  );
}


// ========================================
// Step 3: Cutting Corners
// ========================================
function Step3Cutting({ visible }) {
  // A general quadrilateral (slightly irregular)
  const qA = { x: 160, y: 140 }; // top-left
  const qB = { x: 480, y: 120 }; // top-right
  const qC = { x: 520, y: 320 }; // bottom-right
  const qD = { x: 120, y: 300 }; // bottom-left

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
      <text x={400} y={52} textAnchor="middle" fill={COLORS.text} fontSize={20} fontWeight={700} fontFamily="sans-serif">
        Cut the Four Corners
      </text>
      <text x={400} y={74} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif">
        Carefully cut out each angle of the quadrilateral
      </text>

      {/* Main quadrilateral body */}
      <polygon
        points={`${qA.x},${qA.y} ${qB.x},${qB.y} ${qC.x},${qC.y} ${qD.x},${qD.y}`}
        fill="url(#gradParallelogram)"
        stroke={COLORS.parallelogram}
        strokeWidth={3}
        strokeLinejoin="round"
        opacity={0.5}
      />

      {/* Corner A (top-left) — cut piece */}
      <g>
        <polygon
          points={`${qA.x},${qA.y} ${qA.x + 50},${qA.y + 5} ${qA.x + 5},${qA.y + 50}`}
          fill={COLORS.angleA}
          opacity={0.45}
          stroke={COLORS.angleA}
          strokeWidth={1.5}
        />
        <line x1={qA.x + 50} y1={qA.y + 5} x2={qA.x + 5} y2={qA.y + 50}
          stroke={COLORS.angleA} strokeWidth={2} strokeDasharray="6,4" opacity={0.9} />
        <AngleArc cx={qA.x} cy={qA.y} radius={20} startAngle={6} endAngle={84} color={COLORS.angleA} strokeWidth={3} />
        <text x={qA.x - 8} y={qA.y - 10} fill={COLORS.angleA} fontSize={18} fontWeight={700} fontFamily="sans-serif">A</text>
      </g>

      {/* Corner B (top-right) — cut piece */}
      <g>
        <polygon
          points={`${qB.x},${qB.y} ${qB.x - 50},${qB.y + 10} ${qB.x - 5},${qB.y + 55}`}
          fill={COLORS.angleB}
          opacity={0.45}
          stroke={COLORS.angleB}
          strokeWidth={1.5}
        />
        <line x1={qB.x - 50} y1={qB.y + 10} x2={qB.x - 5} y2={qB.y + 55}
          stroke={COLORS.angleB} strokeWidth={2} strokeDasharray="6,4" opacity={0.9} />
        <AngleArc cx={qB.x} cy={qB.y} radius={20} startAngle={96} endAngle={174} color={COLORS.angleB} strokeWidth={3} />
        <text x={qB.x + 12} y={qB.y - 10} fill={COLORS.angleB} fontSize={18} fontWeight={700} fontFamily="sans-serif">B</text>
      </g>

      {/* Corner C (bottom-right) — cut piece */}
      <g>
        <polygon
          points={`${qC.x},${qC.y} ${qC.x - 55},${qC.y - 10} ${qC.x - 10},${qC.y - 50}`}
          fill={COLORS.angleC}
          opacity={0.45}
          stroke={COLORS.angleC}
          strokeWidth={1.5}
        />
        <line x1={qC.x - 55} y1={qC.y - 10} x2={qC.x - 10} y2={qC.y - 50}
          stroke={COLORS.angleC} strokeWidth={2} strokeDasharray="6,4" opacity={0.9} />
        <AngleArc cx={qC.x} cy={qC.y} radius={20} startAngle={190} endAngle={282} color={COLORS.angleC} strokeWidth={3} />
        <text x={qC.x + 14} y={qC.y + 18} fill={COLORS.angleC} fontSize={18} fontWeight={700} fontFamily="sans-serif">C</text>
      </g>

      {/* Corner D (bottom-left) — cut piece */}
      <g>
        <polygon
          points={`${qD.x},${qD.y} ${qD.x + 55},${qD.y - 5} ${qD.x + 10},${qD.y - 50}`}
          fill={COLORS.angleD}
          opacity={0.45}
          stroke={COLORS.angleD}
          strokeWidth={1.5}
        />
        <line x1={qD.x + 55} y1={qD.y - 5} x2={qD.x + 10} y2={qD.y - 50}
          stroke={COLORS.angleD} strokeWidth={2} strokeDasharray="6,4" opacity={0.9} />
        <AngleArc cx={qD.x} cy={qD.y} radius={20} startAngle={-84} endAngle={6} color={COLORS.angleD} strokeWidth={3} />
        <text x={qD.x - 20} y={qD.y + 18} fill={COLORS.angleD} fontSize={18} fontWeight={700} fontFamily="sans-serif">D</text>
      </g>

      {/* Scissors icons */}
      <ScissorsIcon x={190} y={200} size={28} opacity={visible ? 0.7 : 0} />
      <ScissorsIcon x={445} y={185} size={28} opacity={visible ? 0.7 : 0} />
      <ScissorsIcon x={480} y={280} size={28} opacity={visible ? 0.6 : 0} />
      <ScissorsIcon x={158} y={260} size={28} opacity={visible ? 0.6 : 0} />

      {/* Legend */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 1s' }}>
        <rect x={610} y={150} width={120} height={110} rx={8} fill={COLORS.paper} stroke={COLORS.paperBorder} strokeWidth={1} opacity={0.8} />
        <rect x={622} y={166} width={12} height={12} rx={3} fill={COLORS.angleA} opacity={0.8} />
        <text x={640} y={177} fill={COLORS.text} fontSize={12} fontFamily="sans-serif">Angle A</text>
        <rect x={622} y={188} width={12} height={12} rx={3} fill={COLORS.angleB} opacity={0.8} />
        <text x={640} y={199} fill={COLORS.text} fontSize={12} fontFamily="sans-serif">Angle B</text>
        <rect x={622} y={210} width={12} height={12} rx={3} fill={COLORS.angleC} opacity={0.8} />
        <text x={640} y={221} fill={COLORS.text} fontSize={12} fontFamily="sans-serif">Angle C</text>
        <rect x={622} y={232} width={12} height={12} rx={3} fill={COLORS.angleD} opacity={0.8} />
        <text x={640} y={243} fill={COLORS.text} fontSize={12} fontFamily="sans-serif">Angle D</text>
      </g>

      {/* Instruction */}
      <text x={400} y={400} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 1.5s' }}>
        Cut along the dotted lines to separate each corner piece
      </text>
      <text x={400} y={440} textAnchor="middle" fill={COLORS.accent} fontSize={14} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 2s' }}>
        Now arrange them around a single point...
      </text>
    </g>
  );
}


// ========================================
// Step 4: 360° Proof
// ========================================
function Step4Proof({ visible }) {
  // The four angles of our quadrilateral sum to 360°
  // Using angles: A=78°, B=102°, C=92°, D=88° (sum=360)
  const angles = [
    { label: 'A', degrees: 78, color: COLORS.angleA },
    { label: 'B', degrees: 102, color: COLORS.angleB },
    { label: 'C', degrees: 92, color: COLORS.angleC },
    { label: 'D', degrees: 88, color: COLORS.angleD },
  ];

  const cx = 300;
  const cy = 240;
  const outerR = 110;
  const arcR = 80;

  // Build wedge paths
  let cumulative = 0;
  const wedges = angles.map((a, i) => {
    const startDeg = cumulative;
    const endDeg = cumulative + a.degrees;
    cumulative = endDeg;

    const startRad = (startDeg * Math.PI) / 180;
    const endRad = (endDeg * Math.PI) / 180;
    const midRad = ((startDeg + endDeg) / 2 * Math.PI) / 180;

    const x1 = cx + outerR * Math.cos(startRad);
    const y1 = cy + outerR * Math.sin(startRad);
    const x2 = cx + outerR * Math.cos(endRad);
    const y2 = cy + outerR * Math.sin(endRad);
    const largeArc = a.degrees > 180 ? 1 : 0;

    const labelR = outerR * 0.6;
    const lx = cx + labelR * Math.cos(midRad);
    const ly = cy + labelR * Math.sin(midRad);

    const degLabelR = outerR * 0.38;
    const dlx = cx + degLabelR * Math.cos(midRad);
    const dly = cy + degLabelR * Math.sin(midRad);

    return {
      ...a,
      startDeg,
      endDeg,
      wedgePath: `M ${cx} ${cy} L ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      lx, ly, dlx, dly,
      delay: 0.5 + i * 0.4,
    };
  });

  // 360° protractor ticks (full circle)
  const ticks = [];
  for (let deg = 0; deg < 360; deg += 10) {
    const rad = (deg * Math.PI) / 180;
    const r1 = deg % 30 === 0 ? outerR + 6 : outerR + 3;
    const r2 = outerR + 14;
    const x1 = cx + r1 * Math.cos(rad);
    const y1 = cy + r1 * Math.sin(rad);
    const x2 = cx + r2 * Math.cos(rad);
    const y2 = cy + r2 * Math.sin(rad);
    ticks.push(
      <line key={`tick-${deg}`} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={COLORS.textDim} strokeWidth={deg % 90 === 0 ? 1.5 : 0.6} opacity={0.5} />
    );
    if (deg % 90 === 0) {
      const tx = cx + (outerR + 24) * Math.cos(rad);
      const ty = cy + (outerR + 24) * Math.sin(rad);
      ticks.push(
        <text key={`label-${deg}`} x={tx} y={ty + 4} textAnchor="middle"
          fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
          {deg}°
        </text>
      );
    }
  }

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
      <text x={400} y={46} textAnchor="middle" fill={COLORS.sparkle} fontSize={22} fontWeight={700} fontFamily="sans-serif">
        The Angle Sum Property!
      </text>

      {/* Protractor circle */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 0.3s' }}>
        <circle cx={cx} cy={cy} r={outerR + 14} fill="none" stroke={COLORS.line} strokeWidth={1.5} opacity={0.3} />
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={COLORS.line} strokeWidth={1} opacity={0.2} />
        {ticks}
        <circle cx={cx} cy={cy} r={4} fill={COLORS.line} opacity={0.6} />
      </g>

      {/* Four colored wedges filling the full circle */}
      {wedges.map((w, i) => (
        <g key={i} style={{ opacity: visible ? 1 : 0, transition: `opacity 1s ease ${w.delay}s` }}>
          <path d={w.wedgePath} fill={w.color} opacity={0.45} stroke={w.color} strokeWidth={1.5} />
          <AngleArc cx={cx} cy={cy} radius={arcR - i * 8} startAngle={w.startDeg} endAngle={w.endDeg} color={w.color} strokeWidth={3} />
          <text x={w.lx} y={w.ly + 2} textAnchor="middle" fill={w.color} fontSize={18} fontWeight={700} fontFamily="sans-serif">
            {w.label}
          </text>
          <text x={w.dlx} y={w.dly + 2} textAnchor="middle" fill={w.color} fontSize={11} fontFamily="sans-serif">
            {w.degrees}°
          </text>
        </g>
      ))}

      {/* 360° label around the full circle */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 2.2s' }}>
        <circle cx={cx} cy={cy} r={outerR - 4} fill="none" stroke={COLORS.accent} strokeWidth={2} strokeDasharray="8,4" opacity={0.6} />
        <text x={cx} y={cy + 3} textAnchor="middle" fill={COLORS.accent} fontSize={13} fontWeight={700} fontFamily="sans-serif">
          360°
        </text>
      </g>

      {/* Why? explanation — diagonal splits into two triangles */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 2.5s' }}>
        {/* Mini quadrilateral showing diagonal */}
        <g transform="translate(600, 140)">
          <polygon points="-35,-30 35,-20 40,30 -30,25"
            fill="none" stroke={COLORS.text} strokeWidth={1.5} opacity={0.6} />
          <line x1={-35} y1={-30} x2={40} y2={30} stroke={COLORS.sparkle} strokeWidth={1.5} strokeDasharray="4,3" />
          <text x={-10} y={-35} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
            180°
          </text>
          <text x={10} y={40} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
            180°
          </text>
        </g>
        <text x={600} y={195} textAnchor="middle" fill={COLORS.textDim} fontSize={11} fontFamily="sans-serif">
          A diagonal makes
        </text>
        <text x={600} y={210} textAnchor="middle" fill={COLORS.textDim} fontSize={11} fontFamily="sans-serif">
          two triangles!
        </text>
        <text x={600} y={232} textAnchor="middle" fill={COLORS.sparkle} fontSize={13} fontWeight={600} fontFamily="sans-serif">
          180° + 180°
        </text>
        <text x={600} y={250} textAnchor="middle" fill={COLORS.sparkle} fontSize={14} fontWeight={700} fontFamily="sans-serif">
          = 360°
        </text>
      </g>

      {/* Big reveal formula */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 2.8s' }}>
        <rect x={165} y={380} width={370} height={52} rx={12} fill={COLORS.paper} stroke={COLORS.accent} strokeWidth={2} />
        <text x={350} y={413} textAnchor="middle" fill={COLORS.text} fontSize={21} fontWeight={700} fontFamily="sans-serif">
          <tspan fill={COLORS.angleA}>A</tspan>
          <tspan fill={COLORS.textDim}> + </tspan>
          <tspan fill={COLORS.angleB}>B</tspan>
          <tspan fill={COLORS.textDim}> + </tspan>
          <tspan fill={COLORS.angleC}>C</tspan>
          <tspan fill={COLORS.textDim}> + </tspan>
          <tspan fill={COLORS.angleD}>D</tspan>
          <tspan fill={COLORS.textDim}> = </tspan>
          <tspan fill={COLORS.sparkle} fontSize={24}>360°</tspan>
        </text>
      </g>

      {/* Sparkles */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 3.2s' }}>
        <Sparkle cx={100} cy={90} size={8} delay={0} />
        <Sparkle cx={700} cy={80} size={7} delay={0.3} />
        <Sparkle cx={80} cy={380} size={6} delay={0.6} />
        <Sparkle cx={720} cy={350} size={9} delay={0.2} />
        <Sparkle cx={250} cy={60} size={5} delay={0.9} />
        <Sparkle cx={580} cy={400} size={7} delay={0.5} />
        <Sparkle cx={740} cy={200} size={6} delay={0.7} />
        <Sparkle cx={60} cy={240} size={5} delay={1.1} />
        <Sparkle cx={450} cy={55} size={6} delay={0.4} />
        <Sparkle cx={680} cy={430} size={7} delay={0.8} />
      </g>

      {/* Bottom text */}
      <text x={400} y={455} textAnchor="middle" fill={COLORS.rectangle} fontSize={14} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 3.5s' }}>
        This is true for EVERY quadrilateral — trapezium, parallelogram, rhombus, rectangle, square!
      </text>
    </g>
  );
}


// ========================================
// Main Component
// ========================================
export default function M1QuadrilateralsCanvas({ currentStep = 1 }) {
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
        {/* Definitions: gradients and patterns */}
        <defs>
          {/* Paper texture pattern */}
          <pattern id="qPaperTexture" patternUnits="userSpaceOnUse" width={6} height={6}>
            <rect width={6} height={6} fill={COLORS.paper} />
            <circle cx={1} cy={1} r={0.4} fill="#ffffff" opacity={0.03} />
            <circle cx={4} cy={4} r={0.3} fill="#ffffff" opacity={0.02} />
          </pattern>

          {/* Subtle grid pattern */}
          <pattern id="qGridPattern" patternUnits="userSpaceOnUse" width={40} height={40}>
            <line x1={0} y1={40} x2={40} y2={40} stroke="#ffffff" strokeWidth={0.3} opacity={0.04} />
            <line x1={40} y1={0} x2={40} y2={40} stroke="#ffffff" strokeWidth={0.3} opacity={0.04} />
          </pattern>

          {/* Shape gradients */}
          <linearGradient id="gradTrapezium" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.trapezium} stopOpacity={0.35} />
            <stop offset="100%" stopColor={COLORS.trapeziumDark} stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="gradParallelogram" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.parallelogram} stopOpacity={0.35} />
            <stop offset="100%" stopColor={COLORS.parallelogramDark} stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="gradRhombus" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.rhombus} stopOpacity={0.35} />
            <stop offset="100%" stopColor={COLORS.rhombusDark} stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="gradRectangle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.rectangle} stopOpacity={0.35} />
            <stop offset="100%" stopColor={COLORS.rectangleDark} stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="gradSquare" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.square} stopOpacity={0.35} />
            <stop offset="100%" stopColor={COLORS.squareDark} stopOpacity={0.2} />
          </linearGradient>

          {/* Glow filter */}
          <filter id="qGlow">
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
          fill="url(#qPaperTexture)"
          stroke={COLORS.paperBorder}
          strokeWidth={1.5}
        />
        <rect x={20} y={20} width={760} height={440} rx={16} ry={16}
          fill="url(#qGridPattern)"
        />

        {/* Step indicator dots */}
        <g transform="translate(400, 468)">
          {[1, 2, 3, 4].map((s) => (
            <circle
              key={s}
              cx={(s - 2.5) * 24}
              cy={0}
              r={activeStep === s ? 5 : 3.5}
              fill={activeStep === s ? COLORS.accent : COLORS.textDim}
              opacity={activeStep === s ? 1 : 0.4}
              style={{ transition: 'all 0.5s ease' }}
            />
          ))}
        </g>

        {/* Render the active step */}
        <Step1Types visible={step === 1} />
        <Step2Measuring visible={step === 2} />
        <Step3Cutting visible={step === 3} />
        <Step4Proof visible={step === 4} />
      </svg>
    </div>
  );
}
