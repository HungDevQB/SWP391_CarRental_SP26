package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.CashPaymentConfirmationDTO;
import com.carrental.car_rental.dto.PlatformFeePaymentDTO;
import com.carrental.car_rental.entity.*;
import com.carrental.car_rental.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CashPaymentManagementService {
    
    private static final Logger logger = LoggerFactory.getLogger(CashPaymentManagementService.class);
    private static final BigDecimal PLATFORM_FEE_RATE = new BigDecimal("0.05"); // 5% platform fee
    private static final int PLATFORM_FEE_DUE_DAYS = 7; // 7 days to pay platform fee
    
    private final CashPaymentConfirmationRepository cashConfirmationRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final StatusRepository statusRepository;
    private final BookingRepository bookingRepository;
    private final PaymentService paymentService;
    
    /**
     * Supplier xác nhận đã nhận tiền mặt từ customer
     */
    @Transactional
    public CashPaymentConfirmationDTO confirmCashReceived(Integer paymentId, CashPaymentConfirmationDTO confirmationDTO) {
        logger.info("Supplier confirming cash received for payment ID: {}", paymentId);
        
        // Validate payment exists and is cash payment
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        
        if (!"cash".equalsIgnoreCase(payment.getPaymentMethod())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment method is not cash");
        }
        
        // Check if confirmation already exists and is already confirmed
        Optional<CashPaymentConfirmation> existingConfirmation = cashConfirmationRepository.findByPaymentIdAndIsDeletedFalse(paymentId);
        
        if (existingConfirmation.isPresent()) {
            CashPaymentConfirmation existing = existingConfirmation.get();
            if (Boolean.TRUE.equals(existing.getIsConfirmed())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Cash payment already confirmed");
            }
            // ✅ BYPASS DATABASE UPDATE ISSUE: Xóa existing record và tạo mới
            logger.info("Deleting existing unconfirmed record ID: {} to avoid update issues", existing.getId());
            cashConfirmationRepository.delete(existing);
        }
        
        // Get current supplier
        User currentSupplier = getCurrentSupplier();
        
        // Verify supplier owns this booking
        if (!payment.getBooking().getCar().getSupplier().equals(currentSupplier)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to confirm this payment");
        }
        
        // ✅ Calculate platform fee: 5% tiền thuê + tiền thế chấp
        BigDecimal amountReceived = confirmationDTO.getAmountReceived();
        BigDecimal collateralAmount = new BigDecimal("5000000"); // 5 triệu VND thế chấp
        
        // Tính tiền thuê từ booking thay vì từ amountReceived
        Booking booking = payment.getBooking();
        BigDecimal depositAmount = booking.getDepositAmount() != null ? booking.getDepositAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount;
        
        if (depositAmount.compareTo(BigDecimal.ZERO) > 0) {
            // Có deposit: total = deposit / 30%
            totalAmount = depositAmount.divide(new BigDecimal("0.30"), 2, RoundingMode.HALF_UP);
        } else {
            // Cash payment: sử dụng giá trị mặc định
            totalAmount = new BigDecimal("2000000"); // 2 triệu VND mặc định
        }
        
        BigDecimal appFee = totalAmount.multiply(PLATFORM_FEE_RATE).setScale(2, RoundingMode.HALF_UP); // 5% tiền thuê
        BigDecimal platformFee = appFee.add(collateralAmount); // App fee + thế chấp
        
        // ✅ LUÔN TẠO RECORD MỚI để tránh lỗi database update
        CashPaymentConfirmation confirmation = new CashPaymentConfirmation();
        confirmation.setPayment(payment);
        confirmation.setSupplier(currentSupplier);
        confirmation.setCurrency(confirmationDTO.getCurrency() != null ? confirmationDTO.getCurrency() : "VND");
        confirmation.setConfirmationType(confirmationDTO.getConfirmationType());
        
        // Set thông tin confirmation
        confirmation.setAmountReceived(amountReceived);
        confirmation.setReceivedAt(Instant.now());
        confirmation.setSupplierConfirmationCode(generateConfirmationCode());
        confirmation.setIsConfirmed(true);
        confirmation.setNotes(confirmationDTO.getNotes());
        confirmation.setPlatformFee(platformFee);
        confirmation.setPlatformFeeStatus("pending");
        confirmation.setPlatformFeeDueDate(Instant.now().plus(PLATFORM_FEE_DUE_DAYS, ChronoUnit.DAYS));
        confirmation.setIsDeleted(false);
        
        logger.info("Creating new cash payment confirmation for payment ID: {}", paymentId);
        confirmation = cashConfirmationRepository.save(confirmation);
        
        // Update payment status to paid
        Status paidStatus = statusRepository.findByStatusName("paid")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Status 'paid' not found"));
        payment.setPaymentStatus(paidStatus);
        paymentRepository.save(payment);
        
        logger.info("Cash payment confirmed. Payment ID: {}, Amount: {}, Platform fee: {}", 
                   paymentId, amountReceived, platformFee);
        
        return convertToDTO(confirmation);
    }
    
    /**
     * Tạo Payment record cho platform fee và return thông tin để redirect đến payment page
     */
    @Transactional
    public PlatformFeePaymentDTO initiatePlatformFeePayment(Integer confirmationId, String paymentMethod, 
                                                           String returnUrl, String cancelUrl, 
                                                           jakarta.servlet.http.HttpServletRequest request) {
        logger.info("Initiating platform fee payment for confirmation ID: {}", confirmationId);
        
        CashPaymentConfirmation confirmation = cashConfirmationRepository.findById(confirmationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Confirmation not found"));
        
        User currentSupplier = getCurrentSupplier();
        if (!confirmation.getSupplier().equals(currentSupplier)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
        }
        
        if ("paid".equals(confirmation.getPlatformFeeStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Platform fee already paid");
        }
        
        if ("processing".equals(confirmation.getPlatformFeeStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Platform fee payment is already being processed");
        }
        
        // Validate payment method (chỉ cho phép online payment)
        if (!"vnpay".equals(paymentMethod) && !"momo".equals(paymentMethod)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only VNPay and MoMo are supported for platform fee payment");
        }
        
        // Tạo Payment record cho platform fee
        Payment platformFeePayment = new Payment();
        platformFeePayment.setBooking(confirmation.getPayment().getBooking()); // Reference to original booking
        platformFeePayment.setAmount(confirmation.getPlatformFee());
        platformFeePayment.setPaymentMethod(paymentMethod);
        platformFeePayment.setPaymentType("payout"); // Platform fee payment type
        platformFeePayment.setRegion(confirmation.getPayment().getRegion());
        
        // Set status to pending
        Status pendingStatus = statusRepository.findByStatusName("pending")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Status 'pending' not found"));
        platformFeePayment.setPaymentStatus(pendingStatus);
        
        platformFeePayment.setPaymentDate(Instant.now());
        platformFeePayment.setIsDeleted(false);
        
        // Generate unique transaction ID for platform fee
        platformFeePayment.setTransactionId("PLATFORM_FEE_" + confirmationId + "_" + System.currentTimeMillis());
        
        Payment savedPayment = paymentRepository.save(platformFeePayment);
        
        // Update confirmation để link với platform fee payment
        confirmation.setPlatformFeeStatus("processing");
        confirmation.setPlatformFeePaymentId(savedPayment.getId());
        confirmation.setUpdatedAt(Instant.now());
        cashConfirmationRepository.save(confirmation);
        
        logger.info("Platform fee payment initiated. Payment ID: {}, Amount: {}", 
                   savedPayment.getId(), confirmation.getPlatformFee());
        
        // Generate payment URL using PaymentService
        String paymentUrl = null;
        try {
            if ("vnpay".equals(paymentMethod)) {
                // Sử dụng method riêng cho platform fee payment
                paymentUrl = paymentService.generatePlatformFeeVnpayUrl(
                    request,
                    savedPayment.getId().toString(), 
                    confirmation.getPlatformFee().longValue(), 
                    confirmationId,
                    returnUrl,
                    cancelUrl
                );
            } else if ("momo".equals(paymentMethod)) {
                String orderId = "PLATFORM_FEE_" + confirmationId + "_" + System.currentTimeMillis();
                paymentUrl = paymentService.generateMomoPaymentUrl(savedPayment, orderId);
            }
        } catch (Exception e) {
            logger.error("Error generating payment URL: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot generate payment URL");
        }
        
        // Return DTO để frontend redirect đến payment page
        PlatformFeePaymentDTO dto = new PlatformFeePaymentDTO();
        dto.setConfirmationId(confirmationId);
        dto.setSupplierId(currentSupplier.getId());
        dto.setSupplierName(currentSupplier.getUsername());
        dto.setPlatformFee(confirmation.getPlatformFee());
        dto.setCurrency("VND");
        dto.setDescription("Platform Fee Payment - Confirmation #" + confirmationId);
        dto.setOriginalBookingId(confirmation.getPayment().getBooking().getId());
        dto.setNotes("Platform fee payment for cash transaction confirmation");
        dto.setReturnUrl(returnUrl);
        dto.setCancelUrl(cancelUrl);
        dto.setPaymentMethod(paymentMethod);
        dto.setPaymentUrl(paymentUrl); // ✅ ADD: Generated payment URL
        
        return dto;
    }

    /**
     * Xử lý khi platform fee payment thành công (callback từ payment gateway)
     */
    @Transactional
    public void completePlatformFeePayment(Integer paymentId, String transactionId) {
        logger.info("Completing platform fee payment. Payment ID: {}, Transaction ID: {}", paymentId, transactionId);
        
        Payment platformFeePayment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Platform fee payment not found"));
        
        if (!"payout".equals(platformFeePayment.getPaymentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid payment type");
        }
        
        // Update payment status to paid
        Status paidStatus = statusRepository.findByStatusName("paid")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Status 'paid' not found"));
        platformFeePayment.setPaymentStatus(paidStatus);
        platformFeePayment.setTransactionId(transactionId);
        paymentRepository.save(platformFeePayment);
        
        // Find and update corresponding cash payment confirmation
        // Sửa lỗi: cashConfirmationRepository.findByPlatformFeePaymentId trả về entity, cần chuyển thành Optional
        Optional<CashPaymentConfirmation> confirmationOpt = Optional.ofNullable(cashConfirmationRepository.findByPlatformFeePaymentId(paymentId));
        CashPaymentConfirmation confirmation = confirmationOpt.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cash payment confirmation not found"));
        
        confirmation.setPlatformFeeStatus("paid");
        confirmation.setPlatformFeePaidAt(Instant.now());
        cashConfirmationRepository.save(confirmation);
        
        logger.info("Platform fee payment completed successfully. Confirmation ID: {}", confirmation.getId());
    }

    /**
     * Legacy method - deprecated, use initiatePlatformFeePayment instead
     */
    @Deprecated
    @Transactional
    public void payPlatformFee(Integer confirmationId) {
        logger.info("Processing platform fee payment for confirmation ID: {}", confirmationId);
        
        CashPaymentConfirmation confirmation = cashConfirmationRepository.findById(confirmationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Confirmation not found"));
        
        User currentSupplier = getCurrentSupplier();
        if (!confirmation.getSupplier().equals(currentSupplier)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
        }
        
        if ("paid".equals(confirmation.getPlatformFeeStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Platform fee already paid");
        }
        
        confirmation.setPlatformFeeStatus("paid");
        confirmation.setPlatformFeePaidAt(Instant.now());
        cashConfirmationRepository.save(confirmation);
        
        logger.info("Platform fee paid. Confirmation ID: {}, Amount: {}", 
                   confirmationId, confirmation.getPlatformFee());
    }
    
    /**
     * Lấy danh sách cash payments cần confirm của supplier
     */
    @Transactional(readOnly = true)
    public List<CashPaymentConfirmationDTO> getPendingCashPayments(User supplier) {
        logger.info("Getting pending cash payments for supplier ID: {}", supplier.getId());
        
        List<CashPaymentConfirmation> pendingConfirmations = cashConfirmationRepository.findAll().stream()
                .filter(c -> c.getSupplier().getId().equals(supplier.getId()))
                .filter(c -> !Boolean.TRUE.equals(c.getIsConfirmed())) // Chưa được supplier confirm
                .filter(c -> !Boolean.TRUE.equals(c.getIsDeleted())) // Chưa bị xóa
                .collect(Collectors.toList());
        
        logger.info("Found {} pending cash payment confirmations for supplier {}", 
                   pendingConfirmations.size(), supplier.getId());
        
        return pendingConfirmations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy danh sách platform fees chưa thanh toán của supplier (bao gồm cả failed)
     */
    @Transactional(readOnly = true)
    public List<CashPaymentConfirmationDTO> getPendingPlatformFees(User supplier) {
        // Lấy cả "pending" và "failed" để supplier có thể thanh toán lại
        List<CashPaymentConfirmation> pendingFees = cashConfirmationRepository
                .findBySupplierAndPlatformFeeStatusIn(supplier, Arrays.asList("pending", "failed"));
        
        return pendingFees.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy tổng số tiền platform fee chưa thanh toán
     */
    public BigDecimal getTotalPendingPlatformFees(User supplier) {
        BigDecimal total = cashConfirmationRepository.sumPendingPlatformFeesBySupplier(supplier);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    /**
     * Lấy danh sách platform fees quá hạn
     */
    public List<CashPaymentConfirmationDTO> getOverduePlatformFees() {
        List<CashPaymentConfirmation> overdueFees = cashConfirmationRepository.findOverduePlatformFees(Instant.now());
        
        // Update status to overdue
        overdueFees.forEach(fee -> {
            fee.setPlatformFeeStatus("overdue");
            cashConfirmationRepository.save(fee);
        });
        
        return overdueFees.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private User getCurrentSupplier() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        logger.info("[getCurrentSupplier] Token username: {}", username);
        
        return userRepository.findByUsernameOrEmail(username, username)
                .filter(user -> {
                    String roleName = user.getRole() != null ? user.getRole().getRoleName() : null;
                    logger.info("[getCurrentSupplier] Found user: username={}, email={}, roleName={}", user.getUsername(), user.getEmail(), roleName);
                    return roleName != null && "supplier".equalsIgnoreCase(roleName);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Only suppliers can confirm cash payments"));
    }
    
    private String generateConfirmationCode() {
        return "CASH_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private CashPaymentConfirmationDTO convertToDTO(CashPaymentConfirmation confirmation) {
        CashPaymentConfirmationDTO dto = new CashPaymentConfirmationDTO();
        dto.setId(confirmation.getId()); // ✅ ADD: Confirmation ID
        dto.setPaymentId(confirmation.getPayment().getId());
        dto.setBookingId(confirmation.getPayment().getBooking().getId());
        dto.setAmountReceived(confirmation.getAmountReceived());
        dto.setCurrency(confirmation.getCurrency());
        
        // ✅ SỬA: Kiểm tra null trước khi convert
        if (confirmation.getReceivedAt() != null) {
            dto.setReceivedAt(confirmation.getReceivedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        }
        
        dto.setNotes(confirmation.getNotes());
        dto.setConfirmationType(confirmation.getConfirmationType());
        dto.setSupplierConfirmationCode(confirmation.getSupplierConfirmationCode());
        dto.setIsConfirmed(confirmation.getIsConfirmed());
        dto.setPlatformFee(confirmation.getPlatformFee());
        dto.setPlatformFeeStatus(confirmation.getPlatformFeeStatus());
        
        // ✅ SỬA: Kiểm tra null trước khi convert
        if (confirmation.getPlatformFeeDueDate() != null) {
            dto.setPlatformFeeDueDate(confirmation.getPlatformFeeDueDate().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        }
        
        return dto;
    }
    
    /**
     * Đánh dấu platform fees quá hạn thành overdue status và tính penalty
     */
    @Transactional
    public void markOverduePlatformFees() {
        logger.info("Checking for overdue platform fees...");
        
        Instant now = Instant.now();
        List<CashPaymentConfirmation> overdueConfirmations = cashConfirmationRepository.findOverduePlatformFees(now);
        
        for (CashPaymentConfirmation confirmation : overdueConfirmations) {
            if ("pending".equals(confirmation.getPlatformFeeStatus())) {
                // Mark as overdue for the first time
                confirmation.setPlatformFeeStatus("overdue");
                confirmation.setOverdueSince(now);
                confirmation.setTotalAmountDue(confirmation.getPlatformFee()); // Initially just the platform fee
                
                cashConfirmationRepository.save(confirmation);
                logger.info("Marked platform fee as overdue. Confirmation ID: {}, Supplier: {}", 
                           confirmation.getId(), confirmation.getSupplier().getUsername());
            } else if ("overdue".equals(confirmation.getPlatformFeeStatus())) {
                // Already overdue, calculate and apply penalties
                calculateAndApplyPenalty(confirmation, now);
            }
        }
        
        logger.info("Processed {} overdue platform fees", overdueConfirmations.size());
    }
    
    /**
     * Tính toán và áp dụng penalty cho platform fee quá hạn
     */
    @Transactional
    public void calculateAndApplyPenalty(CashPaymentConfirmation confirmation, Instant currentTime) {
        if (confirmation.getOverdueSince() == null) {
            logger.warn("Cannot calculate penalty - overdue_since is null for confirmation {}", confirmation.getId());
            return;
        }
        
        // Calculate weeks overdue
        long daysOverdue = ChronoUnit.DAYS.between(confirmation.getOverdueSince(), currentTime);
        int weeksOverdue = (int) Math.ceil(daysOverdue / 7.0);
        
        if (weeksOverdue <= 0) {
            return; // Not overdue yet
        }
        
        // Calculate penalty: original amount * penalty rate * weeks overdue
        BigDecimal penaltyRate = confirmation.getOverduePenaltyRate() != null ? 
            confirmation.getOverduePenaltyRate() : new BigDecimal("0.05");
        BigDecimal penalty = confirmation.getPlatformFee()
            .multiply(penaltyRate)
            .multiply(new BigDecimal(weeksOverdue))
            .setScale(2, RoundingMode.HALF_UP);
        
        confirmation.setPenaltyAmount(penalty);
        confirmation.setTotalAmountDue(confirmation.getPlatformFee().add(penalty));
        
        // Escalate based on weeks overdue
        if (weeksOverdue >= 4) { // 4 weeks = 1 month
            confirmation.setEscalationLevel(3); // Suspension
            confirmation.setPlatformFeeStatus("escalated");
            suspendSupplierDueToOverdue(confirmation.getSupplier(), confirmation);
        } else if (weeksOverdue >= 2) { // 2 weeks
            confirmation.setEscalationLevel(2); // Restriction
            confirmation.setPlatformFeeStatus("penalty_applied");
            restrictSupplierDueToOverdue(confirmation.getSupplier(), confirmation);
        } else if (weeksOverdue >= 1) { // 1 week
            confirmation.setEscalationLevel(1); // Warning
            confirmation.setPlatformFeeStatus("penalty_applied");
            sendOverdueWarning(confirmation.getSupplier(), confirmation);
        }
        
        cashConfirmationRepository.save(confirmation);
        
        logger.info("Applied penalty to platform fee. Confirmation ID: {}, Weeks overdue: {}, Penalty: {}, Total due: {}", 
                   confirmation.getId(), weeksOverdue, penalty, confirmation.getTotalAmountDue());
    }
    
    /**
     * Gửi cảnh báo quá hạn cho supplier
     */
    private void sendOverdueWarning(User supplier, CashPaymentConfirmation confirmation) {
        logger.warn("OVERDUE WARNING: Supplier {} has overdue platform fee. Confirmation ID: {}, Amount due: {}", 
                   supplier.getUsername(), confirmation.getId(), confirmation.getTotalAmountDue());
        // TODO: Implement email notification, in-app notification, etc.
    }
    
    /**
     * Hạn chế supplier do quá hạn platform fee
     */
    private void restrictSupplierDueToOverdue(User supplier, CashPaymentConfirmation confirmation) {
        logger.warn("RESTRICTION APPLIED: Supplier {} restricted due to overdue platform fee. Confirmation ID: {}", 
                   supplier.getUsername(), confirmation.getId());
        // TODO: Implement restrictions:
        // - Không cho tạo booking mới
        // - Hạn chế withdraw revenue
        // - Show warning message in dashboard
    }
    
    /**
     * Tạm ngưng supplier do quá hạn nghiêm trọng
     */
    private void suspendSupplierDueToOverdue(User supplier, CashPaymentConfirmation confirmation) {
        logger.error("SUSPENSION APPLIED: Supplier {} suspended due to severe overdue platform fee. Confirmation ID: {}", 
                    supplier.getUsername(), confirmation.getId());
        // TODO: Implement suspension:
        // - Update supplier status to suspended
        // - Cancel active bookings
        // - Notify admin for manual review
        // - Send suspension notification
    }
    
    /**
     * Lấy danh sách platform fees có penalty
     */
    @Transactional(readOnly = true)
    public List<CashPaymentConfirmationDTO> getPlatformFeesWithPenalty(User supplier) {
        logger.info("Getting platform fees with penalty for supplier ID: {}", supplier.getId());
        
        List<CashPaymentConfirmation> confirmationsWithPenalty = cashConfirmationRepository
            .findBySupplierAndPlatformFeeStatus(supplier, "penalty_applied");
        
        return confirmationsWithPenalty.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Tính tổng penalty amount của supplier
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalPenaltyAmount(User supplier) {
        List<CashPaymentConfirmation> confirmations = cashConfirmationRepository.findBySupplierAndIsDeletedFalse(supplier);
        
        return confirmations.stream()
                .filter(c -> c.getPenaltyAmount() != null && c.getPenaltyAmount().compareTo(BigDecimal.ZERO) > 0)
                .map(CashPaymentConfirmation::getPenaltyAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * Lấy danh sách platform fees quá hạn của supplier
     */
    @Transactional(readOnly = true)
    public List<CashPaymentConfirmationDTO> getOverduePlatformFees(User supplier) {
        logger.info("Getting overdue platform fees for supplier ID: {}", supplier.getId());
        
        List<CashPaymentConfirmation> overdueConfirmations = cashConfirmationRepository.findOverduePlatformFeesBySupplier(supplier);
        
        return overdueConfirmations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Đếm số platform fees chưa thanh toán của supplier
     */
    @Transactional(readOnly = true)
    public Long countPendingPlatformFees(User supplier) {
        return cashConfirmationRepository.countPendingPlatformFeesBySupplier(supplier);
    }
    
    /**
     * Lấy danh sách platform fees đang processing
     */
    @Transactional(readOnly = true)
    public List<CashPaymentConfirmationDTO> getProcessingPlatformFees() {
        List<CashPaymentConfirmation> processingConfirmations = cashConfirmationRepository.findProcessingPlatformFees();
        
        return processingConfirmations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Xử lý VNPay callback cho platform fee payment
     */
    @Transactional
    public String handlePlatformFeeVnpayCallback(String txnRef, String responseCode, String transactionNo) {
        logger.info("Processing VNPay callback for platform fee - TxnRef: {}, ResponseCode: {}, TransactionNo: {}", 
                   txnRef, responseCode, transactionNo);
        
        try {
            // Tìm payment record bằng transaction ID
            Payment payment = paymentRepository.findByTransactionIdAndIsDeletedFalse(txnRef)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "Payment not found with transaction ID: " + txnRef));
            
            // Tìm confirmation record thông qua platform fee payment ID
            // Sửa lỗi: cashConfirmationRepository.findByPlatformFeePaymentId trả về entity, cần chuyển thành Optional
            Optional<CashPaymentConfirmation> confirmationOpt2 = Optional.ofNullable(cashConfirmationRepository.findByPlatformFeePaymentId(payment.getId()));
            CashPaymentConfirmation confirmation2 = confirmationOpt2.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Confirmation not found for platform fee payment ID: " + payment.getId()));
            
            // Update payment status
            Status paymentStatus = statusRepository.findByStatusName("00".equals(responseCode) ? "paid" : "failed")
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                        "Payment status not found"));
            
            payment.setPaymentStatus(paymentStatus);
            payment.setTransactionId(txnRef);
            if (transactionNo != null) {
                // payment.setDescription("VNPay Transaction: " + transactionNo); // Commented out to avoid null pointer
            }
            paymentRepository.save(payment);
            
            // Update confirmation status
            if ("00".equals(responseCode)) {
                // Update status to paid
                confirmation2.setPlatformFeeStatus("paid");
                confirmation2.setPlatformFeePaidAt(java.time.Instant.now());
                confirmation2.setUpdatedAt(java.time.Instant.now());
                cashConfirmationRepository.save(confirmation2);
                
                logger.info("Platform fee payment successful - ConfirmationId: {}, PaymentId: {}, Amount: {}", 
                           confirmation2.getId(), payment.getId(), confirmation2.getPlatformFee());
                
                // Gửi thông báo email cho supplier
                try {
                    sendPlatformFeePaymentNotification(confirmation2);
                } catch (Exception e) {
                    logger.warn("Failed to send platform fee payment notification email: {}", e.getMessage());
                }
                
            } else {
                // Update status to failed
                confirmation2.setPlatformFeeStatus("failed");
                confirmation2.setUpdatedAt(java.time.Instant.now());
                cashConfirmationRepository.save(confirmation2);
                
                logger.warn("Platform fee payment failed - ConfirmationId: {}, PaymentId: {}, ResponseCode: {}", 
                           confirmation2.getId(), payment.getId(), responseCode);
            }
            
            logger.info("Platform fee VNPay callback processed successfully - TxnRef: {}, Status: {}", 
                       txnRef, confirmation2.getPlatformFeeStatus());
            
            return txnRef;
            
        } catch (Exception e) {
            logger.error("Error processing platform fee VNPay callback: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to process platform fee callback: " + e.getMessage());
        }
    }
    
    /**
     * Gửi thông báo email sau khi thanh toán platform fee thành công
     */
    private void sendPlatformFeePaymentNotification(CashPaymentConfirmation confirmation) {
        // Implementation để gửi email thông báo
        logger.info("Sending platform fee payment notification for confirmation ID: {}", confirmation.getId());
        // TODO: Implement email sending logic
    }
}
