'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SiswaLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [time, setTime] = useState('');

  useEffect(() => {
    fetchUser();
    // Live clock
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Jakarta' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) setUser(data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#FFE600] pb-8">
      {/* Ticker tape top bar */}
      <div className="bg-black text-[#FFE600] overflow-hidden h-8 flex items-center border-b-2 border-black">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array(6).fill('★ SISTEM PRESENSI DIGITAL ★ OSIS & MPK ★ CATAT KEHADIRANMU SEKARANG ★ REAL-TIME GPS TRACKING ★ ').map((t, i) => (
            <span key={i} className="text-xs font-bold tracking-[0.3em] uppercase pr-8">{t}</span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b-4 border-black sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#FF90E8]">
              <svg className="w-5 h-5 text-[#FFE600]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <div className="font-black text-black text-sm tracking-tight leading-none">
                {user?.nama ? `HALO, ${user.nama.split(' ')[0].toUpperCase()}!` : 'MEMUAT...'}
              </div>
              <div className="text-[10px] font-bold text-black/50 tracking-widest uppercase">
                {user?.organisasi || '—'} · {user?.kelas || '—'}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Live clock */}
            <div className="hidden md:flex items-center gap-2 bg-black text-[#FFE600] px-3 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_#FF90E8] font-mono text-sm font-bold">
              <span className="w-2 h-2 bg-[#00FF94] rounded-full animate-pulse" />
              {time}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              id="logout-btn"
              className="btn btn-sm bg-black text-[#FFE600] border-black"
              title="Keluar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">KELUAR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 mt-2">
        {children}
      </main>
    </div>
  );
}
