package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.ChatMessageDTO;
import com.carrental.car_rental.service.ChatMessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.carrental.car_rental.dto.CustomerInfoDTO;
import java.util.List;

@RestController
@RequestMapping("/api/chat-messages")
public class ChatMessageController {
    private final ChatMessageService service;

    public ChatMessageController(ChatMessageService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChatMessageDTO> getChatMessage(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<ChatMessageDTO>> getAllChatMessages() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<ChatMessageDTO>> getChatMessagesByBookingId(@PathVariable Integer bookingId) {
        return ResponseEntity.ok(service.findByBookingId(bookingId));
    }

    @GetMapping("/between-users")
    public ResponseEntity<List<ChatMessageDTO>> getChatMessagesBetweenUsers(
            @RequestParam Integer senderId, 
            @RequestParam Integer receiverId) {
        return ResponseEntity.ok(service.findBySenderIdAndReceiverId(senderId, receiverId));
    }

    @PostMapping
    public ResponseEntity<ChatMessageDTO> createChatMessage(@RequestBody ChatMessageDTO dto) {
        return ResponseEntity.status(201).body(service.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChatMessageDTO> updateChatMessage(@PathVariable Integer id, @RequestBody ChatMessageDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChatMessage(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // API: Lấy danh sách customer đã từng nhắn với supplier
    @GetMapping("/customers-of-supplier/{supplierId}")
    public ResponseEntity<List<CustomerInfoDTO>> getCustomersOfSupplier(@PathVariable Integer supplierId) {
        return ResponseEntity.ok(service.findCustomersBySupplierId(supplierId));
    }
}