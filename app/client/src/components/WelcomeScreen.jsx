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
   InteractiveHowItWorks — 3-tab panel with radio-button sub-steps
   ═══════════════════════════════════════════════════════════════ */

function InteractiveHowItWorks() {
  const [activePhase, setActivePhase] = useState(0); // 0=Learn, 1=Practice, 2=Ignite
  const [activeStep, setActiveStep] = useState(0);   // 0,1,2 within each phase

  // Reset step when phase changes
  useEffect(() => { setActiveStep(0); }, [activePhase]);

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
        minHeight: 420,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {activePhase === 0 && <LearnPanel step={activeStep} setStep={setActiveStep} />}
        {activePhase === 1 && <PracticePanel step={activeStep} setStep={setActiveStep} />}
        {activePhase === 2 && <IgnitePanel step={activeStep} setStep={setActiveStep} />}
      </div>
    </div>
  );
}


/* ─── Radio step selector ─── */
function StepSelector({ steps, active, onSelect, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
      {steps.map((label, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '0.75rem',
            border: active === i ? `1.5px solid ${color}40` : '1.5px solid transparent',
            background: active === i ? color + '10' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            textAlign: 'left',
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            border: `2px solid ${active === i ? color : '#52525b'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.25s ease',
          }}>
            {active === i && (
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            )}
          </div>
          <span style={{
            fontSize: '0.95rem',
            fontWeight: active === i ? 600 : 400,
            color: active === i ? '#fafafa' : '#a1a1aa',
            transition: 'all 0.25s ease',
          }}>
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}


/* ─── LEARN Panel ─── */
function LearnPanel({ step, setStep }) {
  const steps = ['Read the ABL handbook', 'Watch the experiment steps', 'Understand the 5 students'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
      <div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fafafa', marginBottom: '0.5rem' }}>Learn the Module</h3>
        <p style={{ fontSize: '0.9rem', color: '#71717a', marginBottom: '1.5rem' }}>Before teaching, understand what you'll teach</p>
        <StepSelector steps={steps} active={step} onSelect={setStep} color="#2196F3" />
      </div>
      <div style={{ position: 'relative', minHeight: 320 }}>
        {step === 0 && <LearnHandbook />}
        {step === 1 && <LearnSteps />}
        {step === 2 && <LearnStudents />}
      </div>
    </div>
  );
}

function LearnHandbook() {
  return (
    <svg viewBox="0 0 480 300" style={{ width: '100%', maxHeight: 320 }}>
      {/* Handbook */}
      <rect x="40" y="20" width="400" height="260" rx="12" fill="#1a1a2e" stroke="#2196F3" strokeWidth="1.5" opacity="0.8" />
      <rect x="240" y="20" width="2" height="260" fill="#2196F3" opacity="0.3" />
      {/* Left page - title */}
      <text x="140" y="60" fill="#fafafa" fontSize="16" fontWeight="700" textAnchor="middle">ABL Handbook</text>
      <text x="140" y="82" fill="#2196F3" fontSize="11" textAnchor="middle">Activity-Based Learning</text>
      {/* Left page - content lines */}
      {[100, 118, 136, 154, 172, 190].map((y, i) => (
        <rect key={i} x="70" y={y} width={140 - i * 10} height="6" rx="3" fill="rgba(255,255,255,0.08)" />
      ))}
      {/* Right page - key concepts */}
      <text x="360" y="60" fill="#fafafa" fontSize="14" fontWeight="600" textAnchor="middle">Key Concepts</text>
      {['Force = Push or Pull', 'Pressure = F / A', 'Area affects pressure'].map((text, i) => (
        <g key={i}>
          <rect x="270" y={82 + i * 42} width="180" height="32" rx="8" fill="#2196F3" opacity="0.1" />
          <circle cx="286" cy={98 + i * 42} r="4" fill="#2196F3" />
          <text x="298" y={102 + i * 42} fill="#a1a1aa" fontSize="11">{text}</text>
        </g>
      ))}
      {/* Materials list */}
      <text x="360" y="220" fill="#71717a" fontSize="10" textAnchor="middle">Materials: Brick, rubber sheet, supports</text>
    </svg>
  );
}

function LearnSteps() {
  return (
    <svg viewBox="0 0 480 300" style={{ width: '100%', maxHeight: 320 }}>
      {/* Canvas mockup */}
      <rect x="20" y="10" width="440" height="240" rx="12" fill="#0f0f1a" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      {/* Supports */}
      <rect x="100" y="100" width="20" height="120" rx="4" fill="#8B6914" />
      <rect x="360" y="100" width="20" height="120" rx="4" fill="#8B6914" />
      {/* Rubber sheet */}
      <path d="M110 150 Q240 200 370 150" stroke="#E65100" strokeWidth="3" fill="none" />
      {/* Brick */}
      <rect x="200" y="130" width="80" height="40" rx="4" fill="#C62828" opacity="0.8" />
      <text x="240" y="155" fill="white" fontSize="10" textAnchor="middle" fontWeight="600">BRICK</text>
      {/* Step dots */}
      <g transform="translate(160, 270)">
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            <circle cx={i * 48} cy="0" r={i === 1 ? 8 : 5} fill={i === 1 ? '#E65100' : 'rgba(255,255,255,0.15)'} />
            {i === 1 && <text x={i * 48} y="20" fill="#E65100" fontSize="9" textAnchor="middle">Step 2</text>}
          </g>
        ))}
      </g>
      {/* Label */}
      <text x="240" y="295" fill="#71717a" fontSize="11" textAnchor="middle">Interactive canvas advances with your teaching</text>
    </svg>
  );
}

function LearnStudents() {
  const students = [
    { name: 'Priya', trait: 'Curious', color: '#4FC3F7', emoji: '🙋‍♀️' },
    { name: 'Ravi', trait: 'Skeptic', color: '#FF7043', emoji: '🤨' },
    { name: 'Lakshmi', trait: 'Shy', color: '#CE93D8', emoji: '😶' },
    { name: 'Arjun', trait: 'Disengaged', color: '#78909C', emoji: '😴' },
    { name: 'Meena', trait: 'Rote Learner', color: '#FFD54F', emoji: '📝' },
  ];
  return (
    <svg viewBox="0 0 480 300" style={{ width: '100%', maxHeight: 320 }}>
      {students.map((s, i) => {
        const x = 48 + i * 88;
        return (
          <g key={i}>
            <rect x={x} y="30" width="76" height="230" rx="12" fill="rgba(255,255,255,0.03)" stroke={s.color + '40'} strokeWidth="1" />
            <text x={x + 38} y="70" fontSize="28" textAnchor="middle">{s.emoji}</text>
            <text x={x + 38} y="100" fill={s.color} fontSize="13" fontWeight="700" textAnchor="middle">{s.name}</text>
            <text x={x + 38} y="118" fill="#71717a" fontSize="10" textAnchor="middle">{s.trait}</text>
            {/* Personality bar */}
            <rect x={x + 12} y="135" width="52" height="4" rx="2" fill="rgba(255,255,255,0.06)" />
            <rect x={x + 12} y="135" width={52 * [0.9, 0.7, 0.3, 0.2, 0.6][i]} height="4" rx="2" fill={s.color} opacity="0.6" />
            {/* Description lines */}
            {[155, 170, 185].map((y, li) => (
              <rect key={li} x={x + 10} y={y} width={56 - li * 5} height="4" rx="2" fill="rgba(255,255,255,0.05)" />
            ))}
          </g>
        );
      })}
      <text x="240" y="290" fill="#71717a" fontSize="11" textAnchor="middle">5 AI students with unique personalities</text>
    </svg>
  );
}


/* ─── PRACTICE Panel ─── */
function PracticePanel({ step, setStep }) {
  const steps = ['Teach on the interactive canvas', 'AI students respond naturally', 'Track real-time engagement'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
      <div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fafafa', marginBottom: '0.5rem' }}>Practice Teaching</h3>
        <p style={{ fontSize: '0.9rem', color: '#71717a', marginBottom: '1.5rem' }}>Enter the Tapovan with 5 AI students</p>
        <StepSelector steps={steps} active={step} onSelect={setStep} color="#E65100" />
      </div>
      <div style={{ position: 'relative', minHeight: 320 }}>
        {step === 0 && <PracticeCanvas />}
        {step === 1 && <PracticeChat />}
        {step === 2 && <PracticeEngagement />}
      </div>
    </div>
  );
}

function PracticeCanvas() {
  return (
    <svg viewBox="0 0 480 300" style={{ width: '100%', maxHeight: 320 }}>
      {/* Split screen frame */}
      <rect x="10" y="10" width="460" height="280" rx="12" fill="#0a0a0a" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      {/* Divider at 65% */}
      <line x1="310" y1="10" x2="310" y2="290" stroke="rgba(255,255,255,0.08)" />
      {/* Left - Canvas area (highlighted) */}
      <rect x="15" y="15" width="290" height="270" rx="8" fill="rgba(230,81,0,0.05)" stroke="#E65100" strokeWidth="1.5" strokeDasharray="4 4" />
      <text x="160" y="45" fill="#E65100" fontSize="11" fontWeight="700" textAnchor="middle">EXPERIMENT CANVAS</text>
      {/* Mini experiment */}
      <rect x="60" y="100" width="12" height="80" rx="3" fill="#8B6914" />
      <rect x="228" y="100" width="12" height="80" rx="3" fill="#8B6914" />
      <path d="M68 140 Q150 175 232 140" stroke="#E65100" strokeWidth="2.5" fill="none" />
      <rect x="120" y="115" width="60" height="30" rx="4" fill="#C62828" opacity="0.7" />
      {/* Right - Chat panel */}
      <rect x="315" y="30" width="150" height="16" rx="4" fill="rgba(255,255,255,0.04)" />
      <rect x="315" y="52" width="150" height="16" rx="4" fill="rgba(255,255,255,0.04)" />
      {[80, 110, 140, 170].map((y, i) => (
        <g key={i}>
          <rect x={i % 2 === 0 ? 315 : 355} y={y} width={i % 2 === 0 ? 120 : 110} height="22" rx="6" fill={i % 2 === 0 ? 'rgba(230,81,0,0.1)' : 'rgba(255,255,255,0.03)'} />
        </g>
      ))}
      {/* Label */}
      <text x="240" y="295" fill="#71717a" fontSize="10" textAnchor="middle">65% canvas (left) + 35% classroom panel (right)</text>
    </svg>
  );
}

function PracticeChat() {
  const messages = [
    { speaker: 'You', text: 'What do you think will happen if I place this brick on the rubber sheet?', color: '#E65100', align: 'right' },
    { speaker: 'Priya', text: 'Ooh! I think the sheet will bend down because the brick is heavy!', color: '#4FC3F7', align: 'left' },
    { speaker: 'Ravi', text: 'But HOW MUCH it bends depends on the area, right? Prove it.', color: '#FF7043', align: 'left' },
    { speaker: 'Arjun', text: '...can I go to lunch?', color: '#78909C', align: 'left' },
  ];
  return (
    <svg viewBox="0 0 480 300" style={{ width: '100%', maxHeight: 320 }}>
      <rect x="20" y="10" width="440" height="280" rx="12" fill="#121218" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      {messages.map((msg, i) => {
        const y = 35 + i * 65;
        const isUser = msg.align === 'right';
        return (
          <g key={i}>
            <rect
              x={isUser ? 180 : 40} y={y}
              width={isUser ? 270 : 300} height="50"
              rx="12" fill={isUser ? 'rgba(230,81,0,0.1)' : 'rgba(255,255,255,0.03)'}
              stroke={msg.color + '30'} strokeWidth="1"
            />
            <text x={isUser ? 195 : 55} y={y + 18} fill={msg.color} fontSize="10" fontWeight="700">[{msg.speaker}]</text>
            <text x={isUser ? 195 : 55} y={y + 36} fill="#a1a1aa" fontSize="10.5">
              {msg.text.length > 50 ? msg.text.substring(0, 50) + '...' : msg.text}
            </text>
          </g>
        );
      })}
      <text x="240" y="290" fill="#71717a" fontSize="10" textAnchor="middle">Students respond based on their unique personalities</text>
    </svg>
  );
}

function PracticeEngagement() {
  const students = [
    { name: 'Priya', engagement: 0.9, dot: '#22c55e', status: 'Actively asking questions' },
    { name: 'Ravi', engagement: 0.7, dot: '#22c55e', status: 'Demanding proof' },
    { name: 'Lakshmi', engagement: 0.2, dot: '#ef4444', status: 'Silent — not called on' },
    { name: 'Arjun', engagement: 0.15, dot: '#ef4444', status: 'Drawing on desk' },
    { name: 'Meena', engagement: 0.5, dot: '#eab308', status: 'Memorizing your words' },
  ];
  return (
    <svg viewBox="0 0 480 300" style={{ width: '100%', maxHeight: 320 }}>
      <rect x="20" y="10" width="440" height="280" rx="12" fill="#121218" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <text x="240" y="42" fill="#fafafa" fontSize="13" fontWeight="700" textAnchor="middle">Student Engagement</text>
      {students.map((s, i) => {
        const y = 60 + i * 46;
        return (
          <g key={i}>
            <circle cx="50" cy={y + 12} r="5" fill={s.dot} />
            <text x="68" y={y + 16} fill="#fafafa" fontSize="12" fontWeight="600">{s.name}</text>
            {/* Bar */}
            <rect x="145" y={y + 6} width="200" height="12" rx="6" fill="rgba(255,255,255,0.06)" />
            <rect x="145" y={y + 6} width={200 * s.engagement} height="12" rx="6" fill={s.dot} opacity="0.6" />
            <text x="355" y={y + 16} fill="#71717a" fontSize="10">{s.status}</text>
          </g>
        );
      })}
      <text x="240" y="290" fill="#71717a" fontSize="10" textAnchor="middle">Real-time engagement tracking for every student</text>
    </svg>
  );
}


/* ─── IGNITE Panel ─── */
function IgnitePanel({ step, setStep }) {
  const steps = ['Students take a 10-question test', 'See your VidyaSpark score', 'Get coaching to improve'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
      <div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fafafa', marginBottom: '0.5rem' }}>Get Your Score</h3>
        <p style={{ fontSize: '0.9rem', color: '#71717a', marginBottom: '1.5rem' }}>See the impact of your teaching</p>
        <StepSelector steps={steps} active={step} onSelect={setStep} color="#059669" />
      </div>
      <div style={{ position: 'relative', minHeight: 320 }}>
        {step === 0 && <IgniteTest />}
        {step === 1 && <IgniteScore />}
        {step === 2 && <IgniteCoaching />}
      </div>
    </div>
  );
}

function IgniteTest() {
  const types = [
    { label: 'Recall', count: 3, color: '#60a5fa' },
    { label: 'Understanding', count: 3, color: '#a78bfa' },
    { label: 'Application', count: 2, color: '#fbbf24' },
    { label: 'Analysis', count: 2, color: '#f87171' },
  ];
  return (
    <svg viewBox="0 0 480 300" style={{ width: '100%', maxHeight: 320 }}>
      <text x="240" y="30" fill="#fafafa" fontSize="14" fontWeight="700" textAnchor="middle">10-Question Comprehension Test</text>
      <text x="240" y="48" fill="#71717a" fontSize="10" textAnchor="middle">Across Bloom's Taxonomy levels</text>
      {/* Question type cards */}
      {types.map((t, i) => {
        const x = 40 + i * 110;
        return (
          <g key={i}>
            <rect x={x} y="65" width="100" height="100" rx="10" fill={t.color + '10'} stroke={t.color + '40'} strokeWidth="1" />
            <text x={x + 50} y="100" fill={t.color} fontSize="28" fontWeight="800" textAnchor="middle">{t.count}</text>
            <text x={x + 50} y="120" fill={t.color} fontSize="10" fontWeight="600" textAnchor="middle">{t.label}</text>
            <text x={x + 50} y="140" fill="#71717a" fontSize="9" textAnchor="middle">questions</text>
          </g>
        );
      })}
      {/* Student scoring preview */}
      <text x="240" y="195" fill="#fafafa" fontSize="12" fontWeight="600" textAnchor="middle">Each student scores based on YOUR teaching</text>
      {['Priya 8/10', 'Ravi 7/10', 'Lakshmi 0/10', 'Arjun 3/10', 'Meena 5/10'].map((s, i) => (
        <g key={i}>
          <rect x={40 + i * 88} y="210" width="78" height="28" rx="8" fill="rgba(255,255,255,0.04)" />
          <text x={79 + i * 88} y="228" fill="#a1a1aa" fontSize="10" textAnchor="middle">{s}</text>
        </g>
      ))}
      <text x="240" y="270" fill="#ef4444" fontSize="10" textAnchor="middle">Lakshmi scored 0 — she was never called on!</text>
      <text x="240" y="290" fill="#71717a" fontSize="10" textAnchor="middle">Scores reflect actual engagement, not random chance</text>
    </svg>
  );
}

function IgniteScore() {
  return (
    <svg viewBox="0 0 480 300" style={{ width: '100%', maxHeight: 320 }}>
      <rect x="100" y="20" width="280" height="180" rx="16" fill="rgba(230,81,0,0.05)" stroke="rgba(230,81,0,0.2)" strokeWidth="1.5" />
      <text x="240" y="55" fill="#E65100" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="0.1em">YOUR VIDYASPARK SCORE</text>
      <text x="240" y="120" fill="#E65100" fontSize="64" fontWeight="800" textAnchor="middle">56</text>
      <text x="240" y="145" fill="#a1a1aa" fontSize="13" textAnchor="middle">out of 100</text>
      {/* Formula */}
      <text x="240" y="180" fill="#71717a" fontSize="10" textAnchor="middle">70% student achievement (46%) + 30% confidence (80%)</text>
      {/* Breakdown */}
      <rect x="60" y="220" width="170" height="50" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <text x="145" y="240" fill="#71717a" fontSize="9" textAnchor="middle">STUDENT ACHIEVEMENT</text>
      <text x="145" y="260" fill="#fafafa" fontSize="16" fontWeight="700" textAnchor="middle">23/50 = 46%</text>
      <rect x="250" y="220" width="170" height="50" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <text x="335" y="240" fill="#71717a" fontSize="9" textAnchor="middle">YOUR CONFIDENCE</text>
      <text x="335" y="260" fill="#fafafa" fontSize="16" fontWeight="700" textAnchor="middle">4/5 = 80%</text>
      <text x="240" y="295" fill="#71717a" fontSize="10" textAnchor="middle">Weighted composite of your students' results and your self-assessment</text>
    </svg>
  );
}

function IgniteCoaching() {
  return (
    <svg viewBox="0 0 480 300" style={{ width: '100%', maxHeight: 320 }}>
      <text x="240" y="28" fill="#fafafa" fontSize="14" fontWeight="700" textAnchor="middle">Personalized Coaching</text>
      {/* Coaching pair 1 */}
      <rect x="30" y="45" width="420" height="70" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <text x="50" y="68" fill="#ef4444" fontSize="10" fontWeight="700">Instead of:</text>
      <text x="120" y="68" fill="#a1a1aa" fontSize="10.5">Only calling on Priya (who always volunteers)</text>
      <text x="50" y="95" fill="#22c55e" fontSize="10" fontWeight="700">Try this:</text>
      <text x="105" y="95" fill="#fafafa" fontSize="10.5" fontWeight="500">Directly invite Lakshmi: "Lakshmi, what do you notice?"</text>
      {/* Coaching pair 2 */}
      <rect x="30" y="125" width="420" height="70" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <text x="50" y="148" fill="#ef4444" fontSize="10" fontWeight="700">Instead of:</text>
      <text x="120" y="148" fill="#a1a1aa" fontSize="10.5">Ignoring Arjun's disengagement</text>
      <text x="50" y="175" fill="#22c55e" fontSize="10" fontWeight="700">Try this:</text>
      <text x="105" y="175" fill="#fafafa" fontSize="10.5" fontWeight="500">Give him a hands-on role: "Arjun, hold the rubber sheet"</text>
      {/* Going forward */}
      <rect x="30" y="210" width="420" height="60" rx="10" fill="rgba(5,150,105,0.06)" stroke="rgba(5,150,105,0.2)" strokeWidth="1" />
      <text x="240" y="232" fill="#059669" fontSize="11" fontWeight="700" textAnchor="middle">Going Forward</text>
      <text x="240" y="252" fill="#a1a1aa" fontSize="10.5" textAnchor="middle">Ask more, tell less. Create moments of wonder where students discover answers themselves.</text>
      <text x="240" y="290" fill="#71717a" fontSize="10" textAnchor="middle">Then practice again — unlimited times, 24/7, from anywhere</text>
    </svg>
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
