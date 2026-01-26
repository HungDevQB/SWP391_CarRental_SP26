package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.Booking;
import com.carrental.car_rental.entity.User;
import com.carrental.car_rental.entity.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByCustomerIdAndIsDeleted(Integer customerId, boolean isDeleted);

    @Query("SELECT b FROM Booking b WHERE b.car.id = :carId AND b.isDeleted = :isDeleted")
    List<Booking> findByCarIdAndIsDeleted(Integer carId, boolean isDeleted);

    List<Booking> findAllByIsDeletedFalse();

    List<Booking> findByCarId(Integer carId);

    @Query("SELECT b FROM Booking b WHERE b.car.id = :carId AND b.status.statusName != 'cancelled' " +
            "AND ((b.startDate <= :endDate AND b.endDate >= :startDate))")
    List<Booking> findByCarIdAndOverlappingDates(
            @Param("carId") Integer carId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate);

    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.car c " +
            "LEFT JOIN FETCH c.brand cb " +
            "LEFT JOIN FETCH c.fuelType ft " +
            "LEFT JOIN FETCH c.region car_region " +
            "LEFT JOIN FETCH c.supplier s " +
            "LEFT JOIN FETCH s.status s_status " +
            "LEFT JOIN FETCH c.status car_status " +
            "LEFT JOIN FETCH b.customer cu " +
            "LEFT JOIN FETCH cu.status cu_status " +
            "LEFT JOIN FETCH b.status st " +
            "LEFT JOIN FETCH b.region r " +
            "LEFT JOIN FETCH b.driver d " +
            "WHERE b.id = :bookingId")
    Optional<Booking> findByIdWithAllRelations(@Param("bookingId") Integer bookingId);

    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.car c " +
            "LEFT JOIN FETCH b.driver d " +
            "LEFT JOIN FETCH b.status s " +
            "LEFT JOIN FETCH b.region r " +
            "WHERE b.customer.id = :customerId " +
            "ORDER BY b.createdAt DESC")
    List<Booking> findByCustomerIdWithDetails(@Param("customerId") Integer customerId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.car.id = :carId AND b.isDeleted = false")
    int countBookingsByCarId(@Param("carId") Integer carId);

    @Query("SELECT b FROM Booking b WHERE b.car.id = :carId AND b.status.statusName != :statusName AND b.isDeleted = false")
    List<Booking> findByCarIdAndStatusStatusNameNotAndIsDeletedFalse(
            @Param("carId") Integer carId,
            @Param("statusName") String statusName);

    // Lấy booking gần đây nhất (của hoàng)
    List<Booking> findAllByIsDeletedFalseOrderByBookingDateDesc(Pageable pageable);
    @Query("SELECT DISTINCT b.customer FROM Booking b WHERE b.isDeleted = false ORDER BY b.bookingDate DESC")
    List<User> findRecentBookingUsers(Pageable pageable);

    List<Booking> findByCar_Supplier(User supplier);

    List<Booking> findTop10ByCar_SupplierOrderByCreatedAtDesc(User supplier);

    long countByCar_Supplier(User supplier);

    long countByCar_SupplierAndStatus_StatusName(User supplier, String statusName);

    int countByCar_SupplierAndCreatedAtBetween(User supplier, java.time.Instant start, java.time.Instant end);

    @Query("SELECT COUNT(b) as count, b.status as status FROM Booking b " +
            "WHERE b.car.supplier = :supplier AND b.createdAt BETWEEN :start AND :end " +
            "GROUP BY b.status")
    List<Map<String, Object>> countByCar_SupplierAndStatusAndCreatedAtBetween(
            @Param("supplier") User supplier,
            @Param("start") java.time.Instant start,
            @Param("end") java.time.Instant end);

    @Query("SELECT SUM(b.depositAmount) FROM Booking b WHERE b.car.supplier = :supplier")
    Double calculateTotalRevenueBySupplier(@Param("supplier") User supplier);

    @Query("SELECT SUM(b.depositAmount) FROM Booking b " +
            "WHERE b.car.supplier = :supplier " +
            "AND b.createdAt >= :startOfMonth")
    Double calculateMonthlyRevenueBySupplier(@Param("supplier") User supplier, @Param("startOfMonth") java.time.Instant startOfMonth);

    @Query("SELECT SUM(b.depositAmount) FROM Booking b " +
            "WHERE b.car.supplier = :supplier " +
            "AND b.createdAt BETWEEN :start AND :end")
    Double calculateRevenueBySupplierAndDateRange(
            @Param("supplier") User supplier,
            @Param("start") java.time.Instant start,
            @Param("end") java.time.Instant end);

    @Query(value = "SELECT CONVERT(date, b.created_at) as date, COUNT(*) as count, SUM(b.deposit_amount) as revenue " +
            "FROM Booking b " +
            "JOIN car c ON c.car_id = b.car_id " +
            "WHERE c.supplier_id = :supplierId " +
            "AND b.created_at BETWEEN :start AND :end " +
            "GROUP BY CONVERT(date, b.created_at) " +
            "ORDER BY date", nativeQuery = true)
    List<Object[]> getDailyStatsBySupplierAndDateRange(
            @Param("supplierId") Integer supplierId,
            @Param("start") java.time.Instant start,
            @Param("end") java.time.Instant end);

    boolean existsByCar_IdAndStatus_StatusNameNot(Integer carId, String statusName);


    @Query("SELECT COALESCE(MAX(b.id), 0) + 1 FROM Booking b")
    Integer getNextBookingId();

    // Sửa method này - sử dụng status.statusName thay vì status
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.customer.id = :customerId AND b.car.id = :carId AND b.status.statusName = :statusName AND b.isDeleted = false")
    boolean existsByCustomerIdAndCarIdAndStatusName(@Param("customerId") Integer customerId,
                                                    @Param("carId") Integer carId,
                                                    @Param("statusName") String statusName);

    List<Booking> findByStatusAndCreatedAtBeforeAndIsDeletedFalse(Status status, LocalDateTime createdAt);

    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.car c " +
            "LEFT JOIN FETCH c.supplier s " +
            "LEFT JOIN FETCH s.role " +
            "LEFT JOIN FETCH s.status " +
            "LEFT JOIN FETCH s.userDetail " +
            "LEFT JOIN FETCH c.brand " +
            "LEFT JOIN FETCH c.region " +
            "LEFT JOIN FETCH c.fuelType " +
            "LEFT JOIN FETCH c.status " +
            "LEFT JOIN FETCH c.images " +
            "LEFT JOIN FETCH b.customer cu " +
            "LEFT JOIN FETCH cu.userDetail " +
            "LEFT JOIN FETCH cu.status " +
            "LEFT JOIN FETCH cu.role " +
            "LEFT JOIN FETCH b.status " +
            "WHERE c.supplier = :supplier AND b.isDeleted = false")
    List<Booking> findByCar_SupplierWithAllRelations(@Param("supplier") com.carrental.car_rental.entity.User supplier);

    // Method for admin dashboard
    @Query("SELECT COALESCE(SUM(bf.totalFare), 0) FROM BookingFinancial bf " +
            "JOIN bf.booking b " +
            "WHERE b.status.statusName IN ('completed', 'confirmed')")
    BigDecimal calculateTotalRevenue();

    // Lấy tất cả booking của supplier trong khoảng thời gian
    List<Booking> findByCar_SupplierAndCreatedAtBetween(User supplier, Instant start, Instant end);

    // Đếm số booking của supplier với 1 customer trước thời điểm chỉ định
    int countByCar_SupplierAndCustomer_IdAndCreatedAtBefore(User supplier, Integer customerId, Instant before);

    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.car c " +
           "LEFT JOIN FETCH c.images " +
           "LEFT JOIN FETCH c.supplier s " +
           "LEFT JOIN FETCH s.role " +
           "LEFT JOIN FETCH s.status " +
           "LEFT JOIN FETCH s.userDetail " +
           "LEFT JOIN FETCH c.brand " +
           "LEFT JOIN FETCH c.region " +
           "LEFT JOIN FETCH c.fuelType " +
           "LEFT JOIN FETCH c.status " +
           "LEFT JOIN FETCH b.customer cu " +
           "LEFT JOIN FETCH cu.userDetail " +
           "LEFT JOIN FETCH cu.status " +
           "LEFT JOIN FETCH cu.role " +
           "LEFT JOIN FETCH b.status " +
           "WHERE b.id = :bookingId")
    Optional<Booking> findByIdWithAllRelationsAndImages(@Param("bookingId") Integer bookingId);

    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.car c " +
            "LEFT JOIN FETCH c.brand " +
            "LEFT JOIN FETCH c.fuelType " +
            "LEFT JOIN FETCH c.region " +
            "LEFT JOIN FETCH c.supplier s " +
            "LEFT JOIN FETCH s.role " +
            "LEFT JOIN FETCH s.status " +
            "LEFT JOIN FETCH s.userDetail " +
            "LEFT JOIN FETCH c.status " +
            "LEFT JOIN FETCH c.images " +
            "LEFT JOIN FETCH b.customer cu " +
            "LEFT JOIN FETCH cu.userDetail " +
            "LEFT JOIN FETCH cu.status " +
            "LEFT JOIN FETCH cu.role " +
            "LEFT JOIN FETCH b.status " +
            "LEFT JOIN FETCH b.region r " +
            "LEFT JOIN FETCH b.driver d " +
            "WHERE b.customer.id = :customerId AND b.isDeleted = false " +
            "ORDER BY b.createdAt DESC")
    List<Booking> findByCustomerIdWithAllRelations(@Param("customerId") Integer customerId);

    @Query("SELECT b FROM Booking b " +
       "LEFT JOIN FETCH b.car c " +
       "LEFT JOIN FETCH c.brand " +
       "LEFT JOIN FETCH c.fuelType " +
       "LEFT JOIN FETCH c.region " +
       "LEFT JOIN FETCH c.supplier s " +
       "LEFT JOIN FETCH s.role " +
       "LEFT JOIN FETCH s.status " +
       "LEFT JOIN FETCH s.userDetail " +
       "LEFT JOIN FETCH c.status " +
       "LEFT JOIN FETCH c.images " +
       "LEFT JOIN FETCH b.customer cu " +
       "LEFT JOIN FETCH cu.userDetail " +
       "LEFT JOIN FETCH cu.status " +
       "LEFT JOIN FETCH cu.role " +
       "LEFT JOIN FETCH b.status " +
       "LEFT JOIN FETCH b.region r " +
       "LEFT JOIN FETCH b.driver d " +
       "WHERE EXISTS (SELECT p FROM Payment p WHERE p.booking = b AND p.transactionId = :transactionId) " +
       "AND b.isDeleted = false")
Optional<Booking> findByTransactionIdWithAllRelations(@Param("transactionId") String transactionId);
}
