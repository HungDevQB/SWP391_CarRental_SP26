import React, { useState, useEffect } from 'react';
import { FaUniversity, FaStar, FaCheckCircle } from 'react-icons/fa';
import { getMyVerifiedBankAccounts } from '@/services/api';
import LoadingSpinner from '@/components/ui/Loading/LoadingSpinner';

const BankAccountSelector = ({ onSelect, selectedAccountId, className = '' }) => {
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBankAccounts();
    }, []);

    const loadBankAccounts = async () => {
        try {
            const response = await getMyVerifiedBankAccounts();
            if (response.success) {
                setBankAccounts(response.data);
                // Auto select primary account if available
                const primaryAccount = response.data.find(acc => acc.isPrimary);
                if (primaryAccount && !selectedAccountId) {
                    onSelect(primaryAccount);
                }
            }
        } catch (error) {
            console.error('Error loading bank accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="medium" color="blue" />
            </div>
        );
    }

    if (bankAccounts.length === 0) {
        return (
            <div className="text-center py-8 px-4 bg-gray-50 rounded-xl">
                <FaUniversity className="text-4xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Chưa có tài khoản ngân hàng
                </h3>
                <p className="text-gray-500 mb-4">
                    Bạn cần thêm và xác thực tài khoản ngân hàng để thực hiện giao dịch
                </p>
                <button 
                    onClick={() => window.open('/profile?tab=banking', '_blank')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Thêm tài khoản ngân hàng
                </button>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Chọn tài khoản ngân hàng
            </h3>
            
            {bankAccounts.map((account) => (
                <div
                    key={account.bankAccountId}
                    onClick={() => onSelect(account)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        selectedAccountId === account.bankAccountId
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                <FaUniversity className="text-blue-600" />
                            </div>
                            <div>
                                <div className="flex items-center">
                                    <h4 className="font-semibold text-gray-800">
                                        {account.bankName}
                                    </h4>
                                    {account.isPrimary && (
                                        <FaStar className="text-yellow-500 ml-2" />
                                    )}
                                    <FaCheckCircle className="text-green-500 ml-2" />
                                </div>
                                <p className="text-sm text-gray-600">
                                    {account.accountHolderName}
                                </p>
                                <p className="text-sm font-mono text-gray-500">
                                    **** **** {account.accountNumber.slice(-4)}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center">
                            {account.isPrimary && (
                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold mr-2">
                                    Chính
                                </span>
                            )}
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                                Đã xác thực
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BankAccountSelector;