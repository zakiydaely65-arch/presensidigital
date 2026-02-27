'use client';

import { useState, useEffect } from 'react';

export default function SiswaPage() {
    const [siswa, setSiswa] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState({ type: '', payload: null, title: '', description: '', confirmText: '', cancelText: 'Batal' });
    const [showCredentials, setShowCredentials] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [selectedSiswa, setSelectedSiswa] = useState(null);
    const [filter, setFilter] = useState('');
    const [formData, setFormData] = useState({
        nama: '',
        kelas: '',
        jabatan: '',
        organisasi: 'OSIS'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSiswa();
    }, [filter]);

    const fetchSiswa = async () => {
        try {
            const url = filter ? `/api/siswa?organisasi=${filter}` : '/api/siswa';
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setSiswa(data.data);
            }
        } catch (error) {
            console.error('Error fetching siswa:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (editMode) {
                const res = await fetch('/api/siswa', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: selectedSiswa.id, ...formData })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setSuccess('Data siswa berhasil diperbarui');
            } else {
                const res = await fetch('/api/siswa', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setShowCredentials(data.data.credentials);
                setSuccess('Siswa berhasil ditambahkan');
            }

            fetchSiswa();

            if (editMode) {
                closeModal();
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const requestDelete = (id) => {
        setConfirmAction({
            type: 'DELETE',
            payload: id,
            title: 'Hapus Data Siswa',
            description: 'Apakah Anda yakin ingin menghapus data dan seluruh riwayat presensi siswa ini secara permanen?',
            confirmText: 'YA, HAPUS DATA'
        });
        setShowConfirmModal(true);
    };

    const confirmDelete = async (id) => {
        try {
            const res = await fetch(`/api/siswa?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSuccess('Siswa berhasil dihapus');
            fetchSiswa();
        } catch (err) {
            setError(err.message);
        } finally {
            setShowConfirmModal(false);
        }
    };

    const requestResetPassword = (s) => {
        setConfirmAction({
            type: 'RESET_PASSWORD',
            payload: s,
            title: 'Reset Sandi',
            description: `Sistem akan membuat ulang kata sandi secara acak untuk ${s.nama}. Apakah Anda yakin ingin melanjutkan?`,
            confirmText: 'YA, RESET SANDI'
        });
        setShowConfirmModal(true);
    };

    const confirmResetPassword = async (s) => {
        try {
            const res = await fetch('/api/admin/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: s.id })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            
            setShowConfirmModal(false);
            setTimeout(() => {
                setShowCredentials({
                    kode: s.kode,
                    sandi: data.data.sandi
                });
                setShowModal(true);
                setSuccess(`Sandi untuk ${s.nama} berhasil direset.`);
            }, 300);
        } catch (err) {
            setError(err.message);
            setShowConfirmModal(false);
        }
    };

    const handleConfirm = () => {
        if (confirmAction.type === 'DELETE') {
            confirmDelete(confirmAction.payload);
        } else if (confirmAction.type === 'RESET_PASSWORD') {
            confirmResetPassword(confirmAction.payload);
        }
    };

    const openAddModal = () => {
        setEditMode(false);
        setSelectedSiswa(null);
        setFormData({ nama: '', kelas: '', jabatan: '', organisasi: 'OSIS' });
        setShowCredentials(null);
        setShowModal(true);
    };

    const openEditModal = (s) => {
        setEditMode(true);
        setSelectedSiswa(s);
        setFormData({
            nama: s.nama,
            kelas: s.kelas,
            jabatan: s.jabatan,
            organisasi: s.organisasi
        });
        setShowCredentials(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setShowCredentials(null);
        setError('');
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-slate-400">
                <div className="w-10 h-10 border-[3px] border-slate-200 border-t-primary rounded-full animate-spin"></div>
                <p className="font-bold uppercase tracking-widest text-xs">Menyiapkan Direktori Data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 pb-4 md:pb-6 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-primary tracking-tight">Direktori Siswa</h1>
                    <p className="text-slate-500 font-medium mt-1 md:mt-2 text-sm md:text-base">Manajemen akun dan data anggota OSIS / MPK.</p>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                    <a
                        href={`/api/export?type=siswa${filter ? '&organisasi=' + filter : ''}`}
                        target="_blank"
                        className="btn btn-secondary font-bold text-xs md:text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="hidden sm:inline">UNDUH DATA (CSV)</span>
                        <span className="sm:hidden">UNDUH</span>
                    </a>
                    <button className="btn btn-primary font-bold text-xs md:text-sm" onClick={openAddModal}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span className="hidden sm:inline">TAMBAH ANGGOTA</span>
                        <span className="sm:hidden">TAMBAH</span>
                    </button>
                </div>
            </header>

            {success && (
                <div className="alert alert-success mt-4">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    <span className="font-bold text-sm">{success}</span>
                    <button onClick={() => setSuccess('')} className="ml-auto opacity-50 hover:opacity-100">×</button>
                </div>
            )}

            {error && (
                <div className="alert alert-error mt-4">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    <span className="font-bold text-sm">{error}</span>
                    <button onClick={() => setError('')} className="ml-auto opacity-50 hover:opacity-100">×</button>
                </div>
            )}

            <div className="card p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-5 border-t-4 border-t-primary">
                <div className="flex items-center gap-3 md:gap-4">
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">Filter</label>
                    <select
                        className="select w-full sm:w-48 py-2.5 text-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">KESELURUHAN</option>
                        <option value="OSIS">OSIS SAJA</option>
                        <option value="MPK">MPK SAJA</option>
                    </select>
                </div>
                <div className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Total: <span className="text-primary text-sm md:text-base ml-1 md:ml-2">{siswa.length}</span>
                </div>
            </div>

            <div className="card overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-16 text-center">No</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Akses ID</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Identitas Siswa</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Kelas</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Afiliasi</th>
                                <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Otorisasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {siswa.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-16 text-center text-slate-400">
                                        <div className="flex justify-center mb-3">
                                            <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                        </div>
                                        <p className="font-bold uppercase tracking-widest text-xs">Kosong / Belum ada Anggota</p>
                                    </td>
                                </tr>
                            ) : (
                                siswa.map((s, idx) => (
                                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 font-bold text-slate-400 text-center text-xs">{idx + 1}</td>
                                        <td className="px-8 py-5">
                                            <code className="bg-slate-100/80 text-primary px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest border border-slate-200">{s.kode}</code>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-primary">{s.nama}</td>
                                        <td className="px-8 py-5 text-slate-500 font-medium">{s.kelas}</td>
                                        <td className="px-8 py-5">
                                            <span className={`badge ${s.organisasi === 'OSIS' ? 'badge-primary' : 'badge-accent'}`}>
                                                {s.organisasi}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2 text-slate-400">
                                                <button
                                                    className="p-2 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                                                    onClick={() => requestResetPassword(s)}
                                                    title="Reset Sandi"
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5v1c0 1 1 2 2 2h2c1 0 2-1 2-2v-1z" />
                                                        <line x1="9" y1="22" x2="15" y2="22" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="p-2 hover:bg-slate-100 hover:text-primary rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                                    onClick={() => openEditModal(s)}
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                                                    onClick={() => requestDelete(s.id)}
                                                    title="Hapus"
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden">
                    {siswa.length === 0 ? (
                        <div className="px-4 py-12 text-center text-slate-400">
                            <div className="flex justify-center mb-3">
                                <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <p className="font-bold uppercase tracking-widest text-xs">Kosong / Belum ada Anggota</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {siswa.map((s, idx) => (
                                <div key={s.id} className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-extrabold text-primary">{idx + 1}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-primary text-sm truncate">{s.nama}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-slate-400">{s.kelas}</span>
                                                    <span className={`badge text-[9px] px-2 py-0.5 ${s.organisasi === 'OSIS' ? 'badge-primary' : 'badge-accent'}`}>
                                                        {s.organisasi}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                className="p-2 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors text-slate-400"
                                                onClick={() => requestResetPassword(s)}
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5v1c0 1 1 2 2 2h2c1 0 2-1 2-2v-1z" />
                                                    <line x1="9" y1="22" x2="15" y2="22" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            <button
                                                className="p-2 hover:bg-slate-100 hover:text-primary rounded-lg transition-colors text-slate-400"
                                                onClick={() => openEditModal(s)}
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            <button
                                                className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors text-slate-400"
                                                onClick={() => requestDelete(s.id)}
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <code className="bg-slate-50 text-primary px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest border border-slate-200 inline-block">{s.kode}</code>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-primary/40 backdrop-blur-sm transition-all" onClick={closeModal}>
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-premium w-full sm:max-w-md overflow-hidden transform transition-all border border-slate-100 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-lg sm:text-xl font-extrabold text-primary tracking-tight">
                                {showCredentials ? 'Akses Terotorisasi' : editMode ? 'Modifikasi Data' : 'Registrasi Anggota Baru'}
                            </h2>
                            <button className="text-slate-400 hover:text-primary transition-colors p-2 rounded-xl hover:bg-slate-50" onClick={closeModal}>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {showCredentials ? (
                            <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
                                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 sm:p-6 text-center shadow-inner">
                                    <p className="text-emerald-700 text-xs font-bold uppercase tracking-widest mb-5 sm:mb-6">Amankan Informasi Berikut</p>
                                    <div className="space-y-4 sm:space-y-5">
                                        <div>
                                            <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">ID KODE</label>
                                            <div className="text-xl sm:text-2xl font-extrabold font-mono text-primary bg-white py-3 px-4 sm:px-5 rounded-xl border border-slate-200 shadow-sm inline-block min-w-[120px] sm:min-w-[150px] tracking-[0.2em]">
                                                {showCredentials.kode}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Sandi Acak</label>
                                            <div className="text-lg sm:text-xl font-extrabold font-mono text-primary bg-white py-3 px-4 sm:px-5 rounded-xl border border-slate-200 shadow-sm inline-block min-w-[120px] sm:min-w-[150px] tracking-[0.2em] select-all">
                                                {showCredentials.sandi}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 sm:mt-8 flex gap-3">
                                    <button className="btn btn-secondary flex-1 py-3" onClick={closeModal}>
                                        TUTUP
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
                                    <div className="space-y-2">
                                        <label className="form-label">Identitas Lengkap</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.nama}
                                            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                            required
                                            placeholder="Sesuai daftar absensi resmi"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="form-label">Tingkat Kelas</label>
                                        <select
                                            className="select"
                                            value={formData.kelas}
                                            onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                                            required
                                        >
                                            <option value="">Pilih Jenjang</option>
                                            {['X', 'XI', 'XII'].map(level => (
                                                <optgroup key={level} label={`Kelas ${level}`}>
                                                    {[...Array(10)].map((_, i) => (
                                                        <option key={`${level}-${i + 1}`} value={`${level}-${i + 1}`}>
                                                            {level}-{i + 1}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="form-label">Afiliasi Struktur</label>
                                        <select
                                            className="select"
                                            value={formData.organisasi}
                                            onChange={(e) => setFormData({ ...formData, organisasi: e.target.value })}
                                        >
                                            <option value="OSIS">Pengurus OSIS</option>
                                            <option value="MPK">Perwakilan MPK</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 bg-slate-50">
                                    <button type="button" className="btn btn-secondary text-xs order-2 sm:order-1" onClick={closeModal}>
                                        BTL
                                    </button>
                                    <button type="submit" className="btn btn-primary text-xs w-full sm:w-auto order-1 sm:order-2">
                                        {editMode ? 'SIMPAN PERUBAHAN' : 'TAMBAHKAN ANGGOTA'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Interactive Confirm Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-primary/40 backdrop-blur-sm transition-all" onClick={() => setShowConfirmModal(false)}>
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-premium w-full sm:max-w-sm overflow-hidden transform transition-all border border-slate-100 p-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border-4 border-white shadow-sm mb-4 ${confirmAction.type === 'DELETE' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                            {confirmAction.type === 'DELETE' ? (
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            ) : (
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5v1c0 1 1 2 2 2h2c1 0 2-1 2-2v-1z" />
                                </svg>
                            )}
                        </div>
                        <h3 className="text-xl font-extrabold text-primary tracking-tight mb-2">
                            {confirmAction.title}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium mb-8">
                            {confirmAction.description}
                        </p>
                        <div className="flex gap-3">
                            <button className="btn btn-secondary flex-1 text-xs" onClick={() => setShowConfirmModal(false)}>
                                {confirmAction.cancelText}
                            </button>
                            <button 
                                className={`btn flex-1 text-xs text-white ${confirmAction.type === 'DELETE' ? 'bg-rose-500 hover:bg-rose-600 border border-transparent shadow-[0_4px_12px_rgba(244,63,94,0.3)]' : 'bg-amber-500 hover:bg-amber-600 border border-transparent shadow-[0_4px_12px_rgba(245,158,11,0.3)]'}`}
                                onClick={handleConfirm}
                            >
                                {confirmAction.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
