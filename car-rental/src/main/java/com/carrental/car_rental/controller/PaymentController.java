package com.carrental.car_rental.controller;

import com.carrental.car_rental.dto.PaymentDTO;
import com.carrental.car_rental.dto.PaymentResponseDTO;
import com.carrental.car_rental.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.validation.Valid;
import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<PaymentDTO> getPayment(@PathVariable Integer id) {
        logger.info("Request to get payment by ID: {}", id);
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {
        logger.info("Request to get all payments");
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByBookingId(@PathVariable Integer bookingId) {
        logger.info("Request to get payments for booking ID: {}", bookingId);
        return ResponseEntity.ok(service.findByBookingId(bookingId));
    }

    @PostMapping
    public ResponseEntity<PaymentResponseDTO> createPayment(@Valid @RequestBody PaymentDTO dto, HttpServletRequest request) {
        logger.info("Request to create payment for booking ID: {}", dto.getBookingId());
        PaymentResponseDTO response = service.processPayment(dto, request);
        logger.info("Payment processed with ID: {}", response.getPaymentId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/with-booking")
    public ResponseEntity<PaymentResponseDTO> createPaymentWithBooking(@Valid @RequestBody PaymentDTO dto, HttpServletRequest request) {
        logger.info("Request to create payment with booking for car ID: {}", dto.getCarId());
        PaymentResponseDTO response = service.processPaymentWithBooking(dto, request);
        logger.info("Payment with booking processed successfully. Booking ID: {}, Payment ID: {}", 
                   response.getBookingId(), response.getPaymentId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentDTO> updatePayment(@PathVariable Integer id, @Valid @RequestBody PaymentDTO dto) {
        logger.info("Request to update payment with ID: {}", id);
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Integer id) {
        logger.warn("Request to delete payment with ID: {}", id);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> handlePaymentCallback(HttpServletRequest request, UriComponentsBuilder uriBuilder) {
        logger.info("Payment callback received for TxnRef: {}", request.getParameter("vnp_TxnRef"));
        String frontendUrl = "http://localhost:5173"; // URL của ứng dụng React

        try {
            String txnRef = service.handlePaymentCallback(request);
            String responseCode = request.getParameter("vnp_ResponseCode");

            UriComponentsBuilder redirectUriBuilder;

            if ("00".equals(responseCode)) {
                // Thanh toán thành công -> chuyển hướng về trang success
                redirectUriBuilder = UriComponentsBuilder.fromUriString(frontendUrl)
                        .path("/booking-success")
                        .queryParam("payment_status", "success")
                        .queryParam("txn_ref", txnRef);
            } else {
                // Thanh toán thất bại -> chuyển hướng về trang failure
                redirectUriBuilder = UriComponentsBuilder.fromUriString(frontendUrl)
                        .path("/payment-failed") // Một trang thất bại chung
                        .queryParam("payment_status", "failed")
                        .queryParam("error_code", responseCode);
            }

            URI redirectUri = redirectUriBuilder.build().toUri();
            return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();

        } catch (Exception e) {
            logger.error("Error handling payment callback: {}", e.getMessage(), e);
            // Lỗi server -> chuyển hướng về trang failure
            URI redirectUri = UriComponentsBuilder.fromUriString(frontendUrl)
                    .path("/payment-failed")
                    .queryParam("payment_status", "failed")
                    .queryParam("error_code", "server_error")
                    .build().toUri();
            return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();
        }
    }

    @PostMapping("/test-cash")
    public ResponseEntity<PaymentResponseDTO> testCashPayment(@RequestBody PaymentDTO dto) {
        logger.info("Test cash payment for booking ID: {}", dto.getBookingId());
        try {
            // Tạo một mock response cho test
            PaymentResponseDTO response = new PaymentResponseDTO();
            response.setPaymentId(999);
            response.setBookingId(dto.getBookingId());
            response.setAmount(dto.getAmount());
            response.setCurrency("VND");
            response.setTransactionId("TEST_PAY_" + System.nanoTime());
            response.setPaymentMethod("cash");
            response.setStatus("success");
            response.setPaymentDate(java.time.LocalDateTime.now());
            
            logger.info("Test cash payment successful: {}", response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Test cash payment failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> testConnection() {
        logger.info("Payment service test endpoint called");
        return ResponseEntity.ok("Payment service is running");
    }

    @GetMapping("/momo-callback")
    public ResponseEntity<Void> handleMomoCallbackGet(HttpServletRequest request) {
        logger.info("[MoMo-GET] Callback received with query: {}", request.getQueryString());
        String frontendUrl = "http://localhost:5173";
        try {
            String orderId = request.getParameter("orderId");
            String resultCode = request.getParameter("resultCode");
            String message = request.getParameter("message");
            logger.info("[MoMo-GET] orderId={}, resultCode={}, message={}", orderId, resultCode, message);
            // Tìm payment theo transactionId (orderId)
            com.carrental.car_rental.entity.Payment payment = service.findByTransactionId(orderId);
            if (payment == null) {
                logger.error("Payment not found for MoMo orderId: {}", orderId);
                return ResponseEntity.status(302).location(java.net.URI.create(frontendUrl + "/payment-failed?payment_status=failed&error_code=not_found")).build();
            }

            // Cập nhật trạng thái payment
            if ("0".equals(resultCode)) {
                service.updatePaymentStatus(payment, "paid");
            } else {
                service.updatePaymentStatus(payment, "failed");
            }

            // Gửi email xác nhận nếu thành công
            if ("0".equals(resultCode)) {
                try {
                    service.sendBookingConfirmationEmail(payment);
                } catch (Exception e) {
                    logger.error("Failed to send confirmation email for MoMo payment: {}", e.getMessage());
                }
            }

            // Redirect về frontend
            String redirectUrl;
            if ("0".equals(resultCode)) {
                redirectUrl = frontendUrl + "/booking-success?payment_status=success&txn_ref=" + orderId;
            } else {
                redirectUrl = frontendUrl + "/payment-failed?payment_status=failed&error_code=" + resultCode;
            }
            return ResponseEntity.status(302).location(java.net.URI.create(redirectUrl)).build();
        } catch (Exception e) {
            logger.error("[MoMo-GET] Error handling callback: {}", e.getMessage(), e);
            String redirectUrl = frontendUrl + "/payment-failed?payment_status=failed&error_code=server_error";
            return ResponseEntity.status(302).location(java.net.URI.create(redirectUrl)).build();
        }
    }

    @PostMapping("/momo-callback")
    public ResponseEntity<Void> handleMomoCallback(HttpServletRequest request) {
        logger.info("[MoMo-POST] Callback received");
        String frontendUrl = "http://localhost:5173";
        try {
            String body = request.getReader().lines().reduce("", (acc, line) -> acc + line);
            logger.info("[MoMo-POST] Body: {}", body);
            // Parse JSON body
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.Map<String, Object> json = objectMapper.readValue(body, java.util.Map.class);
            String orderId = (String) json.get("orderId");
            String resultCode = String.valueOf(json.get("resultCode"));
            String message = (String) json.get("message");
            logger.info("[MoMo-POST] orderId={}, resultCode={}, message={}", orderId, resultCode, message);
            // Tìm payment theo transactionId (orderId)
            com.carrental.car_rental.entity.Payment payment = service.findByTransactionId(orderId);
            if (payment == null) {
                logger.error("[MoMo-POST] Payment not found for orderId: {}", orderId);
                return ResponseEntity.ok().build(); // MoMo chỉ cần 200 OK
            }
            // Cập nhật trạng thái payment
            if ("0".equals(resultCode)) {
                service.updatePaymentStatus(payment, "paid");
            } else {
                service.updatePaymentStatus(payment, "failed");
            }
            // Gửi email xác nhận nếu thành công
            if ("0".equals(resultCode)) {
                try {
                    service.sendBookingConfirmationEmail(payment);
                } catch (Exception e) {
                    logger.error("[MoMo-POST] Failed to send confirmation email: {}", e.getMessage());
                }
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("[MoMo-POST] Error handling callback: {}", e.getMessage(), e);
            return ResponseEntity.ok().build();
        }
    }

    @GetMapping("/momo-status")
    public ResponseEntity<?> checkMomoStatus(@RequestParam String orderId, @RequestParam String requestId) {
        try {
            Map<String, Object> result = service.checkMomoTransactionStatus(orderId, requestId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error checking MoMo transaction status: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Trung gian hoàn tiền cọc cho khách
     */
    @PostMapping("/refund")
    public ResponseEntity<?> refundDeposit(@RequestBody Map<String, Integer> body) {
        Integer bookingId = body.get("bookingId");
        service.refundDeposit(bookingId);
        return ResponseEntity.ok().build();
    }

    /**
     * Trung gian chuyển tiền cho supplier
     */
    @PostMapping("/payout")
    public ResponseEntity<?> payoutSupplier(@RequestBody Map<String, Integer> body) {
        Integer bookingId = body.get("bookingId");
        service.payoutSupplier(bookingId);
        return ResponseEntity.ok().build();
    }
}