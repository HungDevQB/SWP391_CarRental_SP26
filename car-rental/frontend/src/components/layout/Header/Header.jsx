import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaCarSide, FaHome, FaCar, FaStore, FaSearch, FaHeart, FaChevronDown, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaTimes, FaBars, FaPhone, FaUser, FaCalendarAlt, FaComments } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import AutocompleteSearch from '@/components/Common/AutocompleteSearch';
import api from "@/services/api";

const Header = ({
    isUserDropdownOpen,
    setIsUserDropdownOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen
}) => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [headerSearch, setHeaderSearch] = useState("");
    const [cars, setCars] = useState({ content: [] });
    const [brands, setBrands] = useState([]);
    const [regions, setRegions] = useState([]);
    const [fuelTypes, setFuelTypes] = useState([]);
    const [years, setYears] = useState([]);
    const userDropdownRef = useRef(null);

    useEffect(() => {
        // Fetch từng filter riêng biệt, region dùng countryCode mặc định '+84'
        api.get("/api/cars/car-brands")
            .then(res => setBrands(Array.isArray(res.data) ? res.data : []))
            .catch(err => {
                setBrands([]);
                console.error("Error fetching brands:", err);
            });

        api.get("/api/cars/regions/country/+84")
            .then(res => setRegions(Array.isArray(res.data) ? res.data : []))
            .catch(err => {
                setRegions([]);
                console.error("Error fetching regions:", err);
            });

        api.get("/api/cars/fuel-types")
            .then(res => setFuelTypes(Array.isArray(res.data) ? res.data : []))
            .catch(err => {
                setFuelTypes([]);
                console.error("Error fetching fuelTypes:", err);
            });

        api.get("/api/cars/years")
            .then(res => setYears(Array.isArray(res.data) ? res.data : []))
            .catch(err => {
                setYears([]);
                console.error("Error fetching years:", err);
            });

        api.get("/api/cars", { params: { page: 0, size: 1000 } })
            .then(res => {
                let carList = [];
                if (Array.isArray(res.data)) carList = res.data;
                else if (res.data && Array.isArray(res.data.content)) carList = res.data.content;
                setCars({ content: carList });
                console.log('Header cars:', carList);
            })
            .catch(err => {
                setCars({ content: [] });
                console.error("Error fetching cars:", err);
            });
    }, []);

    // Click outside handler for user dropdown
    useEffect(() => {
        if (!isUserDropdownOpen) return;
        function handleClickOutside(event) {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isUserDropdownOpen, setIsUserDropdownOpen]);

    // fetchSuggestions đa loại
    const fetchSuggestions = async (query) => {
        try {
            const carNames = (cars.content || []).flatMap(car => [
                car.brandName,
                car.model,
                car.regionName,
                car.fuelTypeName,
                car.year && car.year.toString()
            ]).filter(Boolean);
            const brandNames = Array.isArray(brands) ? brands.map(b => b.brandName) : [];
            const regionNames = Array.isArray(regions) ? regions.map(r => r.regionName) : [];
            const fuelTypesList = Array.isArray(fuelTypes) ? fuelTypes.map(f => f.fuelTypeName) : [];
            const yearsList = Array.isArray(years) ? years.map(y => y.toString()) : [];
            const allSuggestions = [
                ...carNames,
                ...brandNames,
                ...regionNames,
                ...fuelTypesList,
                ...yearsList
            ];
            const uniqueSuggestions = [...new Set(allSuggestions)];
            return uniqueSuggestions.filter(name =>
                name && name.toLowerCase().includes(query.toLowerCase())
            );
        } catch (err) {
            console.error("Error in fetchSuggestions (Header):", err);
            return [];
        }
    };

    const handleHeaderSearch = (value) => {
        setHeaderSearch(value);
        if (value && value.trim()) {
            navigate("/search", { state: { searchQuery: value } });
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg z-50 border-b border-blue-100">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo + Main Menu (all left) */}
                    <div className="flex items-center space-x-8">
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
                        {/* Main Menu */}
                        <nav className="flex items-center space-x-8">
                            <Link to="/" className={`font-semibold transition-all duration-300 relative group flex items-center space-x-2 px-4 py-2 rounded-xl ${location.pathname === '/' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}>
                                <FaHome className="text-sm" />
                                <span>Trang chủ</span>
                                {location.pathname === '/' && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>}
                            </Link>
                            <Link to="/search" state={{ filterType: "all" }} className={`font-semibold transition-all duration-300 relative group flex items-center space-x-2 px-4 py-2 rounded-xl ${location.pathname.startsWith('/search') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}>
                                <FaCar className="text-sm" />
                                <span>Xe</span>
                                {location.pathname.startsWith('/search') && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>}
                            </Link>
                            <Link to="/owner-registration" className="flex items-center text-indigo-600 hover:text-indigo-700 transition-all duration-300 px-4 py-2 rounded-xl hover:bg-indigo-50 group text-sm font-semibold border border-indigo-200 hover:border-indigo-300">
                                <FaStore className="text-sm mr-2 group-hover:scale-110 transition-transform" />
                                <span>Đối tác</span>
                            </Link>
                        </nav>
                    </div>
                    {/* Right Side Actions (search, favorite, user, phone) */}
                    <div className="flex items-center space-x-4">
                        {/* Enhanced Search Bar */}
                        <div className="relative group">
                            <AutocompleteSearch
                                fetchSuggestions={fetchSuggestions}
                                value={headerSearch}
                                onChange={setHeaderSearch}
                                onSelect={handleHeaderSearch}
                                inputClassName="py-3 px-4 pr-12 rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-blue-50/50 hover:bg-white transition-all duration-300 w-64 focus:w-72 group-hover:shadow-lg"
                                placeholder="Tìm xe mơ ước..."
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg cursor-pointer hover:scale-110 transition-transform pointer-events-none">
                                <FaSearch className="text-white text-xs" />
                            </div>
                        </div>
                        {/* Favorites Button */}
                        <Link
                            to="/favorites"
                            state={{ refresh: true }}
                            className="flex items-center text-gray-700 hover:text-red-600 transition-all duration-300 p-2 rounded-xl hover:bg-red-50 group"
                        >
                            <FaHeart className="text-lg" />
                        </Link>
                        {/* Enhanced User Account */}
                        <div className="relative" ref={userDropdownRef}>
                            {isAuthenticated ? (
                                <button
                                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                    className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-300 p-2 rounded-xl hover:bg-blue-50 group"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all">
                                        <span className="text-white text-sm font-bold">{user?.username ? user.username[0].toUpperCase() : 'U'}</span>
                                    </div>
                                    <FaChevronDown
                                        className={`text-xs transition-all duration-300 ${isUserDropdownOpen ? "rotate-180" : ""}`}
                                    />
                                </button>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Link
                                        to="/login"
                                        className="text-gray-700 hover:text-blue-600 transition-all duration-300 px-4 py-2 rounded-xl hover:bg-blue-50 text-sm font-semibold"
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        to="/login"
                                        state={{ showRegister: true }}
                                        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-2 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm"
                                    >
                                        Đăng ký
                                    </Link>
                                </div>
                            )}
                            {/* Enhanced User Dropdown */}
                            {isAuthenticated && isUserDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-3 border border-blue-100 animate-in slide-in-from-top-5 duration-200">
                                    <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                                        <p className="text-sm font-semibold text-gray-900">Xin chào!</p>
                                        <p className="text-xs text-gray-500">{user?.username || "user@example.com"}</p>
                                        {user?.role === 'customer' && location.pathname === '/customer/messages' && (
                                            <div className="mt-3 flex items-center space-x-2">
                                                <FaComments className="text-blue-500 w-4 h-4" />
                                                <span className="font-bold text-blue-600 text-base">Tin nhắn</span>
                                            </div>
                                        )}
                                    </div>
                                    {user?.role === 'supplier' && (
                                        <Link
                                            to="/supplier/dashboard"
                                            className="flex items-center px-6 py-3 text-sm hover:bg-blue-50 transition-all duration-200 rounded-xl mx-2 text-blue-600"
                                            onClick={() => setIsUserDropdownOpen(false)}
                                        >
                                            <FaCar className="mr-3 text-blue-400" />
                                            Quản lý xe
                                        </Link>
                                    )}
                                    <Link
                                        to={user?.role === 'supplier' ? "/supplier/profile" : "/profile"}
                                        className="flex items-center px-6 py-3 text-sm hover:bg-blue-50 transition-all duration-200 rounded-xl mx-2 text-gray-700 hover:text-blue-600"
                                        onClick={() => setIsUserDropdownOpen(false)}
                                    >
                                        <FaUser className="mr-3 text-gray-400" />
                                        Hồ sơ của tôi
                                    </Link>
                                    <Link
                                        to="/customer/messages"
                                        className={`flex items-center px-6 py-3 text-sm hover:bg-blue-50 transition-all duration-200 rounded-xl mx-2 ${location.pathname === '/customer/messages' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-gray-700 hover:text-blue-600'}`}
                                        onClick={() => setIsUserDropdownOpen(false)}
                                    >
                                        <FaComments className={`mr-3 ${location.pathname === '/customer/messages' ? 'text-blue-600' : 'text-gray-400'}`} />
                                        Tin nhắn
                                    </Link>
                                    {user?.role === 'customer' && (
                                        <button
                                            className="flex items-center px-6 py-3 text-sm hover:bg-blue-50 transition-all duration-200 rounded-xl mx-2 text-gray-700 hover:text-blue-600 w-full text-left"
                                            onClick={() => {
                                                setIsUserDropdownOpen(false);
                                                navigate('/profile', { state: { activeTab: 'bookings' } });
                                            }}
                                        >
                                            <FaCalendarAlt className="mr-3 text-gray-400" />
                                            Lịch sử thuê xe
                                        </button>
                                    )}
                                    <div className="border-t border-blue-100 mt-2 pt-2">
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsUserDropdownOpen(false);
                                            }}
                                            className="flex items-center w-full text-left px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 rounded-xl mx-2"
                                        >
                                            <FaSignOutAlt className="mr-3 text-red-400" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Contact Button */}
                        <Link
                            to="/lien-he"
                            className="flex items-center text-gray-700 hover:text-emerald-600 transition-all duration-300 p-3 rounded-xl hover:bg-emerald-50 shadow-sm hover:shadow-md"
                        >
                            <FaPhone className="text-sm" />
                        </Link>
                    </div>
                </div>
                {/* Enhanced Mobile Menu Button */}
                <button
                    className="lg:hidden p-3 rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-sm"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? (
                        <FaTimes className="text-xl text-gray-700" />
                    ) : (
                        <FaBars className="text-xl text-gray-700" />
                    )}
                </button>
            </div>
            {/* Enhanced Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden mt-6 pb-6 border-t border-blue-100 animate-in slide-in-from-top duration-300">
                    <nav className="flex flex-col space-y-2 mt-6">
                        {[
                            { name: "Trang chủ", path: "/", icon: FaHome, active: true },
                            { name: "Xe", path: "/search", icon: FaCar, state: { filterType: "all" } },
                        ].map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                state={item.state}
                                className={`font-semibold p-4 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                                    item.active ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-blue-50"
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <item.icon className="text-lg" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                        {/* Mobile Favorites */}
                        <Link
                            to="/favorites"
                            state={{ refresh: true }}
                            className="font-semibold p-4 rounded-xl transition-all duration-300 flex items-center space-x-3 text-gray-700 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <FaHeart className="text-lg" />
                            <span>Yêu thích</span>
                        </Link>
                        {/* Mobile User Actions */}
                        <div className="pt-4 border-t border-blue-100 space-y-2">
                            {isAuthenticated ? (
                                <>
                                    {user?.role === 'supplier' && (
                                        <Link
                                            to="/supplier/dashboard"
                                            className="flex items-center text-gray-700 p-4 hover:bg-blue-50 hover:text-blue-600 rounded-xl space-x-3 transition-all"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <FaCar className="text-lg" />
                                            <span>Quản lý xe</span>
                                        </Link>
                                    )}
                                    <Link
                                        to={user?.role === 'supplier' ? "/supplier/profile" : "/profile"}
                                        className="flex items-center text-gray-700 p-4 hover:bg-blue-50 hover:text-blue-600 rounded-xl space-x-3 transition-all"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <FaUser className="text-lg" />
                                        <span>Hồ sơ của tôi</span>
                                    </Link>
                                    {user?.role === 'customer' && (
                                        <Link
                                            to="/my-bookings"
                                            className="flex items-center text-gray-700 p-4 hover:bg-blue-50 hover:text-blue-600 rounded-xl space-x-3 transition-all"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <FaCalendarAlt className="text-lg" />
                                            <span>Lịch sử thuê xe</span>
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            logout();
                                        }}
                                        className="flex items-center w-full text-left text-red-600 p-4 hover:bg-red-50 rounded-xl space-x-3 transition-all"
                                    >
                                        <FaSignOutAlt className="text-lg" />
                                        <span>Đăng xuất</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="flex items-center text-gray-700 p-4 hover:bg-blue-50 hover:text-blue-600 rounded-xl space-x-3 transition-all"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <FaSignInAlt className="text-lg" />
                                        <span>Đăng nhập</span>
                                    </Link>
                                    <Link
                                        to="/login"
                                        state={{ showRegister: true }}
                                        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-2 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm"
                                    >
                                        <FaUserPlus className="text-lg" />
                                        <span>Đăng ký</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;