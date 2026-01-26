package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Integer> {
    
    // Tìm tất cả tài khoản ngân hàng của một user
    List<BankAccount> findByUserIdAndIsDeletedFalse(Integer userId);
    
    // Tìm tất cả tài khoản ngân hàng của một user, join fetch user để tránh LazyInitializationException
    @Query("SELECT ba FROM BankAccount ba JOIN FETCH ba.user WHERE ba.user.id = :userId AND ba.isDeleted = false")
    List<BankAccount> findByUserIdAndIsDeletedFalseFetchUser(@Param("userId") Integer userId);
    
    // Tìm tài khoản chính của user
    Optional<BankAccount> findByUserIdAndIsPrimaryTrueAndIsDeletedFalse(Integer userId);
    
    // Tìm tài khoản theo số tài khoản và tên ngân hàng
    Optional<BankAccount> findByAccountNumberAndBankNameAndIsDeletedFalse(String accountNumber, String bankName);
    
    // Kiểm tra xem user đã có tài khoản chính chưa
    boolean existsByUserIdAndIsPrimaryTrueAndIsDeletedFalse(Integer userId);
    
    // Tìm tất cả tài khoản đã xác thực của user
    List<BankAccount> findByUserIdAndIsVerifiedTrueAndIsDeletedFalse(Integer userId);
    
    // Đếm số lượng tài khoản của user
    long countByUserIdAndIsDeletedFalse(Integer userId);
    
    // Tìm tài khoản theo ID và user ID (để bảo mật)
    @Query("SELECT ba FROM BankAccount ba WHERE ba.bankAccountId = :bankAccountId AND ba.user.id = :userId AND ba.isDeleted = false")
    Optional<BankAccount> findByIdAndUserId(@Param("bankAccountId") Integer bankAccountId, @Param("userId") Integer userId);
    
    // Tìm tất cả tài khoản theo trạng thái xác thực
    List<BankAccount> findByIsVerifiedAndIsDeletedFalse(Boolean isVerified);
    
    // Đếm số lượng tài khoản theo trạng thái xác thực
    long countByIsVerifiedAndIsDeletedFalse(Boolean isVerified);
    
    // Tìm kiếm tài khoản theo từ khóa (số tài khoản, tên chủ tài khoản, tên ngân hàng)
    @Query("SELECT ba FROM BankAccount ba WHERE ba.isDeleted = false AND " +
           "(LOWER(ba.accountNumber) LIKE LOWER(:keyword) OR " +
           "LOWER(ba.accountHolderName) LIKE LOWER(:keyword) OR " +
           "LOWER(ba.bankName) LIKE LOWER(:keyword))")
    List<BankAccount> findByAccountNumberContainingIgnoreCaseOrAccountHolderNameContainingIgnoreCaseOrBankNameContainingIgnoreCaseAndIsDeletedFalse(@Param("keyword") String keyword);
    
    // Tìm tất cả tài khoản đã xóa (cho admin)
    List<BankAccount> findByIsDeletedTrue();
    
    // Tìm tài khoản theo user và loại tài khoản
    List<BankAccount> findByUserIdAndAccountTypeAndIsDeletedFalse(Integer userId, String accountType);
    
    // Tìm tài khoản theo ngân hàng
    List<BankAccount> findByBankNameAndIsDeletedFalse(String bankName);
    
    // Tìm tài khoản theo chi nhánh ngân hàng
    List<BankAccount> findByBankBranchContainingIgnoreCaseAndIsDeletedFalse(String bankBranch);
    
    // Kiểm tra tài khoản tồn tại theo số tài khoản và ngân hàng (bao gồm cả đã xóa)
    boolean existsByAccountNumberAndBankName(String accountNumber, String bankName);
    
    // Tìm tài khoản theo SWIFT code
    List<BankAccount> findBySwiftCodeAndIsDeletedFalse(String swiftCode);
    
    // Tìm tài khoản theo routing number
    List<BankAccount> findByRoutingNumberAndIsDeletedFalse(String routingNumber);
    
    // Lấy tất cả tài khoản của user (bao gồm cả đã xóa) - cho admin
    List<BankAccount> findByUserId(Integer userId);
    
    // Đếm tổng số tài khoản của user (bao gồm cả đã xóa)
    long countByUserId(Integer userId);
    
    // Tìm tài khoản theo nhiều tiêu chí
    @Query("SELECT ba FROM BankAccount ba WHERE " +
           "(:userId IS NULL OR ba.user.id = :userId) AND " +
           "(:isVerified IS NULL OR ba.isVerified = :isVerified) AND " +
           "(:isPrimary IS NULL OR ba.isPrimary = :isPrimary) AND " +
           "(:accountType IS NULL OR ba.accountType = :accountType) AND " +
           "(:bankName IS NULL OR LOWER(ba.bankName) LIKE LOWER(CONCAT('%', :bankName, '%'))) AND " +
           "ba.isDeleted = false")
    List<BankAccount> findByCriteria(@Param("userId") Integer userId,
                                   @Param("isVerified") Boolean isVerified,
                                   @Param("isPrimary") Boolean isPrimary,
                                   @Param("accountType") String accountType,
                                   @Param("bankName") String bankName);
    
    // Lấy top N tài khoản được tạo gần đây nhất
    @Query("SELECT ba FROM BankAccount ba WHERE ba.isDeleted = false ORDER BY ba.createdAt DESC")
    List<BankAccount> findTopByOrderByCreatedAtDesc();
    
    // Tìm tài khoản được cập nhật gần đây
    @Query("SELECT ba FROM BankAccount ba WHERE ba.isDeleted = false AND ba.updatedAt > :since ORDER BY ba.updatedAt DESC")
    List<BankAccount> findRecentlyUpdated(@Param("since") java.time.LocalDateTime since);
    
    // Lấy thống kê số lượng tài khoản theo ngân hàng
    @Query("SELECT ba.bankName, COUNT(ba) FROM BankAccount ba WHERE ba.isDeleted = false GROUP BY ba.bankName ORDER BY COUNT(ba) DESC")
    List<Object[]> countByBankName();
    
    // Lấy thống kê số lượng tài khoản theo loại
    @Query("SELECT ba.accountType, COUNT(ba) FROM BankAccount ba WHERE ba.isDeleted = false GROUP BY ba.accountType")
    List<Object[]> countByAccountType();
    
    // Kiểm tra user có tài khoản đã xác thực nào không
    boolean existsByUserIdAndIsVerifiedTrueAndIsDeletedFalse(Integer userId);
    
    // Lấy danh sách user ID có tài khoản ngân hàng
    @Query("SELECT DISTINCT ba.user.id FROM BankAccount ba WHERE ba.isDeleted = false")
    List<Integer> findDistinctUserIds();
    
    // Tìm tài khoản duplicate (cùng số tài khoản, khác ngân hàng)
    @Query("SELECT ba FROM BankAccount ba WHERE ba.accountNumber = :accountNumber AND ba.bankName != :bankName AND ba.isDeleted = false")
    List<BankAccount> findDuplicateAccounts(@Param("accountNumber") String accountNumber, @Param("bankName") String bankName);
    
    // Lấy tài khoản chưa xác thực quá X ngày
    @Query("SELECT ba FROM BankAccount ba WHERE ba.isVerified = false AND ba.isDeleted = false AND ba.createdAt < :cutoffDate")
    List<BankAccount> findUnverifiedAccountsOlderThan(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);
    
    // Đếm số lượng tài khoản theo trạng thái và user
    @Query("SELECT COUNT(ba) FROM BankAccount ba WHERE ba.user.id = :userId AND ba.isVerified = :isVerified AND ba.isDeleted = false")
    long countByUserIdAndVerificationStatus(@Param("userId") Integer userId, @Param("isVerified") Boolean isVerified);
}