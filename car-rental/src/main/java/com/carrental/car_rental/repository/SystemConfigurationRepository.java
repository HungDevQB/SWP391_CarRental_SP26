package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.SystemConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemConfigurationRepository extends JpaRepository<SystemConfiguration, Integer> {
    Optional<SystemConfiguration> findByConfigKey(String configKey);
}