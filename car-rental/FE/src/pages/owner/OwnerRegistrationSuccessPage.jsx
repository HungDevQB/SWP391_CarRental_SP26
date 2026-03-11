import { Link } from "react-router-dom";
import { FaCheckCircle, FaClock, FaPhone, FaEnvelope, FaHome, FaUser, FaGift, FaHeadset } from "react-icons/fa";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import { useState } from "react";
import { getItem } from '@/utils/auth';
import { motion } from "framer-motion";

const OwnerRegistrationSuccessPage = () => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    window.location.href = "/";
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 overflow-x-hidden">
      {/* Shape background */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-green-300 to-blue-200 rounded-full opacity-30 blur-2xl z-0"></div>
      <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 blur-2xl z-0"></div>
      <Header
        isUserDropdownOpen={isUserDropdownOpen}
        setIsUserDropdownOpen={setIsUserDropdownOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative mb-12 flex flex-col items-center justify-center">
            <div className="w-36 h-36 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse border-8 border-white/60 relative z-10">
              <FaCheckCircle className="text-7xl text-white drop-shadow-xl" />
            </div>
            <div className="absolute inset-0 w-36 h-36 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mx-auto animate-ping opacity-20"></div>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-8 drop-shadow-2xl tracking-wide">Đăng ký thành công!</h1>
          <p className="text-2xl text-gray-500 mb-14 leading-relaxed max-w-2xl mx-auto">Cảm ơn bạn đã đăng ký trở thành <span className="font-bold text-emerald-600">đối tác</span> của chúng tôi. Chúng tôi sẽ xem xét hồ sơ và liên hệ với bạn sớm nhất.</p>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <motion.div whileHover={{ scale: 1.06 }} className="bg-white/80 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border-2 border-blue-100/40 hover:shadow-emerald-200 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
                <FaClock className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Thời gian xử lý</h3>
              <p className="text-gray-600">24-48 giờ làm việc</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.06 }} className="bg-white/80 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border-2 border-green-100/40 hover:shadow-emerald-200 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
                <FaHeadset className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Hỗ trợ 24/7</h3>
              <p className="text-gray-600">Luôn sẵn sàng hỗ trợ bạn</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.06 }} className="bg-white/80 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border-2 border-pink-100/40 hover:shadow-emerald-200 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
                <FaGift className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Ưu đãi đặc biệt</h3>
              <p className="text-gray-600">Miễn phí tháng đầu</p>
            </motion.div>
          </div>

          {/* Stepper next steps */}
          <motion.div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-12 shadow-2xl border-2 border-blue-200/40 mb-14"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-10">Các bước tiếp theo</h2>
            <div className="flex flex-col md:flex-row gap-12 justify-center">
              <div className="flex-1 space-y-8">
                <motion.div className="flex items-start gap-6 group" whileHover={{ scale: 1.03 }}>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">1</div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg mb-2">Xem xét hồ sơ</h4>
                    <p className="text-gray-600">Chúng tôi sẽ kiểm tra và xác thực thông tin bạn đã cung cấp</p>
                  </div>
                </motion.div>
                <motion.div className="flex items-start gap-6 group" whileHover={{ scale: 1.03 }}>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">2</div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg mb-2">Liên hệ xác nhận</h4>
                    <p className="text-gray-600">Nhân viên sẽ gọi điện xác nhận và hướng dẫn các bước tiếp theo</p>
                  </div>
                </motion.div>
              </div>
              <div className="flex-1 space-y-8">
                <motion.div className="flex items-start gap-6 group" whileHover={{ scale: 1.03 }}>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">3</div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg mb-2">Kích hoạt tài khoản</h4>
                    <p className="text-gray-600">Tài khoản đối tác sẽ được kích hoạt sau khi hoàn tất xác thực</p>
                  </div>
                </motion.div>
                <motion.div className="flex items-start gap-6 group" whileHover={{ scale: 1.03 }}>
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">4</div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg mb-2">Bắt đầu kiếm tiền</h4>
                    <p className="text-gray-600">Đăng xe và bắt đầu nhận đơn đặt thuê từ khách hàng</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Contact card */}
          <motion.div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-10 border-2 border-blue-200/60 mb-14 shadow-2xl flex flex-col md:flex-row items-center justify-center gap-10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="flex-1 flex items-center justify-center gap-6">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg"><FaPhone /></div>
              <div className="text-left">
                <div className="font-bold text-gray-800 text-lg">Hotline</div>
                <div className="text-blue-600 font-semibold text-xl">1900 1234</div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center gap-6">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg"><FaEnvelope /></div>
              <div className="text-left">
                <div className="font-bold text-gray-800 text-lg">Email</div>
                <div className="text-green-600 font-semibold text-xl">support@carental.com</div>
              </div>
            </div>
          </motion.div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-5 px-12 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-emerald-200 flex items-center justify-center"><FaHome className="mr-3 text-2xl" />Về trang chủ</Link>
            <Link to="/profile" className="border-2 border-blue-600 text-blue-600 py-5 px-12 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-emerald-200"><FaUser className="mr-3 text-2xl" />Xem hồ sơ</Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default OwnerRegistrationSuccessPage; 