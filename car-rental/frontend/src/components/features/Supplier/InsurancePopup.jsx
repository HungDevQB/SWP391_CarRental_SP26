import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaShieldAlt, FaTimes, FaSave, FaCar, FaTools, FaCalendarAlt, FaWrench, FaCheck } from "react-icons/fa";
import LoadingSpinner from "@/components/ui/Loading/LoadingSpinner";

const InsurancePopup = ({ isOpen, onClose, carData, onSubmit }) => {
  const [activeTab, setActiveTab] = useState("insurance"); // "insurance" or "maintenance"
  const [insuranceForm, setInsuranceForm] = useState({
    insuranceType: "Bảo hiểm bắt buộc",
    insuranceCompany: "",
    policyNumber: "",
    startDate: "",
    endDate: "",
    premium: "",
    coverage: "",
    notes: ""
  });
  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenanceType: "Bảo trì định kỳ",
    serviceCenter: "",
    lastServiceDate: "",
    nextServiceDate: "",
    serviceCost: "",
    serviceDetails: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInsuranceChange = (e) => {
    const { name, value } = e.target;
    setInsuranceForm({ ...insuranceForm, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMaintenanceChange = (e) => {
    const { name, value } = e.target;
    setMaintenanceForm({ ...maintenanceForm, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateInsuranceForm = () => {
    const newErrors = {};
    
    if (!insuranceForm.insuranceCompany.trim()) {
      newErrors.insuranceCompany = 'Tên công ty bảo hiểm là bắt buộc';
    }
    
    if (!insuranceForm.policyNumber.trim()) {
      newErrors.policyNumber = 'Số hợp đồng bảo hiểm là bắt buộc';
    }
    
    if (!insuranceForm.startDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    }
    
    if (!insuranceForm.endDate) {
      newErrors.endDate = 'Ngày kết thúc là bắt buộc';
    } else if (insuranceForm.startDate && new Date(insuranceForm.endDate) <= new Date(insuranceForm.startDate)) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    
    if (!insuranceForm.premium) {
      newErrors.premium = 'Phí bảo hiểm là bắt buộc';
    } else if (parseFloat(insuranceForm.premium) <= 0) {
      newErrors.premium = 'Phí bảo hiểm phải lớn hơn 0';
    }
    
    if (!insuranceForm.coverage.trim()) {
      newErrors.coverage = 'Phạm vi bảo hiểm là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMaintenanceForm = () => {
    const newErrors = {};
    
    if (!maintenanceForm.serviceCenter.trim()) {
      newErrors.serviceCenter = 'Tên trung tâm bảo trì là bắt buộc';
    }
    
    if (!maintenanceForm.lastServiceDate) {
      newErrors.lastServiceDate = 'Ngày bảo trì gần nhất là bắt buộc';
    }
    
    if (!maintenanceForm.nextServiceDate) {
      newErrors.nextServiceDate = 'Ngày bảo trì tiếp theo là bắt buộc';
    } else if (maintenanceForm.lastServiceDate && new Date(maintenanceForm.nextServiceDate) <= new Date(maintenanceForm.lastServiceDate)) {
      newErrors.nextServiceDate = 'Ngày bảo trì tiếp theo phải sau ngày bảo trì gần nhất';
    }
    
    if (!maintenanceForm.serviceCost) {
      newErrors.serviceCost = 'Chi phí bảo trì là bắt buộc';
    } else if (parseFloat(maintenanceForm.serviceCost) <= 0) {
      newErrors.serviceCost = 'Chi phí bảo trì phải lớn hơn 0';
    }
    
    if (!maintenanceForm.serviceDetails.trim()) {
      newErrors.serviceDetails = 'Chi tiết bảo trì là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = false;
    if (activeTab === "insurance") {
      isValid = validateInsuranceForm();
    } else {
      isValid = validateMaintenanceForm();
    }

    if (!isValid) {
      toast.error(`Vui lòng kiểm tra lại thông tin ${activeTab === "insurance" ? "bảo hiểm" : "bảo trì"}`);
      return;
    }

    setLoading(true);
    try {
      let data;
      if (activeTab === "insurance") {
        data = {
          type: "insurance",
          carId: carData?.carId || carData?.id,
          carName: carData?.model || carData?.name,
          ...insuranceForm,
          premium: parseFloat(insuranceForm.premium),
          status: "Chờ duyệt" // Thay đổi từ "Còn hiệu lực" sang "Chờ duyệt"
        };
      } else {
        data = {
          type: "maintenance",
          carId: carData?.carId || carData?.id,
          carName: carData?.model || carData?.name,
          ...maintenanceForm,
          serviceCost: parseFloat(maintenanceForm.serviceCost),
          status: "Chờ duyệt" // Thay đổi từ "Đã hoàn thành" sang "Chờ duyệt"
        };
      }
      
      await onSubmit(data);
      toast.success(`Đã xác nhận thông tin ${activeTab === "insurance" ? "bảo hiểm" : "bảo trì"} cho xe mới`);
      onClose();
    } catch (error) {
      toast.error(`Có lỗi xảy ra khi xác nhận ${activeTab === "insurance" ? "bảo hiểm" : "bảo trì"}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-5 translate-x-5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-4 rounded-2xl mr-6 backdrop-blur-sm border border-white/20">
                  <FaShieldAlt className="text-4xl" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Xác nhận Bảo hiểm & Bảo trì</h2>
                  <p className="text-emerald-100 text-lg">
                    Thông tin cho xe mới: <span className="font-bold">{carData?.model || carData?.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white/20 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl hover:bg-white/30 transition-all flex items-center"
              >
                <FaTimes className="mr-2" />
                Đóng
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab("insurance")}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "insurance"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaShieldAlt className="mr-2" />
              Bảo hiểm
            </button>
            <button
              onClick={() => setActiveTab("maintenance")}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "maintenance"
                  ? "bg-red-600 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaTools className="mr-2" />
              Bảo trì
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Insurance Form */}
            {activeTab === "insurance" && (
              <>
                {/* Insurance Information */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <FaShieldAlt className="text-green-600" />
                    </div>
                    Thông tin bảo hiểm
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Loại bảo hiểm */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Loại bảo hiểm
                      </label>
                      <select
                        name="insuranceType"
                        value={insuranceForm.insuranceType}
                        onChange={handleInsuranceChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      >
                        <option value="Bảo hiểm bắt buộc">Bảo hiểm bắt buộc</option>
                        <option value="Bảo hiểm tự nguyện">Bảo hiểm tự nguyện</option>
                        <option value="Bảo hiểm toàn diện">Bảo hiểm toàn diện</option>
                        <option value="Bảo hiểm vật chất">Bảo hiểm vật chất</option>
                      </select>
                    </div>

                    {/* Công ty bảo hiểm */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Công ty bảo hiểm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="insuranceCompany"
                        value={insuranceForm.insuranceCompany}
                        onChange={handleInsuranceChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                          errors.insuranceCompany ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ví dụ: Bảo Việt, PVI, BIC..."
                        required
                      />
                      {errors.insuranceCompany && <p className="text-red-500 text-sm mt-1">{errors.insuranceCompany}</p>}
                    </div>

                    {/* Số hợp đồng */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Số hợp đồng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="policyNumber"
                        value={insuranceForm.policyNumber}
                        onChange={handleInsuranceChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                          errors.policyNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ví dụ: BV-2024-001"
                        required
                      />
                      {errors.policyNumber && <p className="text-red-500 text-sm mt-1">{errors.policyNumber}</p>}
                    </div>

                    {/* Phạm vi bảo hiểm */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Phạm vi bảo hiểm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="coverage"
                        value={insuranceForm.coverage}
                        onChange={handleInsuranceChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                          errors.coverage ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ví dụ: TNDS + Vật chất, Toàn diện..."
                        required
                      />
                      {errors.coverage && <p className="text-red-500 text-sm mt-1">{errors.coverage}</p>}
                    </div>
                  </div>
                </div>

                {/* Date and Premium Information */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <FaCalendarAlt className="text-purple-600" />
                    </div>
                    Thời hạn & Phí bảo hiểm
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Ngày bắt đầu */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Ngày bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={insuranceForm.startDate}
                        onChange={handleInsuranceChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          errors.startDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                    </div>

                    {/* Ngày kết thúc */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Ngày kết thúc <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={insuranceForm.endDate}
                        onChange={handleInsuranceChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          errors.endDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                    </div>

                    {/* Phí bảo hiểm */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Phí bảo hiểm (VND) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="premium"
                        value={insuranceForm.premium}
                        onChange={handleInsuranceChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          errors.premium ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="1500000"
                        min="0"
                        required
                      />
                      {insuranceForm.premium && (
                        <p className="text-sm text-gray-600 mt-1">
                          {formatCurrency(parseFloat(insuranceForm.premium) || 0)}
                        </p>
                      )}
                      {errors.premium && <p className="text-red-500 text-sm mt-1">{errors.premium}</p>}
                    </div>
                  </div>

                  {/* Ghi chú */}
                  <div className="mt-4">
                    <label className="block mb-2 font-semibold text-gray-700">
                      Ghi chú
                    </label>
                    <textarea
                      name="notes"
                      value={insuranceForm.notes}
                      onChange={handleInsuranceChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      rows={3}
                      placeholder="Ghi chú về bảo hiểm..."
                    />
                  </div>
                </div>
              </>
            )}

            {/* Maintenance Form */}
            {activeTab === "maintenance" && (
              <>
                {/* Maintenance Information */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-2xl border border-red-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <div className="bg-red-100 p-2 rounded-lg mr-3">
                      <FaWrench className="text-red-600" />
                    </div>
                    Thông tin bảo trì
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Loại bảo trì */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Loại bảo trì
                      </label>
                      <select
                        name="maintenanceType"
                        value={maintenanceForm.maintenanceType}
                        onChange={handleMaintenanceChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      >
                        <option value="Bảo trì định kỳ">Bảo trì định kỳ</option>
                        <option value="Bảo trì sửa chữa">Bảo trì sửa chữa</option>
                        <option value="Bảo trì khẩn cấp">Bảo trì khẩn cấp</option>
                        <option value="Bảo trì phòng ngừa">Bảo trì phòng ngừa</option>
                      </select>
                    </div>

                    {/* Trung tâm bảo trì */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Trung tâm bảo trì <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="serviceCenter"
                        value={maintenanceForm.serviceCenter}
                        onChange={handleMaintenanceChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                          errors.serviceCenter ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ví dụ: Toyota Center, Honda Service..."
                        required
                      />
                      {errors.serviceCenter && <p className="text-red-500 text-sm mt-1">{errors.serviceCenter}</p>}
                    </div>
                  </div>
                </div>

                {/* Date and Cost Information */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-2xl border border-red-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <div className="bg-red-100 p-2 rounded-lg mr-3">
                      <FaCalendarAlt className="text-red-600" />
                    </div>
                    Lịch bảo trì & Chi phí
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Ngày bảo trì gần nhất */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Ngày bảo trì gần nhất <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="lastServiceDate"
                        value={maintenanceForm.lastServiceDate}
                        onChange={handleMaintenanceChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                          errors.lastServiceDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.lastServiceDate && <p className="text-red-500 text-sm mt-1">{errors.lastServiceDate}</p>}
                    </div>

                    {/* Ngày bảo trì tiếp theo */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Ngày bảo trì tiếp theo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="nextServiceDate"
                        value={maintenanceForm.nextServiceDate}
                        onChange={handleMaintenanceChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                          errors.nextServiceDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.nextServiceDate && <p className="text-red-500 text-sm mt-1">{errors.nextServiceDate}</p>}
                    </div>

                    {/* Chi phí bảo trì */}
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Chi phí bảo trì (VND) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="serviceCost"
                        value={maintenanceForm.serviceCost}
                        onChange={handleMaintenanceChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                          errors.serviceCost ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="500000"
                        min="0"
                        required
                      />
                      {maintenanceForm.serviceCost && (
                        <p className="text-sm text-gray-600 mt-1">
                          {formatCurrency(parseFloat(maintenanceForm.serviceCost) || 0)}
                        </p>
                      )}
                      {errors.serviceCost && <p className="text-red-500 text-sm mt-1">{errors.serviceCost}</p>}
                    </div>
                  </div>

                  {/* Chi tiết bảo trì */}
                  <div className="mt-4">
                    <label className="block mb-2 font-semibold text-gray-700">
                      Chi tiết bảo trì <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="serviceDetails"
                      value={maintenanceForm.serviceDetails}
                      onChange={handleMaintenanceChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                        errors.serviceDetails ? 'border-red-500' : 'border-gray-300'
                      }`}
                      rows={3}
                      placeholder="Mô tả chi tiết công việc bảo trì đã thực hiện..."
                      required
                    />
                    {errors.serviceDetails && <p className="text-red-500 text-sm mt-1">{errors.serviceDetails}</p>}
                  </div>

                  {/* Ghi chú */}
                  <div className="mt-4">
                    <label className="block mb-2 font-semibold text-gray-700">
                      Ghi chú
                    </label>
                    <textarea
                      name="notes"
                      value={maintenanceForm.notes}
                      onChange={handleMaintenanceChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      rows={3}
                      placeholder="Ghi chú về bảo trì..."
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center"
              >
                <FaTimes className="mr-2" />
                Bỏ qua
              </button>
              <button
                type="submit"
                className={`${
                  activeTab === "insurance" 
                    ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700"
                    : "bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 hover:from-red-700 hover:via-pink-700 hover:to-rose-700"
                } text-white px-8 py-3 rounded-xl font-semibold flex items-center disabled:opacity-50 shadow-lg transition-all duration-200`}
                disabled={loading}
              >
                <FaCheck className="mr-2" />
                {loading ? <LoadingSpinner size="small" color="white" /> : `Xác nhận ${activeTab === "insurance" ? "bảo hiểm" : "bảo trì"}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InsurancePopup; 