
"use client"

import { useState, useEffect, useRef } from "react"
import React, { Suspense } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { getCarById, getRatingsByCarId, post, searchCars, getUserById, getSimilarCarsAdvanced, getRatingSummaryByCarId, getProfile } from "@/services/api.js"
import {
  FaCarSide,
  FaUser,
  FaTachometerAlt,
  FaCog,
  FaGasPump,
  FaStar,
  FaStarHalf,
  FaRegStar,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaShieldAlt,
  FaFileAlt,
  FaInfoCircle,
  FaCheck,
  FaArrowRight,
  FaComments,
  FaHeart,
  FaShare,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaBluetooth,
  FaCamera,
  FaBullseye,
  FaMapPin,
  FaSun,
  FaUsb,
  FaMusic,
  FaCar,
  FaImages,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowLeft,
  FaTimes,
  FaThumbsUp,
  FaAward,
  FaCrown,
  FaFire,
  FaGem,
  FaLock,
  FaUserCheck,
  FaHeadset,
  FaRocket,
  FaClock,
  FaBolt,
  FaExpand,
  FaPlay,
  FaPause,
  FaSearchPlus,
  FaEye,
} from "react-icons/fa"
import { toast } from "react-toastify"
import { useAuth } from "@/hooks/useAuth.js"
import Header from "@/components/layout/Header/Header"
import Footer from "@/components/layout/Footer/Footer"
import { FaArrowUp } from "react-icons/fa"
import BookingModal from "@/components/features/cars/BookingModal.jsx"
import CarCard from "@/components/features/cars/CarCard/CarCard.jsx"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Autoplay, Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import TestimonialCarousel from '../../../components/features/Rating/TestimonialCarousel'
import { getItem } from '@/utils/auth';
import LoadingSpinner from '@/components/ui/Loading/LoadingSpinner.jsx';
import { formatVND } from '@/utils/format';
import CustomerChatModal from '@/components/Chat/CustomerChatModal';
import FavoriteButton from '@/components/ui/FavoriteButton/FavoriteButton.jsx';

// Enhanced Error Message Component
const ErrorMessage = ({ message, onRetry, className = "" }) => {
  return (
    <div
      className={`bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-3xl p-8 shadow-xl text-center ${className}`}
    >
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-400 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <FaExclamationTriangle className="text-white text-3xl" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Oops! Đã có lỗi xảy ra</h3>
        <p className="text-gray-600 mb-8 text-lg max-w-md">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            <FaSpinner className="inline mr-3" />
            Thử lại
          </button>
        )}
      </div>
    </div>
  )
}

// Enhanced Star Rating Component
const StarRating = ({ rating, size = "small" }) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStar = 5 - fullStars - (hasHalfStar ? 1 : 0)

  const starSizes = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-xl",
  }

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} className={`text-yellow-400 ${starSizes[size]}`} />)
  }

  if (hasHalfStar) {
    stars.push(<FaStarHalf key="half" className={`text-yellow-400 ${starSizes[size]}`} />)
  }

  for (let i = 0; i < emptyStar; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} className={`text-gray-300 ${starSizes[size]}`} />)
  }

  return <div className="flex items-center">{stars}</div>
}

// Enhanced Feature Icon Component
const FeatureIcon = ({ feature }) => {
  const iconMap = {
    Bluetooth: { icon: <FaBluetooth />, color: "text-blue-500", bg: "bg-blue-100" },
    "Camera 360": { icon: <FaCamera />, color: "text-purple-500", bg: "bg-purple-100" },
    "Cảm biến lùi": { icon: <FaBullseye />, color: "text-red-500", bg: "bg-red-100" },
    "Camera lùi": { icon: <FaCamera />, color: "text-green-500", bg: "bg-green-100" },
    "Định vị GPS": { icon: <FaMapPin />, color: "text-orange-500", bg: "bg-orange-100" },
    "Điều hòa": { icon: <FaSun />, color: "text-yellow-500", bg: "bg-yellow-100" },
    "Cổng sạc USB": { icon: <FaUsb />, color: "text-indigo-500", bg: "bg-indigo-100" },
    "Hệ thống âm thanh": { icon: <FaMusic />, color: "text-pink-500", bg: "bg-pink-100" },
    "Lốp dự phòng": { icon: <FaCar />, color: "text-gray-500", bg: "bg-gray-100" },
  }

  const featureData = iconMap[feature] || { icon: <FaCheck />, color: "text-blue-500", bg: "bg-blue-100" }

  return (
    <div
      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${featureData.bg} ${featureData.color} shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110`}
    >
      {featureData.icon}
    </div>
  )
}

const CarDetailPage = () => {
  // Scroll to Top button state and logic
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const { carId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  // State management
  const [car, setCar] = useState(null)
  const [ratings, setRatings] = useState([])
  const [similarCars, setSimilarCars] = useState([])
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showAllFeatures, setShowAllFeatures] = useState(false)
  const [showAllTerms, setShowAllTerms] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [imageLoadingStates, setImageLoadingStates] = useState({})
  const [imageErrors, setImageErrors] = useState({})
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [supplier, setSupplier] = useState(null)
  const [loadingSupplier, setLoadingSupplier] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Lấy supplierId và supplierName từ car (ưu tiên userId, fallback sang id, kiểm tra null an toàn)
  const supplierId = supplier?.id
    || supplier?.userId
    || (car && (
      car.supplier?.id
      || car.supplier?.userId
      || car.supplierId
      || car.ownerId
    ))
    || '';

  const supplierName = supplier?.userDetail?.fullName
    || supplier?.username
    || supplier?.email
    || (car && (
      car.supplier?.userDetail?.fullName
      || car.supplier?.username
      || car.supplier?.email
    ))
    || '';

    const handleFavoriteChange = (isFavorite) => {
      setIsFavorite(isFavorite);
    };

// Handler mở/tắt modal chat
  const handleOpenChatModal = () => setShowChatModal(true);
  const handleCloseChatModal = () => setShowChatModal(false);


  // Compose currentUser and selectedUser for chat
  const chatCurrentUser = user && isAuthenticated ? {
    id: user.userId || user.id,
    username: user.username || user.email,
    role: user.role || 'customer',
  } : null;
  const chatSupplierUser = supplierId ? {
    id: supplierId,
    username: supplierName,
    role: 'supplier',
  } : null;
  const isSupplierSelf = chatCurrentUser && chatSupplierUser && chatCurrentUser.id === chatSupplierUser.id;

  // Debug log
  useEffect(() => {
    console.log('[CarDetailPage] car:', car);
    console.log('[CarDetailPage] supplierId:', supplierId, 'supplierName:', supplierName);
  }, [car, supplierId, supplierName]);

// ...existing code...
  const similarSwiperRef = useRef(null);
  const [carRatings, setCarRatings] = useState([])
  const [ratingSummary, setRatingSummary] = useState([])
  const [calculatedRating, setCalculatedRating] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const carData = await getCarById(carId)
        console.log('Car data received:', carData)
        console.log('Rental count from backend:', carData.rentalCount)
        setCar(carData)

        // Fetch ratings for this car
        const ratingsResponse = await getRatingsByCarId(carId)
        setCarRatings(ratingsResponse)

        // Fetch rating summary
        const summaryResponse = await getRatingSummaryByCarId(carId)
        setRatingSummary(summaryResponse)

        const ratingsPromise = isAuthenticated ? getRatingsByCarId(carId) : Promise.resolve([]);
        const similarCarsPromise = searchCars({
          brand: carData?.brandName,
          priceRange: `${carData?.dailyRate * 0.8}-${carData?.dailyRate * 1.2}`,
          excludeId: carId,
          size: 4,
        });

        const [ratingsResult, similarCarsResult] = await Promise.allSettled([
          ratingsPromise,
          similarCarsPromise,
        ]);

        if (ratingsResult.status === 'fulfilled') {
          setRatings(ratingsResult.value);
        } else {
          console.error("Failed to fetch ratings:", ratingsResult.reason);
        }

        if (similarCarsResult.status === 'fulfilled') {
          setSimilarCars(similarCarsResult.value.content || []);
        } else {
          console.error("Failed to fetch similar cars:", similarCarsResult.reason);
        }
      } catch (err) {
        setError(err.message || "Không thể tải thông tin xe")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [carId, isAuthenticated])

  // Fetch current user info
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setCurrentUser(profile);
      } catch (e) {
        setCurrentUser(null);
      }
    };
    if (isAuthenticated) fetchProfile();
    else setCurrentUser(null);
  }, [isAuthenticated]);

  useEffect(() => {
    if (carRatings.length > 0) {
      const avgRating = carRatings.reduce((sum, r) => sum + r.ratingScore, 0) / carRatings.length
      setCalculatedRating(avgRating)

      // Cập nhật car object với rating mới tính
      if (car && (!car.averageRating || car.averageRating === 0)) {
        setCar(prev => ({
          ...prev,
          averageRating: avgRating
        }))
      }
    } else {
      setCalculatedRating(null)
    }
  }, [carRatings, car])
  const [isAnonymous, setIsAnonymous] = useState(false)
  const getDisplayRating = () => {
    if (car?.averageRating && car?.averageRating > 0) {
      return car.averageRating
    }
    if (calculatedRating) {
      return calculatedRating
    }
    if (carRatings.length > 0) {
      return carRatings.reduce((sum, r) => sum + r.ratingScore, 0) / carRatings.length
    }
    return 0
  }
  // Tìm hàm handleSubmitReview (khoảng dòng 250) và thay thế:
  const handleSubmitReview = async () => {
    if (!rating || !comment.trim()) {
      toast.error("Vui lòng nhập đầy đủ đánh giá và bình luận")
      return
    }

    if (!isAuthenticated || !user) {
      toast.error("Bạn cần đăng nhập để đánh giá")
      return
    }

    try {
      const reviewData = {
        carId: Number(carId),
        customerId: user?.id || user?.userId, // Thử cả hai trường hợp
        ratingScore: rating,
        comment: comment.trim(),
        isAnonymous: isAnonymous,
        ratingDate: new Date().toISOString()
      }

      console.log('Submitting review data:', reviewData) // Debug log

      // Sử dụng createRating từ api.js
      const response = await post('/api/ratings', reviewData)

      toast.success("Đánh giá của bạn đã được gửi thành công!")

      // Reset form
      setRating(0)
      setComment("")
      setIsAnonymous(false)
      setShowReviewForm(false)

      // Refresh ratings
      const updatedRatings = await getRatingsByCarId(carId)
      setCarRatings(updatedRatings)

      // Refresh car data to get new average rating
      const updatedCar = await getCarById(carId)
      setCar(updatedCar)
    } catch (err) {
      console.error('Error submitting review:', err)
      toast.error(err.message || "Có lỗi xảy ra khi gửi đánh giá")
    }
  }
  // Auto-play functionality
  useEffect(() => {
    let interval
    if (isAutoPlay && car?.images?.length > 1) {
      interval = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % car.images.length)
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [isAutoPlay, car?.images?.length])

  // Fetch car details
  useEffect(() => {
    const fetchCarDetail = async () => {
      try {
        setLoading(true)
        setError(null)

        const carData = await getCarById(carId)
        console.log('Car data received in fetchCarDetail:', carData)
        console.log('Rental count from backend in fetchCarDetail:', carData.rentalCount)
        setCar(carData)

        // Nếu backend KHÔNG trả về car.supplier, thì fetch bằng supplierId
        if (!carData.supplier && carData.supplierId) {
          setLoadingSupplier(true)
          try {
            const supplierData = await getUserById(carData.supplierId)
            setSupplier(supplierData)
          } catch (e) {
            setSupplier(null)
          } finally {
            setLoadingSupplier(false)
          }
        } else if (carData.supplier) {
          setSupplier(carData.supplier)
        } else {
          setSupplier(null)
        }

        // Initialize image loading states
        if (carData?.images) {
          const loadingStates = {}
          const errorStates = {}
          carData.images.forEach((_, index) => {
            loadingStates[index] = true
            errorStates[index] = false
          })
          setImageLoadingStates(loadingStates)
          setImageErrors(errorStates)
        }

        // Fetch ratings and similar cars in parallel
        const [ratingsResult, similarCarsResult] = await Promise.allSettled([
          isAuthenticated ? getRatingsByCarId(carId) : Promise.resolve([]),
          getSimilarCarsAdvanced(carId, 0, 1000), // lấy tất cả xe tương tự
        ])

        if (ratingsResult.status === "fulfilled") {
          setRatings(ratingsResult.value)
        }

        if (similarCarsResult.status === "fulfilled") {
          setSimilarCars(similarCarsResult.value.content || [])
        }
      } catch (err) {
        console.error("Error fetching car details:", err)
        setError("Không thể tải thông tin xe. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    if (carId) {
      fetchCarDetail()
    }
  }, [carId, isAuthenticated])

  // Image loading handlers
  const handleImageLoad = (index) => {
    setImageLoadingStates((prev) => ({ ...prev, [index]: false }))
  }

  const handleImageError = (index) => {
    setImageLoadingStates((prev) => ({ ...prev, [index]: false }))
    setImageErrors((prev) => ({ ...prev, [index]: true }))
  }


  const handleBookNow = () => {
    setIsBookingModalOpen(true)
  }

  const handleSubmitBooking = async (bookingData) => {
    try {
      // Chuyển đến trang confirmation với booking data
      navigate("/bookings/confirmation", {
        state: {
          bookingData: {
            ...bookingData,
            car: car, // Thêm thông tin xe
          },
        },
      })
      setIsBookingModalOpen(false)
      toast.success("Chuyển đến trang xác nhận đặt xe!")
    } catch (err) {
      toast.error(err.message || "Không thể tạo đặt chỗ")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userEmail")
    window.location.href = "/login"
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? "Đã xóa khỏi danh sách yêu thích" : "Đã thêm vào danh sách yêu thích")
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Đã sao chép đường dẫn vào clipboard!")
  }

  const nextImage = () => {
    if (car?.images?.length) {
      setActiveImageIndex((prev) => (prev + 1) % car.images.length)
    }
  }

  const prevImage = () => {
    if (car?.images?.length) {
      setActiveImageIndex((prev) => (prev === 0 ? car.images.length - 1 : prev - 1))
    }
  }

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay)
    toast.success(isAutoPlay ? "Đã tắt tự động chuyển ảnh" : "Đã bật tự động chuyển ảnh")
  }

  // Enhanced Gallery Modal Component
  const GalleryModal = () => {
    const [modalImageIndex, setModalImageIndex] = useState(activeImageIndex)
    const [isZoomed, setIsZoomed] = useState(false)

    const nextModalImage = () => {
      if (car?.images?.length) {
        setModalImageIndex((prev) => (prev + 1) % car.images.length)
        setIsZoomed(false)
      }
    }

    const prevModalImage = () => {
      if (car?.images?.length) {
        setModalImageIndex((prev) => (prev === 0 ? car.images.length - 1 : prev - 1))
        setIsZoomed(false)
      }
    }

    const toggleZoom = () => {
      setIsZoomed(!isZoomed)
    }

    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
        {/* Enhanced Header Controls */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <div className="bg-black/70 backdrop-blur-md text-white px-6 py-3 rounded-full text-lg font-bold border border-white/20">
              {modalImageIndex + 1} / {car?.images?.length || 0}
            </div>
            <button
              onClick={toggleZoom}
              className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300"
            >
              <FaSearchPlus className="text-xl" />
            </button>
          </div>

          <button
            onClick={() => setShowGalleryModal(false)}
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="relative w-full max-w-7xl">
          <div
            className={`relative ${isZoomed ? "aspect-auto" : "aspect-[16/9]"} bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500`}
          >
            <img
              src={car?.images?.[modalImageIndex]?.imageUrl || "https://via.placeholder.com/1200x675"}
              alt={`${car?.model} Image ${modalImageIndex + 1}`}
              className={`w-full h-full transition-all duration-500 cursor-pointer ${
                isZoomed ? "object-contain scale-150" : "object-contain hover:scale-105"
              }`}
              onClick={toggleZoom}
              onLoad={() => handleImageLoad(modalImageIndex)}
              onError={() => handleImageError(modalImageIndex)}
            />

            {/* Loading overlay */}
            {imageLoadingStates[modalImageIndex] && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
              </div>
            )}

            {/* Error overlay */}
            {imageErrors[modalImageIndex] && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <FaExclamationTriangle className="text-4xl mb-4 mx-auto" />
                  <p className="text-lg">Không thể tải ảnh</p>
                </div>
              </div>
            )}

            {/* Enhanced overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
          </div>

          {/* Enhanced Navigation Buttons */}
          <button
            onClick={prevModalImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full p-4 text-white transition-all duration-300 hover:scale-110 shadow-xl"
          >
            <FaChevronLeft className="text-2xl" />
          </button>

          <button
            onClick={nextModalImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full p-4 text-white transition-all duration-300 hover:scale-110 shadow-xl"
          >
            <FaChevronRight className="text-2xl" />
          </button>

          {/* Enhanced Thumbnails */}
          <div className="mt-8 flex justify-center gap-3 overflow-x-auto pb-4 px-4">
            {car?.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setModalImageIndex(idx)
                  setIsZoomed(false)
                }}
                className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-3 transition-all duration-300 relative ${
                  modalImageIndex === idx
                    ? "border-blue-500 shadow-xl scale-110 ring-4 ring-blue-200"
                    : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                }`}
              >
                <img
                  src={img.imageUrl || "https://via.placeholder.com/80x64"}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={() => handleImageLoad(idx)}
                  onError={() => handleImageError(idx)}
                />
                {imageLoadingStates[idx] && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // (Removed inline FavoriteButton, use shared component)

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
        <Header
          isUserDropdownOpen={isUserDropdownOpen}
          setIsUserDropdownOpen={setIsUserDropdownOpen}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <LoadingSpinner size="large" text="Đang tải thông tin xe..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header
          isUserDropdownOpen={isUserDropdownOpen}
          setIsUserDropdownOpen={setIsUserDropdownOpen}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <div className="container mx-auto px-4 py-16">
          <ErrorMessage message={error} onRetry={() => window.location.reload()} />
        </div>
        <Footer />
      </div>
    )
  }

  // Car not found state
  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header
          isUserDropdownOpen={isUserDropdownOpen}
          setIsUserDropdownOpen={setIsUserDropdownOpen}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-32 h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-8 mx-auto shadow-xl">
              <FaCarSide className="text-5xl text-gray-400" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Không tìm thấy xe</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Xe bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. Vui lòng thử tìm kiếm xe khác.
            </p>
            <Link
              to="/search"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-8 rounded-2xl font-bold transition-all duration-300 inline-flex items-center shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <FaArrowLeft className="mr-3" />
              Tìm xe khác
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Calculate rental details
  const mainImage = car?.images?.[activeImageIndex] || car?.images?.[0];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen">
      <Header
        isUserDropdownOpen={isUserDropdownOpen}
        setIsUserDropdownOpen={setIsUserDropdownOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
          <Link to="/" className="hover:text-blue-600 transition-colors font-medium">
            Trang chủ
          </Link>
          <FaChevronRight className="mx-3 text-xs text-gray-400" />
          <Link to="/search" className="hover:text-blue-600 transition-colors font-medium">
            Danh sách xe
          </Link>
          <FaChevronRight className="mx-3 text-xs text-gray-400" />
          <span className="text-gray-700 font-bold">{car.model}</span>
        </div>

        {/* Enhanced Header Section */}
        <div className="mb-12">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg">
                    <FaCrown className="inline mr-2" />
                    PREMIUM
                  </div>
                  <div className="bg-gradient-to-r from-green-400 to-emerald-400 px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg">
                    <FaFire className="inline mr-2" />
                    HOT
                  </div>
                </div>

                <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight pb-2">
                  {car.model} {car.year}
                </h1>

                {/* Enhanced Price Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 mb-8 border border-blue-100 shadow-lg">
                  <div className="flex items-baseline gap-6 mb-4">
                    <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {formatVND(car.dailyRate)}
                    </div>
                    <div className="text-gray-500 text-xl line-through">{formatVND(car.dailyRate * 1.15)}đ</div>
                    <div className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      <FaGem className="inline mr-2" />
                      Tiết kiệm 15%
                    </div>
                  </div>
                  <div className="text-gray-600 text-lg font-semibold">/ ngày • Giá đã bao gồm thuế và phí dịch vụ</div>
                </div>

                {/* Enhanced Info Row */}
                <div className="flex flex-wrap items-center gap-6 text-gray-600">
                  {car.averageRating && car.averageRating > 0 ? (
                      <div className="flex items-center bg-white rounded-xl px-4 py-2 shadow-md">
                        <StarRating rating={car.averageRating} />
                        <span className="ml-2 font-bold text-gray-800">{car.averageRating.toFixed(1)}</span>
                        <span className="ml-1 text-sm">/5.0</span>
                      </div>
                  ) : carRatings.length > 0 ? (
                      <div className="flex items-center bg-white rounded-xl px-4 py-2 shadow-md">
                        <StarRating rating={carRatings.reduce((sum, r) => sum + r.ratingScore, 0) / carRatings.length} />
                        <span className="ml-2 font-bold text-gray-800">
                        {(carRatings.reduce((sum, r) => sum + r.ratingScore, 0) / carRatings.length).toFixed(1)}
                      </span>
                        <span className="ml-1 text-sm">/5.0</span>
                      </div>
                  ) : null}

                  {carRatings.length > 0 && (
                      <div className="flex items-center bg-white rounded-xl px-4 py-2 shadow-md">
                        <FaComments className="mr-2 text-blue-500" />
                        <span className="font-medium">{carRatings.length} đánh giá</span>
                      </div>
                  )}

                  <div className="flex items-center bg-white rounded-xl px-4 py-2 shadow-md">
                    <FaMapMarkerAlt className="mr-2 text-red-500" />
                    <span className="font-medium">{car.regionName || car.region?.regionName || "TP. Hồ Chí Minh"}</span>
                  </div>
                  <div className="flex items-center bg-white rounded-2xl px-6 py-4 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                    <FaThumbsUp className="mr-3 text-green-500 text-xl" />
                    <span className="font-bold text-lg">{car.rentalCount !== undefined ? car.rentalCount : 0} lượt thuê</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                <div className="flex gap-4">
                  <div className="w-14 h-14">
                    <FavoriteButton carId={car?.carId || car?.id} supplierId={car?.supplierId || car?.supplier?.id}  
                      onFavoriteChange={handleFavoriteChange}
                      isFavorite={isFavorite} /> 
                  </div>
                  <button
                    onClick={handleShare}
                    className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-blue-50 hover:text-blue-500 transition-all duration-300 shadow-lg hover:scale-110 border border-gray-200"
                  >
                    <FaShare className="mx-auto text-xl" />
                  </button>
                </div>

                {/* Quick Book Button for Desktop */}
                <button
                  onClick={handleBookNow}
                  className="hidden lg:flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl items-center text-lg"
                >
                  <FaCalendarAlt className="mr-3 text-xl" />
                  Đặt xe ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Gallery Section */}
        <div className="mb-16 w-full px-8 md:px-20 rounded-xl">
          <div className="relative w-full">
            {/* Main Image */}
            <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Loading state for main image */}
              {imageLoadingStates[activeImageIndex] && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              )}
              {/* Error state for main image */}
              {imageErrors[activeImageIndex] && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                  <div className="text-center text-gray-500">
                    <FaExclamationTriangle className="text-4xl mb-4 mx-auto" />
                    <p className="text-lg">Không thể tải ảnh</p>
                  </div>
                </div>
              )}
              <img
                src={mainImage?.imageUrl || "https://via.placeholder.com/800x600"}
                alt={car.model + " Main Image"}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setShowGalleryModal(true)}
                onLoad={() => handleImageLoad(activeImageIndex)}
                onError={() => handleImageError(activeImageIndex)}
                draggable={false}
              />
              {/* Navigation arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-blue-100 rounded-full p-3 text-blue-600 shadow-lg"
                aria-label="Previous image"
              >
                <FaChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-blue-100 rounded-full p-3 text-blue-600 shadow-lg"
                aria-label="Next image"
              >
                <FaChevronRight size={20} />
              </button>
              {/* Image index indicator */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-bold">
                {activeImageIndex + 1} / {car.images?.length || 1}
              </div>
              {/* Auto-play toggle button */}
              <button
                onClick={toggleAutoPlay}
                className={`absolute top-4 left-4 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 ${isAutoPlay ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                style={{zIndex: 20}}
              >
                {isAutoPlay ? <FaPause /> : <FaPlay />}
                <span>{isAutoPlay ? "Tạm dừng" : "Tự động"}</span>
              </button>
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2 mt-4 justify-center overflow-x-auto pb-2">
              {car.images?.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 relative ${
                    activeImageIndex === idx
                      ? "border-blue-500 shadow-lg scale-105"
                      : "border-gray-200 opacity-70 hover:opacity-100 hover:scale-105"
                  }`}
                  aria-label={`Xem ảnh ${idx + 1}`}
                >
                  {imageLoadingStates[idx] && (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    </div>
                  )}
                  <img
                    src={img.imageUrl || "https://via.placeholder.com/80x64"}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onLoad={() => handleImageLoad(idx)}
                    onError={() => handleImageError(idx)}
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </div>
          {/* Modal xem toàn màn hình */}
          {showGalleryModal && (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="relative w-full max-w-5xl">
                <img
                  src={car?.images?.[activeImageIndex]?.imageUrl || "https://via.placeholder.com/1200x675"}
                  alt={`${car?.model} Image ${activeImageIndex + 1}`}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                  draggable={false}
                />
                {/* Close button */}
                <button
                  onClick={() => setShowGalleryModal(false)}
                  className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all duration-200 z-10"
                  aria-label="Đóng"
                >
                  <FaTimes className="text-2xl" />
                </button>
                {/* Navigation */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-blue-100 rounded-full p-4 text-blue-600 shadow-lg"
                  aria-label="Previous image"
                >
                  <FaChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-blue-100 rounded-full p-4 text-blue-600 shadow-lg"
                  aria-label="Next image"
                >
                  <FaChevronRight size={24} />
                </button>
                {/* Image index indicator */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold">
                  {activeImageIndex + 1} / {car.images?.length || 1}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row gap-12">
          {/* Left Column */}
          <div className="w-full xl:w-2/3">
            {/* Enhanced Basic Features */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl mb-12 border border-gray-100">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 leading-tight pb-2">
                Đặc điểm nổi bật
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-blue-100">
                  <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl mb-4 shadow-lg">
                    <FaUser className="text-2xl" />
                  </div>
                  <div className="text-sm text-gray-500 mb-1">Số chỗ ngồi</div>
                  <div className="font-bold text-gray-800 text-xl">{car.numOfSeats || 5} chỗ</div>
                </div>

                <div className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-green-100">
                  <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl mb-4 shadow-lg">
                    <FaTachometerAlt className="text-2xl" />
                  </div>
                  <div className="text-sm text-gray-500 mb-1">Số km đã đi</div>
                  <div className="font-bold text-gray-800 text-xl">{car.mileage || "50.000"} km</div>
                </div>

                <div className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-purple-100">
                  <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl mb-4 shadow-lg">
                    <FaCog className="text-2xl" />
                  </div>
                  <div className="text-sm text-gray-500 mb-1">Truyền động</div>
                  <div className="font-bold text-gray-800 text-xl">{car.transmission || "Tự động"}</div>
                </div>

                <div className="flex flex-col items-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-orange-100">
                  <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl mb-4 shadow-lg">
                    <FaGasPump className="text-2xl" />
                  </div>
                  <div className="text-sm text-gray-500 mb-1">Nhiên liệu</div>
                  <div className="font-bold text-gray-800 text-xl">{car.fuelTypeName || "8L/100km"}</div>
                </div>
              </div>
            </div>

            {/* Enhanced Description */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl mb-12 border border-gray-100">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 leading-tight pb-2">
                Mô tả chi tiết
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <p className="text-lg">
                  {car.describe ||
                    "Xe được bảo dưỡng định kỳ, nội thất sạch sẽ, thoải mái. Phù hợp cho các chuyến đi gia đình, du lịch hoặc công tác. Xe có đầy đủ giấy tờ, bảo hiểm theo quy định."}
                </p>
              </div>
            </div>

            {/* Enhanced Features */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl mb-12 border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight pb-2">
                  Tính năng & Tiện ích
                </h2>
                <button
                  onClick={() => setShowAllFeatures(!showAllFeatures)}
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center text-lg px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-300"
                >
                  {showAllFeatures ? "Thu gọn" : "Xem tất cả"}
                  {showAllFeatures ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {(
                  car.features ||
                  "Bluetooth, Camera 360, Cảm biến lùi, Camera lùi, Định vị GPS, Điều hòa, Cổng sạc USB, Hệ thống âm thanh, Lốp dự phòng"
                )
                  .split(", ")
                  .slice(0, showAllFeatures ? undefined : 6)
                  .map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100"
                    >
                      <FeatureIcon feature={feature} />
                      <span className="text-gray-700 font-semibold">{feature}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Enhanced Rental Policy */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl mb-12 border border-gray-100">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 leading-tight pb-2">
                Chính sách thuê xe
              </h2>

              {/* Pricing Table */}
              <div className="border-b border-gray-200 pb-8 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800 text-xl flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white mr-3">
                      <FaGem className="text-sm" />
                    </div>
                    Bảng giá theo thời gian
                  </h3>
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    <FaFire className="inline mr-1" />
                    Ưu đãi tốt nhất
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-blue-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="relative z-10">
                      <div className="text-sm text-gray-600 mb-2 font-medium">Dưới 24 giờ</div>
                      <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                         {formatVND(car.dailyRate)}
                      </div>
                      <div className="text-xs text-gray-500">{formatVND(car.dailyRate)} / ngày</div>
                      <div className="mt-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        Giá chuẩn
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-green-100 relative overflow-hidden group">
                    <div className="absolute top-2 right-2">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-2 py-1 rounded-full text-xs font-bold">
                        SAVE 5%
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="relative z-10">
                      <div className="text-sm text-gray-600 mb-2 font-medium">3-6 ngày</div>
                      <div className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                         {formatVND(car.dailyRate * 0.95)}
                      </div>
                      <div className="text-xs text-gray-500">{formatVND(car.dailyRate * 0.95)} / ngày</div>
                      <div className="mt-3 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        Tiết kiệm 5%
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-purple-100 relative overflow-hidden group">
                    <div className="absolute top-2 right-2">
                      <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                        BEST DEAL
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="relative z-10">
                      <div className="text-sm text-gray-600 mb-2 font-medium">7+ ngày</div>
                      <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                       {formatVND(car.dailyRate * 0.9)}
                      </div>
                      <div className="text-xs text-gray-500">{formatVND(car.dailyRate * 0.9)} / ngày</div>
                      <div className="mt-3 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                        Tiết kiệm 10%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Pricing Info */}
                <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <FaInfoCircle className="text-xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-yellow-800 mb-2 text-lg">Lưu ý về giá thuê</h4>
                      <ul className="space-y-2 text-yellow-700">
                        <li className="flex items-center gap-2">
                          <FaCheckCircle className="text-yellow-600 text-sm" />
                          <span>Giá đã bao gồm bảo hiểm cơ bản</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <FaCheckCircle className="text-yellow-600 text-sm" />
                          <span>Phí giao xe tận nơi: 100.000đ</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <FaCheckCircle className="text-yellow-600 text-sm" />
                          <span>Phí quá giờ: 100.000đ/giờ</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pickup/Return Times */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800 text-xl flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white mr-3">
                      <FaClock className="text-sm" />
                    </div>
                    Thời gian nhận/trả xe
                  </h3>
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
                    <FaClock className="inline mr-1" />
                    Linh hoạt 24/7
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-100">
                    <div className="flex items-center mb-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white mr-4 shadow-lg">
                        <FaClock className="text-xl" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium">Giờ nhận xe</div>
                        <div className="font-bold text-gray-800 text-lg">
                          {car.rentalTerms?.pickupTime || "7:00 - 22:00"}
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
                        <FaCheckCircle />
                        <span>Nhận xe sớm: +50.000đ</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-purple-100">
                    <div className="flex items-center mb-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mr-4 shadow-lg">
                        <FaClock className="text-xl" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium">Giờ trả xe</div>
                        <div className="font-bold text-gray-800 text-lg">
                          {car.rentalTerms?.returnTime || "Trước 22:00"}
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-purple-700 text-sm font-medium">
                        <FaCheckCircle />
                        <span>Trả xe muộn: +100.000đ/giờ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Time Info */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-100">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-3">
                      <FaRocket />
                    </div>
                    <div className="font-bold text-green-700 text-sm">Giao xe nhanh</div>
                    <div className="text-xs text-green-600 mt-1">Trong vòng 30 phút</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-3">
                      <FaBolt />
                    </div>
                    <div className="font-bold text-blue-700 text-sm">Đặt xe tức thì</div>
                    <div className="text-xs text-blue-600 mt-1">Xác nhận ngay lập tức</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-100">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mx-auto mb-3">
                      <FaHeadset />
                    </div>
                    <div className="font-bold text-purple-700 text-sm">Hỗ trợ 24/7</div>
                    <div className="text-xs text-purple-600 mt-1">Luôn sẵn sàng hỗ trợ</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews - Gộp thành 1 phần duy nhất */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl mb-8 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Đánh giá từ khách hàng
                </h2>
              </div>

              {carRatings.length > 0 ? (
                      <>
                      {/* Rating Summary */}
                      <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <div className="md:w-1/3 bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl text-center">
                          <div className="text-5xl font-bold text-gray-800 mb-2">
                            {car.averageRating && car.averageRating > 0
                                ? car.averageRating.toFixed(1)
                                : carRatings.length > 0
                                    ? (carRatings.reduce((sum, r) => sum + r.ratingScore, 0) / carRatings.length).toFixed(1)
                                    : "Chưa có"
                            }
                          </div>
                          <div className="flex justify-center mb-2">
                            <StarRating rating={
                              car.averageRating && car.averageRating > 0
                                  ? car.averageRating
                                  : carRatings.length > 0
                                      ? carRatings.reduce((sum, r) => sum + r.ratingScore, 0) / carRatings.length
                                      : 0
                            } size="medium" />
                          </div>
                          <div className="text-gray-600">{carRatings.length} đánh giá</div>
                        </div>

                        <div className="md:w-2/3">
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const count = carRatings.filter((r) => Math.round(r.ratingScore) === star).length
                              const percentage = carRatings.length > 0 ? (count / carRatings.length) * 100 : 0

                              return (
                                  <div key={star} className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-600 w-12">{star} sao</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div
                                          className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                                          style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <span className="text-sm text-gray-500 w-12">{count}</span>
                                  </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Horizontal Reviews Carousel - Luôn hiển thị */}
                      <div className="mb-8">
                        {/* <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            Đánh giá từ khách hàng ({carRatings.length})
                          </h3>

                          Quick stats
                          <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <FaStar className="text-yellow-400 mr-1" />
                              <span>Trung bình: {getDisplayRating().toFixed(1)}/5</span>
                            </div>
                            <div>
                              {carRatings.filter(r => r.ratingScore >= 4).length} đánh giá tích cực
                            </div>
                          </div>
                        </div> */}

                        <TestimonialCarousel carId={carId}
                                             ratings={carRatings}
                                             loading={loading}
                                             error={error} />
                      </div>

                        {/* Enhanced View All Button */}
                        {carRatings.length > 6 && (
                            <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                              <p className="text-gray-600 mb-4">
                                Còn {carRatings.length - 6} đánh giá khác từ khách hàng
                              </p>
                              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
                                Xem tất cả {carRatings.length} đánh giá
                                <FaArrowRight className="ml-2 inline" />
                              </button>
                            </div>
                        )}
                      </>
              ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaComments className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có đánh giá nào</h3>
                    <p className="text-gray-600 mb-6">Xe này chưa có đánh giá từ khách hàng</p>
                  </div>
              )}
            </div>

            {/* Enhanced Terms & Conditions */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl mb-12 border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 leading-tight pb-2">
                  Điều khoản & Quy định
                </h2>
                <button
                  onClick={() => setShowAllTerms(!showAllTerms)}
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center text-lg px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-300"
                >
                  {showAllTerms ? "Thu gọn" : "Xem chi tiết"}
                  {showAllTerms ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <FaFileAlt className="text-xl" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-2xl">Giấy tờ cần thiết</h3>
                  </div>
                  <ul className="space-y-4 pl-16">
                    {(
                      car.rentalTerms?.documents || [
                        "CMND/CCCD + Giấy phép lái xe (bản gốc)",
                        "Hộ khẩu/KT3 hoặc Passport (bản gốc)",
                        "Đặt cọc 5 triệu đồng hoặc xe máy tương đương",
                      ]
                    ).map((doc, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-700 text-lg">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <FaCheck className="text-green-600 text-sm" />
                        </div>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {showAllTerms && (
                  <>
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                          <FaShieldAlt className="text-xl" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-2xl">Quy định sử dụng</h3>
                      </div>
                      <ul className="space-y-4 pl-16">
                        {(
                          car.rentalTerms?.rules || [
                            "Sử dụng xe đúng mục đích, tuân thủ luật giao thông",
                            "Không hút thuốc, ăn uống có mùi trong xe",
                            "Không vận chuyển hàng cấm, chất dễ cháy nổ",
                            "Vệ sinh xe trước khi trả, giữ xe sạch sẽ",
                            "Trả xe đúng giờ, quá giờ tính phí 100.000đ/giờ",
                          ]
                        ).map((rule, index) => (
                          <li key={index} className="flex items-center gap-3 text-gray-700 text-lg">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <FaCheck className="text-green-600 text-sm" />
                            </div>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                          <FaInfoCircle className="text-xl" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-2xl">Chính sách hủy chuyến</h3>
                      </div>
                      <ul className="space-y-4 pl-16">
                        {[
                          "Miễn phí hủy chuyến trước 24h",
                          "Hủy trong vòng 24h mất 30% tiền cọc",
                          "Hủy trong vòng 12h mất 50% tiền cọc",
                          "Hủy trong vòng 6h mất 100% tiền cọc",
                        ].map((policy, index) => (
                          <li key={index} className="flex items-center gap-3 text-gray-700 text-lg">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <FaCheck className="text-green-600 text-sm" />
                            </div>
                            <span>{policy}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Enhanced Car Owner Section */}
            {(supplier || car.supplier) ? (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-100">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 leading-tight pb-2">
                  Thông tin chủ xe
                </h2>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                    {(supplier?.userDetail?.fullName?.charAt(0)?.toUpperCase() || supplier?.username?.charAt(0)?.toUpperCase() || supplier?.email?.charAt(0)?.toUpperCase() || car.supplier?.userDetail?.fullName?.charAt(0)?.toUpperCase() || car.supplier?.username?.charAt(0)?.toUpperCase() || car.supplier?.email?.charAt(0)?.toUpperCase() || "U")}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                      <h3 className="text-2xl font-bold text-gray-800">
                        {supplier?.userDetail?.fullName || supplier?.username || car.supplier?.userDetail?.fullName || car.supplier?.username || "Chủ xe"}
                      </h3>
                      {(supplier?.statusName || car.supplier?.statusName) && (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${((supplier?.statusName || car.supplier?.statusName) === "Đang hoạt động" || (supplier?.statusName || car.supplier?.statusName) === "Active") ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                        >
                          {((supplier?.statusName || car.supplier?.statusName) === "Đang hoạt động" || (supplier?.statusName || car.supplier?.statusName) === "active") ? "Đang hoạt động" : "Tạm ngưng"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                      <span className="text-gray-600 text-lg">@{supplier?.username || car.supplier?.username}</span>
                    </div>
                    <div className="space-y-4">
                      {(supplier?.phone || car.supplier?.phone) && (
                        <div className="flex items-center justify-center md:justify-start gap-4 text-gray-700 text-lg">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaPhone className="text-blue-600" />
                          </div>
                          <span className="font-medium">{supplier?.phone || car.supplier?.phone}</span>
                        </div>
                      )}
                      {(supplier?.email || car.supplier?.email) && (
                        <div className="flex items-center justify-center md:justify-start gap-4 text-gray-700 text-lg">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <FaEnvelope className="text-purple-600" />
                          </div>
                          <span className="font-medium">{supplier?.email || car.supplier?.email}</span>
                        </div>
                      )}
                      {(supplier?.userDetail?.address || car.supplier?.userDetail?.address) && (
                        <div className="flex items-center justify-center md:justify-start gap-4 text-gray-700 text-lg">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <FaMapMarkerAlt className="text-red-600" />
                          </div>
                          <span className="font-medium">{supplier?.userDetail?.address || car.supplier?.userDetail?.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:self-center">
                    {!isSupplierSelf && chatCurrentUser && chatSupplierUser && (
                      <button
                        onClick={handleOpenChatModal}
                        disabled={!isAuthenticated}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none disabled:shadow-md"
                      >
                        <FaComments className="mr-3 text-xl" />
                        {!isAuthenticated ? 'Đăng nhập để chat' : 'Chat với chủ xe'}
                      </button>
                    )}
                  </div>

  {/* Modal chat sẽ được render ở cuối trang để luôn ở giữa màn hình */}
                </div>
              </div>
            ) : loadingSupplier ? (
// ...existing code...

              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl mb-12 border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <FaUser className="text-gray-400 text-5xl" />
                </div>
                <p className="text-gray-500 text-xl font-semibold">Đang tải thông tin chủ xe...</p>
              </div>
            ) : (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl mb-12 border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUser className="text-gray-400 text-5xl" />
                </div>
                <p className="text-gray-500 text-xl font-semibold">Vui lòng đăng nhập để xem thông tin chủ xe</p>
              </div>
            )}
          </div>

          {/* Right Column - Enhanced Creative Booking Widget */}
          <div className="w-full xl:w-1/3">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl sticky top-20 border border-white/50 xl:max-h-[calc(100vh-4rem)] xl:overflow-y-auto relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full translate-y-12 -translate-x-12"></div>

              {/* Header with Dynamic Badge */}
              <div className="text-center mb-8 relative z-10">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-lg animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  <span>Sẵn sàng đặt xe</span>
                </div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  Đặt thuê xe ngay
                </h2>
                <p className="text-gray-600 text-lg">Hoàn thành đặt xe chỉ trong vài phút</p>
              </div>

              {/* Car Info Summary with Shimmer Effect */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 mb-8 border border-blue-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer"></div>
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FaCar className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {car.model} {car.year}
                    </h3>
                    <p className="text-gray-600">{car.brandName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {formatVND(car.dailyRate)}
                    </div>
                    <div className="text-sm text-gray-500">/ ngày</div>
                  </div>
                  <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                    <div className="text-2xl font-bold text-gray-800">{car.numOfSeats || 5}</div>
                    <div className="text-sm text-gray-500">chỗ ngồi</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <StarRating rating={car.averageRating || 4.8} size="small" />
                  <span className="font-semibold">{car.averageRating || 4.8}</span>
                  <span>({ratings.length} đánh giá)</span>
                </div>
              </div>

              {/* Quick Features with Status Indicators */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <FaCheckCircle className="text-green-600 text-xl" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Xe đã xác thực</span>
                  <div className="ml-auto bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                    ✓ VERIFIED
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <FaShieldAlt className="text-blue-600 text-xl" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Bảo hiểm toàn diện</span>
                  <div className="ml-auto bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                    <FaLock className="inline mr-1" />
                    SECURE
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <FaRocket className="text-purple-600 text-xl" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Giao xe nhanh chóng</span>
                  <div className="ml-auto bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">
                    <FaBolt className="inline mr-1" />
                    FAST
                  </div>
                </div>
              </div>

              {/* Special Offers */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-8 border border-yellow-200 relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <div className="bg-gradient-to-r from-red-400 to-pink-400 text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce">
                    HOT DEAL
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                  <FaGem className="mr-2 text-yellow-600" />
                  Ưu đãi đặc biệt
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500 text-xs" />
                    <span>Giảm 5% cho đặt xe từ 3 ngày</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500 text-xs" />
                    <span>Miễn phí giao xe trong bán kính 5km</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500 text-xs" />
                    <span>Tặng thêm 2 giờ sử dụng</span>
                  </li>
                </ul>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleBookNow}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <FaCalendarAlt className="mr-3 text-lg relative z-10" />
                  <span className="relative z-10">Đặt xe ngay</span>
                  <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <FaArrowRight className="text-lg" />
                  </div>
                </button>

                {/* Nút chat với chủ xe */}
                <button
                  type="button"
                  className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-2xl font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl text-base group relative overflow-hidden"
                  onClick={handleOpenChatModal}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <FaComments className="mr-2 text-lg relative z-10" />
                  <span className="relative z-10">Liên hệ chủ xe</span>
                </button>
              </div>

              {/* Trust Indicators with Enhanced Design */}
              <div className="mt-8 grid grid-cols-2 gap-4 text-center">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative mb-3">
                    <FaShieldAlt className="mx-auto text-green-600 text-3xl" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                      <FaCheck className="text-white text-xs" />
                    </div>
                  </div>
                  <div className="text-sm font-bold text-green-700">Bảo hiểm toàn diện</div>
                  <div className="text-xs text-green-600 mt-1">100% an toàn</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative mb-3">
                    <FaUserCheck className="mx-auto text-blue-600 text-3xl" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
                      <FaCheck className="text-white text-xs" />
                    </div>
                  </div>
                  <div className="text-sm font-bold text-blue-700">Xe đã xác thực</div>
                  <div className="text-xs text-blue-600 mt-1">Chất lượng đảm bảo</div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-100 to-blue-100 px-4 py-2 rounded-full border border-gray-200">
                  <FaLock className="text-gray-600" />
                  <span className="text-xs text-gray-600 font-medium">Thanh toán an toàn 100%</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* 24/7 Support */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                  <FaHeadset className="text-blue-500" />
                  <span>Hỗ trợ 24/7: 1900 1234</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Similar Cars Section */}
        <div className="mt-20">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight pb-2">
              Xe tương tự bạn có thể thích
            </h2>
            <Link
              to="/search"
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center text-xl px-6 py-3 rounded-2xl hover:bg-blue-50 transition-all duration-300"
            >
              Xem tất cả xe
              <FaArrowRight className="ml-3" />
            </Link>
          </div>
          {similarCars && similarCars.length > 0 ? (
            <div className="relative px-8">
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-blue-100 text-blue-600 rounded-full p-3 shadow-lg transition-all"
                onClick={() => similarSwiperRef.current?.slidePrev()}
                aria-label="Previous similar cars"
                style={{ left: 0 }}
              >
                <FaChevronLeft size={24} />
              </button>
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-blue-100 text-blue-600 rounded-full p-3 shadow-lg transition-all"
                onClick={() => similarSwiperRef.current?.slideNext()}
                aria-label="Next similar cars"
                style={{ right: 0 }}
              >
                <FaChevronRight size={24} />
              </button>
              <Swiper
                modules={[Pagination, Autoplay, Navigation]}
                loop={true}
                pagination={{ clickable: true }}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                slidesPerView={3}
                spaceBetween={30}
                breakpoints={{
                  320: { slidesPerView: 1, spaceBetween: 20 },
                  768: { slidesPerView: 2, spaceBetween: 25 },
                  1024: { slidesPerView: 3, spaceBetween: 30 },
                }}
                className="pb-16"
                onSwiper={swiper => (similarSwiperRef.current = swiper)}
              >
                {similarCars.map((similarCar) => (
                  <SwiperSlide key={similarCar.id || similarCar.carId}>
                    <CarCard
                      car={{
                        ...similarCar,
                        rentalCount: typeof similarCar.rentalCount === 'number' && similarCar.rentalCount > 0 ? similarCar.rentalCount : 0,
                      }}
                      type="featured"
                      isLoading={false}
                      onBookNow={() => {}}
                      onFavoriteChange={(isFavorite) => handleFavoriteChange(isFavorite)}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <FaCar className="text-blue-500 text-4xl" />
              </div>
              <p className="text-gray-600 text-lg">Không có xe tương tự nào.</p>
            </div>
          )}
        </div>
      </div>
      {/* <div className="fixed bottom-8 right-8 z-30 flex flex-col space-y-4">           
          {showScrollToTop && (
            <button
              onClick={scrollToTop}
                className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white w-14 h-14 rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  aria-label="Lên đầu trang"
            >
            <FaArrowUp className="text-lg" />
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Lên đầu trang
            </div>
            </button>
          )}
        </div>     */}
      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        car={car}
        onSubmitBooking={handleSubmitBooking}
      />
      {/* Chat Modal
      {showChatModal && (supplier || car.supplier) && (
        <CarChatBox
          carId={carId}
          supplierId={
            supplier?.id ||
            supplier?.userId ||
            car.supplier?.id ||
            car.supplier?.userId ||
            car.supplierId ||
            car.ownerId ||
            ''
          }
          supplierName={
            supplier?.userDetail?.fullName ||
            supplier?.username ||
            supplier?.email ||
            car.supplier?.userDetail?.fullName ||
            car.supplier?.username ||
            car.supplier?.email ||
            ''
          }
        />
      )} */}
      {/* Modal chat customer luôn ở cuối trang */}
      {showChatModal && currentUser && chatSupplierUser && (
        <CustomerChatModal
          open={showChatModal}
          onClose={handleCloseChatModal}
          customer={{
            id: currentUser.id || currentUser.userId,
            username: currentUser.username || currentUser.email,
            role: currentUser.roleName || currentUser.role || 'customer',
            ...currentUser
          }}
          supplier={chatSupplierUser}
        />
      )}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-10 right-4 z-[100] group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white w-16 h-16 rounded-full border-4 border-white shadow-2xl hover:shadow-emerald-400 flex items-center justify-center transition-all duration-300 transform hover:scale-125"
          style={{ boxShadow: '0 8px 32px 0 rgba(80,0,200,0.25), 0 1.5px 8px 0 rgba(0,0,0,0.10)' }}
          aria-label="Lên đầu trang"
        >
          <FaArrowUp className="text-2xl drop-shadow-lg" />
          <div className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-gray-900/90 text-white px-4 py-2 rounded-xl text-base font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-xl border border-white">
            Lên đầu trang
          </div>
        </button>
      )}
      <Footer />
    </div>
  )
}

export default CarDetailPage
