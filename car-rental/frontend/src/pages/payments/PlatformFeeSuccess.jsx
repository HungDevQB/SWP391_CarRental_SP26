import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Receipt, XCircle, AlertTriangle } from 'lucide-react';

const PlatformFeeSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [paymentId, setPaymentId] = useState(null);
    const [isRealSuccess, setIsRealSuccess] = useState(false);
    const [allParams, setAllParams] = useState({});

    useEffect(() => {
        const id = searchParams.get('paymentId');
        const responseCode = searchParams.get('vnp_ResponseCode');
        const transactionNo = searchParams.get('vnp_TransactionNo');
        const txnRef = searchParams.get('vnp_TxnRef');
        
        // Collect all parameters for debugging
        const params = {};
        for (const [key, value] of searchParams.entries()) {
            params[key] = value;
        }
        setAllParams(params);
        
        if (id) {
            setPaymentId(id);
        }
        
        // Check if this is a real VNPay callback (has vnp_ResponseCode)
        if (responseCode && responseCode === '00') {
            setIsRealSuccess(true);
        } else if (responseCode && responseCode !== '00') {
            // This is a callback but with error
            setIsRealSuccess(false);
        } else {
            // No VNPay parameters - this might be a cancelled payment
            setIsRealSuccess(false);
        }
        
        console.log('PlatformFeeSuccess - All params:', params);
        console.log('PlatformFeeSuccess - ResponseCode:', responseCode);
        console.log('PlatformFeeSuccess - IsRealSuccess:', responseCode === '00');
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    {isRealSuccess ? (
                        <>
                            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                Thanh toán thành công!
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Phí platform đã được thanh toán thành công
                            </p>
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                Thanh toán chưa hoàn tất
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Thanh toán có thể đã bị hủy hoặc chưa được xác nhận
                            </p>
                        </>
                    )}
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Mã thanh toán:</span>
                            <span className="text-sm font-bold text-gray-900">
                                {paymentId || 'Đang tải...'}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
                            {isRealSuccess ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Thành công
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Chưa xác nhận
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Thời gian:</span>
                            <span className="text-sm text-gray-900">
                                {new Date().toLocaleString('vi-VN')}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {isRealSuccess ? (
                        <>
                            <button
                                onClick={() => navigate('/supplier/dashboard')}
                                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Về trang chủ
                            </button>
                            
                            <button
                                onClick={() => navigate('/supplier/orders')}
                                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Receipt className="w-4 h-4 mr-2" />
                                Xem đơn hàng
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/supplier/platform-fees')}
                                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                <Receipt className="w-4 h-4 mr-2" />
                                Thử thanh toán lại
                            </button>
                            
                            <button
                                onClick={() => navigate('/supplier/dashboard')}
                                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Về trang chủ
                            </button>
                        </>
                    )}
                </div>
                
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Cảm ơn bạn đã sử dụng dịch vụ. Nếu có thắc mắc, vui lòng liên hệ hỗ trợ.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PlatformFeeSuccess;
