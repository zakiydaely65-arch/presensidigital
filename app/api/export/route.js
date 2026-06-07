import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { getDistanceFromSchool } from '@/lib/geolocation';

/**
 * Mengurai string kelas menjadi nilai numerik untuk sorting yang benar.
 * Contoh: "X-1" -> { grade: 10, num: 1 }, "XI-2" -> { grade: 11, num: 2 }
 */
function parseKelas(kelasStr = '') {
    const upper = kelasStr.toUpperCase().trim();
    let grade = 99;
    let rest = upper;

    if (upper.startsWith('XII')) { grade = 12; rest = upper.slice(3); }
    else if (upper.startsWith('XI')) { grade = 11; rest = upper.slice(2); }
    else if (upper.startsWith('X'))  { grade = 10; rest = upper.slice(1); }

    // Ambil angka setelah pemisah (misal "-1", " 1", "1")
    const numMatch = rest.match(/\d+/);
    const num = numMatch ? parseInt(numMatch[0], 10) : 0;

    return { grade, num };
}

function sortByKelas(a, b) {
    const ka = parseKelas(a.kelas || a['Kelas'] || '');
    const kb = parseKelas(b.kelas || b['Kelas'] || '');
    if (ka.grade !== kb.grade) return ka.grade - kb.grade;
    return ka.num - kb.num;
}

// Helper to parse date string in local timezone
function parseLocalDate(dateStr) {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

// Helper to get all YYYY-MM-DD date strings in range (local timezone safe)
function getDatesInRange(startStr, endStr) {
    const dates = [];
    const current = parseLocalDate(startStr);
    const end = parseLocalDate(endStr);
    
    while (current <= end) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
        
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

// GET - Export data to Excel
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export async function GET(request) {
    try {
        const user = await getUserFromRequest(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Akses ditolak' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'presensi' or 'siswa'
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const organisasi = searchParams.get('organisasi');
        const status = searchParams.get('status');

        let dataToExport = [];
        let filename = '';

        if (type === 'siswa') {
            let query = supabase.from('siswa').select('*').order('kelas', { ascending: true });

            if (organisasi) {
                query = query.eq('organisasi', organisasi);
            }

            const { data: siswaList, error } = await query;
            if (error) throw error;

            // Urutkan berdasarkan kelas (X-1, X-2, ..., XI-1, ..., XII-n) lalu nama
            const sortedSiswa = [...siswaList].sort((a, b) => {
                const kComp = sortByKelas(a, b);
                if (kComp !== 0) return kComp;
                return (a.nama || '').localeCompare(b.nama || '', 'id');
            });

            dataToExport = sortedSiswa.map(s => ({
                'Nama Lengkap': s.nama,
                'Kelas': s.kelas,
                'Organisasi': s.organisasi,
                'Kode Login': s.kode,
                'Kata Sandi': s.sandi_plain || '-'
            }));

            filename = `data_siswa_${organisasi || 'semua'}.xlsx`;

        } else {
            // Two-step organisasi filter: fetch siswa IDs first, then filter presensi
            let siswaIdFilter = null;
            if (organisasi) {
                const { data: siswaRows, error: siswaErr } = await supabase
                    .from('siswa')
                    .select('id')
                    .eq('organisasi', organisasi);
                if (siswaErr) throw siswaErr;
                siswaIdFilter = (siswaRows || []).map(s => s.id);
                if (siswaIdFilter.length === 0) {
                    dataToExport = [];
                }
            }

            if (siswaIdFilter === null || siswaIdFilter.length > 0) {
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

                // Filter by organisasi via reliable siswa_id list
                if (siswaIdFilter !== null) {
                    query = query.in('siswa_id', siswaIdFilter);
                }

                // Filter by status (handle derived hadir_luar_radius status)
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

                const { data: presensi, error } = await query;
                if (error) throw error;

                // Urutkan presensi: kelas dulu (X-1, XI-1, dst), lalu nama, lalu tanggal terbaru
                const sortedPresensi = [...presensi].sort((a, b) => {
                    const ka = { kelas: a.siswa?.kelas };
                    const kb = { kelas: b.siswa?.kelas };
                    const kComp = sortByKelas(ka, kb);
                    if (kComp !== 0) return kComp;
                    const namaComp = (a.siswa?.nama || '').localeCompare(b.siswa?.nama || '', 'id');
                    if (namaComp !== 0) return namaComp;
                    // Terbaru duluan dalam kelompok siswa yang sama
                    if (a.tanggal !== b.tanggal) return b.tanggal.localeCompare(a.tanggal);
                    return (b.waktu || '').localeCompare(a.waktu || '');
                });

                dataToExport = sortedPresensi.map(p => {
                    let jarakStr = '';
                    try {
                        if (!p.is_at_school && p.latitude != null && p.longitude != null && p.latitude !== '' && p.longitude !== '') {
                            jarakStr = ` (${Math.round(getDistanceFromSchool(Number(p.latitude), Number(p.longitude)))}m)`;
                        }
                    } catch (err) {
                        console.error('Export jarak calc error:', err);
                    }

                    // Derive display status
                    let displayStatus = p.status.toUpperCase();
                    if (p.status === 'hadir' && !p.is_at_school) {
                        displayStatus = 'HADIR (LUAR RADIUS)';
                    } else if (p.status === 'tidak_hadir') {
                        displayStatus = 'TIDAK HADIR';
                    }

                    return {
                        'Tanggal': p.tanggal,
                        'Waktu': p.waktu,
                        'Nama': p.siswa?.nama || 'Unknown',
                        'Kelas': p.siswa?.kelas || 'Unknown',
                        'Organisasi': p.siswa?.organisasi || 'Unknown',
                        'Status': displayStatus,
                        'Lokasi': (p.is_at_school ? 'Di Sekolah' : 'Luar Sekolah') + jarakStr
                    };
                });
            }

            filename = `presensi_${organisasi || 'semua'}_${startDate || 'all'}_${endDate || 'all'}.xlsx`;
        }

        // Create workbook
        const workbook = XLSX.utils.book_new();

        if (type === 'siswa') {
            const headers = ['Nama Lengkap', 'Kelas', 'Organisasi', 'Kode Login', 'Kata Sandi'];
            const worksheet = XLSX.utils.json_to_sheet(dataToExport, { header: headers });

            // Auto-width adjustment
            const max_width = headers.map(header => {
                let maxLen = header.length;
                dataToExport.forEach(row => {
                    const val = row[header] ? String(row[header]) : '';
                    if (val.length > maxLen) {
                        maxLen = val.length;
                    }
                });
                return { wch: maxLen + 3 };
            });
            worksheet['!cols'] = max_width;

            XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
        } else {
            // Group by date
            const groupedByDate = {};
            dataToExport.forEach(row => {
                const dateKey = row['Tanggal'] || 'Unknown';
                if (!groupedByDate[dateKey]) {
                    groupedByDate[dateKey] = [];
                }
                groupedByDate[dateKey].push(row);
            });

            let datesToSheets = [];
            if (startDate && endDate) {
                datesToSheets = getDatesInRange(startDate, endDate);
            } else {
                datesToSheets = Object.keys(groupedByDate).sort();
            }

            if (datesToSheets.length === 0) {
                const headers = ['Tanggal', 'Waktu', 'Nama', 'Kelas', 'Organisasi', 'Status', 'Lokasi'];
                const worksheet = XLSX.utils.json_to_sheet([], { header: headers });

                // Auto-width adjustment
                const max_width = headers.map(header => ({ wch: header.length + 3 }));
                worksheet['!cols'] = max_width;

                XLSX.utils.book_append_sheet(workbook, worksheet, 'Tidak Ada Data');
            } else {
                const headers = ['Tanggal', 'Waktu', 'Nama', 'Kelas', 'Organisasi', 'Status', 'Lokasi'];
                datesToSheets.forEach(dateKey => {
                    const records = groupedByDate[dateKey] || [];
                    const sheetTitle = dateKey.substring(0, 31);
                    const worksheet = XLSX.utils.json_to_sheet(records, { header: headers });

                    // Auto-width adjustment
                    const max_width = headers.map(header => {
                        let maxLen = header.length;
                        records.forEach(row => {
                            const val = row[header] ? String(row[header]) : '';
                            if (val.length > maxLen) {
                                maxLen = val.length;
                            }
                        });
                        return { wch: maxLen + 3 };
                    });
                    worksheet['!cols'] = max_width;

                    XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);
                });
            }
        }

        // Generate buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

