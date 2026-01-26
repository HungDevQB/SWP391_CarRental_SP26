import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component xử lý thanh toán lại cho booking bị failed
 * Props:
 *   - booking: object booking cần thanh toán lại
 *   - user: object user hiện tại
 *   - onSuccess: callback khi chuyển trang thành công
 *   - onError: callback khi có lỗi
 */
const RetryPaymentHandler = ({ booking, user, onSuccess, onError }) => {
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    try {
      const total = booking.totalAmount ?? 0;
      const deposit = booking.depositAmount ?? 0;
      // Luôn tạo mới priceBreakdown với đủ trường, tính phí dịch vụ và VAT = 10% basePrice
      const basePrice = booking.basePrice || booking.totalAmount || 0;
      const serviceFee = Math.round(basePrice * 0.1);
      const tax = Math.round(basePrice * 0.1);
      const priceBreakdown = {
        total: basePrice,
        basePrice,
        serviceFee,
        tax,
        discount: 0,
        deposit: deposit,
      };
      const customerInfo = {
        fullName: booking.customer?.fullName || user?.userDetail?.fullName || user?.username || '',
        phone: booking.customer?.phone || user?.phone || '',
        email: booking.customer?.email || user?.email || '',
        pickupAddress: booking.pickupLocation || '',
        dropoffAddress: booking.dropoffLocation || '',
      };
      const bookingInfo = {
        carId: booking.carId,
        pickupDateTime: booking.pickupDateTime,
        dropoffDateTime: booking.dropoffDateTime,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        seatNumber: booking.seatNumber,
        withDriver: booking.withDriver,
        deliveryRequested: booking.deliveryRequested,
      };
      navigate('/payment', {
        state: {
          bookingId: booking.bookingId,
          bookingInfo,
          depositAmount: deposit,
          collateralAmount: 5000000,
          priceBreakdown,
          customerInfo,
          withDriver: booking.withDriver,
          deliveryRequested: booking.deliveryRequested,
          fromHistory: true,
          paymentType: (booking.hasDeposit && !booking.hasFullPayment) ? 'full_payment' : 'deposit'
        }
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      if (onError) onError(err);
    }
  };

  return (
    <button
      className="btn-action pay-again"
      onClick={handleRetryPayment}
      title="Thanh toán lại"
    >
      <i className="fas fa-redo"></i>
      <span>Thanh toán lại</span>
    </button>
  );
};

export default RetryPaymentHandler; 