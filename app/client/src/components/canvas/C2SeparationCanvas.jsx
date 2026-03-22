import React, { useMemo } from 'react';

/**
 * C2 Separation Techniques — "Separating Mixtures of Solids"
 *
 * Interactive SVG canvas showing separation methods: handpicking, sieving, winnowing.
 * Receives `currentStep` prop (1-4) and renders each stage with smooth transitions.
 *
 * Step 1: Three mixtures — bowls of dal+dal, rice+stones, sand+sugar
 * Step 2: Handpicking — hands picking stones from rice
 * Step 3: Sieving — mesh filtering sand from sugar
 * Step 4: Winnowing — wind separating chaff from grain, conclusion labels
 */

const TRANSITION = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
const FADE_TRANSITION = 'opacity 1.5s ease 0.3s';
const DELAYED_FADE = 'opacity 1.5s ease 0.8s';

export default function C2SeparationCanvas({ currentStep = 1 }) {
  const step = Math.max(1, Math.min(4, currentStep));

  const filterId = useMemo(() => `sep-${Math.random().toString(36).slice(2, 8)}`, []);

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
          {/* Background gradient — chemistry purple */}
          <radialGradient id={`${filterId}-bgGlow`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1a1028" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>

          {/* Table wood gradient */}
          <linearGradient id={`${filterId}-tableGrad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6B4E10" />
            <stop offset="30%" stopColor="#5C4410" />
            <stop offset="100%" stopColor="#3D2E0A" />
          </linearGradient>

          {/* Bowl gradient — ceramic */}
          <linearGradient id={`${filterId}-bowlGrad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7E57C2" />
            <stop offset="50%" stopColor="#5E35B1" />
            <stop offset="100%" stopColor="#4527A0" />
          </linearGradient>
          <linearGradient id={`${filterId}-bowlInner`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4A2D8A" />
            <stop offset="100%" stopColor="#311B72" />
          </linearGradient>

          {/* Skin tone for hand */}
          <linearGradient id={`${filterId}-skinGrad`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C68642" />
            <stop offset="100%" stopColor="#A0522D" />
          </linearGradient>

          {/* Sieve metal gradient */}
          <linearGradient id={`${filterId}-sieveGrad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#90A4AE" />
            <stop offset="50%" stopColor="#78909C" />
            <stop offset="100%" stopColor="#607D8B" />
          </linearGradient>

          {/* Container below sieve */}
          <linearGradient id={`${filterId}-containerGrad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6A1B9A" />
            <stop offset="100%" stopColor="#4A148C" />
          </linearGradient>

          {/* Wind gradient */}
          <linearGradient id={`${filterId}-windGrad`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(206,147,216,0.6)" />
            <stop offset="100%" stopColor="rgba(206,147,216,0)" />
          </linearGradient>

          {/* Sparkle glow */}
          <radialGradient id={`${filterId}-sparkle`}>
            <stop offset="0%" stopColor="#CE93D8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#CE93D8" stopOpacity="0" />
          </radialGradient>

          {/* Purple accent glow */}
          <radialGradient id={`${filterId}-purpleGlow`}>
            <stop offset="0%" stopColor="rgba(156,39,176,0.3)" />
            <stop offset="100%" stopColor="rgba(156,39,176,0)" />
          </radialGradient>

          {/* Soft shadow filter */}
          <filter id={`${filterId}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
          </filter>
          <filter id={`${filterId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ===== BACKGROUND ===== */}
        <rect width="800" height="560" fill={`url(#${filterId}-bgGlow)`} />

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
          fill="#CE93D8"
          fontSize="14"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="600"
          letterSpacing="2"
          style={{ transition: FADE_TRANSITION }}
        >
          {step === 1 && 'STEP 1 \u2014 THREE MIXTURES'}
          {step === 2 && 'STEP 2 \u2014 HANDPICKING SUCCEEDS'}
          {step === 3 && 'STEP 3 \u2014 SIEVING SAVES THE DAY'}
          {step === 4 && 'STEP 4 \u2014 THRESHING & WINNOWING'}
        </text>

        {/* ===== STEP 1: THREE MIXTURES ON A TABLE ===== */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 1 ? 1 : 0,
            transform: step === 1 ? 'translateY(0)' : 'translateY(-30px)',
          }}
        >
          {/* Wooden table surface */}
          <rect x="40" y="400" width="720" height="22" rx="4" fill={`url(#${filterId}-tableGrad)`} filter={`url(#${filterId}-shadow)`} />
          <rect x="40" y="418" width="720" height="10" rx="2" fill="#3D2E0A" />
          <g opacity="0.12">
            <line x1="80" y1="406" x2="720" y2="406" stroke="#3D2E0A" strokeWidth="0.5" />
            <line x1="60" y1="412" x2="740" y2="411" stroke="#3D2E0A" strokeWidth="0.5" />
          </g>

          {/* ---- Bowl 1: Toor Dal + Urad Dal ---- */}
          <g transform="translate(100, 240)">
            {/* Bowl body */}
            <ellipse cx="90" cy="140" rx="85" ry="22" fill={`url(#${filterId}-bowlGrad)`} filter={`url(#${filterId}-shadow)`} />
            <path d="M5 100 Q5 145 90 160 Q175 145 175 100" fill={`url(#${filterId}-bowlGrad)`} />
            <ellipse cx="90" cy="100" rx="85" ry="26" fill={`url(#${filterId}-bowlInner)`} />
            {/* Dal particles — toor (yellow) mixed with urad (black) */}
            {[
              { x: 60, y: 90, c: '#F9A825' }, { x: 80, y: 85, c: '#1A1A1A' },
              { x: 100, y: 92, c: '#F9A825' }, { x: 120, y: 88, c: '#1A1A1A' },
              { x: 70, y: 98, c: '#1A1A1A' }, { x: 90, y: 95, c: '#F9A825' },
              { x: 110, y: 100, c: '#F9A825' }, { x: 50, y: 95, c: '#F9A825' },
              { x: 130, y: 94, c: '#1A1A1A' }, { x: 75, y: 103, c: '#F9A825' },
              { x: 95, y: 106, c: '#1A1A1A' }, { x: 115, y: 104, c: '#F9A825' },
            ].map((p, i) => (
              <ellipse key={`d1-${i}`} cx={p.x} cy={p.y} rx="7" ry="5" fill={p.c} opacity="0.9" />
            ))}
            {/* Label */}
            <text x="90" y="60" textAnchor="middle" fill="#CE93D8" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Toor Dal + Urad Dal
            </text>
            <text x="90" y="75" textAnchor="middle" fill="#B39DDB" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              Different colours
            </text>
          </g>

          {/* ---- Bowl 2: Rice + Stones ---- */}
          <g transform="translate(310, 240)">
            <ellipse cx="90" cy="140" rx="85" ry="22" fill={`url(#${filterId}-bowlGrad)`} filter={`url(#${filterId}-shadow)`} />
            <path d="M5 100 Q5 145 90 160 Q175 145 175 100" fill={`url(#${filterId}-bowlGrad)`} />
            <ellipse cx="90" cy="100" rx="85" ry="26" fill={`url(#${filterId}-bowlInner)`} />
            {/* Rice (white) + stones (grey) */}
            {[
              { x: 55, y: 88, c: '#FAFAFA', s: false }, { x: 75, y: 85, c: '#757575', s: true },
              { x: 95, y: 90, c: '#FAFAFA', s: false }, { x: 115, y: 86, c: '#FAFAFA', s: false },
              { x: 65, y: 96, c: '#FAFAFA', s: false }, { x: 85, y: 93, c: '#9E9E9E', s: true },
              { x: 105, y: 98, c: '#FAFAFA', s: false }, { x: 125, y: 92, c: '#FAFAFA', s: false },
              { x: 70, y: 102, c: '#FAFAFA', s: false }, { x: 100, y: 104, c: '#616161', s: true },
              { x: 90, y: 100, c: '#FAFAFA', s: false }, { x: 50, y: 94, c: '#FAFAFA', s: false },
            ].map((p, i) => (
              p.s
                ? <polygon key={`r1-${i}`} points={`${p.x - 6},${p.y + 3} ${p.x - 2},${p.y - 5} ${p.x + 5},${p.y - 3} ${p.x + 6},${p.y + 4} ${p.x},${p.y + 6}`} fill={p.c} opacity="0.9" />
                : <ellipse key={`r1-${i}`} cx={p.x} cy={p.y} rx="5" ry="3" fill={p.c} opacity="0.9" />
            ))}
            <text x="90" y="60" textAnchor="middle" fill="#CE93D8" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Rice + Stones
            </text>
            <text x="90" y="75" textAnchor="middle" fill="#B39DDB" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              Different shape & size
            </text>
          </g>

          {/* ---- Bowl 3: Sand + Sugar ---- */}
          <g transform="translate(520, 240)">
            <ellipse cx="90" cy="140" rx="85" ry="22" fill={`url(#${filterId}-bowlGrad)`} filter={`url(#${filterId}-shadow)`} />
            <path d="M5 100 Q5 145 90 160 Q175 145 175 100" fill={`url(#${filterId}-bowlGrad)`} />
            <ellipse cx="90" cy="100" rx="85" ry="26" fill={`url(#${filterId}-bowlInner)`} />
            {/* Sand + sugar — very similar looking, tiny particles */}
            {Array.from({ length: 40 }, (_, i) => {
              const angle = (i / 40) * Math.PI * 2;
              const r = 20 + Math.random() * 40;
              const px = 90 + Math.cos(angle) * r * 0.9;
              const py = 96 + Math.sin(angle) * r * 0.3;
              const isSand = i % 2 === 0;
              return (
                <circle key={`ss-${i}`} cx={px} cy={py} r="2"
                  fill={isSand ? '#D7CCC8' : '#F5F5F0'} opacity="0.8" />
              );
            })}
            {/* Question mark overlay — this one is tricky */}
            <text x="90" y="100" textAnchor="middle" fill="rgba(244,143,177,0.5)" fontSize="28"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="800">
              ?
            </text>
            <text x="90" y="60" textAnchor="middle" fill="#CE93D8" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Sand + Sugar
            </text>
            <text x="90" y="75" textAnchor="middle" fill="#F48FB1" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.8">
              Look similar! Hard to tell apart
            </text>
          </g>

          {/* Sieves set aside on the right */}
          <g opacity="0.4" transform="translate(680, 330)">
            <ellipse cx="30" cy="20" rx="28" ry="10" fill="none" stroke="#90A4AE" strokeWidth="2" />
            <line x1="2" y1="20" x2="2" y2="50" stroke="#90A4AE" strokeWidth="1.5" />
            <line x1="58" y1="20" x2="58" y2="50" stroke="#90A4AE" strokeWidth="1.5" />
            <text x="30" y="68" textAnchor="middle" fill="#78909C" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Sieves
            </text>
          </g>
        </g>

        {/* ===== STEP 2: HANDPICKING ===== */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 2 ? 1 : 0,
            transform: step === 2 ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          {/* Central scene — rice bowl with hand picking stones */}
          <g transform="translate(200, 120)">
            {/* Large bowl */}
            <ellipse cx="200" cy="280" rx="150" ry="35" fill={`url(#${filterId}-bowlGrad)`} filter={`url(#${filterId}-shadow)`} />
            <path d="M50 220 Q50 285 200 300 Q350 285 350 220" fill={`url(#${filterId}-bowlGrad)`} />
            <ellipse cx="200" cy="220" rx="150" ry="42" fill={`url(#${filterId}-bowlInner)`} />

            {/* Rice grains inside */}
            {Array.from({ length: 30 }, (_, i) => {
              const angle = (i / 30) * Math.PI * 2;
              const r = 30 + (i * 3.7) % 80;
              const px = 200 + Math.cos(angle) * r * 0.85;
              const py = 215 + Math.sin(angle) * r * 0.25;
              return (
                <ellipse key={`rice-${i}`} cx={px} cy={py} rx="5" ry="3" fill="#FAFAFA" opacity="0.85"
                  transform={`rotate(${(i * 31) % 60 - 30}, ${px}, ${py})`} />
              );
            })}

            {/* Remaining stones in the bowl */}
            {[
              { x: 170, y: 210 }, { x: 230, y: 218 },
            ].map((s, i) => (
              <polygon key={`st-${i}`} points={`${s.x - 7},${s.y + 4} ${s.x - 3},${s.y - 6} ${s.x + 6},${s.y - 4} ${s.x + 7},${s.y + 5} ${s.x},${s.y + 7}`}
                fill="#757575" stroke="#616161" strokeWidth="0.5" />
            ))}

            {/* Hand reaching in and picking a stone */}
            <g style={{ transition: DELAYED_FADE, opacity: step === 2 ? 1 : 0 }}>
              {/* Arm */}
              <path d="M380 140 Q340 170 310 195 Q290 210 280 210"
                fill="none" stroke={`url(#${filterId}-skinGrad)`} strokeWidth="18" strokeLinecap="round" />
              {/* Hand shape */}
              <ellipse cx="280" cy="208" rx="16" ry="12" fill="#C68642" />
              {/* Thumb and index finger pinching */}
              <path d="M272 200 Q268 192 272 186" fill="none" stroke="#C68642" strokeWidth="5" strokeLinecap="round" />
              <path d="M288 200 Q292 192 288 186" fill="none" stroke="#C68642" strokeWidth="5" strokeLinecap="round" />
              {/* Stone being picked */}
              <polygon points="275,184 278,178 283,177 286,182 282,187 277,187" fill="#757575" stroke="#616161" strokeWidth="0.5" />
              {/* Picking motion arrow */}
              <g opacity="0.6">
                <line x1="280" y1="175" x2="280" y2="145" stroke="#CE93D8" strokeWidth="1.5" strokeDasharray="4 3" />
                <polygon points="275,148 280,138 285,148" fill="#CE93D8" />
              </g>
            </g>

            {/* Separated stones pile */}
            <g transform="translate(370, 220)">
              <text x="20" y="-15" textAnchor="middle" fill="#EF9A9A" fontSize="10"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                Removed stones
              </text>
              {[
                { x: 5, y: 5 }, { x: 20, y: 0 }, { x: 35, y: 3 },
                { x: 12, y: 12 }, { x: 28, y: 10 },
              ].map((s, i) => (
                <polygon key={`rs-${i}`} points={`${s.x - 5},${s.y + 3} ${s.x - 1},${s.y - 5} ${s.x + 5},${s.y - 2} ${s.x + 5},${s.y + 4} ${s.x},${s.y + 5}`}
                  fill="#9E9E9E" stroke="#757575" strokeWidth="0.5" />
              ))}
            </g>

            {/* Label */}
            <text x="200" y="175" textAnchor="middle" fill="#CE93D8" fontSize="13"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Rice + Stones mixture
            </text>
          </g>

          {/* Success indicators for dal groups */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 2 ? 1 : 0 }}>
            {/* Left panel — dal success */}
            <rect x="30" y="80" width="160" height="100" rx="10" fill="rgba(76,175,80,0.08)" stroke="rgba(76,175,80,0.3)" strokeWidth="1" />
            <text x="110" y="105" textAnchor="middle" fill="#81C784" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Dal Mixture
            </text>
            <circle cx="70" cy="135" r="8" fill="#F9A825" />
            <circle cx="95" cy="135" r="8" fill="#1A1A1A" />
            <text x="120" y="132" fill="#A5D6A7" fontSize="9" fontFamily="'Inter', system-ui, sans-serif">Sorted by</text>
            <text x="120" y="145" fill="#A5D6A7" fontSize="9" fontFamily="'Inter', system-ui, sans-serif">colour!</text>
            <g>
              <circle cx="155" cy="155" r="10" fill="none" stroke="#4CAF50" strokeWidth="1.5" />
              <polyline points="149,155 153,159 162,150" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" />
            </g>
          </g>

          {/* Right panel — sand+sugar failure */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 2 ? 1 : 0 }}>
            <rect x="610" y="80" width="160" height="100" rx="10" fill="rgba(244,67,54,0.08)" stroke="rgba(244,67,54,0.3)" strokeWidth="1" />
            <text x="690" y="105" textAnchor="middle" fill="#EF9A9A" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Sand + Sugar
            </text>
            <text x="690" y="125" textAnchor="middle" fill="#E57373" fontSize="22"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="800">
              STUCK!
            </text>
            <text x="690" y="145" textAnchor="middle" fill="#EF9A9A" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Too small & similar
            </text>
            <text x="690" y="158" textAnchor="middle" fill="#EF9A9A" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              to pick by hand
            </text>
            <text x="690" y="170" textAnchor="middle" fill="#E57373" fontSize="16"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">
              &#x2717;
            </text>
          </g>

          {/* Annotation box */}
          <g style={{ transition: 'opacity 1.5s ease 1s', opacity: step === 2 ? 1 : 0 }}>
            <rect x="220" y="430" width="360" height="55" rx="10" fill="rgba(156,39,176,0.1)" stroke="#AB47BC" strokeWidth="1" />
            <text x="400" y="453" textAnchor="middle" fill="#CE93D8" fontSize="13"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Handpicking works when substances differ
            </text>
            <text x="400" y="470" textAnchor="middle" fill="#B39DDB" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              in size, colour, or shape
            </text>
          </g>
        </g>

        {/* ===== STEP 3: SIEVING ===== */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 3 ? 1 : 0,
            transform: step === 3 ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          {/* Central sieve scene */}
          <g transform="translate(200, 60)">
            {/* Hands holding the sieve */}
            {/* Left hand */}
            <path d="M50 180 Q70 175 90 185" fill="none" stroke="#C68642" strokeWidth="14" strokeLinecap="round" />
            {/* Right hand */}
            <path d="M350 180 Q330 175 310 185" fill="none" stroke="#C68642" strokeWidth="14" strokeLinecap="round" />

            {/* Sieve frame — circular rim */}
            <ellipse cx="200" cy="185" rx="120" ry="30" fill={`url(#${filterId}-sieveGrad)`} filter={`url(#${filterId}-shadow)`} />
            <ellipse cx="200" cy="185" rx="110" ry="25" fill="none" stroke="#546E7A" strokeWidth="1" />

            {/* Mesh pattern */}
            <g opacity="0.5">
              {Array.from({ length: 15 }, (_, i) => {
                const x = 110 + i * 12;
                return (
                  <line key={`mv-${i}`} x1={x} y1="175" x2={x} y2="195" stroke="#90A4AE" strokeWidth="0.5" />
                );
              })}
              {Array.from({ length: 5 }, (_, i) => {
                const y = 177 + i * 4;
                return (
                  <line key={`mh-${i}`} x1="110" y1={y} x2="290" y2={y} stroke="#90A4AE" strokeWidth="0.5" />
                );
              })}
            </g>

            {/* Sugar crystals on top of sieve (larger, white) */}
            {[
              { x: 155, y: 178 }, { x: 180, y: 175 }, { x: 210, y: 180 },
              { x: 235, y: 176 }, { x: 200, y: 172 }, { x: 170, y: 182 },
              { x: 225, y: 182 }, { x: 190, y: 178 }, { x: 245, y: 179 },
            ].map((p, i) => (
              <rect key={`sug-${i}`} x={p.x - 3} y={p.y - 3} width="6" height="6" rx="1"
                fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="0.3" opacity="0.9"
                transform={`rotate(${(i * 23) % 45}, ${p.x}, ${p.y})`} />
            ))}

            {/* Sand particles falling through */}
            {[
              { x: 165, y: 210, delay: 0 }, { x: 185, y: 225, delay: 0.3 },
              { x: 200, y: 215, delay: 0.1 }, { x: 215, y: 235, delay: 0.5 },
              { x: 180, y: 245, delay: 0.2 }, { x: 230, y: 220, delay: 0.4 },
              { x: 195, y: 255, delay: 0.6 }, { x: 210, y: 260, delay: 0.3 },
              { x: 175, y: 265, delay: 0.7 }, { x: 220, y: 250, delay: 0.1 },
              { x: 190, y: 275, delay: 0.5 }, { x: 205, y: 280, delay: 0.8 },
              { x: 170, y: 290, delay: 0.4 }, { x: 225, y: 270, delay: 0.2 },
            ].map((p, i) => (
              <circle key={`sand-${i}`} cx={p.x} cy={p.y} r="1.5" fill="#D7CCC8" opacity="0.8">
                <animate
                  attributeName="cy"
                  values={`${p.y};${p.y + 20};${p.y}`}
                  dur={`${2 + p.delay}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.8;0.4;0.8"
                  dur={`${2 + p.delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}

            {/* Container below catching sand */}
            <rect x="130" y="310" width="140" height="60" rx="8" fill={`url(#${filterId}-containerGrad)`} filter={`url(#${filterId}-shadow)`} />
            <rect x="138" y="316" width="124" height="48" rx="5" fill="rgba(74,20,140,0.6)" />
            {/* Sand collected inside */}
            <ellipse cx="200" cy="345" rx="55" ry="12" fill="#D7CCC8" opacity="0.6" />
            <text x="200" y="390" textAnchor="middle" fill="#BCAAA4" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
              Fine sand passes through
            </text>
          </g>

          {/* Labels and annotations */}
          <g style={{ transition: DELAYED_FADE, opacity: step === 3 ? 1 : 0 }}>
            {/* Sugar on sieve label */}
            <line x1="460" y1="235" x2="530" y2="210" stroke="#FAFAFA" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
            <text x="535" y="206" fill="#FAFAFA" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Sugar crystals
            </text>
            <text x="535" y="222" fill="#E0E0E0" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              Too large to pass through
            </text>

            {/* Sand falling label */}
            <line x1="440" y1="330" x2="520" y2="320" stroke="#BCAAA4" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
            <text x="525" y="316" fill="#BCAAA4" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Sand grains
            </text>
            <text x="525" y="332" fill="#A1887F" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              Small enough to fall through mesh
            </text>

            {/* Size comparison diagram */}
            <rect x="540" y="360" width="220" height="100" rx="10" fill="rgba(30,30,40,0.8)" stroke="rgba(206,147,216,0.3)" strokeWidth="1" />
            <text x="650" y="382" textAnchor="middle" fill="#CE93D8" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="1">
              SIZE MATTERS
            </text>
            {/* Sugar crystal — large */}
            <rect x="575" y="400" width="14" height="14" rx="2" fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="0.5" />
            <text x="600" y="413" fill="#B0BEC5" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Sugar &gt; mesh holes
            </text>
            {/* Sand grain — small */}
            <circle cx="582" cy="440" r="3" fill="#D7CCC8" />
            <text x="600" y="444" fill="#B0BEC5" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Sand &lt; mesh holes
            </text>
          </g>

          {/* Left annotation — how sieving works */}
          <g style={{ transition: 'opacity 1.5s ease 1s', opacity: step === 3 ? 1 : 0 }}>
            <rect x="20" y="340" width="180" height="55" rx="10" fill="rgba(156,39,176,0.1)" stroke="#AB47BC" strokeWidth="1" />
            <text x="110" y="363" textAnchor="middle" fill="#CE93D8" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Sieving separates by
            </text>
            <text x="110" y="380" textAnchor="middle" fill="#B39DDB" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              particle size difference
            </text>
          </g>
        </g>

        {/* ===== STEP 4: WINNOWING (& THRESHING CONTEXT) ===== */}
        <g
          style={{
            transition: TRANSITION,
            opacity: step === 4 ? 1 : 0,
            transform: step === 4 ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          {/* === Left side: Threshing mini scene === */}
          <g transform="translate(30, 70)">
            <rect x="0" y="0" width="220" height="200" rx="12" fill="rgba(30,30,40,0.7)" stroke="rgba(206,147,216,0.2)" strokeWidth="1" />
            <text x="110" y="25" textAnchor="middle" fill="#CE93D8" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="1">
              THRESHING
            </text>
            {/* Farmer figure (simplified) */}
            <circle cx="80" cy="65" r="10" fill="#C68642" /> {/* head */}
            <line x1="80" y1="75" x2="80" y2="120" stroke="#C68642" strokeWidth="4" /> {/* body */}
            <line x1="80" y1="120" x2="65" y2="155" stroke="#C68642" strokeWidth="3" /> {/* left leg */}
            <line x1="80" y1="120" x2="95" y2="155" stroke="#C68642" strokeWidth="3" /> {/* right leg */}
            {/* Arms holding paddy stalks */}
            <line x1="80" y1="90" x2="50" y2="75" stroke="#C68642" strokeWidth="3" />
            <line x1="80" y1="90" x2="130" y2="60" stroke="#C68642" strokeWidth="3" />
            {/* Paddy stalks */}
            <line x1="125" y1="62" x2="160" y2="40" stroke="#8D6E63" strokeWidth="2" />
            <line x1="125" y1="62" x2="155" y2="35" stroke="#A1887F" strokeWidth="1.5" />
            <line x1="125" y1="62" x2="165" y2="45" stroke="#8D6E63" strokeWidth="1.5" />
            {/* Grains flying off */}
            {[
              { x: 150, y: 55 }, { x: 158, y: 48 }, { x: 145, y: 42 },
              { x: 162, y: 38 }, { x: 140, y: 50 },
            ].map((g, i) => (
              <ellipse key={`tg-${i}`} cx={g.x} cy={g.y} rx="3" ry="2" fill="#FFD54F" opacity="0.8">
                <animate
                  attributeName="cy"
                  values={`${g.y};${g.y - 5};${g.y}`}
                  dur={`${1.5 + i * 0.2}s`}
                  repeatCount="indefinite"
                />
              </ellipse>
            ))}
            {/* Ground */}
            <line x1="30" y1="160" x2="190" y2="160" stroke="#5D4037" strokeWidth="2" />
            {/* Grain pile on ground */}
            <ellipse cx="130" cy="158" rx="30" ry="8" fill="#FFD54F" opacity="0.5" />
            <text x="110" y="185" textAnchor="middle" fill="#BCAAA4" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Beating stalks to
            </text>
            <text x="110" y="196" textAnchor="middle" fill="#BCAAA4" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              separate grain
            </text>
          </g>

          {/* === Right side: Winnowing — main scene === */}
          <g transform="translate(290, 50)">
            <rect x="0" y="0" width="480" height="230" rx="12" fill="rgba(30,30,40,0.5)" stroke="rgba(206,147,216,0.2)" strokeWidth="1" />
            <text x="240" y="25" textAnchor="middle" fill="#CE93D8" fontSize="13"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" letterSpacing="1">
              WINNOWING
            </text>

            {/* Farmer figure dropping grain */}
            <circle cx="120" cy="60" r="12" fill="#C68642" /> {/* head */}
            <line x1="120" y1="72" x2="120" y2="125" stroke="#C68642" strokeWidth="5" /> {/* body */}
            <line x1="120" y1="125" x2="105" y2="165" stroke="#C68642" strokeWidth="3.5" />
            <line x1="120" y1="125" x2="135" y2="165" stroke="#C68642" strokeWidth="3.5" />
            {/* Arms holding plate up */}
            <line x1="120" y1="88" x2="155" y2="70" stroke="#C68642" strokeWidth="3.5" />
            <line x1="120" y1="88" x2="85" y2="70" stroke="#C68642" strokeWidth="3.5" />
            {/* Plate / basket */}
            <ellipse cx="120" cy="68" rx="40" ry="8" fill="#8D6E63" stroke="#6D4C41" strokeWidth="1" />

            {/* Grain falling straight down (heavy) */}
            {[
              { x: 110, y: 85, d: 0 }, { x: 120, y: 90, d: 0.2 },
              { x: 130, y: 88, d: 0.4 }, { x: 115, y: 95, d: 0.1 },
              { x: 125, y: 100, d: 0.3 }, { x: 118, y: 108, d: 0.5 },
              { x: 122, y: 115, d: 0.2 }, { x: 112, y: 120, d: 0.6 },
              { x: 128, y: 125, d: 0.1 }, { x: 120, y: 130, d: 0.4 },
            ].map((g, i) => (
              <ellipse key={`gr-${i}`} cx={g.x} cy={g.y} rx="3" ry="2" fill="#FFD54F" opacity="0.8">
                <animate
                  attributeName="cy"
                  values={`${g.y};${g.y + 8};${g.y}`}
                  dur={`${2 + g.d}s`}
                  repeatCount="indefinite"
                />
              </ellipse>
            ))}

            {/* Grain pile at bottom */}
            <ellipse cx="120" cy="170" rx="35" ry="10" fill="#FFD54F" opacity="0.6" />
            <text x="120" y="195" textAnchor="middle" fill="#FFD54F" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Heavy grain
            </text>
            <text x="120" y="207" textAnchor="middle" fill="#FFD54F" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              falls straight down
            </text>

            {/* Wind arrows blowing right */}
            {[80, 100, 120, 140].map((y, i) => (
              <g key={`wind-${i}`} opacity="0.6">
                <line x1="160" y1={y} x2="300" y2={y - 15 + i * 5} stroke="#CE93D8" strokeWidth="1.5" strokeDasharray="6 4">
                  <animate
                    attributeName="strokeDashoffset"
                    values="0;-20"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </line>
                <polygon points={`${295 + i * 2},${y - 18 + i * 5} ${305 + i * 2},${y - 15 + i * 5} ${295 + i * 2},${y - 12 + i * 5}`}
                  fill="#CE93D8" opacity="0.6" />
              </g>
            ))}
            {/* Wind label */}
            <text x="230" y="70" textAnchor="middle" fill="#CE93D8" fontSize="11"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" opacity="0.8">
              Wind
            </text>

            {/* Chaff blowing away to the right (light particles) */}
            {[
              { x: 250, y: 85, d: 0 }, { x: 280, y: 90, d: 0.3 },
              { x: 310, y: 80, d: 0.1 }, { x: 340, y: 95, d: 0.5 },
              { x: 270, y: 100, d: 0.2 }, { x: 320, y: 88, d: 0.4 },
              { x: 360, y: 82, d: 0.6 }, { x: 300, y: 105, d: 0.15 },
              { x: 380, y: 90, d: 0.7 }, { x: 350, y: 100, d: 0.35 },
              { x: 400, y: 85, d: 0.8 }, { x: 290, y: 110, d: 0.25 },
            ].map((c, i) => (
              <g key={`chaff-${i}`}>
                <path d={`M${c.x},${c.y} Q${c.x + 4},${c.y - 4} ${c.x + 8},${c.y}`}
                  fill="none" stroke="#D7CCC8" strokeWidth="1.5" opacity="0.6">
                  <animate
                    attributeName="opacity"
                    values="0.6;0.2;0.6"
                    dur={`${2 + c.d}s`}
                    repeatCount="indefinite"
                  />
                </path>
                <circle cx={c.x + 4} cy={c.y - 2} r="2" fill="#EFEBE9" opacity="0.5">
                  <animate
                    attributeName="cx"
                    values={`${c.x + 4};${c.x + 15};${c.x + 4}`}
                    dur={`${2.5 + c.d}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            ))}

            {/* Chaff pile far right */}
            <ellipse cx="390" cy="170" rx="40" ry="10" fill="#EFEBE9" opacity="0.3" />
            <text x="390" y="195" textAnchor="middle" fill="#BCAAA4" fontSize="10"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="600">
              Light chaff / husk
            </text>
            <text x="390" y="207" textAnchor="middle" fill="#BCAAA4" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400" opacity="0.7">
              blown away by wind
            </text>
          </g>

          {/* === Conclusion summary boxes === */}
          <g style={{ transition: 'opacity 1.5s ease 1s', opacity: step === 4 ? 1 : 0 }}>
            {/* Method 1: Handpicking */}
            <rect x="30" y="330" width="175" height="70" rx="10" fill="rgba(76,175,80,0.08)" stroke="rgba(129,199,132,0.4)" strokeWidth="1" />
            <text x="118" y="353" textAnchor="middle" fill="#81C784" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">
              Handpicking
            </text>
            <text x="118" y="370" textAnchor="middle" fill="#A5D6A7" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Differs in colour, shape
            </text>
            <text x="118" y="383" textAnchor="middle" fill="#A5D6A7" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              or appearance
            </text>

            {/* Method 2: Sieving */}
            <rect x="220" y="330" width="175" height="70" rx="10" fill="rgba(156,39,176,0.08)" stroke="rgba(186,104,200,0.4)" strokeWidth="1" />
            <text x="308" y="353" textAnchor="middle" fill="#CE93D8" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">
              Sieving
            </text>
            <text x="308" y="370" textAnchor="middle" fill="#E1BEE7" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Differs in particle
            </text>
            <text x="308" y="383" textAnchor="middle" fill="#E1BEE7" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              size
            </text>

            {/* Method 3: Threshing */}
            <rect x="410" y="330" width="175" height="70" rx="10" fill="rgba(255,183,77,0.08)" stroke="rgba(255,183,77,0.4)" strokeWidth="1" />
            <text x="498" y="353" textAnchor="middle" fill="#FFB74D" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">
              Threshing
            </text>
            <text x="498" y="370" textAnchor="middle" fill="#FFE0B2" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Beating to separate
            </text>
            <text x="498" y="383" textAnchor="middle" fill="#FFE0B2" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              grain from stalk
            </text>

            {/* Method 4: Winnowing */}
            <rect x="600" y="330" width="175" height="70" rx="10" fill="rgba(100,181,246,0.08)" stroke="rgba(100,181,246,0.4)" strokeWidth="1" />
            <text x="688" y="353" textAnchor="middle" fill="#64B5F6" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="700">
              Winnowing
            </text>
            <text x="688" y="370" textAnchor="middle" fill="#BBDEFB" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              Wind separates light
            </text>
            <text x="688" y="383" textAnchor="middle" fill="#BBDEFB" fontSize="9"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              from heavy
            </text>
          </g>

          {/* Main conclusion */}
          <g style={{ transition: 'opacity 1.5s ease 1.3s', opacity: step === 4 ? 1 : 0 }}>
            <rect x="160" y="420" width="480" height="60" rx="12" fill="rgba(156,39,176,0.12)" stroke="#9C27B0" strokeWidth="1.5" />
            <text x="400" y="447" textAnchor="middle" fill="#CE93D8" fontSize="14"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" letterSpacing="1">
              The right method depends on the properties
            </text>
            <text x="400" y="466" textAnchor="middle" fill="#E1BEE7" fontSize="12"
              fontFamily="'Inter', system-ui, sans-serif" fontWeight="400">
              of the substances in the mixture
            </text>
          </g>

          {/* Sparkle effects */}
          {[
            { x: 140, y: 310 }, { x: 300, y: 305 },
            { x: 500, y: 310 }, { x: 660, y: 305 },
          ].map((sp, i) => (
            <g key={`sp4-${i}`} style={{ transition: `opacity 1.5s ease ${1 + i * 0.15}s`, opacity: step === 4 ? 1 : 0 }}>
              <circle cx={sp.x} cy={sp.y} r="5" fill={`url(#${filterId}-sparkle)`}>
                <animate attributeName="r" values="3;6;3" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
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
                fill={step === s ? '#9C27B0' : 'rgba(255,255,255,0.15)'}
                stroke={step >= s ? '#9C27B0' : 'rgba(255,255,255,0.1)'}
                strokeWidth={step === s ? 2 : 1}
                style={{ transition: 'all 0.5s ease' }}
              />
              {step === s && (
                <circle cx={(s - 1) * 40} cy="0" r="10" fill="none" stroke="#9C27B0" strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" values="8;13;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <text
                x={(s - 1) * 40}
                y="18"
                textAnchor="middle"
                fill={step === s ? '#9C27B0' : 'rgba(255,255,255,0.3)'}
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
          C2 SEPARATION TECHNIQUES
        </text>
      </svg>
    </div>
  );
}
