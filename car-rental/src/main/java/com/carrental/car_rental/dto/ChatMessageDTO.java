package com.carrental.car_rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private Integer messageId;
    private Integer bookingId;
    private Integer senderId;
    private String senderEmail;
    private String senderUsername;
    private Integer receiverId;
    private String receiverEmail;
    private String receiverUsername;
    private String messageContent;
    private LocalDateTime sentAt;
    private Boolean isRead;
    private Boolean isTranslated;
    private String originalLanguage;
    private Boolean isDeleted;
    
    // Additional fields for WebSocket compatibility
        private String content;       // alias for messageContent
        private String sender;        // alias for senderUsername
    private java.util.List<String> imageUrls;
    public java.util.List<String> getImageUrls() {
        return imageUrls;
    }
    public void setImageUrls(java.util.List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
    private Instant timestamp; // alias for sentAt
    private String messageType;   // for chat message types (MESSAGE, JOIN, LEAVE, ERROR, etc.)
    
    // Convenience getters/setters for backward compatibility
    public String getContent() {
        return content != null ? content : messageContent;
    }
    public void setContent(String content) {
        this.content = content;
        this.messageContent = content;
    }
    public String getSender() {
        return sender != null ? sender : senderUsername;
    }
    public void setSender(String sender) {
        this.sender = sender;
        this.senderUsername = sender;
    }
    public Instant getTimestamp() {
        return timestamp;
    }
    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
    public Integer getId() {
        return messageId;
    }
    public void setId(Integer id) {
        this.messageId = id;
    }
    public String getSenderUsername() {
        return senderUsername;
    }
    public void setSenderUsername(String senderUsername) {
        this.senderUsername = senderUsername;
    }
    public String getReceiverUsername() {
        return receiverUsername;
    }
    public void setReceiverUsername(String receiverUsername) {
        this.receiverUsername = receiverUsername;
    }
    public String getMessageContent() {
        return messageContent;
    }
    public void setMessageContent(String messageContent) {
        this.messageContent = messageContent;
    }
    public Integer getSenderId() {
        return senderId;
    }
    public void setSenderId(Integer senderId) {
        this.senderId = senderId;
    }
    public Integer getReceiverId() {
        return receiverId;
    }
    public void setReceiverId(Integer receiverId) {
        this.receiverId = receiverId;
    }
    public String getSenderEmail() {
        return senderEmail;
    }
    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }
    public String getReceiverEmail() {
        return receiverEmail;
    }
    public void setReceiverEmail(String receiverEmail) {
        this.receiverEmail = receiverEmail;
    }
    public Integer getMessageId() {
        return messageId;
    }
    public void setMessageId(Integer messageId) {
        this.messageId = messageId;
    }
    public Integer getBookingId() {
        return bookingId;
    }
    public void setBookingId(Integer bookingId) {
        this.bookingId = bookingId;
    }
    public LocalDateTime getSentAt() {
        return sentAt;
    }
    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
    public Boolean getIsRead() {
        return isRead;
    }
    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }
    public Boolean getIsTranslated() {
        return isTranslated;
    }
    public void setIsTranslated(Boolean isTranslated) {
        this.isTranslated = isTranslated;
    }
    public String getOriginalLanguage() {
        return originalLanguage;
    }
    public void setOriginalLanguage(String originalLanguage) {
        this.originalLanguage = originalLanguage;
    }
    public Boolean getIsDeleted() {
        return isDeleted;
    }
    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
    public String getMessageType() {
        return messageType;
    }
    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }
}