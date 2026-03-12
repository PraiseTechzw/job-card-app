import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobCards } from '../context/JobCardContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Printer, ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import styles from './Allocations.module.css';
import type { AllocationSheet, AllocationRow } from '../types';

const AllocationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { allocationSheets, addAllocationSheet, updateAllocationSheet, getJobCardByNumber } = useJobCards();

  const [sheet, setSheet] = useState<Partial<AllocationSheet>>({
    supervisor: user?.name || '',
    section: user?.department || '',
    date: new Date().toISOString().split('T')[0],
    rows: []
  });

  useEffect(() => {
    if (id) {
      const existing = allocationSheets.find(s => s.id === id);
      if (existing) setSheet(existing);
    }
  }, [id, allocationSheets]);

  const addRow = () => {
    const newRow: Partial<AllocationRow> = {
      id: Math.random().toString(36).substr(2, 9),
      artisanName: '',
      allocatedTask: '',
      jobCardNumber: '',
      estimatedTime: '',
      actualTimeTaken: ''
    };
    setSheet(prev => ({ ...prev, rows: [...(prev.rows || []), newRow as AllocationRow] }));
  };

  const removeRow = (rowId: string) => {
    setSheet(prev => ({ ...prev, rows: prev.rows?.filter(r => r.id !== rowId) }));
  };

  const updateRow = (rowId: string, field: keyof AllocationRow, value: string) => {
    setSheet(prev => ({
      ...prev,
      rows: prev.rows?.map(r => r.id === rowId ? { ...r, [field]: value } : r)
    }));
  };

  const handleSave = async () => {
    if (!sheet.supervisor || !sheet.section || !sheet.date) {
      alert('Please fill header details');
      return;
    }
    if (!sheet.rows || sheet.rows.length === 0) {
      alert('Add at least one row');
      return;
    }

    if (id) {
      await updateAllocationSheet(id, sheet);
    } else {
      await addAllocationSheet(sheet);
    }
    navigate('/allocations');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className="no-print">
          <button onClick={() => navigate('/allocations')} className="btn btn-ghost mb-2">
            <ArrowLeft size={18} /> Back to Register
          </button>
          <h1 className={styles.title}>{id ? 'Edit' : 'New'} Daily Work Allocation Sheet</h1>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={() => window.print()} className="btn btn-secondary">
            <Printer size={18} /> Print Form
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            <Save size={18} /> Save Register
          </button>
        </div>
      </header>

      <div className={styles.paperSheet}>
        <div className={styles.sheetHeader}>
          <div className={styles.headerTitle}>
            <h2 className="text-xl font-bold">DAILY WORK ALLOCATION REGISTER</h2>
            <p className="text-xs opacity-70">MAINTENANCE & ENGINEERING SERVICES</p>
          </div>
          <div className={styles.headerGrid}>
            <div className={styles.inputGroup}>
              <label>SUPERVISOR</label>
              <input 
                type="text" 
                value={sheet.supervisor} 
                onChange={e => setSheet({...sheet, supervisor: e.target.value})}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>SECTION</label>
              <input 
                type="text" 
                value={sheet.section} 
                onChange={e => setSheet({...sheet, section: e.target.value})}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>DATE</label>
              <input 
                type="date" 
                value={sheet.date} 
                onChange={e => setSheet({...sheet, date: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className={styles.sheetBody}>
          <table className={styles.allocationTable}>
            <thead>
              <tr>
                <th style={{ width: '200px' }}>ARTISAN NAME</th>
                <th>ALLOCATED TASK</th>
                <th style={{ width: '120px' }}>JOB CARD #</th>
                <th style={{ width: '100px' }}>EST. TIME</th>
                <th style={{ width: '100px' }}>ACTUAL TIME</th>
                <th className="no-print" style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {sheet.rows?.map((row) => {
                const jcExists = row.jobCardNumber ? getJobCardByNumber(row.jobCardNumber) : null;
                return (
                  <tr key={row.id}>
                    <td>
                      <input 
                        type="text" 
                        value={row.artisanName} 
                        onChange={e => updateRow(row.id, 'artisanName', e.target.value)}
                        placeholder="Name..."
                      />
                    </td>
                    <td>
                      <textarea 
                        rows={1}
                        value={row.allocatedTask} 
                        onChange={e => updateRow(row.id, 'allocatedTask', e.target.value)}
                        placeholder="Description of work..."
                      />
                    </td>
                    <td>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={row.jobCardNumber} 
                          onChange={e => updateRow(row.id, 'jobCardNumber', e.target.value)}
                          placeholder="JC-XXXX"
                        />
                        {jcExists && (
                          <div className="absolute right-2 top-2" title="Valid Job Card Found">
                            <CheckCircle2 size={14} className="text-green-500" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={row.estimatedTime} 
                        onChange={e => updateRow(row.id, 'estimatedTime', e.target.value)}
                        placeholder="Duration..."
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={row.actualTimeTaken} 
                        onChange={e => updateRow(row.id, 'actualTimeTaken', e.target.value)}
                        placeholder="..."
                      />
                    </td>
                    <td className="no-print">
                      <button onClick={() => removeRow(row.id)} className={styles.removeRowBtn}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {(!sheet.rows || sheet.rows.length === 0) && (
                <tr className="no-print">
                  <td colSpan={6} className="text-center py-8 text-slate-500 italic">
                    No rows added yet. Click the button below to start allocating tasks.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button onClick={addRow} className={`btn btn-secondary mt-4 no-print ${styles.addRowBtn}`}>
            <Plus size={16} /> Add Artisan Entry
          </button>
        </div>

        <div className={styles.sheetFooter}>
          <div className={styles.footerSignoff}>
            <div className={styles.signBox}>
              <div className={styles.signLine}></div>
              <span className={styles.signLabel}>SUPERVISOR SIGNATURE</span>
            </div>
            <div className={styles.signBox}>
              <div className={styles.signLine}></div>
              <span className={styles.signLabel}>MANAGER SIGNATURE</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .container { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
          .paperSheet { 
            box-shadow: none !important; 
            border: 2px solid #000 !important; 
            color: black !important;
            margin: 0 !important;
            width: 100% !important;
          }
          input, textarea { 
            border: none !important; 
            color: black !important;
            background: transparent !important;
            padding: 2px !important;
          }
          th { background: #eee !important; color: black !important; border: 1px solid #000 !important; }
          td { border: 1px solid #000 !important; }
        }
      `}</style>
    </div>
  );
};

export default AllocationForm;
