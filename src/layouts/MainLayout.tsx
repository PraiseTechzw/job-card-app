import React from 'react';
import styles from './MainLayout.module.css';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { Menu, X } from 'lucide-react';

const MainLayout: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

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
           <span className={styles.mobileTitle}>GOVERNANCE</span>
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
