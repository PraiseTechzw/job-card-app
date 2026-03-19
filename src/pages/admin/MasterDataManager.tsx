import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database, ArrowLeft, Plus, Edit2, 
  Search, Filter, 
  AlertTriangle, Power, Tag
} from 'lucide-react';
import styles from '../JobCards.module.css';

const DATA_TYPES = [
  'Departments', 'Plants / Assets', 'Equipment Categories', 
  'Job Types', 'Failure Codes', 'Root Cause Codes', 'Sections'
];

export default function MasterDataManager() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState('Departments');
  const [search, setSearch] = useState('');

  // Mock data for each type
  const [data, setData] = useState<any>({
    'Departments': [
      { id: '1', code: 'MECH', name: 'Mechanical Maintenance', active: true },
      { id: '2', code: 'ELEC', name: 'Electrical Engineering', active: true },
      { id: '3', code: 'OPER', name: 'Plant Operations', active: true },
    ],
    'Plants / Assets': [
      { id: '101', code: 'P1001', name: 'Steam Boiler #1', active: true, department: 'Mechanical' },
      { id: '102', code: 'P1002', name: 'Main Conveyor Belt', active: true, department: 'Mechanical' },
      { id: '103', code: 'P2001', name: 'MCC Panel A', active: true, department: 'Electrical' },
    ],
    'Failure Codes': [
      { id: 'f1', code: 'F-MECH-01', name: 'Bearing Failure', active: true },
      { id: 'f2', code: 'F-ELEC-01', name: 'Short Circuit', active: true },
      { id: 'f3', code: 'F-OP-01', name: 'Misalignment', active: true },
    ]
  });

  const filteredData = useMemo(() => {
    const list = data[activeType] || [];
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter((item: any) => 
      item.name.toLowerCase().includes(s) || 
      item.code.toLowerCase().includes(s)
    );
  }, [activeType, search, data]);

  const toggleStatus = (id: string) => {
    if (confirm(`Deactivating this item will prevent a and b future use in new records but preserve all current and historical references. Proceed?`)) {
      setData((prev: any) => ({
        ...prev,
        [activeType]: prev[activeType].map((item: any) => 
          item.id === id ? { ...item, active: !item.active } : item
        )
      }));
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/dashboard')} style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Database size={24} color="#6366f1" />
              Master Data Management
            </h1>
            <p className={styles['text-muted']}>Manage system-wide reference data and operational categories.</p>
          </div>
        </div>
        <button className="btn btn-primary" style={{ gap: 8 }}>
          <Plus size={16} /> Add {activeType.slice(0, -1)}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Data Types Selector */}
        <div style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 12 }}>
          <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', margin: '14px 10px', letterSpacing: '0.06em' }}>Reference Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {DATA_TYPES.map(type => (
              <button 
                key={type} 
                style={{ 
                  justifyContent: 'flex-start', background: activeType === type ? 'rgba(99,102,241,0.1)' : 'transparent', 
                  color: activeType === type ? '#818cf8' : '#64748b', borderRadius: 10, padding: '10px 14px', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600
                }}
                onClick={() => setActiveType(type)}
              >
                {activeType === type ? <Tag size={13} style={{ marginRight: 10 }} /> : <div style={{ width: 13, height: 13, marginRight: 10, borderRadius: '50%', border: '1px solid currentColor', opacity: 0.3 }} />}
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input 
                  type="text" placeholder={`Search ${activeType.toLowerCase()}…`}
                  className="form-input" style={{ background: '#090b12', paddingLeft: 34, fontSize: 13 }}
                  value={search} onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="btn btn-ghost" style={{ padding: 10 }}><Filter size={15} /></button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name / Description</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item: any) => (
                    <tr key={item.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>{item.code}</td>
                      <td>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{item.name}</div>
                        {item.department && <div style={{ fontSize: 11, color: '#475569' }}>Dept: {item.department}</div>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.active ? '#10b981' : '#64748b' }} />
                          <span style={{ fontSize: 12, color: item.active ? '#34d399' : '#64748b', fontWeight: 600 }}>{item.active ? 'Available' : 'Retired'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost" style={{ padding: 6 }}><Edit2 size={13} /></button>
                          <button 
                            className="btn btn-ghost" 
                            style={{ padding: 6, color: item.active ? '#ef4444' : '#10b981' }}
                            onClick={() => toggleStatus(item.id)}
                            title={item.active ? 'Retire / Deactivate' : 'Restore / Activate'}
                          >
                            <Power size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 30, color: '#475569', fontSize: 13 }}>No {activeType.toLowerCase()} found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 14, padding: 18, display: 'flex', gap: 14 }}>
             <AlertTriangle size={20} color="#f87171" />
             <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
               <strong>Preservation Rule:</strong> Master data values referenced in historical Job Cards cannot be deleted. 
               Use the <strong>Retire (Deactivate)</strong> action to prevent future use while maintaining data integrity of the historical audit lineage.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
