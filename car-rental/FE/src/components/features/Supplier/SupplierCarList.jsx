import React, { useEffect, useState } from "react";
import { getSupplierCars, deleteSupplierCar, updateSupplierCar, getSupplierOrders } from "@/services/api";
import { toast } from "react-toastify";
import { FaCar, FaEdit, FaTrash, FaEye, FaPlus, FaCheckCircle, FaExclamationTriangle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import LoadingSpinner from "@/components/ui/Loading/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage";
import SupplierCarForm from "./SupplierCarForm";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SupplierCarList = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCarData, setEditCarData] = useState(null);
  const [rentedCarCount, setRentedCarCount] = useState(0);

  useEffect(() => {
    fetchCars();
    fetchRentedCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSupplierCars();
      console.log('DANH SÁCH XE:', data);
      setCars(data || []);
    } catch (err) {
      console.error('Error fetching supplier cars:', err);
      setError(err.message || 'Không thể tải danh sách xe');
      toast.error('Không thể tải danh sách xe');
    } finally {
      setLoading(false);
    }
  };

  const fetchRentedCars = async () => {
    try {
      const orders = await getSupplierOrders();
      const inProgressBookings = orders?.filter(order => {
        const st = (order.status?.statusName || order.statusName || '').toLowerCase();
        return st === 'in_progress' || st === 'in progress' || st === 'đang thuê';
      }) || [];
      const uniqueRentedCarIds = new Set(inProgressBookings.map(order => order.car?.carId || order.carId).filter(Boolean));
      setRentedCarCount(uniqueRentedCarIds.size);
    } catch (err) {
      setRentedCarCount(0);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'có sẵn':
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'đang thuê':
      case 'rented':
        return 'bg-blue-100 text-blue-800';
      case 'bảo trì':
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'không khả dụng':
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'available':
      case 'có sẵn':
        return 'Có sẵn';
      case 'rented':
      case 'đang thuê':
        return 'Đang thuê';
      case 'maintenance':
      case 'bảo trì':
        return 'Bảo trì';
      case 'unavailable':
      case 'không khả dụng':
        return 'Không khả dụng';
      case 'pending':
        return 'Chờ duyệt';
      case 'pending_approval':
        return 'Chờ phê duyệt';
      default:
        return status;
    }
  };

  const handleViewDetail = (car) => {
    setSelectedCar(car);
    setShowDetailModal(true);
  };

  const handleDeleteCar = (car) => {
    setSelectedCar(car);
    setShowDeleteConfirm(true);
  };

  const handleEditCar = (car) => {
    setEditCarData({
      carId: car.carId,
      name: car.model || '',
      licensePlate: car.licensePlate || '',
      description: car.description || car.describe || car.features || '',
      rentalPrice: car.dailyRate || 0,
    });
    setShowEditModal(true);
  };

  const handleEditCarSubmit = async (formData, images) => {
    try {
      // Chuẩn bị dữ liệu gửi đi, khớp với VehicleDTO
      const dataToSend = {
        name: formData.name?.trim() || editCarData.name,
        licensePlate: formData.licensePlate?.trim() || editCarData.licensePlate,
        description: formData.description?.trim() || editCarData.description,
        rentalPrice: parseFloat(formData.rentalPrice) || editCarData.rentalPrice,
      };

      // Validate cơ bản
      if (!dataToSend.name || !dataToSend.name.trim() || !dataToSend.licensePlate || !dataToSend.licensePlate.trim() || dataToSend.rentalPrice <= 0) {
        toast.error('Vui lòng điền đầy đủ tên xe, biển số và giá (giá phải lớn hơn 0)');
        return;
      }

      console.log('Dữ liệu gửi đi:', JSON.stringify(dataToSend, null, 2));

      // Gửi yêu cầu cập nhật
      const response = await updateSupplierCar(editCarData.carId, dataToSend);
      console.log('Response từ server:', response);
      toast.success('Cập nhật xe thành công');
      setShowEditModal(false);
      setEditCarData(null);
      fetchCars();
    } catch (err) {
      console.error('Error updating car:', err.response ? err.response.data : err.message);
      toast.error(err.response?.data?.message || err.message || 'Cập nhật xe thất bại!');
    }
  };

  const confirmDeleteCar = async () => {
    if (!selectedCar) return;
    setDeleting(true);
    try {
      await deleteSupplierCar(selectedCar.carId);
      toast.success('Đã xóa xe thành công');
      setShowDeleteConfirm(false);
      setSelectedCar(null);
      fetchCars();
    } catch (err) {
      toast.error('Xóa xe thất bại');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage message={error} />
    );
  }

  const totalActiveCars = cars.filter(car => {
    const st = (car.statusName || car.status?.statusName || '').toLowerCase();
    return st !== 'pending' && st !== 'pending_approval';
  }).length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-5 translate-x-5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-4 rounded-2xl mr-6 backdrop-blur-sm border border-white/20">
                  <FaCar className="text-4xl" />
                </div>
                <div>
                  <h2 className="text-4xl font-heading font-bold mb-2">Danh sách xe của bạn</h2>
                  <p className="text-blue-100 text-lg">Quản lý tất cả xe cho thuê</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {cars.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-blue-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FaCar className="text-blue-500 text-4xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">Chưa có xe nào</h3>
              <p className="text-gray-500 mb-8 text-lg">Bạn chưa đăng ký xe nào cho thuê</p>
              <button 
                onClick={() => { /* Có thể thêm logic để mở form thêm xe */ }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center mx-auto font-semibold text-lg shadow-lg transition-all"
              >
                <FaPlus className="mr-3" />
                Đăng ký xe đầu tiên
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-700">{totalActiveCars}</div>
                      <div className="text-sm font-medium text-blue-600">Tổng số xe</div>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <FaCar className="text-blue-600 text-xl" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-green-700">
                        {cars.filter(car => {
                          const st = car.statusName?.toLowerCase();
                          return st === 'có sẵn' || st === 'available';
                        }).length}
                      </div>
                      <div className="text-sm font-medium text-green-600">Có sẵn</div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-xl">
                      <FaCheckCircle className="text-green-600 text-xl" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-yellow-700">
                        {rentedCarCount}
                      </div>
                      <div className="text-sm font-medium text-yellow-600">Đang thuê</div>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-xl">
                      <FaCar className="text-yellow-600 text-xl" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-red-700">
                        {cars.filter(car => {
                          const st = car.statusName?.toLowerCase();
                          return st === 'bảo trì' || st === 'maintenance';
                        }).length}
                      </div>
                      <div className="text-sm font-medium text-red-600">Bảo trì</div>
                    </div>
                    <div className="bg-red-100 p-3 rounded-xl">
                      <FaExclamationTriangle className="text-red-600 text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <tr>
                        <th className="py-4 px-6 text-left font-semibold">Ảnh xe</th>
                        <th className="py-4 px-6 text-left font-semibold">Thông tin xe</th>
                        <th className="py-4 px-6 text-left font-semibold">Năm</th>
                        <th className="py-4 px-6 text-left font-semibold">Màu</th>
                        <th className="py-4 px-6 text-left font-semibold">Trạng thái</th>
                        <th className="py-4 px-6 text-left font-semibold">Giá/ngày</th>
                        <th className="py-4 px-6 text-left font-semibold">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cars.map((car, index) => (
                        <tr key={car.carId} className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/60 transition-all`}>
                          <td className="py-4 px-6">
                            {car.image ? (
                              <img 
                                src={car.image} 
                                alt={car.model} 
                                className="w-20 h-16 object-cover rounded-xl shadow-md border border-gray-200"
                                onError={e => { e.target.style.display = 'none'; e.target.parentNode.querySelector('.no-image-icon').style.display = 'flex'; }}
                              />
                            ) : null}
                            {!car.image && (
                              <div className="w-20 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center border border-gray-200 no-image-icon">
                                <FaCar className="text-gray-400 text-3xl" />
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <div className="font-semibold text-gray-800 text-lg">{car.model}</div>
                              <div className="text-xs text-gray-400">{car.licensePlate}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
                              {car.year}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-3 border-2 border-gray-300 shadow-sm"
                                style={{ backgroundColor: car.color?.toLowerCase() || '#ccc' }}
                              ></div>
                              <span className="text-gray-700 font-medium">{car.color}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(car.statusName)}`}>
                              {getStatusLabel(car.statusName)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-green-600 text-lg">
                              {(car.dailyRate || 0).toLocaleString('vi-VN', { 
                                style: 'currency', 
                                currency: 'VND',
                                minimumFractionDigits: 0
                              })}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">/ngày</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <button 
                                className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Xem chi tiết"
                                onClick={() => handleViewDetail(car)}
                              >
                                <FaEye className="text-sm" />
                              </button>
                              <button 
                                className="bg-yellow-100 text-yellow-600 p-2 rounded-lg hover:bg-yellow-200 transition-colors"
                                title="Chỉnh sửa"
                                onClick={() => handleEditCar(car)}
                              >
                                <FaEdit className="text-sm" />
                              </button>
                              <button 
                                className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
                                title="Xóa"
                                onClick={() => handleDeleteCar(car)}
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
              </div>
            </>
          )}
        </div>
      </div>

      {showDetailModal && selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-0 max-w-lg w-full relative animate-in fade-in duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 p-6 text-white flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <FaCar className="text-3xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1">Chi tiết xe {selectedCar.model}</h3>
                <div className="text-indigo-100 text-sm">Thông tin chi tiết & hình ảnh</div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-white hover:text-red-200 text-2xl font-bold ml-2">×</button>
            </div>
            <div className="w-full flex justify-center bg-gradient-to-br from-gray-50 to-blue-50 py-4 relative">
              {selectedCar.images && selectedCar.images.length > 0 ? (
                <>
                  <Slider
                    dots={true}
                    infinite={true}
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    className="w-60 h-40"
                    arrows={false}
                    ref={slider => window.supplierCarSlider = slider}
                  >
                    {selectedCar.images.map((img, idx) => (
                      <div key={idx}>
                        <img
                          src={img.imageUrl || img.url || img}
                          alt={selectedCar.model}
                          className="w-60 h-40 object-cover rounded-xl shadow-lg border border-gray-200"
                          style={{ objectFit: 'cover', width: '100%', height: '160px' }}
                        />
                      </div>
                    ))}
                  </Slider>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-blue-100 rounded-full p-2 text-blue-600 shadow-lg z-10"
                    onClick={() => window.supplierCarSlider && window.supplierCarSlider.slickPrev()}
                    style={{outline: 'none'}}
                  >
                    <FaChevronLeft size={18} />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-blue-100 rounded-full p-2 text-blue-600 shadow-lg z-10"
                    onClick={() => window.supplierCarSlider && window.supplierCarSlider.slickNext()}
                    style={{outline: 'none'}}
                  >
                    <FaChevronRight size={18} />
                  </button>
                </>
              ) : selectedCar.image ? (
                <img
                  src={selectedCar.image}
                  alt={selectedCar.model}
                  className="w-60 h-40 object-cover rounded-xl shadow-lg border border-gray-200"
                />
              ) : (
                <div className="w-60 h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center border border-gray-200">
                  <FaCar className="text-gray-400 text-3xl" />
                </div>
              )}
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div><span className="font-semibold text-gray-600">Hãng:</span> <span className="font-medium text-gray-800">{selectedCar.brandName || 'N/A'}</span></div>
                <div><span className="font-semibold text-gray-600">Năm:</span> <span className="font-medium text-gray-800">{selectedCar.year}</span></div>
                <div><span className="font-semibold text-gray-600">Màu:</span> <span className="font-medium text-gray-800">{selectedCar.color}</span></div>
                <div><span className="font-semibold text-gray-600">Biển số:</span> <span className="font-medium text-gray-800">{selectedCar.licensePlate}</span></div>
              </div>
              <div className="space-y-2">
                <div><span className="font-semibold text-gray-600">Khu vực:</span> <span className="font-medium text-gray-800">
                  {selectedCar.regionName || selectedCar.region?.regionName || 'N/A'}
                </span></div>
                <div><span className="font-semibold text-gray-600">Giá/ngày:</span> <span className="font-bold text-green-600">{(selectedCar.dailyRate || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 })}</span></div>
                <div><span className="font-semibold text-gray-600">Số chỗ:</span> <span className="font-medium text-gray-800">{selectedCar.numOfSeats}</span></div>
                <div><span className="font-semibold text-gray-600">Trạng thái:</span> <span className="font-medium text-gray-800">{getStatusLabel(selectedCar.statusName)}</span></div>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="font-semibold text-gray-700 mb-2">Mô tả:</div>
                <div className="text-gray-800">{selectedCar.description || selectedCar.describe || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative animate-in fade-in duration-300">
            <button onClick={() => setShowDeleteConfirm(false)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold">×</button>
            <h3 className="text-xl font-bold mb-4 text-red-700 flex items-center gap-2"><FaTrash /> Xác nhận xóa xe</h3>
            <p>Bạn có chắc muốn xóa xe <span className="font-semibold">{selectedCar.model}</span> ({selectedCar.licensePlate})?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Hủy</button>
              <button onClick={confirmDeleteCar} disabled={deleting} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">{deleting ? 'Đang xóa...' : 'Xóa'}</button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && editCarData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative animate-in fade-in duration-300"
               style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <button onClick={() => setShowEditModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold">×</button>
            <h3 className="text-2xl font-bold mb-4 text-yellow-700 flex items-center gap-2"><FaEdit /> Chỉnh sửa xe {editCarData.name}</h3>
            <SupplierCarForm
              onSuccess={() => {
                setShowEditModal(false);
                setEditCarData(null);
                fetchCars();
              }}
              initialData={editCarData}
              onSubmit={handleEditCarSubmit}
              isEdit
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierCarList;