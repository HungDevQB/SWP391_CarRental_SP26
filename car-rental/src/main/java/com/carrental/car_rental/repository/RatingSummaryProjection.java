package com.carrental.car_rental.repository;

public interface RatingSummaryProjection {
    Integer getStars();
    Integer getPercentage();
    Integer getCount();
}
