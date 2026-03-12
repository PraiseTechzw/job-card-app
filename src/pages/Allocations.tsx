import React, { useState } from 'react';
import { useJobCards } from '../context/JobCardContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Printer, Search } from 'lucide-react';
import styles from './Allocations.module.css';

const Allocations: React.FC = () => {
  const { user } = useAuth();
  const { workAllocations, addWorkAllocation, deleteWorkAllocation, updateWorkAllocation } = useJobCards();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newEntry, setNewEntry] = useState({
    supervisor: user?.name || '',
    section: user?.department || '',
    date: new Date().toISOString().split('T')[0],
    artisanName: '',
    allocatedTask: '',
    jobCardNumber: '',
    estimatedTime: '',
    actualTimeTaken: ''
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addWorkAllocation(newEntry);
    setNewEntry({
      ...newEntry,
      artisanName: '',
      allocatedTask: '',
      jobCardNumber: '',
      estimatedTime: '',
      actualTimeTaken: ''
    });
  };

  const filteredAllocations = workAllocations.filter(a => 
    a.artisanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.jobCardNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Daily Work Allocation Register</h1>
          <p className={styles.subtitle}>Maintenance & Engineering Operations</p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer size={18} /> Print Register
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Form to add new allocation */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>New Allocation Entry</h2>
          <form className={styles.addForm} onSubmit={handleAdd}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Artisan Name</label>
                <input 
                  type="text" 
                  required 
                  value={newEntry.artisanName}
                  onChange={e => setNewEntry({...newEntry, artisanName: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Job Card #</label>
                <input 
                  type="text" 
                  value={newEntry.jobCardNumber}
                  onChange={e => setNewEntry({...newEntry, jobCardNumber: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Allocated Task</label>
                <input 
                  type="text" 
                  required 
                  value={newEntry.allocatedTask}
                  onChange={e => setNewEntry({...newEntry, allocatedTask: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Est. Time</label>
                <input 
                  type="text" 
                  placeholder="e.g. 2 hrs" 
                  value={newEntry.estimatedTime}
                  onChange={e => setNewEntry({...newEntry, estimatedTime: e.target.value})}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <Plus size={18} /> Add to Register
            </button>
          </form>
        </div>

        {/* List of allocations */}
        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <h2 className={styles.cardTitle}>Register Entries</h2>
            <div className={styles.searchBox}>
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search by artisan or job card..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Artisan</th>
                  <th>Task</th>
                  <th>Job Card #</th>
                  <th>Est. Time</th>
                  <th>Actual Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllocations.length > 0 ? (
                  filteredAllocations.map(alloc => (
                    <tr key={alloc.id}>
                      <td>{alloc.date}</td>
                      <td>{alloc.artisanName}</td>
                      <td>{alloc.allocatedTask}</td>
                      <td>{alloc.jobCardNumber || 'N/A'}</td>
                      <td>{alloc.estimatedTime}</td>
                      <td>
                        <input 
                          type="text" 
                          className={styles.inlineInput}
                          value={alloc.actualTimeTaken || ''} 
                          onChange={e => updateWorkAllocation(alloc.id, { actualTimeTaken: e.target.value })}
                          placeholder="Set..."
                        />
                      </td>
                      <td>
                        <button onClick={() => deleteWorkAllocation(alloc.id)} className={styles.deleteBtn}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className={styles.empty}>No entries found for today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Allocations;
