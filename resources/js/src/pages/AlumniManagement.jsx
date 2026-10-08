import React, { useState, useEffect, useRef } from 'react';
import { alumniService } from '../services/alumniService';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGraduationCap,
    faTrash,
    faPlus,
    faFileCsv,
    faSearch,
    faCalendarDays,
    faCompass,
    faEye,
    faPen,
    faChevronLeft,
    faChevronRight,
    faBookOpen,
    faXmark,
    faSchool,
    faUserGraduate,
    faBuilding,
    faVenusMars,
    faPhone,
    faLocationDot,
    faEnvelope,
    faCircleInfo,
} from '@fortawesome/free-solid-svg-icons';
import styles from './SiswaManagement.module.css';

export const AlumniManagement = () => {
    const { user } = useAuth();
    const canWrite = user && ['super_admin', 'admin_cabang'].includes(user.role);
    const canExportCsv = user && !['staff_karyawan', 'pengajar'].includes(user.role);
    const [alumniList, setAlumniList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [siswaList, setSiswaList] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [cabangList, setCabangList] = useState([]);
    
    const [formData, setFormData] = useState({
        siswa_id: '',
        siswa_name: '',
        cabang_name: '',
        nama_lengkap: '',
        kelas: '',
        asal_sekolah: '',
        tanggal_lahir: '',
        jenis_kelamin: '',
        no_hp: '',
        alamat: '',
        email: '',
        informasi_villa_merah: '',
        program_id: '',
        program_name: '',
        tahun_masuk: '',
        status_kelulusan: 'lolos',
        ptn_diterima: '',
        jurusan: '',
        jalur_masuk: '',
        tahun_diterima: new Date().getFullYear(),
        testimoni: '',
    });

    const [filters, setFilters] = useState({
        cabang_id: '',
        nama_lengkap: '',
        tahun_diterima: '',
        jalur_masuk: '',
        ptn_diterima: '',
        status_kelulusan: '',
        per_page: 10,
        page: 1,
    });

    const [pagination, setPagination] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const wilayahCacheRef = useRef({
        provinces: null,
        regencies: {},
        districts: {},
        villages: {},
    });

    useEffect(() => {
        if (user) {
            const userFilters = {
                cabang_id: user.role === 'admin_cabang' ? user.cabang_id : '',
                tahun_diterima: '',
                jalur_masuk: '',
                ptn_diterima: '',
                status_kelulusan: '',
                per_page: 10,
                page: 1,
            };
            setFilters(userFilters);
            fetchCabang();
            fetchAlumniWithFilters(userFilters);
            fetchSiswaData();
            fetchStatistics();
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            fetchAlumniWithFilters(filters);
        }
    }, [filters.cabang_id, filters.nama_lengkap, filters.tahun_diterima, filters.jalur_masuk, filters.ptn_diterima, filters.status_kelulusan, filters.page, filters.per_page]);

    const fetchAlumniWithFilters = async (filtersToUse) => {
        try {
            setLoading(true);
            const response = await alumniService.getAll(filtersToUse);
            if (response.success) {
                setAlumniList(response.data);
                setPagination(response.pagination);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching alumni:', err);
            setError('Gagal memuat data alumni');
        } finally {
            setLoading(false);
        }
    };

    const fetchSiswaData = async () => {
        try {
            const response = await api.get('/siswa', {
                params: { per_page: 1000 }
            });
            if (response.data.success) {
                setSiswaList(response.data.data);
            }
        } catch (err) {
            console.error('Gagal memuat data siswa:', err);
        }
    };

    const fetchCabang = async () => {
        try {
            const response = await api.get('/siswa-data/cabang');
            if (response.data.success) {
                setCabangList(response.data.data || []);
            }
        } catch (err) {
            console.error('Gagal memuat data cabang:', err);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await alumniService.getStatistics();
            if (response.success) {
                setStatistics(response.data);
            }
        } catch (err) {
            console.error('Error fetching statistics:', err);
        }
    };

    const cabangOptions = user?.role === 'admin_cabang'
        ? cabangList.filter((cabang) => String(cabang.id) === String(user.cabang_id))
        : cabangList;

    const formatDateForInput = (dateValue) => {
        if (!dateValue) {
            return '';
        }
        try {
            return new Date(dateValue).toISOString().split('T')[0];
        } catch {
            return dateValue;
        }
    };

    const formatDateForDisplay = (dateValue) => {
        if (!dateValue) {
            return '-';
        }

        const rawValue = typeof dateValue === 'string' ? dateValue.trim() : String(dateValue);

        const isoMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;
        }

        try {
            const date = new Date(rawValue);
            if (Number.isNaN(date.getTime())) {
                return rawValue;
            }
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch {
            return rawValue;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'siswa_id') {
            const selectedSiswa = siswaList.find((siswa) => String(siswa.id) === value);
            if (selectedSiswa) {
                setFormData({
                    ...formData,
                    siswa_id: value,
                    siswa_name: selectedSiswa.nama_lengkap || '',
                    cabang_name: selectedSiswa.cabang?.nama || '',
                    nama_lengkap: selectedSiswa.nama_lengkap || '',
                    kelas: selectedSiswa.kelas || '',
                    asal_sekolah: selectedSiswa.asal_sekolah || '',
                    tanggal_lahir: formatDateForInput(selectedSiswa.tanggal_lahir),
                    jenis_kelamin: selectedSiswa.jenis_kelamin || '',
                    no_hp: selectedSiswa.no_hp || '',
                    alamat: selectedSiswa.alamat || '',
                    email: selectedSiswa.email || '',
                    informasi_villa_merah: selectedSiswa.informasi_villa_merah || '',
                    program_id: selectedSiswa.program?.[0]?.id || '',
                    program_name: selectedSiswa.program?.[0]?.nama || '',
                    tahun_masuk: formatDateForInput(selectedSiswa.tahun_masuk),
                });
                return;
            }
        }

        if (name === 'status_kelulusan') {
            if (value === 'tidak_lolos') {
                setFormData((prev) => ({
                    ...prev,
                    status_kelulusan: value,
                    ptn_diterima: '-',
                    jurusan: '-',
                    // keep jalur_masuk editable for "tidak_lolos"
                    // do not force it to '-', preserve previous or empty value
                    tahun_diterima: '-',
                    testimoni: '-',
                }));
                return;
            }

            setFormData((prev) => ({
                ...prev,
                status_kelulusan: value,
                ptn_diterima: '',
                jurusan: '',
                jalur_masuk: '',
                tahun_diterima: new Date().getFullYear(),
                testimoni: '',
            }));
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            if (!formData.siswa_id) {
                setError('❌ Pilih Siswa terlebih dahulu');
                setLoading(false);
                return;
            }

            const submitData = {
                siswa_id: parseInt(formData.siswa_id),
                nama_lengkap: formData.nama_lengkap || null,
                kelas: formData.kelas ? parseInt(formData.kelas) : null,
                asal_sekolah: formData.asal_sekolah || null,
                tanggal_lahir: formData.tanggal_lahir || null,
                jenis_kelamin: formData.jenis_kelamin || null,
                no_hp: formData.no_hp || null,
                alamat: formData.alamat || null,
                email: formData.email || null,
                informasi_villa_merah: formData.informasi_villa_merah || null,
                program_id: formData.program_id || null,
                tahun_masuk: formData.tahun_masuk || null,
                status_kelulusan: formData.status_kelulusan || null,
                ptn_diterima: formData.ptn_diterima && formData.ptn_diterima !== '-' ? formData.ptn_diterima : '',
                jurusan: formData.jurusan && formData.jurusan !== '-' ? formData.jurusan : '',
                jalur_masuk: formData.jalur_masuk && formData.jalur_masuk !== '-' ? formData.jalur_masuk : null,
                tahun_diterima: formData.tahun_diterima && formData.tahun_diterima !== '-' ? parseInt(formData.tahun_diterima) : null,
                testimoni: formData.testimoni && formData.testimoni !== '-' ? formData.testimoni : '',
            };

            // If status is 'tidak_lolos', clear the related fields before sending.
            // Keep jalur_masuk if user filled it — do not overwrite it here.
            if (formData.status_kelulusan === 'tidak_lolos') {
                submitData.ptn_diterima = '';
                submitData.jurusan = '';
                // do NOT set submitData.jalur_masuk = null; preserve value selected by user
                submitData.tahun_diterima = null;
                submitData.testimoni = '';
            }

            if (editingId) {
                await alumniService.update(editingId, submitData);
            } else {
                await alumniService.create(submitData);
            }
            
            setShowModal(false);
            setEditingId(null);
            resetForm();
            await fetchAlumniWithFilters(filters);
            await fetchStatistics();
            try { window.dispatchEvent(new Event('statistik:updated')); } catch (e) {}
        } catch (err) {
            console.error('Error:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.errors) {
                const errorMessages = Object.values(err.response.data.errors)
                    .flat()
                    .join(', ');
                setError(errorMessages || 'Gagal menyimpan data alumni');
            } else {
                setError('Gagal menyimpan data alumni');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            siswa_id: '',
            siswa_name: '',
            cabang_name: '',
            nama_lengkap: '',
            kelas: '',
            asal_sekolah: '',
            tanggal_lahir: '',
            jenis_kelamin: '',
            no_hp: '',
            alamat: '',
            email: '',
            informasi_villa_merah: '',
            program_id: '',
            program_name: '',
            tahun_masuk: '',
            status_kelulusan: 'lolos',
            ptn_diterima: '',
            jurusan: '',
            jalur_masuk: '',
            tahun_diterima: new Date().getFullYear(),
            testimoni: '',
        });
    };

    const handleEdit = async (id) => {
        try {
            setShowModal(true);
            setLoading(true);
            
            const response = await alumniService.getById(id);
            if (response.success) {
                const editData = response.data;
                const siswa = editData.siswa || {};

                setFormData({
                    siswa_id: editData.siswa_id,
                    siswa_name: siswa.nama_lengkap || editData.siswa_name || '',
                    cabang_name: siswa.cabang?.nama || '',
                    nama_lengkap: siswa.nama_lengkap || '',
                    kelas: siswa.kelas || '',
                    asal_sekolah: siswa.asal_sekolah || '',
                    tanggal_lahir: formatDateForInput(siswa.tanggal_lahir),
                    jenis_kelamin: siswa.jenis_kelamin || '',
                    no_hp: siswa.no_hp || '',
                    alamat: siswa.alamat || '',
                    email: siswa.email || '',
                    informasi_villa_merah: siswa.informasi_villa_merah || '',
                    program_id: siswa.program?.[0]?.id || '',
                    program_name: siswa.program?.[0]?.nama || '',
                    tahun_masuk: formatDateForInput(siswa.tahun_masuk),
                    status_kelulusan: editData.status_kelulusan || 'lolos',
                    ptn_diterima: editData.status_kelulusan === 'tidak_lolos' ? (editData.ptn_diterima || '-') : (editData.ptn_diterima || ''),
                    jurusan: editData.status_kelulusan === 'tidak_lolos' ? (editData.jurusan || '-') : (editData.jurusan || ''),
                // keep jalur_masuk editable even if status is 'tidak_lolos'
                jalur_masuk: editData.jalur_masuk || '',
                tahun_diterima: editData.status_kelulusan === 'tidak_lolos' ? (editData.tahun_diterima || '-') : (editData.tahun_diterima || new Date().getFullYear()),
                testimoni: editData.status_kelulusan === 'tidak_lolos' ? (editData.testimoni || '-') : (editData.testimoni || ''),
                });
                setEditingId(id);
            }
            setLoading(false);
        } catch (err) {
            setError('Gagal memuat data alumni');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data alumni ini?')) {
            try {
                await alumniService.delete(id);
                await fetchAlumniWithFilters(filters);
                await fetchStatistics();
                try { window.dispatchEvent(new Event('statistik:updated')); } catch (e) {}
            } catch (err) {
                setError('Gagal menghapus data alumni');
            }
        }
    };

    const fetchWilayahCache = async () => {
        if (wilayahCacheRef.current.provinces) {
            return wilayahCacheRef.current.provinces;
        }

        const response = await api.get('/wilayah/provinces');
        const provinces = response.data.data || [];
        wilayahCacheRef.current.provinces = provinces;
        return provinces;
    };

    const fetchRegenciesCached = async (provinceCode) => {
        const key = String(provinceCode);
        if (wilayahCacheRef.current.regencies[key]) {
            return wilayahCacheRef.current.regencies[key];
        }

        const response = await api.get(`/wilayah/regencies/${key}`);
        const regencies = response.data.data || [];
        wilayahCacheRef.current.regencies[key] = regencies;
        return regencies;
    };

    const fetchDistrictsCached = async (regencyCode) => {
        const key = String(regencyCode);
        if (wilayahCacheRef.current.districts[key]) {
            return wilayahCacheRef.current.districts[key];
        }

        const response = await api.get(`/wilayah/districts/${key}`);
        const districts = response.data.data || [];
        wilayahCacheRef.current.districts[key] = districts;
        return districts;
    };

    const fetchVillagesCached = async (districtCode) => {
        const key = String(districtCode);
        if (wilayahCacheRef.current.villages[key]) {
            return wilayahCacheRef.current.villages[key];
        }

        const response = await api.get(`/wilayah/villages/${key}`);
        const villages = response.data.data || [];
        wilayahCacheRef.current.villages[key] = villages;
        return villages;
    };

    const handleDetail = async (id) => {
        try {
            setShowDetailModal(true);
            setLoading(true);
            const response = await alumniService.getById(id);

            if (!response.success) {
                throw new Error(response.message || 'Alumni tidak ditemukan');
            }

            const selected = response.data;
            const siswa = selected?.siswa || {};
            const provinces = await fetchWilayahCache();
            let regencies = [];
            let districts = [];
            let villages = [];

            if (siswa?.provinsi_code) {
                regencies = await fetchRegenciesCached(siswa.provinsi_code);
            }
            if (siswa?.kabupaten_code) {
                districts = await fetchDistrictsCached(siswa.kabupaten_code);
            }
            if (siswa?.kecamatan_code) {
                villages = await fetchVillagesCached(siswa.kecamatan_code);
            }

            setDetailData({
                ...selected,
                siswa: {
                    ...siswa,
                    _provinsi_name: provinces.find((item) => String(item.code) === String(siswa?.provinsi_code))?.name || siswa?.provinsi_code || '-',
                    _kabupaten_name: regencies.find((item) => String(item.code) === String(siswa?.kabupaten_code))?.name || siswa?.kabupaten_code || '-',
                    _kecamatan_name: districts.find((item) => String(item.code) === String(siswa?.kecamatan_code))?.name || siswa?.kecamatan_code || '-',
                    _desa_name: villages.find((item) => String(item.code) === String(siswa?.desa_code))?.name || siswa?.desa_code || '-',
                }
            });
            setLoading(false);
        } catch (err) {
            console.error('Gagal memuat detail alumni:', err);
            setError('Gagal memuat detail alumni');
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setEditingId(null);
        resetForm();
        setShowModal(true);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === alumniList.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(alumniList.map(a => a.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            setError('❌ Pilih alumni yang akan dihapus');
            return;
        }

        if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} alumni?`)) {
            return;
        }

        try {
            setLoading(true);
            for (const id of selectedIds) {
                await alumniService.delete(id);
            }
            setSelectedIds([]);
            await fetchAlumniWithFilters(filters);
            await fetchStatistics();
            setError(null);
        } catch (err) {
            setError('Gagal menghapus data alumni');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getSiswaName = (siswaId) => {
        const siswa = siswaList.find(s => s.id === siswaId);
        return siswa ? siswa.nama_lengkap : '-';
    };

    const formatDateForCsv = (value) => {
        if (!value) return '';

        const raw = String(value).trim();
        if (!raw) return '';

        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) {
            return raw;
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const escapeCsvValue = (value) => {
        const normalized = value === null || value === undefined ? '' : String(value);
        return /[",\n]/.test(normalized)
            ? `"${normalized.replace(/"/g, '""')}"`
            : normalized;
    };

    const downloadCsv = (rows, fileName) => {
        if (!rows.length) return;

        const headers = [
            'id',
            'nama_siswa',
            'asal_sekolah',
            'cabang',
            'kelas',
            'tanggal_lahir',
            'no_hp',
            'alamat',
            'email',
            'informasi_villa_merah',
            'program',
            'tahun_masuk',
            'status_kelulusan',
            'ptn_diterima',
            'jurusan',
            'jalur_masuk',
            'tahun_diterima',
            'testimoni',
            'provinsi',
            'kabupaten_kota',
            'kecamatan',
            'desa_kelurahan',
        ];

        const csvRows = [headers.map(escapeCsvValue).join(',')];

        rows.forEach((row) => {
            const siswa = row.siswa || {};
            const provinceName = siswa._provinsi_name || siswa.provinsi?.nama || '';
            const regencyName = siswa._kabupaten_name || siswa.kabupaten?.nama || '';
            const districtName = siswa._kecamatan_name || siswa.kecamatan?.nama || '';
            const villageName = siswa._desa_name || siswa.desa?.nama || '';

            const values = [
                row.id ?? '',
                siswa.nama_lengkap ?? '',
                siswa.asal_sekolah ?? '',
                siswa.cabang?.nama ?? '',
                siswa.kelas ?? '',
                formatDateForCsv(siswa.tanggal_lahir),
                siswa.no_hp ?? '',
                siswa.alamat ?? '',
                siswa.email ?? '',
                siswa.informasi_villa_merah ?? '',
                Array.isArray(siswa.program) && siswa.program.length > 0 ? siswa.program.map((prog) => prog.nama).join(' | ') : (siswa.program?.nama ?? ''),
                formatDateForCsv(siswa.tahun_masuk),
                row.status_kelulusan ?? '',
                row.ptn_diterima ?? '',
                row.jurusan ?? '',
                row.jalur_masuk ?? '',
                row.tahun_diterima ?? '',
                row.testimoni ?? '',
                provinceName,
                regencyName,
                districtName,
                villageName,
            ];

            csvRows.push(values.map(escapeCsvValue).join(','));
        });

        const csvContent = `\uFEFF${csvRows.join('\n')}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportCsv = async () => {
        if (!canExportCsv) {
            setError('Fitur export CSV tidak tersedia untuk role Staff Karyawan.');
            return;
        }

        try {
            setError(null);
            let page = 1;
            let allRecords = [];
            let lastPage = 1;

            do {
                const response = await alumniService.getAll({
                    ...filters,
                    page,
                    per_page: 200,
                });

                if (!response.success) {
                    throw new Error(response.message || 'Gagal mengambil data alumni');
                }

                const pageItems = response.data || [];
                allRecords = [...allRecords, ...pageItems];
                lastPage = response.pagination?.last_page || page;
                page += 1;
            } while (page <= lastPage);

            if (allRecords.length === 0) {
                setError('Tidak ada data alumni yang bisa diekspor.');
                return;
            }

            const provinces = await fetchWilayahCache();
            const exportRows = [];

            for (const row of allRecords) {
                const siswa = row.siswa || {};
                let regencies = [];
                let districts = [];
                let villages = [];

                if (siswa?.provinsi_code) regencies = await fetchRegenciesCached(siswa.provinsi_code);
                if (siswa?.kabupaten_code) districts = await fetchDistrictsCached(siswa.kabupaten_code);
                if (siswa?.kecamatan_code) villages = await fetchVillagesCached(siswa.kecamatan_code);

                exportRows.push({
                    ...row,
                    siswa: {
                        ...siswa,
                        _provinsi_name: provinces.find((item) => String(item.code) === String(siswa?.provinsi_code))?.name || siswa?.provinsi_code || '-',
                        _kabupaten_name: regencies.find((item) => String(item.code) === String(siswa?.kabupaten_code))?.name || siswa?.kabupaten_code || '-',
                        _kecamatan_name: districts.find((item) => String(item.code) === String(siswa?.kecamatan_code))?.name || siswa?.kecamatan_code || '-',
                        _desa_name: villages.find((item) => String(item.code) === String(siswa?.desa_code))?.name || siswa?.desa_code || '-',
                    }
                });
            }

            downloadCsv(exportRows, 'data-alumni.csv');
        } catch (err) {
            console.error('Error exporting alumni CSV:', err);
            setError('Gagal mengekspor data alumni ke CSV');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Header dengan Statistics Cards */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Data Alumni</h1>
                        <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>Kelola dan pantau data alumni sekolah</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {canWrite && selectedIds.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className={styles.deleteButton}
                                style={{ background: 'linear-gradient(135deg, rgb(239 68 68) 0%, rgb(220 38 38) 100%)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
                            >
                                <FontAwesomeIcon icon={faTrash} /> Hapus {selectedIds.length} ({selectedIds.length === alumniList.length ? 'semua' : 'terpilih'})
                            </button>
                        )}
                        {canExportCsv && (
                            <button
                                onClick={handleExportCsv}
                                className={styles.secondaryButton}
                                style={{ background: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(96, 165, 250) 100%)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
                            >
                                <FontAwesomeIcon icon={faFileCsv} /> Export CSV
                            </button>
                        )}
                        {canWrite && (
                            <button className={styles.addButton} onClick={handleAddNew}>
                                <FontAwesomeIcon icon={faPlus} /> Tambah Alumni
                            </button>
                        )}
                    </div>
                </div>

                {/* Statistics Cards */}
                {statistics && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(96, 165, 250, 0.1) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'rgb(59 130 246)' }}>
                                {statistics.total_alumni}
                            </div>
                            <div style={{ color: '#666', marginTop: '0.5rem' }}>Total Alumni</div>
                        </div>

                        <div style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(74, 222, 128, 0.1) 100%)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'rgb(34 197 94)' }}>
                                {statistics.top_ptn?.length || 0}
                            </div>
                            <div style={{ color: '#666', marginTop: '0.5rem' }}>Universitas Tujuan</div>
                        </div>

                        <div style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(192, 132, 250, 0.1) 100%)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'rgb(168 85 247)' }}>
                                {statistics.jalur_masuk?.length || 0}
                            </div>
                            <div style={{ color: '#666', marginTop: '0.5rem' }}>Jalur Masuk</div>
                        </div>

                        <div style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(250, 204, 21, 0.1) 100%)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'rgb(234 179 8)' }}>
                                {statistics.alumni_by_year?.[0]?.tahun || '-'}
                            </div>
                            <div style={{ color: '#666', marginTop: '0.5rem' }}>Tahun Terbaru</div>
                        </div>
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <div className={styles.errorAlert}>
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Filter Card */}
                <div className={styles.filterCard}>
                    <h2 className={styles.filterTitle}>Filter & Pencarian</h2>
                    <div className={styles.filterGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}><FontAwesomeIcon icon={faSearch} /> Nama Siswa</label>
                            <input
                                type="text"
                                value={filters.nama_lengkap}
                                onChange={(e) =>
                                    setFilters({ ...filters, nama_lengkap: e.target.value, page: 1 })
                                }
                                placeholder="Cari nama siswa..."
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}><FontAwesomeIcon icon={faBuilding} /> Cabang</label>
                            <select
                                value={filters.cabang_id}
                                onChange={(e) =>
                                    setFilters({ ...filters, cabang_id: e.target.value, page: 1 })
                                }
                                className={styles.input}
                                disabled={user?.role === 'admin_cabang'}
                            >
                                <option value="">Semua Cabang</option>
                                {cabangOptions.map((cabang) => (
                                    <option key={cabang.id} value={cabang.id}>
                                        {cabang.nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}><FontAwesomeIcon icon={faGraduationCap} /> PTN Diterima</label>
                            <input
                                type="text"
                                value={filters.ptn_diterima}
                                onChange={(e) =>
                                    setFilters({ ...filters, ptn_diterima: e.target.value, page: 1 })
                                }
                                placeholder="Cari PTN..."
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}><FontAwesomeIcon icon={faCalendarDays} /> Tahun Diterima</label>
                            <input
                                type="number"
                                value={filters.tahun_diterima}
                                onChange={(e) =>
                                    setFilters({ ...filters, tahun_diterima: e.target.value, page: 1 })
                                }
                                placeholder="2024"
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}><FontAwesomeIcon icon={faCompass} /> Jalur Masuk</label>
                            <select
                                value={filters.jalur_masuk}
                                onChange={(e) =>
                                    setFilters({ ...filters, jalur_masuk: e.target.value, page: 1 })
                                }
                                className={styles.input}
                            >
                                <option value="">Semua Jalur</option>
                                {statistics?.jalur_masuk?.map((item) => (
                                    <option key={item.jalur_masuk} value={item.jalur_masuk}>
                                        {item.jalur_masuk} ({item.total})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Status Kelulusan</label>
                            <select
                                value={filters.status_kelulusan}
                                onChange={(e) =>
                                    setFilters({ ...filters, status_kelulusan: e.target.value, page: 1 })
                                }
                                className={styles.input}
                            >
                                <option value="">Semua Status</option>
                                <option value="lolos">Lolos</option>
                                <option value="tidak_lolos">Tidak Lolos</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}><FontAwesomeIcon icon={faFileCsv} /> Per Halaman</label>
                            <select
                                value={filters.per_page}
                                onChange={(e) =>
                                    setFilters({ ...filters, per_page: parseInt(e.target.value), page: 1 })
                                }
                                className={styles.input}
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tabel Alumni */}
                <div className={`${styles.tableCard} ${['direksi', 'pengajar', 'staff_karyawan'].includes(user?.role) ? styles.direksiTable : user?.role === 'super_admin' ? styles.superAdminAlumniTable : user?.role === 'admin_cabang' ? styles.adminCabangAlumniTable : ''}`}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <span className={styles.loadingText}>Memuat data alumni...</span>
                        </div>
                    ) : alumniList.length > 0 ? (
                        <>
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead className={styles.tableHead}>
                                        <tr>
                                            {canWrite && (
                                                <th className={styles.tableHeadCell} style={{ width: '50px', textAlign: 'center', padding: '0.75rem 0.5rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.length > 0 && selectedIds.length === alumniList.length}
                                                        onChange={toggleSelectAll}
                                                        style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                                        title={selectedIds.length === alumniList.length ? 'Hapus pilihan' : 'Pilih semua'}
                                                    />
                                                </th>
                                            )}
                                            <th className={styles.tableHeadCell} style={{ width: '60px', textAlign: 'center' }}>
                                                No
                                            </th>
                                            <th className={styles.tableHeadCell}>Nama Siswa</th>
                                        <th className={styles.tableHeadCell}>Cabang</th>
                                        <th className={styles.tableHeadCell}>Program</th>
                                        <th className={styles.tableHeadCell}>Status Kelulusan</th>
                                        <th className={styles.tableHeadCell}>PTN Diterima</th>
                                        <th className={styles.tableHeadCell}>Jurusan</th>
                                        <th className={styles.tableHeadCell}>Jalur Masuk</th>
                                        <th className={styles.tableHeadCell}>Tahun Diterima</th>
                                        <th className={styles.tableHeadCell}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className={styles.tableBody}>
                                    {alumniList.map((alumni, index) => {
                                        const rowNumber = (pagination.current_page - 1) * pagination.per_page + index + 1;
                                        const siswa = alumni.siswa || {};
                                        const programList = Array.isArray(siswa.program) ? siswa.program : (siswa.program ? [siswa.program] : []);
                                        const programNames = programList.length > 0
                                            ? programList.map((prog) => prog.nama).join(', ')
                                            : '-';

                                        return (
                                            <tr key={alumni.id} style={{ background: selectedIds.includes(alumni.id) ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                                                {canWrite && (
                                                    <td className={styles.noCell} style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(alumni.id)}
                                                            onChange={() => toggleSelect(alumni.id)}
                                                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                                        />
                                                    </td>
                                                )}
                                                <td className={styles.noCell}>
                                                    {rowNumber}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    <span style={{ fontWeight: 600 }}>{siswa.nama_lengkap || '-'}</span>
                                                </td>
                                                <td className={styles.tableCell}>{siswa.cabang?.nama || '-'}</td>
                                                <td className={styles.tableCell}>{programNames}</td>
                                                <td className={styles.tableCell}>
                                                    {alumni.status_kelulusan ? (
                                                        <span style={{
                                                            background: alumni.status_kelulusan === 'lolos' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                                                            color: alumni.status_kelulusan === 'lolos' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '0.5rem',
                                                            fontSize: '0.875rem',
                                                            fontWeight: 500
                                                        }}>
                                                            {alumni.status_kelulusan === 'lolos' ? 'Lolos' : (alumni.status_kelulusan === 'tidak_lolos' ? 'Tidak Lolos' : alumni.status_kelulusan)}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#999' }}>-</span>
                                                    )}
                                                </td>
                                                <td className={styles.tableCell}>
                                                    {alumni.ptn_diterima ? (
                                                        <span style={{ 
                                                            background: 'rgba(59, 130, 246, 0.1)', 
                                                            color: 'rgb(59, 130, 246)',
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '0.5rem',
                                                            fontSize: '0.875rem',
                                                            fontWeight: 500
                                                        }}>
                                                            {alumni.ptn_diterima}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#999' }}>-</span>
                                                    )}
                                                </td>
                                                <td className={styles.tableCell}>{alumni.jurusan || '-'}</td>
                                                <td className={styles.tableCell}>
                                                    {alumni.jalur_masuk ? (
                                                        <span style={{ 
                                                            background: 'rgba(168, 85, 247, 0.1)', 
                                                            color: 'rgb(168, 85, 247)',
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '0.5rem',
                                                            fontSize: '0.875rem',
                                                            fontWeight: 500
                                                        }}>
                                                            {alumni.jalur_masuk}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#999' }}>-</span>
                                                    )}
                                                </td>
                                                <td className={styles.tableCell}>{alumni.tahun_diterima || '-'}</td>
                                                <td className={styles.tableCell}>
                                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                        <button
                                                            onClick={() => handleDetail(alumni.id)}
                                                            title="Lihat detail"
                                                            aria-label="Lihat detail"
                                                            style={{
                                                                background: 'rgba(59, 130, 246, 0.2)',
                                                                color: 'rgb(59, 130, 246)',
                                                                border: 'none',
                                                                padding: '0.4rem 0.5rem',
                                                                borderRadius: '0.5rem',
                                                                cursor: 'pointer',
                                                                fontSize: '1rem',
                                                                fontWeight: 600,
                                                                transition: 'all 0.2s ease',
                                                                minWidth: '2.4rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.background = 'rgb(59, 130, 246)';
                                                                e.target.style.color = 'white';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                                                                e.target.style.color = 'rgb(59, 130, 246)';
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </button>
                                                        {canWrite && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEdit(alumni.id)}
                                                                    title="Edit alumni"
                                                                    aria-label="Edit alumni"
                                                                    style={{
                                                                        background: 'rgba(34, 197, 94, 0.2)',
                                                                        color: 'rgb(34, 197, 94)',
                                                                        border: 'none',
                                                                        padding: '0.4rem 0.5rem',
                                                                        borderRadius: '0.5rem',
                                                                        cursor: 'pointer',
                                                                        fontSize: '1rem',
                                                                        fontWeight: 600,
                                                                        transition: 'all 0.2s ease',
                                                                        minWidth: '2.4rem',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.background = 'rgb(34, 197, 94)';
                                                                        e.target.style.color = 'white';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.background = 'rgba(34, 197, 94, 0.2)';
                                                                        e.target.style.color = 'rgb(34, 197, 94)';
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon icon={faPen} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(alumni.id)}
                                                                    title="Hapus alumni"
                                                                    aria-label="Hapus alumni"
                                                                    style={{
                                                                        background: 'rgba(239, 68, 68, 0.2)',
                                                                        color: 'rgb(239, 68, 68)',
                                                                        border: 'none',
                                                                        padding: '0.4rem 0.5rem',
                                                                        borderRadius: '0.5rem',
                                                                        cursor: 'pointer',
                                                                        fontSize: '1rem',
                                                                        fontWeight: 600,
                                                                        transition: 'all 0.2s ease',
                                                                        minWidth: '2.4rem',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.background = 'rgb(239, 68, 68)';
                                                                        e.target.style.color = 'white';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                                                                        e.target.style.color = 'rgb(239, 68, 68)';
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.last_page > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', padding: '1rem' }}>
                                    <button
                                        onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                                        disabled={filters.page === 1}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '0.5rem',
                                            background: filters.page === 1 ? '#f0f0f0' : 'white',
                                            cursor: filters.page === 1 ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} /> Sebelumnya
                                    </button>

                                    <span style={{ color: '#666', fontSize: '0.875rem' }}>
                                        Halaman {pagination.current_page} dari {pagination.last_page}
                                    </span>

                                    <button
                                        onClick={() => setFilters({ ...filters, page: Math.min(pagination.last_page, filters.page + 1) })}
                                        disabled={filters.page === pagination.last_page}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '0.5rem',
                                            background: filters.page === pagination.last_page ? '#f0f0f0' : 'white',
                                            cursor: filters.page === pagination.last_page ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        Selanjutnya <FontAwesomeIcon icon={faChevronRight} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}><FontAwesomeIcon icon={faGraduationCap} /></div>
                            <p>Tidak ada data alumni</p>
                        </div>
                    )}
                </div>

                {/* Modal Tambah/Edit Alumni */}
                {showModal && (
                    <div className={styles.alumniModalOverlay} style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}>
                        <div className={styles.alumniModalContent} style={{
                            background: 'white',
                            borderRadius: '1rem',
                            padding: '2rem',
                            maxWidth: '600px',
                            width: '90%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'rgb(0 61 130)' }}>
                                    {editingId ? <><FontAwesomeIcon icon={faPen} /> Edit Alumni</> : 'Tambah Alumni'}
                                </h2>
                                <button
                                    onClick={() => { setShowModal(false); setEditingId(null); }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className={styles.alumniModalForm}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}><FontAwesomeIcon icon={faUserGraduate} /> Siswa *</label>
                                    {editingId ? (
                                        <input
                                            type="text"
                                            value={formData.siswa_name}
                                            readOnly
                                            className={styles.input}
                                            style={{ backgroundColor: '#f5f7fb', cursor: 'not-allowed' }}
                                        />
                                    ) : (
                                        <select
                                            name="siswa_id"
                                            value={formData.siswa_id}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                            required
                                        >
                                            <option value="">Pilih Siswa</option>
                                            {siswaList.map((siswa) => (
                                                <option key={siswa.id} value={siswa.id}>
                                                    {siswa.nama_lengkap}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: '#0f172a' }}>Data Siswa</h3>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}><FontAwesomeIcon icon={faBuilding} /> Cabang</label>
                                    <input
                                        type="text"
                                        name="cabang_name"
                                        value={formData.cabang_name}
                                        readOnly
                                        className={styles.input}
                                        style={{ backgroundColor: '#f5f7fb', cursor: 'not-allowed' }}
                                    />
                                </div>


                                <div className={styles.formGroup}>
                                    <label className={styles.label}><FontAwesomeIcon icon={faUserGraduate} /> Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="nama_lengkap"
                                        value={formData.nama_lengkap}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}><FontAwesomeIcon icon={faBookOpen} /> Kelas</label>
                                    <input
                                        type="number"
                                        name="kelas"
                                        value={formData.kelas}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}><FontAwesomeIcon icon={faSchool} /> Asal Sekolah</label>
                                    <input
                                        type="text"
                                        name="asal_sekolah"
                                        value={formData.asal_sekolah}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}><FontAwesomeIcon icon={faCalendarDays} /> Tanggal Lahir</label>
                                    <input
                                        type="date"
                                        name="tanggal_lahir"
                                        value={formData.tanggal_lahir}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}><FontAwesomeIcon icon={faVenusMars} /> Jenis Kelamin</label>
                                    <select
                                        name="jenis_kelamin"
                                        value={formData.jenis_kelamin}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                    >
                                        <option value="">Pilih Jenis Kelamin</option>
                                        <option value="laki-laki">Laki-laki</option>
                                        <option value="perempuan">Perempuan</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}><FontAwesomeIcon icon={faPhone} /> No HP</label>
                                    <input
                                        type="text"
                                        name="no_hp"
                                        value={formData.no_hp}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}><FontAwesomeIcon icon={faLocationDot} /> Alamat</label>
                                    <textarea
                                        name="alamat"
                                        value={formData.alamat}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        rows={3}
                                        style={{ fontFamily: 'inherit' }}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}><FontAwesomeIcon icon={faEnvelope} /> Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}><FontAwesomeIcon icon={faCircleInfo} /> Informasi Villa Merah</label>
                                    <input
                                        type="text"
                                        name="informasi_villa_merah"
                                        value={formData.informasi_villa_merah}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}><FontAwesomeIcon icon={faBookOpen} /> Program yang Diikuti</label>
                                    <input
                                        type="text"
                                        name="program_name"
                                        value={formData.program_name}
                                        readOnly
                                        className={styles.input}
                                        style={{ backgroundColor: '#f5f7fb', cursor: 'not-allowed' }}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}><FontAwesomeIcon icon={faCalendarDays} /> Tahun Masuk</label>
                                    <input
                                        type="date"
                                        name="tahun_masuk"
                                        value={formData.tahun_masuk}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                    />
                                </div>

                                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: '#0f172a' }}>Data Alumni</h3>

                                <div className={styles.formGroup}>
                                                <label className={styles.label}>Status Kelulusan</label>
                                                <select
                                                    name="status_kelulusan"
                                                    value={formData.status_kelulusan}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                >
                                                    <option value="lolos">Lolos</option>
                                                    <option value="tidak_lolos">Tidak Lolos</option>
                                                </select>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>PTN Diterima</label>
                                                <input
                                                    type="text"
                                                    name="ptn_diterima"
                                                    value={formData.status_kelulusan === 'tidak_lolos' ? (formData.ptn_diterima || '-') : formData.ptn_diterima}
                                                    onChange={handleInputChange}
                                                    placeholder="contoh: Universitas Indonesia"
                                                    className={styles.input}
                                                    disabled={formData.status_kelulusan === 'tidak_lolos'}
                                                    style={formData.status_kelulusan === 'tidak_lolos' ? { backgroundColor: '#f5f7fb', cursor: 'not-allowed' } : {}}
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Jurusan</label>
                                                <input
                                                    type="text"
                                                    name="jurusan"
                                                    value={formData.status_kelulusan === 'tidak_lolos' ? (formData.jurusan || '-') : formData.jurusan}
                                                    onChange={handleInputChange}
                                                    placeholder="contoh: Teknik Informatika"
                                                    className={styles.input}
                                                    disabled={formData.status_kelulusan === 'tidak_lolos'}
                                                    style={formData.status_kelulusan === 'tidak_lolos' ? { backgroundColor: '#f5f7fb', cursor: 'not-allowed' } : {}}
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Jalur Masuk</label>
                                                <select
                                                    name="jalur_masuk"
                                                    value={formData.jalur_masuk}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                    /* keep editable even when status is 'tidak_lolos' */
                                                >
                                                    <option value="">Pilih Jalur Masuk</option>
                                                    <option value="SNBP">SNBP</option>
                                                    <option value="SNBT">SNBT</option>
                                                    <option value="Mandiri">Mandiri</option>
                                                    <option value="Jalur Khusus">Jalur Khusus</option>
                                                    <option value="-">-</option>
                                                </select>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Tahun Diterima</label>
                                                <input
                                                    type="number"
                                                    name="tahun_diterima"
                                                    value={formData.status_kelulusan === 'tidak_lolos' ? (formData.tahun_diterima || '-') : formData.tahun_diterima}
                                                    onChange={handleInputChange}
                                                    min={2020}
                                                    max={new Date().getFullYear()}
                                                    className={styles.input}
                                                    disabled={formData.status_kelulusan === 'tidak_lolos'}
                                                    style={formData.status_kelulusan === 'tidak_lolos' ? { backgroundColor: '#f5f7fb', cursor: 'not-allowed' } : {}}
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Testimoni</label>
                                                <textarea
                                                    name="testimoni"
                                                    value={formData.status_kelulusan === 'tidak_lolos' ? (formData.testimoni || '-') : formData.testimoni}
                                                    onChange={handleInputChange}
                                                    placeholder="Bagikan pengalaman atau pesan untuk siswa lain..."
                                                    className={styles.input}
                                                    rows={4}
                                                    style={{ fontFamily: 'inherit' }}
                                                    disabled={formData.status_kelulusan === 'tidak_lolos'}
                                                />
                                            </div>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); setEditingId(null); }}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '0.75rem',
                                            background: 'white',
                                            cursor: 'pointer',
                                            fontWeight: 500,
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = '#f0f0f0';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'white';
                                        }}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'linear-gradient(135deg, rgb(59 130 246) 0%, rgb(96 165 250) 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.75rem',
                                            fontWeight: 600,
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.7 : 1,
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loading) {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'none';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        {editingId ? 'Perbarui Alumni' : 'Tambah Alumni'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Detail Alumni */}
                {showDetailModal && detailData && (
                    <div className={styles.alumniDetailOverlay} style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}>
                        <div className={styles.alumniDetailContent} style={{
                            background: 'white',
                            borderRadius: '1rem',
                            padding: '2rem',
                            maxWidth: '600px',
                            width: '90%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
                        }}>
                            <div className={styles.alumniDetailHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'rgb(0 61 130)' }}>
                                    <FontAwesomeIcon icon={faEye} /> Detail Alumni
                                </h2>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>

                            <div className={styles.alumniDetailBody} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Nama Siswa</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.siswa?.nama_lengkap || '-'}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Asal Sekolah</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.siswa?.asal_sekolah || '-'}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Cabang</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.siswa?.cabang?.nama || '-'}</p>
                                </div>


                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Kelas</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.siswa?.kelas || '-'}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Tanggal Lahir</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{formatDateForDisplay(detailData.siswa?.tanggal_lahir)}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Jenis Kelamin</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.siswa?.jenis_kelamin || '-'}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>No HP</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.siswa?.no_hp || '-'}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Provinsi</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.siswa?._provinsi_name || detailData.siswa?.provinsi_code || '-'}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Kabupaten/Kota</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.siswa?._kabupaten_name || detailData.siswa?.kabupaten_code || '-'}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Kecamatan</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.siswa?._kecamatan_name || detailData.siswa?.kecamatan_code || '-'}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Kelurahan/Desa</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.siswa?._desa_name || detailData.siswa?.desa_code || '-'}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Alamat</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.siswa?.alamat || '-'}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Email</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.siswa?.email || '-'}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Informasi Villa Merah</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.siswa?.informasi_villa_merah || '-'}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Program</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                                        {detailData.siswa?.program && detailData.siswa.program.length > 0
                                            ? detailData.siswa.program.map((prog) => prog.nama).join(', ')
                                            : '-'}
                                    </p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Tahun Masuk</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{formatDateForDisplay(detailData.siswa?.tahun_masuk)}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Status Kelulusan</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                                        {detailData.status_kelulusan ? (detailData.status_kelulusan === 'lolos' ? 'Lolos' : (detailData.status_kelulusan === 'tidak_lolos' ? 'Tidak Lolos' : detailData.status_kelulusan)) : '-'}
                                    </p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>PTN Diterima</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.ptn_diterima || '-'}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Jurusan</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.jurusan || '-'}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Jalur Masuk</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.jalur_masuk || '-'}</p>
                                </div>

                                <div>
                                    <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Tahun Diterima</label>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{detailData.tahun_diterima || '-'}</p>
                                </div>

                                {detailData.testimoni && (
                                    <div>
                                        <label style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Testimoni</label>
                                        <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.6' }}>{detailData.testimoni}</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowDetailModal(false)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    marginTop: '2rem',
                                    background: 'rgb(59 130 246)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
