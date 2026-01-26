import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { motion } from "framer-motion";
import {
    FaHome,
    FaUsers,
    FaChartBar,
    FaBars,
    FaTimes,
    FaClipboardList,
    FaSignOutAlt,
    FaMoneyCheckAlt,
    FaCar
} from "react-icons/fa";
import { useAuth } from "../../../hooks/useAuth";

const menuItems = [
    { path: "/admin", icon: <FaHome />, label: "Trang chủ" },
    { path: "/admin/users", icon: <FaUsers />, label: "Người dùng" },
    { path: "/admin/reports", icon: <FaChartBar />, label: "Báo cáo" },
    { path: "/admin/owner-requests", icon: <FaClipboardList />, label: "Đơn đăng ký chủ xe" },
    { path: "/admin/car-approval", icon: <FaCar />, label: "Duyệt xe" },
    { path: "/admin/payments", icon: <FaMoneyCheckAlt />, label: "Thanh toán" },
    { path: "/admin/car-condition-reports", icon: <FaClipboardList />, label: "Báo cáo tình trạng xe" },
];

export const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();
    const { logout } = useAuth();
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (location.pathname.startsWith("/admin")) {
            setIsOpen(true);
        }
    }, [location.pathname]);

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className={`fixed top-0 left-0 h-full z-40 ${isOpen ? "w-64" : "w-20"} bg-white shadow-xl border-r border-gray-100 flex flex-col transition-all duration-300`}
        >
            <div className="flex items-center justify-between px-4 py-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg font-bold">A</span>
                    </div>
                    {isOpen && <span className="text-gray-700 text-xl font-bold">Admin</span>}
                </div>
                <button
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
                    onClick={toggleSidebar}
                >
                    {isOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>
            <nav className="flex-1 py-6 px-3">
                <ul className="flex flex-col gap-2">
                    {menuItems.map((item) => {
                        const active = location.pathname === item.path;
                        return (
                            <motion.li
                                key={item.path}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                        active
                                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                                    }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {isOpen && <span>{item.label}</span>}
                                </Link>
                            </motion.li>
                        );
                    })}
                </ul>
            </nav>
            <div className="mt-auto flex flex-col gap-2 p-4">
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={logout}
                    className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <span className="text-lg"><FaSignOutAlt /></span>
                    {isOpen && <span>Đăng xuất</span>}
                </motion.button>
                <div className="text-center text-gray-400 text-xs mt-2">
                    © {new Date().getFullYear()} Car Rental
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;