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

  useEffect(() => {
    fetchUser();
    requestLocation();
    fetchTodayPresensi();
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

  const requestLocation = () => {
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Browser Anda tidak mendukung Geolocation');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const gpsAccuracy = Math.round(position.coords.accuracy);

        setLocation({ latitude: userLat, longitude: userLng });
        setAccuracy(gpsAccuracy);

        // Calculate distance using Haversine formula
        const dist = calculateDistance(userLat, userLng, SCHOOL_COORDS.latitude, SCHOOL_COORDS.longitude);
        setDistance(dist);
        setIsAtSchool(dist <= SCHOOL_RADIUS);
      },
      (error) => {
        let msg = 'Gagal mendapatkan lokasi';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Akses lokasi ditolak. Mohon izinkan akses lokasi di browser Anda.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Informasi lokasi tidak tersedia.';
            break;
          case error.TIMEOUT:
            msg = 'Waktu permintaan lokasi habis.';
            break;
        }
        setLocationError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
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
      setMessage({ type: 'error', text: 'Lokasi belum terdeteksi' });
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

  const getStatusIcon = (status) => {
    const icons = {
      hadir: '✓',
      izin: '📄',
      sakit: '🏥',
      pulang: '🏠'
    };
    return icons[status] || '?';
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

  const hasStatus = (status) => {
    return todayPresensi.some(p => p.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-500">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="font-medium animate-pulse">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Status Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Status Lokasi</h2>
          <button
            onClick={requestLocation}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
            title="Perbarui Lokasi"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Debug Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs font-mono text-gray-600 border border-gray-200">
          <details>
            <summary className="cursor-pointer font-bold text-indigo-600 mb-1">Debug Info (Klik untuk isi)</summary>
            <div className="space-y-1 pl-2 mt-2">
              <p>User Lat: {location?.latitude || '-'}</p>
              <p>User Lng: {location?.longitude || '-'}</p>
              <p>GPS Accuracy: {accuracy !== null ? `±${accuracy} meters` : '-'}</p>
              <div className="h-px bg-gray-300 my-1"></div>
              <p>School Lat: {SCHOOL_COORDS.latitude}</p>
              <p>School Lng: {SCHOOL_COORDS.longitude}</p>
              <div className="h-px bg-gray-300 my-1"></div>
              <p>Distance: {distance} meters</p>
              <p>Max Radius: {SCHOOL_RADIUS} meters</p>
              <p>Status: {isAtSchool ? 'INSIDE' : 'OUTSIDE'}</p>
            </div>
          </details>
        </div>

        {/* Low accuracy warning */}
        {accuracy !== null && accuracy > 100 && (
          <div className="mb-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-700 border border-amber-200 flex items-center gap-2">
            <span>⚠️</span>
            <span>Akurasi GPS rendah (±{accuracy}m). Hasil lokasi mungkin tidak akurat. Coba buka di area terbuka atau gunakan HP dengan GPS aktif.</span>
          </div>
        )}

        {locationError ? (
          <div className="text-center py-6 bg-red-50 rounded-xl border border-red-100">
            <div className="text-3xl mb-2">⚠️</div>
            <p className="text-red-600 mb-4">{locationError}</p>
            <button onClick={requestLocation} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
              Coba Lagi
            </button>
          </div>
        ) : location ? (
          <div className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-colors ${isAtSchool
            ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
            : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'
            }`}>
            <div className="text-4xl">
              {isAtSchool ? '📍' : '🏠'}
            </div>
            <div>
              <div className={`font-bold text-lg ${isAtSchool ? 'text-green-800' : 'text-yellow-800'}`}>
                {isAtSchool ? 'Di Area Sekolah' : 'Di Luar Sekolah'}
              </div>
              <div className={`text-sm ${isAtSchool ? 'text-green-600' : 'text-yellow-600'}`}>
                {distance !== null ? `${distance} meter dari sekolah` : 'Menghitung...'}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-gray-500 gap-3">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            <p>Mendeteksi lokasi...</p>
          </div>
        )}
      </div>

      {/* Attendance Buttons */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Pilih Status Presensi</h2>

        {message.text && (
          <div className={`p-4 rounded-xl border mb-4 flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
            }`}>
            {message.text}
          </div>
        )}

        {isAtSchool !== null && (
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <p className="text-gray-600 text-sm">
              {isAtSchool ? (
                <>Anda berada di sekolah. Pilih <strong className="text-gray-900">Hadir</strong> atau <strong className="text-gray-900">Pulang</strong>.</>
              ) : (
                <>Anda di luar sekolah. Pilih <strong className="text-gray-900">Izin</strong> atau <strong className="text-gray-900">Sakit</strong>.</>
              )}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isAtSchool ? (
            <>
              <button
                className={`group relative flex flex-col items-center gap-3 p-8 rounded-2xl border-2 transition-all duration-300 ${hasStatus('hadir')
                  ? 'bg-green-50 border-green-200 opacity-60 cursor-not-allowed'
                  : 'bg-white border-green-100 hover:border-green-500 hover:shadow-lg hover:-translate-y-1'
                  }`}
                onClick={() => handlePresensi('hadir')}
                disabled={submitting || hasStatus('hadir')}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">✓</span>
                <span className="font-bold text-lg text-gray-700 group-hover:text-green-600">Hadir</span>
                {hasStatus('hadir') && (
                  <span className="absolute top-3 right-3 bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded">SUDAH</span>
                )}
              </button>
              <button
                className={`group relative flex flex-col items-center gap-3 p-8 rounded-2xl border-2 transition-all duration-300 ${hasStatus('pulang')
                  ? 'bg-blue-50 border-blue-200 opacity-60 cursor-not-allowed'
                  : 'bg-white border-blue-100 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1'
                  }`}
                onClick={() => handlePresensi('pulang')}
                disabled={submitting || hasStatus('pulang')}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🏠</span>
                <span className="font-bold text-lg text-gray-700 group-hover:text-blue-600">Pulang</span>
                {hasStatus('pulang') && (
                  <span className="absolute top-3 right-3 bg-blue-200 text-blue-800 text-xs font-bold px-2 py-1 rounded">SUDAH</span>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                className={`group relative flex flex-col items-center gap-3 p-8 rounded-2xl border-2 transition-all duration-300 ${hasStatus('izin')
                  ? 'bg-yellow-50 border-yellow-200 opacity-60 cursor-not-allowed'
                  : 'bg-white border-yellow-100 hover:border-yellow-500 hover:shadow-lg hover:-translate-y-1'
                  }`}
                onClick={() => handlePresensi('izin')}
                disabled={submitting || hasStatus('izin') || isAtSchool === null}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">📄</span>
                <span className="font-bold text-lg text-gray-700 group-hover:text-yellow-600">Izin</span>
                {hasStatus('izin') && (
                  <span className="absolute top-3 right-3 bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-1 rounded">SUDAH</span>
                )}
              </button>
              <button
                className={`group relative flex flex-col items-center gap-3 p-8 rounded-2xl border-2 transition-all duration-300 ${hasStatus('sakit')
                  ? 'bg-red-50 border-red-200 opacity-60 cursor-not-allowed'
                  : 'bg-white border-red-100 hover:border-red-500 hover:shadow-lg hover:-translate-y-1'
                  }`}
                onClick={() => handlePresensi('sakit')}
                disabled={submitting || hasStatus('sakit') || isAtSchool === null}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🏥</span>
                <span className="font-bold text-lg text-gray-700 group-hover:text-red-600">Sakit</span>
                {hasStatus('sakit') && (
                  <span className="absolute top-3 right-3 bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded">SUDAH</span>
                )}
              </button>
            </>
          )}
        </div>

        {submitting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-primary">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
            <p className="font-bold animate-pulse">Menyimpan presensi...</p>
          </div>
        )}
      </div>

      {/* Today's History */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Riwayat Hari Ini</h2>
        {todayPresensi.length > 0 ? (
          <div className="space-y-3">
            {todayPresensi.map((p, idx) => (
              <div key={p.id || idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-2xl">{getStatusIcon(p.status)}</div>
                <div className="flex-1">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(p.status)}`}>
                    {p.status}
                  </span>
                  <div className="text-sm text-gray-500 mt-1">{p.waktu}</div>
                </div>
                <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  {p.isAtSchool ? '📍 Sekolah' : '🏠 Luar'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p>Belum ada presensi hari ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
