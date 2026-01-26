package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.CashPaymentConfirmation;
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
public interface CashPaymentConfirmationRepository extends JpaRepository<CashPaymentConfirmation, Integer> {

    /**
     * Tìm xác nhận thanh toán tiền mặt theo payment ID và chưa bị xóa
     */
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.payment.id = :paymentId AND c.isDeleted = false")
    Optional<CashPaymentConfirmation> findByPaymentIdAndIsDeletedFalse(@Param("paymentId") Integer paymentId);

    /**
     * Tìm xác nhận thanh toán theo platform fee payment ID
     */
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.platformFeePaymentId = :paymentId AND c.isDeleted = false")
    CashPaymentConfirmation findByPlatformFeePaymentId(@Param("paymentId") Integer paymentId);

    /**
     * Tìm tất cả xác nhận thanh toán của nhà cung cấp và chưa bị xóa
     */
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.supplier = :supplier AND c.isDeleted = false")
    List<CashPaymentConfirmation> findBySupplierAndIsDeletedFalse(@Param("supplier") User supplier);

    /**
     * Tìm các platform fee đã quá hạn
     */
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.platformFeeDueDate < :currentTime " +
           "AND c.platformFeeStatus IN ('pending', 'overdue') AND c.isDeleted = false")
    List<CashPaymentConfirmation> findOverduePlatformFees(@Param("currentTime") Instant currentTime);

    /**
     * Tìm các platform fee đã quá hạn của một nhà cung cấp cụ thể
     */
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.supplier = :supplier " +
           "AND c.platformFeeDueDate < :currentTime " +
           "AND c.platformFeeStatus IN ('pending', 'overdue') AND c.isDeleted = false")
    List<CashPaymentConfirmation> findOverduePlatformFeesBySupplier(@Param("supplier") User supplier);

    /**
     * Tìm các platform fee đang được xử lý
     */
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.platformFeeStatus = 'processing' AND c.isDeleted = false")
    List<CashPaymentConfirmation> findProcessingPlatformFees();

    /**
     * Tính tổng platform fee đang chờ xử lý của nhà cung cấp
     */
    @Query("SELECT COALESCE(SUM(c.platformFee), 0) FROM CashPaymentConfirmation c " +
           "WHERE c.supplier = :supplier AND c.platformFeeStatus IN ('pending', 'failed') AND c.isDeleted = false")
    BigDecimal sumPendingPlatformFeesBySupplier(@Param("supplier") User supplier);

    /**
     * Đếm số lượng platform fee đang chờ xử lý của nhà cung cấp (bao gồm cả failed)
     */
    @Query("SELECT COUNT(c) FROM CashPaymentConfirmation c " +
           "WHERE c.supplier = :supplier AND c.platformFeeStatus IN ('pending', 'failed') AND c.isDeleted = false")
    Long countPendingPlatformFeesBySupplier(@Param("supplier") User supplier);

    /**
     * Tìm các xác nhận thanh toán có platform fee chưa được xử lý của nhà cung cấp
     */
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.supplier = :supplier " +
           "AND c.platformFeeStatus = 'pending' AND c.isDeleted = false " +
           "ORDER BY c.platformFeeDueDate ASC")
    List<CashPaymentConfirmation> findPendingPlatformFeesBySupplier(@Param("supplier") User supplier);

    /**
     * Tìm các xác nhận thanh toán theo trạng thái xác nhận
     */
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.isConfirmed = :confirmed AND c.isDeleted = false")
    List<CashPaymentConfirmation> findByConfirmationStatus(@Param("confirmed") Boolean confirmed);

    /**
     * Tìm các xác nhận thanh toán theo loại xác nhận
     */
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.confirmationType = :type AND c.isDeleted = false")
    List<CashPaymentConfirmation> findByConfirmationType(@Param("type") String confirmationType);

    /**
     * Tìm các xác nhận thanh toán theo mã xác nhận của nhà cung cấp
     */
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.supplierConfirmationCode = :code AND c.isDeleted = false")
    Optional<CashPaymentConfirmation> findBySupplierConfirmationCode(@Param("code") String confirmationCode);

    /**
     * Tìm các xác nhận thanh toán trong khoảng thời gian
     */
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.receivedAt BETWEEN :startDate AND :endDate AND c.isDeleted = false")
    List<CashPaymentConfirmation> findByReceivedAtBetween(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

    /**
     * Tìm các xác nhận thanh toán theo cấp độ leo thang
     */
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.escalationLevel = :level AND c.isDeleted = false")
    List<CashPaymentConfirmation> findByEscalationLevel(@Param("level") Integer escalationLevel);

    /**
     * Tìm các xác nhận thanh toán có penalty amount lớn hơn 0
     */
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.penaltyAmount > 0 AND c.isDeleted = false")
    List<CashPaymentConfirmation> findWithPenalty();

    /**
     * Tính tổng penalty amount của nhà cung cấp
     */
    @Query("SELECT COALESCE(SUM(c.penaltyAmount), 0) FROM CashPaymentConfirmation c " +
           "WHERE c.supplier = :supplier AND c.isDeleted = false")
    BigDecimal sumPenaltyAmountBySupplier(@Param("supplier") User supplier);

    /**
     * Tìm các xác nhận thanh toán theo trạng thái platform fee
     */
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.platformFeeStatus = :status AND c.isDeleted = false")
    List<CashPaymentConfirmation> findByPlatformFeeStatus(@Param("status") String status);

    /**
     * Tìm các xác nhận thanh toán có tổng số tiền phải trả lớn hơn một giá trị nhất định
     */
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.totalAmountDue > :amount AND c.isDeleted = false")
    List<CashPaymentConfirmation> findByTotalAmountDueGreaterThan(@Param("amount") BigDecimal amount);

    /**
     * Cập nhật trạng thái platform fee cho nhiều record
     */
    @Query("UPDATE CashPaymentConfirmation c SET c.platformFeeStatus = :status, c.updatedAt = :updateTime " +
           "WHERE c.id IN :ids")
    void updatePlatformFeeStatus(@Param("ids") List<Integer> ids, @Param("status") String status, @Param("updateTime") Instant updateTime);

    /**
     * Soft delete - đánh dấu xóa thay vì xóa vật lý
     */
    @Query("UPDATE CashPaymentConfirmation c SET c.isDeleted = true, c.updatedAt = :updateTime WHERE c.id = :id")
    void softDeleteById(@Param("id") Integer id, @Param("updateTime") Instant updateTime);

    /**
     * Tìm các xác nhận thanh toán đã bị xóa
     */
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.isDeleted = true")
    List<CashPaymentConfirmation> findDeleted();

    /**
     * Khôi phục record đã bị soft delete
     */
    @Query("UPDATE CashPaymentConfirmation c SET c.isDeleted = false, c.updatedAt = :updateTime WHERE c.id = :id")
    void restoreById(@Param("id") Integer id, @Param("updateTime") Instant updateTime);

    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.supplier = :supplier AND c.platformFeeStatus = :status AND c.isDeleted = false")
    List<CashPaymentConfirmation> findBySupplierAndPlatformFeeStatus(@Param("supplier") User supplier, @Param("status") String status);
    
    @Query("SELECT c FROM CashPaymentConfirmation c WHERE c.supplier = :supplier AND c.platformFeeStatus IN :statuses AND c.isDeleted = false")
    List<CashPaymentConfirmation> findBySupplierAndPlatformFeeStatusIn(@Param("supplier") User supplier, @Param("statuses") List<String> statuses);
}
