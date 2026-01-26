
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  FaDollarSign,
  FaCar,
  FaChartLine,
  FaUsers,
  FaClock,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { getReportsData } from "@/services/api.js";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function Home() {
  const [reports, setReports] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    popularCar: "",
    popularCarDetail: null,
    suppliersRevenue: [],
  });
  const [supplierBarData, setSupplierBarData] = useState({
    labels: [],
    datasets: [
      {
        label: "Doanh thu (VND)",
        data: [],
        backgroundColor: [
          "#6366f1", "#3b82f6", "#06b6d4", "#10b981", "#f59e42", "#f43f5e", "#a21caf", "#fbbf24", "#84cc16", "#eab308"
        ],
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        hoverBackgroundColor: "#2563eb",
        barThickness: 24,
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await getReportsData();
        const {
          totalRevenue,
          totalBookings,
          popularCar,
          popularCarDetail,
          suppliersRevenue
        } = response;

        setReports({
          totalRevenue,
          totalBookings,
          popularCar: popularCar?.model || "N/A",
          popularCarDetail,
          suppliersRevenue: suppliersRevenue.sort((a, b) => b.revenue - a.revenue),
        });

        setSupplierBarData({
          labels: suppliersRevenue.map((s) => s.supplierName),
          datasets: [
            {
              label: "Doanh thu (VND)",
              data: suppliersRevenue.map((s) => s.revenue),
              backgroundColor: [
                "#6366f1", "#3b82f6", "#06b6d4", "#10b981", "#f59e42", "#f43f5e", "#a21caf", "#fbbf24", "#84cc16", "#eab308"
              ],
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: "#e5e7eb",
              hoverBackgroundColor: "#2563eb",
              barThickness: 24,
            },
          ],
        });
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.");
        console.error("Lỗi khi lấy báo cáo:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const barChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.x !== null) {
              label += context.parsed.x.toLocaleString() + ' VND';
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: '#64748b', callback: value => value.toLocaleString() },
        grid: { color: '#e5e7eb' },
        title: { display: true, text: 'Doanh thu (VND)', color: '#334155', font: { weight: 'bold' } },
      },
      y: {
        ticks: { color: '#64748b', font: { weight: 'bold' } },
        grid: { color: '#e5e7eb' },
      },
    },
  };

  if (loading) return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <span className="text-xl text-gray-600 font-medium">Đang tải báo cáo...</span>
      </div>
  );
  if (error) return <div className="text-center text-red-600 font-medium py-8">{error}</div>;

  return (
      <motion.div
          className="min-h-screen p-6 bg-gradient-to-br from-slate-100 to-blue-50"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
      >
        <motion.div className="mb-8 text-center">
          <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl text-white border-2 border-blue-300/40">
            <div className="p-3 bg-white bg-opacity-20 rounded-2xl shadow-md">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-4xl font-extrabold mb-1 drop-shadow-lg">Trang tổng quan & báo cáo hệ thống</h2>
              <p className="text-blue-100 text-lg font-medium">Phân tích doanh thu, lượt đặt và hoạt động nổi bật</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8" variants={containerVariants}>
          <motion.div
              className="flex flex-col gap-8 lg:col-span-1"
              variants={cardVariants}
          >
            <div className="bg-gradient-to-tr from-gray-100 to-indigo-200 rounded-3xl shadow-xl p-8 flex items-center gap-6 border-2 border-indigo-200/60 transition-transform duration-200 hover:scale-[1.025] hover:shadow-2xl"
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-800 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-indigo-900 mb-1">Tổng Doanh thu</h3>
                <p className="text-3xl font-extrabold text-indigo-800 mb-1 drop-shadow">{reports.totalRevenue.toLocaleString()} VND</p>
                <p className="text-indigo-600 text-sm font-medium">Tổng doanh thu hệ thống</p>
              </div>
            </div>
            <div className="bg-gradient-to-tr from-gray-100 to-indigo-200 rounded-3xl shadow-xl p-8 flex items-center gap-6 border-2 border-indigo-200/60 transition-transform duration-200 hover:scale-[1.025] hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-800 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-indigo-900 mb-1">Tổng Lượt Đặt</h3>
                <p className="text-3xl font-extrabold text-indigo-800 mb-1 drop-shadow">{reports.totalBookings}</p>
                <p className="text-indigo-600 text-sm font-medium">Tổng số lượt đặt xe</p>
              </div>
            </div>
          </motion.div>
          <motion.div className="lg:col-span-2 flex flex-col justify-between" variants={containerVariants}>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-3xl shadow-xl p-8 flex flex-col border-2 border-cyan-200/60 transition-transform duration-200 hover:scale-[1.02] hover:shadow-2xl h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-cyan-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-extrabold text-cyan-900 drop-shadow">Doanh thu của Nhà cung cấp</h3>
              </div>
              <div className="flex-1 min-h-[320px]">
                <Bar data={supplierBarData} options={barChartOptions} height={320} />
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8" variants={containerVariants}>
          <motion.div
              className="bg-gradient-to-br from-purple-50 to-blue-100 rounded-3xl shadow-xl p-8 flex flex-row items-center justify-between gap-8 border-2 border-purple-200/60 transition-transform duration-200 hover:scale-[1.02] hover:shadow-2xl"
              variants={cardVariants}
          >
            <div className="flex-1 flex flex-col justify-center h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13l2-5.5A2 2 0 017 6h10a2 2 0 011.9 1.5L21 13M5 13h14M5 13l-1.34 4.02A1 1 0 005 18h14a1 1 0 00.95-1.32L19 13M7 18a2 2 0 11-4 0 2 2 0 014 0zm14 0a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-extrabold text-purple-700 drop-shadow">Xe phổ biến nhất</span>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-800 mb-2 drop-shadow">{reports.popularCarDetail?.carModel || reports.popularCar}</h3>
              {reports.popularCarDetail ? (
                  <>
                    <div className="text-gray-700 mb-2">
                      <span className="font-medium">Biển số:</span> {reports.popularCarDetail.licensePlate}
                    </div>
                    <div className="text-gray-700 mb-2">
                      <span className="font-medium">Chủ xe:</span> {reports.popularCarDetail.supplierName}
                    </div>
                    <div className="text-gray-700 mb-2">
                      <span className="font-medium">Số lượt đặt:</span> {reports.popularCarDetail.bookingCount}
                    </div>
                    <div className="text-gray-700 mb-4">
                      <span className="font-medium">Doanh thu:</span> {reports.popularCarDetail.totalRevenue?.toLocaleString()} VND
                    </div>
                  </>
              ) : (
                  <p className="text-gray-400 mb-2">Không có dữ liệu xe phổ biến</p>
              )}
            </div>
            <div className="flex-shrink-0 w-72 h-72 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 shadow-lg border border-blue-200">
              {reports.popularCarDetail && (
                  <img
                      src={reports.popularCarDetail.imageUrl || '/images/default-car.jpg'}
                      alt={reports.popularCarDetail.carModel}
                      className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
                      onError={e => { e.target.src = '/images/default-car.jpg'; }}
                  />
              )}
            </div>
          </motion.div>
          <motion.div
              className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl shadow-xl p-8 flex flex-col border-2 border-green-100/60 transition-transform duration-200 hover:scale-[1.02] hover:shadow-2xl"
              variants={cardVariants}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-tr from-green-600 to-green-400 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-green-700 drop-shadow">Top 3 người dùng doanh thu cao nhất</h3>
            </div>
            <ul className="divide-y divide-green-100">
              {reports.suppliersRevenue.slice(0, 3).map((user, idx) => (
                  <li key={user.supplierName} className="flex items-center gap-4 py-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-md ${idx === 0 ? 'bg-yellow-300 text-yellow-900' : idx === 1 ? 'bg-gray-300 text-gray-700' : 'bg-orange-300 text-orange-900'}`}>
                      {user.supplierName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-800">{user.supplierName}</div>
                      <div className="text-green-700 font-semibold">{user.revenue.toLocaleString()} VND</div>
                    </div>
                    <div className="text-2xl font-extrabold text-green-500">#{idx + 1}</div>
                  </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </motion.div>
  );
}

export default Home;

