package com.carrental.car_rental.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ReportDTO {
    private BigDecimal totalRevenue;
    private Long totalBookings;
    private CarDTO popularCar;
    private PopularCarDetailDTO popularCarDetail;
    private List<SupplierRevenueDTO> suppliersRevenue;
    private List<MonthlyDataDTO> monthlyRevenue;
    private List<MonthlyDataDTO> monthlyBookings;
    private List<MonthlyPopularCarDTO> monthlyPopularCar;

    @Data
    public static class SupplierRevenueDTO {
        private String supplierName;
        private BigDecimal revenue;
    }

    @Data
    public static class MonthlyDataDTO {
        private Integer month;
        private BigDecimal revenue;
        private Long count;
    }

    @Data
    public static class MonthlyPopularCarDTO {
        private Integer month;
        private Double percentage;
    }

    @Data
    public static class PopularCarDetailDTO {
        private Long carId;
        private String carModel;
        private String licensePlate;
        private String brandName;
        private String imageUrl;
        private String supplierName;
        private Long bookingCount;
        private BigDecimal totalRevenue;
    }
}