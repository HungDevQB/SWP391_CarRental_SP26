package com.carrental.car_rental.repository;

import com.carrental.car_rental.dto.ImageDTO;
import com.carrental.car_rental.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image, Integer> {
    List<Image> findByCarIdAndIsDeletedFalse(Integer carId);
    List<Image> findByCarId(Integer carId);


}