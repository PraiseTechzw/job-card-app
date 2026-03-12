import React from 'react';
import { Eye, Edit3, Filter, Plus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './JobCards.module.css';
import type { JobCard } from '../types';
import { useJobCards } from '../context/JobCardContext';

const getStatusBadgeClass = (status: JobCard['status']) => {
  switch (status) {
    case 'Draft': return 'badge-info';
    case 'Pending_Supervisor': 
    case 'Pending_HOD': return 'badge-warning';
    case 'Approved': 
    case 'Registered':
    case 'Assigned': return 'badge-success';
    case 'InProgress': return 'badge-warning';
    case 'Completed': 
    case 'SignedOff': return 'badge-success';
    case 'Closed': return 'badge-info';
    case 'Rejected': return 'badge-danger';
    default: return 'badge-info';
  }
};

const getPriorityBadgeClass = (priority: JobCard['priority']) => {
  switch (priority) {
    case 'Low': return 'badge-info';
    case 'Medium': return 'badge-warning';
    case 'High': 
    case 'Critical': return 'badge-danger';
    default: return 'badge-info';
  }
};

const JobCards: React.FC = () => {
  const { jobCards: cards } = useJobCards();
  const navigate = useNavigate();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.tableHeader}>
        <div>
          <h1 className={styles.pageTitle}>Job Card Register</h1>
          <p className="text-muted">Manage and track all maintenance requests.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost">
            <Filter size={18} /> Filter
          </button>
          <Link to="/job-cards/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={18} /> New Job Card
          </Link>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Asset / Plant</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Raised By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...cards].reverse().map(card => (
              <tr key={card.id}>
                <td className={styles.ticketNumber}>{card.ticketNumber}</td>
                <td>
                  <div className={styles.equipment}>{card.plantDescription}</div>
                  <div className={styles.location}>ID: {card.plantNumber}</div>
                </td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(card.status)}`}>
                    {card.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getPriorityBadgeClass(card.priority)}`}>
                    {card.priority}
                  </span>
                </td>
                <td>{card.requestedBy}</td>
                <td>{card.dateRaised}</td>
                <td>
                  <div className={styles.actionCell}>
                    <button 
                      className={`${styles.iconBtn} ${styles.primary}`} 
                      onClick={() => navigate(`/job-cards/view/${card.id}`)}
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {(card.status === 'Draft' || card.status === 'Pending_Supervisor') && (
                      <button 
                        className={styles.iconBtn} 
                        onClick={() => navigate(`/job-cards/edit/${card.id}`)}
                        title="Edit"
                      >
                        <Edit3 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {cards.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No job cards found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobCards;

