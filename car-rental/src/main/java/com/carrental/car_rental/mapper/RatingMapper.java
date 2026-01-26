package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.RatingDTO;
import com.carrental.car_rental.entity.Rating;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface RatingMapper {
    
    @Mapping(source = "id", target = "id")
    @Mapping(source = "customer.id", target = "customerId")
    @Mapping(source = "customer", target = "customerName", qualifiedByName = "mapCustomerName")
    @Mapping(source = "car.id", target = "carId")
    @Mapping(source = "booking.id", target = "bookingId")
    @Mapping(source = "ratingScore", target = "ratingScore")
    @Mapping(source = "comment", target = "comment")
    @Mapping(source = "ratingDate", target = "ratingDate")
    @Mapping(source = "isAnonymous", target = "isAnonymous")
    RatingDTO toDTO(Rating entity);

    @Named("mapCustomerName")
    default String mapCustomerName(com.carrental.car_rental.entity.User customer) {
        if (customer == null) {
            return "Khách hàng ẩn danh";
        }
        try {
            return customer.getUsername() != null ? customer.getUsername() : "Khách hàng ẩn danh";
        } catch (Exception e) {
            return "Khách hàng ẩn danh";
        }
    }

    @Mapping(source = "id", target = "id")
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "car", ignore = true)
    @Mapping(target = "booking", ignore = true)
    @Mapping(source = "ratingScore", target = "ratingScore")
    @Mapping(source = "comment", target = "comment")
    @Mapping(source = "ratingDate", target = "ratingDate")
    @Mapping(source = "isAnonymous", target = "isAnonymous")
    @Mapping(target = "isDeleted", constant = "false")
    Rating toEntity(RatingDTO dto);
}