import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { siswaService } from '../services/siswaService';
import { kategoriProgramService } from '../services/kategoriProgramService';
import { programService } from '../services/programService';
import { useAuth } from '../hooks/useAuth';
import styles from './SuperAdminSettings.module.css';

const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin_cabang', label: 'Admin Cabang' },
    { value: 'pengajar', label: 'Pengajar' },
    { value: 'direksi', label: 'Direksi' },
    { value: 'staff_karyawan', label: 'Staff Karyawan' },
];

export const SuperAdminSettings = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cabangOptions, setCabangOptions] = useState([]);
    const [kategoriList, setKategoriList] = useState([]);
    const [kategoriForm, setKategoriForm] = useState({ nama: '', deskripsi: '', tipe: '' });
    const [editingKategoriId, setEditingKategoriId] = useState(null);

    const [programs, setPrograms] = useState([]);
    const [programPagination, setProgramPagination] = useState(null);
    const [programForm, setProgramForm] = useState({ nama: '', kategori_program_id: '', kelas_min: 1, kelas_max: 6, deskripsi: '' });
    const [editingProgramId, setEditingProgramId] = useState(null);
    const [pagePrograms, setPagePrograms] = useState(1);
    const [perPagePrograms, setPerPagePrograms] = useState(20);
    const [formState, setFormState] = useState({
        nama: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'admin_cabang',
        cabang_id: '',
        is_active: true,
    });
    const [editingId, setEditingId] = useState(null);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchUsers(page);
        fetchCabangOptions();
        fetchKategoriList();
        fetchPrograms(pagePrograms);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    useEffect(() => {
        fetchPrograms(pagePrograms);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagePrograms]);

    const fetchUsers = async (pageToUse = 1) => {
        try {
            setLoading(true);
            const response = await userService.getAll({ per_page: perPage, page: pageToUse });
            if (response.success) {
                setUsers(response.data || []);
                setPagination(response.pagination);
            }
        } catch (err) {
            console.error(err);
            setError('Gagal memuat daftar user.');
        } finally {
            setLoading(false);
        }
    };

    const fetchKategoriList = async () => {
        try {
            const res = await kategoriProgramService.getAll({ per_page: 1000 });
            if (res.success) setKategoriList(res.data || []);
        } catch (err) {
            console.error('Gagal memuat kategori program', err);
        }
    };

    const fetchPrograms = async (pageToUse = 1) => {
        try {
            setLoading(true);
            const response = await programService.getAll({ per_page: perPagePrograms, page: pageToUse });
            if (response.success) {
                setPrograms(response.data || []);
                setProgramPagination(response.pagination);
            }
        } catch (err) {
            console.error(err);
            setError('Gagal memuat daftar program.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCabangOptions = async () => {
        try {
            const response = await siswaService.getCabang();
            if (response.success) {
                setCabangOptions(response.data || []);
            }
        } catch (err) {
            console.error('Gagal memuat cabang:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormState((prev) => {
            const next = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            };
            if (name === 'role' && value !== 'admin_cabang') next.cabang_id = '';
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (formState.role === 'admin_cabang' && !formState.cabang_id) {
            setError('Pilih cabang terlebih dahulu untuk role Admin Cabang.');
            return;
        }

        try {
            let response;
            if (editingId) {
                response = await userService.update(editingId, formState);
            } else {
                response = await userService.create(formState);
            }

            if (response.success) {
                setSuccessMessage(response.message || (editingId ? 'User berhasil diperbarui' : 'User baru berhasil dibuat'));
                setFormState({
                    nama: '',
                    email: '',
                    password: '',
                    password_confirmation: '',
                    role: 'admin_cabang',
                    cabang_id: '',
                    is_active: true,
                });
                setEditingId(null);
                fetchUsers(page);
            }
        } catch (err) {
            console.error(err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.errors) {
                setError(Object.values(err.response.data.errors).flat().join(' '));
            } else {
                setError('Terjadi kesalahan saat menyimpan user.');
            }
        }
    };

    const handleEdit = (u) => {
        setEditingId(u.id);
        setFormState({
            nama: u.nama || '',
            email: u.email || '',
            password: '',
            password_confirmation: '',
            role: u.role || 'staff_karyawan',
            cabang_id: u.cabang_id || '',
            is_active: !!u.is_active,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormState({
            nama: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'admin_cabang',
            cabang_id: '',
            is_active: true,
        });
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus user ini?')) return;
        try {
            const res = await userService.delete(id);
            if (res.success) {
                fetchUsers(page);
            }
        } catch (err) {
            console.error('Gagal menghapus user', err);
            setError('Gagal menghapus user.');
        }
    };

    const changePage = (p) => {
        if (!pagination) return;
        const newPage = Math.max(1, Math.min(p, pagination.last_page || 1));
        setPage(newPage);
    };

    // KategoriProgram handlers
    const handleKategoriChange = (e) => {
        const { name, value } = e.target;
        setKategoriForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleKategoriSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            let res;
            if (editingKategoriId) {
                res = await kategoriProgramService.update(editingKategoriId, kategoriForm);
            } else {
                res = await kategoriProgramService.create(kategoriForm);
            }
            if (res.success) {
                setKategoriForm({ nama: '', deskripsi: '', tipe: '' });
                setEditingKategoriId(null);
                fetchKategoriList();
            }
        } catch (err) {
            console.error(err);
            setError('Gagal menyimpan kategori program.');
        }
    };

    const editKategori = (k) => {
        setEditingKategoriId(k.id);
        setKategoriForm({ nama: k.nama || '', deskripsi: k.deskripsi || '', tipe: k.tipe || '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteKategori = async (id) => {
        if (!confirm('Hapus kategori program ini?')) return;
        try {
            const res = await kategoriProgramService.delete(id);
            if (res.success) fetchKategoriList();
        } catch (err) {
            console.error(err);
            setError('Gagal menghapus kategori program.');
        }
    };

    const cancelKategoriEdit = () => {
        setEditingKategoriId(null);
        setKategoriForm({ nama: '', deskripsi: '', tipe: '' });
    };

    // Program handlers
    const handleProgramChange = (e) => {
        const { name, value } = e.target;
        setProgramForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleProgramSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            let res;
            if (editingProgramId) {
                res = await programService.update(editingProgramId, programForm);
            } else {
                res = await programService.create(programForm);
            }
            if (res.success) {
                setProgramForm({ nama: '', kategori_program_id: '', kelas_min: 1, kelas_max: 6, deskripsi: '' });
                setEditingProgramId(null);
                fetchPrograms(pagePrograms);
                fetchKategoriList();
            }
        } catch (err) {
            console.error(err);
            setError('Gagal menyimpan program.');
        }
    };

    const editProgram = (p) => {
        setEditingProgramId(p.id);
        setProgramForm({ nama: p.nama || '', kategori_program_id: p.kategori_program_id || '', kelas_min: p.kelas_min || 1, kelas_max: p.kelas_max || 6, deskripsi: p.deskripsi || '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteProgram = async (id) => {
        if (!confirm('Hapus program ini?')) return;
        try {
            const res = await programService.delete(id);
            if (res.success) fetchPrograms(pagePrograms);
        } catch (err) {
            console.error(err);
            setError('Gagal menghapus program.');
        }
    };

    const changePagePrograms = (p) => {
        if (!programPagination) return;
        const newPage = Math.max(1, Math.min(p, programPagination.last_page || 1));
        setPagePrograms(newPage);
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <div>
                    <h1>Pengaturan Super Admin</h1>
                    <p>Buat akun baru dan kelola hak akses user dari sini.</p>
                </div>
                <div className={styles.userBadge}>
                    <span>{user?.nama || 'Super Admin'}</span>
                    <strong>{user?.role || 'super_admin'}</strong>
                </div>
            </div>

            <div className={styles.gridLayout}>
                <section className={styles.card}>
                    <h2>{editingId ? 'Edit User' : 'Buat User Baru'}</h2>
                    <p className={styles.subText}>Isi data pengguna baru dan tetapkan hak akses.</p>

                    {error && <div className={styles.alertError}>{error}</div>}
                    {successMessage && <div className={styles.alertSuccess}>{successMessage}</div>}

                    <form onSubmit={handleSubmit} className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Nama Lengkap</label>
                            <input
                                name="nama"
                                value={formState.nama}
                                onChange={handleChange}
                                placeholder="Nama user"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input
                                name="email"
                                type="email"
                                value={formState.email}
                                onChange={handleChange}
                                placeholder="email@example.com"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Password</label>
                            <input
                                name="password"
                                type="password"
                                value={formState.password}
                                onChange={handleChange}
                                placeholder="********"
                                required={!editingId}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Ulangi Password</label>
                            <input
                                name="password_confirmation"
                                type="password"
                                value={formState.password_confirmation}
                                onChange={handleChange}
                                placeholder="********"
                                required={!editingId}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Role</label>
                            <select name="role" value={formState.role} onChange={handleChange}>
                                {roleOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {formState.role === 'admin_cabang' && (
                            <div className={styles.formGroup}>
                                <label>Cabang</label>
                                <select name="cabang_id" value={formState.cabang_id} onChange={handleChange}>
                                    <option value="">Pilih cabang</option>
                                    {cabangOptions.map((cabang) => (
                                        <option key={cabang.id} value={cabang.id}>
                                            {cabang.nama} - {cabang.kota}
                                        </option>
                                    ))}
                                </select>
                                <p className={styles.noteText}>
                                    Pilih hanya jika role <strong>Admin Cabang</strong>.
                                </p>
                            </div>
                        )}

                        <div className={styles.formGroupCheckbox}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formState.is_active}
                                    onChange={handleChange}
                                />
                                Akun aktif
                            </label>
                        </div>
                        <div className={styles.formAction}>
                            {editingId ? (
                                <>
                                    <button type="button" onClick={handleCancelEdit} className={styles.buttonSecondary} style={{ marginRight: 8 }}>
                                        Batal
                                    </button>
                                    <button type="submit" className={styles.buttonPrimary}>
                                        Simpan Perubahan
                                    </button>
                                </>
                            ) : (
                                <button type="submit" className={styles.buttonPrimary}>
                                    Buat User Baru
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Daftar User</h2>
                        <span>{loading ? 'Memuat...' : `${pagination?.total ?? users.length} user`}</span>
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className={styles.emptyRow}>
                                            Tidak ada user.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u.id}>
                                            <td>{u.nama}</td>
                                            <td>{u.email}</td>
                                            <td>{u.role}</td>
                                            <td>{u.is_active ? 'Aktif' : 'Non-aktif'}</td>
                                            <td>
                                                <button className={styles.tableBtn} onClick={() => handleEdit(u)} style={{ marginRight: 8 }}>Edit</button>
                                                <button className={styles.tableBtnDanger} onClick={() => handleDelete(u.id)}>Hapus</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {pagination && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                <div className={styles.noteText}>Halaman {pagination.current_page} dari {pagination.last_page}</div>
                                <div>
                                    <button onClick={() => changePage(pagination.current_page - 1)} disabled={pagination.current_page <= 1} className={styles.pageBtn}>Prev</button>
                                    <button onClick={() => changePage(pagination.current_page + 1)} disabled={pagination.current_page >= pagination.last_page} className={styles.pageBtn} style={{ marginLeft: 8 }}>Next</button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <div className={styles.gridLayout} style={{ marginTop: 24 }}>
                <section className={styles.card}>
                    <h2>{editingKategoriId ? 'Edit Kategori Program' : 'Buat Kategori Program'}</h2>
                    <p className={styles.subText}>Kelola kategori program yang akan digunakan untuk mengelompokkan program.</p>

                    <form onSubmit={handleKategoriSubmit} className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Nama Kategori</label>
                            <input name="nama" value={kategoriForm.nama} onChange={handleKategoriChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Tipe (optional)</label>
                            <input name="tipe" value={kategoriForm.tipe} onChange={handleKategoriChange} placeholder="tipe internal" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Deskripsi</label>
                            <input name="deskripsi" value={kategoriForm.deskripsi} onChange={handleKategoriChange} />
                        </div>
                        <div className={styles.formAction}>
                            {editingKategoriId ? (
                                <>
                                    <button type="button" onClick={cancelKategoriEdit} className={styles.buttonSecondary} style={{ marginRight: 8 }}>Batal</button>
                                    <button type="submit" className={styles.buttonPrimary}>Simpan Perubahan</button>
                                </>
                            ) : (
                                <button type="submit" className={styles.buttonPrimary}>Buat Kategori</button>
                            )}
                        </div>
                    </form>

                    <div className={styles.tableWrapper} style={{ marginTop: 12 }}>
                        <h3>Daftar Kategori</h3>
                        <table className={styles.table}>
                            <thead>
                                <tr><th>Nama</th><th>Tipe</th><th>Aksi</th></tr>
                            </thead>
                            <tbody>
                                {kategoriList.length === 0 ? (
                                    <tr><td colSpan="3" className={styles.emptyRow}>Tidak ada kategori.</td></tr>
                                ) : (
                                    kategoriList.map((k) => (
                                        <tr key={k.id}>
                                            <td>{k.nama}</td>
                                            <td>{k.tipe}</td>
                                            <td>
                                                <button className={styles.tableBtn} onClick={() => editKategori(k)} style={{ marginRight: 8 }}>Edit</button>
                                                <button className={styles.tableBtnDanger} onClick={() => deleteKategori(k.id)}>Hapus</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className={styles.card}>
                    <h2>{editingProgramId ? 'Edit Program' : 'Buat Program Baru'}</h2>
                    <p className={styles.subText}>Tambah program dan tentukan kategori serta rentang kelas (1-12).</p>

                    <form onSubmit={handleProgramSubmit} className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Nama Program</label>
                            <input name="nama" value={programForm.nama} onChange={handleProgramChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Kategori Program</label>
                            <select name="kategori_program_id" value={programForm.kategori_program_id} onChange={handleProgramChange} required>
                                <option value="">Pilih kategori</option>
                                {kategoriList.map((k) => (
                                    <option key={k.id} value={k.id}>{k.nama}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Kelas Min</label>
                            <select name="kelas_min" value={programForm.kelas_min} onChange={handleProgramChange}>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Kelas Max</label>
                            <select name="kelas_max" value={programForm.kelas_max} onChange={handleProgramChange}>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Deskripsi</label>
                            <input name="deskripsi" value={programForm.deskripsi} onChange={handleProgramChange} />
                        </div>
                        <div className={styles.formAction}>
                            {editingProgramId ? (
                                <>
                                    <button type="button" onClick={() => { setEditingProgramId(null); setProgramForm({ nama: '', kategori_program_id: '', kelas_min: 1, kelas_max: 6, deskripsi: '' }); }} className={styles.buttonSecondary} style={{ marginRight: 8 }}>Batal</button>
                                    <button type="submit" className={styles.buttonPrimary}>Simpan Perubahan</button>
                                </>
                            ) : (
                                <button type="submit" className={styles.buttonPrimary}>Buat Program</button>
                            )}
                        </div>
                    </form>

                    <div className={styles.tableWrapper} style={{ marginTop: 12 }}>
                        <h3>Daftar Program</h3>
                        <table className={styles.table}>
                            <thead>
                                <tr><th>Nama</th><th>Kategori</th><th>Kelas</th><th>Aksi</th></tr>
                            </thead>
                            <tbody>
                                {programs.length === 0 ? (
                                    <tr><td colSpan="4" className={styles.emptyRow}>Tidak ada program.</td></tr>
                                ) : (
                                    programs.map((p) => (
                                        <tr key={p.id}>
                                            <td>{p.nama}</td>
                                            <td>{p.kategori_program?.nama || '-'}</td>
                                            <td>{p.kelas_min} - {p.kelas_max}</td>
                                            <td>
                                                <button className={styles.tableBtn} onClick={() => editProgram(p)} style={{ marginRight: 8 }}>Edit</button>
                                                <button className={styles.tableBtnDanger} onClick={() => deleteProgram(p.id)}>Hapus</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {programPagination && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                <div className={styles.noteText}>Halaman {programPagination.current_page} dari {programPagination.last_page}</div>
                                <div>
                                    <button onClick={() => changePagePrograms(programPagination.current_page - 1)} disabled={programPagination.current_page <= 1} className={styles.pageBtn}>Prev</button>
                                    <button onClick={() => changePagePrograms(programPagination.current_page + 1)} disabled={programPagination.current_page >= programPagination.last_page} className={styles.pageBtn} style={{ marginLeft: 8 }}>Next</button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};
