import { NextResponse } from 'next/server';
import { runAutoAbsent } from '@/lib/absent';

export const dynamic = 'force-dynamic';

// GET - Cron endpoint to trigger auto-absent automatically
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        const authHeader = request.headers.get('Authorization');
        const token = authHeader ? authHeader.replace('Bearer ', '') : null;

        const expectedSecret = process.env.CRON_SECRET || 'presensi-osis-mpk-secret-key-2024';

        if (secret !== expectedSecret && token !== expectedSecret) {
            return NextResponse.json(
                { error: 'Akses ditolak' },
                { status: 401 }
            );
        }

        // Dapatkan tanggal hari ini dan kemarin dalam timezone Asia/Jakarta (WIB)
        const now = new Date();
        const todayWIB = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayWIB = yesterday.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

        console.log(`[Cron] Memproses auto-absent untuk kemarin (${yesterdayWIB}) dan hari ini (${todayWIB})...`);

        const resultYesterday = await runAutoAbsent(yesterdayWIB);
        const resultToday = await runAutoAbsent(todayWIB);

        return NextResponse.json({
            success: true,
            executionTime: now.toISOString(),
            yesterday: {
                tanggal: yesterdayWIB,
                ...resultYesterday
            },
            today: {
                tanggal: todayWIB,
                ...resultToday
            }
        });

    } catch (error) {
        console.error('Cron auto-absent error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server: ' + error.message },
            { status: 500 }
        );
    }
}
