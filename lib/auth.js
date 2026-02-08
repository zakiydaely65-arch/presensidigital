import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { JWT_SECRET, JWT_EXPIRES_IN } from './constants';

// Generate random credential code (6 characters + prefix)
export const generateCode = (prefix = '') => {
    const chars = '0123456789'; // Use numbers for the random part to make it cleaner with prefix
    let code = '';
    // If prefix is present, we generate 4 random numbers to make total length reasonable
    // If no prefix, we default to original 6 chars
    const length = prefix ? 4 : 6;

    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + code;
};

// Generate random password (8 characters)
export const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// Generate credentials (code and password)
export const generateCredentials = (prefix = '') => {
    return {
        kode: generateCode(prefix),
        sandi: generatePassword()
    };
};

// Hash password
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Verify password
export const verifyPassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

// Sign JWT token
export const signToken = async (payload) => {
    const secret = new TextEncoder().encode(JWT_SECRET);
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(secret);
};

// Verify JWT token
export const verifyToken = async (token) => {
    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        return null;
    }
};

// Parse token from cookie or header
export const getTokenFromRequest = (request) => {
    // Try to get token from cookie
    const cookieToken = request.cookies.get('token')?.value;
    if (cookieToken) {
        return cookieToken;
    }

    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return null;
};

// Get user from request - Now async!
export const getUserFromRequest = async (request) => {
    const token = getTokenFromRequest(request);
    if (!token) {
        return null;
    }

    return verifyToken(token);
};
