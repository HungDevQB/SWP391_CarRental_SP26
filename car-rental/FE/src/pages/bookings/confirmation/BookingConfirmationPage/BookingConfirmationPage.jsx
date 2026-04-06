"use client"

import { useEffect, useState, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { getCarById, post, getProfile, getContractByBookingId, signContract, ensureContract } from "@/services/api"
import {
  FaCarSide,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaShieldAlt,
  FaFileAlt,
  FaInfoCircle,
  FaCheck,
  FaArrowLeft,
  FaStar,
  FaChevronDown,
  FaChevronUp,
  FaCreditCard,
  FaGift,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaHeadset,
  FaUndoAlt,
  FaCar,
  FaHeart,
  FaThumbsUp,
} from "react-icons/fa"
import { FaArrowUp } from "react-icons/fa"
import { toast } from "react-toastify"
import { useAuth } from "@/hooks/useAuth"
import { getItem } from '@/utils/auth'
import LoadingSpinner from '@/components/ui/Loading/LoadingSpinner.jsx';
import PhoneOtpVerification from '@/components/Common/PhoneOtpVerification';
import Footer from '@/components/layout/Footer/Footer.jsx';

// Enhanced Progress Steps Component
const ProgressSteps = ({ currentStep = 1 }) => {
  const steps = [
    { id: 1, name: "Chọn xe", icon: FaCar },
    { id: 2, name: "Xác nhận", icon: FaFileAlt },
    { id: 3, name: "Thanh toán", icon: FaCreditCard },
    { id: 4, name: "Hoàn tất", icon: FaCheckCircle },
  ]

  return (
    <div className="hidden md:flex items-center justify-center">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 transform ${
                    isCompleted
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-110"
                      : isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl scale-125 animate-pulse"
                        : "bg-gray-200 text-gray-400 hover:bg-gray-300"
                  }`}
                >
                  {isCompleted ? <FaCheckCircle className="text-lg" /> : <Icon className="text-lg" />}
                </div>
                <div
                  className={`mt-3 text-sm font-semibold transition-colors duration-300 ${
                    isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {step.name}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-4 rounded-full transition-all duration-500 ${
                    isCompleted ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Enhanced Error Message Component
const ErrorMessage = ({ message, type = "error", onClose, className = "" }) => {
  const typeStyles = {
    error: "from-red-50 to-pink-50 border-red-200 text-red-700",
    warning: "from-yellow-50 to-orange-50 border-yellow-200 text-yellow-700",
    success: "from-green-50 to-emerald-50 border-green-200 text-green-700",
    info: "from-blue-50 to-purple-50 border-blue-200 text-blue-700",
  }

  const typeIcons = {
    error: FaTimesCircle,
    warning: FaExclamationTriangle,
    success: FaCheckCircle,
    info: FaInfoCircle,
  }

  const Icon = typeIcons[type]

  return (
    <div
      className={`bg-gradient-to-r ${typeStyles[type]} border-2 px-6 py-4 rounded-2xl shadow-lg animate-in slide-in-from-top duration-500 ${className}`}
    >
      <div className="flex items-center">
        <Icon className="mr-4 flex-shrink-0 text-xl" />
        <span className="flex-1 font-medium">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 hover:opacity-70 transition-opacity duration-200 p-1 rounded-full hover:bg-white/20"
            aria-label="Đóng thông báo"
          >
            <FaTimesCircle className="text-lg" />
          </button>
        )}
      </div>
    </div>
  )
}

// Enhanced Form Input Component
const FormInput = ({ label, icon: Icon, required, error, className = "", ...props }) => {
  return (
    <div className={`mb-6 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        className={`relative flex items-center border-2 rounded-2xl p-4 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white ${
          error
            ? "border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100"
            : "border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"
        }`}
      >
        {Icon && <Icon className="text-gray-400 mr-4 flex-shrink-0 text-lg" />}
        <input
          {...props}
          className="w-full border-none text-gray-700 focus:outline-none focus:ring-0 placeholder-gray-400 bg-transparent font-medium"
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-2 font-medium flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </p>
      )}
    </div>
  )
}

// Enhanced Service Toggle Component
const ServiceToggle = ({ icon: Icon, title, description, price, checked, onChange, color = "blue" }) => {
  const colorClasses = {
    blue: "border-blue-500 bg-blue-50",
    green: "border-green-500 bg-green-50",
    purple: "border-purple-500 bg-purple-50",
    orange: "border-orange-500 bg-orange-50",
  }

  return (
    <div
      className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
        checked ? `${colorClasses[color]} shadow-lg` : "border-gray-200 bg-white hover:border-gray-300"
      }`}
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-4 ${
              checked ? `bg-${color}-100 text-${color}-600` : "bg-gray-100 text-gray-600"
            }`}
          >
            <Icon className="text-2xl" />
          </div>
          <div>
            <div className="font-bold text-gray-800 text-lg">{title}</div>
            <div className="text-gray-600 text-sm">{description}</div>
            <div className="text-green-600 font-semibold text-sm mt-1">{price}</div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  )
}

// Enhanced Page Header Component
const PageHeader = ({ currentStep = 2, backLink = "/search", backText = "Quay lại trang xe" }) => (
  <header className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100 z-50">
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <Link
          to={backLink}
          className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-300 group"
        >
          <div className="w-12 h-12 flex items-center justify-center mr-4 bg-gray-100 rounded-2xl group-hover:bg-blue-100 transition-all duration-300 group-hover:scale-110">
            <FaArrowLeft className="text-lg" />
          </div>
          <span className="font-semibold hidden sm:block">{backText}</span>
        </Link>

        <ProgressSteps currentStep={currentStep} />

    {/* Logo */}
      <Link to="/" className="flex items-center group">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-3 rounded-2xl mr-3 group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
              <FaCarSide className="text-xl text-white" />
          </div>
          <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  DriveLuxe
              </span>
              <p className="text-xs text-gray-500 -mt-1">Premium Car Rental</p>
          </div>
        </Link>
      </div>
    </div>
  </header>
)

// Enhanced Car Info Card Component
const CarInfoCard = ({ car, bookingData, rentalDays }) => {
  // Get car image with fallback logic
  const getCarImage = () => {
    if (car.thumbnailUrl) return car.thumbnailUrl;
    if (car.images && car.images.length > 0) {
      const firstImage = car.images[0];
      return firstImage.url || firstImage.imageUrl || firstImage.src || firstImage;
    }
    return car.image || car.imageUrl || "/placeholder.svg";
  };

  const carImage = getCarImage();

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl mb-8 border border-gray-100 hover:shadow-3xl transition-all duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Image, Price, Rental Duration, Insurance */}
        <div className="w-full lg:w-2/5 flex flex-col items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group w-full">
            <img
              src={carImage}
              alt={`Xe ${car.carModel || car.model}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl text-sm font-semibold text-gray-800 flex items-center gap-2">
                <FaThumbsUp className="text-green-500" />
                {(car.rentalCount ?? car.rental_count ?? 0) > 0
                  ? `${car.rentalCount ?? car.rental_count} lượt thuê`
                  : "Chưa có lượt thuê"}
              </div>
            </div>
          </div>
          {/* Price below image */}
          <div className="mt-4 w-full flex flex-col items-start">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold text-2xl mb-2 shadow-lg">
              {(((car.rentalPricePerDay || car.dailyRate || car.daily_rate) || 0) / 1000).toFixed(0)}K/ngày
            </div>
            {/* Rental duration below price */}
            <div className="flex items-center text-gray-700 mt-2">
              <FaClock className="text-blue-600 mr-2 text-xl" />
              <span className="font-bold text-lg">Thời gian thuê: {rentalDays} ngày</span>
            </div>
            
          </div>
        </div>
        {/* Right: Car details and trip details */}
        <div className="w-full lg:w-3/5">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">{car.carModel || car.model}</h3>
          {/* Car Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Hãng xe</div>
              <div className="font-bold text-gray-800">{car.brand?.brandName || car.brandName || "-"}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Số ghế</div>
              <div className="font-bold text-gray-800">{car.seats || car.numOfSeats || "-"}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Năm SX</div>
              <div className="font-bold text-gray-800">{car.year || "-"}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Biển số</div>
              <div className="font-bold text-gray-800">{car.licensePlate || "-"}</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Màu sắc</div>
              <div className="font-bold text-gray-800">{car.color || "-"}</div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Nhiên liệu</div>
              <div className="font-bold text-gray-800">{car.fuelType?.fuelTypeName || car.fuelTypeName || "-"}</div>
            </div>
          </div>
          {/* Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mr-4">
                <FaCalendarAlt className="text-xl" />
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium">Nhận xe</div>
                <div className="font-bold text-gray-800 text-lg">
                  {new Date(bookingData.pickupDateTime).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mr-4">
                <FaCalendarAlt className="text-xl" />
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium">Trả xe</div>
                <div className="font-bold text-gray-800 text-lg">
                  {new Date(bookingData.dropoffDateTime).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Order Summary Component
const OrderSummary = ({
  priceBreakdown,
  rentalDays,
  promoCode,
  setPromoCode,
  handleApplyPromo,
  isApplyingPromo,
  agreeTerms,
  setAgreeTerms,
  handleConfirm,
  isLoading,
  contactErrors,
}) => (
  <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl sticky top-0 border border-gray-100">
    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
      Tóm tắt đơn hàng
    </h2>

    {/* Price Breakdown */}
    <div className="border-b border-gray-200 pb-8 mb-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
          <span className="text-gray-700 font-medium">Giá thuê ({rentalDays} ngày)</span>
          <span className="font-bold text-lg">{priceBreakdown.basePrice.toLocaleString("vi-VN")}đ</span>
        </div>

        {priceBreakdown.extraFee > 0 && (
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
            <span className="text-gray-700 font-medium">Phí dịch vụ bổ sung</span>
            <span className="font-bold text-blue-600 text-lg">{priceBreakdown.extraFee.toLocaleString("vi-VN")}đ</span>
          </div>
        )}

        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
          <span className="text-gray-700 font-medium">Phí dịch vụ (10%)</span>
          <span className="font-bold text-lg">{priceBreakdown.serviceFee.toLocaleString("vi-VN")}đ</span>
        </div>

        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
          <span className="text-gray-700 font-medium">Thuế VAT (10%)</span>
          <span className="font-bold text-lg">{priceBreakdown.tax.toLocaleString("vi-VN")}đ</span>
        </div>

        {priceBreakdown.discount > 0 && (
          <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
            <span className="text-green-700 font-medium">Giảm giá</span>
            <span className="font-bold text-green-600 text-lg">
              -{priceBreakdown.discount.toLocaleString("vi-VN")}đ
            </span>
          </div>
        )}
      </div>
    </div>

    {/* Promo Code */}
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <FaGift className="text-blue-600 text-xl" />
        <span className="font-bold text-gray-800 text-lg">Mã giảm giá</span>
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="Nhập mã giảm giá"
          className="flex-1 border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-medium"
        />
        <button
          onClick={handleApplyPromo}
          disabled={isApplyingPromo || !promoCode.trim()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          {isApplyingPromo ? <FaSpinner className="animate-spin" /> : "Áp dụng"}
        </button>
      </div>
    </div>

    {/* Total */}
    <div className="border-t border-gray-200 pt-8 mb-8">
      <div className="flex justify-between items-center mb-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
        <span className="font-bold text-gray-900 text-xl">Tổng cộng</span>
        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {priceBreakdown.total.toLocaleString("vi-VN")}đ
        </span>
      </div>
      <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
        <div className="text-sm text-gray-600 mb-1">Cần thanh toán ngay</div>
        <div className="text-xl font-bold text-yellow-700">{priceBreakdown.deposit.toLocaleString("vi-VN")}đ (30%)</div>
        <div className="text-xs text-gray-500 mt-1">Số tiền còn lại thanh toán khi nhận xe</div>
      </div>
    </div>

    {/* Benefits */}
    <div className="space-y-4 mb-8">
      <div className="flex items-center text-sm text-gray-700 p-3 bg-green-50 rounded-xl">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4">
          <FaShieldAlt />
        </div>
        <span className="font-medium">Bảo hiểm xe và hành khách theo quy định</span>
      </div>
      <div className="flex items-center text-sm text-gray-700 p-3 bg-blue-50 rounded-xl">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
          <FaHeadset />
        </div>
        <span className="font-medium">Hỗ trợ kỹ thuật 24/7</span>
      </div>
      <div className="flex items-center text-sm text-gray-700 p-3 bg-purple-50 rounded-xl">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-4">
          <FaUndoAlt />
        </div>
        <span className="font-medium">Chính sách hủy linh hoạt</span>
      </div>
    </div>

    {/* Terms Agreement */}
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
      <label className="flex items-start cursor-pointer">
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="w-6 h-6 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500 mt-1 mr-4"
        />
        <span className="text-sm text-gray-700 font-medium">
          Tôi đã đọc và đồng ý với các{" "}
          <Link to="/terms" className="text-blue-600 hover:text-blue-800 underline font-semibold">
            điều khoản và điều kiện
          </Link>{" "}
          của dịch vụ
        </span>
      </label>
    </div>

    {/* Confirm Button */}
    <button
      onClick={handleConfirm}
      disabled={!agreeTerms || isLoading || Object.keys(contactErrors).length > 0}
      className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
        !agreeTerms || isLoading || Object.keys(contactErrors).length > 0
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105 shadow-xl hover:shadow-2xl"
      }`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <FaSpinner className="animate-spin mr-3 text-xl" />
          Đang xử lý...
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <FaCheck className="mr-3 text-xl" />
          Xác nhận đặt xe - Chuyển đến thanh toán
        </div>
      )}
    </button>

    <div className="text-center text-xs text-gray-500 mt-4 font-medium">
      Bằng cách nhấn "Xác nhận đặt xe", bạn đồng ý với các điều khoản và điều kiện của dịch vụ
    </div>
  </div>
)

// Main Component
const BookingConfirmationPage = () => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { bookingData } = location.state || {}
  const [car, setCar] = useState(null)
  const [promoCode, setPromoCode] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false)

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
  const [pendingOtpPhone, setPendingOtpPhone] = useState("")
  const [otpVerified, setOtpVerified] = useState(false)
  const lastConfirmedPhone = useRef("")

  // Load last confirmed phone và otpVerified từ localStorage on mount
  useEffect(() => {
    const storedPhone = localStorage.getItem("lastConfirmedPhone")
    if (storedPhone) {
      lastConfirmedPhone.current = storedPhone
    }
    const storedOtpVerified = localStorage.getItem("otpVerified")
    if (storedOtpVerified === "true") {
      setOtpVerified(true)
    }
  }, [])
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [showTermsDetails, setShowTermsDetails] = useState(false)
  const [showContractModal, setShowContractModal] = useState(false)
  const [contract, setContract] = useState(null)
  const [contractAgreed, setContractAgreed] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [createdBookingId, setCreatedBookingId] = useState(null)
  const [contactInfo, setContactInfo] = useState({
    fullName: "",
    phone: "",
    email: "",
    pickupAddress: "",
    dropoffAddress: "",
  })
  const [contactErrors, setContactErrors] = useState({})
  const [withDriver, setWithDriver] = useState(false)
  const [deliveryRequested, setDeliveryRequested] = useState(false)
  const [priceBreakdown, setPriceBreakdown] = useState({
    basePrice: 0,
    extraFee: 0,
    serviceFee: 0,
    tax: 0,
    discount: 0,
    total: 0,
    deposit: 0,
  })

  // Load saved form data from localStorage
  const loadSavedFormData = () => {
    try {
      const savedData = getItem('bookingFormData')
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setContactInfo((prev) => ({
          ...prev,
          ...parsedData,
        }))
        if (parsedData.withDriver !== undefined) {
          setWithDriver(parsedData.withDriver)
        }
        if (parsedData.deliveryRequested !== undefined) {
          setDeliveryRequested(parsedData.deliveryRequested)
        }
      }
    } catch (error) {
      console.error("Error loading saved form data:", error)
    }
  }

  // Load booking data from localStorage
  const loadBookingData = () => {
    try {
      const bookingData = getItem('lastBookingData')
      if (bookingData) {
        const parsedData = JSON.parse(bookingData)
        setContactInfo((prev) => ({
          ...prev,
          pickupAddress: parsedData.pickupLocation || prev.pickupAddress,
          dropoffAddress: parsedData.dropoffLocation || prev.dropoffAddress,
        }))
      }
    } catch (error) {
      console.error("Error loading booking data:", error)
    }
  }

  // Get user info from localStorage as fallback
  const getUserInfoFromStorage = () => {
    try {
      const username = getItem('username')
      const email = getItem('email')
      const phone = getItem('phone')
      const fullName = getItem('fullName')

      return {
        username,
        email,
        phone,
        fullName,
      }
    } catch (error) {
      console.error("Error getting user info from localStorage:", error)
      return {}
    }
  }

  // Save form data to localStorage
  const saveFormData = (data) => {
    try {
      localStorage.setItem("bookingFormData", JSON.stringify(data))
    } catch (error) {
      console.error("Error saving form data:", error)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    // Load user profile data
    const loadUserProfile = async () => {
      try {
        const userProfile = await getProfile()
        if (userProfile) {
          setContactInfo((prev) => ({
            ...prev,
            fullName: userProfile.fullName || userProfile.userDetail?.fullName || userProfile.username || "",
            phone: userProfile.phone || "",
            email: userProfile.email || "",
            pickupAddress: prev.pickupAddress || userProfile.address || userProfile.userDetail?.address || "",
            dropoffAddress: prev.dropoffAddress || userProfile.address || userProfile.userDetail?.address || "",
          }))
        }
      } catch (error) {
        if (user) {
          setContactInfo((prev) => ({
            ...prev,
            fullName: user.fullName || user.userDetail?.fullName || user.username || "",
            phone: user.phone || "",
            email: user.email || user.username || "",
          }))
        }

        const storageUserInfo = getUserInfoFromStorage()
        if (storageUserInfo.username || storageUserInfo.email) {
          setContactInfo((prev) => ({
            ...prev,
            fullName: prev.fullName || storageUserInfo.fullName || storageUserInfo.username || "",
            phone: prev.phone || storageUserInfo.phone || "",
            email: prev.email || storageUserInfo.email || "",
          }))
        }
      }
    }

    loadUserProfile()
    loadSavedFormData()
    loadBookingData()
  }, [isAuthenticated, navigate, user])

  useEffect(() => {
    if (!bookingData) {
      setError("Không có thông tin đặt xe. Vui lòng quay lại trang tìm kiếm.")
      setTimeout(() => navigate("/search"), 3000)
      return
    }

    const fetchCar = async () => {
      try {
        setIsLoading(true)
        if (bookingData.car) {
          setCar(bookingData.car)
        } else {
          const carData = await getCarById(bookingData.carId)
          setCar(carData)
        }
      } catch (err) {
        setError("Không thể tải thông tin xe. Vui lòng thử lại.")
        toast.error("Không thể tải thông tin xe")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCar()
  }, [bookingData, navigate])

  // Recalculate price when car, withDriver, or deliveryRequested changes
  useEffect(() => {
    if (!car) return
    const rate = car.rentalPricePerDay || car.dailyRate || car.daily_rate
    if (rate) calculatePrice(rate)
  }, [car, withDriver, deliveryRequested])

  const calculatePrice = (dailyRate) => {
    if (!bookingData || !dailyRate) return

    try {
      const start = new Date(bookingData.pickupDateTime)
      const end = new Date(bookingData.dropoffDateTime)
      if (isNaN(start) || isNaN(end)) {
        throw new Error("Ngày không hợp lệ")
      }

      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1
      const basePrice = dailyRate * days

      let extraFee = 0
      if (withDriver) {
        extraFee += 300000 * days
      }
      if (deliveryRequested) {
        extraFee += 100000
      }

      const serviceFee = Math.round(basePrice * 0.1)
      const tax = Math.round(basePrice * 0.1)
      const total = basePrice + extraFee + serviceFee + tax
      const deposit = Math.round(total * 0.3)

      setPriceBreakdown({
        basePrice,
        extraFee,
        serviceFee,
        tax,
        discount: 0,
        total,
        deposit,
      })
    } catch (err) {
      setError("Lỗi khi tính giá. Vui lòng thử lại.")
      toast.error("Lỗi khi tính giá")
    }
  }

  const validateContactInfo = () => {
    const errors = {}
    if (!contactInfo.fullName.trim()) errors.fullName = "Vui lòng nhập họ và tên"
    if (!contactInfo.phone.trim()) errors.phone = "Vui lòng nhập số điện thoại"
    else if (!/^\+?[0-9]\d{7,14}$/.test(contactInfo.phone.replace(/\s/g, ""))) {
      errors.phone = "Số điện thoại không hợp lệ (ví dụ: 0977227788 hoặc +84977227788)"
    }
    if (!contactInfo.email.trim()) errors.email = "Vui lòng nhập email"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
      errors.email = "Email không hợp lệ"
    }
    if (!contactInfo.pickupAddress.trim()) errors.pickupAddress = "Vui lòng nhập địa chỉ nhận xe"
    if (!contactInfo.dropoffAddress.trim()) errors.dropoffAddress = "Vui lòng nhập địa chỉ trả xe"

    setContactErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSignAndPay = async () => {
    if (!contractAgreed) {
      toast.error("Vui lòng đọc và đồng ý với hợp đồng")
      return
    }
    try {
      setIsSigning(true)
      // Ký hợp đồng với chữ ký là tên đầy đủ của customer
      if (contract?.contractId) {
        await signContract(contract.contractId, contactInfo.fullName || "Đồng ý")
      }
      setShowContractModal(false)
      toast.success("Đã ký hợp đồng! Chuyển đến thanh toán...")
      setTimeout(() => {
        navigate("/payment", {
          state: {
            bookingId: createdBookingId,
            priceBreakdown,
            depositAmount: priceBreakdown.deposit,
            collateralAmount: 5000000,
            withDriver,
            deliveryRequested,
            customerInfo: { ...contactInfo },
            bookingInfo: {
              carId: bookingData.carId,
              pickupDateTime: bookingData.pickupDateTime,
              dropoffDateTime: bookingData.dropoffDateTime,
              pickupLocation: contactInfo.pickupAddress,
              dropoffLocation: contactInfo.dropoffAddress,
            },
          }
        })
      }, 800)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Ký hợp đồng thất bại")
    } finally {
      setIsSigning(false)
    }
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá")
      return
    }
    try {
      setIsApplyingPromo(true)
      const response = await post("/api/promotions/apply", { promoCode })
      const discountPercentage = response?.discount_percentage || 0
      if (!discountPercentage) {
        throw new Error("Mã giảm giá không hợp lệ")
      }
      const discount = Math.round(priceBreakdown.basePrice * (discountPercentage / 100))
      const newTotal =
        priceBreakdown.basePrice + priceBreakdown.extraFee + priceBreakdown.serviceFee + priceBreakdown.tax - discount
      const newDeposit = Math.round(newTotal * 0.3)
      setPriceBreakdown((prev) => ({
        ...prev,
        discount,
        total: newTotal,
        deposit: newDeposit,
      }))
      setError(null)
      toast.success(`Áp dụng mã giảm giá thành công! Giảm ${discountPercentage}%`)
    } catch (err) {
      toast.error(err.message || "Mã giảm giá không hợp lệ")
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const generateLocalContractTerms = (bookingId, contractCode) => {
    const now = new Date()
    const pad = (n) => String(n).padStart(2, "0")
    const dateStr = `${pad(now.getDate())} tháng ${pad(now.getMonth() + 1)} năm ${now.getFullYear()}`

    const supplierName = car?.supplierName || "................................"
    const supplierPhone = car?.supplierPhone || "................................"
    const supplierAddress = car?.location || car?.regionName || "................................"

    const customerName = contactInfo.fullName || "................................"
    const customerPhone = contactInfo.phone || "................................"
    const customerEmail = contactInfo.email || "................................"
    const pickupAddr = contactInfo.pickupAddress || "Theo thỏa thuận"
    const dropoffAddr = contactInfo.dropoffAddress || "Theo thỏa thuận"

    const carBrand = car?.brand || car?.carBrand || "................................"
    const carModel = car?.carModel || car?.model || "................................"
    const licensePlate = car?.licensePlate || car?.license_plate || "................................"
    const carColor = car?.color || "................................"
    const carYear = car?.year || car?.manufactureYear || "......"
    const carSeats = car?.numOfSeats || car?.seats || ".."

    const startDate = bookingData?.pickupDateTime ? new Date(bookingData.pickupDateTime) : null
    const endDate = bookingData?.dropoffDateTime ? new Date(bookingData.dropoffDateTime) : null
    const formatDt = (d) => d ? `${pad(d.getHours())}:${pad(d.getMinutes())} ngày ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}` : "................................"
    const days = startDate && endDate ? Math.max(1, Math.ceil((endDate - startDate) / 86400000)) : 1
    const totalPrice = priceBreakdown?.total || priceBreakdown?.basePrice || 0
    const pricePerDay = days > 0 ? Math.round(totalPrice / days) : totalPrice
    const formatVnd = (n) => Number(n).toLocaleString("vi-VN")
    const code = contractCode || `HD-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${String(bookingId).padStart(5,"0")}`

    return `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập – Tự do – Hạnh phúc
────────────────────────────────────────

HỢP ĐỒNG THUÊ XE Ô TÔ TỰ LÁI
Số hợp đồng: ${code}

Hôm nay, ngày ${dateStr}, hai bên gồm:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BÊN CHO THUÊ (BÊN A):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Đơn vị         : ${supplierName}
Địa chỉ         : ${supplierAddress}
Số điện thoại   : ${supplierPhone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BÊN THUÊ (BÊN B):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Họ và tên       : ${customerName}
Số điện thoại   : ${customerPhone}
Email           : ${customerEmail}

Sau khi thống nhất, hai bên ký kết hợp đồng với các điều khoản sau:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ĐIỀU 1: ĐẶC ĐIỂM TÀI SẢN THUÊ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bên A đồng ý cho Bên B thuê 01 xe ô tô với thông tin:

  Nhãn hiệu       : ${carBrand} ${carModel}
  Năm sản xuất    : ${carYear}
  Biển kiểm soát  : ${licensePlate}
  Màu sơn         : ${carColor}
  Số chỗ ngồi     : ${carSeats} chỗ

Giấy tờ kèm theo xe:
  - Bản sao công chứng Giấy đăng ký xe
  - Giấy chứng nhận kiểm định (bản gốc)
  - Giấy chứng nhận bảo hiểm TNDS (bản gốc)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ĐIỀU 2: THỜI HẠN VÀ GIÁ THUÊ XE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Thời gian thuê  : Từ ${formatDt(startDate)} đến ${formatDt(endDate)}
  Số ngày thuê    : ${days} ngày
  Giá thuê        : ${formatVnd(pricePerDay)} VNĐ/ngày
  Tổng tiền thuê  : ${formatVnd(totalPrice)} VNĐ
  Địa điểm nhận xe: ${pickupAddr}
  Địa điểm trả xe : ${dropoffAddr}
  Chi phí trả trễ : 50.000 VNĐ/giờ phát sinh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ĐIỀU 3: PHƯƠNG THỨC THANH TOÁN & ĐẶT CỌC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Tiền thuê xe : ${formatVnd(totalPrice)} VNĐ – thanh toán qua hệ thống khi đặt xe
  Tiền đặt cọc : 5.000.000 VNĐ – hoàn trả sau khi trả xe nguyên vẹn
  Phương thức  : Thanh toán online (Stripe) hoặc tiền mặt khi nhận xe

Tiền cọc và tài sản thế chấp được hoàn trả sau khi Bên B bàn giao xe
và thanh toán đầy đủ các chi phí phát sinh (nếu có).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ĐIỀU 4: TRÁCH NHIỆM CỦA CÁC BÊN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4.1. Trách nhiệm của Bên A (Bên cho thuê):
  1. Giao xe và giấy tờ đúng thời gian, địa điểm, tình trạng thỏa thuận
  2. Chịu trách nhiệm pháp lý về nguồn gốc và quyền sở hữu xe
  3. Hỗ trợ kỹ thuật khi xe gặp sự cố không do lỗi người thuê
  4. Hoàn tiền theo chính sách khi hủy hợp đồng hợp lệ

4.2. Trách nhiệm của Bên B (Bên thuê):
  1. Sử dụng xe đúng mục đích, không vi phạm pháp luật
  2. Không chở hàng cấm, vũ khí, chất cháy nổ
  3. Không cầm cố, thế chấp hoặc cho thuê lại xe dưới bất kỳ hình thức nào
  4. Tự chi trả: xăng dầu, phí cầu đường, bến bãi trong thời gian thuê
  5. Chịu toàn bộ trách nhiệm dân sự, hình sự và nộp phạt vi phạm giao thông
     (kể cả phạt nguội) phát sinh trong thời gian thuê xe
  6. Trả xe đúng hạn, đúng địa điểm và đúng tình trạng ban đầu
  7. Phải có bằng lái xe hợp lệ, phù hợp chủng loại xe

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ĐIỀU 5: BỒI THƯỜNG & XỬ LÝ VI PHẠM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  - Nếu xe bị hư hỏng do lỗi Bên B: bồi thường 100% chi phí sửa chữa
    chính hãng và chi trả tiền thuê cho những ngày xe nằm gara
  - Trả xe trễ: tính phí 50.000 VNĐ/giờ kể từ thời điểm hết hạn
  - Vi phạm giao thông: Bên B chịu hoàn toàn, Bên A không chịu trách nhiệm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ĐIỀU 6: ĐIỀU KHOẢN CHUNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  - Hợp đồng có hiệu lực kể từ khi cả hai bên xác nhận chữ ký điện tử
  - Chữ ký điện tử trên hệ thống có giá trị pháp lý tương đương chữ ký tay
  - Tranh chấp phát sinh: ưu tiên thương lượng; nếu không thành, đưa ra
    Tòa án nhân dân có thẩm quyền tại Việt Nam để giải quyết

────────────────────────────────────────
        ĐẠI DIỆN BÊN A                    ĐẠI DIỆN BÊN B
   (Ký tên – Đại diện công ty)          (Ký tên – Người thuê xe)

   ${supplierName}                        ${customerName}`
  }

  const handleConfirm = async () => {
    if (!validateContactInfo()) {
      toast.error("Vui lòng điền đầy đủ thông tin liên hệ")
      return
    }
    if (!agreeTerms) {
      toast.error("Vui lòng đồng ý với điều khoản")
      return
    }
    try {
      setIsLoading(true)
      saveFormData({
        fullName: contactInfo.fullName,
        phone: contactInfo.phone,
        email: contactInfo.email,
        pickupAddress: contactInfo.pickupAddress,
        dropoffAddress: contactInfo.dropoffAddress,
        withDriver: withDriver,
        deliveryRequested: deliveryRequested,
      })

      // Tạo booking trước
      const created = await post('/api/bookings', {
        carId: bookingData.carId,
        startDate: bookingData.pickupDateTime,
        endDate: bookingData.dropoffDateTime,
        pickupLocation: contactInfo.pickupAddress,
        dropoffLocation: contactInfo.dropoffAddress,
        paymentMethod: 'stripe',
      })
      const newBookingId = created.bookingId
      setCreatedBookingId(newBookingId)

      // Lưu thông tin
      const bookingInfo = {
        carId: bookingData.carId,
        pickupLocation: contactInfo.pickupAddress,
        dropoffLocation: contactInfo.dropoffAddress,
        pickupDateTime: bookingData.pickupDateTime,
        dropoffDateTime: bookingData.dropoffDateTime,
        withDriver: withDriver,
        deliveryRequested: deliveryRequested,
        seatNumber: car?.numOfSeats,
      }
      localStorage.setItem("lastBookingInfo", JSON.stringify(bookingInfo))
      localStorage.setItem("lastPriceBreakdown", JSON.stringify(priceBreakdown))
      localStorage.setItem("lastCustomerInfo", JSON.stringify(contactInfo))

      // Hiển thị modal ngay với nội dung sinh trên FE (không cần đợi API)
      const localTerms = generateLocalContractTerms(newBookingId, null)
      setContract({ termsAndConditions: localTerms, contractId: null })
      setContractAgreed(false)
      setShowContractModal(true)

      // Gọi ensureContract ở background để lưu DB, cập nhật contractId nếu thành công
      ensureContract(newBookingId).then(res => {
        const dbContract = res?.data || null
        if (dbContract?.contractId) {
          setContract(prev => ({ ...prev, contractId: dbContract.contractId, contractCode: dbContract.contractCode }))
        }
      }).catch(() => { /* ignore, modal đã hiện */ })
    } catch (err) {
      console.error("Lỗi trong handleConfirm:", err)
      if (err.response?.status === 400) {
        const message = err.response?.data?.message || "Dữ liệu không hợp lệ"
        toast.error(message)
        return
      }
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.")
        navigate("/login")
        return
      }
      toast.error(err.message || "Không thể xử lý yêu cầu. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  // Khi xác thực OTP thành công
  const handleOtpVerified = () => {
    setOtpVerified(true)
    setShowOtpModal(false)
    lastConfirmedPhone.current = pendingOtpPhone
    localStorage.setItem("lastConfirmedPhone", pendingOtpPhone)
    localStorage.setItem("otpVerified", "true")
    // Gọi lại handleConfirm để tiếp tục flow chuyển trang
    setTimeout(() => handleConfirm(), 0)
  }

  const handleContactInfoChange = (e) => {
    const { name, value } = e.target
    setContactInfo((prev) => ({ ...prev, [name]: value }))
    if (contactErrors[name]) {
      setContactErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center max-w-lg mx-auto p-8">
          <div className="mb-8">
            <div className="bg-red-100 p-8 rounded-full inline-block shadow-lg">
              <FaExclamationTriangle className="text-5xl text-red-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Không có thông tin đặt xe</h2>
          <p className="text-gray-600 mb-8 text-lg">Vui lòng quay lại trang tìm kiếm để chọn xe.</p>
          <Link
            to="/search"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 inline-block transform hover:scale-105 shadow-xl"
          >
            Quay lại tìm kiếm
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading && !car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  // Calculate rental duration
  const startDate = new Date(bookingData.pickupDateTime)
  const endDate = new Date(bookingData.dropoffDateTime)
  const rentalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen">
      <PageHeader currentStep={2} backLink="/search" backText="Quay lại trang xe" />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Xác nhận đặt xe
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Kiểm tra thông tin và hoàn tất đặt xe của bạn</p>
        </div>

        {error && <ErrorMessage message={error} type="error" onClose={() => setError(null)} className="mb-8" />}

        <div className="flex flex-col xl:flex-row gap-12">
          {/* Left Column - Main Content */}
          <div className="w-full xl:w-2/3">
            {/* Car Information */}
            {car && <CarInfoCard car={car} bookingData={bookingData} rentalDays={rentalDays} />}

            {/* Contact Information */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl mb-8 border border-gray-100">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
                Thông tin liên hệ
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FormInput
                  label="Họ và tên"
                  icon={FaUser}
                  required
                  type="text"
                  name="fullName"
                  value={contactInfo.fullName}
                  onChange={handleContactInfoChange}
                  placeholder="Nhập họ và tên"
                  error={contactErrors.fullName}
                />
                <FormInput
                  label="Số điện thoại"
                  icon={FaPhone}
                  required
                  type="tel"
                  name="phone"
                  value={contactInfo.phone}
                  onChange={handleContactInfoChange}
                  placeholder="Nhập số điện thoại"
                  error={contactErrors.phone}
                />
              </div>
              <FormInput
                label="Email"
                icon={FaEnvelope}
                required
                type="email"
                name="email"
                value={contactInfo.email}
                onChange={handleContactInfoChange}
                placeholder="Nhập email"
                error={contactErrors.email}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FormInput
                  label="Địa chỉ nhận xe"
                  icon={FaMapMarkerAlt}
                  required
                  type="text"
                  name="pickupAddress"
                  value={contactInfo.pickupAddress}
                  onChange={handleContactInfoChange}
                  placeholder="Nhập địa chỉ nhận xe"
                  error={contactErrors.pickupAddress}
                />
                <FormInput
                  label="Địa chỉ trả xe"
                  icon={FaMapMarkerAlt}
                  required
                  type="text"
                  name="dropoffAddress"
                  value={contactInfo.dropoffAddress}
                  onChange={handleContactInfoChange}
                  placeholder="Nhập địa chỉ trả xe"
                  error={contactErrors.dropoffAddress}
                />
              </div>
            </div>

            {/* Service Options */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl mb-8 border border-gray-100">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
                Tùy chọn dịch vụ
              </h2>

              <div className="space-y-6">
                <ServiceToggle
                  icon={FaUser}
                  title="Thuê tài xế"
                  description="Tài xế chuyên nghiệp, kinh nghiệm lái xe an toàn"
                  price="300,000 VND/ngày"
                  checked={withDriver}
                  onChange={setWithDriver}
                  color="blue"
                />

                <ServiceToggle
                  icon={FaMapMarkerAlt}
                  title="Giao xe tận nơi"
                  description="Giao xe đến địa chỉ của bạn, tiết kiệm thời gian"
                  price="100,000 VND"
                  checked={deliveryRequested}
                  onChange={setDeliveryRequested}
                  color="green"
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Điều khoản quan trọng
                </h2>
                <button
                  onClick={() => setShowTermsDetails(!showTermsDetails)}
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 transition-colors duration-300 px-4 py-2 rounded-xl hover:bg-blue-50"
                >
                  {showTermsDetails ? "Thu gọn" : "Xem chi tiết"}
                  {showTermsDetails ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mr-4">
                      <FaFileAlt className="text-xl" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-xl">Giấy tờ thuê xe</h3>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center">
                      <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                      <span className="font-medium">CMND/CCCD + Giấy phép lái xe (bản gốc)</span>
                    </li>
                    <li className="flex items-center">
                      <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                      <span className="font-medium">Hộ khẩu/KT3 hoặc Passport (bản gốc)</span>
                    </li>
                    <li className="flex items-center">
                      <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                      <span className="font-medium">Đặt cọc 5 triệu đồng hoặc xe máy có giá trị tương đương</span>
                    </li>
                  </ul>
                </div>

                {showTermsDetails && (
                  <>
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 mr-4">
                          <FaShieldAlt className="text-xl" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-xl">Quy định sử dụng xe</h3>
                      </div>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-center">
                          <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="font-medium">Sử dụng xe đúng mục đích, tuân thủ luật giao thông</span>
                        </li>
                        <li className="flex items-center">
                          <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="font-medium">Không sử dụng xe vào mục đích phi pháp, trái pháp luật</span>
                        </li>
                        <li className="flex items-center">
                          <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="font-medium">Không hút thuốc, ăn uống có mùi trong xe</span>
                        </li>
                        <li className="flex items-center">
                          <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="font-medium">Vệ sinh xe trước khi trả, quá giờ tính phí 100.000đ/giờ</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mr-4">
                          <FaUndoAlt className="text-xl" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-xl">Chính sách hủy/đổi</h3>
                      </div>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-center">
                          <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="font-medium">Hủy trước 24h: Hoàn tiền 100%</span>
                        </li>
                        <li className="flex items-center">
                          <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="font-medium">Hủy trong vòng 24h: Hoàn tiền 50%</span>
                        </li>
                        <li className="flex items-center">
                          <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="font-medium">Không đến nhận xe: Không hoàn tiền</span>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="w-full xl:w-1/3">
            <OrderSummary
              priceBreakdown={priceBreakdown}
              rentalDays={rentalDays}
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              handleApplyPromo={handleApplyPromo}
              isApplyingPromo={isApplyingPromo}
              agreeTerms={agreeTerms}
              setAgreeTerms={setAgreeTerms}
              handleConfirm={handleConfirm}
              isLoading={isLoading}
              contactErrors={contactErrors}
            />
          </div>
        </div>
      </main>

      <Footer />

      {/* Contract Modal */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <FaFileAlt className="text-blue-600 text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Hợp đồng thuê xe</h2>
                  {contract?.contractCode && (
                    <p className="text-sm text-gray-500">Mã hợp đồng: {contract.contractCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contract Terms — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                {(contract?.termsAndConditions || "").split("\n").map((line, i) => {
                  const isSectionDivider = line.startsWith("━") || line.startsWith("─")
                  const isHeader = line.startsWith("CỘNG HÒA") || line.startsWith("Độc lập") || line.startsWith("HỢP ĐỒNG THUÊ")
                  const isArticle = /^ĐIỀU \d+:/.test(line) || /^BÊN (CHO THUÊ|THUÊ)/.test(line)
                  const isEmpty = line.trim() === ""

                  if (isSectionDivider) return <hr key={i} className="border-gray-300 my-2" />
                  if (isEmpty) return <div key={i} className="h-2" />
                  if (isHeader) return <p key={i} className="text-center font-bold text-gray-800 text-sm">{line}</p>
                  if (isArticle) return <p key={i} className="font-bold text-blue-700 text-sm mt-3 mb-1">{line}</p>
                  return <p key={i} className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{line}</p>
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-100 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contractAgreed}
                  onChange={(e) => setContractAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded accent-blue-600 cursor-pointer"
                />
                <span className="text-sm text-gray-700 font-medium">
                  Tôi đã đọc, hiểu và đồng ý với toàn bộ điều khoản trong hợp đồng thuê xe này.
                  Chữ ký điện tử của tôi có giá trị pháp lý tương đương chữ ký tay.
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowContractModal(false)}
                  className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleSignAndPay}
                  disabled={!contractAgreed || isSigning}
                  className={`flex-1 py-3 rounded-2xl font-bold text-white transition-all ${
                    contractAgreed && !isSigning
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-[1.02]"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {isSigning ? "Đang ký..." : "Ký hợp đồng & Thanh toán"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[100] w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl hover:from-blue-700 hover:to-purple-700 hover:scale-110 transition-all flex items-center justify-center border-4 border-white animate-bounce"
          style={{ fontSize: 28 }}
          aria-label="Lên đầu trang"
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  )
}

export default BookingConfirmationPage
