import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const getHardcodedSchedule = (hari) => {
    const hariLower = hari.toLowerCase();

    // Jadwal per hari sesuai dokumen Pengaturan Jam KBM Smt 2 2025/2026
    const schedules = {
        senin: [
            // JP 1-3: 08:10, 08:45, 09:20 (durasi 35 menit)
            // Istirahat 1: 09:55-10:10
            // JP 4-6: 10:10, 10:45, 11:20 (durasi 35 menit)
            // Istirahat 2: 11:55-12:55
            // JP 7-10: 12:55, 13:30, 14:05, 14:40 (durasi 35 menit)
            { jp_ke: 1,  mulai: '08:10', durasi_menit: 35 },
            { jp_ke: 2,  mulai: '08:45', durasi_menit: 35 },
            { jp_ke: 3,  mulai: '09:20', durasi_menit: 35 },
            { jp_ke: 4,  mulai: '10:10', durasi_menit: 35 },
            { jp_ke: 5,  mulai: '10:45', durasi_menit: 35 },
            { jp_ke: 6,  mulai: '11:20', durasi_menit: 35 },
            { jp_ke: 7,  mulai: '12:55', durasi_menit: 35 },
            { jp_ke: 8,  mulai: '13:30', durasi_menit: 35 },
            { jp_ke: 9,  mulai: '14:05', durasi_menit: 35 },
            { jp_ke: 10, mulai: '14:40', durasi_menit: 35 },
        ],
        selasa: [
            // JP 1-4: 07:15, 07:55, 08:35, 09:15 (durasi 40 menit)
            // Istirahat 1: 09:55-10:10
            // JP 5-7: 10:10, 10:45, 11:20 (durasi 35 menit)
            // Istirahat 2: 11:55-12:55
            // JP 8-11: 12:55, 13:30, 14:05, 14:40 (durasi 35 menit)
            { jp_ke: 1,  mulai: '07:15', durasi_menit: 40 },
            { jp_ke: 2,  mulai: '07:55', durasi_menit: 40 },
            { jp_ke: 3,  mulai: '08:35', durasi_menit: 40 },
            { jp_ke: 4,  mulai: '09:15', durasi_menit: 40 },
            { jp_ke: 5,  mulai: '10:10', durasi_menit: 35 },
            { jp_ke: 6,  mulai: '10:45', durasi_menit: 35 },
            { jp_ke: 7,  mulai: '11:20', durasi_menit: 35 },
            { jp_ke: 8,  mulai: '12:55', durasi_menit: 35 },
            { jp_ke: 9,  mulai: '13:30', durasi_menit: 35 },
            { jp_ke: 10, mulai: '14:05', durasi_menit: 35 },
            { jp_ke: 11, mulai: '14:40', durasi_menit: 35 },
        ],
        rabu: [
            // JP 1-3: 07:45, 08:25, 09:05 (durasi 40 menit)
            // Istirahat 1: 09:45-10:00
            // JP 4-6: 10:00, 10:40, 11:20 (durasi 40 menit)
            // Istirahat 2: 12:00-13:00
            // JP 7-10: 13:00, 13:35, 14:10, 14:45 (durasi 35 menit)
            { jp_ke: 1,  mulai: '07:45', durasi_menit: 40 },
            { jp_ke: 2,  mulai: '08:25', durasi_menit: 40 },
            { jp_ke: 3,  mulai: '09:05', durasi_menit: 40 },
            { jp_ke: 4,  mulai: '10:00', durasi_menit: 40 },
            { jp_ke: 5,  mulai: '10:40', durasi_menit: 40 },
            { jp_ke: 6,  mulai: '11:20', durasi_menit: 40 },
            { jp_ke: 7,  mulai: '13:00', durasi_menit: 35 },
            { jp_ke: 8,  mulai: '13:35', durasi_menit: 35 },
            { jp_ke: 9,  mulai: '14:10', durasi_menit: 35 },
            { jp_ke: 10, mulai: '14:45', durasi_menit: 35 },
        ],
        kamis: [
            // Sama dengan Selasa
            { jp_ke: 1,  mulai: '07:15', durasi_menit: 40 },
            { jp_ke: 2,  mulai: '07:55', durasi_menit: 40 },
            { jp_ke: 3,  mulai: '08:35', durasi_menit: 40 },
            { jp_ke: 4,  mulai: '09:15', durasi_menit: 40 },
            { jp_ke: 5,  mulai: '10:10', durasi_menit: 35 },
            { jp_ke: 6,  mulai: '10:45', durasi_menit: 35 },
            { jp_ke: 7,  mulai: '11:20', durasi_menit: 35 },
            { jp_ke: 8,  mulai: '12:55', durasi_menit: 35 },
            { jp_ke: 9,  mulai: '13:30', durasi_menit: 35 },
            { jp_ke: 10, mulai: '14:05', durasi_menit: 35 },
            { jp_ke: 11, mulai: '14:40', durasi_menit: 35 },
        ],
        jumat: [
            // JP 1-4: 07:30, 08:05, 08:40, 09:15 (durasi 35 menit)
            // Istirahat: 09:50-10:20
            // JP 5-6: 10:20, 10:55 (durasi 35 menit)
            { jp_ke: 1, mulai: '07:30', durasi_menit: 35 },
            { jp_ke: 2, mulai: '08:05', durasi_menit: 35 },
            { jp_ke: 3, mulai: '08:40', durasi_menit: 35 },
            { jp_ke: 4, mulai: '09:15', durasi_menit: 35 },
            { jp_ke: 5, mulai: '10:20', durasi_menit: 35 },
            { jp_ke: 6, mulai: '10:55', durasi_menit: 35 },
        ],
        sabtu: [],
    };

    const daySchedule = schedules[hariLower] || schedules['senin'];
    return daySchedule.map(jp => ({
        hari,
        jp_ke: jp.jp_ke,
        mulai: jp.mulai,
        durasi_menit: jp.durasi_menit,
        is_custom: false,
        tanggal_custom: null
    }));
};

export async function GET(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const hari = searchParams.get('hari') || 'Senin';
        const tanggal_custom = searchParams.get('tanggal_custom');

        if (tanggal_custom) {
            const query = supabase.from('jadwal_jp').select('*').eq('tanggal_custom', tanggal_custom).eq('is_custom', true).order('jp_ke', { ascending: true });
            const { data, error } = await query;
            if (error) throw error;
            if (data && data.length > 0) {
                return NextResponse.json({ success: true, data });
            }
            // Fallback to regular template in DB
            const tmplQuery = supabase.from('jadwal_jp').select('*').eq('hari', hari).eq('is_custom', false).order('jp_ke', { ascending: true });
            const { data: tmplData, error: tmplError } = await tmplQuery;
            if (tmplError) throw tmplError;
            if (tmplData && tmplData.length > 0) {
                return NextResponse.json({ success: true, data: tmplData });
            }
            // Fallback to hardcoded template if no template in DB
            return NextResponse.json({ success: true, data: getHardcodedSchedule(hari) });
        } else {
            // Get templates for specific day from DB
            const tmplQuery = supabase.from('jadwal_jp').select('*').eq('hari', hari).eq('is_custom', false).order('jp_ke', { ascending: true });
            const { data: tmplData, error: tmplError } = await tmplQuery;
            if (tmplError) throw tmplError;
            if (tmplData && tmplData.length > 0) {
                return NextResponse.json({ success: true, data: tmplData });
            }
            // Fallback to hardcoded template if no template in DB
            return NextResponse.json({ success: true, data: getHardcodedSchedule(hari) });
        }
    } catch (error) {
        console.error('Get jadwal_jp error:', error);
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
        const { id, hari, jp_ke, mulai, durasi_menit, is_custom, tanggal_custom } = body;

        if (id) {
            const { data, error } = await supabase.from('jadwal_jp')
                .update({ hari, jp_ke, mulai, durasi_menit, is_custom: !!is_custom, tanggal_custom: is_custom ? tanggal_custom : null })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return NextResponse.json({ success: true, data });
        } else {
            const { data, error } = await supabase.from('jadwal_jp')
                .insert([{ hari, jp_ke, mulai, durasi_menit, is_custom: !!is_custom, tanggal_custom: is_custom ? tanggal_custom : null }])
                .select()
                .single();
            if (error) throw error;
            return NextResponse.json({ success: true, data });
        }
    } catch (error) {
        console.error('Post jadwal_jp error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const tanggal_custom = searchParams.get('tanggal_custom');
        const hari = searchParams.get('hari');

        if (id) {
            const { error } = await supabase.from('jadwal_jp').delete().eq('id', id);
            if (error) throw error;
        } else if (tanggal_custom) {
            const { error } = await supabase.from('jadwal_jp').delete().eq('tanggal_custom', tanggal_custom).eq('is_custom', true);
            if (error) throw error;
        } else if (hari) {
            const { error } = await supabase.from('jadwal_jp').delete().eq('hari', hari).eq('is_custom', false);
            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete jadwal_jp error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
