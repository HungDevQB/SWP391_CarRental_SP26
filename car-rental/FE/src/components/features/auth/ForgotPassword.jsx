import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkEmail } from '../../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await checkEmail(email);
      setMessage('Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || 'Không thể gửi email. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Quên mật khẩu</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập email đã đăng ký"
            />
          </div>
          {message && <div className="bg-green-100 text-green-700 p-2 rounded">{message}</div>}
          {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-all"
          >
            {loading ? 'Đang gửi...' : 'Gửi email đặt lại mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 