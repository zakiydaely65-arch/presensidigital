import { getDistance } from 'geolib';
import { SCHOOL_COORDS, SCHOOL_RADIUS } from './constants';

// Calculate distance between two coordinates in meters
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    return getDistance(
        { latitude: lat1, longitude: lon1 },
        { latitude: lat2, longitude: lon2 }
    );
};

// Check if coordinates are within school radius
export const isWithinSchool = (latitude, longitude) => {
    const distance = calculateDistance(
        latitude,
        longitude,
        SCHOOL_COORDS.latitude,
        SCHOOL_COORDS.longitude
    );

    return distance <= SCHOOL_RADIUS;
};

// Get distance from school in meters
export const getDistanceFromSchool = (latitude, longitude) => {
    return calculateDistance(
        latitude,
        longitude,
        SCHOOL_COORDS.latitude,
        SCHOOL_COORDS.longitude
    );
};

// Get location status message
export const getLocationStatus = (latitude, longitude) => {
    const distance = getDistanceFromSchool(latitude, longitude);
    const isInSchool = distance <= SCHOOL_RADIUS;

    return {
        isInSchool,
        distance,
        message: isInSchool
            ? 'Anda berada di area sekolah'
            : `Anda berada ${Math.round(distance)} meter dari sekolah`
    };
};

// Client-side function to get current position
export const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation tidak didukung oleh browser Anda'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                let message = 'Gagal mendapatkan lokasi';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Akses lokasi ditolak. Mohon izinkan akses lokasi.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Informasi lokasi tidak tersedia.';
                        break;
                    case error.TIMEOUT:
                        message = 'Waktu permintaan lokasi habis.';
                        break;
                }
                reject(new Error(message));
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    });
};

// Watch position for real-time updates (client-side)
export const watchPosition = (callback, errorCallback) => {
    if (!navigator.geolocation) {
        errorCallback(new Error('Geolocation tidak didukung oleh browser Anda'));
        return null;
    }

    return navigator.geolocation.watchPosition(
        (position) => {
            callback({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            });
        },
        errorCallback,
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
};

// Clear watch position
export const clearWatch = (watchId) => {
    if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
    }
};
