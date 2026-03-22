import React, { useState } from 'react';
import { useJobCards } from '../context/JobCardContext';
import { useAuth } from '../context/AuthContext';
import { Search, Clock, Play, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './JobCards.module.css';

const MyJobs: React.FC = () => {
  const { jobCards, updateJobCard } = useJobCards();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering for jobs assigned specifically to this user
  const myAssignedJobs = jobCards.filter(card => {
    const search = searchTerm.toLowerCase();
    const isTargetStatus = ['Assigned', 'InProgress', 'Awaiting_SignOff'].includes(card.status);
    const isIssuedToMe = card.issuedTo?.toLowerCase() === user?.name?.toLowerCase();
    const matchesSearch = 
      (card.ticketNumber || '').toLowerCase().includes(search) ||
      (card.plantDescription || '').toLowerCase().includes(search);
    
    return isTargetStatus && isIssuedToMe && matchesSearch;
  });

  const handleStatusUpdate = async (id: string, newStatus: 'InProgress' | 'Awaiting_SignOff') => {
    try {
      const updates: any = { 
        status: newStatus,
        performedBy: user?.name || 'Unknown',
        userRole: user?.role
      };
      
      if (newStatus === 'Awaiting_SignOff') {
        updates.dateFinished = new Date().toISOString().split('T')[0];
      }

      await updateJobCard(id, updates);
      alert(newStatus === 'Awaiting_SignOff' ? 'Job submitted for sign-off!' : `Job updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Update failed:', err);
      alert(err.response?.data?.error || 'Update failed. Check workflow constraints.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.tableHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Assigned Work</h1>
          <p className={styles['text-muted']}>Manage your active job cards and track progress</p>
        </div>
      </header>

      <div className={styles.filtersGlass} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2.5rem', padding: '1.5rem', borderRadius: '16px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search my active jobs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {myAssignedJobs.map(card => (
          <div key={card.id} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative glass-panel p-6 flex flex-col justify-between h-full border border-white/5 group-hover:border-white/10 transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border border-blue-500/20 uppercase">
                    {card.ticketNumber}
                  </span>
                  <span className={`badge badge-${card.priority.toLowerCase()} shadow-lg`}>
                    {card.priority}
                  </span>
                </div>
                
                <h3 className="text-white font-bold text-xl mb-2 group-hover:text-blue-400 transition-colors">{card.plantDescription}</h3>
                <p className="text-slate-400 text-xs mb-6 flex items-center gap-1.5 font-medium">
                  <FileText size={12} className="text-slate-500" /> Plant ID: {card.plantNumber}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">Status</span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                      card.status === 'Assigned' ? 'bg-slate-700 text-slate-300' :
                      card.status === 'InProgress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {card.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">Target Date</span>
                    <span className="text-slate-300 font-bold">{card.requiredCompletionDate}</span>
                  </div>
                  {card.status === 'InProgress' && (
                    <div className="pt-2">
                      <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold mb-1">
                        <span>Progress</span>
                        <span className="animate-pulse text-amber-500">Active</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] w-1/2 rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => navigate(`/job-cards/view/${card.id}`)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold flex items-center justify-center gap-2 border border-white/5 transition-all"
                >
                  View Documentation <ChevronRight size={16} />
                </button>
                
                {card.status === 'Assigned' && (
                  <button 
                    onClick={() => handleStatusUpdate(card.id, 'InProgress')}
                    className="w-full px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-1"
                  >
                    <Play size={18} fill="currentColor" /> Start Work Order
                  </button>
                )}

                {card.status === 'InProgress' && (
                  <button 
                    onClick={() => navigate(`/job-cards/view/${card.id}?tab=back&edit=true`)}
                    className="w-full px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-1"
                  >
                    <CheckCircle2 size={18} /> Fill Feedback & Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {myAssignedJobs.length === 0 && (
          <div className="col-span-full py-32 text-center flex flex-col items-center glass-panel border-dashed border-2 border-white/5">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
              <Clock size={40} className="text-slate-600" />
            </div>
            <h3 className="text-white font-bold text-2xl tracking-tight">Zero Active Assignments</h3>
            <p className="text-slate-400 mt-2 max-w-sm mx-auto">You've cleared your queue. New maintenance tasks will appear here once assigned by the supervisor.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
