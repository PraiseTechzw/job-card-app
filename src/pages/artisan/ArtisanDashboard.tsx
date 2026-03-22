import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Play, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import { useAuth } from '../../context/AuthContext';
import styles from '../JobCards.module.css';
import SEO from '../../components/SEO';

const ArtisanDashboard: React.FC = () => {
  const { jobCards, updateJobCard } = useJobCards();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'All' | 'Assigned' | 'In Progress' | 'Waiting Review' | 'Overdue'>('All');

  // Filter jobs explicitly relevant to this Artisan
  const myJobs = useMemo(() => {
    return jobCards.filter(card => {
      // Must be issued to current user
      if (card.issuedTo?.toLowerCase() !== user?.name?.toLowerCase()) return false;
      
      // Keep statuses relevant to artisan
      // Notice: 'Awaiting_SignOff' might mean waiting for Originator in some workflows, 
      // but here it represents "Completed Pending Review"
      // Job Card System might have "Pending_Supervisor" or "Awaiting_SignOff"
      if (!['Assigned', 'InProgress', 'Pending_Supervisor', 'Awaiting_SignOff'].includes(card.status)) {
        // Wait, for completed jobs waiting for review, maybe they are Pending_Supervisor
        // Let's also include them if we need to show them in "Waiting Review"
      }
      return true;
    });
  }, [jobCards, user]);

  const filteredJobs = useMemo(() => {
    return myJobs.filter(card => {
      // Search matches
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        (card.ticketNumber || '').toLowerCase().includes(search) ||
        (card.plantNumber || '').toLowerCase().includes(search) ||
        (card.plantDescription || '').toLowerCase().includes(search) ||
        (card.workRequest || '').toLowerCase().includes(search);

      if (!matchesSearch) return false;

      // Filter tabs matches
      const today = new Date().toISOString().split('T')[0];
      const isOverdue = card.requiredCompletionDate && card.requiredCompletionDate < today && !['Closed', 'Pending_Supervisor', 'Awaiting_SignOff'].includes(card.status);

      switch (filter) {
        case 'Assigned': return card.status === 'Assigned';
        case 'In Progress': return card.status === 'InProgress';
        case 'Waiting Review': return ['Pending_Supervisor', 'Awaiting_SignOff'].includes(card.status);
        case 'Overdue': return isOverdue;
        default: return true;
      }
    });
  }, [myJobs, searchTerm, filter]);

  const handleStartWork = async (id: string) => {
    try {
      const startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await updateJobCard(id, { 
        status: 'InProgress',
        startHours: startTime // automatically logging start timestamp 
      });
      // Optionally navigate to Work Execution page directly
      navigate(`/artisan/execute-work/${id}`);
    } catch (err: any) {
      console.error('Update failed:', err);
      alert(err.response?.data?.error || 'Update failed');
    }
  };

  const dashboardStats = {
    assigned: myJobs.filter(j => j.status === 'Assigned').length,
    inProgress: myJobs.filter(j => j.status === 'InProgress').length,
    waitingReview: myJobs.filter(j => ['Pending_Supervisor', 'Awaiting_SignOff'].includes(j.status)).length,
    overdue: myJobs.filter(j => j.requiredCompletionDate && j.requiredCompletionDate < new Date().toISOString().split('T')[0] && !['Pending_Supervisor', 'Awaiting_SignOff', 'Closed'].includes(j.status)).length
  };

  return (
    <div className={styles.pageContainer}>
      <SEO title="Artisan Dashboard" description="Manage your assigned maintenance tasks and work execution." />
      <header className={styles.tableHeader}>
        <div>
          <h1 className={styles.pageTitle} style={{ fontSize: '2rem' }}>Artisan Dashboard</h1>
          <p className={styles['text-muted']}>Manage your workload, record execution details and submit for review</p>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Assigned', val: dashboardStats.assigned, color: 'text-slate-300', icon: FileText },
          { label: 'In Progress', val: dashboardStats.inProgress, color: 'text-amber-400', icon: Clock },
          { label: 'Waiting Review', val: dashboardStats.waitingReview, color: 'text-blue-400', icon: CheckCircle2 },
          { label: 'Overdue', val: dashboardStats.overdue, color: 'text-red-400', icon: AlertCircle }
        ].map(stat => (
          <div key={stat.label} className="glass-panel p-4 flex items-center justify-between border border-white/5 rounded-2xl bg-slate-900/50">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.val}</p>
            </div>
            <div className={`p-3 rounded-full bg-slate-800 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by job ID, plant No, or keyword..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner block"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {(['All', 'Assigned', 'In Progress', 'Waiting Review', 'Overdue'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-3 whitespace-nowrap rounded-xl text-sm font-semibold transition-all ${
                filter === f 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border-transparent'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 border-white/5 border'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map(card => (
          <div key={card.id} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
            <div className="relative glass-panel p-6 flex flex-col justify-between h-full border border-white/10 rounded-2xl bg-slate-900/90 hover:bg-slate-900 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-slate-800 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider border border-white/5 shadow-sm">
                    {card.ticketNumber}
                  </span>
                  <span className={`badge badge-${card.priority.toLowerCase()} shadow-lg uppercase`}>
                    {card.priority}
                  </span>
                </div>
                
                <h3 className="text-white font-bold text-lg mb-1 leading-tight">{card.plantDescription}</h3>
                <p className="text-slate-400 text-xs mb-4 flex items-center gap-1.5 font-medium">
                  {card.plantNumber}
                </p>

                <p className="text-slate-300 text-sm mb-5 line-clamp-2">
                  {card.workRequest || card.defect || 'No description provided'}
                </p>

                <div className="space-y-3 mb-6 bg-slate-800/30 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">Status</span>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      card.status === 'Assigned' ? 'bg-slate-700 text-slate-300' :
                      card.status === 'InProgress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {card.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">Target Date</span>
                    <span className={`font-bold ${
                      card.requiredCompletionDate && card.requiredCompletionDate < new Date().toISOString().split('T')[0] && !['Pending_Supervisor', 'Awaiting_SignOff'].includes(card.status)
                      ? 'text-red-400' 
                      : 'text-slate-300'
                    }`}>
                      {card.requiredCompletionDate || 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">Assigned Date</span>
                    <span className="text-slate-300 font-medium">
                      {new Date(card.updatedAt || card.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                <button 
                  onClick={() => navigate(`/artisan/job-details/${card.id}`)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold flex items-center justify-center gap-2 border border-white/10 transition-all col-span-2 sm:col-span-1"
                >
                  <FileText size={16} /> Details
                </button>
                
                {card.status === 'Assigned' && (
                  <button 
                    onClick={() => handleStartWork(card.id)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all col-span-2 sm:col-span-1"
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
                    className="px-4 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 text-sm font-bold flex items-center justify-center gap-2 border border-emerald-500/20 transition-all col-span-2 sm:col-span-1"
                  >
                    <CheckCircle2 size={16} /> In Review
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredJobs.length === 0 && (
          <div className="col-span-full py-24 text-center flex flex-col items-center glass-panel border-dashed border-2 border-white/5 rounded-3xl">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
              <AlertCircle size={40} className="text-slate-500" />
            </div>
            <h3 className="text-white font-bold text-2xl tracking-tight mb-2">No Jobs Found</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              There are no jobs matching your current filter criteria. Check back later or try a different filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisanDashboard;
