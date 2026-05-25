'use client';

import { useState, useEffect } from 'react';
import { SCHOOL_COORDS, SCHOOL_RADIUS } from '@/lib/constants';
import { useToast } from '@/components/Toast';

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
  const { showToast, ToastContainer } = useToast();

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) setUser(data.user);
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
      if (data.success) setTodayPresensi(data.data);
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
            case error.PERMISSION_DENIED: msg = 'Akses GPS ditolak peramban Anda.'; break;
            case error.POSITION_UNAVAILABLE: msg = 'Sinyal lokasi tidak tertangkap.'; break;
            case error.TIMEOUT: if (!location) msg = 'Sedang mencari lokasi Anda...'; break;
          }
          if (!location) setLocationError(msg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError('Browser tidak kompatibel dengan fitur Lacak Geografi.');
    }

    return () => {
      if (watcherId !== null && navigator.geolocation)
        navigator.geolocation.clearWatch(watcherId);
    };
  }, []);

  const requestLocation = () => {
    setLocation(null); setDistance(null); setAccuracy(null);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return Math.round(6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const handlePresensi = async (status) => {
    if (!location) { setMessage({ type: 'error', text: 'Sistem tidak dapat mengkonfirmasi lokasi Anda.' }); showToast('Sistem tidak dapat mengkonfirmasi lokasi Anda.', 'error'); return; }
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/presensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, latitude: location.latitude, longitude: location.longitude })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: data.message });
      showToast(data.message, 'success');
      fetchTodayPresensi();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      showToast(err.message || 'Gagal mencatat presensi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });
    if (passwordForm.sandiBaru !== passwordForm.konfirmasiSandi) {
      setPasswordMessage({ type: 'error', text: 'Konfirmasi sandi baru tidak cocok.' }); return;
    }
    if (passwordForm.sandiBaru.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Sandi baru minimal 6 karakter.' }); return;
    }
    setPasswordSubmitting(true);
    try {
      const res = await fetch('/api/siswa/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sandiLama: passwordForm.sandiLama, sandiBaru: passwordForm.sandiBaru })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPasswordMessage({ type: 'success', text: data.message });
      showToast(data.message || 'Kata sandi berhasil diperbarui.', 'success');
      setPasswordForm({ sandiLama: '', sandiBaru: '', konfirmasiSandi: '' });
      setTimeout(() => { setShowPasswordModal(false); setPasswordMessage({ type: '', text: '' }); }, 2000);
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message });
      showToast(err.message || 'Gagal memperbarui kata sandi.', 'error');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      hadir: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
      hadir_luar_radius: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>,
      izin: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      sakit: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      pulang: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    };
    return icons[status] || <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/></svg>;
  };
  const getStatusBadge = (status) => ({ hadir: 'badge-success', hadir_luar_radius: 'badge-warning', izin: 'badge-warning', sakit: 'badge-danger', pulang: 'badge-primary' }[status] || 'badge-primary');
  const hasStatus = (status) => todayPresensi.some(p => p.status === status);
  const alreadyTidakHadir = hasStatus('izin') || hasStatus('sakit');

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-black border-t-[#FF90E8] animate-spin" />
        <p className="font-black uppercase tracking-[0.3em] text-xs text-black">MEMUAT SISTEM...</p>
      </div>
    );
  }

  const ActionButton = ({ label, sub, icon, color, bgColor, textColor, onClick, disabled, logged, id }) => (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col gap-3 p-6 border-2 border-black transition-all duration-150 text-left
        ${logged || disabled
          ? 'opacity-50 cursor-not-allowed shadow-[3px_3px_0px_0px_#000] translate-x-0 translate-y-0'
          : `shadow-[5px_5px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none`
        }
        ${bgColor || 'bg-white'}`}
    >
      <div className={`w-12 h-12 border-2 border-black flex items-center justify-center ${color || 'bg-[#FFE600]'}`}>
        {icon}
      </div>
      <div>
        <div className={`font-black text-lg tracking-tight ${textColor || 'text-black'}`}>{label}</div>
        <div className="text-xs font-bold text-black/50 tracking-[0.2em] uppercase">{sub}</div>
      </div>
      {logged && (
        <span className="absolute top-3 right-3 bg-[#00FF94] border-2 border-black text-black text-[9px] font-black px-2 py-0.5 tracking-widest uppercase shadow-[2px_2px_0px_0px_#000] flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> LOGGED
        </span>
      )}
    </button>
  );

  return (
    <>
      <ToastContainer />
      <div className="space-y-6 animate-fadeIn">

        {/* === GPS PANEL === */}
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000]">
          {/* Header strip */}
          <div className="bg-black text-[#FFE600] px-6 py-3 flex items-center justify-between border-b-2 border-black">
            <span className="font-black text-xs tracking-[0.3em] uppercase flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
              Status Geolokasi GPS
            </span>
            <button
              onClick={requestLocation}
              className="w-8 h-8 bg-[#FF90E8] border-2 border-[#FFE600] flex items-center justify-center hover:bg-[#FFE600] transition-colors"
              title="Refresh GPS"
            >
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {accuracy !== null && accuracy > 100 && (
              <div className="mb-4 p-4 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex gap-3 items-start">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-sm font-bold">Akurasi sinyal lemah (±{accuracy}m). Pindah ke area terbuka untuk sinyal lebih kuat.</p>
              </div>
            )}

            {locationError ? (
              <div className="flex flex-col items-center py-10 gap-4">
                <svg className="w-14 h-14 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                <p className="text-red-600 font-black text-center tracking-tight">{locationError}</p>
                <button onClick={requestLocation} className="btn btn-danger">KALIBRASI ULANG</button>
              </div>
            ) : location ? (
              <div className={`p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between
                ${isAtSchool ? 'bg-[#00FF94]' : 'bg-[#FF90E8]'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-black border-2 border-black flex items-center justify-center shrink-0">
                    {isAtSchool ? (
                      <svg className="w-7 h-7 text-[#00FF94]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-7 h-7 text-[#FFE600]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">
                      {isAtSchool ? 'DALAM RADIUS SEKOLAH' : 'DI LUAR RADIUS'}
                    </h3>
                    <p className="text-sm font-bold text-black/70">
                      {distance !== null ? `Jarak: ${distance}m dari sekolah` : 'Menghitung jarak...'}
                    </p>
                  </div>
                </div>
                <span className={`badge ${isAtSchool ? 'badge-success' : 'badge-accent'} shrink-0`}>
                  {isAtSchool ? 'AUTHORIZED ✓' : 'OUT OF ZONE'}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4 py-10">
                <div className="w-6 h-6 border-[3px] border-black border-t-[#FF90E8] animate-spin" />
                <span className="font-black uppercase tracking-[0.2em] text-sm">MEMINDAI SATELIT...</span>
              </div>
            )}
          </div>
        </div>

        {/* === ACTION PANEL === */}
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000]">
          <div className="bg-black text-[#FF90E8] px-6 py-3 border-b-2 border-black">
            <span className="font-black text-xs tracking-[0.3em] uppercase flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Terminal Presensi
            </span>
          </div>

          <div className="p-6">
            <p className="text-sm font-bold text-black/60 uppercase tracking-widest mb-6">
              Pilih status kehadiran Anda hari ini
            </p>

            {message.text && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6 flex items-center gap-2`}>
                {message.type === 'success'
                  ? <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  : <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                }
                {message.text}
              </div>
            )}

            {isAtSchool !== null && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isAtSchool ? (
                  <>
                    <ActionButton id="btn-hadir" label="Catat Masuk" sub="Hadir Di Lokasi"
                      icon={<svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      color="bg-[#00FF94]" bgColor="bg-white"
                      onClick={() => handlePresensi('hadir')}
                      disabled={submitting || hasStatus('hadir') || hasStatus('hadir_luar_radius')}
                      logged={hasStatus('hadir') || hasStatus('hadir_luar_radius')} />
                    <ActionButton id="btn-pulang" label="Akhiri Sesi" sub="Pulang"
                      icon={<svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>}
                      color="bg-black" bgColor="bg-white"
                      onClick={() => handlePresensi('pulang')}
                      disabled={submitting || hasStatus('pulang')}
                      logged={hasStatus('pulang')} />
                  </>
                ) : (
                  <>
                    <ActionButton id="btn-hadir-luar" label="Hadir Off-Site" sub="Luar Radius"
                      icon={<svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                      color="bg-[#FFE600]" bgColor="bg-white"
                      onClick={() => handlePresensi('hadir_luar_radius')}
                      disabled={submitting || hasStatus('hadir_luar_radius') || hasStatus('hadir') || isAtSchool === null}
                      logged={hasStatus('hadir_luar_radius') || hasStatus('hadir')} />
                    <ActionButton id="btn-izin" label="Izin Absen" sub="Kepentingan"
                      icon={<svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                      color="bg-[#FF90E8]" bgColor="bg-white"
                      onClick={() => handlePresensi('izin')}
                      disabled={submitting || alreadyTidakHadir || isAtSchool === null}
                      logged={alreadyTidakHadir} />
                    <ActionButton id="btn-sakit" label="Surat Sakit" sub="Medis"
                      icon={<svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      color="bg-[#FF3333]" bgColor="bg-white"
                      onClick={() => handlePresensi('sakit')}
                      disabled={submitting || alreadyTidakHadir || isAtSchool === null}
                      logged={alreadyTidakHadir} />
                  </>
                )}
              </div>
            )}

            {submitting && (
              <div className="mt-4 p-4 bg-[#FFE600] border-2 border-black flex items-center gap-4 shadow-[4px_4px_0px_0px_#000]">
                <div className="w-6 h-6 border-4 border-black border-t-[#FF90E8] animate-spin shrink-0" />
                <p className="font-black uppercase tracking-[0.2em] text-sm">MENYINKRONKAN DATA KE SERVER...</p>
              </div>
            )}
          </div>
        </div>

        {/* === HISTORY LOG === */}
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000]">
          <div className="bg-[#FF90E8] border-b-2 border-black px-6 py-3 flex items-center justify-between">
            <span className="font-black text-xs tracking-[0.3em] uppercase text-black flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              Log Audit Hari Ini
            </span>
            <span className="badge badge-primary">{todayPresensi.length} ENTRI</span>
          </div>

          <div className="p-6">
            {todayPresensi.length > 0 ? (
              <div className="space-y-3">
                {todayPresensi.map((p, idx) => (
                  <div key={p.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-2 border-black bg-[#FFE600] shadow-[3px_3px_0px_0px_#000]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black border-2 border-black flex items-center justify-center text-xl text-[#FFE600] font-black shrink-0">
                        {getStatusIcon(p.status)}
                      </div>
                      <div>
                        <span className={`badge mb-1 ${getStatusBadge(p.status)}`}>
                          {p.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <div className="text-[11px] font-bold text-black/60 tracking-widest uppercase">
                          {p.waktu} · {p.isAtSchool ? 'ON-SITE' : `OFF-SITE ${p.jarak ? `(${Math.round(p.jarak)}m)` : ''}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <svg className="w-16 h-16 text-black/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <p className="font-black text-black/50 uppercase tracking-[0.3em] text-sm">LOG KOSONG HARI INI</p>
              </div>
            )}
          </div>
        </div>

        {/* === SECURITY PANEL === */}
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="font-black text-black text-lg tracking-tight flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Keamanan Akun
            </div>
            <div className="text-sm font-bold text-black/60 mt-1">Ganti kata sandi Anda secara berkala.</div>
          </div>
          <button
            id="change-password-btn"
            onClick={() => { setShowPasswordModal(true); setPasswordMessage({ type: '', text: '' }); setPasswordForm({ sandiLama: '', sandiBaru: '', konfirmasiSandi: '' }); }}
            className="btn btn-accent whitespace-nowrap flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            UBAH SANDI
          </button>
        </div>
      </div>

      {/* === CHANGE PASSWORD MODAL === */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/70 animate-fadeIn"
          onClick={() => setShowPasswordModal(false)}>
          <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#FF90E8] w-full max-w-md animate-slideUp"
            onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className="bg-black text-[#FFE600] px-6 py-4 flex justify-between items-center border-b-2 border-black">
              <div>
                <div className="font-black tracking-tight">UBAH KATA SANDI</div>
                <div className="text-[10px] font-bold text-[#FF90E8] tracking-[0.3em] uppercase mt-0.5">Keamanan Akun</div>
              </div>
              <button className="w-8 h-8 bg-[#FF3333] border-2 border-[#FFE600] flex items-center justify-center hover:bg-[#FF90E8] text-white transition-colors"
                onClick={() => setShowPasswordModal(false)}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="p-6 space-y-5">
                {user?.nama && (
                  <div className="flex items-center gap-3 p-3 border-2 border-black bg-[#FFE600] shadow-[3px_3px_0px_0px_#000]">
                    <div className="w-10 h-10 bg-black border-2 border-black flex items-center justify-center text-[#FFE600] font-black text-sm">
                      {user.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-black/50 tracking-widest uppercase">Identitas</div>
                      <div className="font-black text-black text-sm">{user.nama}</div>
                    </div>
                  </div>
                )}

                {passwordMessage.text && (
                  <div className={`alert ${passwordMessage.type === 'success' ? 'alert-success' : 'alert-error'} animate-shake`}>
                    {passwordMessage.text}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Sandi Saat Ini</label>
                  <input type="password" className="input" placeholder="••••••••"
                    value={passwordForm.sandiLama} onChange={(e) => setPasswordForm({ ...passwordForm, sandiLama: e.target.value })}
                    required minLength={6} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sandi Baru</label>
                  <input type="password" className="input" placeholder="Minimal 6 karakter"
                    value={passwordForm.sandiBaru} onChange={(e) => setPasswordForm({ ...passwordForm, sandiBaru: e.target.value })}
                    required minLength={6} />
                </div>
                <div className="form-group">
                  <label className="form-label">Konfirmasi Sandi Baru</label>
                  <input type="password" className="input" placeholder="Ulangi sandi baru"
                    value={passwordForm.konfirmasiSandi} onChange={(e) => setPasswordForm({ ...passwordForm, konfirmasiSandi: e.target.value })}
                    required minLength={6} />
                </div>
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowPasswordModal(false)}>BATAL</button>
                <button type="submit" className="btn btn-primary flex-[2]" disabled={passwordSubmitting}>
                  {passwordSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-[#FFE600] border-t-transparent animate-spin" /> MENYIMPAN...</>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                      PERBARUI SANDI
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
