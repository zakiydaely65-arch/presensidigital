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
    const [stats, setStats] = useState({ hadir: 0, izin: 0, sakit: 0, pulang: 0 });

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

    const fetchPresensi = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = getDateRange();
            let url = `/api/presensi?startDate=${startDate}&endDate=${endDate}`;
            if (organisasiFilter) {
                url += `&organisasi=${organisasiFilter}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                let filteredData = data.data;

                if (statusFilter) {
                    filteredData = filteredData.filter(p => p.status === statusFilter);
                }

                setPresensi(filteredData);

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
            pulang: 'badge-primary'
        };
        return badges[status] || 'badge-primary';
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
        <div className="max-w-7xl mx-auto space-y-5 md:space-y-8 animate-fadeIn">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 pb-4 md:pb-6 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-primary tracking-tight">Log Absensi</h1>
                    <p className="text-slate-500 font-medium mt-1 md:mt-2 text-sm md:text-base">Arus waktu kehadiran siswa secara spesifik dan valid.</p>
                </div>
                <div>
                    <a
                        href={getExportLink()}
                        target="_blank"
                        className="btn btn-primary font-bold text-xs md:text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="hidden sm:inline">CETAK LAPORAN (XLSX)</span>
                        <span className="sm:hidden">CETAK</span>
                    </a>
                </div>
            </header>

            <div className="card p-4 md:p-8 space-y-5 md:space-y-8 border-t-4 border-t-primary">
                <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:items-end">
                    <div className="form-group mb-0 flex-1">
                        <label className="form-label">Tipe Filter Periode</label>
                        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full md:w-fit">
                            {['harian', 'mingguan', 'bulanan'].map((type) => (
                                <button
                                    key={type}
                                    className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${filterType === type
                                        ? 'bg-white text-primary shadow-sm border border-slate-200'
                                        : 'text-slate-400 hover:text-primary'
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
                                className="select py-2 md:py-2.5 bg-slate-50 text-xs md:text-sm"
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
                                className="select py-2 md:py-2.5 bg-slate-50 text-xs md:text-sm"
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
                            <div className="form-group mb-0 col-span-2">
                                <label className="form-label text-[10px] md:text-xs">Tanggal</label>
                                <input
                                    type="date"
                                    className="input py-2 md:py-2.5 bg-slate-50 cursor-text text-xs md:text-sm"
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
                                    className="input py-2 md:py-2.5 bg-slate-50 cursor-text text-xs md:text-sm"
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
                                    className="input py-2 md:py-2.5 bg-slate-50 cursor-text text-xs md:text-sm"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <div className="card p-4 md:p-6 border-l-4 md:border-l-[6px] border-l-emerald-500 rounded-2xl md:rounded-[24px]">
                    <div className="text-2xl md:text-4xl font-extrabold text-primary tracking-tight">{stats.hadir}</div>
                    <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1.5 md:mt-2">Data Hadir</div>
                </div>
                <div className="card p-4 md:p-6 border-l-4 md:border-l-[6px] border-l-amber-500 rounded-2xl md:rounded-[24px]">
                    <div className="text-2xl md:text-4xl font-extrabold text-primary tracking-tight">{stats.izin}</div>
                    <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1.5 md:mt-2">Data Izin</div>
                </div>
                <div className="card p-4 md:p-6 border-l-4 md:border-l-[6px] border-l-rose-500 rounded-2xl md:rounded-[24px]">
                    <div className="text-2xl md:text-4xl font-extrabold text-primary tracking-tight">{stats.sakit}</div>
                    <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1.5 md:mt-2">Data Sakit</div>
                </div>
                <div className="card p-4 md:p-6 border-l-4 md:border-l-[6px] border-l-accent rounded-2xl md:rounded-[24px]">
                    <div className="text-2xl md:text-4xl font-extrabold text-primary tracking-tight">{stats.pulang}</div>
                    <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1.5 md:mt-2">Data Pulang</div>
                </div>
            </div>

            {loading ? (
                <div className="min-h-[30vh] flex flex-col items-center justify-center gap-6 text-slate-400">
                    <div className="w-10 h-10 border-[3px] border-slate-200 border-t-primary rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-16 text-center">No</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tanggal</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pukul</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Personil</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Kelas</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Afiliasi</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">GPS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {presensi.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-8 py-16 text-center text-slate-400">
                                            <div className="flex justify-center mb-3">
                                                <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </div>
                                            <p className="font-bold uppercase tracking-widest text-xs">LOG ABSENSI PERIODE INI BERSIH/KOSONG.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    presensi.map((p, idx) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5 font-bold text-slate-400 text-center text-xs">{idx + 1}</td>
                                            <td className="px-6 py-5 font-bold text-slate-500 text-xs tracking-wide">{formatDate(p.tanggal)}</td>
                                            <td className="px-6 py-5 font-mono font-bold text-primary tracking-wider">{p.waktu}</td>
                                            <td className="px-6 py-5 font-bold text-primary">{p.namaSiswa}</td>
                                            <td className="px-6 py-5 text-slate-500 font-medium">{p.kelasSiswa}</td>
                                            <td className="px-6 py-5">
                                                <span className={`badge ${p.organisasiSiswa === 'OSIS' ? 'badge-primary' : 'badge-accent'}`}>
                                                    {p.organisasiSiswa}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`badge ${getStatusBadge(p.status)}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                                    {p.isAtSchool ? (
                                                        <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ON-SITE</>
                                                    ) : (
                                                        <><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> OFF-SITE</>
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="md:hidden">
                        {presensi.length === 0 ? (
                            <div className="px-4 py-12 text-center text-slate-400">
                                <div className="flex justify-center mb-3">
                                    <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <p className="font-bold uppercase tracking-widest text-xs">LOG KOSONG</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {presensi.map((p, idx) => (
                                    <div key={p.id} className="p-4 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="font-bold text-primary text-sm truncate">{p.namaSiswa}</p>
                                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                    <span className="text-xs text-slate-400">{p.kelasSiswa}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className={`badge text-[9px] px-2 py-0.5 ${p.organisasiSiswa === 'OSIS' ? 'badge-primary' : 'badge-accent'}`}>
                                                        {p.organisasiSiswa}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`badge ${getStatusBadge(p.status)} shrink-0`}>{p.status}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                            <span className="font-mono font-bold text-primary">{p.waktu}</span>
                                            <span className="text-slate-300">•</span>
                                            <span>{formatDate(p.tanggal)}</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="flex items-center gap-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${p.isAtSchool ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                {p.isAtSchool ? 'ON-SITE' : 'OFF-SITE'}
                                            </span>
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
