import React from 'react';
import styles from './MainLayout.module.css';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const MainLayout: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.contentWrapper}>
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
