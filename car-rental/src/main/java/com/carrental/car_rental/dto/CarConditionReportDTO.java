package com.carrental.car_rental.dto;

import com.carrental.car_rental.entity.CarConditionReport;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CarConditionReportDTO {
    private Long reportId;
    private Long bookingId;
    private Long carId;
    private Long reporterId;
    private CarConditionReport.ReportType reportType;
    private LocalDateTime reportDate;
    private BigDecimal fuelLevel;
    private Integer mileage;
    private CarConditionReport.ConditionLevel exteriorCondition;
    private CarConditionReport.ConditionLevel interiorCondition;
    private CarConditionReport.ConditionLevel engineCondition;
    private CarConditionReport.ConditionLevel tireCondition;
    private String damageNotes;
    private String additionalNotes;
    private Boolean isConfirmed;
    private Long confirmedBy;
    private LocalDateTime confirmedAt;
    private Boolean isDisputed;
    private Long disputedBy;
    private LocalDateTime disputedAt;
    private String disputeReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CarConditionImageDTO> images;
    private Integer statusId;
    private String statusName;
}