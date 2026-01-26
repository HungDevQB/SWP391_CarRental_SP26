package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.CountryCode;
import com.carrental.car_rental.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.isDeleted = false")
    Optional<User> findByEmailAndIsDeletedFalse(@Param("email") String email);
    Optional<User> findByUsernameOrEmail(String username, String email);
    List<User> findByRoleIdAndIsDeletedFalse(Integer roleId);
    List<User> findAllByIsDeletedFalse();
    List<User> findByCountryCodeAndIsDeletedFalse(CountryCode countryCode);    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameAndIsDeletedFalse(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.isDeleted = false " +
            "AND (:roleName IS NULL OR u.role.roleName = :roleName) " +
            "AND (:statusName IS NULL OR u.status.statusName = :statusName)")
    Page<User> findByRoleNameAndStatusNameAndIsDeletedFalse(
            @Param("roleName") String roleName,
            @Param("statusName") String statusName,
            Pageable pageable);
    // Lấy user role customer đăng ký trong tháng/năm (của hoàng)

    @Query("SELECT u FROM User u WHERE u.isDeleted = false AND u.role.roleName = :roleName AND FUNCTION('MONTH', u.createdAt) = :month AND FUNCTION('YEAR', u.createdAt) = :year")
    List<User> findByRoleNameAndCreatedAtInMonth(@Param("roleName") String roleName, @Param("month") int month, @Param("year") int year);

    long countByIsDeletedFalse();
    @Query("SELECT DISTINCT b.customer FROM Booking b WHERE b.isDeleted = false ORDER BY b.bookingDate DESC")
    List<User> findRecentBookingUsers(org.springframework.data.domain.Pageable pageable);
}