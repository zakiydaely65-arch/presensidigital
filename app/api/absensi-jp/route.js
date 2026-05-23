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
        const tanggal = searchParams.get('tanggal');
        
        if (!tanggal) {
             return NextResponse.json({ error: 'Tanggal diperlukan' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('absensi_jp')
            .select('*')
            .eq('tanggal', tanggal);

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Get absensi_jp error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
        }

        const body = await request.json();
        const { absensi } = body; // expect array of {siswa_id, tanggal, jp_ke, hadir}

        if (!Array.isArray(absensi) || absensi.length === 0) {
            return NextResponse.json({ error: 'Data absensi kosong' }, { status: 400 });
        }

        // Upsert data to avoid conflicts
        const { data, error } = await supabase
            .from('absensi_jp')
            .upsert(absensi, { onConflict: 'siswa_id, tanggal, jp_ke' })
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Post absensi_jp error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
