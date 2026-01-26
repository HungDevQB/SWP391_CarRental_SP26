package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Integer> {
    List<Contract> findByBookingIdAndIsDeletedFalse(Integer bookingId);
    @Query("SELECT c FROM Contract c WHERE (c.customer.id = :userId OR c.supplier.id = :userId) AND c.isDeleted = false")
    List<Contract> findByUserIdAndIsDeletedFalse(Integer userId);
}