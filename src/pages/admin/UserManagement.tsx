import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users, UserPlus, Search, Filter,
  ShieldCheck, CheckCircle2,
  Unlock, Edit2, LogOut, ArrowLeft, X, Eye, Trash2, Mail, Phone, Hash, Briefcase, Building
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from '../JobCards.module.css';
import adminStyles from './AdminTheme.module.css';
import pageStyles from './UserManagement.module.css';

export default function UserManagement() {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // New/Edit user form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
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
      toast.error('Failed to synchronize user directory.');
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
        (u.email?.toLowerCase().includes(s)) ||
        (u.username?.toLowerCase().includes(s))
      );
    }
    if (roleFilter) {
      list = list.filter(u => u.role === roleFilter);
    }
    return list;
  }, [users, search, roleFilter]);

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const loadingToast = toast.loading(`${newStatus === 'Active' ? 'Activating' : 'Deactivating'} account...`);
    try {
      await axios.post(`/api/admin/users/${user.id}/status`, { status: newStatus });
      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      toast.success(`User ${user.name} is now ${newStatus.toLowerCase()}.`, { id: loadingToast });
    } catch (e) {
      toast.error(`Operation failed for ${user.name}.`, { id: loadingToast });
    }
  };

  const handleUnlockUser = async (user: any) => {
    if (user.status !== 'Locked') return;
    const loadingToast = toast.loading('Unlocking account...');
    try {
      await axios.post(`/api/admin/users/${user.id}/unlock`);
      setUsers(users.map(u => u.id === user.id ? { ...u, status: 'Active' } : u));
      toast.success(`Account for ${user.name} unlocked.`, { id: loadingToast });
    } catch (e) {
      toast.error('Unlock operation failed.', { id: loadingToast });
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!window.confirm(`PERMANENT ACTION: Are you sure you want to delete user ${user.name}? This cannot be undone.`)) return;
    const loadingToast = toast.loading('Deleting user profile...');
    try {
      await axios.delete(`/api/admin/users/${user.id}`);
      setUsers(users.filter(u => u.id !== user.id));
      toast.success('User profile purged from system.', { id: loadingToast });
    } catch (e) {
      toast.error('Deletion failed.', { id: loadingToast });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Provisioning account...');
    try {
      await axios.post('/api/admin/users', formData);
      setShowCreateModal(false);
      resetForm();
      toast.success('User account created successfully.', { id: loadingToast });
      fetchUsers();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Provisioning failed.', { id: loadingToast });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const loadingToast = toast.loading('Updating profile...');
    try {
      // Don't send empty password
      const { password, ...updates } = formData;
      const dataToSend = password ? formData : updates;
      
      await axios.patch(`/api/admin/users/${selectedUser.id}`, dataToSend);
      setShowEditModal(false);
      resetForm();
      toast.success('Profile updated successfully.', { id: loadingToast });
      fetchUsers();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Update failed.', { id: loadingToast });
    }
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      employeeId: user.employeeId || '',
      role: user.role || 'Artisan',
      department: user.department || 'Mechanical',
      password: '' // Keep password empty for security
    });
    setShowEditModal(true);
  };

  const openDetailsModal = (user: any) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', username: '', email: '', phone: '', employeeId: '', role: 'Artisan', department: 'Mechanical', password: '' });
    setSelectedUser(null);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Inactive': return '#64748b';
      case 'Locked': return '#ef4444';
      default: return '#64748b';
    }
  };

  const summary = {
    total: users.length,
    filtered: filteredUsers.length,
    locked: users.filter((u) => u.status === 'Locked').length,
    admins: users.filter((u) => u.role === 'Admin').length,
  };

  return (
    <div className={`${styles.pageContainer} ${adminStyles.page} animate-in fade-in duration-500`}>
      <div className={adminStyles.hero}>
        <header className={adminStyles.header}>
          <div className={adminStyles.headerMain}>
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-all border border-white/5 hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
            <div className={adminStyles.headerText}>
              <p className={adminStyles.eyebrow}>System Governance</p>
              <div className={adminStyles.titleRow}>
                <span className={adminStyles.titleIcon}>
                  <Users size={20} />
                </span>
                <div>
                  <h1 className={adminStyles.title}>Identity Governance</h1>
                  <p className={adminStyles.subtitle}>{users.length} active system identities across the maintenance platform.</p>
                </div>
              </div>
            </div>
          </div>
          <div className={adminStyles.headerActions}>
            <button 
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
              onClick={() => { resetForm(); setShowCreateModal(true); }}
            >
              <UserPlus size={18} /> Provision Account
            </button>
          </div>
        </header>
      </div>

      <div className={pageStyles.summaryGrid}>
        <div className={pageStyles.summaryCard}>
          <div className={pageStyles.summaryLabel}>Directory Size</div>
          <div className={pageStyles.summaryValue}>{summary.total}</div>
          <div className={pageStyles.summaryMeta}>All provisioned accounts</div>
        </div>
        <div className={pageStyles.summaryCard}>
          <div className={pageStyles.summaryLabel}>Filtered Result</div>
          <div className={pageStyles.summaryValue}>{summary.filtered}</div>
          <div className={pageStyles.summaryMeta}>Matching the current controls</div>
        </div>
        <div className={pageStyles.summaryCard}>
          <div className={pageStyles.summaryLabel}>Locked Accounts</div>
          <div className={pageStyles.summaryValue}>{summary.locked}</div>
          <div className={pageStyles.summaryMeta}>Need administrator attention</div>
        </div>
        <div className={pageStyles.summaryCard}>
          <div className={pageStyles.summaryLabel}>Admin Roles</div>
          <div className={pageStyles.summaryValue}>{summary.admins}</div>
          <div className={pageStyles.summaryMeta}>Elevated governance identities</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`${adminStyles.panel} grid grid-cols-1 md:grid-cols-3 gap-6`}>
        <div className="md:col-span-2 relative group">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" placeholder="Search by name, ID, email or username…" 
            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
          <select 
            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner appearance-none cursor-pointer" 
            value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="" className="bg-slate-900">All Security Roles</option>
            {['Admin', 'Supervisor', 'EngSupervisor', 'Artisan', 'Initiator', 'PlanningOffice', 'HOD'].map(r => (
              <option key={r} value={r} className="bg-slate-900">{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className={`${adminStyles.panel} ${pageStyles.tablePanel}`}>
        {isLoading ? (
          <div className="py-32 text-center">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Synchronizing Directory</p>
          </div>
        ) : (
          <div className={pageStyles.tableWrap}>
            <table className={pageStyles.table}>
              <thead>
                <tr className={pageStyles.tableHeadRow}>
                  <th className={pageStyles.tableHeadCell}>Corporate Identity</th>
                  <th className={pageStyles.tableHeadCell}>Section</th>
                  <th className={pageStyles.tableHeadCell}>Access Level</th>
                  <th className={`${pageStyles.tableHeadCell} text-center`}>Status</th>
                  <th className={`${pageStyles.tableHeadCell} text-right`}>Management</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className={pageStyles.row}>
                    <td className={pageStyles.cell}>
                      <div className={pageStyles.identityCell}>
                        <div className={pageStyles.avatar}>
                          {u.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className={pageStyles.identityName}>{u.name}</div>
                          <div className={pageStyles.identityMeta}>{u.employeeId || 'NO-ID'} · {u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className={pageStyles.cell}>
                      <div className={pageStyles.department}>{u.department}</div>
                    </td>
                    <td className={pageStyles.cell}>
                      <span className={pageStyles.roleBadge}>
                        {u.role}
                      </span>
                    </td>
                    <td className={pageStyles.cell}>
                      <div className={pageStyles.statusWrap}>
                        <div className={pageStyles.statusDot} style={{ backgroundColor: statusColor(u.status), boxShadow: `0 0 10px ${statusColor(u.status)}44` }} />
                        <span className={pageStyles.statusText} style={{ color: statusColor(u.status) }}>{u.status}</span>
                      </div>
                    </td>
                    <td className={pageStyles.cell}>
                      <div className={pageStyles.actions}>
                        <button onClick={() => openDetailsModal(u)} className={`${pageStyles.actionBtn} ${pageStyles.actionInfo}`} title="View Profile">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => openEditModal(u)} className={`${pageStyles.actionBtn} ${pageStyles.actionEdit}`} title="Edit Profile">
                          <Edit2 size={14} />
                        </button>
                        {u.status === 'Locked' && (
                          <button onClick={() => handleUnlockUser(u)} className={`${pageStyles.actionBtn} ${pageStyles.actionWarn}`} title="Unlock Account">
                            <Unlock size={14} />
                          </button>
                        )}
                        <button 
                          className={`${pageStyles.actionBtn} ${u.status === 'Active' ? pageStyles.actionDanger : pageStyles.actionSuccess}`}
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {u.status === 'Active' ? <LogOut size={14} /> : <CheckCircle2 size={14} />}
                        </button>
                        <button onClick={() => handleDeleteUser(u)} className={`${pageStyles.actionBtn} ${pageStyles.actionDanger}`} title="Purge Profile">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && filteredUsers.length === 0 && (
          <div className={pageStyles.emptyState}>
            No system accounts matching the current governance criteria.
          </div>
        )}
      </div>

      {/* Governance Notice */}
      <div className={`${adminStyles.note} ${pageStyles.notice}`}>
        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
          <ShieldCheck size={24} />
        </div>
        <div className="space-y-2">
          <h4 className="text-emerald-400 font-black uppercase tracking-widest text-xs">Security Protocol Advisory</h4>
          <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
            Account modifications are subject to real-time forensic auditing. Deactivations preserve historical audit lineage while revoking system access. 
            Modifying administrative roles for users with active workflow assignments may require manual task reassignment.
          </p>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className={pageStyles.modalOverlay}>
          <div className={pageStyles.modalShell}>
            <div className={pageStyles.modalHeader}>
              <div className={pageStyles.modalHeaderMain}>
                <div className={pageStyles.modalIcon}>
                  {showCreateModal ? <UserPlus size={24} /> : <Edit2 size={24} />}
                </div>
                <div>
                  <h2 className={pageStyles.modalTitle}>
                    {showCreateModal ? 'Provision Identity' : 'Modify Profile'}
                  </h2>
                  <p className={pageStyles.modalSubtitle}>Global Directory Services</p>
                </div>
              </div>
              <button className={pageStyles.closeBtn} onClick={() => { resetForm(); setShowCreateModal(false); setShowEditModal(false); }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={showCreateModal ? handleCreateUser : handleUpdateUser} className={pageStyles.modalBody}>
              <div className={pageStyles.formGrid}>
                <div className={pageStyles.fieldGroup}>
                  <label className={pageStyles.fieldLabel}>Full Legal Name</label>
                  <div className={pageStyles.fieldShell}>
                    <Users size={14} className={pageStyles.fieldIcon} />
                    <input required className={pageStyles.fieldInput} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                </div>
                <div className={pageStyles.fieldGroup}>
                  <label className={pageStyles.fieldLabel}>Corporate ID</label>
                  <div className={pageStyles.fieldShell}>
                    <Hash size={14} className={pageStyles.fieldIcon} />
                    <input required className={pageStyles.fieldInput} value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} />
                  </div>
                </div>

                <div className={`${pageStyles.fieldGroup} ${pageStyles.fieldFull}`}>
                  <label className={pageStyles.fieldLabel}>Directory Username</label>
                  <div className={pageStyles.fieldShell}>
                    <Briefcase size={14} className={pageStyles.fieldIcon} />
                    <input required className={pageStyles.fieldInput} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                  </div>
                </div>

                <div className={pageStyles.fieldGroup}>
                  <label className={pageStyles.fieldLabel}>Professional Email</label>
                  <div className={pageStyles.fieldShell}>
                    <Mail size={14} className={pageStyles.fieldIcon} />
                    <input required type="email" className={pageStyles.fieldInput} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div className={pageStyles.fieldGroup}>
                  <label className={pageStyles.fieldLabel}>SMS Gateway Target</label>
                  <div className={pageStyles.fieldShell}>
                    <Phone size={14} className={pageStyles.fieldIcon} />
                    <input required type="tel" className={pageStyles.fieldInput} placeholder="+26377000000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>

                <div className={pageStyles.fieldGroup}>
                  <label className={pageStyles.fieldLabel}>Security Role</label>
                  <div className={pageStyles.fieldShell}>
                    <ShieldCheck size={14} className={pageStyles.fieldIcon} />
                    <select required className={pageStyles.fieldInput} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                      {['Admin', 'Supervisor', 'EngSupervisor', 'Artisan', 'Initiator', 'PlanningOffice', 'HOD'].map(r => (
                        <option key={r} value={r} className="bg-slate-900">{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={pageStyles.fieldGroup}>
                  <label className={pageStyles.fieldLabel}>Section / Dept</label>
                  <div className={pageStyles.fieldShell}>
                    <Building size={14} className={pageStyles.fieldIcon} />
                    <select required className={pageStyles.fieldInput} value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                      {['Mechanical', 'Electrical', 'Production', 'IT', 'Planning', 'Quality', 'HSE'].map(d => (
                        <option key={d} value={d} className="bg-slate-900">{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={`${pageStyles.fieldGroup} ${pageStyles.fieldFull}`}>
                  <label className={pageStyles.fieldLabel}>
                  {showEditModal ? 'Update Credentials (Optional)' : 'Security Credential'}
                  </label>
                  <div className={pageStyles.fieldShell}>
                    <Unlock size={14} className={pageStyles.fieldIcon} />
                  <input 
                    required={showCreateModal} 
                    type="password" 
                    placeholder={showEditModal ? 'Leave blank to retain existing...' : 'System default: default123'} 
                    className={pageStyles.fieldInput}
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
                  />
                  </div>
                </div>

              </div>

              <div className={pageStyles.modalFooter}>
                <button type="button" className="px-8 py-4 rounded-2xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all" onClick={() => { resetForm(); setShowCreateModal(false); setShowEditModal(false); }}>
                  Cancel
                </button>
                <button type="submit" className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1">
                  {showCreateModal ? 'Commit Profile' : 'Persist Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className={pageStyles.modalOverlay}>
          <div className={`${pageStyles.modalShell} ${pageStyles.modalShellNarrow}`}>
            <div className={pageStyles.modalHeader}>
              <div />
              <button className={pageStyles.closeBtn} onClick={() => setShowDetailsModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={pageStyles.detailsBody}>
              <div className={pageStyles.detailsHero}>
                <div className={pageStyles.detailsAvatar}>
                {selectedUser.name?.charAt(0)}
                </div>
                <h2 className={pageStyles.detailsName}>{selectedUser.name}</h2>
                <p className={pageStyles.detailsRole}>{selectedUser.role} · {selectedUser.department}</p>
              </div>
              
              <div className={pageStyles.detailsList}>
                <div className={pageStyles.detailsRow}>
                  <span className={pageStyles.detailsKey}>Employee ID</span>
                  <span className={pageStyles.detailsValue}>{selectedUser.employeeId || '—'}</span>
                </div>
                <div className={pageStyles.detailsRow}>
                  <span className={pageStyles.detailsKey}>Username</span>
                  <span className={pageStyles.detailsValue}>{selectedUser.username}</span>
                </div>
                <div className={pageStyles.detailsRow}>
                  <span className={pageStyles.detailsKey}>Email</span>
                  <span className={pageStyles.detailsValue} style={{ color: '#93c5fd' }}>{selectedUser.email || '—'}</span>
                </div>
                <div className={pageStyles.detailsRow}>
                  <span className={pageStyles.detailsKey}>Phone</span>
                  <span className={pageStyles.detailsValue}>{selectedUser.phone || '—'}</span>
                </div>
                <div className={pageStyles.detailsRow}>
                  <span className={pageStyles.detailsKey}>Last Auth</span>
                  <span className={pageStyles.detailsValue}>
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => { setShowDetailsModal(false); openEditModal(selectedUser); }}
                className={`btn btn-ghost ${pageStyles.detailsAction}`}
              >
                <Edit2 size={18} /> Edit Detailed Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
