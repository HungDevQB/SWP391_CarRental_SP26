import React from "react"
import { motion } from "framer-motion"
import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Autoplay, EffectFade, Navigation } from "swiper/modules"
import { formatVND } from '@/utils/format'
import {
    FaCarSide,
    FaSearch,
    FaChevronDown,
    FaBars,
    FaTimes,
    FaHome,
    FaCar,
    FaMapMarkerAlt,
    FaTag,
    FaPhone,
    FaHeart,
    FaUser,
    FaCalendarAlt,
    FaSignOutAlt,
    FaSignInAlt,
    FaUserPlus,
    FaArrowUp,
    FaPlay,
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn,
    FaEnvelope,
    FaCcVisa,
    FaCcMastercard,
    FaCcAmex,
    FaCcPaypal,
    FaStar,
    FaClock,
    FaCheckCircle,
    FaShieldAlt,
    FaHeadset,
    FaStore,
    FaGift,
    FaThumbsUp,
    FaRocket,
    FaAward,
    FaUsers,
    FaGasPump,
    FaCog,
    FaChevronRight,
    FaChevronLeft,
} from "react-icons/fa"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/effect-fade"
import { toast } from "react-toastify"
import api, { getCarBrands, getRegions, loginWithGoogle, logout, getAllRatings } from "../../../services/api"
import { useAuth } from "@/hooks/useAuth"
import CarCard from '@/components/features/cars/CarCard/CarCard';
import BookingModal from '@/components/features/cars/BookingModal';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import { getItem } from '@/utils/auth';
import TestimonialCarousel from '@/components/features/Rating/TestimonialCarousel';
import LoadingSpinner from '@/components/ui/Loading/LoadingSpinner.jsx';
import CozeChatbot from '@/components/Common/CozeChatbot.jsx';


// Images
const bg1 = "/images/bg_1.jpg"
const car5 = "/images/bg_2.jpg"
const car9 = "/images/car-5.jpg"
const zaloLogo = "/images/zalo.jpg"
const bannerImage = "/images/bn_1.png"

// Hero slides data
const heroSlides = [
    {
        id: 1,
        image: bg1,
        title: "DỊCH VỤ CHO THUÊ XE TỰ LÁI",
        subtitle: "DẪNG ĐẦU TƯƠNG LAI",
        description: "Trải nghiệm sự tự do với dịch vụ cho thuê xe cao cấp của chúng tôi",
        gradient: "from-blue-900/80 via-sky-900/60 to-cyan-900/80",
    },
    {
        id: 2,
        image: car5,
        title: "XE SANG TRỌNG, ĐẲNG CẤP",
        subtitle: "PHONG CÁCH LỊCH LÃM",
        description: "Khám phá bộ sưu tập xe sang trọng, phù hợp mọi nhu cầu di chuyển của bạn",
        gradient: "from-indigo-900/80 via-blue-900/60 to-sky-900/80",
    },
    {
        id: 3,
        image: car9,
        title: "AN TOÀN & TIỆN NGHI",
        subtitle: "HỖ TRỢ 24/7",
        description: "Đội ngũ hỗ trợ tận tâm, đảm bảo an toàn và tiện nghi cho mọi chuyến đi",
        gradient: "from-sky-900/80 via-blue-900/60 to-cyan-900/80",
    },
]

// Utility functions
const getToday = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
}

const getTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`
}

const getDefaultPickupTime = () => {
    const now = new Date();
    let hour = now.getHours();
    let minute = now.getMinutes();

    // Nếu sau 22h (22:01 trở đi) thì trả về 07:00
    if (hour >= 22) {
        return "07:00";
    }
    // Nếu phút > 0 thì tăng lên 1 giờ
    if (minute > 0) {
        hour += 1;
    }
    // Nếu sau khi cộng phút mà vượt quá 22h thì cũng trả về 07:00
    if (hour >= 22) {
        return "07:00";
    }
    return `${String(hour).padStart(2, "0")}:00`;
};

const getTomorrowFromDate = (dateStr) => {
    const date = new Date(dateStr)
    date.setDate(date.getDate() + 1)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

const getTimePlusHours = (timeStr, hours) => {
    const [hh, mm] = timeStr.split(":")
    let newHh = Number.parseInt(hh) + hours
    if (newHh >= 24) newHh -= 24
    return `${String(newHh).padStart(2, "0")}:${String(Number.parseInt(mm)).padStart(2, "0")}`
}

const brandLogoMap = {
    'VinFast': '/images/logo-vinfast-1.png',
    'Hyundai': '/images/logo-hyundai.jpg',
    'Suzuki': '/images/logo-Suzuki.jpg',
    'Mitsubishi': '/images/Mitsubishi_logo.svg',
    'MG': '/images/logo-MG.jpg',
    'Mercedes': '/images/logo-Mercedes.jpg',
    'Mazda': '/images/logo-Mazda.webp',
    'KIA': '/images/logo-KIA-1.jpg',
    'Toyota': '/images/logo_toyota.webp',
    'Ford': '/images/logo-ford.jpg',
    'Honda': '/images/logo-honda.webp',
    // Thêm các brand khác nếu có
};

function getBrandLogo(brandName) {
    // Nếu không có thì trả về ảnh mặc định
    return brandLogoMap[brandName] || '/images/default-brand-logo.jpg';
}
// Enhanced Error Message Component
const ErrorMessage = ({ message, className = "" }) => {
    return (
        <div
            className={`bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm ${className}`}
        >
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium">{message}</p>
                </div>
            </div>
        </div>
    )
}

// HomePage component
const HomePage = () => {
    // Splash animation state
    const [showSplash, setShowSplash] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2200); // 2.2s
        return () => clearTimeout(timer);
    }, []);

    const splashLogo = (
        <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"
        >
            <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="mb-6"
            >
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 rounded-2xl shadow-2xl flex items-center justify-center">
                    <FaCarSide className="text-5xl text-white" />
                </div>
            </motion.div>
            <motion.h1
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.7 }}
                className="text-5xl md:text-7xl font-bold text-white mb-2 drop-shadow-[0_2px_16px_rgba(60,0,120,0.7)] px-6 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30"
            >
                DriveLuxe
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="text-lg md:text-2xl text-blue-100 font-semibold"
            >
                Premium Car Rental
            </motion.p>
        </motion.div>
    );
    const { isAuthenticated, user } = useAuth();
    const todayStr = getToday();
    const tomorrowStr = getTomorrow();
    const currentTimePlus4 = getDefaultPickupTime();
    const dropoffTime = getDefaultPickupTime(); // hoặc logic riêng cho giờ trả

    const navigate = useNavigate()

    // State
    const [formData, setFormData] = useState({
        pickupLocation: "",
        dropoffLocation: "",
        pickupDate: todayStr,
        dropoffDate: tomorrowStr,
        pickupTime: currentTimePlus4,
        dropoffTime: dropoffTime,
    });
    const [featuredCars, setFeaturedCars] = useState([]);
    const [popularCars, setPopularCars] = useState([]);
    const [brands, setBrands] = useState([]);
    const [locations, setLocations] = useState([]);
    const [regions, setRegions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchError, setSearchError] = useState("");
    const [heroIdx, setHeroIdx] = useState(0);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [showCookieConsent, setShowCookieConsent] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedCar, setSelectedCar] = useState(null);
    const [testimonials, setTestimonials] = useState([]);
    // Handler khi nhấn yêu thích ở CarCard
    const handleFavoriteChange = async (carId, isFavorite) => {
        // Chỉ cập nhật trạng thái isFavorite của xe trong state, không refetch toàn bộ
        setFeaturedCars((prev) => prev.map(car => car.id === carId ? { ...car, isFavorite } : car));
        setPopularCars((prev) => prev.map(car => car.id === carId ? { ...car, isFavorite } : car));
    };

    // Swiper refs for navigation
    const brandSwiperRef = React.useRef(null);
    const featuredSwiperRef = React.useRef(null);
    const popularSwiperRef = React.useRef(null);

    useEffect(() => {
        const email = getItem('userEmail');
        if (email) setUserEmail(email);
    }, []);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                setError("")

                const token = getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const [featuredResponse, popularResponse, brandsResponse, regionsResponse] = await Promise.all([
                    api.get("/api/cars/featured", config),
                    api.get("/api/cars/popular", config),
                    getCarBrands(),
                    getRegions(),
                ])

                setFeaturedCars(featuredResponse?.data?.data?.content || [])
                setPopularCars(popularResponse?.data?.data?.content || [])
                setBrands(brandsResponse || [])
                // ✅ SỬA: Gọi API lấy regions theo country code
                try {
                    const regionsResponse = await api.get('/api/cars/regions/country/+84', config);
                    console.log("[HomePage] Vietnam Regions API Response:", regionsResponse.data);
                    const regionsList = regionsResponse.data?.data || [];
                    setRegions(regionsList);
                    setLocations(regionsList.map((region) => region.regionName));
                } catch (regionError) {
                    console.error("[HomePage] Error fetching Vietnam regions:", regionError);
                    // Fallback: thử API cũ và filter
                    try {
                        const allRegionsResponse = await getRegions();
                        console.log("[HomePage] All Regions Fallback:", allRegionsResponse);
                        const vietnamRegions = allRegionsResponse?.filter(region =>
                            region.countryCode === "+84" || region.countryCode === "VN"
                        ) || [];
                        setRegions(vietnamRegions);
                        setLocations(vietnamRegions?.map((region) => region.regionName) || []);
                    } catch (fallbackError) {
                        console.error("[HomePage] Fallback regions failed:", fallbackError);
                        setRegions([]);
                        setLocations([]);
                    }
                }
            } catch (err) {
                console.error("[HomePage] Fetch error:", err);
                const errorMessage = err.message || "Lỗi khi tải dữ liệu"
                toast.error(`Lỗi khi tải dữ liệu: ${errorMessage}`)
                setError(errorMessage)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    // Fetch testimonials
    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const response = await getAllRatings()
                // Lấy những rating có điểm cao và có comment
                const goodRatings = response
                    .filter(rating => rating.ratingScore >= 4 && rating.comment)
                    .sort((a, b) => new Date(b.ratingDate) - new Date(a.ratingDate))
                    .slice(0, 10) // Lấy 10 rating mới nhất
                setTestimonials(goodRatings)
            } catch (error) {
                console.error('Error fetching testimonials:', error)
            }
        }

        fetchTestimonials()
    }, [])

    // Auto-slide hero
    useEffect(() => {
        const interval = setInterval(() => {
            setHeroIdx((prev) => (prev + 1) % heroSlides.length)
        }, 6000)
        return () => clearInterval(interval)
    }, [])

    // Scroll handler for back-to-top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollToTop(window.scrollY > 300)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Scroll to top
    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [])

    // Handle form input change
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target
        setFormData((prev) => {
            const updated = { ...prev, [name]: value }

            if (name === "pickupDate" && value > prev.dropoffDate) {
                updated.dropoffDate = getTomorrowFromDate(value)
            } else if (name === "pickupTime" && prev.pickupDate === prev.dropoffDate && value > prev.dropoffTime) {
                updated.dropoffTime = getTimePlusHours(value, 4)
            }
            return updated
        })
    }, [])

    // Handle car search
    const handleSearchCars = useCallback(
        async (e) => {
            e.preventDefault()
            setSearchError("")

            if (
                !formData.pickupLocation ||
                !formData.pickupDate ||
                !formData.pickupTime ||
                !formData.dropoffDate ||
                !formData.dropoffTime
            ) {
                setSearchError("Vui lòng điền đầy đủ các trường bắt buộc.")
                return
            }

            const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`)
            const dropoffDateTime = new Date(`${formData.dropoffDate}T${formData.dropoffTime}`)
            if (pickupDateTime < new Date()) {
                setSearchError("Thời gian nhận xe phải lớn hơn thời gian hiện tại.")
                return
            }

            if (dropoffDateTime <= pickupDateTime) {
                setSearchError("Thời gian trả xe phải lớn hơn thời gian nhận xe.")
                return
            }

            try {
                // Tìm region được chọn để lấy regionId
                const selectedRegion = regions.find(region => region.regionName === formData.pickupLocation)

                const params = {
                    pickupLocation: formData.pickupLocation,
                    regionId: selectedRegion?.regionId || "", // Thêm regionId
                    pickupDateTime: `${formData.pickupDate}T${formData.pickupTime}:00`,
                    dropoffDateTime: `${formData.dropoffDate}T${formData.dropoffTime}:00`,
                    countryCode: "+84", // Mặc định Việt Nam
                };
                console.log("[HomePage] Navigate to SearchPage with params:", params);
                navigate("/search", { state: { searchParams: params } });
            } catch (err) {
                setSearchError(err.response?.data?.message || "Tìm kiếm thất bại")
            }
        },
        [formData, navigate, regions],
    )

    // Handle Google login
    const handleGoogleLogin = useCallback(async () => {
        try {
            await loginWithGoogle()
        } catch (err) {
            toast.error(err.message || "Đăng nhập Google thất bại")
        }
    }, [])

    // Handle logout
    const handleLogout = useCallback(async () => {
        try {
            await logout()
            window.location.href = "/";
        } catch (err) {
            toast.error(err.message || "Đăng xuất thất bại")
        }
    }, [])

    // Handler khi nhấn Đặt xe ở CarCard
    const handleBookNow = (car) => {
        setSelectedCar(car);
        setIsBookingModalOpen(true);
    };

    // Handler khi đặt xe thành công
    const handleSubmitBooking = async (bookingData) => {
        try {
            // Thay vì tạo booking ngay, chuyển đến trang confirmation với thông tin
            setIsBookingModalOpen(false);
            setSelectedCar(null);

            // Chuyển đến trang confirmation với booking data
            navigate('/bookings/confirmation', {
                state: {
                    bookingData: {
                        ...bookingData,
                        car: selectedCar // Thêm thông tin xe
                    }
                }
            });
        } catch (err) {
            toast.error(err.message || 'Không thể tạo đặt chỗ');
        }
    };


    // Hiển thị splash nếu đang showSplash
    if (showSplash) {
        return (
            <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{ duration: 0.7, delay: 1.7 }}
                style={{ originX: 0.5 }}
            >
                {splashLogo}
            </motion.div>
        );
    }
    // Loading spinner như cũ
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    // Đã xóa biến currentHero

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <Header
                isUserDropdownOpen={isUserDropdownOpen}
                setIsUserDropdownOpen={setIsUserDropdownOpen}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            <main className="pt-24">
                {/* Enhanced Hero Section */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="relative h-screen overflow-hidden"
                >
                    <Swiper
                        modules={[EffectFade, Autoplay]}
                        effect="fade"
                        autoplay={{ delay: 6000, disableOnInteraction: false }}
                        loop={true}
                        className="h-full"
                    >
                        {heroSlides.map((slide, index) => (
                            <SwiperSlide key={slide.id}>
                                <div className="relative h-full">
                                    <img
                                        src={slide.image || "/placeholder.svg"}
                                        alt={slide.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-r from-blue-900/80 via-indigo-900/70 to-purple-900/60`}></div>
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                        <div className="container mx-auto px-4">
                                            <div className="max-w-4xl mx-auto text-center text-white">
                                                <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
                                                    {slide.title.split(" ").map((word, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={
                                                                idx % 2 === 0
                                                                    ? "text-white drop-shadow-lg"
                                                                    : "bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent"
                                                            }
                                                        >
                                                            {word}{" "}
                                                        </span>
                                                    ))}
                                                </h1>
                                                <h2 className="text-xl md:text-3xl font-semibold mb-6 text-blue-200 drop-shadow-lg">
                                                    {slide.subtitle}
                                                </h2>
                                                <p className="text-lg md:text-xl mb-12 text-indigo-100 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                                                    {slide.description}
                                                </p>
                                                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                                                    <Link
                                                        to="/search"
                                                        state={{ filterType: "all" }}
                                                        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white py-4 px-10 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
                                                    >
                                                        <FaRocket className="inline mr-3" />
                                                        Khám phá ngay
                                                    </Link>
                                                    <button className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white py-4 px-10 rounded-2xl font-semibold text-lg transition-all duration-300 border border-white/30 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl">
                                                        <FaPlay className="text-sm" />
                                                        Xem video giới thiệu
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce z-10">
                        <div className="flex flex-col items-center">
                            <span className="text-sm mb-3 font-medium">Khám phá thêm</span>
                            <div className="w-6 h-10 border-2 border-white/70 rounded-full flex justify-center backdrop-blur-sm">
                                <div className="w-1 h-3 bg-white/90 rounded-full mt-2 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Enhanced Search Section */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="relative -mt-40 z-20 px-4"
                >
                    <div className="container mx-auto">
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-blue-100 max-w-7xl mx-auto">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                    Tìm xe hoàn hảo cho chuyến đi của bạn
                                </h3>
                                <p className="text-gray-600">Điền thông tin để tìm xe phù hợp nhất</p>
                            </div>

                            <form
                                onSubmit={handleSearchCars}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6"
                                noValidate
                            >
                                {/* Trường nhập Điểm nhận xe */}
                                <div className="lg:col-span-2">
                                    <label
                                        htmlFor="pickupLocation"
                                        className="block text-sm font-bold text-gray-700 mb-3 flex items-center"
                                    >
                                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                            <FaMapMarkerAlt className="text-blue-600" />
                                        </div>
                                        Điểm nhận xe
                                    </label>
                                    <select
                                        id="pickupLocation"
                                        name="pickupLocation"
                                        value={formData.pickupLocation}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-4 border-2 border-blue-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/50 hover:bg-white transition-all duration-300 text-sm font-medium"
                                        required
                                    >
                                        <option value="">Chọn khu vực nhận xe</option>
                                        {/* Debug: Hiển thị số lượng regions */}
                                        {console.log("[HomePage Render] Regions count:", regions.length)}
                                        {console.log("[HomePage Render] Regions data:", regions)}
                                        {regions.map((region) => {
                                            console.log("[HomePage Render] Mapping region:", region); // Debug từng region
                                            return (
                                                <option key={region.regionId} value={region.regionName}>
                                                    {region.regionName}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                                {/* ĐÃ XÓA trường nhập Điểm trả xe */}
                                {/* <div className="lg:col-span-2"> ... </div> */}
                                <div>
                                    <label htmlFor="pickupDate" className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                                        <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                                            <FaCalendarAlt className="text-emerald-600" />
                                        </div>
                                        Ngày nhận
                                    </label>
                                    <input
                                        type="date"
                                        id="pickupDate"
                                        name="pickupDate"
                                        value={formData.pickupDate}
                                        onChange={handleInputChange}
                                        min={todayStr}
                                        className="w-full px-4 py-4 border-2 border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/50 hover:bg-white transition-all duration-300 text-sm font-medium"
                                        required
                                    />
                                </div>

                                {/* Giờ nhận */}
                                <div>
                                    <label htmlFor="pickupTime" className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                                        <div className="bg-amber-100 p-2 rounded-lg mr-3">
                                            <FaClock className="text-amber-600" />
                                        </div>
                                        Giờ nhận
                                    </label>
                                    <select
                                        id="pickupTime"
                                        name="pickupTime"
                                        value={formData.pickupTime}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-4 border-2 border-amber-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50/50 hover:bg-white transition-all duration-300 text-sm font-medium"
                                    >
                                        {Array.from({ length: 16 }, (_, i) => {
                                            const hour = (7 + i).toString().padStart(2, '0');
                                            return (
                                                <option key={hour} value={`${hour}:00`}>
                                                    {hour}:00
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="dropoffDate" className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                                        <div className="bg-pink-100 p-2 rounded-lg mr-3">
                                            <FaCalendarAlt className="text-pink-600" />
                                        </div>
                                        Ngày trả
                                    </label>
                                    <input
                                        type="date"
                                        id="dropoffDate"
                                        name="dropoffDate"
                                        value={formData.dropoffDate}
                                        onChange={handleInputChange}
                                        min={formData.pickupDate}
                                        className="w-full px-4 py-4 border-2 border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-pink-50/50 hover:bg-white transition-all duration-300 text-sm font-medium"
                                        required
                                    />
                                </div>

                                {/* Giờ trả */}
                                <div>
                                    <label htmlFor="dropoffTime" className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                            <FaClock className="text-purple-600" />
                                        </div>
                                        Giờ trả
                                    </label>
                                    <select
                                        id="dropoffTime"
                                        name="dropoffTime"
                                        value={formData.dropoffTime}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-4 border-2 border-purple-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-purple-50/50 hover:bg-white transition-all duration-300 text-sm font-medium"
                                    >
                                        {Array.from({ length: 16 }, (_, i) => {
                                            const hour = (7 + i).toString().padStart(2, '0');
                                            return (
                                                <option key={hour} value={`${hour}:00`}>
                                                    {hour}:00
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div className="lg:col-span-6 flex justify-center mt-6">
                                    <button
                                        type="submit"
                                        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-4 px-16 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center"
                                        disabled={isLoading}
                                    >
                                        <FaSearch className="mr-3 text-xl" />
                                        Tìm xe ngay
                                        <FaRocket className="ml-3 text-xl" />
                                    </button>
                                </div>
                            </form>
                            {searchError && <ErrorMessage message={searchError} className="mt-6" />}
                        </div>
                    </div>
                </motion.section>

                {/* Enhanced Brand Section */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="py-24 bg-gradient-to-b from-white via-blue-50 to-indigo-50"
                >
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-20">
                            <h2 className="text-5xl font-bold text-gray-900 mb-6">
                                Thương hiệu{" "}
                                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    xe hàng đầu
                                </span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                Chọn xe từ những thương hiệu uy tín và chất lượng nhất thế giới với dịch vụ chăm sóc khách hàng tận tâm
                            </p>
                        </div>
                        <div className="relative">
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-blue-100 text-blue-600 rounded-full p-3 shadow-lg transition-all"
                                onClick={() => brandSwiperRef.current?.slidePrev()}
                                aria-label="Previous brands"
                            >
                                <FaChevronLeft size={24} />
                            </button>
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-blue-100 text-blue-600 rounded-full p-3 shadow-lg transition-all"
                                onClick={() => brandSwiperRef.current?.slideNext()}
                                aria-label="Next brands"
                            >
                                <FaChevronRight size={24} />
                            </button>
                            <Swiper
                                modules={[Autoplay, Navigation]}
                                autoplay={{ delay: 3000, disableOnInteraction: false }}
                                slidesPerView={6}
                                spaceBetween={30}
                                loop={true}
                                breakpoints={{
                                    320: { slidesPerView: 2, spaceBetween: 15 },
                                    640: { slidesPerView: 3, spaceBetween: 20 },
                                    1024: { slidesPerView: 4, spaceBetween: 25 },
                                    1280: { slidesPerView: 6, spaceBetween: 30 },
                                }}
                                className="pb-8"
                                onSwiper={swiper => (brandSwiperRef.current = swiper)}
                            >
                                {brands.map((brand) => (
                                    <SwiperSlide key={`brand-${brand.id}`}>
                                        <div
                                            className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden hover:-translate-y-3 border border-blue-100 hover:border-indigo-300"
                                            onClick={() => navigate("/search", { state: { filterType: "all", filters: { brand: brand.brandName } } })}
                                        >
                                            <div className="p-8 text-center">
                                                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-3 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                                                    <img
                                                        src={getBrandLogo(brand.brandName)}
                                                        alt={brand.brandName}
                                                        className="w-full h-full object-contain"
                                                        loading="lazy"
                                                        onError={e => { e.target.src = "/images/default-brand-logo.jpg" }}
                                                    />
                                                </div>
                                                <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">
                                                    {brand.brandName}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">Premium Quality</p>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                </motion.section>

                {/* Enhanced Featured Cars Section */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="py-24 bg-gradient-to-b from-indigo-50 via-white to-purple-50"
                >
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full px-6 py-2 mb-6">
                                <FaAward className="text-blue-600 mr-2" />
                                <span className="text-blue-600 font-semibold text-sm">XE NỔI BẬT</span>
                            </div>
                            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                                Xe Được Yêu Thích Nhất
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                Khám phá những chiếc xe được khách hàng đánh giá cao nhất với công nghệ hiện đại và thiết kế sang trọng
                            </p>
                        </div>

                        {error ? (
                            <ErrorMessage message={error} />
                        ) : isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <LoadingSpinner size="large" />
                            </div>
                        ) : !featuredCars || featuredCars.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                                    <FaCar className="text-blue-500 text-3xl" />
                                </div>
                                <p className="text-gray-600 text-lg">Không có xe nổi bật nào.</p>
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    <button
                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-blue-100 text-blue-600 rounded-full p-3 shadow-lg transition-all"
                                        onClick={() => featuredSwiperRef.current?.slidePrev()}
                                        aria-label="Previous featured cars"
                                    >
                                        <FaChevronLeft size={24} />
                                    </button>
                                    <button
                                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-blue-100 text-blue-600 rounded-full p-3 shadow-lg transition-all"
                                        onClick={() => featuredSwiperRef.current?.slideNext()}
                                        aria-label="Next featured cars"
                                    >
                                        <FaChevronRight size={24} />
                                    </button>
                                    <Swiper
                                        modules={[Pagination, Autoplay, Navigation]}
                                        loop={true}
                                        pagination={{
                                            clickable: true,
                                            bulletClass: "swiper-pagination-bullet !bg-blue-600",
                                            bulletActiveClass: "swiper-pagination-bullet-active !bg-indigo-600",
                                        }}
                                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                                        slidesPerView={3}
                                        spaceBetween={30}
                                        breakpoints={{
                                            320: { slidesPerView: 1, spaceBetween: 20 },
                                            768: { slidesPerView: 2, spaceBetween: 25 },
                                            1024: { slidesPerView: 3, spaceBetween: 30 },
                                        }}
                                        className="pb-16"
                                        onSwiper={swiper => (featuredSwiperRef.current = swiper)}
                                    >
                                        {featuredCars.map((car) => (
                                            <SwiperSlide key={`featured-car-${car.id}`}>
                                                <CarCard
                                                    car={car}
                                                    type="featured"
                                                    isLoading={isLoading}
                                                    onBookNow={handleBookNow}
                                                    onFavoriteChange={(isFavorite) => handleFavoriteChange(car.id, isFavorite)}
                                                />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                                <div className="text-center mt-12">
                                    <Link
                                        to="/search"
                                        state={{ filterType: "featured" }}
                                        className="inline-flex items-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-4 px-10 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                                    >
                                        <FaCar className="mr-3" />
                                        Xem tất cả xe nổi bật
                                        <FaArrowUp className="ml-3 rotate-45" />
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </motion.section>

                {/* Enhanced Popular Cars Section */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="py-24 bg-gradient-to-b from-purple-50 via-white to-emerald-50"
                >
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full px-6 py-2 mb-6">
                                <FaThumbsUp className="text-emerald-600 mr-2" />
                                <span className="text-emerald-600 font-semibold text-sm">XE PHỔ BIẾN</span>
                            </div>
                            <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6">
                                Được Khách Hàng Tin Tưởng
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                Những mẫu xe được thuê nhiều nhất với đánh giá tích cực từ khách hàng
                            </p>
                        </div>

                        {error ? (
                            <ErrorMessage message={error} />
                        ) : isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <LoadingSpinner size="large" />
                            </div>
                        ) : !popularCars || popularCars.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                                    <FaCar className="text-emerald-500 text-3xl" />
                                </div>
                                <p className="text-gray-600 text-lg">Không có xe phổ biến nào.</p>
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    <button
                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-emerald-100 text-emerald-600 rounded-full p-3 shadow-lg transition-all"
                                        onClick={() => popularSwiperRef.current?.slidePrev()}
                                        aria-label="Previous popular cars"
                                    >
                                        <FaChevronLeft size={24} />
                                    </button>
                                    <button
                                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-emerald-100 text-emerald-600 rounded-full p-3 shadow-lg transition-all"
                                        onClick={() => popularSwiperRef.current?.slideNext()}
                                        aria-label="Next popular cars"
                                    >
                                        <FaChevronRight size={24} />
                                    </button>
                                    <Swiper
                                        modules={[Pagination, Autoplay, Navigation]}
                                        loop={true}
                                        pagination={{
                                            clickable: true,
                                            bulletClass: "swiper-pagination-bullet !bg-emerald-600",
                                            bulletActiveClass: "swiper-pagination-bullet-active !bg-teal-600",
                                        }}
                                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                                        slidesPerView={3}
                                        spaceBetween={30}
                                        breakpoints={{
                                            320: { slidesPerView: 1, spaceBetween: 20 },
                                            768: { slidesPerView: 2, spaceBetween: 25 },
                                            1024: { slidesPerView: 3, spaceBetween: 30 },
                                        }}
                                        className="pb-16"
                                        onSwiper={swiper => (popularSwiperRef.current = swiper)}
                                    >
                                        {popularCars.map((car) => (
                                            <SwiperSlide key={`popular-car-${car.id}`}>
                                                <CarCard
                                                    car={car}
                                                    type="popular"
                                                    isLoading={isLoading}
                                                    onBookNow={handleBookNow}
                                                    onFavoriteChange={(isFavorite) => handleFavoriteChange(car.id, isFavorite)}
                                                />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                                <div className="text-center mt-12">
                                    <Link
                                        to="/search"
                                        state={{ filterType: "popular" }}
                                        className="inline-flex items-center bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white py-4 px-10 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                                    >
                                        <FaThumbsUp className="mr-3" />
                                        Xem tất cả xe phổ biến
                                        <FaArrowUp className="ml-3 rotate-45" />
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </motion.section>

                {/* Enhanced CTA Banner Section */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="py-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
                >
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row items-center bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                            <div className="lg:w-1/2 p-12 text-center lg:text-left">
                                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                                    <FaGift className="text-yellow-300 mr-2" />
                                    <span className="text-white font-semibold text-sm">ƯU ĐÃI ĐỘC QUYỀN</span>
                                </div>
                                <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                                    1,000+ xe và hơn thế nữa
                                </h3>
                                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                                    Hãy trải nghiệm dịch vụ cho thuê xe cao cấp với đội xe đa dạng và chất lượng hàng đầu!
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link
                                        to="/search"
                                        state={{ filterType: "all" }}
                                        className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                                    >
                                        <FaSearch className="mr-3" />
                                        Tìm Xe Ngay
                                    </Link>
                                    <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center">
                                        <FaPhone className="mr-3" />
                                        Liên Hệ Tư Vấn
                                    </button>
                                </div>
                            </div>
                            <div className="lg:w-1/2">
                                <img
                                    src={bannerImage || "/placeholder.svg"}
                                    alt="Premium Car Collection"
                                    className="w-full h-auto object-cover"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Enhanced Why Choose Us Section */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="py-24 bg-gradient-to-b from-gray-50 via-white to-emerald-50"
                >
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center bg-gradient-to-r from-amber-100 to-orange-100 rounded-full px-6 py-2 mb-6">
                                <FaAward className="text-amber-600 mr-2" />
                                <span className="text-amber-600 font-semibold text-sm">TẠI SAO CHỌN CHÚNG TÔI</span>
                            </div>
                            <h2 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-6">
                                Dịch Vụ Xuất Sắc
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                Chúng tôi tự hào cung cấp dịch vụ cho thuê xe cao cấp với những ưu điểm vượt trội
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: FaCheckCircle,
                                    title: "Đặt xe dễ dàng",
                                    description: "Quy trình đặt xe nhanh chóng chỉ trong vài cú nhấp chuột với giao diện thân thiện.",
                                    gradient: "from-emerald-500 to-teal-500",
                                },
                                {
                                    icon: FaHeadset,
                                    title: "Hỗ trợ 24/7",
                                    description: "Đội ngũ chăm sóc khách hàng chuyên nghiệp sẵn sàng hỗ trợ bạn mọi lúc mọi nơi.",
                                    gradient: "from-blue-500 to-indigo-500",
                                },
                                {
                                    icon: FaShieldAlt,
                                    title: "Giá tốt nhất",
                                    description: "Cam kết mức giá cạnh tranh và minh bạch, không phí ẩn, đảm bảo giá trị tốt nhất.",
                                    gradient: "from-amber-500 to-orange-500",
                                },
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100 hover:border-gray-300"
                                >
                                    <div className={`bg-gradient-to-r ${feature.gradient} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                        <feature.icon className="text-white text-3xl" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-700 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Enhanced How It Works Section */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="py-24 bg-gradient-to-b from-emerald-50 via-white to-blue-50"
                >
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full px-6 py-2 mb-6">
                                <FaRocket className="text-blue-600 mr-2" />
                                <span className="text-blue-600 font-semibold text-sm">QUY TRÌNH THUÊ XE</span>
                            </div>
                            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                                Chỉ 4 Bước Đơn Giản
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                Thuê xe mơ ước của bạn một cách nhanh chóng và thuận tiện
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    step: 1,
                                    icon: FaCarSide,
                                    title: "Chọn xe",
                                    description: "Duyệt qua bộ sưu tập xe đa dạng và chọn chiếc xe hoàn hảo cho chuyến đi.",
                                    bgColor: "from-blue-50 to-indigo-50",
                                    iconColor: "text-blue-600",
                                    stepColor: "from-blue-600 to-indigo-600",
                                },
                                {
                                    step: 2,
                                    icon: FaMapMarkerAlt,
                                    title: "Chọn địa điểm & thời gian",
                                    description: "Xác định địa điểm nhận xe và thời gian thuê phù hợp với lịch trình.",
                                    bgColor: "from-emerald-50 to-teal-50",
                                    iconColor: "text-emerald-600",
                                    stepColor: "from-emerald-600 to-teal-600",
                                },
                                {
                                    step: 3,
                                    icon: FaStar,
                                    title: "Đặt & thanh toán",
                                    description: "Hoàn tất đặt xe với hệ thống thanh toán bảo mật và nhận xác nhận.",
                                    bgColor: "from-amber-50 to-orange-50",
                                    iconColor: "text-amber-600",
                                    stepColor: "from-amber-600 to-orange-600",
                                },
                                {
                                    step: 4,
                                    icon: FaCheckCircle,
                                    title: "Tận hưởng chuyến đi",
                                    description: "Nhận xe tại địa điểm đã chọn và bắt đầu hành trình tuyệt vời.",
                                    bgColor: "from-purple-50 to-pink-50",
                                    iconColor: "text-purple-600",
                                    stepColor: "from-purple-600 to-pink-600",
                                },
                            ].map((item, index) => (
                                <div key={item.step} className="relative text-center group">
                                    <div className={`bg-gradient-to-r ${item.stepColor} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        {item.step}
                                    </div>

                                    {index < 3 && (
                                        <div className="hidden lg:block absolute top-8 left-1/2 w-full h-1 bg-gradient-to-r from-gray-200 to-gray-300 transform translate-x-1/2 -z-10"></div>
                                    )}

                                    <div className={`bg-gradient-to-br ${item.bgColor} w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                        <item.icon className={`${item.iconColor} text-4xl`} />
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-700 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Enhanced Floating Elements */}
                <div className="fixed bottom-8 left-8 z-30 flex flex-col space-y-4">
                    {/* <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" className="group relative">
                        <div className="bg-blue-500 hover:bg-blue-600 w-14 h-14 rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                            <img
                                src={zaloLogo || "/placeholder.svg"}
                                alt="Zalo Chat"
                                className="w-8 h-8 rounded-full"
                                loading="lazy"
                            />
                        </div>
                        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            Chat với chúng tôi
                        </div>
                    </a> */}

                    {showScrollToTop && (
                        <button
                            onClick={scrollToTop}
                            className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white w-14 h-14 rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                            aria-label="Lên đầu trang"
                        >
                            <FaArrowUp className="text-lg" />
                            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                Lên đầu trang
                            </div>
                        </button>
                    )}
                </div>
                {/* Enhanced Testimonial Section - Thêm ngay trước Footer */}
                {testimonials.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.7 }}
                        className="py-24 bg-gradient-to-b from-white via-blue-50 to-indigo-50"
                    >
                        <div className="container mx-auto px-4">
                            <div className="text-center mb-20">
                                <div className="inline-flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full px-6 py-2 mb-6">
                                    <FaStar className="text-yellow-600 mr-2" />
                                    <span className="text-yellow-700 font-semibold text-sm">ĐÁNH GIÁ KHÁCH HÀNG</span>
                                </div>
                                <h2 className="text-5xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-6">
                                    Khách Hàng Nói Gì Về Chúng Tôi
                                </h2>
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                    Những phản hồi chân thực từ khách hàng đã sử dụng dịch vụ cho thuê xe của chúng tôi
                                </p>
                            </div>
                            <TestimonialCarousel ratings={testimonials} />
                        </div>
                    </motion.section>
                )}
                {/* Enhanced Cookie Consent Banner
                {showCookieConsent && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl p-6 z-40 border-t border-gray-200">
                        <div className="container mx-auto px-4">
                            <div className="flex flex-col lg:flex-row items-center justify-between">
                                <div className="mb-6 lg:mb-0 text-center lg:text-left lg:mr-8">
                                    <h4 className="font-bold text-gray-900 mb-2">🍪 Chúng tôi sử dụng Cookie</h4>
                                    <p className="text-gray-700 leading-relaxed">
                                        Chúng tôi sử dụng cookie để cải thiện trải nghiệm của bạn và cung cấp dịch vụ tốt nhất. Bằng cách
                                        tiếp tục sử dụng trang web, bạn đồng ý với chính sách cookie của chúng tôi.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                                    <button
                                        onClick={() => setShowCookieConsent(false)}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                                    >
                                        Từ chối
                                    </button>
                                    <button
                                        onClick={() => setShowCookieConsent(false)}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                                    >
                                        Chấp nhận tất cả
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )} */}
            </main>
            <Footer />
            {/* Booking Modal dùng chung */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => { setIsBookingModalOpen(false); setSelectedCar(null); }}
                car={selectedCar}
                onSubmitBooking={handleSubmitBooking}
            />

            <CozeChatbot />

        </div>
    )
}

export default HomePage