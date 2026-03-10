// StripePayment - Stripe Elements integration for secure card payments
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../../services/api';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TCc39BDonNUml1zWfItZQdEnZ0aPJSiidpg5adP8cAudhqJX57fAl0mANpcC7mAD6C4QA2tMWQ4tbMU8TAsaHsW00S6Ll0EBg';
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ bookingId, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'Thanh toán thất bại');
      onError?.(error.message);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await api.post('/api/payment/stripe/confirm', {
          bookingId,
          paymentIntentId: paymentIntent.id,
        });
        onSuccess?.(paymentIntent);
      } catch (err) {
        setMessage('Thanh toán thành công nhưng không thể cập nhật đơn hàng');
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {message && (
        <p className="text-sm text-red-600 mt-2">{message}</p>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
      </button>
    </form>
  );
}

export default function StripePayment({ bookingId, amount, onSuccess, onError }) {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [initiated, setInitiated] = useState(false);

  const initPayment = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/payment/stripe/create-intent', { bookingId, amount });
      setClientSecret(res.data?.clientSecret || '');
      setInitiated(true);
    } catch (err) {
      if (err.response?.status === 401) {
        ['token', 'expiresAt', 'role', 'username', 'userId'].forEach(k => localStorage.removeItem(k));
        onError?.('Phiên đăng nhập hết hạn. Đang chuyển đến trang đăng nhập...');
        setTimeout(() => { window.location.href = '/login?redirectTo=/payment'; }, 2000);
      } else {
        onError?.('Không thể khởi tạo thanh toán Stripe. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!initiated) {
    return (
      <div className="text-center">
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-8" />
          </div>
          <p className="text-sm text-gray-600">Thanh toán an toàn qua Stripe</p>
          <p className="text-xs text-gray-400 mt-1">Hỗ trợ Visa, Mastercard, và nhiều hơn nữa</p>
        </div>
        <button
          onClick={initPayment}
          disabled={loading}
          className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Đang tải...' : `Thanh toán ${Number(amount).toLocaleString('vi-VN')} VND`}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6" />
        <span className="text-sm text-gray-500">Thanh toán bảo mật</span>
      </div>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret, locale: 'vi' }}>
          <CheckoutForm bookingId={bookingId} onSuccess={onSuccess} onError={onError} />
        </Elements>
      )}
    </div>
  );
}
