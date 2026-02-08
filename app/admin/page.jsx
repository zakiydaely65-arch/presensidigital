'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalOsis: 0,
    totalMpk: 0,
    hadirHariIni: 0,
    izinHariIni: 0,
    sakitHariIni: 0,
    pulangHariIni: 0
  });
  const [recentPresensi, setRecentPresensi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch students
      const siswaRes = await fetch('/api/siswa');
      const siswaData = await siswaRes.json();

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const presensiRes = await fetch(`/api/presensi?startDate=${today}&endDate=${today}`);
      const presensiData = await presensiRes.json();

      if (siswaData.success && presensiData.success) {
        const siswa = siswaData.data || [];
        const presensi = presensiData.data || [];

        setStats({
          totalSiswa: siswa.length,
          totalOsis: siswa.filter(s => s.organisasi === 'OSIS').length,
          totalMpk: siswa.filter(s => s.organisasi === 'MPK').length,
          hadirHariIni: presensi.filter(p => p.status === 'hadir').length,
          izinHariIni: presensi.filter(p => p.status === 'izin').length,
          sakitHariIni: presensi.filter(p => p.status === 'sakit').length,
          pulangHariIni: presensi.filter(p => p.status === 'pulang').length
        });

        setRecentPresensi(presensi.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      hadir: 'bg-green-100 text-green-800',
      izin: 'bg-yellow-100 text-yellow-800',
      sakit: 'bg-red-100 text-red-800',
      pulang: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-gray-500">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="font-medium animate-pulse">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Selamat datang di Panel Admin Presensi Digital</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-primary-dark font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalSiswa}</div>
          <div className="text-sm text-gray-500 mt-1">Total Siswa</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalOsis}</div>
          <div className="text-sm text-gray-500 mt-1">Anggota OSIS</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalMpk}</div>
          <div className="text-sm text-gray-500 mt-1">Anggota MPK</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.hadirHariIni + stats.izinHariIni + stats.sakitHariIni}</div>
          <div className="text-sm text-gray-500 mt-1">Presensi Hari Ini</div>
        </div>
      </section>

      {/* Attendance Summary */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ringkasan Hari Ini</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center gap-4">
            <div className="text-2xl">✓</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.hadirHariIni}</div>
              <div className="text-sm text-gray-500">Hadir</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500 flex items-center gap-4">
            <div className="text-2xl">📄</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.izinHariIni}</div>
              <div className="text-sm text-gray-500">Izin</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 flex items-center gap-4">
            <div className="text-2xl">🏥</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.sakitHariIni}</div>
              <div className="text-sm text-gray-500">Sakit</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center gap-4">
            <div className="text-2xl">🏠</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.pulangHariIni}</div>
              <div className="text-sm text-gray-500">Pulang</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity Table */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Aktivitas Terkini</h2>
        </div>

        {recentPresensi.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nama</th>
                  <th className="px-6 py-4 font-semibold">Kelas</th>
                  <th className="px-6 py-4 font-semibold">Organisasi</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPresensi.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.namaSiswa}</td>
                    <td className="px-6 py-4 text-gray-500">{p.kelasSiswa}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.organisasiSiswa === 'OSIS' ? 'bg-indigo-100 text-indigo-700' : 'bg-sky-100 text-sky-700'}`}>
                        {p.organisasiSiswa}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">{p.waktu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-medium">Belum ada presensi hari ini</p>
          </div>
        )}
      </section>
    </div>
  );
}
