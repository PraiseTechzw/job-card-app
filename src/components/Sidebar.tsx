import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, PenTool, CheckSquare, LogOut, FileText } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/job-cards', label: 'Job Cards', icon: ClipboardList },
    { to: '/allocations', label: 'Allocations', icon: CheckSquare },
    { to: '/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <PenTool className={styles.logoIcon} size={28} />
        <span className={styles.brandText}>CardFlow</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
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
