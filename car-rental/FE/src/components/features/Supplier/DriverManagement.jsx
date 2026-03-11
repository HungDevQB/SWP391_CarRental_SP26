import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaUser, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaArrowLeft } from "react-icons/fa";
import LoadingSpinner from "@/components/ui/Loading/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage";
import DriverForm from "./DriverForm";
import { getSupplierDrivers, createSupplierDriver, updateSupplierDriver, deleteSupplierDriver } from '../../../services/api';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data - thay thế bằng API call thực tế
  const mockDrivers = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      phone: "0123456789",
      licenseNumber: "B2-123456",
      experience: "5 năm",
      status: "Hoạt động",
      email: "driver1@example.com",
      address: "Hà Nội",
      idCard: "123456789",
      licenseType: "B2",
      licenseExpiry: "2025-12-31"
    },
    {
      id: 2,
      name: "Trần Thị B",
      phone: "0987654321",
      licenseNumber: "B2-654321",
      experience: "3 năm",
      status: "Hoạt động",
      email: "driver2@example.com",
      address: "TP.HCM",
      idCard: "987654321",
      licenseType: "B2",
      licenseExpiry: "2026-06-30"
    }
  ];

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await getSupplierDrivers();
      setDrivers(response);
    } catch (error) {
      toast.error("Không thể tải danh sách tài xế");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriver = () => {
    setEditingDriver(null);
    setShowForm(true);
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setShowForm(true);
  };

  const handleDeleteDriver = async (driverId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài xế này?")) {
      try {
        await deleteSupplierDriver(driverId);
        setDrivers(drivers.filter(driver => (driver.driverId || driver.id) !== driverId));
        toast.success("Đã xóa tài xế thành công");
      } catch (error) {
        toast.error("Không thể xóa tài xế");
      }
    }
  };

  const handleFormSubmit = async (driverData) => {
    try {
      if (editingDriver) {
        // Cập nhật tài xế
        const updated = await updateSupplierDriver(editingDriver.driverId || editingDriver.id, driverData);
        setDrivers(drivers.map(driver => (driver.driverId || driver.id) === (editingDriver.driverId || editingDriver.id) ? updated : driver));
        toast.success("Đã cập nhật tài xế thành công");
      } else {
        // Thêm tài xế mới
        const created = await createSupplierDriver(driverData);
        setDrivers([...drivers, created]);
        toast.success("Đã thêm tài xế thành công");
      }
      setShowForm(false);
      setEditingDriver(null);
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const name = driver.driverName || driver.name || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (driver.phone || '').includes(searchTerm) ||
                         (driver.licenseNumber || '').includes(searchTerm);
    const matchesFilter = filterStatus === "all" || String(driver.status) === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Thêm hàm map trạng thái
  const getStatusText = (statusId) => {
    switch (Number(statusId)) {
      case 11: return "Hoạt động";
      case 17: return "Tạm nghỉ";
      case 12: return "Đang được thuê";
      default: return "Không xác định";
    }
  };

  if (showForm) {
    return (
      <DriverForm
        driver={editingDriver}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingDriver(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white/20 p-4 rounded-2xl mr-6 backdrop-blur-sm border border-white/20">
              <FaUser className="text-4xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Quản Lý Tài Xế</h1>
              <p className="text-blue-100 text-lg">Quản lý thông tin tài xế của bạn</p>
            </div>
          </div>
          <button
            onClick={handleAddDriver}
            className="bg-white/20 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-xl hover:bg-white/30 transition-all flex items-center"
          >
            <FaPlus className="mr-2" />
            Thêm Tài Xế
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tài xế..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="11">Hoạt động</option>
              <option value="17">Tạm nghỉ</option>
              <option value="12">Đang được thuê</option>
            </select>
          </div>
          <div className="text-right">
            <p className="text-gray-600">
              Tổng cộng: <span className="font-bold text-blue-600">{filteredDrivers.length}</span> tài xế
            </p>
          </div>
        </div>
      </div>

      {/* Drivers List */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <LoadingSpinner />
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="p-8 text-center">
            <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không có tài xế nào</h3>
            <p className="text-gray-500">Hãy thêm tài xế đầu tiên của bạn</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tên Tài Xế</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Số Điện Thoại</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Số Bằng Lái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ngày sinh</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Địa chỉ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trạng Thái</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.driverId || driver.id} className="hover:bg-gray-50 transition-colors">
                                         <td className="px-6 py-4">
                       <div>
                         <div className="font-semibold text-gray-900">{driver.driverName || driver.name}</div>
                         <div className="text-sm text-gray-500">{driver.phone}</div>
                       </div>
                     </td>
                    <td className="px-6 py-4 text-gray-900">{driver.phone}</td>
                    <td className="px-6 py-4 text-gray-900">{driver.licenseNumber}</td>
                    <td className="px-6 py-4 text-gray-900">{driver.dob}</td>
                    <td className="px-6 py-4 text-gray-900">{driver.address}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        driver.status == 11
                          ? "bg-green-100 text-green-800"
                          : driver.status == 17
                          ? "bg-yellow-100 text-yellow-800"
                          : driver.status == 12
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {getStatusText(driver.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditDriver(driver)}
                          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(driver.driverId || driver.id)}
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                          title="Xóa"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverManagement; 