import React, { useState, useEffect, useRef } from 'react';
import { portofolioAlumniService } from '../services/portofolioAlumniService';
import { siswaService } from '../services/siswaService';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import styles from './SiswaManagement.module.css';

export const PortofolioAlumniManagement = () => {
    const { user } = useAuth();
    const canWrite = user && ['super_admin', 'admin_cabang'].includes(user.role);
    const [portofolioList, setPortofolioList] = useState([]);
    const [alumniList, setAlumniList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [pagination, setPagination] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        alumni_id: '',
        gambar_suasana: null,
        gambar_karya_bebas: null,
        cabang_name: '',
        program_name: '',
    });

    const [filters, setFilters] = useState({
        per_page: 10,
        page: 1,
        nama_lengkap: '',
        cabang_id: '',
        program_id: '',
    });

    useEffect(() => {
        if (user) {
            fetchAlumniOptions();
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            fetchPortofolioWithFilters(filters);
        }
    }, [user, filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            page: 1,
            [name]: value,
        }));
    };

    const resetFilters = () => {
        setFilters({
            per_page: 10,
            page: 1,
            nama_lengkap: '',
            cabang_id: '',
            program_id: '',
        });
    };

    const changePage = (newPage) => {
        if (!pagination) return;
        if (newPage < 1 || newPage > pagination.last_page) return;
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    const changePerPage = (value) => {
        setFilters((prev) => ({
            ...prev,
            per_page: Number(value),
            page: 1,
        }));
    };

    const cabangOptions = Array.from(
        new Map(
            alumniList
                .filter((alumni) => alumni.siswa?.cabang)
                .map((alumni) => [alumni.siswa.cabang.id, alumni.siswa.cabang])
        ).values()
    );

    const programOptions = Array.from(
        new Map(
            alumniList
                .flatMap((alumni) => (Array.isArray(alumni.siswa?.program) ? alumni.siswa.program : alumni.siswa?.program ? [alumni.siswa.program] : []))
                .filter((program) => program)
                .map((program) => [program.id, program])
        ).values()
    );

    const fetchPortofolioWithFilters = async (filtersToUse) => {
        try {
            setLoading(true);
            const response = await portofolioAlumniService.getAll(filtersToUse);
            if (response.success) {
                setPortofolioList(response.data);
                setPagination(response.pagination);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching portofolio:', err);
            setError('Gagal memuat data portofolio alumni');
        } finally {
            setLoading(false);
        }
    };

    const fetchAlumniOptions = async () => {
        try {
            const response = await api.get('/alumni', { params: { per_page: 1000 } });
            if (response.data.success) {
                setAlumniList(response.data.data || []);
            }
        } catch (err) {
            console.error('Gagal memuat daftar alumni:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'gambar_suasana' || name === 'gambar_karya_bebas') {
            setFormData({ ...formData, [name]: files[0] || null });
            return;
        }

        if (name === 'alumni_id') {
            const selectedAlumni = alumniList.find((alumni) => String(alumni.id) === value);
            const cabangName = selectedAlumni?.siswa?.cabang?.nama || '';
            const programName = selectedAlumni?.siswa?.program
                ? Array.isArray(selectedAlumni.siswa.program)
                    ? selectedAlumni.siswa.program.map((p) => p.nama).join(', ')
                    : selectedAlumni.siswa.program.nama
                : '';
            setFormData({
                ...formData,
                alumni_id: value,
                cabang_name: cabangName,
                program_name: programName,
            });
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            if (!formData.alumni_id) {
                setError('Pilih nama alumni terlebih dahulu');
                setLoading(false);
                return;
            }

            const payload = new FormData();
            payload.append('alumni_id', formData.alumni_id);
            if (formData.gambar_suasana) {
                payload.append('gambar_suasana', formData.gambar_suasana);
            }
            if (formData.gambar_karya_bebas) {
                payload.append('gambar_karya_bebas', formData.gambar_karya_bebas);
            }

            let response;
            if (editingId) {
                response = await portofolioAlumniService.update(editingId, payload);
            } else {
                response = await portofolioAlumniService.create(payload);
            }

            if (response.success) {
                setShowModal(false);
                setEditingId(null);
                resetForm();
                await fetchPortofolioWithFilters(filters);
            } else {
                setError(response.message || 'Terjadi kesalahan saat menyimpan.');
            }
        } catch (err) {
            console.error('Error saving portofolio:', err);
            if (err.response?.data?.errors) {
                const errorMessages = Object.values(err.response.data.errors).flat().join(', ');
                setError(errorMessages);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Gagal menyimpan data portofolio alumni');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            alumni_id: '',
            gambar_suasana: null,
            gambar_karya_bebas: null,
            cabang_name: '',
            program_name: '',
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const handleEdit = async (id) => {
        try {
            setLoading(true);
            const response = await portofolioAlumniService.getById(id);
            if (response.success) {
                const data = response.data;
                setFormData({
                    alumni_id: data.alumni_id,
                    gambar_suasana: null,
                    gambar_karya_bebas: null,
                });
                setEditingId(id);
                setShowModal(true);
            }
        } catch (err) {
            console.error('Gagal memuat data portofolio:', err);
            setError('Gagal memuat data portofolio alumni');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus portofolio ini?')) return;
        try {
            setLoading(true);
            await portofolioAlumniService.delete(id);
            await fetchPortofolioWithFilters(filters);
            setSelectedIds((prev) => prev.filter((item) => item !== id));
        } catch (err) {
            console.error('Gagal menghapus portofolio:', err);
            setError('Gagal menghapus portofolio alumni');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === portofolioList.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(portofolioList.map((item) => item.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            setError('Pilih portofolio yang ingin dihapus');
            return;
        }
        if (!window.confirm(`Hapus ${selectedIds.length} portofolio alumni?`)) return;

        try {
            setLoading(true);
            for (const id of selectedIds) {
                await portofolioAlumniService.delete(id);
            }
            setSelectedIds([]);
            await fetchPortofolioWithFilters(filters);
        } catch (err) {
            console.error('Gagal menghapus bulk portofolio:', err);
            setError('Gagal menghapus beberapa portofolio alumni');
        } finally {
            setLoading(false);
        }
    };

    const getAlumniName = (alumniId) => {
        return alumniList.find((item) => item.id === alumniId)?.siswa?.nama_lengkap || '-';
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Portofolio Alumni</h1>
                        <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>
                            Kelola portofolio alumni beserta unggahan gambar suasana dan karya bebas.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {canWrite && selectedIds.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className={styles.deleteButton}
                                style={{ background: 'linear-gradient(135deg, rgb(239 68 68) 0%, rgb(220 38 38) 100%)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
                            >
                                🗑️ Hapus {selectedIds.length}
                            </button>
                        )}
                        {canWrite && (
                            <button className={styles.addButton} onClick={() => { resetForm(); setEditingId(null); setShowModal(true); }}>
                                ➕ Tambah Portofolio
                            </button>
                        )}
                    </div>
                </div>

                <div className={styles.filterRow} style={{ display: 'grid', gridTemplateColumns: '1fr 220px 220px auto', gap: '1rem', marginBottom: '1rem', alignItems: 'end' }}>
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                        <label className={styles.label}>Cari Nama Alumni</label>
                        <input
                            type="text"
                            name="nama_lengkap"
                            value={filters.nama_lengkap}
                            onChange={handleFilterChange}
                            className={styles.input}
                            placeholder="Cari nama alumni..."
                        />
                    </div>
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                        <label className={styles.label}>Filter Cabang</label>
                        <select
                            name="cabang_id"
                            value={filters.cabang_id}
                            onChange={handleFilterChange}
                            className={styles.input}
                        >
                            <option value="">Semua Cabang</option>
                            {cabangOptions.map((cabang) => (
                                <option key={cabang.id} value={cabang.id}>
                                    {cabang.nama}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                        <label className={styles.label}>Filter Program</label>
                        <select
                            name="program_id"
                            value={filters.program_id}
                            onChange={handleFilterChange}
                            className={styles.input}
                        >
                            <option value="">Semua Program</option>
                            {programOptions.map((program) => (
                                <option key={program.id} value={program.id}>
                                    {program.nama}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" className={styles.secondaryButton} onClick={resetFilters}>
                            Reset Filter
                        </button>
                    </div>
                </div>

                <div className={styles.tableCard}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <span className={styles.loadingText}>Memuat portofolio alumni...</span>
                        </div>
                    ) : (
                        <>
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead className={styles.tableHead}>
                                        <tr>
                                            {canWrite && (
                                                <th className={styles.tableHeadCell} style={{ width: '38px', textAlign: 'center', padding: '0.75rem 0.4rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.length > 0 && selectedIds.length === portofolioList.length}
                                                        onChange={toggleSelectAll}
                                                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                    />
                                                </th>
                                            )}
                                            <th className={styles.tableHeadCell} style={{ width: '38px', textAlign: 'center' }}>No</th>
                                            <th className={styles.tableHeadCell} style={{ width: '18%', minWidth: '140px' }}>Nama Alumni</th>
                                            <th className={styles.tableHeadCell} style={{ width: '14%', minWidth: '120px' }}>Cabang</th>
                                            <th className={styles.tableHeadCell} style={{ width: '18%', minWidth: '160px' }}>Program</th>
                                            <th className={styles.tableHeadCell} style={{ width: '18%', minWidth: '200px' }}>Gambar Suasana</th>
                                            <th className={styles.tableHeadCell} style={{ width: '18%', minWidth: '200px' }}>Gambar Karya Bebas</th>
                                            <th className={styles.tableHeadCell} style={{ width: '100px', minWidth: '90px', textAlign: 'center' }}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className={styles.tableBody}>
                                        {portofolioList.map((item, index) => (
                                            <tr key={item.id} style={{ background: selectedIds.includes(item.id) ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                                                {canWrite && (
                                                    <td className={styles.noCell} style={{ textAlign: 'center', padding: '0.75rem 0.4rem' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(item.id)}
                                                            onChange={() => toggleSelect(item.id)}
                                                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                        />
                                                    </td>
                                                )}
                                                <td className={styles.noCell} style={{ width: '38px', textAlign: 'center' }}>{(pagination?.current_page - 1) * pagination?.per_page + index + 1}</td>
                                                <td className={styles.tableCell} style={{ minWidth: '140px' }}>{getAlumniName(item.alumni_id)}</td>
                                                <td className={styles.tableCell} style={{ minWidth: '120px' }}>{item.alumni?.siswa?.cabang?.nama || '-'}</td>
                                                <td className={styles.tableCell} style={{ minWidth: '160px' }}>
                                                    {item.alumni?.siswa?.program ? (
                                                        Array.isArray(item.alumni.siswa.program) ? item.alumni.siswa.program.map(p => p.nama).join(', ') : item.alumni.siswa.program.nama
                                                    ) : '-'}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    {item.gambar_suasana_url ? (
                                                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                            <a href={item.gambar_suasana_url} target="_blank" rel="noreferrer">
                                                                <img src={item.gambar_suasana_url} alt="Suasana" style={{ width: '100%', maxWidth: '180px', borderRadius: '0.75rem', objectFit: 'cover' }} />
                                                            </a>
                                                            <a href={item.gambar_suasana_url} download style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
                                                                Unduh
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#999' }}>-</span>
                                                    )}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    {item.gambar_karya_bebas_url ? (
                                                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                            <a href={item.gambar_karya_bebas_url} target="_blank" rel="noreferrer">
                                                                <img src={item.gambar_karya_bebas_url} alt="Karya Bebas" style={{ width: '100%', maxWidth: '180px', borderRadius: '0.75rem', objectFit: 'cover' }} />
                                                            </a>
                                                            <a href={item.gambar_karya_bebas_url} download style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
                                                                Unduh
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#999' }}>-</span>
                                                    )}
                                                </td>
                                                <td className={styles.tableCell} style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                                                        {canWrite && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEdit(item.id)}
                                                                    title="Edit portofolio"
                                                                    style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'rgb(59, 130, 246)', border: 'none', padding: '0.4rem 0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(item.id)}
                                                                    title="Hapus portofolio"
                                                                    style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'rgb(239, 68, 68)', border: 'none', padding: '0.4rem 0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {pagination && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', padding: '0 1rem 0.75rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span style={{ color: '#334155' }}>
                                            Halaman {pagination.current_page} dari {pagination.last_page}
                                        </span>
                                        <span style={{ color: '#475569' }}>
                                            Total {pagination.total} portofolio
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => changePage(filters.page - 1)}
                                            disabled={filters.page <= 1}
                                            className={styles.pageBtn}
                                        >
                                            Prev
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => changePage(filters.page + 1)}
                                            disabled={filters.page >= pagination.last_page}
                                            className={styles.pageBtn}
                                        >
                                            Next
                                        </button>
                                        <select
                                            value={filters.per_page}
                                            onChange={(e) => changePerPage(e.target.value)}
                                            style={{ padding: '0.5rem 0.75rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', background: 'white', color: '#1f2937' }}
                                        >
                                            {[10, 20, 30, 50].map((size) => (
                                                <option key={size} value={size}>{size} / halaman</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {showModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>{editingId ? 'Edit Portofolio Alumni' : 'Tambah Portofolio Alumni'}</h2>
                                <button className={styles.modalCloseBtn} onClick={() => { setShowModal(false); setEditingId(null); resetForm(); }}>
                                    ✕
                                </button>
                            </div>
                            <div className={styles.modalScroll}>
                                <form className={styles.modalForm} onSubmit={handleSubmit}>
                                    {error && (
                                        <div className={styles.errorAlert}>{error}</div>
                                    )}
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Nama Alumni</label>
                                        <select name="alumni_id" value={formData.alumni_id} onChange={handleInputChange} className={styles.input} required>
                                            <option value="">Pilih Nama Alumni</option>
                                            {alumniList.map((alumni) => (
                                                <option key={alumni.id} value={alumni.id}>
                                                    {alumni.siswa?.nama_lengkap || `Alumni #${alumni.id}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Cabang</label>
                                        <input
                                            type="text"
                                            value={formData.cabang_name}
                                            readOnly
                                            className={styles.input}
                                            placeholder="Cabang otomatis terisi"
                                            style={{ backgroundColor: '#f5f7fb', cursor: 'not-allowed' }}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Program</label>
                                        <input
                                            type="text"
                                            value={formData.program_name}
                                            readOnly
                                            className={styles.input}
                                            placeholder="Program otomatis terisi"
                                            style={{ backgroundColor: '#f5f7fb', cursor: 'not-allowed' }}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Gambar Suasana</label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            name="gambar_suasana"
                                            onChange={handleInputChange}
                                            className={styles.input}
                                        />
                                        <small style={{ color: '#555' }}>Maks 20 MB</small>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Gambar Karya Bebas</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            name="gambar_karya_bebas"
                                            onChange={handleInputChange}
                                            className={styles.input}
                                        />
                                        <small style={{ color: '#555' }}>Maks 20 MB</small>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                                        <button type="button" className={styles.secondaryButton} onClick={() => { setShowModal(false); setEditingId(null); resetForm(); }}>
                                            Batal
                                        </button>
                                        <button type="submit" className={styles.addButton} disabled={loading}>
                                            {editingId ? 'Simpan Perubahan' : 'Simpan'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
