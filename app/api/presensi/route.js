import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { isWithinSchool } from '@/lib/geolocation';
import { ATTENDANCE_STATUS } from '@/lib/constants';

// GET - Get attendance records
export async function GET(request) {
    try {
        const user = await getUserFromRequest(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Tidak terautentikasi' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const organisasi = searchParams.get('organisasi');
        const siswaId = searchParams.get('siswaId');

        let query = supabase
            .from('presensi')
            .select('*, siswa(*)')
            .order('tanggal', { ascending: false })
            .order('waktu', { ascending: false });

        // Filter by date range
        if (startDate && endDate) {
            query = query.gte('tanggal', startDate).lte('tanggal', endDate);
        }

        // If student, show only their own records
        if (user.role === 'siswa') {
            query = query.eq('siswa_id', user.id);
        } else {
            // Admin filters
            if (siswaId) {
                query = query.eq('siswa_id', siswaId);
            }

            if (organisasi) {
                query = query.eq('siswa.organisasi', organisasi);
            }
        }

        const { data: presensi, error } = await query;

        if (error) throw error;

        // Enrich and format for frontend compatibility
        const enrichedPresensi = presensi.map(p => ({
            ...p,
            siswaId: p.siswa_id, // Map back to camelCase for UI if needed
            namaSiswa: p.siswa?.nama || 'Unknown',
            kelasSiswa: p.siswa?.kelas || 'Unknown',
            organisasiSiswa: p.siswa?.organisasi || 'Unknown',
            isAtSchool: p.is_at_school // Map snake_case DB column to camelCase for frontend
        }));

        return NextResponse.json({ success: true, data: enrichedPresensi });

    } catch (error) {
        console.error('Get presensi error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// POST - Submit attendance
export async function POST(request) {
    try {
        const user = await getUserFromRequest(request);

        if (!user || user.role !== 'siswa') {
            return NextResponse.json(
                { error: 'Hanya siswa yang bisa melakukan presensi' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { status, latitude, longitude } = body;

        if (!status || !latitude || !longitude) {
            return NextResponse.json(
                { error: 'Status dan lokasi harus disertakan' },
                { status: 400 }
            );
        }

        // Validate status
        const validStatuses = Object.values(ATTENDANCE_STATUS);
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Status tidak valid' },
                { status: 400 }
            );
        }

        // Check location logic
        const atSchool = isWithinSchool(latitude, longitude);

        // Validate status based on location
        if (atSchool) {
            if (status !== ATTENDANCE_STATUS.HADIR && status !== ATTENDANCE_STATUS.PULANG) {
                return NextResponse.json(
                    { error: 'Anda berada di sekolah. Hanya bisa memilih Hadir atau Pulang.' },
                    { status: 400 }
                );
            }
        } else {
            if (status !== ATTENDANCE_STATUS.IZIN && status !== ATTENDANCE_STATUS.SAKIT) {
                return NextResponse.json(
                    { error: 'Anda berada di luar sekolah. Hanya bisa memilih Izin atau Sakit.' },
                    { status: 400 }
                );
            }
        }

        // Check if already submitted attendance today with same status type
        const todayStr = new Date().toISOString().split('T')[0];

        const { data: existing, error: checkError } = await supabase
            .from('presensi')
            .select('id')
            .eq('siswa_id', user.id)
            .eq('tanggal', todayStr)
            .eq('status', status)
            .maybeSingle();

        if (checkError) throw checkError;

        if (existing) {
            return NextResponse.json(
                { error: `Anda sudah melakukan presensi dengan status "${status}" hari ini` },
                { status: 400 }
            );
        }

        const { data: newPresensi, error: insertError } = await supabase
            .from('presensi')
            .insert([{
                siswa_id: user.id,
                status,
                latitude,
                longitude,
                is_at_school: atSchool
                // tanggal and waktu default to current_date and current_time in Postgres
            }])
            .select()
            .single();

        if (insertError) throw insertError;

        return NextResponse.json({
            success: true,
            message: `Presensi berhasil dengan status: ${status}`,
            data: newPresensi
        });

    } catch (error) {
        console.error('Submit presensi error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

