import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Send, PenTool, ArrowRight } from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import { toast } from 'react-hot-toast';
import styles from '../JobCards.module.css';

const ReviewSubmit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobCards, updateJobCard } = useJobCards();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const job = jobCards.find(j => j.id === id);

  if (!job) return <div>Job not found</div>;

  const isReadOnly = ['Pending_Supervisor', 'Awaiting_SignOff', 'Closed'].includes(job.status);

  const handleSubmit = async () => {
    const loadingToast = toast.loading('Submitting job card for review...');
    setIsSubmitting(true);
    try {
      await updateJobCard(job.id, {
        status: 'Pending_Supervisor',
        dateFinished: new Date().toISOString().split('T')[0],
      });
      toast.success('Job card submitted successfully', { id: loadingToast });
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/artisan/dashboard');
      }, 3000);
    } catch (err: any) {
      toast.error('Failed to submit job for review', { id: loadingToast });
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className={styles.pageContainer}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle2 size={48} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 shadow-sm">Successfully Submitted</h2>
          <p className="text-slate-400 text-lg mb-8 max-w-md text-center">
            Job #{job.ticketNumber} has been sent to the supervisor for review. Great work!
          </p>
          <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-[progress_3s_linear]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={`${styles.tableHeader} flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(isReadOnly ? '/artisan/dashboard' : `/artisan/materials/${job.id}`)}
            className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-colors border border-white/5"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={styles.pageTitle} style={{ fontSize: '1.75rem' }}>Review & Submit</h1>
            <p className={styles['text-muted']}>{job.ticketNumber} - Final check before submission</p>
          </div>
        </div>
        
        {/* Progress Navigation Tracker */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">Execution</span>
          <ArrowRight size={16} className="text-emerald-500" />
          <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">Materials</span>
          <ArrowRight size={16} className="text-emerald-500" />
          <span className="text-blue-400 font-bold text-sm bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">Submit</span>
        </div>
      </header>

      {isReadOnly && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-4 items-start">
          <CheckCircle2 className="text-amber-400 mt-1" size={20} />
          <div>
            <h4 className="text-amber-400 font-bold text-lg mb-1">Already Submitted</h4>
            <p className="text-amber-400/80 text-sm">This job is currently in review and cannot be edited unless returned by your supervisor.</p>
          </div>
        </div>
      )}

      <div className="glass-panel p-8 border border-white/10 rounded-3xl bg-slate-900/90 max-w-4xl mx-auto mb-12 shadow-2xl">
        <h3 className="text-2xl text-white font-bold mb-8 border-b border-white/10 pb-4 text-center">Submission Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          
          <div className="space-y-6">
            <div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Job Details</span>
              <p className="text-white font-medium text-lg">{job.plantDescription} - {job.plantNumber}</p>
              <p className="text-slate-400 text-sm mt-1">{job.defect || job.workRequest}</p>
            </div>

            <div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Work Done</span>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <p className="text-slate-300 text-sm">{job.workDoneDetails || <span className="text-red-400 italic">No notes provided</span>}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Time Started</span>
                 <p className="text-slate-200 font-medium">{job.startHours || 'N/A'}</p>
              </div>
              <div>
                 <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Date Finished</span>
                 <p className="text-emerald-400 font-bold">{job.dateFinished || new Date().toISOString().split('T')[0]}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Technical Indicators</span>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Breakdown?</span>
                  <span className={`text-sm font-bold ${job.isBreakdown ? 'text-red-400' : 'text-slate-300'}`}>{job.isBreakdown ? 'Yes' : 'No'}</span>
                </div>
                {job.isBreakdown && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Cause of Failure</span>
                      <span className="text-slate-300 text-sm font-medium">{job.causeOfFailure || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Downtime</span>
                      <span className="text-slate-300 text-sm font-medium">{job.machineDowntime ? `${job.machineDowntime} hrs` : 'N/A'}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Further Work Req?</span>
                  <span className={`text-sm font-bold ${job.furtherWorkRequired === 'Yes' ? 'text-amber-400' : 'text-slate-300'}`}>{job.furtherWorkRequired || 'No'}</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Materials Used</span>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Stores Withdrawn:</span>
                  <span className="text-white font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md">{job.sparesWithdrawn?.length || 0} items</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">External Ordered:</span>
                  <span className="text-white font-bold bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-md">{job.sparesOrdered?.length || 0} items</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {!isReadOnly && (
          <div className="mt-12 flex justify-end gap-4 border-t border-white/10 pt-8">
            <button 
              onClick={() => navigate(`/artisan/materials/${job.id}`)}
              disabled={isSubmitting}
              className="px-6 py-3.5 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition flex items-center gap-2"
            >
              <PenTool size={18} /> Edit Details
            </button>
            
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold flex items-center gap-3 shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              <Send size={22} /> {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default ReviewSubmit;
