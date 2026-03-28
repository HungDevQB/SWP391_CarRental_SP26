import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/store/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api, {
    getProfile,
    getUserBookingHistory,
    updateProfile,
    changePassword,
    getFavoriteCars,
    removeFavorite,
    sendEmailVerification,
    cancelBooking,
    getBookingDetails,
    post, confirmDelivery, confirmReturn,
    createPaymentForPickup,
    getPriceBreakdown,
    getBookingById,
    updateRating,
    getCountryCodes,
    getRatingsByBookingId
} from '@/services/api';
import BookingModal from '@/components/features/cars/BookingModal';
import {
    FaStar,
    FaStarHalf,
    FaRegStar, 
} from "react-icons/fa"

import { toast } from 'react-toastify';
import './ProfilePage.scss';
import RetryPaymentHandler from '@/components/features/payments/RetryPaymentHandler';
import LoadingSpinner from '@/components/ui/Loading/LoadingSpinner.jsx';
import BankAccountManager from '@/components/BankAccount/BankAccountManager'; 
import CarConditionReportModal from '@/components/CarConditionReport/CarConditionReportModal';
import CustomerCarConditionReportView from '@/components/CarConditionReport/CustomerCarConditionReportView';
import PhoneOtpVerification from '@/components/Common/PhoneOtpVerification';
import CustomerContractTab from '@/components/features/Customer/CustomerContractTab';

const StarRating = ({
    rating = 0,
    size = "small",
    interactive = false,
    onRatingChange = null,
    className = ""
}) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStar = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const starSizes = {
        small: "text-sm",
        medium: "text-lg",
        large: "text-xl",
        xlarge: "text-2xl"
    };

    const handleStarClick = (starValue) => {
        if (interactive && onRatingChange) {
            onRatingChange(starValue);
        }
    };

    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars.push(
            <button
                key={`full-${i}`}
                type="button"
                disabled={!interactive}
                onClick={() => handleStarClick(i + 1)}
                className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} 
                   transition-all duration-200 ${interactive ? 'p-1 rounded' : ''}`}
            >
                <FaStar className={`text-yellow-400 ${starSizes[size]}`} />
            </button>
        );
    }

    // Half star
    if (hasHalfStar && !interactive) {
        stars.push(
            <FaStarHalf key="half" className={`text-yellow-400 ${starSizes[size]}`} />
        );
    }

    // Empty stars
    for (let i = 0; i < emptyStar; i++) {
        const starIndex = fullStars + (hasHalfStar ? 1 : 0) + i;
        stars.push(
            <button
                key={`empty-${i}`}
                type="button"
                disabled={!interactive}
                onClick={() => handleStarClick(starIndex + 1)}
                className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} 
                   transition-all duration-200 ${interactive ? 'p-1 rounded' : ''}`}
            >
                <FaRegStar className={`text-gray-300 ${starSizes[size]} ${interactive ? 'hover:text-yellow-400' : ''}`} />
            </button>
        );
    }

    return (
        <div className={`flex items-center ${className}`}>
            {stars}
        </div>
    );
};

const ProfilePage = () => {
    const { user: authUser, updateUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState('account');
    const [bookings, setBookings] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Form states
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        countryCode: '+84',
        preferredLanguage: 'vi',
        userDetail: {
            fullName: '',
            address: '',
            taxcode: '',
            nationalId: '',
            nationalIdFrontImage: '',
            nationalIdBackImage: ''
        }
    });
    // OTP modal state
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [pendingPhone, setPendingPhone] = useState(null);
    const [otpVerified, setOtpVerified] = useState(false);

    
    // Password change states
    // const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Thêm states cho modal chi tiết booking
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    // const [bookingDetails, setBookingDetails] = useState(null);
    // Thêm state cho review modal
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewBooking, setReviewBooking] = useState(null);
    const [reviewData, setReviewData] = useState({
        rating: 0,
        comment: '',
        isAnonymous: false
    });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentModalData, setPaymentModalData] = useState(null);
    // Thêm state cho modal đặt lại xe
    const [showRebookModal, setShowRebookModal] = useState(false);
    const [rebookCarData, setRebookCarData] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showReportViewModal, setShowReportViewModal] = useState(false);
    const [reportModalData, setReportModalData] = useState(null);
    console.log('🔍 ProfilePage render - authUser:', authUser, 'user:', user, 'loading:', loading);


        const [countryCodes, setCountryCodes] = useState([]);
        useEffect(() => {
            getCountryCodes()
                .then((data) => setCountryCodes(data))
                .catch(() => setCountryCodes([{ countryCode: '+84', countryName: 'Việt Nam' }]));
        }, []);
    // ✅ SỬA: Helper để check cash deposit pending
const hasCashDepositPending = (booking) => {
    return booking.paymentDetails?.some(p => 
        p.paymentMethod === 'cash' && 
        p.paymentType === 'deposit' && 
        p.paymentStatus === 'pending'
    );
};

// ✅ THÊM: Helper để check có cash full payment chưa
const hasCashFullPayment = (booking) => {
    // Nếu backend trả về hasFullPayment (true khi đã thanh toán đủ bằng bất kỳ phương thức nào)
    // và booking có paymentType là 'full_payment' và paymentMethod là 'cash' (nếu có)
    // hoặc có thể chỉ cần hasFullPayment nếu backend đã chuẩn hóa
    return booking.hasFullPayment === true;
};

// ✅ SỬA: Helper để check cần customer confirm cash payment
const needsCashPickupConfirmation = (booking) => {
    return booking.statusName === 'delivered' &&
        booking.paymentDetails?.some(p =>
            (p.paymentType === 'deposit' || p.paymentType === 'full_payment') &&
            p.paymentMethod === 'cash' &&
            p.paymentStatus === 'pending' &&
            !p.customerCashConfirmed
        );
};

// ✅ THÊM: Helper để check đang chờ supplier confirm cash payment  
const waitingForSupplierCashConfirmation = (booking) => {
    return booking.statusName === 'delivered' &&
        booking.paymentDetails?.some(p =>
            (p.paymentType === 'deposit' || p.paymentType === 'full_payment') &&
            p.paymentMethod === 'cash' &&
            p.paymentStatus === 'pending' &&
            p.customerCashConfirmed &&
            !p.supplierCashConfirmed
        );
};

// ✅ SỬA: Helper để check cần thanh toán pickup (cho online payment)
const needsPickupPayment = (booking) => {
    // Chỉ áp dụng cho online payment
    const hasOnlineDeposit = booking.paymentDetails?.some(p => 
        p.paymentMethod !== 'cash' && 
        p.paymentType === 'deposit' && 
        p.paymentStatus === 'paid'
    );
    
    return booking.statusName === 'delivered' &&
        hasOnlineDeposit &&
        booking.hasDeposit && // Đã có deposit
        !booking.hasFullPayment; // Chưa có full payment
};

// ✅ SỬA: Cập nhật helper waitingForPickup
const waitingForPickup = (booking) => {
    return booking.statusName === 'delivered' &&
        (booking.hasFullPayment || 
         hasCashFullPayment(booking) || 
         booking.supplierCashPaymentConfirmed) && // Đã có payment hoặc supplier đã confirm cash
        !booking.customerReceiveConfirm; // Customer chưa nhận xe
};
    const canCustomerConfirmDelivery = (booking) => {
        return booking.statusName === 'delivered' &&
            (booking.hasFullPayment || 
             hasCashFullPayment(booking) || 
             booking.supplierCashPaymentConfirmed) && // Đã có payment hoặc supplier đã confirm cash
            !booking.customerReceiveConfirm; // Customer chưa nhận xe
    };
    const COLLATERAL_AMOUNT = 5000000;
    // ✅ THÊM: Handle thanh toán tiền nhận xe
    const handlePickupPayment = async (booking) => {
        try {
            // Lấy booking chi tiết từ API (lấy .data nếu có)
            const bookingRes = await getBookingById(booking.bookingId);
            const bookingDetail = bookingRes.data || bookingRes;

            // Lấy priceBreakdown từ API nếu chưa có
            let priceBreakdown = bookingDetail.priceBreakdown;
            if (!priceBreakdown) {
                priceBreakdown = await getPriceBreakdown(booking.bookingId);
            }

            const deposit = bookingDetail.depositAmount || 0;
            const COLLATERAL_AMOUNT = 5000000;
            const customerInfo = {
                fullName: bookingDetail.customer?.userDetail?.fullName
                    || bookingDetail.customer?.fullName
                    || bookingDetail.customer?.username
                    || '',
                phone: bookingDetail.customer?.phone || '',
                email: bookingDetail.customer?.email || '',
                pickupAddress: bookingDetail.pickupLocation || '',
                dropoffAddress: bookingDetail.dropoffLocation || '',
            };
            const bookingInfo = {
                carId: bookingDetail.carId,
                pickupDateTime: bookingDetail.pickupDateTime,
                dropoffDateTime: bookingDetail.dropoffDateTime,
                pickupLocation: bookingDetail.pickupLocation,
                dropoffLocation: bookingDetail.dropoffLocation,
                seatNumber: bookingDetail.seatNumber,
                withDriver: bookingDetail.withDriver,
                deliveryRequested: bookingDetail.deliveryRequested,
                totalAmount: bookingDetail.totalAmount,
                priceBreakdown: priceBreakdown,
                // ✅ THÊM: Payment-related fields
                hasDeposit: bookingDetail.hasDeposit,
                hasFullPayment: bookingDetail.hasFullPayment,
                paymentStatus: bookingDetail.paymentStatus,
                paymentType: bookingDetail.paymentType,
                depositAmount: bookingDetail.depositAmount,
            };
            
        
            navigate('/payment', {
                state: {
                    bookingId: booking.bookingId,
                    bookingInfo,
                    depositAmount: deposit,
                    collateralAmount: COLLATERAL_AMOUNT,
                    priceBreakdown,
                    customerInfo,
                    withDriver: bookingDetail.withDriver,
                    deliveryRequested: bookingDetail.deliveryRequested,
                    paymentType: 'full_payment',
                    pickupPayment: true
                }
            });
        } catch (err) {
            toast.error('Không lấy được thông tin giá hoặc booking.');
        }
    };

    const fetchProfile = async () => {
        try {
            console.log('🔄 Fetching profile...');
            const response = await getProfile();
            console.log('✅ Profile response:', response);
            
            // After interceptor, response is already the UserDto
            const userData = response;

            if (userData && userData.userId) {
                console.log('✅ Setting user state:', userData);
                // Normalize UserDto fields for compatibility with UI expectations
                const normalizedUser = {
                    ...userData,
                    username: userData.username || userData.email || '',
                    userDetail: {
                        fullName: userData.fullName || userData.userDetail?.fullName || '',
                        address: userData.address || userData.userDetail?.address || '',
                        taxcode: userData.taxcode || userData.userDetail?.taxcode || '',
                        nationalId: userData.userDetail?.nationalId || '',
                        nationalIdFrontImage: userData.userDetail?.nationalIdFrontImage || '',
                        nationalIdBackImage: userData.userDetail?.nationalIdBackImage || '',
                        avatar: userData.userDetail?.avatar || '',
                    },
                    role: userData.role || userData.roleName || '',
                };
                setUser(normalizedUser);

                // Set form data for editing
                setFormData({
                    username: normalizedUser.email || '',
                    email: normalizedUser.email || '',
                    phone: normalizedUser.phone || '',
                    countryCode: normalizedUser.countryCode || '+84',
                    preferredLanguage: normalizedUser.preferredLanguage || 'vi',
                    userDetail: {
                        fullName: normalizedUser.fullName || '',
                        address: normalizedUser.address || normalizedUser.userDetail?.address || '',
                        taxcode: normalizedUser.taxcode || normalizedUser.userDetail?.taxcode || '',
                        nationalId: normalizedUser.userDetail?.nationalId || '',
                        nationalIdFrontImage: normalizedUser.userDetail?.nationalIdFrontImage || '',
                        nationalIdBackImage: normalizedUser.userDetail?.nationalIdBackImage || ''
                    }
                });
                
                return userData;
            } else {
                console.error('❌ Profile response invalid:', response);
                toast.error('Không thể tải thông tin người dùng');
                return null;
            }
        } catch (error) {
            console.error('❌ Error fetching profile:', error);
            toast.error('Không thể tải thông tin người dùng');
            return null;
        }
    };

    const fetchBookings = async () => {
        try {
            setBookingLoading(true);
            const response = await getUserBookingHistory();
            console.log('✅ Booking response:', response);
            const bookings = Array.isArray(response) ? response : (response?.content || response?.data || []);
            setBookings(bookings);
            console.log('✅ Bookings loaded:', bookings);
        } catch (error) {
            console.error('❌ Error fetching bookings:', error);
            console.warn('Booking fetch failed, continuing...');
            setBookings([]);
        } finally {
            setBookingLoading(false);
        }
    };

    const fetchFavorites = async () => {
        try {
            setFavoritesLoading(true);
            const response = await getFavoriteCars();
            const favList = Array.isArray(response) ? response : (response?.content || response?.data || []);
            setFavorites(favList);
        } catch (error) {
            console.error('❌ Error fetching favorites:', error);
            setFavorites([]);
        } finally {
            setFavoritesLoading(false);
        }
    };

    // Handle form changes

    // Khi thay đổi phone, chỉ lưu giá trị vào pendingPhone, không show OTP modal ở đây
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            setPendingPhone(value);
        } else if (name.startsWith('userDetail.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                userDetail: {
                    ...prev.userDetail,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle profile update
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            console.log('🔄 Updating profile with data:', formData);
            // Flatten form data to match UpdateProfileRequest shape
            await updateProfile({
                fullName: formData.userDetail?.fullName || formData.fullName,
                phone: pendingPhone ?? formData.phone,
                countryCode: formData.countryCode,
                address: formData.userDetail?.address || formData.address,
            });
            // Update national ID info if changed
            if (formData.userDetail?.nationalId !== undefined) {
                await api.put('/api/users/me/detail', {
                    nationalId: formData.userDetail.nationalId || null,
                    nationalIdFrontImage: formData.userDetail.nationalIdFrontImage || null,
                    nationalIdBackImage: formData.userDetail.nationalIdBackImage || null,
                });
            }
            toast.success('Cập nhật thông tin thành công!');
            setEditMode(false);
            await fetchProfile(); // Refresh data
        } catch (error) {
            console.error('❌ Update profile error:', error);
            toast.error(error.message || 'Không thể cập nhật thông tin');
        } finally {
            setUpdating(false);
        }
    };

    // Handle password change
    const handleChangePassword = async (e) => {
        e.preventDefault();

        // Security validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error('Mật khẩu mới phải có ít nhất 8 ký tự');
            return;
        }

        if (passwordData.newPassword === passwordData.currentPassword) {
            toast.error('Mật khẩu mới phải khác mật khẩu hiện tại');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            setUpdating(true);
            await changePassword(passwordData.currentPassword, passwordData.newPassword);
            setIsChangingPassword(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            toast.success('Đổi mật khẩu thành công');
        } catch (error) {
            if (error.message.includes('401') || error.message.includes('unauthorized')) {
                toast.error('Phiên đăng nhập đã hết hạn');
                logout();
                navigate('/login');
            } else {
                toast.error(error.message || 'Đổi mật khẩu thất bại');
            }
        } finally {
            setUpdating(false);
        }
    };

    // Handle remove favorite
    const handleRemoveFavorite = async (carId) => {
        try {
            await removeFavorite(carId);
            toast.success('Đã xóa khỏi danh sách yêu thích');
            setFavorites(prev => prev.filter(car => car.carId !== carId));
        } catch (error) {
            console.error('❌ Remove favorite error:', error);
            toast.error('Không thể xóa khỏi danh sách yêu thích');
        }
    };

    // Handle email verification
    const handleSendEmailVerification = async () => {
        try {
            await sendEmailVerification();
            toast.success('Email xác thực đã được gửi! Vui lòng kiểm tra hộp thư.');
        } catch (error) {
            console.error('❌ Send email verification error:', error);
            toast.error(error.message || 'Không thể gửi email xác thực');
        }
    };



    // Handle cancel booking
const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đặt xe này?')) {
        return;
    }

    try {
        console.log('🔄 Attempting to cancel booking:', bookingId);
        await cancelBooking(bookingId);
        toast.success('Hủy đặt xe thành công!');
        await fetchBookings();
    } catch (error) {
        console.error('❌ Cancel booking error:', error);
        
        // Handle specific error cases
        if (error.message.includes('hết hạn') || error.message.includes('unauthorized')) {
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            logout();
            navigate('/login');
        } else if (error.message.includes('không có quyền')) {
            toast.error('Bạn không có quyền hủy đặt xe này.');
        } else if (error.message.includes('trạng thái')) {
            toast.error('Không thể hủy đặt xe với trạng thái hiện tại.');
        } else {
            toast.error(error.message || 'Không thể hủy đặt xe');
        }
    }
};

    function normalizePhone(phone, countryCode = '+84') {
        if (!phone) return '';
        if (phone.startsWith('+')) return phone;
        return countryCode + (phone.startsWith('0') ? phone.slice(1) : phone);
    }
    // Handle view booking details
    const handleViewBookingDetails = async (booking) => {
        try {
            // ✅ Set booking ngay để show modal với loading
            setSelectedBooking(booking);
            setShowBookingModal(true);

            console.log('🔄 Viewing booking details for:', booking.bookingId);
            
            const response = await getBookingDetails(booking.bookingId);
            console.log('📋 API booking details:', response);
            setSelectedBooking(prev => ({
                ...prev,
                ...response,
                carModel: response?.carModel || prev.carModel,
                carLicensePlate: response?.carLicensePlate || prev.carLicensePlate,
                paymentDetails: response?.paymentDetails || []
            }));
        } catch (error) {
            console.error('❌ Get booking details error:', error);
            toast.error(error.message || 'Không thể tải chi tiết đặt xe');

            // ✅ Reset nếu lỗi
            setSelectedBooking(null);
            setShowBookingModal(false);
        }
    };
    const handleShowReviewModal = async (booking) => {
        let ratingData = null;
        if (booking.ratings && booking.ratings.length > 0) {
            ratingData = booking.ratings[0];
        } else {
            // Nếu không có, gọi API lấy rating theo bookingId
            try {
                const res = await getRatingsByBookingId(booking.bookingId);
                if (res && res.length > 0) ratingData = res[0];
            } catch (e) {
                ratingData = null;
            }
        }
        setReviewBooking(booking);
        setReviewData({
            rating: ratingData?.ratingScore || ratingData?.star || 0,
            comment: ratingData?.comment || ratingData?.content || "",
            isAnonymous: ratingData?.isAnonymous || false
        });
        setShowReviewModal(true);
    };

    // Sửa handleSubmitReview function
    const handleSubmitReview = async () => {
        if (!reviewData.rating || !reviewData.comment.trim()) {
            toast.error("Vui lòng chọn số sao và nhập bình luận");
            return;
        }
        if (!user || !user.userId) {
            toast.error("Không thể xác định thông tin người dùng");
            return;
        }
        try {
            const reviewPayload = {
                bookingId: reviewBooking.bookingId,
                carId: reviewBooking.carId,
                customerId: user.userId,
                ratingScore: reviewData.rating,
                comment: reviewData.comment.trim(),
                isAnonymous: reviewData.isAnonymous,
                ratingDate: new Date().toISOString()
            };
            let response;
            if (reviewBooking.ratings && reviewBooking.ratings.length > 0) {
                // Đã có đánh giá, gọi update
                const ratingId = reviewBooking.ratings[0].ratingId || reviewBooking.ratings[0].id;
                response = await updateRating(ratingId, reviewPayload);
            } else {
                // Chưa có, tạo mới
                response = await post('/api/ratings', reviewPayload);
            }
            toast.success("Đánh giá đã được gửi thành công!");
            setShowReviewModal(false);
            setReviewData({ rating: 0, comment: '', isAnonymous: false });
            setReviewBooking(null);
            await fetchBookings();
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.message || "Không thể gửi đánh giá");
        }
    };

    // ✅ Handle customer confirm delivery
    const handleConfirmDelivery = async (bookingId) => {
        if (!window.confirm('Bạn xác nhận đã nhận xe?')) return;

        try {
            console.log('🔄 Confirming delivery for booking:', bookingId);
            await confirmDelivery(bookingId);
            toast.success('Xác nhận nhận xe thành công!');
            await fetchBookings();
        } catch (error) {
            console.error('❌ Confirm delivery error:', error);
            toast.error(error.message || 'Không thể xác nhận nhận xe');
        }
    };

    // ✅ Handle customer confirm return
    const handleConfirmReturn = async (bookingId) => {
        if (!window.confirm('Bạn xác nhận đã trả xe?')) return;

        try {
            console.log('🔄 Confirming return for booking:', bookingId);
            await confirmReturn(bookingId);
            toast.success('Xác nhận trả xe thành công!');
            await fetchBookings();
        } catch (error) {
            console.error('❌ Confirm return error:', error);
            toast.error(error.message || 'Không thể xác nhận trả xe');
        }
    };

    // ✅ Handle rebook car - Đặt lại xe (SỬA: đảm bảo truyền đủ dữ liệu cho BookingModal)
    const handleRebookCar = (booking) => {
        // Ưu tiên lấy thông tin từ booking.car, nếu không có thì lấy từ booking
        const car = booking.car || {};
        const carData = {
            id: car.carId || booking.carId,
            carId: car.carId || booking.carId,
            model: car.model || booking.carModel || 'Xe không xác định',
            name: car.name || booking.carModel || 'Xe không xác định',
            numOfSeats: car.numOfSeats || booking.seatNumber || 4,
            averageRating: car.averageRating || null,
            licensePlate: car.licensePlate || booking.carLicensePlate || '',
            brand: car.brand || '',
            color: car.color || '',
            year: car.year || '',
            fuelType: car.fuelType || '',
            transmission: car.transmission || '',
            pricePerDay: car.pricePerDay || '',
            images: Array.isArray(car.images) ? car.images : [],
        };
        setRebookCarData(carData);
        setShowRebookModal(true);
    };

    // ✅ Handle submit rebook
    const handleSubmitRebook = async (bookingData) => {
        try {
            console.log('🔄 Submitting rebook:', bookingData);
            
            // Gọi API tạo booking mới
            const response = await post('/api/bookings', bookingData);
            
            toast.success('Đặt xe thành công!');
            setShowRebookModal(false);
            setRebookCarData(null);
            await fetchBookings();
        } catch (error) {
            console.error('❌ Submit rebook error:', error);
            throw error; // Re-throw để BookingModal có thể handle
        }
    };

    // ✅ Get status badge class và text
    const getStatusInfo = (booking) => {
        let status = booking.statusName?.toLowerCase();
        switch (status) {
            case 'pending':
                return { class: 'pending', text: 'Chờ duyệt', color: '#ffa500' };
            case 'confirmed':
                return { class: 'confirmed', text: 'Đã duyệt', color: '#4caf50' };
            case 'delivered':
                return { class: 'delivered', text: 'Đã giao xe', color: '#ff9800' };
            case 'ready_for_pickup':
                return { class: 'ready-for-pickup', text: 'Chờ nhận xe', color: '#ff9800' };
            case 'rejected':
                return { class: 'rejected', text: 'Từ chối', color: '#f44336' };
            case 'in_progress':
            case 'in progress':
                return { class: 'in-progress', text: 'Đang thuê', color: '#2196f3' };
            case 'completed':
                return { class: 'completed', text: 'Hoàn thành', color: '#4caf50' };
            case 'cancelled':
            case 'canceled':
                return { class: 'cancelled', text: 'Đã hủy', color: '#9e9e9e' };
            case 'failed':
                return { class: 'failed', text: 'Thất bại', color: '#f44336' };
            case 'refunded':
                return { class: 'refunded', text: 'Đã hoàn cọc', color: '#1976d2' };
            case 'payout':
                return { class: 'completed', text: 'Hoàn thành', color: '#4caf50' };
            default:
                return { class: 'unknown', text: status || 'Không xác định', color: '#9e9e9e' };
        }
    };

    // Load data on mount
    useEffect(() => {
        console.log('🔄 useEffect triggered - authUser:', authUser);
        
        if (authUser && authUser.username) {
            const loadData = async () => {
                setLoading(true);
                
                const profileData = await fetchProfile();
                console.log('🔍 Profile fetch result:', profileData);
                
                if (profileData) {
                    fetchBookings();
                    fetchFavorites();
                    setLoading(false);
                } else {
                    console.error('❌ Profile fetch failed, stopping...');
                    setLoading(false);
                }
            };
            
            loadData();
        } else {
            console.log('❌ No authUser, setting loading false');
            setLoading(false);
        }
    }, [authUser?.username]);

    // Set activeTab from navigation state if provided
    useEffect(() => {
        // Check URL params for tab
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam && ['account', 'bookings', 'banking', 'favorites', 'security'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
        // Set activeTab from navigation state if provided
        if (location && location.state && location.state.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location]);

    // Update URL when tab changes
    useEffect(() => {
        const url = new URL(window.location);
        url.searchParams.set('tab', activeTab);
        window.history.replaceState({}, '', url);
    }, [activeTab]);

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="large" color="blue" />
            </div>
        );
    }

    // Show error state if no user after loading
    if (!user && !loading) {
        return (
            <div className="profile-page">
                <div className="error-container">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h2>Không thể tải thông tin người dùng</h2>
                    <p>Có lỗi xảy ra khi tải thông tin tài khoản của bạn</p>
                    <div className="error-actions">
                        <button 
                            onClick={() => {
                                setLoading(true);
                                fetchProfile().then(data => {
                                    setLoading(false);
                                    if (!data) {
                                        toast.error('Vẫn không thể tải thông tin');
                                    }
                                });
                            }}
                            className="btn primary"
                        >
                            <i className="fas fa-redo"></i>
                            Thử lại
                        </button>
                        <button 
                            onClick={() => window.location.href = '/'}
                            className="btn secondary"
                        >
                            <i className="fas fa-home"></i>
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate verification percentage
    const calculateVerificationPercentage = () => {
        let completed = 0;
        const total = 5;
        
        if (user.username) completed++;
        if (user.email) completed++;
        if (user.phone) completed++;
        if (user.userDetail?.fullName) completed++;
        if (user.userDetail?.address) completed++;
        
        return Math.round((completed / total) * 100);
    };

    // Render verification status
    const renderVerificationStatus = () => {
        const percentage = calculateVerificationPercentage();
        
        return (
            <div className="verification-status-card">
                <div className="card-header">
                    <h3>Trạng thái xác thực</h3>
                    <div className="completion-rate">{percentage}% hoàn thành</div>
                </div>
                
                <div className="verification-items">
                    <div className={`verification-item ${user.email ? 'verified' : 'unverified'}`}>
                        <div className="item-content">
                            <i className="fas fa-envelope"></i>
                            <div>
                                <span className="item-title">Email</span>
                                <span className="item-subtitle">{user.email || 'Chưa cập nhật'}</span>
                            </div>
                        </div>
                        {user.email && !user.emailVerified && (
                            <button 
                                className="verify-btn"
                                onClick={handleSendEmailVerification}
                            >
                                Xác thực
                            </button>
                        )}
                        {user.emailVerified && (
                            <div className="verified-badge">
                                <i className="fas fa-check-circle"></i>
                                Đã xác thực
                            </div>
                        )}
                    </div>
                    
                    <div className={`verification-item ${user.phone ? (otpVerified ? 'verified' : 'unverified') : 'unverified'}`}>
                        <div className="item-content">
                            <i className="fas fa-phone"></i>
                            <div>
                                <span className="item-title">Số điện thoại</span>
                                <span className="item-subtitle">{user.phone || 'Chưa cập nhật'}</span>
                            </div>
                        </div>
                        {user.phone && !otpVerified && (
                            <button className="verify-btn" onClick={() => setShowOtpModal(true)}>Xác thực</button>
                        )}
                        {user.phone && otpVerified && (
                            <div className="verify-btn">
                                <i className=""></i>
                                Đã xác thực
                            </div>
                        )}
                    </div>
                    
                    <div className={`verification-item ${user.userDetail?.fullName ? 'verified' : 'unverified'}`}>
                        <div className="item-content">
                            <i className="fas fa-user"></i>
                            <div>
                                <span className="item-title">Họ tên</span>
                                <span className="item-subtitle">{user.userDetail?.fullName || 'Chưa cập nhật'}</span>
                            </div>
                        </div>
                        {!user.userDetail?.fullName && (
                            <button 
                                className="verify-btn"
                                onClick={() => setEditMode(true)}
                            >
                                Cập nhật
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };


    // ✅ SỬA: Render booking history với Tailwind CSS - giao diện khung ngang
    const renderBookingHistory = () => {
        if (bookingLoading) {
            return (
                <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner size="large" color="blue" />
                </div>
            );
        }

        if (!bookings || bookings.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-16 px-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl mx-4 my-6">
                    <div className="mb-8">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                            <i className="fas fa-car-side text-3xl text-white"></i>
                        </div>
                    </div>
                    <div className="max-w-md">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Chưa có lịch sử đặt xe</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">Bạn chưa có bất kỳ chuyến đi nào. Hãy khám phá và đặt xe ngay để bắt đầu hành trình tuyệt vời!</p>
                        <button 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold flex items-center gap-3 mx-auto transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                            onClick={handleNavigateToCars}
                        >
                            <i className="fas fa-plus-circle"></i>
                            <span>Khám phá xe ngay</span>
                        </button>
                    </div>
                </div>
            );
        }

        // Định nghĩa màu sắc cho status badge
        const getStatusBadgeColor = (status) => {
            switch (status?.toLowerCase()) {
                case 'confirmed': return 'bg-blue-200 text-blue-900 border-2 border-blue-400 shadow-md';
                case 'in_progress': case 'in progress': return 'bg-green-200 text-green-900 border-2 border-green-400 shadow-md';
                case 'completed': return 'bg-emerald-200 text-emerald-900 border-2 border-emerald-400 shadow-md';
                case 'cancelled': case 'canceled': return 'bg-red-200 text-red-900 border-2 border-red-400 shadow-md';
                case 'pending': return 'bg-amber-200 text-amber-900 border-2 border-amber-400 shadow-md';
                case 'failed': return 'bg-red-200 text-red-900 border-2 border-red-400 shadow-md';
                case 'delivered': return 'bg-indigo-200 text-indigo-900 border-2 border-indigo-400 shadow-md';
                case 'refunded': return 'bg-teal-200 text-teal-900 border-2 border-teal-400 shadow-md';
                case 'payout': return 'bg-purple-200 text-purple-900 border-2 border-purple-400 shadow-md';
                default: return 'bg-gray-200 text-gray-900 border-2 border-gray-400 shadow-md';
            }
        };

        return (
            <div className="space-y-6 px-4 py-6">
                {/* Stats Header */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center hover:shadow-lg transition-shadow">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{bookings.length}</div>
                        <div className="text-gray-600 font-medium">Tổng đơn đặt</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center hover:shadow-lg transition-shadow">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {bookings.filter(b => ['completed', 'refunded', 'payout'].includes(b.statusName)).length}
                        </div>
                        <div className="text-gray-600 font-medium">Đã hoàn thành</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center hover:shadow-lg transition-shadow">
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                            {bookings.filter(b => ['confirmed', 'ready_for_pickup', 'in_progress', 'delivered'].includes(b.statusName)).length}
                        </div>
                        <div className="text-gray-600 font-medium">Đang thực hiện</div>
                    </div>
                </div>

                {/* Booking List */}
                <div className="space-y-4">
                    {bookings.map((booking, index) => {
                        console.log('Booking:', booking);
                        const statusInfo = getStatusInfo(booking);

                        return (
                            <div 
                                key={booking.bookingId || index} 
                                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                                onClick={() => handleViewBookingDetails(booking)}
                            >
                                {/* Header đơn giản không có gradient */}
                                <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-b border-slate-200">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-200 border-2 border-blue-300 rounded-lg flex items-center justify-center shadow-sm">
                                                <i className="fas fa-car text-blue-700 text-lg"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">#{booking.bookingId}</h3>
                                                <p className="text-gray-600 text-sm font-medium">{booking.carModel || booking.car?.model || 'Xe không xác định'}</p>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(booking.statusName)}`}>
                                            {statusInfo.text}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                        {/* Thông tin xe */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-200 border-2 border-slate-300 rounded-lg flex items-center justify-center shadow-sm">
                                                <i className="fas fa-id-card text-slate-700 text-lg"></i>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Biển số</p>
                                                <p className="font-bold text-gray-800">{booking.carLicensePlate || 'N/A'}</p>
                                            </div>
                                        </div>

                                        {/* Thời gian đặt xe và thời gian thuê */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-200 border-2 border-blue-300 rounded-lg flex items-center justify-center shadow-sm">
                                                <i className="fas fa-calendar-alt text-blue-700 text-lg"></i>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Thời gian</p>
                                                {/* Hiển thị thời gian đặt xe */}
                                                {booking.bookingDate && (
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        Đặt: {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                                                    </p>
                                                )}
                                                {/* Hiển thị thời gian thuê xe */}
                                                <p className="font-bold text-gray-800 text-sm">
                                                    {(booking.pickupDateTime || booking.startDate) && (booking.dropoffDateTime || booking.endDate)
                                                        ? `${new Date(booking.pickupDateTime || booking.startDate).toLocaleDateString('vi-VN')} - ${new Date(booking.dropoffDateTime || booking.endDate).toLocaleDateString('vi-VN')}`
                                                        : 'N/A'
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Thanh toán */}
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 ${
                                                booking.paymentStatus === 'paid' ? 'bg-green-100 border-green-300' :
                                                booking.paymentStatus === 'pending' ? 'bg-amber-100 border-amber-300' : 'bg-red-100 border-red-300'
                                            }`}>
                                                <i className={`fas fa-credit-card text-lg ${
                                                    booking.paymentStatus === 'paid' ? 'text-green-700' :
                                                    booking.paymentStatus === 'pending' ? 'text-amber-700' : 'text-red-700'
                                                }`}></i>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Thanh toán</p>
                                                <p className={`font-bold text-sm ${
                                                    booking.paymentStatus === 'paid' ? 'text-green-700' :
                                                    booking.paymentStatus === 'pending' ? 'text-amber-700' : 'text-red-700'
                                                }`}>
                                                    {booking.paymentStatus === 'paid' ? 'Đã thanh toán' :
                                                     booking.paymentStatus === 'pending' ? 'Chờ thanh toán' :
                                                     booking.paymentStatus === 'failed' ? 'Thất bại' : 'Không xác định'}
                                                </p>
                                                {booking.paymentAmount && (
                                                    <p className="text-xs text-gray-600">
                                                        {new Intl.NumberFormat('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND'
                                                        }).format(booking.paymentAmount)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-2">
                                            {/* Cash Payment Confirmation - Ưu tiên cao nhất */}
                                            {needsCashPickupConfirmation(booking) && (
                                                <button
                                                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCustomerConfirmCashPickup(booking);
                                                    }}
                                                >
                                                    <i className="fas fa-money-bill-wave"></i>
                                                    Xác nhận đã trả tiền mặt
                                                </button>
                                            )}

                                            {/* Chờ supplier xác nhận cash payment */}
                                            {waitingForSupplierCashConfirmation(booking) && (
                                                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                                    <i className="fas fa-clock"></i>
                                                    Chờ nhà cung cấp xác nhận tiền mặt
                                                </div>
                                            )}

                                            {/* Online Payment for Pickup */}
                                            {needsPickupPayment(booking) && (
                                                <button
                                                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePickupPayment(booking);
                                                    }}
                                                >
                                                    <i className="fas fa-credit-card"></i>
                                                    Thanh toán nhận xe
                                                </button>
                                            )}

                                            {/* Confirm Delivery - Sau khi đã thanh toán (online hoặc cash) */}
                                            {(booking.statusName === 'delivered' && 
                                              (booking.hasFullPayment || (hasCashFullPayment(booking) || booking.supplierCashPaymentConfirmed)) && 
                                              !booking.customerReceiveConfirm) && (
                                                <button
                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleConfirmDelivery(booking.bookingId);
                                                    }}
                                                >
                                                    <i className="fas fa-check-circle"></i>
                                                    Đã nhận xe
                                                </button>
                                            )}

                                            {booking.statusName === 'in progress' && booking.hasReturnReport && !booking.customerReturnConfirm && (
                                                <button
                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleConfirmReturn(booking.bookingId);
                                                    }}
                                                >
                                                    <i className="fas fa-car-side"></i>
                                                    Trả xe
                                                </button>
                                            )}
                                            
                                            {(booking.statusName === 'confirmed' || booking.statusName === 'pending') && (
                                                <button 
                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelBooking(booking.bookingId);
                                                    }}
                                                >
                                                    <i className="fas fa-times"></i>
                                                    Hủy
                                                </button>
                                            )}
                                            
                                            {['pending', 'failed'].includes(booking.statusName) && booking.paymentStatus === 'failed' && (
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <RetryPaymentHandler
                                                        booking={booking}
                                                        user={user}
                                                        onSuccess={() => {
                                                            toast.success('Thanh toán thành công!');
                                                            fetchBookings();
                                                        }}
                                                        onError={err => {
                                                            toast.error(`Lỗi thanh toán: ${err.message}`);
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            
                                            {['completed', 'refunded', 'payout'].includes(booking.statusName) && (
                                                <>
                                                    <button
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShowReviewModal(booking);
                                                        }}
                                                    >
                                                        <i className="fas fa-star"></i>
                                                        {booking.hasRated ? "Sửa đánh giá" : "Đánh giá"}
                                                    </button>
                                                    
                                                    <button
                                                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRebookCar(booking);
                                                        }}
                                                    >
                                                        <i className="fas fa-redo"></i>
                                                        Đặt lại xe
                                                    </button>
                                                </>
                                            )}
                                            
                                            {booking.statusName === 'failed' && (
                                                <button
                                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm('Bạn có chắc chắn muốn xóa đặt xe này khỏi lịch sử?')) {
                                                            try {
                                                                await post(`/api/bookings/${booking.bookingId}/delete`);
                                                                setBookings(prev => prev.filter(b => b.bookingId !== booking.bookingId));
                                                                toast.success('Đã xóa đơn đặt xe khỏi lịch sử!');
                                                            } catch (err) {
                                                                toast.error('Không thể xóa đơn đặt xe. Vui lòng thử lại.');
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                    Xóa
                                                </button>
                                            )}

                                            {/*{booking.statusName === 'delivered' && booking.hasDeposit && !booking.hasFullPayment && !booking.customerReceiveConfirm && (*/}
                                            {/*    <button*/}
                                            {/*        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"*/}
                                            {/*        onClick={(e) => {*/}
                                            {/*            e.stopPropagation();*/}
                                            {/*            handlePickupPayment(booking);*/}
                                            {/*        }}*/}
                                            {/*    >*/}
                                            {/*        <i className="fas fa-credit-card"></i>*/}
                                            {/*        Thanh toán nhận xe*/}
                                            {/*    </button>*/}
                                            {/*)}*/}
                                            {/* Car Condition Report Actions */}
                                            {canCreatePickupReport(booking) && (
                                                <button
                                                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCreateReport(booking, 'pickup');
                                                    }}
                                                >
                                                    <i className="fas fa-clipboard-check"></i>
                                                    Báo cáo nhận xe
                                                </button>
                                            )}
                                            {canCreateReturnReport(booking) && (
                                                <button
                                                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCreateReport(booking, 'return');
                                                    }}
                                                >
                                                    <i className="fas fa-clipboard-check"></i>
                                                    Báo cáo trả xe
                                                </button>
                                            )}
                                            {canViewReports(booking) && (
                                                <button
                                                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewReports(booking);
                                                    }}
                                                >
                                                    <i className="fas fa-eye"></i>
                                                    Xem báo cáo
                                                </button>
                                            )}
                                        </div>
                                        
                                        {/* Report Status Notice */}
                                        {(() => {
                                            const reportStatus = getReportStatusInfo(booking);
                                            if (!reportStatus) return null;
                                            
                                            const statusColors = {
                                                warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                                                info: 'bg-blue-50 border-blue-200 text-blue-800',
                                                success: 'bg-green-50 border-green-200 text-green-800'
                                            };
                                            
                                            return (
                                                <div className={`mt-3 p-3 rounded-lg border ${statusColors[reportStatus.type]}`}>
                                                    <div className="flex items-center gap-2">
                                                        <i className={`fas ${reportStatus.type === 'warning' ? 'fa-exclamation-triangle' : reportStatus.type === 'info' ? 'fa-info-circle' : 'fa-check-circle'}`}></i>
                                                        <span className="text-sm font-medium">{reportStatus.message}</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Tiến trình booking theo luồng thực tế */}
                                    {(booking.statusName === 'pending' || booking.statusName === 'confirmed' || booking.statusName === 'ready_for_pickup' || booking.statusName === 'delivered' || booking.statusName === 'in_progress' || booking.statusName === 'in progress') && (
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <h5 className="text-sm font-semibold text-gray-700 mb-4">Tiến trình đặt xe</h5>
                                            <div className="flex items-center gap-2 lg:gap-4 flex-wrap lg:flex-nowrap justify-between lg:justify-start">
                                                {/* Bước 1: Đặt xe */}
                                                <div className="flex items-center gap-1 lg:gap-2 text-green-700 min-w-fit">
                                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-green-200 border-2 border-green-400 flex items-center justify-center shadow-md">
                                                        <i className="fas fa-check text-xs lg:text-sm text-green-800"></i>
                                                    </div>
                                                    <span className="text-xs lg:text-sm font-bold">Đã đặt xe</span>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <div className="w-4 lg:w-8 h-1 bg-green-300 rounded"></div>
                                                    <i className="fas fa-chevron-right text-green-500 mx-1 text-sm lg:text-lg"></i>
                                                    <div className="w-4 lg:w-8 h-1 bg-gray-300 rounded"></div>
                                                </div>
                                                
                                                {/* Bước 2: Xác nhận */}
                                                <div className={`flex items-center gap-1 lg:gap-2 min-w-fit ${
                                                    ['confirmed', 'ready_for_pickup', 'delivered', 'in_progress', 'in progress'].includes(booking.statusName) ? 'text-green-700' : 
                                                    booking.statusName === 'pending' ? 'text-amber-700' : 'text-gray-500'
                                                }`}>
                                                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-2 shadow-md ${
                                                        ['confirmed', 'ready_for_pickup', 'delivered', 'in_progress', 'in progress'].includes(booking.statusName) ? 'bg-green-200 border-green-400' :
                                                        booking.statusName === 'pending' ? 'bg-amber-200 border-amber-400' : 'bg-gray-200 border-gray-400'
                                                    }`}>
                                                        <i className={`fas ${
                                                            ['confirmed', 'ready_for_pickup', 'delivered', 'in_progress', 'in progress'].includes(booking.statusName) ? 'fa-check text-green-800' :
                                                            booking.statusName === 'pending' ? 'fa-clock text-amber-800' : 'fa-times text-gray-600'
                                                        } text-xs lg:text-sm`}></i>
                                                    </div>
                                                    <span className="text-xs lg:text-sm font-bold">
                                                        {['confirmed', 'ready_for_pickup', 'delivered', 'in_progress', 'in progress'].includes(booking.statusName) ? 'Đã xác nhận' :
                                                         booking.statusName === 'pending' ? 'Chờ xác nhận' : 'Chưa xác nhận'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <div className={`w-4 lg:w-8 h-1 rounded ${
                                                        ['confirmed', 'ready_for_pickup', 'delivered', 'in_progress', 'in progress'].includes(booking.statusName) ? 'bg-green-300' : 
                                                        booking.statusName === 'pending' ? 'bg-amber-300' : 'bg-gray-300'
                                                    }`}></div>
                                                    <i className={`fas fa-chevron-right mx-1 text-sm lg:text-lg ${
                                                        ['confirmed', 'ready_for_pickup', 'delivered', 'in_progress', 'in progress'].includes(booking.statusName) ? 'text-green-500' : 
                                                        booking.statusName === 'pending' ? 'text-amber-500' : 'text-gray-400'
                                                    }`}></i>
                                                    <div className="w-4 lg:w-8 h-1 bg-gray-300 rounded"></div>
                                                </div>
                                                
                                                {/* Bước 3: Chuẩn bị xe & giao xe */}
                                                <div className={`flex items-center gap-1 lg:gap-2 min-w-fit ${
                                                    ['delivered', 'in_progress', 'in progress'].includes(booking.statusName) ? 'text-green-700' :
                                                    booking.statusName === 'ready_for_pickup' ? 'text-green-700' :
                                                    booking.statusName === 'confirmed' ? 'text-blue-700' : 'text-gray-500'
                                                }`}>
                                                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-2 shadow-md ${
                                                        ['delivered', 'in_progress', 'in progress'].includes(booking.statusName) ? 'bg-green-200 border-green-400' :
                                                        booking.statusName === 'ready_for_pickup' ? 'bg-green-200 border-green-400' :
                                                        booking.statusName === 'confirmed' ? 'bg-blue-200 border-blue-400' : 'bg-gray-200 border-gray-400'
                                                    }`}>
                                                        <i className={`fas ${
                                                            ['delivered', 'in_progress', 'in progress'].includes(booking.statusName) ? 'fa-check text-green-800' :
                                                            booking.statusName === 'ready_for_pickup' ? 'fa-check text-green-800' :
                                                            booking.statusName === 'confirmed' ? 'fa-shipping-fast text-blue-800' : 'fa-clock text-gray-600'
                                                        } text-xs lg:text-sm`}></i>
                                                    </div>
                                                    <span className="text-xs lg:text-sm font-bold">
                                                        {['delivered', 'in_progress', 'in progress'].includes(booking.statusName) ? 'Đã giao xe' :
                                                         booking.statusName === 'ready_for_pickup' ? 'Đã chuẩn bị' :
                                                         booking.statusName === 'confirmed' ? 'Đang chuẩn bị' : 'Chưa chuẩn bị'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <div className={`w-4 lg:w-8 h-1 rounded ${
                                                        ['delivered', 'in_progress', 'in progress'].includes(booking.statusName) ? 'bg-green-300' :
                                                        booking.statusName === 'ready_for_pickup' ? 'bg-orange-300' :
                                                        booking.statusName === 'confirmed' ? 'bg-blue-300' : 'bg-gray-300'
                                                    }`}></div>
                                                    <i className={`fas fa-chevron-right mx-1 text-sm lg:text-lg ${
                                                        ['delivered', 'in_progress', 'in progress'].includes(booking.statusName) ? 'text-green-500' :
                                                        booking.statusName === 'ready_for_pickup' ? 'text-orange-500' :
                                                        booking.statusName === 'confirmed' ? 'text-blue-500' : 'text-gray-400'
                                                    }`}></i>
                                                    <div className={`w-4 lg:w-8 h-1 rounded ${
                                                        (booking.statusName === 'in_progress' || booking.statusName === 'in progress') ? 'bg-blue-300' : 'bg-gray-300'
                                                    }`}></div>
                                                </div>
                                                
                                                {/* Bước 4: Nhận xe & thanh toán */}
                                                <div className={`flex items-center gap-1 lg:gap-2 min-w-fit ${
                                                    (booking.customerReceiveConfirm && booking.hasFullPayment) || booking.statusName === 'in_progress' ? 'text-green-700' :
                                                    ['ready_for_pickup', 'delivered'].includes(booking.statusName) ? 'text-orange-700' : 'text-gray-500'
                                                }`}>
                                                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-2 shadow-md ${
                                                        (booking.customerReceiveConfirm && booking.hasFullPayment) || booking.statusName === 'in_progress' ? 'bg-green-200 border-green-400' :
                                                        ['ready_for_pickup', 'delivered'].includes(booking.statusName) ? 'bg-orange-200 border-orange-400' : 'bg-gray-200 border-gray-400'
                                                    }`}>
                                                        <i className={`fas ${
                                                            (booking.customerReceiveConfirm && booking.hasFullPayment) || booking.statusName === 'in_progress' ? 'fa-check text-green-800' :
                                                            ['ready_for_pickup', 'delivered'].includes(booking.statusName) ? 'fa-handshake text-orange-800' : 'fa-clock text-gray-600'
                                                        } text-xs lg:text-sm`}></i>
                                                    </div>
                                                    <span className="text-xs lg:text-sm font-bold">
                                                        {(booking.customerReceiveConfirm && booking.hasFullPayment) || booking.statusName === 'in_progress' ? 'Đã nhận xe' :
                                                         ['ready_for_pickup', 'delivered'].includes(booking.statusName) ? 'Chờ nhận xe' : 'Chưa nhận xe'}
                                                    </span>
                                                </div>

                                                {/* Hiển thị bước 5: Đang sử dụng chỉ khi status là in_progress */}
                                                {booking.statusName === 'in_progress' || booking.statusName === 'in progress' && (
                                                    <>
                                                        <div className="flex items-center">
                                                            <div className="w-4 lg:w-8 h-1 bg-green-300 rounded"></div>
                                                            <i className="fas fa-chevron-right text-green-500 mx-1 text-sm lg:text-lg"></i>
                                                            <div className="w-4 lg:w-8 h-1 bg-blue-300 rounded"></div>
                                                        </div>
                                                        
                                                        {/* Bước 5: Đang thuê */}
                                                        <div className="flex items-center gap-1 lg:gap-2 min-w-fit text-blue-700">
                                                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-2 shadow-md bg-blue-200 border-blue-400">
                                                                <i className="fas fa-key text-xs lg:text-sm text-blue-800"></i>
                                                            </div>
                                                            <span className="text-xs lg:text-sm font-bold">Đang sử dụng</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            
                                            {/* Thông tin chi tiết cho trạng thái ready_for_pickup */}
                                            {booking.statusName === 'ready_for_pickup' && (
                                                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                                    <div className="text-sm text-orange-800">
                                                        <i className="fas fa-car mr-2"></i>
                                                        Xe đã được chuẩn bị xong và sẵn sàng để bàn giao. Vui lòng liên hệ để nhận xe.
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Thông tin chi tiết cho trạng thái delivered */}
                                            {booking.statusName === 'delivered' && (
                                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <div className="text-sm text-blue-800">
                                                        <i className="fas fa-info-circle mr-2"></i>
                                                        {needsCashPickupConfirmation(booking) ? 
                                                            "Vui lòng xác nhận đã thanh toán tiền mặt để hoàn tất quá trình nhận xe" :
                                                            waitingForSupplierCashConfirmation(booking) ?
                                                            "Đang chờ nhà cung cấp xác nhận việc nhận tiền mặt" :
                                                            !booking.hasFullPayment && !hasCashFullPayment(booking) ? 
                                                            "Vui lòng thanh toán phần còn lại để nhận xe" :
                                                            "Xe đã sẵn sàng, vui lòng xác nhận đã nhận xe"
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Thông tin chi tiết cho trạng thái in_progress */}
                                            {booking.statusName === 'in_progress' && (
                                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <div className="text-sm text-blue-800">
                                                        <i className="fas fa-car-side mr-2"></i>
                                                        Bạn đang trong chuyến đi. Khi kết thúc, vui lòng xác nhận trả xe để hoàn tất.
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tiến trình sử dụng xe cho in_progress */}
                                    {booking.statusName === 'in_progress' && (
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <h5 className="text-sm font-semibold text-gray-700 mb-4">Tiến trình sử dụng xe</h5>
                                            <div className="flex items-center gap-2 lg:gap-4 flex-wrap lg:flex-nowrap justify-between lg:justify-start">
                                                {/* Đang sử dụng */}
                                                <div className="flex items-center gap-1 lg:gap-2 text-green-700 min-w-fit">
                                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-green-200 border-2 border-green-400 flex items-center justify-center shadow-md">
                                                        <i className="fas fa-key text-xs lg:text-sm text-green-800"></i>
                                                    </div>
                                                    <span className="text-xs lg:text-sm font-bold">Đang sử dụng</span>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <div className="w-4 lg:w-8 h-1 bg-green-300 rounded"></div>
                                                    <i className="fas fa-chevron-right text-green-500 mx-1 text-sm lg:text-lg"></i>
                                                    <div className="w-4 lg:w-8 h-1 bg-gray-300 rounded"></div>
                                                </div>
                                                
                                                {/* Trả xe */}
                                                <div className={`flex items-center gap-1 lg:gap-2 min-w-fit ${
                                                    booking.customerReturnConfirm ? 'text-green-700' : 'text-blue-700'
                                                }`}>
                                                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-2 shadow-md ${
                                                        booking.customerReturnConfirm ? 'bg-green-200 border-green-400' : 'bg-blue-200 border-blue-400'
                                                    }`}>
                                                        <i className={`fas ${
                                                            booking.customerReturnConfirm ? 'fa-check text-green-800' : 'fa-car-side text-blue-800'
                                                        } text-xs lg:text-sm`}></i>
                                                    </div>
                                                    <span className="text-xs lg:text-sm font-bold">
                                                        {booking.customerReturnConfirm ? 'Đã trả xe' : 'Chờ trả xe'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <div className={`w-8 h-1 rounded ${
                                                        booking.customerReturnConfirm ? 'bg-green-300' : 'bg-blue-300'
                                                    }`}></div>
                                                    <i className={`fas fa-chevron-right mx-1 text-lg ${
                                                        booking.customerReturnConfirm ? 'text-green-500' : 'text-blue-500'
                                                    }`}></i>
                                                    <div className="w-8 h-1 bg-gray-300 rounded"></div>
                                                </div>
                                                
                                                {/* Supplier xác nhận */}
                                                <div className={`flex items-center gap-2 min-w-fit ${
                                                    booking.supplierReturnConfirm ? 'text-green-700' : 'text-gray-500'
                                                }`}>
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-md ${
                                                        booking.supplierReturnConfirm ? 'bg-green-200 border-green-400' : 'bg-gray-200 border-gray-400'
                                                    }`}>
                                                        <i className={`fas ${
                                                            booking.supplierReturnConfirm ? 'fa-check-double text-green-800' : 'fa-clock text-gray-600'
                                                        } text-sm`}></i>
                                                    </div>
                                                    <span className="text-sm font-bold">
                                                        {booking.supplierReturnConfirm ? 'Nhà cung cấp đã xác nhận' : 'Chờ nhà cung cấp xác nhận'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <div className={`w-8 h-1 rounded ${
                                                        booking.supplierReturnConfirm ? 'bg-green-300' : 'bg-gray-300'
                                                    }`}></div>
                                                    <i className={`fas fa-chevron-right mx-1 text-lg ${
                                                        booking.supplierReturnConfirm ? 'text-green-500' : 'text-gray-400'
                                                    }`}></i>
                                                    <div className="w-8 h-1 bg-gray-300 rounded"></div>
                                                </div>
                                                
                                                {/* Hoàn thành */}
                                                <div className={`flex items-center gap-2 min-w-fit ${
                                                    booking.customerReturnConfirm && booking.supplierReturnConfirm ? 'text-green-700' : 'text-gray-500'
                                                }`}>
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-md ${
                                                        booking.customerReturnConfirm && booking.supplierReturnConfirm ? 'bg-green-200 border-green-400' : 'bg-gray-200 border-gray-400'
                                                    }`}>
                                                        <i className={`fas ${
                                                            booking.customerReturnConfirm && booking.supplierReturnConfirm ? 'fa-trophy text-green-800' : 'fa-clock text-gray-600'
                                                        } text-sm`}></i>
                                                    </div>
                                                    <span className="text-sm font-bold">
                                                        {booking.customerReturnConfirm && booking.supplierReturnConfirm ? 'Hoàn thành' : 'Chờ hoàn thành'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Thông tin hướng dẫn */}
                                            {!booking.customerReturnConfirm && (
                                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <div className="text-sm text-blue-800">
                                                        <i className="fas fa-info-circle mr-2"></i>
                                                        Khi kết thúc chuyến đi, vui lòng bấm "Trả xe" để xác nhận đã trả xe cho nhà cung cấp
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {booking.customerReturnConfirm && !booking.supplierReturnConfirm && (
                                                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                                    <div className="text-sm text-yellow-800">
                                                        <i className="fas fa-clock mr-2"></i>
                                                        Bạn đã xác nhận trả xe, đang chờ nhà cung cấp kiểm tra và xác nhận
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tiến trình cho booking đã hoàn thành */}
                                    {['completed', 'refunded', 'payout'].includes(booking.statusName) && (
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <h5 className="text-sm font-semibold text-gray-700 mb-4">Chuyến đi đã hoàn thành</h5>
                                            <div className="flex items-center gap-2 lg:gap-4 flex-wrap lg:flex-nowrap justify-between lg:justify-start">
                                                {/* Tất cả các bước đều hoàn thành */}
                                                <div className="flex items-center gap-1 lg:gap-2 text-green-700 min-w-fit">
                                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-green-200 border-2 border-green-400 flex items-center justify-center shadow-md">
                                                        <i className="fas fa-check text-xs lg:text-sm text-green-800"></i>
                                                    </div>
                                                    <span className="text-xs lg:text-sm font-bold">Đã đặt xe</span>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <div className="w-4 lg:w-8 h-1 bg-green-400 rounded"></div>
                                                    <i className="fas fa-chevron-right text-green-600 mx-1 text-sm lg:text-lg"></i>
                                                    <div className="w-4 lg:w-8 h-1 bg-green-400 rounded"></div>
                                                </div>
                                                
                                                <div className="flex items-center gap-1 lg:gap-2 text-green-700 min-w-fit">
                                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-green-200 border-2 border-green-400 flex items-center justify-center shadow-md">
                                                        <i className="fas fa-check text-xs lg:text-sm text-green-800"></i>
                                                    </div>
                                                    <span className="text-xs lg:text-sm font-bold">Đã xác nhận</span>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <div className="w-4 lg:w-8 h-1 bg-green-400 rounded"></div>
                                                    <i className="fas fa-chevron-right text-green-600 mx-1 text-sm lg:text-lg"></i>
                                                    <div className="w-4 lg:w-8 h-1 bg-green-400 rounded"></div>
                                                </div>
                                                
                                                <div className="flex items-center gap-1 lg:gap-2 text-green-700 min-w-fit">
                                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-green-200 border-2 border-green-400 flex items-center justify-center shadow-md">
                                                        <i className="fas fa-check text-xs lg:text-sm text-green-800"></i>
                                                    </div>
                                                    <span className="text-xs lg:text-sm font-bold">Đã sử dụng</span>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <div className="w-4 lg:w-8 h-1 bg-green-400 rounded"></div>
                                                    <i className="fas fa-chevron-right text-green-600 mx-1 text-sm lg:text-lg"></i>
                                                    <div className="w-8 h-1 bg-green-400 rounded"></div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 text-green-700 min-w-fit">
                                                    <div className="w-10 h-10 rounded-full bg-green-200 border-2 border-green-400 flex items-center justify-center shadow-md">
                                                        <i className="fas fa-check text-sm text-green-800"></i>
                                                    </div>
                                                    <span className="text-sm font-bold">Đã trả xe</span>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <div className="w-8 h-1 bg-green-400 rounded"></div>
                                                    <i className="fas fa-chevron-right text-green-600 mx-1 text-lg"></i>
                                                    <div className="w-8 h-1 bg-green-400 rounded"></div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 text-green-700 min-w-fit">
                                                    <div className="w-10 h-10 rounded-full bg-green-200 border-2 border-green-400 flex items-center justify-center shadow-md">
                                                        <i className="fas fa-trophy text-sm text-green-800"></i>
                                                    </div>
                                                    <span className="text-sm font-bold">Hoàn thành</span>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                                <div className="text-sm text-green-800">
                                                    <i className="fas fa-check-circle mr-2"></i>
                                                    Chuyến đi đã hoàn thành thành công! 
                                                    {booking.statusName === 'refunded' && " Tiền cọc đã được hoàn trả."}
                                                    {booking.statusName === 'payout' && " Thanh toán đã được xử lý."}
                                                    {!booking.hasRated && " Bạn có thể đánh giá chuyến đi này."}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tiến trình cho booking bị hủy hoặc thất bại */}
                                    {['cancelled', 'canceled', 'failed'].includes(booking.statusName) && (
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <h5 className="text-sm font-semibold text-gray-700 mb-4">
                                                {booking.statusName === 'failed' ? 'Đặt xe thất bại' : 'Đặt xe đã bị hủy'}
                                            </h5>
                                            <div className="flex items-center gap-4 overflow-x-auto">
                                                {/* Đặt xe */}
                                                <div className="flex items-center gap-2 text-green-700 min-w-fit">
                                                    <div className="w-10 h-10 rounded-full bg-green-200 border-2 border-green-400 flex items-center justify-center shadow-md">
                                                        <i className="fas fa-check text-sm text-green-800"></i>
                                                    </div>
                                                    <span className="text-sm font-bold">Đã đặt xe</span>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <div className="w-4 lg:w-8 h-1 bg-red-300 rounded"></div>
                                                    <i className="fas fa-times text-red-600 mx-1 text-sm lg:text-lg"></i>
                                                    <div className="w-4 lg:w-8 h-1 bg-red-300 rounded"></div>
                                                </div>
                                                
                                                {/* Kết thúc ở đây */}
                                                <div className="flex items-center gap-1 lg:gap-2 text-red-700 min-w-fit">
                                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-red-200 border-2 border-red-400 flex items-center justify-center shadow-md">
                                                        <i className="fas fa-times text-xs lg:text-sm text-red-800"></i>
                                                    </div>
                                                    <span className="text-xs lg:text-sm font-bold">
                                                        {booking.statusName === 'failed' ? 'Thất bại' : 'Đã hủy'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                                                <div className="text-sm text-red-800">
                                                    <i className="fas fa-exclamation-triangle mr-2"></i>
                                                    {booking.statusName === 'failed' ? 
                                                        "Đặt xe không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ." :
                                                        "Đặt xe đã bị hủy. Nếu có thanh toán, tiền sẽ được hoàn trả theo quy định."
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional badges */}
                                    <div className="flex gap-2 mt-4">
                                        {isBookingFullyCompleted(booking) && (
                                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
                                                <i className="fas fa-check-circle mr-1"></i>
                                                Hoàn thành
                                            </span>
                                        )}
                                        
                                        {hasRefund(booking) && (
                                            <span className="bg-teal-100 text-teal-800 border border-teal-200 px-3 py-1 rounded-full text-xs font-semibold">
                                                <i className="fas fa-money-bill-wave mr-1"></i>
                                                Đã hoàn cọc
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Render favorites
    const renderFavorites = () => {
        if (favoritesLoading) {
            return (
                <div className="flex items-center justify-center min-h-[300px]">
                    <LoadingSpinner size="large" color="blue" />
                </div>
            );
        }

        if (!favorites || favorites.length === 0) {
            return (
                <div className="empty-state">
                    <i className="fas fa-heart"></i>
                    <h3>Chưa có xe yêu thích</h3>
                    <p>Bạn chưa thêm xe nào vào danh sách yêu thích</p>
                    <button className="btn primary" onClick={handleNavigateToCars}>
                        <i className="fas fa-search"></i>
                        Tìm xe
                    </button>
                </div>
            );
        }

        return (
            <div className="favorites-grid">
                {favorites.map((car, index) => (
                    <div key={car.carId || index} className="favorite-card">
                        <div className="favorite-content">
                            <h4>{car.carBrand} {car.carModel || car.model}</h4>
                            <p>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(car.rentalPricePerDay || car.dailyRate || 0)}/ngày</p>
                            <button 
                                className="btn primary small"
                                onClick={() => navigate(`/cars/${car.carId}`)}
                            >
                                Xem chi tiết
                            </button>
                        </div>
                        <button 
                            className="remove-favorite"
                            onClick={() => handleRemoveFavorite(car.carId)}
                        >
                            <i className="fas fa-heart-broken"></i>
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    // Navigate to cars page
    const handleNavigateToCars = () => {
        navigate('/search');
    };

    // Helper kiểm tra hoàn tất booking và hoàn cọc
    const isBookingFullyCompleted = (booking) =>
      Boolean(booking.supplierDeliveryConfirm) &&
      Boolean(booking.customerReceiveConfirm) &&
      Boolean(booking.customerReturnConfirm) &&
      Boolean(booking.supplierReturnConfirm) &&
      booking.paymentDetails?.some(p => p.paymentType === 'full_payment' && p.paymentStatus === 'paid');

    const hasRefund = (booking) =>
      booking.paymentDetails?.some(p => p.paymentType === 'refund' && p.paymentStatus === 'paid');

    // Helper format date
    const formatDateTime = (dateStr) => {
      if (!dateStr) return 'N/A';
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', { hour12: false });
    };

    const canCreatePickupReport = (booking) => {
        // Customer có thể tạo báo cáo nhận xe khi:
        // 1. Đã nhận xe (customerReceiveConfirm = true) 
        // 2. Chưa có báo cáo pickup
        // 3. Status là 'delivered' hoặc 'in_progress' (vừa nhận xe, hoặc vừa chuyển sang in_progress)
        const normalizedStatus = booking.statusName?.toLowerCase().replace(/\s+/g, '_');
        return booking.customerReceiveConfirm && 
               !booking.hasPickupReport &&
               ['delivered', 'in_progress'].includes(normalizedStatus); // Cho phép cả delivered và in_progress
    };

    const canCreateReturnReport = (booking) => {
        // Customer có thể tạo báo cáo trả xe khi:
        // 1. Status là 'in_progress' (đang thuê xe)
        // 2. Chưa có báo cáo return (không cần customerReturnConfirm)
        // 3. Đã có báo cáo pickup và đã được xác nhận
        const normalizedStatus = booking.statusName?.toLowerCase().replace(/\s+/g, '_');
        return normalizedStatus === 'in_progress' && 
               !booking.hasReturnReport &&
               booking.hasPickupReport; // Phải có báo cáo pickup đã được xác nhận
    };
    

    const canViewReports = (booking) => {
        // Có thể xem báo cáo nếu:
        // 1. Đã có ít nhất 1 báo cáo được tạo
        return booking.hasPickupReport || booking.hasReturnReport;
    };

    // Helper to check if customer needs to create pickup report after receiving car
    const needsPickupReport = (booking) => {
        return booking.customerReceiveConfirm && 
               !booking.hasPickupReport &&
               booking.statusName?.toLowerCase() === 'delivered';
    };

    // Helper to check if customer needs to create return report after returning car  
    const needsReturnReport = (booking) => {
        return !booking.hasReturnReport &&
               booking.statusName?.toLowerCase() === 'in_progress' &&
               booking.hasPickupReport; // Must have pickup report first
    };

    // Helper to check if customer can confirm return after creating report
    const canConfirmReturn = (booking) => {
        return booking.hasReturnReport && 
               !booking.customerReturnConfirm &&
               booking.statusName?.toLowerCase() === 'in_progress';
    };

    // Helper to get report status info
    const getReportStatusInfo = (booking) => {
        const status = booking.statusName?.toLowerCase();
        
        if (status === 'delivered' && booking.customerReceiveConfirm && !booking.hasPickupReport) {
            return {
                message: 'Cần tạo báo cáo nhận xe để tiếp tục',
                type: 'warning',
                action: 'create-pickup-report'
            };
        }
        
        if (status === 'delivered' && booking.hasPickupReport && !booking.pickupReportConfirmed) {
            return {
                message: 'Đang chờ chủ xe xác nhận báo cáo nhận xe',
                type: 'info',
                action: 'waiting-pickup-confirmation'
            };
        }
        
        if (status === 'in_progress' && !booking.hasReturnReport) {
            return {
                message: 'Cần tạo báo cáo trả xe trước khi trả xe',
                type: 'warning', 
                action: 'create-return-report'
            };
        }
        
        if (status === 'in_progress' && booking.hasReturnReport && !booking.customerReturnConfirm) {
            return {
                message: 'Có thể xác nhận trả xe sau khi đã tạo báo cáo',
                type: 'info',
                action: 'can-confirm-return'
            };
        }
        
        if (status === 'in_progress' && booking.hasReturnReport && !booking.returnReportConfirmed) {
            return {
                message: 'Đang chờ chủ xe xác nhận báo cáo trả xe',
                type: 'info',
                action: 'waiting-return-confirmation'
            };
        }
        
        return null;
    };

    const handleCreateReport = (booking, reportType) => {
        setReportModalData({ booking, reportType });
        setShowReportModal(true);
    };

    const handleViewReports = (booking) => {
        setReportModalData({ booking });
        setShowReportViewModal(true);
    };

    const handleReportSuccess = () => {
        fetchBookings(); // Refresh để cập nhật trạng thái
    };

    // ✅ THÊM: Handle customer confirm cash pickup payment
    const handleCustomerConfirmCashPickup = async (booking) => {
        if (!window.confirm('Bạn xác nhận đã thanh toán tiền mặt cho việc nhận xe?')) {
            return;
        }

        try {
            const response = await post(`/api/cash-payments/bookings/${booking.bookingId}/customer-confirm-cash-pickup`, {
                confirmedAt: new Date().toISOString(),
                note: 'Customer confirmed cash payment for pickup'
            });

            toast.success('Xác nhận thanh toán tiền mặt thành công!');
            await fetchBookings();
        } catch (error) {
            console.error('❌ Confirm cash pickup error:', error);
            toast.error(error.message || 'Không thể xác nhận thanh toán tiền mặt');
        }
    };

    return (
        <div className="profile-page">
            {/* Header Section */}
            <div className="profile-header">
                <div className="header-background"></div>
                <div className="container">
                    <div className="header-content">
                        <div className="user-avatar-section">
                            <div className="user-avatar">
                                <img 
                                    src={user.userDetail?.avatar || `data:image/svg+xml,${encodeURIComponent(`
                                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
                                        <rect width="120" height="120" fill="#667eea"/>
                                        <text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Arial, sans-serif" font-size="48" fill="white">
                                            ${user.username?.charAt(0).toUpperCase() || 'U'}
                                        </text>
                                    </svg>
                                    `)}`} 
                                    alt="Avatar"
                                    onError={(e) => {
                                        // Fallback to a simple colored div with initial
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = `
                                            <div style="
                                                width: 120px; 
                                                height: 120px; 
                                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                                border-radius: 50%; 
                                                display: flex; 
                                                align-items: center; 
                                                justify-content: center; 
                                                color: white; 
                                                font-size: 48px; 
                                                font-weight: bold;
                                            ">
                                                ${user.username?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        `;
                                    }} />
                                    <div
                                        className="avatar-upload"
                                        title="Đổi ảnh đại diện"
                                        onClick={() => document.getElementById('avatar-file-input').click()}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <i className="fas fa-camera"></i>
                                    </div>
                                    <input
                                        id="avatar-file-input"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        style={{ display: 'none' }}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                                const res = await api.post('/api/users/me/avatar', formData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                const url = res.data?.data?.avatarUrl;
                                                if (url) setUser(prev => ({
                                                    ...prev,
                                                    userDetail: { ...prev.userDetail, avatar: url }
                                                }));
                                            } catch (err) {
                                                alert('Lỗi upload ảnh: ' + (err.response?.data?.message || err.message));
                                            }
                                            e.target.value = '';
                                        }}
                                    />
                                </div>
                            
                            <div className="verification-badge">
                                <div className="verification-circle">
                                    <svg className="progress-ring" width="60" height="60">
                                        <circle
                                            className="progress-ring-circle"
                                            stroke="#e5e7eb"
                                            strokeWidth="4"
                                            fill="transparent"
                                            r="26"
                                            cx="30"
                                            cy="30"
                                        />
                                        <circle
                                            className="progress-ring-circle"
                                            strokeDasharray={`${calculateVerificationPercentage() * 1.63} 163`}
                                            strokeWidth="4"
                                            fill="transparent"
                                            r="26"
                                            cx="30"
                                            cy="30"
                                        />
                                    </svg>
                                    <div className="percentage">{calculateVerificationPercentage()}%</div>
                                </div>
                                <div className="verification-text">Đã xác thực</div>
                            </div>
                        </div>
                        
                        <div className="user-info">
                            <h1 className="user-name">{user.userDetail?.fullName || user.username}</h1>
                            <p className="user-email">{user.email}</p>
                            
                            <div className="user-badges">
                                <div className="badge trusted">
                                    <i className="fas fa-shield-alt"></i>
                                    <span>Đáng tin cậy</span>
                                </div>
                                {(user.roleId === 3 || user.roleName === 'supplier' || user.role === 'supplier') && (
                                    <div className="badge premium">
                                        <i className="fas fa-crown"></i>
                                        <span>Khách hàng</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="user-stats">
                                <div className="stat-item">
                                    <span className="stat-number">{bookings.filter(b => ['completed', 'refunded', 'payout'].includes(b.statusName)).length}</span>
                                    <span className="stat-label">
                                        <i className="fas fa-car"></i>
                                        Chuyến đi
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">{favorites.length}</span>
                                    <span className="stat-label">
                                        <i className="fas fa-heart"></i>
                                        Yêu thích
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">{calculateVerificationPercentage()}%</span>
                                    <span className="stat-label">
                                        <i className="fas fa-check-circle"></i>
                                        Hoàn thành
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="header-actions">
                            <button className="book-car-btn" onClick={handleNavigateToCars}>
                                <div className="btn-glow"></div>
                                <span>
                                    <i className="fas fa-plus"></i>
                                    Đặt xe mới
                                </span>
                            </button>
                            <button className="btn invite-btn">
                                <i className="fas fa-user-plus"></i>
                                Mời bạn bè
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="profile-nav">
                <div className="container">
                    <div className="nav-tabs">
                        <button 
                            className={`nav-tab ${activeTab === 'account' ? 'active' : ''}`}
                            onClick={() => setActiveTab('account')}
                        >
                            <i className="fas fa-user"></i>
                            <span>Thông tin tài khoản</span>
                        </button>
                        <button 
                            className={`nav-tab ${activeTab === 'bookings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('bookings')}
                        >
                            <i className="fas fa-history"></i>
                            <span>Lịch sử đặt xe</span>
                            {bookings.length > 0 && (
                                <div className="notification-dot">{bookings.length}</div>
                            )}
                        </button>
                        <button 
                            className={`nav-tab ${activeTab === 'contracts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('contracts')}
                        >
                            <i className="fas fa-file-contract"></i>
                            <span>Hợp đồng thuê xe</span>
                        </button>
                        {/* ✅ TAB BANKING */}
                        <button 
                            className={`nav-tab ${activeTab === 'banking' ? 'active' : ''}`}
                            onClick={() => setActiveTab('banking')}
                        >
                            <i className="fas fa-university"></i>
                            <span>Tài khoản ngân hàng</span>
                        </button>
                        <button 
                            className={`nav-tab ${activeTab === 'favorites' ? 'active' : ''}`}
                            onClick={() => setActiveTab('favorites')}
                        >
                            <i className="fas fa-heart"></i>
                            <span>Xe yêu thích</span>
                            {favorites.length > 0 && (
                                <div className="notification-dot">{favorites.length}</div>
                            )}
                        </button>
                        <button 
                            className={`nav-tab ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <i className="fas fa-shield-alt"></i>
                            <span>Bảo mật</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="profile-content">
                <div className="container">
                    <div className="tab-content">
                        {activeTab === 'account' && (
                            <>
                                <div className="content-header">
                                    <div>
                                        <p className="subtitle">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
                                    </div>
                                    <button 
                                        className="btn edit-btn"
                                        onClick={() => setEditMode(!editMode)}
                                    >
                                        <i className={`fas fa-${editMode ? 'times' : 'edit'}`}></i>
                                        {editMode ? 'Hủy' : 'Chỉnh sửa'}
                                    </button>
                                </div>

                                {renderVerificationStatus()}

                                {editMode ? (
                                    <form onSubmit={handleUpdateProfile} className="form-grid">
                                        <div className="form-card">
                                            <h3>Thông tin cơ bản</h3>
                                            <div className="form-rows">
                                                <div className="form-group">
                                                    <label data-required="true">Tên đăng nhập</label>
                                                    <input
                                                        type="text"
                                                        name="username"
                                                        value={formData.username}
                                                        onChange={handleInputChange}
                                                        disabled
                                                    />
                                                    <div className="input-hint">Tên đăng nhập không thể thay đổi</div>
                                                </div>
                                                
                                                <div className="form-group">
                                                    <label data-required="true">Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                
                                                <div className="form-group">
                                                    <label data-required="true">Số điện thoại</label>
                                                    <div className="phone-input-group">
                                                        <select
                                                            className="country-select"
                                                            name="countryCode"
                                                            value={formData.countryCode}
                                                            onChange={handleInputChange}
                                                        >
                                                            {countryCodes && countryCodes.length > 0 ? (
                                                                countryCodes.map((c) => (
                                                                    <option key={c.countryCode} value={c.countryCode}>
                                                                        {c.countryCode} ({c.countryName})
                                                                    </option>
                                                                ))
                                                            ) : (
                                                                <option value="+84">+84 (VN)</option>
                                                            )}
                                                        </select>
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={pendingPhone !== null && pendingPhone !== undefined ? pendingPhone : formData.phone}
                                                            onChange={handleInputChange}
                                                            placeholder="Nhập số điện thoại"
                                                            required
                                                        /> 
                                                    </div>
                                                    {pendingPhone && pendingPhone !== formData.phone && (
                                                        <div className="text-xs text-blue-600 ml-2">Số mới, cần xác thực OTP khi cập nhật</div>
                                                    )}
                                                </div>                                                
                                                
                                                <div className="form-group">
                                                    <label>Ngôn ngữ ưa thích</label>
                                                    <select
                                                        name="preferredLanguage"
                                                        value={formData.preferredLanguage}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="vi">Tiếng Việt</option>
                                                        <option value="en">English</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="form-card">
                                            <h3>Thông tin chi tiết</h3>
                                            <div className="form-rows">
                                                <div className="form-group">
                                                    <label data-required="true">Họ và tên</label>
                                                    <input
                                                        type="text"
                                                        name="userDetail.fullName"
                                                        value={formData.userDetail.fullName}
                                                        onChange={handleInputChange}
                                                        placeholder="Nhập họ và tên đầy đủ"
                                                        required
                                                    />
                                                </div>
                                                
                                                <div className="form-group">
                                                    <label data-required="true">Địa chỉ</label>
                                                    <textarea
                                                        name="userDetail.address"
                                                        value={formData.userDetail.address}
                                                        onChange={handleInputChange}
                                                        placeholder="Nhập địa chỉ đầy đủ"
                                                        rows="3"
                                                        required
                                                    />
                                                </div>
                                                
                                                <div className="form-group">
                                                    <label>Mã số thuế (nếu có)</label>
                                                    <input
                                                        type="text"
                                                        name="userDetail.taxcode"
                                                        value={formData.userDetail.taxcode}
                                                        onChange={handleInputChange}
                                                        placeholder="Nhập mã số thuế"
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label>Số CCCD/CMND</label>
                                                    <input
                                                        type="text"
                                                        name="userDetail.nationalId"
                                                        value={formData.userDetail.nationalId}
                                                        onChange={handleInputChange}
                                                        placeholder="Nhập số căn cước công dân"
                                                        maxLength={12}
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label>Ảnh CCCD mặt trước</label>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                        {formData.userDetail.nationalIdFrontImage && (
                                                            <img
                                                                src={formData.userDetail.nationalIdFrontImage}
                                                                alt="CCCD mặt trước"
                                                                style={{ maxWidth: 220, borderRadius: 8, border: '1px solid #e5e7eb' }}
                                                            />
                                                        )}
                                                        <input
                                                            type="file"
                                                            accept="image/jpeg,image/png,image/webp"
                                                            style={{ display: 'none' }}
                                                            id="cccd-front-input"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                const fd = new FormData();
                                                                fd.append('file', file);
                                                                try {
                                                                    const res = await api.post('/api/users/me/national-id-image?side=front', fd, {
                                                                        headers: { 'Content-Type': 'multipart/form-data' }
                                                                    });
                                                                    const url = res.data?.data?.imageUrl;
                                                                    if (url) setFormData(prev => ({
                                                                        ...prev,
                                                                        userDetail: { ...prev.userDetail, nationalIdFrontImage: url }
                                                                    }));
                                                                } catch (err) {
                                                                    toast.error('Lỗi upload ảnh: ' + (err.response?.data?.message || err.message));
                                                                }
                                                                e.target.value = '';
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn secondary"
                                                            style={{ width: 'fit-content' }}
                                                            onClick={() => document.getElementById('cccd-front-input').click()}
                                                        >
                                                            <i className="fas fa-upload"></i> {formData.userDetail.nationalIdFrontImage ? 'Đổi ảnh' : 'Tải lên'}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label>Ảnh CCCD mặt sau</label>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                        {formData.userDetail.nationalIdBackImage && (
                                                            <img
                                                                src={formData.userDetail.nationalIdBackImage}
                                                                alt="CCCD mặt sau"
                                                                style={{ maxWidth: 220, borderRadius: 8, border: '1px solid #e5e7eb' }}
                                                            />
                                                        )}
                                                        <input
                                                            type="file"
                                                            accept="image/jpeg,image/png,image/webp"
                                                            style={{ display: 'none' }}
                                                            id="cccd-back-input"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                const fd = new FormData();
                                                                fd.append('file', file);
                                                                try {
                                                                    const res = await api.post('/api/users/me/national-id-image?side=back', fd, {
                                                                        headers: { 'Content-Type': 'multipart/form-data' }
                                                                    });
                                                                    const url = res.data?.data?.imageUrl;
                                                                    if (url) setFormData(prev => ({
                                                                        ...prev,
                                                                        userDetail: { ...prev.userDetail, nationalIdBackImage: url }
                                                                    }));
                                                                } catch (err) {
                                                                    toast.error('Lỗi upload ảnh: ' + (err.response?.data?.message || err.message));
                                                                }
                                                                e.target.value = '';
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn secondary"
                                                            style={{ width: 'fit-content' }}
                                                            onClick={() => document.getElementById('cccd-back-input').click()}
                                                        >
                                                            <i className="fas fa-upload"></i> {formData.userDetail.nationalIdBackImage ? 'Đổi ảnh' : 'Tải lên'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="form-actions">
                                            <button type="button" className="btn secondary" onClick={() => setEditMode(false)}>
                                                <i className="fas fa-times"></i>
                                                Hủy
                                            </button>
                                            <button type="submit" className="btn save-btn" disabled={updating}>
                                                <i className="fas fa-save"></i>
                                                {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="info-grid">
                                        <div className="info-card">
                                            <h3>Thông tin cơ bản</h3>
                                            <div className="info-rows">
                                                <div className="info-row">
                                                    <label>Tên đăng nhập:</label>
                                                    <span>{user.username}</span>
                                                </div>
                                                <div className="info-row">
                                                    <label>Email:</label>
                                                    <span>{user.email}</span>
                                                </div>
                                                <div className="info-row">
                                                    <label>Số điện thoại:</label>
                                                    <span>{user.phone}</span>
                                                </div>
                                                <div className="info-row">
                                                    <label>Ngôn ngữ:</label>
                                                    <span>{user.preferredLanguage === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="info-card">
                                            <h3>Thông tin chi tiết</h3>
                                            <div className="info-rows">
                                                <div className="info-row">
                                                    <label>Họ và tên:</label>
                                                    <span>{user.userDetail?.fullName || 'Chưa cập nhật'}</span>
                                                </div>
                                                <div className="info-row">
                                                    <label>Địa chỉ:</label>
                                                    <span>{user.userDetail?.address || 'Chưa cập nhật'}</span>
                                                </div>
                                                <div className="info-row">
                                                    <label>Mã số thuế:</label>
                                                    <span>{user.userDetail?.taxcode || 'Chưa có'}</span>
                                                </div>
                                                <div className="info-row">
                                                    <label>Số CCCD/CMND:</label>
                                                    <span>{user.userDetail?.nationalId || 'Chưa cập nhật'}</span>
                                                </div>
                                                {(user.userDetail?.nationalIdFrontImage || user.userDetail?.nationalIdBackImage) && (
                                                    <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                                                        <label>Ảnh CCCD:</label>
                                                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                                            {user.userDetail.nationalIdFrontImage && (
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Mặt trước</div>
                                                                    <img src={user.userDetail.nationalIdFrontImage} alt="CCCD mặt trước" style={{ maxWidth: 160, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                                                                </div>
                                                            )}
                                                            {user.userDetail.nationalIdBackImage && (
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Mặt sau</div>
                                                                    <img src={user.userDetail.nationalIdBackImage} alt="CCCD mặt sau" style={{ maxWidth: 160, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="info-row">
                                                    <label>Ngày tạo tài khoản:</label>
                                                    <span>
                                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="info-row">
                                                    <label>Đăng nhập cuối:</label>
                                                    <span>
                                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('vi-VN') : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'bookings' && (
                            <>

                                {renderBookingHistory()}
                            </>
                        )}
                        {activeTab === 'contracts' && (
                            <CustomerContractTab />
                        )}
                        {/* ✅ TAB BANKING CONTENT */}
                        {activeTab === 'banking' && (
                            <>
                                <div className="content-header">
                                    <div>
                                        <h2>Tài khoản ngân hàng</h2>
                                        <p className="subtitle">Quản lý thông tin thanh toán và tài khoản ngân hàng của bạn</p>
                                    </div>
                                </div>
                                <div className="banking-section">
                                    <BankAccountManager />
                                </div>
                            </>
                        )}
                        {activeTab === 'favorites' && (
                            <>
                                <div className="content-header">
                                    <div>
                                        <h2>Xe yêu thích</h2>
                                        <p className="subtitle">Những chiếc xe bạn đã lưu để thuê sau</p>
                                    </div>
                                </div>
                                {renderFavorites()}
                            </>
                        )}
                        {activeTab === 'security' && (
                            <>
                                <div className="content-header">
                                    <div>
                                        <h2>Bảo mật & Riêng tư</h2>
                                        <p className="subtitle">Quản lý mật khẩu và cài đặt bảo mật</p>
                                    </div>
                                </div>
                                
                                <div className="security-grid">
                                    <div className="security-card">
                                        <div className="security-header">
                                            <h3>Mật khẩu</h3>
                                            <div className="status active">Đã thiết lập</div>
                                        </div>
                                        <p>Thay đổi mật khẩu thường xuyên để bảo vệ tài khoản</p>
                                        <button 
                                            className="btn primary"
                                            // onClick={() => setShowPasswordModal(true)}
                                            onClick={() => setIsChangingPassword(true)}
                                        >
                                            <i className="fas fa-key"></i>
                                            Đổi mật khẩu
                                        </button>
                                    </div>
                                    
                                    <div className="security-card">
                                        <div className="security-header">
                                            <h3>Xác thực 2 lớp</h3>
                                            <div className="status">Chưa bật</div>
                                        </div>
                                        <p>Tăng cường bảo mật với xác thực 2 lớp</p>
                                        <button className="btn secondary">
                                            <i className="fas fa-shield-alt"></i>
                                            Thiết lập
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {isChangingPassword && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Đổi mật khẩu</h3>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setIsChangingPassword(false);
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="modal-form">
                            <div className="form-group">
                                <label>Mật khẩu hiện tại</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({
                                        ...prev, currentPassword: e.target.value
                                    }))}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu mới</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({
                                        ...prev, newPassword: e.target.value
                                    }))}
                                    required
                                    minLength="8"
                                />
                                <small>Mật khẩu phải có ít nhất 8 ký tự</small>
                            </div>
                            <div className="form-group">
                                <label>Xác nhận mật khẩu mới</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({
                                        ...prev, confirmPassword: e.target.value
                                    }))}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn primary" disabled={updating}>
                                    {updating ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            Đang đổi...
                                        </>
                                    ) : (
                                        'Đổi mật khẩu'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn secondary"
                                    onClick={() => {
                                        setIsChangingPassword(false);
                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Booking Details Modal */}
            {showBookingModal && selectedBooking && (
                <div className="modal-overlay">
                    <div className="modal large booking-details-modal">
                        <div className="modal-header">
                            <div className="modal-title-section">
                                <h3>Chi tiết đặt xe</h3>
                                <div className="booking-id-badge">
                                    #{selectedBooking.bookingId}
                                </div>
                            </div>
                            <button 
                                className="close-btn"
                                onClick={() => {
                                    setShowBookingModal(false);
                                    setSelectedBooking(null);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="modal-content">
                            <div className="booking-detail-grid">
                                {/* ✅ Kiểm tra xem có đang load details không */}
                                {!selectedBooking.paymentDetails ? (
                                    <div className="flex items-center justify-center min-h-[200px]">
                                        <LoadingSpinner size="large" color="blue" />
                                    </div>
                                ) : (
                                    <>
                                {/* Thông tin xe */}
                                <div className="detail-section">
                                    <div className="section-header">
                                        <i className="fas fa-car"></i>
                                        <h4>Thông tin xe</h4>
                                    </div>
                                    <div className="detail-items">
                                        <div className="detail-item">
                                            <label>Mẫu xe:</label>
                                                    <span>{selectedBooking.carModel || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Biển số:</label>
                                                    <span className="highlight">{selectedBooking.carLicensePlate || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Tài xế:</label>
                                            <span>{selectedBooking.driverName || 'Tự lái'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Số ghế:</label>
                                            <span>{selectedBooking.seatNumber || 'N/A'} chỗ</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Thông tin chuyến đi */}
                                <div className="detail-section">
                                    <div className="section-header">
                                        <i className="fas fa-route"></i>
                                        <h4>Thông tin chuyến đi</h4>
                                    </div>
                                    <div className="detail-items">
                                        {/* ✅ THÊM: Thời gian đặt xe */}
                                        {selectedBooking.bookingDate && (
                                            <div className="detail-item">
                                                <label>Thời gian đặt xe:</label>
                                                <span>{formatDateTime(selectedBooking.bookingDate)}</span>
                                            </div>
                                        )}
                                        <div className="detail-item">
                                            <label>Thời gian thuê:</label>
                                            <span>
                                                {formatDateTime(selectedBooking.startDate || selectedBooking.pickupDateTime)}
                                                {" - "}
                                                {formatDateTime(selectedBooking.endDate || selectedBooking.dropoffDateTime)}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Điểm đón:</label>
                                            <span>{selectedBooking.pickupLocation}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Điểm trả:</label>
                                            <span>{selectedBooking.dropoffLocation}</span>
                                        </div>

                                                {/* ✅ SỬA: Thời gian confirm - Sử dụng selectedBooking */}
                                                {selectedBooking.deliveryConfirmTime && (
                                            <div className="detail-item">
                                                        <label>Thời gian giao xe:</label>
                                                        <span>{new Date(selectedBooking.deliveryConfirmTime).toLocaleString('vi-VN')}</span>
                                            </div>
                                        )}

                                                {selectedBooking.returnConfirmTime && (
                                        <div className="detail-item">
                                                        <label>Thời gian trả xe:</label>
                                                        <span>{new Date(selectedBooking.returnConfirmTime).toLocaleString('vi-VN')}</span>
                                        </div>
                                                )}

                                                {/* ✅ SỬA: Khuyến mãi - Sử dụng selectedBooking */}
                                        <div className="detail-item">
                                            <label>Khuyến mãi:</label>
                                            {selectedBooking.promoCode ? (
                                                <span className="promo-info">
                                                    <span className="promo-code">{selectedBooking.promoCode}</span>
                                                    {selectedBooking.discountPercentage && (
                                                        <span className="discount">
                                                            (-{selectedBooking.discountPercentage}%)
                                                        </span>
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="no-data">Không sử dụng</span>
                                            )}
                                        </div>

                                                {/* ✅ SỬA: Mô tả khuyến mãi - Sử dụng selectedBooking */}
                                        {selectedBooking.promoCode && (
                                            <div className="detail-item">
                                                <label>Mô tả khuyến mãi:</label>
                                                <span className="promo-desc">
                                                    {selectedBooking.promoDescription || 'Không có mô tả chi tiết'}
                                                </span>
                                            </div>
                                        )}

                                                {/* ✅ SỬA: Gia hạn - Sử dụng selectedBooking */}
                                        <div className="detail-item">
                                            <label>Gia hạn:</label>
                                            {selectedBooking.extensionDays > 0 ? (
                                                <span className="extension-info">
                                                    {selectedBooking.extensionDays} ngày
                                                    {selectedBooking.extensionStatusName && (
                                                        <span className={`extension-status ${selectedBooking.extensionStatusName.toLowerCase()}`}>
                                                            ({selectedBooking.extensionStatusName})
                                                        </span>
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="no-data">Không có gia hạn</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                        {/* Thông tin thanh toán */}
                                        <div className="detail-section">
                                            <div className="section-header">
                                                <i className="fas fa-credit-card"></i>
                                                <h4>Thông tin thanh toán</h4>
                                            </div>
                                            <div className="detail-items">
                                                {/* ✅ Debug payment details */}
                                                {console.log('🔍 Checking payment details:', {
                                                    hasPaymentDetails: !!selectedBooking.paymentDetails,
                                                    paymentDetailsLength: selectedBooking.paymentDetails?.length || 0,
                                                    paymentDetails: selectedBooking.paymentDetails
                                                })}

                                                {selectedBooking.paymentDetails && selectedBooking.paymentDetails.length > 0 ? (
                                                    <>
                                                        <div className="payment-records">
                                                            <h5>Lịch sử thanh toán:</h5>
                                                            {selectedBooking.paymentDetails
                                                                .filter(payment => payment.paymentType !== 'payout')
                                                                .map((payment, index) => (
                                                                    <div key={payment.paymentId || index} className="payment-record">
                                                                        <div className="payment-record-header">
                                                                            <span className="payment-type-label">
                                                                                {payment.paymentType === 'deposit' ? '💰 Tiền cọc' :
                                                                                    payment.paymentType === 'full_payment' ? '💳 Thanh toán đầy đủ' :
                                                                                        '🔄 Hoàn tiền'}
                                                                            </span>
                                                                            <span className={`payment-status-badge ${payment.statusName?.toLowerCase()}`}>
                                                                                {payment.statusName === 'paid' ? 'Đã thanh toán' :
                                                                                    payment.statusName === 'pending' ? 'Chờ xử lý' : 'Thất bại'}
                                                                            </span>
                                                                        </div>

                                                                        <div className="payment-record-details">
                                                                            <div className="payment-amount-display">
                                                                                {new Intl.NumberFormat('vi-VN', {
                                                                                    style: 'currency',
                                                                                    currency: 'VND'
                                                                                }).format(payment.amount)}
                                                                            </div>

                                                                            <div className="payment-meta">
                                                                                <div className="payment-method">
                                                                                    <i className="fas fa-credit-card"></i>
                                                                                    {payment.paymentMethod?.toUpperCase() || 'N/A'}
                                                                                </div>
                                                                                <div className="payment-date">
                                                                                    <i className="fas fa-calendar"></i>
                                                                                    {payment.paymentDate ?
                                                                                        new Date(payment.paymentDate).toLocaleString('vi-VN') : 'N/A'}
                                                                                </div>
                                                                            </div>

                                                                            {payment.transactionId && (
                                                                                <div className="transaction-id">
                                                                                    <span>Mã GD:</span>
                                                                                    <code>{payment.transactionId}</code>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>

                                                        {/* Tổng kết thanh toán */}
                                                        {selectedBooking.paymentDetails.filter(payment => payment.paymentType !== 'payout').length > 1 && (
                                                            <div className="payment-summary-section">
                                                                <div className="summary-item total-paid">
                                                                    <div className="summary-label">
                                                                        <i className="fas fa-calculator"></i>
                                                                        <strong>Tổng đã thanh toán:</strong>
                                                                    </div>
                                                                    <div className="summary-amount total">
                                                                        <strong>
                                                                            {new Intl.NumberFormat('vi-VN', {
                                                                                style: 'currency',
                                                                                currency: 'VND'
                                                                            }).format(
                                                                                selectedBooking.paymentDetails
                                                                                    .filter(p => (p.paymentType === 'deposit' || p.paymentType === 'full_payment') && p.paymentType !== 'payout')
                                                                                    .reduce((sum, payment) => sum + payment.amount, 0)
                                                                            )}
                                                                        </strong>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="no-payment-info">
                                                        <i className="fas fa-info-circle"></i>
                                                        <span>Chưa có thông tin thanh toán</span>
                                                       
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className="modal-actions">
                            <button 
                                className="btn secondary" 
                                onClick={() => {
                                    setShowBookingModal(false);
                                    setSelectedBooking(null);
                                }}
                            >
                                <i className="fas fa-times"></i>
                                Đóng
                            </button>
                            {(selectedBooking?.statusName === 'confirmed' || selectedBooking?.statusName === 'pending') && (
                                <button 
                                    className="btn danger"
                                    onClick={() => {
                                        setShowBookingModal(false);
                                        handleCancelBooking(selectedBooking.bookingId);
                                    }}
                                >
                                    <i className="fas fa-ban"></i>
                                    Hủy đặt xe
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showPaymentModal && paymentModalData && (
                <PaymentModal
                    data={paymentModalData}
                    onClose={() => setShowPaymentModal(false)}
                    onPayment={() => {
                        setShowPaymentModal(false);
                        fetchBookings();
                    }}
                />
            )}

            {showReviewModal && reviewBooking && (
              <div className="modal-overlay">
                <div className="modal review-modal">
                  <div className="modal-header">
                    <h3>
                      {(reviewBooking.hasRated || reviewBooking.rating || (reviewBooking.ratings && reviewBooking.ratings.length > 0))
                        ? "Đánh giá lại"
                        : "Đánh giá xe"}
                    </h3>
                    <button className="close-btn" onClick={() => setShowReviewModal(false)}>×</button>
                  </div>
                  <div className="modal-content">
                    <div>
                      <b>Xe:</b> {reviewBooking.car?.model} - {reviewBooking.carLicensePlate}
                    </div>
                    <div>
                      <b>Chuyến đi:</b> #{reviewBooking.bookingId}
                    </div>
                    <div style={{margin: "16px 0"}}>
                      <label>Số sao:</label>
                      <StarRating
                        rating={reviewData.rating}
                        size="large"
                        interactive={true}
                        onRatingChange={r => setReviewData(prev => ({...prev, rating: r}))}
                      />
                    </div>
                    <div>
                      <label>Bình luận:</label>
                      <textarea
                        value={reviewData.comment}
                        onChange={e => setReviewData(prev => ({...prev, comment: e.target.value}))}
                        rows={4}
                        style={{width: "100%"}}
                        placeholder="Nhập nhận xét của bạn"
                      />
                    </div>
                    <div>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewData.isAnonymous}
                          onChange={e => setReviewData(prev => ({...prev, isAnonymous: e.target.checked}))}
                        />
                        Ẩn danh
                      </label>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button className="btn primary" onClick={handleSubmitReview}>Gửi đánh giá</button>
                    <button className="btn secondary" onClick={() => setShowReviewModal(false)}>Hủy</button>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ BookingModal cho đặt lại xe */}
            {showRebookModal && rebookCarData && (
              <>
                {console.log('[ProfilePage] Render BookingModal - showRebookModal:', showRebookModal, '| rebookCarData:', rebookCarData)}
                <BookingModal
                  isOpen={showRebookModal}
                  onClose={() => setShowRebookModal(false)}
                  car={rebookCarData}
                  onSubmitBooking={handleSubmitRebook}
                />
              </>
            )}
            {/* Car Condition Report Modals */}
            {showReportModal && reportModalData && (
                <CarConditionReportModal
                    isOpen={showReportModal}
                    onClose={() => {
                        setShowReportModal(false);
                        setReportModalData(null);
                    }}
                    booking={reportModalData.booking}
                    reportType={reportModalData.reportType}
                    currentUser={user}
                    onSuccess={handleReportSuccess}
                />
            )}

            {showReportViewModal && reportModalData && (
                <CustomerCarConditionReportView
                    isOpen={showReportViewModal}
                    onClose={() => {
                        setShowReportViewModal(false);
                        setReportModalData(null);
                    }}
                    bookingId={reportModalData.booking.bookingId}
                />
            )}
            {showOtpModal && (
                                    <div className="modal-overlay">
                                        <div className="modal">
                                            <h3>Xác thực số điện thoại</h3>
                                            <PhoneOtpVerification
                                                phone={normalizePhone(
                                                    pendingPhone && pendingPhone !== formData.phone
                                                        ? pendingPhone
                                                        : user.phone,
                                                    (pendingPhone && pendingPhone !== formData.phone
                                                        ? formData.countryCode
                                                        : user.countryCode) || '+84'
                                                )}
                                                onVerified={async () => {
                                                    setOtpVerified(true);
                                                    const fullPhone = normalizePhone(
                                                        pendingPhone && pendingPhone !== formData.phone
                                                            ? pendingPhone
                                                            : user.phone,
                                                        (pendingPhone && pendingPhone !== formData.phone
                                                            ? formData.countryCode
                                                            : user.countryCode) || '+84'
                                                    );
                                                    localStorage.setItem("otpVerified", "true");
                                                    localStorage.setItem("lastConfirmedPhone", fullPhone);
                                                    setFormData(prev => ({ ...prev, phone: fullPhone }));
                                                    setShowOtpModal(false);
                                                    try {
                                                        setUpdating(true);
                                                        await updateProfile({ ...formData, phone: fullPhone });
                                                        toast.success('Cập nhật thông tin thành công!');
                                                        setEditMode(false);
                                                        await fetchProfile();
                                                    } catch (error) {
                                                        toast.error(error.message || 'Không thể cập nhật thông tin');
                                                    } finally {
                                                        setUpdating(false);
                                                    }
                                        
                                                }}
                                            />
                                            <button className="close-btn" onClick={() => setShowOtpModal(false)}>Đóng</button>
                                        </div>
                                        <style>{`
                                            .modal-overlay {
                                                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                                                background: rgba(0,0,0,0.3); z-index: 1000; display: flex; align-items: center; justify-content: center;
                                            }
                                            .modal {
                                                background: #fff; border-radius: 12px; padding: 32px; min-width: 320px; box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                                                display: flex; flex-direction: column; align-items: center;
                                            }
                                            .close-btn {
                                                margin-top: 16px; background: #eee; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;
                                            }
                                        `}</style>
                                    </div>
                                )}                                   
        </div>
    );

} // Đóng component ProfilePage đúng chuẩn
export default ProfilePage;
// PaymentModal component
const PaymentModal = ({ data, onClose, onPayment }) => {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            const paymentData = {
                bookingId: data.bookingId,
                amount: data.amountToPay,
                currency: 'VND',
                paymentMethod,
                withDriver: data.withDriver,
                deliveryRequested: data.deliveryRequested,
                paymentType: 'full_payment', // BẮT BUỘC
            };
            const endpoint = '/api/payments';
            const response = await post(endpoint, paymentData);
            if (response?.redirectUrl) {
                window.location.href = response.redirectUrl;
            } else {
                onPayment();
            }
        } catch (err) {
            alert('Có lỗi khi thanh toán: ' + (err.message || err));
        } finally {
            setIsProcessing(false);
        }
    };
    return (
        <div className="modal-overlay">
            <div className="modal payment-modal">
                <div className="modal-header">
                    <h3>Thanh toán khi nhận xe</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-content">
                    <div className="summary">
                        <div><b>Xe:</b> {data.carModel} - {data.carLicensePlate}</div>
                        <div><b>Điểm đón:</b> {data.pickupLocation}</div>
                        <div><b>Điểm trả:</b> {data.dropoffLocation}</div>
                        <div><b>Tổng tiền thuê:</b> {data.total.toLocaleString()} VND</div>
                        <div><b>Đã đặt cọc:</b> {data.deposit.toLocaleString()} VND</div>
                        <div><b>Thế chấp:</b> 5.000.000 VND</div>
                        <div className="amount-to-pay">
                            <b>Cần thanh toán:</b> <span style={{color: '#1976d2', fontSize: 22}}>{data.amountToPay.toLocaleString()} VND</span>
                        </div>
                    </div>
                    <div className="payment-methods">
                        <label><input type="radio" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} /> VNPay</label>
                        <label><input type="radio" value="momo" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} /> MoMo</label>
                        <label><input type="radio" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} /> Tiền mặt</label>
                    </div>
                </div>
                <div className="modal-actions">
                    <button className="btn primary" onClick={handleConfirm} disabled={!paymentMethod || isProcessing}>
                        {isProcessing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                    </button>
                    <button className="btn secondary" onClick={onClose}>Hủy</button>
                </div>
            </div>
            <style>{`
                .modal-overlay {
                  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                  background: rgba(0,0,0,0.3); z-index: 1000; display: flex; align-items: center; justify-content: center;
                }
                .modal.payment-modal {
                  background: #fff; border-radius: 16px; max-width: 400px; width: 100%; padding: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                }
                .modal-header { display: flex; justify-content: space-between; align-items: center; }
                .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; }
                .summary { margin-bottom: 16px; }
                .amount-to-pay { margin-top: 12px; }
                .payment-methods label { display: block; margin: 8px 0; }
                .modal-actions { display: flex; gap: 12px; margin-top: 16px; }
                .btn.primary { background: #1976d2; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
                .btn.secondary { background: #eee; color: #333; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
            `}</style>
        </div>
    );
};