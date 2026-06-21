export async function register() {
    // Jalankan scheduler hanya di lingkungan Node.js server-side
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { registerBackgroundScheduler } = await import('./lib/scheduler');
        registerBackgroundScheduler();
    }
}
