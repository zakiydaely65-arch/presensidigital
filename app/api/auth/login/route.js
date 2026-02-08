import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPassword, signToken } from '@/lib/auth';
import { ADMIN_CREDENTIALS } from '@/lib/constants';

export async function POST(request) {
    try {
        const { kode, sandi } = await request.json();

        if (!kode || !sandi) {
            return NextResponse.json(
                { error: 'Kode dan sandi harus diisi' },
                { status: 400 }
            );
        }

        // Check if admin login
        if (kode === ADMIN_CREDENTIALS.kode && sandi === ADMIN_CREDENTIALS.sandi) {
            const token = await signToken({
                id: 'admin',
                kode: 'admin',
                nama: 'Administrator',
                role: 'admin'
            });

            const response = NextResponse.json({
                success: true,
                user: {
                    id: 'admin',
                    nama: 'Administrator',
                    role: 'admin'
                }
            });

            response.cookies.set('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 // 24 hours
            });

            return response;
        }

        // Find student by code in Supabase
        const { data: siswa, error } = await supabase
            .from('siswa')
            .select('*')
            .eq('kode', kode)
            .single();

        if (error || !siswa) {
            return NextResponse.json(
                { error: 'Kode atau sandi salah' },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(sandi, siswa.sandi_hash);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Kode atau sandi salah' },
                { status: 401 }
            );
        }

        // Create token
        const token = await signToken({
            id: siswa.id,
            kode: siswa.kode,
            nama: siswa.nama,
            organisasi: siswa.organisasi,
            role: 'siswa'
        });

        const response = NextResponse.json({
            success: true,
            user: {
                id: siswa.id,
                nama: siswa.nama,
                kelas: siswa.kelas,
                organisasi: siswa.organisasi,
                role: 'siswa'
            }
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

