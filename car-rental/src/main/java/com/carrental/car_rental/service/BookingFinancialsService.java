package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.BookingDTO;
import com.carrental.car_rental.dto.BookingFinancialsDTO;
import com.carrental.car_rental.dto.PriceBreakdownDTO;
import com.carrental.car_rental.entity.BookingFinancial;
import com.carrental.car_rental.entity.Booking;
import com.carrental.car_rental.entity.Car;
import com.carrental.car_rental.entity.Promotion;
import com.carrental.car_rental.entity.Region;
import com.carrental.car_rental.mapper.BookingFinancialsMapper;
import com.carrental.car_rental.repository.BookingFinancialsRepository;
import com.carrental.car_rental.repository.BookingRepository;
import com.carrental.car_rental.repository.CarRepository;
import com.carrental.car_rental.repository.PromotionRepository;
import com.carrental.car_rental.repository.RegionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingFinancialsService {
    private static final Logger logger = LoggerFactory.getLogger(BookingFinancialsService.class);
    
    private final BookingFinancialsRepository repository;
    private final BookingFinancialsMapper mapper;
    private final CarRepository carRepository;
    private final PromotionRepository promotionRepository;
    private final BookingRepository bookingRepository;
    private final RegionRepository regionRepository;

    // Constants for fees
    private static final BigDecimal DRIVER_FEE_PER_DAY = new BigDecimal("300000.00"); // VND
    private static final BigDecimal OVERTIME_FEE_PER_HOUR = new BigDecimal("100000.00"); // VND
    private static final BigDecimal DELIVERY_FEE = new BigDecimal("100000.00"); // VND

    @Transactional(readOnly = true)
    public BookingFinancialsDTO findById(Integer id) {
        BookingFinancial entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "BookingFinancials not found with id: " + id));
        return mapper.toDTO(entity);
    }

    @Transactional(readOnly = true)
    public List<BookingFinancialsDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> !e.getIsDeleted())
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingFinancialsDTO> findByBookingId(Integer bookingId) {
        return repository.findByBookingIdAndIsDeletedFalse(bookingId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public BookingFinancialsDTO save(BookingFinancialsDTO dto) {
        if (dto.getBookingId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking ID is required");
        }

        // Kiểm tra xem BookingFinancial đã tồn tại chưa
        Optional<BookingFinancial> existingEntity = repository.findById(dto.getBookingId());
        
        BookingFinancial entity;
        if (existingEntity.isPresent()) {
            // Update existing entity - chỉ cập nhật các field cần thiết
            entity = existingEntity.get();
            entity.setTotalFare(dto.getTotalFare());
            entity.setAppliedDiscount(dto.getAppliedDiscount());
            entity.setLateFeeAmount(dto.getLateFeeAmount());
            entity.setLateDays(dto.getLateDays());
            entity.setIsDeleted(false);
        } else {
            Booking bookingEntity = bookingRepository.findById(dto.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
            entity = new BookingFinancial();
            entity.setBooking(bookingEntity);
            entity.setTotalFare(dto.getTotalFare());
            entity.setAppliedDiscount(dto.getAppliedDiscount());
            entity.setLateFeeAmount(dto.getLateFeeAmount());
            entity.setLateDays(dto.getLateDays());
            entity.setIsDeleted(false);
        }
        
        // Lưu entity - sử dụng persist thay vì save để tránh merge
        try {
            logger.info("Trước khi save BookingFinancials vào DB");
            BookingFinancial savedEntity = repository.save(entity);
            logger.info("Đã save BookingFinancials vào DB, id={}", savedEntity.getId());
            return mapper.toDTO(savedEntity);
        } catch (Exception e) {
            logger.error("Error saving BookingFinancial for booking ID: {}", dto.getBookingId(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error saving booking financials: " + e.getMessage());
        }
    }

    public BookingFinancialsDTO createOrUpdateFinancials(BookingDTO booking) {
        logger.info("Bắt đầu createOrUpdateFinancials cho bookingId={}", booking.getBookingId());
        logger.info("Trước khi truy vấn BookingFinancials...");
        Optional<BookingFinancial> bf = repository.findById(booking.getBookingId());
        logger.info("Sau khi truy vấn BookingFinancials...");
        
        // Lấy thông tin xe
        Car car = carRepository.findById(booking.getCarId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found"));

        // Validate dates
        if (booking.getPickupDateTime() == null || booking.getDropoffDateTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pickup or dropoff date is missing");
        }
        if (booking.getPickupDateTime().isAfter(booking.getDropoffDateTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pickup date cannot be after dropoff date");
        }

        // Tính số ngày thuê
        long days = ChronoUnit.DAYS.between(booking.getPickupDateTime(), booking.getDropoffDateTime());
        if (days < 1) days = 1;

        // Khai báo các biến cần thiết
        BigDecimal dailyRate = car.getDailyRate();
        BigDecimal basePrice;
        BigDecimal extraFees;
        BigDecimal totalFare;
        BigDecimal tax;
        BigDecimal discount;
        BigDecimal total;

        // Validate daily rate
        if (dailyRate.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Invalid daily rate for car ID: " + booking.getCarId());
        }

        // Tính các khoản phí
        basePrice = dailyRate.multiply(BigDecimal.valueOf(days));
        extraFees = calculateExtraFees(booking, days);
        BigDecimal serviceFee = basePrice.multiply(new BigDecimal("0.1")).setScale(2, RoundingMode.HALF_UP); // 10% phí dịch vụ
        tax = basePrice.multiply(new BigDecimal("0.1")).setScale(2, RoundingMode.HALF_UP); // 10% VAT chỉ trên basePrice
        discount = BigDecimal.ZERO;

        // Tính discount nếu có promotion
        if (booking.getPromoId() != null) {
            Promotion promo = promotionRepository.findById(booking.getPromoId())
                    .filter(p -> !p.getIsDeleted() && p.getEndDate().isAfter(LocalDate.now()))
                    .orElse(null);
            if (promo != null) {
                BigDecimal discountRate = promo.getDiscountPercentage()
                    .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                discount = basePrice.multiply(discountRate);
                discount = discount.min(basePrice); // Ensure discount doesn't exceed base price
            }
        }

        // Tính tổng cuối cùng (totalFare) = basePrice + extraFees + serviceFee + tax - discount
        totalFare = basePrice.add(extraFees).add(serviceFee).add(tax).subtract(discount);
        if (totalFare.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Total price cannot be negative");
        }
        BigDecimal deposit = totalFare.multiply(new BigDecimal("0.30")).setScale(2, RoundingMode.HALF_UP);

        // Tạo PriceBreakdownDTO
        PriceBreakdownDTO breakdown = new PriceBreakdownDTO();
        breakdown.setBasePrice(basePrice.setScale(2, RoundingMode.HALF_UP));
        breakdown.setExtraFee(extraFees.setScale(2, RoundingMode.HALF_UP));
        breakdown.setServiceFee(serviceFee);
        breakdown.setTax(tax);
        breakdown.setDiscount(discount.setScale(2, RoundingMode.HALF_UP));
        breakdown.setTotal(totalFare.setScale(2, RoundingMode.HALF_UP));
        breakdown.setDeposit(deposit);
        
        // Tạo DTO và lưu (chỉ các trường có trong entity)
        BookingFinancialsDTO financials = new BookingFinancialsDTO();
        financials.setBookingId(booking.getBookingId());
        financials.setTotalFare(totalFare.setScale(2, RoundingMode.HALF_UP));
        financials.setAppliedDiscount(discount.setScale(2, RoundingMode.HALF_UP));
        financials.setLateFeeAmount(BigDecimal.ZERO);
        financials.setLateDays(0);
        financials.setIsDeleted(false);

        logger.info("Trước khi save BookingFinancials vào DB");
        try {
            BookingFinancialsDTO savedFinancials = save(financials);
            // Set deposit vào DTO trả về (KHÔNG lưu vào entity/DB)
            savedFinancials.setDeposit(deposit);
            logger.info("Đã save BookingFinancials vào DB, id={}", savedFinancials.getBookingId());
            return savedFinancials;
        } catch (Exception e) {
            logger.error("Lỗi khi tạo BookingFinancials cho booking ID: {}", booking.getBookingId(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error saving booking financials: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public PriceBreakdownDTO calculatePriceBreakdown(BookingDTO booking) {
        Car car = carRepository.findById(booking.getCarId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found"));

        BigDecimal dailyRate = car.getDailyRate();
        BigDecimal basePrice;
        BigDecimal extraFees;
        BigDecimal totalFare;
        BigDecimal tax;
        BigDecimal discount;
        BigDecimal total;
        BigDecimal deposit;
        try {
            logger.info("[DEBUG] Calculating price breakdown for booking: {}", booking);
            if (booking == null) {
                logger.error("[DEBUG] BookingDTO is null");
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking không hợp lệ");
            }
            if (booking.getCarId() == null) {
                logger.error("[DEBUG] Booking missing carId: {}", booking.getBookingId());
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking thiếu carId");
            }
            if (booking.getRegionId() == null) {
                logger.error("[DEBUG] Booking missing regionId: {}", booking.getBookingId());
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking thiếu regionId");
            }
            if (booking.getPickupDateTime() == null || booking.getDropoffDateTime() == null) {
                logger.error("[DEBUG] Booking missing pickup/dropoff date: {} | pickup: {} | dropoff: {}", booking.getBookingId(), booking.getPickupDateTime(), booking.getDropoffDateTime());
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking thiếu ngày nhận/trả xe");
            }
            car = carRepository.findById(booking.getCarId()).orElse(null);
            if (car == null) {
                logger.error("[DEBUG] Car not found for carId {} (bookingId {})", booking.getCarId(), booking.getBookingId());
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy xe cho booking");
            }
            if (car.getDailyRate() == null) {
                logger.error("[DEBUG] Car missing dailyRate for carId {}", car.getId());
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Xe không có giá thuê/ngày");
            }
            Region region = regionRepository.findById(booking.getRegionId()).orElse(null);
            if (region == null) {
                logger.error("[DEBUG] Region not found for regionId {} (bookingId {})", booking.getRegionId(), booking.getBookingId());
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khu vực cho booking");
            }
            // Tính số ngày thuê
            long days = ChronoUnit.DAYS.between(booking.getPickupDateTime(), booking.getDropoffDateTime());
            if (days < 1) days = 1;

            // Validate daily rate
            dailyRate = car.getDailyRate();
            if (dailyRate.compareTo(BigDecimal.ZERO) <= 0) {
                logger.error("[DEBUG] Invalid daily rate for carId {}: {}", booking.getCarId(), dailyRate);
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Invalid daily rate for car ID: " + booking.getCarId());
            }

            // Tính các khoản phí
            basePrice = dailyRate.multiply(BigDecimal.valueOf(days));
            extraFees = calculateExtraFees(booking, days);
            BigDecimal serviceFee = basePrice.multiply(new BigDecimal("0.1")).setScale(2, RoundingMode.HALF_UP); // 10% phí dịch vụ
            tax = basePrice.multiply(new BigDecimal("0.1")).setScale(2, RoundingMode.HALF_UP); // 10% VAT chỉ trên basePrice
            discount = BigDecimal.ZERO;

            // Tính discount nếu có promotion
            if (booking.getPromoId() != null) {
                Promotion promo = promotionRepository.findById(booking.getPromoId())
                        .filter(p -> !p.getIsDeleted() && p.getEndDate().isAfter(LocalDate.now()))
                        .orElse(null);
                if (promo != null) {
                    BigDecimal discountRate = promo.getDiscountPercentage()
                        .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                    discount = basePrice.multiply(discountRate);
                    discount = discount.min(basePrice); // Ensure discount doesn't exceed base price
                }
            }

            // Tính tổng và tiền cọc
            total = basePrice.add(extraFees).add(serviceFee).add(tax).subtract(discount);
            if (total.compareTo(BigDecimal.ZERO) < 0) {
                logger.error("[DEBUG] Total price negative for bookingId {}: total={}", booking.getBookingId(), total);
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Total price cannot be negative");
            }

            deposit = total.multiply(new BigDecimal("0.30")).setScale(2, RoundingMode.HALF_UP);

            // Tạo PriceBreakdownDTO
            PriceBreakdownDTO breakdown = new PriceBreakdownDTO();
            breakdown.setBasePrice(basePrice.setScale(2, RoundingMode.HALF_UP));
            breakdown.setExtraFee(extraFees.setScale(2, RoundingMode.HALF_UP));
            breakdown.setServiceFee(serviceFee);
            breakdown.setTax(tax);
            breakdown.setDiscount(discount.setScale(2, RoundingMode.HALF_UP));
            breakdown.setTotal(total.setScale(2, RoundingMode.HALF_UP));
            breakdown.setDeposit(deposit);
            
            return breakdown;
        } catch (Exception e) {
            logger.error("[DEBUG] Error calculating price breakdown for bookingId {}: {}", booking != null ? booking.getBookingId() : null, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi tính giá: " + e.getMessage());
        }
    }

    private BigDecimal calculateExtraFees(BookingDTO booking, long days) {
        BigDecimal extraFees = BigDecimal.ZERO;

        // Driver fee: 300,000 VND per day if driverId is present hoặc withDriver = true
        if (booking.getDriverId() != null && booking.getDriverId() > 1 || Boolean.TRUE.equals(booking.getWithDriver())) {
            extraFees = extraFees.add(DRIVER_FEE_PER_DAY.multiply(BigDecimal.valueOf(days)));
            logger.info("Added driver fee: {} VND for {} days", 
                DRIVER_FEE_PER_DAY.multiply(BigDecimal.valueOf(days)), days);
        }

        // Delivery fee: 100,000 VND if requested
        if (Boolean.TRUE.equals(booking.getDeliveryRequested())) {
            extraFees = extraFees.add(DELIVERY_FEE);
            logger.info("Added delivery fee: {} VND", DELIVERY_FEE);
        }

        // Overtime fee: 100,000 VND per hour
        if (booking.getEstimatedOvertimeHours() != null && booking.getEstimatedOvertimeHours() > 0) {
            BigDecimal overtimeFee = OVERTIME_FEE_PER_HOUR.multiply(BigDecimal.valueOf(booking.getEstimatedOvertimeHours()));
            extraFees = extraFees.add(overtimeFee);
            logger.info("Added overtime fee: {} VND for {} hours", overtimeFee, booking.getEstimatedOvertimeHours());
        }

        return extraFees.setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public BookingFinancialsDTO update(Integer id, BookingFinancialsDTO dto) {
        BookingFinancial entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "BookingFinancials not found with id: " + id));
        
        // Update fields
        entity.setTotalFare(dto.getTotalFare());
        entity.setAppliedDiscount(dto.getAppliedDiscount());
        entity.setLateFeeAmount(dto.getLateFeeAmount());
        entity.setLateDays(dto.getLateDays());
        entity.setIsDeleted(false);
        
        return mapper.toDTO(repository.save(entity));
    }

    @Transactional
    public void delete(Integer id) {
        BookingFinancial entity = repository.findById(id)
                .filter(e -> !e.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "BookingFinancials not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }

    @Transactional(readOnly = true)
    public BookingFinancialsDTO getOrCreateFinancials(BookingDTO booking) {
        logger.info("Getting or creating financials for booking ID: {}", booking.getBookingId());
        
        // Thử lấy financials hiện có
        Optional<BookingFinancial> existingFinancials = repository.findById(booking.getBookingId());
        
        if (existingFinancials.isPresent() && !existingFinancials.get().getIsDeleted()) {
            return mapper.toDTO(existingFinancials.get());
        }
        
        // Nếu không có, tạo mới
        return createOrUpdateFinancials(booking);
    }
}
