import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const organisasi = searchParams.get('organisasi');

        // First fetch students based on organisasi if specified
        let siswaQuery = supabase.from('siswa').select('*');
        if (organisasi) {
            siswaQuery = siswaQuery.eq('organisasi', organisasi);
        }
        
        const { data: siswaList, error: siswaErr } = await siswaQuery;
        if (siswaErr) throw siswaErr;

        if (!siswaList || siswaList.length === 0) {
             return NextResponse.json({ success: true, data: [] });
        }

        // Fetch JP attendance for those students in the date range
        let absensiQuery = supabase.from('absensi_jp').select('*').eq('hadir', true);
        
        if (startDate && endDate) {
            absensiQuery = absensiQuery.gte('tanggal', startDate).lte('tanggal', endDate);
        }

        const { data: absensiList, error: absensiErr } = await absensiQuery;
        if (absensiErr) throw absensiErr;

        // Group and count JP per student
        const jpCountMap = {};
        absensiList.forEach(ab => {
            if (!jpCountMap[ab.siswa_id]) {
                jpCountMap[ab.siswa_id] = 0;
            }
            jpCountMap[ab.siswa_id]++;
        });

        const rekap = siswaList.map(s => ({
            id: s.id,
            nama: s.nama,
            kelas: s.kelas,
            organisasi: s.organisasi,
            totalJp: jpCountMap[s.id] || 0
        }));

        // Sort descending by total JP
        rekap.sort((a, b) => b.totalJp - a.totalJp);

        return NextResponse.json({ success: true, data: rekap });
    } catch (error) {
        console.error('Get rekap_jp error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
