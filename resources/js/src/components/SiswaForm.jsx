import React, { useState, useEffect } from 'react';
import styles from './SiswaForm.module.css';
import api from '../../services/api';

export const SiswaForm = ({ onSubmit, initialData = null, onCancel }) => {
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        kelas: '',
        asal_sekolah: '',
        no_hp: '',
        tanggal_lahir: '',
        jenis_kelamin: '',
        alamat: '',
        email: '',
        program_id: [],
        cabang_id: '',
        informasi_villa_merah: '',
        foto: null,
        tahun_masuk: new Date().getFullYear(),
        tahun_lulus: null,
    });

    const [cabangs, setCabangs] = useState([]);
    const [programs, setPrograms] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    // Fetch data ketika component mount
    useEffect(() => {
        fetchCabangs();
    }, []);

    // Fetch programs ketika kelas berubah
    useEffect(() => {
        if (formData.kelas) {
            fetchPrograms(formData.kelas);
        }
    }, [formData.kelas]);

    const fetchCabangs = async () => {
        try {
            const response = await api.get('/siswa-data/cabang');
            setCabangs(response.data.data);
        } catch (err) {
            setError('Gagal memuat data cabang');
        }
    };

    const fetchPrograms = async (kelas) => {
        try {
            const response = await api.get('/siswa-data/program-by-kelas', {
                params: { kelas }
            });
            setPrograms(response.data.data);
        } catch (err) {
            setError('Gagal memuat data program');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setFormData({
                ...formData,
                [name]: files[0]
            });
            return;
        }

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleProgramToggle = (programId) => {
        setFormData({
            ...formData,
            program_id: formData.program_id.includes(programId)
                ? formData.program_id.filter(id => id !== programId)
                : [...formData.program_id, programId]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formDataObj = new FormData();

            // Append semua field
            Object.keys(formData).forEach(key => {
                if (key === 'program_id') {
                    formData.program_id.forEach((id) => {
                        formDataObj.append('program_id[]', id);
                    });
                } else if (key === 'foto' && formData.foto instanceof File) {
                    formDataObj.append(key, formData.foto);
                } else if (formData[key] !== null) {
                    formDataObj.append(key, formData[key]);
                }
            });

            if (initialData?.id) {
                // Update
                await api.put(`/siswa/${initialData.id}`, formDataObj, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Create
                await api.post('/siswa', formDataObj, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (onSubmit) {
                onSubmit();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan data siswa');
        } finally {
            setLoading(false);
        }
    };

    const classOptions = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: `Kelas ${i + 1}${i < 6 ? ' SD' : i < 9 ? ' SMP' : ' SMA'}`
    }));

    return (
        <form onSubmit={handleSubmit} className={styles.form} encType="multipart/form-data">
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formGroup}>
                <label htmlFor="nama_lengkap">Nama Lengkap *</label>
                <input
                    type="text"
                    id="nama_lengkap"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="kelas">Kelas *</label>
                    <select
                        id="kelas"
                        name="kelas"
                        value={formData.kelas}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Pilih Kelas</option>
                        {classOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="asal_sekolah">Asal Sekolah *</label>
                <input
                    type="text"
                    id="asal_sekolah"
                    name="asal_sekolah"
                    value={formData.asal_sekolah}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="no_hp">No HP *</label>
                    <input
                        type="tel"
                        id="no_hp"
                        name="no_hp"
                        value={formData.no_hp}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email Siswa *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="tanggal_lahir">Tanggal Lahir *</label>
                    <input
                        type="date"
                        id="tanggal_lahir"
                        name="tanggal_lahir"
                        value={formData.tanggal_lahir}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="jenis_kelamin">Jenis Kelamin *</label>
                    <select
                        id="jenis_kelamin"
                        name="jenis_kelamin"
                        value={formData.jenis_kelamin}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="laki-laki">Laki-laki</option>
                        <option value="perempuan">Perempuan</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="tahun_masuk">Tanggal Masuk (Tahun) *</label>
                    <input
                        type="number"
                        id="tahun_masuk"
                        name="tahun_masuk"
                        value={formData.tahun_masuk}
                        onChange={handleInputChange}
                        required
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="alamat">Alamat Lengkap *</label>
                <textarea
                    id="alamat"
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleInputChange}
                    rows="3"
                    required
                />
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="cabang_id">Cabang *</label>
                    <select
                        id="cabang_id"
                        name="cabang_id"
                        value={formData.cabang_id}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Pilih Cabang</option>
                        {cabangs.map(cabang => (
                            <option key={cabang.id} value={cabang.id}>{cabang.nama}</option>
                        ))}
                    </select>
                </div>

            </div>

            <div className={styles.formGroup}>
                <label htmlFor="informasi_villa_merah">Informasi Villa Merah *</label>
                <select
                    id="informasi_villa_merah"
                    name="informasi_villa_merah"
                    value={formData.informasi_villa_merah}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Pilih Sumber Informasi</option>
                    <option value="website">Website</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="kerabat">Kerabat</option>
                    <option value="orang_tua">Orang Tua</option>
                    <option value="teman">Teman</option>
                </select>
            </div>

            {Object.keys(programs).length > 0 && (
                <div className={styles.formGroup}>
                    <label>Program Kelas yang Diikuti *</label>
                    <div className={styles.programGrid}>
                        {Object.entries(programs).map(([category, progs]) => (
                            <div key={category} className={styles.programCategory}>
                                <h4>{category}</h4>
                                {progs.map(prog => (
                                    <label key={prog.id} className={styles.programCheckbox}>
                                        <input
                                            type="checkbox"
                                            checked={formData.program_id.includes(prog.id)}
                                            onChange={() => handleProgramToggle(prog.id)}
                                        />
                                        <span>{prog.nama}</span>
                                    </label>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.formActions}>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className={styles.cancelBtn}>
                        Batal
                    </button>
                )}
            </div>
        </form>
    );
};
