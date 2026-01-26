import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const VNPAY_ERROR_CODES = {
    '01': 'Giao dịch đã tồn tại. Yêu cầu Giao dịch lại.',
    '02': 'Merchant không hợp lệ (IP không được phép, sai chữ ký...).',
    '03': 'Dữ liệu gửi đi không đúng định dạng.',
    '04': 'Khởi tạo giao dịch không thành công do Website đang bị tạm khóa.',
    '05': 'Giao dịch không thành công do có lỗi trong quá trình xử lý.',
    '06': 'Giao dịch không thành công do lỗi kết nối đến hệ thống của Ngân hàng.',
    '07': 'Giao dịch không thành công do khách hàng nhập sai thông tin thanh toán.',
    '08': 'Giao dịch không thành công do không xác thực được khách hàng.',
    '09': 'Giao dịch không thành công do thẻ/tài khoản của khách hàng không đủ điều kiện thanh toán.',
    '10': 'Giao dịch không thành công do thẻ/tài khoản của khách hàng đã bị khóa.',
    '11': 'Giao dịch không thành công do khách hàng đã hủy giao dịch.',
    '12': 'Giao dịch không thành công do hết hạn thanh toán.',
    '13': 'Giao dịch không thành công do khách hàng nhập sai mật khẩu xác thực (OTP).',
    '24': 'Giao dịch không thành công do khách hàng hủy giao dịch.',
    '51': 'Giao dịch không thành công do tài khoản của quý khách không đủ số dư.',
    '65': 'Giao dịch không thành công do tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
    '99': 'Các lỗi khác.',
    'server_error': 'Đã có lỗi xảy ra ở phía máy chủ. Vui lòng thử lại sau.'
};

const PaymentFailedPage = () => {
    const [searchParams] = useSearchParams();
    const [errorMessage, setErrorMessage] = useState("Thanh toán của bạn đã không thể hoàn tất.");
    const errorCode = searchParams.get('error_code');

    useEffect(() => {
        if (errorCode && VNPAY_ERROR_CODES[errorCode]) {
            setErrorMessage(VNPAY_ERROR_CODES[errorCode]);
        }
        // Log khi trang thất bại mount
        console.log('[PaymentFailedPage] Mounted. errorCode:', errorCode, 'errorMessage:', VNPAY_ERROR_CODES[errorCode] || errorMessage);
    }, [errorCode]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center border-t-4 border-red-500">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="ri-close-line text-4xl text-red-600"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Thanh toán thất bại</h2>
                <p className="text-gray-600 mb-6">
                    {errorMessage}
                </p>
                {errorCode && (
                    <p className="text-sm text-gray-500 mb-6">Mã lỗi: {errorCode}</p>
                )}
                <div className="space-y-3">
                    <Link
                        to="/search" // Hoặc quay lại trang chi tiết xe
                        className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                    >
                        Thử lại với xe khác
                    </Link>
                    <Link
                        to="/"
                        className="block w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
                    >
                        Về trang chủ
                    </Link>
                    <button
                        type="button"
                        onClick={() => window.location.assign('/profile?tab=bookings')}
                        className="block w-full border border-blue-300 text-blue-700 py-3 rounded-xl font-medium hover:bg-blue-50 transition-all duration-300"
                    >
                        Xem lịch sử đặt & thanh toán lại
                    </button>
                </div>
                <div className="mt-6 text-xs text-gray-400">
                    <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi.</p>
                    <p className="text-red-500 font-semibold mt-2">Bạn có thể vào <Link to="/profile" className="underline text-blue-600">lịch sử đặt</Link> để thanh toán lại đơn này.</p>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailedPage; 