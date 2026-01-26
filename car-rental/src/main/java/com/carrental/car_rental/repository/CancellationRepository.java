package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.Cancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CancellationRepository extends JpaRepository<Cancellation, Integer> {
    List<Cancellation> findByBookingIdAndIsDeletedFalse(Integer bookingId);
}