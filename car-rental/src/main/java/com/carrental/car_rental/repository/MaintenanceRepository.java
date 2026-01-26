package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Integer> {
    List<Maintenance> findByCarIdAndIsDeletedFalse(Integer carId);
    
    @Query("SELECT m FROM Maintenance m WHERE m.car.id = :carId AND m.isDeleted = :isDeleted")
    List<Maintenance> findByCarIdAndIsDeleted(Integer carId, boolean isDeleted);
    
    @Query("SELECT m FROM Maintenance m JOIN FETCH m.car WHERE m.car.supplier.id = :supplierId AND m.isDeleted = false")
    List<Maintenance> findBySupplierIdAndIsDeletedFalse(Integer supplierId);
}