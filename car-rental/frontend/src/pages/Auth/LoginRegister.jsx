"use client"

import { useState, useContext, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { AuthContext } from "../../store/AuthContext"
import { login, register, sendEmailOtp, verifyEmailOtp } from "@/services/api"

const LoginRegisterPage = () => {
  const { login: setAuthData } = useContext(AuthContext);
  const location = useLocation();
  const [isRegisterActive, setRegisterActive] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  const { register: loginRegister, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors, isSubmitting: isLoginSubmitting }, reset: resetLogin } = useForm();
  const { register: registerRegister, handleSubmit: handleRegisterSubmit, formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting }, watch, reset: resetRegister, getValues } = useForm();
  const password = watch('password');

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const togglePanel = () => {
    setRegisterActive(!isRegisterActive);
    setError('');
    resetLogin();
    resetRegister();
    setOtpDigits(['', '', '', '', '', '']);
    setOtpSent(false);
    setIsEmailVerified(false);
  };

  // OTP digit input handler
  const handleOtpDigit = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...otpDigits];
    pasted.split('').forEach((d, i) => { newDigits[i] = d; });
    setOtpDigits(newDigits);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const onLoginSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const response = await login(data.username, data.password);
      const userRole = response.role || 'customer';
      setAuthData(response.token, {
        expiresAt: response.expiresAt,
        role: userRole,
        username: response.username || data.username,
        email: response.email || data.username,
        userId: response.userId,
        rememberMe
      });
      localStorage.setItem('userEmail', response.email || data.username);
      localStorage.setItem('username', response.username || data.username);
      showToast('Đăng nhập thành công!', 'success');
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirectTo') || '/';
      setTimeout(() => {
        const dest = userRole === 'admin' ? '/admin'
          : userRole === 'supplier' ? '/supplier/dashboard'
          : redirectTo;
        window.location.href = dest;
      }, 800);
    } catch (err) {
      const backendMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message;
      setError(backendMsg || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin.');
      showToast(backendMsg || 'Đăng nhập thất bại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    const email = getValues('email');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Vui lòng nhập email hợp lệ trước', 'error');
      return;
    }
    setOtpLoading(true);
    try {
      await sendEmailOtp(email);
      setOtpSent(true);
      setIsEmailVerified(false);
      setOtpDigits(['', '', '', '', '', '']);
      setCountdown(60);
      showToast('Mã OTP đã được gửi vào email!', 'success');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      showToast(err.message || 'Gửi OTP thất bại', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    const email = getValues('email');
    const otp = otpDigits.join('');
    if (otp.length < 6) { showToast('Vui lòng nhập đủ 6 số OTP', 'error'); return; }
    setOtpLoading(true);
    try {
      await verifyEmailOtp(email, otp);
      setIsEmailVerified(true);
      showToast('Xác thực email thành công!', 'success');
    } catch (err) {
      showToast(err.message || 'Mã OTP không đúng', 'error');
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setOtpLoading(false);
    }
  };

  const onRegisterSubmit = async (data) => {
    if (!isEmailVerified) {
      showToast('Vui lòng xác thực email trước khi đăng ký', 'error');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userData = {
        username: data.username,
        email: data.email,
        password: data.password,
        roleId: data.userType === 'renter' ? 3 : 2,
        statusId: 8,
        preferredLanguage: 'vi',
        userDetail: { fullName: data.username, address: 'Unknown' },
      };
      if (userData.roleId === 2) {
        showToast('Vui lòng hoàn thiện hồ sơ chủ xe!', 'success');
        setTimeout(() => navigate('/owner-registration', { state: { email: data.email, username: data.username, password: data.password } }), 1000);
        return;
      }
      await register(userData);
      showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
      setTimeout(() => setRegisterActive(false), 1500);
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      showToast('Đăng ký thất bại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      const response = await fetch(`${apiUrl}/oauth2/authorization/google`, { method: 'GET', redirect: 'manual' });
      if (response.type === 'opaqueredirect') window.location.href = response.url;
      else throw new Error('Không thể khởi tạo đăng nhập Google');
    } catch (err) {
      setError(err.message || 'Đăng nhập Google thất bại');
      showToast('Đăng nhập Google thất bại!', 'error');
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (location.state && location.state.showRegister) setRegisterActive(true);
  }, [location.state]);

  const otpFilled = otpDigits.join('').length === 6;

  return (
    <div className="min-h-screen flex">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl transform transition-all duration-500 translate-y-0 ${toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-red-500 to-rose-500'} text-white`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-white/20' : 'bg-white/20'}`}>
            <i className={`text-sm ${toast.type === 'success' ? 'ri-check-line' : 'ri-close-line'}`}></i>
          </div>
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700 font-medium">Đang xử lý...</span>
          </div>
        </div>
      )}

      {/* Left - Hero */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/5 rounded-full"></div>

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <i className="ri-car-line text-white text-lg"></i>
            </div>
            <span className="text-white text-xl font-bold">RentCar</span>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 text-white">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8">
            <i className="ri-car-line text-5xl"></i>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            {isRegisterActive ? 'Tham gia cùng\nchúng tôi!' : 'Chào mừng\ntrở lại!'}
          </h1>
          <p className="text-blue-200 text-lg mb-10">
            {isRegisterActive
              ? 'Đăng ký để trải nghiệm dịch vụ cho thuê xe hàng đầu Việt Nam'
              : 'Đăng nhập và tiếp tục hành trình tuyệt vời của bạn'}
          </p>

          <div className="space-y-4">
            {[
              { icon: 'ri-shield-check-line', title: 'Bảo mật tuyệt đối', desc: 'Xác thực 2 lớp qua email OTP' },
              { icon: 'ri-map-pin-2-line', title: '500+ địa điểm', desc: 'Phủ sóng toàn quốc' },
              { icon: 'ri-star-fill', title: 'Đánh giá 4.9★', desc: 'Tin tưởng bởi 50.000+ khách hàng' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <i className={`${item.icon} text-white`}></i>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{item.title}</p>
                  <p className="text-blue-200 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom switch */}
        <div className="relative z-10 text-center">
          <p className="text-blue-200 text-sm mb-3">
            {isRegisterActive ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
          </p>
          <button onClick={togglePanel} className="bg-white text-blue-700 px-8 py-3 rounded-2xl font-semibold hover:bg-blue-50 transition-all shadow-lg text-sm">
            {isRegisterActive ? 'Đăng nhập ngay' : 'Đăng ký miễn phí'}
          </button>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <i className="ri-car-line text-white"></i>
              </div>
              <span className="text-xl font-bold text-gray-900">RentCar</span>
            </Link>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-white rounded-2xl p-1.5 mb-8 shadow-sm border border-gray-100">
            <button onClick={() => { setRegisterActive(false); setError(''); }} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${!isRegisterActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
              Đăng nhập
            </button>
            <button onClick={() => { setRegisterActive(true); setError(''); }} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isRegisterActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
              Đăng ký
            </button>
          </div>

          {/* ── LOGIN FORM ── */}
          {!isRegisterActive && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Chào mừng trở lại 👋</h2>
                <p className="text-gray-500 text-sm">Đăng nhập để tiếp tục hành trình</p>
              </div>

              <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email / Tên đăng nhập</label>
                  <div className="relative">
                    <i className="ri-user-3-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                      {...loginRegister('username', { required: 'Vui lòng nhập email hoặc tên đăng nhập' })}
                      type="text"
                      placeholder="example@email.com"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  {loginErrors.username && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="ri-error-warning-line"></i>{loginErrors.username.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
                  <div className="relative">
                    <i className="ri-lock-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                      {...loginRegister('password', { required: 'Vui lòng nhập mật khẩu', minLength: { value: 6, message: 'Mật khẩu ít nhất 6 ký tự' } })}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                  {loginErrors.password && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="ri-error-warning-line"></i>{loginErrors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700">Quên mật khẩu?</Link>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <i className="ri-error-warning-fill text-red-500"></i>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading || isLoginSubmitting} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2">
                  {loading || isLoginSubmitting ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>Đang đăng nhập...</> : 'Đăng nhập'}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-gray-400 font-medium">hoặc</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <button type="button" onClick={handleGoogleLogin} disabled={isGoogleLoading} className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-60 transition-all font-medium text-sm text-gray-700">
                  {isGoogleLoading ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div> : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  {isGoogleLoading ? 'Đang kết nối...' : 'Tiếp tục với Google'}
                </button>
              </form>
            </div>
          )}

          {/* ── REGISTER FORM ── */}
          {isRegisterActive && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Tạo tài khoản ✨</h2>
                <p className="text-gray-500 text-sm">Bắt đầu hành trình của bạn ngay hôm nay</p>
              </div>

              <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-5">
                {/* Full name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
                  <div className="relative">
                    <i className="ri-user-3-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                      {...registerRegister('username', { required: 'Vui lòng nhập tên của bạn' })}
                      type="text"
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  {registerErrors.username && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="ri-error-warning-line"></i>{registerErrors.username.message}</p>}
                </div>

                {/* Email + OTP section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ Email <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input
                        {...registerRegister('email', {
                          required: 'Email là bắt buộc',
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' },
                        })}
                        type="email"
                        placeholder="example@gmail.com"
                        className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${isEmailVerified ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}
                        disabled={isEmailVerified}
                      />
                      {isEmailVerified && <i className="ri-check-line absolute right-4 top-1/2 -translate-y-1/2 text-green-500 font-bold"></i>}
                    </div>
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={otpLoading || isEmailVerified || countdown > 0}
                      className={`px-4 py-3.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${isEmailVerified ? 'bg-green-100 text-green-700 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 shadow-lg shadow-blue-500/25'}`}
                    >
                      {otpLoading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                        : isEmailVerified ? <span className="flex items-center gap-1"><i className="ri-check-line"></i>Đã xác thực</span>
                        : countdown > 0 ? `${countdown}s`
                        : otpSent ? 'Gửi lại' : 'Gửi OTP'}
                    </button>
                  </div>
                  {registerErrors.email && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="ri-error-warning-line"></i>{registerErrors.email.message}</p>}
                </div>

                {/* OTP digit boxes */}
                {otpSent && !isEmailVerified && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="ri-mail-send-line text-blue-600 text-sm"></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Nhập mã OTP</p>
                        <p className="text-xs text-gray-500">Mã 6 số đã gửi đến email của bạn</p>
                      </div>
                    </div>

                    {/* 6 digit boxes */}
                    <div className="flex gap-2 justify-center mb-4" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={el => otpRefs.current[i] = el}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpDigit(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className={`w-11 h-13 text-center text-xl font-bold border-2 rounded-xl bg-white transition-all focus:outline-none
                            ${digit ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-800'}
                            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                          style={{ height: '52px' }}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyEmailOtp}
                      disabled={otpLoading || !otpFilled}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                      {otpLoading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>Đang xác thực...</> : <><i className="ri-shield-check-line"></i>Xác thực OTP</>}
                    </button>
                  </div>
                )}

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
                  <div className="relative">
                    <i className="ri-lock-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                      {...registerRegister('password', { required: 'Mật khẩu là bắt buộc', minLength: { value: 8, message: 'Ít nhất 8 ký tự' } })}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                  {registerErrors.password && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="ri-error-warning-line"></i>{registerErrors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <i className="ri-lock-password-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                      {...registerRegister('confirmPassword', { required: 'Xác nhận mật khẩu là bắt buộc', validate: v => v === password || 'Mật khẩu không khớp' })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                  {registerErrors.confirmPassword && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className="ri-error-warning-line"></i>{registerErrors.confirmPassword.message}</p>}
                </div>

                {/* User type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tôi muốn:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative cursor-pointer">
                      <input {...registerRegister('userType', { required: true })} type="radio" value="renter" defaultChecked className="peer sr-only" />
                      <div className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-2xl peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-all">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center peer-checked:bg-blue-200">
                          <i className="ri-car-line text-blue-600 text-lg"></i>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 text-sm">Thuê xe</p>
                          <p className="text-xs text-gray-500">Tìm & thuê xe</p>
                        </div>
                      </div>
                    </label>
                    <label className="relative cursor-pointer">
                      <input {...registerRegister('userType')} type="radio" value="provider" className="peer sr-only" />
                      <div className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-2xl peer-checked:border-green-500 peer-checked:bg-green-50 hover:border-gray-300 transition-all">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <i className="ri-store-2-line text-green-600 text-lg"></i>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 text-sm">Cung cấp xe</p>
                          <p className="text-xs text-gray-500">Đăng xe cho thuê</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <i className="ri-error-warning-fill text-red-500"></i>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || isRegisterSubmitting || !isEmailVerified}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${isEmailVerified ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  {loading || isRegisterSubmitting
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>Đang tạo tài khoản...</>
                    : !isEmailVerified
                    ? <><i className="ri-lock-line"></i>Xác thực email để tiếp tục</>
                    : <><i className="ri-user-add-line"></i>Tạo tài khoản</>}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-gray-400 font-medium">hoặc</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <button type="button" onClick={handleGoogleLogin} disabled={isGoogleLoading} className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-60 transition-all font-medium text-sm text-gray-700">
                  {isGoogleLoading ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div> : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  {isGoogleLoading ? 'Đang kết nối...' : 'Đăng ký với Google'}
                </button>
              </form>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <i className="ri-arrow-left-line"></i>Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegisterPage;
