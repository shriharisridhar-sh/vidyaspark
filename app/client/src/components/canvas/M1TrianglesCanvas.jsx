import { useState, useEffect } from 'react';

/**
 * M1TrianglesCanvas — Interactive SVG canvas for M1.1 Triangles: Angle Sum Property
 *
 * ABL Experiment: Students draw different triangles, cut out the three corners,
 * arrange them along a straight line, and discover that A + B + C = 180 degrees.
 *
 * Steps:
 *   1. Display 4 types of triangles (equilateral, isosceles, scalene, right-angled)
 *   2. Focus on scalene triangle — show scissors cutting corners A, B, C
 *   3. Arrange the cut corners along a straight baseline
 *   4. Reveal: all three corners form a straight angle = 180 degrees
 */

// --- Color palette ---
const COLORS = {
  bg: '#0a0a0a',
  paper: '#1a1a2e',
  paperBorder: '#2a2a4e',
  equilateral: '#3b82f6',
  equilateralDark: '#1d4ed8',
  isosceles: '#10b981',
  isoscelesDark: '#047857',
  scalene: '#8b5cf6',
  scaleneDark: '#6d28d9',
  rightAngle: '#f97316',
  rightAngleDark: '#c2410c',
  angleA: '#ef4444',
  angleB: '#3b82f6',
  angleC: '#eab308',
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

// --- Small right angle marker ---
function RightAngleMarker({ cx, cy, size = 12, rotation = 0, color = COLORS.rightAngle }) {
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
      strokeWidth={2}
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
      {/* Left blade */}
      <ellipse cx={-8} cy={14} rx={6} ry={8} fill="none" stroke="#94a3b8" strokeWidth={2} transform="rotate(-15, -8, 14)" />
      <line x1={-4} y1={8} x2={4} y2={-12} stroke="#cbd5e1" strokeWidth={2.5} strokeLinecap="round" />
      {/* Right blade */}
      <ellipse cx={8} cy={14} rx={6} ry={8} fill="none" stroke="#94a3b8" strokeWidth={2} transform="rotate(15, 8, 14)" />
      <line x1={4} y1={8} x2={-4} y2={-12} stroke="#cbd5e1" strokeWidth={2.5} strokeLinecap="round" />
      {/* Pivot */}
      <circle cx={0} cy={0} r={3} fill="#475569" stroke="#94a3b8" strokeWidth={1.5} />
    </g>
  );
}

// --- Step 1: Four Triangles ---
function Step1Triangles({ visible }) {
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
      <text x={400} y={55} textAnchor="middle" fill={COLORS.text} fontSize={20} fontWeight={700} fontFamily="sans-serif">
        Types of Triangles
      </text>
      <text x={400} y={78} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif">
        Every triangle has three angles and three sides
      </text>

      {/* Equilateral Triangle - top left */}
      <g transform="translate(140, 180)">
        <polygon
          points="0,-65 56,33 -56,33"
          fill="url(#gradEquilateral)"
          stroke={COLORS.equilateral}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <AngleArc cx={0} cy={-65} radius={18} startAngle={60} endAngle={120} color={COLORS.equilateral} />
        <AngleArc cx={-56} cy={33} radius={18} startAngle={-60} endAngle={0} color={COLORS.equilateral} />
        <AngleArc cx={56} cy={33} radius={18} startAngle={180} endAngle={240} color={COLORS.equilateral} />
        <text x={0} y={-78} textAnchor="middle" fill={COLORS.equilateral} fontSize={11} fontFamily="sans-serif">60°</text>
        <text x={0} y={65} textAnchor="middle" fill={COLORS.equilateral} fontSize={15} fontWeight={600} fontFamily="sans-serif">
          Equilateral
        </text>
        <text x={0} y={82} textAnchor="middle" fill={COLORS.textDim} fontSize={11} fontFamily="sans-serif">
          All sides equal
        </text>
      </g>

      {/* Isosceles Triangle - top right */}
      <g transform="translate(370, 180)">
        <polygon
          points="0,-70 50,35 -50,35"
          fill="url(#gradIsosceles)"
          stroke={COLORS.isosceles}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <AngleArc cx={0} cy={-70} radius={16} startAngle={60} endAngle={120} color={COLORS.isosceles} />
        <AngleArc cx={-50} cy={35} radius={16} startAngle={-55} endAngle={0} color={COLORS.isosceles} />
        <AngleArc cx={50} cy={35} radius={16} startAngle={180} endAngle={235} color={COLORS.isosceles} />
        <text x={0} y={65} textAnchor="middle" fill={COLORS.isosceles} fontSize={15} fontWeight={600} fontFamily="sans-serif">
          Isosceles
        </text>
        <text x={0} y={82} textAnchor="middle" fill={COLORS.textDim} fontSize={11} fontFamily="sans-serif">
          Two sides equal
        </text>
      </g>

      {/* Scalene Triangle - bottom left */}
      <g transform="translate(150, 350)">
        <polygon
          points="-20,-55 65,30 -60,30"
          fill="url(#gradScalene)"
          stroke={COLORS.scalene}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <AngleArc cx={-20} cy={-55} radius={16} startAngle={52} endAngle={108} color={COLORS.scalene} />
        <AngleArc cx={-60} cy={30} radius={16} startAngle={-65} endAngle={0} color={COLORS.scalene} />
        <AngleArc cx={65} cy={30} radius={16} startAngle={180} endAngle={220} color={COLORS.scalene} />
        <text x={0} y={62} textAnchor="middle" fill={COLORS.scalene} fontSize={15} fontWeight={600} fontFamily="sans-serif">
          Scalene
        </text>
        <text x={0} y={79} textAnchor="middle" fill={COLORS.textDim} fontSize={11} fontFamily="sans-serif">
          No sides equal
        </text>
      </g>

      {/* Right-angled Triangle - bottom right */}
      <g transform="translate(395, 345)">
        <polygon
          points="-55,35 -55,-50 55,35"
          fill="url(#gradRight)"
          stroke={COLORS.rightAngle}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <RightAngleMarker cx={-55} cy={35} size={14} rotation={0} color={COLORS.rightAngle} />
        <AngleArc cx={-55} cy={-50} radius={16} startAngle={50} endAngle={90} color={COLORS.rightAngle} />
        <AngleArc cx={55} cy={35} radius={16} startAngle={180} endAngle={218} color={COLORS.rightAngle} />
        <text x={-55} y={25} textAnchor="middle" fill={COLORS.rightAngle} fontSize={10} fontFamily="sans-serif">90°</text>
        <text x={0} y={67} textAnchor="middle" fill={COLORS.rightAngle} fontSize={15} fontWeight={600} fontFamily="sans-serif">
          Right-angled
        </text>
        <text x={0} y={84} textAnchor="middle" fill={COLORS.textDim} fontSize={11} fontFamily="sans-serif">
          One angle = 90°
        </text>
      </g>

      {/* Connecting thought */}
      <text x={400} y={445} textAnchor="middle" fill={COLORS.accent} fontSize={14} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 1.5s' }}>
        What do all these triangles have in common?
      </text>
    </g>
  );
}

// --- Step 2: Cutting Corners ---
function Step2Cutting({ visible }) {
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
      <text x={400} y={55} textAnchor="middle" fill={COLORS.text} fontSize={20} fontWeight={700} fontFamily="sans-serif">
        Cut the Three Corners
      </text>
      <text x={400} y={78} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif">
        Carefully cut out each angle of the triangle
      </text>

      {/* Main scalene triangle - larger, centered */}
      <g transform="translate(280, 260)">
        {/* Triangle body */}
        <polygon
          points="120,-120 240,80 0,80"
          fill="url(#gradScalene)"
          stroke={COLORS.scalene}
          strokeWidth={3}
          strokeLinejoin="round"
          opacity={0.6}
        />

        {/* Dotted cut lines around corner A (top) */}
        <line x1={85} y1={-80} x2={155} y2={-80} stroke={COLORS.angleA} strokeWidth={2} strokeDasharray="6,4" opacity={0.9} />
        <line x1={85} y1={-80} x2={120} y2={-120} stroke={COLORS.angleA} strokeWidth={2} strokeDasharray="6,4" opacity={0.9} />
        <line x1={155} y1={-80} x2={120} y2={-120} stroke={COLORS.angleA} strokeWidth={2} strokeDasharray="6,4" opacity={0.9} />

        {/* Corner A piece (top) */}
        <polygon
          points="120,-120 85,-80 155,-80"
          fill={COLORS.angleA}
          opacity={0.4}
          stroke={COLORS.angleA}
          strokeWidth={1.5}
        />
        <AngleArc cx={120} cy={-120} radius={20} startAngle={55} endAngle={125} color={COLORS.angleA} strokeWidth={3} />
        <text x={120} y={-128} textAnchor="middle" fill={COLORS.angleA} fontSize={16} fontWeight={700} fontFamily="sans-serif">A</text>

        {/* Dotted cut lines around corner B (bottom-left) */}
        <line x1={0} y1={80} x2={40} y2={40} stroke={COLORS.angleB} strokeWidth={2} strokeDasharray="6,4" opacity={0.9} />
        <line x1={0} y1={80} x2={50} y2={80} stroke={COLORS.angleB} strokeWidth={2} strokeDasharray="6,4" opacity={0.9} />

        {/* Corner B piece (bottom-left) */}
        <polygon
          points="0,80 40,40 50,80"
          fill={COLORS.angleB}
          opacity={0.4}
          stroke={COLORS.angleB}
          strokeWidth={1.5}
        />
        <AngleArc cx={0} cy={80} radius={20} startAngle={-64} endAngle={0} color={COLORS.angleB} strokeWidth={3} />
        <text x={-14} y={74} textAnchor="middle" fill={COLORS.angleB} fontSize={16} fontWeight={700} fontFamily="sans-serif">B</text>

        {/* Dotted cut lines around corner C (bottom-right) */}
        <line x1={240} y1={80} x2={200} y2={40} stroke={COLORS.angleC} strokeWidth={2} strokeDasharray="6,4" opacity={0.9} />
        <line x1={240} y1={80} x2={190} y2={80} stroke={COLORS.angleC} strokeWidth={2} strokeDasharray="6,4" opacity={0.9} />

        {/* Corner C piece (bottom-right) */}
        <polygon
          points="240,80 200,40 190,80"
          fill={COLORS.angleC}
          opacity={0.4}
          stroke={COLORS.angleC}
          strokeWidth={1.5}
        />
        <AngleArc cx={240} cy={80} radius={20} startAngle={180} endAngle={226} color={COLORS.angleC} strokeWidth={3} />
        <text x={258} y={74} textAnchor="middle" fill={COLORS.angleC} fontSize={16} fontWeight={700} fontFamily="sans-serif">C</text>
      </g>

      {/* Scissors icons near cut lines */}
      <ScissorsIcon x={340} y={135} size={32} opacity={visible ? 0.8 : 0} />
      <ScissorsIcon x={250} y={340} size={28} opacity={visible ? 0.6 : 0} />
      <ScissorsIcon x={555} y={340} size={28} opacity={visible ? 0.6 : 0} />

      {/* Legend */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 1s' }}>
        <rect x={580} y={160} width={14} height={14} rx={3} fill={COLORS.angleA} opacity={0.8} />
        <text x={600} y={172} fill={COLORS.text} fontSize={13} fontFamily="sans-serif">Angle A</text>
        <rect x={580} y={185} width={14} height={14} rx={3} fill={COLORS.angleB} opacity={0.8} />
        <text x={600} y={197} fill={COLORS.text} fontSize={13} fontFamily="sans-serif">Angle B</text>
        <rect x={580} y={210} width={14} height={14} rx={3} fill={COLORS.angleC} opacity={0.8} />
        <text x={600} y={222} fill={COLORS.text} fontSize={13} fontFamily="sans-serif">Angle C</text>
      </g>

      {/* Instruction */}
      <text x={400} y={430} textAnchor="middle" fill={COLORS.accent} fontSize={14} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 1.5s' }}>
        Cut along the dotted lines to separate each corner
      </text>
    </g>
  );
}

// --- Step 3: Arranging on Line ---
function Step3Arranging({ visible }) {
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
      <text x={400} y={55} textAnchor="middle" fill={COLORS.text} fontSize={20} fontWeight={700} fontFamily="sans-serif">
        Arrange the Corners on a Line
      </text>
      <text x={400} y={78} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif">
        Place each cut corner along a straight line, side by side
      </text>

      {/* Straight baseline */}
      <line x1={100} y1={300} x2={700} y2={300} stroke={COLORS.line} strokeWidth={3} strokeLinecap="round" />
      <text x={90} y={318} textAnchor="end" fill={COLORS.textDim} fontSize={11} fontFamily="sans-serif">line</text>

      {/* Corner B - placed on left, flush on baseline */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.5s', transform: visible ? 'translate(0,0)' : 'translate(-30px, -40px)' }}>
        <path
          d="M 290,300 L 290,240 L 340,300 Z"
          fill={COLORS.angleB}
          opacity={0.7}
          stroke={COLORS.angleB}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <AngleArc cx={290} cy={300} radius={22} startAngle={-90} endAngle={-50} color={COLORS.angleB} strokeWidth={3} />
        <text x={280} y={235} textAnchor="middle" fill={COLORS.angleB} fontSize={16} fontWeight={700} fontFamily="sans-serif">B</text>
      </g>

      {/* Corner A - placed in middle */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1s', transform: visible ? 'translate(0,0)' : 'translate(0, -50px)' }}>
        <path
          d="M 340,300 L 400,210 L 460,300 Z"
          fill={COLORS.angleA}
          opacity={0.7}
          stroke={COLORS.angleA}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <AngleArc cx={400} cy={210} radius={22} startAngle={55} endAngle={125} color={COLORS.angleA} strokeWidth={3} />
        <text x={400} y={200} textAnchor="middle" fill={COLORS.angleA} fontSize={16} fontWeight={700} fontFamily="sans-serif">A</text>
      </g>

      {/* Corner C - being moved (floating, not yet placed) */}
      <g style={{
        opacity: visible ? 0.85 : 0,
        transition: 'opacity 1s ease 1.5s, transform 2s ease 1.5s',
        transform: visible ? 'translate(0, 0)' : 'translate(40px, -60px)',
      }}>
        <path
          d="M 460,300 L 510,240 L 510,300 Z"
          fill={COLORS.angleC}
          opacity={0.55}
          stroke={COLORS.angleC}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeDasharray={visible ? '0' : '6,4'}
        />
        <AngleArc cx={510} cy={300} radius={22} startAngle={180} endAngle={230} color={COLORS.angleC} strokeWidth={3} />
        <text x={522} y={232} textAnchor="middle" fill={COLORS.angleC} fontSize={16} fontWeight={700} fontFamily="sans-serif">C</text>

        {/* Movement arrow */}
        <path d="M 545,235 C 555,225 560,250 548,265" fill="none" stroke={COLORS.angleC} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6} />
        <polygon points="548,265 542,255 553,258" fill={COLORS.angleC} opacity={0.6} />
      </g>

      {/* Hand/pointer hint near corner C */}
      <g style={{ opacity: visible ? 0.5 : 0, transition: 'opacity 2s ease 2s' }}>
        <text x={565} y={220} fill={COLORS.textDim} fontSize={22} fontFamily="sans-serif">
          &#9757;
        </text>
      </g>

      {/* Partial observation */}
      <text x={400} y={380} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 2s' }}>
        The corners are fitting together along the straight line...
      </text>
      <text x={400} y={430} textAnchor="middle" fill={COLORS.accent} fontSize={14} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 2.5s' }}>
        What shape are they forming?
      </text>
    </g>
  );
}

// --- Step 4: 180 Degree Proof ---
function Step4Proof({ visible }) {
  // Protractor tick marks
  const ticks = [];
  for (let deg = 0; deg <= 180; deg += 10) {
    const rad = (deg * Math.PI) / 180;
    const r1 = deg % 30 === 0 ? 132 : 138;
    const r2 = 145;
    const x1 = 400 + r1 * Math.cos(Math.PI - rad);
    const y1 = 280 - r1 * Math.sin(Math.PI - rad);
    const x2 = 400 + r2 * Math.cos(Math.PI - rad);
    const y2 = 280 - r2 * Math.sin(Math.PI - rad);
    ticks.push(
      <line key={`tick-${deg}`} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={COLORS.textDim} strokeWidth={deg % 30 === 0 ? 1.5 : 0.8} />
    );
    if (deg % 30 === 0) {
      const tx = 400 + 120 * Math.cos(Math.PI - rad);
      const ty = 280 - 120 * Math.sin(Math.PI - rad);
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
      <text x={400} y={50} textAnchor="middle" fill={COLORS.sparkle} fontSize={22} fontWeight={700} fontFamily="sans-serif">
        The Angle Sum Property!
      </text>

      {/* Protractor arc (semicircle) */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 0.5s' }}>
        {/* Outer arc */}
        <path
          d={`M ${400 - 148} 280 A 148 148 0 0 1 ${400 + 148} 280`}
          fill="none"
          stroke={COLORS.line}
          strokeWidth={2}
          opacity={0.5}
        />
        {/* Inner arc */}
        <path
          d={`M ${400 - 130} 280 A 130 130 0 0 1 ${400 + 130} 280`}
          fill="none"
          stroke={COLORS.line}
          strokeWidth={1}
          opacity={0.3}
        />
        {/* Baseline of protractor */}
        <line x1={240} y1={280} x2={560} y2={280} stroke={COLORS.line} strokeWidth={2.5} strokeLinecap="round" />
        {/* Center dot */}
        <circle cx={400} cy={280} r={4} fill={COLORS.line} opacity={0.7} />
        {/* Tick marks and labels */}
        {ticks}
      </g>

      {/* Three colored angle pieces filling the semicircle exactly */}
      {/* Angle B: 0° to ~64° (bottom-left) */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.8s' }}>
        <path
          d="M 400,280 L 542,280 A 142 142 0 0 0 462,148 Z"
          fill={COLORS.angleB}
          opacity={0.5}
          stroke={COLORS.angleB}
          strokeWidth={1.5}
        />
        <AngleArc cx={400} cy={280} radius={36} startAngle={-64} endAngle={0} color={COLORS.angleB} strokeWidth={3.5} />
        <text x={490} y={260} textAnchor="middle" fill={COLORS.angleB} fontSize={18} fontWeight={700} fontFamily="sans-serif">B</text>
        <text x={490} y={277} textAnchor="middle" fill={COLORS.angleB} fontSize={11} fontFamily="sans-serif">64°</text>
      </g>

      {/* Angle A: ~64° to ~134° (top-center) */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.2s' }}>
        <path
          d="M 400,280 L 462,148 A 142 142 0 0 0 318,155 Z"
          fill={COLORS.angleA}
          opacity={0.5}
          stroke={COLORS.angleA}
          strokeWidth={1.5}
        />
        <AngleArc cx={400} cy={280} radius={50} startAngle={-134} endAngle={-64} color={COLORS.angleA} strokeWidth={3.5} />
        <text x={393} y={185} textAnchor="middle" fill={COLORS.angleA} fontSize={18} fontWeight={700} fontFamily="sans-serif">A</text>
        <text x={393} y={202} textAnchor="middle" fill={COLORS.angleA} fontSize={11} fontFamily="sans-serif">70°</text>
      </g>

      {/* Angle C: ~134° to 180° (bottom-right on left side) */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.6s' }}>
        <path
          d="M 400,280 L 318,155 A 142 142 0 0 0 258,280 Z"
          fill={COLORS.angleC}
          opacity={0.5}
          stroke={COLORS.angleC}
          strokeWidth={1.5}
        />
        <AngleArc cx={400} cy={280} radius={64} startAngle={-180} endAngle={-134} color={COLORS.angleC} strokeWidth={3.5} />
        <text x={310} y={240} textAnchor="middle" fill={COLORS.angleC} fontSize={18} fontWeight={700} fontFamily="sans-serif">C</text>
        <text x={310} y={257} textAnchor="middle" fill={COLORS.angleC} fontSize={11} fontFamily="sans-serif">46°</text>
      </g>

      {/* 180 degree label on the straight line */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 2s' }}>
        <path
          d={`M ${400 - 80} 280 A 80 80 0 0 1 ${400 + 80} 280`}
          fill="none"
          stroke={COLORS.accent}
          strokeWidth={2.5}
          strokeDasharray="6,3"
          opacity={0.8}
        />
        <text x={400} y={310} textAnchor="middle" fill={COLORS.accent} fontSize={13} fontWeight={600} fontFamily="sans-serif">
          Straight angle = 180°
        </text>
      </g>

      {/* Big reveal formula */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 2.5s' }}>
        <rect x={245} y={355} width={310} height={52} rx={12} fill={COLORS.paper} stroke={COLORS.accent} strokeWidth={2} />
        <text x={400} y={388} textAnchor="middle" fill={COLORS.text} fontSize={22} fontWeight={700} fontFamily="sans-serif">
          <tspan fill={COLORS.angleA}>A</tspan>
          <tspan fill={COLORS.textDim}> + </tspan>
          <tspan fill={COLORS.angleB}>B</tspan>
          <tspan fill={COLORS.textDim}> + </tspan>
          <tspan fill={COLORS.angleC}>C</tspan>
          <tspan fill={COLORS.textDim}> = </tspan>
          <tspan fill={COLORS.sparkle} fontSize={24}>180°</tspan>
        </text>
      </g>

      {/* Sparkles */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 3s' }}>
        <Sparkle cx={200} cy={120} size={8} delay={0} />
        <Sparkle cx={600} cy={100} size={7} delay={0.3} />
        <Sparkle cx={150} cy={350} size={6} delay={0.6} />
        <Sparkle cx={650} cy={330} size={9} delay={0.2} />
        <Sparkle cx={300} cy={80} size={5} delay={0.9} />
        <Sparkle cx={520} cy={380} size={7} delay={0.5} />
        <Sparkle cx={680} cy={200} size={6} delay={0.7} />
        <Sparkle cx={130} cy={220} size={5} delay={1.1} />
      </g>

      {/* Bottom text */}
      <text x={400} y={440} textAnchor="middle" fill={COLORS.isosceles} fontSize={14} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 3.5s' }}>
        This is true for EVERY triangle — equilateral, isosceles, scalene, right-angled!
      </text>
    </g>
  );
}

// ========================================
// Main Component
// ========================================
export default function M1TrianglesCanvas({ currentStep = 1 }) {
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
          <pattern id="paperTexture" patternUnits="userSpaceOnUse" width={6} height={6}>
            <rect width={6} height={6} fill={COLORS.paper} />
            <circle cx={1} cy={1} r={0.4} fill="#ffffff" opacity={0.03} />
            <circle cx={4} cy={4} r={0.3} fill="#ffffff" opacity={0.02} />
          </pattern>

          {/* Subtle grid pattern */}
          <pattern id="gridPattern" patternUnits="userSpaceOnUse" width={40} height={40}>
            <line x1={0} y1={40} x2={40} y2={40} stroke="#ffffff" strokeWidth={0.3} opacity={0.04} />
            <line x1={40} y1={0} x2={40} y2={40} stroke="#ffffff" strokeWidth={0.3} opacity={0.04} />
          </pattern>

          {/* Triangle gradients */}
          <linearGradient id="gradEquilateral" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.equilateral} stopOpacity={0.35} />
            <stop offset="100%" stopColor={COLORS.equilateralDark} stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="gradIsosceles" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.isosceles} stopOpacity={0.35} />
            <stop offset="100%" stopColor={COLORS.isoscelesDark} stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="gradScalene" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.scalene} stopOpacity={0.35} />
            <stop offset="100%" stopColor={COLORS.scaleneDark} stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="gradRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.rightAngle} stopOpacity={0.35} />
            <stop offset="100%" stopColor={COLORS.rightAngleDark} stopOpacity={0.2} />
          </linearGradient>

          {/* Glow filter for the 180 reveal */}
          <filter id="glow">
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
          fill="url(#paperTexture)"
          stroke={COLORS.paperBorder}
          strokeWidth={1.5}
        />
        <rect x={20} y={20} width={760} height={440} rx={16} ry={16}
          fill="url(#gridPattern)"
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
        <Step1Triangles visible={step === 1} />
        <Step2Cutting visible={step === 2} />
        <Step3Arranging visible={step === 3} />
        <Step4Proof visible={step === 4} />
      </svg>
    </div>
  );
}