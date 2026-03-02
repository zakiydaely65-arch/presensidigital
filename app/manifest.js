export default function manifest() {
  return {
    name: 'Presensi Digital OSIS & MPK',
    short_name: 'Presensi',
    description: 'Sistem Presensi Digital untuk Anggota OSIS dan MPK',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
