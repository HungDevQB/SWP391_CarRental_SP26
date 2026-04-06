"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { getFavorites, removeFavorite, getRatingsByCarId } from "../../../services/api"
import FavoriteButton from "@/components/ui/FavoriteButton/FavoriteButton"
import LoadingSpinner from "@/components/ui/Loading/LoadingSpinner.jsx"
import { useLocation } from 'react-router-dom';
import { formatVND } from '@/utils/format'

const FavoritePage = () => {
  const location = useLocation();
  const [favorites, setFavorites] = useState([])
  const [ratingsMap, setRatingsMap] = useState({}) // { [carId]: { averageRating, ratingCount } }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [removingId, setRemovingId] = useState(null)
  const [showToast, setShowToast] = useState({ show: false, message: "", type: "" })
  const [viewMode, setViewMode] = useState("list") 
  const [sortBy, setSortBy] = useState("newest") 
  const navigate = useNavigate()
  

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFavorites()
      setFavorites(data)
      // Fetch ratings for all cars in favorites
      if (Array.isArray(data) && data.length > 0) {
        const ratingsResults = await Promise.all(
          data.map(async (fav) => {
            const carId = fav.carId || fav.car?.id
            if (!carId) return [null, null]
            try {
              const ratings = await getRatingsByCarId(carId)
              if (ratings && ratings.length > 0) {
                const totalScore = ratings.reduce((sum, r) => sum + (r.ratingScore || 0), 0)
                const averageRating = Math.round((totalScore / ratings.length) * 10) / 10
                return [carId, { averageRating, ratingCount: ratings.length }]
              } else {
                return [carId, { averageRating: null, ratingCount: 0 }]
              }
            } catch {
              return [carId, { averageRating: null, ratingCount: 0 }]
            }
          })
        )
        const ratingsObj = {}
        ratingsResults.forEach(([carId, rating]) => {
          if (carId) ratingsObj[carId] = rating
        })
        setRatingsMap(ratingsObj)
      }
    } catch (err) {
      setError("Không thể tải danh sách yêu thích")
    } finally {
      setLoading(false)
    }
  }


// Luôn fetch khi vào trang FavoritePage
useEffect(() => {
  fetchFavorites();
}, []);

// Refetch khi nhận state refresh từ Header
useEffect(() => {
  if (location.state?.refresh) {
    fetchFavorites();
    navigate('/favorites', { replace: true, state: {} });
  }
}, [location]);

// Refetch khi chuyển tab (trở lại tab này)
useEffect(() => {
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      fetchFavorites();
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);
  return () => document.removeEventListener('visibilitychange', handleVisibility);
}, []);

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      setRemovingId(favoriteId)
      await removeFavorite(favoriteId)
      setFavorites(favorites.filter((fav) => fav.favoriteId !== favoriteId))
      showToastMessage("Đã xóa khỏi danh sách yêu thích", "success")
    } catch (err) {
      showToastMessage("Không thể xóa khỏi danh sách yêu thích", "error")
    } finally {
      setRemovingId(null)
    }
  }

  const showToastMessage = (message, type) => {
    setShowToast({ show: true, message, type })
    setTimeout(() => setShowToast({ show: false, message: "", type: "" }), 3000)
  }

  const handleViewDetails = (carId) => {
    navigate(`/cars/${carId}`)
  }

  const handleBookNow = (carId) => {
    navigate(`/cars/${carId}?action=book`)
  }

  const getSortedFavorites = () => {
    const sorted = [...favorites]
    switch (sortBy) {
      case "oldest":
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      case "price-low":
        return sorted.sort((a, b) => (a.car?.dailyRate || 0) - (b.car?.dailyRate || 0))
      case "price-high":
        return sorted.sort((a, b) => (b.car?.dailyRate || 0) - (a.car?.dailyRate || 0))
      default: // newest
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center bg-white rounded-3xl p-8 shadow-xl max-w-md border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-error-warning-line text-3xl text-red-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Oops! Có lỗi xảy ra</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
              <button
                onClick={fetchFavorites}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <i className="ri-refresh-line mr-2"></i>
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Toast Notification */}
      {showToast.show && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
          <div
            className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border ${
              showToast.type === "success"
                ? "bg-emerald-500/95 text-white border-emerald-400/50"
                : "bg-red-500/95 text-white border-red-400/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  showToast.type === "success" ? "bg-white/20" : "bg-white/20"
                }`}
              >
                <i
                  className={`text-lg ${showToast.type === "success" ? "ri-check-line" : "ri-error-warning-line"}`}
                ></i>
              </div>
              <span className="font-semibold">{showToast.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className="group flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors duration-300">
                  <i className="ri-arrow-left-line text-lg"></i>
                </div>
                <span className="font-semibold">Trang chủ</span>
              </Link>
              <div className="w-px h-8 bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Xe yêu thích
                </h1>
                <p className="text-gray-600 text-sm mt-1">Những chiếc xe bạn đã lưu</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200/50">
                <i className="ri-heart-fill text-red-500 text-lg"></i>
                <span className="font-semibold text-gray-800">{favorites.length}</span>
                <span className="text-gray-600 text-sm">xe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {favorites.length === 0 ? (
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="text-center max-w-lg">
              {/* Enhanced Empty State */}
              <div className="relative mb-10">
                <div className="w-40 h-40 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <i className="ri-heart-line text-6xl text-gray-400"></i>
                </div>
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <i className="ri-close-line text-white text-xl"></i>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-10 -left-6 w-6 h-6 bg-blue-200 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute bottom-10 -right-8 w-4 h-4 bg-purple-200 rounded-full opacity-60 animate-pulse delay-1000"></div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">Chưa có xe yêu thích</h2>
              <p className="text-gray-600 mb-10 leading-relaxed text-lg">
                Bạn chưa thêm xe nào vào danh sách yêu thích. Hãy khám phá và tìm những chiếc xe ưng ý nhất để thuê!
              </p>

              <div className="space-y-6">
                <Link
                  to="/search"
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <i className="ri-search-line text-xl group-hover:animate-pulse"></i>
                  <span>Tìm kiếm xe ngay</span>
                  <i className="ri-arrow-right-line text-lg group-hover:translate-x-1 transition-transform"></i>
                </Link>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span>hoặc</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300"
                >
                  <i className="ri-home-line"></i>
                  <span>Quay lại trang chủ</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced Control Bar */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 mb-8 border border-gray-200/50 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Stats Section */}
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <i className="ri-heart-fill text-white text-2xl"></i>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{favorites.length}</div>
                      <div className="text-gray-600 font-medium">Xe yêu thích</div>
                    </div>
                  </div>

                  <div className="hidden lg:block w-px h-16 bg-gray-200"></div>

                  <div className="text-gray-600">
                    <div className="font-semibold text-gray-800 mb-1">💡 Mẹo hay:</div>
                    <div className="text-sm">Đặt xe sớm để có giá tốt nhất và nhiều lựa chọn hơn</div>
                  </div>
                </div>

                {/* Controls Section */}
                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="oldest">Cũ nhất</option>
                      <option value="price-low">Giá thấp → cao</option>
                      <option value="price-high">Giá cao → thấp</option>
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <i className="ri-grid-line text-lg"></i>
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <i className="ri-list-check text-lg"></i>
                    </button>
                  </div>

                  {/* Add More Button */}
                  <button
                    onClick={() => navigate("/search")}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <i className="ri-add-line text-lg"></i>
                    <span className="hidden sm:inline">Thêm xe</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Favorites Display */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {getSortedFavorites().map((favorite, index) => (
                  <div
                    key={favorite.favoriteId}
                    className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 animate-fade-in-up hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Enhanced Car Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={
                          favorite.car?.image ||
                          favorite.car?.images?.[0]?.url ||
                          "/placeholder.svg?height=224&width=400"
                        }
                        alt={favorite.car?.name || favorite.car?.model}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Enhanced Favorite Button */}
                      <div className="absolute top-4 left-4">
                        <FavoriteButton carId={favorite.carId} onFavoriteChange={fetchFavorites} />
                      </div>

                      {/* Enhanced Remove Button */}
                      <button
                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 hover:scale-110 transition-all duration-300 group/remove"
                        onClick={() => handleRemoveFavorite(favorite.favoriteId)}
                        disabled={removingId === favorite.favoriteId}
                        title="Xóa khỏi yêu thích"
                      >
                        {removingId === favorite.favoriteId ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <i className="ri-delete-bin-line text-lg text-red-500 group-hover/remove:animate-pulse"></i>
                        )}
                      </button>

                      {/* Enhanced Quick Actions */}
                      <div className="absolute bottom-4 left-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                        <button
                          onClick={() => handleViewDetails(favorite.carId)}
                          className="flex-1 bg-white/95 backdrop-blur-sm text-gray-900 py-3 px-4 rounded-xl font-semibold hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                          <i className="ri-eye-line mr-2"></i>
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleBookNow(favorite.carId)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                          <i className="ri-calendar-check-line mr-2"></i>
                          Đặt ngay
                        </button>
                      </div>
                    </div>

                    {/* Enhanced Car Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">
                            {favorite.car?.name || favorite.car?.model}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <i className="ri-car-line text-blue-500"></i>
                  <span>{favorite.car?.brandName || favorite.car?.brand || "Không rõ hãng"}</span>
                </div>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span className="text-blue-700 font-semibold text-base">Chủ xe: {favorite.car?.supplier?.name || favorite.car?.supplierName || "Ẩn danh"}</span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span>{favorite.car?.year || "2023"}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {formatVND(favorite.car?.dailyRate ? `${(favorite.car.dailyRate / 1000).toFixed(0)}K` : "500K")}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">/ ngày</div>
                        </div>
                      </div>

                      {/* Enhanced Car Features */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                          <i className="ri-user-line text-blue-500"></i>
                          <span className="font-medium">{favorite.car?.seats || 5} chỗ</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                          <i className="ri-steering-2-line text-green-500"></i>
                          <span className="font-medium">{favorite.car?.transmission || "Tự động"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                          <i className="ri-gas-station-line text-orange-500"></i>
                          <span className="font-medium">{favorite.car?.fuelType || "Xăng"}</span>
                        </div>
                      </div>

                      {/* Enhanced Rating & Date */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {(() => {
                              const carId = favorite.carId || favorite.car?.id
                              const ratingObj = ratingsMap[carId] || {}
                              const rating = ratingObj.averageRating ?? favorite.car?.rating ?? 4.8
                              return [1,2,3,4,5].map((star) => {
                                if (star <= Math.floor(rating)) {
                                  return <i key={star} className="ri-star-fill text-yellow-400 text-sm"></i>;
                                } else if (star - rating <= 0.5 && star - rating > 0) {
                                  return <i key={star} className="ri-star-half-line text-yellow-400 text-sm"></i>;
                                } else {
                                  return <i key={star} className="ri-star-line text-yellow-400 text-sm"></i>;
                                }
                              })
                            })()}
                          </div>
                          <span className="text-sm text-gray-600 font-medium">
                            {(() => {
                              const carId = favorite.carId || favorite.car?.id
                              const ratingObj = ratingsMap[carId] || {}
                              return ratingObj.averageRating ?? favorite.car?.rating ?? 4.8
                            })()}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({(() => {
                              const carId = favorite.carId || favorite.car?.id
                              const ratingObj = ratingsMap[carId] || {}
                              return ratingObj.ratingCount ?? favorite.car?.reviewCount ?? 12
                            })()} )
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(favorite.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-6">
                {getSortedFavorites().map((favorite, index) => (
                  <div
                    key={favorite.favoriteId}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Car Image */}
                      <div className="relative md:w-80 h-48 md:h-auto overflow-hidden">
                        <img
                          src={
                            favorite.car?.image ||
                            favorite.car?.images?.[0]?.url ||
                            "/placeholder.svg?height=200&width=320"
                          }
                          alt={favorite.car?.name || favorite.car?.model}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                        <FavoriteButton carId={favorite.carId} onFavoriteChange={fetchFavorites} />
                        </div>
                        <button
                          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-all duration-300"
                          onClick={() => handleRemoveFavorite(favorite.favoriteId)}
                          disabled={removingId === favorite.favoriteId}
                        >
                          {removingId === favorite.favoriteId ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <i className="ri-delete-bin-line text-lg text-red-500"></i>
                          )}
                        </button>
                      </div>

                      {/* Car Info */}
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between h-full">
                          <div className="flex-1 mb-4 md:mb-0">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                              {favorite.car?.name || favorite.car?.model}
                            </h3>

                            <div className="flex items-center gap-4 text-gray-600 mb-4">
                              <div className="flex items-center gap-2">
                                <i className="ri-car-line text-blue-500"></i>
                                <span>{favorite.car?.brandName || favorite.car?.brand || "Không rõ hãng"}</span>
                              </div>
                              <span>•</span>
                              <span className="text-blue-700 font-semibold text-base">Chủ xe: {favorite.car?.supplier?.userDetail?.fullName || favorite.car?.supplier?.username || favorite.car?.supplierName || "Ẩn danh"}</span>
                              <span>•</span>
                              <span>{favorite.car?.year || "2023"}</span>
                            </div>

                            <div className="flex items-center gap-6 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <i className="ri-user-line text-blue-500"></i>
                                <span>{favorite.car?.seats || 5} chỗ</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <i className="ri-steering-2-line text-green-500"></i>
                                <span>{favorite.car?.transmission || "Tự động"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <i className="ri-gas-station-line text-orange-500"></i>
                                <span>{favorite.car?.fuelType || "Xăng"}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <i
                                    key={star}
                                    className={`ri-star-${star <= Math.floor(favorite.car?.rating || 4.8) ? "fill" : "line"} text-yellow-400`}
                                  ></i>
                                ))}
                              </div>
                              <span className="text-gray-600 font-medium">
                                {favorite.car?.rating || 'N/A'} ({favorite.car?.reviewCount || 0} đánh giá)
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-4">
                            <div className="text-right">
                              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {favorite.car?.dailyRate ? formatVND(favorite.car.dailyRate) : 'Liên hệ'}
                              </div>
                              <div className="text-sm text-gray-500">/ ngày</div>
                            </div>

                            <div className="flex gap-3">
                              <button
                                onClick={() => handleViewDetails(favorite.carId)}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                              >
                                Chi tiết
                              </button>
                              <button
                                onClick={() => handleBookNow(favorite.carId)}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                              >
                                Đặt ngay
                              </button>
                            </div>

                            <div className="text-xs text-gray-500">
                              Đã thêm {new Date(favorite.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Enhanced Bottom CTA */}
            <div className="mt-16">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-10 text-white text-center relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>

                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-4">Tìm thêm xe yêu thích?</h3>
                  <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
                    Khám phá hàng nghìn xe chất lượng cao với giá tốt nhất. Đặt xe ngay để nhận ưu đãi đặc biệt!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/search"
                      className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                      <i className="ri-search-line text-xl"></i>
                      <span>Khám phá ngay</span>
                    </Link>
                    <Link
                      to="/deals"
                      className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-2xl font-bold hover:bg-white/30 transition-all duration-300"
                    >
                      <i className="ri-fire-line text-xl"></i>
                      <span>Ưu đãi hot</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default FavoritePage
