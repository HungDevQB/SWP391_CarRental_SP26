import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaUser, FaSave, FaTimes, FaArrowLeft } from "react-icons/fa";
import LoadingSpinner from "@/components/ui/Loading/LoadingSpinner";

const DriverForm = ({ driver, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    licenseNumber: "",
    licenseType: "B2",
    licenseExpiryDate: "",
    experienceYears: "",
    status: "Hoạt động",
    dob: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (driver) {
      setForm({
        name: driver.driverName || driver.name || "",
        phone: driver.phone || "",
        address: driver.address || "",
        licenseNumber: driver.licenseNumber || "",
        licenseType: driver.licenseType || "B2",
        licenseExpiryDate: driver.licenseExpiryDate || "",
        experienceYears: driver.experienceYears || "",
        status: driver.status || "Hoạt động",
        dob: driver.dob || ""
      });
    }
  }, [driver]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'Tên tài xế là bắt buộc';
    }
    
    if (!form.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(form.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!form.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }
    
    if (!form.dob) {
      newErrors.dob = 'Ngày sinh là bắt buộc';
    }
    
    if (!form.licenseNumber.trim()) {
      newErrors.licenseNumber = 'Số bằng lái là bắt buộc';
    }
    
    if (!form.licenseExpiryDate) {
      newErrors.licenseExpiryDate = 'Ngày hết hạn bằng lái là bắt buộc';
    }
    
    if (!form.experienceYears || form.experienceYears < 0) {
      newErrors.experienceYears = 'Kinh nghiệm lái xe phải là số dương';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setLoading(true);
    try {
      // Chuyển đổi dữ liệu để phù hợp với backend
      const driverData = {
        driverName: form.name,
        phone: form.phone,
        address: form.address,
        licenseNumber: form.licenseNumber,
        licenseType: form.licenseType,
        licenseExpiryDate: form.licenseExpiryDate,
        experienceYears: parseInt(form.experienceYears),
        status: form.status === "Hoạt động" ? "11" : form.status === "Tạm nghỉ" ? "17" : "12",
        dob: form.dob,
        countryCode: "+84" // Mặc định cho Việt Nam
      };
      
      await onSubmit(driverData);
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-5 translate-x-5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-4 rounded-2xl mr-6 backdrop-blur-sm border border-white/20">
                  <FaUser className="text-4xl" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold mb-2">
                    {driver ? 'Chỉnh sửa thông tin tài xế' : 'Thêm tài xế mới'}
                  </h2>
                  <p className="text-blue-100 text-lg">
                    {driver ? 'Cập nhật thông tin tài xế' : 'Thêm tài xế mới vào hệ thống'}
                  </p>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="bg-white/20 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl hover:bg-white/30 transition-all flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                Quay lại
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <FaUser className="text-blue-600" />
                </div>
                Thông tin cá nhân
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tên tài xế */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Tên tài xế <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập tên tài xế"
                    required
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0123456789"
                    required
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                {/* Địa chỉ */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập địa chỉ"
                    required
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                {/* Ngày sinh */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.dob ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                </div>
              </div>
            </div>

            {/* License Information */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <FaUser className="text-green-600" />
                </div>
                Thông tin bằng lái
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Số bằng lái */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Số bằng lái <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={form.licenseNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="B2-123456"
                    required
                  />
                  {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
                </div>

                {/* Loại bằng lái */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Loại bằng lái
                  </label>
                  <select
                    name="licenseType"
                    value={form.licenseType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="B1">B1 - Xe mô tô</option>
                    <option value="B2">B2 - Xe ô tô dưới 9 chỗ</option>
                    <option value="C">C - Xe ô tô tải</option>
                    <option value="D">D - Xe khách</option>
                    <option value="E">E - Xe kéo rơ moóc</option>
                  </select>
                </div>

                {/* Ngày hết hạn */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Ngày hết hạn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="licenseExpiryDate"
                    value={form.licenseExpiryDate}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.licenseExpiryDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.licenseExpiryDate && <p className="text-red-500 text-sm mt-1">{errors.licenseExpiryDate}</p>}
                </div>
              </div>

              {/* Kinh nghiệm */}
              <div className="mt-6">
                <label className="block mb-2 font-semibold text-gray-700">
                  Kinh nghiệm lái xe (năm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="experienceYears"
                  value={form.experienceYears}
                  onChange={handleChange}
                  min="0"
                  max="50"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.experienceYears ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ví dụ: 5"
                  required
                />
                {errors.experienceYears && <p className="text-red-500 text-sm mt-1">{errors.experienceYears}</p>}
              </div>
            </div>

            {/* Status */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <FaUser className="text-purple-600" />
                </div>
                Trạng thái
              </h3>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Trạng thái làm việc
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Tạm nghỉ">Tạm nghỉ</option>
                  <option value="Nghỉ việc">Nghỉ việc</option>
                </select>
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center"
              >
                <FaTimes className="mr-2" />
                Hủy
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 flex items-center disabled:opacity-50 shadow-lg transition-all duration-200"
                disabled={loading}
              >
                <FaSave className="mr-2" />
                {loading ? <LoadingSpinner size="small" color="white" /> : (driver ? "Cập nhật" : "Thêm tài xế")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverForm; 