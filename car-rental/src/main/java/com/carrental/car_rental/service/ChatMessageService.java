package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.ChatMessageDTO;
import com.carrental.car_rental.dto.CustomerInfoDTO;
import com.carrental.car_rental.entity.ChatMessage;
import com.carrental.car_rental.entity.ChatMessageImage;
import com.carrental.car_rental.entity.User;
import com.carrental.car_rental.repository.ChatMessageRepository;
import com.carrental.car_rental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    private final ChatMessageRepository repository;
    private final UserRepository userRepository;

    public ChatMessageDTO findById(Integer id) {
        ChatMessage entity = repository.findById(id)
                .filter(e -> Boolean.FALSE.equals(e.getIsDeleted()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ChatMessage not found with id: " + id));
        return toDTO(entity);
    }

    // Lấy danh sách customer đã từng nhắn với supplier
    public List<CustomerInfoDTO> findCustomersBySupplierId(Integer supplierId) {
        List<User> customers = repository.findDistinctCustomersBySupplierId(supplierId);
        return customers.stream().map(user -> {
            CustomerInfoDTO dto = new CustomerInfoDTO();
            dto.setId(user.getId());
            dto.setUsername(user.getUsername());
            dto.setFullName(user.getUserDetail() != null ? user.getUserDetail().getName() : null);
            dto.setEmail(user.getEmail());
            return dto;
        }).collect(Collectors.toList());
    }

    public List<ChatMessageDTO> findAll() {
        return repository.findAll().stream()
                .filter(e -> Boolean.FALSE.equals(e.getIsDeleted()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ChatMessageDTO> findByBookingId(Integer bookingId) {
        return repository.findByBookingIdAndIsDeletedFalse(bookingId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ChatMessageDTO> findBySenderIdAndReceiverId(Integer senderId, Integer receiverId) {
        return repository.findChatMessagesBetweenUsers(senderId, receiverId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ChatMessageDTO save(ChatMessageDTO dto) {
        ChatMessage entity = toEntity(dto);
        return toDTO(repository.save(entity));
    }
    
    /**
     * Save chat message (alias for save method for WebSocket compatibility)
     */
    public ChatMessageDTO saveChatMessage(ChatMessageDTO dto) {
        return save(dto);
    }

    public ChatMessageDTO update(Integer id, ChatMessageDTO dto) {
        ChatMessage existingEntity = repository.findById(id)
                .filter(e -> Boolean.FALSE.equals(e.getIsDeleted()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ChatMessage not found with id: " + id));
        
        // Update fields
        existingEntity.setMessageContent(dto.getMessageContent());
        existingEntity.setIsRead(dto.getIsRead());
        existingEntity.setIsTranslated(dto.getIsTranslated());
        
        return toDTO(repository.save(existingEntity));
    }

    public void delete(Integer id) {
        ChatMessage entity = repository.findById(id)
                .filter(e -> Boolean.FALSE.equals(e.getIsDeleted()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ChatMessage not found with id: " + id));
        entity.setIsDeleted(true);
        repository.save(entity);
    }

    // Manual mapping methods
    private ChatMessageDTO toDTO(ChatMessage entity) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setMessageId(entity.getId());
        dto.setSenderId(entity.getSender() != null ? entity.getSender().getId() : null);
        dto.setSenderUsername(entity.getSender() != null ? entity.getSender().getUsername() : null);
        dto.setSenderEmail(entity.getSender() != null ? entity.getSender().getEmail() : null);
        dto.setReceiverId(entity.getReceiver() != null ? entity.getReceiver().getId() : null);
        dto.setReceiverUsername(entity.getReceiver() != null ? entity.getReceiver().getUsername() : null);
        dto.setReceiverEmail(entity.getReceiver() != null ? entity.getReceiver().getEmail() : null);
        dto.setBookingId(entity.getBooking() != null ? entity.getBooking().getId() : null);
        dto.setMessageContent(entity.getMessageContent());
        dto.setSentAt(entity.getSentAt() != null ? LocalDateTime.ofInstant(entity.getSentAt(), ZoneId.systemDefault()) : null);
        dto.setTimestamp(entity.getSentAt());
        dto.setIsRead(entity.getIsRead());
        dto.setIsTranslated(entity.getIsTranslated());
        dto.setOriginalLanguage(entity.getOriginalLanguage() != null ? entity.getOriginalLanguage().getLanguageCode() : null);
        dto.setIsDeleted(entity.getIsDeleted());
        // Mapping danh sách ảnh
        dto.setImageUrls(entity.getImages() != null ? entity.getImages().stream().map(img -> img.getImageUrl()).collect(Collectors.toList()) : new java.util.ArrayList<>());
        return dto;
    }

    private ChatMessage toEntity(ChatMessageDTO dto) {
        ChatMessage entity = new ChatMessage();
        if (dto.getMessageId() != null) {
            entity.setId(dto.getMessageId());
        }
        // Set sender
        if (dto.getSenderId() != null) {
            User sender = userRepository.findById(dto.getSenderId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender not found"));
            entity.setSender(sender);
        }
        // Set receiver
        if (dto.getReceiverId() != null) {
            User receiver = userRepository.findById(dto.getReceiverId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receiver not found"));
            entity.setReceiver(receiver);
        }
        entity.setMessageContent(dto.getMessageContent());
        entity.setSentAt(dto.getSentAt() != null ? dto.getSentAt().atZone(ZoneId.systemDefault()).toInstant() : Instant.now());
        entity.setIsRead(dto.getIsRead() != null ? dto.getIsRead() : false);
        entity.setIsTranslated(dto.getIsTranslated() != null ? dto.getIsTranslated() : false);
        entity.setIsDeleted(dto.getIsDeleted() != null ? dto.getIsDeleted() : false);
        // Mapping danh sách ảnh
        if (dto.getImageUrls() != null) {
            for (String url : dto.getImageUrls()) {
                if (url != null && !url.trim().isEmpty()) {
                    ChatMessageImage img = new ChatMessageImage();
                    img.setImageUrl(url);
                    img.setMessage(entity);
                    entity.getImages().add(img);
                }
            }
        }
        return entity;
    }
    
    /**
     * Mark a message as read
     */
    public void markMessageAsRead(Integer messageId) {
        Optional<ChatMessage> messageOpt = repository.findById(messageId);
        if (messageOpt.isPresent()) {
            ChatMessage message = messageOpt.get();
            message.setIsRead(true);
            repository.save(message);
        }
    }
}