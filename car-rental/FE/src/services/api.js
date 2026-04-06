import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getToken } from "@/utils/auth"
import { getItem } from "@/utils/auth";

// Cấu hình base URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5277';

// Tạo instance Axios
const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000, // 30 giây timeout
});

// Cấu hình retry
axiosRetry(api, {
    retries: 3,
    retryDelay: (retryCount) => retryCount * 1000,
    retryCondition: (error) => error.response?.status === 429 || !error.response,
});

// Cache dùng Map
const cache = new Map();

// Invalidate cache
const invalidateCache = (key) => {
    cache.delete(key);
};

// Kiểm tra token hết hạn
const isTokenExpired = () => {
    const expiresAt = getItem('expiresAt');
    return !expiresAt || new Date().getTime() > parseInt(expiresAt, 10);
};

// Interceptor thêm token
api.interceptors.request.use(
    async (config) => {
        console.log('[API Request]', config.method?.toUpperCase(), config.url, config.data);
        const token = getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        console.log("Final headers:", config.headers);
        console.log("=== END REQUEST INTERCEPTOR ===");
        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Interceptor xử lý lỗi
api.interceptors.response.use(
    (response) => {
        console.log('[API Response]', response.status, response.config.url, response.data);
        // Auto-unwrap ApiResponse<T> = { success, data, message, statusCode }
        if (
            response.data &&
            typeof response.data === 'object' &&
            'success' in response.data &&
            'data' in response.data
        ) {
            response.data = response.data.data;
        }
        return response;
    },
    (error) => {
        console.error('[API Response Error]', error.response?.status, error.config?.url, error.message);
        console.log('[API Response Error] Current auth state:');
        console.log('[API Response Error] - Token:', getItem('token') ? 'Có' : 'Không có');
        console.log('[API Response Error] - Username:', getItem('username'));
        console.log('[API Response Error] - Role:', getItem('role'));
        console.log('[API Response Error] - ExpiresAt:', getItem('expiresAt'));
        
        if (error.response?.status === 401) {
            const existingToken = getItem('token');
            // Redirect khi có token nhưng bị từ chối (hết hạn HOẶC không hợp lệ với backend mới)
            if (existingToken) {
                const publicPaths = ['/', '/cars', '/car-detail', '/login', '/register', '/search', '/bookings/confirmation'];
                const isPublicPage = publicPaths.some(p =>
                    window.location.pathname === p || window.location.pathname.startsWith(p + '/')
                );
                if (!isPublicPage && !window.location.pathname.startsWith('/payment')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('expiresAt');
                    localStorage.removeItem('role');
                    localStorage.removeItem('username');
                    localStorage.removeItem('userId');
                    setTimeout(() => {
                        window.location.href = '/login?error=session_expired';
                    }, 100);
                }
            }
        }
        return Promise.reject(error);
    }
);

// Xử lý Google login callback
export const handleGoogleLoginCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const expiresAt = urlParams.get('expiresAt');
    const role = urlParams.get('role');
    const error = urlParams.get('error');

    if (error) {
        throw new Error(decodeURIComponent(error) || 'Đăng nhập Google thất bại');
    }

    if (token && expiresAt) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiresAt', expiresAt);
        localStorage.setItem('role', role || 'customer');
        window.location.href = '/';
        return { token, expiresAt, role };
    }
    throw new Error('Đăng nhập Google thất bại');
};

// Quản lý xác thực
export const login = async (username, password) => {
    if (!username || !password) throw new Error('Vui lòng cung cấp tên đăng nhập và mật khẩu');
    try {
        const response = await api.post('/api/auth/login', { email: username, password });
        // Backend wraps response in ApiResponse<AuthResponse> → { success, data: { token, role, ... } }
        return response.data?.data ?? response.data;
    } catch (error) {
        throw error;
    }
};

export const register = async (userData) => {
    if (!userData.email || !userData.password) throw new Error('Vui lòng cung cấp email và mật khẩu');
    try {
        const response = await api.post('/api/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error('[API] Register error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Đăng ký thất bại');
    }
};

export const sendEmailOtp = async (email) => {
    const response = await api.post('/api/auth/send-email-otp', { email });
    return response.data;
};

export const verifyEmailOtp = async (email, otp) => {
    const response = await api.post('/api/auth/verify-email-otp', { email, otp });
    return response.data;
};

export const checkEmail = async (email) => {
    if (!email) throw new Error('Vui lòng cung cấp email');
    try {
        const response = await api.post('/api/auth/check-email', { email });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Kiểm tra email thất bại');
    }
};

export const resetPassword = async (email, newPassword) => {
    if (!email || !newPassword) throw new Error('Vui lòng cung cấp email và mật khẩu mới');
    try {
        const response = await api.post('/api/auth/reset-password', { email, newPassword });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    }
};

// Sửa changePassword function trong api.js
export const changePassword = async (currentPassword, newPassword) => {
    if (!currentPassword || !newPassword) throw new Error('Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới');

    const payload = { currentPassword, newPassword };
    console.log('🔐 Change password payload:', payload);

    try {
        const response = await api.post('/api/auth/change-password', payload);
        console.log('✅ Change password success:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Change password error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        // Handle different error formats from backend
        const errorMessage = error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            'Đổi mật khẩu thất bại';
        throw new Error(errorMessage);
    }
};

export const loginWithGoogle = async () => {
    try {
        window.location.href = `${BASE_URL}/oauth2/authorization/google`;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Đăng nhập Google thất bại');
    }
};

export const logout = async () => {
    try {
        const response = await api.post('/api/auth/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('expiresAt');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        return response.data;
    } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('expiresAt');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        throw new Error(error.response?.data?.message || 'Đăng xuất thất bại');
    }
};

// Quản lý người dùng
export const getProfile = async () => {
    try {
        console.log('🔄 Fetching user profile...');
        const response = await api.get('/api/users/me');
        console.log('✅ Profile fetched successfully:', response.data);
        return response.data?.data ?? response.data;
    } catch (error) {
        console.error('❌ Profile fetch error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
            message: error.message
        });
        
        // Provide more specific error messages based on status code
        if (error.response?.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (error.response?.status === 403) {
            throw new Error('Bạn không có quyền truy cập thông tin này.');
        } else if (error.response?.status === 404) {
            throw new Error('Không tìm thấy thông tin người dùng.');
        } else if (error.response?.status === 500) {
            throw new Error('Lỗi hệ thống. Vui lòng thử lại sau.');
        } else {
            throw new Error(error.response?.data?.message || 'Lấy thông tin người dùng thất bại');
        }
    }
};

export const updateProfile = async (userData) => {
    if (!userData) throw new Error('Vui lòng cung cấp dữ liệu cập nhật');
    
    try {
        const response = await api.put('/api/users/me', userData);
        return response.data;
    } catch (error) {
        if (error && error.stack) {
            console.error('Update profile error:', error.stack);
        } else {
            console.error('Update profile error:', error);
        }
        // Handle different error formats from backend
        const errorMessage = error?.response?.data?.error || 
                            error?.response?.data?.message || 
                            error?.message || 
                            'Cập nhật hồ sơ thất bại';
        throw new Error(errorMessage);
    }
};

export const getAvailableCars = async (filters = {}, page = 0, size = 10) => {
    try {
        const params = {
            page,
            size,
            ...filters
        };

        // Đảm bảo có pickupDateTime và dropoffDateTime
        if (!params.pickupDateTime || !params.dropoffDateTime) {
            // Nếu không có, sử dụng thời gian mặc định (hiện tại + 1 ngày)
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            params.pickupDateTime = params.pickupDateTime || now.toISOString();
            params.dropoffDateTime = params.dropoffDateTime || tomorrow.toISOString();
        }

        const response = await api.get('/api/cars/available', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching available cars:', error);
        if (error.message.includes('CORS')) return { content: [], totalElements: 0, totalPages: 1 };
        throw new Error(error.response?.data?.message || 'Lấy danh sách xe available thất bại');
    }
};

export const toggleNotifications = async (userId, enable) => {
    if (!userId) throw new Error('Vui lòng cung cấp ID người dùng');
    try {
        const response = await api.patch(`/api/users/${userId}/notifications`, { emailNotifications: enable });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Cập nhật cài đặt thông báo thất bại');
    }
};

// Quản lý người dùng (Admin)
export const getUsers = async (page, size, role, status) => {
    try {
        const response = await api.get('/api/users', {
            params: {
                page,
                size,
                role: role || 'all',
                status: status || 'all',
            },
        });
        return response.data; // Trả về Page<UserDTO> với content, totalPages, v.v.
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách người dùng thất bại');
    }
};

export const toggleUserStatus = async (userId, reason = null) => {
    console.log("=== BẮT ĐẦU TOGGLE USER STATUS (FRONTEND) ===");
    console.log("User ID:", userId);
    console.log("Reason:", reason);
    console.log("Current token:", getItem('token'));
    
    try {
        const requestBody = {
            reason: reason
        };
        
        console.log("Request body:", requestBody);
        console.log("API URL:", `/api/users/${userId}/toggle-status`);
        
        const response = await api.patch(`/api/users/${userId}/toggle-active`, requestBody, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log("Response status:", response.status);
        console.log("Response data:", response.data);
        console.log("=== KẾT THÚC TOGGLE USER STATUS (FRONTEND) - THÀNH CÔNG ===");
        return response.data; // Trả về UserDTO đã cập nhật
    } catch (error) {
        console.error("=== LỖI TOGGLE USER STATUS (FRONTEND) ===");
        console.error("User ID:", userId);
        console.error("Reason:", reason);
        console.error("Error object:", error);
        console.error("Error response:", error.response);
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);
        console.error("Error message:", error.message);
        console.error("=== KẾT THÚC LỖI TOGGLE USER STATUS (FRONTEND) ===");
        throw new Error(error.response?.data?.message || 'Chuyển đổi trạng thái người dùng thất bại');
    }
};

// Quản lý yêu thích
export const getFavorites = async () => {
    const cacheKey = 'favorites';
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    try {
        const response = await api.get('/api/favorites');
        cache.set(cacheKey, response.data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách yêu thích thất bại');
    }
};

export const addFavorite = async (carId) => {
    if (!carId) throw new Error('Vui lòng cung cấp ID xe');
    try {
        const response = await api.post('/api/favorites/toggle', { carId });
        invalidateCache('favorites');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Thêm vào yêu thích thất bại');
    }
};

export const removeFavorite = async (carId) => {
    if (!carId) throw new Error('Vui lòng cung cấp ID xe');
    try {
        const response = await api.post('/api/favorites/toggle', { carId });
        invalidateCache('favorites');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Xóa khỏi yêu thích thất bại');
    }
};

// Quản lý xe
export const getCars = async (filters = {}) => {
    try {
        const response = await api.get('/api/cars', { params: filters });
        return response.data;
    } catch (error) {
        if (error.message.includes('CORS')) return [];
        throw new Error(error.response?.data?.message || 'Lấy danh sách xe thất bại');
    }
};

export const searchCars = async (filters = {}, page = 0, size = 10) => {
    // XÓA dropoffLocation khỏi filters nếu có
    const { dropoffLocation, ...restFilters } = filters;
    try {
        const params = {
            ...restFilters, 
            page,
            size,
            sort: 'createdAt,desc',
        };

        // Thêm date filters nếu có
        if (filters.pickupDateTime) {
            params.pickupDateTime = filters.pickupDateTime;
        }
        if (filters.dropoffDateTime) {
            params.dropoffDateTime = filters.dropoffDateTime;
        }

        const response = await api.get('/api/cars/filter', { params });
        return response.data?.data ?? response.data;
    } catch (error) {
        if (error.message.includes('CORS')) return { content: [] };
        throw new Error(error.response?.data?.message || 'Tìm kiếm xe thất bại');
    }
};

export const getCarById = async (carId) => {
    if (!carId) throw new Error('Vui lòng cung cấp ID xe');
    try {
        const response = await api.get(`/api/cars/${carId}`);
        const car = response.data?.data ?? response.data;
        if (!car) return car;
        // Normalize field names for frontend compatibility
        return {
            ...car,
            model: car.carModel || car.model,
            dailyRate: car.rentalPricePerDay || car.dailyRate,
            images: car.images || (car.imageUrls || []).map(url => ({ imageUrl: url })),
        };
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy thông tin xe thất bại');
    }
};


export const getBookedDates = async (carId) => {
    try {
        const response = await api.get(`/api/cars/${carId}/booked-dates`);
        return response.data;
    } catch (error) {
        console.error('Error fetching booked dates:', error);
        throw new Error(error.response?.data?.message || 'Lấy lịch đặt xe thất bại');
    }
};


export const getCarBrands = async () => {
    const cacheKey = 'carBrands';
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    try {
        const token = getToken();
        const response = await api.get('/api/cars/brands', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const result = response.data?.data ?? response.data;
        cache.set(cacheKey, result);
        return result;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách thương hiệu xe thất bại');
    }
};

export const getCarFeatures = async (carId) => {
    if (!carId) throw new Error('Vui lòng cung cấp ID xe');
    try {
        const response = await api.get(`/api/cars/${carId}/features`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy tính năng xe thất bại');
    }
};

export const getCarSpecifications = async (carId) => {
    if (!carId) throw new Error('Vui lòng cung cấp ID xe');
    try {
        const response = await api.get(`/api/cars/${carId}/specifications`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy thông số kỹ thuật xe thất bại');
    }
};

export const getAdditionalServices = async (carId) => {
    if (!carId) throw new Error('Vui lòng cung cấp ID xe');
    try {
        const response = await api.get('/api/service-types', { params: { carId } });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy dịch vụ bổ sung thất bại');
    }
};

// Quản lý địa điểm
export const getRegions = async () => {
    const cacheKey = 'regions';
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    try {
        const token = getToken();
        const response = await api.get('/api/cars/regions', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const result = response.data?.data ?? response.data;
        cache.set(cacheKey, result);
        return result;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách địa điểm thất bại');
    }
};

// Quản lý đặt xe
export const createBooking = async (bookingData) => {
    try {
        // Validate booking data
        if (!bookingData.carId) throw new Error('Vui lòng chọn xe');
        if (!bookingData.pickupDateTime) throw new Error('Vui lòng chọn thời gian nhận xe');
        if (!bookingData.dropoffDateTime) throw new Error('Vui lòng chọn thời gian trả xe');
        if (!bookingData.pickupLocation) throw new Error('Vui lòng nhập địa điểm nhận xe');
        if (!bookingData.dropoffLocation) throw new Error('Vui lòng nhập địa điểm trả xe');

        // Validate dates
        const pickupDate = new Date(bookingData.pickupDateTime);
        const dropoffDate = new Date(bookingData.dropoffDateTime);
        const now = new Date();

        if (pickupDate < now) {
            throw new Error('Thời gian nhận xe không được trong quá khứ');
        }

        if (dropoffDate <= pickupDate) {
            throw new Error('Thời gian trả xe phải sau thời gian nhận xe');
        }

        // Calculate rental duration in hours
        const durationInHours = (dropoffDate - pickupDate) / (1000 * 60 * 60);
        if (durationInHours < 4) {
            throw new Error('Thời gian thuê tối thiểu là 4 giờ');
        }
        if (durationInHours > 720) { // 30 days
            throw new Error('Thời gian thuê tối đa là 30 ngày');
        }

        // Check if user has reached booking limit
        const userId = getItem('userId');
        if (userId) {
            const userBookings = await getBookingsByUserId(userId);
            const activeBookings = userBookings.filter(b => 
                b.status !== 'CANCELLED' && b.status !== 'COMPLETED'
            );
            if (activeBookings.length >= 10) {
                throw new Error('Bạn đã đạt giới hạn số lần đặt xe (tối đa 3 lần)');
            }
        }

        const response = await api.post('/api/bookings', bookingData);
        return response.data;
    } catch (error) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }
};

export const confirmBooking = async (bookingData) => {
    try {
        // Validate confirmation data
        if (!bookingData.bookingId) throw new Error('Không tìm thấy thông tin đặt xe');
        if (!bookingData.contactInfo) throw new Error('Vui lòng cung cấp thông tin liên hệ');
        if (!bookingData.paymentMethod) throw new Error('Vui lòng chọn phương thức thanh toán');

        // Validate contact info
        const { fullName, phone, email, address } = bookingData.contactInfo;
        if (!fullName) throw new Error('Vui lòng nhập họ và tên');
        if (!phone) throw new Error('Vui lòng nhập số điện thoại');
        if (!email) throw new Error('Vui lòng nhập email');
        if (!address) throw new Error('Vui lòng nhập địa chỉ');

        // Validate phone number format
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            throw new Error('Số điện thoại không hợp lệ');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Email không hợp lệ');
        }

        // Check if booking is still available
        const booking = await getBookingById(bookingData.bookingId);
        if (booking.status !== 'PENDING') {
            throw new Error('Đặt xe này không còn khả dụng');
        }

        // Check if car is still available for the selected time
        const carBookings = await getBookingsByCarId(booking.carId);
        const isCarAvailable = carBookings.every(b => 
            b.bookingId === bookingData.bookingId || 
            b.status === 'CANCELLED' || 
            b.status === 'COMPLETED' ||
            new Date(b.dropoffDateTime) <= new Date(booking.pickupDateTime) ||
            new Date(b.pickupDateTime) >= new Date(booking.dropoffDateTime)
        );

        if (!isCarAvailable) {
            throw new Error('Xe không còn khả dụng trong khoảng thời gian này');
        }

        const response = await api.post('/api/bookings/confirm', bookingData);
        return response.data;
    } catch (error) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }
};

export const getBookingFinancials = async (bookingId) => {
    if (!bookingId) throw new Error('Vui lòng cung cấp ID đặt xe');
    try {
        const response = await api.get(`/api/bookings/${bookingId}/financial`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy thông tin tài chính thất bại');
    }
};

export const getPriceBreakdown = async (bookingId) => {
    if (!bookingId) throw new Error('Vui lòng cung cấp ID đặt xe');
    try {
        const response = await api.get(`/api/bookings/${bookingId}/price-breakdown`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy thông tin giá thất bại');
    }
};

export const updateBooking = async (bookingId, bookingData) => {
    if (!bookingId) throw new Error('Vui lòng cung cấp ID đặt xe');
    try {
        const response = await api.put(`/api/bookings/${bookingId}`, bookingData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Cập nhật đặt xe thất bại');
    }
};

// Hủy booking (customer)
export const cancelBooking = async (bookingId) => {
    if (!bookingId) throw new Error('Thiếu bookingId');
    try {
        const response = await api.post(`/api/bookings/${bookingId}/cancel`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Không thể hủy booking');
    }
};

// Xóa booking (admin hoặc chủ booking)
export const deleteBooking = async (bookingId) => {
    if (!bookingId) throw new Error('Thiếu bookingId');
    try {
        const response = await api.delete(`/api/bookings/${bookingId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Không thể xóa booking');
    }
};

// Quản lý khuyến mãi
export const applyPromotion = async (promoCode) => {
    if (!promoCode) throw new Error('Vui lòng cung cấp mã khuyến mãi');
    try {
        const response = await api.post('/api/promotions/apply', { promoCode });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Áp dụng mã khuyến mãi thất bại');
    }
};

export const getActivePromotions = async () => {
    const cacheKey = 'activePromotions';
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    try {
        const response = await api.get('/api/promotions/active');
        cache.set(cacheKey, response.data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách mã khuyến mãi thất bại');
    }
};

// Quản lý thanh toán
// Stripe payment
export const createStripePaymentIntent = async (bookingId, amount) => {
    const response = await api.post('/api/payment/stripe/create-intent', { bookingId, amount });
    return response.data;
};

export const confirmStripePayment = async (bookingId, paymentIntentId) => {
    const response = await api.post('/api/payment/stripe/confirm', { bookingId, paymentIntentId });
    return response.data;
};

export const initiatePayment = async (paymentData) => {
    try {
        const response = await post('/api/payments', paymentData);
        return response;
    } catch (error) {
        console.error('Payment initiation failed:', error);
        throw error;
    }
};

export const processPayment = async (paymentData) => {
    try {
        const response = await post('/api/payments/process', paymentData);
        return response;
    } catch (error) {
        console.error('Payment processing failed:', error);
        throw error;
    }
};

// Quản lý báo cáo hư hỏng
export const uploadDamageReport = async (file, description, carId) => {
    if (!file) throw new Error('Vui lòng cung cấp file để upload');
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description || '');
        if (carId) formData.append('carId', carId);
        const response = await api.post('/api/images/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Upload báo cáo hư hỏng thất bại');
    }
};




// Quản lý lịch sử thuê xe
export const getRentalHistory = async (carId) => {
    if (!carId) throw new Error('Vui lòng cung cấp ID xe');
    try {
        const response = await api.get('/api/bookings', {
            params: {
                carId,
                status: 'completed',
                sort: 'createdAt,desc',
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy lịch sử thuê xe thất bại');
    }
};

// Lấy lịch sử đặt xe theo user
export const getBookingsByUserId = async (userId) => {
    if (!userId) throw new Error('Vui lòng cung cấp ID người dùng');
    try {
        const response = await api.get(`/api/bookings/user/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy lịch sử đặt xe thất bại');
    }
};

// Hàm POST tổng quát
export const post = async (url, data) => {
    try {
        const token = getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
        
        const response = await api.post(url, data, { headers });
        return response.data;
    } catch (error) {
        console.log('[API Post] Error occurred:', error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
            console.log('[API Post] 401 error detected, but not clearing tokens immediately');
            console.log('[API Post] Let the calling code handle the 401 error');
            // Không xóa token ngay lập tức, để code gọi API xử lý
            // localStorage.removeItem('token');
            // localStorage.removeItem('expiresAt');
            // localStorage.removeItem('role');
            // window.location.href = '/login?error=unauthorized';
        }
        throw error;
    }
};

// Car APIs
export const getSimilarCars = async (carId, page = 0, size = 4) => {
    if (!carId) throw new Error('Vui lòng cung cấp ID xe');
    try {
        const response = await api.get(`/api/cars/${carId}/similar`, {
            params: { page, size },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách xe tương tự thất bại');
    }
};

export const getSimilarCarsAdvanced = async (carId, page = 0, size = 4) => {
    if (!carId) throw new Error('Vui lòng cung cấp ID xe');
    try {
        const response = await api.get(`/api/cars/${carId}/similar-advanced`, {
            params: { page, size },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách xe tương tự nâng cao thất bại');
    }
};

// Test authentication endpoint
export const testAuth = async () => {
    try {
        console.log('🧪 Testing authentication...');
        const response = await api.get('/api/users/me');
        console.log('✅ Auth test successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Auth test failed:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
        });
        throw error;
    }
};


export const getUserBookingHistory = async () => {
    try {
        console.log('🔄 Fetching user booking history...');
        
        // ✅ SỬA: Gọi endpoint UserController thay vì BookingController
        const response = await api.get('/api/bookings/my-bookings');
        
        console.log('✅ Booking history fetched successfully:', response.data);
        
        return response.data;
    } catch (error) {
        console.error('❌ Booking history fetch error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            message: error.message
        });
        
        if (error.response?.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (error.response?.status === 403) {
            throw new Error('Bạn không có quyền truy cập.');
        } else if (error.response?.status === 404) {
            throw new Error('Không tìm thấy thông tin người dùng.');
        } else {
            throw new Error(error.response?.data?.error || 'Lỗi khi tải lịch sử đặt xe');
        }
    }
};

// Send email verification
export const sendEmailVerification = async () => {
    try {
        console.log('🔄 Sending email verification...');
        const response = await api.post('/api/users/send-email-verification');
        console.log('✅ Email verification sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Send email verification error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || 'Lỗi khi gửi email xác thực');
    }
};

// Verify email
export const verifyEmail = async (token) => {
    try {
        console.log('🔄 Verifying email...');
        const response = await api.post('/api/users/verify-email', { token });
        console.log('✅ Email verified successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Verify email error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || 'Lỗi khi xác thực email');
    }
};
export const getFavoriteCars = async () => {
    try {
        console.log('🔄 Fetching favorite cars...');
        const response = await api.get('/api/favorites');
        console.log('✅ Favorite cars fetched:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Fetch favorites error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || 'Lỗi khi tải xe yêu thích');
    }
};

// Get booking details
export const getBookingDetails = async (bookingId) => {
    try {
        console.log('🔄 Fetching booking details for ID:', bookingId);
        console.log('🔍 Current token:', getItem('token') ? 'Present' : 'Missing');
        console.log('🔍 Current role:', getItem('role'));
        
        const response = await api.get(`/api/bookings/${bookingId}`);
        console.log('✅ Booking details fetched:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Fetch booking details error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            headers: error.config?.headers
        });
        
        // Xử lý các loại lỗi cụ thể
        if (error.response?.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (error.response?.status === 403) {
            const errorData = error.response?.data;
            if (errorData?.code === 'ACCESS_DENIED') {
                throw new Error(errorData.error || 'Bạn không có quyền xem chi tiết đặt xe này.');
            }
            throw new Error('Bạn không có quyền truy cập.');
        } else if (error.response?.status === 404) {
            throw new Error('Không tìm thấy thông tin đặt xe.');
        } else if (error.response?.status === 500) {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Lỗi hệ thống';
            throw new Error(errorMsg);
        } else {
            throw new Error(error.response?.data?.error || 'Lỗi khi tải chi tiết đặt xe');
        }
    }
};

export const filterCars = (filters, page = 0, size = 9, sortBy = "") => {
    const params = { ...filters, page, size };
    if (sortBy) params.sortBy = sortBy;
    
    // Thêm date filters nếu có
    if (filters.pickupDateTime) {
        params.pickupDateTime = filters.pickupDateTime;
    }
    if (filters.dropoffDateTime) {
        params.dropoffDateTime = filters.dropoffDateTime;
    }
    
    return api.get("/api/cars/filter", { params });
};

export const findCars = async (searchQuery, page = 0, size = 9) => {
    try {
        const token = getToken();
        const response = await api.get('/api/cars/filter', {
            params: {
                keyword: searchQuery,
                page,
                size
            },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return response.data?.data ?? response.data;
    } catch (error) {
        console.error('Error searching cars:', error);
        throw new Error(error.response?.data?.message || 'Tìm kiếm xe thất bại');
    }
};

export const getBookingById = async (bookingId) => {
    if (!bookingId) throw new Error('Vui lòng cung cấp ID đặt xe');
    try {
        const response = await api.get(`/api/bookings/${bookingId}`);
        const data = response.data?.data ?? response.data;
        if (!data) return data;
        // Build nested car object from flat BookingDto fields
        return {
            ...data,
            carId: data.carId || data.car_id,
            car: data.car || {
                model: data.carModel,
                carModel: data.carModel,
                brandName: data.carBrand,
                imageUrl: data.carThumbnail,
                images: data.carThumbnail ? [{ imageUrl: data.carThumbnail }] : [],
            },
        };
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy thông tin đặt xe thất bại');
    }
};

export const getBookingByTransactionId = async (transactionId) => {
    if (!transactionId) throw new Error('Vui lòng cung cấp ID giao dịch');
    try {
        const response = await api.get(`/api/bookings/by-payment/${transactionId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy thông tin đặt xe qua ID giao dịch thất bại');
    }
};

export const ensureBookingFinancials = async (bookingId) => {
    if (!bookingId) throw new Error('Vui lòng cung cấp ID đặt xe');
    try {
        console.log('[API] Calling ensureBookingFinancials for bookingId:', bookingId);
        console.log('[API] Current token:', getItem('token') ? 'Có' : 'Không có');
        const response = await api.post(`/api/bookings/${bookingId}/ensure-financials`);
        console.log('[API] ensureBookingFinancials response:', response.data);
        return response.data;
    } catch (error) {
        console.error('[API] ensureBookingFinancials error:', error.response?.status, error.response?.data);
        throw new Error(error.response?.data?.message || 'Đảm bảo thông tin tài chính thất bại');
    }
}
export const getReportsData = async () => {
    try {
        const response = await api.get('/api/reports/overview');
        return response.data?.data ?? response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy dữ liệu báo cáo thất bại');
    }
};

export const getMonthlyUserRegistrations = async () => {
    try {
        const response = await api.get('/api/reports/user-registrations');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy thống kê đăng ký người dùng thất bại');
    }
}
// Lấy booking gần đây nhất cho dashboard admin
export const getRecentBookings = async (size = 5) => {
    const token = getToken();
    const response = await api.get(`/api/admin/bookings/recent?size=${size}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    return response.data;
};

// Lấy khách hàng mới đăng ký theo tháng/năm cho dashboard admin
export const getNewUsersByMonth = async (month, year) => {
    const token = getToken();
    const response = await api.get(`/api/users/new-by-month?month=${month}&year=${year}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    return response.data;
};

// Lấy user có booking gần đây nhất cho dashboard admin
export const getRecentBookingUsers = async (size = 5) => {
    const token = getToken();
    const response = await api.get(`/api/users/recent-userbooking?size=${size}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    return response.data;
};

// Lấy danh sách xe của supplier
export const getSupplierCars = async () => {
    const res = await api.get('/api/cars/supplier/my-cars');
    const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    // Normalize field names to match frontend component expectations
    return raw.map(car => ({
        ...car,
        model: car.carModel || car.model || '',
        dailyRate: car.rentalPricePerDay ?? car.dailyRate ?? 0,
        image: car.thumbnailUrl || car.image || null,
        statusName: car.status || car.statusName || '',
        brandName: car.brandName || '',
    }));
};

// Thêm xe mới cho supplier
export const addSupplierCar = async (carData, images = []) => {
    // 1. Fetch lookups để map name → id
    const [brandsRes, fuelTypesRes, regionsRes] = await Promise.all([
        api.get('/api/cars/brands').catch(() => ({ data: [] })),
        api.get('/api/cars/fuel-types').catch(() => ({ data: [] })),
        api.get('/api/cars/regions').catch(() => ({ data: [] })),
    ]);
    const brands = Array.isArray(brandsRes.data) ? brandsRes.data : (brandsRes.data?.data || []);
    const fuelTypes = Array.isArray(fuelTypesRes.data) ? fuelTypesRes.data : (fuelTypesRes.data?.data || []);
    const regions = Array.isArray(regionsRes.data) ? regionsRes.data : (regionsRes.data?.data || []);

    const brandObj = brands.find(b => b.brandName?.toLowerCase() === carData.brand?.toLowerCase()) || brands[0];
    const fuelObj = fuelTypes.find(f => f.fuelTypeName?.toLowerCase() === carData.fuelType?.toLowerCase()) || fuelTypes[0];
    const regionObj = regions.find(r => r.regionName?.toLowerCase() === carData.region?.toLowerCase()) || regions[0];

    // 2. Upload ảnh lên Cloudinary
    const imageUrls = [];
    for (const img of images) {
        const fd = new FormData();
        fd.append('file', img);
        try {
            const uploadRes = await api.post('/api/chat/upload-image', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            imageUrls.push(typeof uploadRes.data === 'string' ? uploadRes.data : uploadRes.data?.url || uploadRes.data);
        } catch { /* skip failed uploads */ }
    }

    // 3. Gửi JSON với field names đúng
    const body = {
        carModel: carData.name || carData.model,
        carBrandId: brandObj?.carBrandId || 1,
        fuelTypeId: fuelObj?.fuelTypeId || 1,
        licensePlate: carData.licensePlate,
        year: carData.year ? parseInt(carData.year) : undefined,
        seats: carData.numOfSeats ? parseInt(carData.numOfSeats) : undefined,
        transmission: carData.transmission,
        rentalPricePerDay: parseFloat(carData.rentalPrice || carData.dailyRate),
        description: carData.description,
        regionId: regionObj?.regionId,
        imageUrls,
    };
    console.log('[addSupplierCar] body:', JSON.stringify(body));
    try {
        const res = await api.post('/api/cars', body);
        return res.data;
    } catch (err) {
        const msg = err?.response?.data?.message || err?.response?.data?.error || err?.response?.data || err.message;
        console.error('[addSupplierCar] error:', msg, err?.response?.data);
        throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
};

// Xóa xe của supplier
export const deleteSupplierCar = async (carId) => {
    if (!carId) throw new Error('Vui lòng cung cấp ID xe');
    const token = getToken?.() || getItem('token');
    const res = await api.delete(`/api/cars/${carId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// Cập nhật xe của supplier
export const updateSupplierCar = async (carId, carData) => {
    if (!carId) throw new Error('Vui lòng cung cấp ID xe');
    const body = {
        carModel: carData.name || carData.model || carData.carModel,
        licensePlate: carData.licensePlate,
        year: carData.year ? parseInt(carData.year) : undefined,
        seats: carData.numOfSeats ? parseInt(carData.numOfSeats) : (carData.seats ? parseInt(carData.seats) : undefined),
        transmission: carData.transmission,
        rentalPricePerDay: carData.rentalPrice ? parseFloat(carData.rentalPrice) : (carData.rentalPricePerDay ? parseFloat(carData.rentalPricePerDay) : undefined),
        description: carData.description,
        imageUrls: carData.imageUrls,
    };
    const res = await api.put(`/api/cars/${carId}`, body);
    return res.data;
};

// Lấy danh sách booking của supplier (đúng endpoint backend)
export const getSupplierOrders = async () => {
    const res = await api.get('/api/bookings/supplier/bookings');
    const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return raw.map(b => {
        const carModel = b.carModel || b.car?.carModel || b.car?.model || '';
        const licensePlate = b.licensePlate || b.car?.licensePlate || '';
        const customerEmail = b.customerEmail || b.customer?.email || '';
        const customerName = b.customerName || b.customer?.userDetail?.fullName || b.customer?.fullName || b.customer?.name || customerEmail || '';
        return {
            ...b,
            statusName: b.statusName || b.status?.statusName || '',
            carModel,
            customerName,
            licensePlate,
            car: b.car
                ? { ...b.car, model: b.car.model || b.car.carModel || carModel, licensePlate: b.car.licensePlate || licensePlate }
                : { model: carModel, carModel, licensePlate },
            customer: b.customer
                ? { ...b.customer, name: b.customer.name || customerName, email: b.customer.email || customerEmail }
                : { name: customerName, email: customerEmail },
            totalAmount: b.totalPrice || b.totalAmount || b.totalFare || b.bookingFinancial?.totalFare || 0,
            totalPrice: b.totalPrice || b.totalAmount || b.bookingFinancial?.totalFare || 0,
            pickupDateTime: b.pickupDateTime || b.startDate || null,
            dropoffDateTime: b.dropoffDateTime || b.endDate || null,
        };
    });
};

// Dashboard APIs
export const getSupplierDashboardSummary = async () => {
    const [carsRes, bookingsRes] = await Promise.all([
        api.get('/api/cars/supplier/my-cars').catch(() => ({ data: [] })),
        api.get('/api/bookings/supplier/bookings').catch(() => ({ data: [] })),
    ]);
    const cars = Array.isArray(carsRes.data) ? carsRes.data : (carsRes.data?.data || []);
    const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data?.data || []);
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || b.totalFare || 0), 0);
    return {
        totalCars: cars.length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => (b.statusName || b.status?.statusName || '').toLowerCase() === 'pending').length,
        totalRevenue,
    };
};

export const getSupplierRecentBookings = async () => {
    const res = await api.get('/api/bookings/supplier/bookings');
    return res.data;
};

export const getSupplierMonthlyStats = async () => {
    const res = await api.get('/api/bookings/supplier/bookings').catch(() => ({ data: [] }));
    const bookings = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    // Build last 6 months stats
    const now = new Date();
    const months = [];
    const revenueByMonth = [];
    const bookingsByMonth = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${d.getMonth() + 1}/${d.getFullYear()}`);
        const inMonth = bookings.filter(b => {
            const created = new Date(b.startDate || b.createdAt || 0);
            return created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
        });
        revenueByMonth.push(inMonth.reduce((sum, b) => sum + (b.totalPrice || b.totalFare || 0), 0));
        bookingsByMonth.push(inMonth.length);
    }
    return { months, revenueByMonth, bookingsByMonth };
};

export const getNextBookingId = async () => {
    try {
        const response = await api.get('/api/bookings/next-id');
        return response.data.nextBookingId;
    } catch (error) {
        console.error('Error fetching next booking ID:', error);
        throw new Error(error.response?.data?.message || 'Không thể lấy booking ID tiếp theo');
    }
};

export const getUserById = async (userId) => {
    if (!userId) throw new Error('Vui lòng cung cấp ID người dùng');
    try {
      const response = await api.get(`/api/users/public/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Lấy thông tin người dùng thất bại');
    }
  };

/**
 * Gửi form đăng ký chủ xe (có upload file) lên backend
 * @param {Object} data - { fullName, idNumber, address, phoneNumber, email, carDocuments, businessLicense, driverLicense }
 * @returns {Promise<any>}
 */
export const createOwnerRegistrationRequest = async (data) => {
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('idNumber', data.idNumber);
    formData.append('address', data.address);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('email', data.email);
    formData.append('password', data.password || '');
    formData.append('carDocuments', data.carDocuments);
    formData.append('businessLicense', data.businessLicense);
    formData.append('driverLicense', data.driverLicense);
    try {
        const response = await api.post(
            `/api/registration-requests`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Gửi yêu cầu đăng ký chủ xe thất bại');
    }
};

//Rating apis

// ...existing code...

// Lấy danh sách country code
export const getCountryCodes = async () => {
    try {
        const response = await api.get('/api/country-codes');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách mã quốc gia');
    }
};

// Lấy danh sách customer đã từng nhắn với supplier
export const getCustomersOfSupplier = async (supplierId) => {
    const res = await api.get(`/api/chat-messages/customers-of-supplier/${supplierId}`);
    return res.data;
};

// Rating APIs
export const getAllRatings = async () => {
    // Backend does not have GET /api/ratings; return empty array
    return [];
};

export const getRatingsByCarId = async (carId) => {
    const cacheKey = `ratings-car-${carId}`;
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }
    
    try {
        const response = await api.get(`/api/ratings/car/${carId}`);
        cache.set(cacheKey, response.data);
        setTimeout(() => cache.delete(cacheKey), 30000); // Cache 30 giây
        return response.data;
    } catch (error) {
        console.error(`Error fetching ratings for car ${carId}:`, error);
        throw new Error(error.response?.data?.message || 'Không thể tải đánh giá của xe');
    }
};

export const createRating = async (ratingData) => {
    try {
        const response = await api.post('/api/ratings', ratingData);
        
        // Invalidate cache
        invalidateCache('all-ratings');
        invalidateCache(`ratings-car-${ratingData.carId}`);
        
        return response.data;
    } catch (error) {
        console.error('Error creating rating:', error);
        throw new Error(error.response?.data?.message || 'Không thể tạo đánh giá');
    }
};

export const updateRating = async (ratingId, ratingData) => {
    try {
        const response = await api.put(`/api/ratings/${ratingId}`, ratingData);
        // Invalidate cache
        invalidateCache('all-ratings');
        if (ratingData.carId) invalidateCache(`ratings-car-${ratingData.carId}`);
        return response.data;
    } catch (error) {
        console.error('Error updating rating:', error);
        throw new Error(error.response?.data?.message || 'Không thể sửa đánh giá');
    }
};

export const getRatingSummaryByCarId = async (carId) => {
    try {
        const response = await api.get(`/api/ratings/car/${carId}/average`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching rating summary for car ${carId}:`, error);
        throw new Error(error.response?.data?.message || 'Không thể tải thống kê đánh giá');
    }
};

// ✅ API cho customer confirm
export const confirmDelivery = async (bookingId) => {
    try {
        console.log('🔄 Confirming delivery for booking:', bookingId);
        const response = await api.put(`/api/bookings/${bookingId}/confirm-delivery`);
        console.log('✅ Delivery confirmed:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Confirm delivery error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || 'Không thể xác nhận nhận xe');
    }
};

export const confirmReturn = async (bookingId) => {
    try {
        console.log('🔄 Confirming return for booking:', bookingId);
        const response = await api.put(`/api/bookings/${bookingId}/confirm-return`);
        console.log('✅ Return confirmed:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Confirm return error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || 'Không thể xác nhận trả xe');
    }
};

// ✅ API cho thanh toán tiền nhận xe
export const createPaymentForPickup = async (bookingId, paymentData) => {
    try {
        console.log('🔄 Creating pickup payment for booking:', bookingId);
        const response = await api.post(`/api/payments/pickup/${bookingId}`, paymentData);
        console.log('✅ Pickup payment created:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Create pickup payment error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || 'Không thể tạo thanh toán nhận xe');
    }
};

/**
 * Supplier xác nhận nhận lại xe (kết thúc chuyến, chuẩn bị hoàn cọc)
 */
export const supplierConfirmReturn = async (bookingId) => {
    try {
        const response = await api.put(`/api/bookings/${bookingId}/supplier-confirm-return`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Không thể xác nhận nhận lại xe');
    }
};

/**
 * Supplier thực hiện hoàn tiền cọc cho khách
 */
export const refundDeposit = async (bookingId) => {
    try {
        const response = await api.post(`/api/payments/refund`, { bookingId });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Không thể hoàn tiền cọc');
    }
};

/**
 * Lấy tất cả payment (admin)
 */
export const getAllPayments = async () => {
    try {
        const response = await api.get('/api/payment');
        const raw = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        return raw;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách payment thất bại');
    }
};

/**
 * Admin thực hiện payout cho supplier
 */
export const payoutSupplier = async (bookingId) => {
    try {
        const response = await api.post('/api/payments/payout', { bookingId });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Chuyển tiền cho supplier thất bại');
    }
};

export const supplierConfirmBooking = async (bookingId) => {
    try {
        const response = await api.patch(`/api/bookings/${bookingId}/status`, { statusId: 2 });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể xác nhận đơn đặt xe');
    }
};

export const supplierRejectBooking = async (bookingId) => {
    try {
        const response = await api.patch(`/api/bookings/${bookingId}/status`, { statusId: 5 });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể từ chối đơn đặt xe');
    }
};

/**
 * Supplier xác nhận đã nhận đủ tiền (full_payment)
 */
export const supplierConfirmFullPayment = async (bookingId) => {
    try {
        const response = await api.patch(`/api/bookings/${bookingId}/status`, { statusId: 4 });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể xác nhận đã nhận đủ tiền');
    }
};

/**
 * Lấy số tiền payout cho supplier của 1 booking (chỉ cho admin)
 * @param {number} bookingId
 * @returns {Promise<{payoutAmount: number, currency: string, priceBreakdown: object}>}
 */
export const getPayoutAmount = async (bookingId) => {
  if (!bookingId) throw new Error('Thiếu bookingId');
  try {
    const response = await api.get(`/api/bookings/${bookingId}/payout-amount`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || error.message || 'Không lấy được payout amount');
  }
};

export const getRatingsByBookingId = async (bookingId) => {
    // Backend does not have a by-booking endpoint; return empty
    return [];
};

export default api;

// Lấy danh sách xe chờ duyệt (admin)
export const getPendingCars = async () => {
  const token = getToken?.() || getItem('token');
  const res = await api.get('/api/cars/admin/pending-cars', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return res.data?.data ?? res.data;
};

// Duyệt xe (admin)
export const approveCar = async (carId) => {
  const token = getToken?.() || getItem('token');
  const res = await api.post(`/api/cars/admin/approve-car/${carId}`, {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return res.data;
};

// Từ chối xe (admin)
export const rejectCar = async (carId) => {
  const token = getToken?.() || getItem('token');
  const res = await api.post(`/api/cars/admin/reject-car/${carId}`, {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return res.data;
};

/**
 * Supplier chuẩn bị xe (chuyển trạng thái sang ready_for_pickup)
 */
export const supplierPrepareCar = async (bookingId) => {
    try {
        const response = await api.patch(`/api/bookings/${bookingId}/status`, { statusId: 3 });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể chuyển sang trạng thái chờ nhận xe');
    }
};

/**
 * Supplier xác nhận đã giao xe
 */
export const supplierConfirmDelivery = async (bookingId) => {
    try {
        const response = await api.patch(`/api/bookings/${bookingId}/status`, { statusId: 3 });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể xác nhận giao xe');
    }
};

/**
 * Cash Payment Management APIs
 */

// Lấy danh sách cash payments cần xác nhận
export const getPendingCashPayments = async () => {
    try {
        const response = await api.get('/api/cash-payments/pending');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách thanh toán tiền mặt');
    }
};

// Xác nhận đã nhận tiền mặt
export const confirmCashReceived = async (paymentId, confirmationData) => {
    try {
        // Sử dụng endpoint đúng với CashPaymentController
        const response = await api.post(`/api/cash-payments/${paymentId}/confirm-received`, confirmationData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể xác nhận nhận tiền mặt');
    }
};

// ✅ Customer xác nhận đã thanh toán tiền mặt
export const customerConfirmCashPickupPayment = async (bookingId) => {
    const response = await api.post(`/api/cash-payments/bookings/${bookingId}/customer-confirm-cash-pickup`, {
        customerConfirmedAt: new Date().toISOString(),
        confirmedBy: getCurrentUserId(),
        note: "Customer confirmed cash payment for pickup"
    });
    return response.data;
};

// ✅ Supplier xác nhận đã nhận tiền mặt
export const supplierConfirmCashPickupPayment = async (bookingId, confirmationData) => {
    try {
        const response = await api.post(`/api/cash-payments/bookings/${bookingId}/supplier-confirm-cash-pickup`, confirmationData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể xác nhận nhận tiền mặt từ khách');
    }
};

// Lấy danh sách platform fees chưa thanh toán
export const getPendingPlatformFees = async () => {
    try {
        const response = await api.get('/api/cash-payments/platform-fees/pending');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách phí platform');
    }
};

// Lấy tổng số tiền platform fee chưa thanh toán
export const getTotalPendingPlatformFees = async () => {
    try {
        const response = await api.get('/api/cash-payments/platform-fees/pending/total');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể lấy tổng phí platform');
    }
};

// Thanh toán platform fee thông qua payment gateway
export const initiatePlatformFeePayment = async (confirmationId, paymentMethod = 'vnpay') => {
    try {
        const response = await api.post(`/api/cash-payments/confirmations/${confirmationId}/initiate-platform-fee-payment`, {
            paymentMethod: paymentMethod,
            returnUrl: `${window.location.origin}/payment/platform-fee/success`,
            cancelUrl: `${window.location.origin}/payment/platform-fee/cancel`
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể khởi tạo thanh toán phí platform');
    }
};

// Deprecated: Thanh toán platform fee (chỉ cập nhật status)
export const payPlatformFee = async (confirmationId) => {
    try {
        const response = await api.post(`/api/cash-payments/confirmations/${confirmationId}/pay-platform-fee`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể thanh toán phí platform');
    }
};

// Admin: Lấy danh sách platform fees quá hạn
export const getOverduePlatformFees = async () => {
    try {
        const response = await api.get('/api/cash-payments/platform-fees/overdue');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách phí quá hạn');
    }
};


/**
 * Lấy tất cả tài khoản ngân hàng của user hiện tại
 */
export const getMyBankAccounts = async () => {
    try {
        const response = await api.get('/api/bank-accounts/my-accounts');
        return response.data; // <-- ĐÚNG: trả về data thực sự
    } catch (error) {
        console.error('Error fetching bank accounts:', error);
        throw error;
    }
};

/**
 * Lấy tài khoản chính của user
 */
export const getMyPrimaryBankAccount = async () => {
    try {
        const response = await api.get('/api/bank-accounts/my-primary');
        return response;
    } catch (error) {
        console.error('Error fetching primary bank account:', error);
        throw error;
    }
};

/**
 * Lấy tài khoản đã xác thực của user
 */
export const getMyVerifiedBankAccounts = async () => {
    try {
        const response = await api.get('/api/bank-accounts/my-verified');
        return response;
    } catch (error) {
        console.error('Error fetching verified bank accounts:', error);
        throw error;
    }
};

/**
 * Lấy chi tiết tài khoản ngân hàng theo ID
 */
export const getBankAccountById = async (id) => {
    try {
        const response = await api.get(`/api/bank-accounts/${id}`);
        return response;
    } catch (error) {
        console.error('Error fetching bank account:', error);
        throw error;
    }
};

/**
 * Tạo tài khoản ngân hàng mới
 */
export const createBankAccount = async (bankAccountData) => {
    try {
        const response = await post('/api/bank-accounts', bankAccountData);
        return response;
    } catch (error) {
        console.error('Error creating bank account:', error);
        throw error;
    }
};

/**
 * Tạo tài khoản ngân hàng đơn giản
 */
export const createSimpleBankAccount = async (accountNumber, accountHolderName, bankName, accountType = 'checking', isPrimary = false) => {
    try {
        const params = new URLSearchParams({
            accountNumber,
            accountHolderName,
            bankName,
            accountType,
            isPrimary: isPrimary.toString()
        });
        
        const response = await post(`/api/bank-accounts/simple?${params}`);
        return response;
    } catch (error) {
        console.error('Error creating simple bank account:', error);
        throw error;
    }
};

/**
 * Cập nhật tài khoản ngân hàng
 */
export const updateBankAccount = async (id, bankAccountData) => {
    try {
        const {
            accountNumber,
            accountHolderName,
            bankName,
            bankBranch,
            accountType,
            swiftCode,
            routingNumber,
            isPrimary,
            userId // <-- thêm dòng này
        } = bankAccountData;
        const payload = {
            bankAccountId: id,
            userId, // <-- thêm dòng này
            accountNumber,
            accountHolderName,
            bankName,
            bankBranch,
            accountType,
            isPrimary
        };
        if (swiftCode) payload.swiftCode = swiftCode;
        if (routingNumber) payload.routingNumber = routingNumber;
        const response = await api.put(`/api/bank-accounts/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error('Error updating bank account:', error);
        throw error;
    }
};

/**
 * Đặt tài khoản làm tài khoản chính
 */
export const setPrimaryBankAccount = async (id) => {
    try {
        const response = await api.put(`/api/bank-accounts/${id}/set-primary`);
        return response;
    } catch (error) {
        console.error('Error setting primary bank account:', error);
        throw error;
    }
};

/**
 * Bỏ đặt tài khoản chính
 */
export const removePrimaryBankAccount = async () => {
    try {
        const response = await api.put('/api/bank-accounts/remove-primary');
        return response;
    } catch (error) {
        console.error('Error removing primary bank account:', error);
        throw error;
    }
};

/**
 * Xóa tài khoản ngân hàng
 */
export const deleteBankAccount = async (id) => {
    try {
        const response = await api.delete(`/api/bank-accounts/${id}`);
        return response;
    } catch (error) {
        console.error('Error deleting bank account:', error);
        throw error;
    }
};

/**
 * Kiểm tra tài khoản ngân hàng có tồn tại không
 */
export const checkBankAccountExists = async (accountNumber, bankName) => {
    try {
        const params = new URLSearchParams({ accountNumber, bankName });
        const response = await api.get(`/api/bank-accounts/check-exists?${params}`);
        return response;
    } catch (error) {
        console.error('Error checking bank account exists:', error);
        throw error;
    }
};

/**
 * Lấy thống kê tài khoản ngân hàng của user
 */
export const getMyBankAccountStats = async () => {
    try {
        const response = await api.get('/api/bank-accounts/my-stats');
        return response;
    } catch (error) {
        console.error('Error fetching bank account stats:', error);
        throw error;
    }
};

// ================== ADMIN ONLY FUNCTIONS ==================

/**
 * Xác thực tài khoản ngân hàng (Admin only)
 */
export const verifyBankAccount = async (id) => {
    try {
        const response = await api.put(`/api/bank-accounts/${id}/verify`);
        return response;
    } catch (error) {
        console.error('Error verifying bank account:', error);
        throw error;
    }
};

/**
 * Xác thực hàng loạt tài khoản ngân hàng (Admin only)
 */
export const batchVerifyBankAccounts = async (accountIds) => {
    try {
        const response = await api.put('/api/bank-accounts/batch-verify', accountIds);
        return response;
    } catch (error) {
        console.error('Error batch verifying bank accounts:', error);
        throw error;
    }
};

/**
 * Khôi phục tài khoản đã xóa (Admin only)
 */
export const restoreBankAccount = async (id) => {
    try {
        const response = await api.put(`/api/bank-accounts/${id}/restore`);
        return response;
    } catch (error) {
        console.error('Error restoring bank account:', error);
        throw error;
    }
};

/**
 * Tìm kiếm tài khoản ngân hàng (Admin only)
 */
export const searchBankAccounts = async (keyword) => {
    try {
        const response = await api.get(`/api/bank-accounts/search?keyword=${encodeURIComponent(keyword)}`);
        return response;
    } catch (error) {
        console.error('Error searching bank accounts:', error);
        throw error;
    }
};

/**
 * Lấy tài khoản theo trạng thái xác thực (Admin only)
 */
export const getBankAccountsByVerification = async (isVerified) => {
    try {
        const response = await api.get(`/api/bank-accounts/admin/by-verification?isVerified=${isVerified}`);
        return response;
    } catch (error) {
        console.error('Error fetching bank accounts by verification:', error);
        throw error;
    }
};

/**
 * Lấy tất cả tài khoản với phân trang (Admin only)
 */
export const getAllBankAccounts = async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
    try {
        const params = new URLSearchParams({ page, size, sortBy, sortDir });
        const response = await api.get(`/api/bank-accounts/admin/all?${params}`);
        return response;
    } catch (error) {
        console.error('Error fetching all bank accounts:', error);
        throw error;
    }
};

/**
 * Lấy thống kê hệ thống (Admin only)
 */
export const getSystemBankAccountStats = async () => {
    try {
        const response = await api.get('/api/bank-accounts/admin/stats');
        return response;
    } catch (error) {
        console.error('Error fetching system bank account stats:', error);
        throw error;
    }
};

// Thêm vào file api.js

// Car Condition Report APIs
export const createCarConditionReport = async (bookingId, reportData, images = []) => {
    const formData = new FormData();
    
    // Add booking ID
    formData.append('bookingId', bookingId);
    
    // Add report data
    Object.keys(reportData).forEach(key => {
        if (reportData[key] !== null && reportData[key] !== undefined) {
            formData.append(key, reportData[key]);
        }
    });
    
    // Add images - extract the file objects from the image objects
    images.forEach((imageObj, index) => {
        if (imageObj.file) {
            formData.append('images', imageObj.file);
            formData.append('imageTypes', imageObj.type || 'other');
            formData.append('imageDescriptions', imageObj.description || '');
        }
    });
    
    const response = await api.post('/api/car-condition-reports', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getCarConditionReportByBooking = async (bookingId, reportType) => {
    const response = await api.get(`/api/car-condition-reports/booking/${bookingId}/type/${reportType}`);
    return response.data;
};

export const getCarConditionReportsByBooking = async (bookingId) => {
    const response = await api.get(`/api/car-condition-reports/booking/${bookingId}`);
    return response.data;
};

export const confirmCarConditionReport = async (reportId) => {
    const response = await api.post(`/api/car-condition-reports/${reportId}/confirm`);
    return response.data;
};

export const disputeCarConditionReport = async (reportId, disputeReason = '') => {
    const response = await api.post(`/api/car-condition-reports/${reportId}/dispute`, {
        disputeReason
    });
    return response.data;
};

export const updateCarConditionReport = async (reportId, data) => {
    const response = await api.put(`/api/car-condition-reports/${reportId}`, data);
    return response.data;
};

export const deleteCarConditionReport = async (reportId) => {
    const response = await api.delete(`/api/car-condition-reports/${reportId}`);
    return response.data;
};

// Export car condition reports (Admin/Management)
export const exportCarConditionReports = async (filters = {}) => {
    try {
        const response = await api.get('/api/car-condition-reports/export', {
            params: filters,
            responseType: 'blob' // Important for file downloads
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Xuất báo cáo tình trạng xe thất bại');
    }
};

// Get all car condition reports (Admin/Management)
export const getAllCarConditionReports = async (filters = {}) => {
    try {
        const response = await api.get('/api/car-condition-reports', {
            params: filters
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách báo cáo tình trạng xe thất bại');
    }
};

// Get car condition report statistics (Admin/Management)
export const getCarConditionReportStats = async () => {
    try {
        const response = await api.get('/api/car-condition-reports/stats');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy thống kê báo cáo tình trạng xe thất bại');
    }
};

// Get pending car condition reports (Admin/Management)
export const getPendingCarConditionReports = async () => {
    try {
        const response = await api.get('/api/car-condition-reports/pending');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách báo cáo chờ xử lý thất bại');
    }
};

// Helper function to get current user ID
const getCurrentUserId = () => {
    // Try multiple ways to get user ID
    const userId = localStorage.getItem('userId');
    if (userId) return parseInt(userId);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.userId) return user.userId;
    if (user.id) return user.id;
    
    // If no user ID found, return null
    return null;
};

// ============== CHAT API ==============

// Get chat messages between two users
export const getChatMessagesBetweenUsers = async (senderId, receiverId) => {
    try {
        const response = await api.get('/api/chat-messages/between-users', {
            params: { senderId, receiverId }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy tin nhắn chat thất bại');
    }
};

// Send chat message
export const sendChatMessage = async (messageData) => {
    try {
        const response = await api.post('/api/chat-messages', messageData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Gửi tin nhắn thất bại');
    }
};

// Get chat messages by booking ID
export const getChatMessagesByBooking = async (bookingId) => {
    try {
        const response = await api.get(`/api/chat-messages/booking/${bookingId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy tin nhắn theo booking thất bại');
    }
};

// Lấy danh sách người đã từng nhắn tin (conversations)
export const getSuppliersOfCustomer = async (_customerId) => {
    try {
        const response = await api.get('/api/chat/conversations');
        const raw = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        return raw.map(c => ({
            id: c.userId,
            userId: c.userId,
            username: c.userName,
            fullName: c.userName,
            avatarUrl: c.avatarUrl,
            lastMessage: c.lastMessage,
        }));
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lấy danh sách chat thất bại');
    }
};

// Gửi OTP
export const sendPhoneOtp = async (phone) => {
  const response = await api.post('/api/auth/send-otp', { phone });
  return response.data;
};

// Xác thực OTP
export const verifyPhoneOtp = async (phone, otp) => {
  const response = await api.post('/api/auth/verify-otp', { phone, otp });
  return response.data;
};

export const getSupplierDrivers = async () => { return { data: [] }; };
export const createSupplierDriver = async (driverData) => { throw new Error('Chức năng chưa hỗ trợ'); };
export const updateSupplierDriver = async (driverId, driverData) => { throw new Error('Chức năng chưa hỗ trợ'); };
export const deleteSupplierDriver = async (driverId) => { throw new Error('Chức năng chưa hỗ trợ'); };
export const getSupplierInsurances = async () => { return { data: [] }; };
export const getSupplierMaintenances = async () => { return { data: [] }; };

// Tạo bảo hiểm mới
export const createInsurance = async (insuranceData) => {
    const token = getToken?.() || getItem('token');
    const res = await api.post('/api/insurances', insuranceData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// Cập nhật bảo hiểm
export const updateInsurance = async (insuranceId, insuranceData) => {
    const token = getToken?.() || getItem('token');
    const res = await api.put(`/api/insurances/${insuranceId}`, insuranceData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// Xóa bảo hiểm
export const deleteInsurance = async (insuranceId) => {
    const token = getToken?.() || getItem('token');
    const res = await api.delete(`/api/insurances/${insuranceId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// Tạo bảo trì mới
export const createMaintenance = async (maintenanceData) => {
    const token = getToken?.() || getItem('token');
    const res = await api.post('/api/maintenances', maintenanceData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// Cập nhật bảo trì
export const updateMaintenance = async (maintenanceId, maintenanceData) => {
    const token = getToken?.() || getItem('token');
    const res = await api.put(`/api/maintenances/${maintenanceId}`, maintenanceData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// Xóa bảo trì
export const deleteMaintenance = async (maintenanceId) => {
    const token = getToken?.() || getItem('token');
    const res = await api.delete(`/api/maintenances/${maintenanceId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// ══════════════════════════════════════════════════════════════════════════════
// HỢP ĐỒNG (Contract)
// ══════════════════════════════════════════════════════════════════════════════

// Lấy danh sách hợp đồng của supplier
export const getSupplierContracts = async () => {
    const token = getToken?.() || getItem('token');
    const res = await api.get('/api/contracts/supplier/my-contracts', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// Lấy danh sách hợp đồng của customer
export const getCustomerContracts = async () => {
    const token = getToken?.() || getItem('token');
    const res = await api.get('/api/contracts/customer/my-contracts', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// Lấy chi tiết hợp đồng theo ID
export const getContractById = async (contractId) => {
    const token = getToken?.() || getItem('token');
    const res = await api.get(`/api/contracts/${contractId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// Lấy hợp đồng theo booking ID
export const getContractByBookingId = async (bookingId) => {
    const token = getToken?.() || getItem('token');
    const res = await api.get(`/api/contracts/booking/${bookingId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// Tạo hợp đồng từ booking
export const generateContract = async (bookingId) => {
    const token = getToken?.() || getItem('token');
    const res = await api.post(`/api/contracts/generate/${bookingId}`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// Đảm bảo hợp đồng tồn tại cho booking (accessible to customer)
export const ensureContract = async (bookingId) => {
    const token = getToken?.() || getItem('token');
    const res = await api.post(`/api/contracts/booking/${bookingId}/ensure`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// Ký hợp đồng
export const signContract = async (contractId, signature) => {
    const token = getToken?.() || getItem('token');
    const res = await api.post(`/api/contracts/${contractId}/sign`, { signature }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// Cập nhật điều khoản hợp đồng
export const updateContractTerms = async (contractId, terms) => {
    const token = getToken?.() || getItem('token');
    const res = await api.put(`/api/contracts/${contractId}/terms`, { terms }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// ══════════════════════════════════════════════════════════════════════════════
// XÁC MINH BẰNG LÁI (License Verification)
// ══════════════════════════════════════════════════════════════════════════════

// Lấy thông tin bằng lái khách hàng
export const getCustomerLicense = async (customerId) => {
    const token = getToken?.() || getItem('token');
    const res = await api.get(`/api/contracts/license/${customerId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// Lấy danh sách bằng lái chờ xác minh
export const getPendingLicenseVerifications = async () => {
    const token = getToken?.() || getItem('token');
    const res = await api.get('/api/contracts/license/pending', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};

// Xác minh bằng lái
export const verifyLicense = async (customerId, approved, rejectionReason = null) => {
    const token = getToken?.() || getItem('token');
    const res = await api.post(`/api/contracts/license/${customerId}/verify`, {
        approved,
        rejectionReason
    }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data;
};