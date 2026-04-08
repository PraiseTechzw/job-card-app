import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Database,
  Download,
  HardDrive,
  RefreshCw,
  Search,
  Server,
} from 'lucide-react';
import styles from '../JobCards.module.css';
import adminStyles from './AdminTheme.module.css';

interface TableColumn {
  name: string;
  dataType: string;
  isPrimary: boolean;
}

interface TableDefinition {
  tableName: string;
  columnCount: number;
  estimatedRows: number;
  primaryKey: string | null;
  columns: TableColumn[];
}

const truncateValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return text.length > 120 ? `${text.slice(0, 120)}...` : text;
};

export default function DatabaseExplorer() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<TableDefinition[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<TableColumn[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [tableSearch, setTableSearch] = useState('');
  const [rowSearchInput, setRowSearchInput] = useState('');
  const [rowSearch, setRowSearch] = useState('');
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const loadTables = async () => {
    setIsLoadingTables(true);
    try {
      const response = await axios.get('/api/admin/database/tables');
      const items = response.data?.items || [];
      setTables(items);
      if (!selectedTable && items.length > 0) {
        setSelectedTable(items[0].tableName);
      }
    } catch (error) {
      console.error('Failed to load database tables', error);
      toast.error('Failed to load database tables.');
    } finally {
      setIsLoadingTables(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      setRowSearch(rowSearchInput.trim());
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [rowSearchInput]);

  useEffect(() => {
    if (!selectedTable) return;

    const loadRows = async () => {
      setIsLoadingRows(true);
      try {
        const response = await axios.get(`/api/admin/database/${encodeURIComponent(selectedTable)}`, {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            q: rowSearch,
          },
        });
        setRows(response.data?.items || []);
        setColumns(response.data?.columns || []);
        setPagination(response.data?.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 });
      } catch (error) {
        console.error('Failed to load table rows', error);
        toast.error('Failed to load database rows.');
      } finally {
        setIsLoadingRows(false);
      }
    };

    loadRows();
  }, [selectedTable, pagination.page, pagination.limit, rowSearch]);

  const filteredTables = useMemo(() => {
    const normalized = tableSearch.trim().toLowerCase();
    if (!normalized) return tables;
    return tables.filter((table) => table.tableName.toLowerCase().includes(normalized));
  }, [tableSearch, tables]);

  const selectedDefinition = tables.find((table) => table.tableName === selectedTable);

  const handleExport = async () => {
    if (!selectedTable) return;
    setIsExporting(true);
    try {
      const response = await axios.get(`/api/admin/database/${encodeURIComponent(selectedTable)}/export`, {
        params: { q: rowSearch },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedTable}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported ${selectedTable}.`);
    } catch (error) {
      console.error('Failed to export table', error);
      toast.error('Failed to export table.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`${styles.pageContainer} ${adminStyles.page}`}>
      <div className={adminStyles.hero}>
        <header className={adminStyles.header}>
          <div className={adminStyles.headerMain}>
            <button className="btn btn-ghost" onClick={() => navigate('/admin/dashboard')} style={{ padding: '8px' }}>
              <ArrowLeft size={18} />
            </button>
            <div className={adminStyles.headerText}>
              <p className={adminStyles.eyebrow}>System Governance</p>
              <div className={adminStyles.titleRow}>
                <span className={adminStyles.titleIcon}>
                  <Database size={20} />
                </span>
                <div>
                  <h1 className={adminStyles.title}>Database Explorer</h1>
                  <p className={adminStyles.subtitle}>Read-only access to every public application table, with row inspection, pagination, search, and CSV export.</p>
                </div>
              </div>
            </div>
          </div>
          <div className={adminStyles.headerActions}>
            <button className="btn btn-ghost" onClick={loadTables} disabled={isLoadingTables || isLoadingRows} style={{ gap: 6 }}>
              <RefreshCw size={14} className={isLoadingTables || isLoadingRows ? 'animate-spin' : ''} /> Refresh
            </button>
            <button className="btn btn-primary" onClick={handleExport} disabled={!selectedTable || isExporting} style={{ gap: 6 }}>
              <Download size={14} /> {isExporting ? 'Exporting...' : 'Export Table'}
            </button>
          </div>
        </header>
      </div>

      <div className={adminStyles.sidebarGrid}>
        <div className={adminStyles.panel}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Server size={16} color="#60a5fa" />
            <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em' }}>Table Catalog</h3>
          </div>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 32 }}
              placeholder="Find table..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 540, overflowY: 'auto' }}>
            {filteredTables.map((table) => (
              <button
                key={table.tableName}
                onClick={() => {
                  setSelectedTable(table.tableName);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                style={{
                  border: `1px solid ${selectedTable === table.tableName ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  background: selectedTable === table.tableName ? 'rgba(96,165,250,0.08)' : 'rgba(255,255,255,0.02)',
                  borderRadius: 14,
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{table.tableName}</div>
                <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>
                  <span>{table.columnCount} cols</span>
                  <span>{table.estimatedRows} rows est.</span>
                </div>
              </button>
            ))}
            {!isLoadingTables && filteredTables.length === 0 && (
              <div style={{ fontSize: 12, color: '#64748b', padding: '12px 0' }}>No tables match that filter.</div>
            )}
          </div>
        </div>

        <div className={adminStyles.stack}>
          <div className={adminStyles.statsGrid}>
            <div className={adminStyles.panel}>
              <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>Selected Table</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc' }}>{selectedDefinition?.tableName || '—'}</div>
            </div>
            <div className={adminStyles.panel}>
              <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>Columns</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc' }}>{selectedDefinition?.columnCount || 0}</div>
            </div>
            <div className={adminStyles.panel}>
              <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>Exact Rows</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc' }}>{pagination.total}</div>
            </div>
            <div className={adminStyles.panel}>
              <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>Primary Key</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc' }}>{selectedDefinition?.primaryKey || 'None'}</div>
            </div>
          </div>

          <div className={adminStyles.panel}>
            <div className={adminStyles.toolbar}>
              <div>
                <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 6 }}>Column Schema</h3>
                <p style={{ fontSize: 12, color: '#64748b' }}>Current table metadata from the public schema.</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
              {columns.map((column) => (
                <div key={column.name} style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', borderRadius: 9999, padding: '8px 12px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{column.name}</span>
                  <span style={{ fontSize: 10, color: '#64748b', marginLeft: 8 }}>{column.dataType}</span>
                  {column.isPrimary && <span style={{ fontSize: 10, color: '#60a5fa', marginLeft: 8, fontWeight: 700 }}>PK</span>}
                </div>
              ))}
              {!columns.length && <div style={{ fontSize: 12, color: '#64748b' }}>Select a table to view columns.</div>}
            </div>
          </div>

          <div className={adminStyles.panel}>
            <div className={adminStyles.toolbar}>
              <div>
                <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 6 }}>Table Rows</h3>
                <p style={{ fontSize: 12, color: '#64748b' }}>Read-only database rows with text search across the selected table.</p>
              </div>
              <div className={adminStyles.toolbarGroup}>
                <div style={{ position: 'relative', width: '100%', minWidth: 220, maxWidth: 320 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: 32 }}
                    placeholder="Search rows..."
                    value={rowSearchInput}
                    onChange={(e) => setRowSearchInput(e.target.value)}
                  />
                </div>
                <select
                  className="form-select"
                  value={pagination.limit}
                  onChange={(e) => setPagination((prev) => ({ ...prev, page: 1, limit: Number(e.target.value) }))}
                >
                  <option value={25}>25 rows</option>
                  <option value={50}>50 rows</option>
                  <option value={100}>100 rows</option>
                </select>
              </div>
            </div>

            <div className={styles.tableWrapper} style={{ marginTop: 18 }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.name}>{column.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoadingRows ? (
                    <tr>
                      <td colSpan={Math.max(columns.length, 1)} style={{ textAlign: 'center', color: '#64748b' }}>
                        <RefreshCw size={16} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                        Loading rows...
                      </td>
                    </tr>
                  ) : rows.length > 0 ? (
                    rows.map((row, rowIndex) => (
                      <tr key={String(row[selectedDefinition?.primaryKey || 'id'] || rowIndex)}>
                        {columns.map((column) => (
                          <td key={`${rowIndex}-${column.name}`}>
                            <div style={{ maxWidth: 220, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, color: '#e2e8f0' }}>
                              {truncateValue(row[column.name])}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={Math.max(columns.length, 1)} style={{ textAlign: 'center', color: '#64748b' }}>
                        No rows found for this table.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 12 }}>
                <HardDrive size={14} />
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" disabled={pagination.page <= 1} onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}>
                  Previous
                </button>
                <button className="btn btn-ghost" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
