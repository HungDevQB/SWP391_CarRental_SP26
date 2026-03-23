import React, { useState, useEffect } from 'react';
import { 
    FaClipboardList, 
    FaSearch, 
    FaFilter, 
    FaEye, 
    FaCheck, 
    FaTimes,
    FaDownload,
    FaExclamationTriangle,
    FaCar,
    FaUser,
    FaCalendarAlt,
    FaChartBar
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/components/ui/Loading/LoadingSpinner';
import ViewReportModal from '@/components/CarConditionReport/CarConditionReportView';
import { 
    getAllCarConditionReports, 
    getCarConditionReportStats,
    confirmCarConditionReport,
    exportCarConditionReports 
} from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import './CarConditionReportManagement.scss';

// Helper để loại bỏ filter không hợp lệ
function cleanFilters(filters) {
  const cleaned = { ...filters };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === 'all' || cleaned[key] === '' || cleaned[key] == null) {
      delete cleaned[key];
    }
  });
  return cleaned;
}

const CarConditionReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({});
    const [connectionError, setConnectionError] = useState(false);
    
    // Filter states
    const [filters, setFilters] = useState({
        reportType: 'all',
        status: 'all',
        dateRange: 'all',
        searchTerm: ''
    });
    
    // Modal states
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchReports();
        fetchStats();
    }, [filters, currentPage]);

    // Reset currentPage khi filter thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [filters.reportType, filters.status, filters.dateRange, filters.searchTerm]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await getAllCarConditionReports(cleanFilters({
                ...filters,
                page: currentPage - 1, // Backend expects 0-based pagination
                limit: itemsPerPage
            }));
            console.log('Admin reports response:', response); // Debug log
            
            // Handle both data.reports and direct response.data formats
            const reportsData = response.data?.reports || response.data || [];
            setReports(Array.isArray(reportsData) ? reportsData : []);
            setError(null); // Clear any previous errors
            setConnectionError(false); // Clear connection error flag
        } catch (error) {
            console.error('Error fetching reports:', error);
            
            // Check if it's a connection error (backend not running)
            if (error.message?.includes('ERR_CONNECTION_REFUSED') || 
                error.message?.includes('Network Error') ||
                error.code === 'ERR_NETWORK') {
                setError('Không thể kết nối với máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc liên hệ quản trị viên.');
                setConnectionError(true);
                console.warn('Backend server is not running. Please start the backend server.');
            } else {
                setError('Không thể tải danh sách báo cáo');
                setConnectionError(false);
            }
            setReports([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await getCarConditionReportStats(); // Không truyền filter vì backend không nhận
            console.log('Admin stats response:', response); // Debug log
            
            // Handle response format
            const statsData = response.data || response;
            
            // Transform stats to match UI expectations
            const transformedStats = {
                totalReports: statsData.total || 0,
                pendingReports: statsData.statusCounts?.pending || 0,
                confirmedReports: statsData.statusCounts?.confirmed || 0,
                damageReports: 0 // Calculate from reports if needed
            };
            
            setStats(transformedStats);
        } catch (error) {
            console.error('Error fetching stats:', error);
            
            // Check if it's a connection error (backend not running)
            if (error.message?.includes('ERR_CONNECTION_REFUSED') || 
                error.message?.includes('Network Error') ||
                error.code === 'ERR_NETWORK') {
                console.warn('Backend server is not running. Using fallback stats.');
                // Set fallback stats when backend is not available
                setStats({
                    totalReports: 0,
                    pendingReports: 0,
                    confirmedReports: 0,
                    damageReports: 0
                });
            } else {
                setStats({}); // Set empty object on other errors
            }
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const handleViewReport = (report) => {
        setSelectedReport(report);
        setShowViewModal(true);
    };

    const handleConfirmReport = async (reportId) => {
        try {
            const response = await confirmCarConditionReport(reportId);
            console.log('Confirm report response:', response); // Debug log
            
            await fetchReports();
            await fetchStats();
            toast.success('Đã xác nhận báo cáo thành công');
        } catch (error) {
            console.error('Error confirming report:', error);
            if (error.message?.includes('ERR_CONNECTION_REFUSED') || 
                error.message?.includes('Network Error') ||
                error.code === 'ERR_NETWORK') {
                toast.error('Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng.');
            } else {
                toast.error('Không thể xác nhận báo cáo');
            }
        }
    };

    const handleExportReports = async () => {
        try {
            console.log('Exporting with filters:', filters); // Debug log
            const response = await exportCarConditionReports(filters);
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `car-condition-reports-${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Clean up
            
            toast.success('Đã xuất báo cáo thành công');
        } catch (error) {
            console.error('Error exporting reports:', error);
            if (error.message?.includes('ERR_CONNECTION_REFUSED') || 
                error.message?.includes('Network Error') ||
                error.code === 'ERR_NETWORK') {
                toast.error('Không thể kết nối với máy chủ để xuất báo cáo. Vui lòng kiểm tra kết nối mạng.');
            } else {
                toast.error('Không thể xuất báo cáo');
            }
        }
    };

    const getStatusBadge = (isConfirmed) => {
        return isConfirmed ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                <FaCheck className="inline mr-1" />
                Đã xác nhận
            </span>
        ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                <FaExclamationTriangle className="inline mr-1" />
                Chờ xác nhận
            </span>
        );
    };

    const getReportTypeBadge = (type) => {
        return type === 'PICKUP' ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Nhận xe</span>
        ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Trả xe</span>
        );
    };

    const getConditionBadge = (condition) => {
        const conditionClass = {
            'EXCELLENT': 'bg-green-100 text-green-700',
            'GOOD': 'bg-blue-100 text-blue-700',
            'FAIR': 'bg-yellow-100 text-yellow-700',
            'POOR': 'bg-red-100 text-red-700'
        };

        const conditionLabel = {
            'EXCELLENT': 'Tuyệt vời',
            'GOOD': 'Tốt',
            'FAIR': 'Bình thường',
            'POOR': 'Kém'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${conditionClass[condition]}`}>
                {conditionLabel[condition]}
            </span>
        );
    };

    const filteredReports = reports.filter(report => {
        const matchesReportType = filters.reportType === 'all' || report.reportType === filters.reportType;
        const matchesStatus = filters.status === 'all' || 
                            (filters.status === 'confirmed' && report.isConfirmed) ||
                            (filters.status === 'pending' && !report.isConfirmed);
        const matchesSearchTerm = !filters.searchTerm || 
                                report.bookingId.toString().includes(filters.searchTerm) ||
                                (report.car?.model || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                                (report.reporter?.fullName || '').toLowerCase().includes(filters.searchTerm.toLowerCase());
        
        return matchesReportType && matchesStatus && matchesSearchTerm;
    });

    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentReports = filteredReports.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <motion.div
            className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Connection Error Banner */}
            {connectionError && (
                <motion.div
                    className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 flex items-center gap-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <FaExclamationTriangle className="text-red-500" />
                    <div>
                        <strong>Không thể kết nối với máy chủ</strong>
                        <p className="text-sm mt-1">
                            Máy chủ backend hiện không khả dụng. Vui lòng khởi động máy chủ backend hoặc liên hệ quản trị viên.
                        </p>
                    </div>
                </motion.div>
            )}
            
            {/* Header Section */}
            <motion.div
                className="mb-8 text-center"
                variants={itemVariants}
            >
                <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl text-white">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                        <FaClipboardList className="text-3xl" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Quản lý báo cáo tình trạng xe</h1>
                        <p className="text-blue-100 text-lg">Theo dõi và xác nhận các báo cáo từ khách hàng và chủ xe</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                variants={itemVariants}
            >
                <motion.div
                    className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
                    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl">
                            <FaClipboardList className="text-white text-xl" />
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Tổng báo cáo</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.totalReports || 0}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100"
                    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                            <FaExclamationTriangle className="text-white text-xl" />
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Chờ xác nhận</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.pendingReports || 0}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white rounded-2xl p-6 shadow-lg border border-green-100"
                    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl">
                            <FaCheck className="text-white text-xl" />
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Đã xác nhận</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.confirmedReports || 0}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white rounded-2xl p-6 shadow-lg border border-red-100"
                    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-xl">
                            <FaCar className="text-white text-xl" />
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Có hư hỏng</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.damageReports || 0}</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Filters Section */}
            <motion.div
                className="mb-6 p-6 bg-white rounded-2xl shadow-lg border border-blue-200"
                variants={itemVariants}
            >
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col">
                        <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                            <FaFilter className="text-blue-500" />
                            Loại báo cáo
                        </label>
                        <select
                            value={filters.reportType}
                            onChange={(e) => handleFilterChange('reportType', e.target.value)}
                            className="border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm min-w-[150px]"
                        >
                            <option value="all">Tất cả</option>
                            <option value="PICKUP">Nhận xe</option>
                            <option value="RETURN">Trả xe</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                            <FaFilter className="text-blue-500" />
                            Trạng thái
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm min-w-[150px]"
                        >
                            <option value="all">Tất cả</option>
                            <option value="pending">Chờ xác nhận</option>
                            <option value="confirmed">Đã xác nhận</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                            <FaFilter className="text-blue-500" />
                            Thời gian
                        </label>
                        <select
                            value={filters.dateRange}
                            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                            className="border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm min-w-[150px]"
                        >
                            <option value="all">Tất cả</option>
                            <option value="today">Hôm nay</option>
                            <option value="week">Tuần này</option>
                            <option value="month">Tháng này</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                            <FaSearch className="text-blue-500" />
                            Tìm kiếm
                        </label>
                        <input
                            type="text"
                            placeholder="Tìm theo mã đơn, xe, người báo cáo..."
                            value={filters.searchTerm}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                            className="border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm min-w-[250px]"
                        />
                    </div>

                    <motion.button
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg transition-all duration-300 flex items-center gap-2"
                        onClick={handleExportReports}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaDownload />
                        Xuất báo cáo
                    </motion.button>
                </div>
            </motion.div>

            {/* Reports Table */}
            <motion.div
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-200"
                variants={itemVariants}
            >
                {loading ? (
                    <div className="py-12 text-center">
                        <div className="flex items-center justify-center gap-3 text-blue-600 font-semibold">
                            <LoadingSpinner size="large" />
                            Đang tải dữ liệu...
                        </div>
                    </div>
                ) : error ? (
                    <div className="py-12 text-center">
                        <div className="flex items-center justify-center gap-3 text-red-600 font-semibold">
                            <FaTimes className="text-xl" />
                            {error}
                        </div>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 font-medium">
                        <FaClipboardList className="text-4xl mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-semibold mb-2">Không có báo cáo nào</h3>
                        <p>Chưa có báo cáo tình trạng xe nào phù hợp với bộ lọc hiện tại</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                        <th className="py-4 px-6 text-left font-bold">Mã đơn</th>
                                        <th className="py-4 px-6 text-left font-bold">Loại báo cáo</th>
                                        <th className="py-4 px-6 text-left font-bold">Xe</th>
                                        <th className="py-4 px-6 text-left font-bold">Người báo cáo</th>
                                        <th className="py-4 px-6 text-left font-bold">Tình trạng chung</th>
                                        <th className="py-4 px-6 text-left font-bold">Ngày tạo</th>
                                        <th className="py-4 px-6 text-left font-bold">Trạng thái</th>
                                        <th className="py-4 px-6 text-center font-bold">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentReports.map((report, idx) => (
                                        <motion.tr
                                            key={report.reportId}
                                            className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            whileHover={{ x: 5 }}
                                        >
                                            <td className="py-4 px-6">
                                                <span className="font-mono font-semibold">#{report.bookingId}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {getReportTypeBadge(report.reportType)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div>
                                                    <div className="font-semibold">{report.car?.model || 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">{report.car?.licensePlate || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div>
                                                    <div className="font-semibold">{report.reporter?.fullName || 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {report.reporter?.role === 'customer' ? 'Khách hàng' : 'Chủ xe'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    {getConditionBadge(report.exteriorCondition)}
                                                    {report.damageNotes && (
                                                        <FaExclamationTriangle className="text-red-500" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div>
                                                    <div className="font-semibold">{new Date(report.reportDate).toLocaleDateString('vi-VN')}</div>
                                                    <div className="text-sm text-gray-500">{new Date(report.reportDate).toLocaleTimeString('vi-VN')}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {getStatusBadge(report.isConfirmed)}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <motion.button
                                                        className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg transition-all duration-300"
                                                        onClick={() => handleViewReport(report)}
                                                        whileHover={{ scale: 1.1, y: -2 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        title="Xem chi tiết"
                                                    >
                                                        <FaEye className="text-sm" />
                                                    </motion.button>
                                                    {!report.isConfirmed && (
                                                        <motion.button
                                                            className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transition-all duration-300"
                                                            onClick={() => handleConfirmReport(report.reportId)}
                                                            whileHover={{ scale: 1.1, y: -2 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            title="Xác nhận báo cáo"
                                                        >
                                                            <FaCheck className="text-sm" />
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <motion.div
                                className="flex justify-center items-center gap-4 mt-8"
                                variants={itemVariants}
                            >
                                <motion.button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    whileHover={{ scale: 1.05, y: -1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    ← Trước
                                </motion.button>
                                
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const maxVisiblePages = 5;
                                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                                        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                                        
                                        if (endPage - startPage + 1 < maxVisiblePages) {
                                            startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                        }
                                        
                                        const pages = [];
                                        for (let i = startPage; i <= endPage; i++) {
                                            pages.push(i);
                                        }
                                        
                                        return pages.map((page) => (
                                            <motion.button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                                                    currentPage === page
                                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-md'
                                                }`}
                                                whileHover={{ scale: 1.05, y: -1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {page}
                                            </motion.button>
                                        ));
                                    })()}
                                </div>
                                
                                <motion.button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    whileHover={{ scale: 1.05, y: -1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Sau →
                                </motion.button>
                            </motion.div>
                        )}
                    </>
                )}
            </motion.div>

            {/* View Report Modal */}
            <ViewReportModal
                isOpen={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setSelectedReport(null);
                }}
                report={selectedReport}
                canConfirm={!selectedReport?.isConfirmed}
                onConfirm={handleConfirmReport}
            />
        </motion.div>
    );
};

export default CarConditionReportManagement; 