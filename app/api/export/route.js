import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { readExcel } from '@/lib/excel';
import { getUserFromRequest } from '@/lib/auth';
import { DATA_FILES } from '@/lib/constants';

// GET - Export attendance data to Excel
export async function GET(request) {
    try {
        const user = await getUserFromRequest(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Akses ditolak' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'presensi' or 'siswa'
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const organisasi = searchParams.get('organisasi');

        let dataToExport = [];
        let filename = '';
        const sheetName = type === 'siswa' ? 'Data Siswa' : 'Data Presensi';

        if (type === 'siswa') {
            // Export Student Data (including credentials)
            let siswaList = readExcel(DATA_FILES.SISWA);

            if (organisasi) {
                siswaList = siswaList.filter(s => s.organisasi === organisasi);
            }

            dataToExport = siswaList.map(s => ({
                'Nama Lengkap': s.nama,
                'Kelas': s.kelas,
                'Organisasi': s.organisasi,
                'Kode Login': s.kode,
                'Kata Sandi': s.sandiPlain || '-' // Export plain password
            }));

            // Sort by Class then Name
            dataToExport.sort((a, b) => {
                if (a['Kelas'] === b['Kelas']) {
                    return a['Nama Lengkap'].localeCompare(b['Nama Lengkap']);
                }
                return a['Kelas'].localeCompare(b['Kelas']);
            });

            filename = `data_siswa_${organisasi || 'semua'}.xlsx`;

        } else {
            // Export Attendance Data (Default)
            let presensi = readExcel(DATA_FILES.PRESENSI);
            const siswaList = readExcel(DATA_FILES.SISWA);

            // Filter by date range
            if (startDate && endDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                presensi = presensi.filter(p => {
                    const date = new Date(p.tanggal);
                    return date >= start && date <= end;
                });
            }

            // Filter by organization
            if (organisasi) {
                const siswaIds = siswaList
                    .filter(s => s.organisasi === organisasi)
                    .map(s => s.id);
                presensi = presensi.filter(p => siswaIds.includes(p.siswaId));
            }

            // Filter by status
            const status = searchParams.get('status');
            if (status && status !== 'semua') {
                presensi = presensi.filter(p => p.status === status);
            }

            // Prepare data for export
            dataToExport = presensi.map(p => {
                const siswa = siswaList.find(s => s.id === p.siswaId);
                return {
                    'Tanggal': new Date(p.tanggal).toLocaleDateString('id-ID'),
                    'Waktu': p.waktu,
                    'Nama': siswa?.nama || 'Unknown',
                    'Kelas': siswa?.kelas || 'Unknown',
                    'Jabatan': siswa?.jabatan || 'Unknown',
                    'Organisasi': siswa?.organisasi || 'Unknown',
                    'Status': p.status.toUpperCase(),
                    'Lokasi': p.isAtSchool ? 'Di Sekolah' : 'Luar Sekolah'
                };
            });

            // Sort by date
            dataToExport.sort((a, b) => new Date(b['Tanggal']) - new Date(a['Tanggal']));

            // Use the outer variable, do NOT declare const, just assign
            filename = `presensi_${organisasi || 'semua'}_${startDate || 'all'}_${endDate || 'all'}.xlsx`;
        }

        // Create workbook
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Set column widths
        worksheet['!cols'] = [
            { wch: 12 }, // Tanggal
            { wch: 10 }, // Waktu
            { wch: 25 }, // Nama
            { wch: 10 }, // Kelas
            { wch: 20 }, // Jabatan
            { wch: 10 }, // Organisasi
            { wch: 10 }, // Status
            { wch: 15 }  // Lokasi
        ];

        // Generate buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
