let lastRunKey = ''; // Format: 'YYYY-MM-DD_HH'

/**
 * Mendaftarkan background scheduler untuk berjalan di server Node.js.
 * Berfungsi untuk server yang menyala terus (seperti VPS atau komputer lokal).
 */
export function registerBackgroundScheduler() {
    if (global._absentSchedulerRegistered) {
        return;
    }
    global._absentSchedulerRegistered = true;

    console.log('[Scheduler] Background scheduler untuk auto-absent diaktifkan.');

    // Cek pertama kali setelah 10 detik server menyala
    setTimeout(checkAndRun, 10000);

    // Cek berkala setiap 30 menit
    const intervalMs = 30 * 60 * 1000;
    setInterval(checkAndRun, intervalMs);
}

async function checkAndRun() {
    try {
        const now = new Date();
        const todayWIB = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
        const currentHourWIB = parseInt(
            now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: false }), 
            10
        );

        // Jalankan scheduler pada jam 17:00 WIB (Sore) dan 23:00 WIB (Malam)
        if (currentHourWIB === 17 || currentHourWIB === 23) {
            const runKey = `${todayWIB}_${currentHourWIB}`;
            
            if (lastRunKey === runKey) {
                // Sudah dijalankan untuk jam ini, lewati
                return;
            }

            const { runAutoAbsent } = await import('./absent');
            console.log(`[Scheduler] Memulai eksekusi otomatis auto-absent pada ${runKey}...`);

            // Proses untuk hari ini dan kemarin sebagai toleransi jika server sempat mati
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayWIB = yesterday.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

            const resultYesterday = await runAutoAbsent(yesterdayWIB);
            const resultToday = await runAutoAbsent(todayWIB);

            console.log(`[Scheduler] Selesai kemarin (${yesterdayWIB}):`, resultYesterday.message);
            console.log(`[Scheduler] Selesai hari ini (${todayWIB}):`, resultToday.message);

            lastRunKey = runKey;
        }
    } catch (err) {
        console.error('[Scheduler] Gagal mengeksekusi background scheduler:', err);
    }
}
