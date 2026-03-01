// School coordinates - 7°00'25.16"S 110°30'50.90"E (DMS) converted to decimal degrees
export const SCHOOL_COORDS = {
    latitude: -7.006989,
    longitude: 110.514139
};

// Geofencing radius in meters 
export const SCHOOL_RADIUS = 300;

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'presensi-osis-mpk-secret-key-2024';
export const JWT_EXPIRES_IN = '24h';

// Admin credentials
export const ADMIN_CREDENTIALS = {
    kode: 'admin',
    sandi: '970408'
};

// Attendance status options
export const ATTENDANCE_STATUS = {
    HADIR: 'hadir',
    IZIN: 'izin',
    SAKIT: 'sakit',
    PULANG: 'pulang'
};

// Organization types
export const ORGANIZATION_TYPES = {
    OSIS: 'OSIS',
    MPK: 'MPK'
};

// File paths for data storage
export const DATA_FILES = {
    SISWA: './data/siswa.xlsx',
    PRESENSI: './data/presensi.xlsx'
};
