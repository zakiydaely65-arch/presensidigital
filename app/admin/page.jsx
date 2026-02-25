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
      const siswaRes = await fetch('/api/siswa');
      const siswaData = await siswaRes.json();

      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
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
      hadir: 'badge-success',
      izin: 'badge-warning',
      sakit: 'badge-danger',
      pulang: 'badge-accent'
    };
    return badges[status] || 'badge-primary';
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-slate-400">
        <div className="w-10 h-10 border-[3px] border-slate-200 border-t-accent rounded-full animate-spin"></div>
        <p className="font-bold tracking-widest uppercase text-xs">Memuat Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 pb-4 md:pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-primary tracking-tight">Overview</h1>
          <p className="text-slate-500 font-medium mt-1 md:mt-2 text-sm md:text-base">Pantau aktivitas presensi dan data organisasi hari ini.</p>
        </div>
        <div className="bg-white px-4 md:px-5 py-2.5 md:py-3 rounded-2xl shadow-sm border border-slate-200 text-primary font-bold flex items-center gap-2 md:gap-3 self-start md:self-auto">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="tracking-wide text-xs md:text-sm">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="card p-4 md:p-6 flex flex-col justify-between group cursor-default">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" strokeWidth={2.5} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div>
            <div className="text-2xl md:text-4xl font-extrabold text-primary tracking-tight">{stats.totalSiswa}</div>
            <div className="text-[10px] md:text-xs font-bold text-slate-400 mt-1.5 md:mt-2 uppercase tracking-wider">Total Anggota</div>
          </div>
        </div>

        <div className="card p-4 md:p-6 flex flex-col justify-between group cursor-default">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <span className="text-lg md:text-xl font-extrabold text-primary">O</span>
          </div>
          <div>
            <div className="text-2xl md:text-4xl font-extrabold text-primary tracking-tight">{stats.totalOsis}</div>
            <div className="text-[10px] md:text-xs font-bold text-slate-400 mt-1.5 md:mt-2 uppercase tracking-wider">Anggota OSIS</div>
          </div>
        </div>

        <div className="card p-4 md:p-6 flex flex-col justify-between group cursor-default">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <span className="text-lg md:text-xl font-extrabold text-primary">M</span>
          </div>
          <div>
            <div className="text-2xl md:text-4xl font-extrabold text-primary tracking-tight">{stats.totalMpk}</div>
            <div className="text-[10px] md:text-xs font-bold text-slate-400 mt-1.5 md:mt-2 uppercase tracking-wider">Anggota MPK</div>
          </div>
        </div>

        <div className="card p-4 md:p-6 flex flex-col justify-between group cursor-default border-t-4 border-t-accent col-span-2 sm:col-span-1">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform shadow-md">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <div className="text-2xl md:text-4xl font-extrabold text-accent tracking-tight">{stats.hadirHariIni + stats.izinHariIni + stats.sakitHariIni}</div>
            <div className="text-[10px] md:text-xs font-bold text-accent mt-1.5 md:mt-2 uppercase tracking-wider">Presensi Hari Ini</div>
          </div>
        </div>
      </section>

      {/* Attendance Summary Panel */}
      <section className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border border-slate-200">
        <h2 className="text-lg md:text-xl font-extrabold text-primary mb-4 md:mb-6 flex items-center gap-3 tracking-tight">
          <span className="w-2 h-5 md:h-6 bg-accent rounded-full inline-block"></span>
          Rekapitulasi Kehadiran
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-emerald-50 rounded-xl md:rounded-2xl border border-emerald-100/50">
            <span className="text-2xl md:text-4xl font-extrabold text-emerald-600 tracking-tight">{stats.hadirHariIni}</span>
            <span className="text-[10px] md:text-xs font-bold text-emerald-600/70 uppercase tracking-widest mt-1.5 md:mt-2">Hadir</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-amber-50 rounded-xl md:rounded-2xl border border-amber-100/50">
            <span className="text-2xl md:text-4xl font-extrabold text-amber-600 tracking-tight">{stats.izinHariIni}</span>
            <span className="text-[10px] md:text-xs font-bold text-amber-600/70 uppercase tracking-widest mt-1.5 md:mt-2">Izin</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-rose-50 rounded-xl md:rounded-2xl border border-rose-100/50">
            <span className="text-2xl md:text-4xl font-extrabold text-rose-600 tracking-tight">{stats.sakitHariIni}</span>
            <span className="text-[10px] md:text-xs font-bold text-rose-600/70 uppercase tracking-widest mt-1.5 md:mt-2">Sakit</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-200">
            <span className="text-2xl md:text-4xl font-extrabold text-primary tracking-tight">{stats.pulangHariIni}</span>
            <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1.5 md:mt-2">Pulang</span>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 overflow-hidden">
        <div className="p-5 md:p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-extrabold text-primary flex items-center gap-3 tracking-tight">
            <span className="w-2 h-5 md:h-6 bg-primary rounded-full inline-block"></span>
            Log Aktivitas Terkini
          </h2>
        </div>

        {recentPresensi.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Siswa</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Kelas</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Organisasi</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Waktu Terdata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPresensi.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 font-bold text-primary">{p.namaSiswa}</td>
                      <td className="px-8 py-5 text-slate-500 font-medium">{p.kelasSiswa}</td>
                      <td className="px-8 py-5">
                        <span className="badge badge-primary">{p.organisasiSiswa}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`badge ${getStatusBadge(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-slate-500 font-mono text-sm font-medium">{p.waktu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-slate-100">
              {recentPresensi.map((p, idx) => (
                <div key={p.id || idx} className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-extrabold text-primary">{p.namaSiswa?.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-primary text-sm truncate">{p.namaSiswa}</p>
                      <span className={`badge ${getStatusBadge(p.status)} shrink-0`}>{p.status}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-slate-400 font-medium">{p.kelasSiswa}</span>
                      <span className="text-slate-300">•</span>
                      <span className="badge badge-primary text-[9px] px-2 py-0.5">{p.organisasiSiswa}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-400 font-mono">{p.waktu}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-10 md:p-16 text-center text-slate-400 bg-slate-50/50">
            <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-xs md:text-sm font-bold uppercase tracking-widest">Belum ada data terekam hari ini</p>
          </div>
        )}
      </section>
    </div>
  );
}
