import React, { useState } from 'react';
import { useJobCards } from '../context/JobCardContext';
import { useAuth } from '../context/AuthContext';
import { Search, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './JobCards.module.css';

const Approvals: React.FC = () => {
  const { jobCards } = useJobCards();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const pendingCards = jobCards.filter(card => {
    const isTargetStatus = (user?.role === 'HOD' && card.status === 'Pending_HOD') ||
                          ((user?.role === 'Supervisor' || user?.role === 'EngSupervisor') && (card.status === 'Pending_Supervisor' || card.status === 'SignedOff')) ||
                          (user?.role === 'Admin' && ['Pending_Supervisor', 'Pending_HOD', 'SignedOff'].includes(card.status));
    
    return isTargetStatus &&
      (card.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
       card.plantDescription.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className={styles.pageContainer}>
      <header className={styles.tableHeader}>
        <div>
          <h1 className={styles.pageTitle}>Approval Queue</h1>
          <p className={styles['text-muted']}>Review and authorize maintenance requests awaiting your signature</p>
        </div>
      </header>

      <div className={styles.filtersGlass} style={{ marginBottom: '1.5rem', padding: '1.5rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search pending requests..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {pendingCards.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Job Card #</th>
                <th>Asset / Plant</th>
                <th>Requested By</th>
                <th>Date Raised</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingCards.map(card => (
                <tr key={card.id}>
                  <td className={styles.ticketNumber}>{card.ticketNumber}</td>
                  <td>
                    <div className={styles.equipment}>{card.plantDescription}</div>
                    <div className={styles.location}>ID: {card.plantNumber}</div>
                  </td>
                  <td>{card.requestedBy}</td>
                  <td>{card.dateRaised}</td>
                  <td>
                    <span className={`badge badge-${card.priority.toLowerCase()}`}>
                      {card.priority}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => navigate(`/job-cards/view/${card.id}`)}
                      className="btn btn-primary btn-sm px-4"
                    >
                      {card.status === 'SignedOff' ? 'Review & Close' : 'Review & Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <ShieldCheck size={64} className="empty-state-icon" />
          <h3 className="empty-state-title">All caught up!</h3>
          <p>No job cards are currently pending your approval.</p>
        </div>
      )}
    </div>
  );
};

export default Approvals;
