'use client';

import { useState, useEffect } from 'react';

export default function SiswaPage() {
    const [siswa, setSiswa] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
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

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus siswa ini?')) return;

        try {
            const res = await fetch(`/api/siswa?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSuccess('Siswa berhasil dihapus');
            fetchSiswa();
        } catch (err) {
            setError(err.message);
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
        <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
                <div>
                    <h1 className="text-4xl font-extrabold text-primary tracking-tight">Direktori Siswa</h1>
                    <p className="text-slate-500 font-medium mt-2">Manajemen akun dan data anggota OSIS / MPK.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <a
                        href={`/api/export?type=siswa${filter ? '&organisasi=' + filter : ''}`}
                        target="_blank"
                        className="btn btn-secondary font-bold"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        UNDUH DATA (CSV)
                    </a>
                    <button className="btn btn-primary font-bold" onClick={openAddModal}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        TAMBAH ANGGOTA
                    </button>
                </div>
            </header>

            {success && (
                <div className="alert alert-success mt-4">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    <span className="font-bold">{success}</span>
                    <button onClick={() => setSuccess('')} className="ml-auto opacity-50 hover:opacity-100">×</button>
                </div>
            )}

            {error && (
                <div className="alert alert-error mt-4">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    <span className="font-bold">{error}</span>
                    <button onClick={() => setError('')} className="ml-auto opacity-50 hover:opacity-100">×</button>
                </div>
            )}

            <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 border-t-4 border-t-primary">
                <div className="flex items-center gap-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">Filter Organisasi</label>
                    <select
                        className="select w-48 py-2.5 text-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">KESELURUHAN</option>
                        <option value="OSIS">OSIS SAJA</option>
                        <option value="MPK">MPK SAJA</option>
                    </select>
                </div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Total Registrasi: <span className="text-primary text-base ml-2">{siswa.length}</span>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
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
                                                    onClick={() => handleDelete(s.id)}
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
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm transition-all" onClick={closeModal}>
                    <div className="bg-white rounded-3xl shadow-premium w-full max-w-md overflow-hidden transform transition-all border border-slate-100" onClick={(e) => e.stopPropagation()}>
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-extrabold text-primary tracking-tight">
                                {showCredentials ? 'Akses Terotorisasi' : editMode ? 'Modifikasi Data' : 'Registrasi Anggota Baru'}
                            </h2>
                            <button className="text-slate-400 hover:text-primary transition-colors p-2 rounded-xl hover:bg-slate-50" onClick={closeModal}>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {showCredentials ? (
                            <div className="p-8 space-y-8">
                                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 text-center shadow-inner">
                                    <p className="text-emerald-700 text-xs font-bold uppercase tracking-widest mb-6">Amankan Informasi Berikut</p>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">ID KODE</label>
                                            <div className="text-2xl font-extrabold font-mono text-primary bg-white py-3 px-5 rounded-xl border border-slate-200 shadow-sm inline-block min-w-[150px] tracking-[0.2em]">
                                                {showCredentials.kode}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Sandi Acak</label>
                                            <div className="text-xl font-extrabold font-mono text-primary bg-white py-3 px-5 rounded-xl border border-slate-200 shadow-sm inline-block min-w-[150px] tracking-[0.2em] select-all">
                                                {showCredentials.sandi}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex gap-3">
                                    <button className="btn btn-secondary flex-1 py-3" onClick={closeModal}>
                                        TUTUP
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="p-8 space-y-6">
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
                                <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                    <button type="button" className="btn btn-secondary text-xs" onClick={closeModal}>
                                        BTL
                                    </button>
                                    <button type="submit" className="btn btn-primary text-xs w-full sm:w-auto">
                                        {editMode ? 'SIMPAN PERUBAHAN' : 'GENERATE AKUN'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
