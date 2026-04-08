import React from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Topbar.module.css';
import { useRuntimeConfig } from '../context/RuntimeConfigContext';

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { globalConfig, systemSettings } = useRuntimeConfig();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<Array<{ id: string; type: string; title: string; subtitle: string; route: string }>>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    if (systemSettings?.search?.enabled === false || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get('/api/search', { params: { q: query } });
        setResults(res.data?.items || []);
      } catch (error) {
        console.error('Search failed', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query, systemSettings?.search?.enabled]);

  const handleSelect = (route: string) => {
    setQuery('');
    setResults([]);
    navigate(route);
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarInner}>
      <div className={styles.search}>
        <Search size={18} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder={systemSettings?.search?.enabled === false ? 'Search disabled by system policy' : `Search ${globalConfig.appName || 'job cards'}, people, PM schedules...`}
          className={styles.searchInput}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          disabled={systemSettings?.search?.enabled === false}
        />
        {(query.trim().length >= 2 || isSearching) && (
          <div className={styles.searchResults}>
            {isSearching && <div className={styles.searchResultMuted}>Searching...</div>}
            {!isSearching && results.length === 0 && <div className={styles.searchResultMuted}>No matches found.</div>}
            {!isSearching && results.map((result) => (
              <button key={result.id} className={styles.searchResult} onClick={() => handleSelect(result.route)}>
                <span className={styles.searchResultType}>{result.type}</span>
                <span className={styles.searchResultTitle}>{result.title}</span>
                <span className={styles.searchResultSubtitle}>{result.subtitle}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {/* Actions removed per user request */}
      </div>
      </div>
      {globalConfig.broadcastBanner && (
        <div className={styles.banner}>
          {globalConfig.broadcastBanner}
        </div>
      )}
    </header>
  );
};

export default Topbar;
