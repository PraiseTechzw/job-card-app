import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, PenTool, CheckSquare, LogOut, FileText, ShieldCheck, Clock, UserPlus, Briefcase } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth } from '../context/AuthContext';
import { useJobCards } from '../context/JobCardContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { jobCards } = useJobCards();

  const getBadgeCount = (label: string) => {
    if (!jobCards) return 0;
    switch (label) {
      case 'Pending Approvals':
        if (user?.role === 'Supervisor') return jobCards.filter(c => c.status === 'Pending_Supervisor').length;
        if (user?.role === 'HOD') return jobCards.filter(c => c.status === 'Pending_HOD').length;
        if (user?.role === 'Admin') return jobCards.filter(c => ['Pending_Supervisor', 'Pending_HOD'].includes(c.status)).length;
        return 0;
      case 'Planning Queue':
        return jobCards.filter(c => c.status === 'Approved').length;
      case 'Job Assignments':
        return jobCards.filter(c => c.status === 'Registered').length;
      case 'Pending Sign-off':
        return jobCards.filter(c => c.status === 'Awaiting_SignOff' && (user?.role === 'Admin' || c.requestedBy === user?.name)).length;
      case 'My Jobs':
        return jobCards.filter(c => ['Assigned', 'InProgress'].includes(c.status) && c.issuedTo === user?.name).length;
      default:
        return 0;
    }
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/job-cards', label: 'Job Cards', icon: ClipboardList },
    { to: '/approvals', label: 'Pending Approvals', icon: ShieldCheck, roles: ['Supervisor', 'HOD', 'Admin'] },
    { to: '/planning', label: 'Planning Queue', icon: Clock, roles: ['PlanningOffice', 'Admin'] },
    { to: '/assignments', label: 'Job Assignments', icon: UserPlus, roles: ['EngSupervisor', 'Admin'] },
    { to: '/sign-offs', label: 'Pending Sign-off', icon: PenTool, roles: ['Initiator', 'Admin'] },
    { to: '/my-jobs', label: 'My Jobs', icon: Briefcase, roles: ['Artisan', 'Admin'] },
    { to: '/allocations', label: 'Allocations', icon: CheckSquare },
    { to: '/reports', label: 'Reports', icon: FileText },
  ];

  const filteredItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <PenTool className={styles.logoIcon} size={28} />
        <span className={styles.brandText}>Job Card System</span>
      </div>

      <nav className={styles.nav}>
        {filteredItems.map((item) => {
          const badgeCount = getBadgeCount(item.label);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
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
          <span className={styles.userRole}>{user?.role}</span>
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
