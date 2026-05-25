'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const [kode, setKode] = useState('');
  const [sandi, setSandi] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast, ToastContainer } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kode, sandi })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login gagal');
      }

      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/siswa');
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message || 'Login gagal. Periksa kode dan sandi Anda.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#FFE600]">
      {/* Marquee ticker tape */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-black text-[#FFE600] overflow-hidden h-8 flex items-center border-b-2 border-black">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array(6).fill('★ PRESENSI DIGITAL ★ OSIS & MPK ★ SISTEM ABSENSI MODERN ★ LOGIN UNTUK AKSES ★ ').map((t, i) => (
            <span key={i} className="text-xs font-bold tracking-[0.3em] uppercase pr-8">{t}</span>
          ))}
        </div>
      </div>

      {/* Left — Giant Brand Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-black text-white p-12 relative overflow-hidden pt-16">
        {/* Big decorative number */}
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-[22rem] font-black text-white/5 select-none leading-none font-mono">
          01
        </div>

        {/* Pink accent block */}
        <div className="absolute top-16 right-0 w-2 h-40 bg-[#FF90E8]" />
        <div className="absolute bottom-32 left-12 w-20 h-2 bg-[#FFE600]" />

        <div className="relative z-10 mt-8">
          {/* Logo */}
          <div className="inline-flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-[#FFE600] border-2 border-white flex items-center justify-center shadow-[4px_4px_0px_0px_#FF90E8]">
              <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold tracking-[0.4em] text-white/50 uppercase mb-1">Sistem</div>
              <div className="text-2xl font-black tracking-tight">PRESENSI<span className="text-[#FF90E8]">.</span></div>
            </div>
          </div>

          <h1 className="text-6xl font-black leading-[1.0] tracking-tight mb-8">
            MASUK<br/>
            <span className="text-[#FFE600]">KE</span><br/>
            SISTEM
          </h1>

          <p className="text-white/60 text-lg max-w-sm font-medium leading-relaxed">
            Platform presensi digital generasi baru untuk OSIS & MPK. Terverifikasi geolokasi real-time.
          </p>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { val: '100%', label: 'Digital' },
            { val: '<2s', label: 'Respons' },
            { val: 'GPS', label: 'Verified' },
          ].map((s) => (
            <div key={s.label} className="border-2 border-white/20 p-4">
              <div className="text-2xl font-black text-[#FFE600] font-mono">{s.val}</div>
              <div className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative pt-16">
        {/* Decorative squares */}
        <div className="absolute top-20 right-8 w-16 h-16 bg-[#FF90E8] border-2 border-black shadow-[4px_4px_0px_0px_#000] hidden lg:block" />
        <div className="absolute bottom-16 left-8 w-10 h-10 bg-black hidden lg:block" />

        <div className="w-full max-w-md">
          {/* Form header */}
          <div className="mb-10">
            <div className="inline-block bg-black text-[#FFE600] text-xs font-black px-4 py-2 tracking-[0.3em] uppercase mb-6 shadow-[4px_4px_0px_0px_#FF90E8]">
              PORTAL AUTENTIKASI
            </div>
            <h2 className="text-4xl font-black text-black tracking-tight leading-tight">
              SELAMAT<br/>DATANG
            </h2>
            <p className="text-black/60 font-bold mt-3">Masuk dengan kredensial Anda untuk melanjutkan.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="alert alert-error">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="kode" className="form-label">Kode Akses</label>
              <input
                id="kode"
                type="text"
                className="input"
                placeholder="Contoh: OSIS001"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sandi" className="form-label">Kata Sandi</label>
              <input
                id="sandi"
                type="password"
                className="input"
                placeholder="••••••••"
                value={sandi}
                onChange={(e) => setSandi(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-submit"
              className="w-full btn btn-primary py-4 text-base mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  MEMPROSES...
                </>
              ) : (
                <>
                  MASUK KE SISTEM
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
            <p className="text-xs font-bold text-black/60 uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Mengalami kendala? Hubungi admin sistem Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
