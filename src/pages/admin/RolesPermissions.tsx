import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldCheck, ArrowLeft, Lock, Info, 
  CheckCircle2, XCircle, Save, AlertTriangle, RefreshCw
} from 'lucide-react';
import styles from '../JobCards.module.css';

const MODULES = [
  'Job Requests', 'Approvals', 'Assignments', 'Work Execution', 
  'Planning & Records', 'Reporting & Analytics', 'Archiving', 'Admin Controls'
];

const ROLES = ['Initiator', 'Supervisor', 'Artisan', 'Planner', 'Admin', 'HOD'];

type PermissionMap = Record<string, Record<string, boolean>>;

export default function RolesPermissions() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState('Admin');
  const [permissions, setPermissions] = useState<PermissionMap>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await axios.get('/api/admin/config');
        if (res.data.permissions) {
          setPermissions(res.data.permissions);
        } else {
          // Default init
          setPermissions({
            'Admin': { 'Job Requests': true, 'Work Execution': true, 'Approvals': true, 'Assignments': true, 'Planning & Records': true, 'Reporting & Analytics': true, 'Archiving': true, 'Admin Controls': true },
            'Supervisor': { 'Job Requests': true, 'Approvals': true, 'Assignments': true, 'Planning & Records': true, 'Reporting & Analytics': true }
          });
        }
      } catch (e) {
        console.error('Failed to fetch permissions', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const togglePermission = (role: string, module: string) => {
    if (!isEditing || role === 'Admin') return; 
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: !prev[role]?.[module]
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post('/api/admin/config', { key: 'permissions', value: permissions });
      setIsEditing(false);
      alert('Security matrix synchronized successfully.');
    } catch (e) {
      alert('Failed to update permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ padding: 100, textAlign: 'center' }}>
          <RefreshCw size={40} className="animate-spin" color="#6366f1" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#475569' }}>Synchronizing Security Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/dashboard')} style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={24} color="#6366f1" />
              Global Access Matrix
            </h1>
            <p className={styles['text-muted']}>Define structured capabilities and role-based module accessibility.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!isEditing ? (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Permissions</button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                <Save size={16} style={{ marginRight: 6 }} /> {isSaving ? 'Applying...' : 'Apply Matrix'}
              </button>
            </>
          )}
        </div>
      </header>

      {isEditing && (
        <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 16, padding: '14px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
          <AlertTriangle size={18} color="#f87171" style={{ minWidth: 18 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>Critical Alert: Security policy modification affects all active sessions. Forensic audit is forced.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
        {/* Role Selector */}
        <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5">
          <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#475569', margin: '10px', letterSpacing: '0.06em' }}>System Entities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-1">
            {ROLES.map(role => (
              <button 
                key={role} 
                className="flex items-center gap-3 p-3 rounded-xl transition-all font-semibold text-xs text-left"
                style={{ 
                  background: activeRole === role ? 'rgba(99,102,241,0.1)' : 'transparent', 
                  color: activeRole === role ? '#818cf8' : '#64748b', border: 'none'
                }}
                onClick={() => setActiveRole(role)}
              >
                {role === activeRole ? <ShieldCheck size={14} /> : <Lock size={14} style={{ opacity: 0.5 }} />}
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix Detail */}
        <div className="flex flex-col gap-6">
          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>Capabilities for {activeRole}</h2>
              {activeRole === 'Admin' && (
                <div style={{ fontSize: 10, fontWeight: 800, color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '6px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Lock size={12} /> SUPERUSER ACL ENFORCED
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-[1fr_100px] gap-0">
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.08em', marginBottom: 12 }}>Module Function</div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', textAlign: 'center', letterSpacing: '0.08em', marginBottom: 12 }}>State</div>
              
              <div className="col-span-2 h-px bg-white/5 mb-2" />

              {MODULES.map(module => (
                <div key={module} className="contents">
                  <div className="py-4 border-b border-white/5">
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{module}</div>
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Grants operative access to full {module.toLowerCase()} interface.</div>
                  </div>
                  <div className="py-4 border-b border-white/5 flex justify-center items-center">
                    <button 
                      onClick={() => togglePermission(activeRole, module)}
                      style={{ 
                        background: 'transparent', border: 'none', cursor: isEditing && activeRole !== 'Admin' ? 'pointer' : 'default', 
                        padding: 8, transition: 'all 0.2s', scale: isEditing && activeRole !== 'Admin' ? '1.1' : '1',
                        opacity: permissions[activeRole]?.[module] ? 1 : 0.3
                      }}
                    >
                      {permissions[activeRole]?.[module] ? <CheckCircle2 size={24} color="#10b981" /> : <XCircle size={24} color="#64748b" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, display: 'flex', gap: 14 }}>
             <Info size={20} color="#6366f1" style={{ minWidth: 20 }} />
             <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
               Permissions follow the <strong>Principle of Least Privilege</strong>. All changes propagate to the application's RBAC engine immediately. 
               Administrators are advised to perform validation test cases after matrix realignment.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
