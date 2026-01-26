package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.CarBrand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarBrandRepository extends JpaRepository<CarBrand, Integer> {
    List<CarBrand> findByIsDeletedFalse();
}