import React, { useState } from 'react';
import { useJobCards } from '../context/JobCardContext';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './JobCards.module.css';

const Approvals: React.FC = () => {
  const { jobCards } = useJobCards();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const pendingCards = jobCards.filter(card => {
    const isTargetStatus = (user?.role === 'HOD' && card.status === 'Pending_HOD') ||
                          (user?.role === 'Supervisor' && (card.status === 'Pending_Supervisor' || card.status === 'SignedOff'));
    
    return isTargetStatus &&
      (card.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
       card.plantDescription.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Approval Queue</h1>
          <p className={styles.subtitle}>Review and authorize maintenance requests</p>
        </div>
      </header>

      <div className={styles.filtersGlass}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by ticket or asset..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterBadge}>
          <Filter size={16} /> Filters
        </div>
      </div>

      {pendingCards.length > 0 ? (
        <div className={styles.tableCard}>
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
                  <td className={styles.ticketNo}>{card.ticketNumber}</td>
                  <td>{card.plantDescription}</td>
                  <td>{card.requestedBy}</td>
                  <td>{card.dateRaised}</td>
                  <td>
                    <span className={`badge badge-${card.priority.toLowerCase()}`}>
                      {card.priority}
                    </span>
                  </td>
                  <td>
                    <Link to={`/job-cards/view/${card.id}`} className="btn btn-primary btn-sm">
                      {card.status === 'SignedOff' ? 'Review & Close' : 'Review & Approve'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <ShieldCheck size={48} className="text-slate-600 mb-4" />
          <h3>All caught up!</h3>
          <p>No job cards are currently pending your approval.</p>
        </div>
      )}
    </div>
  );
};

export default Approvals;
