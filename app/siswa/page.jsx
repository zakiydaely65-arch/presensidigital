'use client';

import { useState, useEffect } from 'react';

import { SCHOOL_COORDS, SCHOOL_RADIUS } from '@/lib/constants';

export default function SiswaPage() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isAtSchool, setIsAtSchool] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [todayPresensi, setTodayPresensi] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ sandiLama: '', sandiBaru: '', konfirmasiSandi: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayPresensi = async () => {
    try {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
      const res = await fetch(`/api/presensi?startDate=${today}&endDate=${today}`);
      const data = await res.json();
      if (data.success) {
        setTodayPresensi(data.data);
      }
    } catch (error) {
      console.error('Error fetching presensi:', error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchTodayPresensi();

    let watcherId = null;
    if (navigator.geolocation) {
      watcherId = navigator.geolocation.watchPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const gpsAccuracy = Math.round(position.coords.accuracy);

          setLocation({ latitude: userLat, longitude: userLng });
          setAccuracy(gpsAccuracy);

          const dist = calculateDistance(userLat, userLng, SCHOOL_COORDS.latitude, SCHOOL_COORDS.longitude);
          setDistance(dist);
          setIsAtSchool(dist <= SCHOOL_RADIUS);
          setLocationError('');
        },
        (error) => {
          let msg = 'Gagal memverifikasi lokasi Anda.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              msg = 'Akses GPS ditolak peramban Anda.';
              break;
            case error.POSITION_UNAVAILABLE:
              msg = 'Sinyal lokasi tidak tertangkap.';
              break;
            case error.TIMEOUT:
              if (!location) msg = 'Sedang mencari lokasi Anda secara intensif...';
              break;
          }
          if (!location) setLocationError(msg);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError('Browser tidak kompatibel dengan fitur Lacak Geografi.');
    }

    return () => {
      if (watcherId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watcherId);
      }
    };
  }, []);

  const requestLocation = () => {
    setLocation(null);
    setDistance(null);
    setAccuracy(null);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const handlePresensi = async (status) => {
    if (!location) {
      setMessage({ type: 'error', text: 'Sistem tidak dapat mengkonfirmasi keberadaan Anda.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/presensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          latitude: location.latitude,
          longitude: location.longitude
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setMessage({ type: 'success', text: data.message });
      fetchTodayPresensi();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (passwordForm.sandiBaru !== passwordForm.konfirmasiSandi) {
      setPasswordMessage({ type: 'error', text: 'Konfirmasi sandi baru tidak cocok.' });
      return;
    }

    if (passwordForm.sandiBaru.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Sandi baru minimal 6 karakter.' });
      return;
    }

    setPasswordSubmitting(true);

    try {
      const res = await fetch('/api/siswa/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sandiLama: passwordForm.sandiLama,
          sandiBaru: passwordForm.sandiBaru
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setPasswordMessage({ type: 'success', text: data.message });
      setPasswordForm({ sandiLama: '', sandiBaru: '', konfirmasiSandi: '' });

      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage({ type: '', text: '' });
      }, 2000);
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      hadir: '✓',
      izin: '—',
      sakit: '+',
      pulang: '←'
    };
    return icons[status] || '•';
  };

  const getStatusBadge = (status) => {
    const badges = {
      hadir: 'badge-success',
      izin: 'badge-warning',
      sakit: 'badge-danger',
      pulang: 'badge-primary'
    };
    return badges[status] || 'badge-primary';
  };

  const hasStatus = (status) => {
    return todayPresensi.some(p => p.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 text-slate-400">
        <div className="w-10 h-10 border-[3px] border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <p className="font-bold uppercase tracking-widest text-xs">Mempersiapkan Lingkungan Kerja...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 animate-fadeIn max-w-[800px] mx-auto">
        {/* Geolocation Intelligence Panel */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-premium border border-slate-100 mb-8 relative overflow-hidden">
          {/* Decorative Grid */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] rounded-full filter blur-[2px] -mr-20 -mt-20"></div>

          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-xl font-extrabold text-primary tracking-tight">Kondisi Geografis</h2>
            <button
              onClick={requestLocation}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-primary hover:bg-slate-100 transition-colors border border-slate-200"
              title="Refresh Radar GPS"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {accuracy !== null && accuracy > 100 && (
            <div className="mb-6 p-4 bg-amber-50 rounded-2xl text-sm font-medium text-amber-800 border border-amber-200 flex items-start gap-4 shadow-sm relative z-10">
              <svg className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p>akurasi sinyal Anda tergolong lemah (±{accuracy}m). Disarankan berpindah ke tempat terbuka / outdoor agar sistem dapat mendeteksi dengan presisi.</p>
            </div>
          )}

          {locationError ? (
            <div className="flex flex-col items-center py-8 bg-rose-50 rounded-2xl border border-rose-100 relative z-10">
              <svg className="w-10 h-10 text-rose-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-rose-700 font-bold tracking-tight mb-5">{locationError}</p>
              <button onClick={requestLocation} className="btn btn-sm bg-rose-600 text-white hover:bg-rose-700 font-bold px-6">
                KALIBRASI ULANG
              </button>
            </div>
          ) : location ? (
            <div className={`p-6 rounded-2xl border-l-[6px] shadow-sm relative z-10 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between ${isAtSchool ? 'bg-white border-emerald-500 border-y border-r border-y-slate-100 border-r-slate-100' : 'bg-white border-primary border-y border-r border-y-slate-100 border-r-slate-100'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${isAtSchool ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-primary'}`}>
                  {isAtSchool ? (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  ) : (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </div>
                <div>
                  <h3 className={`text-xl font-extrabold tracking-tight ${isAtSchool ? 'text-emerald-700' : 'text-primary'}`}>
                    {isAtSchool ? 'Di Dalam Radius Sekolah' : 'Di Luar Radius Institusi'}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">
                    {distance !== null ? `Estimasi jarak: ${distance} meter dari pusat koordinat.` : 'Melakukan kalkulasi geofence...'}
                  </p>
                </div>
              </div>
              {isAtSchool && (
                <span className="badge badge-success px-4 py-2 shrink-0">AUTHORIZED</span>
              )}
              {!isAtSchool && (
                <span className="badge badge-primary px-4 py-2 shrink-0 border-slate-200">OUT OF BOUNDS</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 py-8 text-primary justify-center font-bold relative z-10">
              <div className="w-6 h-6 border-[3px] border-slate-200 border-t-primary rounded-full animate-spin"></div>
              Memindai Satelit...
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-premium border border-slate-100 relative z-20">
          <h2 className="text-xl font-extrabold text-primary mb-2 tracking-tight">Terminal Presensi</h2>
          <p className="text-slate-500 font-medium text-sm mb-6">Pilih modul log yang sesuai dengan mandat kehadiran Anda saat ini.</p>

          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message.type === 'success' ? (
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
              <span className="font-bold">{message.text}</span>
            </div>
          )}

          {isAtSchool !== null && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
              {isAtSchool ? (
                <>
                  <button
                    className={`relative flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 ${hasStatus('hadir')
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-lg focus:ring-4 focus:ring-emerald-500/20'
                      }`}
                    onClick={() => handlePresensi('hadir')}
                    disabled={submitting || hasStatus('hadir')}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div className="text-left flex flex-col items-start gap-1">
                        <span className="font-extrabold text-lg text-primary tracking-tight">Catat Masuk</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hadir Di Lokasi</span>
                      </div>
                    </div>
                    {hasStatus('hadir') && <span className="absolute top-4 right-4 text-[10px] font-black tracking-widest uppercase bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200">Logged</span>}
                  </button>

                  <button
                    className={`relative flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 ${hasStatus('pulang')
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-white border-slate-200 hover:border-primary hover:shadow-lg focus:ring-4 focus:ring-primary/20'
                      }`}
                    onClick={() => handlePresensi('pulang')}
                    disabled={submitting || hasStatus('pulang')}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      </div>
                      <div className="text-left flex flex-col gap-1 items-start">
                        <span className="font-extrabold text-lg text-primary tracking-tight">Akhiri Sesi</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pulang</span>
                      </div>
                    </div>
                    {hasStatus('pulang') && <span className="absolute top-4 right-4 text-[10px] font-black tracking-widest uppercase bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200">Logged</span>}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`relative flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 ${hasStatus('izin')
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-white border-slate-200 hover:border-accent hover:shadow-lg focus:ring-4 focus:ring-accent/20'
                      }`}
                    onClick={() => handlePresensi('izin')}
                    disabled={submitting || hasStatus('izin') || isAtSchool === null}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-accent shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div className="text-left flex flex-col gap-1 items-start">
                        <span className="font-extrabold text-lg text-primary tracking-tight">Izin Absen</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kepentingan</span>
                      </div>
                    </div>
                    {hasStatus('izin') && <span className="absolute top-4 right-4 text-[10px] font-black tracking-widest uppercase bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200">Logged</span>}
                  </button>
                  <button
                    className={`relative flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 ${hasStatus('sakit')
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-white border-slate-200 hover:border-rose-500 hover:shadow-lg focus:ring-4 focus:ring-rose-500/20'
                      }`}
                    onClick={() => handlePresensi('sakit')}
                    disabled={submitting || hasStatus('sakit') || isAtSchool === null}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      </div>
                      <div className="text-left flex flex-col gap-1 items-start">
                        <span className="font-extrabold text-lg text-primary tracking-tight">Surat Sakit</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Medis</span>
                      </div>
                    </div>
                    {hasStatus('sakit') && <span className="absolute top-4 right-4 text-[10px] font-black tracking-widest uppercase bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200">Logged</span>}
                  </button>
                </>
              )}
            </div>
          )}

          {submitting && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center z-30">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="font-bold text-primary tracking-wide">MENYINKRONKAN LOG SERVER...</p>
            </div>
          )}
        </div>

        {/* Archive / History Log */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-premium border border-slate-100">
          <h2 className="text-xl font-extrabold text-primary mb-6 flex items-center justify-between tracking-tight">
            Audit Hari Ini
            <span className="badge badge-primary">{todayPresensi.length} Data</span>
          </h2>
          {todayPresensi.length > 0 ? (
            <div className="space-y-4">
              {todayPresensi.map((p, idx) => (
                <div key={p.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-surface-muted rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-white border border-slate-200 shadow-sm ${p.status === 'hadir' ? 'text-emerald-600' : p.status === 'izin' ? 'text-accent' : p.status === 'sakit' ? 'text-rose-600' : 'text-primary'}`}>
                      {getStatusIcon(p.status)}
                    </div>
                    <div>
                      <span className={`badge mb-1.5 ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                      <div className="text-[11px] font-extrabold text-slate-400 tracking-widest uppercase flex items-center gap-2">
                        {p.waktu} • {p.isAtSchool ? 'ON-SITE' : 'OFF-SITE'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Log Kosong</p>
            </div>
          )}
        </div>

        {/* Security Settings Panel */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-premium border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-primary tracking-tight">Keamanan Akun Anda</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Ganti sandi Anda secara berkala untuk menjaga keamanan akun.</p>
          </div>
          <button
            onClick={() => {
              setShowPasswordModal(true);
              setPasswordMessage({ type: '', text: '' });
              setPasswordForm({ sandiLama: '', sandiBaru: '', konfirmasiSandi: '' });
            }}
            className="btn bg-slate-50 text-primary hover:bg-slate-100 border border-slate-200 mt-2 sm:mt-0 font-bold whitespace-nowrap w-full sm:w-auto"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            UBAH SANDI
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-md transition-all animate-fadeIn" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-white rounded-[2rem] shadow-premium w-full max-w-md overflow-hidden transform transition-all border border-slate-100 animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-7 border-b border-slate-50 flex justify-between items-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-primary"></div>
              <div>
                <h2 className="text-xl font-extrabold text-primary tracking-tight">Keamanan Akun</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Ubah Sandi Autentikasi</p>
              </div>
              <button className="text-slate-300 hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50" onClick={() => setShowPasswordModal(false)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="p-8 space-y-6">
                {user?.nama && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                      {user.nama.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identitas Siswa</p>
                      <p className="font-bold text-primary text-sm">{user.nama}</p>
                    </div>
                  </div>
                )}

                {passwordMessage.text && (
                  <div className={`alert ${passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'} p-4 rounded-2xl border flex items-center gap-3 animate-shake`}>
                    {passwordMessage.type === 'success' ? (
                      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                    <span className="font-bold text-xs">{passwordMessage.text}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Sandi Saat Ini</label>
                  <div className="relative group">
                    <input
                      type="password"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-primary placeholder:text-slate-300 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      value={passwordForm.sandiLama}
                      onChange={(e) => setPasswordForm({ ...passwordForm, sandiLama: e.target.value })}
                      required
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Sandi Baru</label>
                    <input
                      type="password"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-primary placeholder:text-slate-300 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all"
                      value={passwordForm.sandiBaru}
                      onChange={(e) => setPasswordForm({ ...passwordForm, sandiBaru: e.target.value })}
                      required
                      placeholder="Minimal 6 karakter"
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Konfirmasi Sandi Baru</label>
                    <input
                      type="password"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-primary placeholder:text-slate-300 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all"
                      value={passwordForm.konfirmasiSandi}
                      onChange={(e) => setPasswordForm({ ...passwordForm, konfirmasiSandi: e.target.value })}
                      required
                      placeholder="Ulangi sandi baru"
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center gap-3">
                <button
                  type="button"
                  className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-xs text-slate-500 hover:text-primary hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                  onClick={() => setShowPasswordModal(false)}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3.5 px-6 rounded-2xl font-black text-xs bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none uppercase tracking-widest"
                  disabled={passwordSubmitting}
                >
                  {passwordSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>MENYIMPAN...</span>
                    </div>
                  ) : 'PERBARUI SANDI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
