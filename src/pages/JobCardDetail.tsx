import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { JobCard, JobCardStatus } from '../types';
import { useJobCards } from '../context/JobCardContext';
import { useAuth } from '../context/AuthContext';
import { Printer, Edit3, ArrowLeft, CheckCircle, Save, ShieldCheck, UserCheck, Play, CheckCircle2, History, ClipboardList, Zap, Calendar, Wrench, FileText, User, Settings, Component, UserPlus, AlertTriangle } from 'lucide-react';
import WorkflowTracker from '../components/WorkflowTracker';
import JobCardBackForm from '../components/JobCardBackForm';
import AuditTimeline from '../components/AuditTimeline';
import styles from './JobCardDetail.module.css';

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

  if (!card) return (
    <div className={styles.loadingContainer}>
      <div className={styles.loader}></div>
      <p>Locating Job Card...</p>
    </div>
  );

  const canApprove = (user?.role === 'Supervisor' && card.status === 'Pending_Supervisor') || 
                   (user?.role === 'HOD' && card.status === 'Pending_HOD');
  
  const canRegister = user?.role === 'PlanningOffice' && card.status === 'Approved';
  const canAssign = (user?.role === 'EngSupervisor' || user?.role === 'Supervisor' || user?.role === 'Admin') && card.status === 'Registered';
  const canStartWork = user?.role === 'Artisan' && card.status === 'Assigned';
  const canCompleteWork = user?.role === 'Artisan' && card.status === 'InProgress';
  const canSignOff = user?.role === 'Initiator' && card.status === 'Awaiting_SignOff';
  const canClose = user?.role === 'Supervisor' && card.status === 'SignedOff';

  const priorityColors = {
    Critical: 'var(--critical)',
    High: 'var(--high)',
    Medium: 'var(--medium)',
    Low: 'var(--low)',
  } as Record<string, string>;
  const pc = priorityColors[card.priority] || 'var(--default)';

  const totalCost = (card.sparesWithdrawn || []).reduce((s, sw) => s + (parseFloat(sw.cost) || 0), 0);

  return (
    <div className={styles.pageContainer}>
      <div className="no-print">
        {/* Top Floating Action Bar */}
        <div className={styles.actionBar}>
          <div className={styles.actionLeft}>
            <button onClick={() => navigate(-1)} className={styles.backBtn}>
              <ArrowLeft size={16} /> <span className={styles.backLabel}>Back</span>
            </button>
            <div className={styles.ticketBadge} style={{ '--theme-color': pc } as any}>
              <Zap size={14} /> {card.ticketNumber}
            </div>
            <div className={styles.statusBadge}>
              {card.status.replace('_', ' ')}
            </div>
          </div>
          
          <div className={styles.actionRight}>
            {canApprove && (
              <>
                <button onClick={() => handleStatusTransition('Rejected', {}, 'Request Rejected')} className={styles.btnDanger}>
                  Reject
                </button>
                <button 
                  onClick={() => handleStatusTransition(user?.role === 'Supervisor' ? 'Pending_HOD' : 'Approved', 
                    user?.role === 'Supervisor' ? { approvedBySupervisor: user?.name } : { approvedByHOD: user?.name }, 
                    'Request Approved')}
                  className={styles.btnPrimary} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  <ShieldCheck size={16} /> Approve
                </button>
              </>
            )}
            
            {canRegister && (
              <button onClick={() => handleStatusTransition('Registered', { registrationPlanning: user?.name })} className={styles.btnPrimary}>
                <Edit3 size={16} /> Register (Planning)
              </button>
            )}

            {canAssign && (
              <button 
                onClick={() => navigate(`/supervisor/assign/${card.id}`)}
                className={styles.btnPrimary} style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
              >
                <UserCheck size={16} /> Assign Artisan
              </button>
            )}

            {canStartWork && (
              <button onClick={() => handleStatusTransition('InProgress')} className={styles.btnPrimary} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <Play size={16} /> Start Work
              </button>
            )}

            {activeTab === 'back' && (card.status === 'InProgress' || card.status === 'Awaiting_SignOff') && !isEditingBack && (
              <button onClick={() => setIsEditingBack(true)} className={styles.btnSecondary}>
                <Edit3 size={16} /> Edit Feedback
              </button>
            )}

            {isEditingBack && (
              <>
                <button onClick={() => handleStatusTransition(card.status)} className={styles.btnSecondary}>
                  <Save size={16} /> Save Draft
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
                    className={styles.btnPrimary} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 15px rgba(16,185,129,0.4)' }}
                  >
                    <CheckCircle2 size={16} /> Complete & Submit
                  </button>
                )}
              </>
            )}

            {canCompleteWork && !isEditingBack && activeTab !== 'back' && (
              <button 
                onClick={() => {
                  setActiveTab('back');
                  setIsEditingBack(true);
                }}
                className={styles.btnPrimary} style={{ animation: 'pulse 2s infinite', boxShadow: '0 0 15px rgba(59,130,246,0.5)' }}
              >
                <ClipboardList size={16} /> Fill Feedback & Complete
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
                className={styles.btnPrimary} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
              >
                <UserCheck size={16} /> Sign Off
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
                className={styles.btnPrimary} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
              >
                <ShieldCheck size={16} /> Close Job Card
              </button>
            )}

            <button onClick={handlePrint} className={styles.btnIcon} title="Print Job Card">
              <Printer size={18} />
            </button>
          </div>
        </div>

        <div className={styles.workflowWrapper}>
          <WorkflowTracker currentStatus={card.status} />
        </div>
        
        {/* Custom Premium Tabs */}
        <div className={styles.tabContainer}>
          <div className={styles.tabStrip}>
            <button className={`${styles.tabBtn} ${activeTab === 'front' ? styles.tabActive : ''}`} onClick={() => setActiveTab('front')}>
              <FileText size={16} /> FRONT FORM
            </button>
            <button className={`${styles.tabBtn} ${activeTab === 'back' ? styles.tabActive : ''}`} onClick={() => setActiveTab('back')}>
              <Wrench size={16} /> BACK FORM (FEEDBACK)
            </button>
            <button className={`${styles.tabBtn} ${activeTab === 'history' ? styles.tabActive : ''}`} onClick={() => setActiveTab('history')}>
              <History size={16} /> AUDIT HISTORY
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.contentArea}>
        {activeTab === 'front' && (
          <div className={`${styles.premiumCard} printable-content`}>
            {/* Header Section for Print & Premium UI */}
            <div className={styles.cardHeader}>
              <div className={styles.headerTitleGrp}>
                <h1 className={styles.cardTitle}>JOB CARD FRONT</h1>
                <p className={styles.cardSubtitle}>MAINTENANCE & ENGINEERING SERVICES</p>
              </div>
              <div className={styles.headerMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>TICKET #</span>
                  <span className={styles.metaValue} style={{ color: pc }}>{card.ticketNumber}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>PRIORITY</span>
                  <span className={styles.metaValueHighlight} style={{ backgroundColor: `${pc}1a`, color: pc, borderColor: `${pc}33` }}>
                    {card.priority}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.cardBody}>
              {/* Section 1 */}
              <div className={styles.dataSection}>
                <h2 className={styles.sectionHeading}><User size={16} /> 1. GENERATION / ORIGINATOR DETAILS</h2>
                <div className={styles.dataGrid}>
                  <div className={styles.dataField}>
                    <label>Requested By</label>
                    <div className={styles.fieldValue}>{card.requestedBy}</div>
                  </div>
                  <div className={styles.dataField}>
                    <label>Date & Time Raised</label>
                    <div className={styles.fieldValue}>{card.dateRaised} at {card.timeRaised}</div>
                  </div>
                  <div className={styles.dataField}>
                    <label>Required Comp Date</label>
                    <div className={styles.fieldValue}>{card.requiredCompletionDate || 'Not specified'}</div>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className={styles.dataSection}>
                <h2 className={styles.sectionHeading}><Component size={16} /> 2. PLANT & ASSET INFORMATION</h2>
                <div className={styles.dataGrid}>
                  <div className={styles.dataField}>
                    <label>Plant / Asset Description</label>
                    <div className={styles.fieldValue}>{card.plantDescription}</div>
                  </div>
                  <div className={styles.dataField}>
                    <label>Plant Number / Asset ID</label>
                    <div className={styles.fieldValue}>{card.plantNumber}</div>
                  </div>
                  <div className={styles.dataField}>
                    <label>Plant Status</label>
                    <div className={styles.fieldValue}>{card.plantStatus?.toUpperCase()}</div>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className={styles.dataSection}>
                <h2 className={styles.sectionHeading}><AlertTriangle size={16} /> 3. DEFECT & WORK REQUEST</h2>
                <div className={styles.fullGrid}>
                  <div className={styles.dataField}>
                    <label>Defect / Problem Details</label>
                    <div className={styles.fieldText}>{card.defect || '—'}</div>
                  </div>
                  <div className={styles.dataField}>
                    <label>Work Request / Instruction</label>
                    <div className={styles.fieldText}>{card.workRequest || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div className={styles.dataSection}>
                <h2 className={styles.sectionHeading}><Settings size={16} /> 4. ALLOCATIONS & ASSIGNMENT</h2>
                <div className={styles.dataField} style={{ marginBottom: '16px' }}>
                  <label>Required Trades</label>
                  <div className={styles.tradeChips}>
                    {card.allocatedTrades?.length ? card.allocatedTrades.map(trade => (
                      <span key={trade} className={styles.tradeChip}>
                        {trade}
                      </span>
                    )) : <span className={styles.textMuted}>None specified</span>}
                  </div>
                </div>

                {assignment ? (
                  <div className={styles.assignmentBox}>
                    <h3 className={styles.assignmentTitle}>Active Assignment</h3>
                    <div className={styles.dataGrid}>
                      <div className={styles.dataField}>
                        <label>Assigned Artisan</label>
                        <div className={styles.fieldValue} style={{ color: '#a78bfa' }}>{assignment.artisanName}</div>
                      </div>
                      <div className={styles.dataField}>
                        <label>Section/Trade</label>
                        <div className={styles.fieldValue}>{assignment.section || '—'}</div>
                      </div>
                      <div className={styles.dataField}>
                        <label>Expected Timeline</label>
                        <div className={styles.fieldValue}>{assignment.expectedStartDate || '-'} to {assignment.expectedCompletionDate || '-'}</div>
                      </div>
                    </div>
                    {assignment.notes && (
                      <div className={styles.assignmentNotes}>
                        <strong>Supervisor Notes:</strong> {assignment.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.unassignedBox}>
                    <span className={styles.textMuted}>No artisan has been assigned to this job yet.</span>
                  </div>
                )}
              </div>

              {/* Section 5 Feedback Preview */}
              <div className={styles.dataSection}>
                <h2 className={styles.sectionHeading}><ClipboardList size={16} /> 5. EXECUTION FEEDBACK</h2>
                {!card.workDoneDetails && !card.dateFinished ? (
                  <div className={styles.emptyFeedback}>
                    Work has not yet been completed. Execution feedback will appear here once submitted by the artisan.
                  </div>
                ) : (
                  <div className={styles.feedbackContainer}>
                    <div className={styles.dataField} style={{ marginBottom: '16px' }}>
                      <label>Work Performed Details</label>
                      <div className={styles.fieldText}>{card.workDoneDetails}</div>
                    </div>
                    <div className={styles.dataGrid}>
                      <div className={styles.dataField}>
                        <label>Date Finished</label>
                        <div className={styles.fieldValue}>{card.dateFinished || '--'}</div>
                      </div>
                      <div className={styles.dataField}>
                        <label>Machine Downtime</label>
                        <div className={styles.fieldValue}>{card.machineDowntime || '--'}</div>
                      </div>
                      <div className={styles.dataField}>
                        <label>Was Breakdown?</label>
                        <div className={styles.fieldValue}>{card.isBreakdown ? 'YES' : 'NO'}</div>
                      </div>
                    </div>
                    {card.supervisorComments && (
                      <div className={styles.supervisorRemarks}>
                        <label>Supervisor QA Remarks</label>
                        <p>"{card.supervisorComments}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Signatures */}
              <div className={styles.dataSection}>
                <h2 className={styles.sectionHeading}><ShieldCheck size={16} /> 6. OFFICIAL SIGN-OFFS</h2>
                <div className={styles.signatureGrid}>
                  <div className={styles.sigBox}>
                    <span className={styles.sigRole}>Supervisor Approval</span>
                    <span className={styles.sigName}>{card.approvedBySupervisor || 'Pending...'}</span>
                  </div>
                  <div className={styles.sigBox}>
                    <span className={styles.sigRole}>HOD Approval</span>
                    <span className={styles.sigName}>{card.approvedByHOD || (card.priority === 'Critical' ? 'Pending...' : 'N/A')}</span>
                  </div>
                  <div className={styles.sigBox}>
                    <span className={styles.sigRole}>Planning Registration</span>
                    <span className={styles.sigName}>{card.registrationPlanning || 'Pending...'}</span>
                  </div>
                  <div className={styles.sigBox}>
                    <span className={styles.sigRole}>Originator Sign-off</span>
                    <span className={styles.sigName}>{card.originatorSignOff || 'Pending...'}</span>
                  </div>
                  <div className={styles.sigBox}>
                    <span className={styles.sigRole}>Final Closure</span>
                    <span className={styles.sigName}>{card.closedBy || 'Pending...'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'back' && (
          <div className={styles.animationFadeIn}>
            <JobCardBackForm 
              data={backData} 
              onChange={updates => setBackData(prev => ({ ...prev, ...updates }))} 
              readOnly={!isEditingBack}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className={`${styles.premiumCard} ${styles.animationFadeIn}`}>
            <div className={styles.cardHeader} style={{ marginBottom: '20px' }}>
              <div className={styles.headerTitleGrp}>
                <h2 className={styles.cardTitle}>AUDIT & TRACEABILITY LOG</h2>
                <p className={styles.cardSubtitle}>Complete timeline of all system actions for this job card.</p>
              </div>
            </div>
            <div className={styles.cardBody}>
              <AuditTimeline logs={history} />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default JobCardDetail;
