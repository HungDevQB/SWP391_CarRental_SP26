package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.Payment;
import com.carrental.car_rental.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    @Query("SELECT p FROM Payment p WHERE p.booking.id = :bookingId AND p.isDeleted = false")
    List<Payment> findActivePaymentsByBookingId(@Param("bookingId") Integer bookingId);
    Optional<Payment> findByTransactionIdAndIsDeletedFalse(String transactionId);

     @Query("SELECT p FROM Payment p WHERE p.booking.id = :bookingId AND p.isDeleted = false")
    Optional<Payment> findByBookingId(@Param("bookingId") Integer bookingId);
    
    // ✅ Tìm payment cuối cùng của booking (nếu có nhiều payment)
    @Query("SELECT p FROM Payment p WHERE p.booking.id = :bookingId AND p.isDeleted = false ORDER BY p.paymentDate DESC")
    Optional<Payment> findLatestByBookingId(@Param("bookingId") Integer bookingId);
    
    // ✅ Kiểm tra booking đã có payment chưa
    @Query("SELECT COUNT(p) > 0 FROM Payment p WHERE p.booking.id = :bookingId AND p.isDeleted = false")
    boolean existsByBookingId(@Param("bookingId") Integer bookingId);

    // ✅ SỬA: Tìm tất cả payment records cho booking
    List<Payment> findByBookingIdAndIsDeleted(Integer bookingId, Boolean isDeleted);
    
    // ✅ THÊM: Tìm payment theo type
    Optional<Payment> findByBookingIdAndPaymentTypeAndIsDeleted(Integer bookingId, String paymentType, Boolean isDeleted);
    
    // ✅ THÊM: Check có payment type không
    boolean existsByBookingIdAndPaymentTypeAndIsDeleted(Integer bookingId, String paymentType, Boolean isDeleted);

    // Lấy tất cả payment kèm region và paymentStatus để tránh lazy loading
    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.region LEFT JOIN FETCH p.paymentStatus WHERE p.isDeleted = false")
    List<Payment> findAllWithRegionAndStatus();

    // Lấy tất cả payment kèm region, paymentStatus và booking để tránh lazy loading
    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.region LEFT JOIN FETCH p.paymentStatus LEFT JOIN FETCH p.booking WHERE p.isDeleted = false")
    List<Payment> findAllWithRegionAndStatusAndBooking();

    // Lấy payment theo bookingId kèm booking, region, paymentStatus để tránh lazy loading
    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.region LEFT JOIN FETCH p.paymentStatus LEFT JOIN FETCH p.booking WHERE p.booking.id = :bookingId AND p.isDeleted = false")
    List<Payment> findByBookingIdAndIsDeletedFalseWithBooking(@Param("bookingId") Integer bookingId);

    // Lấy tất cả payment kèm region, paymentStatus, booking, customer, customer.userDetail, car, car.supplier, car.supplier.userDetail để tránh lazy loading
    @Query("SELECT p FROM Payment p " +
           "LEFT JOIN FETCH p.region " +
           "LEFT JOIN FETCH p.paymentStatus " +
           "LEFT JOIN FETCH p.booking b " +
           "LEFT JOIN FETCH b.customer c " +
           "LEFT JOIN FETCH c.userDetail cud " +
           "LEFT JOIN FETCH b.car car " +
           "LEFT JOIN FETCH car.supplier s " +
           "LEFT JOIN FETCH s.userDetail sud " +
           "WHERE p.isDeleted = false")
    List<Payment> findAllWithRegionAndStatusAndBookingAndUsers();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.booking.car.supplier = :supplier AND p.paymentType = 'payout' AND p.isDeleted = false")
    BigDecimal sumPayoutBySupplier(@Param("supplier") User supplier);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.booking.car.supplier = :supplier AND p.paymentType = 'payout' AND p.isDeleted = false AND p.paymentDate >= :start AND p.paymentDate <= :end")
    BigDecimal sumMonthlyPayoutBySupplier(@Param("supplier") User supplier, @Param("start") Instant start, @Param("end") Instant end);


    // Thêm vào PaymentRepository:
    // ✅ THÊM MỚI: Method cho cash payment management
    @Query("SELECT p FROM Payment p WHERE p.booking.id = :bookingId AND p.isDeleted = false")
    List<Payment> findAllPaymentsByBookingId(@Param("bookingId") Integer bookingId);
    
    @Query("SELECT p FROM Payment p WHERE p.booking.id = :bookingId AND p.paymentMethod = :paymentMethod AND p.paymentType = :paymentType AND p.isDeleted = false")
    Optional<Payment> findByBookingIdAndPaymentMethodAndType(
        @Param("bookingId") Integer bookingId, 
        @Param("paymentMethod") String paymentMethod,
        @Param("paymentType") String paymentType
    );
    
    @Query("SELECT p FROM Payment p WHERE p.booking.id = :bookingId AND p.paymentMethod = :paymentMethod AND p.isDeleted = false")
    Optional<Payment> findByBookingIdAndPaymentMethod(
        @Param("bookingId") Integer bookingId, 
        @Param("paymentMethod") String paymentMethod
    );
    
    // ✅ THÊM: Method để tìm cash payments cần confirmation
    @Query("SELECT p FROM Payment p WHERE p.paymentMethod = 'cash' AND p.paymentType = 'deposit' AND p.customerCashConfirmed = true AND p.supplierCashConfirmed = false AND p.isDeleted = false")
    List<Payment> findPendingSupplierCashConfirmations();
    
    @Query("SELECT p FROM Payment p WHERE p.paymentMethod = 'cash' AND p.customerCashConfirmed = false AND p.isDeleted = false")
    List<Payment> findPendingCustomerCashConfirmations();
}