import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest, hashPassword, verifyPassword } from '@/lib/auth';

export async function POST(request) {
    try {
        const user = await getUserFromRequest(request);

        if (!user || user.role !== 'siswa') {
            return NextResponse.json(
                { error: 'Akses ditolak' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { sandiLama, sandiBaru } = body;

        if (!sandiLama || !sandiBaru) {
            return NextResponse.json(
                { error: 'Sandi lama dan sandi baru harus diisi' },
                { status: 400 }
            );
        }

        // Get current user data from db
        const { data: siswa, error: fetchError } = await supabase
            .from('siswa')
            .select('sandi_hash')
            .eq('id', user.id)
            .single();

        if (fetchError || !siswa) {
            return NextResponse.json(
                { error: 'Pengguna tidak ditemukan' },
                { status: 404 }
            );
        }

        // Verify old password
        const isValid = await verifyPassword(sandiLama, siswa.sandi_hash);
        
        if (!isValid) {
            return NextResponse.json(
                { error: 'Sandi lama tidak sesuai' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await hashPassword(sandiBaru);

        // Update password in db
        const { error: updateError } = await supabase
            .from('siswa')
            .update({
                sandi_hash: hashedPassword,
                sandi_plain: sandiBaru // Update the plain password as well so admin can see it if necessary (based on existing logic)
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            message: 'Sandi berhasil diubah'
        });

    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
