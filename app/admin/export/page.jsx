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
                throw new Error('Gagal mengekspor data');
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
        <div className="p-6 max-w-3xl mx-auto space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
                <p className="text-gray-500 text-sm mt-1">Ekspor data presensi ke file Excel</p>
            </header>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-8">
                {/* Quick Range Selection */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Pilih Rentang Waktu Cepat</h3>
                    <div className="flex flex-wrap gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => setQuickRange('today')}>
                            Hari Ini
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setQuickRange('week')}>
                            Minggu Ini
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setQuickRange('month')}>
                            Bulan Ini
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setQuickRange('year')}>
                            Tahun Ini
                        </button>
                    </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Manual Range Selection */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Atau Pilih Manual</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="input-group">
                            <label>Tanggal Mulai</label>
                            <input
                                type="date"
                                className="input"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Tanggal Akhir</label>
                            <input
                                type="date"
                                className="input"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Organization Filter */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Filter Organisasi</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <button
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${organisasi === ''
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-600'
                                }`}
                            onClick={() => setOrganisasi('')}
                        >
                            <span className="text-2xl">👥</span>
                            <span className="text-sm font-medium">Semua</span>
                        </button>
                        <button
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${organisasi === 'OSIS'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-600'
                                }`}
                            onClick={() => setOrganisasi('OSIS')}
                        >
                            <span className="text-2xl">⭐</span>
                            <span className="text-sm font-medium">OSIS</span>
                        </button>
                        <button
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${organisasi === 'MPK'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-600'
                                }`}
                            onClick={() => setOrganisasi('MPK')}
                        >
                            <span className="text-2xl">🏛️</span>
                            <span className="text-sm font-medium">MPK</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error animate-fadeIn">
                        {error}
                    </div>
                )}

                {/* Summary Box */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">Periode</span>
                        <span className="font-semibold text-gray-900">
                            {startDate && endDate
                                ? `${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`
                                : 'Belum dipilih'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Organisasi</span>
                        <span className="font-semibold text-gray-900">{organisasi || 'Semua'}</span>
                    </div>
                </div>

                <button
                    className="btn btn-primary btn-lg w-full shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    onClick={handleExport}
                    disabled={loading || !startDate || !endDate}
                >
                    {loading ? (
                        <>
                            <div className="spinner border-white border-t-transparent w-5 h-5"></div>
                            Mengekspor...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download Excel
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
