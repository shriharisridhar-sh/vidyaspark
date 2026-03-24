import { useState, useEffect } from 'react';

/**
 * M1AreasPerimetersCanvas — Interactive SVG canvas for M1 Areas & Perimeters
 *
 * ABL Experiment: Students discover area by counting unit squares, derive formulas
 * on geoboards, rearrange cardboard shapes, and transform a circle into a rectangle.
 *
 * Steps:
 *   1. Counting Unit Squares — graph paper with highlighted unit squares in a rectangle
 *   2. Geoboard Discoveries — rectangle, square, right triangle with formulas
 *   3. Rearranging into Rectangles — parallelogram/triangle/trapezium transformations
 *   4. Circle Becomes a Rectangle — 16 sectors rearranged into approximate rectangle
 */

// --- Color palette ---
const COLORS = {
  bg: '#0a0a0a',
  paper: '#1a1a2e',
  paperBorder: '#2a2a4e',
  grid: '#3a3a5e',
  gridLight: '#2a2a4e',
  orange: '#E65100',
  orangeLight: '#FF8A65',
  orangeDim: '#BF360C',
  blue: '#3b82f6',
  blueDark: '#1d4ed8',
  green: '#10b981',
  greenDark: '#047857',
  purple: '#8b5cf6',
  purpleDark: '#6d28d9',
  red: '#ef4444',
  redDark: '#b91c1c',
  yellow: '#eab308',
  teal: '#14b8a6',
  tealDark: '#0d9488',
  pink: '#ec4899',
  pinkDark: '#be185d',
  line: '#94a3b8',
  text: '#e2e8f0',
  textDim: '#64748b',
  sparkle: '#fbbf24',
  accent: '#E65100',
  squareFill: '#E65100',
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

// --- Animated counter ---
function AnimatedCounter({ target, visible, x, y, color = COLORS.sparkle, fontSize = 28, delay = 0.5 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) { setCount(0); return; }
    const startTime = Date.now() + delay * 1000;
    const duration = 1500;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 0) return;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(progress * target));
      if (progress >= 1) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [visible, target, delay]);

  return (
    <text x={x} y={y} textAnchor="middle" fill={color} fontSize={fontSize} fontWeight={700} fontFamily="sans-serif"
      style={{ opacity: visible ? 1 : 0, transition: `opacity 0.5s ease ${delay}s` }}>
      {count} sq units
    </text>
  );
}

// --- Step 1: Counting Unit Squares ---
function Step1CountingSquares({ visible }) {
  const gridX = 200;
  const gridY = 105;
  const cellSize = 40;
  const cols = 5;
  const rows = 3;

  // Generate highlighted squares with staggered animation
  const squares = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      squares.push(
        <rect
          key={`sq-${r}-${c}`}
          x={gridX + c * cellSize + 1}
          y={gridY + r * cellSize + 1}
          width={cellSize - 2}
          height={cellSize - 2}
          rx={3}
          fill={COLORS.squareFill}
          opacity={visible ? 0.35 : 0}
          style={{ transition: `opacity 0.3s ease ${0.8 + idx * 0.08}s` }}
        />
      );
      // Square number label
      squares.push(
        <text
          key={`num-${r}-${c}`}
          x={gridX + c * cellSize + cellSize / 2}
          y={gridY + r * cellSize + cellSize / 2 + 5}
          textAnchor="middle"
          fill={COLORS.orangeLight}
          fontSize={12}
          fontWeight={600}
          fontFamily="sans-serif"
          opacity={visible ? 0.8 : 0}
          style={{ transition: `opacity 0.3s ease ${0.8 + idx * 0.08}s` }}
        >
          {idx + 1}
        </text>
      );
    }
  }

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
        Counting Unit Squares
      </text>
      <text x={400} y={78} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif">
        Area = the number of unit squares that fit inside a shape
      </text>

      {/* Graph paper grid - larger area */}
      <g>
        {/* Background grid lines */}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`gv-${i}`} x1={gridX + i * cellSize} y1={gridY - cellSize} x2={gridX + i * cellSize} y2={gridY + (rows + 1) * cellSize}
            stroke={COLORS.gridLight} strokeWidth={0.5} opacity={0.5} />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`gh-${i}`} x1={gridX - cellSize} y1={gridY + i * cellSize} x2={gridX + (cols + 1) * cellSize} y2={gridY + i * cellSize}
            stroke={COLORS.gridLight} strokeWidth={0.5} opacity={0.5} />
        ))}

        {/* Highlighted squares */}
        {squares}

        {/* Rectangle outline */}
        <rect
          x={gridX}
          y={gridY}
          width={cols * cellSize}
          height={rows * cellSize}
          fill="none"
          stroke={COLORS.orange}
          strokeWidth={3}
          rx={2}
        />
      </g>

      {/* Dimension labels */}
      <text x={gridX + (cols * cellSize) / 2} y={gridY - 12} textAnchor="middle" fill={COLORS.blue} fontSize={14} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.5s' }}>
        5 units (length)
      </text>
      <text x={gridX - 16} y={gridY + (rows * cellSize) / 2 + 5} textAnchor="middle" fill={COLORS.green} fontSize={14} fontWeight={600} fontFamily="sans-serif"
        transform={`rotate(-90, ${gridX - 16}, ${gridY + (rows * cellSize) / 2 + 5})`}
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 0.5s' }}>
        3 units (breadth)
      </text>

      {/* Counter */}
      <AnimatedCounter target={15} visible={visible} x={400} y={320} delay={2} />

      {/* Formula box */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 3s' }}>
        <rect x={250} y={345} width={300} height={50} rx={12} fill={COLORS.paper} stroke={COLORS.accent} strokeWidth={2} />
        <text x={400} y={377} textAnchor="middle" fill={COLORS.text} fontSize={18} fontWeight={700} fontFamily="sans-serif">
          <tspan fill={COLORS.blue}>5</tspan>
          <tspan fill={COLORS.textDim}> x </tspan>
          <tspan fill={COLORS.green}>3</tspan>
          <tspan fill={COLORS.textDim}> = </tspan>
          <tspan fill={COLORS.sparkle}>15 sq units</tspan>
        </text>
      </g>

      {/* Bottom insight */}
      <text x={400} y={430} textAnchor="middle" fill={COLORS.accent} fontSize={14} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 3.5s' }}>
        Area of Rectangle = Length x Breadth
      </text>
    </g>
  );
}

// --- Step 2: Geoboard Discoveries ---
function Step2Geoboard({ visible }) {
  // Geoboard dot grid helper
  const GeoboardDots = ({ ox, oy, gridCols, gridRows, spacing }) => {
    const dots = [];
    for (let r = 0; r <= gridRows; r++) {
      for (let c = 0; c <= gridCols; c++) {
        dots.push(
          <circle key={`dot-${r}-${c}`} cx={ox + c * spacing} cy={oy + r * spacing} r={2.5}
            fill={COLORS.line} opacity={0.5} />
        );
      }
    }
    return <g>{dots}</g>;
  };

  const spacing = 28;

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
        Geoboard Discoveries
      </text>
      <text x={400} y={78} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif">
        Form shapes with rubber bands and count the unit squares
      </text>

      {/* Rectangle - left */}
      <g transform="translate(80, 110)">
        <rect x={0} y={0} width={140} height={120} rx={8} fill={COLORS.paper} stroke={COLORS.paperBorder} strokeWidth={1} />
        <GeoboardDots ox={14} oy={10} gridCols={4} gridRows={3} spacing={spacing} />
        {/* Rubber band rectangle: 4x3 */}
        <rect x={14} y={10} width={4 * spacing} height={3 * spacing} fill={COLORS.blue} fillOpacity={0.2}
          stroke={COLORS.blue} strokeWidth={2.5} rx={2} />
        {/* Dimension labels */}
        <text x={14 + 2 * spacing} y={3 * spacing + 28} textAnchor="middle" fill={COLORS.blue} fontSize={10} fontWeight={600} fontFamily="sans-serif">
          L = 4
        </text>
        <text x={4 * spacing + 26} y={10 + 1.5 * spacing + 4} textAnchor="start" fill={COLORS.blue} fontSize={10} fontWeight={600} fontFamily="sans-serif">
          B = 3
        </text>
        {/* Formula */}
        <text x={70} y={115} textAnchor="middle" fill={COLORS.text} fontSize={12} fontWeight={600} fontFamily="sans-serif">
          Rectangle
        </text>
      </g>
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1s' }}>
        <rect x={90} y={240} width={120} height={32} rx={8} fill={COLORS.paper} stroke={COLORS.blue} strokeWidth={1.5} />
        <text x={150} y={261} textAnchor="middle" fill={COLORS.blue} fontSize={13} fontWeight={700} fontFamily="sans-serif">
          A = L x B
        </text>
      </g>

      {/* Square - center */}
      <g transform="translate(310, 110)">
        <rect x={0} y={0} width={140} height={120} rx={8} fill={COLORS.paper} stroke={COLORS.paperBorder} strokeWidth={1} />
        <GeoboardDots ox={26} oy={10} gridCols={3} gridRows={3} spacing={spacing} />
        {/* Rubber band square: 3x3 */}
        <rect x={26} y={10} width={3 * spacing} height={3 * spacing} fill={COLORS.green} fillOpacity={0.2}
          stroke={COLORS.green} strokeWidth={2.5} rx={2} />
        <text x={26 + 1.5 * spacing} y={3 * spacing + 28} textAnchor="middle" fill={COLORS.green} fontSize={10} fontWeight={600} fontFamily="sans-serif">
          S = 3
        </text>
        <text x={70} y={115} textAnchor="middle" fill={COLORS.text} fontSize={12} fontWeight={600} fontFamily="sans-serif">
          Square
        </text>
      </g>
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.3s' }}>
        <rect x={320} y={240} width={120} height={32} rx={8} fill={COLORS.paper} stroke={COLORS.green} strokeWidth={1.5} />
        <text x={380} y={261} textAnchor="middle" fill={COLORS.green} fontSize={13} fontWeight={700} fontFamily="sans-serif">
          A = S x S
        </text>
      </g>

      {/* Right Triangle - right */}
      <g transform="translate(540, 110)">
        <rect x={0} y={0} width={140} height={120} rx={8} fill={COLORS.paper} stroke={COLORS.paperBorder} strokeWidth={1} />
        <GeoboardDots ox={14} oy={10} gridCols={4} gridRows={3} spacing={spacing} />
        {/* Rubber band right triangle */}
        <polygon
          points={`14,${10 + 3 * spacing} ${14 + 4 * spacing},${10 + 3 * spacing} 14,10`}
          fill={COLORS.purple} fillOpacity={0.2}
          stroke={COLORS.purple} strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {/* Right angle marker */}
        <polyline
          points={`14,${10 + 3 * spacing - 10} ${24},${10 + 3 * spacing - 10} 24,${10 + 3 * spacing}`}
          fill="none" stroke={COLORS.purple} strokeWidth={1.5}
        />
        {/* Dimension labels */}
        <text x={14 + 2 * spacing} y={3 * spacing + 28} textAnchor="middle" fill={COLORS.purple} fontSize={10} fontWeight={600} fontFamily="sans-serif">
          b = 4
        </text>
        <text x={-2} y={10 + 1.5 * spacing + 4} textAnchor="end" fill={COLORS.purple} fontSize={10} fontWeight={600} fontFamily="sans-serif">
          h = 3
        </text>
        <text x={70} y={115} textAnchor="middle" fill={COLORS.text} fontSize={12} fontWeight={600} fontFamily="sans-serif">
          Right Triangle
        </text>
      </g>
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.6s' }}>
        <rect x={545} y={240} width={130} height={32} rx={8} fill={COLORS.paper} stroke={COLORS.purple} strokeWidth={1.5} />
        <text x={610} y={261} textAnchor="middle" fill={COLORS.purple} fontSize={13} fontWeight={700} fontFamily="sans-serif">
          A = &#189; x b x h
        </text>
      </g>

      {/* Key insight */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 2s' }}>
        <rect x={175} y={290} width={450} height={52} rx={12} fill={COLORS.paper} stroke={COLORS.accent} strokeWidth={2} />
        <text x={400} y={312} textAnchor="middle" fill={COLORS.text} fontSize={14} fontWeight={600} fontFamily="sans-serif">
          Every formula comes from counting unit squares!
        </text>
        <text x={400} y={332} textAnchor="middle" fill={COLORS.textDim} fontSize={12} fontFamily="sans-serif">
          Triangle = half of a rectangle with same base and height
        </text>
      </g>

      {/* Observation tables summary */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 2.5s' }}>
        <text x={150} y={380} textAnchor="middle" fill={COLORS.blue} fontSize={13} fontFamily="sans-serif">
          4 x 3 = <tspan fontWeight={700}>12</tspan>
        </text>
        <text x={400} y={380} textAnchor="middle" fill={COLORS.green} fontSize={13} fontFamily="sans-serif">
          3 x 3 = <tspan fontWeight={700}>9</tspan>
        </text>
        <text x={630} y={380} textAnchor="middle" fill={COLORS.purple} fontSize={13} fontFamily="sans-serif">
          &#189; x 4 x 3 = <tspan fontWeight={700}>6</tspan>
        </text>
      </g>

      {/* Bottom text */}
      <text x={400} y={430} textAnchor="middle" fill={COLORS.accent} fontSize={14} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 3s' }}>
        What happens with shapes that aren't rectangles or triangles?
      </text>
    </g>
  );
}

// --- Step 3: Cardboard Rearrangements ---
function Step3Rearranging({ visible }) {
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
        Rearranging into Rectangles
      </text>
      <text x={400} y={73} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif">
        Cut, slide, and rearrange — every shape becomes a rectangle
      </text>

      {/* === Parallelogram to Rectangle === */}
      <g transform="translate(65, 95)">
        <text x={100} y={10} textAnchor="middle" fill={COLORS.text} fontSize={13} fontWeight={600} fontFamily="sans-serif">
          Parallelogram
        </text>

        {/* Original parallelogram */}
        <polygon
          points="30,85 170,85 200,25 60,25"
          fill={COLORS.teal} fillOpacity={0.25}
          stroke={COLORS.teal} strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* Height line (dashed) */}
        <line x1={60} y1={25} x2={60} y2={85} stroke={COLORS.tealDark} strokeWidth={1.5} strokeDasharray="4,3" />
        <text x={50} y={58} textAnchor="end" fill={COLORS.tealDark} fontSize={10} fontFamily="sans-serif">h</text>

        {/* Cut triangle highlighted */}
        <polygon
          points="30,85 60,85 60,25"
          fill={COLORS.red} fillOpacity={0.3}
          stroke={COLORS.red} strokeWidth={1.5}
          strokeDasharray="5,3"
        />

        {/* Arrow showing slide */}
        <path d="M 45,90 C 80,105 140,105 185,90" fill="none" stroke={COLORS.orangeLight} strokeWidth={1.5} strokeDasharray="4,3"
          style={{ opacity: visible ? 0.8 : 0, transition: 'opacity 1.5s ease 1s' }} />
        <polygon points="185,90 178,97 180,85" fill={COLORS.orangeLight}
          style={{ opacity: visible ? 0.8 : 0, transition: 'opacity 1.5s ease 1s' }} />

        {/* Result: Rectangle */}
        <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.5s' }}>
          <rect x={30} y={120} width={170} height={60} fill={COLORS.teal} fillOpacity={0.2}
            stroke={COLORS.teal} strokeWidth={2} rx={2} />
          {/* The moved triangle piece */}
          <polygon
            points="170,180 200,180 200,120"
            fill={COLORS.red} fillOpacity={0.25}
            stroke={COLORS.red} strokeWidth={1.5}
            strokeDasharray="5,3"
          />
          <text x={115} y={197} textAnchor="middle" fill={COLORS.teal} fontSize={10} fontWeight={600} fontFamily="sans-serif">base</text>
          <text x={210} y={155} textAnchor="start" fill={COLORS.tealDark} fontSize={10} fontWeight={600} fontFamily="sans-serif">h</text>
        </g>

        {/* Formula */}
        <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 2s' }}>
          <text x={115} y={218} textAnchor="middle" fill={COLORS.teal} fontSize={12} fontWeight={700} fontFamily="sans-serif">
            A = base x height
          </text>
        </g>
      </g>

      {/* === Two Triangles to Parallelogram === */}
      <g transform="translate(295, 95)">
        <text x={100} y={10} textAnchor="middle" fill={COLORS.text} fontSize={13} fontWeight={600} fontFamily="sans-serif">
          Triangle
        </text>

        {/* First triangle */}
        <polygon
          points="30,85 170,85 100,25"
          fill={COLORS.pink} fillOpacity={0.25}
          stroke={COLORS.pink} strokeWidth={2}
          strokeLinejoin="round"
        />
        <text x={100} y={65} textAnchor="middle" fill={COLORS.pinkDark} fontSize={10} fontFamily="sans-serif">1</text>

        {/* Second triangle (rotated copy) */}
        <g style={{ opacity: visible ? 0.6 : 0, transition: 'opacity 1s ease 0.8s' }}>
          <polygon
            points="30,85 170,85 100,25"
            fill={COLORS.pink} fillOpacity={0.15}
            stroke={COLORS.pink} strokeWidth={1.5}
            strokeDasharray="5,3"
            transform="rotate(180, 100, 55)"
          />
          <text x={100} y={50} textAnchor="middle" fill={COLORS.pinkDark} fontSize={10} fontFamily="sans-serif" opacity={0.6}>2</text>
        </g>

        {/* Arrow */}
        <text x={100} y={105} textAnchor="middle" fill={COLORS.orangeLight} fontSize={14} fontFamily="sans-serif"
          style={{ opacity: visible ? 0.8 : 0, transition: 'opacity 1s ease 1.2s' }}>
          &#8595;
        </text>

        {/* Result: Parallelogram from two triangles */}
        <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.5s' }}>
          <polygon
            points="30,175 170,175 200,120 60,120"
            fill={COLORS.pink} fillOpacity={0.2}
            stroke={COLORS.pink} strokeWidth={2}
            strokeLinejoin="round"
          />
          {/* Diagonal line showing the two triangles */}
          <line x1={30} y1={175} x2={200} y2={120} stroke={COLORS.pink} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6} />
          <text x={80} y={157} textAnchor="middle" fill={COLORS.pinkDark} fontSize={9} fontFamily="sans-serif">1</text>
          <text x={145} y={140} textAnchor="middle" fill={COLORS.pinkDark} fontSize={9} fontFamily="sans-serif">2</text>
          <text x={115} y={193} textAnchor="middle" fill={COLORS.pink} fontSize={10} fontWeight={600} fontFamily="sans-serif">b</text>
          <text x={215} y={152} textAnchor="start" fill={COLORS.pinkDark} fontSize={10} fontWeight={600} fontFamily="sans-serif">h</text>
        </g>

        {/* Formula */}
        <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 2s' }}>
          <text x={115} y={218} textAnchor="middle" fill={COLORS.pink} fontSize={12} fontWeight={700} fontFamily="sans-serif">
            A = &#189; x b x h
          </text>
        </g>
      </g>

      {/* === Two Trapeziums to Parallelogram === */}
      <g transform="translate(530, 95)">
        <text x={100} y={10} textAnchor="middle" fill={COLORS.text} fontSize={13} fontWeight={600} fontFamily="sans-serif">
          Trapezium
        </text>

        {/* Original trapezium */}
        <polygon
          points="60,85 170,85 150,25 80,25"
          fill={COLORS.yellow} fillOpacity={0.25}
          stroke={COLORS.yellow} strokeWidth={2}
          strokeLinejoin="round"
        />
        <text x={115} y={95} textAnchor="middle" fill={COLORS.yellow} fontSize={9} fontFamily="sans-serif">b (bottom)</text>
        <text x={115} y={20} textAnchor="middle" fill={COLORS.yellow} fontSize={9} fontFamily="sans-serif">a (top)</text>

        {/* Arrow */}
        <text x={100} y={112} textAnchor="middle" fill={COLORS.orangeLight} fontSize={14} fontFamily="sans-serif"
          style={{ opacity: visible ? 0.8 : 0, transition: 'opacity 1s ease 1.2s' }}>
          &#8595;
        </text>

        {/* Result: Parallelogram from two trapeziums */}
        <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.5s' }}>
          <polygon
            points="20,175 200,175 180,120 40,120"
            fill={COLORS.yellow} fillOpacity={0.2}
            stroke={COLORS.yellow} strokeWidth={2}
            strokeLinejoin="round"
          />
          {/* Dividing line */}
          <line x1={110} y1={120} x2={110} y2={175} stroke={COLORS.yellow} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6} />
          <text x={65} y={153} textAnchor="middle" fill={COLORS.yellow} fontSize={9} fontFamily="sans-serif" opacity={0.7}>1</text>
          <text x={150} y={153} textAnchor="middle" fill={COLORS.yellow} fontSize={9} fontFamily="sans-serif" opacity={0.7}>2 (flipped)</text>
          <text x={110} y={193} textAnchor="middle" fill={COLORS.yellow} fontSize={10} fontWeight={600} fontFamily="sans-serif">a + b</text>
          <text x={207} y={152} textAnchor="start" fill={COLORS.yellow} fontSize={10} fontWeight={600} fontFamily="sans-serif">h</text>
        </g>

        {/* Formula */}
        <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 2s' }}>
          <text x={110} y={218} textAnchor="middle" fill={COLORS.yellow} fontSize={12} fontWeight={700} fontFamily="sans-serif">
            A = &#189;(a+b) x h
          </text>
        </g>
      </g>

      {/* Key insight box */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 2.5s' }}>
        <rect x={175} y={340} width={450} height={48} rx={12} fill={COLORS.paper} stroke={COLORS.accent} strokeWidth={2} />
        <text x={400} y={370} textAnchor="middle" fill={COLORS.text} fontSize={15} fontWeight={700} fontFamily="sans-serif">
          Every shape rearranges into a rectangle!
        </text>
      </g>

      {/* Bottom text */}
      <text x={400} y={430} textAnchor="middle" fill={COLORS.accent} fontSize={14} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 3s' }}>
        Can we do the same trick with a circle?
      </text>
    </g>
  );
}

// --- Step 4: Circle to Rectangle ---
function Step4CircleToRect({ visible }) {
  const cx = 200;
  const cy = 200;
  const r = 90;
  const numSectors = 16;
  const sectorAngle = (2 * Math.PI) / numSectors;

  // Generate circle sectors
  const circleSectors = [];
  const sectorColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];

  for (let i = 0; i < numSectors; i++) {
    const startAngle = i * sectorAngle - Math.PI / 2;
    const endAngle = startAngle + sectorAngle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const color = sectorColors[i % sectorColors.length];

    circleSectors.push(
      <path
        key={`sector-${i}`}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
        fill={color}
        fillOpacity={0.35}
        stroke={color}
        strokeWidth={1}
        opacity={visible ? 1 : 0}
        style={{ transition: `opacity 0.3s ease ${0.5 + i * 0.05}s` }}
      />
    );
  }

  // Generate rearranged sectors (alternating up/down to form ~rectangle)
  const rectX = 420;
  const rectY = 130;
  const sectorWidth = 20;
  const arrangeSectors = [];

  for (let i = 0; i < numSectors; i++) {
    const color = sectorColors[i % sectorColors.length];
    const isUp = i % 2 === 0;
    const sx = rectX + i * sectorWidth;

    // Approximate each sector as a triangle-ish shape
    if (isUp) {
      // Point up
      arrangeSectors.push(
        <path
          key={`arr-${i}`}
          d={`M ${sx} ${rectY + r} L ${sx + sectorWidth / 2} ${rectY} L ${sx + sectorWidth} ${rectY + r} Z`}
          fill={color}
          fillOpacity={0.4}
          stroke={color}
          strokeWidth={0.8}
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity 0.4s ease ${1.5 + i * 0.08}s`,
          }}
        />
      );
    } else {
      // Point down
      arrangeSectors.push(
        <path
          key={`arr-${i}`}
          d={`M ${sx} ${rectY} L ${sx + sectorWidth / 2} ${rectY + r} L ${sx + sectorWidth} ${rectY} Z`}
          fill={color}
          fillOpacity={0.4}
          stroke={color}
          strokeWidth={0.8}
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity 0.4s ease ${1.5 + i * 0.08}s`,
          }}
        />
      );
    }
  }

  const rectWidth = numSectors * sectorWidth;

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
        Circle Becomes a Rectangle
      </text>
      <text x={400} y={73} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif">
        Cut a circle into 16 sectors and rearrange them
      </text>

      {/* Circle with sectors */}
      <g>
        {circleSectors}
        {/* Circle outline */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.line} strokeWidth={1.5} opacity={0.5} />
        {/* Center dot */}
        <circle cx={cx} cy={cy} r={3} fill={COLORS.text} opacity={0.5} />
        {/* Radius label */}
        <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={COLORS.text} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6} />
        <text x={cx + r / 2} y={cy - 8} textAnchor="middle" fill={COLORS.text} fontSize={12} fontWeight={600} fontFamily="sans-serif">
          r
        </text>
        {/* Label */}
        <text x={cx} y={cy + r + 25} textAnchor="middle" fill={COLORS.textDim} fontSize={12} fontFamily="sans-serif">
          16 equal sectors
        </text>
      </g>

      {/* Arrow from circle to rearranged */}
      <g style={{ opacity: visible ? 0.7 : 0, transition: 'opacity 1s ease 1.2s' }}>
        <path d="M 310,200 C 340,180 370,175 400,185" fill="none" stroke={COLORS.orangeLight} strokeWidth={2} strokeDasharray="6,3" />
        <polygon points="400,185 393,178 396,190" fill={COLORS.orangeLight} />
        <text x={355} y={170} textAnchor="middle" fill={COLORS.orangeLight} fontSize={11} fontFamily="sans-serif">rearrange</text>
      </g>

      {/* Rearranged sectors forming approximate rectangle */}
      <g>
        {arrangeSectors}

        {/* Bounding rectangle outline */}
        <rect x={rectX} y={rectY} width={rectWidth} height={r}
          fill="none" stroke={COLORS.accent} strokeWidth={2} strokeDasharray="6,3"
          style={{ opacity: visible ? 0.6 : 0, transition: 'opacity 1s ease 3s' }} />
      </g>

      {/* Dimension labels for the rectangle */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 3s' }}>
        {/* Length = pi * r */}
        <line x1={rectX} y1={rectY + r + 12} x2={rectX + rectWidth} y2={rectY + r + 12}
          stroke={COLORS.blue} strokeWidth={1.5} />
        <polygon points={`${rectX},${rectY + r + 12} ${rectX + 6},${rectY + r + 8} ${rectX + 6},${rectY + r + 16}`} fill={COLORS.blue} />
        <polygon points={`${rectX + rectWidth},${rectY + r + 12} ${rectX + rectWidth - 6},${rectY + r + 8} ${rectX + rectWidth - 6},${rectY + r + 16}`} fill={COLORS.blue} />
        <text x={rectX + rectWidth / 2} y={rectY + r + 30} textAnchor="middle" fill={COLORS.blue} fontSize={12} fontWeight={600} fontFamily="sans-serif">
          length = &#960; x r
        </text>
        <text x={rectX + rectWidth / 2} y={rectY + r + 44} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="sans-serif">
          (half the circumference)
        </text>

        {/* Height = r */}
        <line x1={rectX + rectWidth + 12} y1={rectY} x2={rectX + rectWidth + 12} y2={rectY + r}
          stroke={COLORS.green} strokeWidth={1.5} />
        <polygon points={`${rectX + rectWidth + 12},${rectY} ${rectX + rectWidth + 8},${rectY + 6} ${rectX + rectWidth + 16},${rectY + 6}`} fill={COLORS.green} />
        <polygon points={`${rectX + rectWidth + 12},${rectY + r} ${rectX + rectWidth + 8},${rectY + r - 6} ${rectX + rectWidth + 16},${rectY + r - 6}`} fill={COLORS.green} />
        <text x={rectX + rectWidth + 30} y={rectY + r / 2 + 4} textAnchor="start" fill={COLORS.green} fontSize={12} fontWeight={600} fontFamily="sans-serif">
          r
        </text>
      </g>

      {/* Formula derivation */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 3.5s' }}>
        <rect x={200} y={345} width={400} height={55} rx={12} fill={COLORS.paper} stroke={COLORS.accent} strokeWidth={2} />
        <text x={400} y={367} textAnchor="middle" fill={COLORS.textDim} fontSize={13} fontFamily="sans-serif">
          Area = length x height =
        </text>
        <text x={400} y={390} textAnchor="middle" fill={COLORS.text} fontSize={20} fontWeight={700} fontFamily="sans-serif">
          <tspan fill={COLORS.blue}>&#960;r</tspan>
          <tspan fill={COLORS.textDim}> x </tspan>
          <tspan fill={COLORS.green}>r</tspan>
          <tspan fill={COLORS.textDim}> = </tspan>
          <tspan fill={COLORS.sparkle}>&#960;r&#178;</tspan>
        </text>
      </g>

      {/* Sparkles */}
      <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 4s' }}>
        <Sparkle cx={160} cy={350} size={7} delay={0} />
        <Sparkle cx={650} cy={120} size={6} delay={0.3} />
        <Sparkle cx={700} cy={340} size={8} delay={0.6} />
        <Sparkle cx={120} cy={120} size={5} delay={0.9} />
        <Sparkle cx={370} cy={100} size={6} delay={0.5} />
        <Sparkle cx={740} cy={250} size={7} delay={0.2} />
      </g>

      {/* Bottom text */}
      <text x={400} y={435} textAnchor="middle" fill={COLORS.accent} fontSize={14} fontWeight={600} fontFamily="sans-serif"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 2s ease 4.5s' }}>
        All area formulas trace back to rectangles and counting squares!
      </text>
    </g>
  );
}

// ========================================
// Main Component
// ========================================
export default function M1AreasPerimetersCanvas({ currentStep = 1 }) {
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
        @keyframes countPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
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
          <pattern id="areaPaperTexture" patternUnits="userSpaceOnUse" width={6} height={6}>
            <rect width={6} height={6} fill={COLORS.paper} />
            <circle cx={1} cy={1} r={0.4} fill="#ffffff" opacity={0.03} />
            <circle cx={4} cy={4} r={0.3} fill="#ffffff" opacity={0.02} />
          </pattern>

          {/* Subtle grid pattern */}
          <pattern id="areaGridPattern" patternUnits="userSpaceOnUse" width={40} height={40}>
            <line x1={0} y1={40} x2={40} y2={40} stroke="#ffffff" strokeWidth={0.3} opacity={0.04} />
            <line x1={40} y1={0} x2={40} y2={40} stroke="#ffffff" strokeWidth={0.3} opacity={0.04} />
          </pattern>

          {/* Glow filter */}
          <filter id="areaGlow">
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
          fill="url(#areaPaperTexture)"
          stroke={COLORS.paperBorder}
          strokeWidth={1.5}
        />
        <rect x={20} y={20} width={760} height={440} rx={16} ry={16}
          fill="url(#areaGridPattern)"
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
        <Step1CountingSquares visible={step === 1} />
        <Step2Geoboard visible={step === 2} />
        <Step3Rearranging visible={step === 3} />
        <Step4CircleToRect visible={step === 4} />
      </svg>
    </div>
  );
}
