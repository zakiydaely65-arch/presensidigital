import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest, hashPassword, generatePassword } from '@/lib/auth';

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
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'ID siswa harus disertakan' },
                { status: 400 }
            );
        }

        // Generate new random password
        const sandiBaru = generatePassword();
        const hashedPassword = await hashPassword(sandiBaru);

        // Update password in db
        const { error: updateError } = await supabase
            .from('siswa')
            .update({
                sandi_hash: hashedPassword,
                sandi_plain: sandiBaru // Update the plain password as well based on existing logic
            })
            .eq('id', id);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            data: {
                sandi: sandiBaru
            }
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
