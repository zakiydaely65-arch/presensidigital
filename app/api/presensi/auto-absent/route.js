import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST - Automatically mark absent students for a given date
// This creates "tidak_hadir" records for all students who have NO attendance record
// (of any status) on the specified date.
export async function POST(request) {
    try {
        const user = await getUserFromRequest(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Akses ditolak' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { tanggal } = body;

        if (!tanggal) {
            return NextResponse.json(
                { error: 'Tanggal harus disertakan' },
                { status: 400 }
            );
        }

        // Only process for dates that are today (WIB) or earlier — don't mark future dates
        const now = new Date();
        const todayWIB = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
        if (tanggal > todayWIB) {
            return NextResponse.json(
                { error: 'Tidak bisa menandai ketidakhadiran untuk tanggal di masa depan' },
                { status: 400 }
            );
        }

        // 1. Get ALL active students
        const { data: allSiswa, error: siswaError } = await supabase
            .from('siswa')
            .select('id');

        if (siswaError) throw siswaError;

        if (!allSiswa || allSiswa.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Tidak ada siswa terdaftar',
                inserted: 0
            });
        }

        // 2. Get all students who already have ANY attendance record on this date
        const { data: existingRecords, error: presensiError } = await supabase
            .from('presensi')
            .select('siswa_id')
            .eq('tanggal', tanggal);

        if (presensiError) throw presensiError;

        // Unique set of siswa_ids that already have a record
        const presentSiswaIds = new Set(
            (existingRecords || []).map(r => r.siswa_id)
        );

        // 3. Find students who have NO record at all
        const absentSiswaIds = allSiswa
            .map(s => s.id)
            .filter(id => !presentSiswaIds.has(id));

        if (absentSiswaIds.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Semua siswa sudah memiliki catatan presensi pada tanggal ini',
                inserted: 0
            });
        }

        // 4. Insert "tidak_hadir" records for absent students
        const recordsToInsert = absentSiswaIds.map(siswaId => ({
            siswa_id: siswaId,
            status: 'tidak_hadir',
            tanggal: tanggal,
            waktu: '00:00:00',
            latitude: null,
            longitude: null,
            is_at_school: false
        }));

        // Insert in batches of 500 to avoid payload limits
        let totalInserted = 0;
        const batchSize = 500;

        for (let i = 0; i < recordsToInsert.length; i += batchSize) {
            const batch = recordsToInsert.slice(i, i + batchSize);
            const { error: insertError } = await supabase
                .from('presensi')
                .insert(batch);

            if (insertError) throw insertError;
            totalInserted += batch.length;
        }

        return NextResponse.json({
            success: true,
            message: `${totalInserted} siswa ditandai tidak hadir pada ${tanggal}`,
            inserted: totalInserted
        });

    } catch (error) {
        console.error('Auto-absent error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server: ' + error.message },
            { status: 500 }
        );
    }
}
