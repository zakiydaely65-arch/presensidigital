import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { getDistanceFromSchool } from '@/lib/geolocation';

// GET - Export data to Excel
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
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
                .select('*, siswa!inner(*)')
                .order('tanggal', { ascending: false })
                .order('waktu', { ascending: false })
                .limit(5000);

            // Filter by date range
            if (startDate && endDate) {
                query = query.gte('tanggal', startDate).lte('tanggal', endDate);
            }

            // Filter by organization natively
            if (organisasi) {
                query = query.eq('siswa.organisasi', organisasi);
            }

            // Filter by status (handle derived hadir_luar_radius status)
            if (status && status !== 'semua') {
                if (status === 'hadir_luar_radius') {
                    query = query.eq('status', 'hadir').eq('is_at_school', false);
                } else if (status === 'hadir') {
                    query = query.eq('status', 'hadir').eq('is_at_school', true);
                } else {
                    query = query.eq('status', status);
                }
            }

            const { data: presensi, error } = await query;
            if (error) throw error;

            // Filter by organization on the client side if necessary (Supabase join filtering can be limited)
            let filteredPresensi = presensi;
            if (organisasi) {
                filteredPresensi = presensi.filter(p => p.siswa?.organisasi === organisasi);
            }

            dataToExport = filteredPresensi.map(p => {
                let jarakStr = '';
                try {
                    if (!p.is_at_school && p.latitude != null && p.longitude != null && p.latitude !== '' && p.longitude !== '') {
                        jarakStr = ` (${Math.round(getDistanceFromSchool(Number(p.latitude), Number(p.longitude)))}m)`;
                    }
                } catch (err) {
                    console.error('Export jarak calc error:', err);
                }

                // Derive display status: hadir + off-site = HADIR (LUAR RADIUS)
                let displayStatus = p.status.toUpperCase();
                if (p.status === 'hadir' && !p.is_at_school) {
                    displayStatus = 'HADIR (LUAR RADIUS)';
                }

                return {
                    'Tanggal': p.tanggal,
                    'Waktu': p.waktu,
                    'Nama': p.siswa?.nama || 'Unknown',
                    'Kelas': p.siswa?.kelas || 'Unknown',
                    'Organisasi': p.siswa?.organisasi || 'Unknown',
                    'Status': displayStatus,
                    'Lokasi': (p.is_at_school ? 'Di Sekolah' : 'Luar Sekolah') + jarakStr
                };
            });

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

