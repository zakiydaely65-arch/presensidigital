import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen font-sans bg-[#FFE600] text-black overflow-x-hidden">

      {/* Ticker Tape */}
      <div className="bg-black text-[#FFE600] overflow-hidden h-9 flex items-center border-b-4 border-black">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array(8).fill('★ PRESENSI DIGITAL ★ SISTEM ABSENSI OSIS & MPK ★ VERIFIKASI GPS REAL-TIME ★ CATAT KEHADIRAN CEPAT & AKURAT ★ ').map((t, i) => (
            <span key={i} className="text-xs font-black tracking-[0.35em] uppercase pr-8">{t}</span>
          ))}
        </div>
      </div>

      {/* ===== NAVBAR ===== */}
      <header className="border-b-4 border-black bg-[#FFE600] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#FF90E8]">
              <svg className="w-6 h-6 text-[#FFE600]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-black text-xl tracking-tight">PRESENSI<span className="text-[#FF90E8]">.</span></span>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <Link href="/login" id="nav-masuk-admin" className="hidden md:flex btn btn-ghost border-black text-black text-xs">
              MASUK ADMIN
            </Link>
            <Link href="/siswa" id="nav-presensi-now" className="btn btn-primary text-xs">
              PRESENSI SEKARANG →
            </Link>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col lg:flex-row items-start gap-12">
        {/* Left */}
        <div className="flex-1 space-y-8">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-black text-[#FFE600] px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_#FF90E8] text-xs font-black tracking-[0.3em] uppercase">
            <span className="w-2 h-2 bg-[#00FF94] rounded-full animate-pulse" />
            GENERASI BARU PRESENSI DIGITAL
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight">
            CATAT<br/>
            <span className="text-black bg-[#FF90E8] px-2 inline-block border-b-4 border-black">KEHADIRAN</span><br/>
            LEBIH<br/>
            <span className="relative inline-block">
              <span className="relative z-10">AKURAT</span>
              <span className="absolute inset-x-0 bottom-0 h-4 bg-[#00FF94] border-2 border-black -z-0" />
            </span>
          </h1>

          <p className="text-lg font-bold text-black/70 max-w-lg leading-relaxed">
            Platform presensi berbasis geolokasi untuk OSIS & MPK. Verifikasi GPS real-time, sinkronisasi instan, tidak bisa curang.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/siswa" id="hero-cta-siswa"
              className="btn btn-primary btn-lg group">
              MULAI PRESENSI
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link href="/login" id="hero-cta-admin" className="btn btn-secondary btn-lg">
              PANEL ADMIN
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3">
            {[
              { iconPath: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0', text: 'GPS Real-Time' },
              { iconPath: 'M13 10V3L4 14h7v7l9-11h-7z', text: 'Respons < 2 Detik' },
              { iconPath: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', text: 'Data Terenkripsi' },
            ].map(b => (
              <div key={b.text} className="flex items-center gap-2 bg-white border-2 border-black px-3 py-2 shadow-[3px_3px_0px_0px_#000] text-sm font-bold">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={b.iconPath} /></svg>
                {b.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Big stat panel */}
        <div className="flex-shrink-0 w-full lg:w-80 space-y-4">
          {/* Primary stat card */}
          <div className="bg-black border-2 border-black shadow-[8px_8px_0px_0px_#FF90E8] p-8">
            <div className="text-7xl font-black text-[#FFE600] font-mono tracking-tight leading-none">100%</div>
            <div className="text-[#FF90E8] font-black text-xs tracking-[0.3em] uppercase mt-3">DIGITALISASI PENUH</div>
            <div className="mt-4 h-0.5 bg-white/20" />
            <p className="mt-4 text-white/60 text-sm font-bold">Tidak ada kertas. Tidak ada manipulasi. Langsung tercatat ke server.</p>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: '<2s', label: 'Kecepatan', bg: 'bg-[#FF90E8]' },
              { val: 'GPS', label: 'Verified',  bg: 'bg-[#00FF94]' },
              { val: 'OSIS', label: 'Platform',  bg: 'bg-white'     },
              { val: 'MPK',  label: 'Supported', bg: 'bg-[#FFE600]' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border-2 border-black shadow-[3px_3px_0px_0px_#000] p-4`}>
                <div className="text-2xl font-black font-mono">{s.val}</div>
                <div className="text-[10px] font-black tracking-[0.2em] uppercase text-black/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="border-y-4 border-black bg-black py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <div className="inline-block bg-[#FF90E8] border-2 border-white text-black text-xs font-black px-4 py-2 tracking-[0.3em] uppercase shadow-[4px_4px_0px_0px_#FFE600] mb-4">
              CARA KERJA
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-[#FFE600] tracking-tight">
              4 LANGKAH<br/>MUDAH
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-0 border-2 border-[#FFE600]">
            {[
              { step: '01', title: 'IDENTIFIKASI', desc: 'Masukkan NISN di portal presensi.', bg: 'bg-[#FFE600]', textColor: 'text-black' },
              { step: '02', title: 'AKSES LOKASI', desc: 'Izinkan GPS untuk memverifikasi posisi Anda.', bg: 'bg-[#FF90E8]', textColor: 'text-black' },
              { step: '03', title: 'PILIH STATUS', desc: 'Hadir, Izin, atau Sakit — satu klik selesai.', bg: 'bg-white', textColor: 'text-black' },
              { step: '04', title: 'REKAP INSTAN', desc: 'Data otomatis masuk ke database real-time.', bg: 'bg-[#00FF94]', textColor: 'text-black' },
            ].map((item, i) => (
              <div key={i} className={`${item.bg} border-r-2 last:border-r-0 border-[#FFE600] p-8 flex flex-col gap-4`}>
                <div className="font-black text-6xl font-mono opacity-30 leading-none">{item.step}</div>
                <div className={`font-black text-xl tracking-tight ${item.textColor}`}>{item.title}</div>
                <div className={`text-sm font-bold ${item.textColor} opacity-70`}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-20 bg-[#FFE600]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-block bg-black text-[#FFE600] text-xs font-black px-4 py-2 tracking-[0.3em] uppercase shadow-[4px_4px_0px_0px_#FF90E8] mb-4">
                FITUR UTAMA
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">TEKNOLOGI<br/>DI BALIK LAYAR</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                iconPath: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0',
                title: 'Geolokasi GPS Akurat',
                desc: 'Koordinat lat/long diverifikasi secara ketat agar presensi hanya bisa dilakukan di area sekolah.',
                bg: 'bg-black', textColor: 'text-[#FFE600]', descColor: 'text-white/60', iconBg: 'bg-[#FFE600]', iconColor: 'text-black'
              },
              {
                iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                title: 'Dashboard Real-time',
                desc: 'Admin bisa memantau siapa yang hadir, izin, atau sakit langsung dari browser tanpa refresh manual.',
                bg: 'bg-[#FF90E8]', textColor: 'text-black', descColor: 'text-black/70', iconBg: 'bg-black', iconColor: 'text-[#FFE600]'
              },
              {
                iconPath: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
                title: 'Export Satu Klik',
                desc: 'Unduh rekapitulasi presensi ke format XLSX siap pakai untuk keperluan laporan LPJ.',
                bg: 'bg-white', textColor: 'text-black', descColor: 'text-black/60', iconBg: 'bg-[#00FF94]', iconColor: 'text-black'
              },
            ].map((f) => (
              <div key={f.title} className={`${f.bg} border-2 border-black shadow-[6px_6px_0px_0px_#000] p-8 flex flex-col gap-5 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_#000] transition-all`}>
                <div className={`w-14 h-14 ${f.iconBg} border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]`}>
                  <svg className={`w-7 h-7 ${f.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.iconPath} />
                  </svg>
                </div>
                <div>
                  <h3 className={`font-black text-xl tracking-tight ${f.textColor}`}>{f.title}</h3>
                  <p className={`mt-2 text-sm font-bold leading-relaxed ${f.descColor}`}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="bg-black border-y-4 border-[#FF90E8] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-5xl md:text-7xl font-black text-[#FFE600] tracking-tight leading-tight">
            SIAP MULAI<br/>
            <span className="text-[#FF90E8]">SEKARANG?</span>
          </h2>
          <p className="text-white/60 text-lg font-bold max-w-xl mx-auto">
            Tinggalkan cara lama. Gunakan sistem presensi digital yang cerdas dan terpercaya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/siswa" id="cta-siswa-btn"
              className="btn btn-yellow btn-lg border-[#FFE600] shadow-[6px_6px_0px_0px_#FF90E8] hover:shadow-[3px_3px_0px_0px_#FF90E8] flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              MULAI PRESENSI
            </Link>
            <Link href="/login" id="cta-admin-btn"
              className="btn bg-transparent text-white border-white btn-lg hover:bg-white hover:text-black">
              MASUK ADMIN →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#FFE600] border-t-4 border-black py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black border-2 border-black flex items-center justify-center">
              <svg className="w-5 h-5 text-[#FFE600]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <div className="font-black text-black tracking-tight">PRESENSI<span className="text-[#FF90E8]">.</span></div>
              <div className="text-[10px] font-bold text-black/50 tracking-widest uppercase">Platform Absensi OSIS & MPK</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-bold">
            <Link href="/siswa" className="hover:underline underline-offset-4">Portal Presensi</Link>
            <Link href="/login" className="hover:underline underline-offset-4">Admin Login</Link>
            <span className="text-black/30">|</span>
            <span className="text-black/50">© {new Date().getFullYear()} PresensiDigital</span>
          </div>
        </div>
      </footer>

    </main>
  );
}
