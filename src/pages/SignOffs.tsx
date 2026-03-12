import React, { useState } from 'react';
import { useJobCards } from '../context/JobCardContext';
import { useAuth } from '../context/AuthContext';
import { Search, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './JobCards.module.css';

const SignOffs: React.FC = () => {
  const { jobCards } = useJobCards();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter for jobs that are completed and need sign-off
  const pendingSignOff = jobCards.filter(card => 
    card.status === 'Awaiting_SignOff' &&
    (user?.role === 'Admin' || card.requestedBy === user?.name) &&
    (card.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     card.plantDescription.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={styles.pageContainer}>
      <header className={styles.tableHeader}>
        <div>
          <h1 className={styles.pageTitle}>Originator Sign-off Queue</h1>
          <p className={styles['text-muted']}>Review completed work and provide your final sign-off</p>
        </div>
      </header>

      <div className={styles.filtersGlass} style={{ marginBottom: '1.5rem', padding: '1.5rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search completed jobs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {pendingSignOff.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Plant / Asset</th>
                <th>Artisan</th>
                <th>Date Finished</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingSignOff.map(card => (
                <tr key={card.id}>
                  <td className={styles.ticketNumber}>{card.ticketNumber}</td>
                  <td>
                    <div className={styles.equipment}>{card.plantDescription}</div>
                    <div className={styles.location}>ID: {card.plantNumber}</div>
                  </td>
                  <td>{card.issuedTo || '---'}</td>
                  <td>{card.dateFinished || '---'}</td>
                  <td>
                    <button 
                      onClick={() => navigate(`/job-cards/view/${card.id}`)}
                      className="btn btn-primary btn-sm px-4"
                    >
                      Review & Sign-off
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <Clock size={64} className="empty-state-icon" />
          <h3 className="empty-state-title">No jobs awaiting sign-off</h3>
          <p>You're all caught up with your maintenance requests!</p>
        </div>
      )}
    </div>
  );
};

export default SignOffs;
