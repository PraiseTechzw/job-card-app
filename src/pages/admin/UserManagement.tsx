import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users, UserPlus, Search, Filter,
  ShieldCheck, AlertTriangle, CheckCircle2,
  Lock, Unlock, Edit2, LogOut, ArrowLeft, X, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from '../JobCards.module.css';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    email: '',
    employeeId: '',
    role: 'Artisan',
    department: 'Mechanical',
    password: ''
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
    } catch (e) {
      console.error('Failed to fetch users', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let list = users;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(u => 
        (u.name?.toLowerCase().includes(s)) || 
        (u.employeeId?.toLowerCase().includes(s)) || 
        (u.email?.toLowerCase().includes(s))
      );
    }
    if (roleFilter) {
      list = list.filter(u => u.role === roleFilter);
    }
    return list;
  }, [users, search, roleFilter]);

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    
    if (window.confirm(`Are you sure you want to ${newStatus === 'Active' ? 'activate' : 'deactivate'} user account for ${user.name}?`)) {
      try {
        await axios.post(`/api/admin/users/${user.id}/status`, { status: newStatus });
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        setNotification({ type: 'success', message: `User ${user.name} successfully ${newStatus.toLowerCase()}d.` });
      } catch (e) {
        setNotification({ type: 'error', message: `Failed to update status for ${user.name}.` });
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/users', newUser);
      setShowCreateModal(false);
      setNewUser({ name: '', username: '', email: '', employeeId: '', role: 'Artisan', department: 'Mechanical', password: '' });
      setNotification({ type: 'success', message: 'User created successfully.' });
      fetchUsers();
    } catch (e: any) {
      setNotification({ type: 'error', message: e.response?.data?.error || 'Failed to create user.' });
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Inactive': return '#64748b';
      case 'Locked': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/dashboard')} style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users size={24} color="#6366f1" />
              User & Identity Governance
            </h1>
            <p className={styles['text-muted']}>{users.length} accounts in system · backend synchronized</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ gap: 8 }}>
          <UserPlus size={16} /> Create System User
        </button>
      </header>

      {notification && (
        <div style={{ 
          background: notification.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${notification.type === 'success' ? '#10b98144' : '#ef444444'}`,
          borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {notification.type === 'success' ? <CheckCircle2 size={16} color="#10b981" /> : <AlertTriangle size={16} color="#ef4444" />}
            <span style={{ fontSize: 13, fontWeight: 600, color: notification.type === 'success' ? '#10b981' : '#ef4444' }}>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}><X size={16} /></button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6" style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 18 }}>
        <div className="search-container flex-1">
          <Search size={15} className="search-icon" />
          <input 
            type="text" placeholder="Search by name, employee ID, or email…" 
            className="form-input outline-none shadow-inner pl-12 pr-4"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={15} color="#475569" />
          <select className="form-select" style={{ fontSize: 13, minWidth: 160 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Artisan">Artisan</option>
            <option value="Initiator">Initiator</option>
            <option value="Planner">Planner</option>
            <option value="HOD">HOD</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto" style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <RefreshCw size={32} className="animate-spin" color="#6366f1" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#475569', fontSize: 14 }}>Synchronizing User Directory...</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Employee Info</th>
                <th>Department</th>
                <th>System Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th style={{ textAlign: 'right' }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                        {u.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: '#475569' }}>{u.employeeId} · {u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, color: '#e2e8f0' }}>{u.department}</div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '3px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor(u.status) }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: statusColor(u.status) }}>{u.status}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12, color: '#475569' }}>
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-ZW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" style={{ padding: 6 }} title="Edit"><Edit2 size={13} /></button>
                      <button className="btn btn-ghost" style={{ padding: 6 }} title="Unlock"><Unlock size={13} /></button>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: 6, color: u.status === 'Active' ? '#ef4444' : '#10b981' }} 
                        onClick={() => handleToggleStatus(u)}
                      >
                        {u.status === 'Active' ? <LogOut size={13} /> : <CheckCircle2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && filteredUsers.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: '#475569', fontSize: 14 }}>No accounts matching governance filters.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, padding: 20, background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.1)', borderRadius: 12, display: 'flex', gap: 14 }}>
        <ShieldCheck size={24} color="#34d399" />
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>Administrative Governance Notice</h4>
          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
            Deactivations preserve historical audit lineage. Modifying roles for users with active assignments will require manual reassignment. 
            All actions are logged to the global system audit trail.
          </p>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: 500, width: '90%' }}>
            <div className="modal-header">
              <h2 className="modal-title flex items-center gap-3">
                <UserPlus size={20} color="#6366f1" /> Provision New Account
              </h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateUser} className="modal-body flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Full Name</label>
                  <input required className="form-input" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Employee ID</label>
                  <input required className="form-input" value={newUser.employeeId} onChange={e => setNewUser({...newUser, employeeId: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>System Username</label>
                <input required className="form-input" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Professional Email</label>
                <input required type="email" className="form-input" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Access Role</label>
                  <select required className="form-select" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    <option value="Admin">Admin</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Artisan">Artisan</option>
                    <option value="Initiator">Initiator</option>
                    <option value="Planner">Planner</option>
                    <option value="HOD">HOD</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select required className="form-select" value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})}>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Production">Production</option>
                    <option value="IT">IT</option>
                    <option value="Planning">Planning</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Temporary Password</label>
                <input required type="password" placeholder="System default is 'default123'" className="form-input" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div className="modal-footer" style={{ marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
