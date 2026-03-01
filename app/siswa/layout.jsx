'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SiswaLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-surface-muted pb-20 md:pb-0">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50 h-20 flex items-center px-4 md:px-8">
        <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="font-extrabold text-primary text-xl tracking-tight leading-none">
                Presensi. <span className="text-accent ml-1">{user?.nama ? `Halo, ${user.nama.split(' ')[0]}!` : ''}</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                {user?.organisasi || 'MEMUAT...'} <span className="text-primary">•</span> {user?.kelas || ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {user && (
              <>
                <div className="hidden md:block text-right">
                  <div className="font-bold text-primary text-sm tracking-wide">{user.nama}</div>
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">{user.kelas}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-colors border border-slate-200 hover:border-rose-200"
                  title="Keluar"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 mt-4">
        {children}
      </main>
    </div>
  );
}
