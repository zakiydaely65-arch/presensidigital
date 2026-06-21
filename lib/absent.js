import { supabase } from './supabase';

/**
 * Otomatis menandai siswa yang tidak hadir pada tanggal tertentu.
 * Fungsi ini idempotent (aman dijalankan berkali-kali).
 * 
 * @param {string} tanggal - Tanggal berformat YYYY-MM-DD (WIB)
 */
export async function runAutoAbsent(tanggal) {
    try {
        // Hanya izinkan pemrosesan tanggal hari ini (WIB) atau sebelumnya
        const now = new Date();
        const todayWIB = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
        if (tanggal > todayWIB) {
            throw new Error('Tidak bisa menandai ketidakhadiran untuk tanggal di masa depan');
        }

        // 1. Ambil SEMUA data siswa aktif
        const { data: allSiswa, error: siswaError } = await supabase
            .from('siswa')
            .select('id');

        if (siswaError) throw siswaError;

        if (!allSiswa || allSiswa.length === 0) {
            return {
                success: true,
                message: 'Tidak ada siswa terdaftar',
                inserted: 0
            };
        }

        // 2. Ambil semua siswa yang sudah memiliki catatan presensi apa pun pada tanggal ini
        const { data: existingRecords, error: presensiError } = await supabase
            .from('presensi')
            .select('siswa_id')
            .eq('tanggal', tanggal);

        if (presensiError) throw presensiError;

        // Set unik untuk siswa_id yang sudah mencatatkan presensi
        const presentSiswaIds = new Set(
            (existingRecords || []).map(r => r.siswa_id)
        );

        // 3. Filter siswa yang TIDAK memiliki catatan sama sekali
        const absentSiswaIds = allSiswa
            .map(s => s.id)
            .filter(id => !presentSiswaIds.has(id));

        if (absentSiswaIds.length === 0) {
            return {
                success: true,
                message: 'Semua siswa sudah memiliki catatan presensi pada tanggal ini',
                inserted: 0
            };
        }

        // 4. Buat data "tidak_hadir" untuk siswa-siswa tersebut
        const recordsToInsert = absentSiswaIds.map(siswaId => ({
            siswa_id: siswaId,
            status: 'tidak_hadir',
            tanggal: tanggal,
            waktu: '00:00:00',
            latitude: null,
            longitude: null,
            is_at_school: false
        }));

        // Lakukan insert dalam batch (maksimal 500 baris per batch)
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

        return {
            success: true,
            message: `${totalInserted} siswa ditandai tidak hadir pada tanggal ${tanggal}`,
            inserted: totalInserted
        };

    } catch (error) {
        console.error(`Error in runAutoAbsent for date ${tanggal}:`, error);
        throw error;
    }
}
