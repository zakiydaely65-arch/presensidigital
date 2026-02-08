const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const lines = envFile.split('\n');
const env = {};
lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrate() {
    console.log('Starting migration...');

    // 1. Migrate Siswa
    const siswaPath = path.join(__dirname, 'data/siswa.xlsx');
    if (fs.existsSync(siswaPath)) {
        console.log('Reading siswa.xlsx...');
        const workbook = XLSX.readFile(siswaPath);
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        const mappedSiswa = data.map(s => ({
            id: s.id,
            nama: s.nama,
            kelas: s.kelas,
            organisasi: s.organisasi,
            kode: s.kode,
            sandi_hash: s.sandi,
            sandi_plain: s.sandiPlain || '-'
        }));

        if (mappedSiswa.length > 0) {
            console.log(`Inserting ${mappedSiswa.length} siswa...`);
            const { error } = await supabase.from('siswa').upsert(mappedSiswa);
            if (error) console.error('Error migrating siswa:', error);
            else console.log('Siswa migrated successfully.');
        }
    }

    // 2. Migrate Presensi
    const presensiPath = path.join(__dirname, 'data/presensi.xlsx');
    if (fs.existsSync(presensiPath)) {
        console.log('Reading presensi.xlsx...');
        const workbook = XLSX.readFile(presensiPath);
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        const mappedPresensi = data.map(p => ({
            id: p.id,
            siswa_id: p.siswaId,
            status: p.status,
            tanggal: p.tanggal ? p.tanggal.split('T')[0] : new Date().toISOString().split('T')[0],
            waktu: p.waktu || '00:00:00',
            is_at_school: p.isAtSchool || false,
            latitude: p.latitude || 0,
            longitude: p.longitude || 0
        }));

        if (mappedPresensi.length > 0) {
            console.log(`Inserting ${mappedPresensi.length} presensi...`);
            const { error } = await supabase.from('presensi').upsert(mappedPresensi);
            if (error) console.error('Error migrating presensi:', error);
            else console.log('Presensi migrated successfully.');
        }
    }

    console.log('Migration finished.');
}

migrate();
