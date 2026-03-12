import React from 'react';
import { ClipboardList, Clock, CheckCircle, AlertOctagon, Plus, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { useAuth } from '../context/AuthContext';
import { useJobCards } from '../context/JobCardContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { jobCards } = useJobCards();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const getStats = () => {
    if (!jobCards || !Array.isArray(jobCards)) return [];
    
    const countStatus = (status: string) => jobCards.filter(c => c.status === status).length;
    
    // Check for overdue (InProgress or Assigned and past requiredCompletionDate)
    const today = new Date().toISOString().split('T')[0];
    const overdueCount = jobCards.filter(c => 
      ['Assigned', 'InProgress'].includes(c.status) && 
      c.requiredCompletionDate && 
      c.requiredCompletionDate < today
    ).length;

    const baseStats = [
      { label: 'Total Raised', value: jobCards.length.toString(), icon: ClipboardList, type: 'primary' },
      { label: 'Pending Appr', value: (countStatus('Pending_Supervisor') + countStatus('Pending_HOD')).toString(), icon: AlertOctagon, type: 'urgent' },
      { label: 'InProgress', value: countStatus('InProgress').toString(), icon: Clock, type: 'warning' },
      { label: 'Overdue', value: overdueCount.toString(), icon: AlertOctagon, type: 'danger' },
      { label: 'Closed', value: countStatus('Closed').toString(), icon: CheckCircle, type: 'success' },
    ];

    if (user?.role === 'Artisan') {
      const myJobs = jobCards.filter(c => c.issuedTo === user.name);
      return [
        { label: 'My Total', value: myJobs.length.toString(), icon: ClipboardList, type: 'primary' },
        { label: 'My InProgress', value: myJobs.filter(c => c.status === 'InProgress').length.toString(), icon: Clock, type: 'warning' },
        { label: 'My Done', value: myJobs.filter(c => c.status === 'Awaiting_SignOff').length.toString(), icon: CheckCircle, type: 'success' },
      ];
    }

    return baseStats;
  };

  const stats = getStats();
  
  // Detailed full-status summary for all admins/supervisors
  const statusSummary = [
    { label: 'Draft', count: jobCards.filter(c => c.status === 'Draft').length, color: 'text-slate-400' },
    { label: 'Pending', count: jobCards.filter(c => ['Pending_Supervisor', 'Pending_HOD'].includes(c.status)).length, color: 'text-amber-400' },
    { label: 'Approved', count: jobCards.filter(c => c.status === 'Approved').length, color: 'text-blue-400' },
    { label: 'Registered', count: jobCards.filter(c => c.status === 'Registered').length, color: 'text-cyan-400' },
    { label: 'Assigned', count: jobCards.filter(c => c.status === 'Assigned').length, color: 'text-indigo-400' },
    { label: 'InProgress', count: jobCards.filter(c => c.status === 'InProgress').length, color: 'text-orange-400' },
    { label: 'Completed', count: jobCards.filter(c => c.status === 'Awaiting_SignOff').length, color: 'text-emerald-400' },
    { label: 'SignedOff', count: jobCards.filter(c => c.status === 'SignedOff').length, color: 'text-green-400' },
    { label: 'Closed', count: jobCards.filter(c => c.status === 'Closed').length, color: 'text-slate-500' },
  ];

  const recentCards = Array.isArray(jobCards) ? [...jobCards].reverse().slice(0, 10) : [];

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className={styles.title}>System Overview</h1>
            <p className={styles.subtitle}>{currentDate} • {user?.department} ({user?.role})</p>
          </div>
          
          <div className="flex gap-3">
            <Link to="/reports" className="btn btn-secondary">
              <FileText size={18} /> Detailed Reports
            </Link>
            {['Initiator', 'Admin'].includes(user?.role || '') && (
              <Link to="/job-cards/new" className="btn btn-primary">
                <Plus size={18} /> Raise Job Card
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <div key={idx} className={`glass-panel ${styles.statCard} ${styles[stat.type]}`}>
            <div className={styles.iconWrapper}>
              <stat.icon size={24} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <div className={styles.recentSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Task Activity</h2>
              <Link to="/job-cards" className={styles.linkBtn}>Full Register</Link>
            </div>
            
            <div className={styles.recentList}>
              {recentCards.map(card => (
                <Link key={card.id} to={`/job-cards/view/${card.id}`} className={styles.recentItem}>
                  <div className={styles.recentDetails}>
                    <div className={styles.recentMain}>
                      <span className={styles.recentTicket}>{card.ticketNumber}</span>
                      <span className={styles.recentAsset}>{card.plantDescription}</span>
                    </div>
                    <div className={styles.recentMeta}>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10`}>
                        {card.status.replace('_', ' ')}
                      </span>
                      <span className="mx-2 opacity-30">|</span>
                      <span>By: {card.requestedBy}</span>
                    </div>
                  </div>
                  <div className={styles.recentTime}>
                    {new Date(card.createdAt).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div>
           <div className="glass-panel p-6 h-full">
            <h2 className="text-lg font-bold mb-6 text-white border-b border-white/10 pb-2">Status Distribution</h2>
            <div className="space-y-4">
              {statusSummary.map(s => (
                <div key={s.label} className="flex justify-between items-center group">
                  <span className="text-sm text-slate-400 group-hover:text-white transition-colors">{s.label}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${s.color}`}>{s.count}</span>
                    <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-current ${s.color}`} 
                        style={{ width: `${(s.count / (jobCards.length || 1)) * 100}%`, opacity: 0.6 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

