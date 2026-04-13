import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Play, CheckCircle2, FileText, AlertCircle, Hammer, ArrowRight } from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import styles from '../JobCards.module.css';
import SEO from '../../components/SEO';

type DashboardFilter = 'All' | 'Assigned' | 'In Progress' | 'Waiting Review' | 'Overdue';

const statusTone = (status: string) => {
  if (status === 'Assigned') return 'bg-slate-700/70 text-slate-200 border-slate-500/30';
  if (status === 'InProgress') return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  if (['Pending_Supervisor', 'Awaiting_SignOff'].includes(status)) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  return 'bg-slate-700/60 text-slate-300 border-slate-500/20';
};

const statusLabel = (status: string) => {
  if (status === 'Pending_Supervisor') return 'Pending Supervisor';
  if (status === 'Awaiting_SignOff') return 'Awaiting Sign-Off';
  return status.replace('_', ' ');
};

const ArtisanDashboard: React.FC = () => {
  const { jobCards, updateJobCard } = useJobCards();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<DashboardFilter>('All');

  const today = new Date().toISOString().split('T')[0];
  const isOverdueCard = (card: { requiredCompletionDate?: string; status: string }) =>
    Boolean(
      card.requiredCompletionDate &&
      card.requiredCompletionDate < today &&
      !['Closed', 'Pending_Supervisor', 'Awaiting_SignOff'].includes(card.status)
    );

  const myJobs = useMemo(() => {
    return jobCards.filter(card => {
      if (card.issuedTo?.toLowerCase() !== user?.name?.toLowerCase()) return false;
      return ['Assigned', 'InProgress', 'Pending_Supervisor', 'Awaiting_SignOff'].includes(card.status);
    });
  }, [jobCards, user]);

  const filteredJobs = useMemo(() => {
    return myJobs.filter(card => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        (card.ticketNumber || '').toLowerCase().includes(search) ||
        (card.plantNumber || '').toLowerCase().includes(search) ||
        (card.plantDescription || '').toLowerCase().includes(search) ||
        (card.workRequest || '').toLowerCase().includes(search);

      if (!matchesSearch) return false;

      switch (filter) {
        case 'Assigned': return card.status === 'Assigned';
        case 'In Progress': return card.status === 'InProgress';
        case 'Waiting Review': return ['Pending_Supervisor', 'Awaiting_SignOff'].includes(card.status);
        case 'Overdue': return isOverdueCard(card);
        default: return true;
      }
    });
  }, [myJobs, searchTerm, filter]);

  const handleStartWork = async (id: string) => {
    try {
      const startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await updateJobCard(id, { 
        status: 'InProgress',
        startHours: startTime
      });
      navigate(`/artisan/execute-work/${id}`);
    } catch (err: any) {
      console.error('Update failed:', err);
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const dashboardStats = {
    assigned: myJobs.filter(j => j.status === 'Assigned').length,
    inProgress: myJobs.filter(j => j.status === 'InProgress').length,
    waitingReview: myJobs.filter(j => ['Pending_Supervisor', 'Awaiting_SignOff'].includes(j.status)).length,
    overdue: myJobs.filter(j => isOverdueCard(j)).length
  };

  return (
    <div className={styles.pageContainer}>
      <SEO title="Artisan Dashboard" description="Manage your assigned maintenance tasks and work execution." />
      <section className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute left-[-90px] bottom-[-90px] h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-200 mb-3">
              <Hammer size={14} /> Workbench
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Artisan Dashboard</h1>
            <p className="text-slate-300 mt-2 max-w-2xl">Track assigned jobs, start execution faster, and keep review-ready tasks visible in one flow.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Signed In</p>
            <p className="text-white font-bold text-sm">{user?.name || 'Artisan'}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Assigned', val: dashboardStats.assigned, color: 'text-slate-100', icon: FileText, bg: 'from-slate-700/35 to-slate-900/60' },
          { label: 'In Progress', val: dashboardStats.inProgress, color: 'text-amber-300', icon: Clock, bg: 'from-amber-500/25 to-slate-900/60' },
          { label: 'Waiting Review', val: dashboardStats.waitingReview, color: 'text-emerald-300', icon: CheckCircle2, bg: 'from-emerald-500/20 to-slate-900/60' },
          { label: 'Overdue', val: dashboardStats.overdue, color: 'text-rose-300', icon: AlertCircle, bg: 'from-rose-500/25 to-slate-900/60' }
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl border border-white/10 bg-gradient-to-br ${stat.bg} p-4 sm:p-5`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">{stat.label}</p>
                <p className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.val}</p>
              </div>
              <div className={`p-2 rounded-xl bg-black/25 ${stat.color}`}>
                <stat.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:p-5 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by ticket, plant, or keyword..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/90 text-slate-100 placeholder:text-slate-500 px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['All', 'Assigned', 'In Progress', 'Waiting Review', 'Overdue'] as DashboardFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition ${
                  filter === f
                    ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-200'
                    : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredJobs.map(card => (
          <article key={card.id} className="group rounded-2xl border border-white/10 bg-slate-900/85 backdrop-blur-sm p-5 sm:p-6 flex flex-col min-h-[320px] transition hover:border-cyan-400/40 hover:shadow-[0_16px_40px_rgba(8,145,178,0.15)]">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex items-center gap-2 rounded-lg bg-slate-800/90 px-3 py-1.5 border border-white/10">
                <span className="text-xs font-black tracking-wider text-cyan-300">{card.ticketNumber}</span>
              </div>
              <span className={`badge badge-${card.priority.toLowerCase()} uppercase`}>{card.priority}</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-white text-lg font-bold leading-tight">{card.plantDescription}</h3>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{card.plantNumber}</p>
              <p className="text-slate-300 text-sm line-clamp-2 min-h-[2.75rem]">{card.workRequest || card.defect || 'No description provided'}</p>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-widest">Status</span>
                <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${statusTone(card.status)}`}>
                  {statusLabel(card.status)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-widest">Target Date</span>
                <span className={`font-bold ${isOverdueCard(card) ? 'text-rose-300' : 'text-slate-200'}`}>
                  {card.requiredCompletionDate || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-widest">Assigned Date</span>
                <span className="text-slate-300 font-medium">
                  {new Date(card.updatedAt || card.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                onClick={() => navigate(`/artisan/job-details/${card.id}`)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold flex items-center justify-center gap-2 border border-white/10 transition-all col-span-2 sm:col-span-1"
              >
                <FileText size={16} /> Details
              </button>

              {card.status === 'Assigned' && (
                <button 
                  onClick={() => handleStartWork(card.id)}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all col-span-2 sm:col-span-1"
                >
                  <Play size={16} fill="currentColor" /> Start Work
                </button>
              )}

              {card.status === 'InProgress' && (
                <button 
                  onClick={() => navigate(`/artisan/execute-work/${card.id}`)}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all col-span-2 sm:col-span-1"
                >
                  <Clock size={16} /> Continue
                </button>
              )}

              {['Pending_Supervisor', 'Awaiting_SignOff'].includes(card.status) && (
                <button 
                  onClick={() => navigate(`/artisan/job-details/${card.id}`)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 text-sm font-bold flex items-center justify-center gap-2 border border-emerald-500/20 transition-all col-span-2 sm:col-span-1"
                >
                  <CheckCircle2 size={16} /> In Review
                </button>
              )}
            </div>
          </article>
        ))}

        {filteredJobs.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-white/15 bg-slate-900/65 py-20 px-6 text-center">
            <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-slate-800/80 flex items-center justify-center">
              <AlertCircle size={30} className="text-slate-500" />
            </div>
            <h3 className="text-white text-xl font-bold">No Jobs Found</h3>
            <p className="text-slate-400 max-w-lg mx-auto mt-2">
              No jobs match your current filters. Clear some filters or search using a different keyword.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilter('All');
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-600/20 border border-cyan-500/30 px-4 py-2 text-sm font-bold text-cyan-200 hover:bg-cyan-600/30 transition"
            >
              Reset View <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisanDashboard;
