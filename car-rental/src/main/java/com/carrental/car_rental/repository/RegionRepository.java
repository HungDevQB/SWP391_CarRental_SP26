package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.CountryCode;
import com.carrental.car_rental.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegionRepository extends JpaRepository<Region, Integer> {
    List<Region> findByCountryCodeAndIsDeletedFalse(CountryCode countryCode);
    Optional<Region> findByCurrencyAndIsDeletedFalse(String currency);
}