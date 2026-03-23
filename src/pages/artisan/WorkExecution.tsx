import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Pause, Play, ArrowLeft, PenTool, ArrowRight, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import { toast } from 'react-hot-toast';
import styles from '../JobCards.module.css';

const WorkExecution: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobCards, updateJobCard } = useJobCards();

  const job = jobCards.find(j => j.id === id);

  const [formData, setFormData] = useState({
    startHours: '',
    dateFinished: '',
    workDoneDetails: '',
    isBreakdown: false,
    causeOfFailure: '',
    machineDowntime: '',
    hasHistory: false,
    furtherWorkRequired: '',
    failureType: '',
    maintenanceType: '',
    safetyNotes: ''
  });

  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (job) {
      setFormData({
        startHours: job.startHours || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        dateFinished: job.dateFinished || '',
        workDoneDetails: job.workDoneDetails || '',
        isBreakdown: job.isBreakdown || false,
        causeOfFailure: job.causeOfFailure || '',
        machineDowntime: job.machineDowntime || '',
        hasHistory: job.hasHistory || false,
        furtherWorkRequired: job.furtherWorkRequired || '',
        failureType: job.failureType || '',
        maintenanceType: job.maintenanceType || '',
        safetyNotes: job.safetyNotes || ''
      });

      // Simple elapsed time calculation if we have a start time today
      if (job.startHours && !isPaused && job.status === 'InProgress') {
        const start = new Date();
        const [hours, minutes] = job.startHours.split(':');
        start.setHours(parseInt(hours), parseInt(minutes), 0);

        const updateTimer = () => {
          const now = new Date();
          const diff = now.getTime() - start.getTime();
          if (diff > 0) {
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setElapsedTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
          }
        };

        updateTimer();
        timerRef.current = setInterval(updateTimer, 1000);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [job, isPaused]);

  if (!job) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-white text-2xl font-bold">Job Not Found</h2>
        <button onClick={() => navigate('/artisan/dashboard')} className="mt-4 text-blue-400 hover:underline">Return to Dashboard</button>
      </div>
    </div>
  );

  const isReadOnly = ['Pending_Supervisor', 'Awaiting_SignOff', 'Closed'].includes(job.status);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const validateForm = () => {
    if (!formData.workDoneDetails.trim()) {
      toast.error('Please provide details of work done');
      return false;
    }
    if (formData.isBreakdown && !formData.causeOfFailure.trim()) {
      toast.error('Please provide cause of failure for breakdowns');
      return false;
    }
    return true;
  };

  const handleSaveDraft = async () => {
    const loadingToast = toast.loading('Saving draft...');
    try {
      await updateJobCard(job.id, {
        ...formData,
      });
      toast.success('Draft saved successfully', { id: loadingToast });
    } catch (err: any) {
      toast.error('Failed to save draft', { id: loadingToast });
    }
  };

  const handlePauseResume = async () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    toast.success(newPausedState ? 'Work paused' : 'Work resumed');
    // In a real system, you'd send this to the server to track actual working time
  };

  const handleCompleteWork = async () => {
    if (!validateForm()) return;

    const loadingToast = toast.loading('Finalizing work execution...');
    try {
      await updateJobCard(job.id, {
        ...formData,
        dateFinished: new Date().toISOString().split('T')[0],
        status: 'InProgress' // Ensure it's in progress as we move to materials
      });
      
      toast.success('Work details recorded', { id: loadingToast });
      navigate(`/artisan/materials/${job.id}`);
    } catch (err: any) {
      toast.error('Failed to update job card', { id: loadingToast });
    }
  };

  return (
    <div className={`${styles.pageContainer} animate-in fade-in duration-500`}>
      <header className={`${styles.tableHeader} flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/artisan/dashboard`)}
            className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-all border border-white/5 hover:scale-105 active:scale-95"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Work Execution</h1>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-widest">
                {job.status}
              </span>
              <p className="text-slate-400 text-sm">{job.ticketNumber} • {job.plantDescription}</p>
            </div>
          </div>
        </div>
        
        {/* Progress Navigation Tracker */}
        <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <CheckCircle2 size={16} className="text-blue-400" />
            <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">Execution</span>
          </div>
          <ArrowRight size={14} className="text-slate-600" />
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-slate-700"></div>
            <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Materials</span>
          </div>
          <ArrowRight size={14} className="text-slate-600" />
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-slate-700"></div>
            <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Submit</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
        
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-panel p-8 border border-white/10 rounded-3xl bg-slate-900/60 backdrop-blur-xl shadow-2xl">
            <h3 className="text-white text-xl font-bold flex items-center gap-3 border-b border-white/5 pb-6 mb-8">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <PenTool size={22} />
              </div>
              Technical Execution Details
            </h3>
            
            <div className="space-y-8">
              <div className="group">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] block mb-3 group-focus-within:text-blue-400 transition-colors">
                  Detailed Work Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="workDoneDetails"
                  value={formData.workDoneDetails}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  rows={6}
                  placeholder="Provide a comprehensive step-by-step account of the work performed, adjustments made, and tests conducted..."
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-5 text-white text-base outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner resize-none placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] block mb-3 group-focus-within:text-blue-400 transition-colors">
                    Maintenance Category
                  </label>
                  <div className="relative">
                    <select 
                      name="maintenanceType" 
                      value={formData.maintenanceType}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900">Select Maintenance Type</option>
                      <option value="Mechanical" className="bg-slate-900">Mechanical Maintenance</option>
                      <option value="Electrical" className="bg-slate-900">Electrical Maintenance</option>
                      <option value="Instrumentation" className="bg-slate-900">Instrumentation & Control</option>
                      <option value="Civil" className="bg-slate-900">Civil / Structural</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ArrowRight size={18} className="rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] block mb-3 group-focus-within:text-blue-400 transition-colors">
                    Safety & Risk Mitigation
                  </label>
                  <input 
                    type="text"
                    name="safetyNotes"
                    value={formData.safetyNotes}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    placeholder="e.g., LOTO applied, PPE checked, Permit #123"
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-900/40 border border-white/5 mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${formData.isBreakdown ? 'bg-red-500/20 text-red-400 shadow-lg shadow-red-500/10' : 'bg-slate-800 text-slate-400'}`}>
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base">Breakdown Incident</h4>
                      <p className="text-slate-500 text-[10px] uppercase tracking-wider font-medium">Was this an emergency breakdown?</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="isBreakdown" checked={formData.isBreakdown} onChange={handleChange} disabled={isReadOnly} className="sr-only peer" />
                    <div className="w-14 h-7 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-200 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-red-600 shadow-lg peer-checked:after:bg-white"></div>
                  </label>
                </div>

                {formData.isBreakdown && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-red-500/5 p-8 rounded-3xl border border-red-500/10 animate-in slide-in-from-top-4 duration-300">
                    <div className="md:col-span-2 group">
                      <label className="text-red-400/80 text-[10px] font-bold uppercase tracking-[0.2em] block mb-3">Primary Cause of Failure <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        name="causeOfFailure"
                        value={formData.causeOfFailure}
                        onChange={handleChange}
                        readOnly={isReadOnly}
                        placeholder="e.g., Bearing seizure due to lack of lubrication"
                        className="w-full bg-slate-900/60 border border-red-500/20 rounded-2xl p-4 text-white text-sm outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all shadow-inner placeholder-red-400/30"
                      />
                    </div>
                    <div className="group">
                      <label className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] block mb-3">Failure Classification</label>
                      <div className="relative">
                        <select 
                          name="failureType" 
                          value={formData.failureType}
                          onChange={handleChange}
                          disabled={isReadOnly}
                          className="w-full bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-slate-900">Select failure type</option>
                          <option value="Wear" className="bg-slate-900">Normal Wear & Tear</option>
                          <option value="Material" className="bg-slate-900">Material / Part Defect</option>
                          <option value="Operator" className="bg-slate-900">Operator / Human Error</option>
                          <option value="External" className="bg-slate-900">External Factor</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                          <ArrowRight size={18} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                    <div className="group">
                      <label className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] block mb-3">Downtime (Decimal Hours)</label>
                      <input 
                        type="number"
                        step="0.1"
                        name="machineDowntime"
                        value={formData.machineDowntime}
                        onChange={handleChange}
                        readOnly={isReadOnly}
                        placeholder="e.g., 2.5"
                        className="w-full bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner placeholder-slate-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group">
                    <label className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] block mb-3">Further Action Required?</label>
                    <div className="relative">
                      <select 
                        name="furtherWorkRequired"
                        value={formData.furtherWorkRequired}
                        onChange={handleChange}
                        disabled={isReadOnly}
                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                      >
                        <option value="No" className="bg-slate-900">No - Work Complete</option>
                        <option value="Yes" className="bg-slate-900">Yes - Follow-up Needed</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <ArrowRight size={18} className="rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center h-full md:pt-8">
                    <label className="flex items-center gap-4 cursor-pointer group w-full">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          name="hasHistory" 
                          checked={formData.hasHistory} 
                          onChange={handleChange} 
                          disabled={isReadOnly}
                          className="peer w-6 h-6 rounded-lg bg-slate-800 border-white/5 text-blue-500 focus:ring-blue-500/20 focus:ring-offset-0 transition-all cursor-pointer appearance-none checked:bg-blue-600 checked:border-blue-400" 
                        />
                        <div className="absolute inset-0 rounded-lg pointer-events-none flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                        </div>
                      </div>
                      <span className="text-slate-300 font-bold text-sm group-hover:text-white transition-colors">Update Machine History</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Timing Info */}
        <div className="space-y-8">
          <aside className="glass-panel p-8 border border-white/10 rounded-3xl bg-slate-900/60 backdrop-blur-xl sticky top-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/40"></div>
            
            <h3 className="text-white text-xl font-bold flex items-center gap-3 border-b border-white/5 pb-6 mb-8">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Clock size={22} />
              </div>
              Time Tracking
            </h3>
            
            <div className="space-y-8">
              <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] block mb-2">Shift Start Time</span>
                <p className="text-white font-mono text-2xl tracking-tight">
                  {formData.startHours || '--:--'}
                </p>
              </div>

              <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                {(!isPaused && job.status === 'InProgress') && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 animate-pulse"></div>
                )}
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] block mb-2">Active Duration</span>
                <div className="flex items-baseline gap-2">
                  <p className={`font-mono text-4xl font-black tracking-tighter ${isPaused ? 'text-slate-500' : 'text-amber-400'}`}>
                    {elapsedTime}
                  </p>
                  {!isPaused && job.status === 'InProgress' && (
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-[10px] mt-2 font-medium">
                  {isPaused ? 'TIMER PAUSED' : 'CURRENTLY LOGGING TIME'}
                </p>
              </div>

              {isReadOnly && (
                <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20">
                  <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em] block mb-2">Work Completed At</span>
                  <p className="text-emerald-400 font-mono text-2xl">
                    {formData.dateFinished}
                  </p>
                </div>
              )}
            </div>

            {!isReadOnly && (
              <div className="mt-10 space-y-4 pt-8 border-t border-white/5">
                <button 
                  onClick={handleSaveDraft}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-3 border border-white/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Save size={20} /> Save Progress
                </button>
                
                <button 
                  onClick={handlePauseResume}
                  className={`w-full px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
                    isPaused 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                      : 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 border border-amber-500/30'
                  }`}
                >
                  {isPaused ? <><Play size={20} fill="currentColor" /> Resume Timer</> : <><Pause size={20} fill="currentColor" /> Pause Timer</>}
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Floating Action Bar */}
      {!isReadOnly && (
        <>
          <div className="fixed bottom-0 left-0 right-0 lg:left-[280px] p-6 bg-slate-900/80 backdrop-blur-2xl border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 z-50">
            <div className="hidden sm:block">
              <p className="text-slate-400 text-sm font-medium">Ensure all technical details are accurate before continuing.</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button 
                onClick={() => navigate('/artisan/dashboard')}
                className="flex-1 sm:flex-none px-8 py-4 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all active:scale-95"
              >
                Discard
              </button>
              
              <button 
                onClick={handleCompleteWork}
                className="flex-1 sm:flex-none px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                Log Materials <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkExecution;
