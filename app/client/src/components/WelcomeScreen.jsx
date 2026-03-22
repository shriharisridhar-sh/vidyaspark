import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * WelcomeScreen — Cinematic hero landing page for VidyaSpark.
 * Full-viewport video background with a single clear CTA.
 */
export default function WelcomeScreen({ onStart }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    navigate(isAuthenticated ? '/dashboard' : '/login');
  };

  return (
    <div className="welcome-dark">
      <section className="hero-section">

        {/* Video background */}
        <div className="hero-video-wrap">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="hero-video"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay" />
        </div>

        {/* Logo */}
        <div
          className="anim-fade-up"
          style={{
            position: 'absolute',
            top: '2rem',
            left: '2.5rem',
            zIndex: 10,
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: '1.125rem',
            letterSpacing: '0.15em',
            color: '#ffffff',
            animationDelay: '0.1s',
          }}
        >
          VIDYASPARK
        </div>

        {/* Hero content */}
        <div className="hero-content">
          <div
            className="hero-eyebrow anim-fade-up"
            style={{ animationDelay: '0.2s' }}
          >
            THE INTELLECTUAL FOREST
          </div>

          <h1
            className="hero-title anim-fade-up"
            style={{ animationDelay: '0.4s' }}
          >
            Practice the Classroom
            <br />
            Before the Classroom
          </h1>

          <p
            className="hero-sub anim-fade-up"
            style={{ animationDelay: '0.6s' }}
          >
            AI-powered training where Agastya's Ignators master the art of
            sparking curiosity — before they stand in front of a single child.
          </p>

          <div
            className="anim-fade-up"
            style={{ animationDelay: '0.8s' }}
          >
            <button className="hero-cta" onClick={handleCTA}>
              Enter the Tapovan &rarr;
            </button>
          </div>

          <p
            className="anim-fade-up"
            style={{
              animationDelay: '1s',
              marginTop: '3rem',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.04em',
            }}
          >
            Agastya International Foundation &times; Professor Hari Sridhar
          </p>
        </div>
      </section>
    </div>
  );
}
