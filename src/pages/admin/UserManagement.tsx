import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users, UserPlus, Search, Filter,
  ShieldCheck, AlertTriangle, CheckCircle2,
  Lock, Unlock, Edit2, LogOut, ArrowLeft, MoreHorizontal, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useJobCards } from '../../context/JobCardContext';
import styles from '../JobCards.module.css';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { addAuditLog } = useJobCards();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await axios.get('/api/admin/users');
        setUsers(res.data);
      } catch (e) {
        console.error('Failed to fetch users', e);
        // Mock data
        setUsers([
          { id: '1', employeeId: '80001', name: 'Admin User', role: 'Admin', department: 'IT', email: 'admin@plant.com', status: 'Active', lastLogin: '2026-03-19T10:30:00Z' },
          { id: '2', employeeId: '10045', name: 'John Doe', role: 'Supervisor', department: 'Mechanical', email: 'j.doe@plant.com', status: 'Active', lastLogin: '2026-03-19T08:15:00Z' },
          { id: '3', employeeId: '20012', name: 'Jane Smith', role: 'Artisan', department: 'Electrical', email: 'j.smith@plant.com', status: 'Active', lastLogin: '2026-03-18T16:20:00Z' },
          { id: '4', employeeId: '30056', name: 'Robert Brown', role: 'Initiator', department: 'Production', email: 'r.brown@plant.com', status: 'Inactive', lastLogin: '2026-03-10T11:45:00Z' },
          { id: '5', employeeId: '10088', name: 'Samuel Wilson', role: 'HOD', department: 'Mechanical', email: 's.wilson@plant.com', status: 'Locked', lastLogin: '2026-03-15T09:00:00Z' },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let list = users;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(u => 
        u.name.toLowerCase().includes(s) || 
        u.employeeId.includes(s) || 
        u.email.toLowerCase().includes(s)
      );
    }
    if (roleFilter) {
      list = list.filter(u => u.role === roleFilter);
    }
    return list;
  }, [users, search, roleFilter]);

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const action = newStatus === 'Active' ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
    
    if (confirm(`Are you sure you want to ${newStatus === 'Active' ? 'activate' : 'deactivate'} user account for ${user.name}? This action will be audit-logged.`)) {
      try {
        await axios.post(`/api/admin/users/${user.id}/status`, { status: newStatus });
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        await addAuditLog({
          jobCardId: 'SYSTEM',
          action,
          performedBy: currentUser?.name || 'Admin',
          details: `${action}: ${user.name} (${user.employeeId})`,
        });
        setNotification({ type: 'success', message: `User ${user.name} successfully ${newStatus.toLowerCase()}d.` });
      } catch (e) {
        setNotification({ type: 'error', message: `Failed to update status for ${user.name}.` });
      }
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
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/dashboard')} style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users size={24} color="#6366f1" />
              User and Access Management
            </h1>
            <p className={styles['text-muted']}>{users.length} accounts in system · governance controlled</p>
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
      <div style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 18, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text" placeholder="Search by name, employee ID, or email…" 
            className="form-input" style={{ background: '#090b12', paddingLeft: 38, fontSize: 13 }}
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

      {/* Modern High-Governance Table */}
      <div className={styles.tableWrapper} style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
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
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: '#475569' }}>{user.employeeId} · {user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: 13, color: '#e2e8f0' }}>{user.department}</div>
                </td>
                <td>
                  <span style={{ 
                    padding: '3px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor(user.status) }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: statusColor(user.status) }}>{user.status}</span>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: 12, color: '#475569' }}>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-ZW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never logged in'}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button 
                      className="btn btn-ghost" style={{ padding: 6 }} 
                      title="Edit User Details"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button 
                      className="btn btn-ghost" style={{ padding: 6 }} 
                      title="Reset Password"
                    >
                      <Unlock size={13} />
                    </button>
                    <button 
                      className="btn btn-ghost" 
                      style={{ padding: 6, color: user.status === 'Active' ? '#ef4444' : '#10b981' }} 
                      title={user.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.status === 'Active' ? <LogOut size={13} /> : <CheckCircle2 size={13} />}
                    </button>
                    {user.status === 'Locked' && (
                      <button className="btn btn-ghost" style={{ padding: 6, color: '#3b82f6' }} title="Unlock Account">
                        <Lock size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: '#475569', fontSize: 14 }}>No users found matching your search.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, padding: 20, background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.1)', borderRadius: 12, display: 'flex', gap: 14 }}>
        <ShieldCheck size={24} color="#34d399" />
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>Administrative Governance Notice</h4>
          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
            Acccount deactivations do not purge historical data. All associations with created Job Cards, approvals, and artisan records are preserved for audit lineage. 
            Modifying system roles for users with in-progress tasks will require manual reassignment.
          </p>
        </div>
      </div>
    </div>
  );
}
