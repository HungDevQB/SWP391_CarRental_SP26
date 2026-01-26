package com.carrental.car_rental.dto;

import lombok.Data;

// DTO cho việc chuyển đổi trạng thái người dùng (của hoàng)
@Data
public class ToggleUserStatusRequest {
    private String reason; // Lý do chặn/mở chặn (optional)
} 