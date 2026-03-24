import { useState, useEffect } from 'react';

/**
 * M1SolidsCanvas — Interactive SVG canvas for M1 Solids: 3D Shapes, Nets, Surface Areas & Volumes
 *
 * ABL Experiment: Students classify 3D solids (prisms vs pyramids, polyhedrons vs non-polyhedrons),
 * construct shapes from nets and verify Euler's formula (F + V = E + 2), unfold cubes to derive
 * surface area, and pour sand from cones into cylinders to discover volume relationships.
 *
 * Steps:
 *   1. 3D Shape Classification — prisms vs pyramids, polyhedrons vs non-polyhedrons
 *   2. Nets and Euler's Formula — fold nets into solids, verify F + V = E + 2
 *   3. Surface Area — unfolding a cube into 6 squares, cylinder into rectangle + circles
 *   4. Volume — unit cubes, cone = 1/3 cylinder sand pour experiment
 */

// --- Color palette ---
const COLORS = {
  bg: '#0a0a0a',
  paper: '#1a1a2e',
  paperBorder: '#2a2a4e',
  orange: '#E65100',
  orangeLight: '#FF8A50',
  orangeDim: '#BF360C',
  blue: '#3b82f6',
  blueDark: '#1d4ed8',
  green: '#10b981',
  greenDark: '#047857',
  purple: '#8b5cf6',
  purpleDark: '#6d28d9',
  cyan: '#06b6d4',
  cyanDark: '#0891b2',
  yellow: '#eab308',
  red: '#ef4444',
  pink: '#ec4899',
  line: '#94a3b8',
  text: '#e2e8f0',
  textDim: '#64748b',
  sparkle: '#fbbf24',
  accent: '#E65100',
  sand: '#D4A574',
  sandDark: '#B8956A',
};

// --- Sparkle/star helper ---
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

// --- Isometric cube ---
function IsoCube({ x, y, size = 40, color = COLORS.blue, opacity = 1, label }) {
  const s = size;
  const dx = s * 0.866; // cos(30)
  const dy = s * 0.5;   // sin(30)
  // Top face
  const top = `${x},${y - s} ${x + dx},${y - s + dy} ${x},${y} ${x - dx},${y - s + dy}`;
  // Left face
  const left = `${x - dx},${y - s + dy} ${x},${y} ${x},${y + s} ${x - dx},${y + dy}`;
  // Right face
  const right = `${x},${y} ${x + dx},${y - s + dy} ${x + dx},${y + dy} ${x},${y + s}`;

  return (
    <g opacity={opacity}>
      <polygon points={top} fill={color} opacity={0.5} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <polygon points={left} fill={color} opacity={0.3} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <polygon points={right} fill={color} opacity={0.2} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      {label && (
        <text x={x} y={y + s + 18} textAnchor="middle" fill={color} fontSize={12} fontWeight={600} fontFamily="sans-serif">
          {label}
        </text>
      )}
    </g>
  );
}

// --- Isometric cuboid ---
function IsoCuboid({ x, y, w = 50, h = 30, d = 35, color = COLORS.green, opacity = 1 }) {
  const dx = d * 0.866;
  const ddy = d * 0.5;
  const wx = w * 0.866;
  const wy = w * 0.5;
  // Top face
  const top = `${x},${y - h} ${x + wx},${y - h + wy} ${x + wx - dx},${y - h + wy + ddy} ${x - dx},${y - h + ddy}`;
  // Left face
  const left = `${x - dx},${y - h + ddy} ${x + wx - dx},${y - h + wy + ddy} ${x + wx - dx},${y + wy + ddy} ${x - dx},${y + ddy}`;
  // Right face (front)
  const right = `${x},${y - h} ${x + wx},${y - h + wy} ${x + wx},${y + wy} ${x},${y}`;

  return (
    <g opacity={opacity}>
      <polygon points={top} fill={color} opacity={0.45} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <polygon points={left} fill={color} opacity={0.2} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <polygon points={right} fill={color} opacity={0.3} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </g>
  );
}

// --- Cylinder ---
function IsoCylinder({ x, y, r = 22, h = 55, color = COLORS.cyan, opacity = 1, fill: fillOverride }) {
  const fillColor = fillOverride || color;
  return (
    <g opacity={opacity}>
      {/* Body */}
      <rect x={x - r} y={y - h} width={r * 2} height={h} fill={fillColor} opacity={0.25} />
      <line x1={x - r} y1={y - h} x2={x - r} y2={y} stroke={color} strokeWidth={1.5} />
      <line x1={x + r} y1={y - h} x2={x + r} y2={y} stroke={color} strokeWidth={1.5} />
      {/* Bottom ellipse */}
      <ellipse cx={x} cy={y} rx={r} ry={r * 0.35} fill={fillColor} opacity={0.3} stroke={color} strokeWidth={1.5} />
      {/* Top ellipse */}
      <ellipse cx={x} cy={y - h} rx={r} ry={r * 0.35} fill={fillColor} opacity={0.45} stroke={color} strokeWidth={1.5} />
    </g>
  );
}

// --- Cone ---
function IsoCone({ x, y, r = 22, h = 55, color = COLORS.orange, opacity = 1 }) {
  return (
    <g opacity={opacity}>
      {/* Cone body (triangle) */}
      <polygon
        points={`${x},${y - h} ${x - r},${y} ${x + r},${y}`}
        fill={color} opacity={0.25} stroke={color} strokeWidth={1.5} strokeLinejoin="round"
      />
      {/* Base ellipse */}
      <ellipse cx={x} cy={y} rx={r} ry={r * 0.35} fill={color} opacity={0.3} stroke={color} strokeWidth={1.5} />
    </g>
  );
}

// --- Sphere ---
function IsoSphere({ x, y, r = 25, color = COLORS.pink, opacity = 1 }) {
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={y} r={r} fill={color} opacity={0.2} stroke={color} strokeWidth={1.5} />
      {/* Highlight arc */}
      <ellipse cx={x} cy={y} rx={r * 0.9} ry={r * 0.35} fill="none" stroke={color} strokeWidth={0.8} opacity={0.4} strokeDasharray="3,3" />
      {/* Shine */}
      <ellipse cx={x - r * 0.3} cy={y - r * 0.3} rx={r * 0.15} ry={r * 0.25} fill="white" opacity={0.15} transform={`rotate(-30 ${x - r * 0.3} ${y - r * 0.3})`} />
    </g>
  );
}

// --- Tetrahedron (triangular pyramid) ---
function IsoTetrahedron({ x, y, size = 40, color = COLORS.purple, opacity = 1 }) {
  const s = size;
  return (
    <g opacity={opacity}>
      {/* Front face */}
      <polygon
        points={`${x},${y - s * 1.1} ${x - s * 0.65},${y + s * 0.3} ${x + s * 0.2},${y + s * 0.5}`}
        fill={color} opacity={0.3} stroke={color} strokeWidth={1.5} strokeLinejoin="round"
      />
      {/* Right face */}
      <polygon
        points={`${x},${y - s * 1.1} ${x + s * 0.2},${y + s * 0.5} ${x + s * 0.6},${y + s * 0.1}`}
        fill={color} opacity={0.2} stroke={color} strokeWidth={1.5} strokeLinejoin="round"
      />
      {/* Bottom face edge */}
      <polygon
        points={`${x - s * 0.65},${y + s * 0.3} ${x + s * 0.2},${y + s * 0.5} ${x + s * 0.6},${y + s * 0.1}`}
        fill={color} opacity={0.15} stroke={color} strokeWidth={1} strokeLinejoin="round" strokeDasharray="3,3"
      />
    </g>
  );
}

// --- Triangular Prism ---
function IsoTriPrism({ x, y, size = 35, color = COLORS.green, opacity = 1 }) {
  const s = size;
  return (
    <g opacity={opacity}>
      {/* Front triangular face */}
      <polygon
        points={`${x},${y - s} ${x - s * 0.6},${y + s * 0.3} ${x + s * 0.6},${y + s * 0.3}`}
        fill={color} opacity={0.35} stroke={color} strokeWidth={1.5} strokeLinejoin="round"
      />
      {/* Top rectangle */}
      <polygon
        points={`${x},${y - s} ${x + s * 0.6},${y + s * 0.3} ${x + s * 1.1},${y} ${x + s * 0.5},${y - s + s * 0.2}`}
        fill={color} opacity={0.2} stroke={color} strokeWidth={1.5} strokeLinejoin="round"
      />
      {/* Right rectangle */}
      <polygon
        points={`${x + s * 0.6},${y + s * 0.3} ${x + s * 1.1},${y} ${x + s * 1.1},${y + s * 0.3 - s * 0.3} ${x + s * 0.6},${y + s * 0.3}`}
        fill={color} opacity={0.15} stroke={color} strokeWidth={1} strokeLinejoin="round"
      />
    </g>
  );
}

// --- Square Pyramid ---
function IsoSquarePyramid({ x, y, size = 35, color = COLORS.yellow, opacity = 1 }) {
  const s = size;
  const apex = { x: x, y: y - s * 1.2 };
  const bl = { x: x - s * 0.6, y: y + s * 0.1 };
  const br = { x: x + s * 0.6, y: y + s * 0.1 };
  const fr = { x: x + s * 0.3, y: y + s * 0.5 };
  const fl = { x: x - s * 0.3, y: y + s * 0.5 };
  return (
    <g opacity={opacity}>
      {/* Front face */}
      <polygon points={`${apex.x},${apex.y} ${fl.x},${fl.y} ${fr.x},${fr.y}`}
        fill={color} opacity={0.3} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      {/* Left face */}
      <polygon points={`${apex.x},${apex.y} ${bl.x},${bl.y} ${fl.x},${fl.y}`}
        fill={color} opacity={0.2} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      {/* Right face */}
      <polygon points={`${apex.x},${apex.y} ${fr.x},${fr.y} ${br.x},${br.y}`}
        fill={color} opacity={0.15} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      {/* Base (partial, dashed) */}
      <polygon points={`${bl.x},${bl.y} ${br.x},${br.y} ${fr.x},${fr.y} ${fl.x},${fl.y}`}
        fill={color} opacity={0.1} stroke={color} strokeWidth={1} strokeLinejoin="round" strokeDasharray="3,3" />
    </g>
  );
}

// ============================================================
// Step 1: 3D Shape Classification
// ============================================================
function Step1Classification({ visible }) {
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
        2D vs 3D — Classifying Solids
      </text>
      <text x={400} y={72} textAnchor="middle" fill={COLORS.textDim} fontSize={12} fontFamily="sans-serif">
        3D shapes have length, breadth, AND height
      </text>

      {/* Dividing line */}
      <line x1={400} y1={88} x2={400} y2={430} stroke={COLORS.textDim} strokeWidth={1} strokeDasharray="4,4" opacity={0.3} />

      {/* Left section: Polyhedrons */}
      <text x={200} y={102} textAnchor="middle" fill={COLORS.blue} fontSize={14} fontWeight={600} fontFamily="sans-serif">
        Polyhedrons
      </text>
      <text x={200} y={118} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
        Flat faces only
      </text>

      {/* Cube */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.3s' }}>
        <IsoCube x={100} y={190} size={32} color={COLORS.blue} />
        <text x={100} y={232} textAnchor="middle" fill={COLORS.blue} fontSize={11} fontWeight={600} fontFamily="sans-serif">Cube</text>
      </g>

      {/* Cuboid */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.5s' }}>
        <IsoCuboid x={230} y={200} w={35} h={25} d={25} color={COLORS.green} />
        <text x={240} y={232} textAnchor="middle" fill={COLORS.green} fontSize={11} fontWeight={600} fontFamily="sans-serif">Cuboid</text>
      </g>

      {/* Triangular Prism */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.7s' }}>
        <IsoTriPrism x={90} y={300} size={28} color={COLORS.green} />
        <text x={105} y={340} textAnchor="middle" fill={COLORS.green} fontSize={11} fontWeight={600} fontFamily="sans-serif">Tri. Prism</text>
      </g>

      {/* Tetrahedron */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.9s' }}>
        <IsoTetrahedron x={225} y={300} size={28} color={COLORS.purple} />
        <text x={225} y={340} textAnchor="middle" fill={COLORS.purple} fontSize={11} fontWeight={600} fontFamily="sans-serif">Tetrahedron</text>
      </g>

      {/* Square Pyramid */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.1s' }}>
        <IsoSquarePyramid x={330} y={300} size={28} color={COLORS.yellow} />
        <text x={330} y={340} textAnchor="middle" fill={COLORS.yellow} fontSize={11} fontWeight={600} fontFamily="sans-serif">Sq. Pyramid</text>
      </g>

      {/* Prisms vs Pyramids labels */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 1.3s' }}>
        <text x={140} y={260} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
          PRISMS — same cross-section
        </text>
        <text x={280} y={360} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
          PYRAMIDS — meet at a point
        </text>
      </g>

      {/* Right section: Non-Polyhedrons */}
      <text x={600} y={102} textAnchor="middle" fill={COLORS.cyan} fontSize={14} fontWeight={600} fontFamily="sans-serif">
        Non-Polyhedrons
      </text>
      <text x={600} y={118} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
        Curved surfaces
      </text>

      {/* Cylinder */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.4s' }}>
        <IsoCylinder x={490} y={210} r={20} h={48} color={COLORS.cyan} />
        <text x={490} y={232} textAnchor="middle" fill={COLORS.cyan} fontSize={11} fontWeight={600} fontFamily="sans-serif">Cylinder</text>
      </g>

      {/* Cone */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.6s' }}>
        <IsoCone x={600} y={210} r={20} h={48} color={COLORS.orange} />
        <text x={600} y={232} textAnchor="middle" fill={COLORS.orange} fontSize={11} fontWeight={600} fontFamily="sans-serif">Cone</text>
      </g>

      {/* Sphere */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.8s' }}>
        <IsoSphere x={710} y={190} r={22} color={COLORS.pink} />
        <text x={710} y={232} textAnchor="middle" fill={COLORS.pink} fontSize={11} fontWeight={600} fontFamily="sans-serif">Sphere</text>
      </g>

      {/* Faces / Edges / Vertices highlight on the cube */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 1.5s' }}>
        <rect x={430} y={270} width={340} height={72} rx={10} fill={COLORS.paper} stroke={COLORS.textDim} strokeWidth={1} opacity={0.8} />
        <text x={600} y={292} textAnchor="middle" fill={COLORS.text} fontSize={12} fontWeight={600} fontFamily="sans-serif">
          Key Terms for Polyhedrons:
        </text>
        <text x={600} y={312} textAnchor="middle" fill={COLORS.textDim} fontSize={11} fontFamily="sans-serif">
          <tspan fill={COLORS.blue}>Faces</tspan> (flat surfaces) &bull; <tspan fill={COLORS.green}>Edges</tspan> (where faces meet)
        </text>
        <text x={600} y={330} textAnchor="middle" fill={COLORS.textDim} fontSize={11} fontFamily="sans-serif">
          <tspan fill={COLORS.purple}>Vertices</tspan> (corner points)
        </text>
      </g>

      {/* Bottom question */}
      <text x={400} y={420} textAnchor="middle" fill={COLORS.accent} fontSize={13} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 1.8s' }}>
        Can you sort these shapes into prisms, pyramids, and curved solids?
      </text>
    </g>
  );
}

// ============================================================
// Step 2: Nets and Euler's Formula
// ============================================================
function Step2NetsEuler({ visible }) {
  // Euler's formula table data
  const eulerData = [
    { shape: 'Cube', f: 6, v: 8, e: 12, color: COLORS.blue },
    { shape: 'Cuboid', f: 6, v: 8, e: 12, color: COLORS.green },
    { shape: 'Tri. Prism', f: 5, v: 6, e: 9, color: COLORS.green },
    { shape: 'Sq. Pyramid', f: 5, v: 5, e: 8, color: COLORS.yellow },
    { shape: 'Tetrahedron', f: 4, v: 4, e: 6, color: COLORS.purple },
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
        Nets Fold into Solids — Euler&apos;s Formula
      </text>
      <text x={400} y={72} textAnchor="middle" fill={COLORS.textDim} fontSize={12} fontFamily="sans-serif">
        A net is a flat pattern that folds into a 3D shape
      </text>

      {/* Cube net (cross shape) - left side */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.3s' }}>
        <text x={170} y={100} textAnchor="middle" fill={COLORS.blue} fontSize={13} fontWeight={600} fontFamily="sans-serif">
          Cube Net
        </text>
        {/* Cross-shaped net of 6 squares */}
        {/* Top */}
        <rect x={145} y={110} width={50} height={50} fill={COLORS.blue} opacity={0.2} stroke={COLORS.blue} strokeWidth={1.5} strokeDasharray="4,2" rx={2} />
        {/* Middle row: left, center, right, far-right */}
        <rect x={95} y={160} width={50} height={50} fill={COLORS.blue} opacity={0.2} stroke={COLORS.blue} strokeWidth={1.5} strokeDasharray="4,2" rx={2} />
        <rect x={145} y={160} width={50} height={50} fill={COLORS.blue} opacity={0.3} stroke={COLORS.blue} strokeWidth={1.5} rx={2} />
        <rect x={195} y={160} width={50} height={50} fill={COLORS.blue} opacity={0.2} stroke={COLORS.blue} strokeWidth={1.5} strokeDasharray="4,2" rx={2} />
        <rect x={245} y={160} width={50} height={50} fill={COLORS.blue} opacity={0.2} stroke={COLORS.blue} strokeWidth={1.5} strokeDasharray="4,2" rx={2} />
        {/* Bottom */}
        <rect x={145} y={210} width={50} height={50} fill={COLORS.blue} opacity={0.2} stroke={COLORS.blue} strokeWidth={1.5} strokeDasharray="4,2" rx={2} />

        {/* Fold arrows */}
        <text x={170} y={275} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
          fold along dotted lines
        </text>
      </g>

      {/* Arrow from net to cube */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.8s' }}>
        <line x1={310} y1={190} x2={350} y2={190} stroke={COLORS.accent} strokeWidth={2} markerEnd="url(#arrowOrange)" />
        <text x={330} y={180} textAnchor="middle" fill={COLORS.accent} fontSize={10} fontWeight={600} fontFamily="sans-serif">
          fold
        </text>
      </g>

      {/* Resulting cube */}
      <g style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 1s ease 1s, transform 1s ease 1s',
        transform: visible ? 'scale(1)' : 'scale(0.5)',
        transformOrigin: '390px 190px',
      }}>
        <IsoCube x={390} y={185} size={35} color={COLORS.blue} />
        <text x={390} y={233} textAnchor="middle" fill={COLORS.blue} fontSize={12} fontWeight={600} fontFamily="sans-serif">
          6 faces!
        </text>
      </g>

      {/* Euler's Formula prominent display */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 1.2s' }}>
        <rect x={480} y={100} width={290} height={44} rx={10} fill={COLORS.paper} stroke={COLORS.accent} strokeWidth={2} />
        <text x={625} y={128} textAnchor="middle" fill={COLORS.text} fontSize={20} fontWeight={700} fontFamily="sans-serif">
          <tspan fill={COLORS.blue}>F</tspan>
          <tspan fill={COLORS.textDim}> + </tspan>
          <tspan fill={COLORS.purple}>V</tspan>
          <tspan fill={COLORS.textDim}> = </tspan>
          <tspan fill={COLORS.green}>E</tspan>
          <tspan fill={COLORS.textDim}> + </tspan>
          <tspan fill={COLORS.sparkle} fontSize={22}>2</tspan>
        </text>
      </g>

      {/* Euler's formula verification table */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 1.5s' }}>
        {/* Table header */}
        <text x={480} y={172} fill={COLORS.textDim} fontSize={10} fontWeight={600} fontFamily="sans-serif">Shape</text>
        <text x={580} y={172} textAnchor="middle" fill={COLORS.blue} fontSize={10} fontWeight={600} fontFamily="sans-serif">F</text>
        <text x={620} y={172} textAnchor="middle" fill={COLORS.purple} fontSize={10} fontWeight={600} fontFamily="sans-serif">V</text>
        <text x={660} y={172} textAnchor="middle" fill={COLORS.green} fontSize={10} fontWeight={600} fontFamily="sans-serif">E</text>
        <text x={720} y={172} textAnchor="middle" fill={COLORS.sparkle} fontSize={10} fontWeight={600} fontFamily="sans-serif">F+V=E+2?</text>
        <line x1={470} y1={178} x2={770} y2={178} stroke={COLORS.textDim} strokeWidth={0.5} opacity={0.4} />

        {/* Table rows */}
        {eulerData.map((row, i) => (
          <g key={row.shape} style={{ opacity: visible ? 1 : 0, transition: `opacity 0.8s ease ${1.8 + i * 0.3}s` }}>
            <text x={480} y={198 + i * 22} fill={row.color} fontSize={11} fontFamily="sans-serif">{row.shape}</text>
            <text x={580} y={198 + i * 22} textAnchor="middle" fill={COLORS.text} fontSize={11} fontFamily="sans-serif">{row.f}</text>
            <text x={620} y={198 + i * 22} textAnchor="middle" fill={COLORS.text} fontSize={11} fontFamily="sans-serif">{row.v}</text>
            <text x={660} y={198 + i * 22} textAnchor="middle" fill={COLORS.text} fontSize={11} fontFamily="sans-serif">{row.e}</text>
            <text x={720} y={198 + i * 22} textAnchor="middle" fill={COLORS.sparkle} fontSize={11} fontWeight={600} fontFamily="sans-serif">
              {row.f}+{row.v}={row.e}+2 ✓
            </text>
          </g>
        ))}
      </g>

      {/* Bottom note */}
      <text x={400} y={420} textAnchor="middle" fill={COLORS.accent} fontSize={13} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 3s' }}>
        Euler&apos;s formula works for every polyhedron — but NOT for curved solids!
      </text>
    </g>
  );
}

// ============================================================
// Step 3: Surface Area — Unfolding Solids
// ============================================================
function Step3SurfaceArea({ visible }) {
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
        Unfolding Solids — Surface Area
      </text>
      <text x={400} y={72} textAnchor="middle" fill={COLORS.textDim} fontSize={12} fontFamily="sans-serif">
        Deconstruct each solid into flat 2D faces to find the total surface area
      </text>

      {/* --- Cube unfolding (left) --- */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.3s' }}>
        <text x={130} y={100} textAnchor="middle" fill={COLORS.blue} fontSize={13} fontWeight={600} fontFamily="sans-serif">Cube</text>

        {/* Mini cube */}
        <IsoCube x={75} y={150} size={22} color={COLORS.blue} />

        {/* Arrow */}
        <line x1={105} y1={150} x2={120} y2={150} stroke={COLORS.textDim} strokeWidth={1} markerEnd="url(#arrowGray)" />

        {/* Unfolded: cross of 6 small squares */}
        <g transform="translate(130, 115)">
          {/* 'a' labels */}
          <rect x={15} y={0} width={28} height={28} fill={COLORS.blue} opacity={0.15} stroke={COLORS.blue} strokeWidth={1} rx={1} />
          <rect x={-13} y={28} width={28} height={28} fill={COLORS.blue} opacity={0.2} stroke={COLORS.blue} strokeWidth={1} rx={1} />
          <rect x={15} y={28} width={28} height={28} fill={COLORS.blue} opacity={0.25} stroke={COLORS.blue} strokeWidth={1} rx={1} />
          <rect x={43} y={28} width={28} height={28} fill={COLORS.blue} opacity={0.2} stroke={COLORS.blue} strokeWidth={1} rx={1} />
          <rect x={71} y={28} width={28} height={28} fill={COLORS.blue} opacity={0.15} stroke={COLORS.blue} strokeWidth={1} rx={1} />
          <rect x={15} y={56} width={28} height={28} fill={COLORS.blue} opacity={0.15} stroke={COLORS.blue} strokeWidth={1} rx={1} />
          <text x={29} y={94} textAnchor="middle" fill={COLORS.blue} fontSize={9} fontFamily="sans-serif">a</text>
          <text x={-5} y={47} textAnchor="middle" fill={COLORS.blue} fontSize={9} fontFamily="sans-serif">a</text>
        </g>

        {/* Formula */}
        <text x={130} y={220} textAnchor="middle" fill={COLORS.blue} fontSize={12} fontWeight={700} fontFamily="sans-serif">
          SA = 6a²
        </text>
        <text x={130} y={236} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
          6 identical squares
        </text>
      </g>

      {/* --- Cylinder unfolding (center-left) --- */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.7s' }}>
        <text x={330} y={100} textAnchor="middle" fill={COLORS.cyan} fontSize={13} fontWeight={600} fontFamily="sans-serif">Cylinder</text>

        {/* Mini cylinder */}
        <IsoCylinder x={280} y={152} r={14} h={32} color={COLORS.cyan} />

        {/* Arrow */}
        <line x1={300} y1={145} x2={315} y2={145} stroke={COLORS.textDim} strokeWidth={1} markerEnd="url(#arrowGray)" />

        {/* Unrolled: rectangle + 2 circles */}
        <g transform="translate(325, 115)">
          {/* Rectangle (curved surface) */}
          <rect x={0} y={10} width={70} height={40} fill={COLORS.cyan} opacity={0.2} stroke={COLORS.cyan} strokeWidth={1.5} rx={2} />
          <text x={35} y={35} textAnchor="middle" fill={COLORS.cyan} fontSize={8} fontFamily="sans-serif">2πr × h</text>

          {/* Top circle */}
          <circle cx={-12} cy={30} r={14} fill={COLORS.cyan} opacity={0.15} stroke={COLORS.cyan} strokeWidth={1.5} />
          <text x={-12} y={33} textAnchor="middle" fill={COLORS.cyan} fontSize={7} fontFamily="sans-serif">πr²</text>

          {/* Bottom circle */}
          <circle cx={82} cy={30} r={14} fill={COLORS.cyan} opacity={0.15} stroke={COLORS.cyan} strokeWidth={1.5} />
          <text x={82} y={33} textAnchor="middle" fill={COLORS.cyan} fontSize={7} fontFamily="sans-serif">πr²</text>
        </g>

        {/* Formula */}
        <text x={330} y={220} textAnchor="middle" fill={COLORS.cyan} fontSize={12} fontWeight={700} fontFamily="sans-serif">
          TSA = 2πr(r+h)
        </text>
        <text x={330} y={236} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
          rectangle + 2 circles
        </text>
      </g>

      {/* --- Cone (center-right) --- */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.1s' }}>
        <text x={530} y={100} textAnchor="middle" fill={COLORS.orange} fontSize={13} fontWeight={600} fontFamily="sans-serif">Cone</text>

        {/* Mini cone */}
        <IsoCone x={490} y={155} r={14} h={35} color={COLORS.orange} />

        {/* Arrow */}
        <line x1={510} y1={145} x2={525} y2={145} stroke={COLORS.textDim} strokeWidth={1} markerEnd="url(#arrowGray)" />

        {/* Unfolded: sector + circle */}
        <g transform="translate(535, 115)">
          {/* Sector (curved surface) */}
          <path d="M 30,0 A 40,40 0 0 1 -10,35 L 15,20 Z" fill={COLORS.orange} opacity={0.2} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={15} y={15} fill={COLORS.orange} fontSize={8} fontFamily="sans-serif">πrl</text>

          {/* Base circle */}
          <circle cx={35} cy={40} r={12} fill={COLORS.orange} opacity={0.15} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={35} y={43} textAnchor="middle" fill={COLORS.orange} fontSize={7} fontFamily="sans-serif">πr²</text>
        </g>

        {/* Formula */}
        <text x={530} y={220} textAnchor="middle" fill={COLORS.orange} fontSize={12} fontWeight={700} fontFamily="sans-serif">
          TSA = πr(l+r)
        </text>
        <text x={530} y={236} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
          sector + circle
        </text>
      </g>

      {/* --- Sphere wrapped by cylinder (right) --- */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.5s' }}>
        <text x={700} y={100} textAnchor="middle" fill={COLORS.pink} fontSize={13} fontWeight={600} fontFamily="sans-serif">Sphere</text>

        {/* Sphere inside cylinder outline */}
        <IsoSphere x={700} y={155} r={22} color={COLORS.pink} />
        {/* Wrapping cylinder (ghost) */}
        <rect x={675} y={130} width={50} height={50} fill="none" stroke={COLORS.textDim} strokeWidth={1} strokeDasharray="3,3" rx={2} opacity={0.4} />
        <text x={700} y={195} textAnchor="middle" fill={COLORS.textDim} fontSize={8} fontFamily="sans-serif">
          wraps in cylinder
        </text>

        {/* Formula */}
        <text x={700} y={220} textAnchor="middle" fill={COLORS.pink} fontSize={12} fontWeight={700} fontFamily="sans-serif">
          SA = 4πr²
        </text>
        <text x={700} y={236} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
          = cylinder CSA
        </text>
      </g>

      {/* Summary box */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 2s' }}>
        <rect x={100} y={260} width={600} height={50} rx={12} fill={COLORS.paper} stroke={COLORS.accent} strokeWidth={1.5} />
        <text x={400} y={282} textAnchor="middle" fill={COLORS.text} fontSize={13} fontWeight={600} fontFamily="sans-serif">
          Every surface area formula comes from unfolding a solid into flat 2D shapes!
        </text>
        <text x={400} y={300} textAnchor="middle" fill={COLORS.textDim} fontSize={11} fontFamily="sans-serif">
          Deconstruct → measure flat pieces → add them up
        </text>
      </g>

      {/* Cuboid formula bonus */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 2.3s' }}>
        <rect x={200} y={330} width={400} height={40} rx={8} fill={COLORS.paper} stroke={COLORS.green} strokeWidth={1} opacity={0.8} />
        <text x={400} y={356} textAnchor="middle" fill={COLORS.green} fontSize={12} fontWeight={600} fontFamily="sans-serif">
          Cuboid: SA = 2(lh + bh + lb) — 6 rectangles in 3 pairs
        </text>
      </g>

      {/* Bottom */}
      <text x={400} y={420} textAnchor="middle" fill={COLORS.accent} fontSize={13} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 2.5s' }}>
        Can you unfold a cylinder and figure out its surface area?
      </text>
    </g>
  );
}

// ============================================================
// Step 4: Volume — Unit Cubes and Sand Pouring
// ============================================================
function Step4Volume({ visible }) {
  // Sand particle positions for the pour animation
  const sandParticles = [];
  for (let i = 0; i < 12; i++) {
    sandParticles.push({
      x: 395 + (Math.sin(i * 1.7) * 4),
      y: 155 + i * 6,
      r: 1.5 + (i % 3) * 0.3,
      delay: i * 0.08,
    });
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
      <text x={400} y={50} textAnchor="middle" fill={COLORS.text} fontSize={20} fontWeight={700} fontFamily="sans-serif">
        Discovering Volume — Unit Cubes &amp; Sand Pouring
      </text>
      <text x={400} y={72} textAnchor="middle" fill={COLORS.textDim} fontSize={12} fontFamily="sans-serif">
        Volume measures the space inside a solid, in cubic units
      </text>

      {/* --- Left: Unit cube building (3x3x3) --- */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.3s' }}>
        <text x={130} y={98} textAnchor="middle" fill={COLORS.blue} fontSize={13} fontWeight={600} fontFamily="sans-serif">
          Build from Unit Cubes
        </text>

        {/* 3x3x3 cube built from small unit cubes */}
        {[0, 1, 2].map(layer =>
          [0, 1, 2].map(row =>
            [0, 1, 2].map(col => {
              const ux = 130 + (col - row) * 16;
              const uy = 200 + (col + row) * 9 - layer * 18;
              const opc = 0.6 + (layer === 2 ? 0.2 : 0) + (row === 0 && col === 2 ? 0.15 : 0);
              return (
                <g key={`${layer}-${row}-${col}`}>
                  {/* Top face */}
                  <polygon
                    points={`${ux},${uy - 9} ${ux + 8},${uy - 4.5} ${ux},${uy} ${ux - 8},${uy - 4.5}`}
                    fill={COLORS.blue} opacity={opc * 0.6} stroke={COLORS.blue} strokeWidth={0.5}
                  />
                  {/* Left face */}
                  <polygon
                    points={`${ux - 8},${uy - 4.5} ${ux},${uy} ${ux},${uy + 9} ${ux - 8},${uy + 4.5}`}
                    fill={COLORS.blue} opacity={opc * 0.35} stroke={COLORS.blue} strokeWidth={0.5}
                  />
                  {/* Right face */}
                  <polygon
                    points={`${ux},${uy} ${ux + 8},${uy - 4.5} ${ux + 8},${uy + 4.5} ${ux},${uy + 9}`}
                    fill={COLORS.blue} opacity={opc * 0.25} stroke={COLORS.blue} strokeWidth={0.5}
                  />
                </g>
              );
            })
          )
        )}

        {/* Labels */}
        <text x={130} y={255} textAnchor="middle" fill={COLORS.text} fontSize={11} fontFamily="sans-serif">
          3 × 3 × 3 = <tspan fontWeight={700} fill={COLORS.sparkle}>27</tspan> unit cubes
        </text>
        <text x={130} y={275} textAnchor="middle" fill={COLORS.blue} fontSize={14} fontWeight={700} fontFamily="sans-serif">
          V = a³
        </text>

        {/* Cuboid formula below */}
        <rect x={50} y={295} width={160} height={38} rx={8} fill={COLORS.paper} stroke={COLORS.green} strokeWidth={1} opacity={0.8} />
        <text x={130} y={312} textAnchor="middle" fill={COLORS.green} fontSize={11} fontWeight={600} fontFamily="sans-serif">
          Cuboid: V = l × b × h
        </text>
        <text x={130} y={326} textAnchor="middle" fill={COLORS.textDim} fontSize={9} fontFamily="sans-serif">
          base area × height
        </text>
      </g>

      {/* --- Center: Cone pouring into Cylinder --- */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.8s' }}>
        <text x={400} y={98} textAnchor="middle" fill={COLORS.orange} fontSize={13} fontWeight={600} fontFamily="sans-serif">
          Cone → Cylinder (Sand Pour)
        </text>

        {/* Upside-down cone pouring */}
        <g>
          {/* Cone (inverted, pouring) */}
          <polygon
            points="395,130 370,200 420,200"
            fill={COLORS.sand} opacity={0.3} stroke={COLORS.orange} strokeWidth={1.5} strokeLinejoin="round"
          />
          <ellipse cx={395} cy={200} rx={25} ry={8} fill={COLORS.sand} opacity={0.2} stroke={COLORS.orange} strokeWidth={1} />

          {/* Sand stream */}
          {visible && sandParticles.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={COLORS.sand}
              style={{ animation: `sandFall 1.2s ease-in ${p.delay}s infinite`, opacity: 0.7 }} />
          ))}
        </g>

        {/* Cylinder below (filling with sand) */}
        <g>
          <rect x={370} y={230} width={50} height={70} fill={COLORS.cyan} opacity={0.1} stroke={COLORS.cyan} strokeWidth={1.5} />
          <ellipse cx={395} cy={230} rx={25} ry={8} fill={COLORS.cyan} opacity={0.2} stroke={COLORS.cyan} strokeWidth={1.5} />
          <ellipse cx={395} cy={300} rx={25} ry={8} fill={COLORS.cyan} opacity={0.3} stroke={COLORS.cyan} strokeWidth={1.5} />

          {/* Sand level in cylinder (1/3 full) */}
          <rect x={370} y={277} width={50} height={23} fill={COLORS.sand} opacity={0.4} />
          <ellipse cx={395} cy={277} rx={25} ry={8} fill={COLORS.sand} opacity={0.5} />
        </g>

        {/* "×3" labels */}
        <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 1.5s' }}>
          <rect x={440} y={198} width={58} height={28} rx={6} fill={COLORS.paper} stroke={COLORS.sparkle} strokeWidth={1.5} />
          <text x={469} y={217} textAnchor="middle" fill={COLORS.sparkle} fontSize={14} fontWeight={700} fontFamily="sans-serif">
            × 3 !
          </text>
          <text x={395} y={325} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
            3 cone-fulls = 1 cylinder
          </text>
        </g>

        {/* Formula */}
        <rect x={320} y={340} width={150} height={36} rx={8} fill={COLORS.paper} stroke={COLORS.orange} strokeWidth={1.5} />
        <text x={395} y={364} textAnchor="middle" fill={COLORS.orange} fontSize={14} fontWeight={700} fontFamily="sans-serif">
          V = ⅓πr²h
        </text>
      </g>

      {/* --- Right: Sphere volume --- */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.2s' }}>
        <text x={660} y={98} textAnchor="middle" fill={COLORS.pink} fontSize={13} fontWeight={600} fontFamily="sans-serif">
          Sphere Volume
        </text>

        {/* Sphere */}
        <IsoSphere x={620} y={180} r={30} color={COLORS.pink} />

        {/* Arrow to cylinders */}
        <line x1={655} y1={180} x2={675} y2={180} stroke={COLORS.textDim} strokeWidth={1} markerEnd="url(#arrowGray)" />

        {/* Two small cylinders */}
        <IsoCylinder x={700} y={195} r={14} h={35} color={COLORS.cyan} />
        <IsoCylinder x={740} y={195} r={14} h={35} color={COLORS.cyan} />

        {/* "×3 pours" */}
        <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 2s' }}>
          <text x={660} y={235} textAnchor="middle" fill={COLORS.textDim} fontSize={9} fontFamily="sans-serif">
            3 sphere-fulls fill
          </text>
          <text x={660} y={247} textAnchor="middle" fill={COLORS.textDim} fontSize={9} fontFamily="sans-serif">
            2 cylinders
          </text>
        </g>

        {/* Formula */}
        <rect x={595} y={265} width={140} height={36} rx={8} fill={COLORS.paper} stroke={COLORS.pink} strokeWidth={1.5} />
        <text x={665} y={289} textAnchor="middle" fill={COLORS.pink} fontSize={14} fontWeight={700} fontFamily="sans-serif">
          V = ⁴⁄₃πr³
        </text>

        {/* Cylinder formula */}
        <rect x={595} y={310} width={140} height={30} rx={6} fill={COLORS.paper} stroke={COLORS.cyan} strokeWidth={1} opacity={0.8} />
        <text x={665} y={330} textAnchor="middle" fill={COLORS.cyan} fontSize={12} fontWeight={600} fontFamily="sans-serif">
          Cylinder: V = πr²h
        </text>
      </g>

      {/* Summary sparkle box */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 2.5s' }}>
        <rect x={130} y={385} width={540} height={44} rx={10} fill={COLORS.paper} stroke={COLORS.accent} strokeWidth={2} />
        <text x={400} y={406} textAnchor="middle" fill={COLORS.text} fontSize={13} fontWeight={600} fontFamily="sans-serif">
          All volumes connect: <tspan fill={COLORS.orange}>Cone = ⅓ Cylinder</tspan> &bull; <tspan fill={COLORS.pink}>Sphere = ⁴⁄₃ πr³</tspan>
        </text>
        <text x={400} y={422} textAnchor="middle" fill={COLORS.textDim} fontSize={11} fontFamily="sans-serif">
          Base area × height is the key idea — proven by pouring sand!
        </text>
      </g>

      {/* Sparkles */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 3s' }}>
        <Sparkle cx={80} cy={130} size={7} delay={0} />
        <Sparkle cx={250} cy={95} size={6} delay={0.3} />
        <Sparkle cx={720} cy={120} size={8} delay={0.5} />
        <Sparkle cx={550} cy={380} size={6} delay={0.7} />
      </g>
    </g>
  );
}

// ========================================
// Main Component
// ========================================
export default function M1SolidsCanvas({ currentStep = 1 }) {
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
        @keyframes sandFall {
          0% { opacity: 0; transform: translateY(-8px); }
          30% { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(20px); }
        }
        @keyframes netFold {
          0% { transform: perspective(200px) rotateX(0deg); }
          100% { transform: perspective(200px) rotateX(-80deg); }
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
          <pattern id="solidsPaperTexture" patternUnits="userSpaceOnUse" width={6} height={6}>
            <rect width={6} height={6} fill={COLORS.paper} />
            <circle cx={1} cy={1} r={0.4} fill="#ffffff" opacity={0.03} />
            <circle cx={4} cy={4} r={0.3} fill="#ffffff" opacity={0.02} />
          </pattern>

          {/* Grid pattern */}
          <pattern id="solidsGridPattern" patternUnits="userSpaceOnUse" width={40} height={40}>
            <line x1={0} y1={40} x2={40} y2={40} stroke="#ffffff" strokeWidth={0.3} opacity={0.04} />
            <line x1={40} y1={0} x2={40} y2={40} stroke="#ffffff" strokeWidth={0.3} opacity={0.04} />
          </pattern>

          {/* Arrow markers */}
          <marker id="arrowOrange" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.accent} />
          </marker>
          <marker id="arrowGray" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={5} markerHeight={5} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.textDim} />
          </marker>

          {/* Glow filter */}
          <filter id="solidGlow">
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
          fill="url(#solidsPaperTexture)"
          stroke={COLORS.paperBorder}
          strokeWidth={1.5}
        />
        <rect x={20} y={20} width={760} height={440} rx={16} ry={16}
          fill="url(#solidsGridPattern)"
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
        <Step1Classification visible={step === 1} />
        <Step2NetsEuler visible={step === 2} />
        <Step3SurfaceArea visible={step === 3} />
        <Step4Volume visible={step === 4} />
      </svg>
    </div>
  );
}
