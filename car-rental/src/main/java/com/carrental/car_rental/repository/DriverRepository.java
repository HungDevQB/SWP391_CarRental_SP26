package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Integer> {
    @Query("SELECT d FROM Driver d WHERE d.id IN (SELECT b.driver.id FROM Booking b WHERE b.id = :bookingId) AND d.isDeleted = false")
    List<Driver> findByBookingIdAndIsDeletedFalse(@Param("bookingId") Integer bookingId);

    List<Driver> findBySupplier_IdAndIsDeletedFalse(Integer supplierId); // Sửa userId thành supplier.id
}