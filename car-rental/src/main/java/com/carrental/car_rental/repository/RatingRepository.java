package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Integer> {
    
    @Query("SELECT r FROM Rating r LEFT JOIN FETCH r.customer LEFT JOIN FETCH r.car LEFT JOIN FETCH r.booking WHERE r.booking.id = :bookingId AND (r.isDeleted = false OR r.isDeleted IS NULL)")
    List<Rating> findByBookingIdAndIsDeletedFalse(@Param("bookingId") Integer bookingId);
    
    @Query("SELECT r FROM Rating r LEFT JOIN FETCH r.customer LEFT JOIN FETCH r.car LEFT JOIN FETCH r.booking WHERE r.car.id = :carId AND (r.isDeleted = false OR r.isDeleted IS NULL)")
    List<Rating> findByCarIdAndIsDeletedFalse(@Param("carId") Integer carId);
    
    @Query("SELECT r FROM Rating r LEFT JOIN FETCH r.customer LEFT JOIN FETCH r.car LEFT JOIN FETCH r.booking WHERE r.booking.car.id = :carId AND (r.isDeleted = false OR r.isDeleted IS NULL)")
    List<Rating> findByBookingCarIdAndIsDeletedFalse(@Param("carId") Integer carId);

    @Query("SELECT r.ratingScore as stars, COUNT(*) as count " +
            "FROM Rating r " +
            "WHERE r.car.id = :carId AND (r.isDeleted = false OR r.isDeleted IS NULL) " +
            "GROUP BY r.ratingScore")
    List<RatingSummaryProjection> findRatingSummaryByCarId(@Param("carId") Integer carId);


    // Thêm method để lấy tất cả ratings với FETCH JOIN
    @Query("SELECT r FROM Rating r LEFT JOIN FETCH r.customer LEFT JOIN FETCH r.car LEFT JOIN FETCH r.booking WHERE (r.isDeleted = false OR r.isDeleted IS NULL)")
    List<Rating> findAllWithCustomers();
    
    // Thêm method kiểm tra booking đã được đánh giá chưa
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Rating r WHERE r.booking.id = :bookingId AND (r.isDeleted = false OR r.isDeleted IS NULL)")
    boolean existsByBookingId(@Param("bookingId") Integer bookingId);
    
    // Thêm method lấy danh sách bookingId đã được đánh giá (để optimize bulk check)
    @Query("SELECT r.booking.id FROM Rating r WHERE r.booking.id IN :bookingIds AND (r.isDeleted = false OR r.isDeleted IS NULL)")
    List<Integer> findRatedBookingIds(@Param("bookingIds") List<Integer> bookingIds);

    @Query("SELECT r FROM Rating r LEFT JOIN FETCH r.customer LEFT JOIN FETCH r.car LEFT JOIN FETCH r.booking WHERE r.booking.id = :bookingId AND r.customer.id = :customerId AND (r.isDeleted = false OR r.isDeleted IS NULL)")
    List<Rating> findByBookingIdAndCustomerIdAndIsDeletedFalse(@Param("bookingId") Integer bookingId, @Param("customerId") Integer customerId);
}

