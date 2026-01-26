
package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.ChatMessageDTO;
import com.carrental.car_rental.entity.ChatMessage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import com.carrental.car_rental.entity.ChatMessageImage;

@Mapper(componentModel = "spring", imports = {ZoneId.class, ChatMessageImage.class})
public interface ChatMessageMapper {
    @Mapping(source = "id", target = "messageId")
    @Mapping(source = "booking.id", target = "bookingId")
    @Mapping(source = "sender.id", target = "senderId")
    @Mapping(source = "sender.email", target = "senderEmail")
    @Mapping(source = "sender.username", target = "senderUsername")
    @Mapping(source = "receiver.id", target = "receiverId")
    @Mapping(source = "receiver.email", target = "receiverEmail")
    @Mapping(source = "receiver.username", target = "receiverUsername")
    @Mapping(target = "sentAt", expression = "java(instantToLocalDateTime(entity.getSentAt()))")
    @Mapping(source = "originalLanguage.languageName", target = "originalLanguage")

    @Mapping(target = "content", expression = "java(entity.getMessageContent())")
    @Mapping(target = "sender", expression = "java(entity.getSender() != null ? entity.getSender().getUsername() : null)")
    @Mapping(target = "timestamp", expression = "java(entity.getSentAt())")
    @Mapping(target = "messageType", ignore = true)
    @Mapping(target = "imageUrls", expression = "java(entity.getImages() != null ? entity.getImages().stream().map(ChatMessageImage::getImageUrl).collect(java.util.stream.Collectors.toList()) : null)")
    ChatMessageDTO toDTO(ChatMessage entity);

    @Mapping(source = "messageId", target = "id")
    @Mapping(target = "booking", ignore = true)
    @Mapping(target = "sender", ignore = true)
    @Mapping(target = "receiver", ignore = true)
    @Mapping(target = "originalLanguage", ignore = true)
    @Mapping(target = "sentAt", expression = "java(dto.getSentAt() != null ? dto.getSentAt().atZone(ZoneId.systemDefault()).toInstant() : java.time.Instant.now())")
    // Bỏ mapping imageUrl, sẽ xử lý ở Service
    ChatMessage toEntity(ChatMessageDTO dto);
    
    // Helper method for Instant to LocalDateTime conversion
    default LocalDateTime instantToLocalDateTime(Instant instant) {
        if (instant == null) {
            return null;
        }
        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }
}