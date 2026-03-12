import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import styles from './Topbar.module.css';

const Topbar: React.FC = () => {
  return (
    <header className={styles.topbar}>
      <div className={styles.search}>
        <Search size={18} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search job cards, assigned tasks..." 
          className={styles.searchInput}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.actionBtn}>
          <Bell size={20} />
          <span className={styles.badge}>3</span>
        </button>
        <button className={styles.actionBtn}>
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
