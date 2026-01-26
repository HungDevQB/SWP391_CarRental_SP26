package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.PhoneOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
 
public interface PhoneOtpRepository extends JpaRepository<PhoneOtp, Long> {
    Optional<PhoneOtp> findTopByPhoneOrderByCreatedAtDesc(String phone);
} 