import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaSave, FaTimes } from "react-icons/fa";
import { getSupplierCars } from "@/services/api";

const MaintenanceForm = ({ maintenance, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    carId: "",
    maintenanceType: "Bảo trì định kỳ",
    serviceCenter: "",
    startDate: "",
    endDate: "",
    cost: "",
    description: "",
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
        setCars(carsData || []);
      } catch (error) {
        console.error('Error fetching cars:', error);
        toast.error("Không thể tải danh sách xe");
      }
    };
    fetchCars();
  }, []);

  useEffect(() => {
    if (maintenance) {
      setForm({
        carId: maintenance.carId || "",
        maintenanceType: maintenance.maintenanceType || "Bảo trì định kỳ",
        serviceCenter: maintenance.serviceCenter || "",
        startDate: maintenance.startDate || "",
        endDate: maintenance.endDate || "",
        cost: maintenance.cost || "",
        description: maintenance.description || "",
        notes: maintenance.notes || "",
        status: maintenance.status || 8
      });
    }
  }, [maintenance]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    // Always validate carId for both new and existing maintenance records
    if (!form.carId) newErrors.carId = "Vui lòng chọn xe";
    if (!form.serviceCenter) newErrors.serviceCenter = "Vui lòng nhập trung tâm bảo trì";
    if (!form.startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!form.endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc";
    if (!form.cost) newErrors.cost = "Vui lòng nhập chi phí";
    if (!form.description) newErrors.description = "Vui lòng nhập mô tả";

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
      console.error('Error submitting maintenance form:', error);
      toast.error("Có lỗi xảy ra khi lưu bảo trì");
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
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
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
            Loại bảo trì <span className="text-red-500">*</span>
          </label>
          <select
            name="maintenanceType"
            value={form.maintenanceType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          >
            <option value="Bảo trì định kỳ">Bảo trì định kỳ</option>
            <option value="Sửa chữa">Sửa chữa</option>
            <option value="Thay thế phụ tùng">Thay thế phụ tùng</option>
            <option value="Kiểm tra an toàn">Kiểm tra an toàn</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trung tâm bảo trì <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="serviceCenter"
            value={form.serviceCenter}
            onChange={handleChange}
            placeholder="Nhập tên trung tâm bảo trì"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.serviceCenter ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.serviceCenter && <p className="text-red-500 text-sm mt-1">{errors.serviceCenter}</p>}
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
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
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
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.endDate ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chi phí (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="cost"
            value={form.cost}
            onChange={handleChange}
            placeholder="Nhập chi phí bảo trì"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.cost ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.cost && <p className="text-red-500 text-sm mt-1">{errors.cost}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value={8}>Đang hiệu lực</option>
            <option value={9}>Hết hạn</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="4"
          placeholder="Nhập mô tả chi tiết về bảo trì"
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
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
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg disabled:opacity-50"
        >
          <FaSave />
          {loading ? "Đang lưu..." : (maintenance ? "Cập nhật" : "Thêm mới")}
        </button>
      </div>
    </form>
  );
};

export default MaintenanceForm; 