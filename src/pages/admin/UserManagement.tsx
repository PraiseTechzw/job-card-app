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

  return (
    <div className={`${styles.pageContainer} animate-in fade-in duration-500`}>
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-all border border-white/5 hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg">
                <Users size={24} />
              </div>
              Identity Governance
            </h1>
            <p className="text-slate-400 font-medium">{users.length} active system identities</p>
          </div>
        </div>
        <button 
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
          onClick={() => { resetForm(); setShowCreateModal(true); }}
        >
          <UserPlus size={18} /> Provision Account
        </button>
      </header>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-6 rounded-3xl bg-slate-900/40 border border-white/5 backdrop-blur-xl shadow-2xl">
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
      <div className="glass-panel border border-white/5 rounded-3xl bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl mb-12">
        {isLoading ? (
          <div className="py-32 text-center">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Synchronizing Directory</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/30 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">Corporate Identity</th>
                  <th className="px-8 py-5">Section</th>
                  <th className="px-8 py-5">Access Level</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-lg shadow-inner">
                          {u.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="text-slate-200 font-bold text-sm">{u.name}</div>
                          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{u.employeeId || 'NO-ID'} · {u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-slate-400 font-medium text-sm">{u.department}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest border border-white/5">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor(u.status), boxShadow: `0 0 10px ${statusColor(u.status)}44` }} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: statusColor(u.status) }}>{u.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openDetailsModal(u)} className="p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-white/5" title="View Profile">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => openEditModal(u)} className="p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all border border-white/5" title="Edit Profile">
                          <Edit2 size={14} />
                        </button>
                        {u.status === 'Locked' && (
                          <button onClick={() => handleUnlockUser(u)} className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all border border-amber-500/20 shadow-lg shadow-amber-500/5" title="Unlock Account">
                            <Unlock size={14} />
                          </button>
                        )}
                        <button 
                          className={`p-2.5 rounded-xl border transition-all ${u.status === 'Active' ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'}`} 
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {u.status === 'Active' ? <LogOut size={14} /> : <CheckCircle2 size={14} />}
                        </button>
                        <button onClick={() => handleDeleteUser(u)} className="p-2.5 rounded-xl bg-slate-800/50 text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5" title="Purge Profile">
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
          <div className="py-20 text-center text-slate-500 italic text-sm">
            No system accounts matching the current governance criteria.
          </div>
        )}
      </div>

      {/* Governance Notice */}
      <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-6 shadow-xl mb-24">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl relative w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-8 border-b border-white/5 bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                  {showCreateModal ? <UserPlus size={24} /> : <Edit2 size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {showCreateModal ? 'Provision Identity' : 'Modify Profile'}
                  </h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Global Directory Services</p>
                </div>
              </div>
              <button className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all" onClick={() => { resetForm(); setShowCreateModal(false); setShowEditModal(false); }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={showCreateModal ? handleCreateUser : handleUpdateUser} className="p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 group">
                  <label className="text-[10px] uppercase font-bold text-slate-500 group-focus-within:text-blue-400 transition-colors block ml-1">Full Legal Name</label>
                  <div className="relative">
                    <Users size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input required className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] uppercase font-bold text-slate-500 group-focus-within:text-blue-400 transition-colors block ml-1">Corporate ID</label>
                  <div className="relative">
                    <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input required className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] uppercase font-bold text-slate-500 group-focus-within:text-blue-400 transition-colors block ml-1">Directory Username</label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input required className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 group">
                  <label className="text-[10px] uppercase font-bold text-slate-500 group-focus-within:text-blue-400 transition-colors block ml-1">Professional Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input required type="email" className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] uppercase font-bold text-slate-500 group-focus-within:text-blue-400 transition-colors block ml-1">SMS Gateway Target</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input required type="tel" className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner" placeholder="+26377000000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 group">
                  <label className="text-[10px] uppercase font-bold text-slate-500 group-focus-within:text-blue-400 transition-colors block ml-1">Security Role</label>
                  <div className="relative">
                    <ShieldCheck size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <select required className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner appearance-none cursor-pointer" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                      {['Admin', 'Supervisor', 'EngSupervisor', 'Artisan', 'Initiator', 'PlanningOffice', 'HOD'].map(r => (
                        <option key={r} value={r} className="bg-slate-900">{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] uppercase font-bold text-slate-500 group-focus-within:text-blue-400 transition-colors block ml-1">Section / Dept</label>
                  <div className="relative">
                    <Building size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <select required className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner appearance-none cursor-pointer" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                      {['Mechanical', 'Electrical', 'Production', 'IT', 'Planning', 'Quality', 'HSE'].map(d => (
                        <option key={d} value={d} className="bg-slate-900">{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] uppercase font-bold text-slate-500 group-focus-within:text-blue-400 transition-colors block ml-1">
                  {showEditModal ? 'Update Credentials (Optional)' : 'Security Credential'}
                </label>
                <div className="relative">
                  <Unlock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input 
                    required={showCreateModal} 
                    type="password" 
                    placeholder={showEditModal ? 'Leave blank to retain existing...' : 'System default: default123'} 
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner" 
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-10 pt-8 border-t border-white/5">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl relative w-full max-w-md overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
            <div className="p-8 pb-0 flex justify-end">
              <button className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all" onClick={() => setShowDetailsModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 pt-0 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-4xl shadow-inner mb-6">
                {selectedUser.name?.charAt(0)}
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mb-1">{selectedUser.name}</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">{selectedUser.role} · {selectedUser.department}</p>
              
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee ID</span>
                  <span className="text-sm font-bold text-slate-200">{selectedUser.employeeId || '—'}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Username</span>
                  <span className="text-sm font-bold text-slate-200">{selectedUser.username}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</span>
                  <span className="text-sm font-bold text-blue-400">{selectedUser.email || '—'}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone</span>
                  <span className="text-sm font-bold text-slate-200">{selectedUser.phone || '—'}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last Auth</span>
                  <span className="text-sm font-bold text-slate-200">
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => { setShowDetailsModal(false); openEditModal(selectedUser); }}
                className="w-full mt-10 px-8 py-4 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
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
