import { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { API_BASE } from '../utils/api';

/**
 * BriefingScreen — Tabbed pre-simulation briefing.
 *
 * Replaces ReadyScreen. Absorbs InfoPacketScreen content.
 * 4 tabs: Situation | Customer | Five Dimensions | Your Tools
 *
 * Design principle: "Prepare, Don't Spoil"
 *   - Reveals: 5 dimensions exist, customer evaluates across them
 *   - Withholds: weights, performance scores, which dimension matters most
 *   - Learner must DISCOVER the hidden truth through conversation
 */
export default function BriefingScreen({ onReady, moduleId }) {
  const { joinCode } = useSession();
  const [activeTab, setActiveTab] = useState(0);
  const [visitedTabs, setVisitedTabs] = useState(new Set([0]));
  const [codeCopied, setCodeCopied] = useState(false);
  const [moduleConfig, setModuleConfig] = useState(null);

  useEffect(() => {
    const id = moduleId || 'abl-p7-force-pressure';
    fetch(API_BASE + '/api/modules/config/' + id, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setModuleConfig(d.module))
      .catch(() => {});
  }, [moduleId]);

  // Build dynamic tabs from module config, or fall back to hardcoded TABS
  const activeTabs = (() => {
    if (!moduleConfig) return TABS;
    // If this is abl-p7-force-pressure, use the hardcoded detailed tabs
    if (moduleConfig.id === 'abl-p7-force-pressure') return TABS;

    // For other modules, build tabs from module config
    const dynamicTabs = [];

    // Tab 1: Mission (always present)
    const missionText = moduleConfig.briefing?.text || moduleConfig.missionBriefing || 'Prepare for the simulation.';
    const thingsToTry = moduleConfig.briefing?.thingsToTry || [];
    const customerName = moduleConfig.customerPersona?.name || moduleConfig.roles?.Agent?.label || 'your counterpart';
    const customerTitle = moduleConfig.customerPersona?.title || moduleConfig.roles?.Agent?.description || '';
    const moduleName = moduleConfig.name || 'Simulation';

    dynamicTabs.push({
      id: 'situation',
      icon: '\u26A0\uFE0F',
      shortTitle: 'Mission',
      title: moduleName,
      content: (
        <div className="space-y-4 text-text-secondary leading-relaxed text-sm">
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-1">
            <p className="text-text-primary text-sm font-semibold">
              {moduleConfig.briefing?.headline || 'Your Mission'}
            </p>
          </div>
          <p className="leading-relaxed whitespace-pre-wrap">{missionText}</p>
          {thingsToTry.length > 0 && (
            <div className="bg-surface rounded-xl p-4 border border-border">
              <div className="text-text-primary text-xs font-semibold uppercase tracking-wider mb-3">Things to Try</div>
              <div className="space-y-2">
                {thingsToTry.map((tip, i) => (
                  <div key={i} className="flex gap-2 text-sm text-text-secondary">
                    <span className="text-accent font-bold mt-0.5">{i + 1}.</span>
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    });

    // Tab 2: Customer (if roles/Agent is defined)
    if (moduleConfig.roles?.Agent) {
      dynamicTabs.push({
        id: 'customer',
        icon: '\uD83D\uDC64',
        shortTitle: 'Counterpart',
        title: 'Your Counterpart',
        content: (
          <div className="space-y-4 text-text-secondary leading-relaxed text-sm">
            <div className="bg-surface rounded-xl p-4 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent text-lg font-bold">
                  {(customerName || 'C').charAt(0)}
                </div>
                <div>
                  <div className="text-text-primary font-semibold">{customerName}{customerTitle ? `, ${customerTitle}` : ''}</div>
                  <div className="text-text-secondary text-xs">{moduleConfig.roles.Agent.description || ''}</div>
                </div>
              </div>
            </div>
            {moduleConfig.narrative?.context && (
              <p className="leading-relaxed">{moduleConfig.narrative.context}</p>
            )}
          </div>
        ),
      });
    }

    // Tab 3: Dimensions (if dimensions are defined)
    if (moduleConfig.dimensions && moduleConfig.dimensions.length > 0) {
      dynamicTabs.push({
        id: 'dimensions',
        icon: '\uD83D\uDCCA',
        shortTitle: 'Dimensions',
        title: 'The Key Dimensions',
        content: (
          <div className="space-y-4 text-text-secondary leading-relaxed text-sm">
            <p>
              In this scenario, your counterpart evaluates across <span className="text-text-primary font-semibold">{moduleConfig.dimensions.length} dimensions</span>.
              Each one is weighted differently based on what actually matters to them.
            </p>
            <div className="space-y-2.5">
              {moduleConfig.dimensions.map(dim => (
                <div key={dim.id} className="bg-surface rounded-xl p-3.5 border border-border flex items-start gap-3">
                  <span className="text-lg mt-0.5 flex-shrink-0">{dim.icon || '\uD83D\uDD39'}</span>
                  <div>
                    <div className="text-text-primary font-medium text-sm mb-0.5">{dim.name}</div>
                    <p className="text-text-secondary text-xs leading-relaxed">{dim.hint || ''}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
              <div className="text-warning text-xs font-semibold uppercase tracking-wider mb-1">The Puzzle</div>
              <p className="text-text-primary text-sm font-medium">
                Not all dimensions matter equally. Your job is to discover which ones matter most.
              </p>
            </div>
          </div>
        ),
      });
    }

    // Tab 4: Tools (always show)
    dynamicTabs.push({
      id: 'tools',
      icon: '\uD83D\uDCBC',
      shortTitle: 'Tools',
      title: 'Your Tools',
      content: (
        <div className="space-y-4 text-text-secondary leading-relaxed text-sm">
          <div className="bg-surface rounded-xl p-4 border border-warning/20">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-text-primary font-bold">Evidence Briefcase</h3>
            </div>
            <p className="mb-3">
              You have access to data and evidence you can present during the conversation.
              Each piece of evidence relates to one of the key dimensions.
            </p>
            <p className="text-text-secondary text-sm">
              Present it strategically — evidence lands better <strong>after</strong> you discover what they care about.
            </p>
          </div>
          <div className="bg-surface rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-text-primary font-bold">AI Coach</h3>
            </div>
            <p className="mb-2">
              If you selected AI coaching, your coach will offer Socratic questions between
              rounds to help you think about what you may be missing.
            </p>
          </div>
        </div>
      ),
    });

    return dynamicTabs;
  })();

  const allVisited = visitedTabs.size >= activeTabs.length;

  const handleTabChange = (index) => {
    setActiveTab(index);
    setVisitedTabs(prev => new Set([...prev, index]));
  };

  const handleNext = () => {
    if (activeTab < activeTabs.length - 1) {
      const next = activeTab + 1;
      setActiveTab(next);
      setVisitedTabs(prev => new Set([...prev, next]));
    }
  };

  const copyCode = () => {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode).then(() => {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      });
    }
  };

  const tab = activeTabs[activeTab];

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col fade-in">

        {/* Session code */}
        {joinCode && (
          <div className="flex items-center justify-between mb-4 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-3">
              <p className="text-text-secondary text-xs">Session</p>
              <span className="text-lg font-mono font-bold tracking-widest text-accent">
                {joinCode}
              </span>
            </div>
            <button
              onClick={copyCode}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-accent/20 text-accent hover:bg-accent/10 transition-all text-xs"
            >
              {codeCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-text-secondary text-xs font-mono tracking-widest uppercase mb-2">
            Briefing
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">
            Your Situation
          </h1>
          <p className="text-text-secondary text-sm">
            This is your only look at this intel. Take it in.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-4 bg-surface rounded-xl p-1 border border-border">
          {activeTabs.map((t, i) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(i)}
              className={'flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-xs font-medium transition-all relative ' + (
                i === activeTab
                  ? 'bg-accent text-white shadow-sm'
                  : visitedTabs.has(i)
                    ? 'text-accent/70 hover:bg-accent/5'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg'
              )}
            >
              <span className="text-sm">{t.icon}</span>
              <span className="hidden sm:inline">{t.shortTitle}</span>
              {visitedTabs.has(i) && i !== activeTab && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent/60" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="card flex-1 overflow-y-auto fade-in" key={tab.id}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{tab.icon}</span>
            <h2 className="text-lg font-bold text-text-primary">{tab.title}</h2>
          </div>
          {tab.content}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={() => handleTabChange(Math.max(0, activeTab - 1))}
            disabled={activeTab === 0}
            className="px-4 py-2 text-sm rounded-lg text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
          >
            Previous
          </button>

          {activeTab < activeTabs.length - 1 ? (
            <button onClick={handleNext} className="btn-primary px-6 py-2 text-sm">
              Next Section
            </button>
          ) : (
            <button
              onClick={onReady}
              className={'btn-primary px-6 py-2.5 text-sm transition-all'}
            >
              {'Continue to Strategy Check \u2192'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


/* ===== TAB DATA ===== */

const TABS = [
  {
    id: 'situation',
    icon: '\u26A0\uFE0F',
    shortTitle: 'Situation',
    title: 'The Situation',
    content: (
      <div className="space-y-4 text-text-secondary leading-relaxed text-sm">
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-1">
          <p className="text-text-primary text-sm font-semibold">
            Your goal is not to defend your price. It's to discover what this customer
            actually cares about most.
          </p>
        </div>
        <p>
          You are a <span className="text-text-primary font-semibold">senior Agastya account manager</span> in
          the Permian Basin. This is a <span className="text-accent font-semibold">contract renewal meeting</span> \u2014
          not a cold call, not a complaint session.
        </p>

        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-text-secondary text-xs uppercase tracking-wider mb-1">Account Value</div>
              <div className="text-text-primary font-bold text-lg">$40M / year</div>
            </div>
            <div>
              <div className="text-text-secondary text-xs uppercase tracking-wider mb-1">Relationship</div>
              <div className="text-text-primary font-bold text-lg">7 years</div>
            </div>
            <div>
              <div className="text-text-secondary text-xs uppercase tracking-wider mb-1">Competitor Offer</div>
              <div className="text-warning font-bold text-lg">12% lower</div>
            </div>
            <div>
              <div className="text-text-secondary text-xs uppercase tracking-wider mb-1">Renewal Deadline</div>
              <div className="text-text-primary font-bold text-lg">2 weeks</div>
            </div>
          </div>
        </div>

        <p>
          The VP of Operations called this meeting. They've received an unsolicited
          proposal from Baker Hughes and want to hear your case before making a decision.
        </p>

      </div>
    ),
  },
  {
    id: 'customer',
    icon: '\uD83D\uDC64',
    shortTitle: 'Customer',
    title: 'Your Customer',
    content: (
      <div className="space-y-4 text-text-secondary leading-relaxed text-sm">
        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold">
              VP
            </div>
            <div>
              <div className="text-text-primary font-semibold">Jordan Torres, VP of Operations</div>
              <div className="text-text-secondary text-xs">20+ years in upstream oil & gas</div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p>Runs drilling operations across <span className="text-text-primary font-medium">40+ wells</span> in the Permian Basin.</p>
            <p>Pragmatic, direct, results-oriented. Values <span className="text-text-primary font-medium">track record over promises</span>.</p>
          </div>
        </div>

        <p>
          This customer has a <span className="text-text-primary font-medium">personal working relationship</span> with
          your team. Their lead drilling engineer works closely with your Agastya crew. Last year,
          your team's quick response during a stuck pipe incident saved them 3 days of non-productive time.
        </p>

        <p>
          However, they're under pressure from their <span className="text-warning font-medium">procurement
          team</span> to cut costs. The 12% Baker Hughes offer has caught the CFO's attention.
        </p>

        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
          <div className="text-accent text-xs font-semibold uppercase tracking-wider mb-1">Keep in Mind</div>
          <p className="text-text-secondary text-sm">
            Your customer wants to be <em>convinced to stay</em>. Think of your job as giving them
            ammunition to push back on procurement \u2014 not as fighting them.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'dimensions',
    icon: '\uD83D\uDCCA',
    shortTitle: 'Dimensions',
    title: 'The Five Dimensions',
    content: (
      <div className="space-y-4 text-text-secondary leading-relaxed text-sm">
        <p>
          In oilfield services, customers evaluate providers across <span className="text-text-primary font-semibold">five
          dimensions</span> \u2014 not just price. Every customer weights these differently based on their
          operational reality.
        </p>

        <div className="space-y-2.5">
          {[
            {
              icon: '\u26A1', name: 'Reliability & Uptime',
              desc: 'Equipment failures and non-productive time cost operators millions per day. A stuck pipe or failed BHA can shut down a well for days.',
            },
            {
              icon: '\uD83D\uDEE1\uFE0F', name: 'HSE Compliance',
              desc: 'Safety incidents shut down operations, invite regulators, and can halt an entire drilling program. Zero-incident track records are hard-earned.',
            },
            {
              icon: '\uD83D\uDD27', name: 'Technical Support',
              desc: 'Complex wells need expert support on-call. When you hit a challenging formation, response quality matters more than response speed.',
            },
            {
              icon: '\u23F1\uFE0F', name: 'Service Response Time',
              desc: 'How fast you mobilize when things go wrong. In the Permian, being 30 minutes closer to the rig can make a real difference.',
            },
            {
              icon: '\uD83D\uDCB0', name: 'Pricing',
              desc: 'The most visible dimension and what procurement teams focus on. But is it always the most impactful factor in total cost of ownership?',
            },
          ].map(dim => (
            <div key={dim.name} className="bg-surface rounded-xl p-3.5 border border-border flex items-start gap-3">
              <span className="text-lg mt-0.5 flex-shrink-0">{dim.icon}</span>
              <div>
                <div className="text-text-primary font-medium text-sm mb-0.5">{dim.name}</div>
                <p className="text-text-secondary text-xs leading-relaxed">{dim.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
          <div className="text-warning text-xs font-semibold uppercase tracking-wider mb-1">The Puzzle</div>
          <p className="text-text-primary text-sm font-medium">
            One of these matters 5× more than the others. The customer won't tell you which.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'tools',
    icon: '\uD83D\uDCBC',
    shortTitle: 'Tools',
    title: 'Your Tools',
    content: (
      <div className="space-y-4 text-text-secondary leading-relaxed text-sm">
        {/* Evidence Briefcase */}
        <div className="bg-surface rounded-xl p-4 border border-warning/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-text-primary font-bold">Evidence Briefcase</h3>
          </div>
          <p className="mb-3">
            You have access to real data about Agastya's performance \u2014 uptime records,
            safety stats, response times, and more. Each piece of evidence relates to one of
            the five dimensions.
          </p>
          <p className="text-text-secondary text-sm">
            Present it strategically — evidence lands better <strong>after</strong> you discover what they care about.
          </p>
        </div>

        {/* AI Coach */}
        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <h3 className="text-text-primary font-bold">AI Coach</h3>
          </div>
          <p className="mb-2">
            If you selected AI coaching, your coach will offer Socratic questions between
            rounds to help you think about what you may be missing.
          </p>
          <p className="text-text-secondary/70 text-xs">
            The coach adapts to your skill level \u2014 more help when you're stuck, less when you're on track.
          </p>
        </div>


      </div>
    ),
  },
];
