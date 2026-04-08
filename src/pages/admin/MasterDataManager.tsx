import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Database, ArrowLeft, Plus, Edit2, 
  Search, Filter, 
  AlertTriangle, Power, Tag, RefreshCw, X
} from 'lucide-react';
import styles from '../JobCards.module.css';
import adminStyles from './AdminTheme.module.css';

const DATA_TYPES = [
  'Departments', 'Plants / Assets', 'Equipment Categories', 
  'Job Types', 'Failure Codes', 'Root Cause Codes', 'Sections'
];

export default function MasterDataManager() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState('Departments');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [masterData, setMasterData] = useState<any>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ code: '', name: '', department: '' });

  const fetchMasterData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/admin/config');
      if (res.data.master_data) {
        setMasterData(res.data.master_data);
      } else {
        // Fallback or empty init
        setMasterData({
          'Departments': [
            { id: '1', code: 'MECH', name: 'Mechanical Maintenance', active: true },
            { id: '2', code: 'ELEC', name: 'Electrical Engineering', active: true }
          ]
        });
      }
    } catch (e) {
      console.error('Master data sync failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  const filteredData = useMemo(() => {
    const list = masterData[activeType] || [];
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter((item: any) => 
      item.name?.toLowerCase().includes(s) || 
      item.code?.toLowerCase().includes(s)
    );
  }, [activeType, search, masterData]);

  const toggleStatus = async (id: string) => {
    const updatedList = masterData[activeType].map((item: any) => 
      item.id === id ? { ...item, active: !item.active } : item
    );
    const updatedData = { ...masterData, [activeType]: updatedList };
    try {
      await axios.post('/api/admin/config', { key: 'master_data', value: updatedData });
      setMasterData(updatedData);
      toast.success('Master data status updated.');
    } catch (e) {
      toast.error('Failed to update status.');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = crypto.randomUUID();
    const itemToAdd = { ...newItem, id, active: true };
    const updatedList = [...(masterData[activeType] || []), itemToAdd];
    const updatedData = { ...masterData, [activeType]: updatedList };
    try {
      await axios.post('/api/admin/config', { key: 'master_data', value: updatedData });
      setMasterData(updatedData);
      setShowAddModal(false);
      setNewItem({ code: '', name: '', department: '' });
    } catch (e) {
      toast.error('Failed to add master record.');
    }
  };

  return (
    <div className={`${styles.pageContainer} ${adminStyles.page}`}>
      <div className={adminStyles.hero}>
        <header className={adminStyles.header}>
          <div className={adminStyles.headerMain}>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/dashboard')} style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
            <div className={adminStyles.headerText}>
              <p className={adminStyles.eyebrow}>System Governance</p>
              <div className={adminStyles.titleRow}>
                <span className={adminStyles.titleIcon}>
                  <Database size={20} />
                </span>
                <div>
                  <h1 className={adminStyles.title}>Master Data Registry</h1>
                  <p className={adminStyles.subtitle}>Reference data now uses the same governance theme and stacks cleanly when space gets tight.</p>
                </div>
              </div>
            </div>
          </div>
          <div className={adminStyles.headerActions}>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ gap: 8 }}>
              <Plus size={16} /> Add {activeType.slice(0, -1)}
            </button>
          </div>
        </header>
      </div>

      <div className={adminStyles.sidebarGrid}>
        {/* Data Types Selector */}
        <div className={adminStyles.panel}>
          <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', margin: '14px 10px', letterSpacing: '0.06em' }}>Registry Sections</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-1">
            {DATA_TYPES.map(type => (
              <button 
                key={type} 
                className="flex items-center gap-3 p-3 rounded-xl transition-all font-semibold text-xs text-left"
                style={{ 
                  background: activeType === type ? 'rgba(99,102,241,0.1)' : 'transparent', 
                  color: activeType === type ? '#818cf8' : '#64748b', border: 'none'
                }}
                onClick={() => setActiveType(type)}
              >
                {activeType === type ? <Tag size={13} /> : <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1px solid currentColor', opacity: 0.3 }} />}
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        <div className={adminStyles.stack}>
          <div className={adminStyles.panel}>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="search-container flex-1">
                <Search size={14} className="search-icon" />
                <input 
                  type="text" placeholder={`Global Search in ${activeType.toLowerCase()}…`}
                  className="form-input outline-none shadow-inner pl-12 pr-4"
                  value={search} onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="btn btn-ghost" style={{ padding: 10 }}><Filter size={15} /></button>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div style={{ padding: 60, textAlign: 'center' }}>
                  <RefreshCw size={32} className="animate-spin" color="#6366f1" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: '#475569', fontSize: 13 }}>Syncing Registry Values...</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>System Code</th>
                      <th>Ref Description</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item: any) => (
                      <tr key={item.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366f1', fontSize: 13 }}>{item.code}</td>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{item.name}</div>
                          {item.department && <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{item.department}</div>}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.active ? '#10b981' : '#64748b' }} />
                            <span style={{ fontSize: 12, color: item.active ? '#34d399' : '#64748b', fontWeight: 600 }}>{item.active ? 'Active' : 'Retired'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2 justify-end">
                            <button className="btn btn-ghost" style={{ padding: 6 }}><Edit2 size={13} /></button>
                            <button 
                              className="btn btn-ghost" 
                              style={{ padding: 6, color: item.active ? '#ef4444' : '#10b981' }}
                              onClick={() => toggleStatus(item.id)}
                            >
                              <Power size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#475569', fontSize: 13 }}>No master data records exist for this category.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className={adminStyles.warning}>
             <AlertTriangle size={20} color="#f87171" style={{ minWidth: 20 }} />
             <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
               <strong>Data Integrity Guard:</strong> Modification of master codes is restricted for items referenced in existing Job Cards. 
               Use <em>Retire</em> to remove an item from selection menus while preserving its historical presence in the audit trail.
             </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: 450, width: '90%' }}>
            <div className="modal-header">
              <h2 className="modal-title flex items-center gap-3">
                <Plus size={20} color="#6366f1" /> Add Reference: {activeType.slice(0, -1)}
              </h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddItem} className="modal-body flex flex-col gap-4">
              <div className="form-group">
                <label>System Code (Permanent / Unique)</label>
                <input required className="form-input" style={{ textTransform: 'uppercase' }} value={newItem.code} onChange={e => setNewItem({...newItem, code: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Descriptive Label</label>
                <input required className="form-input" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              </div>
              {activeType === 'Plants / Assets' && (
                <div className="form-group">
                  <label>Governing Department</label>
                  <select required className="form-select" value={newItem.department} onChange={e => setNewItem({...newItem, department: e.target.value})}>
                    <option value="">Select Dept...</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Production">Production</option>
                    <option value="IT">IT</option>
                  </select>
                </div>
              )}
              <div className="modal-footer" style={{ marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Enshrine Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
