import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from '../components/JobCardForm.module.css';
import type { JobCard, JobCardStatus } from '../types';
import { useJobCards } from '../context/JobCardContext';
import { useAuth } from '../context/AuthContext';
import { Printer, Edit3, ArrowLeft, CheckCircle, Save, ShieldCheck, UserCheck, Play, CheckCircle2, History, ClipboardList } from 'lucide-react';
import WorkflowTracker from '../components/WorkflowTracker';
import JobCardBackForm from '../components/JobCardBackForm';
import AuditTimeline from '../components/AuditTimeline';

const JobCardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getJobCard, updateJobCard, getAuditLogs, getAssignments } = useJobCards();
  const [card, setCard] = useState<JobCard | null>(null);
  
  const queryParams = new URLSearchParams(location.search);
  const initialTab = (queryParams.get('tab') as 'front' | 'back' | 'history') || 'front';
  const initialEditing = queryParams.get('edit') === 'true';
  
  const [activeTab, setActiveTab] = useState<'front' | 'back' | 'history'>(initialTab);
  const [history, setHistory] = useState<any[]>([]);
  const [assignment, setAssignment] = useState<any>(null);
  const [isEditingBack, setIsEditingBack] = useState(initialEditing);
  const [backData, setBackData] = useState<Partial<JobCard>>({});

  useEffect(() => {
    if (id) {
      const data = getJobCard(id);
      if (data) {
        setCard(data);
        setBackData(data);
        getAuditLogs(id).then(setHistory);
        getAssignments(id).then(res => {
          if (res && res.length > 0) setAssignment(res[0]);
        });
      }
    }
  }, [id, getJobCard, getAuditLogs, getAssignments]);

  const handlePrint = () => {
    window.print();
  };

  const handleStatusTransition = async (newStatus: JobCardStatus, extraFields = {}, _actionName?: string) => {
    if (card) {
      try {
        const updates = { 
          ...backData,
          status: newStatus, 
          ...extraFields,
          performedBy: user?.name || 'Unknown',
          userRole: user?.role
        };
        await updateJobCard(card.id, updates);
        
        // Refresh local state
        const updatedCard = getJobCard(card.id);
        if (updatedCard) setCard(updatedCard);
        
        const freshLogs = await getAuditLogs(card.id);
        setHistory(freshLogs);
        setIsEditingBack(false);
      } catch (err: any) {
        console.error('Failed to update status:', err);
        alert(err.response?.data?.error || 'Failed to update job card. Please check the workflow constraints.');
      }
    }
  };

  if (!card) return <div style={{ padding: '4rem', color: 'white' }}>Job Card not found.</div>;

  const canApprove = (user?.role === 'Supervisor' && card.status === 'Pending_Supervisor') || 
                   (user?.role === 'HOD' && card.status === 'Pending_HOD');
  
  const canRegister = user?.role === 'PlanningOffice' && card.status === 'Approved';
  const canAssign = user?.role === 'EngSupervisor' && card.status === 'Registered';
  const canStartWork = user?.role === 'Artisan' && card.status === 'Assigned';
  const canCompleteWork = user?.role === 'Artisan' && card.status === 'InProgress';
  const canSignOff = user?.role === 'Initiator' && card.status === 'Awaiting_SignOff';
  const canClose = user?.role === 'Supervisor' && card.status === 'SignedOff';

  return (
    <div className={styles.formContainer}>
      <div className="no-print mb-6">
        <button onClick={() => navigate(-1)} className="btn btn-ghost mb-4">
          <ArrowLeft size={18} /> Back to List
        </button>
        <WorkflowTracker currentStatus={card.status} />
        
        <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-white/10">
          <div className="flex gap-4">
            <button 
              className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'front' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setActiveTab('front')}
            >
              FRONT FORM
            </button>
            <button 
              className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'back' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setActiveTab('back')}
            >
              BACK FORM (FEEDBACK)
            </button>
            <button 
              className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setActiveTab('history')}
            >
              HISTORY
            </button>
          </div>
          
          <div className="flex gap-2">
            {canApprove && (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleStatusTransition('Rejected', {}, 'Request Rejected')}
                  className="btn btn-danger"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleStatusTransition(user?.role === 'Supervisor' ? 'Pending_HOD' : 'Approved', 
                    user?.role === 'Supervisor' ? { approvedBySupervisor: user?.name } : { approvedByHOD: user?.name }, 
                    'Request Approved')}
                  className="btn btn-primary"
                >
                  <ShieldCheck size={18} /> Approve
                </button>
              </div>
            )}
            
            {canRegister && (
              <button 
                onClick={() => handleStatusTransition('Registered', { registrationPlanning: user?.name })}
                className="btn btn-primary"
              >
                <Edit3 size={18} /> Register (Planning)
              </button>
            )}

            {canAssign && (
              <button 
                onClick={() => {
                  const artisan = prompt('Assign to Artisan:');
                  if (artisan) handleStatusTransition('Assigned', { issuedTo: artisan });
                }}
                className="btn btn-primary"
              >
                <UserCheck size={18} /> Assign Artisan
              </button>
            )}

            {canStartWork && (
              <button 
                onClick={() => handleStatusTransition('InProgress')}
                className="btn btn-primary"
              >
                <Play size={18} /> Start Work
              </button>
            )}

            {activeTab === 'back' && (card.status === 'InProgress' || card.status === 'Awaiting_SignOff') && !isEditingBack && (
              <button onClick={() => setIsEditingBack(true)} className="btn btn-secondary">
                <Edit3 size={18} /> Edit Feedback
              </button>
            )}

            {isEditingBack && (
              <div className="flex gap-2">
                <button onClick={() => handleStatusTransition(card.status)} className="btn btn-secondary">
                  <Save size={18} /> Save Draft
                </button>
                {canCompleteWork && (
                  <button 
                    onClick={() => {
                      if (!backData.workDoneDetails || !backData.causeOfFailure) {
                        alert("Please fill out 'Details of Work Done' and 'Cause of Failure' before submitting.");
                        return;
                      }
                      handleStatusTransition('Awaiting_SignOff', { dateFinished: new Date().toISOString().split('T')[0] })
                    }}
                    className="btn btn-success font-bold"
                  >
                    <CheckCircle2 size={18} /> Complete & Submit Job
                  </button>
                )}
              </div>
            )}

            {canCompleteWork && !isEditingBack && activeTab !== 'back' && (
              <button 
                onClick={() => {
                  setActiveTab('back');
                  setIsEditingBack(true);
                }}
                className="btn btn-primary animate-pulse shadow-blue-500/50 shadow-lg"
              >
                <ClipboardList size={18} /> Fill Feedback & Complete
              </button>
            )}

            {canSignOff && (
              <button 
                onClick={() => {
                  const comment = prompt('Originator Sign-off Comment:');
                  if (comment !== null) {
                    handleStatusTransition('SignedOff', { 
                      originatorSignOff: user?.name,
                      originatorComment: comment,
                      originatorSignOffDate: new Date().toISOString().split('T')[0],
                      originatorSignOffTime: new Date().toLocaleTimeString()
                    }, 'Job Signed Off by Originator');
                  }
                }}
                className="btn btn-primary"
              >
                <UserCheck size={18} /> Sign Off
              </button>
            )}

            {canClose && (
              <button 
                onClick={() => {
                  const comment = prompt('Final Closure Comment:');
                  if (comment !== null) {
                    handleStatusTransition('Closed', { 
                      closedBy: user?.name,
                      closureComment: comment,
                      closedByDate: new Date().toISOString().split('T')[0],
                      closedByTime: new Date().toLocaleTimeString()
                    }, 'Job Closed by Supervisor');
                  }
                }}
                className="btn btn-danger"
              >
                <ShieldCheck size={18} /> Close Job Card
              </button>
            )}

            <button onClick={handlePrint} className="btn btn-ghost">
              <Printer size={18} /> Print
            </button>
          </div>
        </div>
      </div>

      <div className="printable-content">
        {activeTab === 'front' ? (
          <div className={styles.paperForm}>
            {/* Header Section */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={styles.ticketBox}>
                  <span className={styles.ticketLabel}>Job Card Number</span>
                  <span className={styles.ticketValue}>{card.ticketNumber}</span>
                </div>
              </div>
              <div className={styles.headerTitle}>
                <h1 className={styles.titleText}>JOB CARD FRONT</h1>
                <p className={styles.subtitle}>MAINTENANCE & ENGINEERING SERVICES</p>
              </div>
              <div className={styles.headerRight}>
                <div className={styles.statusBadgeDetail}>
                  {card.status.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className={styles.section}>
              <h2 className={styles.sectionHeader}>1. GENERATION / ORIGINATOR DETAILS</h2>
              <div className={styles.grid}>
                <div className={styles.displayGroup}>
                  <span className={styles.label}>Requested By</span>
                  <div className={styles.val}>{card.requestedBy}</div>
                </div>
                <div className={styles.subGrid}>
                  <div className={styles.displayGroup}>
                    <span className={styles.label}>Date Raised</span>
                    <div className={styles.val}>{card.dateRaised}</div>
                  </div>
                  <div className={styles.displayGroup}>
                    <span className={styles.label}>Time Raised</span>
                    <div className={styles.val}>{card.timeRaised}</div>
                  </div>
                </div>
                <div className={styles.displayGroup}>
                  <span className={styles.label}>Priority</span>
                  <div className={styles.val}>{card.priority}</div>
                </div>
                <div className={styles.displayGroup}>
                  <span className={styles.label}>Required Comp Date</span>
                  <div className={styles.val}>{card.requiredCompletionDate}</div>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionHeader}>2. PLANT & ASSET INFORMATION</h2>
              <div className={styles.grid}>
                <div className={styles.displayGroup}>
                  <span className={styles.label}>Plant Number</span>
                  <div className={styles.val}>{card.plantNumber}</div>
                </div>
                <div className={styles.displayGroup}>
                  <span className={styles.label}>Plant Description</span>
                  <div className={styles.val}>{card.plantDescription}</div>
                </div>
                <div className={styles.displayGroup}>
                  <span className={styles.label}>Plant Status</span>
                  <div className={styles.val}>{card.plantStatus?.toUpperCase()}</div>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionHeader}>3. DEFECT & WORK REQUEST</h2>
              <div className={styles.fullGrid}>
                <div className={styles.displayGroup}>
                  <span className={styles.label}>Defect / Problem</span>
                  <div className={styles.valText}>{card.defect}</div>
                </div>
                <div className={styles.displayGroup}>
                  <span className={styles.label}>Work Request / Instruction</span>
                  <div className={styles.valText}>{card.workRequest}</div>
                </div>
                <div className={styles.displayGroup}>
                  <span className={styles.label}>Maint. Schedule</span>
                  <div className={styles.val}>{card.maintenanceSchedule || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionHeader}>4. SECTION / TRADE ALLOCATION</h2>
              <div className={styles.tradeList}>
                {card.allocatedTrades?.map(trade => (
                  <span key={trade} className={styles.tradeBadge}>
                    <CheckCircle size={14} /> {trade}
                  </span>
                ))}
              </div>
            </div>

            {assignment && (
              <div className={styles.section}>
                <h2 className={styles.sectionHeader}>4B. ASSIGNMENT INFORMATION</h2>
                <div className={styles.grid}>
                  <div className={styles.displayGroup}>
                    <span className={styles.label}>Assigned To</span>
                    <div className={styles.val}>{assignment.artisanName}</div>
                  </div>
                  <div className={styles.displayGroup}>
                    <span className={styles.label}>Trade/Section</span>
                    <div className={styles.val}>{assignment.section || 'Not specified'}</div>
                  </div>
                  <div className={styles.subGrid}>
                    <div className={styles.displayGroup}>
                      <span className={styles.label}>Exp. Start</span>
                      <div className={styles.val}>{assignment.expectedStartDate || '---'}</div>
                    </div>
                    <div className={styles.displayGroup}>
                      <span className={styles.label}>Exp. Finish</span>
                      <div className={styles.val}>{assignment.expectedCompletionDate || '---'}</div>
                    </div>
                  </div>
                </div>
                {assignment.notes && (
                  <div className="mt-3 p-3 bg-slate-800/20 rounded-lg border border-white/5 italic text-sm text-slate-400">
                    Notes: {assignment.notes}
                  </div>
                )}
              </div>
            )}

            <div className={styles.section}>
              <h2 className={styles.sectionHeader}>5. OFFICIAL USE / SIGN-OFFS</h2>
              <div className={styles.signOffGrid}>
                <div className={styles.signOffItem}>
                  <span className={styles.signOffLabel}>Appr. Supervisor</span>
                  <div className={styles.signOffLine}>{card.approvedBySupervisor || '________________'}</div>
                </div>
                <div className={styles.signOffItem}>
                  <span className={styles.signOffLabel}>Appr. HOD</span>
                  <div className={styles.signOffLine}>{card.approvedByHOD || '________________'}</div>
                </div>
                <div className={styles.signOffItem}>
                  <span className={styles.signOffLabel}>Issued To</span>
                  <div className={styles.signOffLine}>{card.issuedTo || '________________'}</div>
                </div>
                <div className={styles.signOffItem}>
                  <span className={styles.signOffLabel}>Reg Planning</span>
                  <div className={styles.signOffLine}>{card.registrationPlanning || '________________'}</div>
                </div>
                <div className={styles.signOffItem}>
                  <span className={styles.signOffLabel}>Orig Sign Off</span>
                  <div className={styles.signOffLine}>{card.originatorSignOff || '________________'}</div>
                </div>
                <div className={styles.signOffItem}>
                  <span className={styles.signOffLabel}>Closed By</span>
                  <div className={styles.signOffLine}>{card.closedBy || '________________'}</div>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionHeader}>6. FEEDBACK SUMMARY (FROM BACK FORM)</h2>
              {!card.workDoneDetails && !card.dateFinished ? (
                <div className="text-slate-500 italic p-4 border border-dashed border-white/10 rounded-lg text-center">
                  Work has not yet been completed. Feedback will appear here once submitted.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-800/20 p-4 rounded-lg border border-white/5">
                    <span className="text-xs uppercase text-slate-500 font-bold block mb-2">Work Performed</span>
                    <p className="text-white text-sm">{card.workDoneDetails}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/20 p-3 rounded-lg border border-white/5">
                      <span className="text-xs text-slate-500 block">Date Finished</span>
                      <span className="text-white font-medium">{card.dateFinished || '--'}</span>
                    </div>
                    <div className="bg-slate-800/20 p-3 rounded-lg border border-white/5">
                      <span className="text-xs text-slate-500 block">Downtime</span>
                      <span className="text-white font-medium">{card.machineDowntime || '--'}</span>
                    </div>
                    <div className="bg-slate-800/20 p-3 rounded-lg border border-white/5">
                      <span className="text-xs text-slate-500 block">Breakdown</span>
                      <span className="text-white font-medium">{card.isBreakdown ? 'YES' : 'NO'}</span>
                    </div>
                    <div className="bg-slate-800/20 p-3 rounded-lg border border-white/5">
                      <span className="text-xs text-slate-500 block">History Recorded</span>
                      <span className="text-white font-medium">{card.hasHistory ? 'YES' : 'NO'}</span>
                    </div>
                  </div>
                  {card.supervisorComments && (
                    <div className="bg-blue-600/5 p-4 rounded-lg border border-blue-500/10">
                      <span className="text-xs uppercase text-blue-400 font-bold block mb-1">Supervisor Final Remarks</span>
                      <p className="text-white text-sm italic">"{card.supervisorComments}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {(card.originatorComment || card.closureComment) && (
              <div className={styles.section}>
                <h2 className={styles.sectionHeader}>7. SIGN-OFF & CLOSURE DETAILS</h2>
                <div className="space-y-4">
                  {card.originatorComment && (
                    <div className="bg-green-600/5 p-4 rounded-lg border border-green-500/10">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs uppercase text-green-400 font-bold block">Originator Sign-off</span>
                        <span className="text-xs text-slate-500">{card.originatorSignOffDate} {card.originatorSignOffTime}</span>
                      </div>
                      <p className="text-white text-sm">"{card.originatorComment}"</p>
                      <div className="text-xs text-slate-400 mt-2 font-medium">— {card.originatorSignOff}</div>
                    </div>
                  )}
                  {card.closureComment && (
                    <div className="bg-red-600/5 p-4 rounded-lg border border-red-500/10">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs uppercase text-red-400 font-bold block">Final Job Closure</span>
                        <span className="text-xs text-slate-500">{card.closedByDate} {card.closedByTime}</span>
                      </div>
                      <p className="text-white text-sm">"{card.closureComment}"</p>
                      <div className="text-xs text-slate-400 mt-2 font-medium">— {card.closedBy}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'back' ? (
          <JobCardBackForm 
            data={backData} 
            onChange={updates => setBackData(prev => ({ ...prev, ...updates }))} 
            readOnly={!isEditingBack}
          />
        ) : (
          <div className="glass-panel p-8">
            <div className="flex items-center gap-3 mb-8">
              <History size={24} className="text-blue-500" />
              <h2 className="text-2xl font-bold text-white">Action History & Traceability</h2>
            </div>
            <AuditTimeline logs={history} />
          </div>
        )}
      </div>
      
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .printable-content { color: black !important; }
        }
        .btn-success { background: #22c55e; color: white; }
        .btn-danger { background: #ef4444; color: white; }
      `}</style>
    </div>
  );
};

export default JobCardDetail;

