package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.BookingFinancial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingFinancialsRepository extends JpaRepository<BookingFinancial, Integer> {
    List<BookingFinancial> findByBookingIdAndIsDeletedFalse(Integer bookingId);
}
