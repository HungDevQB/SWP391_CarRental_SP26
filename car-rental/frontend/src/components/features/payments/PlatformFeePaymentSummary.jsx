import React from 'react'
import { FaSpinner, FaMoneyBillWave, FaShieldAlt, FaInfoCircle } from 'react-icons/fa'

const PlatformFeePaymentSummary = ({ 
  platformFeeInfo, 
  amountToPay, 
  paymentMethod, 
  isProcessing, 
  handlePayment, 
  disablePaymentButton 
}) => {
  const formatPrice = (price) => {
    if (!price) return '0'
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  return (
    <div className="sticky top-8">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-100">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          Thanh toán phí platform
        </h3>

        {/* Platform Fee Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <FaInfoCircle className="text-blue-600 text-lg mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Thông tin phí platform</h4>
              <p className="text-blue-700 text-sm">
                {platformFeeInfo?.description || 'Phí platform cho giao dịch tiền mặt'}
              </p>
            </div>
          </div>
          
          {platformFeeInfo?.originalBookingId && (
            <div className="text-sm text-blue-600">
              <span className="font-medium">Mã booking gốc:</span> #{platformFeeInfo.originalBookingId}
            </div>
          )}
        </div>

        {/* Amount Summary */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600">Phí platform</span>
            <span className="font-semibold text-gray-900">{formatPrice(amountToPay)} VND</span>
          </div>
          
          <div className="flex justify-between items-center py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl px-4">
            <span className="text-lg font-bold text-blue-900">Tổng cần thanh toán</span>
            <span className="text-2xl font-bold text-blue-600">{formatPrice(amountToPay)} VND</span>
          </div>
        </div>

        {/* Payment Method Display */}
        {paymentMethod && (
          <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <FaMoneyBillWave className="text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Phương thức thanh toán</p>
                <p className="text-sm text-gray-600 capitalize">
                  {paymentMethod === 'vnpay' ? 'VNPay' : paymentMethod === 'momo' ? 'MoMo' : paymentMethod}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <FaShieldAlt className="text-green-600 text-lg mt-1" />
            <div>
              <h4 className="font-semibold text-green-900 mb-1">Thanh toán an toàn</h4>
              <p className="text-sm text-green-700">
                Giao dịch được mã hóa SSL 256-bit và tuân thủ tiêu chuẩn bảo mật quốc tế.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={disablePaymentButton}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
            disablePaymentButton
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:scale-105 active:scale-95'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-3">
              <FaSpinner className="animate-spin text-lg" />
              <span>Đang xử lý...</span>
            </div>
          ) : (
            <span>Thanh toán {formatPrice(amountToPay)} VND</span>
          )}
        </button>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Bằng cách nhấn thanh toán, bạn đồng ý với{' '}
            <span className="text-blue-600 hover:underline cursor-pointer">
              điều khoản dịch vụ
            </span>{' '}
            của chúng tôi
          </p>
        </div>
      </div>
    </div>
  )
}

export default PlatformFeePaymentSummary
