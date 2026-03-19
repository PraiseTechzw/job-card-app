import React from 'react';
import { Search } from 'lucide-react';
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
        {/* Actions removed per user request */}
      </div>
    </header>
  );
};

export default Topbar;
