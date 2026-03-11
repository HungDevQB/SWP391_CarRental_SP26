"use client"

import { useState, useRef, useEffect } from "react"
import { FaPhone, FaShieldAlt, FaCheck, FaExclamationTriangle, FaClock, FaPaperPlane } from "react-icons/fa"
import { sendPhoneOtp, verifyPhoneOtp } from "@/services/api"

const PhoneOtpVerification = ({ phone, onVerified }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [resendTimeout, setResendTimeout] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const inputRefs = useRef([])
  const prevPhoneRef = useRef()

  // Gửi OTP khi phone thay đổi thực sự
  useEffect(() => {
    if (phone && prevPhoneRef.current !== phone) {
      sendOtp()
      prevPhoneRef.current = phone
    }
  }, [phone])

  // Đếm ngược gửi lại OTP
  useEffect(() => {
    let timer
    if (resendTimeout > 0) {
      timer = setTimeout(() => setResendTimeout(resendTimeout - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendTimeout])

  const sendOtp = async () => {
    setError("")
    setMessage("")
    setIsLoading(true)
    console.log("[OTP-FRONTEND] Gọi gửi OTP cho số:", phone, "| Thời gian:", new Date().toISOString())

    try {
      await sendPhoneOtp(phone)
      setSent(true)
      setResendTimeout(60)
      setMessage("Đã gửi mã OTP tới số điện thoại.")
      // Focus vào ô đầu tiên
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    } catch {
      setError("Không gửi được OTP. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    // Chỉ cho phép số
    if (!/^\d*$/.test(value)) return

    // Nếu user nhập nhiều ký tự (dán hoặc do bug bàn phím), chỉ lấy ký tự cuối cùng
    let digit = value
    if (value.length > 1) {
      digit = value.slice(-1)
    }

    const newOtp = [...otp]
    newOtp[index] = digit

    setOtp(newOtp)
    setError("") // Clear error khi user nhập

    // Auto focus to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Backspace: focus to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    // Enter: submit if all filled
    if (e.key === "Enter" && otp.every((digit) => digit)) {
      handleSubmit(e)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newOtp = [...otp]

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }

    setOtp(newOtp)

    // Focus to next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join("")

    if (otpString.length !== 6) {
      setError("Vui lòng nhập đầy đủ 6 số OTP")
      return
    }

    setError("")
    setMessage("")
    setIsVerifying(true)
    console.log(
      "[OTP-FRONTEND] Gửi xác thực OTP:",
      otpString,
      "cho số:",
      phone,
      "| Thời gian:",
      new Date().toISOString(),
    )

    try {
      await verifyPhoneOtp(phone, otpString)
      setMessage("Xác thực thành công!")
      onVerified && onVerified()
    } catch {
      setError("OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.")
      // Clear OTP và focus lại ô đầu
      setOtp(["", "", "", "", "", ""])
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    } finally {
      setIsVerifying(false)
    }
  }

  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""])
    setError("")
    inputRefs.current[0]?.focus()
  }

  const isOtpComplete = otp.every((digit) => digit)
  const canResend = resendTimeout === 0 && !isLoading

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <FaShieldAlt className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Xác thực số điện thoại</h3>
        <div className="flex items-center justify-center text-sm text-gray-600 mb-2">
          <FaPhone className="w-4 h-4 mr-2 text-blue-500" />
          <span>Mã OTP đã được gửi tới</span>
        </div>
        <div className="font-semibold text-blue-600">{phone}</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 text-center">Nhập mã OTP (6 số)</label>
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl transition-all duration-200 ${
                  digit
                    ? "border-blue-500 bg-blue-50 text-blue-600 shadow-md"
                    : error
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-300 bg-white hover:border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                } focus:outline-none focus:ring-2`}
                disabled={isVerifying}
              />
            ))}
          </div>

          {/* Clear button */}
          {otp.some((digit) => digit) && (
            <div className="text-center">
              <button
                type="button"
                onClick={clearOtp}
                className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors duration-200"
              >
                Xóa và nhập lại
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Verify Button */}
          <button
            type="submit"
            disabled={!isOtpComplete || isVerifying}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
              isOtpComplete && !isVerifying
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isVerifying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <FaCheck className="w-4 h-4" />
                <span>Xác thực OTP</span>
              </>
            )}
          </button>

          {/* Resend Button */}
          <button
            type="button"
            onClick={sendOtp}
            disabled={!canResend}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              canResend
                ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Đang gửi...</span>
              </>
            ) : resendTimeout > 0 ? (
              <>
                <FaClock className="w-4 h-4" />
                <span>Gửi lại sau {resendTimeout}s</span>
              </>
            ) : (
              <>
                <FaPaperPlane className="w-4 h-4" />
                <span>Gửi lại mã OTP</span>
              </>
            )}
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-2 text-green-700">
              <FaCheck className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{message}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-2 text-red-700">
              <FaExclamationTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}
      </form>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 leading-relaxed">
          Không nhận được mã? Kiểm tra tin nhắn hoặc thử gửi lại sau {resendTimeout > 0 ? resendTimeout : 60} giây
        </p>
      </div>
    </div>
  )
}

export default PhoneOtpVerification
