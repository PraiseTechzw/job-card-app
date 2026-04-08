import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, ClipboardList, CheckSquare, LogOut, 
  FileText, ShieldCheck, Clock, UserPlus, History, Wrench,
  Activity, TrendingUp, FilePlus, Archive, Database, BarChart2,
  Settings
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth } from '../context/AuthContext';
import { useJobCards } from '../context/JobCardContext';
import { useRuntimeConfig } from '../context/RuntimeConfigContext';
import { X } from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const { jobCards } = useJobCards();
  const { globalConfig, hasModuleAccess } = useRuntimeConfig();

  const getBadgeCount = (label: string) => {
    if (!jobCards) return 0;
    switch (label) {
      case 'Approval Queue':
        if (user?.role === 'Supervisor') return jobCards.filter(c => c.status === 'Pending_Supervisor' || c.status === 'SignedOff').length;
        if (user?.role === 'HOD') return jobCards.filter(c => c.status === 'Pending_HOD').length;
        if (user?.role === 'Admin') return jobCards.filter(c => ['Pending_Supervisor', 'Pending_HOD', 'SignedOff'].includes(c.status)).length;
        return 0;
      case 'Planning Queue':
        return jobCards.filter(c => c.status === 'Approved').length;
      case 'Job Assignments':
        return jobCards.filter(c => c.status === 'Registered').length;
      case 'Sign-off Queue':
        return jobCards.filter(c => c.status === 'Awaiting_SignOff' && (user?.role === 'Admin' || c.requestedBy === user?.name)).length;
      case 'My Requests':
        return jobCards.filter(c =>
          (c.requestedBy === user?.name || user?.role === 'Admin') &&
          c.status === 'Awaiting_SignOff'
        ).length;
      case 'My Active Jobs':
        return jobCards.filter(c => ['Assigned', 'InProgress'].includes(c.status) && c.issuedTo === user?.name).length;
      // Supervisor module
      case 'Control Centre':
        if (['Supervisor', 'EngSupervisor', 'Admin'].includes(user?.role || '')) {
          return jobCards.filter(c => c.status === 'Pending_Supervisor' || c.status === 'Awaiting_SignOff').length;
        }
        return 0;
      case 'Awaiting Review':
        return jobCards.filter(c => c.status === 'Awaiting_SignOff').length;
      case 'Job Records':
        return jobCards.filter(c => c.status === 'Approved').length; // Highlighting new jobs to classify
      case 'System Governance':
        return 0; // Admin alerts handled within the dashboard
      default:
        return 0;
    }
  };

  // Role-based navigation items — each has clear roles defined  
  const navItems = [
    // ALL roles see Dashboard
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    
    // ALL roles see Job Card Register (read-only for some)
    { to: '/job-cards', label: 'Job Cards', icon: ClipboardList },
    
    // Only Supervisors, HOD, and Admin see the Approval Queue
    { 
      to: '/approvals', 
      label: 'Approval Queue', 
      icon: ShieldCheck, 
      roles: ['Supervisor', 'HOD', 'Admin'],
      module: 'Approvals',
    },
    
    // Only PlanningOffice & Admin see Planning Queue
    { 
      to: '/planning', 
      label: 'Planning Queue', 
      icon: Clock, 
      roles: ['PlanningOffice', 'Admin'],
      module: 'Planning & Records',
    },
    
    // Only EngSupervisor & Admin do Job Assignments
    { 
      to: '/assignments', 
      label: 'Job Assignments', 
      icon: UserPlus, 
      roles: ['EngSupervisor', 'Admin'],
      module: 'Assignments',
    },
    
    // Initiators and Admin can sign off completed work
    { 
      to: '/sign-offs', 
      label: 'Sign-off Queue', 
      icon: CheckSquare, 
      roles: ['Initiator', 'Admin'],
      module: 'Job Requests',
    },
    
    // Artisan Module — scoped exclusively to Artisan and Admin
    { 
      to: '/artisan/dashboard', 
      label: 'Artisan Board', 
      icon: Wrench, 
      roles: ['Artisan', 'Admin'],
      module: 'Work Execution',
    },
    { 
      to: '/artisan/history', 
      label: 'My Work History', 
      icon: History, 
      roles: ['Artisan', 'Admin'],
      module: 'Work Execution',
    },

    // Initiator Module — scoped to Initiator and Admin
    {
      to: '/initiator/dashboard',
      label: 'My Requests',
      icon: FilePlus,
      roles: ['Initiator', 'Admin'],
      module: 'Job Requests',
    },
    {
      to: '/initiator/new',
      label: 'New Request',
      icon: FilePlus,
      roles: ['Initiator', 'Admin'],
      module: 'Job Requests',
    },
    {
      to: '/initiator/history',
      label: 'Request History',
      icon: Clock,
      roles: ['Initiator', 'Admin'],
      module: 'Job Requests',
    },
    
    // Supervisor Module — scoped to Supervisor, EngSupervisor, Admin
    {
      to: '/supervisor/dashboard',
      label: 'Control Centre',
      icon: ShieldCheck,
      roles: ['Supervisor', 'EngSupervisor', 'Admin'],
      module: 'Approvals',
    },
    {
      to: '/supervisor/active',
      label: 'Live Monitor',
      icon: Activity,
      roles: ['Supervisor', 'EngSupervisor', 'Admin'],
      module: 'Assignments',
    },
    {
      to: '/supervisor/reports',
      label: 'Sup. Reports',
      icon: TrendingUp,
      roles: ['Supervisor', 'EngSupervisor', 'Admin', 'HOD'],
      module: 'Reporting & Analytics',
    },
    
    // Planning Office Module — scoped to PlanningOffice and Admin
    {
      to: '/planner/dashboard',
      label: 'Planner Board',
      icon: LayoutDashboard,
      roles: ['PlanningOffice', 'Admin'],
      module: 'Planning & Records',
    },
    {
      to: '/planner/jobs',
      label: 'Job Records',
      icon: Database,
      roles: ['PlanningOffice', 'Admin'],
      module: 'Planning & Records',
    },
    {
      to: '/planner/history',
      label: 'Asset History',
      icon: Activity,
      roles: ['PlanningOffice', 'Admin'],
      module: 'Planning & Records',
    },
    {
      to: '/planner/reports',
      label: 'Analytics',
      icon: BarChart2,
      roles: ['PlanningOffice', 'Admin'],
      module: 'Reporting & Analytics',
    },
    {
      to: '/planner/preventive',
      label: 'PM Planning',
      icon: TrendingUp,
      roles: ['PlanningOffice', 'Admin'],
      module: 'Planning & Records',
    },
    {
      to: '/planner/archive',
      label: 'Cold Storage',
      icon: Archive,
      roles: ['PlanningOffice', 'Admin'],
      module: 'Archiving',
    },
    
    // Allocations — Supervisors, EngSupervisors, PlanningOffice, Admin
    { 
      to: '/allocations', 
      label: 'Allocations', 
      icon: CheckSquare, 
      roles: ['Supervisor', 'EngSupervisor', 'PlanningOffice', 'Admin'],
      module: 'Assignments',
    },
    
    // Reports — Management & Supervisory roles only
    { 
      to: '/reports', 
      label: 'Reports & Analytics', 
      icon: FileText, 
      roles: ['Admin', 'Supervisor', 'HOD', 'EngSupervisor'],
      module: 'Reporting & Analytics',
    },

    // System Admin Module
    {
      to: '/admin/dashboard',
      label: 'System Governance',
      icon: Settings,
      roles: ['Admin'],
      module: 'Admin Controls',
    },
    {
      to: '/admin/database',
      label: 'Database Console',
      icon: Database,
      roles: ['Admin'],
      module: 'Admin Controls',
    },
  ];

  const filteredItems = navItems.filter(item => 
    (!item.roles || (user && item.roles.includes(user.role))) && hasModuleAccess(item.module)
  );

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      Admin: 'System Admin',
      Initiator: 'Initiator',
      Supervisor: 'Supervisor',
      HOD: 'Head of Dept.',
      EngSupervisor: 'Eng. Supervisor',
      Artisan: 'Artisan',
      PlanningOffice: 'Planning Office',
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      Admin: '#4f46e5',
      Initiator: '#0ea5e9',
      Supervisor: '#f59e0b',
      HOD: '#ef4444',
      EngSupervisor: '#8b5cf6',
      Artisan: '#10b981',
      PlanningOffice: '#06b6d4',
    };
    return colors[role] || '#64748b';
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="https://www.megapak.co.zw/wp-content/uploads/2021/04/WhatsApp-Image-2021-04-14-at-12.07.24-1.jpeg" alt="Mega Pak Logo" style={{ height: 32, width: 'auto', borderRadius: 4 }} />
          <span className={styles.brandText}>{globalConfig.appName || 'Job Card System'}</span>
        </div>
        {onClose && (
          <button className={styles.mobileClose} onClick={onClose}>
            <X size={20} />
          </button>
        )}
      </div>

      <nav className={styles.nav}>
        {filteredItems.map((item) => {
          const badgeCount = getBadgeCount(item.label);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => onClose && onClose()}
            >
              <item.icon className={styles.navIcon} />
              <span>{item.label}</span>
              {badgeCount > 0 && <span className={styles.badge}>{badgeCount}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.userProfile}>
        <div className={styles.avatar}>
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.name}</span>
          <span 
            className={styles.userRole}
            style={{ 
              color: getRoleBadgeColor(user?.role || ''),
              fontWeight: 600,
            }}
          >
            {getRoleLabel(user?.role || '')}
          </span>
        </div>
      </div>

      <button className={styles.logoutBtn} onClick={logout}>
        <LogOut size={16} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
