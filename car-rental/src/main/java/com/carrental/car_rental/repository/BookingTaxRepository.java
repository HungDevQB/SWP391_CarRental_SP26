package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.BookingTax;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingTaxRepository extends JpaRepository<BookingTax, Integer> {
    List<BookingTax> findByBookingIdAndIsDeletedFalse(Integer bookingId);
    List<BookingTax> findByTaxIdAndIsDeletedFalse(Integer taxId);
}