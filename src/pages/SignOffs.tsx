import React, { useState } from 'react';
import { useJobCards } from '../context/JobCardContext';
import { useAuth } from '../context/AuthContext';
import { Search, Eye, Clock } from 'lucide-react';
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
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Originator Sign-off Queue</h1>
          <p className={styles.subtitle}>Review completed work and provide your final sign-off</p>
        </div>
      </header>

      <div className={styles.filtersGlass}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search completed jobs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
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
                <td className={styles.ticketNo}>{card.ticketNumber}</td>
                <td>
                  <div className="font-medium text-white">{card.plantDescription}</div>
                  <div className="text-xs text-slate-500">ID: {card.plantNumber}</div>
                </td>
                <td>{card.issuedTo || '---'}</td>
                <td>{card.dateFinished || '---'}</td>
                <td>
                  <button 
                    onClick={() => navigate(`/job-cards/view/${card.id}`)}
                    className="btn btn-sm btn-primary flex items-center gap-1"
                  >
                    <Eye size={14} /> Review & Sign-off
                  </button>
                </td>
              </tr>
            ))}
            {pendingSignOff.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-20 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Clock size={40} className="text-slate-700" />
                    <p>No jobs currently awaiting your sign-off.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SignOffs;
