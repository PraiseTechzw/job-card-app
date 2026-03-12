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
    
    switch (user?.role) {
      case 'Artisan':
        return [
          { label: 'Assigned to Me', value: jobCards.filter(c => c.issuedTo === user.name).length.toString(), icon: ClipboardList, type: 'primary' },
          { label: 'In Progress', value: jobCards.filter(c => c.status === 'InProgress' && c.issuedTo === user.name).length.toString(), icon: Clock, type: 'warning' },
          { label: 'Completed', value: jobCards.filter(c => c.status === 'Completed' && c.issuedTo === user.name).length.toString(), icon: CheckCircle, type: 'success' },
        ];
      case 'Supervisor':
        return [
          { label: 'Pending My Appr.', value: jobCards.filter(c => c.status === 'Pending_Supervisor').length.toString(), icon: AlertOctagon, type: 'urgent' },
          { label: 'Ready for Closure', value: jobCards.filter(c => c.status === 'SignedOff').length.toString(), icon: CheckCircle, type: 'success' },
          { label: 'Total active', value: jobCards.filter(c => !['Closed', 'Rejected'].includes(c.status)).length.toString(), icon: ClipboardList, type: 'primary' },
        ];
      case 'EngSupervisor':
        return [
          { label: 'Total Active', value: jobCards.filter(c => !['Closed', 'Rejected'].includes(c.status)).length.toString(), icon: ClipboardList, type: 'primary' },
          { label: 'Needs Assignment', value: jobCards.filter(c => c.status === 'Registered').length.toString(), icon: Clock, type: 'warning' },
          { label: 'Resolved (Last 7d)', value: jobCards.filter(c => c.status === 'Closed').length.toString(), icon: CheckCircle, type: 'success' },
        ];
      default:
        return [
          { label: 'Total Raised', value: jobCards.length.toString(), icon: ClipboardList, type: 'primary' },
          { label: 'In Progress', value: jobCards.filter(c => c.status === 'InProgress').length.toString(), icon: Clock, type: 'warning' },
          { label: 'Resolved/Closed', value: jobCards.filter(c => c.status === 'Closed').length.toString(), icon: CheckCircle, type: 'success' },
        ];
    }
  };

  const stats = getStats();
  const recentCards = Array.isArray(jobCards) ? [...jobCards].reverse().slice(0, 5) : [];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={styles.title}>Welcome back, {user?.name}</h1>
            <p className={styles.subtitle}>{currentDate} • {user?.department} Department ({user?.role})</p>
          </div>
          
          {['Initiator', 'Admin'].includes(user?.role || '') && (
            <Link to="/job-cards/new" className="btn btn-primary" style={{textDecoration: 'none'}}>
              <Plus size={18} /> Raise Job Card
            </Link>
          )}
        </div>
      </div>

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

      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <Link to="/job-cards" className={styles.linkBtn}>View All Job Cards</Link>
        </div>
        
        {recentCards.length > 0 ? (
          <div className={styles.recentList}>
            {recentCards.map(card => (
              <Link key={card.id} to={`/job-cards/view/${card.id}`} className={styles.recentItem}>
                <div className={styles.recentIcon}>
                  <FileText size={20} />
                </div>
                <div className={styles.recentDetails}>
                  <div className={styles.recentMain}>
                    <span className={styles.recentTicket}>{card.ticketNumber}</span>
                    <span className={styles.recentAsset}>{card.plantDescription}</span>
                  </div>
                  <div className={styles.recentMeta}>
                    <span>{card.status.replace('_', ' ')}</span> • <span>{card.priority} Priority</span>
                  </div>
                </div>
                <div className={styles.recentTime}>
                  {new Date(card.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <ClipboardList size={48} />
            <h3>No recent job cards</h3>
            <p>Your recent activity will appear here once job cards are raised or assigned.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

