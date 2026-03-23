import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Clock, CheckCircle2, AlertTriangle, BarChart2,
  User, Calendar, Filter, ArrowLeft, Package,
  Activity, Percent, Download, FileText, Share2, Search, X
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import type { JobCard } from '../../types';
import styles from '../JobCards.module.css';
import { toast } from 'react-hot-toast';

const avgCompletionDays = (cards: JobCard[]): string => {
  const completed = cards.filter(c => c.dateFinished && c.dateRaised);
  if (!completed.length) return '—';
  const avg = completed.reduce((s, c) => {
    const ms = new Date(c.dateFinished!).getTime() - new Date(c.dateRaised).getTime();
    return s + ms / 86400000;
  }, 0) / completed.length;
  return `${Math.round(avg * 10) / 10}d`;
}

export default function SupervisorReports() {
  const { jobCards } = useJobCards();
  const navigate = useNavigate();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [plantFilter, setPlantFilter] = useState('');
  const [artisanFilter, setArtisanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    let cards = [...jobCards];
    if (dateFrom) cards = cards.filter(c => new Date(c.dateRaised) >= new Date(dateFrom));
    if (dateTo)   cards = cards.filter(c => new Date(c.dateRaised) <= new Date(dateTo));
    if (plantFilter) cards = cards.filter(c => c.plantDescription.toLowerCase().includes(plantFilter.toLowerCase()));
    if (artisanFilter) cards = cards.filter(c => (c.issuedTo || '').toLowerCase().includes(artisanFilter.toLowerCase()));
    if (statusFilter) cards = cards.filter(c => c.status === statusFilter);
    return cards;
  }, [jobCards, dateFrom, dateTo, plantFilter, artisanFilter, statusFilter]);

  const closed = filtered.filter(c => c.status === 'Closed' || c.status === 'SignedOff');
  const open = filtered.filter(c => !['Closed', 'Rejected', 'SignedOff'].includes(c.status));
  const overdue = filtered.filter(c => {
    if (!c.requiredCompletionDate) return false;
    return new Date(c.requiredCompletionDate) < new Date() && !['Closed', 'Rejected', 'Awaiting_SignOff', 'SignedOff'].includes(c.status);
  });
  const pending = filtered.filter(c => c.status === 'Pending_Supervisor');
  const awaitReview = filtered.filter(c => c.status === 'Awaiting_SignOff');

  // Priority breakdown
  const priorityBreakdown = { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<string, number>;
  filtered.forEach(c => { if (priorityBreakdown[c.priority] !== undefined) priorityBreakdown[c.priority]++; });

  // Per-artisan breakdown
  const artisanMap: Record<string, { total: number; closed: number; overdue: number }> = {};
  filtered.forEach(c => {
    if (!c.issuedTo) return;
    if (!artisanMap[c.issuedTo]) artisanMap[c.issuedTo] = { total: 0, closed: 0, overdue: 0 };
    artisanMap[c.issuedTo].total++;
    if (c.status === 'Closed' || c.status === 'SignedOff') artisanMap[c.issuedTo].closed++;
    if (overdue.some(o => o.id === c.id)) artisanMap[c.issuedTo].overdue++;
  });

  // Status flow
  const statusCounts: Record<string, number> = {};
  filtered.forEach(c => { statusCounts[c.status] = (statusCounts[c.status] || 0) + 1; });

  // Plant breakdown
  const plantMap: Record<string, number> = {};
  filtered.forEach(c => { plantMap[c.plantDescription] = (plantMap[c.plantDescription] || 0) + 1; });
  const topPlants = Object.entries(plantMap).sort(([, a], [, b]) => b - a).slice(0, 8);
  const maxPlant = topPlants[0]?.[1] || 1;

  const kpis = [
    { label: 'Total Jobs',         value: filtered.length,    color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  icon: BarChart2, trend: '+4%' },
    { label: 'Completed',          value: closed.length,      color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2, trend: '+12%' },
    { label: 'Open / Active',      value: open.length,        color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', icon: Activity, trend: '-2%' },
    { label: 'Overdue',            value: overdue.length,     color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  icon: AlertTriangle, trend: '-15%' },
    { label: 'Pending Approval',   value: pending.length,     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock, trend: 'stable' },
    { label: 'Awaiting Review',    value: awaitReview.length, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', icon: Filter, trend: '+8%' },
    { label: 'Avg. Completion',    value: avgCompletionDays(filtered), color: '#34d399', bg: 'rgba(52,211,153,0.1)', icon: Percent, trend: '-0.5d' },
    { label: 'Completion Rate',    value: filtered.length > 0 ? `${Math.round(closed.length / filtered.length * 100)}%` : '—', color: '#818cf8', bg: 'rgba(129,140,248,0.1)', icon: TrendingUp, trend: '+2.4%' },
  ];

  const priorityColors: Record<string, string> = { Critical: '#ef4444', High: '#f59e0b', Medium: '#0ea5e9', Low: '#64748b' };
  const scoreStyles: Record<string, { bg: string; text: string; bar: string }> = {
    emerald: { bg: 'rgba(16,185,129,0.1)', text: '#34d399', bar: '#22c55e' },
    amber: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', bar: '#f59e0b' },
    red: { bg: 'rgba(239,68,68,0.12)', text: '#f87171', bar: '#ef4444' },
  };

  const clearFilters = () => { setDateFrom(''); setDateTo(''); setPlantFilter(''); setArtisanFilter(''); setStatusFilter(''); };

  const handleExport = (type: 'PDF' | 'CSV') => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: `Generating ${type} report...`,
        success: `${type} report exported successfully!`,
        error: `Failed to export ${type} report.`,
      }
    );
  };

  return (
    <div className={`${styles.pageContainer} animate-in fade-in duration-500`}>
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button 
              onClick={() => navigate('/supervisor/dashboard')}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                <TrendingUp size={24} />
              </div>
              Section Reports
            </h1>
          </div>
          <p className="text-slate-400 font-medium">Strategic insights and operational performance analytics.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleExport('CSV')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm border border-white/5 hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <Download size={16} /> CSV
          </button>
          <button 
            onClick={() => handleExport('PDF')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm border border-white/5 hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <FileText size={16} /> PDF
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
            <Share2 size={16} /> Share
          </button>
        </div>
      </header>

      {/* Filter Section */}
      <section className="glass-panel p-8 border border-white/5 rounded-3xl bg-slate-900/40 backdrop-blur-xl mb-10 shadow-xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
              <Filter size={16} />
            </div>
            <h3 className="text-white text-sm font-bold uppercase tracking-widest">Report Filters</h3>
          </div>
          {(dateFrom || dateTo || plantFilter || artisanFilter || statusFilter) && (
            <button 
              onClick={clearFilters} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-all"
            >
              <X size={14} /> Clear All
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-2">
            <label className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] block ml-1">Date From</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="date" className="w-full bg-slate-950/40 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] block ml-1">Date To</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="date" className="w-full bg-slate-950/40 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] block ml-1">Plant / Asset</label>
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search plant..." className="w-full bg-slate-950/40 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" value={plantFilter} onChange={e => setPlantFilter(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] block ml-1">Artisan</label>
            <div className="relative">
              <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search artisan..." className="w-full bg-slate-950/40 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" value={artisanFilter} onChange={e => setArtisanFilter(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] block ml-1">Job Status</label>
            <select className="w-full bg-slate-950/40 border border-white/5 rounded-xl py-3 px-4 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="" className="bg-slate-900">All Statuses</option>
              {['Pending_Supervisor','Approved','Registered','Assigned','InProgress','Awaiting_SignOff','Closed','Rejected'].map(s => (
                <option key={s} value={s} className="bg-slate-900">{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {kpis.map(k => (
          <div key={k.label} className="glass-panel p-6 border border-white/5 rounded-3xl bg-slate-900/40 backdrop-blur-xl group hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: k.bg, color: k.color }}>
                <k.icon size={18} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${k.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : k.trend.startsWith('-') ? 'bg-red-500/10 text-red-400' : 'bg-slate-500/10 text-slate-400'}`}>
                {k.trend}
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{k.label}</h3>
              <div className="text-3xl font-black text-white tracking-tight">{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 mb-10">
        
        {/* Priority & Status Breakdown */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="glass-panel p-8 border border-white/5 rounded-3xl bg-slate-900/40 backdrop-blur-xl">
            <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-8 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
              Priority Distribution
            </h3>
            <div className="space-y-8">
              {Object.entries(priorityBreakdown).map(([p, count]) => (
                <div key={p} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold" style={{ color: priorityColors[p] }}>{p}</span>
                    <span className="text-slate-400 text-xs font-mono">{count} JOBS</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: filtered.length > 0 ? `${(count / filtered.length) * 100}%` : '0%',
                        backgroundColor: priorityColors[p],
                        boxShadow: `0 0 20px ${priorityColors[p]}33`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-8 border border-white/5 rounded-3xl bg-slate-900/40 backdrop-blur-xl">
            <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-8 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
              Workflow Status
            </h3>
            <div className="space-y-5">
              {Object.entries(statusCounts).slice(0, 8).map(([status, count]) => {
                const pct = filtered.length > 0 ? (count / filtered.length) * 100 : 0;
                return (
                  <div key={status} className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter w-32 truncate">{status.replace(/_/g, ' ')}</span>
                    <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500/60 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-black text-slate-300 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Most Active Plants */}
        <div className="glass-panel p-8 border border-white/5 rounded-3xl bg-slate-900/40 backdrop-blur-xl">
          <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-8 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
            Top Problem Assets
          </h3>
          {topPlants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 italic text-sm text-center">
              <Package size={32} className="mb-3 opacity-20" />
              No plant data available
            </div>
          ) : (
            <div className="space-y-6">
              {topPlants.map(([plant, count]) => (
                <div key={plant} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 truncate pr-4">{plant}</span>
                    <span className="text-xs font-black text-amber-500">{count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" 
                      style={{ width: `${(count / maxPlant) * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Artisan Efficiency Leaderboard */}
      <section className="glass-panel border border-white/5 rounded-3xl bg-slate-900/40 backdrop-blur-xl overflow-hidden mb-20 shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/20">
          <h3 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <User size={18} />
            </div>
            Artisan Efficiency Metrics
          </h3>
          <span className="text-slate-500 text-[10px] font-mono">LATEST REFRESH: {new Date().toLocaleTimeString()}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/30 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Engineering Staff</th>
                <th className="px-8 py-5 text-center">Volume</th>
                <th className="px-8 py-5 text-center">Resolved</th>
                <th className="px-8 py-5 text-center">Overdue</th>
                <th className="px-8 py-5 text-center">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {Object.entries(artisanMap)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([name, data]) => {
                  const rate = data.total > 0 ? Math.round((data.closed / data.total) * 100) : 0;
                  const healthColor = rate >= 85 ? 'emerald' : rate >= 60 ? 'amber' : 'red';
                  const palette = scoreStyles[healthColor];
                  return (
                    <tr key={name} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner"
                            style={{ backgroundColor: palette.bg, color: palette.text }}
                          >
                            {name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-slate-200 font-bold text-sm">{name}</div>
                            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Engineering Section A</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center text-slate-300 font-mono text-base font-bold">{data.total}</td>
                      <td className="px-8 py-6 text-center text-emerald-400 font-mono text-base font-bold">{data.closed}</td>
                      <td className="px-8 py-6 text-center">
                        {data.overdue > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-black border border-red-500/20">
                            <AlertTriangle size={12} /> {data.overdue}
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono text-sm">—</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-32 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5 shadow-inner">
                            <div
                              className="h-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                              style={{ width: `${rate}%`, backgroundColor: palette.bar }}
                            />
                          </div>
                          <span className="text-xs font-black" style={{ color: palette.text }}>{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {Object.keys(artisanMap).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-500 italic text-sm">
                    No performance data found for the current selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
