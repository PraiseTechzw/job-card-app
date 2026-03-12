import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../components/JobCardForm.module.css';
import type { JobCard, JobCardStatus } from '../types';
import { useJobCards } from '../context/JobCardContext';
import { useAuth } from '../context/AuthContext';
import { Printer, Edit3, ArrowLeft, CheckCircle, Save, ShieldCheck, UserCheck, Play, CheckCircle2 } from 'lucide-react';
import WorkflowTracker from '../components/WorkflowTracker';
import JobCardBackForm from '../components/JobCardBackForm';

const JobCardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getJobCard, updateJobCard } = useJobCards();
  const [card, setCard] = useState<JobCard | null>(null);
  const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');
  const [isEditingBack, setIsEditingBack] = useState(false);
  const [backData, setBackData] = useState<Partial<JobCard>>({});

  useEffect(() => {
    if (id) {
      const data = getJobCard(id);
      if (data) {
        setCard(data);
        setBackData(data);
      }
    }
  }, [id, getJobCard]);

  const handlePrint = () => {
    window.print();
  };

  const handleStatusTransition = (newStatus: JobCardStatus, extraFields = {}) => {
    if (card) {
      const updates = { 
        status: newStatus, 
        ...extraFields,
        ...backData 
      };
      updateJobCard(card.id, updates);
      setCard({ ...card, ...updates });
      setIsEditingBack(false);
    }
  };

  if (!card) return <div style={{ padding: '4rem', color: 'white' }}>Job Card not found.</div>;

  const canApprove = (user?.role === 'Supervisor' && card.status === 'Pending_Supervisor') || 
                   (user?.role === 'HOD' && card.status === 'Pending_HOD');
  
  const canRegister = user?.role === 'PlanningOffice' && card.status === 'Approved';
  const canAssign = user?.role === 'EngSupervisor' && card.status === 'Registered';
  const canStartWork = user?.role === 'Artisan' && card.status === 'Assigned';
  const canCompleteWork = user?.role === 'Artisan' && card.status === 'InProgress';
  const canSignOff = user?.role === 'Initiator' && card.status === 'Completed';
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
          </div>
          
          <div className="flex gap-2">
            {canApprove && (
              <button 
                onClick={() => handleStatusTransition(user?.role === 'Supervisor' ? 'Pending_HOD' : 'Approved', 
                  user?.role === 'Supervisor' ? { approvedBySupervisor: user?.name } : { approvedByHOD: user?.name })}
                className="btn btn-primary"
              >
                <ShieldCheck size={18} /> Approve
              </button>
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

            {activeTab === 'back' && (card.status === 'InProgress' || card.status === 'Completed') && !isEditingBack && (
              <button onClick={() => setIsEditingBack(true)} className="btn btn-secondary">
                <Edit3 size={18} /> Update Feedback
              </button>
            )}

            {isEditingBack && (
              <button onClick={() => handleStatusTransition(card.status)} className="btn btn-primary">
                <Save size={18} /> Save Feedback
              </button>
            )}

            {canCompleteWork && (
              <button 
                onClick={() => handleStatusTransition('Completed', { dateFinished: new Date().toISOString().split('T')[0] })}
                className="btn btn-success"
              >
                <CheckCircle2 size={18} /> Complete Work
              </button>
            )}

            {canSignOff && (
              <button 
                onClick={() => handleStatusTransition('SignedOff', { originatorSignOff: user?.name })}
                className="btn btn-primary"
              >
                <UserCheck size={18} /> Sign Off
              </button>
            )}

            {canClose && (
              <button 
                onClick={() => handleStatusTransition('Closed', { closedBy: user?.name })}
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
          </div>
        ) : (
          <JobCardBackForm 
            data={backData} 
            onChange={updates => setBackData(prev => ({ ...prev, ...updates }))} 
            readOnly={!isEditingBack}
          />
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

