import React, { useEffect, useState } from 'react';
import { FaCar, FaUser, FaCalendar, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getPendingCars, approveCar, rejectCar } from '@/services/api';

const CarApprovalPage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch pending cars
  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingCars();
      setCars(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCars(); }, []);

  // Approve car
  const handleApprove = async (carId) => {
    try {
      await approveCar(carId);
      toast.success('Đã duyệt xe thành công!');
      fetchCars();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Reject car
  const handleReject = async (carId) => {
    try {
      await rejectCar(carId);
      toast.success('Đã từ chối xe!');
      fetchCars();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Modal
  const openModal = (car) => { setSelectedCar(car); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setSelectedCar(null); };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-100 to-blue-50">
      {/* Tiêu đề nổi bật */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl text-white border-2 border-blue-300/40">
          <div className="p-3 bg-white bg-opacity-20 rounded-2xl shadow-md">
            <FaCar className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-4xl font-extrabold mb-1 drop-shadow-lg">Duyệt xe</h2>
            <p className="text-blue-100 text-lg font-medium">Quản lý các xe chờ duyệt từ supplier</p>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 font-semibold py-12">{error}</div>
      ) : cars.length === 0 ? (
        <div className="text-center py-12">
          <FaCar className="text-gray-400 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Không có xe chờ duyệt</h3>
          <p className="text-gray-500">Tất cả xe đã được duyệt hoặc chưa có xe mới được đăng</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map(car => (
            <div key={car.carId} className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-blue-100 hover:shadow-2xl transition-transform hover:scale-[1.02]">
              <div className="h-56 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                {car.images && car.images.length > 0 ? (
                  <img src={car.images[0].imageUrl} alt={car.model} className="w-full h-full object-cover rounded-t-3xl" />
                ) : (
                  <FaCar className="text-gray-400 text-4xl" />
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-700 mb-2 flex items-center gap-2"><FaCar className="text-blue-400" />{car.model}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600"><FaUser className="mr-2 text-blue-500" />Supplier: {car.supplier?.username || 'N/A'}</div>
                  <div className="flex items-center text-sm text-gray-600"><FaCalendar className="mr-2 text-blue-500" />Năm: {car.year}</div>
                  <div className="text-sm text-gray-600">Màu: {car.color}</div>
                  <div className="text-sm text-gray-600">Biển số: {car.licensePlate}</div>
                  <div className="text-sm font-semibold text-green-600">Giá: {car.dailyRate?.toLocaleString('vi-VN')} VND/ngày</div>
                </div>
                <div className="flex space-x-2 pt-2">
                  <button onClick={() => openModal(car)} className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow"><FaEye className="mr-1" />Chi tiết</button>
                  <button onClick={() => handleApprove(car.carId)} className="flex-1 flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold shadow"><FaCheck className="mr-1" />Duyệt</button>
                  <button onClick={() => handleReject(car.carId)} className="flex-1 flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold shadow"><FaTimes className="mr-1" />Từ chối</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal chi tiết xe */}
      {showModal && selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border-2 border-blue-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Chi tiết xe</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700"><FaTimes className="text-xl" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800">Thông tin xe</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div><p className="text-sm text-gray-600">Tên xe</p><p className="font-medium">{selectedCar.model}</p></div>
                    <div><p className="text-sm text-gray-600">Năm sản xuất</p><p className="font-medium">{selectedCar.year}</p></div>
                    <div><p className="text-sm text-gray-600">Màu xe</p><p className="font-medium">{selectedCar.color}</p></div>
                    <div><p className="text-sm text-gray-600">Biển số</p><p className="font-medium">{selectedCar.licensePlate}</p></div>
                    <div><p className="text-sm text-gray-600">Số ghế</p><p className="font-medium">{selectedCar.numOfSeats}</p></div>
                    <div><p className="text-sm text-gray-600">Giá thuê/ngày</p><p className="font-medium text-green-600">{selectedCar.dailyRate?.toLocaleString('vi-VN')} VND</p></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Thông tin supplier</h3>
                  <div className="mt-2"><p className="text-sm text-gray-600">Tên</p><p className="font-medium">{selectedCar.supplier?.username || 'N/A'}</p></div>
                </div>
                {selectedCar.features && (
                  <div>
                    <h3 className="font-semibold text-gray-800">Mô tả</h3>
                    <p className="text-gray-700 mt-2">{selectedCar.features}</p>
                  </div>
                )}
                <div className="flex space-x-4 pt-4">
                  <button onClick={() => { handleApprove(selectedCar.carId); closeModal(); }} className="flex-1 flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold shadow"><FaCheck className="mr-2" />Duyệt xe</button>
                  <button onClick={() => { handleReject(selectedCar.carId); closeModal(); }} className="flex-1 flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold shadow"><FaTimes className="mr-2" />Từ chối</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarApprovalPage; 