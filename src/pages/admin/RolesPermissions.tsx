import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, ArrowLeft, Lock, Info, 
  CheckCircle2, XCircle, Search, Save, AlertTriangle
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
  const [permissions, setPermissions] = useState<PermissionMap>({
    'Initiator': { 'Job Requests': true, 'Work Execution': false, 'Approvals': false, 'Planning & Records': false, 'Reporting & Analytics': false, 'Archiving': false, 'Admin Controls': false },
    'Supervisor': { 'Job Requests': true, 'Work Execution': false, 'Approvals': true, 'Assignments': true, 'Planning & Records': true, 'Reporting & Analytics': true, 'Archiving': false, 'Admin Controls': false },
    'Artisan': { 'Job Requests': false, 'Work Execution': true, 'Approvals': false, 'Assignments': false, 'Planning & Records': false, 'Reporting & Analytics': false, 'Archiving': false, 'Admin Controls': false },
    'Planner': { 'Job Requests': false, 'Work Execution': false, 'Approvals': false, 'Assignments': false, 'Planning & Records': true, 'Reporting & Analytics': true, 'Archiving': true, 'Admin Controls': false },
    'Admin': { 'Job Requests': true, 'Work Execution': true, 'Approvals': true, 'Assignments': true, 'Planning & Records': true, 'Reporting & Analytics': true, 'Archiving': true, 'Admin Controls': true },
    'HOD': { 'Job Requests': false, 'Work Execution': false, 'Approvals': true, 'Assignments': false, 'Planning & Records': true, 'Reporting & Analytics': true, 'Archiving': false, 'Admin Controls': false },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const togglePermission = (role: string, module: string) => {
    if (!isEditing || role === 'Admin') return; // Admin permissions locked
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: !prev[role][module]
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Mimic API delay
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      alert('Permissions updated and audit-logged.');
    }, 1500);
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
              <ShieldCheck size={24} color="#6366f1" />
              Roles and Security Matrix
            </h1>
            <p className={styles['text-muted']}>Define structured access models and module capabilities.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!isEditing ? (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Permissions</button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                <Save size={16} style={{ marginRight: 6 }} /> {isSaving ? 'Applying...' : 'Apply Changes'}
              </button>
            </>
          )}
        </div>
      </header>

      {isEditing && (
        <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
          <AlertTriangle size={18} color="#fbbf24" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>System Alert: You are modifying core security policies. These changes will take effect immediately for all active sessions.</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Role Selector */}
        <div style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 12 }}>
          <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', margin: '14px 10px', letterSpacing: '0.06em' }}>System Roles</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ROLES.map(role => (
              <button 
                key={role} 
                className={styles.navItem} 
                style={{ 
                  justifyContent: 'flex-start', background: activeRole === role ? 'rgba(99,102,241,0.1)' : 'transparent', 
                  color: activeRole === role ? '#818cf8' : '#64748b', borderRadius: 10, padding: '10px 14px', border: 'none', cursor: 'pointer', transition: 'all 0.15s' 
                }}
                onClick={() => setActiveRole(role)}
              >
                {role === activeRole ? <ShieldCheck size={14} style={{ marginRight: 8 }} /> : <Lock size={14} style={{ marginRight: 8, opacity: 0.5 }} />}
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Permissions for {activeRole}</h2>
              {activeRole === 'Admin' && (
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '4px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={10} /> SUPERUSER PERMISSIONS LOCKED
                </div>
              )}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em' }}>Module / Capability</div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', textAlign: 'center', letterSpacing: '0.04em' }}>Access State</div>
              
              <div style={{ gridColumn: '1 / -1', height: 1, background: 'rgba(255,255,255,0.05)' }} />

              {MODULES.map(module => (
                <div key={module} style={{ display: 'contents' }}>
                  <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{module}</div>
                    <div style={{ fontSize: 12, color: '#475569' }}>{`Grants access to ${module.toLowerCase()} functionality.`}</div>
                  </div>
                  <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <button 
                      onClick={() => togglePermission(activeRole, module)}
                      style={{ 
                        background: 'transparent', border: 'none', cursor: isEditing && activeRole !== 'Admin' ? 'pointer' : 'default', 
                        padding: 8, transition: 'all 0.2s', transform: isEditing && activeRole !== 'Admin' ? 'scale(1.1)' : 'scale(1)',
                        opacity: permissions[activeRole]?.[module] ? 1 : 0.4
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
             <Info size={20} color="#6366f1" />
             <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
               Permissions are grouped by system module. We follow the principle of least privilege. 
               Only <strong>Admin</strong> users can access security configuration. 
               All permission changes are recorded in the system audit trail with the specific timestamp and administrator identity.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
