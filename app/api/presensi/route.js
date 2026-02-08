import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readExcel, appendRow, getDataByDateRange, findByField } from '@/lib/excel';
import { getUserFromRequest } from '@/lib/auth';
import { isWithinSchool } from '@/lib/geolocation';
import { DATA_FILES, ATTENDANCE_STATUS } from '@/lib/constants';

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

        let presensi = readExcel(DATA_FILES.PRESENSI);

        // Filter by date range
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            presensi = presensi.filter(p => {
                const date = new Date(p.tanggal);
                return date >= start && date <= end;
            });
        }

        // If student, show only their own records
        if (user.role === 'siswa') {
            presensi = presensi.filter(p => p.siswaId === user.id);
        } else {
            // Admin filters
            if (siswaId) {
                presensi = presensi.filter(p => p.siswaId === siswaId);
            }

            if (organisasi) {
                // Get students of this organization
                const siswaList = readExcel(DATA_FILES.SISWA);
                const siswaIds = siswaList
                    .filter(s => s.organisasi === organisasi)
                    .map(s => s.id);
                presensi = presensi.filter(p => siswaIds.includes(p.siswaId));
            }
        }

        // Enrich with student data
        const siswaList = readExcel(DATA_FILES.SISWA);
        const enrichedPresensi = presensi.map(p => {
            const siswa = siswaList.find(s => s.id === p.siswaId);
            return {
                ...p,
                namaSiswa: siswa?.nama || 'Unknown',
                kelasSiswa: siswa?.kelas || 'Unknown',
                organisasiSiswa: siswa?.organisasi || 'Unknown'
            };
        });

        // Sort by date desc
        enrichedPresensi.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

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
            // At school: can only mark "hadir" or "pulang"
            if (status !== ATTENDANCE_STATUS.HADIR && status !== ATTENDANCE_STATUS.PULANG) {
                return NextResponse.json(
                    { error: 'Anda berada di sekolah. Hanya bisa memilih Hadir atau Pulang.' },
                    { status: 400 }
                );
            }
        } else {
            // Outside school: can only mark "izin" or "sakit"
            if (status !== ATTENDANCE_STATUS.IZIN && status !== ATTENDANCE_STATUS.SAKIT) {
                return NextResponse.json(
                    { error: 'Anda berada di luar sekolah. Hanya bisa memilih Izin atau Sakit.' },
                    { status: 400 }
                );
            }
        }

        // Check if already submitted attendance today with same status type
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        const existingPresensi = readExcel(DATA_FILES.PRESENSI);
        const todayPresensi = existingPresensi.filter(p =>
            p.siswaId === user.id &&
            p.tanggal.startsWith(todayStr)
        );

        // Check for duplicate same-type attendance
        const hasSameStatus = todayPresensi.some(p => p.status === status);
        if (hasSameStatus) {
            return NextResponse.json(
                { error: `Anda sudah melakukan presensi dengan status "${status}" hari ini` },
                { status: 400 }
            );
        }

        const now = new Date();
        const newPresensi = {
            id: uuidv4(),
            siswaId: user.id,
            tanggal: now.toISOString(),
            waktu: now.toTimeString().split(' ')[0],
            status,
            latitude,
            longitude,
            isAtSchool: atSchool
        };

        appendRow(DATA_FILES.PRESENSI, newPresensi);

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
