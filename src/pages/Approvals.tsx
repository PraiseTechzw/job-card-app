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
                          (user?.role === 'Supervisor' && (card.status === 'Pending_Supervisor' || card.status === 'SignedOff'));
    
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

      <div className={styles.filtersGlass} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1.5rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search pending requests..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white text-sm outline-none focus:border-blue-500/50"
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
        <div className="flex flex-col items-center justify-center py-24 glass-panel border-dashed border-2 border-white/5 opacity-50">
          <ShieldCheck size={64} className="text-slate-700 mb-4" />
          <h3 className="text-xl font-bold text-white">All caught up!</h3>
          <p className="text-slate-400">No job cards are currently pending your approval.</p>
        </div>
      )}
    </div>
  );
};

export default Approvals;
