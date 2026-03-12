import React, { useState } from 'react';
import { useJobCards } from '../context/JobCardContext';
import { Search, ClipboardList, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './JobCards.module.css';

const Planning: React.FC = () => {
  const { jobCards } = useJobCards();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const approvedCards = jobCards.filter(card => 
    card.status === 'Approved' &&
    (card.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     card.plantDescription.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={styles.pageContainer}>
      <header className={styles.tableHeader}>
        <div>
          <h1 className={styles.pageTitle}>Planning & Registration</h1>
          <p className={styles['text-muted']}>Register approved job cards into the maintenance schedule</p>
        </div>
      </header>

      <div className={styles.filtersGlass} style={{ marginBottom: '1.5rem', padding: '1.5rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search approved cards..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {approvedCards.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Job Card #</th>
                <th>Asset / Plant</th>
                <th>Requested By</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedCards.map(card => (
                <tr key={card.id}>
                  <td className={styles.ticketNumber}>{card.ticketNumber}</td>
                  <td>
                    <div className={styles.equipment}>{card.plantDescription}</div>
                    <div className={styles.location}>ID: {card.plantNumber}</div>
                  </td>
                  <td>{card.requestedBy}</td>
                  <td>
                    <span className={`badge badge-${card.priority.toLowerCase()}`}>
                      {card.priority}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-success">Approved</span>
                  </td>
                  <td>
                    <button 
                      onClick={() => navigate(`/job-cards/view/${card.id}`)}
                      className="btn btn-primary btn-sm flex items-center gap-1"
                    >
                      <Clock size={14} /> Register Job
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <ClipboardList size={64} className="empty-state-icon" />
          <h3 className="empty-state-title">No approved cards waiting</h3>
          <p>The queue is empty. New cards will appear here once authorized by supervisors.</p>
        </div>
      )}
    </div>
  );
};

export default Planning;
