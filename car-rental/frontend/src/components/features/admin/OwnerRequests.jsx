import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaFileAlt,
  FaSpinner,
  FaEye,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaDownload,
  FaExternalLinkAlt,
  FaShieldAlt,
  FaHandshake,
  FaBan,
  FaCheckDouble,
  FaExclamationTriangle,
  FaClipboardList,
  FaUsers,
  FaBuilding
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const OwnerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/registration-requests`);
      setRequests(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/registration-requests/${id}/approve`);
      toast.success("Đã duyệt yêu cầu!");
      fetchRequests();
      setSelected(null);
    } catch (err) {
      // Hiển thị lỗi chi tiết từ backend nếu có
      const msg = err?.response?.data || err?.message || "Lỗi khi duyệt yêu cầu";
      toast.error(typeof msg === "string" ? msg : (msg.error || "Lỗi khi duyệt yêu cầu"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/registration-requests/${id}/reject`);
      toast.success("Đã từ chối yêu cầu!");
      fetchRequests();
      setSelected(null);
    } catch {
      toast.error("Lỗi khi từ chối yêu cầu");
    } finally {
      setActionLoading(false);
    }
  };

  const renderFileLink = (filePath, label) => {
    if (!filePath) return null;
    const url = `${BASE_URL}/${filePath}`;
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(filePath);
    const isPdf = /\.pdf$/i.test(filePath);
    console.log('renderFileLink:', { label, filePath, url, isImage, isPdf });
    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              console.log('setPreviewFile:', { url, label, type: isImage ? 'image' : isPdf ? 'pdf' : 'other' });
              setPreviewFile({ url, label, type: isImage ? 'image' : isPdf ? 'pdf' : 'other' });
            }}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <FaFileAlt className="text-white text-lg" />
          </div>
          <span className="text-sm font-semibold text-gray-700">{label}</span>
        </motion.button>
    );
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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
      <motion.div
          className="p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
      >
        {/* Header Section */}
        <motion.div
            className="mb-8 text-center"
            variants={itemVariants}
        >
          <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl text-white">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              <FaUsers className="text-3xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Yêu cầu đăng ký chủ xe</h1>
              <p className="text-blue-100 text-lg">Quản lý và duyệt các yêu cầu đăng ký từ chủ xe</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            variants={itemVariants}
        >
          <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                <FaClock className="text-white text-xl" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Chờ duyệt</p>
                <p className="text-2xl font-bold text-gray-800">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
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
                <FaCheckDouble className="text-white text-xl" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Đã duyệt</p>
                <p className="text-2xl font-bold text-gray-800">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
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
                <FaBan className="text-white text-xl" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Đã từ chối</p>
                <p className="text-2xl font-bold text-gray-800">
                  {requests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {loading ? (
            <motion.div
                className="flex items-center justify-center gap-4 py-16"
                variants={itemVariants}
            >
              <div className="relative">
                <FaSpinner className="animate-spin text-4xl text-blue-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-700">Đang tải danh sách yêu cầu...</p>
                <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
              </div>
            </motion.div>
        ) : requests.length === 0 ? (
            <motion.div
                className="text-center py-16"
                variants={itemVariants}
            >
              <motion.div
                  className="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <FaClipboardList className="text-5xl text-gray-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">Chưa có yêu cầu đăng ký</h3>
              <p className="text-gray-600 text-lg">Hiện tại chưa có yêu cầu đăng ký chủ xe nào.</p>
            </motion.div>
        ) : (
            <motion.div
                className="overflow-hidden rounded-2xl shadow-2xl bg-white"
                variants={itemVariants}
            >
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FaClipboardList className="text-2xl" />
                  Danh sách yêu cầu đăng ký
                </h2>
              </div>
              <div className="w-full">
                <table className="w-full">
                  <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <th className="py-4 px-6 text-left font-bold text-gray-700">
                      <span className="flex items-center gap-2"><FaUserTie className="text-blue-600" />Họ tên</span>
                    </th>
                    <th className="py-4 px-6 text-left font-bold text-gray-700">
                      <span className="flex items-center gap-2"><FaEnvelope className="text-blue-600" />Email</span>
                    </th>
                    <th className="py-4 px-6 text-left font-bold text-gray-700">
                      <span className="flex items-center gap-2"><FaPhone className="text-blue-600" />Số điện thoại</span>
                    </th>
                    <th className="py-4 px-6 text-left font-bold text-gray-700">
                      <span className="flex items-center gap-2"><FaShieldAlt className="text-blue-600" />Trạng thái</span>
                    </th>
                    <th className="py-4 px-6 text-left font-bold text-gray-700">
                      <span className="flex items-center gap-2"><FaCalendarAlt className="text-blue-600" />Ngày tạo</span>
                    </th>
                    <th className="py-4 px-6 text-center font-bold text-gray-700">Hành động</th>
                  </tr>
                  </thead>
                  <tbody>
                  {requests.map((req, index) => (
                      <motion.tr
                          key={req.id}
                          className="border-b hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
                          variants={itemVariants}
                          whileHover={{ x: 5 }}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                              {req.fullName?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-800">{req.fullName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-700">{req.email}</td>
                        <td className="py-4 px-6 text-gray-700 font-mono">{req.phoneNumber}</td>
                        <td className="py-4 px-6">
                          {req.status === 'pending' && (
                              <motion.span
                                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200"
                                  animate={{ scale: [1, 1.05, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                              >
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                                Chờ duyệt
                              </motion.span>
                          )}
                          {req.status === 'approved' && (
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                          <FaCheckCircle className="mr-2" />
                          Đã duyệt
                        </span>
                          )}
                          {req.status === 'rejected' && (
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200">
                          <FaTimesCircle className="mr-2" />
                          Từ chối
                        </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-sm">
                          {req.createdAt ? new Date(req.createdAt).toLocaleString('vi-VN') : ''}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <motion.button
                              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl"
                              onClick={() => setSelected(req)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                          >
                            <FaEye className="mr-2" />
                            Xem chi tiết
                          </motion.button>
                        </td>
                      </motion.tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
        )}

        {/* Modal chi tiết */}
        <AnimatePresence>
          {selected && (
              <motion.div
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
              >
                <motion.div
                    className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-3xl relative max-h-[90vh] overflow-y-auto"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                  <motion.button
                      className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setSelected(null)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                  >
                    &times;
                  </motion.button>

                  <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Chi tiết yêu cầu
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <motion.div
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200"
                        whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FaUserTie className="text-blue-600 text-lg" />
                        <div className="font-semibold text-gray-700">Họ tên:</div>
                      </div>
                      <div className="text-gray-900 font-medium text-lg">{selected.fullName}</div>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200"
                        whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FaEnvelope className="text-green-600 text-lg" />
                        <div className="font-semibold text-gray-700">Email:</div>
                      </div>
                      <div className="text-gray-900 font-medium text-lg">{selected.email}</div>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200"
                        whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FaPhone className="text-purple-600 text-lg" />
                        <div className="font-semibold text-gray-700">Số điện thoại:</div>
                      </div>
                      <div className="text-gray-900 font-medium text-lg">{selected.phoneNumber}</div>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200"
                        whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FaIdCard className="text-orange-600 text-lg" />
                        <div className="font-semibold text-gray-700">Số CMND/CCCD:</div>
                      </div>
                      <div className="text-gray-900 font-medium text-lg">{selected.idNumber}</div>
                    </motion.div>

                    <motion.div
                        className="md:col-span-2 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-200"
                        whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FaMapMarkerAlt className="text-indigo-600 text-lg" />
                        <div className="font-semibold text-gray-700">Địa chỉ:</div>
                      </div>
                      <div className="text-gray-900 font-medium text-lg">{selected.address}</div>
                    </motion.div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FaFileAlt className="text-2xl text-blue-600" />
                      <div className="font-bold text-xl text-gray-800">Giấy tờ đã upload:</div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {renderFileLink(selected.carDocuments, "Giấy tờ xe")}
                      {renderFileLink(selected.businessLicense, "Giấy phép KD")}
                      {renderFileLink(selected.driverLicense, "Bằng lái xe")}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    {selected.status === 'pending' && (
                        <>
                          <motion.button
                              onClick={() => handleApprove(selected.id)}
                              disabled={actionLoading}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 disabled:opacity-60 shadow-lg hover:shadow-xl transition-all duration-300"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                          >
                            {actionLoading ? <FaSpinner className="animate-spin" /> : <FaHandshake />}
                            Duyệt yêu cầu
                          </motion.button>
                          <motion.button
                              onClick={() => handleReject(selected.id)}
                              disabled={actionLoading}
                              className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 disabled:opacity-60 shadow-lg hover:shadow-xl transition-all duration-300"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                          >
                            {actionLoading ? <FaSpinner className="animate-spin" /> : <FaBan />}
                            Từ chối yêu cầu
                          </motion.button>
                        </>
                    )}
                    {selected.status === 'approved' && (
                        <motion.span
                            className="flex-1 text-green-700 font-bold flex items-center gap-3 justify-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-200"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                          <FaCheckDouble className="text-2xl" />
                          Đã duyệt thành công
                        </motion.span>
                    )}
                    {selected.status === 'rejected' && (
                        <motion.span
                            className="flex-1 text-red-700 font-bold flex items-center gap-3 justify-center p-4 bg-gradient-to-r from-red-100 to-pink-100 rounded-xl border border-red-200"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                          <FaExclamationTriangle className="text-2xl" />
                          Đã từ chối yêu cầu
                        </motion.span>
                    )}
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* File Preview Modal */}
        <AnimatePresence>
          {previewFile && (
              <motion.div
                  className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
              >
                <motion.div
                    className="bg-white rounded-3xl shadow-2xl p-6 max-w-5xl w-full relative flex flex-col items-center max-h-[90vh] overflow-y-auto"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                  <motion.button
                      className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setPreviewFile(null)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                  >
                    &times;
                  </motion.button>

                  <div className="mb-6 text-center">
                    <div className="inline-flex items-center gap-3 p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl mb-3">
                      <FaFileAlt className="text-2xl text-blue-600" />
                      <span className="font-bold text-lg text-gray-800">{previewFile.label}</span>
                    </div>
                  </div>

                  {previewFile.type === 'image' && (
                      <motion.div
                          className="w-full flex justify-center"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                      >
                        <img
                            src={previewFile.url}
                            alt={previewFile.label}
                            className="max-h-[60vh] max-w-full rounded-2xl border shadow-2xl"
                            onError={(e) => {
                              console.error('Image load error:', previewFile.url);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <div className="hidden text-center p-8">
                          <FaFileAlt className="text-6xl text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Không thể hiển thị hình ảnh</p>
                          <a
                              href={previewFile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium"
                          >
                            Tải về để xem
                          </a>
                        </div>
                      </motion.div>
                  )}

                  {previewFile.type === 'pdf' && (
                      <motion.div
                          className="w-full"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                      >
                        <iframe
                            src={previewFile.url}
                            title={previewFile.label}
                            className="w-full border rounded-2xl shadow-2xl"
                            style={{ height: '60vh' }}
                            onError={() => {
                              console.error('PDF load error:', previewFile.url);
                            }}
                        />
                      </motion.div>
                  )}

                  {previewFile.type === 'other' && (
                      <motion.div
                          className="text-center p-8"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                      >
                        <FaFileAlt className="text-6xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4 text-lg">File không thể hiển thị trực tiếp</p>
                        <a
                            href={previewFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium text-lg"
                        >
                          Tải về để xem
                        </a>
                      </motion.div>
                  )}

                  <motion.div
                      className="mt-6 flex gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                  >
                    <motion.a
                        href={previewFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                      <FaExternalLinkAlt />
                      Mở trong tab mới
                    </motion.a>
                    <motion.a
                        href={previewFile.url}
                        download
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                      <FaDownload />
                      Tải về
                    </motion.a>
                  </motion.div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
  );
};

export default OwnerRequests; 