import React, { useState, useMemo } from 'react';
import { Search, History, MessageSquare, Briefcase } from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import { useAuth } from '../../context/AuthContext';
import styles from '../JobCards.module.css';

const MyHistory: React.FC = () => {
  const { jobCards } = useJobCards();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'All' | 'This week' | 'This month' | 'Completed' | 'Returned'>('All');

  // Filter jobs relevant to history for this Artisan
  const historyJobs = useMemo(() => {
    return jobCards.filter(card => {
      // Must be issued to current user
      if (card.issuedTo?.toLowerCase() !== user?.name?.toLowerCase()) return false;
      
      // Keep statuses relevant to history
      if (!['Pending_Supervisor', 'Pending_HOD', 'Approved', 'Awaiting_SignOff', 'SignedOff', 'Closed', 'Rejected'].includes(card.status)) {
         return false;
      }
      return true;
    });
  }, [jobCards, user]);

  const filteredHistory = useMemo(() => {
    return historyJobs.filter(card => {
      // Search logic
      const matchesSearch = 
        card.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.plantNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.plantDescription.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Filter logic
      const finishedDate = card.dateFinished ? new Date(card.dateFinished) : null;
      const today = new Date();
      const thisWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      switch (filter) {
        case 'This week': return finishedDate && finishedDate >= thisWeekStart;
        case 'This month': return finishedDate && finishedDate >= thisMonthStart;
        case 'Completed': return ['SignedOff', 'Closed'].includes(card.status);
        case 'Returned': return card.status === 'Rejected'; // Assuming 'Rejected' means returned in this context
        default: return true;
      }
    });
  }, [historyJobs, searchTerm, filter]);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.tableHeader}>
        <div>
          <h1 className={styles.pageTitle} style={{ fontSize: '2rem' }}>My Work History</h1>
          <p className={styles['text-muted']}>Review your past jobs and supervisor feedback</p>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search history by ID, plant or keyword..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner block"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {(['All', 'This week', 'This month', 'Completed', 'Returned'] as const).map(f => (
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

      {/* Timeline List */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
           <div className="col-span-full py-24 text-center flex flex-col items-center glass-panel border-dashed border-2 border-white/5 rounded-3xl">
           <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
             <History size={40} className="text-slate-500" />
           </div>
           <h3 className="text-white font-bold text-2xl tracking-tight mb-2">No History Found</h3>
           <p className="text-slate-400 max-w-md mx-auto">
             You don't have any past jobs matching the selected criteria.
           </p>
         </div>
        ) : (
          filteredHistory.map(card => (
            <div key={card.id} className="glass-panel p-5 md:p-6 border border-white/10 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:bg-slate-900 transition-colors group">
              
              <div className="flex-1 flex gap-4 w-full">
                <div className={`p-4 rounded-full h-14 w-14 shrink-0 flex items-center justify-center ${
                  ['SignedOff', 'Closed'].includes(card.status) ? 'bg-emerald-500/10 text-emerald-400' :
                  card.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  <Briefcase size={22} />
                </div>
                <div className="w-full">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <span className="bg-slate-800 text-blue-400 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider border border-white/5 w-max mb-2 md:mb-0">
                      {card.ticketNumber}
                    </span>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      ['SignedOff', 'Closed'].includes(card.status) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                      card.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {card.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <h3 className="text-white font-bold text-lg mb-1">{card.plantDescription}</h3>
                  <p className="text-slate-400 text-sm mb-3">Plant: {card.plantNumber}</p>
                  
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5 text-sm">
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Completion Date</span>
                      <span className="text-slate-300 font-medium">{card.dateFinished || 'N/A'}</span>
                    </div>
                    {card.supervisorComments && (
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><MessageSquare size={10}/> Feedback</span>
                        <span className="text-amber-300/90 italic font-medium">{card.supervisorComments}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyHistory;
