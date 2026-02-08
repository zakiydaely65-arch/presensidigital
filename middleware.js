import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/api/auth/login'];

    // Check if the current route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Get token from cookies
    const token = request.cookies.get('token')?.value;

    // If accessing login page while logged in, redirect to appropriate dashboard
    if (pathname === '/login' && token) {
        const decoded = await verifyToken(token);
        if (decoded) {
            if (decoded.role === 'admin') {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
            return NextResponse.redirect(new URL('/siswa', request.url));
        }
    }

    // If accessing protected route without token, redirect to login
    if (!isPublicRoute && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If accessing protected route with token, verify it
    if (!isPublicRoute && token) {
        const decoded = await verifyToken(token);

        if (!decoded) {
            // Invalid token, redirect to login
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('token');
            return response;
        }

        // Check role-based access
        if (pathname.startsWith('/admin') && decoded.role !== 'admin') {
            return NextResponse.redirect(new URL('/siswa', request.url));
        }

        if (pathname.startsWith('/siswa') && decoded.role === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/(?!auth)).*)',
    ],
};
