import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './MainLayout.module.css';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { Menu, X } from 'lucide-react';

const MainLayout: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const mobileTitle = React.useMemo(() => {
    if (location.pathname.startsWith('/admin')) return 'SYSTEM GOVERNANCE';
    if (location.pathname.startsWith('/initiator')) return 'INITIATOR WORKSPACE';
    if (location.pathname.startsWith('/supervisor')) return 'SUPERVISOR WORKSPACE';
    if (location.pathname.startsWith('/planner')) return 'PLANNING WORKSPACE';
    if (location.pathname.startsWith('/artisan')) return 'ARTISAN WORKSPACE';
    return 'JOB CARD SYSTEM';
  }, [location.pathname]);

  return (
    <div className={styles.layout}>
      <div className={`${styles.sidebarWrapper} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>
      
      {isSidebarOpen && (
        <div className={styles.overlay} onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className={styles.contentWrapper}>
        <header className={styles.mobileHeader}>
           <button className={styles.menuToggle} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
             {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
           </button>
           <span className={styles.mobileTitle}>{mobileTitle}</span>
        </header>
        <Topbar />
        <main className={styles.mainContent}>
          <div className={styles.mainContentInner}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
