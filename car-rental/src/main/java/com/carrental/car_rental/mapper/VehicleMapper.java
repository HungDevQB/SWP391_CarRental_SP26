package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.VehicleDTO;
import com.carrental.car_rental.entity.Car;
import org.springframework.stereotype.Component;

@Component
public class VehicleMapper {
    public VehicleDTO toDTO(Car car) {
        VehicleDTO dto = new VehicleDTO();
        dto.setName(car.getModel());
        dto.setBrand(car.getBrand() != null ? car.getBrand().toString() : null);
        dto.setLicensePlate(car.getLicensePlate());
        dto.setDescription(car.getFeatures());
        dto.setRentalPrice(car.getDailyRate() != null ? car.getDailyRate().doubleValue() : null);
        // Không set image ở đây vì image là upload từ client
        return dto;
    }
} 