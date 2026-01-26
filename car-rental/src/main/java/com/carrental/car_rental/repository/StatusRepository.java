package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StatusRepository extends JpaRepository<Status, Integer> {
    Optional<Status> findByStatusName(String statusName);
    @Query("SELECT s FROM Status s WHERE s.id = :id")
    Optional<Status> findByIdSafe(@Param("id") Integer id);
    Status findByStatusNameIgnoreCase(String statusName);

}