package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.RegistrationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
 
public interface RegistrationRequestRepository extends JpaRepository<RegistrationRequest, Long> {
} 