import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaShieldAlt, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaArrowLeft, FaTools } from "react-icons/fa";
import LoadingSpinner from "@/components/ui/Loading/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage";
import InsuranceForm from "./InsuranceForm";
import MaintenanceForm from "./MaintenanceForm";
import { getSupplierInsurances, getSupplierMaintenances, createInsurance, updateInsurance, deleteInsurance, createMaintenance, updateMaintenance, deleteMaintenance } from "@/services/api";

const InsuranceManagement = () => {
  const [activeTab, setActiveTab] = useState("insurance"); // "insurance" or "maintenance"
  const [insurances, setInsurances] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(null);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Helper function to get status text
  const getStatusText = (statusId) => {
    switch (Number(statusId)) {
      case 8: return "Đang hiệu lực";
      case 9: return "Hết hạn";
      default: return "Không xác định";
    }
  };

  // Helper function to get status color
  const getStatusColor = (statusId) => {
    switch (Number(statusId)) {
      case 8: return "bg-green-100 text-green-800";
      case 9: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    if (activeTab === "insurance") {
      fetchInsurances();
    } else {
      fetchMaintenances();
    }
  }, [activeTab]);

  const fetchInsurances = async () => {
    setLoading(true);
    try {
      const data = await getSupplierInsurances();
      setInsurances(data || []);
    } catch (error) {
      console.error('Error fetching insurances:', error);
      toast.error("Không thể tải danh sách bảo hiểm");
      setInsurances([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenances = async () => {
    setLoading(true);
    try {
      const data = await getSupplierMaintenances();
      setMaintenances(data || []);
    } catch (error) {
      console.error('Error fetching maintenances:', error);
      toast.error("Không thể tải danh sách bảo trì");
      setMaintenances([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInsurance = () => {
    setEditingInsurance(null);
    setShowForm(true);
  };

  const handleEditInsurance = (insurance) => {
    console.log('Editing insurance object:', insurance);
    setEditingInsurance(insurance);
    setShowForm(true);
  };

  const handleDeleteInsurance = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bảo hiểm này?")) {
      try {
        console.log('Deleting insurance with ID:', id);
        const result = await deleteInsurance(id);
        console.log('Delete result:', result);
        toast.success("Xóa bảo hiểm thành công");
        fetchInsurances();
      } catch (error) {
        console.error('Error deleting insurance:', error);
        console.error('Error details:', error.response?.data);
        console.error('Error status:', error.response?.status);
        toast.error(`Không thể xóa bảo hiểm: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleAddMaintenance = () => {
    setEditingMaintenance(null);
    setShowForm(true);
  };

  const handleEditMaintenance = (maintenance) => {
    setEditingMaintenance(maintenance);
    setShowForm(true);
  };

  const handleDeleteMaintenance = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bảo trì này?")) {
      try {
        console.log('Deleting maintenance with ID:', id);
        const result = await deleteMaintenance(id);
        console.log('Delete result:', result);
        toast.success("Xóa bảo trì thành công");
        fetchMaintenances();
      } catch (error) {
        console.error('Error deleting maintenance:', error);
        console.error('Error details:', error.response?.data);
        console.error('Error status:', error.response?.status);
        toast.error(`Không thể xóa bảo trì: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      console.log('Submitting form data:', formData);
      console.log('Active tab:', activeTab);
      console.log('Editing insurance:', editingInsurance);
      console.log('Editing maintenance:', editingMaintenance);
      
      // Validate carId before processing
      if (!formData.carId || formData.carId === "") {
        toast.error("Vui lòng chọn xe");
        return;
      }
      
      // Prepare data for submission
      const preparedData = {
        ...formData,
        carId: parseInt(formData.carId),
        status: formData.status ? parseInt(formData.status) : 8
      };
      
      console.log('Prepared data before API call:', preparedData);
      console.log('carId type:', typeof preparedData.carId);
      console.log('carId value:', preparedData.carId);
      
      // Validate carId is a valid number
      if (isNaN(preparedData.carId)) {
        toast.error("ID xe không hợp lệ");
        return;
      }
      
      // Add specific field handling for insurance vs maintenance
      if (activeTab === "insurance") {
        preparedData.premium = formData.premium ? parseFloat(formData.premium) : null;
      } else {
        preparedData.cost = formData.cost ? parseFloat(formData.cost) : null;
      }
      
      if (activeTab === "insurance") {
        if (editingInsurance) {
          console.log('Updating insurance with ID:', editingInsurance.insuranceId);
          const result = await updateInsurance(editingInsurance.insuranceId, preparedData);
          console.log('Update result:', result);
          toast.success("Cập nhật bảo hiểm thành công");
        } else {
          console.log('Creating new insurance');
          const result = await createInsurance(preparedData);
          console.log('Create result:', result);
          toast.success("Thêm bảo hiểm thành công");
        }
        fetchInsurances();
      } else {
        if (editingMaintenance) {
          console.log('Updating maintenance with ID:', editingMaintenance.maintenanceId);
          const result = await updateMaintenance(editingMaintenance.maintenanceId, preparedData);
          console.log('Update result:', result);
          toast.success("Cập nhật bảo trì thành công");
        } else {
          console.log('Creating new maintenance');
          const result = await createMaintenance(preparedData);
          console.log('Create result:', result);
          toast.success("Thêm bảo trì thành công");
        }
        fetchMaintenances();
      }
      setShowForm(false);
      setEditingInsurance(null);
      setEditingMaintenance(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(`Có lỗi xảy ra khi lưu dữ liệu: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingInsurance(null);
    setEditingMaintenance(null);
  };

  // Filter data based on search and status
  const filteredInsurances = insurances.filter(insurance => {
    const matchesSearch = insurance.carName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insurance.insuranceCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insurance.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || insurance.status == filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredMaintenances = maintenances.filter(maintenance => {
    const matchesSearch = maintenance.carName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.serviceCenter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.maintenanceType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || maintenance.status == filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingInsurance || editingMaintenance ? "Chỉnh sửa" : "Thêm mới"} {activeTab === "insurance" ? "Bảo hiểm" : "Bảo trì"}
              </h2>
              <button
                onClick={handleCloseForm}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FaArrowLeft />
                Quay lại
              </button>
            </div>
            {activeTab === "insurance" ? (
              <InsuranceForm
                insurance={editingInsurance}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseForm}
              />
            ) : (
              <MaintenanceForm
                maintenance={editingMaintenance}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseForm}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`rounded-2xl p-8 text-white mb-8 transition-all duration-300 ${
          activeTab === "insurance" 
            ? "bg-gradient-to-r from-green-600 via-emerald-700 to-teal-800" 
            : "bg-gradient-to-r from-orange-600 via-red-700 to-pink-800"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-4 rounded-2xl mr-6 backdrop-blur-sm border border-white/20">
                {activeTab === "insurance" ? <FaShieldAlt className="text-4xl" /> : <FaTools className="text-4xl" />}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Quản Lý Bảo Hiểm & Bảo Trì</h1>
                <p className={`text-lg ${activeTab === "insurance" ? "text-green-100" : "text-orange-100"}`}>
                  Quản lý thông tin bảo hiểm và bảo trì xe
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("insurance")}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "insurance"
                  ? "bg-white text-green-600 shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <FaShieldAlt className="inline mr-2" />
              Bảo Hiểm
            </button>
            <button
              onClick={() => setActiveTab("maintenance")}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "maintenance"
                  ? "bg-white text-orange-600 shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <FaTools className="inline mr-2" />
              Bảo Trì
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-transparent focus:border-transparent ${
                    activeTab === "insurance" 
                      ? "focus:ring-green-500" 
                      : "focus:ring-orange-500"
                  }`}
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-transparent focus:border-transparent ${
                  activeTab === "insurance" 
                    ? "focus:ring-green-500" 
                    : "focus:ring-orange-500"
                }`}
              >
                <option value="all">Tất cả trạng thái</option>
                {activeTab === "insurance" ? (
                  <>
                    <option value="8">Đang hiệu lực</option>
                    <option value="9">Hết hạn</option>
                  </>
                ) : (
                  <>
                    <option value="8">Đang hiệu lực</option>
                    <option value="9">Hết hạn</option>
                  </>
                )}
              </select>
            </div>
            <button
              onClick={activeTab === "insurance" ? handleAddInsurance : handleAddMaintenance}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
            >
              <FaPlus />
              Thêm {activeTab === "insurance" ? "Bảo Hiểm" : "Bảo Trì"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {activeTab === "insurance" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Xe</th>
                    <th className="px-6 py-4 text-left">Loại bảo hiểm</th>
                    <th className="px-6 py-4 text-left">Công ty</th>
                    <th className="px-6 py-4 text-left">Số hợp đồng</th>
                    <th className="px-6 py-4 text-left">Ngày hiệu lực</th>
                    <th className="px-6 py-4 text-left">Phí bảo hiểm</th>
                    <th className="px-6 py-4 text-left">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInsurances.map((insurance) => (
                    <tr key={insurance.insuranceId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{insurance.carName}</div>
                          <div className="text-sm text-gray-500">{insurance.carId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{insurance.insuranceType}</td>
                      <td className="px-6 py-4 text-gray-900">{insurance.insuranceCompany}</td>
                      <td className="px-6 py-4 text-gray-900">{insurance.policyNumber}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-500">Từ: {insurance.startDate}</div>
                          <div className="text-sm text-gray-500">Đến: {insurance.endDate}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {insurance.premium?.toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(insurance.status)}`}>
                          {getStatusText(insurance.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditInsurance(insurance)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteInsurance(insurance.insuranceId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-600 to-red-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Xe</th>
                    <th className="px-6 py-4 text-left">Loại bảo trì</th>
                    <th className="px-6 py-4 text-left">Trung tâm</th>
                    <th className="px-6 py-4 text-left">Ngày bảo trì</th>
                    <th className="px-6 py-4 text-left">Chi phí</th>
                    <th className="px-6 py-4 text-left">Mô tả</th>
                    <th className="px-6 py-4 text-left">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMaintenances.map((maintenance) => (
                    <tr key={maintenance.maintenanceId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{maintenance.carName}</div>
                          <div className="text-sm text-gray-500">{maintenance.carId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{maintenance.maintenanceType}</td>
                      <td className="px-6 py-4 text-gray-900">{maintenance.serviceCenter}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-500">Từ: {maintenance.startDate}</div>
                          <div className="text-sm text-gray-500">Đến: {maintenance.endDate}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {maintenance.cost?.toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        <div className="max-w-xs truncate" title={maintenance.description}>
                          {maintenance.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(maintenance.status)}`}>
                          {getStatusText(maintenance.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditMaintenance(maintenance)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteMaintenance(maintenance.maintenanceId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FaTrash />
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

        {/* Summary */}
        <div className="mt-6 text-center">
          <p className={`text-lg font-medium ${
            activeTab === "insurance" ? "text-green-600" : "text-orange-600"
          }`}>
            Tổng cộng: {activeTab === "insurance" ? filteredInsurances.length : filteredMaintenances.length} {activeTab === "insurance" ? "bảo hiểm" : "bảo trì"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsuranceManagement; 