import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

// GET - Export data to Excel
export const dynamic = 'force-dynamic';
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
        const status = searchParams.get('status');

        let dataToExport = [];
        let filename = '';
        const sheetName = type === 'siswa' ? 'Data Siswa' : 'Data Presensi';

        if (type === 'siswa') {
            let query = supabase.from('siswa').select('*').order('kelas', { ascending: true });

            if (organisasi) {
                query = query.eq('organisasi', organisasi);
            }

            const { data: siswaList, error } = await query;
            if (error) throw error;

            dataToExport = siswaList.map(s => ({
                'Nama Lengkap': s.nama,
                'Kelas': s.kelas,
                'Organisasi': s.organisasi,
                'Kode Login': s.kode,
                'Kata Sandi': s.sandi_plain || '-'
            }));

            filename = `data_siswa_${organisasi || 'semua'}.xlsx`;

        } else {
            let query = supabase
                .from('presensi')
                .select('*, siswa(*)')
                .order('tanggal', { ascending: false })
                .order('waktu', { ascending: false });

            // Filter by date range
            if (startDate && endDate) {
                query = query.gte('tanggal', startDate).lte('tanggal', endDate);
            }

            // Filter by status
            if (status && status !== 'semua') {
                query = query.eq('status', status);
            }

            const { data: presensi, error } = await query;
            if (error) throw error;

            // Filter by organization on the client side if necessary (Supabase join filtering can be limited)
            let filteredPresensi = presensi;
            if (organisasi) {
                filteredPresensi = presensi.filter(p => p.siswa?.organisasi === organisasi);
            }

            dataToExport = filteredPresensi.map(p => ({
                'Tanggal': p.tanggal, // DB uses date format YYYY-MM-DD
                'Waktu': p.waktu,
                'Nama': p.siswa?.nama || 'Unknown',
                'Kelas': p.siswa?.kelas || 'Unknown',
                'Organisasi': p.siswa?.organisasi || 'Unknown',
                'Status': p.status.toUpperCase(),
                'Lokasi': p.is_at_school ? 'Di Sekolah' : 'Luar Sekolah'
            }));

            filename = `presensi_${organisasi || 'semua'}_${startDate || 'all'}_${endDate || 'all'}.xlsx`;
        }

        // Create workbook
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

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

