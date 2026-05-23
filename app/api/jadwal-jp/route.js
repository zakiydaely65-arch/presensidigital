import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const getHardcodedSchedule = (hari) => {
    const isJumat = hari.toLowerCase() === 'jumat';
    const totalJp = isJumat ? 4 : 8;
    
    const schedule = [];
    let currentHour = 7;
    let currentMin = 0;

    const addTime = (minutes) => {
        currentMin += minutes;
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
    };

    const formatTime = () => `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

    for (let i = 1; i <= totalJp; i++) {
        // Istirahat pertama
        if (i === 5) {
            addTime(15); // Istirahat 15 menit di jam 09:00
        }
        
        schedule.push({
            hari,
            jp_ke: i,
            mulai: formatTime(),
            durasi_menit: 30,
            is_custom: false,
            tanggal_custom: null
        });
        
        addTime(30); // 30 menit per JP
    }
    return schedule;
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
            // Fallback to hardcoded template if no custom schedule
            return NextResponse.json({ success: true, data: getHardcodedSchedule(hari) });
        } else {
            // Get hardcoded templates for specific day
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

        // Ensure we only save CUSTOM schedules to DB now
        if (!is_custom) {
             return NextResponse.json({ success: true, message: 'Template jadwal reguler bersifat konstan dan tidak disimpan di database.' });
        }

        if (id) {
            const { data, error } = await supabase.from('jadwal_jp')
                .update({ hari, jp_ke, mulai, durasi_menit, is_custom, tanggal_custom })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return NextResponse.json({ success: true, data });
        } else {
            const { data, error } = await supabase.from('jadwal_jp')
                .insert([{ hari, jp_ke, mulai, durasi_menit, is_custom, tanggal_custom }])
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

        if (id) {
            const { error } = await supabase.from('jadwal_jp').delete().eq('id', id);
            if (error) throw error;
        } else if (tanggal_custom) {
            const { error } = await supabase.from('jadwal_jp').delete().eq('tanggal_custom', tanggal_custom).eq('is_custom', true);
            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete jadwal_jp error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
