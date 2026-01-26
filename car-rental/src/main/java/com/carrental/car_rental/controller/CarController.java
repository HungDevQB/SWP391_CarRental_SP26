package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.*;
import com.carrental.car_rental.service.CarService;
import com.carrental.car_rental.entity.FuelType;
import com.carrental.car_rental.entity.Region;
import com.carrental.car_rental.entity.CountryCode;
import com.carrental.car_rental.repository.CarRepository;
import com.carrental.car_rental.repository.CountryCodeRepository;
import jakarta.validation.constraints.Min;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/cars")
public class CarController {

    private static final Logger logger = LoggerFactory.getLogger(CarController.class);
    private final CarService service;
    private final CarRepository carRepository;
    private final CountryCodeRepository countryCodeRepository;

    public CarController(CarService service, CarRepository carRepository, CountryCodeRepository countryCodeRepository) {
        this.service = service;
        this.carRepository = carRepository;
        this.countryCodeRepository = countryCodeRepository;
    }

    @GetMapping("/featured")
    public ResponseEntity<List<CarDTO>> getFeaturedCars(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Yêu cầu lấy danh sách xe nổi bật, trang {}, kích thước {}", page, size);
        try {
            List<CarDTO> featuredCars = service.getFeaturedCars(page, size);
            return ResponseEntity.ok(featuredCars);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy xe nổi bật: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/popular")
    public ResponseEntity<List<CarDTO>> getPopularCars(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Yêu cầu lấy danh sách xe phổ biến, trang {}, kích thước {}", page, size);
        try {
            List<CarDTO> popularCars = service.getPopularCars(page, size);
            return ResponseEntity.ok(popularCars);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy xe phổ biến: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}/images")
    public ResponseEntity<List<ImageDTO>> getCarImages(@PathVariable Integer id) {
        logger.info("Gọi API /cars/{}/images để lấy hình ảnh", id);
        try {
            List<ImageDTO> images = service.findImagesByCarId(id);
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy hình ảnh cho xe {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/search")
public ResponseEntity<List<CarDTO>> searchCars(
        @RequestParam(required = false) String pickupLocation,
        @RequestParam(required = false) String country,
        @RequestParam(required = false) String pickupDate,
        @RequestParam(required = false) String dropoffDate,
        @RequestParam(required = false) String pickupTime,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime pickupDateTime,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dropoffDateTime,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
    
    logger.info("Yêu cầu tìm kiếm xe với pickupLocation: {}, pickupDateTime: {}, dropoffDateTime: {}", 
               pickupLocation, pickupDateTime, dropoffDateTime);
    
    try {
        CountryCode countryCode = null;
        if (country != null && !country.trim().isEmpty()) {
            countryCode = countryCodeRepository.findById(country).orElse(null);
            if (countryCode == null) {
                logger.warn("Không tìm thấy country code: {}", country);
                return ResponseEntity.ok(List.of());
            }
        }
        
        List<CarDTO> cars;
        
        // Ưu tiên sử dụng pickupDateTime/dropoffDateTime nếu có
        if (pickupDateTime != null && dropoffDateTime != null) {
            // SỬA: Sử dụng method overload mới với đúng parameters
            cars = service.searchAvailableCars(pickupLocation, countryCode, pickupDateTime, dropoffDateTime, page, size);
        } else {
            // Fallback về logic cũ
            cars = service.searchCars(pickupLocation, countryCode, pickupDate, dropoffDate, pickupTime, page, size);
        }
        
        return ResponseEntity.ok(cars);
    } catch (Exception e) {
        logger.error("Lỗi khi tìm kiếm xe: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
}
    @GetMapping("/{id}")
    public ResponseEntity<CarDetailsResponseDTO> getCar(@PathVariable @Min(1) Integer id) {
        logger.info("Yêu cầu lấy chi tiết xe với ID: {}", id);
        if (id == null) {
            throw new IllegalArgumentException("ID xe không hợp lệ");
        }
        try {
            return ResponseEntity.ok(service.getCarDetailsWithReviews(id));
        } catch (Exception e) {
            logger.error("Lỗi khi lấy chi tiết xe {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/brands")
    public ResponseEntity<String> handleInvalidBrandsRequest() {
        logger.warn("Request không hợp lệ tới /api/cars/brands, chuyển hướng tới /api/cars/car-brands");
        return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                .header("Location", "/api/cars/car-brands")
                .build();
    }

    // Lấy tất cả xe có phân trang (của hoàng)
    @GetMapping("")
    public ResponseEntity<Page<CarDTO>> getAllCars(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) { // Đổi size về 9 cho khớp frontend
        logger.info("Gọi API /cars để lấy tất cả xe, trang {}, kích thước {}", page, size);
        try {
            Page<CarDTO> cars = service.findAll(page, size);
            if (cars.isEmpty()) {
                logger.warn("Không tìm thấy xe nào trong cơ sở dữ liệu");
            }
            logger.info("Tổng số xe: {}, Tổng số trang: {}", cars.getTotalElements(), cars.getTotalPages());
            return ResponseEntity.ok(cars);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách xe: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<CarDTO>> getCarsBySupplierId(@PathVariable Integer supplierId) {
        logger.info("Yêu cầu lấy xe theo nhà cung cấp với ID: {}", supplierId);
        try {
            List<CarDTO> cars = service.findBySupplierId(supplierId);
            return ResponseEntity.ok(cars);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy xe theo supplierId {}: {}", supplierId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/brand/{carBrandId}")
    public ResponseEntity<List<CarDTO>> getCarsByCarBrandId(@PathVariable Integer carBrandId) {
        logger.info("Yêu cầu lấy xe theo thương hiệu với ID: {}", carBrandId);
        try {
            List<CarDTO> cars = service.findByCarBrandId(carBrandId);
            return ResponseEntity.ok(cars);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy xe theo carBrandId {}: {}", carBrandId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Tạo xe mới (của hoàng)
    @PostMapping("")
    public ResponseEntity<CarDTO> createCar(@RequestBody CarDTO dto) {
        logger.info("Yêu cầu tạo xe mới: {}", dto);
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.save(dto));
        } catch (Exception e) {
            logger.error("Lỗi khi tạo xe: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Cập nhật xe (của hoàng)
    @PutMapping("/{id}")
    public ResponseEntity<CarDTO> updateCar(@PathVariable Integer id, @RequestBody CarDTO dto) {
        logger.info("Yêu cầu cập nhật xe với ID: {}", id);
        try {
            return ResponseEntity.ok(service.update(id, dto));
        } catch (Exception e) {
            logger.error("Lỗi khi cập nhật xe {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Xóa xe (của hoàng)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCar(@PathVariable Integer id) {
        logger.warn("Yêu cầu xóa xe với ID: {}", id);
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Lỗi khi xóa xe {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/car-brands")
    public ResponseEntity<List<CarBrandDTO>> getCarBrands() {
        logger.info("Yêu cầu lấy danh sách thương hiệu xe");
        try {
            List<CarBrandDTO> carBrands = service.getCarBrands();
            return ResponseEntity.ok(carBrands);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách thương hiệu xe: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/fuel-types")
    public ResponseEntity<List<FuelType>> getFuelTypes() {
        logger.info("Yêu cầu lấy danh sách loại nhiên liệu");
        try {
            List<FuelType> fuelTypes = service.getFuelTypes();
            return ResponseEntity.ok(fuelTypes);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách loại nhiên liệu: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/regions")
    public ResponseEntity<List<Region>> getRegions() {
        logger.info("Yêu cầu lấy danh sách vùng");
        try {
            List<Region> regions = service.getRegions();
            return ResponseEntity.ok(regions);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách vùng: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/regions/country/{countryCode}")
    public ResponseEntity<List<RegionDTO>> getRegionsByCountryCode(@PathVariable String countryCode) {
        logger.info("Yêu cầu lấy danh sách vùng theo mã quốc gia: {}", countryCode);
        try {
            List<RegionDTO> regions = service.getRegionsByCountryCode(countryCode);
            return ResponseEntity.ok(regions);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách vùng theo countryCode {}: {}", countryCode, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/country-codes")
    public ResponseEntity<List<CountryCodeDTO>> getCountryCodes() {
        logger.info("Yêu cầu lấy danh sách mã quốc gia");
        try {
            List<CountryCodeDTO> countryCodes = service.getCountryCodes();
            return ResponseEntity.ok(countryCodes);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách mã quốc gia: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/seat-options")
    public ResponseEntity<List<Short>> getSeatOptions() {
        logger.info("Yêu cầu lấy danh sách số ghế");
        try {
            List<Short> seatOptions = service.getSeatOptions();
            return ResponseEntity.ok(seatOptions);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách số ghế: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/price-ranges")
    public ResponseEntity<List<String>> getPriceRanges() {
        logger.info("Yêu cầu lấy danh sách khoảng giá");
        try {
            List<String> priceRanges = service.getPriceRanges();
            return ResponseEntity.ok(priceRanges);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách khoảng giá: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/years")
    public ResponseEntity<List<Short>> getYears() {
        logger.info("Yêu cầu lấy danh sách năm sản xuất");
        try {
            List<Short> years = service.getYears();
            return ResponseEntity.ok(years);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách năm sản xuất: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{carId}/rentals")
    public ResponseEntity<List<RentalHistoryDTO>> getRentalHistory(@PathVariable Integer carId) {
        logger.info("Yêu cầu lấy lịch sử thuê xe với ID xe: {}", carId);
        try {
            List<RentalHistoryDTO> rentalHistory = service.getRentalHistory(carId);
            return ResponseEntity.ok(rentalHistory);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy lịch sử thuê xe {}: {}", carId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}/similar")
    public ResponseEntity<Page<CarDTO>> getSimilarCars(
            @PathVariable(required = false) Integer id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        logger.info("Yêu cầu lấy xe tương tự với ID: {}", id);
        return ResponseEntity.ok(service.findSimilarCars(id, page, size));
    }

    @GetMapping("/{id}/specifications")
    public ResponseEntity<CarSpecificationsDTO> getCarSpecifications(@PathVariable(required = false) Integer id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        logger.info("Yêu cầu lấy thông số kỹ thuật xe với ID: {}", id);
        CarSpecificationsDTO specifications = service.getCarSpecifications(id);
        return ResponseEntity.ok(specifications);
    }

    @GetMapping("/{id}/similar-advanced")
    public ResponseEntity<Page<CarDTO>> getSimilarCarsAdvanced(
            @PathVariable(required = false) Integer id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size) {
        logger.info("Yêu cầu lấy xe tương tự nâng cao cho xe với ID: {}, trang {}, kích thước {}", id, page, size);
        try {
            Page<CarDTO> similarCars = service.findSimilarCarsAdvanced(id, page, size);
            return ResponseEntity.ok(similarCars);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy xe tương tự nâng cao cho xe {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Cập nhật endpoint /filter để hỗ trợ date filtering
@GetMapping("/filter")
public ResponseEntity<Page<CarDTO>> filterCars(
    @RequestParam(required = false) String brand,
    @RequestParam(required = false) String countryCode,
    @RequestParam(required = false) Integer regionId,
    @RequestParam(required = false) Short numOfSeats,
    @RequestParam(required = false) String priceRange,
    @RequestParam(required = false) Short year,
    @RequestParam(required = false) String fuelType,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime pickupDateTime,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dropoffDateTime,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "9") int size,
    @RequestParam(required = false) String sortBy
) {
    logger.info("Yêu cầu lọc xe với date filters: pickupDateTime={}, dropoffDateTime={}", pickupDateTime, dropoffDateTime);
    try {
        Page<CarDTO> cars;
        
        // Nếu có date filter, sử dụng availability logic
        if (pickupDateTime != null && dropoffDateTime != null) {
            Instant startDate = pickupDateTime.atZone(ZoneId.systemDefault()).toInstant();
            Instant endDate = dropoffDateTime.atZone(ZoneId.systemDefault()).toInstant();
            
            cars = service.getAvailableCarsWithFilters(
                startDate, endDate, brand, countryCode, regionId, 
                numOfSeats, priceRange, year, fuelType, page, size, sortBy);
        } else {
            // Không có date filter, sử dụng logic cũ
            cars = service.filterCars(brand, countryCode, regionId, numOfSeats, priceRange, year, fuelType, page, size, sortBy);
        }
        
        return ResponseEntity.ok(cars);
    } catch (Exception e) {
        logger.error("Lỗi khi lọc xe: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
}
    @GetMapping("/search/keyword")
    public ResponseEntity<Page<CarDTO>> searchCarsByKeyword(
            @RequestParam(required = false) String searchQuery,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        logger.info("Yêu cầu tìm kiếm xe theo từ khóa: {}, trang {}, kích thước {}", searchQuery, page, size);
        try {
            Page<CarDTO> cars = service.findCars(searchQuery, page, size);
            return ResponseEntity.ok(cars);
        } catch (Exception e) {
            logger.error("Lỗi khi tìm kiếm xe theo từ khóa: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Thêm endpoint mới sau dòng 285 (sau endpoint /search/keyword)
@GetMapping("/available")
public ResponseEntity<Page<CarDTO>> getAvailableCars(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime pickupDateTime,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dropoffDateTime,
        @RequestParam(required = false) String brand,
        @RequestParam(required = false) String countryCode,
        @RequestParam(required = false) Integer regionId,
        @RequestParam(required = false) Short numOfSeats,
        @RequestParam(required = false) String priceRange,
        @RequestParam(required = false) Short year,
        @RequestParam(required = false) String fuelType,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "9") int size,
        @RequestParam(required = false) String sortBy) {
    
    logger.info("Yêu cầu lấy xe available với pickupDateTime: {}, dropoffDateTime: {}, page: {}, size: {}", 
               pickupDateTime, dropoffDateTime, page, size);
    
    try {
        // Nếu không có thời gian, sử dụng mặc định
        if (pickupDateTime == null) {
            pickupDateTime = LocalDateTime.now();
        }
        if (dropoffDateTime == null) {
            dropoffDateTime = pickupDateTime.plusDays(1);
        }
        
        // Convert LocalDateTime sang Instant để tương thích với existing code
        Instant startDate = pickupDateTime.atZone(ZoneId.systemDefault()).toInstant();
        Instant endDate = dropoffDateTime.atZone(ZoneId.systemDefault()).toInstant();
        
        Page<CarDTO> availableCars = service.getAvailableCarsWithFilters(
            startDate, endDate, brand, countryCode, regionId, 
            numOfSeats, priceRange, year, fuelType, page, size, sortBy);
        
        return ResponseEntity.ok(availableCars);
    } catch (Exception e) {
        logger.error("Lỗi khi lấy xe available: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
}

    @GetMapping("/{carId}/booked-dates")
    public ResponseEntity<BookedDatesResponseDTO> getBookedDates(@PathVariable Integer carId) {
        logger.info("Yêu cầu lấy ngày đã đặt cho xe với ID: {}", carId);
        try {
            List<String> bookedDates = service.getBookedDates(carId);
            BookedDatesResponseDTO response = new BookedDatesResponseDTO(bookedDates);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy ngày đã đặt cho xe {}: {}", carId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // --- ADMIN ENDPOINTS ---
    @GetMapping("/admin/pending-cars")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CarDTO>> getPendingCars() {
        List<CarDTO> pendingCars = service.findByStatusName("pending");
        return ResponseEntity.ok(pendingCars);
    }

    @PostMapping("/admin/approve-car/{carId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveCar(@PathVariable Integer carId) {
        try {
            service.approveCar(carId);
            return ResponseEntity.ok("Car approved");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/admin/reject-car/{carId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectCar(@PathVariable Integer carId) {
        try {
            service.rejectCar(carId);
            return ResponseEntity.ok("Car rejected");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}