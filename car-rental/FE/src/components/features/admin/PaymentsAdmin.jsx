import { useEffect, useState } from 'react';
import { getAllPayments, refundDeposit, payoutSupplier, getPayoutAmount } from '@/services/api';
import { FaMoneyCheckAlt, FaSyncAlt, FaCheckCircle, FaTimesCircle, FaDownload, FaSearch, FaFilter, FaEye, FaUndo, FaMoneyBillWave } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';

function ConfirmActionModal({ open, onClose, onConfirm, actionType, payment, payoutLoading, payoutError, payoutAmount, payoutCurrency }) {
  if (!open || !payment) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              actionType === 'refund' 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                : 'bg-gradient-to-r from-green-400 to-emerald-500'
            }`}>
              {actionType === 'refund' ? <FaUndo className="text-2xl text-white" /> : <FaMoneyBillWave className="text-2xl text-white" />}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {actionType === 'refund' ? 'Xác nhận hoàn cọc' : 'Xác nhận payout cho supplier'}
            </h3>
            <p className="text-gray-600">
              {actionType === 'refund' 
                ? 'Bạn có chắc chắn muốn hoàn cọc cho khách hàng này?' 
                : 'Bạn có chắc chắn muốn chuyển tiền cho supplier này?'}
            </p>
          </div>

          <div className="mb-6 space-y-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl">
            <div className="flex justify-between">
              <span className="font-semibold">Booking ID:</span>
              <span className="font-mono">{payment.bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Khách hàng:</span>
              <span>{payment.customerName || payment.customer?.fullName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Supplier:</span>
              <span>{payment.supplierName || payment.supplier?.fullName || '-'}</span>
            </div>
            {actionType === 'payout' ? (
              payoutLoading ? (
                <div className="text-blue-600 flex items-center gap-2">
                  <FaSyncAlt className="animate-spin" />
                  Đang lấy số tiền payout...
                </div>
              ) : payoutError ? (
                <div className="text-red-600 flex items-center gap-2">
                  <FaTimesCircle />
                  Lỗi: {payoutError}
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="font-semibold">Số tiền:</span>
                  <span className="font-bold text-green-600">
                    {Number(payoutAmount ?? payment.amount).toLocaleString('vi-VN')} {payoutCurrency || 'VND'}
                  </span>
                </div>
              )
            ) : (
              <div className="flex justify-between">
                <span className="font-semibold">Số tiền:</span>
                <span className="font-bold text-yellow-600">
                  {Number(payment.amount).toLocaleString('vi-VN')} VND
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <motion.button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white rounded-xl font-medium shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Hủy
            </motion.button>
            <motion.button
              onClick={onConfirm}
              disabled={actionType === 'payout' && payoutLoading}
              className={`flex-1 px-6 py-3 rounded-xl text-white font-medium shadow-lg transition-all duration-300 ${
                actionType === 'refund'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {payoutLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSyncAlt className="animate-spin" />
                  Đang xử lý...
                </div>
              ) : (
                'Xác nhận'
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function PaymentDetailsModal({ open, onClose, payments, bookingId }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaEye className="text-blue-500" />
              Lịch sử thanh toán - Booking #{bookingId}
            </h3>
            <motion.button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimesCircle className="text-gray-500" />
            </motion.button>
          </div>

          <div className="space-y-4">
            {payments.map((p, idx) => (
              <motion.div
                key={p.paymentId || p.transactionId || idx}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold capitalize text-gray-800">
                    {p.paymentType === 'deposit' ? 'Cọc' : 
                     p.paymentType === 'full_payment' ? 'Thanh toán đủ' : 
                     p.paymentType === 'refund' ? 'Hoàn cọc' : 
                     p.paymentType === 'payout' ? 'Payout' : p.paymentType}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    p.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 
                    p.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {p.paymentStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-bold text-lg text-gray-800">
                    {Number(p.amount).toLocaleString('vi-VN')} VND
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Phương thức: {p.paymentMethod?.toUpperCase() || 'N/A'}</span>
                  <span>|</span>
                  <span>Ngày: {p.paymentDate ? new Date(p.paymentDate).toLocaleString('vi-VN') : 'N/A'}</span>
                  {p.transactionId && (
                    <>
                      <span>|</span>
                      <span>Mã GD: <code className="bg-gray-200 px-1 rounded">{p.transactionId}</code></span>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <motion.button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white rounded-xl font-medium shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Đóng
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function PaymentsAdmin() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, actionType: '', payment: null });
  const [detailModal, setDetailModal] = useState({ open: false, payments: [], bookingId: null });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState(null);
  const [payoutCurrency, setPayoutCurrency] = useState('VND');
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPayments();
      setPayments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  // Reset currentPage khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter]);

  const handleRefund = (bookingId) => {
    const payment = payments.find(p => p.bookingId === bookingId && p.paymentType === 'full_payment');
    setModal({ open: true, actionType: 'refund', payment });
  };

  const handlePayout = async (bookingId) => {
    // Ưu tiên lấy payment payout nếu đã có (để lấy đúng amount), nếu chưa có thì lấy full_payment
    const payoutPayment = payments.find(p => p.bookingId === bookingId && p.paymentType === 'payout');
    const payment = payoutPayment || payments.find(p => p.bookingId === bookingId && p.paymentType === 'full_payment');
    setModal({ open: true, actionType: 'payout', payment });
    setPayoutError(null);
    setPayoutAmount(null);
    setPayoutCurrency('VND');
    if (!payoutPayment) {
      setPayoutLoading(true);
      try {
        const data = await getPayoutAmount(bookingId);
        setPayoutAmount(Number(data.payoutAmount));
        setPayoutCurrency(data.currency || 'VND');
      } catch (err) {
        setPayoutError(err.message || 'Không lấy được số tiền payout');
      } finally {
        setPayoutLoading(false);
      }
    } else {
      setPayoutAmount(Number(payment.amount));
      setPayoutCurrency(payment.currency || 'VND');
    }
  };

  const confirmAction = async () => {
    const { actionType, payment } = modal;
    try {
      if (actionType === 'refund') {
        await refundDeposit(payment.bookingId);
        toast.success('Hoàn cọc thành công!');
      } else {
        await payoutSupplier(payment.bookingId);
        toast.success('Payout thành công!');
      }
      fetchPayments();
    } catch (err) {
      toast.error((actionType === 'refund' ? 'Hoàn cọc' : 'Payout') + ' thất bại: ' + err.message);
    } finally {
      setModal({ open: false, actionType: '', payment: null });
    }
  };

  const handleViewDetails = (bookingId) => {
    const relatedPayments = payments.filter(p => p.bookingId === bookingId);
    setDetailModal({ open: true, payments: relatedPayments, bookingId });
  };

  const filteredPayments = payments.filter(p => {
    const searchText = search.toLowerCase();
    const matchSearch =
      !searchText ||
      (p.bookingId && String(p.bookingId).includes(searchText)) ||
      (p.customerName && p.customerName.toLowerCase().includes(searchText)) ||
      (p.supplierName && p.supplierName.toLowerCase().includes(searchText));
    const matchType = typeFilter === 'all' || p.paymentType === typeFilter;
    const matchStatus = statusFilter === 'all' || (p.paymentStatus && p.paymentStatus.toLowerCase() === statusFilter);
    return matchSearch && matchType && matchStatus;
  });

  // Logic phân trang
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleExportCSV = () => {
    if (!filteredPayments.length) {
      toast.info('Không có dữ liệu để xuất!');
      return;
    }
    const csv = Papa.unparse(
      filteredPayments.map(p => ({
        BookingID: p.bookingId,
        Customer: p.customerName || p.customer?.fullName || '-',
        Supplier: p.supplierName || p.supplier?.fullName || '-',
        Amount: p.amount,
        Currency: p.currency,
        Type: p.paymentType,
        Status: p.paymentStatus,
        Date: p.paymentDate ? new Date(p.paymentDate).toLocaleString('vi-VN') : '-',
        TransactionID: p.transactionId,
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payments_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div
        className="mb-8 text-center"
        variants={itemVariants}
      >
        <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl text-white">
          <div className="p-3 bg-white bg-opacity-20 rounded-xl">
            <FaMoneyCheckAlt className="text-3xl" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Quản lý thanh toán & hoàn tiền</h1>
            <p className="text-blue-100 text-lg">Kiểm soát refund, payout và trạng thái giao dịch</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        variants={itemVariants}
      >
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl">
              <FaMoneyCheckAlt className="text-white text-xl" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Tổng giao dịch</p>
              <p className="text-2xl font-bold text-gray-800">{payments.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg border border-green-100"
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl">
              <FaCheckCircle className="text-white text-xl" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Đã thanh toán</p>
              <p className="text-2xl font-bold text-gray-800">
                {payments.filter(p => p.paymentStatus === 'paid').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100"
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
              <FaSyncAlt className="text-white text-xl" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Chờ xử lý</p>
              <p className="text-2xl font-bold text-gray-800">
                {payments.filter(p => p.paymentStatus === 'pending').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100"
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl">
              <FaMoneyBillWave className="text-white text-xl" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Tổng tiền</p>
              <p className="text-2xl font-bold text-gray-800">
                {payments
                  .filter(p => p.paymentStatus === 'paid')
                  .reduce((sum, p) => sum + Number(p.amount), 0)
                  .toLocaleString('vi-VN')} VND
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bộ lọc/tìm kiếm */}
      <motion.div
        className="mb-6 p-6 bg-white rounded-2xl shadow-lg border border-blue-200"
        variants={itemVariants}
      >
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
              <FaSearch className="text-blue-500" />
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm Booking ID, khách, supplier..."
              className="border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm min-w-[200px]"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
              <FaFilter className="text-blue-500" />
              Loại giao dịch
            </label>
            <select
              className="border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm min-w-[150px]"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="all">Tất cả loại</option>
              <option value="deposit">Cọc</option>
              <option value="full_payment">Thanh toán đủ</option>
              <option value="refund">Hoàn cọc</option>
              <option value="payout">Payout</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
              <FaFilter className="text-blue-500" />
              Trạng thái
            </label>
            <select
              className="border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm min-w-[150px]"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Chờ xử lý</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>
          <motion.button
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg transition-all duration-300 flex items-center gap-2"
            onClick={handleExportCSV}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaDownload />
            Xuất CSV
          </motion.button>
        </div>
      </motion.div>

      {/* Bảng dữ liệu */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-200"
        variants={itemVariants}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <th className="py-4 px-6 text-left font-bold">
                  <span className="inline-flex items-center gap-2">#️⃣ Booking ID</span>
                </th>
                <th className="py-4 px-6 text-left font-bold">
                  <span className="inline-flex items-center gap-2">👤 Khách hàng</span>
                </th>
                <th className="py-4 px-6 text-left font-bold">
                  <span className="inline-flex items-center gap-2">🚗 Supplier</span>
                </th>
                <th className="py-4 px-6 text-left font-bold">
                  <span className="inline-flex items-center gap-2">📄 Loại</span>
                </th>
                <th className="py-4 px-6 text-left font-bold">
                  <span className="inline-flex items-center gap-2">💰 Số tiền</span>
                </th>
                <th className="py-4 px-6 text-left font-bold">
                  <span className="inline-flex items-center gap-2">📊 Trạng thái</span>
                </th>
                <th className="py-4 px-6 text-left font-bold">
                  <span className="inline-flex items-center gap-2">📅 Ngày</span>
                </th>
                <th className="py-4 px-6 text-center font-bold">
                  <span className="inline-flex items-center gap-2">⚡ Hành động</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-blue-600 font-semibold">
                      <FaSyncAlt className="animate-spin text-xl" />
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-red-600 font-semibold">
                      <FaTimesCircle className="text-xl" />
                      {error}
                    </div>
                  </td>
                </tr>
              ) : currentPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500 font-medium">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                currentPayments.map((p, idx) => (
                  <motion.tr
                    key={p.paymentId || p.transactionId || idx}
                    className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ x: 5 }}
                  >
                    <td className="py-4 px-6 font-mono font-semibold">{p.bookingId}</td>
                    <td className="py-4 px-6">{p.customerName || p.customer?.fullName || '-'}</td>
                    <td className="py-4 px-6">{p.supplierName || p.supplier?.fullName || '-'}</td>
                    <td className="py-4 px-6">
                      <span className="capitalize px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {p.paymentType === 'deposit' ? 'Cọc' : 
                         p.paymentType === 'full_payment' ? 'Thanh toán đủ' : 
                         p.paymentType === 'refund' ? 'Hoàn cọc' : 
                         p.paymentType === 'payout' ? 'Payout' : p.paymentType}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-lg">
                      {Number(p.amount).toLocaleString('vi-VN')} {p.currency || 'VND'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 
                        p.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleString('vi-VN') : '-'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg transition-all duration-300"
                          onClick={() => handleViewDetails(p.bookingId)}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          title="Xem chi tiết"
                        >
                          <FaEye className="text-sm" />
                        </motion.button>
                        {p.paymentType === 'full_payment' && p.paymentStatus === 'paid' && (
                          <motion.button
                            className="p-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg transition-all duration-300"
                            onClick={() => handleRefund(p.bookingId)}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            title="Hoàn cọc"
                          >
                            <FaUndo className="text-sm" />
                          </motion.button>
                        )}
                        {p.paymentType === 'full_payment' && p.paymentStatus === 'paid' && (
                          <motion.button
                            className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transition-all duration-300"
                            onClick={() => handlePayout(p.bookingId)}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            title="Payout"
                          >
                            <FaMoneyBillWave className="text-sm" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <motion.div
          className="flex justify-center items-center gap-4 mt-8"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Trước
          </motion.button>
          
          <div className="flex items-center gap-2">
            {(() => {
              const maxVisiblePages = 5;
              let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
              let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
              
              // Điều chỉnh nếu endPage quá gần cuối
              if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
              }
              
              const pages = [];
              for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
              }
              
              return pages.map((page) => (
                <motion.button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-md'
                  }`}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {page}
                </motion.button>
              ));
            })()}
          </div>
          
          <motion.button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            Sau →
          </motion.button>
        </motion.div>
      )}

      <ConfirmActionModal
        open={modal.open}
        onClose={() => { setModal({ open: false, actionType: '', payment: null }); setPayoutError(null); setPayoutAmount(null); setPayoutLoading(false); }}
        onConfirm={confirmAction}
        actionType={modal.actionType}
        payment={modal.payment}
        payoutLoading={modal.actionType === 'payout' ? payoutLoading : false}
        payoutError={modal.actionType === 'payout' ? payoutError : null}
        payoutAmount={modal.actionType === 'payout' ? payoutAmount : null}
        payoutCurrency={modal.actionType === 'payout' ? payoutCurrency : null}
      />
      <PaymentDetailsModal
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, payments: [], bookingId: null })}
        payments={detailModal.payments}
        bookingId={detailModal.bookingId}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
}

export default PaymentsAdmin; 