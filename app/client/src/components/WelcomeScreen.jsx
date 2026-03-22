import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../utils/api';
import VidyaSparkLogo from './VidyaSparkLogo';

const subjectColors = {
  Physics:     'bg-[#2196F3]/10 text-[#2196F3] border-[#2196F3]/20',
  Chemistry:   'bg-[#9C27B0]/10 text-[#9C27B0] border-[#9C27B0]/20',
  Mathematics: 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20',
  Biology:     'bg-[#4CAF50]/10 text-[#4CAF50] border-[#4CAF50]/20',
};

/**
 * WelcomeScreen — VidyaSpark landing page.
 * Hero → How It Works (interactive) → Tapovan Preview → Modules → CTA → Footer
 */
export default function WelcomeScreen({ onStart }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const modulesRef = useRef(null);

  useEffect(() => {
    fetch(API_BASE + '/api/modules/available', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setModules(d.modules || []))
      .catch(() => setModules([]));
  }, []);

  const handleCTA = () => {
    navigate(isAuthenticated ? '/dashboard' : '/login');
  };

  const scrollToModules = () => {
    modulesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="welcome-dark">

      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="hero-video-wrap">
          <video autoPlay loop muted playsInline className="hero-video">
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay" />
        </div>

        <div
          className="anim-fade-up"
          style={{ position: 'absolute', top: '2rem', left: '2.5rem', zIndex: 10, animationDelay: '0.1s' }}
        >
          <VidyaSparkLogo size="md" light />
        </div>

        <div className="hero-content">
          <div className="hero-eyebrow anim-fade-up" style={{ animationDelay: '0.2s' }}>
            THE INTELLECTUAL FOREST
          </div>
          <h1 className="hero-title anim-fade-up" style={{ animationDelay: '0.4s' }}>
            Practice the Classroom
            <br />
            Before the Classroom
          </h1>
          <p className="hero-sub anim-fade-up" style={{ animationDelay: '0.6s' }}>
            VidyaSpark is an AI-powered training platform where Agastya's Ignators
            master the art of teaching science experiments — by practicing with 5 AI students
            who behave like real children before stepping into an actual classroom.
          </p>

          <div className="flex flex-wrap gap-3 anim-fade-up" style={{ animationDelay: '0.8s' }}>
            <button className="hero-cta" onClick={handleCTA}>
              Enter the Tapovan &rarr;
            </button>
            <button
              onClick={scrollToModules}
              className="inline-flex items-center gap-3 px-9 py-4 bg-white/[0.06] border border-white/[0.1] text-white rounded-[14px] text-[15px] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.1]"
            >
              View Modules
            </button>
          </div>

          <p
            className="anim-fade-up"
            style={{ animationDelay: '1s', marginTop: '3rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}
          >
            Agastya International Foundation &times; Professor Hari Sridhar
          </p>
        </div>

        <div className="scroll-hint anim-fade-up" style={{ animationDelay: '1.2s' }}>
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ===== HOW IT WORKS — Interactive 3-Phase ===== */}
      <section className="how-section" style={{ padding: '6rem 0' }}>
        <div className="section-inner">
          <div className="section-eyebrow">How It Works</div>
          <h2 className="section-title">Learn. Practice. Ignite.</h2>
          <p style={{ textAlign: 'center', color: '#a1a1aa', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto 3rem' }}>
            Three steps to becoming an extraordinary Ignator
          </p>
          <InteractiveHowItWorks />
        </div>
      </section>

      {/* ===== TAPOVAN PREVIEW ===== */}
      <section style={{ padding: '5rem 0', background: 'linear-gradient(180deg, rgba(230,81,0,0.03) 0%, transparent 100%)' }}>
        <div className="section-inner">
          <div className="section-eyebrow">The Engine</div>
          <h2 className="section-title">The Tapovan — Your Virtual Classroom</h2>
          <p style={{ textAlign: 'center', color: '#a1a1aa', fontSize: '1.05rem', maxWidth: 640, margin: '0 auto 2.5rem' }}>
            A 65/35 split screen: interactive experiment canvas on the left, your 5 AI students on the right.
            Teach naturally — they listen, ask questions, get bored, and challenge you, just like real students.
          </p>
          <TapovanMockup />
        </div>
      </section>

      {/* ===== MODULES ===== */}
      <section ref={modulesRef} className="modules-section">
        <div className="section-inner">
          <div className="section-eyebrow">ABL Modules</div>
          <h2 className="section-title">
            Modules across Physics, Chemistry &amp; Mathematics
          </h2>
          <p style={{ textAlign: 'center', color: '#71717a', fontSize: '1rem', marginBottom: '2rem' }}>
            Each module is built from Agastya's official ABL handbooks
          </p>

          {/* Subject pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {['Physics', 'Chemistry', 'Mathematics'].map(subj => {
              const count = modules.filter(m => m.subject === subj).length;
              return (
                <span
                  key={subj}
                  className={subjectColors[subj]}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 600, border: '1px solid', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {subj}
                  <span style={{ opacity: 0.6 }}>{count > 0 ? count : ''}</span>
                </span>
              );
            })}
          </div>

          <div className="module-grid">
            {modules.map(mod => (
              <div
                key={mod.id}
                className="module-card"
                onClick={handleCTA}
                style={{ cursor: 'pointer' }}
              >
                <div className="module-card-inner">
                  <span className={'module-category ' + (subjectColors[mod.subject || mod.category] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20')}>
                    {mod.subject || mod.category || 'Science'}
                  </span>
                  <h3 className="module-name">{mod.name}</h3>
                  <p className="module-desc">{mod.description}</p>
                  <div className="module-meta">
                    <span>~{mod.estimatedMinutes || 15} min</span>
                    <span>{mod.difficulty || 'Medium'}</span>
                    <span>{mod.gradeLevel || 'Grade 6-8'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {modules.length === 0 && (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">Loading modules...</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="section-inner">
          <p style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, color: '#fafafa', marginBottom: '1rem', lineHeight: 1.3 }}>
            Ready to become an extraordinary Ignator?
          </p>
          <p style={{ color: '#71717a', fontSize: '1.05rem', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
            Practice unlimited times, 24/7, from anywhere. Your students are waiting in the Tapovan.
          </p>
          <button className="hero-cta" onClick={handleCTA} style={{ fontSize: '1.1rem' }}>
            {isAuthenticated ? 'Go to Dashboard' : 'Sign Up & Start Practicing'} &rarr;
          </button>
          <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>
            The goal: 100 million children, 1 million teachers, powered by the Intellectual Forest.
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="dark-footer">
        <div className="section-inner flex justify-between items-center">
          <span className="text-zinc-600 text-sm font-semibold">VidyaSpark &copy; 2026</span>
          <div className="flex gap-6">
            {isAuthenticated && (
              <a href="/dashboard" className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors">Dashboard</a>
            )}
            <a href="/admin" className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors">Admin</a>
          </div>
        </div>
      </footer>

    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   InteractiveHowItWorks — 3 tabs, one graphic each, only real features
   ═══════════════════════════════════════════════════════════════ */

function InteractiveHowItWorks() {
  const [activePhase, setActivePhase] = useState(0);

  const phases = [
    { label: 'Learn', icon: '📖', color: '#2196F3' },
    { label: 'Practice', icon: '🎯', color: '#E65100' },
    { label: 'Ignite', icon: '🔥', color: '#059669' },
  ];

  return (
    <div>
      {/* Phase tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
        {phases.map((phase, i) => (
          <button
            key={i}
            onClick={() => setActivePhase(i)}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '1rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: activePhase === i ? `2px solid ${phase.color}` : '2px solid rgba(255,255,255,0.08)',
              background: activePhase === i ? phase.color + '15' : 'rgba(255,255,255,0.02)',
              color: activePhase === i ? phase.color : '#71717a',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            <span>{phase.icon}</span> {phase.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '1.5rem',
        padding: '2.5rem',
        minHeight: 380,
      }}>
        {activePhase === 0 && <LearnPanel />}
        {activePhase === 1 && <PracticePanel />}
        {activePhase === 2 && <IgnitePanel />}
      </div>
    </div>
  );
}


/* ─── LEARN: 5-step tutorial walkthrough ─── */
function LearnPanel() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fafafa', marginBottom: '0.75rem' }}>
          Walk through the ABL tutorial
        </h3>
        <p style={{ fontSize: '1rem', color: '#a1a1aa', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Before you teach, you'll step through a 5-part tutorial built from Agastya's actual ABL handbooks. It covers:
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { icon: '🎯', text: 'Learning objective for the experiment' },
            { icon: '🧪', text: 'Materials needed (brick, rubber sheet, etc.)' },
            { icon: '📋', text: 'Step-by-step procedure' },
            { icon: '💡', text: 'Key messages students should learn' },
            { icon: '⚠️', text: 'Common misconceptions to watch for' },
          ].map((item, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#d4d4d8' }}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span> {item.text}
            </li>
          ))}
        </ul>
      </div>
      <svg viewBox="0 0 400 280" style={{ width: '100%' }}>
        {/* Tutorial card mockup */}
        <rect x="20" y="10" width="360" height="260" rx="16" fill="#141419" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        {/* Header */}
        <text x="40" y="45" fill="#2196F3" fontSize="10" fontWeight="700" letterSpacing="0.08em">P7.1 · PHYSICS</text>
        <text x="40" y="68" fill="#fafafa" fontSize="15" fontWeight="700">Force & Pressure</text>
        {/* Step progress dots */}
        {[0, 1, 2, 3, 4].map(i => (
          <circle key={i} cx={40 + i * 24} cy="90" r={i === 2 ? 6 : 4} fill={i <= 2 ? '#2196F3' : 'rgba(255,255,255,0.1)'} />
        ))}
        <text x="170" y="94" fill="#71717a" fontSize="9">Step 3 of 5</text>
        {/* Content card */}
        <rect x="35" y="110" width="330" height="140" rx="10" fill="rgba(33,150,243,0.06)" stroke="rgba(33,150,243,0.15)" strokeWidth="1" />
        <text x="55" y="138" fill="#2196F3" fontSize="11" fontWeight="700">📋 Procedure</text>
        {['1. Place brick flat on rubber sheet', '2. Observe the depression', '3. Turn brick on its side (medium face)', '4. Turn brick on its end (smallest face)', '5. Compare all three depressions'].map((line, i) => (
          <text key={i} x="55" y={160 + i * 17} fill="#a1a1aa" fontSize="10">{line}</text>
        ))}
      </svg>
    </div>
  );
}


/* ─── PRACTICE: Tapovan session with canvas + AI students ─── */
function PracticePanel() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fafafa', marginBottom: '0.75rem' }}>
          Teach in the Tapovan
        </h3>
        <p style={{ fontSize: '1rem', color: '#a1a1aa', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          The Tapovan is your virtual classroom. An interactive experiment canvas fills the left side.
          On the right, 5 AI students with distinct personalities listen and respond:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { name: 'Priya', trait: 'Curious — asks genuine "why" questions', color: '#4FC3F7' },
            { name: 'Ravi', trait: 'Skeptic — demands proof', color: '#FF7043' },
            { name: 'Lakshmi', trait: 'Shy — knows answers, won\'t speak unless called', color: '#CE93D8' },
            { name: 'Arjun', trait: 'Disengaged — bored, needs to be won back', color: '#78909C' },
            { name: 'Meena', trait: 'Rote learner — repeats without understanding', color: '#FFD54F' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.9rem' }}>
                <span style={{ color: s.color, fontWeight: 600 }}>{s.name}</span>
                <span style={{ color: '#71717a' }}> — {s.trait}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
      <svg viewBox="0 0 400 280" style={{ width: '100%' }}>
        {/* Tapovan frame */}
        <rect x="5" y="5" width="390" height="270" rx="12" fill="#0a0a0a" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {/* Header */}
        <rect x="5" y="5" width="390" height="30" rx="12" fill="#141419" />
        <rect x="5" y="22" width="390" height="13" fill="#141419" />
        <text x="18" y="25" fill="#E65100" fontSize="8" fontWeight="700">P7.1</text>
        <text x="48" y="25" fill="#fafafa" fontSize="9" fontWeight="600">Force & Pressure</text>
        <text x="340" y="25" fill="#71717a" fontSize="8" fontFamily="monospace">05:32</text>
        {/* Canvas left side */}
        <rect x="10" y="40" width="245" height="230" rx="6" fill="#0f0f18" />
        <rect x="70" y="90" width="12" height="80" rx="3" fill="#8B6914" />
        <rect x="195" y="90" width="12" height="80" rx="3" fill="#8B6914" />
        <path d="M78 130 Q140 160 199 130" stroke="#E65100" strokeWidth="2" fill="none" />
        <rect x="110" y="110" width="50" height="25" rx="3" fill="#C62828" opacity="0.7" />
        {/* Step dots */}
        {[0, 1, 2, 3].map(i => (
          <circle key={i} cx={110 + i * 18} cy="240" r={i === 1 ? 4 : 2.5} fill={i === 1 ? '#E65100' : 'rgba(255,255,255,0.1)'} />
        ))}
        {/* Divider */}
        <line x1="260" y1="40" x2="260" y2="270" stroke="rgba(255,255,255,0.06)" />
        {/* Chat panel */}
        <rect x="268" y="46" width="118" height="60" rx="6" fill="rgba(255,255,255,0.02)" />
        <text x="276" y="60" fill="#71717a" fontSize="6" fontWeight="600" letterSpacing="0.08em">STUDENTS</text>
        {[
          { n: 'Priya', c: '#4FC3F7', d: '#22c55e' },
          { n: 'Ravi', c: '#FF7043', d: '#22c55e' },
          { n: 'Lakshmi', c: '#CE93D8', d: '#ef4444' },
          { n: 'Arjun', c: '#78909C', d: '#ef4444' },
          { n: 'Meena', c: '#FFD54F', d: '#eab308' },
        ].map((s, i) => (
          <g key={i}>
            <circle cx="278" cy={72 + i * 9} r="2" fill={s.d} />
            <text x="284" y={75 + i * 9} fill={s.c} fontSize="7" fontWeight="600">{s.n}</text>
          </g>
        ))}
        {/* Chat bubbles */}
        <rect x="268" y="115" width="110" height="20" rx="6" fill="rgba(230,81,0,0.1)" />
        <text x="274" y="129" fill="#E65100" fontSize="6.5">[You] What happens when I...</text>
        <rect x="268" y="140" width="118" height="20" rx="6" fill="rgba(255,255,255,0.03)" />
        <text x="274" y="154" fill="#4FC3F7" fontSize="6.5">[Priya] The sheet will bend!</text>
        <rect x="268" y="165" width="118" height="20" rx="6" fill="rgba(255,255,255,0.03)" />
        <text x="274" y="179" fill="#FF7043" fontSize="6.5">[Ravi] But how much depends...</text>
        {/* Input */}
        <rect x="268" y="248" width="118" height="18" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <text x="276" y="260" fill="#52525b" fontSize="6">What would you say?</text>
      </svg>
    </div>
  );
}


/* ─── IGNITE: End session → assessment → report ─── */
function IgnitePanel() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fafafa', marginBottom: '0.75rem' }}>
          See how your students did
        </h3>
        <p style={{ fontSize: '1rem', color: '#a1a1aa', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          When you end the session, AI generates a 10-question comprehension test based on
          what you taught. Each student's score reflects how well YOUR teaching reached them:
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { icon: '📝', text: '10 questions across recall, understanding & application' },
            { icon: '📊', text: 'Per-student scores tied to engagement' },
            { icon: '✅', text: 'Concepts you taught well, with evidence' },
            { icon: '🔧', text: 'Concepts to improve, with specific suggestions' },
            { icon: '🔄', text: 'Practice again — unlimited, 24/7' },
          ].map((item, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#d4d4d8' }}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span> {item.text}
            </li>
          ))}
        </ul>
      </div>
      <svg viewBox="0 0 400 280" style={{ width: '100%' }}>
        {/* Report card */}
        <rect x="20" y="10" width="360" height="260" rx="16" fill="#141419" stroke="rgba(5,150,105,0.15)" strokeWidth="1" />
        {/* Score */}
        <text x="200" y="50" fill="#059669" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="0.1em">SESSION REPORT</text>
        <text x="200" y="100" fill="#059669" fontSize="48" fontWeight="800" textAnchor="middle">72</text>
        <text x="200" y="120" fill="#71717a" fontSize="10" textAnchor="middle">Class Average: 7.2 / 10</text>
        {/* Student scores */}
        {[
          { n: 'Priya', s: '9/10', c: '#4FC3F7' },
          { n: 'Ravi', s: '8/10', c: '#FF7043' },
          { n: 'Lakshmi', s: '4/10', c: '#CE93D8' },
          { n: 'Arjun', s: '6/10', c: '#78909C' },
          { n: 'Meena', s: '9/10', c: '#FFD54F' },
        ].map((s, i) => (
          <g key={i}>
            <rect x={38 + i * 68} y="140" width="58" height="40" rx="8" fill="rgba(255,255,255,0.03)" />
            <text x={67 + i * 68} y="158" fill={s.c} fontSize="9" fontWeight="700" textAnchor="middle">{s.n}</text>
            <text x={67 + i * 68} y="173" fill="#a1a1aa" fontSize="10" textAnchor="middle">{s.s}</text>
          </g>
        ))}
        {/* Coaching hint */}
        <rect x="35" y="195" width="330" height="55" rx="10" fill="rgba(5,150,105,0.06)" stroke="rgba(5,150,105,0.15)" strokeWidth="1" />
        <text x="50" y="215" fill="#059669" fontSize="9" fontWeight="700">Coaching Insight:</text>
        <text x="50" y="232" fill="#a1a1aa" fontSize="9">Lakshmi scored low — she was never called on directly.</text>
        <text x="50" y="244" fill="#d4d4d8" fontSize="9">Try: "Lakshmi, what do you think happened to the paper?"</text>
      </svg>
    </div>
  );
}


/* ─── TAPOVAN MOCKUP ─── */
function TapovanMockup() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <svg viewBox="0 0 800 420" style={{ width: '100%', borderRadius: '1rem', overflow: 'hidden' }}>
        {/* Frame */}
        <rect x="0" y="0" width="800" height="420" rx="16" fill="#0a0a0a" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
        {/* Header bar */}
        <rect x="0" y="0" width="800" height="44" rx="16" fill="#141419" />
        <rect x="0" y="28" width="800" height="16" fill="#141419" />
        <text x="20" y="28" fill="#E65100" fontSize="10" fontWeight="700" letterSpacing="0.05em">P7.1</text>
        <text x="55" y="28" fill="#fafafa" fontSize="11" fontWeight="600">Force & Pressure</text>
        <text x="680" y="28" fill="#71717a" fontSize="10">Step 2/4</text>
        <text x="740" y="28" fill="#71717a" fontSize="10" fontFamily="monospace">05:32</text>
        {/* Canvas area (left 65%) */}
        <rect x="8" y="50" width="508" height="362" rx="8" fill="#0f0f18" />
        {/* Mini experiment */}
        <rect x="120" y="140" width="16" height="140" rx="4" fill="#8B6914" />
        <rect x="380" y="140" width="16" height="140" rx="4" fill="#8B6914" />
        <path d="M132 200 Q258 260 388 200" stroke="#E65100" strokeWidth="3" fill="none" />
        <rect x="218" y="165" width="80" height="40" rx="5" fill="#C62828" opacity="0.7" />
        <text x="258" y="190" fill="white" fontSize="10" textAnchor="middle" fontWeight="600">BRICK</text>
        {/* Annotation */}
        <text x="258" y="310" fill="#E65100" fontSize="10" textAnchor="middle">Pressure = Force / Area</text>
        {/* Step dots */}
        {[0, 1, 2, 3].map(i => (
          <circle key={i} cx={220 + i * 26} cy="380" r={i === 1 ? 5 : 3} fill={i === 1 ? '#E65100' : 'rgba(255,255,255,0.1)'} />
        ))}
        {/* Divider */}
        <line x1="524" y1="50" x2="524" y2="412" stroke="rgba(255,255,255,0.06)" />
        {/* Chat panel (right 35%) */}
        {/* Student roster */}
        <rect x="532" y="56" width="260" height="100" rx="8" fill="rgba(255,255,255,0.02)" />
        <text x="544" y="74" fill="#71717a" fontSize="8" fontWeight="600" letterSpacing="0.1em">STUDENTS</text>
        {[
          { name: 'Priya', color: '#4FC3F7', dot: '#22c55e' },
          { name: 'Ravi', color: '#FF7043', dot: '#22c55e' },
          { name: 'Lakshmi', color: '#CE93D8', dot: '#ef4444' },
          { name: 'Arjun', color: '#78909C', dot: '#ef4444' },
          { name: 'Meena', color: '#FFD54F', dot: '#eab308' },
        ].map((s, i) => (
          <g key={i}>
            <circle cx="546" cy={92 + i * 14} r="3" fill={s.dot} />
            <text x="556" y={95 + i * 14} fill={s.color} fontSize="9" fontWeight="600">{s.name}</text>
          </g>
        ))}
        {/* Chat messages */}
        <rect x="540" y="168" width="200" height="28" rx="8" fill="rgba(230,81,0,0.1)" />
        <text x="550" y="186" fill="#E65100" fontSize="8">[You] What happens when I...</text>
        <rect x="540" y="202" width="220" height="28" rx="8" fill="rgba(255,255,255,0.03)" />
        <text x="550" y="220" fill="#4FC3F7" fontSize="8">[Priya] The sheet will bend!</text>
        <rect x="540" y="236" width="230" height="28" rx="8" fill="rgba(255,255,255,0.03)" />
        <text x="550" y="254" fill="#FF7043" fontSize="8">[Ravi] But how much depends on...</text>
        {/* Input area */}
        <rect x="532" y="380" width="260" height="28" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <text x="544" y="398" fill="#52525b" fontSize="9">What would you say to the class?</text>
      </svg>
    </div>
  );
}
