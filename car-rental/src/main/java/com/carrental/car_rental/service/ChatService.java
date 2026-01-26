package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.ChatMessageDTO;
import com.carrental.car_rental.entity.ChatMessage;
import com.carrental.car_rental.entity.User;
import com.carrental.car_rental.entity.ChatMessageImage;
import com.carrental.car_rental.mapper.ChatMessageMapper;
import com.carrental.car_rental.repository.ChatMessageRepository;
import com.carrental.car_rental.repository.UserRepository;
import com.carrental.car_rental.dto.CustomerInfoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class ChatService {
    
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ChatMessageMapper chatMessageMapper;

    public ChatMessageDTO saveMessage(ChatMessageDTO dto) {
        User sender = userRepository.findById(dto.getSenderId()).orElseThrow();
        User receiver = userRepository.findById(dto.getReceiverId()).orElseThrow();
        ChatMessage entity = new ChatMessage();
        entity.setSender(sender);
        entity.setReceiver(receiver);
        entity.setMessageContent(dto.getContent());
        java.time.Instant instant = Optional.ofNullable(dto.getTimestamp()).orElse(java.time.Instant.now());
        entity.setSentAt(instant);
        entity.setIsRead(false);
        entity.setIsDeleted(false);

        // Lưu danh sách ảnh
        if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
            for (String url : dto.getImageUrls()) {
                if (url != null && !url.trim().isEmpty()) {
                    ChatMessageImage img = new ChatMessageImage();
                    img.setImageUrl(url);
                    img.setMessage(entity);
                    entity.getImages().add(img);
                }
            }
        }

        chatMessageRepository.save(entity);
        return chatMessageMapper.toDTO(entity);
    }

    public List<ChatMessageDTO> getMessagesBetween(Integer senderId, Integer receiverId) {
        return chatMessageRepository.findChatMessagesBetweenUsers(senderId, receiverId)
                .stream().map(chatMessageMapper::toDTO).collect(Collectors.toList());
    }

    public List<CustomerInfoDTO> getUsersChattedWithSupplier(Integer supplierId) {
        List<User> users = chatMessageRepository.findDistinctCustomersBySupplierId(supplierId);
        return users.stream().map(user -> {
            CustomerInfoDTO dto = new CustomerInfoDTO();
            dto.setId(user.getId());
            dto.setUsername(user.getUsername());
            dto.setFullName(user.getUserDetail() != null ? user.getUserDetail().getName() : null);
            dto.setEmail(user.getEmail());
            return dto;
        }).collect(Collectors.toList());
    }

    // Trả về danh sách supplier đã từng chat với customer (trả về DTO, tránh lỗi lazy loading)
    public List<CustomerInfoDTO> getSuppliersChattedWithCustomer(Integer customerId) {
        List<User> suppliers = chatMessageRepository.findDistinctSuppliersByCustomerId(customerId);
        return suppliers.stream().map(user -> {
            CustomerInfoDTO dto = new CustomerInfoDTO();
            dto.setId(user.getId());
            dto.setUsername(user.getUsername());
            dto.setFullName(user.getUserDetail() != null ? user.getUserDetail().getName() : null);
            dto.setEmail(user.getEmail());
            return dto;
        }).collect(Collectors.toList());
    }
}
