import React, { useEffect, useState } from "react";
import { getPendingCars, approveCar, rejectCar } from "@/services/api";
import { toast } from "react-toastify";
import { FaCheck, FaTimes, FaCar, FaEye } from "react-icons/fa";

const AdminCarApproval = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const data = await getPendingCars();
      setCars(data || []);
    } catch (err) {
      toast.error("Không thể tải danh sách xe chờ duyệt");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (carId) => {
    await approveCar(carId);
    toast.success("Đã duyệt xe thành công");
    fetchCars();
  };

  const handleReject = async (carId) => {
    await rejectCar(carId);
    toast.success("Đã từ chối xe");
    fetchCars();
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-blue-700">
        <FaCar /> Duyệt xe đăng ký của chủ xe
      </h2>
      {loading ? (
        <div className="text-center py-12">Đang tải...</div>
      ) : cars.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Không có xe nào chờ duyệt</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-lg">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <tr>
                <th className="py-4 px-6 text-left">Ảnh xe</th>
                <th className="py-4 px-6 text-left">Tên xe</th>
                <th className="py-4 px-6 text-left">Biển số</th>
                <th className="py-4 px-6 text-left">Chủ xe</th>
                <th className="py-4 px-6 text-left">Hãng</th>
                <th className="py-4 px-6 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.carId} className="border-t hover:bg-blue-50/60 transition">
                  <td className="py-4 px-6">
                    {car.imageUrls && car.imageUrls.length > 0 ? (
                      <img src={car.imageUrls[0]} alt={car.model} className="w-20 h-16 object-cover rounded-lg shadow-md" />
                    ) : (
                      <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FaCar className="text-gray-400 text-xl" />
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 font-semibold text-gray-800">{car.model}</td>
                  <td className="py-4 px-6">{car.licensePlate}</td>
                  <td className="py-4 px-6">{car.supplier?.username || 'N/A'}</td>
                  <td className="py-4 px-6">{car.brand?.brandName || car.brand || 'N/A'}</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button
                        className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-200 transition-colors"
                        title="Duyệt xe"
                        onClick={() => handleApprove(car.carId)}
                      >
                        <FaCheck />
                      </button>
                      <button
                        className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
                        title="Từ chối xe"
                        onClick={() => handleReject(car.carId)}
                      >
                        <FaTimes />
                      </button>
                      <button
                        className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Xem chi tiết"
                        onClick={() => { setSelectedCar(car); setShowDetail(true); }}
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showDetail && selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-in fade-in duration-300">
            <button onClick={() => setShowDetail(false)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold">×</button>
            <h3 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2"><FaCar /> Chi tiết xe {selectedCar.model}</h3>
            <div className="mb-2"><span className="font-semibold">Hãng:</span> {selectedCar.brand?.brandName || selectedCar.brand || 'N/A'}</div>
            <div className="mb-2"><span className="font-semibold">Năm:</span> {selectedCar.year}</div>
            <div className="mb-2"><span className="font-semibold">Màu:</span> {selectedCar.color}</div>
            <div className="mb-2"><span className="font-semibold">Biển số:</span> {selectedCar.licensePlate}</div>
            <div className="mb-2"><span className="font-semibold">Khu vực:</span> {selectedCar.region?.regionName || selectedCar.region || 'N/A'}</div>
            <div className="mb-2"><span className="font-semibold">Giá/ngày:</span> {(selectedCar.dailyRate || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 })}</div>
            <div className="mb-2"><span className="font-semibold">Số chỗ:</span> {selectedCar.numOfSeats}</div>
            <div className="mb-2"><span className="font-semibold">Trạng thái:</span> {selectedCar.statusName}</div>
            <div className="mb-2"><span className="font-semibold">Mô tả:</span> {selectedCar.description || selectedCar.describe || 'N/A'}</div>
            {selectedCar.imageUrls && selectedCar.imageUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {selectedCar.imageUrls.map((url, idx) => (
                  <img key={idx} src={url} alt={`car-img-${idx}`} className="w-full h-28 object-cover rounded-lg border" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCarApproval; 