package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.FuelType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FuelTypeRepository extends JpaRepository<FuelType, Integer> {
    List<FuelType> findByIsDeletedFalse();
}