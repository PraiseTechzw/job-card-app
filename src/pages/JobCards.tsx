import React from 'react';
import { Eye, Edit3, Plus } from 'lucide-react';
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
    case 'Awaiting_SignOff': return 'badge-info';
    case 'SignedOff': return 'badge-success';
    case 'Closed': return 'badge-ghost';
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
  const [statusFilter, setStatusFilter] = React.useState<string>('All');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('All');

  const filteredCards = cards.filter(card => {
    const statusMatch = statusFilter === 'All' || card.status === statusFilter;
    const priorityMatch = priorityFilter === 'All' || card.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  return (
    <div className={styles.pageContainer}>
      <div className={styles.tableHeader}>
        <div>
          <h1 className={styles.pageTitle}>Job Card Register</h1>
          <p className="text-muted">Manage and track all maintenance requests.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/job-cards/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={18} /> New Job Card
          </Link>
        </div>
      </div>

      <div className={styles.filtersGlass} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border-white/10 rounded px-2 py-1 text-white text-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Pending_Supervisor">Pending Supervisor</option>
            <option value="Approved">Approved</option>
            <option value="Registered">Registered</option>
            <option value="Assigned">Assigned</option>
            <option value="InProgress">In Progress</option>
            <option value="Awaiting_SignOff">Awaiting Sign-off</option>
            <option value="SignedOff">Signed Off (Orig)</option>
            <option value="Closed">Closed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Priority:</label>
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-800 border-white/10 rounded px-2 py-1 text-white text-sm"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
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
            {[...filteredCards].reverse().map(card => (
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
            {filteredCards.length === 0 && (
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

