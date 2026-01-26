package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.Insurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsuranceRepository extends JpaRepository<Insurance, Integer> {
    @Query("SELECT i FROM Insurance i WHERE i.car.id IN (SELECT b.car.id FROM Booking b WHERE b.id = ?1) AND i.isDeleted = false")
    List<Insurance> findByBookingIdAndIsDeletedFalse(Integer bookingId);
    
    @Query("SELECT i FROM Insurance i WHERE i.car.id = :carId AND i.isDeleted = :isDeleted")
    List<Insurance> findByCarIdAndIsDeleted(Integer carId, boolean isDeleted);
    
    @Query("SELECT i FROM Insurance i JOIN FETCH i.car WHERE i.car.supplier.id = :supplierId AND i.isDeleted = false")
    List<Insurance> findBySupplierIdAndIsDeletedFalse(Integer supplierId);
}