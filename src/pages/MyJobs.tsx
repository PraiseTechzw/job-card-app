import React, { useState } from 'react';
import { useJobCards } from '../context/JobCardContext';
import { useAuth } from '../context/AuthContext';
import { Search, Clock, Play, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './JobCards.module.css';

const MyJobs: React.FC = () => {
  const { jobCards, updateJobCard, addAuditLog } = useJobCards();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering for jobs assigned specifically to this user
  const myAssignedJobs = jobCards.filter(card => 
    (card.issuedTo?.toLowerCase() === user?.name?.toLowerCase()) &&
    ['Assigned', 'InProgress', 'Completed'].includes(card.status) &&
    (card.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     card.plantDescription.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStatusUpdate = async (id: string, newStatus: 'InProgress' | 'Completed') => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'Completed') {
        updates.dateFinished = new Date().toISOString().split('T')[0];
      }

      await updateJobCard(id, updates);
      await addAuditLog({
        jobCardId: id,
        action: newStatus === 'InProgress' ? 'Work Started' : 'Work Completed',
        performedBy: user?.name || 'Unknown',
        details: `Updated status to ${newStatus}`
      });
      alert(`Job updated to ${newStatus}`);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>My Assigned Work</h1>
          <p className={styles.subtitle}>Manage your active job cards and track progress</p>
        </div>
      </header>

      <div className={styles.filtersGlass}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search my jobs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {myAssignedJobs.map(card => (
          <div key={card.id} className="glass-panel p-5 flex flex-col justify-between hover:border-blue-500/50 transition-all group">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs font-bold font-mono border border-blue-500/20">
                  {card.ticketNumber}
                </span>
                <span className={`badge badge-${card.priority.toLowerCase()}`}>
                  {card.priority}
                </span>
              </div>
              
              <h3 className="text-white font-bold text-lg mb-1">{card.plantDescription}</h3>
              <p className="text-slate-400 text-sm mb-4 flex items-center gap-1">
                <FileText size={14} /> ID: {card.plantNumber}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    card.status === 'Assigned' ? 'bg-slate-700 text-slate-300' :
                    card.status === 'InProgress' ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/20' :
                    'bg-green-600/20 text-green-400 border border-green-500/20'
                  }`}>
                    {card.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Required By</span>
                  <span className="text-slate-300 font-medium">{card.requiredCompletionDate}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => navigate(`/job-cards/view/${card.id}`)}
                className="w-full btn btn-ghost btn-sm flex items-center justify-center gap-2 border-white/5"
              >
                View Details <ChevronRight size={14} />
              </button>
              
              {card.status === 'Assigned' && (
                <button 
                  onClick={() => handleStatusUpdate(card.id, 'InProgress')}
                  className="w-full btn btn-primary py-2.5 flex items-center justify-center gap-2"
                >
                  <Play size={16} /> Start Job
                </button>
              )}

              {card.status === 'InProgress' && (
                <button 
                  onClick={() => handleStatusUpdate(card.id, 'Completed')}
                  className="w-full btn btn-success py-2.5 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> Mark as Complete
                </button>
              )}
            </div>
          </div>
        ))}

        {myAssignedJobs.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center glass-panel">
            <Clock size={48} className="text-slate-600 mb-4" />
            <h3 className="text-white font-bold text-xl">No Assigned Jobs</h3>
            <p className="text-slate-400 mt-2">You don't have any job cards assigned to you at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
