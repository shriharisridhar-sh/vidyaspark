import { useState, useRef, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import useNegotiation from '../hooks/useNegotiation';
import { API_BASE } from '../utils/api';
import CoachingPanel from './CoachingPanel';
import InfoPacketPanel from './InfoPacketPanel';

export default function NegotiationScreen({ onEnd, moduleId }) {
  const {
    sessionId, joinCode, config, coachingMessages, exchangeCount,
    requestCoaching, resumeAfterCoaching, endSession,
  } = useSession();

  const {
    history, currentResponse, isLoading, isPaused, sendMessage, polishMessage, resumeFromPause,
    packets, mindsetState, activePacket, setActivePacket,
  } = useNegotiation();

  const [textInput, setTextInput] = useState('');
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [coachingNotification, setCoachingNotification] = useState(null);
  const [smartAssistEnabled, setSmartAssistEnabled] = useState(false);
  const [polishedMessage, setPolishedMessage] = useState(null);
  const [isPolishing, setIsPolishing] = useState(false);
  const [showPackets, setShowPackets] = useState(true);
  const [showMission, setShowMission] = useState(false);
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [missionData, setMissionData] = useState(null);
  const [moduleConfig, setModuleConfig] = useState(null);
  const scrollRef = useRef(null);

  // Load module config for dynamic labels
  useEffect(() => {
    const id = moduleId || 'price-war';
    fetch(API_BASE + '/api/modules/config/' + id, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setModuleConfig(d.module))
      .catch(() => {});
  }, [moduleId]);

  // 8-minute countdown timer
  const [secondsLeft, setSecondsLeft] = useState(8 * 60);
  const [timeExpired, setTimeExpired] = useState(false);

  useEffect(() => {
    if (timeExpired) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeExpired]);

  const timerMinutes = Math.floor(secondsLeft / 60);
  const timerSeconds = secondsLeft % 60;
  const timerDisplay = timerMinutes + ':' + String(timerSeconds).padStart(2, '0');
  const timerColor = secondsLeft > 180 ? 'text-text-secondary' : secondsLeft > 60 ? 'text-warning' : 'text-red-600';
  const timerBg = secondsLeft > 180 ? 'bg-surface' : secondsLeft > 60 ? 'bg-warning/10' : 'bg-red-500/10';
  const timerPulse = secondsLeft <= 60 && secondsLeft > 0 ? ' animate-pulse' : '';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentResponse]);

  // Fetch mission data for sidebar
  useEffect(() => {
    if (!sessionId) return;
    fetch(`${API_BASE}/api/negotiation/start/${sessionId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.briefingMission) setMissionData(data.briefingMission);
      })
      .catch(() => {});
  }, [sessionId]);

  // Show coaching notification for on-demand mode
  useEffect(() => {
    if (config?.cadence !== 'on_demand' || coachingMessages.length === 0) return;
    const latest = coachingMessages[coachingMessages.length - 1];
    setCoachingNotification(latest.content);
    const timer = setTimeout(() => setCoachingNotification(null), 8000);
    return () => clearTimeout(timer);
  }, [coachingMessages, config?.cadence]);

  const handleSend = (text) => {
    const msg = text.trim();
    if (!msg || isLoading) return;
    sendMessage(msg, activePacket);
    setTextInput('');
    setPolishedMessage(null);
    setActivePacket(null);
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (smartAssistEnabled && !polishedMessage) {
      // Smart Assist: polish first
      setIsPolishing(true);
      try {
        const polished = await polishMessage(textInput);
        if (polished) {
          setPolishedMessage(polished);
        } else {
          // Fallback: send directly if polish fails
          handleSend(textInput);
        }
      } catch {
        handleSend(textInput);
      } finally {
        setIsPolishing(false);
      }
    } else {
      handleSend(textInput);
    }
  };

  const handleResume = () => {
    resumeFromPause();
    resumeAfterCoaching();
  };

  const handleEnd = async () => {
    await endSession();
    if (onEnd) onEnd();
  };

  const showCoachingSidebar = config?.cadence === 'real_time';
  const showCoachingButton = config?.cadence === 'on_demand';

  // Role display helpers — useNegotiation uses 'user'/'assistant'
  const counterpartLabel = moduleConfig?.customerPersona?.name
    ? `${moduleConfig.customerPersona.name}, ${moduleConfig.customerPersona.title}`
    : moduleConfig?.roles?.Agent?.label || 'Counterpart';
  const counterpartInitials = moduleConfig?.customerPersona?.name
    ? moduleConfig.customerPersona.name.split(' ').map(w => w[0]).join('').substring(0, 2)
    : 'VP';
  const getRoleLabel = (role) => role === 'user' ? 'You' : counterpartLabel;
  const isManager = (role) => role === 'user';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-lg">{moduleConfig?.name || 'Simulation'}</h1>
          <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">
            Exchange {exchangeCount}
          </span>
          <span className={"text-sm font-mono font-semibold px-3 py-1 rounded-lg " + timerBg + " " + timerColor + timerPulse}>
            {timerDisplay}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {moduleConfig?.category === 'Talent Management' && (
            <button
              onClick={() => setShowTeamPanel(!showTeamPanel)}
              className={"text-sm px-3 py-1 rounded-lg transition-colors " + (
                showTeamPanel ? 'bg-blue-500/10 text-blue-400' : 'bg-surface text-text-secondary hover:text-text-primary'
              )}
              title="Your team summary"
            >
              {showTeamPanel ? 'Team ✓' : 'Team'}
            </button>
          )}
          <button
            onClick={() => setShowMission(!showMission)}
            className={"text-sm px-3 py-1 rounded-lg transition-colors " + (
              showMission ? 'bg-accent/10 text-accent' : 'bg-surface text-text-secondary hover:text-text-primary'
            )}
            title="Your mission objectives"
          >
            {showMission ? 'Intel ✓' : 'Intel'}
          </button>
          <button
            onClick={() => setShowPackets(!showPackets)}
            className={"text-sm px-3 py-1 rounded-lg transition-colors " + (
              showPackets ? 'bg-warning/10 text-warning' : 'bg-surface text-text-secondary hover:text-text-primary'
            )}
            title="Evidence Briefcase - data you can present during the conversation"
          >
            {showPackets ? 'Evidence ✓' : 'Evidence'}
          </button>
          <button
            onClick={() => { setSmartAssistEnabled(!smartAssistEnabled); setPolishedMessage(null); }}
            className={"text-sm px-3 py-1 rounded-lg transition-colors " + (
              smartAssistEnabled ? 'bg-purple-500/10 text-purple-400' : 'bg-surface text-text-secondary hover:text-text-primary'
            )}
            title="Smart Assist polishes your key points into natural messages"
          >
            {smartAssistEnabled ? 'Smart Assist On' : 'Smart Assist'}
          </button>
          {showCoachingButton && (
            <button
              onClick={requestCoaching}
              className="text-sm px-3 py-1 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            >
              Request Coaching
            </button>
          )}
          {!showEndConfirm ? (
            <button
              onClick={() => setShowEndConfirm(true)}
              className="text-sm px-3 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              End Session
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">Are you sure?</span>
              <button
                onClick={handleEnd}
                className="text-sm px-3 py-1 rounded-lg bg-red-500 text-white"
              >
                Yes, End
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="text-sm px-3 py-1 rounded-lg bg-surface text-text-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mission Sidebar */}
        {showMission && missionData && (
          <div className="w-[260px] border-r border-border flex-shrink-0 bg-accent/5 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-accent flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                  </svg>
                  Your Mission
                </h3>
                <button onClick={() => setShowMission(false)} className="text-text-secondary hover:text-text-primary text-xs">
                  Hide
                </button>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">{missionData.text}</p>
              <div className="space-y-2.5">
                <div className="text-xs font-semibold text-accent uppercase tracking-wider">Things to Try</div>
                {missionData.thingsToTry && missionData.thingsToTry.map((tip, i) => (
                  <div key={i} className="flex gap-2 text-xs text-text-secondary">
                    <span className="text-accent font-bold mt-0.5">{i + 1}.</span>
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Team Summary Sidebar (for Talent Management modules) */}
        {showTeamPanel && moduleConfig?.category === 'Talent Management' && (
          <div className="w-[280px] border-r border-border flex-shrink-0 bg-blue-500/[0.03] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-blue-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2 2 0 015 17.126c0-2.278 1.358-4.247 3.312-5.188M12 9a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
                  </svg>
                  Your Team
                </h3>
                <button onClick={() => setShowTeamPanel(false)} className="text-text-secondary hover:text-text-primary text-xs">
                  Hide
                </button>
              </div>

              {/* Priya */}
              <div className="mb-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-text-primary">Priya Sharma</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 font-medium">Promote</span>
                </div>
                <div className="text-[10px] text-text-secondary mb-1.5">Senior Consultant, 3 yrs</div>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <div><span className="text-zinc-500">Hours:</span> <span className="text-text-primary font-mono">1,840</span></div>
                  <div><span className="text-zinc-500">Score:</span> <span className="text-green-400 font-mono">9.1</span></div>
                  <div><span className="text-zinc-500">Rating:</span> <span className="text-text-primary">Exceeds</span></div>
                </div>
              </div>

              {/* Marcus */}
              <div className="mb-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-text-primary">Marcus Webb</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-medium">Retain</span>
                </div>
                <div className="text-[10px] text-text-secondary mb-1.5">Consultant, 2 yrs</div>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <div><span className="text-zinc-500">Hours:</span> <span className="text-text-primary font-mono">1,680</span></div>
                  <div><span className="text-zinc-500">Score:</span> <span className="text-yellow-400 font-mono">7.8</span></div>
                  <div><span className="text-zinc-500">Rating:</span> <span className="text-text-primary">Meets</span></div>
                </div>
              </div>

              {/* Elena */}
              <div className="mb-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-text-primary">Elena Torres</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-medium">PIP</span>
                </div>
                <div className="text-[10px] text-text-secondary mb-1.5">Senior Consultant, 4 yrs</div>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <div><span className="text-zinc-500">Hours:</span> <span className="text-red-400 font-mono">1,520</span></div>
                  <div><span className="text-zinc-500">Score:</span> <span className="text-red-400 font-mono">7.2</span></div>
                  <div><span className="text-zinc-500">Rating:</span> <span className="text-text-primary">Below</span></div>
                </div>
              </div>

              {/* David */}
              <div className="mb-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-text-primary">David Chen</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 font-medium">Promote</span>
                </div>
                <div className="text-[10px] text-text-secondary mb-1.5">Senior Consultant, 5 yrs</div>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <div><span className="text-zinc-500">Hours:</span> <span className="text-text-primary font-mono">1,920</span></div>
                  <div><span className="text-zinc-500">Score:</span> <span className="text-green-400 font-mono">9.3</span></div>
                  <div><span className="text-zinc-500">Rating:</span> <span className="text-text-primary">Exceeds</span></div>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-zinc-600 leading-relaxed">
                Target hours: 1,700/yr. One promotion slot available this cycle.
              </div>
            </div>
          </div>
        )}

        {/* Evidence Briefcase panel */}
        {showPackets && (
          <div className="w-[250px] border-r border-border flex-shrink-0">
            <InfoPacketPanel
              packets={packets}
              onUsePacket={(id) => setActivePacket(activePacket === id ? null : id)}
              activePacket={activePacket}
              disabled={isLoading || isPaused}
            />
          </div>
        )}

        {/* Conversation area */}
        <div className={showCoachingSidebar ? 'flex-1 flex flex-col' : 'flex-1 flex flex-col'}>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {history.length === 0 && (
              <div className="text-center text-text-secondary py-12">
                <p className="text-text-secondary/60 text-sm italic mb-3">
                  {moduleConfig?.category && moduleConfig.category !== 'B2B Negotiation'
                    ? 'You open the video call. ' + (moduleConfig?.customerPersona?.name || 'Your counterpart') + ' is already on the line.'
                    : 'You walk into the conference room. The VP is already seated.'}
                </p>
                <div className="inline-flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  {moduleConfig?.category && moduleConfig.category !== 'B2B Negotiation'
                    ? 'Waiting for ' + (moduleConfig?.customerPersona?.name || 'them') + ' to speak...'
                    : 'Waiting for the VP to speak...'}
                </div>
              </div>
            )}

            {history.map((msg, i) => {
              const mgr = isManager(msg.role);
              const exchangeNum = mgr ? Math.ceil((i + 1) / 2) : Math.ceil(i / 2) + (i % 2 === 0 ? 0 : 0);
              return (
                <div key={i} className={"flex " + (mgr ? 'justify-end' : 'justify-start')}>
                  <div className={"max-w-[70%] rounded-2xl px-4 py-3 shadow-sm " + (
                    mgr
                      ? 'bg-accent/15 border border-accent/20 text-text'
                      : 'bg-white/[0.03] border border-border text-text'
                  )}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={"w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold " + (
                        mgr ? 'bg-accent/20 text-accent' : 'bg-surface text-text-secondary'
                      )}>
                        {mgr ? 'Y' : counterpartInitials}
                      </div>
                      <span className={"text-xs font-medium " + (mgr ? 'text-accent' : 'text-text-secondary')}>
                        {getRoleLabel(msg.role)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            })}

            {currentResponse && (
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-white/[0.03] border border-border shadow-sm text-text">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-surface flex items-center justify-center text-[9px] font-bold text-text-secondary">{counterpartInitials}</div>
                    <span className="text-xs font-medium text-text-secondary">{counterpartLabel}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" title="Speaking..." />
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{currentResponse}</p>
                  <span className="inline-block w-1.5 h-4 bg-accent/60 animate-pulse ml-0.5 rounded-sm" />
                </div>
              </div>
            )}
          </div>

          {/* Time expired overlay */}
          {timeExpired && (
            <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="card max-w-md text-center p-8">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-2">Time is up.</h2>
                <p className="text-text-secondary text-sm mb-6">
                  Ready to wrap up this conversation?
                </p>
                <button
                  onClick={handleEnd}
                  className="btn-primary px-8 py-3 text-base font-semibold"
                >
                  End Session
                </button>
              </div>
            </div>
          )}

          {/* Pause overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="card max-w-md text-center p-8">
                <h2 className="text-xl font-semibold mb-3">Coaching Break</h2>
                <p className="text-text-secondary mb-4">
                  {coachingMessages.length > 0
                    ? 'Review the coaching feedback, then continue when ready.'
                    : config?.coachType === 'human'
                      ? 'Waiting for your coach to provide feedback...'
                      : 'Processing coaching feedback...'}
                </p>
                {coachingMessages.length > 0 && (
                  <div className="bg-surface rounded-xl p-4 mb-4 text-left">
                    <p className="text-sm">{coachingMessages[coachingMessages.length - 1].content}</p>
                  </div>
                )}
                <button
                  onClick={handleResume}
                  className="btn-primary px-6 py-2"
                >
                  {moduleConfig?.category && moduleConfig.category !== 'B2B Negotiation' ? 'Resume Conversation' : 'Resume Negotiation'}
                </button>
              </div>
            </div>
          )}

          {/* On-demand coaching notification */}
          {coachingNotification && config?.cadence === 'on_demand' && (
            <div className="mx-6 mb-2 p-3 rounded-xl bg-accent/10 border border-accent/20 text-sm text-accent animate-pulse">
              <div className="text-xs font-medium text-accent mb-1">Coach</div>
              {coachingNotification}
            </div>
          )}

          {/* Polished message preview */}
          {polishedMessage && smartAssistEnabled && (
            <div className="mx-6 mb-2 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-purple-400">Polished version</span>
                <span className="text-xs text-text-secondary">(edit if needed, then send)</span>
              </div>
              <textarea
                value={polishedMessage}
                onChange={(e) => setPolishedMessage(e.target.value)}
                className="w-full bg-transparent text-sm text-text border-none resize-none focus:outline-none leading-relaxed"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => { handleSend(polishedMessage); }}
                  disabled={isLoading}
                  className="btn-primary px-4 py-1.5 text-sm"
                >
                  {moduleConfig?.category && moduleConfig.category !== 'B2B Negotiation' ? 'Send' : 'Send to Customer'}
                </button>
                <button
                  onClick={() => setPolishedMessage(null)}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Active packet attachment card */}
          {activePacket && (() => {
            const pkt = packets.find(p => p.id === activePacket);
            return (
              <div className="mx-6 mb-2 rounded-xl border-2 border-warning/30 bg-warning/5 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-warning/10 border-b border-warning/20">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-xs font-semibold text-warning">
                      Attached Evidence
                    </span>
                  </div>
                  <button
                    onClick={() => setActivePacket(null)}
                    className="w-5 h-5 rounded-full bg-warning/20 hover:bg-warning/30 flex items-center justify-center transition-colors"
                    title="Remove attachment"
                  >
                    <svg className="w-3 h-3 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-4 py-3">
                  <div className="text-sm font-medium text-warning mb-1">{pkt?.title || activePacket}</div>
                  {pkt?.content && (
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{pkt.content.substring(0, 150)}...</p>
                  )}
                  <div className="mt-2 text-[10px] text-warning/60">
                    This evidence will be presented with your next message
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Input area */}
          <div className="border-t border-border px-6 py-4 bg-surface/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[10px] text-text-secondary font-medium">Your turn to respond</span>
              <span className="text-[10px] text-text-secondary/50">Exchange {exchangeCount}</span>
            </div>
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={smartAssistEnabled ? "Type your key points or ideas..." : exchangeCount <= 2 ? ((moduleConfig?.customerPersona?.name || 'The VP') + " is waiting for your response...") : exchangeCount <= 5 ? "What do you want to find out?" : "What's your move?"}
                disabled={isLoading || isPaused || isPolishing || !!polishedMessage || timeExpired}
                className="flex-1 bg-white/[0.04] border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 shadow-sm"
              />
              <button
                type="submit"
                disabled={!textInput.trim() || isLoading || isPaused || isPolishing || !!polishedMessage || timeExpired}
                className={"px-4 py-2 text-sm " + (smartAssistEnabled ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-xl transition-colors font-medium' : 'btn-primary')}
              >
                {isPolishing ? 'Polishing...' : smartAssistEnabled ? 'Polish' : 'Send'}
              </button>
            </form>
          </div>
        </div>

        {/* Coaching sidebar */}
        {showCoachingSidebar && (
          <div className="w-[30%] border-l border-border">
            <CoachingPanel messages={coachingMessages} cadence="real_time" />
          </div>
        )}
      </div>
    </div>
  );
}
