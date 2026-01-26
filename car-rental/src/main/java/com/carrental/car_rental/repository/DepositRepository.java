package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.Deposit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepositRepository extends JpaRepository<Deposit, Integer> {
    List<Deposit> findByBookingIdAndIsDeletedFalse(Integer bookingId);
}