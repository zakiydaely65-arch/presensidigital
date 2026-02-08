import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readExcel, writeExcel, appendRow, updateRow, deleteRow, findByField } from '@/lib/excel';
import { getUserFromRequest, generateCredentials, hashPassword } from '@/lib/auth';
import { DATA_FILES } from '@/lib/constants';

// GET - List all students (admin only)
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
        const organisasi = searchParams.get('organisasi');

        let siswa = readExcel(DATA_FILES.SISWA);

        // Filter by organization if specified
        if (organisasi) {
            siswa = siswa.filter(s => s.organisasi === organisasi);
        }

        // Remove password from response
        const safeSiswa = siswa.map(s => ({
            ...s,
            sandi: undefined,
            sandiPlain: undefined
        }));

        return NextResponse.json({ success: true, data: safeSiswa });

    } catch (error) {
        console.error('Get siswa error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// POST - Create new student (admin only)
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
        const { nama, kelas, jabatan, organisasi } = body;

        // Validation - Jabatan is no longer strictly required from client, defaults to 'Anggota'
        if (!nama || !kelas || !organisasi) {
            return NextResponse.json(
                { error: 'Nama, Kelas, dan Organisasi harus diisi' },
                { status: 400 }
            );
        }

        // Determine prefix based on organization
        let prefix = '';
        if (organisasi === 'OSIS') prefix = 'OS';
        else if (organisasi === 'MPK') prefix = 'MP';

        // Generate credentials with prefix
        const credentials = generateCredentials(prefix);
        const hashedPassword = await hashPassword(credentials.sandi);

        const newSiswa = {
            id: uuidv4(),
            kode: credentials.kode,
            sandi: hashedPassword,
            sandiPlain: credentials.sandi, // Store plain password for admin to view
            nama,
            kelas,
            jabatan: jabatan || 'Anggota', // Default to Anggota if not provided
            organisasi,
            createdAt: new Date().toISOString()
        };

        appendRow(DATA_FILES.SISWA, newSiswa);

        return NextResponse.json({
            success: true,
            data: {
                ...newSiswa,
                sandi: undefined,
                credentials: {
                    kode: credentials.kode,
                    sandi: credentials.sandi
                }
            }
        });

    } catch (error) {
        console.error('Create siswa error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// PUT - Update student (admin only)
export async function PUT(request) {
    try {
        const user = await getUserFromRequest(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Akses ditolak' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { id, nama, kelas, jabatan, organisasi } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'ID siswa harus disertakan' },
                { status: 400 }
            );
        }

        const existingSiswa = findByField(DATA_FILES.SISWA, 'id', id);

        if (!existingSiswa) {
            return NextResponse.json(
                { error: 'Siswa tidak ditemukan' },
                { status: 404 }
            );
        }

        const updateData = {};
        if (nama) updateData.nama = nama;
        if (kelas) updateData.kelas = kelas;
        if (jabatan) updateData.jabatan = jabatan;
        if (organisasi) updateData.organisasi = organisasi;

        updateRow(DATA_FILES.SISWA, id, updateData);

        return NextResponse.json({
            success: true,
            message: 'Siswa berhasil diperbarui'
        });

    } catch (error) {
        console.error('Update siswa error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// DELETE - Delete student (admin only)
export async function DELETE(request) {
    try {
        const user = await getUserFromRequest(request);

        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Akses ditolak' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID siswa harus disertakan' },
                { status: 400 }
            );
        }

        const deleted = deleteRow(DATA_FILES.SISWA, id);

        if (!deleted) {
            return NextResponse.json(
                { error: 'Siswa tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Siswa berhasil dihapus'
        });

    } catch (error) {
        console.error('Delete siswa error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
