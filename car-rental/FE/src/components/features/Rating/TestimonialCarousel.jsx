import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { FaStar, FaChevronLeft, FaChevronRight, FaQuoteLeft, FaUser } from 'react-icons/fa'

const styles = {
  lineClamp4: {
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  }
}

const LoadingSkeleton = ({ count = 3 }) => (
  <div className="flex gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex-1 bg-white rounded-2xl p-6 shadow-lg min-h-[280px] flex flex-col">
        <div className="flex justify-between mb-4">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="space-y-2 mb-6 flex-grow">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="ml-3 space-y-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          </div>
          <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
)

const TestimonialCarousel = ({ carId, ratings = [], loading = false, error = null, showHeader = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleRatings, setVisibleRatings] = useState(3)
  const [isPlaying, setIsPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // Enhanced Responsive visible ratings - Fixed to 3 for better rectangle layout
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) setVisibleRatings(1)      // Mobile
      else if (width < 768) setVisibleRatings(2) // Small tablet
      else setVisibleRatings(3)                  // Tablet, Desktop, Large Desktop - always 3
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Enhanced Auto-slide with pause on hover
  useEffect(() => {
    if (!isPlaying || ratings.length <= visibleRatings) return
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => 
        prev >= ratings.length - visibleRatings ? 0 : prev + 1
      )
    }, 5000) // Tăng thời gian để người dùng đọc

    return () => clearInterval(interval)
  }, [ratings.length, visibleRatings, isPlaying])

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) nextSlide()
    if (isRightSwipe) prevSlide()
  }

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => 
      prev >= ratings.length - visibleRatings ? 0 : prev + 1
    )
  }, [ratings.length, visibleRatings])

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => 
      prev <= 0 ? Math.max(0, ratings.length - visibleRatings) : prev - 1
    )
  }, [ratings.length, visibleRatings])

  const goToSlide = useCallback((index) => {
    setCurrentIndex(Math.min(index, ratings.length - visibleRatings))
  }, [ratings.length, visibleRatings])

  // Enhanced date formatter
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 7) return `${diffDays} ngày trước`
      if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} tuần trước`
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Gần đây'
    }
  }

  // Enhanced star rating component
  const StarRating = ({ rating, size = "base" }) => {
    const sizeClasses = {
      sm: "text-sm",
      base: "text-base", 
      lg: "text-lg"
    }
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`${sizeClasses[size]} ${
              i < Math.floor(rating)
                ? 'text-yellow-400' 
                : i < rating
                ? 'text-yellow-300'
                : 'text-gray-300'
            } transition-colors duration-200`}
          />
        ))}
      </div>
    )
  }

  const averageRating = useMemo(() => {
    if (ratings.length === 0) return 0
    return ratings.reduce((sum, r) => sum + r.ratingScore, 0) / ratings.length
  }, [ratings])

  const maxSlides = useMemo(() => {
    return Math.max(0, ratings.length - visibleRatings)
  }, [ratings.length, visibleRatings])

  const formattedRatings = useMemo(() => {
    return ratings.map(rating => ({
      ...rating,
      formattedDate: formatDate(rating.ratingDate)
    }))
  }, [ratings])

  if (loading) {
    return <LoadingSkeleton count={visibleRatings} />
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-2xl">
        <p className="text-red-600 text-lg mb-2">Không thể tải đánh giá</p>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  if (!ratings || ratings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaUser className="text-gray-400 text-xl" />
        </div>
        <p className="text-gray-500 text-lg">Chưa có đánh giá nào</p>
        <p className="text-gray-400 text-sm mt-1">Hãy là người đầu tiên đánh giá!</p>
      </div>
    )
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Enhanced Header - Chỉ hiển thị khi showHeader = true */}
      {showHeader && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">
              Đánh Giá Từ Khách Hàng
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {ratings.length} đánh giá • Trung bình {averageRating.toFixed(1)}/5
            </p>
          </div>
          
          {/* Play/Pause button */}
          {ratings.length > visibleRatings && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="hidden md:flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isPlaying ? 'Tạm dừng' : 'Phát'}
            </button>
          )}
        </div>
      )}

      {/* Enhanced Carousel Container */}
      <div className="relative overflow-hidden">
        {/* Navigation Arrows - Enhanced */}
        {ratings.length > visibleRatings && (
          <>
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 disabled:scale-100"
            >
              <FaChevronLeft className={`${currentIndex === 0 ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxSlides}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 disabled:scale-100"
            >
              <FaChevronRight className={`${currentIndex >= maxSlides ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </>
        )}

        {/* Enhanced Cards Container - Wider layout */}
        <div 
          className="flex transition-transform duration-500 ease-out px-4"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / visibleRatings)}%)`,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {formattedRatings.map((rating, index) => (
            <div 
              key={rating.id || index}
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / visibleRatings}%` }}
            >
              {/* Enhanced Card Design - Rectangle layout */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full border border-gray-100 hover:border-blue-200 hover:-translate-y-1 min-h-[280px] flex flex-col">
                {/* Quote Icon and Rating - More compact */}
                <div className="flex justify-between items-start mb-4">
                  <FaQuoteLeft className="text-blue-200 text-2xl" />
                  <StarRating rating={rating.ratingScore || 0} size="base" />
                </div>

                {/* Enhanced Comment - More compact */}
                <div className="mb-6 flex-grow">
                  <p className="text-gray-700 leading-relaxed line-clamp-3 text-sm md:text-base" style={{...styles.lineClamp4, WebkitLineClamp: 3}}>
                    "{rating.comment || 'Khách hàng hài lòng với dịch vụ của chúng tôi.'}"
                  </p>
                </div>

                {/* Enhanced Customer Info - Compact */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {rating.isAnonymous 
                        ? "?" 
                        : (rating.customerName?.charAt(0)?.toUpperCase() || 'K')
                      }
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-800 text-sm">
                        {rating.isAnonymous ? "Khách hàng ẩn danh" : (rating.customerName || 'Khách hàng')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {rating.formattedDate}  {/* Sử dụng formattedDate */}
                      </p>
                    </div>
                  </div>
                  
                  {/* Rating Score Badge */}
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {rating.ratingScore || 0}/5
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Indicators */}
      {ratings.length > visibleRatings && maxSlides > 0 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: maxSlides + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 w-8 h-3 shadow-lg'
                  : 'bg-gray-300 hover:bg-gray-400 w-3 h-3'
              }`}
            />
          ))}
        </div>
      )}

      {/* Enhanced Progress Bar */}
      {ratings.length > visibleRatings && isPlaying && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-100"
              style={{ width: `${((currentIndex + 1) / (maxSlides + 1)) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TestimonialCarousel