import React from "react";
import {
  FaHome, FaPlus, FaCar, FaClipboardList, FaChartBar, FaUser, FaComments, FaSignOutAlt,
  FaFileContract, FaIdCard
} from "react-icons/fa";

const menuItems = [
  { key: "dashboard", label: "Tổng quan", icon: <FaHome /> },
  { key: "add-car", label: "Đăng tin cho thuê xe", icon: <FaPlus /> },
  { key: "car-status", label: "Quản lý xe", icon: <FaCar /> },
  { key: "orders", label: "Quản lý đơn đặt xe", icon: <FaClipboardList /> },
  { key: "contracts", label: "Hợp đồng thuê xe", icon: <FaFileContract /> },
  { key: "license-verify", label: "Xác minh bằng lái", icon: <FaIdCard /> },
  { key: "report", label: "Báo cáo & thống kê", icon: <FaChartBar /> },
  { key: "profile", label: "Hồ sơ cá nhân", icon: <FaUser /> },
  { key: "chat", label: "Chat/hỗ trợ khách hàng", icon: <FaComments /> },
  { key: "driver", label: "Quản lý tài xế", icon: <FaCar /> },
];

const SupplierSidebar = ({ user, selected, setSelected, onLogout }) => {
  return (
    <aside className="fixed top-0 left-0 z-30 w-64 h-screen bg-white shadow-2xl border-r border-gray-100 flex flex-col rounded-tr-3xl rounded-br-3xl">
      {/* Logo + Avatar */}
      <div className="flex items-center gap-3 px-6 py-8 border-b border-gray-100">
        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
          <FaCar className="text-white text-2xl" />
        </div>
        <div>
          <div className="font-bold text-lg text-gray-800">Supplier</div>
          <div className="text-sm text-gray-500 truncate max-w-[120px]">{user?.username || "Chủ xe"}</div>
        </div>
      </div>
      {/* Menu */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <ul className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <li key={item.key}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-left
                  ${selected === item.key
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-[1.03]"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"}
                `}
                onClick={() => setSelected(item.key)}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* Logout */}
      <div className="mt-auto flex flex-col gap-2 p-4">
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <span className="text-lg"><FaSignOutAlt /></span>
          <span>Đăng xuất</span>
        </button>
        <div className="text-center text-gray-400 text-xs mt-2">
          © {new Date().getFullYear()} Car Rental
        </div>
      </div>
    </aside>
  );
};

export default SupplierSidebar; 