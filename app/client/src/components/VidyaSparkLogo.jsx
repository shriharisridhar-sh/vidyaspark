/**
 * VidyaSparkLogo — VIDYA 🪷 SPARK wordmark with lotus between the words.
 * The lotus represents vidya (knowledge) blooming — deeply Indian, distinctive.
 *
 * Props:
 *   size: 'sm' | 'md' | 'lg' (default 'md')
 *   showText: boolean (default true)
 *   light: boolean — use white text (default false = orange)
 */
export default function VidyaSparkLogo({ size = 'md', showText = true, light = false }) {
  const sizes = {
    sm: { icon: 24, text: '1rem', gap: '0.3rem' },
    md: { icon: 34, text: '1.35rem', gap: '0.4rem' },
    lg: { icon: 52, text: '2rem', gap: '0.5rem' },
  };
  const s = sizes[size] || sizes.md;

  const LotusIcon = ({ w }) => (
    <svg
      width={w}
      height={w}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Soft glow behind lotus */}
      <circle cx="30" cy="28" r="22" fill="#E65100" opacity="0.08" />

      {/* Center petal (tallest) */}
      <path
        d="M30 6C30 6 22 18 22 28c0 6 3.5 10 8 10s8-4 8-10c0-10-8-22-8-22z"
        fill="#E65100"
      />
      <path
        d="M30 10C30 10 25 19 25 27c0 4.5 2.2 7.5 5 7.5s5-3 5-7.5c0-8-5-17-5-17z"
        fill="#F57C00"
        opacity="0.6"
      />

      {/* Left petal */}
      <path
        d="M18 14C18 14 8 22 8 30c0 5 3 8 7 7 4-1 7-6 8-12 1-6-5-11-5-11z"
        fill="#E65100"
        opacity="0.85"
      />
      <path
        d="M17 18C17 18 11 24 11 29c0 3.5 2 5.5 4.5 5 2.5-.8 4.5-4 5-8.5.5-4.5-3.5-7.5-3.5-7.5z"
        fill="#FF8F00"
        opacity="0.4"
      />

      {/* Right petal */}
      <path
        d="M42 14C42 14 52 22 52 30c0 5-3 8-7 7-4-1-7-6-8-12-1-6 5-11 5-11z"
        fill="#E65100"
        opacity="0.85"
      />
      <path
        d="M43 18C43 18 49 24 49 29c0 3.5-2 5.5-4.5 5-2.5-.8-4.5-4-5-8.5-.5-4.5 3.5-7.5 3.5-7.5z"
        fill="#FF8F00"
        opacity="0.4"
      />

      {/* Far left petal (smaller, more splayed) */}
      <path
        d="M12 22C12 22 3 27 3 33c0 3.5 2 5.5 5 5 3-.5 5.5-4 6-8.5.5-4.5-2-7.5-2-7.5z"
        fill="#E65100"
        opacity="0.6"
      />

      {/* Far right petal (smaller, more splayed) */}
      <path
        d="M48 22C48 22 57 27 57 33c0 3.5-2 5.5-5 5-3-.5-5.5-4-6-8.5-.5-4.5 2-7.5 2-7.5z"
        fill="#E65100"
        opacity="0.6"
      />

      {/* Center dot (pistil) */}
      <circle cx="30" cy="25" r="2.5" fill="#FFF3E0" />
      <circle cx="30" cy="25" r="1.2" fill="#FFE0B2" />

      {/* Base / calyx */}
      <path
        d="M20 38 Q25 42 30 40 Q35 42 40 38 Q35 44 30 44 Q25 44 20 38z"
        fill="#BF360C"
        opacity="0.5"
      />

      {/* Subtle spark rays */}
      <line x1="30" y1="2" x2="30" y2="4.5" stroke="#FF9800" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="10" y1="12" x2="12" y2="13.5" stroke="#FF9800" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <line x1="50" y1="12" x2="48" y2="13.5" stroke="#FF9800" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );

  if (!showText) {
    return <LotusIcon w={s.icon} />;
  }

  const textColor = light ? '#ffffff' : '#E65100';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap }}>
      <span
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          fontSize: s.text,
          letterSpacing: '0.14em',
          color: textColor,
        }}
      >
        VIDYA
      </span>
      <LotusIcon w={s.icon} />
      <span
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          fontSize: s.text,
          letterSpacing: '0.14em',
          color: textColor,
        }}
      >
        SPARK
      </span>
    </div>
  );
}
