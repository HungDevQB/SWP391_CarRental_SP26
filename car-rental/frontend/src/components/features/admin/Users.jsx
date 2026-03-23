import { useState, useEffect } from "react";
import api, { toggleUserStatus } from "../../../services/api.js";
import {
  FaUsers,
  FaFilter,
  FaSearch,
  FaBan,
  FaCheck,
  FaEye,
  FaUser,
  FaUserTie,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaTimes
} from "react-icons/fa";

const ITEMS_PER_PAGE = 10;

function Users() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [blockReason, setBlockReason] = useState("");

  // Lấy danh sách người dùng từ API (liên quan đến getUsers của hoàng)
  useEffect(() => {
    const fetchUsers = async () => {
      console.log("=== BẮT ĐẦU FETCH USERS ===");
      console.log("Current page:", currentPage);
      console.log("Filter role:", filterRole);
      console.log("Filter status:", filterStatus);
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: currentPage,
          size: ITEMS_PER_PAGE,
          ...(filterRole !== "all" && { role: filterRole }),
          ...(filterStatus !== "all" && { status: filterStatus }),
        });
        console.log("API URL:", `/api/users?${params.toString()}`);
        console.log("Request params:", Object.fromEntries(params));

        const response = await api.get(`/api/users?${params.toString()}`);
        console.log("Response status:", response.status);
        console.log("Response data:", response.data);
        setUsers(response.data.content);
        setTotalPages(response.data.totalPages);
        console.log("Users loaded:", response.data.content.length);
        console.log("Total pages:", response.data.totalPages);
        console.log("=== KẾT THÚC FETCH USERS - THÀNH CÔNG ===");
      } catch (error) {
        console.error("=== LỖI TRONG FETCH USERS ===");
        console.error("Error:", error);
        console.error("Error response:", error.response);
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);
        setError(error.response?.data?.message || "Lỗi khi tải danh sách người dùng");
        console.log("=== KẾT THÚC LỖI FETCH USERS ===");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, filterRole, filterStatus]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleBlockUser = (user) => {
    console.log("=== BẮT ĐẦU HANDLE BLOCK USER ===");
    console.log("User to block:", user);
    setSelectedUser(user);
    setBlockReason(""); // Reset lý do khi mở modal
    setShowModal(true);
    console.log("Modal opened for user:", user.username);
    console.log("=== KẾT THÚC HANDLE BLOCK USER ===");
  };

  const confirmBlock = async () => {
    console.log("=== BẮT ĐẦU CONFIRM BLOCK ===");
    console.log("Selected user:", selectedUser);
    console.log("Block reason:", blockReason);
    try {
      setError(null);
      console.log("Toggling user:", selectedUser.userId);

      // Gọi API toggleUserStatus với lý do (chỉ khi chặn)
      const reason = selectedUser.statusName === "active" ? blockReason : null;
      console.log("Calling toggleUserStatus with reason:", reason);

      const response = await toggleUserStatus(selectedUser.userId, reason);
      console.log("API response:", response);

      // Cập nhật trạng thái người dùng trong danh sách
      setUsers(prevUsers =>
          prevUsers.map(user =>
              user.userId === selectedUser.userId
                  ? { ...user, statusName: response.statusName }
                  : user
          )
      );

      console.log("Updated users list successfully");
      setShowModal(false);
      setSelectedUser(null);
      setBlockReason("");
      console.log("=== KẾT THÚC CONFIRM BLOCK - THÀNH CÔNG ===");
    } catch (error) {
      console.error("=== LỖI TRONG CONFIRM BLOCK ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      setError(error.message);
      console.log("=== KẾT THÚC LỖI CONFIRM BLOCK ===");
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-slate-100 to-blue-50">
        <div className="mb-8 text-center" variants={cardVariants}>
          <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl text-white">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              <FaUsers className="text-3xl" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">Quản lý Người dùng</h2>
              <p className="text-blue-100 text-lg">Theo dõi và quản lý tất cả người dùng trong hệ thống</p>
            </div>
          </div>
        </div>

        {error && (
            <div
                className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 flex items-center gap-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
              <FaTimes className="text-red-500" />
              {error}
            </div>
        )}

        <div
            className="bg-white rounded-2xl p-4 shadow mb-8 flex flex-col md:flex-row md:items-center md:gap-6 gap-4"
            variants={cardVariants}
        >
          <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2 md:mb-0">
            <FaFilter className="text-lg" />
            <span>Bộ lọc</span>
          </div>
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vai trò</label>
              <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full md:w-40 px-3 py-2 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="customer">Khách hàng</option>
                <option value="supplier">Chủ xe</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái</label>
              <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full md:w-40 px-3 py-2 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="blocked">Bị chặn</option>
              </select>
            </div>
          </div>
        </div>

        <div
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
            variants={cardVariants}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <FaUsers className="text-2xl" />
              Danh sách người dùng
            </h3>
          </div>
          <div className="w-full">
            <table className="w-full">
              <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                <th className="py-4 px-6 text-left font-bold text-gray-700">ID</th>
                <th className="py-4 px-6 text-left font-bold text-gray-700">Tên đăng nhập</th>
                <th className="py-4 px-6 text-left font-bold text-gray-700">Vai trò</th>
                <th className="py-4 px-6 text-left font-bold text-gray-700">Email</th>
                <th className="py-4 px-6 text-left font-bold text-gray-700">Trạng thái</th>
                <th className="py-4 px-6 text-center font-bold text-gray-700">Hành động</th>
              </tr>
              </thead>
              <tbody>
              {isLoading ? (
                  Array.from({length: ITEMS_PER_PAGE}).map((_, index) => (
                      <tr
                          key={index}
                          className="border-b border-gray-100"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                      >
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      </tr>
                  ))
              ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Không có người dùng nào
                    </td>
                  </tr>
              ) : (
                  users.map((user, index) => (
                      <tr
                          key={user.userId}
                          className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 5 }}
                      >
                        <td className="py-4 px-6 font-mono text-gray-700">{user.userId}</td>
                        <td className="py-4 px-6 font-semibold text-gray-800">{user.username}</td>
                        <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        user.roleName === "supplier"
                            ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200"
                            : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
                    }`}>
                      {user.roleName === "supplier" ? <FaUserTie className="mr-1" /> : <FaUser className="mr-1" />}
                      {user.roleName === "customer" ? "Khách hàng" : "Chủ xe"}
                    </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700">{user.email}</td>
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Trạng thái:</span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                                  user.statusName === "active"
                                      ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                                      : "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200"
                              }`}>
                        {user.statusName === "active" ? <FaCheck className="mr-1" /> : <FaBan className="mr-1" />}
                                {user.statusName === "active" ? "Hoạt động" : "Bị chặn"}
                          </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Đăng nhập:</span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                                  user.online
                                      ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
                                      : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200"
                              }`}>
                            <div className={`w-2 h-2 rounded-full mr-1 ${user.online ? "bg-green-500" : "bg-gray-400"}`}></div>
                                {user.online ? "Online" : "Offline"}
                          </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                              className={`inline-flex items-center px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                                  user.statusName === "active"
                                      ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl"
                                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl"
                              }`}
                              onClick={() => handleBlockUser(user)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                          >
                            {user.statusName === "active" ? <FaBan className="mr-1" /> : <FaCheck className="mr-1" />}
                            {user.statusName === "active" ? "Chặn" : "Mở chặn"}
                          </button>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Trang {currentPage} của {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                  <FaChevronLeft />
                  Trước
                </button>
                {Array.from({length: totalPages}, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg font-medium ${
                            currentPage === page
                                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                      {page}
                    </button>
                ))}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                  Sau
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal xác nhận */}
        {showModal && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
              <div
                  className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaBan className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedUser?.statusName === "active" ? "Chặn người dùng" : "Mở chặn người dùng"}
                  </h3>
                  <p className="text-gray-600">
                    {selectedUser?.statusName === "active"
                        ? "Bạn có chắc chắn muốn chặn người dùng này?"
                        : "Bạn có chắc chắn muốn mở chặn người dùng này?"
                    }
                  </p>
                </div>

                {selectedUser?.statusName === "active" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lý do chặn:</label>
                      <textarea
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          rows={3}
                          placeholder="Nhập lý do chặn người dùng..."
                      />
                    </div>
                )}

                <div className="flex gap-4">
                  <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                  >
                    Hủy
                  </button>
                  <button
                      onClick={confirmBlock}
                      className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${
                          selectedUser?.statusName === "active"
                              ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                              : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

export default Users;