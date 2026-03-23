import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaMobile, FaSpinner } from 'react-icons/fa';

/**
 * Component để xử lý thanh toán platform fee
 * Supplier chọn phương thức thanh toán và được redirect đến PaymentPage
 */
const PlatformFeePayment = ({ confirmationId, platformFee, onCancel, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    setError('');
  };

  const handleProceedToPayment = async () => {
    if (!paymentMethod) {
      setError('Vui lòng chọn phương thức thanh toán');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/cash-payments/confirmations/${confirmationId}/initiate-platform-fee-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod: paymentMethod,
          returnUrl: `${window.location.origin}/platform-fee-payment/success`,
          cancelUrl: `${window.location.origin}/platform-fee-payment/cancel`
        })
      });

      if (response.ok) {
        const paymentInfo = await response.json();
        
        // Navigate to PaymentPage with platform fee payment info
        navigate('/payments', {
          state: {
            paymentType: 'platform_fee',
            platformFeePayment: true,
            platformFeeInfo: paymentInfo,
            amountToPay: platformFee,
            paymentMethod: paymentMethod,
            customerInfo: {
              fullName: paymentInfo.supplierName,
              email: '', // Will be filled from user context
              phone: '', // Will be filled from user context
              pickupAddress: 'Platform Fee Payment',
              dropoffAddress: 'Admin Account'
            },
            priceBreakdown: {
              total: platformFee,
              deposit: 0,
              platformFee: platformFee,
              tax: 0,
              serviceFee: 0,
              breakdown: [
                {
                  label: 'Platform Fee',
                  amount: platformFee,
                  description: `Phí nền tảng cho xác nhận #${confirmationId}`
                }
              ]
            }
          }
        });

        if (onSuccess) {
          onSuccess(paymentInfo);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Có lỗi xảy ra khi khởi tạo thanh toán');
      }
    } catch (err) {
      console.error('Error initiating platform fee payment:', err);
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Thanh toán Platform Fee
        </h3>
        <p className="text-gray-600">
          Số tiền cần thanh toán: <span className="font-semibold text-blue-600">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(platformFee)}
          </span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Chọn phương thức thanh toán:</h4>
        
        {/* VNPay Option */}
        <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
          paymentMethod === 'vnpay' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                name="paymentMethod"
                value="vnpay"
                checked={paymentMethod === 'vnpay'}
                onChange={() => handlePaymentMethodSelect('vnpay')}
                className="sr-only"
              />
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                paymentMethod === 'vnpay' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <FaCreditCard className="text-lg" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">VNPay</div>
                <div className="text-sm text-gray-600">Thanh toán qua VNPay</div>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
            }`}>
              {paymentMethod === 'vnpay' && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          </div>
        </label>

        {/* MoMo Option */}
        <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
          paymentMethod === 'momo' 
            ? 'border-pink-500 bg-pink-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                name="paymentMethod"
                value="momo"
                checked={paymentMethod === 'momo'}
                onChange={() => handlePaymentMethodSelect('momo')}
                className="sr-only"
              />
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                paymentMethod === 'momo' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <FaMobile className="text-lg" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">MoMo</div>
                <div className="text-sm text-gray-600">Thanh toán qua ví MoMo</div>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === 'momo' ? 'border-pink-500 bg-pink-500' : 'border-gray-300'
            }`}>
              {paymentMethod === 'momo' && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          </div>
        </label>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          onClick={handleProceedToPayment}
          disabled={!paymentMethod || isProcessing}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <span>Tiếp tục thanh toán</span>
          )}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Bạn sẽ được chuyển đến trang thanh toán để hoàn tất giao dịch
      </div>
    </div>
  );
};

export default PlatformFeePayment;
