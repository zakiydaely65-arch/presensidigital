'use client';

import { useState, useEffect } from 'react';

export default function PresensiPage() {
    const [presensi, setPresensi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('harian');
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }));
    const [selectedWeek, setSelectedWeek] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        const yyyy = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric' }).split('-')[0];
        const mm = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta', month: '2-digit' }).split('-')[1];
        return `${yyyy}-${mm}`;
    });
    const [organisasiFilter, setOrganisasiFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [stats, setStats] = useState({ hadir: 0, hadir_luar_radius: 0, izin: 0, sakit: 0, pulang: 0, tidak_hadir: 0 });

    useEffect(() => {
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
        const today = new Date(todayStr + 'T00:00:00');
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

    // Group raw presensi records by siswa_id + tanggal
    const groupPresensi = (data) => {
        const map = new Map();

        data.forEach(p => {
            const key = `${p.siswa_id || p.siswaId}_${p.tanggal}`;
            if (!map.has(key)) {
                map.set(key, {
                    key,
                    tanggal: p.tanggal,
                    siswa_id: p.siswa_id || p.siswaId,
                    namaSiswa: p.namaSiswa || 'Unknown',
                    kelasSiswa: p.kelasSiswa || 'Unknown',
                    organisasiSiswa: p.organisasiSiswa || 'Unknown',
                    entries: []
                });
            }
            map.get(key).entries.push({
                status: p.status,
                waktu: p.waktu,
                isAtSchool: p.isAtSchool ?? p.is_at_school,
                jarak: p.jarak,
                latitude: p.latitude,
                longitude: p.longitude
            });
        });

        // Sort entries within each group by waktu ascending
        map.forEach(group => {
            group.entries.sort((a, b) => (a.waktu || '').localeCompare(b.waktu || ''));
        });

        return Array.from(map.values());
    };

    const fetchPresensi = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = getDateRange();

            // Auto-absent: mark students as "tidak_hadir" for dates up to today
            const todayWIB = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
            const rangeStart = new Date(startDate + 'T00:00:00');
            const rangeEnd = new Date(endDate + 'T00:00:00');
            const autoAbsentDates = [];
            for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                if (dateStr <= todayWIB) {
                    autoAbsentDates.push(dateStr);
                }
            }

            if (autoAbsentDates.length > 0 && autoAbsentDates.length <= 31) {
                await Promise.all(
                    autoAbsentDates.map(date =>
                        fetch('/api/presensi/auto-absent', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ tanggal: date })
                        }).catch(err => console.warn('Auto-absent error for', date, err))
                    )
                );
            }

            // Base URL: periode + organisasi (tanpa status filter)
            let baseUrl = `/api/presensi?startDate=${startDate}&endDate=${endDate}`;
            if (organisasiFilter) {
                baseUrl += `&organisasi=${organisasiFilter}`;
            }

            const tableUrl = statusFilter ? `${baseUrl}&status=${statusFilter}` : baseUrl;

            const [statsRes, tableRes] = await Promise.all([
                fetch(baseUrl),
                statusFilter ? fetch(tableUrl) : Promise.resolve(null),
            ]);

            const statsData = await statsRes.json();

            if (statsData.success) {
                const newStats = { hadir: 0, hadir_luar_radius: 0, izin: 0, sakit: 0, pulang: 0, tidak_hadir: 0 };
                statsData.data.forEach(p => {
                    if (newStats[p.status] !== undefined) {
                        newStats[p.status]++;
                    }
                });
                setStats(newStats);
            }

            if (statusFilter && tableRes) {
                const tableData = await tableRes.json();
                setPresensi(tableData.success ? tableData.data : []);
            } else {
                setPresensi(statsData.success ? statsData.data : []);
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
            hadir_luar_radius: 'badge-warning',
            izin: 'badge-warning',
            sakit: 'badge-danger',
            pulang: 'badge-primary',
            tidak_hadir: 'badge-danger'
        };
        return badges[status] || 'badge-primary';
    };

    const getStatusLabel = (status) => {
        const labels = {
            hadir: 'Hadir',
            hadir_luar_radius: 'Hadir (Luar Radius)',
            izin: 'Izin',
            sakit: 'Sakit',
            pulang: 'Pulang',
            tidak_hadir: 'Tidak Hadir'
        };
        return labels[status] || status;
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

    // Group the presensi data for display
    const groupedPresensi = groupPresensi(presensi);

    return (
        <div className="max-w-7xl mx-auto space-y-5 md:space-y-8 animate-fadeIn">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 pb-6 border-b-4 border-black">
                <div>
                    <div className="inline-block bg-[#FF90E8] border-2 border-black text-black text-xs font-black px-3 py-1 tracking-[0.3em] uppercase shadow-[3px_3px_0px_0px_#000] mb-3">LOG ABSENSI</div>
                    <h1 className="text-3xl md:text-5xl font-black text-black tracking-tight">DATA PRESENSI</h1>
                    <p className="text-black/60 font-bold mt-1 text-sm">Filter dan pantau semua data kehadiran siswa.</p>
                </div>
                <div>
                    <a
                        href={getExportLink()}
                        target="_blank"
                        className="btn btn-primary font-bold text-xs md:text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="square" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="hidden sm:inline">CETAK LAPORAN XLSX</span>
                        <span className="sm:hidden">CETAK</span>
                    </a>
                </div>
            </header>

            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000]">
                <div className="bg-[#FFE600] border-b-2 border-black px-6 py-3">
                  <span className="font-black text-xs tracking-[0.3em] uppercase flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Filter Data
                  </span>
                </div>
            <div className="p-4 md:p-6 space-y-5 md:space-y-6">
                <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:items-end">
                    <div className="form-group mb-0 flex-1">
                        <label className="form-label">Tipe Filter Periode</label>
                        <div className="flex border-2 border-black w-full md:w-fit bg-white shadow-[3px_3px_0px_0px_#000]">
                            {['harian', 'mingguan', 'bulanan'].map((type) => (
                                <button
                                    key={type}
                                    className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border-r-2 last:border-r-0 border-black ${filterType === type
                                        ? 'bg-black text-[#FFE600]'
                                        : 'text-black hover:bg-[#FF90E8]'
                                        }`}
                                    onClick={() => setFilterType(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 flex-[2]">
                        <div className="form-group mb-0">
                            <label className="form-label text-[10px] md:text-xs">Organisasi</label>
                            <select
                                className="select py-2 md:py-2.5 bg-[#FF90E8] text-xs md:text-sm"
                                value={organisasiFilter}
                                onChange={(e) => setOrganisasiFilter(e.target.value)}
                            >
                                <option value="">Semua</option>
                                <option value="OSIS">OSIS</option>
                                <option value="MPK">MPK</option>
                            </select>
                        </div>

                        <div className="form-group mb-0">
                            <label className="form-label text-[10px] md:text-xs">Status</label>
                            <select
                                className="select py-2 md:py-2.5 bg-[#FF90E8] text-xs md:text-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">Semua</option>
                                <option value="hadir">Hadir</option>
                                <option value="hadir_luar_radius">Hadir (Luar Radius)</option>
                                <option value="pulang">Pulang</option>
                                <option value="izin">Izin</option>
                                <option value="sakit">Sakit</option>
                                <option value="tidak_hadir">Tidak Hadir</option>
                            </select>
                        </div>

                        {filterType === 'harian' && (
                            <div className="form-group mb-0 col-span-2">
                                <label className="form-label text-[10px] md:text-xs">Tanggal</label>
                                <input
                                    type="date"
                                    className="input py-2 md:py-2.5 bg-[#FF90E8] cursor-text text-xs md:text-sm"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                        )}

                        {filterType === 'mingguan' && (
                            <div className="form-group mb-0 col-span-2">
                                <label className="form-label text-[10px] md:text-xs">Start Minggu</label>
                                <input
                                    type="date"
                                    className="input py-2 md:py-2.5 bg-[#FF90E8] cursor-text text-xs md:text-sm"
                                    value={selectedWeek}
                                    onChange={(e) => setSelectedWeek(e.target.value)}
                                />
                            </div>
                        )}

                        {filterType === 'bulanan' && (
                            <div className="form-group mb-0 col-span-2">
                                <label className="form-label text-[10px] md:text-xs">Bulan</label>
                                <input
                                    type="month"
                                    className="input py-2 md:py-2.5 bg-[#FF90E8] cursor-text text-xs md:text-sm"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {[
                  { label: 'HADIR',       val: stats.hadir,             bg: 'bg-[#00FF94]' },
                  { label: 'LUAR RADIUS', val: stats.hadir_luar_radius,  bg: 'bg-[#FFE600]' },
                  { label: 'IZIN',        val: stats.izin,               bg: 'bg-[#FFE600]' },
                  { label: 'SAKIT',       val: stats.sakit,              bg: 'bg-[#FF3333] text-white' },
                  { label: 'PULANG',      val: stats.pulang,             bg: 'bg-[#FF90E8]' },
                  { label: 'TDK HADIR',   val: stats.tidak_hadir,        bg: 'bg-black text-[#FFE600]' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} border-2 border-black shadow-[4px_4px_0px_0px_#000] p-4 flex flex-col gap-2`}>
                    <div className="text-2xl md:text-4xl font-black font-mono tracking-tight">{s.val}</div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70">{s.label}</div>
                  </div>
                ))}
            </div>

            {loading ? (
                <div className="min-h-[30vh] flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-black border-t-[#FF90E8] animate-spin"></div>
                    <p className="font-black uppercase tracking-[0.3em] text-xs">MEMUAT DATA...</p>
                </div>
            ) : (
                <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#FFE600] border-b-2 border-black">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-[0.2em] w-16 text-center">#</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-[0.2em]">Tanggal</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-[0.2em]">Personil</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-[0.2em]">Kelas</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-[0.2em]">Afiliasi</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-[0.2em]">Status & Waktu</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-[0.2em]">GPS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-black">
                                {groupedPresensi.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-8 py-16 text-center text-slate-400">
                                            <div className="flex justify-center mb-3">
                                                <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </div>
                                            <p className="font-bold uppercase tracking-widest text-xs">LOG ABSENSI PERIODE INI BERSIH/KOSONG.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    groupedPresensi.map((group, idx) => (
                                        <tr key={group.key} className="hover:bg-[#FFE600]/30 transition-colors">
                                            <td className="px-6 py-5 font-bold text-slate-400 text-center text-xs">{idx + 1}</td>
                                            <td className="px-6 py-5 font-bold text-black font-bold text-xs tracking-wide">{formatDate(group.tanggal)}</td>
                                            <td className="px-6 py-5 font-bold text-black font-black">{group.namaSiswa}</td>
                                            <td className="px-6 py-5 text-black font-bold font-medium">{group.kelasSiswa}</td>
                                            <td className="px-6 py-5">
                                                <span className={`badge ${group.organisasiSiswa === 'OSIS' ? 'badge-primary' : 'badge-accent'}`}>
                                                    {group.organisasiSiswa}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1.5">
                                                    {group.entries.map((entry, i) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            <span className={`badge ${getStatusBadge(entry.status)}`}>
                                                                {getStatusLabel(entry.status)}
                                                            </span>
                                                            {entry.status !== 'tidak_hadir' && (
                                                                <span className="font-mono font-bold text-black font-black text-xs tracking-wider">
                                                                    {entry.waktu}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    {group.entries.map((entry, i) => (
                                                        entry.status !== 'tidak_hadir' ? (
                                                            <span key={i} className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                                                {entry.isAtSchool ? (
                                                                    <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ON-SITE</>
                                                                ) : (
                                                                    <><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> OFF-SITE {entry.jarak ? `(${Math.round(entry.jarak)}m)` : ''}</>
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <span key={i} className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                                                &mdash;
                                                            </span>
                                                        )
                                                    ))}
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
                        {groupedPresensi.length === 0 ? (
                            <div className="px-4 py-12 text-center text-slate-400">
                                <div className="flex justify-center mb-3">
                                    <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <p className="font-bold uppercase tracking-widest text-xs">LOG KOSONG</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {groupedPresensi.map((group) => (
                                    <div key={group.key} className="p-4 space-y-2.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="font-bold text-black font-black text-sm truncate">{group.namaSiswa}</p>
                                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                    <span className="text-xs text-slate-400">{group.kelasSiswa}</span>
                                                    <span className="text-slate-300">&bull;</span>
                                                    <span className={`badge text-[9px] px-2 py-0.5 ${group.organisasiSiswa === 'OSIS' ? 'badge-primary' : 'badge-accent'}`}>
                                                        {group.organisasiSiswa}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-medium shrink-0">{formatDate(group.tanggal)}</span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            {group.entries.map((entry, i) => (
                                                <div key={i} className="flex items-center gap-2 text-[10px]">
                                                    <span className={`badge ${getStatusBadge(entry.status)}`}>
                                                        {getStatusLabel(entry.status)}
                                                    </span>
                                                    {entry.status !== 'tidak_hadir' && (
                                                        <>
                                                            <span className="font-mono font-bold text-black font-black">{entry.waktu}</span>
                                                            <span className="text-slate-300">&bull;</span>
                                                            <span className="flex items-center gap-1 text-slate-400 font-medium">
                                                                <span className={`w-1.5 h-1.5 rounded-full ${entry.isAtSchool ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                                {entry.isAtSchool ? 'ON-SITE' : `OFF-SITE ${entry.jarak ? `(${Math.round(entry.jarak)}m)` : ''}`}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
