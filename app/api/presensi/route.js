import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { isWithinSchool, getDistanceFromSchool } from '@/lib/geolocation';
import { ATTENDANCE_STATUS, HADIR_CUTOFF_HOUR } from '@/lib/constants';

export const dynamic = 'force-dynamic';

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
        const status = searchParams.get('status');

        // If filtering by organisasi (admin only), first fetch the matching siswa IDs.
        // Supabase does NOT support filtering on joined columns via .eq('siswa.col', val),
        // so we do a two-step lookup instead.
        let siswaIdFilter = null;
        if (user.role !== 'siswa' && organisasi) {
            const { data: siswaRows, error: siswaErr } = await supabase
                .from('siswa')
                .select('id')
                .eq('organisasi', organisasi);
            if (siswaErr) throw siswaErr;
            siswaIdFilter = (siswaRows || []).map(s => s.id);
            // If no siswa found for this organisation, return empty immediately
            if (siswaIdFilter.length === 0) {
                return NextResponse.json({ success: true, data: [] });
            }
        }

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

        // If student, show only their own records
        if (user.role === 'siswa') {
            query = query.eq('siswa_id', user.id);
        } else {
            // Admin filters
            if (siswaId) {
                query = query.eq('siswa_id', siswaId);
            }

            // Apply organisasi filter via siswa_id list (two-step lookup, reliable)
            if (siswaIdFilter !== null) {
                query = query.in('siswa_id', siswaIdFilter);
            }

            // Filter by status (handle derived hadir_luar_radius status) natively
            if (status && status !== 'semua') {
                if (status === 'hadir_luar_radius') {
                    query = query.eq('status', 'hadir').eq('is_at_school', false);
                } else if (status === 'hadir') {
                    query = query.eq('status', 'hadir').eq('is_at_school', true);
                } else if (status === 'tidak_hadir') {
                    query = query.eq('status', 'tidak_hadir');
                } else {
                    query = query.eq('status', status);
                }
            }
        }

        const { data: presensi, error } = await query;

        if (error) throw error;

        // Enrich and format for frontend compatibility
        const enrichedPresensi = presensi.map(p => {
            let statusUi = p.status;
            if (p.status === 'hadir' && !p.is_at_school) {
                statusUi = 'hadir_luar_radius';
            }

            let computedJarak = null;
            try {
                if (p.latitude != null && p.longitude != null && p.latitude !== '' && p.longitude !== '') {
                    computedJarak = getDistanceFromSchool(Number(p.latitude), Number(p.longitude));
                }
            } catch (err) {
                console.error('jarak calculation error', err);
            }

            return {
                ...p,
                status: statusUi,
                siswaId: p.siswa_id, // Map back to camelCase for UI if needed
                namaSiswa: p.siswa?.nama || 'Unknown',
                kelasSiswa: p.siswa?.kelas || 'Unknown',
                organisasiSiswa: p.siswa?.organisasi || 'Unknown',
                isAtSchool: p.is_at_school, // Map snake_case DB column to camelCase for frontend
                jarak: computedJarak
            };
        });

        // Organisation filtering is now handled at DB level via siswa_id .in() — no local fallback needed
        const finalData = enrichedPresensi;

        return NextResponse.json({ success: true, data: finalData });

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
            if (status !== ATTENDANCE_STATUS.IZIN && status !== ATTENDANCE_STATUS.SAKIT && status !== ATTENDANCE_STATUS.HADIR_LUAR_RADIUS) {
                return NextResponse.json(
                    { error: 'Anda berada di luar sekolah. Hanya bisa memilih Izin, Sakit, atau Hadir (Luar Radius).' },
                    { status: 400 }
                );
            }
        }

        // Check if already submitted attendance today with same status type
        // Use WIB timezone (Asia/Jakarta, UTC+7)
        const now = new Date();
        const wibDate = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }); // YYYY-MM-DD format
        const wibTime = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour12: false }); // HH:MM:SS format

        // Check cutoff time: hadir can only be submitted before HADIR_CUTOFF_HOUR (09:00 WIB)
        const currentHour = parseInt(wibTime.split(':')[0], 10);
        if ((status === ATTENDANCE_STATUS.HADIR || status === ATTENDANCE_STATUS.HADIR_LUAR_RADIUS) && currentHour >= HADIR_CUTOFF_HOUR) {
            return NextResponse.json(
                { error: `Batas waktu presensi Hadir adalah pukul ${String(HADIR_CUTOFF_HOUR).padStart(2, '0')}:00 WIB. Anda sudah melewati batas waktu.` },
                { status: 400 }
            );
        }

        // Map 'hadir_luar_radius' to 'hadir' for database insertion to pass ENUM constraints
        const supabaseStatus = status === ATTENDANCE_STATUS.HADIR_LUAR_RADIUS ? ATTENDANCE_STATUS.HADIR : status;

        // Validate: "pulang" can only be submitted if student already has "hadir" record today
        if (status === ATTENDANCE_STATUS.PULANG) {
            const { data: hadirRecord, error: hadirCheckError } = await supabase
                .from('presensi')
                .select('id')
                .eq('siswa_id', user.id)
                .eq('tanggal', wibDate)
                .eq('status', 'hadir')
                .maybeSingle();

            if (hadirCheckError) throw hadirCheckError;

            if (!hadirRecord) {
                return NextResponse.json(
                    { error: 'Anda harus melakukan presensi Hadir terlebih dahulu sebelum bisa Pulang.' },
                    { status: 400 }
                );
            }
        }

        const { data: existing, error: checkError } = await supabase
            .from('presensi')
            .select('id')
            .eq('siswa_id', user.id)
            .eq('tanggal', wibDate)
            .eq('status', supabaseStatus)
            .maybeSingle();

        if (checkError) throw checkError;

        if (existing) {
            const statusName = status === 'hadir_luar_radius' ? 'Hadir Off-Site' : status;
            return NextResponse.json(
                { error: `Anda sudah melakukan presensi dengan status "${statusName}" hari ini` },
                { status: 400 }
            );
        }

        const { data: newPresensi, error: insertError } = await supabase
            .from('presensi')
            .insert([{
                siswa_id: user.id,
                status: supabaseStatus,
                latitude,
                longitude,
                is_at_school: atSchool,
                tanggal: wibDate,
                waktu: wibTime
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

