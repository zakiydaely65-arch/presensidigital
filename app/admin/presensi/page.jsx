'use client';

import { useState, useEffect } from 'react';

export default function PresensiPage() {
    const [presensi, setPresensi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('harian');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedWeek, setSelectedWeek] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [organisasiFilter, setOrganisasiFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [stats, setStats] = useState({ hadir: 0, izin: 0, sakit: 0, pulang: 0 });

    useEffect(() => {
        // Set initial week
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        setSelectedWeek(startOfWeek.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        fetchPresensi();
    }, [filterType, selectedDate, selectedWeek, selectedMonth, organisasiFilter, statusFilter]);

    const getDateRange = () => {
        let startDate, endDate;

        switch (filterType) {
            case 'harian':
                startDate = selectedDate;
                endDate = selectedDate;
                break;
            case 'mingguan':
                const weekStart = new Date(selectedWeek);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                startDate = weekStart.toISOString().split('T')[0];
                endDate = weekEnd.toISOString().split('T')[0];
                break;
            case 'bulanan':
                const [year, month] = selectedMonth.split('-');
                startDate = `${year}-${month}-01`;
                const lastDay = new Date(year, month, 0).getDate();
                endDate = `${year}-${month}-${lastDay}`;
                break;
            default:
                startDate = selectedDate;
                endDate = selectedDate;
        }

        return { startDate, endDate };
    };

    const fetchPresensi = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = getDateRange();
            let url = `/api/presensi?startDate=${startDate}&endDate=${endDate}`;
            if (organisasiFilter) {
                url += `&organisasi=${organisasiFilter}`;
            }
            if (statusFilter) {
                url += `&status=${statusFilter}`; // This needs support in /api/presensi too, but we are prioritizing export first as per request
                // For client-side filtering consistency, we might need to filter manually if API doesn't support it yet
                // But let's assume we will update API or relying on client side if API ignores it
            }

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                let filteredData = data.data;

                // Client-side status filtering if API doesn't handle it yet (safe fallback)
                if (statusFilter) {
                    filteredData = filteredData.filter(p => p.status === statusFilter);
                }

                setPresensi(filteredData);

                // Calculate stats based on fetched data (before status filter to show overall?) 
                // Usually stats show overview. If we filter by status, stats might look weird if they don't update.
                // Let's update stats based on the DATE range only, effectively ignoring status filter for the summary cards if desired,
                // OR update stats to reflect current view. Usually logic dictates stats reflect current view.
                // Let's calculate stats from filteredData
                const newStats = { hadir: 0, izin: 0, sakit: 0, pulang: 0 };
                filteredData.forEach(p => {
                    if (newStats[p.status] !== undefined) {
                        newStats[p.status]++;
                    }
                });
                setStats(newStats);
            }
        } catch (error) {
            console.error('Error fetching presensi:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            hadir: 'badge-success',
            izin: 'badge-warning',
            sakit: 'badge-danger',
            pulang: 'badge-info'
        };
        return badges[status] || 'badge-neutral';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getExportLink = () => {
        const { startDate, endDate } = getDateRange();
        let url = `/api/export?type=presensi&startDate=${startDate}&endDate=${endDate}`;
        if (organisasiFilter) url += `&organisasi=${organisasiFilter}`;
        if (statusFilter) url += `&status=${statusFilter}`;
        return url;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Presensi</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola dan pantau presensi anggota</p>
                </div>
                <a
                    href={getExportLink()}
                    target="_blank"
                    className="btn btn-primary"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Data
                </a>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center flex-wrap">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-600">Periode:</label>
                        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                            {['harian', 'mingguan', 'bulanan'].map((type) => (
                                <button
                                    key={type}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterType === type
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    onClick={() => setFilterType(type)}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-600">Organisasi:</label>
                        <select
                            className="select w-40"
                            value={organisasiFilter}
                            onChange={(e) => setOrganisasiFilter(e.target.value)}
                        >
                            <option value="">Semua</option>
                            <option value="OSIS">OSIS</option>
                            <option value="MPK">MPK</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-600">Status:</label>
                        <select
                            className="select w-40"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Semua</option>
                            <option value="hadir">Hadir</option>
                            <option value="pulang">Pulang</option>
                            <option value="izin">Izin</option>
                            <option value="sakit">Sakit</option>
                        </select>
                    </div>

                    {filterType === 'harian' && (
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-600">Tanggal:</label>
                            <input
                                type="date"
                                className="input"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                    )}

                    {filterType === 'mingguan' && (
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-600">Minggu Mulai:</label>
                            <input
                                type="date"
                                className="input"
                                value={selectedWeek}
                                onChange={(e) => setSelectedWeek(e.target.value)}
                            />
                        </div>
                    )}

                    {filterType === 'bulanan' && (
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-600">Bulan:</label>
                            <input
                                type="month"
                                className="input"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border-l-4 border-green-500 shadow-sm flex flex-col">
                    <span className="text-3xl font-bold text-gray-900">{stats.hadir}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Hadir</span>
                </div>
                <div className="bg-white p-5 rounded-xl border-l-4 border-yellow-500 shadow-sm flex flex-col">
                    <span className="text-3xl font-bold text-gray-900">{stats.izin}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Izin</span>
                </div>
                <div className="bg-white p-5 rounded-xl border-l-4 border-red-500 shadow-sm flex flex-col">
                    <span className="text-3xl font-bold text-gray-900">{stats.sakit}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Sakit</span>
                </div>
                <div className="bg-white p-5 rounded-xl border-l-4 border-blue-500 shadow-sm flex flex-col">
                    <span className="text-3xl font-bold text-gray-900">{stats.pulang}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Pulang</span>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="spinner w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">No</th>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4">Waktu</th>
                                    <th className="px-6 py-4">Nama</th>
                                    <th className="px-6 py-4">Kelas</th>
                                    <th className="px-6 py-4">Organisasi</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Lokasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {presensi.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                                            Tidak ada data presensi untuk periode ini
                                        </td>
                                    </tr>
                                ) : (
                                    presensi.map((p, idx) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                                            <td className="px-6 py-4 font-mono text-sm text-gray-600">{formatDate(p.tanggal)}</td>
                                            <td className="px-6 py-4 font-mono text-sm text-gray-600">{p.waktu}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{p.namaSiswa}</td>
                                            <td className="px-6 py-4 text-gray-600">{p.kelasSiswa}</td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${p.organisasiSiswa === 'OSIS' ? 'badge-primary' : 'badge-info'}`}>
                                                    {p.organisasiSiswa}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${getStatusBadge(p.status)}`}>
                                                    {p.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${p.isAtSchool
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    }`}>
                                                    {p.isAtSchool ? '📍 Sekolah' : '🏠 Luar'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
