import React from 'react';
import { Eye, Edit3, Plus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './JobCards.module.css';
import type { JobCard } from '../types';
import { useJobCards } from '../context/JobCardContext';
import { useAuth } from '../context/AuthContext';

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

import { Search } from 'lucide-react';
import SEO from '../components/SEO';

const JobCards: React.FC = () => {
  const { jobCards: cards } = useJobCards();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [statusFilter, setStatusFilter] = React.useState<string>('All');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('All');
  const [sectionFilter, setSectionFilter] = React.useState<string>('All');
  const [dateFrom, setDateFrom] = React.useState<string>('');
  const [dateTo, setDateTo] = React.useState<string>('');

  const filteredCards = cards.filter(card => {
    const s = searchTerm.toLowerCase();
    const searchMatch = !searchTerm || 
      card.ticketNumber.toLowerCase().includes(s) ||
      card.requestedBy?.toLowerCase().includes(s) ||
      card.plantNumber?.toLowerCase().includes(s) ||
      card.plantDescription?.toLowerCase().includes(s) ||
      card.issuedTo?.toLowerCase().includes(s);

    if (user?.role === 'Artisan' && card.issuedTo?.toLowerCase() !== user?.name?.toLowerCase()) {
      return false;
    }

    const statusMatch = statusFilter === 'All' || card.status === statusFilter;
    const priorityMatch = priorityFilter === 'All' || card.priority === priorityFilter;
    
    // Check for section in multiple possible places (fitting, electrical, etc are booleans in types but we might want a simpler check)
    // Actually, JobCard has 'fitting', 'tooling', etc. Let's assume sectionFilter is one of those or 'All'
    const sectionMatch = sectionFilter === 'All' || (card as any)[sectionFilter.toLowerCase()] === true;

    const dateMatch = (!dateFrom || card.dateRaised >= dateFrom) && 
                     (!dateTo || card.dateRaised <= dateTo);

    return searchMatch && statusMatch && priorityMatch && sectionMatch && dateMatch;
  });

  return (
    <div className={styles.pageContainer}>
      <SEO title="Job Card Register" description="View and manage all maintenance job cards and requests." />
      <div className={styles.tableHeader}>
        <div>
          <h1 className={styles.pageTitle}>{user?.role === 'Artisan' ? 'My Active Jobs' : 'Job Card Register'}</h1>
          <p className="text-muted">{user?.role === 'Artisan' ? 'Manage your assigned maintenance tasks.' : 'Manage and track all maintenance requests.'}</p>
        </div>
        <div className="flex gap-2">
          {user?.role !== 'Artisan' && (
            <Link to="/job-cards/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <Plus size={18} /> New Job Card
            </Link>
          )}
        </div>
      </div>

      <div className={`${styles.filtersGlass} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4`}>
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search #, plant, requester..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Status</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
          >
            <option value="All">All Statuses</option>
            {user?.role === 'Artisan' ? (
              <>
                <option value="Assigned">Assigned</option>
                <option value="InProgress">In Progress</option>
                <option value="Awaiting_SignOff">Awaiting Sign-off</option>
                <option value="SignedOff">Completed / Signed Off</option>
              </>
            ) : (
              <>
                <option value="Draft">Draft</option>
                <option value="Pending_Supervisor">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Registered">Registered</option>
                <option value="Assigned">Assigned</option>
                <option value="InProgress">In Progress</option>
                <option value="Awaiting_SignOff">Awaiting Sign-off</option>
                <option value="SignedOff">Signed Off</option>
                <option value="Closed">Closed</option>
              </>
            )}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Priority</label>
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="form-select"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {user?.role !== 'Artisan' && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Section</label>
            <select 
              value={sectionFilter} 
              onChange={(e) => setSectionFilter(e.target.value)}
              className="form-select"
            >
              <option value="All">All Sections</option>
              <option value="Fitting">Fitting</option>
              <option value="Electrical">Electrical</option>
              <option value="Tooling">Tooling</option>
              <option value="InstAndControl">Inst & Control</option>
              <option value="MachineShop">Machine Shop</option>
            </select>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-2 lg:gap-1">
          <div className="flex flex-col w-full">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1">From</label>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="form-input w-full"
              style={{ padding: '0.6rem 0.75rem' }}
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1">To</label>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="form-input w-full"
              style={{ padding: '0.6rem 0.75rem' }}
            />
          </div>
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

