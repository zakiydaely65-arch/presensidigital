'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [kode, setKode] = useState('');
  const [sandi, setSandi] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-primary bg-surface-muted bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] selection:bg-accent selection:text-white">
      {/* Left Banner */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary text-white p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md mb-8 border border-white/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 leading-tight">Sistem Presensi Digital<br /><span className="text-accent-light">OSIS & MPK</span></h1>
          <p className="text-slate-400 text-lg max-w-md font-medium">Platform modern untuk pencatatan kehadiran yang akurat, cepat, dan profesional.</p>
        </div>

        <div className="relative z-10">
          <p className="text-slate-500 font-medium text-sm">© {(new Date()).getFullYear()} OSIS & MPK. All rights reserved.</p>
        </div>

        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-accent rounded-full opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent-light rounded-full opacity-10 blur-3xl mix-blend-screen pointer-events-none"></div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2rem] shadow-premium border border-slate-100">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Selamat Datang 👋</h2>
            <p className="text-slate-500 font-medium text-sm">Silakan masuk dengan kredensial Anda.</p>
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
                placeholder="Misal: OSIS001"
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
              className="w-full btn btn-primary py-3.5 mt-4 text-base"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                'Masuk ke Akun'
              )}
            </button>
          </form>

          <div className="mt-8 text-center lg:text-left">
            <p className="text-xs text-slate-400 font-medium">Mengalami kendala? Silakan hubungi admin sistem.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
