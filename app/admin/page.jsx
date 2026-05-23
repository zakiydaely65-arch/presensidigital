'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSiswa: 0, totalOsis: 0, totalMpk: 0,
    hadirHariIni: 0, izinHariIni: 0, sakitHariIni: 0, pulangHariIni: 0
  });
  const [recentPresensi, setRecentPresensi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

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

  const getStatusBadge = (status) => ({
    hadir: 'badge-success',
    hadir_luar_radius: 'badge-warning',
    izin: 'badge-warning',
    sakit: 'badge-danger',
    pulang: 'badge-accent'
  }[status] || 'badge-primary');

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="w-10 h-10 border-4 border-black border-t-[#FF90E8] animate-spin" />
        <p className="font-black tracking-[0.3em] uppercase text-xs">MEMUAT DASHBOARD...</p>
      </div>
    );
  }

  const todayLabel = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">

      {/* Page Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-4 border-black">
        <div>
          <div className="inline-block bg-[#FF90E8] border-2 border-black text-black text-xs font-black px-3 py-1 tracking-[0.3em] uppercase shadow-[3px_3px_0px_0px_#000] mb-3">
            ADMIN PANEL
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-black tracking-tight">DASHBOARD</h1>
          <p className="text-black/60 font-bold mt-1 text-sm">Pantau semua aktivitas presensi hari ini.</p>
        </div>
        <div className="flex items-center gap-2 bg-black text-[#FFE600] px-4 py-2.5 border-2 border-black shadow-[4px_4px_0px_0px_#FF90E8] font-mono text-sm font-bold self-start">
          📅 {todayLabel}
        </div>
      </div>

      {/* Stat Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Anggota', val: stats.totalSiswa, bg: 'bg-white', accent: '#FFE600', icon: '👥' },
          { label: 'Anggota OSIS',  val: stats.totalOsis,  bg: 'bg-[#FF90E8]', accent: '#000', icon: '🔵' },
          { label: 'Anggota MPK',   val: stats.totalMpk,   bg: 'bg-[#FFE600]', accent: '#000', icon: '🟡' },
          { label: 'Presensi Hari Ini', val: stats.hadirHariIni + stats.izinHariIni + stats.sakitHariIni,
            bg: 'bg-black', accent: '#FFE600', textColor: 'text-[#FFE600]', labelColor: 'text-[#FFE600]/60', icon: '⚡' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border-2 border-black shadow-[5px_5px_0px_0px_#000] p-5 flex flex-col gap-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000] transition-all cursor-default`}>
            <div className="text-2xl">{s.icon}</div>
            <div>
              <div className={`text-3xl md:text-5xl font-black tracking-tight font-mono ${s.textColor || 'text-black'}`}>{s.val}</div>
              <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-2 ${s.labelColor || 'text-black/50'}`}>{s.label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Attendance Breakdown */}
      <section className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000]">
        <div className="bg-[#FFE600] border-b-2 border-black px-6 py-4 flex items-center gap-3">
          <span className="font-black text-xs tracking-[0.3em] uppercase">📊 Rekapitulasi Kehadiran Hari Ini</span>
        </div>
        <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'HADIR',  val: stats.hadirHariIni,  bg: 'bg-[#00FF94]' },
            { label: 'IZIN',   val: stats.izinHariIni,   bg: 'bg-[#FFE600]' },
            { label: 'SAKIT',  val: stats.sakitHariIni,  bg: 'bg-[#FF3333] text-white' },
            { label: 'PULANG', val: stats.pulangHariIni, bg: 'bg-[#FF90E8]' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border-2 border-black p-5 text-center shadow-[4px_4px_0px_0px_#000]`}>
              <div className="text-4xl font-black font-mono tracking-tight">{s.val}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/admin/siswa',    label: 'Kelola Data Siswa',  sub: 'Tambah, edit, hapus', emoji: '👥', bg: 'bg-[#FF90E8]' },
          { href: '/admin/presensi', label: 'Lihat Presensi',     sub: 'Filter & cari data',  emoji: '📋', bg: 'bg-white'     },
          { href: '/admin/jam-pelajaran', label: 'Jam Pelajaran', sub: 'Input & Rekap JP',    emoji: '⏱️', bg: 'bg-[#FFE600]' },
          { href: '/admin/export',   label: 'Export Excel',       sub: 'Unduh rekap data',    emoji: '📤', bg: 'bg-[#00FF94]' },
        ].map((l) => (
          <Link key={l.href} href={l.href}
            className={`${l.bg} border-2 border-black shadow-[5px_5px_0px_0px_#000] p-6 flex flex-col gap-3
              hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[2px_2px_0px_0px_#000] transition-all`}>
            <span className="text-3xl">{l.emoji}</span>
            <div>
              <div className="font-black text-black text-base tracking-tight">{l.label}</div>
              <div className="text-xs font-bold text-black/50 uppercase tracking-widest mt-1">{l.sub}</div>
            </div>
            <div className="mt-auto font-black text-xs tracking-widest flex items-center gap-2">
              BUKA <span>→</span>
            </div>
          </Link>
        ))}
      </section>

      {/* Recent Log Table */}
      <section className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
        <div className="bg-black text-[#FFE600] px-6 py-4 border-b-2 border-black flex items-center justify-between">
          <span className="font-black text-xs tracking-[0.3em] uppercase">🕒 Log Aktivitas Terkini</span>
          <span className="badge badge-accent">{recentPresensi.length} ENTRI</span>
        </div>

        {recentPresensi.length > 0 ? (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#FFE600] border-b-2 border-black">
                  <tr>
                    {['Siswa', 'Kelas', 'Organisasi', 'Status', 'Waktu'].map(h => (
                      <th key={h} className="px-6 py-4 text-[11px] font-black text-black uppercase tracking-[0.2em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentPresensi.map((p, idx) => (
                    <tr key={p.id || idx} className="border-b-2 border-black hover:bg-[#FFE600]/20 transition-colors">
                      <td className="px-6 py-4 font-black text-black">{p.namaSiswa}</td>
                      <td className="px-6 py-4 font-bold text-black/70">{p.kelasSiswa}</td>
                      <td className="px-6 py-4"><span className="badge badge-primary">{p.organisasiSiswa}</span></td>
                      <td className="px-6 py-4"><span className={`badge ${getStatusBadge(p.status)}`}>{p.status.replace('_', ' ')}</span></td>
                      <td className="px-6 py-4 font-mono font-bold text-sm">{p.waktu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y-2 divide-black">
              {recentPresensi.map((p, idx) => (
                <div key={p.id || idx} className="p-4 flex items-start gap-3 hover:bg-[#FFE600]/20">
                  <div className="w-10 h-10 bg-black border-2 border-black flex items-center justify-center text-[#FFE600] font-black text-sm shrink-0">
                    {p.namaSiswa?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-black text-black text-sm truncate">{p.namaSiswa}</p>
                      <span className={`badge ${getStatusBadge(p.status)} shrink-0`}>{p.status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs font-bold text-black/50">{p.kelasSiswa}</span>
                      <span className="badge badge-primary text-[9px] px-2 py-0.5">{p.organisasiSiswa}</span>
                      <span className="text-xs font-mono font-bold text-black/50">{p.waktu}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-16 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="font-black text-black/50 uppercase tracking-[0.3em] text-sm">BELUM ADA DATA HARI INI</p>
          </div>
        )}
      </section>
    </div>
  );
}
