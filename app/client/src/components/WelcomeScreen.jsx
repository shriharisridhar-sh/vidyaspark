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
 * Hero → Modules → How it Works → Vision → Footer
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

      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-video-wrap">
          <video autoPlay loop muted playsInline className="hero-video">
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay" />
        </div>

        {/* Logo */}
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
            AI-powered training where Agastya's Ignators master the art of
            sparking curiosity — before they stand in front of a single child.
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

      {/* ===== MODULES SECTION ===== */}
      <section ref={modulesRef} className="modules-section">
        <div className="section-inner">
          <div className="section-eyebrow">ABL Modules</div>
          <h2 className="section-title">
            {modules.length} experiments. {modules.length} moments of wonder.
          </h2>

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

      {/* ===== HOW IT WORKS ===== */}
      <section className="how-section">
        <div className="section-inner">
          <div className="section-eyebrow">How it works</div>
          <h2 className="section-title">Learn. Practice. Ignite.</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">01</div>
              <h3 className="step-title">Learn</h3>
              <p className="step-desc">
                Walk through the ABL module tutorial. Understand the experiment,
                the materials, the key messages, and the common misconceptions
                your students will have.
              </p>
            </div>
            <div className="step">
              <div className="step-number">02</div>
              <h3 className="step-title">Practice</h3>
              <p className="step-desc">
                Enter the Tapovan — a virtual classroom with 5 AI students.
                Teach the experiment on an interactive canvas. Handle the curious,
                the skeptic, the shy, the bored, and the rote learner.
              </p>
            </div>
            <div className="step">
              <div className="step-number">03</div>
              <h3 className="step-title">Ignite</h3>
              <p className="step-desc">
                Receive feedback from an AI Mentor. See how each student performed.
                Get your Spark and Reach scores. Then practice again — unlimited times,
                24/7, from anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VISION ===== */}
      <section className="vision-section">
        <div className="section-inner">
          <p className="vision-quote">
            What if every Ignator could practice until they were <em>extraordinary</em>?
          </p>
          <p className="vision-body">
            Agastya International Foundation reaches millions of children across India
            through hands-on science education. But training 1,000 Ignators to deliver
            that magic consistently — in every classroom, every village, every time —
            is the hardest challenge in education.
          </p>
          <p className="vision-body mt-6">
            VidyaSpark solves this. An AI-powered Tapovan where Ignators practice teaching
            interactive experiments to AI students who behave like real children — curious,
            skeptical, shy, distracted. They practice until their Spark and Reach scores
            prove they're ready. Then they walk into the real classroom, confident and prepared.
          </p>
          <p className="vision-body mt-6" style={{ color: '#E65100', fontWeight: 500 }}>
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
