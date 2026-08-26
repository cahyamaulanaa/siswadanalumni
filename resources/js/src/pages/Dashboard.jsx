import React, { useState, useEffect } from 'react';
import { LineChart, BarChart, PieChart, ProgressBarList } from '../components/Chart';
import { statistikService } from '../services/statistikService';
import { siswaService } from '../services/siswaService';
import { useAuth } from '../hooks/useAuth';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [kelulusan, setKelulusan] = useState(null);
    const [jalurMasuk, setJalurMasuk] = useState(null);
    const [ptn, setPtn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [topPrograms, setTopPrograms] = useState([]);
    const [topSchools, setTopSchools] = useState([]);
    const [siswaPerCabang, setSiswaPerCabang] = useState([]);
    const [alumniPerCabang, setAlumniPerCabang] = useState([]);
    const [programDetails, setProgramDetails] = useState([]);
    const [schoolDetails, setSchoolDetails] = useState([]);
    const [ptnDetails, setPtnDetails] = useState([]);
    const [showProgramDetailModal, setShowProgramDetailModal] = useState(false);
    const [showSchoolDetailModal, setShowSchoolDetailModal] = useState(false);
    const [showPtnDetailModal, setShowPtnDetailModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [wilayahLevel, setWilayahLevel] = useState('provinsi');
    const [wilayahData, setWilayahData] = useState([]);
    const [showWilayahDetailModal, setShowWilayahDetailModal] = useState(false);
    const [wilayahDetails, setWilayahDetails] = useState([]);

    // Kelulusan persentase (donut)
    const [kelulusanPersentase, setKelulusanPersentase] = useState(null);
    const [kelulusanJalurFilter, setKelulusanJalurFilter] = useState('all');
    const [loadingKelulusanPersentase, setLoadingKelulusanPersentase] = useState(false);
    const [yearInput, setYearInput] = useState(String(new Date().getFullYear()));
    const [cabangList, setCabangList] = useState([]);

    const [filter, setFilter] = useState({
        tahun: new Date().getFullYear(),
        // Only default to user's cabang for admin_cabang; pengajar and staff_karyawan should see cross-branch stats like direksi
        cabang_id: (user && user.role === 'admin_cabang') ? user.cabang_id : '',
    });

    useEffect(() => {
        if (!user) {
            return;
        }

        const cabangId = user.role === 'admin_cabang' ? user.cabang_id : '';
        if (filter.cabang_id !== cabangId) {
            setFilter((prevFilter) => ({ ...prevFilter, cabang_id: cabangId }));
        }
    }, [user]);

    useEffect(() => {
        const loadCabangList = async () => {
            if (!user) return;

            try {
                const response = await siswaService.getCabang();
                if (response.success) {
                    setCabangList(response.data || []);
                }
            } catch (err) {
                console.error('Gagal memuat daftar cabang:', err);
            }
        };

        loadCabangList();
    }, [user?.id]);

    useEffect(() => {
        fetchDashboardData();
    }, [filter]);

    useEffect(() => {
        fetchWilayah();
    }, [filter, wilayahLevel]);

    useEffect(() => {
        fetchKelulusanPersentase();
    }, [filter, kelulusanJalurFilter]);

    const applyYearFilter = (nextYear) => {
        const cleaned = nextYear === '' ? '' : String(nextYear).trim();

        if (cleaned === '') {
            setFilter((prev) => ({ ...prev, tahun: 'all' }));
            setYearInput('');
            return;
        }

        if (!/^\d{4}$/.test(cleaned)) {
            return;
        }

        setFilter((prev) => ({ ...prev, tahun: Number(cleaned) }));
        setYearInput(cleaned);
    };

    const handleResetYearFilter = () => {
        setFilter((prev) => ({ ...prev, tahun: 'all' }));
        setYearInput('');
    };

    // Listen for global updates (triggered after create/update/delete)
    useEffect(() => {
        const handler = () => {
            fetchDashboardData(true);
            fetchWilayah(true);
            fetchKelulusanPersentase(true);
        };
        window.addEventListener('statistik:updated', handler);
        return () => window.removeEventListener('statistik:updated', handler);
    }, []);

    const fetchDashboardData = async (force = false) => {
        try {
            setLoading(true);
            const params = { ...filter };
            if (force) params.force_refresh = true;

            const [summaryData, kelulusanData, jalurData, ptnData] = await Promise.all([
                statistikService.getSummary(params),
                statistikService.getKelulusan(params),
                statistikService.getJalurMasuk(params),
                statistikService.getPtn(params),
            ]);

            setSummary(summaryData.data);
            setSiswaPerCabang(summaryData.data.siswa_per_cabang || []);
            setAlumniPerCabang(summaryData.data.alumni_per_cabang || []);
            setTopPrograms(summaryData.data.top_programs || []);
            setTopSchools(summaryData.data.top_schools || []);
            setKelulusan(kelulusanData.data);
            setJalurMasuk(jalurData.data);
            setPtn(ptnData.data);
            setError(null);
        } catch (err) {
            setError('Gagal memuat data dashboard');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await fetchDashboardData(true);
            await fetchKelulusanPersentase(true);
        } catch (e) {
            console.error('Refresh failed', e);
        } finally {
            setRefreshing(false);
        }
    };

    const handleOpenProgramDetails = async () => {
        try {
            setDetailLoading(true);
            const response = await statistikService.getPrograms({ ...filter, limit: 0 });
            if (response.success) {
                setProgramDetails(response.data || []);
                setShowProgramDetailModal(true);
            }
        } catch (err) {
            console.error('Gagal memuat detail program:', err);
            setError('Gagal memuat detail program');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleOpenSchoolDetails = async () => {
        try {
            setDetailLoading(true);
            const response = await statistikService.getSekolah({ ...filter, limit: 0 });
            if (response.success) {
                setSchoolDetails(response.data || []);
                setShowSchoolDetailModal(true);
            }
        } catch (err) {
            console.error('Gagal memuat detail sekolah:', err);
            setError('Gagal memuat detail sekolah');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleOpenPtnDetails = async () => {
        try {
            setDetailLoading(true);
            const response = await statistikService.getPtn({ ...filter, limit: 'all' });
            if (response.success) {
                setPtnDetails(response.data || []);
                setShowPtnDetailModal(true);
            }
        } catch (err) {
            console.error('Gagal memuat detail PTN/PTS:', err);
            setError('Gagal memuat detail PTN/PTS');
        } finally {
            setDetailLoading(false);
        }
    };

    const fetchWilayah = async (force = false) => {
        try {
            const params = { ...filter, level: wilayahLevel, limit: 5 };
            if (force) params.force_refresh = true;
            const resp = await statistikService.getWilayah(params);
            if (resp.success) {
                // annotate with level for consistency
                const annotated = (resp.data || []).map(item => ({ ...item, level: wilayahLevel }));
                setWilayahData(annotated);
            }
        } catch (err) {
            console.error('Gagal memuat statistik wilayah:', err);
        }
    };

        const fetchKelulusanPersentase = async (force = false) => {
            try {
                setLoadingKelulusanPersentase(true);
                const params = { ...filter, jalur: kelulusanJalurFilter };
                if (force) params.force_refresh = true;
                const resp = await statistikService.getKelulusanPersentase(params);
                if (resp.success) {
                    setKelulusanPersentase(resp.data);
                }
            } catch (err) {
                console.error('Gagal memuat persentase kelulusan:', err);
            } finally {
                setLoadingKelulusanPersentase(false);
            }
        };


    const handleWilayahLevelChange = (e) => {
        setWilayahLevel(e.target.value);
    };

    const handleOpenWilayahDetails = async () => {
        try {
            setDetailLoading(true);
            const resp = await statistikService.getWilayah({ ...filter, level: wilayahLevel, limit: 0 });
            if (resp.success) {
                const annotated = (resp.data || []).map(item => ({ ...item, level: wilayahLevel }));
                setWilayahDetails(annotated);
            }

            setShowWilayahDetailModal(true);
        } catch (err) {
            console.error('Gagal memuat detail wilayah:', err);
            setError('Gagal memuat detail wilayah');
        } finally {
            setDetailLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>Loading Dashboard...</p>
            </div>
        );
    }

    const kelulusanLabels = kelulusan?.kelulusan_by_year?.map((k) => k.tahun) || [];
    const kelulusanData = kelulusan?.kelulusan_by_year?.map((k) => k.total) || [];

    const jalurLabels = jalurMasuk?.map((j) => j.jalur_masuk) || [];
    const jalurData = jalurMasuk?.map((j) => j.total) || [];

    const ptnLabels = ptn?.slice(0, 5).map((p) => p.ptn_diterima) || [];
    const ptnData = ptn?.slice(0, 5).map((p) => p.total) || [];
    const siswaPerCabangLabels = siswaPerCabang.map((item) => item.cabang);
    const siswaPerCabangValues = siswaPerCabang.map((item) => item.total);
    const alumniPerCabangLabels = alumniPerCabang.map((item) => {
        const shortLabels = {
            'Bimbel Gambar Villa Merah - Bandung': 'Bandung',
            'Bimbel Gambar Villa Merah - Jakarta Selatan': 'Jaksel',
            'Bimbel Gambar Villa Merah - Jakarta Pusat': 'Jakpus',
        };

        return shortLabels[item.cabang] || item.cabang;
    });
    const alumniPerCabangValues = alumniPerCabang.map((item) => item.total);
    const topProgramLabels = topPrograms.map((item) => item.nama);
    const topProgramValues = topPrograms.map((item) => item.total);
    const topProgramChartItems = topPrograms.slice(0, 5).map((item, index) => ({
        label: item.nama,
        value: item.total,
        color: ['#3b82f6', '#f59e0b', '#10b981', '#14b8a6', '#8b5cf6'][index % 5],
    }));
    const topSchoolLabels = topSchools.map((item) => item.sekolah);
    const topSchoolValues = topSchools.map((item) => item.total);
    const topSchoolChartItems = topSchools.slice(0, 5).map((item, index) => ({
        label: item.sekolah,
        value: item.total,
        color: ['#2f9ed8', '#f3c64a', '#4ec3b7', '#4a90e2', '#2cc6a0'][index % 5],
    }));
    const ptnChartItems = ptn.slice(0, 5).map((item, index) => ({
        label: item.ptn_diterima,
        value: item.total,
        color: ['#3b82f6', '#f59e0b', '#10b981', '#14b8a6', '#8b5cf6'][index % 5],
    }));

    const wilayahChartItems = wilayahData.slice(0, 5).map((item, index) => ({
        label: item.name || item.code || 'N/A',
        value: item.total,
        color: ['#3b82f6', '#f59e0b', '#10b981', '#14b8a6', '#8b5cf6'][index % 5],
    }));
  
    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.dashboardContent}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Dashboard SISA</h1>
                        <p className={styles.subtitle}>Selamat datang kembali, {user?.nama}! 👋</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button
                            onClick={handleRefresh}
                            className={styles.refreshButton}
                            disabled={refreshing}
                            title="Refresh Statistik"
                        >
                            {refreshing ? 'Menyegarkan...' : '🔄 Refresh Statistik'}
                        </button>
                        <div className={styles.headerDate}>
                            {new Date().toLocaleDateString('id-ID', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className={styles.errorAlert}>
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Filter Section */}
                <div className={styles.filterCard}>
                    <h2 className={styles.filterTitle}>Filter Data</h2>
                    <div className={styles.filterGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Cabang</label>
                            <select
                                value={filter.cabang_id}
                                onChange={(e) => setFilter((prev) => ({ ...prev, cabang_id: e.target.value }))}
                                className={styles.input}
                                disabled={user?.role === 'admin_cabang'}
                            >
                                <option value="">Semua Cabang</option>
                                {cabangList.map((cabang) => (
                                    <option key={cabang.id} value={cabang.id}>{cabang.nama}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tahun Masuk</label>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    value={yearInput}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        setYearInput(raw);

                                        if (raw === '') {
                                            applyYearFilter('');
                                            return;
                                        }

                                        if (/^\d{4}$/.test(raw)) {
                                            applyYearFilter(raw);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            applyYearFilter(yearInput);
                                        }
                                    }}
                                    onBlur={() => applyYearFilter(yearInput)}
                                    className={styles.input}
                                    placeholder="Contoh: 2026"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={handleResetYearFilter}
                                    className={styles.input}
                                    style={{
                                        minWidth: '140px',
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                        background: '#f8fafc',
                                        color: '#0f172a',
                                        fontWeight: 600,
                                    }}
                                >
                                    Semua Tahun
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className={styles.cardsGrid}>
                    <div className={`${styles.card} ${styles.cardBlue}`}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardIcon}>👨‍🎓</span>
                            <h3 className={styles.cardLabel}>Siswa Aktif</h3>
                        </div>
                        <p className={styles.cardValue}>
                            {summary?.total_siswa_aktif || 0}
                        </p>
                        <p className={styles.cardFooter}>Terdaftar dalam sistem</p>
                    </div>

                    <div className={`${styles.card} ${styles.cardGreen}`}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardIcon}>🎓</span>
                            <h3 className={styles.cardLabel}>Total Alumni</h3>
                        </div>
                        <p className={styles.cardValue}>
                            {summary?.total_alumni || 0}
                        </p>
                        <p className={styles.cardFooter}>Lulusan hingga saat ini</p>
                    </div>

                    <div className={`${styles.card} ${styles.cardPurple}`}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardIcon}>📊</span>
                            <h3 className={styles.cardLabel}>Total Keseluruhan</h3>
                        </div>
                        <p className={styles.cardValue}>
                            {summary?.total_siswa_keseluruhan || 0}
                        </p>
                        <p className={styles.cardFooter}>Siswa aktif + alumni</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className={styles.chartsGrid}>
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h2 className={styles.chartTitle}>🏢 Siswa Aktif per Cabang</h2>
                        </div>
                        {siswaPerCabangLabels.length > 0 ? (
                            <BarChart
                                label="Jumlah Siswa"
                                labels={siswaPerCabangLabels}
                                data={siswaPerCabangValues}
                                title="Siswa Aktif per Cabang"
                                orientation="vertical"
                            />
                        ) : (
                            <p className={styles.noData}>Tidak ada data siswa aktif per cabang</p>
                        )}
                    </div>

                    {/* Top 5 Program Siswa Aktif Terbanyak */}
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className={styles.chartTitle}>🏆 Top 5 Program Siswa Aktif</h2>
                            <span style={{ fontSize: '1.3rem', color: '#64748b', lineHeight: 1 }}>⋮</span>
                        </div>
                        {topProgramChartItems.length > 0 ? (
                            <ProgressBarList items={topProgramChartItems} />
                        ) : (
                            <p className={styles.noData}>Tidak ada data program</p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={handleOpenProgramDetails}
                                style={{ background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Lihat Semua
                            </button>
                        </div>
                    </div>

                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h2 className={styles.chartTitle}>🎓 Alumni per Cabang</h2>
                        </div>
                        {alumniPerCabangLabels.length > 0 ? (
                            <LineChart
                                label="Jumlah Alumni"
                                labels={alumniPerCabangLabels}
                                data={alumniPerCabangValues}
                                title="Alumni per Cabang"
                            />
                        ) : (
                            <p className={styles.noData}>Tidak ada data alumni per cabang</p>
                        )}
                    </div>

                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h2 className={styles.chartTitle}>🎯 Jalur Masuk</h2>
                        </div>
                        {jalurLabels.length > 0 ? (
                            <PieChart
                                labels={jalurLabels}
                                data={jalurData}
                                title="Distribusi Jalur Masuk"
                            />
                        ) : (
                            <p className={styles.noData}>Tidak ada data jalur masuk</p>
                        )}
                    </div>

                            {/* Wilayah Detail Modal */}
                            {showWilayahDetailModal && (
                                <div className={styles.modalOverlay} onClick={() => setShowWilayahDetailModal(false)}>
                                    <div className={styles.detailModalContent} onClick={(e) => e.stopPropagation()}>
                                        <div className={styles.detailHeader}>
                                            <h2>🌍 Semua Wilayah Penyumbang</h2>
                                            <button className={styles.modalCloseBtn} onClick={() => setShowWilayahDetailModal(false)}>✕</button>
                                        </div>
                                        <div className={styles.detailBody}>
                                            {detailLoading ? (
                                                <p>Memuat data...</p>
                                            ) : (
                                                <table className={styles.detailTable}>
                                                    <thead>
                                                        <tr>
                                                            <th>Level</th>
                                                            <th>Wilayah</th>
                                                            <th>Jumlah</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {wilayahDetails.map((item, idx) => (
                                                            <tr key={`${item.level}-${item.code || idx}`}>
                                                                <td style={{ textTransform: 'capitalize' }}>{item.level}</td>
                                                                <td>{item.name || item.code}</td>
                                                                <td>{item.total}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className={styles.chartTitle}>🏫 Top 5 Sekolah Penyumbang</h2>
                            <span style={{ fontSize: '1.3rem', color: '#64748b', lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>⋮</span>
                        </div>
                        {topSchoolChartItems.length > 0 ? (
                            <ProgressBarList items={topSchoolChartItems} />
                        ) : (
                            <p className={styles.noData}>Tidak ada data sekolah penyumbang</p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={handleOpenSchoolDetails}
                                style={{ background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Lihat Semua
                            </button>
                        </div>
                    </div>

                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className={styles.chartTitle}>🌍 Top 5 Wilayah Penyumbang</h2>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <select value={wilayahLevel} onChange={handleWilayahLevelChange} style={{ padding: '0.35rem 0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#fff' }}>
                                    <option value="provinsi">Provinsi</option>
                                    <option value="kabupaten">Kabupaten/Kota</option>
                                    <option value="kecamatan">Kecamatan</option>
                                    <option value="desa">Kelurahan/Desa</option>
                                </select>
                            </div>
                        </div>
                        {wilayahChartItems.length > 0 ? (
                            <ProgressBarList items={wilayahChartItems} />
                        ) : (
                            <p className={styles.noData}>Tidak ada data wilayah</p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={handleOpenWilayahDetails}
                                style={{ background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Lihat Semua
                            </button>
                        </div>
                    </div>

                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h2 className={styles.chartTitle}>📈 Tren Kelulusan</h2>
                        </div>
                        {kelulusanLabels.length > 0 ? (
                            <LineChart
                                label="Jumlah Alumni"
                                labels={kelulusanLabels}
                                data={kelulusanData}
                                title="Kelulusan per Tahun"
                            />
                        ) : (
                            <p className={styles.noData}>Tidak ada data kelulusan</p>
                        )}
                    </div>

                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className={styles.chartTitle}>🎓 Persentase Kelulusan</h2>
                            <select value={kelulusanJalurFilter} onChange={(e) => setKelulusanJalurFilter(e.target.value)} style={{ padding: '0.35rem 0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#fff' }}>
                                <option value="all">Semua Jalur</option>
                                <option value="snbp">SNBP</option>
                                <option value="snbt">SNBT</option>
                                <option value="mandiri">Mandiri</option>
                            </select>
                        </div>

                        {loadingKelulusanPersentase ? (
                            <p>Memuat data...</p>
                        ) : (kelulusanPersentase && kelulusanPersentase.counts ? (
                            <PieChart
                                labels={kelulusanPersentase.labels}
                                data={kelulusanPersentase.counts}
                                title={`Persentase Kelulusan (${kelulusanPersentase.jalur === 'all' ? 'Semua' : kelulusanPersentase.jalur})`}
                            />
                        ) : (
                            <p className={styles.noData}>Tidak ada data kelulusan</p>
                        ))}

                        {kelulusanPersentase && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>Lolos: {kelulusanPersentase.counts[0]} ({kelulusanPersentase.percent[0]}%)</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>Tidak Lolos: {kelulusanPersentase.counts[1]} ({kelulusanPersentase.percent[1]}%)</div>
                                </div>
                                <div style={{ textAlign: 'right', color: '#64748b' }}>Total Alumni: {kelulusanPersentase.total}</div>
                            </div>
                        )}
                    </div>

                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h2 className={styles.chartTitle}>🏫 Top 5 PTN/PTS Terbanyak</h2>
                        </div>
                        {ptnChartItems.length > 0 ? (
                            <ProgressBarList items={ptnChartItems} />
                        ) : (
                            <p className={styles.noData}>Tidak ada data PTN</p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={handleOpenPtnDetails}
                                style={{ background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Lihat Semua
                            </button>
                        </div>
                    </div>
                </div>

                {/* Detail Modals */}
                {showProgramDetailModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowProgramDetailModal(false)}>
                        <div className={styles.detailModalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.detailHeader}>
                                <h2>📚 Seluruh Program Kelas</h2>
                                <button className={styles.modalCloseBtn} onClick={() => setShowProgramDetailModal(false)}>✕</button>
                            </div>
                            <div className={styles.detailBody}>
                                {detailLoading ? (
                                    <p>Memuat data...</p>
                                ) : (
                                    <table className={styles.detailTable}>
                                        <thead>
                                            <tr>
                                                <th>Program</th>
                                                <th>Jumlah Siswa</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {programDetails.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.nama}</td>
                                                    <td>{item.total}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showSchoolDetailModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowSchoolDetailModal(false)}>
                        <div className={styles.detailModalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.detailHeader}>
                                <h2>🏫 Seluruh Sekolah Penyumbang</h2>
                                <button className={styles.modalCloseBtn} onClick={() => setShowSchoolDetailModal(false)}>✕</button>
                            </div>
                            <div className={styles.detailBody}>
                                {detailLoading ? (
                                    <p>Memuat data...</p>
                                ) : (
                                    <table className={styles.detailTable}>
                                        <thead>
                                            <tr>
                                                <th>Sekolah</th>
                                                <th>Jumlah Siswa</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {schoolDetails.map((item, index) => (
                                                <tr key={`${item.sekolah}-${index}`}>
                                                    <td>{item.sekolah}</td>
                                                    <td>{item.total}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showPtnDetailModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowPtnDetailModal(false)}>
                        <div className={styles.detailModalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.detailHeader}>
                                <h2>🏫 Seluruh PTN / PTS</h2>
                                <button className={styles.modalCloseBtn} onClick={() => setShowPtnDetailModal(false)}>✕</button>
                            </div>
                            <div className={styles.detailBody}>
                                {detailLoading ? (
                                    <p>Memuat data...</p>
                                ) : (
                                    <table className={styles.detailTable}>
                                        <thead>
                                            <tr>
                                                <th>PTN / PTS</th>
                                                <th>Jumlah Alumni</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ptnDetails.map((item, index) => (
                                                <tr key={`${item.ptn_diterima}-${index}`}>
                                                    <td>{item.ptn_diterima}</td>
                                                    <td>{item.total}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
