// Test file để kiểm tra API trả về thông tin supplier
import { getCarById } from './services/api.js';

const testCarSupplier = async () => {
  try {
    const carId = 1; // Thay bằng ID xe thực tế
    const carData = await getCarById(carId);
    console.log('Car data:', carData);
    console.log('Supplier info:', carData.supplier);
    
    if (carData.supplier) {
      console.log('Supplier details:', {
        id: carData.supplier.userId,
        username: carData.supplier.username,
        email: carData.supplier.email,
        phone: carData.supplier.phone,
        userDetail: carData.supplier.userDetail,
        status: carData.supplier.statusName
      });
    } else {
      console.log('No supplier information available');
    }
  } catch (error) {
    console.error('Error fetching car data:', error);
  }
};

// Chạy test khi được import
testCarSupplier();
