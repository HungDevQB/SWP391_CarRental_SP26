package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.SignUpToProvide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SignUpToProvideRepository extends JpaRepository<SignUpToProvide, Integer> {
    List<SignUpToProvide> findBySupplierIdAndIsDeletedFalse(Integer supplierId);
}