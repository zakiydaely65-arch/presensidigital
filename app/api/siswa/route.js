import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest, generateCredentials, hashPassword } from '@/lib/auth';

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

        let query = supabase
            .from('siswa')
            .select('*')
            .order('created_at', { ascending: false });

        if (organisasi) {
            query = query.eq('organisasi', organisasi);
        }

        const { data: siswa, error } = await query;

        if (error) throw error;

        // Remove password hash from response, but keep sandi_plain for admin view if needed
        const safeSiswa = siswa.map(s => ({
            ...s,
            sandi_hash: undefined,
            // Map snake_case to camelCase for frontend compatibility if necessary, 
            // but let's keep it consistent with DB for now or map it back
            sandiPlain: s.sandi_plain // maintain existing key name for UI
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
        const { nama, kelas, organisasi } = body;

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

        const { data: newSiswa, error } = await supabase
            .from('siswa')
            .insert([{
                kode: credentials.kode,
                sandi_hash: hashedPassword,
                sandi_plain: credentials.sandi,
                nama,
                kelas,
                organisasi
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: {
                ...newSiswa,
                sandi_hash: undefined,
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
        const { id, nama, kelas, organisasi } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'ID siswa harus disertakan' },
                { status: 400 }
            );
        }

        const updateData = {};
        if (nama) updateData.nama = nama;
        if (kelas) updateData.kelas = kelas;
        if (organisasi) updateData.organisasi = organisasi;

        const { error } = await supabase
            .from('siswa')
            .update(updateData)
            .eq('id', id);

        if (error) throw error;

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

        const { error, count } = await supabase
            .from('siswa')
            .delete()
            .eq('id', id);

        if (error) throw error;

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

