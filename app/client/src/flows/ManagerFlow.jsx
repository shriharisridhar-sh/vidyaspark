import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../utils/api';
import WelcomeScreen from '../components/WelcomeScreen';
import PreTapovanTutorial from '../components/PreTapovanTutorial';
import TapovanSession from '../components/TapovanSession';
import MentorPause from '../components/MentorPause';
import PostSessionAssessment from '../components/PostSessionAssessment';
import LoadingScreen from '../components/LoadingScreen';
import ReportScreen from '../components/ReportScreen';

/**
 * ManagerFlow — VidyaSpark Ignator journey.
 *
 * Flow: welcome → tutorial → tapovan → mentorPause → tapovanResume → assessment → loading → report
 *
 * When accessed at /tapovan/:moduleId, starts directly in tutorial.
 * When accessed at /, shows WelcomeScreen.
 */
export default function ManagerFlow() {
  const {
    sessionId, config, connectWs, createSession, startSession, endSession, resetSession,
  } = useSession();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { moduleId: urlModuleId } = useParams();

  const [screen, setScreen] = useState(urlModuleId ? 'tutorial' : 'welcome');
  const [moduleId, setModuleId] = useState(urlModuleId || null);
  const [moduleData, setModuleData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [mentorFeedback, setMentorFeedback] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [hasPaused, setHasPaused] = useState(false);
  // Capture sessionId at end-of-session so downstream screens (assessment, loading, report)
  // still have it even if context sessionId gets cleared during resetSession.
  const [endedSessionId, setEndedSessionId] = useState(null);

  // Load module data when moduleId is set
  useEffect(() => {
    if (!moduleId) return;
    fetch(`${API_BASE}/api/modules/${moduleId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setModuleData(d))
      .catch(err => console.warn('[ManagerFlow] Failed to load module:', err.message));
  }, [moduleId]);

  // If arriving at /tapovan/:moduleId, create session immediately
  useEffect(() => {
    if (urlModuleId && !sessionId && !isCreating && isAuthenticated) {
      setIsCreating(true);
      createSession({
        coachType: 'ai',
        coachingCadence: 'between_rounds',
        coachingInterval: 3,
        difficulty: 'medium',
        userName: user?.name,
        userId: user?.id,
        scenarioId: urlModuleId,
      }).then(() => {
        setIsCreating(false);
      }).catch(e => {
        console.warn('[ManagerFlow] Failed to create session:', e.message);
        setIsCreating(false);
      });
    }
  }, [urlModuleId, sessionId, isCreating, isAuthenticated, user, createSession]);

  // Connect WebSocket when session is created
  useEffect(() => {
    if (sessionId && screen === 'tapovan') {
      connectWs('manager');
    }
  }, [sessionId, screen, connectWs]);

  const handleExit = useCallback(() => {
    resetSession();
    setScreen('welcome');
    setReportData(null);
    setModuleId(null);
    setModuleData(null);
    setMentorFeedback(null);
    setAssessmentData(null);
    setSessionTimer(0);
    setHasPaused(false);
    setEndedSessionId(null);
    navigate('/dashboard');
  }, [resetSession, navigate]);

  // Tutorial complete → start Tapovan session
  const handleTutorialComplete = useCallback(async () => {
    if (sessionId) {
      try {
        await startSession('teaching', 'facilitated_experiment');
      } catch (e) {
        console.warn('[ManagerFlow] Failed to start session:', e.message);
      }
    }
    setScreen('tapovan');
  }, [sessionId, startSession]);

  // Mentor pause triggered (at 5 min mark)
  const handleMentorPause = useCallback((timer) => {
    setSessionTimer(timer);
    setHasPaused(true);
    setScreen('mentorPause');
  }, []);

  // Mentor feedback received → resume
  const handleMentorComplete = useCallback((feedback) => {
    setMentorFeedback(feedback);
    setScreen('tapovanResume');
  }, []);

  // Session end → assessment
  const handleSessionEnd = useCallback(async () => {
    // Capture sessionId before endSession changes state
    if (sessionId) {
      setEndedSessionId(sessionId);
      try {
        await endSession();
      } catch (e) {
        console.warn('[ManagerFlow] Failed to end session:', e.message);
      }
    }
    setScreen('assessment');
  }, [sessionId, endSession]);

  // Assessment complete → loading → report
  const handleAssessmentComplete = useCallback(async (data) => {
    setAssessmentData(data);
    setScreen('loading');
  }, []);

  // Report ready
  const handleReportReady = useCallback((data) => {
    setReportData(data);
    setScreen('report');
  }, []);

  // Practice again
  const handlePracticeAgain = useCallback(() => {
    resetSession();
    setReportData(null);
    setMentorFeedback(null);
    setAssessmentData(null);
    setSessionTimer(0);
    setHasPaused(false);
    setEndedSessionId(null);
    setScreen('tutorial');
    // Re-create session
    if (moduleId && isAuthenticated) {
      createSession({
        coachType: 'ai',
        coachingCadence: 'between_rounds',
        coachingInterval: 3,
        difficulty: 'medium',
        userName: user?.name,
        userId: user?.id,
        scenarioId: moduleId,
      }).catch(e => console.warn('[ManagerFlow] Failed to re-create session:', e.message));
    }
  }, [resetSession, moduleId, isAuthenticated, user, createSession]);

  // If no moduleId and at welcome, just show WelcomeScreen
  if (screen === 'welcome' && !urlModuleId) {
    return <WelcomeScreen onStart={() => navigate('/dashboard')} />;
  }

  return (
    <div className="relative min-h-screen bg-bg">
      {/* Exit button */}
      <button
        onClick={handleExit}
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] backdrop-blur-sm transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Exit
      </button>

      {screen === 'tutorial' && moduleData && (
        <PreTapovanTutorial
          module={moduleData}
          onComplete={handleTutorialComplete}
        />
      )}

      {(screen === 'tapovan' || screen === 'tapovanResume') && moduleData && (
        <TapovanSession
          module={moduleData}
          sessionId={sessionId}
          onMentorPause={handleMentorPause}
          onEnd={handleSessionEnd}
          mentorFeedback={mentorFeedback}
          hasPaused={hasPaused}
          initialTimer={sessionTimer}
        />
      )}

      {screen === 'mentorPause' && (
        <MentorPause
          sessionId={sessionId}
          onComplete={handleMentorComplete}
        />
      )}

      {screen === 'assessment' && (
        <PostSessionAssessment
          sessionId={endedSessionId || sessionId}
          module={moduleData}
          onComplete={handleAssessmentComplete}
        />
      )}

      {screen === 'loading' && (
        <LoadingScreen
          sessionId={endedSessionId || sessionId}
          onReportReady={handleReportReady}
          moduleId={moduleId}
        />
      )}

      {screen === 'report' && (
        <ReportScreen
          sessionId={endedSessionId || sessionId}
          reportData={reportData}
          assessmentData={assessmentData}
          moduleId={moduleId}
          onPracticeAgain={handlePracticeAgain}
          onExit={handleExit}
        />
      )}

      {/* Loading state while module data loads */}
      {!moduleData && screen !== 'welcome' && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading module...</p>
          </div>
        </div>
      )}
    </div>
  );
}
