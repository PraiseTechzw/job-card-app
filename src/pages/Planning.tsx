import React, { useState } from 'react';
import { useJobCards } from '../context/JobCardContext';
import { Search, Filter, ClipboardList, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './JobCards.module.css';

const Planning: React.FC = () => {
  const { jobCards } = useJobCards();
  const [searchTerm, setSearchTerm] = useState('');

  const approvedCards = jobCards.filter(card => 
    card.status === 'Approved' &&
    (card.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     card.plantDescription.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Planning & Registration</h1>
          <p className={styles.subtitle}>Register approved job cards into the maintenance schedule</p>
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

      {approvedCards.length > 0 ? (
        <div className={styles.tableCard}>
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
                  <td className={styles.ticketNo}>{card.ticketNumber}</td>
                  <td>{card.plantDescription}</td>
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
                    <Link to={`/job-cards/view/${card.id}`} className="btn btn-primary btn-sm">
                      <Clock size={14} /> Register Job
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <ClipboardList size={48} className="text-slate-600 mb-4" />
          <h3>No approved cards waiting</h3>
          <p>The queue is empty. New cards will appear here once authorized by supervisors.</p>
        </div>
      )}
    </div>
  );
};

export default Planning;
