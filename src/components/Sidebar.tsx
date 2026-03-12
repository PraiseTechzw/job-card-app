import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, PenTool, CheckSquare, LogOut, FileText, ShieldCheck, Clock, UserPlus, Briefcase } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

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
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <item.icon className={styles.navIcon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.userProfile}>
        <div className={styles.avatar}>
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user?.name}</div>
          <div className={styles.userRole}>{user?.role}</div>
        </div>
        <button className="btn-ghost" onClick={logout} title="Logout" style={{padding: '0.5rem', borderRadius: '50%'}}>
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
