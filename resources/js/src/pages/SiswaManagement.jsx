import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { siswaService } from '../services/siswaService';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserGraduate,
    faTrash,
    faPlus,
    faFileCsv,
    faArrowRightArrowLeft,
    faStar,
    faSearch,
    faCalendarDays,
    faBuilding,
    faBookOpen,
    faEye,
    faPen,
    faChevronLeft,
    faChevronRight,
    faInbox,
    faXmark,
    faSchool,
    faLocationDot,
    faVenusMars,
    faMapLocationDot,
    faCircleInfo,
    faEnvelope,
    faRoad,
} from '@fortawesome/free-solid-svg-icons';
import styles from './SiswaManagement.module.css';

export const SiswaManagement = () => {
    const { user } = useAuth();
    const canExportCsv = user && !['staff_karyawan', 'pengajar'].includes(user.role);
    const [siswaList, setSiswaList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [cabangList, setCabangList] = useState([]);
    const [programList, setProgramList] = useState({});
    const [kelasList, setKelasList] = useState([]);
    const [programFilterList, setProgramFilterList] = useState([]);
    const [provinsiList, setProvinsiList] = useState([]);
    const [kabupatenList, setKabupatenList] = useState([]);
    const [kecamatanList, setKecamatanList] = useState([]);
    const [desaList, setDesaList] = useState([]);
    const [schoolSuggestions, setSchoolSuggestions] = useState([]);
    const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
    const [schoolSearchLoading, setSchoolSearchLoading] = useState(false);
    const schoolSearchTimeoutRef = useRef(null);
    
    const [formData, setFormData] = useState({
        cabang_id: '',
        nama_lengkap: '',
        kelas: '',
        asal_sekolah: '',
        tanggal_lahir: '',
        jenis_kelamin: '',
        no_hp: '',
        provinsi_code: '',
        kabupaten_code: '',
        kecamatan_code: '',
        desa_code: '',
        jalan: '',
        alamat: '',
        email: '',
        informasi_villa_merah: '',
        program_id: '',
        tahun_masuk: new Date().toISOString().split('T')[0],
        tahun_lulus: '',
        foto: null,
    });

    const [filters, setFilters] = useState({
        cabang_id: '',
        tahun_masuk: '',
        nama_lengkap: '',
        kelas: '',
        program_id: '',
        per_page: 10,
        page: 1,
    });

    const [pagination, setPagination] = useState({
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
    });
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);
    const [bulkMoveKelas, setBulkMoveKelas] = useState('');
    const [bulkMoveProgramId, setBulkMoveProgramId] = useState('');
    const [exportingCsv, setExportingCsv] = useState(false);
    const detailRequestRef = useRef(0);
    const wilayahCacheRef = useRef({
        provinces: null,
        regencies: {},
        districts: {},
        villages: {},
    });

    const openBulkMoveModal = () => {
        setBulkMoveKelas('');
        setBulkMoveProgramId('');
        setShowBulkMoveModal(true);
    };

    const handleBulkMoveConfirm = async () => {
        if (selectedIds.length === 0) {
            setError('❌ Pilih siswa yang akan dipindahkan');
            return;
        }
        if (!bulkMoveKelas) {
            setError('❌ Pilih kelas tujuan');
            return;
        }

        if (!window.confirm(`Pindahkan ${selectedIds.length} siswa ke Kelas ${bulkMoveKelas}${bulkMoveProgramId ? ' - Program terpilih' : ''}?`)) return;

        try {
            setLoading(true);
            const payload = {
                ids: selectedIds,
                kelas: Number(bulkMoveKelas),
            };
            if (bulkMoveProgramId) payload.program_id = [Number(bulkMoveProgramId)];

            const resp = await siswaService.bulkMove(payload);
            if (resp.success) {
                setShowBulkMoveModal(false);
                setSelectedIds([]);
                await fetchSiswaWithFilters(filters);
                try { window.dispatchEvent(new Event('statistik:updated')); } catch (e) {}
                setError(null);
            } else {
                setError(resp.message || 'Gagal memindahkan siswa');
            }
        } catch (err) {
            console.error('Error bulk move:', err);
            setError(err.response?.data?.message || 'Gagal memindahkan siswa');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCabang();
        
        if (user) {
            const userFilters = {
                cabang_id: user.role === 'admin_cabang' ? user.cabang_id : '',
                tahun_masuk: '',
                nama_lengkap: '',
                kelas: '',
                program_id: '',
                per_page: 10,
                page: 1,
            };
            setFilters(userFilters);
            fetchSiswaWithFilters(userFilters);
            fetchFilterData(userFilters);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            fetchSiswaWithFilters(filters);
        }
    }, [filters.cabang_id, filters.tahun_masuk, filters.nama_lengkap, filters.kelas, filters.program_id, filters.page, filters.per_page]);

    const fetchSiswaWithFilters = async (filtersToUse) => {
        try {
            setLoading(true);
            const response = await siswaService.getAll(filtersToUse);
            if (response.success) {
                setSiswaList(response.data || []);
                setPagination(response.pagination || {
                    total: 0,
                    per_page: filtersToUse.per_page || 10,
                    current_page: filtersToUse.page || 1,
                    last_page: 1,
                });
            } else {
                setSiswaList([]);
                setPagination({
                    total: 0,
                    per_page: filtersToUse.per_page || 10,
                    current_page: filtersToUse.page || 1,
                    last_page: 1,
                });
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching siswa:', err);
            setError('Gagal memuat data siswa');
            setSiswaList([]);
            setPagination({
                total: 0,
                per_page: filtersToUse.per_page || 10,
                current_page: filtersToUse.page || 1,
                last_page: 1,
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterData = async (filtersToUse = {}) => {
        try {
            const response = await siswaService.getFilterData(filtersToUse);
            if (response.success) {
                setKelasList(response.data.kelas || []);
                setProgramFilterList(response.data.programs || []);
            }
        } catch (err) {
            console.error('Error fetching filter data:', err);
        }
    };

    useEffect(() => {
        if (formData.kelas) {
            fetchProgramByKelas(formData.kelas);
        }
    }, [formData.kelas]);

    useEffect(() => {
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (formData.provinsi_code) {
            fetchRegencies(formData.provinsi_code);
        } else {
            setKabupatenList([]);
            setKecamatanList([]);
            setDesaList([]);
        }
    }, [formData.provinsi_code]);

    useEffect(() => {
        if (formData.kabupaten_code) {
            fetchDistricts(formData.kabupaten_code);
        } else {
            setKecamatanList([]);
            setDesaList([]);
        }
    }, [formData.kabupaten_code]);

    useEffect(() => {
        if (formData.kecamatan_code) {
            fetchVillages(formData.kecamatan_code);
        } else {
            setDesaList([]);
        }
    }, [formData.kecamatan_code]);

    const getAreaName = (list, code) => {
        return list.find((item) => item.code === code)?.name || '';
    };

    const buildAlamatFromWilayah = () => {
        const provinsi = getAreaName(provinsiList, formData.provinsi_code);
        const kabupaten = getAreaName(kabupatenList, formData.kabupaten_code);
        const kecamatan = getAreaName(kecamatanList, formData.kecamatan_code);
        const desa = getAreaName(desaList, formData.desa_code);

        return `${formData.jalan.trim()}, ${desa}, ${kecamatan}, ${kabupaten}, ${provinsi}`;
    };

    const fetchProvinces = async () => {
        if (wilayahCacheRef.current.provinces) {
            setProvinsiList(wilayahCacheRef.current.provinces);
            return wilayahCacheRef.current.provinces;
        }

        try {
            const response = await api.get('/wilayah/provinces');
            const provinces = response.data.data || [];
            wilayahCacheRef.current.provinces = provinces;
            setProvinsiList(provinces);
            return provinces;
        } catch (err) {
            console.error('Gagal memuat provinsi:', err);
            return [];
        }
    };

    const fetchRegencies = async (provinceCode) => {
        if (wilayahCacheRef.current.regencies[provinceCode]) {
            setKabupatenList(wilayahCacheRef.current.regencies[provinceCode]);
            return wilayahCacheRef.current.regencies[provinceCode];
        }

        try {
            const response = await api.get(`/wilayah/regencies/${provinceCode}`);
            const regencies = response.data.data || [];
            wilayahCacheRef.current.regencies[provinceCode] = regencies;
            setKabupatenList(regencies);
            return regencies;
        } catch (err) {
            console.error('Gagal memuat kabupaten/kota:', err);
            return [];
        }
    };

    const fetchDistricts = async (regencyCode) => {
        if (wilayahCacheRef.current.districts[regencyCode]) {
            setKecamatanList(wilayahCacheRef.current.districts[regencyCode]);
            return wilayahCacheRef.current.districts[regencyCode];
        }

        try {
            const response = await api.get(`/wilayah/districts/${regencyCode}`);
            const districts = response.data.data || [];
            wilayahCacheRef.current.districts[regencyCode] = districts;
            setKecamatanList(districts);
            return districts;
        } catch (err) {
            console.error('Gagal memuat kecamatan:', err);
            return [];
        }
    };

    const fetchVillages = async (districtCode) => {
        if (wilayahCacheRef.current.villages[districtCode]) {
            setDesaList(wilayahCacheRef.current.villages[districtCode]);
            return wilayahCacheRef.current.villages[districtCode];
        }

        try {
            const response = await api.get(`/wilayah/villages/${districtCode}`);
            const villages = response.data.data || [];
            wilayahCacheRef.current.villages[districtCode] = villages;
            setDesaList(villages);
            return villages;
        } catch (err) {
            console.error('Gagal memuat kelurahan/desa:', err);
            return [];
        }
    };

    const fetchSiswa = async () => {
        try {
            setLoading(true);
            const response = await siswaService.getAll(filters);
            if (response.success) {
                setSiswaList(response.data);
                setPagination(response.pagination);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching siswa:', err);
            setError('Gagal memuat data siswa');
        } finally {
            setLoading(false);
        }
    };

    const fetchCabang = async () => {
        try {
            const response = await siswaService.getCabang();
            if (response.success) {
                setCabangList(response.data);
            }
        } catch (err) {
            console.error('Gagal memuat data cabang:', err);
        }
    };

    const fetchProgramByKelas = async (kelas) => {
        try {
            const response = await api.get('/siswa-data/program-by-kelas', {
                params: { kelas }
            });
            if (response.data.success) {
                setProgramList(response.data.data);
            }
        } catch (err) {
            console.error('Gagal memuat data program:', err);
        }
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        // If already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
        // If ISO string (with T), extract just the date part
        if (dateString.includes('T')) {
            return dateString.split('T')[0];
        }
        return dateString;
    };

    const handleSchoolSearch = async (query) => {
        if (!query || query.trim().length < 3) {
            setSchoolSuggestions([]);
            setSchoolSearchLoading(false);
            return;
        }

        setSchoolSearchLoading(true);

        try {
            const response = await axios.get('https://sekolah.devapi.id/sekolah', {
                params: {
                    nama: query.trim(),
                    limit: 15,
                },
            });

            if (response.data?.success) {
                setSchoolSuggestions(response.data.data || []);
            } else {
                setSchoolSuggestions([]);
            }
        } catch (err) {
            console.error('Gagal mencari sekolah:', err);
            setSchoolSuggestions([]);
        } finally {
            setSchoolSearchLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setFormData({ ...formData, [name]: files[0] });
            return;
        }

        if (name === 'asal_sekolah') {
            setFormData({ ...formData, [name]: value });
            setShowSchoolSuggestions(true);
            setSchoolSuggestions([]);

            if (schoolSearchTimeoutRef.current) {
                clearTimeout(schoolSearchTimeoutRef.current);
            }

            if (value.trim().length >= 3) {
                schoolSearchTimeoutRef.current = setTimeout(() => {
                    handleSchoolSearch(value.trim());
                }, 300);
            } else {
                setSchoolSearchLoading(false);
            }

            return;
        }

        if (name === 'provinsi_code') {
            setFormData({
                ...formData,
                provinsi_code: value,
                kabupaten_code: '',
                kecamatan_code: '',
                desa_code: '',
            });
            return;
        }

        if (name === 'kabupaten_code') {
            setFormData({
                ...formData,
                kabupaten_code: value,
                kecamatan_code: '',
                desa_code: '',
            });
            return;
        }

        if (name === 'kecamatan_code') {
            setFormData({
                ...formData,
                kecamatan_code: value,
                desa_code: '',
            });
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSchoolSelect = (schoolName) => {
        setFormData({ ...formData, asal_sekolah: schoolName });
        setShowSchoolSuggestions(false);
        setSchoolSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            // Validasi semua field required
            if (!formData.cabang_id) {
                setError('❌ Pilih Cabang terlebih dahulu');
                setLoading(false);
                return;
            }
            if (!formData.nama_lengkap?.trim()) {
                setError('❌ Isi Nama Lengkap');
                setLoading(false);
                return;
            }
            if (!formData.kelas) {
                setError('❌ Pilih Kelas');
                setLoading(false);
                return;
            }
            if (!formData.asal_sekolah?.trim()) {
                setError('❌ Isi Asal Sekolah');
                setLoading(false);
                return;
            }
            if (!formData.tanggal_lahir) {
                setError('❌ Isi Tanggal Lahir');
                setLoading(false);
                return;
            }
            if (!formData.jenis_kelamin) {
                setError('❌ Pilih Jenis Kelamin');
                setLoading(false);
                return;
            }
            if (!formData.no_hp?.trim()) {
                setError('❌ Isi No. HP');
                setLoading(false);
                return;
            }
            if (!formData.provinsi_code || !formData.kabupaten_code || !formData.kecamatan_code || !formData.desa_code || !formData.jalan?.trim()) {
                setError('❌ Lengkapi alamat provinsi/kabupaten/kecamatan/desa dan nama jalan');
                setLoading(false);
                return;
            }
            if (!formData.email?.trim()) {
                setError('❌ Isi Email Siswa');
                setLoading(false);
                return;
            }
            if (!formData.informasi_villa_merah) {
                setError('❌ Pilih Informasi Villa Merah');
                setLoading(false);
                return;
            }

            // Create FormData
            const submitData = new FormData();
            submitData.append('cabang_id', String(formData.cabang_id));
            submitData.append('nama_lengkap', formData.nama_lengkap);
            submitData.append('kelas', String(formData.kelas));
            submitData.append('asal_sekolah', formData.asal_sekolah);
            submitData.append('tanggal_lahir', formData.tanggal_lahir);
            submitData.append('jenis_kelamin', formData.jenis_kelamin);
            submitData.append('no_hp', formData.no_hp);
            submitData.append('provinsi_code', formData.provinsi_code);
            submitData.append('kabupaten_code', formData.kabupaten_code);
            submitData.append('kecamatan_code', formData.kecamatan_code);
            submitData.append('desa_code', formData.desa_code);
            submitData.append('jalan', formData.jalan);
            submitData.append('alamat', buildAlamatFromWilayah());
            submitData.append('email', formData.email);
            submitData.append('informasi_villa_merah', formData.informasi_villa_merah);
            submitData.append('tahun_masuk', String(formData.tahun_masuk));
            
            if (formData.program_id) {
                submitData.append('program_id[]', String(formData.program_id));
            }
            if (formData.tahun_lulus) {
                submitData.append('tahun_lulus', String(formData.tahun_lulus));
            }
            if (formData.foto instanceof File) {
                submitData.append('foto', formData.foto);
            }

            console.log('Sending form data for', editingId ? 'update' : 'create');

            if (editingId) {
                await siswaService.update(editingId, submitData);
            } else {
                await siswaService.create(submitData);
            }
            
            setShowModal(false);
            setEditingId(null);
            resetForm();
            await fetchSiswa();
            // notify dashboard to refresh statistik
            try { window.dispatchEvent(new Event('statistik:updated')); } catch (e) {}
        } catch (err) {
            console.error('Error:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.errors) {
                const errorMessages = Object.values(err.response.data.errors)
                    .flat()
                    .join(', ');
                setError(errorMessages || 'Gagal menyimpan data siswa');
            } else {
                setError('Gagal menyimpan data siswa');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            cabang_id: user?.cabang_id || '',
            nama_lengkap: '',
            kelas: '',
            asal_sekolah: '',
            tanggal_lahir: '',
            jenis_kelamin: '',
            no_hp: '',
            provinsi_code: '',
            kabupaten_code: '',
            kecamatan_code: '',
            desa_code: '',
            jalan: '',
            alamat: '',
            email: '',
            informasi_villa_merah: '',
            program_id: '',
            tahun_masuk: new Date().toISOString().split('T')[0],
            tahun_lulus: '',
            foto: null,
        });
        setProgramList({});
    };

    const handleEdit = async (id) => {
        try {
            // Show modal immediately for better UX
            setShowModal(true);
            setLoading(true);
            
            const response = await siswaService.getById(id);
            if (response.success) {
                const editData = response.data;
                setFormData({
                    cabang_id: editData.cabang_id || '',
                    nama_lengkap: editData.nama_lengkap || '',
                    kelas: editData.kelas || '',
                    asal_sekolah: editData.asal_sekolah || '',
                    tanggal_lahir: formatDateForInput(editData.tanggal_lahir),
                    jenis_kelamin: editData.jenis_kelamin || '',
                    no_hp: editData.no_hp || '',
                    provinsi_code: editData.provinsi_code || '',
                    kabupaten_code: editData.kabupaten_code || '',
                    kecamatan_code: editData.kecamatan_code || '',
                    desa_code: editData.desa_code || '',
                    jalan: editData.jalan || '',
                    alamat: editData.alamat || '',
                    email: editData.email || '',
                    informasi_villa_merah: editData.informasi_villa_merah || '',
                    program_id: editData.program?.[0]?.id || '',
                    tahun_masuk: formatDateForInput(editData.tahun_masuk),
                    tahun_lulus: editData.tahun_lulus || '',
                    foto: null,
                });
                setEditingId(id);
                
                // Fetch program secara parallel jika kelas sudah ada
                const promises = [];
                
                if (editData.kelas) {
                    promises.push(api.get('/siswa-data/program-by-kelas', {
                        params: { kelas: editData.kelas }
                    }));
                }
                
                if (promises.length > 0) {
                    const results = await Promise.all(promises);
                    
                    if (editData.kelas && results[0]?.data?.success) {
                        setProgramList(results[0].data.data);
                    }
                }
            }
            setLoading(false);
        } catch (err) {
            setError('Gagal memuat data siswa');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
            try {
                await siswaService.delete(id);
                await fetchSiswa();
                try { window.dispatchEvent(new Event('statistik:updated')); } catch (e) {}
            } catch (err) {
                setError('Gagal menghapus data siswa');
            }
        }
    };

    const handleDetail = async (id) => {
        const requestId = ++detailRequestRef.current;

        try {
            setShowDetailModal(true);
            setDetailLoading(true);
            setDetailData(null);
            setError(null);

            const detailResponse = await siswaService.getById(id);
            if (detailRequestRef.current !== requestId) return;

            if (!detailResponse.success) {
                throw new Error(detailResponse.message || 'Detail siswa tidak ditemukan');
            }

            const selected = detailResponse.data;
            const provinces = await fetchProvinces();
            let regencies = [];
            let districts = [];
            let villages = [];

            if (selected?.provinsi_code) {
                regencies = await fetchRegencies(selected.provinsi_code);
            }

            if (selected?.kabupaten_code) {
                districts = await fetchDistricts(selected.kabupaten_code);
            }

            if (selected?.kecamatan_code) {
                villages = await fetchVillages(selected.kecamatan_code);
            }

            if (detailRequestRef.current !== requestId) return;

            setDetailData({
                ...selected,
                _provinsi_name: provinces.find((item) => item.code === selected?.provinsi_code)?.name || selected?.provinsi_code || '-',
                _kabupaten_name: regencies.find((item) => item.code === selected?.kabupaten_code)?.name || selected?.kabupaten_code || '-',
                _kecamatan_name: districts.find((item) => item.code === selected?.kecamatan_code)?.name || selected?.kecamatan_code || '-',
                _desa_name: villages.find((item) => item.code === selected?.desa_code)?.name || selected?.desa_code || '-',
            });
            setDetailLoading(false);
        } catch (err) {
            if (detailRequestRef.current !== requestId) return;
            console.error('Gagal memuat detail siswa:', err);
            setError('Gagal memuat detail siswa');
            setDetailLoading(false);
        }
    };

    const downloadCsv = (rows, fileName) => {
        if (!rows.length) {
            return;
        }

        const headers = [
            'id',
            'nama_lengkap',
            'cabang',
            'kelas',
            'program',
            'asal_sekolah',
            'tanggal_lahir',
            'no_hp',
            'email',
            'informasi_villa_merah',
            'provinsi',
            'kabupaten',
            'kecamatan',
            'desa',
            'jalan',
            'alamat',
            'tahun_masuk',
            'tahun_lulus',
            'created_at',
            'updated_at',
        ];

        const escapeCsvValue = (value) => {
            const normalized = value === null || value === undefined ? '' : String(value);
            return /[",\n]/.test(normalized)
                ? `"${normalized.replace(/"/g, '""')}"`
                : normalized;
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

        const csvRows = [headers.map(escapeCsvValue).join(',')];

        rows.forEach((row) => {
            const values = [
                row.id ?? '',
                row.nama_lengkap ?? '',
                row.cabang?.nama ?? '',
                row.kelas ?? '',
                Array.isArray(row.program) && row.program.length > 0 ? row.program.map((p) => p.nama).join(' | ') : (row.program?.nama ?? ''),
                row.asal_sekolah ?? '',
                formatDateForCsv(row.tanggal_lahir),
                row.no_hp ?? '',
                row.email ?? '',
                row.informasi_villa_merah ?? '',
                row.provinsi_name ?? row.provinsi?.nama ?? '',
                row.kabupaten_name ?? row.kabupaten?.nama ?? '',
                row.kecamatan_name ?? row.kecamatan?.nama ?? '',
                row.desa_name ?? row.desa?.nama ?? '',
                row.jalan ?? '',
                row.alamat ?? '',
                formatDateForCsv(row.tahun_masuk),
                row.tahun_lulus ?? '',
                formatDateForCsv(row.created_at),
                formatDateForCsv(row.updated_at),
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
            setExportingCsv(true);
            setError(null);

            const activeFilters = Object.fromEntries(
                Object.entries(filters)
                    .filter(([_, value]) => value !== '' && value !== null && value !== undefined && value !== 'all')
                    .map(([key, value]) => [key, value])
            );

            delete activeFilters.per_page;
            delete activeFilters.page;

            let page = 1;
            let allRecords = [];
            let lastPage = 1;

            do {
                const response = await siswaService.getAll({
                    ...activeFilters,
                    page,
                    per_page: 200,
                });

                if (!response.success) {
                    throw new Error(response.message || 'Gagal mengambil data siswa untuk export');
                }

                const pageItems = response.data || [];
                allRecords = [...allRecords, ...pageItems];
                lastPage = response.pagination?.last_page || page;
                page += 1;
            } while (page <= lastPage);

            if (allRecords.length === 0) {
                setError('Tidak ada data siswa yang bisa diekspor.');
                return;
            }

            const provinceList = await fetchProvinces();
            const provinceMap = Object.fromEntries((provinceList || []).map((item) => [String(item.code), item.name]));

            const regencyRequests = {};
            const districtRequests = {};
            const villageRequests = {};

            const uniqueProvinceCodes = [...new Set(allRecords.map((row) => row.provinsi_code).filter(Boolean))];
            const uniqueKabupatenCodes = [...new Set(allRecords.map((row) => row.kabupaten_code).filter(Boolean))];
            const uniqueKecamatanCodes = [...new Set(allRecords.map((row) => row.kecamatan_code).filter(Boolean))];

            for (const provinceCode of uniqueProvinceCodes) {
                regencyRequests[provinceCode] = await fetchRegencies(String(provinceCode));
            }

            for (const code of uniqueKabupatenCodes) {
                const provinceCode = allRecords.find((row) => String(row.kabupaten_code) === String(code))?.provinsi_code;
                if (provinceCode && !regencyRequests[provinceCode]) {
                    regencyRequests[provinceCode] = await fetchRegencies(String(provinceCode));
                }
                districtRequests[code] = await fetchDistricts(String(code));
            }

            for (const code of uniqueKecamatanCodes) {
                villageRequests[code] = await fetchVillages(String(code));
            }

            const exportRows = allRecords.map((row) => {
                const provinceCode = row.provinsi_code ? String(row.provinsi_code) : '';
                const regencyCode = row.kabupaten_code ? String(row.kabupaten_code) : '';
                const districtCode = row.kecamatan_code ? String(row.kecamatan_code) : '';
                const villageCode = row.desa_code ? String(row.desa_code) : '';

                const regenciesList = regencyRequests[provinceCode] || [];
                const districtsList = districtRequests[regencyCode] || [];
                const villagesList = villageRequests[districtCode] || [];

                return {
                    ...row,
                    provinsi_name: provinceMap[provinceCode] || row.provinsi?.nama || '',
                    kabupaten_name: (regenciesList.find((item) => String(item.code) === regencyCode)?.name) || row.kabupaten?.nama || '',
                    kecamatan_name: (districtsList.find((item) => String(item.code) === districtCode)?.name) || row.kecamatan?.nama || '',
                    desa_name: (villagesList.find((item) => String(item.code) === villageCode)?.name) || row.desa?.nama || '',
                };
            });

            downloadCsv(exportRows, 'data-siswa.csv');
        } catch (err) {
            console.error('Error exporting CSV:', err);
            setError('Gagal mengekspor data siswa ke CSV');
        } finally {
            setExportingCsv(false);
        }
    };

    const handleAddNew = () => {
        setEditingId(null);
        
        // Set initial form data dengan cabang pertama
        const initialCabangId = user?.role === 'admin_cabang' 
            ? user.cabang_id 
            : (cabangList[0]?.id || '');
        
        const initialData = {
            cabang_id: initialCabangId,
            nama_lengkap: '',
            kelas: '',
            asal_sekolah: '',
            tanggal_lahir: '',
            jenis_kelamin: '',
            no_hp: '',
            provinsi_code: '',
            kabupaten_code: '',
            kecamatan_code: '',
            desa_code: '',
            jalan: '',
            alamat: '',
            email: '',
            informasi_villa_merah: '',
            program_id: '',
            tahun_masuk: new Date().toISOString().split('T')[0],
            tahun_lulus: '',
            foto: null,
        };
        
        setFormData(initialData);
        setProgramList({});
        setShowModal(true);
    };

    const isReadOnly = user?.role !== 'super_admin' && user?.role !== 'admin_cabang';

    const toggleSelectAll = () => {
        if (selectedIds.length === siswaList.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(siswaList.map(s => s.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            setError('❌ Pilih siswa yang akan dihapus');
            return;
        }

        if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} siswa?`)) {
            return;
        }

        try {
            setLoading(true);
            for (const id of selectedIds) {
                await siswaService.delete(id);
            }
            setSelectedIds([]);
            await fetchSiswaWithFilters(filters);
            try { window.dispatchEvent(new Event('statistik:updated')); } catch (e) {}
            setError(null);
        } catch (err) {
            setError('Gagal menghapus data siswa');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkConvertToAlumni = async () => {
        if (selectedIds.length === 0) {
            setError('❌ Pilih siswa yang akan dijadikan alumni');
            return;
        }

        if (!window.confirm(`Apakah Anda yakin ingin menjadikan ${selectedIds.length} siswa sebagai alumni?`)) {
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ids: selectedIds,
                ptn_diterima: 'Belum Ditentukan',
                jurusan: 'Belum Ditentukan',
                jalur_masuk: 'mandiri',
                tahun_diterima: new Date().getFullYear(),
            };
            await siswaService.toAlumni(payload);
            setSelectedIds([]);
            await fetchSiswaWithFilters(filters);
            try { window.dispatchEvent(new Event('statistik:updated')); } catch (e) {}
            setError(null);
        } catch (err) {
            setError('Gagal menjadikan siswa sebagai alumni');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const classOptions = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: `Kelas ${i + 1}${i < 6 ? ' SD' : i < 9 ? ' SMP' : ' SMA'}`
    }));

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1 className={`${styles.title} ${selectedIds.length > 0 ? styles.titleBulk : ''}`}>
                        <FontAwesomeIcon icon={faUserGraduate} /> Manajemen Siswa
                    </h1>
                    <div className={styles.actionBar}>
                        {selectedIds.length > 0 && !isReadOnly && (
                            <>
                                <button
                                    onClick={openBulkMoveModal}
                                    className={`${styles.secondaryButton} ${styles.actionButton}`}
                                    style={{ background: 'linear-gradient(135deg, rgb(59 130 246) 0%, rgb(99 102 241) 100%)' }}
                                >
                                    <FontAwesomeIcon icon={faArrowRightArrowLeft} /> Pindah Program ({selectedIds.length})
                                </button>
                                <button
                                    onClick={handleBulkConvertToAlumni}
                                    className={`${styles.secondaryButton} ${styles.actionButton}`}
                                    style={{ background: 'linear-gradient(135deg, rgb(34 197 94) 0%, rgb(52 211 153) 100%)' }}
                                >
                                    <FontAwesomeIcon icon={faStar} /> Jadikan Alumni ({selectedIds.length})
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className={`${styles.deleteButton} ${styles.actionButton}`}
                                    style={{ background: 'linear-gradient(135deg, rgb(239 68 68) 0%, rgb(220 38 38) 100%)' }}
                                >
                                    <FontAwesomeIcon icon={faTrash} /> Hapus {selectedIds.length} ({selectedIds.length === siswaList.length ? 'semua' : 'terpilih'})
                                </button>
                            </>
                        )}
                        {canExportCsv && (
                            <button
                                onClick={handleExportCsv}
                                className={`${styles.secondaryButton} ${styles.actionButton}`}
                                disabled={exportingCsv}
                                style={{
                                    opacity: exportingCsv ? 0.7 : 1,
                                    background: 'linear-gradient(135deg, rgb(59 130 246) 0%, rgb(96 165 250) 100%)',
                                }}
                            >
                                {exportingCsv ? 'Mengekspor...' : <><FontAwesomeIcon icon={faFileCsv} /> Export CSV</>}
                            </button>
                        )}
                        {!isReadOnly && (
                            <button
                                onClick={handleAddNew}
                                className={`${styles.addButton} ${styles.actionButton}`}
                            >
                                <FontAwesomeIcon icon={faPlus} /> Tambah Siswa
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className={styles.errorAlert}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Filter Section */}
                <div className={styles.filterCard}>
                    <h2 className={styles.filterTitle}>Filter & Pencarian</h2>
                    <div className={styles.filterGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}><FontAwesomeIcon icon={faSearch} /> Cari Nama</label>
                            <input
                                type="text"
                                value={filters.nama_lengkap}
                                onChange={(e) =>
                                    setFilters({ ...filters, nama_lengkap: e.target.value, page: 1 })
                                }
                                placeholder="Ketik nama siswa..."
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}><FontAwesomeIcon icon={faCalendarDays} /> Tahun Masuk</label>
                            <input
                                type="number"
                                value={filters.tahun_masuk}
                                onChange={(e) =>
                                    setFilters({ ...filters, tahun_masuk: e.target.value, page: 1 })
                                }
                                placeholder="2024"
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
                            >
                                <option value="">-- Semua Cabang --</option>
                                {cabangList.map((cabang) => (
                                    <option key={cabang.id} value={cabang.id}>{cabang.nama}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}><FontAwesomeIcon icon={faBookOpen} /> Kelas</label>
                            <select
                                value={filters.kelas}
                                onChange={(e) =>
                                    setFilters({ ...filters, kelas: e.target.value, page: 1 })
                                }
                                className={styles.input}
                            >
                                <option value="">-- Semua Kelas --</option>
                                {kelasList.map((kelas, idx) => (
                                    <option key={idx} value={kelas}>Kelas {kelas}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}><FontAwesomeIcon icon={faBookOpen} /> Program</label>
                            <select
                                value={filters.program_id}
                                onChange={(e) =>
                                    setFilters({ ...filters, program_id: e.target.value, page: 1 })
                                }
                                className={styles.input}
                            >
                                <option value="">-- Semua Program --</option>
                                {programFilterList.map((prog, idx) => (
                                    <option key={idx} value={prog.id}>{prog.nama}</option>
                                ))}
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

                {/* Tabel Siswa */}
                <div className={styles.tableCard}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <span className={styles.loadingText}>Memuat data siswa...</span>
                        </div>
                    ) : siswaList.length > 0 ? (
                        <>
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead className={styles.tableHead}>
                                        <tr>
                                            <th className={styles.tableHeadCell} style={{ width: '50px', textAlign: 'center', padding: '0.75rem 0.5rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.length > 0 && selectedIds.length === siswaList.length}
                                                    onChange={toggleSelectAll}
                                                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                                    title={selectedIds.length === siswaList.length ? 'Hapus pilihan' : 'Pilih semua'}
                                                />
                                            </th>
                                            <th className={styles.tableHeadCell} style={{ width: '60px', textAlign: 'center' }}>
                                                No
                                            </th>
                                            <th className={styles.tableHeadCell} style={{ width: '18%', minWidth: '140px' }}>Nama Lengkap</th>
                                            <th className={styles.tableHeadCell} style={{ width: '8%', minWidth: '70px', textAlign: 'center' }}>Kelas</th>
                                            <th className={styles.tableHeadCell} style={{ width: '17%', minWidth: '140px' }}>Asal Sekolah</th>
                                            <th className={styles.tableHeadCell} style={{ width: '14%', minWidth: '120px' }}>Cabang</th>
                                            <th className={styles.tableHeadCell} style={{ width: '22%', minWidth: '180px' }}>Alamat Lengkap</th>
                                            <th className={styles.tableHeadCell} style={{ width: '11%', minWidth: '100px' }}>Program</th>
                                            <th className={styles.tableHeadCell} style={{ width: '100px', minWidth: '90px', textAlign: 'center' }}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className={styles.tableBody}>
                                        {siswaList.map((siswa, index) => {
                                            const rowNumber = ((pagination?.current_page || 1) - 1) * (pagination?.per_page || 10) + index + 1;
                                            return (
                                                <tr key={siswa.id} style={{ background: selectedIds.includes(siswa.id) ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                                                    <td className={styles.noCell} style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(siswa.id)}
                                                            onChange={() => toggleSelect(siswa.id)}
                                                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                                        />
                                                    </td>
                                                    <td className={styles.noCell}>
                                                        {rowNumber}
                                                    </td>
                                                    <td className={styles.tableCell}>
                                                        <span style={{ fontWeight: 600 }}>{siswa.nama_lengkap}</span>
                                                    </td>
                                                    <td className={styles.tableCell}>
                                                        <span style={{ fontWeight: 600, color: '#0066cc' }}>
                                                            {siswa.kelas}
                                                        </span>
                                                    </td>
                                                    <td className={styles.tableCell}>
                                                        {siswa.asal_sekolah}
                                                    </td>
                                                    <td className={styles.tableCell}>
                                                        {siswa.cabang?.nama || '-'}
                                                    </td>
                                                    <td className={styles.tableCell}>
                                                        <span style={{ fontSize: '13px' }}>
                                                            {siswa.alamat || '-'}
                                                        </span>
                                                    </td>
                                                    <td className={styles.tableCell}>
                                                        <div className={styles.programList}>
                                                            {siswa.program && siswa.program.length > 0 ? (
                                                                siswa.program.map((prog, idx) => (
                                                                    <span key={idx} className={styles.programBadge}>
                                                                        {prog.nama}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span style={{ color: '#999' }}>-</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className={styles.tableCell} style={{ textAlign: 'center' }}>
                                                        <div className={styles.actionButtons}>
                                                            <button
                                                                onClick={() => handleDetail(siswa.id)}
                                                                className={styles.detailBtn}
                                                                title="Lihat Detail"
                                                            >
                                                                <FontAwesomeIcon icon={faEye} /> Detail
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(siswa.id)}
                                                                disabled={isReadOnly}
                                                                className={styles.editBtn}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(siswa.id)}
                                                                disabled={isReadOnly}
                                                                className={styles.deleteBtn}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} /> Hapus
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination && (
                                <div className={styles.paginationContainer}>
                                    <p className={styles.paginationInfo}>
                                        <FontAwesomeIcon icon={faLocationDot} /> Menampilkan {(pagination.current_page - 1) * pagination.per_page + 1} hingga{' '}
                                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)}{' '}
                                        dari {pagination.total} data
                                    </p>
                                    <div className={styles.paginationButtons}>
                                        <button
                                            onClick={() =>
                                                setFilters({
                                                    ...filters,
                                                    page: Math.max((pagination?.current_page || 1) - 1, 1),
                                                })
                                            }
                                            disabled={(pagination?.current_page || 1) === 1}
                                            className={styles.paginationBtn}
                                        >
                                            <FontAwesomeIcon icon={faChevronLeft} /> Sebelumnya
                                        </button>
                                        <span className={styles.pageNumber}>
                                            {pagination.current_page} / {pagination.last_page}
                                        </span>
                                        <button
                                            onClick={() =>
                                                setFilters({
                                                    ...filters,
                                                    page: pagination.current_page + 1,
                                                })
                                            }
                                            disabled={pagination.current_page === pagination.last_page}
                                            className={styles.paginationBtn}
                                        >
                                            Selanjutnya <FontAwesomeIcon icon={faChevronRight} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}><FontAwesomeIcon icon={faInbox} /></div>
                            <p className={styles.emptyText}>Tidak ada data siswa yang ditemukan</p>
                        </div>
                    )}
                </div>

                {/* Modal Form */}
                {showModal && (
                    <div className={`${styles.modalOverlay} ${styles.studentModalOverlay}`}>
                        <div className={`${styles.modalContent} ${styles.studentModalContent}`}>
                            <div className={`${styles.modalHeader} ${styles.studentModalHeader}`}>
                                <div>
                                    <p className={styles.studentModalEyebrow}>DATA SISWA</p>
                                <h2 className={styles.modalTitle}>
                                    {editingId ? <><FontAwesomeIcon icon={faPen} /> Edit Siswa</> : 'Tambah Siswa Baru'}
                                </h2>
                                    <p className={styles.studentModalSubtitle}>Lengkapi informasi siswa dengan data yang benar.</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className={styles.modalCloseBtn}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className={styles.modalForm} encType="multipart/form-data">
                                <div className={styles.modalScroll}>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formField}>
                                            <label className={styles.formLabel}><FontAwesomeIcon icon={faUserGraduate} /> Nama Lengkap *</label>
                                            <input
                                                type="text"
                                                name="nama_lengkap"
                                                value={formData.nama_lengkap}
                                                onChange={handleInputChange}
                                                required
                                                className={styles.formInput}
                                            />
                                        </div>

                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faBookOpen} /> Kelas *</label>
                                        <select
                                            name="kelas"
                                            value={formData.kelas}
                                            onChange={handleInputChange}
                                            required
                                            className={styles.formInput}
                                        >
                                            <option value="">Pilih Kelas</option>
                                            {classOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={`${styles.formField} ${styles.schoolField}`}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faSchool} /> Asal Sekolah *</label>
                                        <input
                                            type="text"
                                            name="asal_sekolah"
                                            value={formData.asal_sekolah}
                                            onChange={handleInputChange}
                                            onFocus={() => setShowSchoolSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSchoolSuggestions(false), 150)}
                                            placeholder="Ketik 3 huruf pertama untuk mencari sekolah"
                                            required
                                            className={styles.formInput}
                                        />

                                        {showSchoolSuggestions && (schoolSuggestions.length > 0 || schoolSearchLoading) && (
                                            <div className={styles.suggestionsList}>
                                                {schoolSearchLoading ? (
                                                    <div className={styles.suggestionLoading}>Mencari sekolah...</div>
                                                ) : schoolSuggestions.length > 0 ? (
                                                    schoolSuggestions.map((school) => (
                                                        <button
                                                            type="button"
                                                            key={school.npsn || school.nama}
                                                            className={styles.suggestionItem}
                                                            onMouseDown={() => handleSchoolSelect(school.nama)}
                                                        >
                                                            {school.nama}
                                                            {school.npsn ? ` · NPSN ${school.npsn}` : ''}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className={styles.suggestionEmpty}>Tidak ditemukan sekolah</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faUserGraduate} /> No. HP *</label>
                                        <input
                                            type="tel"
                                            name="no_hp"
                                            value={formData.no_hp}
                                            onChange={handleInputChange}
                                            required
                                            className={styles.formInput}
                                        />
                                    </div>


                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faCalendarDays} /> Tanggal Lahir *</label>
                                        <input
                                            type="date"
                                            name="tanggal_lahir"
                                            value={formData.tanggal_lahir}
                                            onChange={handleInputChange}
                                            required
                                            className={styles.formInput}
                                        />
                                    </div>

                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faVenusMars} /> Jenis Kelamin *</label>
                                        <select
                                            name="jenis_kelamin"
                                            value={formData.jenis_kelamin}
                                            onChange={handleInputChange}
                                            required
                                            className={styles.formInput}
                                        >
                                            <option value="">Pilih Jenis Kelamin</option>
                                            <option value="laki-laki">Laki-laki</option>
                                            <option value="perempuan">Perempuan</option>
                                        </select>
                                    </div>

                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faLocationDot} /> Provinsi *</label>
                                        <select
                                            name="provinsi_code"
                                            value={formData.provinsi_code}
                                            onChange={handleInputChange}
                                            required
                                            className={styles.formInput}
                                        >
                                            <option value="">Pilih Provinsi</option>
                                            {provinsiList.map((provinsi) => (
                                                <option key={provinsi.code} value={provinsi.code}>
                                                    {provinsi.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faMapLocationDot} /> Kabupaten / Kota *</label>
                                        <select
                                            name="kabupaten_code"
                                            value={formData.kabupaten_code}
                                            onChange={handleInputChange}
                                            required
                                            disabled={!formData.provinsi_code}
                                            className={styles.formInput}
                                        >
                                            <option value="">Pilih Kabupaten/Kota</option>
                                            {kabupatenList.map((kabupaten) => (
                                                <option key={kabupaten.code} value={kabupaten.code}>
                                                    {kabupaten.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faLocationDot} /> Kecamatan *</label>
                                        <select
                                            name="kecamatan_code"
                                            value={formData.kecamatan_code}
                                            onChange={handleInputChange}
                                            required
                                            disabled={!formData.kabupaten_code}
                                            className={styles.formInput}
                                        >
                                            <option value="">Pilih Kecamatan</option>
                                            {kecamatanList.map((kecamatan) => (
                                                <option key={kecamatan.code} value={kecamatan.code}>
                                                    {kecamatan.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faLocationDot} /> Kelurahan / Desa *</label>
                                        <select
                                            name="desa_code"
                                            value={formData.desa_code}
                                            onChange={handleInputChange}
                                            required
                                            disabled={!formData.kecamatan_code}
                                            className={styles.formInput}
                                        >
                                            <option value="">Pilih Kelurahan/Desa</option>
                                            {desaList.map((desa) => (
                                                <option key={desa.code} value={desa.code}>
                                                    {desa.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={`${styles.formField} ${styles.fullWidth}`}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faRoad} /> Nama Jalan *</label>
                                        <input
                                            type="text"
                                            name="jalan"
                                            value={formData.jalan}
                                            onChange={handleInputChange}
                                            required
                                            className={styles.formInput}
                                            placeholder="Nama jalan di desa/kelurahan"
                                        />
                                    </div>

                                    <div className={`${styles.formField} ${styles.fullWidth}`}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faLocationDot} /> Alamat Lengkap</label>
                                        <textarea
                                            name="alamat"
                                            value={buildAlamatFromWilayah()}
                                            readOnly
                                            className={`${styles.formInput} ${styles.formTextarea}`}
                                        />
                                    </div>

                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faEnvelope} /> Email Siswa *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className={styles.formInput}
                                        />
                                    </div>

                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faBookOpen} /> Program Kelas yang Diikuti</label>
                                        <select
                                            name="program_id"
                                            value={formData.program_id}
                                            onChange={handleInputChange}
                                            className={styles.formInput}
                                        >
                                            <option value="">Pilih Program</option>
                                            {Object.keys(programList).length > 0 ? (
                                                Object.entries(programList).map(([category, progs]) => (
                                                    <optgroup key={category} label={category}>
                                                        {progs.map(prog => (
                                                            <option key={prog.id} value={prog.id}>
                                                                {prog.nama}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                ))
                                            ) : (
                                                <option disabled>Pilih kelas terlebih dahulu</option>
                                            )}
                                        </select>
                                    </div>

                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faBuilding} /> Cabang *</label>
                                        <select
                                            name="cabang_id"
                                            value={formData.cabang_id}
                                            onChange={handleInputChange}
                                            required
                                            className={styles.formInput}
                                        >
                                            <option value="">Pilih Cabang</option>
                                            {cabangList.map((cabang) => (
                                                <option key={cabang.id} value={cabang.id}>
                                                    {cabang.nama}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faCalendarDays} /> Tanggal Masuk *</label>
                                        <input
                                            type="date"
                                            name="tahun_masuk"
                                            value={formData.tahun_masuk}
                                            onChange={handleInputChange}
                                            required
                                            className={styles.formInput}
                                        />
                                    </div>

                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faCircleInfo} /> Informasi Villa Merah *</label>
                                        <select
                                            name="informasi_villa_merah"
                                            value={formData.informasi_villa_merah}
                                            onChange={handleInputChange}
                                            required
                                            className={styles.formInput}
                                        >
                                            <option value="">Pilih Sumber Informasi</option>
                                            <option value="website">🌐 Website</option>
                                            <option value="instagram">📷 Instagram</option>
                                            <option value="tiktok">🎵 TikTok</option>
                                            <option value="kerabat">👨‍👩‍👧 Kerabat</option>
                                            <option value="orang_tua">👨‍👩‍👦 Orang Tua</option>
                                            <option value="teman">👥 Teman</option>
                                        </select>
                                    </div>

                                </div>
                            </div>

                                <div className={styles.formActions}>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className={styles.cancelBtn}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={styles.submitBtn}
                                    >
                                        {loading ? 'Menyimpan...' : '✅ Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Bulk Move Modal */}
                {showBulkMoveModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowBulkMoveModal(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}><FontAwesomeIcon icon={faArrowRightArrowLeft} /> Pindah Siswa Terpilih</h2>
                                <button
                                    onClick={() => setShowBulkMoveModal(false)}
                                    className={styles.modalCloseBtn}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>

                            <div className={styles.modalForm}>
                                <div style={{ padding: '1rem' }}>
                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faBookOpen} /> Kelas Tujuan *</label>
                                        <select
                                            value={bulkMoveKelas}
                                            onChange={(e) => { setBulkMoveKelas(e.target.value); if (e.target.value) fetchProgramByKelas(e.target.value); }}
                                            className={styles.formInput}
                                        >
                                            <option value="">Pilih Kelas</option>
                                            {classOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}><FontAwesomeIcon icon={faBookOpen} /> Program Tujuan (opsional)</label>
                                        <select
                                            value={bulkMoveProgramId}
                                            onChange={(e) => setBulkMoveProgramId(e.target.value)}
                                            className={styles.formInput}
                                        >
                                            <option value="">-- Tidak mengubah program --</option>
                                            {Object.keys(programList).length > 0 ? (
                                                Object.entries(programList).flatMap(([cat, progs]) => progs).map((p) => (
                                                    <option key={p.id} value={p.id}>{p.nama}</option>
                                                ))
                                            ) : (
                                                <option disabled>Pilih kelas tujuan terlebih dahulu</option>
                                            )}
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                        <button type="button" onClick={() => setShowBulkMoveModal(false)} className={styles.cancelBtn}>Batal</button>
                                        <button type="button" onClick={handleBulkMoveConfirm} className={styles.submitBtn} disabled={loading}>{loading ? 'Memindahkan...' : 'Pindahkan'}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {showDetailModal && (
                    <div className={`${styles.modalOverlay} ${styles.studentDetailOverlay}`} onClick={() => setShowDetailModal(false)}>
                        <div className={`${styles.detailModalContent} ${styles.studentDetailContent}`} onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className={`${styles.detailHeader} ${styles.studentDetailHeader}`}>
                                <h2><FontAwesomeIcon icon={faUserGraduate} /> Detail Data Siswa</h2>
                                <button 
                                    className={styles.detailCloseBtn}
                                    onClick={() => setShowDetailModal(false)}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>

                            {detailLoading ? (
                                <div className={styles.detailBody} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div className={styles.spinner} style={{ margin: '0 auto 0.75rem' }}></div>
                                        <div style={{ color: '#4b5563', fontWeight: 500 }}>Memuat detail siswa...</div>
                                    </div>
                                </div>
                            ) : detailData && (
                                <>
                                    <div className={`${styles.detailBody} ${styles.studentDetailBody}`}>
                                        {/* Foto Section */}
                                        {detailData.foto && (
                                            <div className={styles.fotoSection}>
                                                <img 
                                                    src={`/storage/${detailData.foto}`} 
                                                    alt="Foto Siswa" 
                                                    className={styles.fotoPreview}
                                                />
                                            </div>
                                        )}

                                        {/* Info Grid */}
                                        <div className={styles.infoGrid}>
                                    {/* Row 1 */}
                                    <div className={styles.infoCard}>
                                        <label className={styles.infoLabel}>Nama Lengkap</label>
                                        <p className={styles.infoValue}>{detailData.nama_lengkap}</p>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <label className={styles.infoLabel}>Kelas</label>
                                        <p className={styles.infoValue}>{detailData.kelas || '-'}</p>
                                    </div>

                                    {/* Row 2 */}
                                    <div className={styles.infoCard}>
                                        <label className={styles.infoLabel}>Asal Sekolah</label>
                                        <p className={styles.infoValue}>{detailData.asal_sekolah}</p>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <label className={styles.infoLabel}>No. HP</label>
                                        <p className={styles.infoValue}>{detailData.no_hp}</p>
                                    </div>

                                    {/* Row 3 */}
                                    <div className={styles.infoCard}>
                                        <label className={styles.infoLabel}>Tanggal Lahir</label>
                                        <p className={styles.infoValue}>{detailData.tanggal_lahir ? new Date(detailData.tanggal_lahir).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</p>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <label className={styles.infoLabel}>Jenis Kelamin</label>
                                        <p className={styles.infoValue}>{detailData.jenis_kelamin || '-'}</p>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <label className={styles.infoLabel}>Email Siswa</label>
                                        <p className={styles.infoValue} style={{ wordBreak: 'break-all' }}>{detailData.email || '-'}</p>
                                    </div>

                                    {/* Row 4 */}
                                    <div className={styles.infoCard}>
                                        <label className={styles.infoLabel}>Provinsi</label>
                                        <p className={styles.infoValue}>{detailData._provinsi_name || provinsiList.find((item) => item.code === detailData.provinsi_code)?.name || detailData.provinsi_code || '-'}</p>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <label className={styles.infoLabel}>Kabupaten/Kota</label>
                                        <p className={styles.infoValue}>{detailData._kabupaten_name || kabupatenList.find((item) => item.code === detailData.kabupaten_code)?.name || detailData.kabupaten_code || '-'}</p>
                                    </div>

                                    {/* Row 5 */}
                                    <div className={styles.infoCard}>
                                        <label className={styles.infoLabel}>Kecamatan</label>
                                        <p className={styles.infoValue}>{detailData._kecamatan_name || kecamatanList.find((item) => item.code === detailData.kecamatan_code)?.name || detailData.kecamatan_code || '-'}</p>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <label className={styles.infoLabel}>Kelurahan/Desa</label>
                                        <p className={styles.infoValue}>{detailData._desa_name || desaList.find((item) => item.code === detailData.desa_code)?.name || detailData.desa_code || '-'}</p>
                                    </div>

                                    {/* Row 6 */}
                                    <div className={styles.infoCard}>
                                        <label className={styles.infoLabel}>Alamat Lengkap</label>
                                        <p className={styles.infoValue}>{detailData.alamat || '-'}</p>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <label className={styles.infoLabel}>Program Kelas yang Diikuti</label>
                                        <p className={styles.infoValue}>
                                            {detailData.program && detailData.program.length > 0 ? (
                                                <span style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {detailData.program.map((prog, idx) => (
                                                        <span key={idx} className={styles.programBadge}>
                                                            {prog.nama}
                                                        </span>
                                                    ))}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </p>
                                    </div>

                                    {/* Row 7 */}
                                    <div className={styles.infoCard}>
                                        <label className={styles.infoLabel}>Cabang</label>
                                        <p className={styles.infoValue}>{detailData.cabang?.nama || '-'}</p>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <label className={styles.infoLabel}>Tanggal Masuk</label>
                                        <p className={styles.infoValue}>{detailData.tahun_masuk ? new Date(detailData.tahun_masuk).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</p>
                                    </div>

                                    {/* Row 8 */}
                                    <div className={styles.infoCard}>
                                        <label className={styles.infoLabel}>Informasi Villa Merah</label>
                                        <p className={styles.infoValue}>{detailData.informasi_villa_merah || '-'}</p>
                                    </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className={styles.detailFooter}>
                                        <button
                                            onClick={() => setShowDetailModal(false)}
                                            className={styles.detailCloseMainBtn}
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
