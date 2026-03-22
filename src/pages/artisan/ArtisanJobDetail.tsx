import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, FileText, Calendar, Clock, AlertTriangle, Paperclip } from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import styles from '../JobCards.module.css';

const ArtisanJobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobCards, updateJobCard } = useJobCards();

  const job = jobCards.find(j => j.id === id);

  if (!job) {
    return (
      <div className={styles.pageContainer}>
        <div className="glass-panel p-8 text-center rounded-2xl border border-red-500/20 bg-red-500/10">
          <h2 className="text-xl font-bold text-red-400 mb-2">Job Not Found</h2>
          <p className="text-slate-400 mb-6">The job card you are looking for does not exist or has been removed.</p>
          <button 
            onClick={() => navigate('/artisan/dashboard')}
            className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleStartWork = async () => {
    if (job.status !== 'Assigned') return;
    
    try {
      const startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await updateJobCard(job.id, { 
        status: 'InProgress',
        startHours: startTime
      });
      navigate(`/artisan/execute-work/${job.id}`);
    } catch (err: any) {
      console.error('Failed to start work:', err);
      alert(err.response?.data?.error || 'Failed to start work');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={`${styles.tableHeader} flex items-center gap-4`}>
        <button 
          onClick={() => navigate('/artisan/dashboard')}
          className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-colors border border-white/5"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={styles.pageTitle} style={{ fontSize: '1.75rem' }}>Job Card Details</h1>
          <p className={styles['text-muted']}>{job.ticketNumber} - {job.plantDescription}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Main Job Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/80">
            <h3 className="text-white text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
              <FileText size={20} className="text-blue-400" />
              Request Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Job Title / Defect</span>
                <p className="text-slate-200 font-medium text-base">{job.defect || job.workRequest || 'N/A'}</p>
              </div>
              
              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Full Description</span>
                <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded-lg border border-white/5 break-words">
                  {job.workRequest || 'No additional description provided.'}
                </p>
              </div>
              
              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Supervisor Instructions</span>
                <p className="text-amber-200 text-sm bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 italic">
                  {job.supervisorComments || 'No specific instructions from supervisor.'}
                </p>
              </div>

              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Requested By</span>
                <p className="text-slate-300 font-medium">{job.requestedBy || 'Unknown'}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/80">
            <h3 className="text-white text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
              <AlertTriangle size={20} className="text-emerald-400" />
              Plant Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Plant Number</span>
                <p className="text-slate-200 font-bold">{job.plantNumber}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Plant Status</span>
                <span className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                  job.plantStatus === 'Run' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {job.plantStatus}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Job Category</span>
                <p className="text-slate-200 font-medium capitalize">{job.maintenanceSchedule || 'General Maintenance'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/80">
            <h3 className="text-white text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
              <Calendar size={20} className="text-purple-400" />
              Timeline & Status
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Current Status</span>
                <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider inline-block ${
                  job.status === 'Assigned' ? 'bg-slate-700 text-slate-300 border border-white/5' :
                  job.status === 'InProgress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {job.status.replace('_', ' ')}
                </span>
              </div>
              
              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Priority</span>
                <span className={`badge badge-${job.priority.toLowerCase()} shadow-lg uppercase`}>
                  {job.priority}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Date Raised</span>
                <p className="text-slate-300 font-medium">{job.dateRaised} {job.timeRaised}</p>
              </div>

              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Required Completion</span>
                <p className={`font-bold ${
                  job.requiredCompletionDate && job.requiredCompletionDate < new Date().toISOString().split('T')[0] && !['Pending_Supervisor', 'Awaiting_SignOff'].includes(job.status)
                  ? 'text-red-400' 
                  : 'text-slate-200'
                }`}>
                  {job.requiredCompletionDate || 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/80">
            <h3 className="text-white text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
              <Paperclip size={20} className="text-pink-400" />
              Attachments
            </h3>
            <div className="py-4 text-center text-slate-500 bg-slate-800/30 rounded-xl border border-white/5">
              <p className="text-sm">No attachments available.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[280px] p-4 lg:p-6 bg-slate-900/90 backdrop-blur-md border-t border-white/10 flex justify-end gap-4 z-50">
        <button 
          onClick={() => navigate('/artisan/dashboard')}
          className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
        >
          Cancel
        </button>
        
        {job.status === 'Assigned' && (
          <button 
            onClick={handleStartWork}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition transform hover:-translate-y-1"
          >
            <Play size={20} fill="currentColor" /> Start Work
          </button>
        )}

        {job.status === 'InProgress' && (
          <button 
            onClick={() => navigate(`/artisan/execute-work/${job.id}`)}
            className="px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-amber-600/20 transition transform hover:-translate-y-1"
          >
            <Clock size={20} /> Continue Work
          </button>
        )}

        {['Pending_Supervisor', 'Awaiting_SignOff'].includes(job.status) && (
          <button 
            disabled
            className="px-8 py-3 rounded-xl bg-emerald-600/20 text-emerald-400 font-bold border border-emerald-500/20 cursor-not-allowed"
          >
            Job Completed & In Review
          </button>
        )}
      </div>

      {/* Bottom padding for fixed bar */}
      <div className="h-24"></div>
    </div>
  );
};

export default ArtisanJobDetail;
