import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaSave, FaTimes } from "react-icons/fa";
import { getSupplierCars } from "@/services/api";

const InsuranceForm = ({ insurance, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    carId: "",
    insuranceType: "Bảo hiểm bắt buộc",
    insuranceCompany: "",
    policyNumber: "",
    startDate: "",
    endDate: "",
    premium: "",
    coverage: "",
    notes: "",
    status: 8
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [cars, setCars] = useState([]);

  // Fetch cars data
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const carsData = await getSupplierCars();
        console.log('Fetched cars data:', carsData);
        setCars(carsData || []);
      } catch (error) {
        console.error('Error fetching cars:', error);
        toast.error("Không thể tải danh sách xe");
      }
    };
    fetchCars();
  }, []);

  useEffect(() => {
    if (insurance) {
      setForm({
        carId: insurance.carId || "",
      
        insuranceType: insurance.insuranceType || "Bảo hiểm bắt buộc",
        insuranceCompany: insurance.insuranceCompany || "",
        policyNumber: insurance.policyNumber || "",
        startDate: insurance.startDate || "",
        endDate: insurance.endDate || "",
        premium: insurance.premium || "",
        coverage: insurance.coverage || "",
        notes: insurance.notes || "",
        status: insurance.status || 8
      });
    }
  }, [insurance]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed to:`, value, `Type:`, typeof value);
    
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    console.log('Validating form with carId:', form.carId, 'Type:', typeof form.carId);
    
    // Always validate carId for both new and existing insurance records
    if (!form.carId) newErrors.carId = "Vui lòng chọn xe";
    if (!form.insuranceCompany) newErrors.insuranceCompany = "Vui lòng nhập công ty bảo hiểm";
    if (!form.policyNumber) newErrors.policyNumber = "Vui lòng nhập số hợp đồng";
    if (!form.startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!form.endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc";
    if (!form.premium) newErrors.premium = "Vui lòng nhập phí bảo hiểm";
    if (!form.coverage) newErrors.coverage = "Vui lòng nhập phạm vi bảo hiểm";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(form);
    } catch (error) {
      console.error('Error submitting insurance form:', error);
      toast.error("Có lỗi xảy ra khi lưu bảo hiểm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Always show car selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn xe <span className="text-red-500">*</span>
          </label>
          <select
            name="carId"
            value={form.carId}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.carId ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Chọn xe</option>
            {cars.map(car => (
              <option key={car.carId} value={car.carId}>
                {car.model || car.name} ({car.licensePlate})
              </option>
            ))}
          </select>
          {errors.carId && <p className="text-red-500 text-sm mt-1">{errors.carId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại bảo hiểm <span className="text-red-500">*</span>
          </label>
          <select
            name="insuranceType"
            value={form.insuranceType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          >
            <option value="Bảo hiểm bắt buộc">Bảo hiểm bắt buộc</option>
            <option value="Bảo hiểm tự nguyện">Bảo hiểm tự nguyện</option>
            <option value="Bảo hiểm toàn diện">Bảo hiểm toàn diện</option>
            <option value="Bảo hiểm trách nhiệm dân sự">Bảo hiểm trách nhiệm dân sự</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Công ty bảo hiểm <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="insuranceCompany"
            value={form.insuranceCompany}
            onChange={handleChange}
            placeholder="Nhập tên công ty bảo hiểm"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.insuranceCompany ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.insuranceCompany && <p className="text-red-500 text-sm mt-1">{errors.insuranceCompany}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số hợp đồng <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="policyNumber"
            value={form.policyNumber}
            onChange={handleChange}
            placeholder="Nhập số hợp đồng bảo hiểm"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.policyNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.policyNumber && <p className="text-red-500 text-sm mt-1">{errors.policyNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày bắt đầu <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.startDate ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày kết thúc <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.endDate ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phí bảo hiểm (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="premium"
            value={form.premium}
            onChange={handleChange}
            placeholder="Nhập phí bảo hiểm"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.premium ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.premium && <p className="text-red-500 text-sm mt-1">{errors.premium}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phạm vi bảo hiểm <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="coverage"
            value={form.coverage}
            onChange={handleChange}
            placeholder="Nhập phạm vi bảo hiểm"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.coverage ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.coverage && <p className="text-red-500 text-sm mt-1">{errors.coverage}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value={8}>Đang hiệu lực</option>
            <option value={9}>Hết hạn</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ghi chú
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows="4"
          placeholder="Nhập ghi chú (nếu có)"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <FaTimes />
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg disabled:opacity-50"
        >
          <FaSave />
          {loading ? "Đang lưu..." : (insurance ? "Cập nhật" : "Thêm mới")}
        </button>
      </div>
    </form>
  );
};

export default InsuranceForm; 