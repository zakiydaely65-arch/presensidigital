import './globals.css';

export const metadata = {
    title: 'Presensi Digital OSIS & MPK',
    description: 'Sistem Presensi Digital untuk Anggota OSIS dan MPK',
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({ children }) {
    return (
        <html lang="id">
            <body>
                {children}
            </body>
        </html>
    );
}
