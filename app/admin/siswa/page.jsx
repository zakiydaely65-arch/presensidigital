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

            // Only close modal if we are in edit mode
            // If we are in add mode (creating new student), we want to keep it open to show credentials
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Siswa</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola data anggota OSIS dan MPK</p>
                </div>
                <div className="flex gap-2">
                    <a
                        href={`/api/export?type=siswa${filter ? '&organisasi=' + filter : ''}`}
                        target="_blank"
                        className="btn btn-secondary"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export Data
                    </a>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Tambah Siswa
                    </button>
                </div>
            </header>

            {success && (
                <div className="alert alert-success animate-fadeIn">
                    <span>{success}</span>
                    <button onClick={() => setSuccess('')} className="ml-auto text-current opacity-70 hover:opacity-100">×</button>
                </div>
            )}

            {error && (
                <div className="alert alert-error animate-fadeIn">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="ml-auto text-current opacity-70 hover:opacity-100">×</button>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-600">Filter Organisasi:</label>
                    <select
                        className="select w-48"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">Semua</option>
                        <option value="OSIS">OSIS</option>
                        <option value="MPK">MPK</option>
                    </select>
                </div>
                <div className="text-sm text-gray-500">
                    Total: <strong className="text-gray-900">{siswa.length}</strong> siswa
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">No</th>
                                <th className="px-6 py-4">Kode</th>
                                <th className="px-6 py-4">Nama</th>
                                <th className="px-6 py-4">Kelas</th>
                                <th className="px-6 py-4">Organisasi</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {siswa.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                        Belum ada data siswa
                                    </td>
                                </tr>
                            ) : (
                                siswa.map((s, idx) => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                                        <td className="px-6 py-4">
                                            <code className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono">{s.kode}</code>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{s.nama}</td>
                                        <td className="px-6 py-4 text-gray-600">{s.kelas}</td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${s.organisasi === 'OSIS' ? 'badge-primary' : 'badge-info'}`}>
                                                {s.organisasi}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="btn btn-sm btn-secondary p-2"
                                                    onClick={() => openEditModal(s)}
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger p-2"
                                                    onClick={() => handleDelete(s.id)}
                                                    title="Hapus"
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">
                                {showCredentials ? 'Kredensial Siswa' : editMode ? 'Edit Siswa' : 'Tambah Siswa Baru'}
                            </h2>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200" onClick={closeModal}>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {showCredentials ? (
                            <div className="p-6 space-y-6">
                                <div className="bg-gradient-to-br from-indigo-50 to-green-50 border border-indigo-100 rounded-xl p-6 text-center shadow-inner">
                                    <p className="text-gray-600 text-sm mb-4">Simpan kredensial berikut. Sandi hanya ditampilkan sekali!</p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Kode</label>
                                            <div className="text-2xl font-bold font-mono text-indigo-900 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm inline-block min-w-[140px] tracking-wider">
                                                {showCredentials.kode}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Sandi</label>
                                            <div className="text-2xl font-bold font-mono text-indigo-900 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm inline-block min-w-[140px] tracking-wider">
                                                {showCredentials.sandi}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex flex-col gap-3">
                                    <button
                                        onClick={() => {
                                            const printWindow = window.open('', '', 'width=400,height=600');
                                            printWindow.document.write(`
                                                <html>
                                                    <head>
                                                        <title>Kredensial - ${formData.nama}</title>
                                                        <style>
                                                            body { font-family: sans-serif; padding: 40px; text-align: center; }
                                                            .card { border: 2px dashed #4f46e5; padding: 20px; border-radius: 10px; }
                                                            h2 { color: #4f46e5; margin: 0 0 5px 0; }
                                                            p { margin: 5px 0; color: #666; font-size: 14px; }
                                                            .cred-box { background: #f3f4f6; padding: 10px; margin: 15px 0; border-radius: 8px; }
                                                            .label { font-size: 10px; text-transform: uppercase; color: #666; letter-spacing: 1px; }
                                                            .value { font-family: monospace; font-size: 24px; font-weight: bold; color: #333; margin-top: 5px; }
                                                            .footer { margin-top: 20px; font-size: 10px; color: #999; }
                                                        </style>
                                                    </head>
                                                    <body>
                                                        <div class="card">
                                                            <h2>PRESENSI DIGITAL</h2>
                                                            <p>OSIS & MPK</p>
                                                            <hr style="margin: 15px 0; border: none; border-top: 1px solid #eee;">
                                                            <p><strong>${formData.nama}</strong></p>
                                                            <p>${formData.kelas}</p>
                                                            
                                                            <div class="cred-box">
                                                                <div class="label">KODE AKSES</div>
                                                                <div class="value">${showCredentials?.kode || '-'}</div>
                                                            </div>
                                                            
                                                            <div class="cred-box">
                                                                <div class="label">KATA SANDI</div>
                                                                <div class="value">${showCredentials?.sandi || '-'}</div>
                                                            </div>
                                                            
                                                            <div class="footer">
                                                                Simpan kartu ini untuk login.<br>
                                                                Jangan berikan kepada orang lain.
                                                            </div>
                                                        </div>
                                                        <script>
                                                            window.onload = function() { window.print(); }
                                                        </script>
                                                    </body>
                                                </html>
                                            `);
                                            printWindow.document.close();
                                        }}
                                        className="btn bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        Cetak Kredensial
                                    </button>
                                    <button className="btn btn-secondary w-full" onClick={closeModal}>
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="p-6 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={formData.nama}
                                            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                            required
                                            placeholder="Masukkan nama siswa"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Kelas</label>
                                        <select
                                            className="select w-full"
                                            value={formData.kelas}
                                            onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                                            required
                                        >
                                            <option value="">Pilih Kelas</option>
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
                                    {/* Jabatan input removed as per request, defaults to 'Anggota' in backend */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Organisasi</label>
                                        <select
                                            className="select w-full"
                                            value={formData.organisasi}
                                            onChange={(e) => setFormData({ ...formData, organisasi: e.target.value })}
                                        >
                                            <option value="OSIS">OSIS</option>
                                            <option value="MPK">MPK</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Batal
                                    </button>
                                    <button type="submit" className="btn btn-primary shadow-lg shadow-primary/20">
                                        {editMode ? 'Simpan Perubahan' : 'Tambah Siswa'}
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
