import React, { useState, useEffect } from 'react';
import { 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaStar, 
    FaRegStar, 
    FaUniversity, 
    FaCreditCard, 
    FaCheckCircle,
    FaExclamationTriangle,
    FaShieldAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
    getMyBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    setPrimaryBankAccount,
    checkBankAccountExists,
    getMyBankAccountStats
} from '@/services/api';
import LoadingSpinner from '@/components/ui/Loading/LoadingSpinner';

// Danh sách ngân hàng phổ biến ở Việt Nam
const BANK_LIST = [
  'Vietcombank',
  'VietinBank',
  'BIDV',
  'Techcombank',
  'MB Bank',
  'Agribank',
  'ACB',
  'Sacombank',
  'TPBank',
  'VPBank',
  'SHB',
  'Eximbank',
  'HDBank',
  'VIB',
  'OCB',
  'SCB',
  'SeABank',
  'MSB',
  'Nam A Bank',
  'LienVietPostBank',
  'PG Bank',
  'ABBANK',
  'Bac A Bank',
  'PVcomBank',
  'Saigonbank',
  'Kienlongbank',
  'VietBank',
  'BaoViet Bank',
  'CIMB',
  'Standard Chartered',
  'Hong Leong Bank',
  'Public Bank',
  'Shinhan Bank',
  'UOB',
  'Woori Bank',
  'Indovina Bank',
  'OceanBank',
  'VRB',
  'IVB',
  'NCB',
  'GPBank',
  'VietCapital Bank',
  'VietABank',
  'Co-opBank',
  'Saigonbank',
  'DongA Bank',
  'Nam A Bank',
  'VietBank',
  'Ban Viet Bank',
  'Viet Hoa Bank',
  'Viet Thinh Bank',
  'Viet Phu Bank',
  'Viet Tin Bank',
  'Viet Han Bank',
  'Viet Nga Bank',
  'Viet Lao Bank',
  'Viet My Bank',
  'Viet Thai Bank',
  'Viet Trung Bank',
  'Viet Nhat Bank',
  'Viet Phap Bank',
  'Viet Singapore Bank',
  'Viet Malaysia Bank',
  'Viet Cambodia Bank',
  'Viet Laos Bank',
  'Viet Korea Bank',
  'Viet Australia Bank',
  'Viet Canada Bank',
  'Viet USA Bank',
  'Viet Europe Bank',
  'Viet Africa Bank',
  'Viet Middle East Bank',
  'Viet South America Bank',
  'Viet North America Bank',
  'Viet Oceania Bank',
  'Viet Antarctica Bank'
];

const BankAccountManager = ({ 
    embedded = false,
    showHeader = true,
    title = "Tài khoản ngân hàng",
    subtitle = "Quản lý thông tin thanh toán của bạn"
}) => {
    const [bankAccounts, setBankAccounts] = useState([]);
    const [primaryAccount, setPrimaryAccountState] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [formData, setFormData] = useState({
        accountNumber: '',
        accountHolderName: '',
        bankName: '',
        bankBranch: '',
        swiftCode: '',
        routingNumber: '',
        accountType: 'checking',
        isPrimary: false
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [accountsRes, statsRes] = await Promise.all([
                getMyBankAccounts(),
                getMyBankAccountStats()
            ]);

            if (accountsRes.success) {
                console.log('API data:', accountsRes.data);
                setBankAccounts(accountsRes.data);
                const primary = accountsRes.data.find(acc => acc.isPrimary);
                setPrimaryAccountState(primary || null);
            }

            if (statsRes.success) {
                setStats(statsRes.data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Không thể tải dữ liệu tài khoản ngân hàng');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            accountNumber: '',
            accountHolderName: '',
            bankName: '',
            bankBranch: '',
            swiftCode: '',
            routingNumber: '',
            accountType: 'checking',
            isPrimary: false
        });
        setFormErrors({});
        setEditingAccount(null);
        setShowAddForm(false);
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.accountNumber.trim()) {
            errors.accountNumber = 'Số tài khoản là bắt buộc';
        }

        if (!formData.accountHolderName.trim()) {
            errors.accountHolderName = 'Tên chủ tài khoản là bắt buộc';
        }

        if (!formData.bankName.trim()) {
            errors.bankName = 'Tên ngân hàng là bắt buộc';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);

            if (!editingAccount || editingAccount.accountNumber !== formData.accountNumber) {
                const existsRes = await checkBankAccountExists(formData.accountNumber, formData.bankName);
                if (existsRes.success && existsRes.data.exists) {
                    setFormErrors({ accountNumber: 'Số tài khoản đã tồn tại trong ngân hàng này' });
                    return;
                }
            }

            let response;
            if (editingAccount) {
                response = await updateBankAccount(editingAccount.bankAccountId, {
                    ...formData,
                    userId: editingAccount.userId // <-- BẮT BUỘC PHẢI TRUYỀN
                });
            } else {
                response = await createBankAccount({
                    ...formData,
                    user: { userId: null }
                });
            }

            if (response.success) {
                toast.success(editingAccount ? 'Cập nhật tài khoản thành công!' : 'Thêm tài khoản thành công!');
                resetForm();
                await loadData();
            } else {
                throw new Error(response.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(error.message || 'Không thể lưu tài khoản');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (account) => {
        setFormData({
            accountNumber: account.accountNumber || '',
            accountHolderName: account.accountHolderName || '',
            bankName: account.bankName || '',
            bankBranch: account.bankBranch || '',
            swiftCode: account.swiftCode || '',
            routingNumber: account.routingNumber || '',
            accountType: account.accountType || 'checking',
            isPrimary: account.isPrimary || false
        });
        setEditingAccount(account);
        setShowAddForm(true);
    };

    const handleDelete = async (account) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${account.accountNumber}?`)) {
            return;
        }

        try {
            const response = await deleteBankAccount(account.bankAccountId);
            if (response.success) {
                toast.success('Xóa tài khoản thành công!');
                await loadData();
            } else {
                throw new Error(response.error || 'Không thể xóa tài khoản');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error(error.message || 'Không thể xóa tài khoản');
        }
    };

    const handleSetPrimary = async (account) => {
        try {
            const response = await setPrimaryBankAccount(account.bankAccountId);
            if (response.success) {
                toast.success('Đặt tài khoản chính thành công!');
                await loadData();
            } else {
                throw new Error(response.error || 'Không thể đặt tài khoản chính');
            }
        } catch (error) {
            console.error('Error setting primary:', error);
            toast.error(error.message || 'Không thể đặt tài khoản chính');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="large" color="blue" />
            </div>
        );
    }
    console.log('Bank accounts state:', bankAccounts);
    return (
        <div className={`bank-account-manager ${embedded ? 'embedded' : ''}`}>
            {/* Header - only show if not embedded or showHeader is true */}
            {(!embedded || showHeader) && (
                <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 p-8 text-white relative overflow-hidden rounded-t-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="bg-white/20 p-4 rounded-2xl mr-6 backdrop-blur-sm border border-white/20">
                                    <FaUniversity className="text-4xl" />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-bold mb-2">{title}</h2>
                                    <p className="text-blue-100 text-lg">{subtitle}</p>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 flex items-center transition-all border border-white/20"
                            >
                                <FaPlus className="mr-2" />
                                Thêm tài khoản
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50">
                    <div className="bg-white rounded-xl p-6 shadow-md text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalAccounts}</div>
                        <div className="text-gray-600">Tổng tài khoản</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">{stats.verifiedAccounts}</div>
                        <div className="text-gray-600">Đã xác thực</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                            {stats.hasPrimary ? '1' : '0'}
                        </div>
                        <div className="text-gray-600">Tài khoản chính</div>
                    </div>
                </div>
            )}

            {/* Add button for embedded mode */}
            {embedded && (
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center transition-all shadow-md"
                    >
                        <FaPlus className="mr-2" />
                        Thêm tài khoản
                    </button>
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-800">
                                {editingAccount ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}
                            </h3>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Số tài khoản */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số tài khoản *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.accountNumber}
                                        onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            formErrors.accountNumber ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Nhập số tài khoản"
                                    />
                                    {formErrors.accountNumber && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.accountNumber}</p>
                                    )}
                                </div>

                                {/* Tên chủ tài khoản */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên chủ tài khoản *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.accountHolderName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, accountHolderName: e.target.value }))}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            formErrors.accountHolderName ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Nhập tên chủ tài khoản"
                                    />
                                    {formErrors.accountHolderName && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.accountHolderName}</p>
                                    )}
                                </div>

                                {/* Tên ngân hàng */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên ngân hàng *
                                    </label>
                                    <input
                                        type="text"
                                        list="bank-list"
                                        value={formData.bankName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            formErrors.bankName ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="VD: Vietcombank, BIDV, Techcombank"
                                    />
                                    <datalist id="bank-list">
                                        {BANK_LIST.map((bank, idx) => (
                                            <option value={bank} key={idx} />
                                        ))}
                                    </datalist>
                                    {formErrors.bankName && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.bankName}</p>
                                    )}
                                </div>

                                {/* Chi nhánh */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Chi nhánh
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.bankBranch}
                                        onChange={(e) => setFormData(prev => ({ ...prev, bankBranch: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="VD: Chi nhánh Hà Nội"
                                    />
                                </div>

                                {/* Loại tài khoản */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loại tài khoản
                                    </label>
                                    <select
                                        value={formData.accountType}
                                        onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    >
                                        <option value="checking">Tài khoản thường</option>
                                        <option value="savings">Tài khoản tiết kiệm</option>
                                        <option value="business">Tài khoản doanh nghiệp</option>
                                    </select>
                                </div>

                                {/* SWIFT Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SWIFT Code (Tùy chọn)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.swiftCode}
                                        onChange={(e) => setFormData(prev => ({ ...prev, swiftCode: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="VD: BFTVVNVX"
                                    />
                                </div>
                            </div>

                            {/* Tài khoản chính */}
                            <div className="mt-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPrimary}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                                        className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Đặt làm tài khoản chính
                                    </span>
                                    <FaStar className="ml-2 text-yellow-500" />
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                    Tài khoản chính sẽ được sử dụng mặc định cho các giao dịch
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            {editingAccount ? 'Đang cập nhật...' : 'Đang thêm...'}
                                        </>
                                    ) : (
                                        <>
                                            <i className={`fas fa-${editingAccount ? 'save' : 'plus'}`}></i>
                                            {editingAccount ? 'Cập nhật' : 'Thêm tài khoản'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bank Accounts List */}
            <div className="p-6">
                {bankAccounts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <FaUniversity className="text-4xl text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-4">
                            Chưa có tài khoản ngân hàng
                        </h3>
                        <p className="text-gray-500 mb-8">
                            Thêm tài khoản ngân hàng để thuận tiện cho việc thanh toán
                        </p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center mx-auto"
                        >
                            <FaPlus className="mr-2" />
                            Thêm tài khoản đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {bankAccounts.map((account) => (
                            <div
                                key={account.bankAccountId}
                                className={`bg-white rounded-2xl shadow-lg border overflow-hidden transition-all hover:shadow-xl ${
                                    account.isPrimary ? 'border-yellow-400 ring-2 ring-yellow-100' : 'border-gray-200'
                                }`}
                            >
                                {/* Header */}
                                <div className={`p-6 ${
                                    account.isPrimary 
                                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50' 
                                        : 'bg-gray-50'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center mr-4 ${
                                                account.isPrimary 
                                                    ? 'bg-yellow-100 text-yellow-600' 
                                                    : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                <FaUniversity className="text-2xl" />
                                            </div>
                                            <div>
                                                <div className="flex items-center">
                                                    <h3 className="text-xl font-bold text-gray-800">
                                                        {account.bankName}
                                                    </h3>
                                                    {account.isPrimary && (
                                                        <div className="ml-3 flex items-center">
                                                            <FaStar className="text-yellow-500 mr-1" />
                                                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                                                                Tài khoản chính
                                                            </span>
                                                        </div>
                                                    )}
                                                    {account.isVerified && (
                                                        <div className="ml-3 flex items-center">
                                                            <FaCheckCircle className="text-green-500 mr-1" />
                                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                                                Đã xác thực
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 mt-1">{account.accountHolderName}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {!account.isPrimary && (
                                                <button
                                                    onClick={() => handleSetPrimary(account)}
                                                    className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                                                    title="Đặt làm tài khoản chính"
                                                >
                                                    <FaRegStar />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(account)}
                                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(account)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                                disabled={account.isPrimary}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <div className="flex items-center mb-2">
                                                <FaCreditCard className="text-gray-400 mr-2" />
                                                <span className="text-sm font-medium text-gray-500">Số tài khoản</span>
                                            </div>
                                            <p className="text-lg font-mono font-semibold text-gray-800">
                                                {account.accountNumber}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <div className="flex items-center mb-2">
                                                <FaUniversity className="text-gray-400 mr-2" />
                                                <span className="text-sm font-medium text-gray-500">Chi nhánh</span>
                                            </div>
                                            <p className="text-gray-800">
                                                {account.bankBranch || 'Không xác định'}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <div className="flex items-center mb-2">
                                                <FaShieldAlt className="text-gray-400 mr-2" />
                                                <span className="text-sm font-medium text-gray-500">Loại tài khoản</span>
                                            </div>
                                            <p className="text-gray-800 capitalize">
                                                {account.accountType === 'checking' ? 'Tài khoản thường' :
                                                 account.accountType === 'savings' ? 'Tài khoản tiết kiệm' :
                                                 account.accountType === 'business' ? 'Tài khoản doanh nghiệp' :
                                                 account.accountType}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Additional info */}
                                    {(account.swiftCode || account.routingNumber) && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {account.swiftCode && (
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-500">SWIFT Code:</span>
                                                        <p className="text-gray-800 font-mono">{account.swiftCode}</p>
                                                    </div>
                                                )}
                                                {account.routingNumber && (
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-500">Routing Number:</span>
                                                        <p className="text-gray-800 font-mono">{account.routingNumber}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Warning cho tài khoản chưa xác thực */}
                                    {!account.isVerified && (
                                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                            <div className="flex items-center">
                                                <FaExclamationTriangle className="text-yellow-500 mr-2" />
                                                <span className="text-sm text-yellow-800">
                                                    Tài khoản chưa được xác thực. Vui lòng liên hệ hỗ trợ để xác thực.
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BankAccountManager;