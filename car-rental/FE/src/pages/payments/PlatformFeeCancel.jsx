import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, Home, RefreshCw, AlertCircle } from 'lucide-react';

const PlatformFeeCancel = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const errorCode = searchParams.get('error');
        if (errorCode) {
            setError(errorCode);
        }
    }, [searchParams]);

    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case '01':
                return 'Thẻ/Tài khoản hết hạn';
            case '02':
                return 'Thẻ/Tài khoản bị khóa';
            case '03':
                return 'Thẻ/Tài khoản không tồn tại';
            case '04':
                return 'Thẻ/Tài khoản không đủ số dư';
            case '05':
                return 'Thẻ/Tài khoản không đúng';
            case '06':
                return 'Quá số lần nhập sai';
            case '07':
                return 'Giao dịch không thành công';
            case '08':
                return 'Hệ thống ngân hàng đang bảo trì';
            case '09':
                return 'Giao dịch không được chấp thuận';
            case '10':
                return 'Giao dịch thất bại';
            case '11':
                return 'Thanh toán thất bại';
            case '12':
                return 'Thẻ/Tài khoản bị tạm khóa';
            case '13':
                return 'Mã OTP không đúng';
            case '24':
                return 'Giao dịch bị hủy';
            default:
                return 'Thanh toán không thành công';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <XCircle className="mx-auto h-16 w-16 text-red-500" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Thanh toán thất bại!
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Thanh toán phí platform không thành công
                    </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Thất bại
                            </span>
                        </div>
                        
                        {error && (
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-red-800">Lý do thất bại:</p>
                                    <p className="text-sm text-red-600">{getErrorMessage(error)}</p>
                                    <p className="text-xs text-gray-500 mt-1">Mã lỗi: {error}</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Thời gian:</span>
                            <span className="text-sm text-gray-900">
                                {new Date().toLocaleString('vi-VN')}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Lưu ý quan trọng
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>• Phí platform vẫn chưa được thanh toán</p>
                                <p>• Bạn cần thực hiện thanh toán lại</p>
                                <p>• Liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/supplier/dashboard')}
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Thử lại thanh toán
                    </button>
                    
                    <button
                        onClick={() => navigate('/supplier/dashboard')}
                        className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Về trang chủ
                    </button>
                </div>
                
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Cần hỗ trợ? Liên hệ hotline: 1900-xxxx hoặc email: support@carrental.com
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PlatformFeeCancel;
