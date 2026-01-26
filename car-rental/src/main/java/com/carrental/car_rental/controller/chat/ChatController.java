package com.carrental.car_rental.controller.chat;

import com.carrental.car_rental.entity.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import com.carrental.car_rental.dto.ChatMessageDTO;
import com.carrental.car_rental.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import com.carrental.car_rental.dto.CustomerInfoDTO;

/**
 * WebSocket Controller for real-time chat messaging
 * Handles STOMP protocol messages for chat functionality
 */
@Controller
public class ChatController {

    /**
     * API: Lấy lịch sử chat giữa 2 user (customer-supplier)
     * GET /api/chat-messages/between-users?senderId=...&receiverId=...
     */
    // @GetMapping("/api/chat-messages/between-users")
    // @ResponseBody
    // public java.util.List<ChatMessageDTO> getMessagesBetweenUsers(@RequestParam Integer senderId, @RequestParam Integer receiverId) {
    //     return chatService.getMessagesBetween(senderId, receiverId);
    // }

    /**
     * API: Lấy danh sách user đã từng chat với 1 user (ví dụ: tất cả customer đã chat với supplier)
     * GET /api/chat-users/of-user?supplierId=...
     */
    @GetMapping("/api/chat-users/of-user")
    @ResponseBody
    public java.util.List<CustomerInfoDTO> getUsersChattedWithSupplier(@RequestParam(required = false) Integer supplierId) {
        return chatService.getUsersChattedWithSupplier(supplierId);
    }

    /**
     * API: Lấy danh sách supplier đã từng chat với 1 customer
     * GET /api/chat-users/of-customer?customerId=...
     */
    @GetMapping("/api/chat-users/of-customer")
    @ResponseBody
    public java.util.List<CustomerInfoDTO> getSuppliersChattedWithCustomer(@RequestParam Integer customerId) {
        return chatService.getSuppliersChattedWithCustomer(customerId);
    }
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;
    
    /**
     * Handle incoming chat messages via WebSocket
     * Route: /app/chat.sendMessage
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDTO chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        try {
            logger.info("[WS] [sendMessage] Nhận tin nhắn từ frontend: {}", chatMessage);
            // Set timestamp if not provided
            if (chatMessage.getTimestamp() == null) {
                chatMessage.setTimestamp(java.time.Instant.now());
            }

            // Validate message
            if (chatMessage.getSenderId() == null || chatMessage.getReceiverId() == null) {
                logger.error("[WS] [sendMessage] Lỗi: thiếu senderId hoặc receiverId");
                return;
            }

            // Cho phép gửi tin nhắn chỉ có ảnh (content rỗng nhưng imageUrls có giá trị)
            boolean isContentEmpty = chatMessage.getContent() == null || chatMessage.getContent().trim().isEmpty();
            boolean isImagesEmpty = chatMessage.getImageUrls() == null || chatMessage.getImageUrls().isEmpty();
            if (isContentEmpty && isImagesEmpty) {
                logger.error("[WS] [sendMessage] Lỗi: nội dung tin nhắn và ảnh đều rỗng");
                return;
            }

            // Save message to database
            ChatMessageDTO savedMessage = chatService.saveMessage(chatMessage);
            logger.info("[WS] [sendMessage] Đã lưu tin nhắn vào DB: {} -> {}", chatMessage.getSenderId(), chatMessage.getReceiverId());

            logger.info("[WS] [sendMessage] receiverUsername={}, senderUsername={}", savedMessage.getReceiverUsername(), savedMessage.getSenderUsername());
            logger.info("[WS] [sendMessage] Gửi tới receiverUsername={} qua /queue/messages: {}", savedMessage.getReceiverUsername(), savedMessage);
            messagingTemplate.convertAndSendToUser(
                savedMessage.getReceiverUsername(),
                "/queue/messages",
                savedMessage
            );

            logger.info("[WS] [sendMessage] Gửi lại cho senderUsername={} qua /queue/messages: {}", savedMessage.getSenderUsername(), savedMessage);
            messagingTemplate.convertAndSendToUser(
                savedMessage.getSenderUsername(),
                "/queue/messages",
                savedMessage
            );

            logger.info("[WS] [sendMessage] Đã gửi xong WebSocket: messageId={}", savedMessage.getId());

        } catch (Exception e) {
            logger.error("[WS] [sendMessage] Lỗi xử lý tin nhắn: {}", e.getMessage(), e);

            ChatMessageDTO errorMessage = new ChatMessageDTO();
            errorMessage.setContent("Lỗi khi gửi tin nhắn. Vui lòng thử lại.");
            errorMessage.setTimestamp(java.time.Instant.now());
            errorMessage.setMessageType("ERROR");

            messagingTemplate.convertAndSendToUser(
                chatMessage.getSenderId().toString(),
                "/queue/errors",
                errorMessage
            );
        }
    }
    
    /**
     * Handle user joining chat
     * Route: /app/chat.addUser
     */
    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessageDTO chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        try {
            // Store username and user ID in WebSocket session
            headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
            headerAccessor.getSessionAttributes().put("userId", chatMessage.getSenderId());
            
            logger.info("User joined chat: {} (ID: {})", chatMessage.getSender(), chatMessage.getSenderId());
            
            // Create join notification
            ChatMessageDTO joinMessage = new ChatMessageDTO();
            joinMessage.setMessageType("JOIN");
            joinMessage.setSender(chatMessage.getSender());
            joinMessage.setSenderId(chatMessage.getSenderId());
            joinMessage.setContent(chatMessage.getSender() + " đã tham gia cuộc trò chuyện");
            joinMessage.setTimestamp(java.time.Instant.now());
            
            // Notify the user's chat partners (if any)
            if (chatMessage.getReceiverId() != null) {
                messagingTemplate.convertAndSendToUser(
                    chatMessage.getReceiverId().toString(),
                    "/queue/messages",
                    joinMessage
                );
            }
            
        } catch (Exception e) {
            logger.error("Error adding user to chat: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Handle typing indicators
     * Route: /app/chat.typing
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload ChatMessageDTO typingMessage) {
        try {
            if (typingMessage.getReceiverId() != null) {
                // Create typing indicator message
                ChatMessageDTO typingIndicator = new ChatMessageDTO();
                typingIndicator.setMessageType("TYPING");
                typingIndicator.setSender(typingMessage.getSender());
                typingIndicator.setSenderId(typingMessage.getSenderId());
                typingIndicator.setContent("typing");
                typingIndicator.setTimestamp(java.time.Instant.now());
                
                // Send typing indicator to receiver
                messagingTemplate.convertAndSendToUser(
                    typingMessage.getReceiverId().toString(),
                    "/queue/typing",
                    typingIndicator
                );
                
                logger.debug("Typing indicator sent: {} -> {}", 
                    typingMessage.getSenderId(), typingMessage.getReceiverId());
            }
        } catch (Exception e) {
            logger.error("Error handling typing indicator: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Handle message read receipts
     * Route: /app/chat.read
     */
    @MessageMapping("/chat.read")
    public void handleMessageRead(@Payload ChatMessageDTO readMessage) {
        try {
            if (readMessage.getId() != null && readMessage.getSenderId() != null) {
                // Mark message as read in database
                // Nếu cần, hãy implement hàm markMessageAsRead trong ChatService
                //chatService.markMessageAsRead(readMessage.getId());

                // Create read receipt
                ChatMessageDTO readReceipt = new ChatMessageDTO();
                readReceipt.setMessageType("READ");
                readReceipt.setId(readMessage.getId());
                readReceipt.setSenderId(readMessage.getSenderId());
                readReceipt.setTimestamp(java.time.Instant.now());

                // Send read receipt to original sender
                messagingTemplate.convertAndSendToUser(
                    readMessage.getSenderId().toString(),
                    "/queue/receipts",
                    readReceipt
                );

                logger.debug("Message marked as read: ID {}", readMessage.getId());
            }
        } catch (Exception e) {
            logger.error("Error handling read receipt: {}", e.getMessage(), e);
        }
    }
}
