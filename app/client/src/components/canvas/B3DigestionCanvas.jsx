import React, { useMemo } from 'react';

/**
 * B3 Food & Digestion — "Learning About the Food We Eat"
 *
 * Interactive SVG canvas showing the journey from listing foods
 * to understanding nutrient groups and balanced diet.
 *
 * Step 1: Food Chart Setup — list foods into mystery columns
 * Step 2: Find the Nutrients Game — sort food cards into nutrient boxes
 * Step 3: Five Nutrient Groups Revealed — color-coded nutrient chart
 * Step 4: Balanced Diet Thali — proportioned plate with health message
 */

const TRANSITION = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
const FADE_TRANSITION = 'opacity 1.5s ease 0.3s';
const DELAYED_FADE = 'opacity 1.5s ease 0.8s';

const FONT = "'Inter', system-ui, sans-serif";

// Nutrient color palette
const NUTRIENTS = {
  protein:  { color: '#EF5350', light: '#FFCDD2', dark: '#C62828', label: 'Proteins' },
  carb:     { color: '#FFB74D', light: '#FFE0B2', dark: '#E65100', label: 'Carbohydrates' },
  fat:      { color: '#FFF176', light: '#FFF9C4', dark: '#F9A825', label: 'Fats' },
  vitamin:  { color: '#66BB6A', light: '#C8E6C9', dark: '#2E7D32', label: 'Vitamins' },
  mineral:  { color: '#42A5F5', light: '#BBDEFB', dark: '#1565C0', label: 'Minerals' },
};

// Food items used across steps
const FOODS = [
  { name: 'Rice',      emoji: '\u{1F35A}', nutrient: 'carb',    x: 0, y: 0 },
  { name: 'Dal',       emoji: '\u{1F372}', nutrient: 'protein', x: 1, y: 0 },
  { name: 'Ghee',      emoji: '\u{1F9C8}', nutrient: 'fat',     x: 2, y: 0 },
  { name: 'Carrots',   emoji: '\u{1F955}', nutrient: 'vitamin', x: 3, y: 0 },
  { name: 'Milk',      emoji: '\u{1F95B}', nutrient: 'mineral', x: 4, y: 0 },
  { name: 'Eggs',      emoji: '\u{1F95A}', nutrient: 'protein', x: 0, y: 1 },
  { name: 'Potato',    emoji: '\u{1F954}', nutrient: 'carb',    x: 1, y: 1 },
  { name: 'Groundnut', emoji: '\u{1F95C}', nutrient: 'fat',     x: 2, y: 1 },
  { name: 'Spinach',   emoji: '\u{1F96C}', nutrient: 'vitamin', x: 3, y: 1 },
  { name: 'Banana',    emoji: '\u{1F34C}', nutrient: 'mineral', x: 4, y: 1 },
];

export default function B3DigestionCanvas({ currentStep = 1 }) {
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
          <radialGradient id={`bg-${uid}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#0d1a14" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>

          {/* Nutrient group gradients */}
          {Object.entries(NUTRIENTS).map(([key, n]) => (
            <linearGradient key={key} id={`${key}-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={n.color} />
              <stop offset="100%" stopColor={n.dark} />
            </linearGradient>
          ))}

          {/* Thali plate gradient */}
          <radialGradient id={`thali-${uid}`} cx="45%" cy="40%">
            <stop offset="0%" stopColor="#D7CCC8" />
            <stop offset="70%" stopColor="#A1887F" />
            <stop offset="100%" stopColor="#795548" />
          </radialGradient>

          {/* Chart paper gradient */}
          <linearGradient id={`chart-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
          </linearGradient>

          {/* Card gradient */}
          <linearGradient id={`card-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
          </linearGradient>

          {/* Glow filters */}
          <filter id={`shadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
          </filter>
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

          {/* Sparkle */}
          <radialGradient id={`sparkle-${uid}`}>
            <stop offset="0%" stopColor="#69F0AE" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#69F0AE" stopOpacity="0" />
          </radialGradient>

          {/* Celebration glow */}
          <radialGradient id={`celebGlow-${uid}`}>
            <stop offset="0%" stopColor="#00E676" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00E676" stopOpacity="0" />
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
          {step === 1 && 'STEP 1 \u2014 WHAT DID YOU EAT THIS WEEK?'}
          {step === 2 && 'STEP 2 \u2014 FIND THE NUTRIENTS GAME'}
          {step === 3 && 'STEP 3 \u2014 FIVE NUTRIENT GROUPS REVEALED'}
          {step === 4 && 'STEP 4 \u2014 BALANCED DIET THALI'}
        </text>

        {/* ================= STEP 1: FOOD CHART SETUP ================= */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 1 ? 1 : 0,
            transform: step === 1 ? 'translateY(0)' : 'translateY(-30px)',
          }}
        >
          {/* Chart paper background */}
          <rect x="90" y="55" width="620" height="340" rx="8"
            fill={`url(#chart-${uid})`} stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"
            filter={`url(#shadow-${uid})`} />

          {/* Chart title */}
          <text x="400" y="82" textAnchor="middle" fill="#FFD54F" fontSize="14"
            fontFamily={FONT} fontWeight="700" letterSpacing="1">
            WHAT FOODS DID YOU EAT?
          </text>

          {/* 5 mystery columns with ? headers */}
          {['?', '?', '?', '?', '?'].map((label, i) => {
            const colX = 115 + i * 122;
            const colColors = [
              NUTRIENTS.protein.color,
              NUTRIENTS.carb.color,
              NUTRIENTS.fat.color,
              NUTRIENTS.vitamin.color,
              NUTRIENTS.mineral.color,
            ];
            return (
              <g key={`col-${i}`}>
                {/* Column divider */}
                {i > 0 && (
                  <line x1={colX - 10} y1="92" x2={colX - 10} y2="380"
                    stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
                )}
                {/* Mystery header */}
                <circle cx={colX + 50} cy="110" r="16" fill="rgba(255,255,255,0.05)"
                  stroke={colColors[i]} strokeWidth="1.5" opacity="0.7">
                  <animate attributeName="opacity" values="0.5;0.8;0.5"
                    dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                </circle>
                <text x={colX + 50} y="116" textAnchor="middle" fill={colColors[i]}
                  fontSize="18" fontFamily={FONT} fontWeight="700">
                  {label}
                </text>

                {/* Two food items per column */}
                {FOODS.filter(f => {
                  const colMap = ['protein', 'carb', 'fat', 'vitamin', 'mineral'];
                  return f.nutrient === colMap[i];
                }).map((food, fi) => (
                  <g key={`food-${i}-${fi}`}>
                    <rect x={colX + 8} y={145 + fi * 95} width={84} height={80} rx="8"
                      fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1">
                      <animate attributeName="opacity" values="0.8;1;0.8"
                        dur={`${2.5 + fi * 0.5}s`} repeatCount="indefinite" />
                    </rect>
                    <text x={colX + 50} y={182 + fi * 95} textAnchor="middle" fontSize="28">
                      {food.emoji}
                    </text>
                    <text x={colX + 50} y={210 + fi * 95} textAnchor="middle"
                      fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily={FONT} fontWeight="500">
                      {food.name}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}

          {/* Bottom question box */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 1 ? 1 : 0 }}>
            <rect x="150" y="410" width="500" height="55" rx="12" fill="rgba(0,137,123,0.1)"
              stroke="rgba(0,137,123,0.3)" strokeWidth="1.5" />
            <text x="400" y="434" textAnchor="middle" fill="#4DB6AC" fontSize="13"
              fontFamily={FONT} fontWeight="600">
              Why are these foods grouped in different columns?
            </text>
            <text x="400" y="452" textAnchor="middle" fill="#80CBC4" fontSize="11"
              fontFamily={FONT} fontWeight="400">
              Can you guess what the foods in each column have in common?
            </text>
          </g>
        </g>

        {/* ================= STEP 2: FIND THE NUTRIENTS GAME ================= */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 2 ? 1 : 0,
            transform: step === 2 ? 'translateY(0)' : step < 2 ? 'translateY(40px)' : 'translateY(-30px)',
          }}
        >
          {/* Five sorting boxes at bottom */}
          {Object.entries(NUTRIENTS).map(([key, n], i) => {
            const bx = 60 + i * 142;
            return (
              <g key={`box-${key}`}>
                {/* Box */}
                <rect x={bx} y="300" width="120" height="75" rx="10"
                  fill={`url(#${key}-${uid})`} opacity="0.2"
                  stroke={n.color} strokeWidth="2">
                  <animate attributeName="opacity" values="0.15;0.25;0.15"
                    dur={`${2.5 + i * 0.2}s`} repeatCount="indefinite" />
                </rect>
                {/* Box label */}
                <text x={bx + 60} y="345" textAnchor="middle" fill={n.color}
                  fontSize="11" fontFamily={FONT} fontWeight="700" letterSpacing="0.5">
                  {n.label.toUpperCase()}
                </text>
                {/* Box icon */}
                <rect x={bx + 35} y="355" width="50" height="12" rx="3"
                  fill={n.color} opacity="0.15" />
              </g>
            );
          })}

          {/* Scattered food cards in center area */}
          {FOODS.map((food, i) => {
            // Scattered positions in the upper area
            const positions = [
              { x: 120, y: 80 },  { x: 280, y: 65 },  { x: 440, y: 85 },
              { x: 600, y: 70 },  { x: 190, y: 160 }, { x: 350, y: 150 },
              { x: 510, y: 155 }, { x: 660, y: 145 }, { x: 130, y: 145 },
              { x: 420, y: 170 },
            ];
            const pos = positions[i];
            const nData = NUTRIENTS[food.nutrient];
            const nIdx = Object.keys(NUTRIENTS).indexOf(food.nutrient);
            const targetX = 90 + nIdx * 142;

            return (
              <g key={`card-${i}`}>
                {/* The food card */}
                <g style={{
                  transition: 'all 2s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: step === 2 ? `translate(${pos.x}px, ${pos.y}px)` : `translate(${pos.x}px, ${pos.y}px)`,
                }}>
                  <rect x={-30} y={-20} width="60" height="55" rx="8"
                    fill={`url(#card-${uid})`} stroke={nData.color} strokeWidth="1.5"
                    opacity="0.9" />
                  <text x="0" y="5" textAnchor="middle" fontSize="22">{food.emoji}</text>
                  <text x="0" y="24" textAnchor="middle" fill="rgba(255,255,255,0.7)"
                    fontSize="8" fontFamily={FONT} fontWeight="500">
                    {food.name}
                  </text>
                </g>

                {/* Animated arrow from card to box */}
                <line
                  x1={pos.x} y1={pos.y + 40}
                  x2={targetX + 60} y2={300}
                  stroke={nData.color} strokeWidth="1.2" strokeDasharray="5 4"
                  opacity="0.35">
                  <animate attributeName="opacity" values="0.2;0.5;0.2"
                    dur={`${2 + i * 0.15}s`} repeatCount="indefinite" />
                  <animate attributeName="strokeDashoffset" values="0;18"
                    dur="1.5s" repeatCount="indefinite" />
                </line>
                {/* Arrow head */}
                <polygon
                  points={`${targetX + 55},${295} ${targetX + 60},${300} ${targetX + 65},${295}`}
                  fill={nData.color} opacity="0.4">
                  <animate attributeName="opacity" values="0.2;0.5;0.2"
                    dur={`${2 + i * 0.15}s`} repeatCount="indefinite" />
                </polygon>
              </g>
            );
          })}

          {/* Instruction */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 2 ? 1 : 0 }}>
            <rect x="150" y="400" width="500" height="55" rx="12" fill="rgba(0,137,123,0.1)"
              stroke="rgba(0,137,123,0.3)" strokeWidth="1.5" />
            <text x="400" y="424" textAnchor="middle" fill="#4DB6AC" fontSize="13"
              fontFamily={FONT} fontWeight="600">
              Sort the food cards into the right nutrient box!
            </text>
            <text x="400" y="442" textAnchor="middle" fill="#80CBC4" fontSize="11"
              fontFamily={FONT} fontWeight="400">
              Each food card has a nutrient code — trade cards with other groups
            </text>
          </g>
        </g>

        {/* ================= STEP 3: FIVE NUTRIENT GROUPS REVEALED ================= */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 3 ? 1 : 0,
            transform: step === 3 ? 'translateY(0)' : step < 3 ? 'translateY(40px)' : 'translateY(-30px)',
          }}
        >
          {/* Five nutrient group cards */}
          {[
            {
              key: 'protein', title: 'PROTEINS', subtitle: 'Growth & Repair',
              icon: '\u{1F4AA}', foods: ['Dal', 'Eggs', 'Milk', 'Beans'],
              x: 30, y: 55,
            },
            {
              key: 'carb', title: 'CARBOHYDRATES', subtitle: 'Energy',
              icon: '\u26A1', foods: ['Rice', 'Wheat', 'Potato', 'Sugar'],
              x: 185, y: 55,
            },
            {
              key: 'fat', title: 'FATS', subtitle: 'Stored Energy',
              icon: '\u{1F9C8}', foods: ['Groundnut', 'Coconut', 'Ghee', 'Sesame'],
              x: 340, y: 55,
            },
            {
              key: 'vitamin', title: 'VITAMINS', subtitle: 'Protection',
              icon: '\u{1F6E1}\uFE0F', foods: ['Carrots', 'Lemon', 'Spinach', 'Amla'],
              x: 495, y: 55,
            },
            {
              key: 'mineral', title: 'MINERALS', subtitle: 'Strong Bones',
              icon: '\u{1F9B4}', foods: ['Milk', 'Banana', 'Salt', 'Greens'],
              x: 650, y: 55,
            },
          ].map((group, gi) => {
            const n = NUTRIENTS[group.key];
            return (
              <g key={`grp-${group.key}`}
                style={{
                  transition: `opacity 1.2s ease ${0.2 + gi * 0.15}s`,
                  opacity: step === 3 ? 1 : 0,
                }}>
                {/* Card background */}
                <rect x={group.x} y={group.y} width="135" height="280" rx="12"
                  fill="rgba(255,255,255,0.03)" stroke={n.color} strokeWidth="2"
                  filter={`url(#shadow-${uid})`} />

                {/* Color header bar */}
                <rect x={group.x} y={group.y} width="135" height="50" rx="12"
                  fill={`url(#${group.key}-${uid})`} opacity="0.3" />
                <rect x={group.x} y={group.y + 38} width="135" height="12"
                  fill={`url(#${group.key}-${uid})`} opacity="0.3" />

                {/* Icon */}
                <text x={group.x + 68} y={group.y + 30} textAnchor="middle" fontSize="22">
                  {group.icon}
                </text>

                {/* Title */}
                <text x={group.x + 68} y={group.y + 70} textAnchor="middle" fill={n.color}
                  fontSize="10" fontFamily={FONT} fontWeight="800" letterSpacing="1">
                  {group.title}
                </text>

                {/* Subtitle */}
                <text x={group.x + 68} y={group.y + 86} textAnchor="middle" fill={n.light}
                  fontSize="9" fontFamily={FONT} fontWeight="400" opacity="0.8">
                  {group.subtitle}
                </text>

                {/* Food list */}
                {group.foods.map((food, fi) => (
                  <g key={`gf-${fi}`}>
                    <rect x={group.x + 12} y={group.y + 100 + fi * 42} width="111" height="34" rx="6"
                      fill="rgba(255,255,255,0.04)" stroke={n.color} strokeWidth="0.5" opacity="0.7">
                      <animate attributeName="opacity" values="0.5;0.8;0.5"
                        dur={`${2.5 + fi * 0.3}s`} repeatCount="indefinite" />
                    </rect>
                    <text x={group.x + 68} y={group.y + 122 + fi * 42} textAnchor="middle"
                      fill="rgba(255,255,255,0.7)" fontSize="11" fontFamily={FONT} fontWeight="500">
                      {food}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}

          {/* Macro vs Micro divider */}
          <g style={{ transition: 'opacity 1.5s ease 1s', opacity: step === 3 ? 1 : 0 }}>
            {/* Macro bracket */}
            <path d="M95 350 L95 360 L340 360 L340 350" fill="none"
              stroke="#FFB74D" strokeWidth="1.5" opacity="0.5" />
            <text x="217" y="378" textAnchor="middle" fill="#FFB74D" fontSize="12"
              fontFamily={FONT} fontWeight="700" letterSpacing="1">
              MACRONUTRIENTS
            </text>
            <text x="217" y="392" textAnchor="middle" fill="rgba(255,179,77,0.6)" fontSize="9"
              fontFamily={FONT} fontWeight="400">
              Needed in large quantities
            </text>

            {/* Micro bracket */}
            <path d="M560 350 L560 360 L720 360 L720 350" fill="none"
              stroke="#66BB6A" strokeWidth="1.5" opacity="0.5" />
            <text x="640" y="378" textAnchor="middle" fill="#66BB6A" fontSize="12"
              fontFamily={FONT} fontWeight="700" letterSpacing="1">
              MICRONUTRIENTS
            </text>
            <text x="640" y="392" textAnchor="middle" fill="rgba(102,187,106,0.6)" fontSize="9"
              fontFamily={FONT} fontWeight="400">
              Needed in small amounts
            </text>
          </g>

          {/* Bottom key message */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 3 ? 1 : 0 }}>
            <rect x="150" y="410" width="500" height="55" rx="12" fill="rgba(0,137,123,0.1)"
              stroke="rgba(0,137,123,0.3)" strokeWidth="1.5" />
            <text x="400" y="434" textAnchor="middle" fill="#4DB6AC" fontSize="13"
              fontFamily={FONT} fontWeight="600">
              No single food gives you all nutrients!
            </text>
            <text x="400" y="452" textAnchor="middle" fill="#80CBC4" fontSize="11"
              fontFamily={FONT} fontWeight="400">
              Each group plays a different role in keeping the body healthy
            </text>
          </g>
        </g>

        {/* ================= STEP 4: BALANCED DIET THALI ================= */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 4 ? 1 : 0,
            transform: step === 4 ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          {/* Thali plate — large circle */}
          <g transform="translate(240, 60)">
            {/* Outer rim */}
            <ellipse cx="160" cy="180" rx="158" ry="158" fill="none"
              stroke="#8D6E63" strokeWidth="6" opacity="0.6" />
            {/* Plate surface */}
            <ellipse cx="160" cy="180" rx="150" ry="150" fill={`url(#thali-${uid})`} opacity="0.2" />
            {/* Inner ring */}
            <ellipse cx="160" cy="180" rx="145" ry="145" fill="none"
              stroke="rgba(161,136,127,0.15)" strokeWidth="1" />

            {/* Five sections — wedge-like bowls in a circle */}
            {[
              { key: 'protein', angle: -90, emoji: '\u{1F372}', label: 'Dal / Eggs', pct: '20%' },
              { key: 'carb', angle: -18, emoji: '\u{1F35A}', label: 'Rice / Roti', pct: '30%' },
              { key: 'fat', angle: 54, emoji: '\u{1F95C}', label: 'Ghee / Nuts', pct: '15%' },
              { key: 'vitamin', angle: 126, emoji: '\u{1F955}', label: 'Vegetables', pct: '20%' },
              { key: 'mineral', angle: 198, emoji: '\u{1F34C}', label: 'Fruit / Milk', pct: '15%' },
            ].map((section, si) => {
              const n = NUTRIENTS[section.key];
              const rad = (section.angle * Math.PI) / 180;
              const bowlR = 100;
              const bx = 160 + Math.cos(rad) * bowlR;
              const by = 180 + Math.sin(rad) * bowlR;

              return (
                <g key={`thali-${section.key}`}
                  style={{
                    transition: `opacity 1.2s ease ${0.4 + si * 0.2}s`,
                    opacity: step === 4 ? 1 : 0,
                  }}>
                  {/* Small bowl */}
                  <circle cx={bx} cy={by} r="36" fill="rgba(0,0,0,0.3)"
                    stroke={n.color} strokeWidth="2">
                    <animate attributeName="r" values="34;37;34"
                      dur={`${3 + si * 0.3}s`} repeatCount="indefinite" />
                  </circle>
                  <circle cx={bx} cy={by} r="30" fill={`url(#${section.key}-${uid})`} opacity="0.2" />

                  {/* Food emoji */}
                  <text x={bx} y={by - 4} textAnchor="middle" fontSize="20">{section.emoji}</text>

                  {/* Food label */}
                  <text x={bx} y={by + 16} textAnchor="middle" fill="rgba(255,255,255,0.7)"
                    fontSize="8" fontFamily={FONT} fontWeight="500">
                    {section.label}
                  </text>

                  {/* Percentage badge */}
                  <g>
                    <rect x={bx - 14} y={by + 22} width="28" height="14" rx="7"
                      fill={n.color} opacity="0.3" />
                    <text x={bx} y={by + 32} textAnchor="middle" fill={n.color}
                      fontSize="8" fontFamily={FONT} fontWeight="700">
                      {section.pct}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Center text */}
            <text x="160" y="175" textAnchor="middle" fill="#FFD54F" fontSize="11"
              fontFamily={FONT} fontWeight="700" letterSpacing="1">
              BALANCED
            </text>
            <text x="160" y="192" textAnchor="middle" fill="#FFD54F" fontSize="11"
              fontFamily={FONT} fontWeight="700" letterSpacing="1">
              THALI
            </text>
          </g>

          {/* Right side — comparison figures */}
          <g transform="translate(580, 80)"
            style={{ transition: 'opacity 1.5s ease 1s', opacity: step === 4 ? 1 : 0 }}>
            {/* Healthy figure */}
            <g>
              <text x="55" y="0" textAnchor="middle" fill="#66BB6A" fontSize="10"
                fontFamily={FONT} fontWeight="600">
                Balanced Diet
              </text>
              {/* Stick figure - healthy */}
              <circle cx="55" cy="25" r="12" fill="none" stroke="#66BB6A" strokeWidth="2" />
              <text x="55" y="30" textAnchor="middle" fontSize="10">&#x1F60A;</text>
              <line x1="55" y1="37" x2="55" y2="80" stroke="#66BB6A" strokeWidth="2" />
              <line x1="35" y1="55" x2="75" y2="55" stroke="#66BB6A" strokeWidth="2" />
              <line x1="55" y1="80" x2="38" y2="110" stroke="#66BB6A" strokeWidth="2" />
              <line x1="55" y1="80" x2="72" y2="110" stroke="#66BB6A" strokeWidth="2" />
              <text x="55" y="128" textAnchor="middle" fill="#A5D6A7" fontSize="8"
                fontFamily={FONT} fontWeight="500">
                Strong &amp; Healthy
              </text>
            </g>

            {/* Deficiency warnings */}
            <g transform="translate(0, 150)">
              <text x="55" y="0" textAnchor="middle" fill="#EF5350" fontSize="9"
                fontFamily={FONT} fontWeight="600">
                Deficiency Effects
              </text>

              {[
                { label: 'No Protein', effect: 'Stunted growth', emoji: '\u{1F4C9}' },
                { label: 'No Vitamin C', effect: 'Scurvy', emoji: '\u{1F9B7}' },
                { label: 'No Iron', effect: 'Anemia', emoji: '\u{1FA78}' },
              ].map((d, di) => (
                <g key={`def-${di}`} transform={`translate(0, ${18 + di * 42})`}>
                  <rect x="0" y="0" width="110" height="34" rx="6"
                    fill="rgba(239,83,80,0.08)" stroke="rgba(239,83,80,0.3)" strokeWidth="1" />
                  <text x="18" y="14" fontSize="12">{d.emoji}</text>
                  <text x="35" y="13" fill="#EF5350" fontSize="8"
                    fontFamily={FONT} fontWeight="600">
                    {d.label}
                  </text>
                  <text x="35" y="26" fill="rgba(239,83,80,0.7)" fontSize="8"
                    fontFamily={FONT} fontWeight="400">
                    {d.effect}
                  </text>
                </g>
              ))}
            </g>
          </g>

          {/* Celebration banner */}
          <g style={{ transition: 'opacity 1.5s ease 1.5s', opacity: step === 4 ? 1 : 0 }}>
            <text x="310" y="445" textAnchor="middle" fill="#00E676" fontSize="22"
              fontFamily={FONT} fontWeight="800" letterSpacing="3"
              filter={`url(#bigGlow-${uid})`}>
              EAT VARIETY FOR HEALTH!
            </text>
            <text x="310" y="468" textAnchor="middle" fill="#69F0AE" fontSize="11"
              fontFamily={FONT} fontWeight="400" letterSpacing="1">
              Different foods, different nutrients — your body needs them all
            </text>
          </g>

          {/* Sparkle effects */}
          {[
            { x: 180, y: 80 },
            { x: 500, y: 90 },
            { x: 170, y: 350 },
            { x: 510, y: 340 },
            { x: 260, y: 430 },
            { x: 440, y: 440 },
          ].map((sp, i) => (
            <g key={`sp4-${i}`} style={{
              transition: `opacity 1.5s ease ${1.2 + i * 0.12}s`,
              opacity: step === 4 ? 1 : 0,
            }}>
              <circle cx={sp.x} cy={sp.y} r="5" fill={`url(#sparkle-${uid})`}>
                <animate attributeName="r" values="3;7;3" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
              </circle>
              <line x1={sp.x - 5} y1={sp.y} x2={sp.x + 5} y2={sp.y} stroke="#69F0AE" strokeWidth="1" opacity="0.5">
                <animate attributeName="opacity" values="0.5;0.15;0.5" dur={`${1.3 + i * 0.25}s`} repeatCount="indefinite" />
              </line>
              <line x1={sp.x} y1={sp.y - 5} x2={sp.x} y2={sp.y + 5} stroke="#69F0AE" strokeWidth="1" opacity="0.5">
                <animate attributeName="opacity" values="0.5;0.15;0.5" dur={`${1.3 + i * 0.25}s`} repeatCount="indefinite" />
              </line>
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
          B3 FOOD &amp; DIGESTION
        </text>
      </svg>
    </div>
  );
}
