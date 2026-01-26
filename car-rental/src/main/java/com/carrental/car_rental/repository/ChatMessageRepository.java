package com.carrental.car_rental.repository;

import com.carrental.car_rental.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {
    List<ChatMessage> findByBookingIdAndIsDeletedFalse(Integer bookingId);
    List<ChatMessage> findBySender_IdAndReceiver_IdAndIsDeletedFalse(Integer senderId, Integer receiverId);
    
    @Query("SELECT cm FROM ChatMessage cm JOIN FETCH cm.sender JOIN FETCH cm.receiver LEFT JOIN FETCH cm.images WHERE ((cm.sender.id = :userId1 AND cm.receiver.id = :userId2) OR (cm.sender.id = :userId2 AND cm.receiver.id = :userId1)) AND cm.isDeleted = false ORDER BY cm.sentAt ASC")
    List<ChatMessage> findChatMessagesBetweenUsers(@Param("userId1") Integer userId1, @Param("userId2") Integer userId2);

    // Lấy tất cả customer (sender) đã từng nhắn với supplier (receiver)
    @Query("SELECT DISTINCT cm.sender FROM ChatMessage cm WHERE cm.receiver.id = :supplierId AND cm.isDeleted = false")
    List<com.carrental.car_rental.entity.User> findDistinctCustomersBySupplierId(@Param("supplierId") Integer supplierId);

    // Lấy tất cả supplier (receiver) đã từng nhắn với customer (sender)
    @Query("SELECT DISTINCT cm.receiver FROM ChatMessage cm WHERE cm.sender.id = :customerId AND cm.isDeleted = false")
    List<com.carrental.car_rental.entity.User> findDistinctSuppliersByCustomerId(@Param("customerId") Integer customerId);
}