import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Pause, Play, ArrowLeft, PenTool, ArrowRight, Clock } from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
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

  useEffect(() => {
    if (job) {
      setFormData({
        startHours: job.startHours || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateFinished: job.dateFinished || '',
        workDoneDetails: job.workDoneDetails || '',
        isBreakdown: job.isBreakdown || false,
        causeOfFailure: job.causeOfFailure || '',
        machineDowntime: job.machineDowntime || '',
        hasHistory: job.hasHistory || false,
        furtherWorkRequired: job.furtherWorkRequired || '',
        // These might not be strictly typed in JobCard yet but we can store them if backend handles custom keys 
        // or just local state. For now, matching to the back-form fields of JobCard
        failureType: '',
        maintenanceType: '',
        safetyNotes: ''
      });
    }
  }, [job]);

  if (!job) return <div>Job not found</div>;

  const isReadOnly = ['Pending_Supervisor', 'Awaiting_SignOff', 'Closed'].includes(job.status);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };



  const handleSaveDraft = async () => {
    try {
      await updateJobCard(job.id, {
        ...formData,
      });
      alert('Draft saved successfully');
    } catch (err: any) {
      alert('Failed to save draft');
    }
  };

  const handlePauseResume = async () => {
    setIsPaused(!isPaused);
    // You could save state to job here like { status: 'Paused' } if supported
  };

  const handleCompleteWork = async () => {
    if (!formData.workDoneDetails) {
      alert('Please provide details of work done before completing.');
      return;
    }
    if (formData.furtherWorkRequired === 'Yes' && !formData.workDoneDetails.includes('Further work:')) {
      // In a real app we might have a specific `furtherWorkNotes` field.
    }

    try {
      await updateJobCard(job.id, {
        ...formData,
        dateFinished: new Date().toISOString().split('T')[0],
      });
      
      // Navigate to Materials or Review
      navigate(`/artisan/materials/${job.id}`);
    } catch (err: any) {
      alert('Failed to complete work');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={`${styles.tableHeader} flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/artisan/dashboard`)} // changed from job-details
            className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-colors border border-white/5"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={styles.pageTitle} style={{ fontSize: '1.75rem' }}>Work Execution</h1>
            <p className={styles['text-muted']}>{job.ticketNumber} - Log Your Activity</p>
          </div>
        </div>
        
        {/* Progress Navigation Tracker */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-blue-400 font-bold text-sm bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">Execution</span>
          <ArrowRight size={16} className="text-slate-500" />
          <span className="text-slate-500 font-medium text-sm">Materials</span>
          <ArrowRight size={16} className="text-slate-500" />
          <span className="text-slate-500 font-medium text-sm">Submit</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/80">
            <h3 className="text-white text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-4 mb-6">
              <PenTool size={20} className="text-blue-400" />
              Technical Notes
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">
                  Details of Work Done <span className="text-red-400">*</span>
                </label>
                <textarea 
                  name="workDoneDetails"
                  value={formData.workDoneDetails}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  rows={5}
                  placeholder="Describe step-by-step what was fixed..."
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-blue-500 w-full transition shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">
                    Maintenance Type
                  </label>
                  <select 
                    name="maintenanceType" 
                    value={formData.maintenanceType}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-blue-500 w-full transition shadow-inner appearance-none"
                  >
                    <option value="">Select type</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Instrumentation">Instrumentation</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">
                    Safety Notes / Hazards Checked
                  </label>
                  <input 
                    type="text"
                    name="safetyNotes"
                    value={formData.safetyNotes}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    placeholder="e.g. LOTO Applied"
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-blue-500 w-full transition shadow-inner"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-white font-bold">Was this a Breakdown?</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="isBreakdown" checked={formData.isBreakdown} onChange={handleChange} disabled={isReadOnly} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>

                {formData.isBreakdown && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                    <div className="md:col-span-2">
                      <label className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2 text-red-400">Cause of Failure</label>
                      <input 
                        type="text"
                        name="causeOfFailure"
                        value={formData.causeOfFailure}
                        onChange={handleChange}
                        readOnly={isReadOnly}
                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-red-500/50 w-full transition shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">Failure Type</label>
                      <select 
                        name="failureType" 
                        value={formData.failureType}
                        onChange={handleChange}
                        disabled={isReadOnly}
                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none w-full transition shadow-inner appearance-none"
                      >
                        <option value="">Select type</option>
                        <option value="Wear">Wear & Tear</option>
                        <option value="Material">Material Defect</option>
                        <option value="Operator">Operator Error</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">Machine Downtime (Hrs)</label>
                      <input 
                        type="number"
                        name="machineDowntime"
                        value={formData.machineDowntime}
                        onChange={handleChange}
                        readOnly={isReadOnly}
                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none w-full transition shadow-inner"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">Further Work Required?</label>
                    <select 
                      name="furtherWorkRequired"
                      value={formData.furtherWorkRequired}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-blue-500 w-full transition shadow-inner appearance-none"
                    >
                      <option value="">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div className="flex items-center h-full pt-6">
                    <label className="flex items-center gap-3 cursor-pointer text-white font-bold">
                      <input 
                        type="checkbox" 
                        name="hasHistory" 
                        checked={formData.hasHistory} 
                        onChange={handleChange} 
                        disabled={isReadOnly}
                        className="w-5 h-5 rounded bg-slate-800 border-white/10 checked:bg-blue-500" 
                      />
                      History Update Required
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Timing Info */}
        <div className="space-y-6">
          <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/80 sticky top-6">
            <h3 className="text-white text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
              <Clock size={20} className="text-amber-400" />
              Time Logging
            </h3>
            
            <div className="space-y-5">
              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Started At</span>
                <p className="text-white font-bold text-xl bg-slate-800/50 p-3 rounded-lg border border-white/5 text-center">
                  {formData.startHours || 'Not started'}
                </p>
              </div>

              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Time Elapsed</span>
                <p className="text-amber-400 font-bold text-2xl bg-slate-800/50 p-3 rounded-lg border border-white/5 text-center flex items-center justify-center gap-2">
                  <span className="animate-pulse w-2 h-2 bg-amber-400 rounded-full inline-block"></span>
                  Active
                </p>
              </div>

              {isReadOnly && (
                <div>
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Finished At</span>
                  <p className="text-emerald-400 font-bold text-xl bg-slate-800/50 p-3 rounded-lg border border-white/5 text-center">
                    {formData.dateFinished}
                  </p>
                </div>
              )}
            </div>

            {!isReadOnly && (
              <div className="mt-8 space-y-3 pt-6 border-t border-white/10">
                <button 
                  onClick={handleSaveDraft}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-2 border border-white/5 transition"
                >
                  <Save size={18} /> Save Progress
                </button>
                
                <button 
                  onClick={handlePauseResume}
                  className={`w-full px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                    isPaused 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 border border-amber-500/20'
                  }`}
                >
                  {isPaused ? <><Play size={18} fill="currentColor" /> Resume Work</> : <><Pause size={18} fill="currentColor" /> Pause Work</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      {!isReadOnly && (
        <>
          <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 lg:p-6 bg-slate-900/95 backdrop-blur-md border-t border-white/10 flex justify-end gap-4 z-50">
            <button 
              onClick={() => navigate('/artisan/dashboard')}
              className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            
            <button 
              onClick={handleCompleteWork}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition transform hover:-translate-y-1"
            >
              Continue to Materials <ArrowRight size={20} />
            </button>
          </div>
          <div className="h-24"></div>
        </>
      )}
    </div>
  );
};

export default WorkExecution;
