import axios from 'axios';
import { getItem } from '@/utils/auth';

const BASE_URL = 'http://localhost:8080';

// Test kết nối cơ bản
export const testConnection = async () => {
    try {
        console.log('Testing connection to:', BASE_URL);
        const response = await axios.get(`${BASE_URL}/api/cars`, {
            timeout: 5000
        });
        console.log('Connection successful:', response.status);
        return true;
    } catch (error) {
        console.error('Connection failed:', error.message);
        return false;
    }
};

// Test với token
export const testWithToken = async () => {
    try {
        const token = getItem('token');
        if (!token) {
            console.log('No token found');
            return false;
        }
        
        console.log('Testing with token...');
        const response = await axios.get(`${BASE_URL}/api/users/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            timeout: 5000
        });
        console.log('Token test successful:', response.status);
        return true;
    } catch (error) {
        console.error('Token test failed:', error.response?.status, error.message);
        return false;
    }
};

// Test booking endpoint
export const testBookingEndpoint = async () => {
    try {
        const token = getItem('token');
        if (!token) {
            console.log('No token found for booking test');
            return false;
        }
        
        console.log('Testing booking endpoint...');
        const response = await axios.post(`${BASE_URL}/api/bookings`, {
            carId: 1,
            pickupLocation: "Test",
            dropoffLocation: "Test",
            pickupDateTime: "2025-09-01T06:30",
            dropoffDateTime: "2025-09-02T06:30"
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        console.log('Booking test successful:', response.status, response.data);
        return true;
    } catch (error) {
        console.error('Booking test failed:', error.response?.status, error.response?.data, error.message);
        return false;
    }
}; 