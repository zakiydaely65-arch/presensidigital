# Presensi Digital OSIS & MPK

Sistem presensi digital untuk anggota OSIS dan MPK dengan fitur deteksi lokasi.

## Fitur

### Admin
- ✅ Dashboard dengan statistik presensi
- ✅ Manajemen data siswa (CRUD)
- ✅ Generate kredensial otomatis
- ✅ Lihat data presensi dengan filter (harian/mingguan/bulanan)
- ✅ Filter berdasarkan organisasi (OSIS/MPK)
- ✅ Export data ke Excel

### Siswa
- ✅ Login dengan kode & sandi
- ✅ Deteksi lokasi otomatis
- ✅ Presensi berbasis lokasi:
  - Di sekolah: Hadir / Pulang
  - Di luar sekolah: Izin / Sakit
- ✅ Riwayat presensi hari ini

## Teknologi

- **Framework**: Next.js 14
- **Data Storage**: Excel (xlsx)
- **Geolocation**: Browser Geolocation API
- **Authentication**: JWT

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Jalankan development server:
```bash
npm run dev
```

3. Buka http://localhost:3000

## Login

### Admin
- Kode: `admin`
- Sandi: `admin123`

### Siswa
- Gunakan kredensial yang dibuatkan oleh admin

## Konfigurasi Lokasi Sekolah

Lokasi sekolah dikonfigurasi di file `lib/constants.js`:
```javascript
export const SCHOOL_COORDS = {
  latitude: -7.042300,
  longitude: 110.512100
};

export const SCHOOL_RADIUS = 100; // meter
```

## Struktur Data

Data disimpan dalam format Excel di folder `data/`:
- `siswa.xlsx` - Data siswa
- `presensi.xlsx` - Data presensi
