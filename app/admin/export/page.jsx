'use client';

import { useState } from 'react';

export default function ExportPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [organisasi, setOrganisasi] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleExport = async () => {
        if (!startDate || !endDate) {
            setError('Pilih rentang tanggal terlebih dahulu');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let url = `/api/export?startDate=${startDate}&endDate=${endDate}`;
            if (organisasi) {
                url += `&organisasi=${organisasi}`;
            }

            const res = await fetch(url);

            if (!res.ok) {
                throw new Error('Gagal mengekspor data ke file excel');
            }

            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `presensi_${organisasi || 'semua'}_${startDate}_${endDate}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const setQuickRange = (type) => {
        const today = new Date();
        let start, end;

        switch (type) {
            case 'today':
                start = end = today.toISOString().split('T')[0];
                break;
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay() + 1);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                start = weekStart.toISOString().split('T')[0];
                end = weekEnd.toISOString().split('T')[0];
                break;
            case 'month':
                start = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                end = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${lastDay}`;
                break;
            case 'year':
                start = `${today.getFullYear()}-01-01`;
                end = `${today.getFullYear()}-12-31`;
                break;
        }

        setStartDate(start);
        setEndDate(end);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
                <div>
                    <h1 className="text-4xl font-extrabold text-primary tracking-tight">Eksportasi Laporan</h1>
                    <p className="text-slate-500 font-medium mt-2">Unduh arsip log presensi secara struktural.</p>
                </div>
            </header>

            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-premium border border-slate-100 space-y-10 border-t-4 border-t-primary">

                {/* 1. Range Selection */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">1. Tentukan Parameter Waktu</h3>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <button className="btn btn-secondary text-xs" onClick={() => setQuickRange('today')}>
                            HARI INI
                        </button>
                        <button className="btn btn-secondary text-xs" onClick={() => setQuickRange('week')}>
                            MINGGU INI
                        </button>
                        <button className="btn btn-secondary text-xs" onClick={() => setQuickRange('month')}>
                            BULAN INI
                        </button>
                        <button className="btn btn-secondary text-xs" onClick={() => setQuickRange('year')}>
                            TAHUN INI
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <div className="form-group mb-0">
                            <label className="form-label">Titik Mulai (Start Date)</label>
                            <input
                                type="date"
                                className="input bg-white cursor-text"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group mb-0">
                            <label className="form-label">Titik Akhir (End Date)</label>
                            <input
                                type="date"
                                className="input bg-white cursor-text"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100"></div>

                {/* 2. Organization Filter */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">2. Pemfilteran Objek Organisasi</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 ${organisasi === ''
                                ? 'bg-primary border-primary text-white shadow-md'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-500'
                                }`}
                            onClick={() => setOrganisasi('')}
                        >
                            <span className="text-sm font-bold tracking-widest uppercase">GABUNGAN (ALL)</span>
                        </button>
                        <button
                            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 ${organisasi === 'OSIS'
                                ? 'bg-primary border-primary text-white shadow-md'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-500'
                                }`}
                            onClick={() => setOrganisasi('OSIS')}
                        >
                            <span className="text-sm font-bold tracking-widest uppercase">O S I S</span>
                        </button>
                        <button
                            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 ${organisasi === 'MPK'
                                ? 'bg-primary border-primary text-white shadow-md'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-500'
                                }`}
                            onClick={() => setOrganisasi('MPK')}
                        >
                            <span className="text-sm font-bold tracking-widest uppercase">M P K</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                {/* Summary Box */}
                <div className="bg-primary rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-slate-800 text-white">
                    <div className="space-y-4 flex-1">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">3. Konfigurasi Ekspor</h3>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm font-medium border-b border-white/10 pb-2">
                                <span className="text-slate-400">Periode Waktu:</span>
                                <span className="font-bold tracking-wide">
                                    {startDate && endDate
                                        ? `${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`
                                        : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="text-slate-400">Target Organisasi:</span>
                                <span className="font-bold tracking-wide">{organisasi || 'KESELURUHAN (ALL)'}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn bg-accent text-white hover:bg-accent-light shadow-xl py-4 px-8 text-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0 w-full md:w-auto"
                        onClick={handleExport}
                        disabled={loading || !startDate || !endDate}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span className="tracking-wide font-bold mx-2">PACKING DATA...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                <span className="tracking-wide font-extrabold text-base">RUN EXPORT TO (.XLSX)</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
