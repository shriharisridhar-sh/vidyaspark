import { useState } from 'react';

const ICONS = {
  chart: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  clock: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  shield: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  alert: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  wrench: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17l-5.654 5.654a2.121 2.121 0 01-3-3l5.654-5.654m0 0L3.75 8.25M11.42 15.17L15.75 19.5a2.121 2.121 0 003-3l-4.33-4.33m0 0L20.25 6.75l-5.654-5.654a2.121 2.121 0 00-3 3l5.654 5.654" />
    </svg>
  ),
  users: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2 2 0 015 17.126c0-2.278 1.358-4.247 3.312-5.188M12 9a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
    </svg>
  ),
  zap: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  truck: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-1.036-.84-1.875-1.875-1.875H17.25M16.5 7.5V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v7.875" />
    </svg>
  ),
  calculator: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
    </svg>
  ),
  'trending-up': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
};

const DIM_COLORS = {
  reliability: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', icon: 'text-green-400', tag: 'bg-green-500/15 text-green-400' },
  hse: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: 'text-amber-400', tag: 'bg-amber-500/15 text-amber-400' },
  technical: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'text-blue-400', tag: 'bg-blue-500/15 text-blue-400' },
  service: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', icon: 'text-purple-400', tag: 'bg-purple-500/15 text-purple-400' },
  value: { bg: 'bg-accent/5', border: 'border-accent/30', text: 'text-accent', icon: 'text-accent', tag: 'bg-accent/10 text-accent' },
};

const DIM_LABELS = {
  reliability: 'Reliability',
  hse: 'HSE Safety',
  technical: 'Technical',
  service: 'Service',
  value: 'Total Value',
};

export default function InfoPacketPanel({ packets, onUsePacket, activePacket, disabled }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filterDim, setFilterDim] = useState('');

  if (!packets || packets.length === 0) return null;

  const dims = [...new Set(packets.map(p => p.dimension))];
  const filtered = filterDim ? packets.filter(p => p.dimension === filterDim) : packets;
  const usedCount = packets.filter(p => p.used).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-surface/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
            <h2 className="text-sm font-semibold text-text-primary">Evidence Briefcase</h2>
          </div>
          <span className="text-xs text-text-secondary">{usedCount}/{packets.length} used</span>
        </div>
      </div>

      {/* Dimension filter chips */}
      <div className="px-3 py-2 flex flex-wrap gap-1 border-b border-border/50 flex-shrink-0">
        <button
          onClick={() => setFilterDim('')}
          className={'px-2 py-0.5 rounded text-[10px] font-medium transition-all ' + (
            !filterDim ? 'bg-accent text-white' : 'bg-surface text-text-secondary border border-border'
          )}
        >All</button>
        {dims.map(dim => (
          <button
            key={dim}
            onClick={() => setFilterDim(dim === filterDim ? '' : dim)}
            className={'px-2 py-0.5 rounded text-[10px] font-medium transition-all ' + (
              filterDim === dim
                ? (DIM_COLORS[dim]?.tag || 'bg-accent text-white')
                : 'bg-surface text-text-secondary border border-border'
            )}
          >{DIM_LABELS[dim] || dim}</button>
        ))}
      </div>

      {/* Packet cards */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {filtered.map(packet => {
          const colors = DIM_COLORS[packet.dimension] || DIM_COLORS.value;
          const isExpanded = expandedId === packet.id;
          const isActive = activePacket === packet.id;
          const isLocked = !packet.unlocked;

          return (
            <div
              key={packet.id}
              className={'rounded-xl border transition-all ' + (
                isActive ? 'border-accent bg-accent/5 ring-1 ring-accent/30' :
                packet.used ? 'border-border/50 bg-surface/50 opacity-60' :
                isLocked ? 'border-border/30 bg-surface/30 opacity-50' :
                colors.border + ' ' + colors.bg
              )}
            >
              <div
                onClick={() => !isLocked && setExpandedId(isExpanded ? null : packet.id)}
                className={'px-3 py-2 cursor-pointer ' + (isLocked ? 'cursor-not-allowed' : '')}
              >
                <div className="flex items-start gap-2">
                  <div className={'mt-0.5 flex-shrink-0 ' + (isLocked ? 'text-text-secondary/30' : colors.icon)}>
                    {ICONS[packet.icon] || ICONS.chart}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={'text-xs font-semibold ' + (isLocked ? 'text-text-secondary/50' : colors.text)}>
                        {packet.title}
                      </span>
                      {packet.tier === 2 && (
                        <span className="text-[9px] px-1 py-0 rounded bg-amber-500/15 text-amber-400 font-medium">
                          {isLocked ? 'LOCKED' : 'T2'}
                        </span>
                      )}
                      {packet.used && (
                        <span className="text-[9px] px-1 py-0 rounded bg-border text-text-secondary font-medium">USED</span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-secondary mt-0.5">{packet.subtitle}</p>
                  </div>
                  {!isLocked && !packet.used && (
                    <svg className={'w-3.5 h-3.5 text-text-secondary/40 transition-transform ' + (isExpanded ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && !isLocked && (
                <div className="px-3 pb-3 pt-1 border-t border-border/30">
                  <p className="text-xs text-text-primary leading-relaxed mb-2">{packet.content}</p>
                  {!packet.used && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onUsePacket(packet.id); }}
                      disabled={disabled}
                      className={'w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' + (
                        isActive
                          ? 'bg-accent text-white'
                          : 'bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-40'
                      )}
                    >
                      {isActive ? 'Ready to Deploy (send your message)' : 'Attach to Next Message'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.some(p => !p.unlocked) && (
          <div className="text-center py-4 text-xs text-text-secondary/50">
            <p>Tier 2 packets unlock as you discover what the customer values.</p>
            <p className="mt-1">Keep asking discovery questions!</p>
          </div>
        )}
      </div>
    </div>
  );
}
