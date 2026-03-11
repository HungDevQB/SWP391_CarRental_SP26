import React, { useState } from 'react';
import { FaMoneyBillWave, FaCreditCard, FaExclamationTriangle, FaCheckCircle, FaTimes, FaCalendarAlt } from 'react-icons/fa';

const CashPaymentManagementModal = ({ 
  isOpen, 
  onClose, 
  pendingCashPayments, 
  pendingPlatformFees, 
  totalPendingFees,
  onConfirmCashReceived,
  onPayPlatformFee,
  loading 
}) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [confirmationData, setConfirmationData] = useState({
    amountReceived: '',
    confirmationType: 'pickup',
    notes: ''
  });

  if (!isOpen) return null;

  const handleConfirmCash = async (paymentId) => {
    if (!confirmationData.amountReceived) {
      alert('Vui lòng nhập số tiền đã nhận');
      return;
    }

    const data = {
      ...confirmationData,
      amountReceived: parseFloat(confirmationData.amountReceived),
      currency: 'VND'
    };

    await onConfirmCashReceived(paymentId, data);
    setSelectedPayment(null);
    setConfirmationData({ amountReceived: '', confirmationType: 'pickup', notes: '' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Trong SupplierOrderManagement component, cập nhật handleConfirmCashReceived:

const handleConfirmCashReceived = async (paymentId, confirmationData) => {
    try {
        setCashPaymentLoading(true);
        
        // Sử dụng API hiện tại
        await confirmCashReceived(paymentId, confirmationData);
        
        // Refresh data
        await fetchCashPaymentData();
        await fetchOrders();
        
        toast.success('Đã xác nhận nhận tiền mặt thành công');
    } catch (error) {
        toast.error(error.message || 'Không thể xác nhận nhận tiền mặt');
    } finally {
        setCashPaymentLoading(false);
    }
};

// Thêm handler cho supplier confirm cash pickup:
const handleSupplierConfirmCashPickup = async (bookingId) => {
    try {
        await supplierConfirmCashPickupPayment(bookingId);
        toast.success('Đã xác nhận nhận tiền mặt, đơn hàng chuyển sang đang thực hiện');
        await fetchOrders();
    } catch (error) {
        toast.error(error.message || 'Không thể xác nhận nhận tiền mặt');
    }
};

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FaMoneyBillWave className="w-5 h-5" />
              Quản lý thanh toán tiền mặt
            </h3>
            <button onClick={onClose} className="text-white hover:text-red-200 text-2xl font-bold">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                activeTab === 'pending'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Chờ xác nhận
              {pendingCashPayments && pendingCashPayments.length > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                  {pendingCashPayments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('platform-fees')}
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                activeTab === 'platform-fees'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Phí platform
              {pendingPlatformFees && pendingPlatformFees.length > 0 && (
                <span className="ml-2 bg-yellow-500 text-white rounded-full px-2 py-1 text-xs">
                  {pendingPlatformFees.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
              {/* Pending Cash Payments Tab */}
              {activeTab === 'pending' && (
                <div>
                  {!pendingCashPayments || pendingCashPayments.length === 0 ? (
                    <div className="text-center py-8">
                      <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-600">Không có thanh toán tiền mặt nào cần xác nhận</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        Thanh toán tiền mặt chờ xác nhận ({pendingCashPayments.length})
                      </h4>
                      {pendingCashPayments.map((payment) => (
                        <div key={payment.paymentId} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">
                                Booking #{payment.bookingId}
                              </p>
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(payment.amountReceived || 0)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Phí platform: {formatCurrency(payment.platformFee || 0)}
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedPayment(payment)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Xác nhận đã nhận
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Platform Fees Tab */}
              {activeTab === 'platform-fees' && (
                <div>
                  {/* Summary */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <FaExclamationTriangle className="text-yellow-600 w-6 h-6" />
                      <div>
                        <p className="font-semibold text-yellow-800">
                          Tổng phí platform chưa thanh toán
                        </p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {formatCurrency(totalPendingFees || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!pendingPlatformFees || pendingPlatformFees.length === 0 ? (
                    <div className="text-center py-8">
                      <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-600">Không có phí platform nào cần thanh toán</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        Phí platform cần thanh toán ({pendingPlatformFees.length})
                      </h4>
                      {pendingPlatformFees.map((fee) => (
                        <div key={fee.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">
                                Booking #{fee.bookingId}
                              </p>
                              <p className="text-lg font-bold text-red-600">
                                {formatCurrency(fee.platformFee || 0)}
                              </p>
                              {fee.platformFeeDueDate && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                  <FaCalendarAlt className="w-4 h-4" />
                                  <span>Hạn: {formatDate(fee.platformFeeDueDate)}</span>
                                  {fee.platformFeeStatus === 'overdue' && (
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                                      Quá hạn
                                    </span>
                                  )}
                                  {fee.platformFeeStatus === 'failed' && (
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                                      Thanh toán thất bại
                                    </span>
                                  )}
                                  {fee.platformFeeStatus === 'processing' && (
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                                      Đang xử lý
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => onPayPlatformFee(fee.id)}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                  fee.platformFeeStatus === 'failed' 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                                } text-white`}
                              >
                                {fee.platformFeeStatus === 'failed' ? 'Thanh toán lại' : 'Thanh toán'}
                              </button>
                              {fee.platformFeeStatus === 'failed' && (
                                <p className="text-xs text-red-600 text-center">
                                  Thanh toán trước đó thất bại
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Cash Confirmation Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h4 className="text-lg font-bold mb-4">Xác nhận nhận tiền mặt</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số tiền đã nhận (VND)
                  </label>
                  <input
                    type="number"
                    value={confirmationData.amountReceived}
                    onChange={(e) => setConfirmationData({
                      ...confirmationData,
                      amountReceived: e.target.value
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder={selectedPayment.amountReceived}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại xác nhận
                  </label>
                  <select
                    value={confirmationData.confirmationType}
                    onChange={(e) => setConfirmationData({
                      ...confirmationData,
                      confirmationType: e.target.value
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="pickup">Nhận xe</option>
                    <option value="delivery">Giao xe</option>
                    <option value="return">Trả xe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={confirmationData.notes}
                    onChange={(e) => setConfirmationData({
                      ...confirmationData,
                      notes: e.target.value
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows="3"
                    placeholder="Nhập ghi chú nếu có..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleConfirmCash(selectedPayment.paymentId)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashPaymentManagementModal;
