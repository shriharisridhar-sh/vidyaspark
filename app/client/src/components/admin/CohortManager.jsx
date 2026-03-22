import { useState, useEffect } from 'react';
import { API_BASE } from '../../utils/api';

export default function CohortManager() {
  const [cohorts, setCohorts] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedModules, setSelectedModules] = useState([]);
  const [creating, setCreating] = useState(false);
  const [createdLink, setCreatedLink] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch(API_BASE + '/api/cohorts', { credentials: 'include' }).then(r => r.json()).catch(() => ({ cohorts: [] })),
      fetch(API_BASE + '/api/modules/available', { credentials: 'include' }).then(r => r.json()).catch(() => ({ modules: [] })),
    ]).then(([cohortData, moduleData]) => {
      setCohorts(cohortData.cohorts || []);
      setAvailableModules(moduleData.modules || []);
      setLoading(false);
    });
  };

  useEffect(fetchData, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch(API_BASE + '/api/cohorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newName.trim(),
          description: newDesc.trim(),
          moduleIds: selectedModules,
        }),
      });
      if (!res.ok) throw new Error('Failed to create cohort');
      const data = await res.json();
      const link = window.location.origin + '/join/' + data.cohort.code;
      setCreatedLink(link);
      setNewName('');
      setNewDesc('');
      setSelectedModules([]);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (code) => {
    const link = window.location.origin + '/join/' + code;
    navigator.clipboard.writeText(link);
  };

  const exportCsv = (cohort) => {
    const members = cohort.members || [];
    if (!members.length) return;
    const header = 'Name,Email,Modules Completed,Last Active';
    const rows = members.map(m =>
      [m.name, m.email, m.modulesCompleted || 0, m.lastActive || ''].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cohort.name.replace(/\s+/g, '_') + '_members.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-text-secondary text-sm">Loading cohorts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Cohorts</h2>
          <p className="text-text-secondary text-sm">{cohorts.length} cohort{cohorts.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); setCreatedLink(''); }}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-accent hover:bg-accent/90 transition-colors"
        >
          {showCreate ? 'Cancel' : '+ Create Cohort'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card">
          <h3 className="text-text-primary font-bold mb-4">New Cohort</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Cohort name"
              required
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-text-primary placeholder-zinc-600 outline-none focus:border-accent/40 transition-colors"
            />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-text-primary placeholder-zinc-600 outline-none focus:border-accent/40 transition-colors resize-none"
            />
            <div>
              <p className="text-text-secondary text-xs mb-2 font-medium">Modules</p>
              <div className="space-y-1.5">
                {availableModules.map(mod => (
                  <label key={mod.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white/[0.03] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(mod.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedModules(prev => [...prev, mod.id]);
                        else setSelectedModules(prev => prev.filter(id => id !== mod.id));
                      }}
                      className="accent-orange-600"
                    />
                    <span className="text-text-primary text-sm">{mod.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/90 disabled:opacity-40 transition-colors"
            >
              {creating ? 'Creating...' : 'Create Cohort'}
            </button>
          </form>

          {createdLink && (
            <div className="mt-4 p-3 rounded-xl bg-accent/10 border border-accent/20">
              <p className="text-accent text-xs font-medium mb-1">Cohort created! Share this link:</p>
              <div className="flex items-center gap-2">
                <code className="text-text-primary text-xs flex-1 truncate">{createdLink}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(createdLink)}
                  className="text-accent text-xs font-medium hover:underline shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cohort list */}
      {cohorts.map(cohort => (
        <CohortCard key={cohort.id || cohort.code} cohort={cohort} onCopyLink={copyLink} onExportCsv={exportCsv} />
      ))}

      {cohorts.length === 0 && !showCreate && (
        <div className="card text-center py-8">
          <p className="text-text-secondary text-sm">No cohorts yet. Create one to get started.</p>
        </div>
      )}
    </div>
  );
}

function CohortCard({ cohort, onCopyLink, onExportCsv }) {
  const [expanded, setExpanded] = useState(false);
  const members = cohort.members || [];

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-3 text-left flex-1">
          <div>
            <h3 className="text-text-primary font-bold">{cohort.name}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
              <span className="font-mono bg-white/[0.06] px-2 py-0.5 rounded">{cohort.code}</span>
              <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCopyLink(cohort.code)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-accent bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors"
          >
            Copy Link
          </button>
          <svg
            className={"w-4 h-4 text-text-secondary transition-transform cursor-pointer " + (expanded ? 'rotate-180' : '')}
            onClick={() => setExpanded(!expanded)}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-border/50">
          {members.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-text-secondary font-medium text-xs">Name</th>
                      <th className="text-left py-2 text-text-secondary font-medium text-xs">Email</th>
                      <th className="text-center py-2 text-text-secondary font-medium text-xs">Completed</th>
                      <th className="text-right py-2 text-text-secondary font-medium text-xs">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, i) => (
                      <tr key={i} className="border-b border-border/30">
                        <td className="py-2 text-text-primary text-xs">{m.name}</td>
                        <td className="py-2 text-text-secondary text-xs">{m.email}</td>
                        <td className="py-2 text-center text-text-primary text-xs font-mono">{m.modulesCompleted || 0}</td>
                        <td className="py-2 text-right text-text-secondary text-xs">{m.lastActive ? new Date(m.lastActive).toLocaleDateString() : '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => onExportCsv(cohort)}
                className="mt-3 text-accent text-xs font-medium hover:underline"
              >
                Export CSV
              </button>
            </>
          ) : (
            <p className="text-text-secondary text-sm text-center py-4">No members yet</p>
          )}
        </div>
      )}
    </div>
  );
}
