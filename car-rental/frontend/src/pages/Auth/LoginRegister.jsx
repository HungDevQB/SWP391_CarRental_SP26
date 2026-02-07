"use client"

import { useState, useContext, useEffect } from "react"
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
  const [countryCodes, setCountryCodes] = useState([]);
  const [countryCode, setCountryCode] = useState('+84');
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Login form
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    reset: resetLogin,
  } = useForm();

  // Register form
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
    watch,
    reset: resetRegister,
    getValues,
  } = useForm();

  const password = watch('password');

  // Toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const togglePanel = () => {
    setRegisterActive(!isRegisterActive);
    setError('');
    resetLogin();
    resetRegister();
  };

  const onLoginSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      console.log('[LoginRegister] [FRONTEND] Bắt đầu gọi login với:', data);
      const response = await login(data.username, data.password);
      console.log('[LoginRegister] [FRONTEND] Đăng nhập thành công, response:', response);
      console.log('[LoginRegister] Response structure:', {
        hasToken: !!response.token,
        tokenLength: response.token ? response.token.length : 0,
        hasExpiresAt: !!response.expiresAt,
        expiresAt: response.expiresAt,
        hasRole: !!response.role,
        role: response.role,
        hasUsername: !!response.username,
        username: response.username
      });
      
      // Đảm bảo role được set đúng
      const userRole = response.role || 'customer';
      console.log('[LoginRegister] Setting user role to:', userRole);
      
      setAuthData(response.token, {
        expiresAt: response.expiresAt,
        role: userRole,
        username: response.username || data.username,
        email: response.email || data.username,
        rememberMe

      });

      // Lưu email vào localStorage
      localStorage.setItem('userEmail', response.email || data.username);
      // Lưu username vào localStorage
      localStorage.setItem('username', response.username || data.username);

      showToast('Đăng nhập thành công!', 'success');
      
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirectTo') || '/';

      console.log('[LoginRegister] Redirect logic:', {
        role: userRole,
        redirectTo: redirectTo,
        willRedirectTo: userRole === 'admin' ? '/admin' : 
                       userRole === 'supplier' ? '/supplier/dashboard' : 
                       redirectTo
      });

      setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/admin', { replace: true });
        } else if (userRole === 'supplier') {
          navigate('/supplier/dashboard', { replace: true });
        } else {
          navigate(redirectTo, { replace: true });
        }
      }, 1000);
    } catch (err) {
      console.log('[LoginRegister] [FRONTEND] Đăng nhập thất bại, error object:', err);
      console.log('[LoginRegister] [FRONTEND] error.response?.data:', err?.response?.data);
      if (err?.response?.data) {
        console.log('[LoginRegister] [FRONTEND] error.response?.data.error:', err?.response?.data.error);
        console.log('[LoginRegister] [FRONTEND] error.response?.data.code:', err?.response?.data.code);
      }
      // Ưu tiên lấy message từ backend trả về
      const backendMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message;
      if (
        backendMsg &&
        backendMsg.includes('Tài khoản đã đăng nhập ở nơi khác')
      ) {
        setError('Tài khoản đã đăng nhập ở nơi khác. Vui lòng đăng xuất trước khi đăng nhập mới.');
        showToast('Tài khoản đã đăng nhập ở nơi khác. Vui lòng đăng xuất trước khi đăng nhập mới.', 'error');
      } else {
        setError(backendMsg || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin.');
        showToast(backendMsg || 'Đăng nhập thất bại!', 'error');
      }
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
      showToast('Mã OTP đã được gửi vào email!', 'success');
    } catch (err) {
      showToast(err.message || 'Gửi OTP thất bại', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    const email = getValues('email');
    setOtpLoading(true);
    try {
      await verifyEmailOtp(email, otpValue);
      setIsEmailVerified(true);
      showToast('Xác thực email thành công!', 'success');
    } catch (err) {
      showToast(err.message || 'Mã OTP không đúng', 'error');
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
        userDetail: {
          fullName: data.username,
          address: 'Unknown',
        },
      };
      if (userData.roleId === 2) {
        showToast('Vui lòng hoàn thiện hồ sơ chủ xe!', 'success');
        setTimeout(() => {
          navigate('/owner-registration', {
            state: { email: data.email, username: data.username, password: data.password }
          });
        }, 1000);
        return;
      }
      await register(userData);
      showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
      setTimeout(() => { setRegisterActive(false); }, 1500);
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
      if (response.type === 'opaqueredirect') {
        window.location.href = response.url;
      } else {
        throw new Error('Không thể khởi tạo đăng nhập Google');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập Google thất bại');
      showToast('Đăng nhập Google thất bại!', 'error');
      setIsGoogleLoading(false);
    }
  };

  // Floating elements animation
  useEffect(() => {
    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElements.forEach((el, index) => {
      el.style.animationDelay = `${index * 0.5}s`;
    });
  }, []);

  useEffect(() => {
    if (location.state && location.state.showRegister) {
      setRegisterActive(true);
    }
  }, [location.state]);

  // Lấy country code từ API khi mở form
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/country-codes`)
      .then(res => {
        if (!res.ok) throw new Error('Không lấy được country code');
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Dữ liệu country code không hợp lệ');
        setCountryCodes(data);
        if (data.length > 0) setCountryCode(data[0].countryCode);
      })
      .catch(() => setCountryCodes([{ countryCode: '+84', countryName: 'Việt Nam' }]));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-element absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-float"></div>
        <div className="floating-element absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="floating-element absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-20 animate-float"></div>
        <div className="floating-element absolute bottom-40 right-10 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-20 animate-float-delayed"></div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5">
              {toast.type === 'success' ? (
                <i className="ri-check-line"></i>
              ) : (
                <i className="ri-error-warning-line"></i>
              )}
            </div>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700">Đang xử lý...</span>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Left Side - Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white">
                  <i className="ri-car-line"></i>
                </div>
                RentCar
              </Link>
              <p className="text-gray-600">Dịch vụ cho thuê xe cao cấp</p>
            </div>

            {/* Toggle Buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
              <button
                onClick={() => setRegisterActive(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                  !isRegisterActive
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setRegisterActive(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                  isRegisterActive
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Đăng ký
              </button>
            </div>

            {/* Login Form */}
            {!isRegisterActive && (
              <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h2>
                  <p className="text-gray-600">Đăng nhập để tiếp tục hành trình của bạn</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="ri-user-line text-gray-400"></i>
                      </div>
                      <input
                        {...loginRegister('username', { required: 'Tên người dùng hoặc Email là bắt buộc' })}
                        type="text"
                        placeholder="Tên người dùng hoặc Email"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    {loginErrors.username && (
                      <p className="mt-1 text-sm text-red-600">{loginErrors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="ri-lock-line text-gray-400"></i>
                      </div>
                      <input
                        {...loginRegister('password', {
                          required: 'Mật khẩu là bắt buộc',
                          minLength: { value: 8, message: 'Mật khẩu phải dài ít nhất 8 ký tự' },
                        })}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mật khẩu"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 hover:text-gray-600`}></i>
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{loginErrors.password.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Ghi nhớ tôi</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                    Quên mật khẩu?
                  </Link>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <i className="ri-error-warning-line text-red-500"></i>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || isLoginSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading || isLoginSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang đăng nhập...
                    </div>
                  ) : (
                    'Đăng nhập'
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">hoặc tiếp tục với</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isGoogleLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  <span className="text-gray-700 font-medium">
                    {isGoogleLoading ? 'Đang kết nối...' : 'Google'}
                  </span>
                </button>
              </form>
            )}

            {/* Register Form */}
            {isRegisterActive && (
              <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Tạo tài khoản</h2>
                  <p className="text-gray-600">Bắt đầu hành trình của bạn ngay hôm nay</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="ri-user-line text-gray-400"></i>
                      </div>
                      <input
                        {...registerRegister('username', { required: 'Tên người dùng là bắt buộc' })}
                        type="text"
                        placeholder="Tên người dùng *"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    {registerErrors.username && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="ri-mail-line text-gray-400"></i>
                      </div>
                      <input
                        {...registerRegister('email', {
                          required: 'Email là bắt buộc',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Vui lòng nhập địa chỉ email hợp lệ',
                          },
                        })}
                        type="email"
                        placeholder="Địa chỉ Email *"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    {registerErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Xác thực email <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={otpLoading || isEmailVerified}
                        className="px-4 py-3 rounded-lg text-sm font-medium text-white transition-all duration-200 disabled:opacity-60"
                        style={{ background: isEmailVerified ? '#16a34a' : '#3b82f6', whiteSpace: 'nowrap' }}
                      >
                        {isEmailVerified ? '✓ Đã xác thực' : otpSent ? 'Gửi lại' : 'Gửi mã OTP'}
                      </button>
                    </div>
                    {otpSent && !isEmailVerified && (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={otpValue}
                          onChange={(e) => setOtpValue(e.target.value)}
                          placeholder="Nhập mã OTP từ email"
                          maxLength={6}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyEmailOtp}
                          disabled={otpLoading || !otpValue}
                          className="px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                        >
                          Xác thực
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="ri-lock-line text-gray-400"></i>
                      </div>
                      <input
                        {...registerRegister('password', {
                          required: 'Mật khẩu là bắt buộc',
                          minLength: { value: 8, message: 'Mật khẩu phải dài ít nhất 8 ký tự' },
                        })}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mật khẩu *"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 hover:text-gray-600`}></i>
                      </button>
                    </div>
                    {registerErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="ri-lock-line text-gray-400"></i>
                      </div>
                      <input
                        {...registerRegister('confirmPassword', {
                          required: 'Xác nhận mật khẩu là bắt buộc',
                          validate: (value) => value === password || 'Mật khẩu và xác nhận mật khẩu không khớp',
                        })}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Xác nhận mật khẩu *"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <i className={`${showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 hover:text-gray-600`}></i>
                      </button>
                    </div>
                    {registerErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{registerErrors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                {/* User Type Selection */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Tôi muốn:</p>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                      <input
                        {...registerRegister('userType', { required: 'Vui lòng chọn loại người dùng' })}
                        type="radio"
                        value="renter"
                        defaultChecked
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <i className="ri-car-line text-blue-600"></i>
                          <span className="font-medium text-gray-900">Thuê xe</span>
                        </div>
                        <p className="text-sm text-gray-600">Tìm và thuê xe phù hợp</p>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                      <input
                        {...registerRegister('userType')}
                        type="radio"
                        value="provider"
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <i className="ri-car-washing-line text-green-600"></i>
                          <span className="font-medium text-gray-900">Cung cấp xe</span>
                        </div>
                        <p className="text-sm text-gray-600">Đăng xe của tôi cho thuê</p>
                      </div>
                    </label>
                  </div>
                  {registerErrors.userType && (
                    <p className="mt-1 text-sm text-red-600">{registerErrors.userType.message}</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <i className="ri-error-warning-line text-red-500"></i>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || isRegisterSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading || isRegisterSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang tạo tài khoản...
                    </div>
                  ) : (
                    'Tạo tài khoản'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isGoogleLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  <span className="text-gray-700 font-medium">
                    {isGoogleLoading ? 'Đang kết nối...' : 'Đăng ký với Google'}
                  </span>
                </button>
              </form>
            )}

            {/* Back to Home */}
            <div className="mt-8 text-center">
              <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                <i className="ri-arrow-left-line"></i>
                <span>Quay lại trang chủ</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className='absolute top-0 left-0 w-full h-full bg-[url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fillRule=\"evenodd\"%3E%3Cg fill=%23ffffff fillOpacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")]'></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center items-center text-center text-white p-12">
            <div className="mb-8">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                <i className="ri-car-line text-3xl"></i>
              </div>
              <h1 className="text-4xl font-bold mb-4">
                {isRegisterActive ? 'Bắt đầu hành trình!' : 'Xin chào!'}
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                {isRegisterActive 
                  ? 'Tham gia cộng đồng cho thuê xe hàng đầu Việt Nam' 
                  : 'Chào mừng bạn quay trở lại với RentCar'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="flex items-center gap-4 bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <i className="ri-shield-check-line text-xl"></i>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Bảo mật tuyệt đối</h3>
                  <p className="text-sm text-blue-100">Thông tin được mã hóa và bảo vệ</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <i className="ri-customer-service-2-line text-xl"></i>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Hỗ trợ 24/7</h3>
                  <p className="text-sm text-blue-100">Đội ngũ chăm sóc khách hàng tận tình</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <i className="ri-star-line text-xl"></i>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Dịch vụ 5 sao</h3>
                  <p className="text-sm text-blue-100">Được hàng nghìn khách hàng tin tưởng</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-blue-100 mb-4">
                {isRegisterActive 
                  ? 'Đã có tài khoản?' 
                  : 'Chưa có tài khoản?'
                }
              </p>
              <button
                onClick={togglePanel}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200 shadow-lg"
              >
                {isRegisterActive ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegisterPage;