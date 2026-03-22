/**
 * VidyaSparkLogo — Lightbulb + VIDYASPARK wordmark.
 * The lightbulb represents vidya (knowledge) sparking to life.
 *
 * Props:
 *   size: 'sm' | 'md' | 'lg' (default 'md')
 *   showText: boolean (default true)
 *   light: boolean — use white text (default false = auto)
 */
export default function VidyaSparkLogo({ size = 'md', showText = true, light = false }) {
  const sizes = {
    sm: { icon: 20, text: '0.875rem', gap: '0.4rem' },
    md: { icon: 28, text: '1.125rem', gap: '0.5rem' },
    lg: { icon: 40, text: '1.5rem', gap: '0.6rem' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap }}>
      {/* Lightbulb SVG */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer glow */}
        <circle cx="20" cy="17" r="16" fill="#E65100" opacity="0.12" />

        {/* Bulb body */}
        <path
          d="M20 4C13.4 4 8 9.4 8 16c0 4.2 2.2 7.9 5.5 10 .3.2.5.5.5.9V30c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-3.1c0-.4.2-.7.5-.9C29.8 23.9 32 20.2 32 16c0-6.6-5.4-12-12-12z"
          fill="#E65100"
        />

        {/* Inner highlight */}
        <path
          d="M20 7c-5 0-9 4-9 9 0 3.2 1.7 6 4.2 7.6.5.3.8.8.8 1.4v2h8v-2c0-.6.3-1.1.8-1.4C27.3 22 29 19.2 29 16c0-5-4-9-9-9z"
          fill="#F57C00"
          opacity="0.5"
        />

        {/* Filament spark lines */}
        <line x1="17" y1="14" x2="20" y2="19" stroke="#FFF3E0" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="23" y1="14" x2="20" y2="19" stroke="#FFF3E0" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="20" cy="19" r="1.5" fill="#FFF3E0" />

        {/* Base rings */}
        <rect x="15" y="30" width="10" height="2" rx="1" fill="#BF360C" />
        <rect x="16" y="33" width="8" height="2" rx="1" fill="#BF360C" />
        <rect x="17" y="36" width="6" height="2" rx="1" fill="#BF360C" />

        {/* Spark rays */}
        <line x1="20" y1="0" x2="20" y2="2" stroke="#FF9800" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="6" y1="5" x2="7.5" y2="6.5" stroke="#FF9800" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="34" y1="5" x2="32.5" y2="6.5" stroke="#FF9800" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="2" y1="16" x2="4" y2="16" stroke="#FF9800" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="36" y1="16" x2="38" y2="16" stroke="#FF9800" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </svg>

      {/* Wordmark */}
      {showText && (
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: s.text,
            letterSpacing: '0.12em',
            color: light ? '#ffffff' : '#E65100',
          }}
        >
          VIDYASPARK
        </span>
      )}
    </div>
  );
}
