import React, { useState } from 'react';
import { useJobCards } from '../context/JobCardContext';
import { Plus, Eye, History, Search, Filter, Calendar, MapPin, HardHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Allocations.module.css';

const Allocations: React.FC = () => {
  const navigate = useNavigate();
  const { allocationSheets, deleteAllocationSheet } = useJobCards();
  
  const [dateFilter, setDateFilter] = useState('');
  const [supervisorFilter, setSupervisorFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSheets = allocationSheets.filter(sheet => {
    const matchesSearch = sheet.supervisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        sheet.section.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || sheet.date === dateFilter;
    const matchesSupervisor = !supervisorFilter || sheet.supervisor.toLowerCase().includes(supervisorFilter.toLowerCase());
    const matchesSection = !sectionFilter || sheet.section.toLowerCase().includes(sectionFilter.toLowerCase());

    return matchesSearch && matchesDate && matchesSupervisor && matchesSection;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Daily Work Allocation Register</h1>
          <p className={styles.subtitle}>Unified log of maintenance assignments</p>
        </div>
        <button onClick={() => navigate('/allocations/new')} className="btn btn-primary">
          <Plus size={18} /> New Daily Sheet
        </button>
      </header>

      <div className={styles.filtersGlass}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Quick search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4 flex-1">
          <div className={styles.filterGroup}>
            <Calendar size={14} className="text-blue-400" />
            <input 
              type="date" 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)}
              className={styles.filterInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <HardHat size={14} className="text-amber-400" />
            <input 
              type="text" 
              placeholder="Supervisor..." 
              value={supervisorFilter} 
              onChange={e => setSupervisorFilter(e.target.value)}
              className={styles.filterInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <MapPin size={14} className="text-emerald-400" />
            <input 
              type="text" 
              placeholder="Section..." 
              value={sectionFilter} 
              onChange={e => setSectionFilter(e.target.value)}
              className={styles.filterInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.sheetGrid}>
        {filteredSheets.map(sheet => (
          <div key={sheet.id} className={styles.sheetCard} onClick={() => navigate(`/allocations/edit/${sheet.id}`)}>
            <div className={styles.cardHeader}>
              <div className={styles.cardInfo}>
                <span className={styles.cardDate}>{new Date(sheet.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'})}</span>
                <h3 className={styles.cardSupervisor}>{sheet.supervisor}</h3>
                <span className={styles.cardSection}>{sheet.section}</span>
              </div>
              <div className={styles.rowCount}>
                <History size={14} /> {sheet.rows?.length || 0} entries
              </div>
            </div>
            
            <div className={styles.cardPreview}>
              {sheet.rows?.slice(0, 3).map(row => (
                <div key={row.id} className={styles.previewRow}>
                  <span className={styles.pName}>{row.artisanName}</span>
                  <span className={styles.pTask}>{row.allocatedTask.slice(0, 30)}...</span>
                </div>
              ))}
              {sheet.rows?.length > 3 && (
                <div className={styles.moreCount}>+ {sheet.rows.length - 3} more entries</div>
              )}
            </div>

            <div className={styles.cardFooter}>
              <button className="btn btn-sm btn-ghost" onClick={(e) => {
                e.stopPropagation();
                navigate(`/allocations/edit/${sheet.id}`);
              }}>
                <Eye size={14} /> View / Edit
              </button>
              <button className="btn btn-sm btn-ghost text-red-500 hover:bg-red-500/10" onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this record?')) deleteAllocationSheet(sheet.id);
              }}>
                Delete
              </button>
            </div>
          </div>
        ))}

        {filteredSheets.length === 0 && (
          <div className="col-span-full py-20 text-center opacity-50">
            <Filter size={48} className="mx-auto mb-4" />
            <p>No allocation registers found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Allocations;
