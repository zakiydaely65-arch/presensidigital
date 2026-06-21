import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { runAutoAbsent } from '@/lib/absent';

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

        const result = await runAutoAbsent(tanggal);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Auto-absent error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server: ' + error.message },
            { status: 500 }
        );
    }
}

