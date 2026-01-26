"use client"
import { formatVND } from '@/utils/format';
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import {
    FaSearch,
    FaSort,
    FaFilter,
    FaCar,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaGasPump,
    FaStar,
    FaCog,
    FaTimes,
    FaUndo,
    FaCarSide,
    FaChevronDown,
    FaBars,
    FaHome,
    FaTag,
    FaPhone,
    FaHeart,
    FaArrowUp,
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn,
    FaEnvelope,
    FaCcVisa,
    FaCcMastercard,
    FaCcAmex,
    FaCcPaypal,
    FaExchangeAlt,
    FaEye,
    FaThLarge,
    FaList,
    FaComments,
    FaStore,
    FaUsers,
    FaAward,
    FaCheckCircle,
    FaBuilding,
} from "react-icons/fa"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import api, { filterCars, findCars, searchCars, getUserById, getRatingsByCarId } from "@/services/api.js"
import { getToken } from "@/utils/auth.js"
import "react-toastify/dist/ReactToastify.css"
import BookingModal from '@/components/features/cars/BookingModal.jsx';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import LoadingSpinner from '@/components/ui/Loading/LoadingSpinner.jsx';
import AutocompleteSearch from '@/components/Common/AutocompleteSearch';
import FavoriteButton from '@/components/ui/FavoriteButton/FavoriteButton.jsx';


// Enhanced Error Message Component
const ErrorMessage = ({ message, onRetry, className = "" }) => {
    return (
        <div
            className={`bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-8 rounded-2xl shadow-sm text-center ${className}`}
        >
            <div className="flex flex-col items-center">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                    <FaCar className="text-red-500 text-3xl" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Oops! Something went wrong</h3>
                <p className="text-sm mb-4">{message}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    )
}

// Hàm loại bỏ dấu tiếng Việt
function removeVietnameseTones(str) {
    return str
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '')
        .replace(/\u02C6|\u0306|\u031B/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

const SearchPage = () => {
    const location = useLocation()
    const navigate = useNavigate()

    // State Management
    const [cars, setCars] = useState({ content: [], totalElements: 0, totalPages: 1 })
    const [filteredCars, setFilteredCars] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [filterLoading, setFilterLoading] = useState(true)
    const [brands, setBrands] = useState([])
    const [countries, setCountries] = useState([])
    const [regions, setRegions] = useState([])
    const [seatOptions, setSeatOptions] = useState([])
    const [priceRanges, setPriceRanges] = useState([])
    const [years, setYears] = useState([])
    const [fuelTypes, setFuelTypes] = useState([])
    const [viewMode, setViewMode] = useState("grid")
    const [showAllRented, setShowAllRented] = useState(false)
    const [showSchedule, setShowSchedule] = useState(false)
    const [selectedCar, setSelectedCar] = useState(null)
    const [rentalHistory, setRentalHistory] = useState([])
    const [filters, setFilters] = useState({})
    const [searchQuery, setSearchQuery] = useState("")
    const [showFilters, setShowFilters] = useState(true)
    const [showCompareBar, setShowCompareBar] = useState(false)
    const [compareVehicles, setCompareVehicles] = useState([])
    const [showScrollToTop, setShowScrollToTop] = useState(false)
    const [showCookieConsent, setShowCookieConsent] = useState(true)
    const [showSortDropdown, setShowSortDropdown] = useState(false)
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [favoriteVehicles, setFavoriteVehicles] = useState([])
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
    const [currentFilterType, setCurrentFilterType] = useState("all") // Thêm state để track loại filter hiện tại
    const [pendingFilterType, setPendingFilterType] = useState(null)
    const carsPerPage = 9
    const rentedCarsLimit = 3
    const [noCarMessage, setNoCarMessage] = useState("")
    const [isInitialFilterApplied, setIsInitialFilterApplied] = useState(false)
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
    const [quickViewCar, setQuickViewCar] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [quickViewRatingCount, setQuickViewRatingCount] = useState(0);
    const [quickViewRatingLoading, setQuickViewRatingLoading] = useState(false);
    const [isSearchingByQuery, setIsSearchingByQuery] = useState(false);

    // Form Management for Filters
    const { register, handleSubmit, reset, watch, setValue, getValues } = useForm({
        defaultValues: {
            brand: "",
            countryCode: "",
            regionId: "",
            numOfSeats: "",
            priceRange: "",
            year: "",
            fuelType: "",
            sortBy: "",
        },
    })


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

    // Thêm state cho date filter
    const [dateFilter, setDateFilter] = useState({
        pickupDate: getToday(),
        pickupTime: getDefaultPickupTime(),
        dropoffDate: getTomorrow(),
        dropoffTime: getDefaultPickupTime(),
        enabled: true // Mặc định bật filter theo ngày
    });

    // Thêm function để handle date filter change với logging
    const handleDateFilterChange = (field, value) => {
        console.log(`[SearchPage] Date filter changed: ${field} = ${value}`);
        setDateFilter(prev => {
            const newFilter = { ...prev, [field]: value };
            console.log('[SearchPage] New date filter state:', newFilter);
            return newFilter;
        });
    };


    const selectedCountry = watch("countryCode")

    // Authentication
    const isTokenExpired = () => {
        const expiresAt = localStorage.getItem("expiresAt")
        return !expiresAt || new Date().getTime() > Number.parseInt(expiresAt, 10)
    }

    // API Functions
    const getCars = async (filters = {}, page = 0) => {
        const params = { ...filters };
        if (filters.pickupLocation) params.pickupLocation = filters.pickupLocation;
        params.country = getUserCountry();
        const carsData = await searchCars(params, page, carsPerPage);
        setCars(carsData);
        setFilteredCars(carsData.content || carsData || []);
        if (!carsData.content || carsData.content.length === 0) {
            if (filters.pickupLocation) {
                setNoCarMessage(`Không có xe phù hợp với địa điểm "${filters.pickupLocation}". Vui lòng thử địa điểm khác.`);
            } else {
                setNoCarMessage('Không có xe phù hợp với bộ lọc bạn chọn.');
            }
        } else {
            setNoCarMessage('');
        }
    };

    const getFeaturedCars = async (page = 0) => {
        try {
            const token = getToken()
            const response = await api.get("/api/cars/featured", {
                params: { page, size: carsPerPage },
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })
            return {
                content: response.data || [],
                totalElements: response.data?.length || 0,
                totalPages: Math.ceil((response.data?.length || 0) / carsPerPage),
            }
        } catch (error) {
            console.error("Error fetching featured cars:", error)
            return { content: [], totalElements: 0, totalPages: 1 }
        }
    }

    const getPopularCars = async (page = 0) => {
        try {
            const token = getToken()
            const response = await api.get("/api/cars/popular", {
                params: { page, size: carsPerPage },
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })
            return {
                content: response.data || [],
                totalElements: response.data?.length || 0,
                totalPages: Math.ceil((response.data?.length || 0) / carsPerPage),
            }
        } catch (error) {
            console.error("Error fetching popular cars:", error)
            return { content: [], totalElements: 0, totalPages: 1 }
        }
    }

    const fetchCars = async (filters = {}, page = 0) => {
        try {
            setLoading(true)
            setError("")
            const finalFilters = { ...filters };
            // Luôn thêm date filter nếu enabled - KHÔNG điều kiện gì khác
            if (dateFilter.enabled) {
                finalFilters.pickupDateTime = `${dateFilter.pickupDate}T${dateFilter.pickupTime}:00`;
                finalFilters.dropoffDateTime = `${dateFilter.dropoffDate}T${dateFilter.dropoffTime}:00`;
                console.log('[SearchPage] Adding date filters to request:', {
                    pickupDateTime: finalFilters.pickupDateTime,
                    dropoffDateTime: finalFilters.dropoffDateTime
                });
            }
            const response = await filterCars(finalFilters, page, carsPerPage, filters.sortBy || "")
            setCars(response.data)
            setFilteredCars(response.data.content || [])

            // Xử lý thông báo khi không có xe
            if (!response.data.content || response.data.content.length === 0) {
                if (filters.pickupLocation) {
                    setNoCarMessage(`Không có xe phù hợp với địa điểm "${filters.pickupLocation}". Vui lòng thử địa điểm khác.`);
                } else {
                    setNoCarMessage('Không có xe phù hợp với bộ lọc bạn chọn.');
                }
            } else {
                setNoCarMessage('');
            }
        } catch (error) {
            console.error("Error fetching cars:", error)
            setError("Failed to load cars. Please try again later.")
            setCars({ content: [], totalElements: 0, totalPages: 1 })
            setFilteredCars([])
            setNoCarMessage('Có lỗi xảy ra khi tải danh sách xe. Vui lòng thử lại.');
        } finally {
            setLoading(false)
        }
    }

    const fetchInitialData = async () => {
        if (isInitialDataLoaded) {
            console.log('[SearchPage] Initial data already loaded, skipping...');
            return;
        }

        try {
            setLoading(true);
            setFilterLoading(true);
            const token = getToken();
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            // Fetch filter data song song
            const [
                brandsRes,
                countriesRes,
                seatOptionsRes,
                priceRangesRes,
                yearsRes,
                fuelTypesRes
            ] = await Promise.all([
                api.get("/api/cars/car-brands", config),
                api.get("/api/cars/country-codes", config),
                api.get("/api/cars/seat-options", config),
                api.get("/api/cars/price-ranges", config),
                api.get("/api/cars/years", config),
                api.get("/api/cars/fuel-types", config),
            ]);

            setBrands(brandsRes.data || []);
            setCountries(countriesRes.data || []);
            setSeatOptions(seatOptionsRes.data || []);
            setPriceRanges(priceRangesRes.data || []);
            setYears(yearsRes.data || []);
            setFuelTypes(fuelTypesRes.data || []);

            // Xác định loại filter từ location state
            const filterType = location.state?.filterType || "all";
            setCurrentFilterType(filterType);

            // CHỈ load cars nếu KHÔNG có searchParams
            if (!location.state?.searchParams) {
                let carsData;
                switch (filterType) {
                    case "featured":
                        carsData = await getFeaturedCars(0);
                        setCars(carsData);
                        setFilteredCars(carsData.content || []);
                        break;
                    case "popular":
                        carsData = await getPopularCars(0);
                        setCars(carsData);
                        setFilteredCars(carsData.content || []);
                        break;
                    default:
                        await fetchCars({}, 0);
                        break;
                }
            }

            setIsInitialDataLoaded(true);
        } catch (error) {
            toast.error("Failed to load data. Please try again later.");
        } finally {
            setFilterLoading(false);
            setLoading(false);
        }
    };

    // Effects
    useEffect(() => {
        fetchInitialData()
    }, [])

    // Effect để theo dõi thay đổi location state - SỬA để clear state sớm hơn
    useEffect(() => {
        if (location.state?.searchParams && !isInitialFilterApplied) {
            console.log("[SearchPage] Nhận searchParams từ HomePage:", location.state.searchParams);

            // ✅ SỬA: Lấy countryCode đúng và set vào form trước
            const countryCode = getUserCountry();
            setValue('countryCode', countryCode); // Set countryCode trước
            // Chuyển countryCode nếu cần
            const params = { ...location.state.searchParams };
            // Set date filter từ HomePage
            if (params.pickupDateTime && params.dropoffDateTime) {
                const pickupDate = new Date(params.pickupDateTime);
                const dropoffDate = new Date(params.dropoffDateTime);

                setDateFilter({
                    pickupDate: pickupDate.toISOString().split('T')[0],
                    pickupTime: pickupDate.toTimeString().slice(0, 5),
                    dropoffDate: dropoffDate.toISOString().split('T')[0],
                    dropoffTime: dropoffDate.toTimeString().slice(0, 5),
                    enabled: true
                });
            }
            // if (params.countryCode === "+84") params.countryCode = "VN";
            Object.entries(params).forEach(([key, value]) => {
                if (key !== 'countryCode') { // Bỏ qua countryCode vì đã set ở trên
                    setValue(key, value || "");
                }
            });

            // ✅ CLEAR searchParams NGAY LẬP TỨC để không cản trở date filter
            navigate(location.pathname, {
                replace: true,
                state: {
                    filterType: "search",
                    // Không giữ searchParams nữa
                }
            });

            setTimeout(() => {
                const data = getValues();
                console.log("[SearchPage] Gọi onFilterSubmit với:", data);
                onFilterSubmit(data);
                setIsInitialFilterApplied(true);
            }, 0);
        }

        if (location.state?.filters && !isInitialFilterApplied) {
            console.log("[SearchPage] Nhận filters từ Brand:", location.state.filters);

            // ✅ SỬA: Set countryCode trước khi set filters khác
            const countryCode = getUserCountry();
            setValue('countryCode', countryCode);

            Object.entries(location.state.filters).forEach(([key, value]) => {
                if (key !== 'countryCode') { // Bỏ qua countryCode vì đã set ở trên
                    setValue(key, value || "");
                }
            });

            // ✅ CLEAR filters state ngay
            navigate(location.pathname, {
                replace: true,
                state: { filterType: "search" }
            });

            setTimeout(() => {
                const data = getValues();
                console.log("[SearchPage] Gọi onFilterSubmit với:", data);
                onFilterSubmit(data);
                setIsInitialFilterApplied(true);
            }, 0);
        }
    }, [location.state?.searchParams, location.state?.filters, regions, isInitialFilterApplied, setValue, navigate]);

    useEffect(() => {
        const countryCode = watch('countryCode');
        if (countryCode) {
            console.log('[SearchPage] Gọi API lấy region với countryCode:', countryCode);
            api.get(`/api/cars/regions/country/${countryCode}`)
                .then(res => {
                    setRegions(res.data || []);
                })
                .catch(err => {
                    console.error('Error fetching regions:', err);
                });
        }
    }, [watch('countryCode')]);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollToTop(window.scrollY > 300)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        setShowCompareBar(compareVehicles.length > 0)
    }, [compareVehicles])

    // Thêm vào sau các useEffect khác
    // Sửa useEffect auto-filter (dòng 582-605):
    // Sửa useEffect auto-filter:
    useEffect(() => {
        let timeoutId;
        const subscription = watch((values, { name, type }) => {
            // Chỉ auto-filter khi:
            // 1. Đang ở tab "all"
            // 2. Đã xử lý xong searchParams 
            // 3. KHÔNG có searchParams trong location.state (giữ nguyên điều kiện này cho form fields)
            // 4. KHÔNG đang search tự do
            if (
                currentFilterType === "all" &&
                isInitialFilterApplied &&
                !location.state?.searchParams && // Giữ điều kiện này cho form fields
                !isSearchingByQuery &&
                [
                    "brand",
                    "countryCode",
                    "regionId",
                    "numOfSeats",
                    "priceRange",
                    "year",
                    "fuelType",
                    "sortBy"
                ].includes(name)
            ) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    const newFilters = { ...values };
                    Object.keys(newFilters).forEach((key) => {
                        if (newFilters[key] === "") {
                            delete newFilters[key];
                        }
                    });
                    applyFilters(newFilters, 0);
                }, 300);
            }
        });

        return () => {
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, [watch, currentFilterType, isInitialFilterApplied, location.state?.searchParams, isSearchingByQuery]);

    // Thêm useEffect để auto-refresh khi date filter thay đổi - ĐẶT SAU useEffect auto-filter hiện tại
    // ...existing code...

    // Thêm useEffect để auto-refresh khi date filter thay đổi - SỬA ĐIỀU KIỆN
    useEffect(() => {
        // Chỉ áp dụng khi:
        // 1. dateFilter enabled
        // 2. Đã load xong initial data
        // 3. KHÔNG đang trong quá trình xử lý từ HomePage (tránh conflict)
        if (
            dateFilter.enabled &&
            isInitialDataLoaded &&
            !location.state?.searchParams // Chỉ tránh khi đang xử lý searchParams từ HomePage
        ) {
            console.log('[SearchPage] Date filter changed, refreshing cars...', dateFilter);
            console.log('[SearchPage] Current filter type:', currentFilterType);

            const timeoutId = setTimeout(() => {
                // Lấy filters hiện tại từ form
                const currentFormData = getValues();
                const finalFilters = { ...currentFormData };

                // Loại bỏ các giá trị rỗng
                Object.keys(finalFilters).forEach(key => {
                    if (finalFilters[key] === "" || finalFilters[key] === null || finalFilters[key] === undefined) {
                        delete finalFilters[key];
                    }
                });

                // Nếu có searchQuery, giữ lại trong finalFilters
                if (searchQuery && searchQuery.trim()) {
                    finalFilters.searchQuery = searchQuery.trim();
                }

                console.log('[SearchPage] Auto-refreshing with date filter and current filters:', finalFilters);

                // Quyết định gọi API nào dựa trên trạng thái hiện tại
                if (isSearchingByQuery && searchQuery && searchQuery.trim()) {
                    // Nếu đang search tự do, gọi lại search với query
                    console.log('[SearchPage] Refreshing search query with date filter');
                    handleSearch(searchQuery);
                } else {
                    // Gọi fetchCars với filters hiện tại + date filter
                    fetchCars(finalFilters, 0);
                    setCurrentPage(1);
                }
            }, 500); // Debounce 500ms

            return () => clearTimeout(timeoutId);
        }
    }, [dateFilter, isInitialDataLoaded, location.state?.searchParams, getValues, searchQuery, isSearchingByQuery]);

    // ...existing code...

    // Handlers
    const handleFilterChange = (newFilters) => {
        applyFilters(newFilters, 0)
    }

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);

        // Lấy filters hiện tại
        const currentFormData = getValues();
        const finalFilters = { ...currentFormData };

        // Loại bỏ các giá trị rỗng
        Object.keys(finalFilters).forEach(key => {
            if (finalFilters[key] === "" || finalFilters[key] === null || finalFilters[key] === undefined) {
                delete finalFilters[key];
            }
        });

        // Xử lý pagination dựa trên loại filter hiện tại
        if (currentFilterType === "featured") {
            getFeaturedCars(newPage - 1).then(carsData => {
                setCars(carsData);
                setFilteredCars(carsData.content || []);
            });
        } else if (currentFilterType === "popular") {
            getPopularCars(newPage - 1).then(carsData => {
                setCars(carsData);
                setFilteredCars(carsData.content || []);
            });
        } else {
            fetchCars(finalFilters, newPage - 1);
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleViewModeChange = (newMode) => {
        setViewMode(newMode)
        localStorage.setItem("viewMode", newMode)
    }

    const handleViewSchedule = async (car) => {
        try {
            setSelectedCar(car)
            const token = getToken()
            const response = await api.get(`/api/cars/${car.carId}/rentals`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })
            setRentalHistory(response.data || [])
            setShowSchedule(true)
        } catch (err) {
            toast.error("Failed to load car schedule.")
        }
    }

    const toggleCompare = (id) => {
        if (compareVehicles.includes(id)) {
            setCompareVehicles(compareVehicles.filter((vehicleId) => vehicleId !== id))
        } else if (compareVehicles.length < 3) {
            setCompareVehicles([...compareVehicles, id])
            toast.success("Vehicle added to comparison!")
        } else {
            toast.warning("You can only compare up to 3 vehicles at once.")
        }
    }

    const toggleFavorite = (id) => {
        if (favoriteVehicles.includes(id)) {
            setFavoriteVehicles(favoriteVehicles.filter((vehicleId) => vehicleId !== id))
            toast.info("Removed from favorites")
        } else {
            setFavoriteVehicles([...favoriteVehicles, id])
            toast.success("Added to favorites!")
        }
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const onFilterSubmit = (data) => {
        // Loại bỏ các giá trị rỗng
        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([key, value]) =>
                value !== null && value !== undefined && value !== ""
            )
        );

        // Kiểm tra xem có ít nhất một filter được chọn không
        const hasAnyFilter = cleanData.brand || cleanData.fuelType || cleanData.numOfSeats ||
            cleanData.priceRange || cleanData.year || cleanData.regionId ||
            cleanData.pickupLocation || cleanData.sortBy;

        if (!hasAnyFilter && !dateFilter.enabled) {
            console.warn('[SearchPage] Không có filter nào được chọn, không gọi fetchCars:', cleanData);
            return;
        }

        console.log('[SearchPage] onFilterSubmit gọi fetchCars với:', cleanData);

        // Clear search state khi apply filters
        setSearchQuery("");
        setIsSearchingByQuery(false);
        setCurrentFilterType("all");

        setFilters(cleanData);
        fetchCars(cleanData, 0);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        reset();
        setFilters({});
        setSearchQuery("");
        setCurrentFilterType("all");
        setIsInitialFilterApplied(false);
        setNoCarMessage("");
        setIsSearchingByQuery(false); // Reset lại trạng thái search tự do
        handleFilterChange({});
        toast.info("Filters reset.");
    };

    // Pagination Logic
    const getPageNumbers = () => {
        const maxPages = 5
        const start = Math.max(1, currentPage - Math.floor(maxPages / 2))
        const end = Math.min(cars.totalPages, start + maxPages - 1)
        const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

        const result = []
        if (start > 1) {
            result.push(1)
            if (start > 2) result.push("...")
        }
        result.push(...pages)
        if (end < cars.totalPages) {
            if (end < cars.totalPages - 1) result.push("...")
            result.push(cars.totalPages)
        }
        return result
    }

    const renderStars = (rating) => {
        if (!rating || rating === 0) return null;

        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={i} className="text-yellow-400" />);
        }

        if (hasHalfStar) {
            stars.push(<FaStar key="half" className="text-yellow-300" />);
        }

        return (
            <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
                <div className="flex text-sm">
                    {stars}
                </div>
                <span className="text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
            </div>
        );
    };

    // Car Categorization
    const carContent = Array.isArray(filteredCars) ? filteredCars : []
    const rentedCars = carContent.filter((car) => car?.statusName?.toLowerCase() === "rented")
    const availableCars = carContent.filter((car) => car?.statusName?.toLowerCase() === "available")
    const displayedRentedCars = showAllRented ? rentedCars : rentedCars.slice(0, rentedCarsLimit)

    // Quick View Modal Component
    const QuickViewModal = ({ isOpen, onClose, car, ratingCount = 0, ratingLoading = false }) => {
        if (!isOpen || !car) return null;

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{car.brandName} {car.model}</h2>
                            <p className="text-gray-600">Xem chi tiết nhanh về chiếc xe này</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                        >
                            <FaTimes className="text-gray-500 text-xl" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Image Section */}
                            <div className="space-y-4">
                                <div className="relative h-64 rounded-xl overflow-hidden">
                                    <img
                                        src={
                                            car.images?.find((img) => img.isMain)?.imageUrl ||
                                            car.images?.[0]?.imageUrl ||
                                            "/placeholder.svg"
                                        }
                                        alt={`${car.brandName} ${car.model}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Status Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${car.statusName?.toLowerCase() === "available"
                                            ? "bg-green-500 text-white"
                                            : "bg-red-500 text-white"
                                            }`}>
                                            {car.statusName?.toLowerCase() === "available" ? "Có sẵn" : "Đang thuê"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="space-y-6">
                                {/* Rating */}
                                {car.averageRating && car.averageRating > 0 ? (
                                    <div className="flex items-center space-x-2">
                                        {renderStars(car.averageRating)}
                                        <span className="text-gray-500">
                                            ({ratingLoading ? (
                                                <div className="inline-flex items-center">
                                                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-1"></div>
                                                    Đang tải...
                                                </div>
                                            ) : (
                                                `${ratingCount} đánh giá`
                                            )})
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-500">
                                            {ratingLoading ? (
                                                <div className="inline-flex items-center">
                                                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-1"></div>
                                                    Đang tải...
                                                </div>
                                            ) : ratingCount > 0 ? (
                                                `${ratingCount} đánh giá chưa có điểm`
                                            ) : (
                                                "Chưa có đánh giá"
                                            )}
                                        </span>
                                    </div>
                                )}

                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3">
                                        <FaUsers className="text-blue-500" />
                                        <span>{car.numOfSeats || 7} chỗ ngồi</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <FaGasPump className="text-green-500" />
                                        <span>{car.fuelTypeName || "Hybrid"}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <FaCog className="text-purple-500" />
                                        <span>{car.transmission || "Automatic"}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <FaMapMarkerAlt className="text-red-500" />
                                        <span>{car.regionName || "Hà Nội"}</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-3">Tính năng nổi bật:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(() => {
                                            // Xử lý features từ string
                                            let featuresArray = [];

                                            if (car.features && typeof car.features === 'string' && car.features.trim()) {
                                                // Tách features string bằng dấu phẩy, semicolon hoặc pipe
                                                featuresArray = car.features
                                                    .split(/[,;|]/)
                                                    .map(f => f.trim())
                                                    .filter(f => f.length > 0);
                                            }

                                            return featuresArray.length > 0 ? (
                                                featuresArray.map((feature, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                                                    >
                                                        {feature}
                                                    </span>
                                                ))
                                            ) : (
                                                <>
                                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Điều hòa</span>
                                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Bluetooth</span>
                                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">GPS</span>
                                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">USB</span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <div className="flex items-baseline space-x-2 mb-2">
                                        <span className="text-3xl font-bold text-blue-600">
                                            {formatVND(car.dailyRate)}
                                        </span>
                                        <span className="text-gray-600">/ngày</span>
                                    </div>
                                    {car.discount && (
                                        <span className="text-gray-400 line-through text-sm">
                                            {formatVND(Math.round(car.dailyRate / (1 - car.discount / 100)))}
                                        </span>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => {
                                            onClose();
                                            navigate(`/cars/${car.carId}`);
                                        }}
                                        className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all"
                                    >
                                        Xem chi tiết
                                    </button>
                                    <button
                                        onClick={() => {
                                            onClose();
                                            onBookNow && onBookNow(car);
                                        }}
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
                                    >
                                        Đặt ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    // Quick View handlers
    const handleQuickView = async (car) => {
        setQuickViewCar(car);
        setIsQuickViewOpen(true);
        setQuickViewRatingCount(0); // Reset về 0 trước khi fetch
        setQuickViewRatingLoading(true);

        // Fetch số lượng đánh giá
        try {
            const ratings = await getRatingsByCarId(car.carId);
            setQuickViewRatingCount(ratings ? ratings.length : 0);
        } catch (error) {
            console.error('Error fetching ratings count:', error);
            setQuickViewRatingCount(0);
        } finally {
            setQuickViewRatingLoading(false);
        }
    };

    const closeQuickView = () => {
        setIsQuickViewOpen(false);
        setQuickViewCar(null);
        setQuickViewRatingCount(0);
        setQuickViewRatingLoading(false);
    };

    // Enhanced Car Card Component
    const CarCard = ({ car, isRented = false, onBookNow }) => {
        const [imageLoaded, setImageLoaded] = useState(false)
        const [isHovered, setIsHovered] = useState(false)
        const [supplier, setSupplier] = useState(null)
        const [loadingSupplier, setLoadingSupplier] = useState(false)

        // Fetch supplier info when component mounts
        useEffect(() => {
            const fetchSupplier = async () => {
                if (!car.supplier && car.supplierId) {
                    setLoadingSupplier(true)
                    try {
                        const supplierData = await getUserById(car.supplierId)
                        setSupplier(supplierData)
                    } catch (error) {
                        console.error('Error fetching supplier:', error)
                        setSupplier(null)
                    } finally {
                        setLoadingSupplier(false)
                    }
                } else if (car.supplier) {
                    setSupplier(car.supplier)
                } else {
                    setSupplier(null)
                }
            }

            fetchSupplier()
        }, [car.supplierId, car.supplier])

        // Function to get supplier display name
        const getSupplierName = () => {
            if (supplier) {
                return supplier.userDetail?.fullName ||
                    supplier.username ||
                    supplier.email ||
                    'Chủ xe'
            }
            return car.supplierName || 'Chủ xe'
        }

        // Function to get supplier initial
        const getSupplierInitial = () => {
            if (supplier) {
                return supplier.userDetail?.fullName?.charAt(0)?.toUpperCase() ||
                    supplier.username?.charAt(0)?.toUpperCase() ||
                    supplier.email?.charAt(0)?.toUpperCase() ||
                    'C'
            }
            return car.supplierName?.charAt(0)?.toUpperCase() || 'C'
        }

        return (
            <div
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="relative h-64 overflow-hidden cursor-pointer">
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                    )}
                    <img
                        src={
                            car.images?.find((img) => img.isMain)?.imageUrl ||
                            car.images?.[0]?.imageUrl ||
                            "https://via.placeholder.com/400x250?text=Car+Image" ||
                            "/placeholder.svg"
                        }
                        alt={`${car.model}`}
                        className={`w-full h-full object-cover object-center transition-all duration-700 ${isHovered ? "scale-110" : "scale-100"
                            } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        onClick={() => navigate(`/cars/${car.carId}`)}
                    />

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${isRented
                                ? "bg-red-500/90 text-white"
                                : "bg-green-500/90 text-white"
                                }`}
                        >
                            {isRented ? "Đang thuê" : "Có sẵn"}
                        </span>
                        {car.discount && (
                            <span className="bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                -{car.discount}%
                            </span>
                        )}
                    </div>

                    {/* Favorite Button - fixed position, not in overlay */}
                    <div className="absolute top-4 right-4 z-20">
                        <FavoriteButton
                            carId={car.carId}
                            supplierId={car.supplierId}
                            initialIsFavorite={favoriteVehicles.includes(car.carId)}
                            onFavoriteChange={(isFav) => {
                                setFavoriteVehicles(isFav
                                    ? [...favoriteVehicles, car.carId]
                                    : favoriteVehicles.filter(id => id !== car.carId)
                                );
                            }}
                        />
                    </div>

                    {/* Quick View Button - Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button
                            onClick={() => handleQuickView(car)}
                            className="bg-white/95 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                        >
                            <FaEye className="text-sm" />
                            <span>Xem nhanh</span>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Car Title and Rating */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h3
                                className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-1"
                                onClick={() => navigate(`/cars/${car.carId}`)}
                                title={`${car.model}`}
                            >
                                {car.model}
                            </h3>
                            <p className="text-gray-500 text-sm">
                                {car.year} • {car.regionName || 'Hà Nội'}
                            </p>
                        </div>
                        {car.averageRating && car.averageRating > 0 && renderStars(car.averageRating)}
                    </div>

                    {/* Car Features */}
                    <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                            <FaUsers className="text-blue-500" />
                            <span>{car.numOfSeats || 5} chỗ</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <FaGasPump className="text-green-500" />
                            <span>{car.fuelTypeName || "Hybrid"}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <FaCog className="text-purple-500" />
                            <span>{car.transmission || "Automatic"}</span>
                        </div>
                    </div>

                    {/* Supplier Info */}
                    <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-gray-100">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            {loadingSupplier ? (
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span className="text-xs font-semibold text-white">
                                    {getSupplierInitial()}
                                </span>
                            )}
                        </div>
                        <div className="flex-1">
                            <span className="text-xs text-gray-500">Chủ xe</span>
                            <div className="text-sm font-medium text-gray-900">
                                {loadingSupplier ? "Đang tải..." : getSupplierName()}
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600 font-medium">đang hoạt động</span>
                        </div>
                    </div>

                    {/* Price and Book Button */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <div className="flex items-baseline space-x-2">
                                <span className="text-2xl font-bold text-blue-600">
                                    {formatVND(car.dailyRate)}
                                </span>
                                <span className="text-sm text-gray-500">/ngày</span>
                            </div>
                            {car.discount && (
                                <span className="text-sm text-gray-400 line-through">
                                    {formatVND(Math.round(car.dailyRate / (1 - car.discount / 100)))}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={() => onBookNow && onBookNow(car)}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${isRented
                                ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl"
                                }`}
                            disabled={isRented}
                        >
                            {isRented ? "Đang thuê" : "Đặt ngay"}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Schedule Popup Component
    const SchedulePopup = () => {
        if (!showSchedule || !selectedCar) return null

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-in zoom-in-95 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Lịch thuê xe
                        </h2>
                        <button
                            onClick={() => {
                                setShowSchedule(false)
                                setSelectedCar(null)
                            }}
                            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                        >
                            <FaTimes className="text-gray-600" />
                        </button>
                    </div>

                    <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            {selectedCar.brandName} {selectedCar.model} {selectedCar.year}
                        </h3>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-3">
                        {rentalHistory.length > 0 ? (
                            rentalHistory.map((rental) => (
                                <div key={rental.id} className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-700">
                                            <div className="font-medium">
                                                {new Date(rental.pickupDateTime).toLocaleDateString("vi-VN")} -{" "}
                                                {new Date(rental.dropoffDateTime).toLocaleDateString("vi-VN")}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {new Date(rental.pickupDateTime).toLocaleTimeString("vi-VN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}{" "}
                                                -{" "}
                                                {new Date(rental.dropoffDateTime).toLocaleTimeString("vi-VN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        </div>
                                        <div
                                            className={`text-xs font-semibold px-2 py-1 rounded-full ${rental.status === "COMPLETED" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                                }`}
                                        >
                                            {rental.status === "COMPLETED" ? "Hoàn thành" : "Đang thuê"}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <FaCalendarAlt className="text-gray-300 text-3xl mb-3 mx-auto" />
                                <p className="text-gray-600">Chưa có lịch sử thuê xe.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => {
                                setShowSchedule(false)
                                setSelectedCar(null)
                            }}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Thêm phương thức applyFilters để gom logic áp dụng bộ lọc
    const applyFilters = (newFilters = {}, page = 0) => {
        // Loại bỏ các giá trị rỗng
        const cleanFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([key, value]) =>
                value !== null && value !== undefined && value !== ""
            )
        );

        setFilters(cleanFilters)
        setCurrentPage(page + 1)
        fetchCars(cleanFilters, page)
    }

    // Update the search handler
    const handleSearch = async (query) => {
        try {
            setLoading(true);
            setError("");
            setCurrentFilterType("search"); // Đánh dấu là search tự do
            setIsSearchingByQuery(true);    // Đánh dấu search tự do

            // Tạo params search bao gồm date filter nếu enabled
            const searchParams = {
                query: query
            };

            // Thêm date filter nếu enabled
            if (dateFilter.enabled) {
                searchParams.pickupDateTime = `${dateFilter.pickupDate}T${dateFilter.pickupTime}:00`;
                searchParams.dropoffDateTime = `${dateFilter.dropoffDate}T${dateFilter.dropoffTime}:00`;
                console.log('[SearchPage] Adding date filters to search:', {
                    pickupDateTime: searchParams.pickupDateTime,
                    dropoffDateTime: searchParams.dropoffDateTime
                });
            }

            console.log('[SearchPage] Searching with params:', searchParams);

            const response = await findCars(query, currentPage - 1, carsPerPage, searchParams);
            setCars(response);
            setFilteredCars(response.content || []);

            if (!response.content || response.content.length === 0) {
                if (dateFilter.enabled) {
                    setNoCarMessage(`Không tìm thấy xe nào với từ khóa "${query}" trong khoảng thời gian từ ${dateFilter.pickupDate} đến ${dateFilter.dropoffDate}. Vui lòng thử từ khóa khác hoặc thay đổi ngày.`);
                } else {
                    setNoCarMessage(`Không tìm thấy xe nào với từ khóa "${query}". Vui lòng thử từ khóa khác.`);
                }
            } else {
                setNoCarMessage('');
            }
        } catch (error) {
            setError("Failed to search cars. Please try again later.");
            setCars({ content: [], totalElements: 0, totalPages: 1 });
            setFilteredCars([]);
            setNoCarMessage('Có lỗi xảy ra khi tìm kiếm xe. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };
    // Add debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                handleSearch(searchQuery);
            } else if (currentFilterType === "all" && Object.keys(filters).length > 0) {
                fetchCars(filters, currentPage - 1);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, currentPage, filters, currentFilterType]);

    // Update the search input handler
    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

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

    // Handler để chuyển đổi loại filter
    const handleFilterTypeChange = async (filterType) => {
        setLoading(true);
        setError("");
        setCurrentFilterType(filterType);
        setCurrentPage(1);
        setSearchQuery("");
        setFilters({});
        setNoCarMessage(""); // Reset noCarMessage
        reset();
        setIsSearchingByQuery(false); // Reset lại trạng thái search tự do

        if (location.state?.searchParams) {
            setPendingFilterType(filterType); // Đánh dấu loại filter cần load lại sau khi navigate
            navigate(location.pathname, { replace: true, state: { filterType } });
            setLoading(false);
            return;
        }

        let carsData;
        switch (filterType) {
            case "featured":
                carsData = await getFeaturedCars(0);
                break;
            case "popular":
                carsData = await getPopularCars(0);
                break;
            default:
                await fetchCars({}, 0);
                setLoading(false);
                return;
        }

        setCars(carsData);
        setFilteredCars(carsData.content || []);
        setLoading(false);
    };

    // Lấy country từ user (giả sử lưu ở localStorage)
    const { user } = useAuth();
    const getUserCountry = () => {
        if (user && user.countryCode) return user.countryCode;
        if (localStorage.getItem('countryCode')) return localStorage.getItem('countryCode');
        return '+84'; // countryCode mặc định
    };

    // Lấy danh sách region khi countryCode thay đổi
    useEffect(() => {
        const countryCode = getUserCountry();
        console.log('[SearchPage] Loading regions for country:', countryCode);
        setValue('countryCode', countryCode);
        api.get(`/api/cars/regions/country/${countryCode}`)
            .then(res => {
                console.log('[SearchPage] Regions loaded:', res.data);
                setRegions(res.data || []);
            })
            .catch(err => {
                console.error('Error fetching regions:', err);
                setRegions([]);
            });
    }, []);

    // Khi nhận searchParams từ HomePage, tự động tìm region phù hợp
    // Thay thế useEffect từ dòng 1238-1265:
    useEffect(() => {
        const searchParams = location.state?.searchParams;

        // Chỉ xử lý khi có searchParams VÀ regions đã được load VÀ chưa xử lý
        if (searchParams && regions.length > 0 && !isInitialFilterApplied) {
            console.log('[SearchPage] Processing searchParams:', searchParams);

            const countryCode = getUserCountry();
            const matchedRegion = regions.find(
                r => removeVietnameseTones(r.regionName) === removeVietnameseTones(searchParams.pickupLocation || '')
            );
            // ✅ SỬA: Đảm bảo countryCode được set trước khi tìm region
            setValue('countryCode', countryCode);
            if (matchedRegion) {
                console.log('[SearchPage] Found matched region:', matchedRegion);

                // Set form values

                setValue('regionId', matchedRegion.regionId);

                // Prepare filters
                const newFilters = {
                    pickupLocation: searchParams.pickupLocation,
                    regionId: matchedRegion.regionId,
                    pickupDateTime: searchParams.pickupDateTime,
                    dropoffDateTime: searchParams.dropoffDateTime,
                    country: countryCode,
                    countryCode: countryCode,
                };

                console.log('[SearchPage] Applying filters:', newFilters);

                // Set states
                setFilters(newFilters);
                setCurrentFilterType("search");
                setIsInitialFilterApplied(true);

                // Fetch cars
                fetchCars(newFilters, 0);

                // Clear searchParams để tránh re-trigger
                setTimeout(() => {
                    navigate(location.pathname, {
                        replace: true,
                        state: {
                            filterType: "search",
                            // Giữ lại filters đã áp dụng
                            appliedFilters: newFilters
                        }
                    });
                }, 500); // Tăng delay để đảm bảo fetchCars hoàn thành

            } else {
                console.log('[SearchPage] No matching region for:', searchParams.pickupLocation);
                setValue('countryCode', countryCode);
                // Không tìm thấy region, hiển thị thông báo
                setCars({ content: [], totalElements: 0, totalPages: 1 });
                setFilteredCars([]);
                setNoCarMessage(`Không có xe tại địa điểm "${searchParams.pickupLocation}". Vui lòng thử địa điểm khác.`);
                setIsInitialFilterApplied(true);

                // Clear searchParams
                setTimeout(() => {
                    navigate(location.pathname, {
                        replace: true,
                        state: { filterType: "search" }
                    });
                }, 500);
            }
        }
    }, [location.state?.searchParams, regions, isInitialFilterApplied, setValue, navigate]);

    // useEffect fetchCars chỉ chạy khi không phải lần đầu nhận filter từ HomePage
    // useEffect(() => {
    //     if (
    //         currentFilterType === "all" &&
    //         !location.state?.searchParams &&
    //         !location.state?.filters &&
    //         !isInitialFilterApplied &&
    //         !isSearchingByQuery // Đừng fetch lại khi đang search tự do
    //     ) {
    //         fetchCars(filters, 0);
    //     }
    //     // eslint-disable-next-line
    // }, [currentFilterType, filters, location.state, isInitialFilterApplied, isSearchingByQuery]);

    useEffect(() => {
        // Nếu vào thẳng SearchPage (không có searchParams, filters từ navigation)
        // và đã load xong initial data, set isInitialFilterApplied = true
        if (
            isInitialDataLoaded &&
            !location.state?.searchParams &&
            !location.state?.filters &&
            !isInitialFilterApplied &&
            currentFilterType === "all"
        ) {
            console.log('[SearchPage] Setting isInitialFilterApplied for direct access');
            setIsInitialFilterApplied(true);
        }
    }, [isInitialDataLoaded, location.state, isInitialFilterApplied, currentFilterType]);

    useEffect(() => {
        // Nếu vừa xóa searchParams và có pendingFilterType, tự động load lại đúng loại xe
        if (!location.state?.searchParams && pendingFilterType) {
            (async () => {
                setLoading(true);
                let carsData;
                switch (pendingFilterType) {
                    case "featured":
                        carsData = await getFeaturedCars(0);
                        break;
                    case "popular":
                        carsData = await getPopularCars(0);
                        break;
                    default:
                        await fetchCars({}, 0);
                        setLoading(false);
                        setPendingFilterType(null);
                        return;
                }
                setCars(carsData);
                setFilteredCars(carsData.content || []);
                setLoading(false);
                setPendingFilterType(null);
            })();
        }
    }, [location.state, pendingFilterType]);

    // Thêm hàm fetchSuggestions phía trên SearchPage
    const fetchSuggestions = async (query) => {
        // Gợi ý theo brand và model từ danh sách xe đã fetch
        const allNames = [
            ...new Set(
                (cars.content || [])
                    .flatMap(car => [car.brandName, car.model])
                    .filter(Boolean)
            )
        ];
        return allNames.filter(name =>
            name.toLowerCase().startsWith(query.toLowerCase())
        );
    };

    // Effect đồng bộ searchQuery từ Header vào filter hoặc search tự do
    useEffect(() => {
        if (
            location.state &&
            location.state.searchQuery &&
            brands.length > 0 &&
            regions.length > 0 &&
            fuelTypes.length > 0 &&
            years.length > 0
        ) {
            const query = location.state.searchQuery;

            const foundBrand = brands.find(b => b.brandName?.toLowerCase() === query.toLowerCase());
            const foundRegion = regions.find(r => r.regionName?.toLowerCase() === query.toLowerCase());
            const foundFuel = fuelTypes.find(f => f.fuelTypeName?.toLowerCase() === query.toLowerCase());
            const foundYear = years.find(y => y.toString() === query);

            if (foundBrand) {
                setValue("brand", foundBrand.brandName);
                onFilterSubmit({ ...getValues(), brand: foundBrand.brandName });
            } else if (foundRegion) {
                setValue("countryCode", "+84");
                setValue("regionId", foundRegion.regionId);
                onFilterSubmit({ ...getValues(), countryCode: "+84", regionId: foundRegion.regionId });
            } else if (foundFuel) {
                setValue("fuelType", foundFuel.fuelTypeName);
                onFilterSubmit({ ...getValues(), fuelType: foundFuel.fuelTypeName });
            } else if (foundYear) {
                setValue("year", foundYear.toString());
                onFilterSubmit({ ...getValues(), year: foundYear.toString() });
            } else {
                // Nếu không nhận diện được filter, coi là tìm kiếm tự do (model/tên xe)
                setSearchQuery(query);
                handleSearch(query);
            }

            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, brands, regions, fuelTypes, years]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <Header
                isAuthenticated={!!localStorage.getItem("token")}
                userEmail={localStorage.getItem("userEmail")}
                isUserDropdownOpen={isUserDropdownOpen}
                setIsUserDropdownOpen={setIsUserDropdownOpen}
                handleLogout={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userEmail");
                    window.location.href = "/login";
                }}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            <main className="pt-24 pb-16">
                {/* Enhanced Hero Section */}
                <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row justify-between items-center">
                            <div className="text-center lg:text-left mb-8 lg:mb-0">
                                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                                    <FaAward className="text-yellow-300 mr-2" />
                                    <span className="text-white font-semibold text-sm">
                                        {currentFilterType === "featured"
                                            ? "XE NỔI BẬT"
                                            : currentFilterType === "popular"
                                                ? "XE PHỔ BIẾN"
                                                : "TÌM KIẾM XE"}
                                    </span>
                                </div>
                                <h1 className="text-4xl lg:text-6xl font-bold mb-4 leading-tight">
                                    {currentFilterType === "featured"
                                        ? "Xe Nổi Bật"
                                        : currentFilterType === "popular"
                                            ? "Xe Phổ Biến"
                                            : "Chọn Xe Của Bạn"}
                                </h1>
                                <p className="text-xl text-white/90 max-w-2xl">
                                    {currentFilterType === "featured"
                                        ? "Khám phá những chiếc xe cao cấp được chọn lọc kỹ lưỡng"
                                        : currentFilterType === "popular"
                                            ? "Những chiếc xe được yêu thích nhất bởi khách hàng"
                                            : "Tìm và đặt xe hoàn hảo từ bộ sưu tập xe cao cấp của chúng tôi"}
                                </p>
                            </div>
                        </div>

                        {/* Filter Type Toggle Buttons */}
                        <div className="mt-8 flex justify-center">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2 flex space-x-2">
                                {[
                                    { type: "all", label: "Tất cả", icon: FaCar },
                                    { type: "featured", label: "Nổi bật", icon: FaStar },
                                    { type: "popular", label: "Phổ biến", icon: FaHeart }
                                ].map((filter) => (
                                    <button
                                        key={filter.type}
                                        onClick={() => handleFilterTypeChange(filter.type)}
                                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${currentFilterType === filter.type
                                            ? "bg-white text-blue-600 shadow-lg"
                                            : "text-white/80 hover:text-white hover:bg-white/10"
                                            }`}
                                    >
                                        <filter.icon className="text-sm" />
                                        <span>{filter.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Enhanced Filters and Cars Section */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Enhanced Filter Panel */}
                            <div className={`lg:w-1/4 ${showFilters ? "block" : "hidden lg:block"}`}>
                                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 sticky top-28 border border-gray-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                                            <FaFilter className="mr-2 text-blue-600" />
                                            Bộ lọc tìm kiếm
                                        </h2>
                                        <button
                                            onClick={handleResetFilters}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:bg-blue-50 px-3 py-1 rounded-lg transition-all"
                                        >
                                            Xóa tất cả
                                        </button>
                                    </div>

                                    {filterLoading ? (
                                        <div className="space-y-4">
                                            {Array.from({ length: 6 }).map((_, index) => (
                                                <div key={index}>
                                                    <Skeleton height={20} className="mb-2" />
                                                    <Skeleton height={40} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit(onFilterSubmit)} className="space-y-6">
                                            {/* Brand Filter */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                                        <FaCar className="text-blue-600 text-sm" />
                                                    </div>
                                                    Thương hiệu
                                                </label>
                                                <select
                                                    {...register("brand")}
                                                    className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all"
                                                >
                                                    <option value="">Tất cả thương hiệu</option>
                                                    {brands.map((brand) => (
                                                        <option key={brand.carBrandId || brand.brandName} value={brand.brandName}>
                                                            {brand.brandName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Location Filter */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                                        <FaMapMarkerAlt className="text-purple-600 text-sm" />
                                                    </div>
                                                    Địa điểm
                                                </label>
                                                <div className="space-y-3">
                                                    <select
                                                        {...register("countryCode")}
                                                        className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all"
                                                    >
                                                        <option value="">Tất cả quốc gia</option>
                                                        {countries.map((country) => (
                                                            <option key={country.countryCode} value={country.countryCode}>
                                                                {country.countryName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        {...register("regionId")}
                                                        disabled={!selectedCountry}
                                                        className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all disabled:opacity-50"
                                                    >
                                                        <option value="">Tất cả khu vực</option>
                                                        {regions.map((region) => (
                                                            <option key={region.regionId} value={region.regionId}>
                                                                {region.regionName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Seats Filter */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                                                        <FaUsers className="text-green-600 text-sm" />
                                                    </div>
                                                    Số chỗ ngồi
                                                </label>
                                                <select
                                                    {...register("numOfSeats")}
                                                    className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all"
                                                >
                                                    <option value="">Tất cả</option>
                                                    {seatOptions.map((numOfSeats, idx) => (
                                                        <option key={numOfSeats || idx} value={numOfSeats}>
                                                            {numOfSeats} chỗ
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Price Range Filter */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                                    <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                                                        <FaMoneyBillWave className="text-yellow-600 text-sm" />
                                                    </div>
                                                    Khoảng giá
                                                </label>
                                                <select
                                                    {...register("priceRange")}
                                                    className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all"
                                                >
                                                    <option value="">Tất cả mức giá</option>
                                                    {priceRanges.map((range, idx) => (
                                                        <option key={range || idx} value={range}>
                                                            {range}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Year Filter */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                                    <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                                        <FaCalendarAlt className="text-indigo-600 text-sm" />
                                                    </div>
                                                    Năm sản xuất
                                                </label>
                                                <select
                                                    {...register("year")}
                                                    className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all"
                                                >
                                                    <option value="">Tất cả năm</option>
                                                    {years.map((year, idx) => (
                                                        <option key={year || idx} value={year}>
                                                            {year}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Fuel Type Filter */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                                    <div className="bg-orange-100 p-2 rounded-lg mr-3">
                                                        <FaGasPump className="text-orange-600 text-sm" />
                                                    </div>
                                                    Loại nhiên liệu
                                                </label>
                                                <select
                                                    {...register("fuelType")}
                                                    className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all"
                                                >
                                                    <option value="">Tất cả loại</option>
                                                    {fuelTypes.map((fuelType) => (
                                                        <option key={fuelType.fuelTypeId || fuelType.fuelTypeName} value={fuelType.fuelTypeName}>
                                                            {fuelType.fuelTypeName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Sort Filter */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                                    <div className="bg-pink-100 p-2 rounded-lg mr-3">
                                                        <FaSort className="text-pink-600 text-sm" />
                                                    </div>
                                                    Sắp xếp theo
                                                </label>
                                                <select
                                                    {...register("sortBy")}
                                                    className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all"
                                                >
                                                    <option value="">Mặc định</option>
                                                    <option value="price-low">Giá: Thấp đến cao</option>
                                                    <option value="price-high">Giá: Cao đến thấp</option>
                                                    <option value="name">Tên: A-Z</option>
                                                </select>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex space-x-3 pt-4">
                                                <button
                                                    type="submit"
                                                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                                                >
                                                    <FaFilter className="mr-2" />
                                                    Áp dụng
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleResetFilters}
                                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center"
                                                >
                                                    <FaUndo className="mr-2" />
                                                    Đặt lại
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* Enhanced Car List */}
                            <div className="lg:w-3/4">
                                {/* Enhanced Search and Controls Bar */}
                                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                                            <div className="w-full lg:w-auto">
                                                <div className="relative">
                                                    <AutocompleteSearch
                                                        fetchSuggestions={fetchSuggestions}
                                                        onSelect={value => {
                                                            setSearchQuery(value);
                                                            handleSearch(value); // Gọi search luôn khi chọn suggestion
                                                        }}
                                                        value={searchQuery}
                                                        onChange={val => setSearchQuery(val)}
                                                    />
                                                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                {/* Toggle Date Filter */}
                                                <button
                                                    onClick={() => {
                                                        const newEnabled = !dateFilter.enabled;
                                                        console.log('[SearchPage] Toggle date filter:', newEnabled);
                                                        setDateFilter(prev => ({ ...prev, enabled: newEnabled }));

                                                        // Nếu disable date filter, refresh ngay
                                                        if (!newEnabled && currentFilterType === "all") {
                                                            const currentFormData = getValues();
                                                            const finalFilters = { ...currentFormData };
                                                            Object.keys(finalFilters).forEach(key => {
                                                                if (finalFilters[key] === "" || finalFilters[key] === null || finalFilters[key] === undefined) {
                                                                    delete finalFilters[key];
                                                                }
                                                            });
                                                            fetchCars(finalFilters, 0);
                                                            setCurrentPage(1);
                                                        }
                                                    }}
                                                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all ${dateFilter.enabled
                                                        ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                                                        : "bg-gray-100 text-gray-600 border-2 border-gray-300"
                                                        }`}
                                                >
                                                    <FaCalendarAlt />
                                                    <span>{dateFilter.enabled ? "Lọc theo ngày" : "Bỏ lọc ngày"}</span>
                                                </button>

                                                {/* View Mode Toggle */}
                                                <div className="hidden md:flex items-center bg-gray-100 rounded-xl p-1">
                                                    <span className="text-sm text-gray-600 mr-3 px-2">Hiển thị:</span>
                                                    <button
                                                        onClick={() => handleViewModeChange("grid")}
                                                        className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"
                                                            }`}
                                                    >
                                                        <FaThLarge />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewModeChange("list")}
                                                        className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-200"
                                                            }`}
                                                    >
                                                        <FaList />
                                                    </button>
                                                </div>

                                                {/* Sort Dropdown */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                                                        className="flex items-center space-x-2 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm hover:border-blue-300 transition-all"
                                                    >
                                                        <FaSort className="text-gray-500" />
                                                        <span>
                                                            Sắp xếp:{" "}
                                                            {filters.sortBy === "price-low"
                                                                ? "Giá thấp"
                                                                : filters.sortBy === "price-high"
                                                                    ? "Giá cao"
                                                                    : filters.sortBy === "name"
                                                                        ? "Tên A-Z"
                                                                        : "Mặc định"}
                                                        </span>
                                                        <FaChevronDown
                                                            className={`text-xs transition-transform ${showSortDropdown ? "rotate-180" : ""}`}
                                                        />
                                                    </button>
                                                    {showSortDropdown && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-10 border border-gray-100 overflow-hidden">
                                                            {[
                                                                { value: "", label: "Mặc định" },
                                                                { value: "price-low", label: "Giá: Thấp đến cao" },
                                                                { value: "price-high", label: "Giá: Cao đến thấp" },
                                                                { value: "name", label: "Tên: A-Z" },
                                                            ].map((option) => (
                                                                <button
                                                                    key={option.value}
                                                                    className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left"
                                                                    onClick={() => {
                                                                        setValue("sortBy", option.value)
                                                                        setShowSortDropdown(false)
                                                                        handleFilterChange({ ...filters, sortBy: option.value })
                                                                    }}
                                                                >
                                                                    {option.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Mobile Filter Toggle */}
                                                <button
                                                    className="lg:hidden bg-blue-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                                                    onClick={() => setShowFilters(!showFilters)}
                                                >
                                                    <FaFilter />
                                                </button>
                                            </div>
                                        </div>
                                        {/* Date Filter Row */}
                                        {dateFilter.enabled && (
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Ngày nhận
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={dateFilter.pickupDate}
                                                        onChange={(e) => handleDateFilterChange('pickupDate', e.target.value)}
                                                        min={getToday()}
                                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Giờ nhận
                                                    </label>
                                                    <select
                                                        value={dateFilter.pickupTime}
                                                        onChange={(e) => handleDateFilterChange('pickupTime', e.target.value)}
                                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Ngày trả
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={dateFilter.dropoffDate}
                                                        onChange={(e) => handleDateFilterChange('dropoffDate', e.target.value)}
                                                        min={dateFilter.pickupDate}
                                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Giờ trả
                                                    </label>
                                                    <select
                                                        value={dateFilter.dropoffTime}
                                                        onChange={(e) => handleDateFilterChange('dropoffTime', e.target.value)}
                                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            </div>
                                        )}
                                        {/*/!* Stats Row *!/*/}
                                        {/*<div className="flex justify-between items-center">*/}
                                        {/*    <div className="text-sm text-gray-600">*/}
                                        {/*        Hiển thị <span className="font-semibold text-blue-600">{carContent.length}</span> xe*/}
                                        {/*        {dateFilter.enabled && (*/}
                                        {/*            <span className="text-blue-600 font-medium">*/}
                                        {/*                {" "}có sẵn từ {dateFilter.pickupDate} đến {dateFilter.dropoffDate}*/}
                                        {/*            </span>*/}
                                        {/*        )}*/}
                                        {/*        /!* ...existing stats... *!/*/}
                                        {/*    </div>*/}
                                        {/*    /!* ...existing compare info... *!/*/}
                                        {/*</div>*/}


                                        <div className="mt-4 flex justify-between items-center">
                                            <div className="text-sm text-gray-600">
                                                Hiển thị <span className="font-semibold text-blue-600">{carContent.length}</span> xe
                                                {cars.totalElements > 0 && (
                                                    <span>
                                                        {" "}
                                                        trong tổng số <span className="font-semibold text-blue-600">{cars.totalElements}</span> xe
                                                        {currentFilterType === "featured" && " nổi bật"}
                                                        {currentFilterType === "popular" && " phổ biến"}
                                                    </span>
                                                )}
                                            </div>
                                            {compareVehicles.length > 0 && (
                                                <div className="text-sm text-purple-600 font-medium">
                                                    {compareVehicles.length} xe được chọn để so sánh
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Car Content */}
                                {loading ? (
                                    <div
                                        className={
                                            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"
                                        }
                                    >
                                        {Array.from({ length: 6 }).map((_, index) => (
                                            <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                                                <Skeleton height={200} className="mb-4" />
                                                <Skeleton count={3} height={20} style={{ margin: "0.5rem 0" }} />
                                                <Skeleton height={40} className="mt-4" />
                                            </div>
                                        ))}
                                    </div>
                                ) : error ? (
                                    <ErrorMessage message={error} onRetry={() => fetchCars(filters, currentPage - 1)} />
                                ) : (
                                    <>
                                        {/* Available Cars */}
                                        {availableCars.length > 0 && (
                                            <div className="mb-12">
                                                <div className="flex items-center mb-6">
                                                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl mr-4">
                                                        <FaCheckCircle className="text-white text-xl" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-gray-900">Xe có sẵn</h2>
                                                        <p className="text-gray-600">Sẵn sàng cho chuyến đi của bạn</p>
                                                    </div>
                                                </div>
                                                <div
                                                    className={
                                                        viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"
                                                    }
                                                >
                                                    {availableCars.map((car) => (
                                                        <CarCard key={car.carId} car={car} isRented={false} onBookNow={handleBookNow} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Rented Cars */}
                                        {rentedCars.length > 0 && (
                                            <div className="mb-12">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center">
                                                        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-xl mr-4">
                                                            <FaCar className="text-white text-xl" />
                                                        </div>
                                                        <div>
                                                            <h2 className="text-2xl font-bold text-gray-900">Xe đang được thuê</h2>
                                                            <p className="text-gray-600">Xem lịch trình và đặt trước</p>
                                                        </div>
                                                    </div>
                                                    {rentedCars.length > rentedCarsLimit && (
                                                        <button
                                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                                                            onClick={() => setShowAllRented(!showAllRented)}
                                                        >
                                                            {showAllRented ? "Thu gọn" : `Xem thêm ${rentedCars.length - rentedCarsLimit} xe`}
                                                        </button>
                                                    )}
                                                </div>
                                                <div
                                                    className={
                                                        viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"
                                                    }
                                                >
                                                    {displayedRentedCars.map((car) => (
                                                        <CarCard key={car.carId} car={car} isRented={true} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* No Results */}
                                        {carContent.length === 0 && (
                                            <div className="text-center py-16">
                                                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                                                    <FaCar className="text-gray-400 text-4xl" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy xe nào</h3>
                                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                                    {noCarMessage || "Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác để tìm xe phù hợp."}
                                                </p>
                                                <button
                                                    onClick={handleResetFilters}
                                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                                                >
                                                    Đặt lại bộ lọc
                                                </button>
                                            </div>
                                        )}

                                        {/* Enhanced Pagination */}
                                        {cars.totalPages > 1 && (
                                            <div className="flex flex-col sm:flex-row justify-between items-center mt-12 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-100">
                                                <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                                                    Trang {currentPage} trong tổng số {cars.totalPages} trang
                                                    {currentFilterType === "featured" && " (Xe nổi bật)"}
                                                    {currentFilterType === "popular" && " (Xe phổ biến)"}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                        className="px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                                                    >
                                                        Trước
                                                    </button>
                                                    <div className="flex space-x-1">
                                                        {getPageNumbers().map((page) => (
                                                            <button
                                                                key={page}
                                                                onClick={() => typeof page === "number" && handlePageChange(page)}
                                                                className={`px-4 py-2 rounded-xl font-medium transition-all ${page === currentPage
                                                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                                                                    : page === "..."
                                                                        ? "text-gray-400 cursor-default"
                                                                        : "text-gray-700 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300"
                                                                    }`}
                                                                disabled={page === "..."}
                                                            >
                                                                {page}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <button
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === cars.totalPages}
                                                        className="px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                                                    >
                                                        Sau
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />

            {/* Enhanced Comparison Bar */}
            {showCompareBar && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl border-t border-gray-200 z-40">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center">
                            <div className="flex items-center mb-4 sm:mb-0">
                                <span className="font-bold text-gray-800 mr-4 flex items-center">
                                    <FaExchangeAlt className="mr-2 text-blue-600" />
                                    So sánh xe:
                                </span>
                                <div className="flex space-x-3">
                                    {compareVehicles.map((id) => {
                                        const car = filteredCars.find((v) => v.carId === id)
                                        return car ? (
                                            <div key={id} className="relative group">
                                                <img
                                                    src={
                                                        car.images?.find((img) => img.isMain)?.imageUrl ||
                                                        car.images?.[0]?.imageUrl ||
                                                        "https://via.placeholder.com/300" ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={car.model}
                                                    className="w-16 h-16 object-cover rounded-xl shadow-lg group-hover:scale-110 transition-transform"
                                                />
                                                <button
                                                    onClick={() => toggleCompare(id)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
                                                >
                                                    <FaTimes />
                                                </button>
                                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
                                                    {car.model}
                                                </div>
                                            </div>
                                        ) : null
                                    })}
                                    {Array.from({ length: 3 - compareVehicles.length }).map((_, index) => (
                                        <div
                                            key={`empty-${index}`}
                                            className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 bg-gray-50"
                                        >
                                            <FaCarSide className="text-2xl" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setCompareVehicles([])}
                                    className="px-4 py-2 border-2 border-gray-300 rounded-xl text-gray-600 hover:bg-gray-100 text-sm font-medium transition-all"
                                >
                                    Xóa tất cả
                                </button>
                                <button
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                    disabled={compareVehicles.length < 2}
                                    onClick={() => navigate("/compare", { state: { compareIds: compareVehicles } })}
                                >
                                    So sánh ngay ({compareVehicles.length})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Popup */}
            {showSchedule && <SchedulePopup />}

            {/* Enhanced Floating Elements */}
            <div className="fixed bottom-8 right-8 z-30 flex flex-col space-y-4">
                {/* Back to Top */}
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
            </div>

            {/* Enhanced Cookie Consent Banner */}
            {/* {showCookieConsent && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl p-6 z-40 border-t border-gray-200">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row items-center justify-between">
                            <div className="mb-6 lg:mb-0 text-center lg:text-left lg:mr-8">
                                <h4 className="font-bold text-gray-900 mb-2">🍪 Chúng tôi sử dụng Cookie</h4>
                                <p className="text-gray-700 leading-relaxed">
                                    Chúng tôi sử dụng cookie để cải thiện trải nghiệm của bạn và cung cấp dịch vụ tốt nhất. Bằng cách tiếp
                                    tục sử dụng trang web, bạn đồng ý với chính sách cookie của chúng tôi.
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
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                                >
                                    Chấp nhận tất cả
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )} */}

            {/* Booking Modal dùng chung */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => { setIsBookingModalOpen(false); setSelectedCar(null); }}
                car={selectedCar}
                onSubmitBooking={handleSubmitBooking}
            />
            {/* Render QuickViewModal */}
            <QuickViewModal
                isOpen={isQuickViewOpen}
                onClose={closeQuickView}
                car={quickViewCar}
                ratingCount={quickViewRatingCount}
                ratingLoading={quickViewRatingLoading}
            />
        </div>
    );
}

export default SearchPage