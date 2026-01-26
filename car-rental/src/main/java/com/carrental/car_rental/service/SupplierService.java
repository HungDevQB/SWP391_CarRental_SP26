package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.*;
import com.carrental.car_rental.entity.*;
import com.carrental.car_rental.repository.*;
import com.carrental.car_rental.mapper.BookingMapper;
import com.carrental.car_rental.mapper.CarMapper;
import com.carrental.car_rental.mapper.InsuranceMapper;
import com.carrental.car_rental.mapper.MaintenanceMapper;
import com.carrental.car_rental.service.BookingFinancialsService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.io.IOException;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;

@Service
public class SupplierService {

    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ImageService imageService;
    private final BookingMapper bookingMapper;
    private final StatusRepository statusRepository;
    private final CarMapper carMapper;
    private final BookingFinancialsService bookingFinancialsService;
    private final PaymentRepository paymentRepository;
    private final CarBrandRepository carBrandRepository;
    private final RegionRepository regionRepository;
    private final FuelTypeRepository fuelTypeRepository;
    private final InsuranceRepository insuranceRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final InsuranceMapper insuranceMapper;
    private final MaintenanceMapper maintenanceMapper;
    private static final Logger logger = LoggerFactory.getLogger(SupplierService.class);


    public SupplierService(CarRepository carRepository,
                          BookingRepository bookingRepository,
                          UserRepository userRepository,
                          ImageService imageService,
                          BookingMapper bookingMapper,
                          StatusRepository statusRepository,
                          CarMapper carMapper,
                          BookingFinancialsService bookingFinancialsService,
                          PaymentRepository paymentRepository,
                          CarBrandRepository carBrandRepository,
                          RegionRepository regionRepository,
                          FuelTypeRepository fuelTypeRepository,
                          InsuranceRepository insuranceRepository,
                          MaintenanceRepository maintenanceRepository,
                          InsuranceMapper insuranceMapper,
                          MaintenanceMapper maintenanceMapper) {
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.imageService = imageService;
        this.bookingMapper = bookingMapper;
        this.statusRepository = statusRepository;
        this.carMapper = carMapper;
        this.bookingFinancialsService = bookingFinancialsService;
        this.paymentRepository = paymentRepository;
        this.carBrandRepository = carBrandRepository;
        this.regionRepository = regionRepository;
        this.fuelTypeRepository = fuelTypeRepository;
        this.insuranceRepository = insuranceRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.insuranceMapper = insuranceMapper;
        this.maintenanceMapper = maintenanceMapper;
    }

    public User getCurrentSupplier() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found"));
    }

    @Transactional
    public ResponseEntity<?> addCar(String carDataJson, List<MultipartFile> images) {
        try {
            System.out.println("=== DEBUG: SupplierService.addCar ===");
            System.out.println("carDataJson: " + carDataJson);
            System.out.println("images count: " + (images != null ? images.size() : "null"));
            
            ObjectMapper objectMapper = new ObjectMapper();
            VehicleDTO vehicleDTO = objectMapper.readValue(carDataJson, VehicleDTO.class);

            User supplier = getCurrentSupplier();
            if (carRepository.findByLicensePlateAndIsDeletedFalse(vehicleDTO.getLicensePlate()).isPresent()) {
                return ResponseEntity.status(409).body("Biển số xe đã tồn tại");
            }
            Car car = new Car();
            car.setModel(vehicleDTO.getName());
            car.setLicensePlate(vehicleDTO.getLicensePlate());
            car.setFeatures(vehicleDTO.getDescription());
            if (vehicleDTO.getRentalPrice() != null)
                car.setDailyRate(java.math.BigDecimal.valueOf(vehicleDTO.getRentalPrice()));
            car.setSupplier(supplier);
            car.setIsDeleted(false);
            Status pendingStatus = statusRepository.findByStatusName("pending").orElse(null);
            if (pendingStatus == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy trạng thái pending");
            }
            car.setStatus(pendingStatus);
            // Mapping brand
            CarBrand brand = carBrandRepository.findAll().stream()
                .filter(b -> b.getBrandName().equalsIgnoreCase(vehicleDTO.getBrand()))
                .findFirst()
                .orElse(null);
            if (brand == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy hãng xe: " + vehicleDTO.getBrand());
            }
            car.setBrand(brand);
            // Mapping region
            Region region = regionRepository.findAll().stream()
                .filter(r -> r.getRegionName().equalsIgnoreCase(vehicleDTO.getRegion()))
                .findFirst()
                .orElse(null);
            if (region == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy khu vực: " + vehicleDTO.getRegion());
            }
            car.setRegion(region);
            // Mapping fuelType
            FuelType fuelType = fuelTypeRepository.findAll().stream()
                .filter(f -> f.getFuelTypeName().equalsIgnoreCase(vehicleDTO.getFuelType()))
                .findFirst()
                .orElse(null);
            if (fuelType == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy loại nhiên liệu: " + vehicleDTO.getFuelType());
            }
            car.setFuelType(fuelType);
            // Transmission
            car.setTransmission(vehicleDTO.getTransmission());
            // Num of seats
            car.setNumOfSeats(vehicleDTO.getNumOfSeats() != null ? vehicleDTO.getNumOfSeats().shortValue() : (short)4);
            if (vehicleDTO.getYear() != null) {
                car.setYear(vehicleDTO.getYear().shortValue());
            }
            car.setColor(vehicleDTO.getColor());
            Car savedCar = carRepository.save(car);
            System.out.println("Đã lưu xe với ID: " + savedCar.getId());
            
            if (images != null && !images.isEmpty()) {
                System.out.println("Bắt đầu xử lý " + images.size() + " ảnh...");
                for (int i = 0; i < images.size(); i++) {
                    MultipartFile file = images.get(i);
                    System.out.println("Xử lý ảnh " + (i + 1) + ": " + file.getOriginalFilename());
                    
                    Image image = new Image();
                    image.setCar(savedCar);
                    // Ảnh đầu tiên sẽ là ảnh chính
                    image.setIsMain(i == 0);
                    // Thiết lập mô tả cho ảnh
                    String description = i == 0 ? "Hình chính " + savedCar.getModel() : "Hình phụ " + savedCar.getModel() + " (" + (i + 1) + ")";
                    image.setDescription(description);
                    
                    System.out.println("Mô tả ảnh: " + description);
                    System.out.println("Is main: " + image.getIsMain());
                    
                    try {
                        imageService.saveImage(image, file);
                        System.out.println("Đã lưu ảnh thành công: " + (i + 1));
                        logger.info("Đã lưu ảnh {} cho xe {}", i + 1, savedCar.getId());
                    } catch (Exception e) {
                        System.err.println("Lỗi khi lưu ảnh " + (i + 1) + ": " + e.getMessage());
                        e.printStackTrace();
                        logger.error("Lỗi khi lưu ảnh {} cho xe {}: {}", i + 1, savedCar.getId(), e.getMessage());
                        // Tiếp tục với ảnh tiếp theo nếu có lỗi
                    }
                }
                System.out.println("Hoàn thành xử lý ảnh");
            } else {
                System.out.println("Không có ảnh để xử lý");
            }
            return ResponseEntity.ok(Map.of("success", true, "message", "Đăng xe thành công!"));
        } catch (Exception e) {
            System.err.println("[DEBUG] carDataJson: " + carDataJson);
            e.printStackTrace(); // log ra console
            logger.error("Lỗi khi đăng xe:", e);
            return ResponseEntity.status(500).body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    @Transactional
    public ResponseEntity<?> updateCar(Integer id, VehicleDTO vehicleDTO) {
        try {
            Car car = carRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Car not found"));
            if (!car.getSupplier().equals(getCurrentSupplier())) {
                return ResponseEntity.status(403).body("Not authorized to update this car");
            }
            var existedCar = carRepository.findByLicensePlateAndIsDeletedFalse(vehicleDTO.getLicensePlate());
            if (existedCar.isPresent() && !existedCar.get().getId().equals(id)) {
                return ResponseEntity.status(409).body("Biển số xe đã tồn tại");
            }
            car.setModel(vehicleDTO.getName());
            car.setLicensePlate(vehicleDTO.getLicensePlate());
            car.setFeatures(vehicleDTO.getDescription());
            if (vehicleDTO.getRentalPrice() != null)
                car.setDailyRate(java.math.BigDecimal.valueOf(vehicleDTO.getRentalPrice()));
            return ResponseEntity.ok(carRepository.save(car));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error handling image: " + e.getMessage());
        }
    }

    @Transactional
    public ResponseEntity<?> deleteCar(Integer id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Car not found"));
        if (!car.getSupplier().equals(getCurrentSupplier())) {
            return ResponseEntity.status(403).body("Not authorized to delete this car");
        }

        if (bookingRepository.existsByCar_IdAndStatus_StatusNameNot(id, "completed")) {
            return ResponseEntity.badRequest().body("Cannot delete car with active bookings");
        }
        car.setIsDeleted(true);
        return ResponseEntity.ok(carRepository.save(car));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<?> getBookings() {
        User supplier = getCurrentSupplier();
        List<Booking> bookings = bookingRepository.findByCar_SupplierWithAllRelations(supplier);
        List<BookingDTO> bookingDTOs = bookings.stream()
                .map(booking -> {
                    BookingDTO dto = bookingMapper.toDTO(booking);
                    try {
                        BookingFinancialsDTO financials = bookingFinancialsService.getOrCreateFinancials(dto);
                        if (financials != null && financials.getTotalFare() != null) {
                            dto.setTotalAmount(financials.getTotalFare());
                        } else {
                            dto.setTotalAmount(java.math.BigDecimal.ZERO);
                        }
                    } catch (Exception e) {
                        dto.setTotalAmount(java.math.BigDecimal.ZERO);
                    }
                    // Đã thanh toán full_payment chưa
                    boolean hasFullPayment = paymentRepository.existsByBookingIdAndPaymentTypeAndIsDeleted(booking.getId(), "full_payment", false);
                    dto.setHasFullPayment(hasFullPayment);
                    // Supplier đã xác nhận nhận đủ tiền chưa (tạm thời: status in progress hoặc completed)
                    dto.setSupplierConfirmedFullPayment(
                        "in progress".equalsIgnoreCase(dto.getStatusName()) ||
                        "completed".equalsIgnoreCase(dto.getStatusName())
                    );
                    // Đã hoàn cọc chưa
                    boolean depositRefunded = paymentRepository.existsByBookingIdAndPaymentTypeAndIsDeleted(booking.getId(), "refund", false);
                    dto.setDepositRefunded(depositRefunded);
                    // Trạng thái hoàn cọc
                    String refundStatus = null;
                    var refundPayment = paymentRepository.findByBookingIdAndPaymentTypeAndIsDeleted(booking.getId(), "refund", false)
                            .orElse(null);
                    if (refundPayment != null && refundPayment.getPaymentStatus() != null) {
                        refundStatus = "paid".equalsIgnoreCase(refundPayment.getPaymentStatus().getStatusName()) ? "completed" : "pending";
                    }
                    dto.setRefundStatus(refundStatus);
                    // Trạng thái payout
                    String payoutStatus = null;
                    var payoutPayment = paymentRepository.findByBookingIdAndPaymentTypeAndIsDeleted(booking.getId(), "payout", false)
                            .orElse(null);
                    if (payoutPayment != null && payoutPayment.getPaymentStatus() != null) {
                        payoutStatus = "paid".equalsIgnoreCase(payoutPayment.getPaymentStatus().getStatusName()) ? "completed" : "pending";
                    }
                    dto.setPayoutStatus(payoutStatus);
                    
                    // ✅ THÊM: Load payment details cho từng booking
                    List<Payment> payments = paymentRepository.findByBookingIdAndIsDeleted(booking.getId(), false);
                    List<PaymentDTO> paymentDetails = payments.stream()
                        .map(payment -> {
                            PaymentDTO pdto = new PaymentDTO();
                            pdto.setPaymentId(payment.getId());
                            pdto.setBookingId(payment.getBooking().getId());
                            pdto.setAmount(payment.getAmount());
                            pdto.setCurrency(payment.getRegion().getCurrency());
                            pdto.setTransactionId(payment.getTransactionId());
                            pdto.setPaymentMethod(payment.getPaymentMethod());
                            pdto.setPaymentType(payment.getPaymentType());
                            if (payment.getPaymentDate() != null) {
                                pdto.setPaymentDate(java.time.LocalDateTime.ofInstant(
                                    payment.getPaymentDate(), 
                                    java.time.ZoneId.systemDefault()
                                ));
                            }
                            if (payment.getPaymentStatus() != null) {
                                pdto.setStatusName(payment.getPaymentStatus().getStatusName());
                            }
                            return pdto;
                        })
                        .sorted(java.util.Comparator.comparing(PaymentDTO::getPaymentDate, 
                            java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder())))
                        .collect(Collectors.toList());
                    dto.setPaymentDetails(paymentDetails);
                    
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(bookingDTOs);
    }

    @Transactional
    public ResponseEntity<?> confirmBooking(Integer id) {
        System.out.println("[CONFIRM_BOOKING] Bắt đầu xác nhận bookingId: " + id);
        try {
            Booking booking = bookingRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
            System.out.println("[CONFIRM_BOOKING] BookingId: " + id + ", CurrentStatus: " + (booking.getStatus() != null ? booking.getStatus().getStatusName() : "null"));
            System.out.println("[CONFIRM_BOOKING] Supplier của booking: " + (booking.getCar() != null && booking.getCar().getSupplier() != null ? booking.getCar().getSupplier().getUsername() : "null"));
            System.out.println("[CONFIRM_BOOKING] Supplier hiện tại: " + getCurrentSupplier().getUsername());

            if (!booking.getCar().getSupplier().equals(getCurrentSupplier())) {
                System.out.println("[CONFIRM_BOOKING] Không đúng supplier!");
                return ResponseEntity.status(403).body("Not authorized to confirm this booking");
            }
            // So sánh status theo statusName (không phân biệt hoa thường)
            String currentStatusName = booking.getStatus() != null ? booking.getStatus().getStatusName() : null;
            if (!"pending".equalsIgnoreCase(currentStatusName)) {
                System.out.println("[CONFIRM_BOOKING] Booking không ở trạng thái pending!");
                return ResponseEntity.badRequest().body("Booking is not in pending status");
            }
            Status confirmedStatus = statusRepository.findByStatusNameIgnoreCase("confirmed");
            booking.setStatus(confirmedStatus);
            bookingRepository.save(booking);
            System.out.println("[CONFIRM_BOOKING] Đã xác nhận thành công bookingId: " + id);
            return ResponseEntity.ok("Booking confirmed successfully");
        } catch (Exception e) {
            System.out.println("[CONFIRM_BOOKING] Lỗi xác nhận bookingId: " + id);
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi xác nhận đơn: " + e.getMessage());
        }
    }

    @Transactional
    public ResponseEntity<?> rejectBooking(Integer id) {
        System.out.println("[REJECT_BOOKING] Bắt đầu từ chối bookingId: " + id);
        try {
            Booking booking = bookingRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
            System.out.println("[REJECT_BOOKING] BookingId: " + id + ", CurrentStatus: " + (booking.getStatus() != null ? booking.getStatus().getStatusName() : "null"));
            System.out.println("[REJECT_BOOKING] Supplier của booking: " + (booking.getCar() != null && booking.getCar().getSupplier() != null ? booking.getCar().getSupplier().getUsername() : "null"));
            System.out.println("[REJECT_BOOKING] Supplier hiện tại: " + getCurrentSupplier().getUsername());

            if (!booking.getCar().getSupplier().equals(getCurrentSupplier())) {
                System.out.println("[REJECT_BOOKING] Không đúng supplier!");
                return ResponseEntity.status(403).body("Not authorized to reject this booking");
            }
            // So sánh status theo statusName (không phân biệt hoa thường)
            String currentStatusName = booking.getStatus() != null ? booking.getStatus().getStatusName() : null;
            if (!"pending".equalsIgnoreCase(currentStatusName)) {
                System.out.println("[REJECT_BOOKING] Booking không ở trạng thái pending!");
                return ResponseEntity.badRequest().body("Booking is not in pending status");
            }
            Status cancelledStatus = statusRepository.findByStatusNameIgnoreCase("cancelled");
            if (cancelledStatus == null) {
                System.out.println("[REJECT_BOOKING] Không tìm thấy status CANCELLED!");
                return ResponseEntity.badRequest().body("Status CANCELLED not found");
            }
            booking.setStatus(cancelledStatus);
            bookingRepository.save(booking);
            System.out.println("[REJECT_BOOKING] Đã từ chối thành công bookingId: " + id);
            return ResponseEntity.ok("Booking rejected successfully");
        } catch (Exception e) {
            System.out.println("[REJECT_BOOKING] Lỗi từ chối bookingId: " + id);
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi từ chối đơn: " + e.getMessage());
        }
    }

    @Transactional
    public ResponseEntity<?> completeBooking(Integer id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        if (!booking.getCar().getSupplier().equals(getCurrentSupplier())) {
            return ResponseEntity.status(403).body("Not authorized to complete this booking");
        }

        Status rentingStatus = statusRepository.findByStatusName("RENTING").orElse(null);
        if (rentingStatus == null || !booking.getStatus().equals(rentingStatus)) {
            return ResponseEntity.badRequest().body("Booking is not in renting status");
        }
        Status completedStatus = statusRepository.findByStatusName("COMPLETED").orElse(null);
        if (completedStatus == null) {
            return ResponseEntity.badRequest().body("Status COMPLETED not found");
        }
        booking.setStatus(completedStatus);
        Status availableStatus = statusRepository.findByStatusName("available").orElse(null);
        if (availableStatus != null) {
            booking.getCar().setStatus(availableStatus);
        }
        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    public ResponseEntity<?> getDashboardSummary() {
        String username = null;
        try {
            username = SecurityContextHolder.getContext().getAuthentication().getName();
            User supplier = getCurrentSupplier();
            if (supplier == null) {
                return ResponseEntity.status(401).body("Supplier not found or not authenticated");
            }
            Map<String, Object> summary = new HashMap<>();
            // Tổng số xe
            summary.put("totalVehicles", carRepository.countBySupplierAndIsDeletedFalse(supplier));
            // Doanh thu tổng payout
            BigDecimal totalPayout = paymentRepository.sumPayoutBySupplier(supplier);
            summary.put("totalRevenue", totalPayout != null ? totalPayout : BigDecimal.ZERO);
            // Doanh thu payout tháng này
            java.time.YearMonth currentMonth = java.time.YearMonth.now();
            java.time.LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
            java.time.LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);
            java.time.Instant startOfMonthInstant = startOfMonth.atZone(java.time.ZoneId.systemDefault()).toInstant();
            java.time.Instant endOfMonthInstant = endOfMonth.atZone(java.time.ZoneId.systemDefault()).toInstant();
            BigDecimal monthlyPayout = paymentRepository.sumMonthlyPayoutBySupplier(supplier, startOfMonthInstant, endOfMonthInstant);
            summary.put("monthlyRevenue", monthlyPayout != null ? monthlyPayout : BigDecimal.ZERO);
            summary.put("availableVehicles", carRepository.countBySupplierAndStatusAndIsDeletedFalse(supplier, "available"));
            summary.put("rentedVehicles", carRepository.countBySupplierAndStatusAndIsDeletedFalse(supplier, "rented"));
            summary.put("pendingApprovalVehicles", carRepository.countBySupplierAndStatusAndIsDeletedFalse(supplier, "pending_approval"));
            summary.put("totalBookings", bookingRepository.countByCar_Supplier(supplier));
            summary.put("pendingBookings", bookingRepository.countByCar_SupplierAndStatus_StatusName(supplier, "pending"));
            summary.put("activeBookings", bookingRepository.countByCar_SupplierAndStatus_StatusName(supplier, "in progress"));
            // --- TÍNH SỐ KHÁCH HÀNG MỚI TRONG THÁNG ---
            List<Booking> bookingsThisMonth = bookingRepository.findByCar_SupplierAndCreatedAtBetween(supplier, startOfMonthInstant, endOfMonthInstant);
            Set<Integer> newCustomerIds = new HashSet<>();
            for (Booking b : bookingsThisMonth) {
                int count = bookingRepository.countByCar_SupplierAndCustomer_IdAndCreatedAtBefore(
                    supplier, b.getCustomer().getId(), startOfMonthInstant
                );
                if (count == 0) {
                    newCustomerIds.add(b.getCustomer().getId());
                }
            }
            summary.put("newCustomers", newCustomerIds.size());
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            System.out.println("[ERROR] Exception in getDashboardSummary for user: " + username + ", message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error in dashboard summary: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getRecentBookings() {
        try {
        User supplier = getCurrentSupplier();
            if (supplier == null) {
                return ResponseEntity.status(401).body("Supplier not found or not authenticated");
            }
        List<Booking> recentBookings = bookingRepository.findByCar_SupplierWithAllRelations(supplier);
            if (recentBookings == null) recentBookings = Collections.emptyList();
        List<BookingDTO> bookingDTOs = recentBookings.stream()
                    .filter(Objects::nonNull)
                    .sorted(Comparator.comparing(Booking::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                    // .limit(10) // BỎ GIỚI HẠN NÀY để trả về tất cả booking
                    .map(booking -> {
                        try {
                            BookingDTO dto = bookingMapper.toDTO(booking);
                            // Set totalAmount như getBookings
                            try {
                                BookingFinancialsDTO financials = bookingFinancialsService.getOrCreateFinancials(dto);
                                if (financials != null && financials.getTotalFare() != null) {
                                    dto.setTotalAmount(financials.getTotalFare());
                                } else {
                                    dto.setTotalAmount(java.math.BigDecimal.ZERO);
                                }
                            } catch (Exception e) {
                                dto.setTotalAmount(java.math.BigDecimal.ZERO);
                            }

                            // Set paymentDetails nếu có
                            List<Payment> payments = paymentRepository.findByBookingIdAndIsDeleted(booking.getId(), false);
                            List<PaymentDTO> paymentDetails = payments.stream()
                                .map(payment -> {
                                    PaymentDTO pdto = new PaymentDTO();
                                    pdto.setPaymentId(payment.getId());
                                    pdto.setBookingId(payment.getBooking().getId());
                                    pdto.setAmount(payment.getAmount());
                                    pdto.setCurrency(payment.getRegion().getCurrency());
                                    pdto.setTransactionId(payment.getTransactionId());
                                    pdto.setPaymentMethod(payment.getPaymentMethod());
                                    pdto.setPaymentType(payment.getPaymentType());
                                    if (payment.getPaymentDate() != null) {
                                        pdto.setPaymentDate(java.time.LocalDateTime.ofInstant(
                                            payment.getPaymentDate(), 
                                            java.time.ZoneId.systemDefault()
                                        ));
                                    }
                                    if (payment.getPaymentStatus() != null) {
                                        pdto.setStatusName(payment.getPaymentStatus().getStatusName());
                                    }
                                    return pdto;
                                })
                                .sorted(java.util.Comparator.comparing(PaymentDTO::getPaymentDate, 
                                    java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder())))
                                .collect(Collectors.toList());
                            dto.setPaymentDetails(paymentDetails);
                            return dto;
                        } catch (Exception e) {
                            logger.error("Error mapping booking to DTO: " + booking.getId(), e);
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                .collect(Collectors.toList());
        return ResponseEntity.ok(bookingDTOs);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy recent bookings cho supplier", e);
            return ResponseEntity.status(500).body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getMonthlyStats() {
        User supplier = getCurrentSupplier();
        int monthsBack = 6;
        List<String> months = new ArrayList<>();
        List<Double> revenueByMonth = new ArrayList<>();
        List<Integer> bookingsByMonth = new ArrayList<>();
        YearMonth now = YearMonth.now();
        List<Integer> newCustomersByMonth = new ArrayList<>();
        Set<Integer> allPreviousCustomerIds = new HashSet<>();

        for (int i = monthsBack - 1; i >= 0; i--) {
            YearMonth ym = now.minusMonths(i);
            String label = ym.getMonthValue() + "/" + ym.getYear();
            months.add(label);
            Instant start = ym.atDay(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant end = ym.atEndOfMonth().atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

            // Lấy tất cả booking trong tháng này
            List<Booking> bookingsThisMonth = bookingRepository.findByCar_SupplierAndCreatedAtBetween(supplier, start, end);

            Set<Integer> newCustomerIdsThisMonth = new HashSet<>();
            for (Booking b : bookingsThisMonth) {
                int customerId = b.getCustomer().getId();
                // Nếu khách này chưa từng xuất hiện trước đó
                if (!allPreviousCustomerIds.contains(customerId)) {
                    newCustomerIdsThisMonth.add(customerId);
                }
            }
            // Cộng dồn khách đã xuất hiện vào set tổng
            for (Booking b : bookingsThisMonth) {
                allPreviousCustomerIds.add(b.getCustomer().getId());
            }
            newCustomersByMonth.add(newCustomerIdsThisMonth.size());

            // Tổng payout (doanh thu) tháng này
            BigDecimal payout = paymentRepository.sumMonthlyPayoutBySupplier(supplier, start, end);
            revenueByMonth.add(payout != null ? payout.doubleValue() : 0.0);
            // Số booking tháng này
            int bookingCount = bookingRepository.countByCar_SupplierAndCreatedAtBetween(supplier, start, end);
            bookingsByMonth.add(bookingCount);
        }
        Map<String, Object> result = new HashMap<>();
        result.put("months", months);
        result.put("revenueByMonth", revenueByMonth);
        result.put("bookingsByMonth", bookingsByMonth);
        result.put("newCustomersByMonth", newCustomersByMonth);
        return ResponseEntity.ok(result);
    }

    public ResponseEntity<?> getSupplierCars() {
        User supplier = getCurrentSupplier();
        List<Car> cars = carRepository.findBySupplierAndIsDeletedFalseWithAllRelations(supplier);
        List<CarDTO> carDTOs = cars.stream().map(carMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(carDTOs);
    }

    public ResponseEntity<?> getSupplierInsurances() {
        User supplier = getCurrentSupplier();
        List<Insurance> insurances = insuranceRepository.findBySupplierIdAndIsDeletedFalse(supplier.getId());
        List<InsuranceDTO> insuranceDTOs = insurances.stream().map(insuranceMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(insuranceDTOs);
    }

    public ResponseEntity<?> getSupplierMaintenances() {
        User supplier = getCurrentSupplier();
        List<Maintenance> maintenances = maintenanceRepository.findBySupplierIdAndIsDeletedFalse(supplier.getId());
        List<MaintenanceDTO> maintenanceDTOs = maintenances.stream().map(maintenanceMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(maintenanceDTOs);
    }

    @Transactional
    public ResponseEntity<?> confirmFullPayment(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        // Kiểm tra quyền sở hữu
        if (!booking.getCar().getSupplier().equals(getCurrentSupplier())) {
            return ResponseEntity.status(403).body("Not authorized");
        }

        // Đã xác nhận trước đó
        if (Boolean.TRUE.equals(booking.getSupplierDeliveryConfirm())) {
            return ResponseEntity.badRequest().body("Đã xác nhận nhận đủ tiền trước đó");
        }

        // Kiểm tra đã có payment full_payment và đã paid chưa
        boolean hasFullPayment = paymentRepository.existsByBookingIdAndPaymentTypeAndIsDeleted(bookingId, "full_payment", false);
        if (!hasFullPayment) {
            return ResponseEntity.badRequest().body("Chưa có thanh toán full_payment");
        }

        // Đánh dấu đã xác nhận
        booking.setSupplierDeliveryConfirm(true);
        bookingRepository.save(booking);

        // (Có thể gửi notification cho customer ở đây)

        return ResponseEntity.ok("Supplier đã xác nhận đã nhận đủ tiền");
    }

    @Transactional
    public ResponseEntity<?> prepareCar(Integer id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        if (!booking.getCar().getSupplier().equals(getCurrentSupplier())) {
            return ResponseEntity.status(403).body("Not authorized to prepare this booking");
        }
        String currentStatusName = booking.getStatus() != null ? booking.getStatus().getStatusName() : null;
        if (!"confirmed".equalsIgnoreCase(currentStatusName)) {
            return ResponseEntity.badRequest().body("Booking is not in confirmed status");
        }
        Status readyStatus = statusRepository.findByStatusNameIgnoreCase("ready_for_pickup");
        if (readyStatus == null) {
            return ResponseEntity.badRequest().body("Status 'ready_for_pickup' not found");
        }
        booking.setStatus(readyStatus);
        bookingRepository.save(booking);
        return ResponseEntity.ok("Booking is now ready for pickup");
    }

    @Transactional
    public ResponseEntity<?> supplierDeliveryConfirm(Integer id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found"));
        if (!booking.getCar().getSupplier().equals(getCurrentSupplier())) {
            return ResponseEntity.status(403).body("Not authorized to confirm delivery for this booking");
        }
        String currentStatusName = booking.getStatus() != null ? booking.getStatus().getStatusName() : null;
        if (!"ready_for_pickup".equalsIgnoreCase(currentStatusName)) {
            return ResponseEntity.badRequest().body("Booking is not in ready_for_pickup status");
        }
        if (Boolean.TRUE.equals(booking.getSupplierDeliveryConfirm())) {
            return ResponseEntity.badRequest().body("Already confirmed delivery");
        }
        booking.setSupplierDeliveryConfirm(true);
        // Cập nhật status sang 'delivered' (hoặc 'delivered_to_customer')
        Status deliveredStatus = statusRepository.findByStatusNameIgnoreCase("delivered");
        if (deliveredStatus != null) {
            booking.setStatus(deliveredStatus);
        }
        bookingRepository.save(booking);
        return ResponseEntity.ok("Supplier đã xác nhận giao xe cho khách");
    }
} 