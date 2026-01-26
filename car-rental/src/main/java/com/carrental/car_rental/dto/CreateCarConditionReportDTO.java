package com.carrental.car_rental.dto;

import com.carrental.car_rental.entity.CarConditionReport;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateCarConditionReportDTO {
    private Long bookingId;
    private Long carId;
    private Long reporterId;
    private CarConditionReport.ReportType reportType;
    private BigDecimal fuelLevel;
    private Integer mileage;
    private CarConditionReport.ConditionLevel exteriorCondition;
    private CarConditionReport.ConditionLevel interiorCondition;
    private CarConditionReport.ConditionLevel engineCondition;
    private CarConditionReport.ConditionLevel tireCondition;
    private String damageNotes;
    private String additionalNotes;
    private List<ImageUploadDTO> imageDescriptions;
    
    @Data
    public static class ImageUploadDTO {
        private String imageType;
        private String description;
    }
}