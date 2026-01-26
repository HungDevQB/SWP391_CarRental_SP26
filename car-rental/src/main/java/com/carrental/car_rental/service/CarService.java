package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.*;
import com.carrental.car_rental.entity.*;
import com.carrental.car_rental.mapper.CarMapper;
import com.carrental.car_rental.mapper.ImageMapper;
import com.carrental.car_rental.mapper.UserDetailMapper;
import com.carrental.car_rental.mapper.UserMapper;
import com.carrental.car_rental.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarService {

    private static final Logger logger = LoggerFactory.getLogger(CarService.class);
    private final CarRepository repository;
    private final BookingRepository bookingRepository;
    private final CarMapper mapper;
    private final ImageRepository imageRepository;
    private final ImageMapper imageMapper;
    private final CarBrandRepository carBrandRepository;
    private final FuelTypeRepository fuelTypeRepository;
    private final RegionRepository regionRepository;
    private final CountryCodeRepository countryCodeRepository;
    private final RatingRepository ratingRepository; // Thêm dependency này
    private final StatusRepository statusRepository;

    @Autowired
    private UserDetailRepository userDetailRepository;
    @Autowired
    private UserDetailMapper userDetailMapper;
    @Autowired
    private UserMapper userMapper;

    @Transactional(readOnly = true)
    public List<CarDTO> getFeaturedCars(int page, int size) {
        logger.info("Lấy danh sách xe nổi bật (statusId = 11), trang {}, kích thước {}", page, size);
        try {
            Pageable pageable = PageRequest.of(page, size);
            return repository.findFeaturedCars(pageable)
                    .getContent()
                    .stream()
                    .map(car -> {
                        CarDTO dto = mapper.toDTO(car);
                        dto.setImages(getImagesForCar(car.getId()));
                        setAverageRating(dto); // Thêm dòng này
                        return dto;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách xe nổi bật: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách xe nổi bật", e);
        }
    }

    @Transactional(readOnly = true)
    public List<CarDTO> getPopularCars(int page, int size) {
        logger.info("Lấy danh sách xe phổ biến, trang {}, kích thước {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        return repository.findPopularCars(pageable)
                .getContent()
                .stream()
                .map(car -> {
                    CarDTO dto = mapper.toDTO(car);
                    dto.setImages(getImagesForCar(car.getId()));
                    setAverageRating(dto); // Thêm dòng này
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CarDTO> searchCars(String pickupLocation, CountryCode country, String pickupDate, String dropoffDate, String pickupTime, int page, int size) {
        logger.info("Tìm kiếm xe với pickupLocation: {}, country: {}, pickupDate: {}, dropoffDate: {}, pickupTime: {}, trang {}, kích thước {}",
                pickupLocation, country, pickupDate, dropoffDate, pickupTime, page, size);
        CarSearchRequestDTO request = new CarSearchRequestDTO();
        request.setStartDate(pickupDate != null ? Instant.parse(pickupDate + "T" + (pickupTime != null ? pickupTime + "Z" : "00:00:00Z")) : null);
        request.setEndDate(dropoffDate != null ? Instant.parse(dropoffDate + "T23:59:59Z") : null);
        // Lọc region theo country
        List<Region> regions = regionRepository.findByCountryCodeAndIsDeletedFalse(country);
        Region matchedRegion = regions.stream()
            .filter(region -> region.getRegionName().equalsIgnoreCase(pickupLocation))
            .findFirst().orElse(null);
        if (matchedRegion == null) {
            return List.of(); // Không có region phù hợp
        }
        request.setRegionId(matchedRegion.getId());
        return searchAvailableCars(request, page, size)
                .stream()
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CarDTO> searchAvailableCars(CarSearchRequestDTO request, int page, int size) {
        logger.info("Tìm kiếm xe khả dụng với request: {}, trang {}, kích thước {}", request, page, size);
        Instant startDate = request.getStartDate();
        Instant endDate = request.getEndDate();
        Pageable pageable = PageRequest.of(page, size);

        if (startDate == null || endDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ngày bắt đầu và kết thúc là bắt buộc.");
        }

        if (startDate.isAfter(endDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ngày kết thúc phải sau ngày bắt đầu.");
        }

        // Lọc xe khả dụng dựa trên lịch booking
        Page<Car> cars = repository.searchCars(pageable);
        return cars.getContent()
                .stream()
                .map(car -> {
                    Car fullCar = repository.findByIdWithRelations(car.getId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Xe không tồn tại: " + car.getId()));
                    CarDTO dto = mapper.toDTO(fullCar);
                    dto.setImages(getImagesForCar(fullCar.getId()));
                    setAverageRating(dto); // Thêm dòng này
                    return dto;
                })
                .filter(car -> isCarAvailable(car.getCarId(), startDate, endDate))
                .filter(car -> {
                    boolean matchesCriteria = true;
                    if (request.getBrandId() != null && !Objects.equals(car.getCarBrandId(), request.getBrandId())) {
                        matchesCriteria = false;
                    }
                    if (request.getFuelTypeId() != null && !Objects.equals(car.getFuelTypeId(), request.getFuelTypeId())) {
                        matchesCriteria = false;
                    }
                    if (request.getRegionId() != null && !Objects.equals(car.getRegionId(), request.getRegionId())) {
                        matchesCriteria = false;
                    }
                    return matchesCriteria;
                })
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<CarDTO> searchAvailableCars(String pickupLocation, CountryCode country, 
                                          LocalDateTime pickupDateTime, LocalDateTime dropoffDateTime, 
                                          int page, int size) {
        logger.info("Tìm kiếm xe available với pickupLocation: {}, country: {}, pickupDateTime: {}, dropoffDateTime: {}, trang {}, kích thước {}",
                pickupLocation, country, pickupDateTime, dropoffDateTime, page, size);
        
        // Convert LocalDateTime sang Instant
        Instant startDate = pickupDateTime.atZone(ZoneId.systemDefault()).toInstant();
        Instant endDate = dropoffDateTime.atZone(ZoneId.systemDefault()).toInstant();
        
        // Tạo CarSearchRequestDTO
        CarSearchRequestDTO request = new CarSearchRequestDTO();
        request.setStartDate(startDate);
        request.setEndDate(endDate);
        
        // Lọc region theo country
        if (pickupLocation != null && country != null) {
            List<Region> regions = regionRepository.findByCountryCodeAndIsDeletedFalse(country);
            Region matchedRegion = regions.stream()
                .filter(region -> region.getRegionName().equalsIgnoreCase(pickupLocation))
                .findFirst().orElse(null);
            if (matchedRegion == null) {
                return List.of(); // Không có region phù hợp
            }
            request.setRegionId(matchedRegion.getId());
        }
        
        // Gọi method existing
        return searchAvailableCars(request, page, size);
    }
    @Transactional(readOnly = true)
    public CarDetailsResponseDTO getCarDetailsWithReviews(Integer carId) {
        logger.info("Lấy chi tiết xe với carId: {}", carId);
        Car car = repository.findByIdWithRelations(carId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Xe không tồn tại với id: " + carId));

        CarDetailsResponseDTO dto = new CarDetailsResponseDTO();
        CarDTO carDTO = mapper.toDTO(car);
        // LOG: Kiểm tra supplier và userDetail mapping
        if (carDTO.getSupplier() != null) {
            logger.info("[LOG] carDTO.supplier: {}", carDTO.getSupplier());
            if (carDTO.getSupplier().getUserDetail() != null) {
                logger.info("[LOG] carDTO.supplier.userDetail: {}", carDTO.getSupplier().getUserDetail());
            } else {
                logger.warn("[LOG] carDTO.supplier.userDetail is NULL!");
            }
        } else {
            logger.warn("[LOG] carDTO.supplier is NULL!");
        }
        dto.setCarId(carDTO.getCarId());
        dto.setSupplierId(carDTO.getSupplierId());
        dto.setSupplierEmail(car.getSupplier().getEmail());
        dto.setCarBrandId(carDTO.getCarBrandId());
        dto.setBrandName(carDTO.getBrandName());
        dto.setModel(carDTO.getModel());
        dto.setYear((int) carDTO.getYear());
        dto.setColor(carDTO.getColor());
        dto.setNumOfSeats(carDTO.getNumOfSeats());
        dto.setRegionId(carDTO.getRegionId());
        dto.setRegionName(carDTO.getRegionName());
        dto.setFeatures(carDTO.getFeatures());
        dto.setFuelTypeId(carDTO.getFuelTypeId());
        dto.setFuelTypeName(carDTO.getFuelTypeName());
        dto.setStatusId(carDTO.getStatusId());
        dto.setStatusName(carDTO.getStatusName());
        dto.setLicensePlate(carDTO.getLicensePlate());
        dto.setDailyRate(carDTO.getDailyRate());
        dto.setCreatedAt(carDTO.getCreatedAt());
        dto.setUpdatedAt(carDTO.getUpdatedAt());
        dto.setImages(getImagesForCar(carId));
        dto.setRentalCount(getRentalCountForCar(carId));
        dto.setDescribe(car.getDescribe());
        dto.setTransmission(car.getTransmission());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<ImageDTO> findImagesByCarId(Integer carId) {
        logger.info("Lấy hình ảnh cho xe với carId: {}", carId);
        return imageRepository.findByCarIdAndIsDeletedFalse(carId).stream()
                .sorted((img1, img2) -> Boolean.compare(img2.getIsMain(), img1.getIsMain()))
                .map(imageMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CarDTO findById(Integer id) {
        logger.info("Tìm xe với id: {}", id);
        Car car = repository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Xe không tồn tại với id: " + id));
        CarDTO dto = mapper.toDTO(car);
        dto.setImages(getImagesForCar(id));

        // Lấy supplier và userDetail
        if (car.getSupplier() != null) {
            UserDTO supplierDTO = userMapper.toDto(car.getSupplier());
            userDetailRepository.findById(car.getSupplier().getId()).ifPresent(userDetail -> {
                supplierDTO.setUserDetail(userDetailMapper.toDTO(userDetail));
            });
            dto.setSupplier(supplierDTO);
        }
        
        // Tính và set averageRating thực tế
        Double avgRating = calculateAverageRating(id);
        dto.setAverageRating(avgRating);
        return dto;
    }

    // Lấy tất cả xe có phân trang (của hoàng)
    @Transactional(readOnly = true)
    public Page<CarDTO> findAll(int page, int size) {
        logger.info("Lấy tất cả xe, trang {}, kích thước {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<Car> cars = repository.findAllWithRelations(pageable);
        logger.info("Số xe trên trang hiện tại: {}", cars.getContent().size());
        logger.info("Danh sách car IDs: {}", cars.getContent().stream().map(Car::getId).collect(Collectors.toList()));
        return cars.map(car -> {
            CarDTO dto = mapper.toDTO(car);
            dto.setImages(getImagesForCar(car.getId()));
            
            // Tính và set averageRating cho từng xe
            Double avgRating = calculateAverageRating(car.getId());
            dto.setAverageRating(avgRating);
            
            return dto;
        });
    }

    @Transactional(readOnly = true)
    public List<CarDTO> findBySupplierId(Integer supplierId) {
        logger.info("Tìm xe theo supplierId: {}", supplierId);
        return repository.findBySupplierIdAndIsDeletedFalse(supplierId).stream()
                .map(car -> {
                    CarDTO dto = mapper.toDTO(car);
                    dto.setImages(getImagesForCar(car.getId()));
                    setAverageRating(dto); // Thêm dòng này
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CarDTO> findByCarBrandId(Integer carBrandId) {
        logger.info("Tìm xe theo carBrandId: {}", carBrandId);
        return repository.findByBrand_IdAndIsDeletedFalse(carBrandId).stream()
                .map(car -> {
                    CarDTO dto = mapper.toDTO(car);
                    dto.setImages(getImagesForCar(car.getId()));
                    setAverageRating(dto); // Thêm dòng này
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CarBrandDTO> getCarBrands() {
        logger.info("Lấy danh sách thương hiệu xe");
        try {
            return carBrandRepository.findByIsDeletedFalse().stream()
                    .map(carBrand -> {
                        CarBrandDTO dto = new CarBrandDTO();
                        dto.setCarBrandId(carBrand.getId());
                        dto.setBrandName(carBrand.getBrandName());
                        return dto;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách thương hiệu xe: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách thương hiệu xe", e);
        }
    }

    @Transactional(readOnly = true)
    public List<FuelType> getFuelTypes() {
        logger.info("Lấy danh sách loại nhiên liệu");
        try {
            return fuelTypeRepository.findAll().stream()
                    .filter(fuelType -> !fuelType.getIsDeleted())
                    .distinct()
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách loại nhiên liệu: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách loại nhiên liệu", e);
        }
    }

    @Transactional(readOnly = true)
    public List<Region> getRegions() {
        logger.info("Lấy danh sách vùng");
        try {
            return regionRepository.findAll().stream()
                    .filter(region -> !region.getIsDeleted())
                    .distinct()
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách vùng: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách vùng", e);
        }
    }

    @Transactional(readOnly = true)
    public List<RegionDTO> getRegionsByCountryCode(String countryCode) {
        logger.info("Lấy danh sách vùng theo mã quốc gia: {}", countryCode);
        try {
            CountryCode country = countryCodeRepository.findById(countryCode)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mã quốc gia không tồn tại: " + countryCode));
            return regionRepository.findByCountryCodeAndIsDeletedFalse(country).stream()
                    .map(region -> {
                        RegionDTO dto = new RegionDTO();
                        dto.setRegionId(region.getId());
                        dto.setRegionName(region.getRegionName());
                        dto.setCurrency(region.getCurrency());
                        return dto;
                    })
                    .distinct()
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách vùng theo countryCode {}: {}", countryCode, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách vùng theo mã quốc gia", e);
        }
    }

    @Transactional(readOnly = true)
    public List<CountryCodeDTO> getCountryCodes() {
        logger.info("Lấy danh sách mã quốc gia");
        try {
            // Giả định bạn có CountryCodeRepository
            return countryCodeRepository.findAll().stream()
                    .map(countryCode -> new CountryCodeDTO(countryCode.getCountryCode(), countryCode.getCountryName()))
                    .distinct()
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách mã quốc gia: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách mã quốc gia", e);
        }
    }

    @Transactional(readOnly = true)
    public List<Short> getSeatOptions() {
        logger.info("Lấy danh sách số ghế");
        try {
            return repository.findAllWithRelations().stream()
                    .filter(car -> !car.getIsDeleted())
                    .map(Car::getNumOfSeats)
                    .distinct()
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách số ghế: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách số ghế", e);
        }
    }

    @Transactional(readOnly = true)
    public List<String> getPriceRanges() {
        logger.info("Lấy danh sách khoảng giá");
        try {
            Map<Double, List<Double>> priceGroups = repository.findAllWithRelations().stream()
                    .filter(car -> !car.getIsDeleted())
                    .map(car -> car.getDailyRate().doubleValue())
                    .distinct()
                    .sorted()
                    .collect(Collectors.groupingBy(
                            price -> Math.floor(price / 500) * 500
                    ));

            return priceGroups.keySet().stream()
                    .sorted()
                    .map(key -> String.format("%.0f-%.0f", key, key + 499))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách khoảng giá: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách khoảng giá", e);
        }
    }

    @Transactional(readOnly = true)
    public List<Short> getYears() {
        logger.info("Lấy danh sách năm sản xuất");
        try {
            return repository.findAllWithRelations().stream()
                    .filter(car -> !car.getIsDeleted())
                    .map(Car::getYear)
                    .distinct()
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách năm sản xuất: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lấy danh sách năm sản xuất", e);
        }
    }

    // Lưu xe mới (của hoàng)
    @Transactional
    public CarDTO save(CarDTO dto) {
        logger.info("Lưu xe mới: {}", dto);
        Car entity = mapper.toEntity(dto);
        entity.setIsDeleted(false);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());
        return mapper.toDTO(repository.save(entity));
    }

    // Cập nhật xe (của hoàng)
    @Transactional
    public CarDTO update(Integer id, CarDTO dto) {
        logger.info("Cập nhật xe với id: {}", id);
        Car existingCar = repository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Xe không tìm thấy với id: " + id));
        Car updatedEntity = mapper.toEntity(dto);
        updatedEntity.setId(id);
        updatedEntity.setIsDeleted(false);
        updatedEntity.setCreatedAt(existingCar.getCreatedAt());
        updatedEntity.setUpdatedAt(Instant.now());
        return mapper.toDTO(repository.save(updatedEntity));
    }

    // Xóa xe (của hoàng)
    @Transactional
    public void delete(Integer id) {
        logger.info("Xóa xe với id: {}", id);
        Car car = repository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Xe không tìm thấy với id: " + id));
        car.setIsDeleted(true);
        repository.save(car);
    }

    private List<ImageDTO> getImagesForCar(Integer carId) {
        return imageRepository.findByCarIdAndIsDeletedFalse(carId).stream()
                .sorted((img1, img2) -> Boolean.compare(img2.getIsMain(), img1.getIsMain()))
                .map(imageMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RentalHistoryDTO> getRentalHistory(Integer carId) {
        logger.info("Lấy lịch sử thuê xe cho xe với carId: {}", carId);
        try {
            Car car = repository.findByIdWithRelations(carId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Xe không tồn tại với id: " + carId));

            // Lấy tất cả các booking liên quan đến xe này
            List<Booking> bookings = bookingRepository.findByCarId(carId);

            return bookings.stream()
                    .filter(booking -> booking.getStatus() != null && !"CANCELLED".equals(booking.getStatus().getStatusName()))
                    .map(booking -> {
                        RentalHistoryDTO dto = new RentalHistoryDTO();
                        dto.setId(booking.getId());
                        dto.setRenterName(booking.getCustomer() != null ? booking.getCustomer().getUsername() : "N/A");
                        dto.setStartDate(booking.getStartDate().toString());
                        dto.setEndDate(booking.getEndDate().toString());
                        dto.setStatus(booking.getStatus() != null ? booking.getStatus().getStatusName() : "N/A");
                        return dto;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Lỗi khi lấy lịch sử thuê xe cho carId {}: {}", carId, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lấy lịch sử thuê xe", e);
        }
    }

    private boolean isCarAvailable(Integer carId, Instant startDate, Instant endDate) {
        List<Booking> bookings = bookingRepository.findByCarIdAndOverlappingDates(carId, startDate, endDate);
        return bookings.isEmpty();
    }

    public Page<CarDTO> findSimilarCars(Integer carId, int page, int size) {
        Car car = repository.findById(carId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found with id: " + carId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        // Tìm xe tương tự dựa trên brand
        Page<Car> similarCars = repository.findSimilarCars(
            car.getBrand().getId(),
            carId,
            pageable
        );

        return similarCars.map(carEntity -> {
            CarDTO dto = mapper.toDTO(carEntity);
            setAverageRating(dto); // Thêm dòng này
            return dto;
        });
    }

    public CarSpecificationsDTO getCarSpecifications(Integer carId) {
        Car car = repository.findByIdWithRelations(carId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found with id: " + carId));

        // Parse the features string into a Map
        Map<String, String> specifications = new HashMap<>();
        if (car.getFeatures() != null && !car.getFeatures().isEmpty()) {
            String[] features = car.getFeatures().split(",");
            for (String feature : features) {
                String[] parts = feature.split(":");
                if (parts.length == 2) {
                    specifications.put(parts[0].trim(), parts[1].trim());
                }
            }
        }

        return new CarSpecificationsDTO(specifications);
    }

    @Transactional(readOnly = true)
    public Page<CarDTO> findSimilarCarsAdvanced(Integer carId, int page, int size) {
        logger.info("Tìm xe tương tự nâng cao cho carId: {}, trang {}, kích thước {}", carId, page, size);
        
        // Lấy thông tin xe hiện tại
        Car currentCar = repository.findByIdWithRelations(carId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Xe không tồn tại với id: " + carId));
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Car> similarCars = null;
        
        // Thử lấy xe cùng thương hiệu trước
        similarCars = repository.findByBrand_IdAndIsDeletedFalseAndIdNot(currentCar.getBrand().getId(), carId, pageable);
        
        // Nếu không có xe cùng thương hiệu, thử lấy xe cùng khu vực
        if (similarCars.isEmpty() && currentCar.getRegion() != null) {
            similarCars = repository.findByRegion_IdAndIsDeletedFalseAndIdNot(currentCar.getRegion().getId(), carId, pageable);
        }
        
        // Nếu vẫn không có, thử lấy xe cùng loại nhiên liệu
        if (similarCars.isEmpty() && currentCar.getFuelType() != null) {
            similarCars = repository.findByFuelType_IdAndIsDeletedFalseAndIdNot(currentCar.getFuelType().getId(), carId, pageable);
        }
        
        // Nếu vẫn không có, lấy bất kỳ xe nào khác
        if (similarCars.isEmpty()) {
            similarCars = repository.findByIdNotAndIsDeletedFalse(carId, pageable);
        }
        
        return similarCars.map(car -> {
            CarDTO dto = mapper.toDTO(car);
            dto.setImages(getImagesForCar(car.getId()));
            setAverageRating(dto); // Thêm dòng này
            return dto;
        });
    }

    @Transactional(readOnly = true)
    public Page<CarDTO> filterCars(
        String brand,
        String countryCode,
        Integer regionId,
        Short numOfSeats,
        String priceRange,
        Short year,
        String fuelType,
        int page,
        int size,
        String sortBy
    ) {
        try {
            // Create pageable before the lambda
            Pageable pageable = PageRequest.of(page, size);
            if (sortBy != null && !sortBy.isEmpty()) {
                switch (sortBy) {
                    case "price-low" -> pageable = PageRequest.of(page, size, Sort.by("dailyRate").ascending());
                    case "price-high" -> pageable = PageRequest.of(page, size, Sort.by("dailyRate").descending());
                    case "name" -> pageable = PageRequest.of(page, size, Sort.by("model").ascending());
                    default -> pageable = PageRequest.of(page, size, Sort.by("carId").descending());
                }
            }
            
            // Tạo specification cho việc lọc
            Specification<Car> spec = (root, query, cb) -> {
                List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
                
                // Lọc theo brand
                if (brand != null && !brand.isEmpty()) {
                    predicates.add(cb.equal(root.get("brand").get("brandName"), brand));
                }
                
                // Lọc theo country code và region
                if (countryCode != null && !countryCode.isEmpty()) {
                    // Nếu có regionId, lọc theo regionId
                    if (regionId != null) {
                        predicates.add(cb.equal(root.get("region").get("id"), regionId));
                    } else {
                        // Nếu không có regionId, lọc theo countryCode
                        predicates.add(cb.equal(root.get("region").get("countryCode").get("countryCode"), countryCode));
                    }
                }
                
                // Lọc theo số chỗ ngồi
                if (numOfSeats != null) {
                    predicates.add(cb.equal(root.get("numOfSeats"), numOfSeats));
                }
                
                // Lọc theo khoảng giá
                if (priceRange != null && !priceRange.isEmpty()) {
                    String[] range = priceRange.split("-");
                    if (range.length == 2) {
                        BigDecimal minPrice = new BigDecimal(range[0].trim());
                        BigDecimal maxPrice = new BigDecimal(range[1].trim());
                        predicates.add(cb.between(root.get("dailyRate"), minPrice, maxPrice));
                    }
                }
                
                // Lọc theo năm sản xuất
                if (year != null) {
                    predicates.add(cb.equal(root.get("year"), year));
                }
                
                // Lọc theo loại nhiên liệu
                if (fuelType != null && !fuelType.isEmpty()) {
                    predicates.add(cb.equal(root.get("fuelType").get("fuelTypeName"), fuelType));
                }
                
                // Chỉ fetch join khi query là select (không phải count)
                if (query.getResultType() != Long.class) {
                    root.fetch("brand", jakarta.persistence.criteria.JoinType.LEFT);
                    root.fetch("region", jakarta.persistence.criteria.JoinType.LEFT);
                    root.fetch("fuelType", jakarta.persistence.criteria.JoinType.LEFT);
                    root.fetch("images", jakarta.persistence.criteria.JoinType.LEFT);
                }
                
                return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
            };
            
            return repository.findAll(spec, pageable).map(car -> {
                CarDTO dto = mapper.toDTO(car);
                dto.setImages(getImagesForCar(car.getId()));
                setAverageRating(dto); // Thêm dòng này
                return dto;
            });
        } catch (Exception e) {
            logger.error("Error filtering cars: ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to filter cars", e);
        }
    }

    // Thêm method mới sau dòng 580 (sau method filterCars)
@Transactional(readOnly = true)
public Page<CarDTO> getAvailableCarsWithFilters(
        Instant startDate, 
        Instant endDate,
        String brand,
        String countryCode,
        Integer regionId,
        Short numOfSeats,
        String priceRange,
        Short year,
        String fuelType,
        int page,
        int size,
        String sortBy) {
    
    try {
        logger.info("Lấy xe available với filters từ {} đến {}", startDate, endDate);
        
        // Tạo pageable
        Pageable pageable = PageRequest.of(page, size);
        if (sortBy != null && !sortBy.isEmpty()) {
            switch (sortBy) {
                case "price-low" -> pageable = PageRequest.of(page, size, Sort.by("dailyRate").ascending());
                case "price-high" -> pageable = PageRequest.of(page, size, Sort.by("dailyRate").descending());
                case "name" -> pageable = PageRequest.of(page, size, Sort.by("model").ascending());
                default -> pageable = PageRequest.of(page, size, Sort.by("carId").descending());
            }
        }
        
        // Tạo specification kết hợp availability + filters
        Specification<Car> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            
            // === AVAILABILITY CHECK ===
            // Subquery để tìm xe đã được đặt trong khoảng thời gian
            jakarta.persistence.criteria.Subquery<Integer> bookedCarSubquery = query.subquery(Integer.class);
            jakarta.persistence.criteria.Root<Booking> bookingRoot = bookedCarSubquery.from(Booking.class);
            bookedCarSubquery.select(bookingRoot.get("car").get("id"));
            
            List<jakarta.persistence.criteria.Predicate> bookingPredicates = new ArrayList<>();
            bookingPredicates.add(cb.equal(bookingRoot.get("isDeleted"), false));
            bookingPredicates.add(cb.in(bookingRoot.get("status").get("statusName")).value("confirmed").value("ongoing").value("completed"));
            
            // Date overlap condition
            jakarta.persistence.criteria.Predicate dateOverlap = cb.or(
                // Booking starts before endDate AND ends after startDate
                cb.and(
                    cb.lessThanOrEqualTo(bookingRoot.get("startDate"), endDate),
                    cb.greaterThan(bookingRoot.get("endDate"), startDate)
                )
            );
            bookingPredicates.add(dateOverlap);
            
            bookedCarSubquery.where(cb.and(bookingPredicates.toArray(new jakarta.persistence.criteria.Predicate[0])));
            
            // Xe KHÔNG nằm trong danh sách đã được đặt
            predicates.add(cb.not(cb.in(root.get("id")).value(bookedCarSubquery)));
            
            // === OTHER FILTERS ===
            // Chỉ xe available và không bị xóa
            predicates.add(cb.equal(root.get("isDeleted"), false));
            predicates.add(cb.equal(root.get("status").get("statusName"), "available"));
            
            // Brand filter
            if (brand != null && !brand.isEmpty()) {
                predicates.add(cb.equal(root.get("brand").get("brandName"), brand));
            }
            
            // Country/Region filter
            if (countryCode != null && !countryCode.isEmpty()) {
                if (regionId != null) {
                    predicates.add(cb.equal(root.get("region").get("id"), regionId));
                } else {
                    predicates.add(cb.equal(root.get("region").get("countryCode").get("countryCode"), countryCode));
                }
            }
            
            // Seats filter
            if (numOfSeats != null) {
                predicates.add(cb.equal(root.get("numOfSeats"), numOfSeats));
            }
            
            // Price range filter
            if (priceRange != null && !priceRange.isEmpty()) {
                String[] range = priceRange.split("-");
                if (range.length == 2) {
                    BigDecimal minPrice = new BigDecimal(range[0].trim());
                    BigDecimal maxPrice = new BigDecimal(range[1].trim());
                    predicates.add(cb.between(root.get("dailyRate"), minPrice, maxPrice));
                }
            }
            
            // Year filter
            if (year != null) {
                predicates.add(cb.equal(root.get("year"), year));
            }
            
            // Fuel type filter
            if (fuelType != null && !fuelType.isEmpty()) {
                predicates.add(cb.equal(root.get("fuelType").get("fuelTypeName"), fuelType));
            }
            
            // Fetch joins để tránh N+1 queries (chỉ cho select query)
            if (query.getResultType() != Long.class) {
                root.fetch("brand", jakarta.persistence.criteria.JoinType.LEFT);
                root.fetch("region", jakarta.persistence.criteria.JoinType.LEFT);
                root.fetch("fuelType", jakarta.persistence.criteria.JoinType.LEFT);
                root.fetch("status", jakarta.persistence.criteria.JoinType.LEFT);
            }
            
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        
        // Execute query
        Page<Car> cars = repository.findAll(spec, pageable);
        
        // Convert to DTOs
        return cars.map(car -> {
            CarDTO dto = mapper.toDTO(car);
            dto.setImages(getImagesForCar(car.getId()));
            setAverageRating(dto);
            return dto;
        });
        
    } catch (Exception e) {
        logger.error("Lỗi khi lấy xe available với filters: ", e);
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lấy xe available", e);
    }
}

    @Transactional(readOnly = true)
    public Page<CarDTO> findCars(String searchQuery, int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            
            Specification<Car> spec = (root, query, cb) -> {
                if (searchQuery == null || searchQuery.trim().isEmpty()) {
                    return cb.conjunction(); // Trả về tất cả xe khi không có từ khóa tìm kiếm
                }
                
                String searchPattern = "%" + searchQuery.toLowerCase() + "%";
                
                return cb.or(
                    cb.like(cb.lower(root.get("model")), searchPattern),
                    cb.like(cb.lower(root.get("brand").get("brandName")), searchPattern)
                );
            };
            
            return repository.findAll(spec, pageable).map(car -> {
                CarDTO dto = mapper.toDTO(car);
                dto.setImages(getImagesForCar(car.getId()));
                setAverageRating(dto); // Thêm dòng này
                return dto;
            });
        } catch (Exception e) {
            logger.error("Error searching cars: ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to search cars", e);
        }
    }

    // Đảm bảo method setAverageRating đúng format (đã có nhưng kiểm tra lại):
    private void setAverageRating(CarDTO carDTO) {
    if (carDTO.getCarId() != null) {
        Double avgRating = calculateAverageRating(carDTO.getCarId());
        carDTO.setAverageRating(avgRating);
    }
}


    @Transactional(readOnly = true)
    public List<String> getBookedDates(Integer carId) {
        logger.info("Lấy ngày đã đặt cho xe với carId: {}", carId);
        try {
            // Lấy tất cả booking của xe này với status không phải CANCELLED
            List<Booking> bookings = bookingRepository.findByCarIdAndStatusStatusNameNotAndIsDeletedFalse(
                    carId, "cancelled");

            List<String> bookedDates = new ArrayList<>();

            for (Booking booking : bookings) {
                // SỬA: Chuyển Instant -> LocalDate
                LocalDate startDate = booking.getStartDate() != null ? booking.getStartDate().atZone(ZoneId.systemDefault()).toLocalDate() : null;
                LocalDate endDate = booking.getEndDate() != null ? booking.getEndDate().atZone(ZoneId.systemDefault()).toLocalDate() : null;
                if (startDate == null || endDate == null) continue;
                // Thêm tất cả ngày từ startDate đến endDate
                LocalDate currentDate = startDate;
                while (!currentDate.isAfter(endDate)) {
                    bookedDates.add(currentDate.toString());
                    currentDate = currentDate.plusDays(1);
                }
            }

            logger.info("Tìm thấy {} ngày đã đặt cho xe {}", bookedDates.size(), carId);
            return bookedDates;
        } catch (Exception e) {
            logger.error("Lỗi khi lấy ngày đã đặt cho xe {}: {}", carId, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lấy ngày đã đặt", e);
        }
    }

public Double calculateAverageRating(Integer carId) {
    try {
        List<Rating> ratings = ratingRepository.findByCarIdAndIsDeletedFalse(carId);
        if (ratings.isEmpty()) {
            return null; // Hoặc 0.0 nếu muốn hiển thị 0
        }
        
        double sum = ratings.stream()
                .mapToDouble(rating -> rating.getRatingScore())
                .sum();
        
        return Math.round((sum / ratings.size()) * 10.0) / 10.0; // Làm tròn 1 chữ số thập phân
    } catch (Exception e) {
        logger.error("Lỗi khi tính averageRating cho carId {}: {}", carId, e.getMessage());
        return null;
    }
}
private Integer getRentalCountForCar(Integer carId) {
    try {
        return bookingRepository.countBookingsByCarId(carId);
    } catch (Exception e) {
        logger.error("Lỗi khi lấy rental count cho carId {}: {}", carId, e.getMessage());
        return 0;
    }
}

    // --- ADMIN METHODS ---
    public List<CarDTO> findByStatusName(String statusName) {
        // Sử dụng custom query join fetch để tránh LazyInitializationException
        return repository.findByStatusNameWithSupplierAndRelations(statusName)
                .stream().map(mapper::toDTO).toList();
    }

    public void approveCar(Integer carId) {
        Car car = repository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));
        Status availableStatus = statusRepository.findByStatusNameIgnoreCase("available");
        if (availableStatus == null) throw new RuntimeException("Status 'available' not found");
        car.setStatus(availableStatus);
        repository.save(car);
    }

    public void rejectCar(Integer carId) {
        Car car = repository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));
        Status rejectedStatus = statusRepository.findByStatusNameIgnoreCase("rejected");
        if (rejectedStatus == null) throw new RuntimeException("Status 'rejected' not found");
        car.setStatus(rejectedStatus);
        repository.save(car);
}
}