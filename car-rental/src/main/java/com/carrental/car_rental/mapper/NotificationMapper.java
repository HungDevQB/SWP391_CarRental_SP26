package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.NotificationDTO;
import com.carrental.car_rental.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = CommonMapper.class)
public interface NotificationMapper {
    @Mapping(source = "id", target = "notificationId")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.email", target = "userEmail")
    @Mapping(source = "type", target = "notificationType")
    @Mapping(source = "message", target = "message")
    @Mapping(target = "sentAt", ignore = true) // Bỏ qua vì không có trong entity
    @Mapping(source = "createdAt", target = "createdAt", qualifiedByName = "instantToLocalDateTime")
    @Mapping(target = "updatedAt", ignore = true) // Bỏ qua vì không có trong entity
    NotificationDTO toDTO(Notification entity);

    @Mapping(source = "notificationId", target = "id")
    @Mapping(source = "userId", target = "user.id")
    @Mapping(source = "notificationType", target = "type")
    @Mapping(source = "message", target = "message")
    @Mapping(source = "createdAt", target = "createdAt", qualifiedByName = "localDateTimeToInstant")
    @Mapping(target = "status", ignore = true) // Bỏ qua vì không có trong DTO
    @Mapping(target = "isDeleted", ignore = true) // Bỏ qua
    Notification toEntity(NotificationDTO dto);
}