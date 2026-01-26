import React from 'react';
import { FaCheckCircle, FaShieldAlt, FaHeadset, FaUndoAlt, FaSpinner, FaCreditCard, FaLock, FaInfoCircle } from 'react-icons/fa';

const RetryPaymentSummary = ({
  priceBreakdown,
  collateralAmount,
  paymentType,
  withDriver,
  deliveryRequested,
  paymentMethod,
  isProcessing,
  handlePayment,
  bookingInfo,
  disablePaymentButton = false,
}) => {
  // Lấy total, deposit, remaining như các file khác
  let total = 0;
  if (bookingInfo && bookingInfo.totalAmount) {
    total = Number(bookingInfo.totalAmount);
  } else if (priceBreakdown && priceBreakdown.total) {
    total = Number(priceBreakdown.total);
  }

  let deposit = 0;
  if (bookingInfo && bookingInfo.depositAmount) {
    deposit = Number(bookingInfo.depositAmount);
  } else if (priceBreakdown && priceBreakdown.deposit) {
    deposit = Number(priceBreakdown.deposit);
  }

  let remaining = total - deposit;
  if (remaining < 0) remaining = 0;

  // Xác định số tiền cần thanh toán lại
  let amountToPay = 0;
  let summaryTitle = '';
  if (paymentType === 'full_payment') {
    amountToPay = remaining + Number(collateralAmount || 0);
    summaryTitle = 'Tóm tắt thanh toán lại (phần còn lại + thế chấp)';
  } else {
    amountToPay = deposit;
    summaryTitle = 'Tóm tắt thanh toán lại (tiền cọc)';
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl sticky top-32 border border-gray-100">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
        {summaryTitle}
      </h3>
      {/* Price Breakdown */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
          <span className="text-gray-700 font-medium">Tổng tiền thuê:</span>
          <span className="font-bold text-lg">{total.toLocaleString()} VND</span>
        </div>
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
          <span className="text-gray-700 font-medium">Phí dịch vụ:</span>
          <span className="font-bold text-lg">{Number(priceBreakdown?.serviceFee || 0).toLocaleString()} VND</span>
        </div>
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
          <span className="text-gray-700 font-medium">Thuế VAT:</span>
          <span className="font-bold text-lg">{Number(priceBreakdown?.tax || 0).toLocaleString()} VND</span>
        </div>
        {priceBreakdown?.discount > 0 && (
          <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
            <span className="text-green-700 font-medium">Giảm giá:</span>
            <span className="font-bold text-green-600 text-lg">-{Number(priceBreakdown.discount || 0).toLocaleString()} VND</span>
          </div>
        )}
        {withDriver && (
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
            <span className="text-gray-700 font-medium">Thuê tài xế:</span>
            <span className="font-medium text-green-600 flex items-center gap-2">
              <FaCheckCircle />
              Đã chọn
            </span>
          </div>
        )}
        {deliveryRequested && (
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
            <span className="text-gray-700 font-medium">Giao xe tận nơi:</span>
            <span className="font-medium text-green-600 flex items-center gap-2">
              <FaCheckCircle />
              Đã chọn
            </span>
          </div>
        )}
      </div>
      {/* Payment Amount */}
      <div className="border-t border-gray-200 pt-6 mb-8">
        <div className="flex justify-between items-center mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
          <span className="font-bold text-gray-900 text-base">Cần thanh toán lại:</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {amountToPay.toLocaleString()} VND
          </span>
        </div>
        {paymentType === 'full_payment' ? (
          <p className="text-center text-sm text-gray-500 mb-4">Thanh toán phần còn lại và tiền thế chấp</p>
        ) : (
          <p className="text-center text-sm text-gray-500 mb-4">Thanh toán lại tiền cọc</p>
        )}
      </div>
      {/* Collateral Notice */}
      {paymentType === 'full_payment' && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-yellow-600 text-xl mt-1" />
            <div>
              <p className="font-bold text-yellow-800 mb-2">Thế chấp khi nhận xe:</p>
              <p className="text-yellow-700 font-semibold text-lg">{Number(collateralAmount || 0).toLocaleString()} VND</p>
              <p className="text-yellow-600 text-sm mt-1">(Hoàn lại sau khi trả xe)</p>
            </div>
          </div>
        </div>
      )}
      {/* Benefits */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center text-sm text-gray-700 p-4 bg-green-50 rounded-xl border border-green-100">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4">
            <FaShieldAlt />
          </div>
          <span className="font-medium">Bảo hiểm xe và hành khách theo quy định</span>
        </div>
        <div className="flex items-center text-sm text-gray-700 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
            <FaHeadset />
          </div>
          <span className="font-medium">Hỗ trợ kỹ thuật 24/7</span>
        </div>
        <div className="flex items-center text-sm text-gray-700 p-4 bg-purple-50 rounded-xl border border-purple-100">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-4">
            <FaUndoAlt />
          </div>
          <span className="font-medium">Chính sách hủy linh hoạt</span>
        </div>
      </div>
      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={!paymentMethod || isProcessing || disablePaymentButton}
        className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
          !paymentMethod || isProcessing || disablePaymentButton
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105 shadow-xl hover:shadow-2xl"
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-3">
            <FaSpinner className="animate-spin text-xl" />
            <span>Đang xử lý...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <FaCreditCard className="text-xl" />
            <span>Thanh toán lại {amountToPay.toLocaleString()} VND</span>
          </div>
        )}
      </button>
      {/* Security Notice */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <FaShieldAlt />
            <span>SSL Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <FaLock />
            <span>256-bit Encryption</span>
          </div>
        </div>
        <p className="text-xs text-gray-400">Thông tin thanh toán được bảo mật tuyệt đối</p>
      </div>
    </div>
  );
};

export default RetryPaymentSummary; 