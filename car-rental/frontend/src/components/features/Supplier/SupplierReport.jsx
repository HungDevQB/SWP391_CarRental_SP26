import React, { useEffect, useState } from "react";
import { Bar, Line, Doughnut, Pie } from "react-chartjs-2";
import { getSupplierDashboardSummary, getSupplierOrders, getSupplierMonthlyStats, getSupplierCars } from "@/services/api";
import { toast } from "react-toastify";
import { 
  FaChartBar, FaCar, FaClipboardList, FaUsers, FaMoneyBillWave, 
  FaCalendarAlt, FaDownload, FaSync, FaChartLine,
  FaChartPie, FaStar, FaFire, FaEye, FaArrowUp, FaArrowDown
} from "react-icons/fa";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/ui/Loading/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage";

// Helper: Tính phần trăm tăng/giảm giữa 2 số
const getPercentChangeValue = (current, prev) => {
  if (!prev) return current > 0 ? 100 : 0;
  return ((current - prev) / prev) * 100;
};

// Helper để lọc xe đã duyệt (không tính pending, pending_approval)
const getActiveVehiclesCount = (summary) => {
  if (summary?.vehicles && Array.isArray(summary.vehicles)) {
    return summary.vehicles.filter(car => {
      const st = (car.statusName || car.status?.statusName || '').toLowerCase();
      return st !== 'pending' && st !== 'pending_approval';
    }).length;
  }
  // Nếu không có danh sách xe, fallback về summary.totalVehicles (có thể đã chuẩn hóa ở backend)
  return summary?.totalVehicles ?? 0;
};

// Helper: Lấy tên xe hợp lệ
const getCarModel = (order) => order.car?.model || order.vehicle?.model || order.model || null;

// Helper: Tính phần trăm tăng/giảm cho mảng số liệu (giá trị cuối so với liền trước)
const getPercentChange = (arr) => {
  if (!arr || arr.length < 2) return 0;
  const last = arr[arr.length - 1] || 0;
  const prev = arr[arr.length - 2] || 0;
  if (prev === 0) return last > 0 ? 100 : 0;
  return ((last - prev) / prev) * 100;
};

// Thêm hàm getStatusColor và getStatusLabel ở đầu file (hoặc gần render bảng)
const getStatusColor = (status) => {
  const st = (status || '').toLowerCase();
  switch (st) {
    case 'confirmed':
    case 'đã xác nhận':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'pending':
    case 'chờ xác nhận':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'cancelled':
    case 'đã hủy':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'completed':
    case 'hoàn thành':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'in_progress':
    case 'in progress':
    case 'đang thuê':
      return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'ready_for_pickup':
    case 'sẵn sàng nhận xe':
      return 'bg-cyan-100 text-cyan-700 border-cyan-300';
    case 'delivered':
    case 'đã giao xe':
      return 'bg-indigo-100 text-indigo-700 border-indigo-300';
    case 'refunded':
    case 'đã hoàn cọc':
      return 'bg-pink-100 text-pink-700 border-pink-300';
    case 'payout':
      return 'bg-teal-100 text-teal-700 border-teal-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};
const getStatusLabel = (status) => {
  const st = (status || '').toLowerCase();
  switch (st) {
    case 'confirmed':
      return 'Đã xác nhận';
    case 'pending':
      return 'Chờ xác nhận';
    case 'cancelled':
      return 'Đã hủy';
    case 'completed':
      return 'Hoàn thành';
    case 'in_progress':
    case 'in progress':
      return 'Đang thuê';
    case 'ready_for_pickup':
      return 'Sẵn sàng nhận xe';
    case 'delivered':
      return 'Đã giao xe';
    case 'refunded':
      return 'Đã hoàn cọc';
    case 'payout':
      return 'Đã payout';
    default:
      return status || 'N/A';
  }
};

const SupplierReport = () => {
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [carPerformance, setCarPerformance] = useState([]);
  const [customerStats, setCustomerStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');
  const [cars, setCars] = useState([]); // Thêm state lưu danh sách xe thực tế
  const [carsLastMonth, setCarsLastMonth] = useState([]); // Thêm state lưu xe tháng trước
  const [customersLastMonth, setCustomersLastMonth] = useState(0); // Thêm state lưu khách tháng trước

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [summaryData, ordersData, monthlyData, carsData] = await Promise.all([
          getSupplierDashboardSummary(),
          getSupplierOrders(),
          getSupplierMonthlyStats(),
          getSupplierCars()
        ]);
        
        setSummary(summaryData);
        setOrders(ordersData || []);
        setMonthlyStats(monthlyData);
        setCars(carsData || []);

        // --- TÍNH XE THÁNG TRƯỚC ---
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const carsLastMonthArr = (carsData || []).filter(car => {
          if (!car.createdAt) return false;
          const created = new Date(car.createdAt);
          return created.getMonth() === lastMonth.getMonth() && created.getFullYear() === lastMonth.getFullYear();
        });
        setCarsLastMonth(carsLastMonthArr);

        // --- TÍNH KHÁCH HÀNG MỚI THÁNG TRƯỚC ---
        const customerIdsThisMonth = new Set(
          (ordersData || []).filter(order => {
            if (!order.createdAt) return false;
            const d = new Date(order.createdAt);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).map(order => order.customer?.customerId || order.customerId).filter(Boolean)
        );
        const customerIdsLastMonth = new Set(
          (ordersData || []).filter(order => {
            if (!order.createdAt) return false;
            const d = new Date(order.createdAt);
            return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
          }).map(order => order.customer?.customerId || order.customerId).filter(Boolean)
        );
        setCustomersLastMonth(customerIdsLastMonth.size);

        // Calculate car performance stats (CHỈ TÍNH BOOKING ĐÃ PAYOUT)
        const paidOrders = ordersData?.filter(order => {
          if (order.payoutStatus) {
            return order.payoutStatus === 'completed';
          }
          if (order.paymentDetails && Array.isArray(order.paymentDetails)) {
            return order.paymentDetails.some(
              p => p.paymentType === 'payout' && p.paymentStatus === 'paid'
            );
          }
          return false;
        }) || [];

        const carBookingCount = {};
        const carRevenueCount = {};
        paidOrders.forEach(order => {
          const carModel = getCarModel(order);
          if (!carModel) return; // Bỏ qua nếu không xác định được model
          const revenue = order.totalAmount || 0;
          carBookingCount[carModel] = (carBookingCount[carModel] || 0) + 1;
          carRevenueCount[carModel] = (carRevenueCount[carModel] || 0) + revenue;
        });

        const carPerformanceArray = Object.keys(carBookingCount).map(model => ({
          model,
          bookings: carBookingCount[model],
          revenue: carRevenueCount[model],
          avgRevenue: carRevenueCount[model] / carBookingCount[model]
        })).sort((a, b) => b.revenue - a.revenue);

        setCarPerformance(carPerformanceArray);

        // Calculate customer stats: đếm số khách hàng duy nhất đã đặt xe
        const customerIds = new Set(
          (ordersData || []).map(order => order.customer?.userId || order.userId).filter(Boolean)
        );
        setCustomerStats({
          totalCustomers: customerIds.size,
          returningCustomers: 0,
          newCustomers: 0
        });

      } catch (err) {
        console.error('Error fetching supplier report data:', err);
        setError(err.message || 'Không thể tải dữ liệu báo cáo');
        toast.error('Không thể tải dữ liệu báo cáo');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTimeRange]);

  // Đếm tổng số xe đã duyệt
  const totalActiveCars = cars.filter(car => {
    const st = (car.statusName || car.status?.statusName || '').toLowerCase();
    return st !== 'pending' && st !== 'pending_approval';
  }).length;
  const totalActiveCarsLastMonth = carsLastMonth.filter(car => {
    const st = (car.statusName || car.status?.statusName || '').toLowerCase();
    return st !== 'pending' && st !== 'pending_approval';
  }).length;
  const carPercent = getPercentChangeValue(totalActiveCars, totalActiveCarsLastMonth);

  // Tính phần trăm khách hàng mới tháng này so với tháng trước
  const totalCustomers = customerStats?.totalCustomers || 0;
  const customerPercent = getPercentChangeValue(totalCustomers, customersLastMonth);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-64"
      >
        <LoadingSpinner size="large" color="blue" />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-8 text-center"
      >
        <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <FaChartBar className="text-red-500 text-2xl" />
        </div>
        <h3 className="text-lg font-bold text-red-800 mb-2">Lỗi tải dữ liệu</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      </motion.div>
    );
  }

  if (!summary && !monthlyStats) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 text-center"
      >
        <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <FaChartBar className="text-blue-500 text-2xl" />
      </div>
        <h3 className="text-lg font-bold text-blue-800 mb-2">Chưa có dữ liệu báo cáo</h3>
        <p className="text-blue-600 mb-4">Hãy thêm xe và bắt đầu kinh doanh để xem báo cáo chi tiết</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Đăng xe đầu tiên
        </button>
      </motion.div>
    );
  }

  const barData = {
    labels: monthlyStats?.months || [],
    datasets: [
      {
        label: "Doanh thu (VND)",
        data: monthlyStats?.revenueByMonth || [],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1
      }
    ]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Doanh thu theo tháng'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return (value / 1000000).toFixed(1) + 'M VNĐ';
          }
        }
      }
    }
  };

  const revenuePercent = getPercentChange(monthlyStats?.revenueByMonth);
  const bookingPercent = getPercentChange(monthlyStats?.bookingsByMonth);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-5 translate-x-5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-4 rounded-2xl mr-6 backdrop-blur-sm border border-white/20">
                  <FaChartBar className="text-3xl" />
      </div>
              <div>
                  <h1 className="text-4xl font-bold mb-2">Báo cáo & Thống kê</h1>
                  <p className="text-indigo-100 text-lg">Phân tích hiệu quả kinh doanh chi tiết</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="3months" className="text-gray-900">3 tháng</option>
                  <option value="6months" className="text-gray-900">6 tháng</option>
                  <option value="12months" className="text-gray-900">12 tháng</option>
                </select>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 flex items-center transition-all"
                >
                  <FaDownload className="mr-2" />
                  Xuất báo cáo
                </motion.button>
              </div>
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Enhanced Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 p-6 rounded-2xl shadow-lg border border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium">Tổng số xe</p>
                    <p className="text-3xl font-bold">{totalActiveCars}</p>
                    <div className="flex items-center mt-2">
                      <FaArrowUp className="text-green-300 text-sm mr-1" />
                      <span className="text-blue-400 text-xs">{carPercent >= 0 ? `+${carPercent.toFixed(0)}%` : `${carPercent.toFixed(0)}%`} so với tháng trước</span>
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <FaCar className="text-2xl" />
                  </div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-50 to-green-100 text-green-700 p-6 rounded-2xl shadow-lg border border-green-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium">Tổng booking</p>
                    <p className="text-3xl font-bold">{summary?.totalBookings ?? 0}</p>
                    <div className="flex items-center mt-2">
                      <FaArrowUp className="text-green-300 text-sm mr-1" />
                      <span className="text-green-400 text-xs">
                        {bookingPercent >= 0 ? `+${bookingPercent.toFixed(0)}%` : `${bookingPercent.toFixed(0)}%`} so với tháng trước
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <FaClipboardList className="text-2xl" />
                  </div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 p-6 rounded-2xl shadow-lg border border-purple-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-sm font-medium">Tổng doanh thu</p>
                    <p className="text-3xl font-bold">{((summary?.totalRevenue ?? 0) / 1000000).toFixed(1)}M</p>
                    <div className="flex items-center mt-2">
                      <FaArrowUp className="text-green-300 text-sm mr-1" />
                      <span className="text-purple-400 text-xs">
                        {revenuePercent >= 0 ? `+${revenuePercent.toFixed(0)}%` : `${revenuePercent.toFixed(0)}%`} so với tháng trước
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <FaMoneyBillWave className="text-2xl" />
                  </div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 p-6 rounded-2xl shadow-lg border border-orange-200"
              >
                <div className="flex items-center justify-between">
              <div>
                    <p className="text-orange-400 text-sm font-medium">Khách hàng</p>
                    <p className="text-3xl font-bold">{customerStats?.totalCustomers ?? 0}</p>
                    <div className="flex items-center mt-2">
                      <FaArrowUp className="text-green-300 text-sm mr-1" />
                      <span className="text-orange-400 text-xs">{customerPercent >= 0 ? `+${customerPercent.toFixed(0)}%` : `${customerPercent.toFixed(0)}%`} khách hàng mới</span>
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl">
                    <FaUsers className="text-2xl" />
                  </div>
                </div>
              </motion.div>
            </div>
          )}
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Chart */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Doanh thu theo tháng</h3>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FaChartLine className="text-blue-600" />
                </div>
              </div>
              {monthlyStats && monthlyStats.months && monthlyStats.months.length > 0 ? (
                <div className="h-80">
                  <Bar data={barData} options={barOptions} />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaChartBar className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>Chưa có dữ liệu doanh thu</p>
            </div>
              )}
            </motion.div>
            {/* Car Performance Chart */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Hiệu suất xe</h3>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <FaChartPie className="text-purple-600" />
          </div>
              </div>
              {carPerformance.length > 0 ? (
                <div className="h-80 flex items-center justify-center">
                  <Doughnut 
                    data={{
                      labels: carPerformance.slice(0, 5).map(car => car.model),
                      datasets: [{
                        data: carPerformance.slice(0, 5).map(car => car.bookings),
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(249, 115, 22, 0.8)',
                          'rgba(168, 85, 247, 0.8)',
                          'rgba(236, 72, 153, 0.8)'
                        ],
                        borderWidth: 0
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaCar className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>Chưa có dữ liệu hiệu suất xe</p>
            </div>
              )}
            </motion.div>
          </div>
          {/* Top Performing Cars */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Top xe có hiệu suất cao</h3>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <FaFire className="text-yellow-600" />
              </div>
            </div>
            
            {carPerformance.length > 0 ? (
              <div className="space-y-4">
                {carPerformance.slice(0, 5).map((car, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-xl mr-4">
                        <FaCar className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{car.model}</h4>
                        <p className="text-gray-600 text-sm">{car.bookings} lượt đặt</p>
          </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{(car.revenue / 1000000).toFixed(1)}M VNĐ</p>
                      <p className="text-gray-500 text-sm">Doanh thu</p>
                    </div>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-500 mr-1" />
                      <span className="text-yellow-700 font-bold">#{index + 1}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaCar className="text-4xl mx-auto mb-4 opacity-50" />
                <p>Chưa có dữ liệu hiệu suất xe</p>
        </div>
      )}
          </motion.div>

          {/* Recent Bookings Table */}
          {orders && orders.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Đơn đặt xe gần đây</h3>
                <div className="bg-green-100 p-2 rounded-lg">
                  <FaClipboardList className="text-green-600" />
          </div>
        </div>
          <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-gray-600 font-medium">Xe</th>
                      <th className="py-3 px-4 text-left text-gray-600 font-medium">Khách hàng</th>
                      <th className="py-3 px-4 text-left text-gray-600 font-medium">Thời gian</th>
                      <th className="py-3 px-4 text-left text-gray-600 font-medium">Trạng thái</th>
                      <th className="py-3 px-4 text-left text-gray-600 font-medium">Tổng tiền</th>
                </tr>
              </thead>
              <tbody>
                    {orders.slice(0, 10).map((order, index) => (
                      <motion.tr 
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0 + index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">{order.car?.model || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">{order.customer?.userDetail?.fullName || order.customer?.name || order.customerName || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">
                            {order.pickupDateTime
                              ? new Date(order.pickupDateTime).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : order.startDate
                                ? new Date(order.startDate).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : 'N/A'}
                          </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm border-2 text-center min-w-[100px] transition-all
                        ${getStatusColor(order.status?.statusName || order.statusName || '')}
                      `}>
                        {getStatusLabel(order.status?.statusName || order.statusName || '')}
                      </span>
                    </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-green-600">
                            {(order.totalAmount || order.totalFare || 0).toLocaleString('vi-VN')} VNĐ
                          </div>
                    </td>
                      </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
            </motion.div>
          )}
          </div>
        </div>
    </div>
  );
};

export default SupplierReport;
