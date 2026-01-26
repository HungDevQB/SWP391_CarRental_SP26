import React from "react";
import { Link } from "react-router-dom";
import { FaCarSide, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white pt-20 pb-10 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.1),transparent_50%)]"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 via-orange-500 to-yellow-500"></div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="lg:col-span-1">
                        <div className="flex items-center mb-6">
                            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-3 rounded-2xl mr-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110">
                                <FaCarSide className="text-2xl text-white" />
                            </div>
                            <div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    DriveLuxe
                                </span>
                                <p className="text-xs text-gray-400">Premium Car Rental</p>
                            </div>
                        </div>
                        <p className="text-gray-300 mb-8 leading-relaxed">
                            Trải nghiệm sự sang trọng và hiệu suất với dịch vụ cho thuê xe tự lái cao cấp hàng đầu Việt Nam.
                        </p>
                        <div className="flex space-x-4">
                            {[
                                { icon: FaFacebookF, href: "#", color: "from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400" },
                                { icon: FaTwitter, href: "#", color: "from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400" },
                                { icon: FaInstagram, href: "#", color: "from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400" },
                                { icon: FaLinkedinIn, href: "#", color: "from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500" },
                            ].map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className={`bg-gradient-to-r ${social.color} w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl transform hover:-translate-y-1`}
                                    aria-label={`Social media link ${index + 1}`}
                                >
                                    <social.icon className="text-white" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
                            <div className="w-2 h-6 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full mr-3"></div>
                            Liên kết nhanh
                        </h3>
                        <ul className="space-y-4">
                            {[
                                { name: "Trang chủ", path: "/" },
                                { name: "Giới thiệu", path: "/gioi-thieu" },
                                { name: "Xe cho thuê", path: "/search", state: { filterType: "all" } },
                                { name: "Liên hệ", path: "/lien-he" }
                            ].map((item, idx) => (
                                <li key={idx}>
                                    <Link
                                        to={item.path}
                                        state={item.state}
                                        className="text-gray-300 hover:text-emerald-400 transition-all duration-300 hover:translate-x-2 inline-flex items-center group"
                                    >
                                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent flex items-center">
                            <div className="w-2 h-6 bg-gradient-to-b from-orange-400 to-red-400 rounded-full mr-3"></div>
                            Thông tin liên hệ
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start group">
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                    <FaMapMarkerAlt className="text-white text-sm" />
                                </div>
                                <span className="text-gray-300 group-hover:text-orange-400 transition-colors duration-300">
                                    123 Luxury Drive, Beverly Hills, CA 90210, USA
                                </span>
                            </li>
                            <li className="flex items-center group">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                    <FaPhone className="text-white text-sm" />
                                </div>
                                <span className="text-gray-300 group-hover:text-green-400 transition-colors duration-300">+1 (800) 123-4567</span>
                            </li>
                            <li className="flex items-center group">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                    <FaEnvelope className="text-white text-sm" />
                                </div>
                                <span className="text-gray-300 group-hover:text-purple-400 transition-colors duration-300">info@driveluxe.com</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent flex items-center">
                            <div className="w-2 h-6 bg-gradient-to-b from-violet-400 to-purple-400 rounded-full mr-3"></div>
                            Đăng ký nhận tin
                        </h3>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            Nhận thông tin về ưu đãi độc quyền và xe mới nhất từ chúng tôi.
                        </p>
                        <div className="flex mb-8">
                            <input
                                type="email"
                                placeholder="Email của bạn"
                                className="flex-grow py-3 px-4 bg-slate-800/50 border border-slate-600 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-white text-sm backdrop-blur-sm transition-all duration-300"
                                aria-label="Nhập email để đăng ký bản tin"
                            />
                            <button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-6 rounded-r-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-violet-500/25">
                                <FaEnvelope />
                            </button>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold mb-4 text-gray-300 flex items-center">
                                <div className="w-1 h-4 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full mr-2"></div>
                                Phương thức thanh toán
                            </h4>
                            <div className="flex space-x-3">
                                {[
                                    { icon: FaCcVisa, color: "from-blue-600 to-blue-500" },
                                    { icon: FaCcMastercard, color: "from-red-600 to-orange-500" },
                                    { icon: FaCcAmex, color: "from-green-600 to-emerald-500" },
                                    { icon: FaCcPaypal, color: "from-blue-500 to-cyan-500" }
                                ].map(({ icon: Icon, color }, index) => (
                                    <div key={index} className={`bg-gradient-to-r ${color} p-2 rounded-lg hover:scale-110 transition-all duration-300 shadow-lg cursor-pointer`}>
                                        <Icon className="text-2xl text-white" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
                <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-purple-400 rounded-full opacity-30 animate-pulse"></div>
                <div className="absolute bottom-1/4 left-2/3 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-25 animate-bounce"></div>
            </div>
            {/* Divider - subtle line */}
            <div className="w-full h-px bg-slate-700/40 my-8"></div>
            <div className="flex flex-col lg:flex-row justify-between items-center pt-0">
                <div className="mb-4 lg:mb-0">
                    <p className="text-gray-400 text-sm flex items-center">
                        <span>© {new Date().getFullYear()} DriveLuxe. All rights reserved.</span>
                        <span className="mx-2 text-red-400">❤️</span>
                        <span>Made with love in Vietnam</span>
                    </p>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-end space-x-6 text-sm text-gray-400">
                    {[
                        { name: "Chính sách bảo mật", color: "hover:text-blue-400" },
                        { name: "Điều khoản dịch vụ", color: "hover:text-green-400" },
                    ].map((item, index) => (
                        <Link
                            key={index}
                            to={`/${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                            className={`${item.color} transition-colors duration-300 hover:underline relative group`}
                        >
                            {item.name}
                            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"></div>
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default Footer; 