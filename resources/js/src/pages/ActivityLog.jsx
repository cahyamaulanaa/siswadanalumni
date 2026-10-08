import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListCheck, faRotate, faSearch, faFileCsv } from '@fortawesome/free-solid-svg-icons';
import { activityLogService } from '../services/activityLogService';
import styles from './ActivityLog.module.css';

export const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [filters, setFilters] = useState({ action: '', date: '', page: 1, per_page: 20 });
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState('');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await activityLogService.getAll(filters);
            if (!response.success) {
                throw new Error(response.message || 'Gagal memuat log aktivitas.');
            }
            setLogs(response.data || []);
            setPagination(response.pagination);
            setError('');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Gagal memuat log aktivitas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filters.action, filters.date, filters.page, filters.per_page]);

    const updateFilter = (name, value) => {
        setFilters((current) => ({ ...current, [name]: value, page: 1 }));
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const response = await activityLogService.exportCsv({
                action: filters.action,
                date: filters.date,
            });
            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = `log-activity-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            setError('');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Gagal mengekspor log activity.');
        } finally {
            setExporting(false);
        }
    };

    const formatDate = (value) => value
        ? new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
        : '-';

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}><FontAwesomeIcon icon={faListCheck} /> Log Activity</h1>
                        <p className={styles.subtitle}>Riwayat aktivitas pengguna dan perubahan data sistem.</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.exportButton} onClick={handleExport} disabled={exporting}>
                            <FontAwesomeIcon icon={faFileCsv} /> {exporting ? 'Mengekspor...' : 'Export CSV'}
                        </button>
                        <button className={styles.refreshButton} onClick={fetchLogs} disabled={loading}>
                            <FontAwesomeIcon icon={faRotate} spin={loading} /> Refresh
                        </button>
                    </div>
                </div>

                <div className={styles.filterCard}>
                    <div className={styles.filterGroup}>
                        <label><FontAwesomeIcon icon={faSearch} /> Cari aktivitas</label>
                        <input
                            value={filters.action}
                            onChange={(event) => updateFilter('action', event.target.value)}
                            placeholder="Contoh: siswa, alumni, login..."
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Tanggal</label>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(event) => updateFilter('date', event.target.value)}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Per halaman</label>
                        <select
                            value={filters.per_page}
                            onChange={(event) => updateFilter('per_page', Number(event.target.value))}
                        >
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.tableCard}>
                    {loading ? <div className={styles.empty}>Memuat log aktivitas...</div> : (
                        <div className={styles.tableWrapper}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Waktu</th>
                                        <th>Pengguna</th>
                                        <th>Aktivitas</th>
                                        <th>Metode</th>
                                        <th>Route</th>
                                        <th>Status</th>
                                        <th>IP Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.length === 0 ? (
                                        <tr><td colSpan="7" className={styles.empty}>Belum ada aktivitas.</td></tr>
                                    ) : logs.map((log) => (
                                        <tr key={log.id}>
                                            <td>{formatDate(log.created_at)}</td>
                                            <td>
                                                <strong>{log.user?.nama || 'Pengguna dihapus'}</strong>
                                                <small>{log.user?.role || '-'}</small>
                                            </td>
                                            <td>{log.action}</td>
                                            <td><span className={styles.method}>{log.method}</span></td>
                                            <td>{log.route}</td>
                                            <td><span className={log.metadata?.status >= 400 ? styles.failed : styles.success}>{log.metadata?.status || '-'}</span></td>
                                            <td>{log.ip_address || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {pagination && pagination.last_page > 1 && (
                        <div className={styles.pagination}>
                            <button
                                onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
                                disabled={pagination.current_page <= 1}
                            >Sebelumnya</button>
                            <span>Halaman {pagination.current_page} dari {pagination.last_page}</span>
                            <button
                                onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
                                disabled={pagination.current_page >= pagination.last_page}
                            >Berikutnya</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
