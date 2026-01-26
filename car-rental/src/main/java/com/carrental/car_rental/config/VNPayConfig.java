package com.carrental.car_rental.config;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.net.URLEncoder;
import java.io.UnsupportedEncodingException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.TimeZone;

@Component
public class VNPayConfig {
    private static final Logger logger = LoggerFactory.getLogger(VNPayConfig.class);

    @Value("${vnpay.url}")
    public String VNP_PAY_URL;
    @Value("${vnpay.returnUrl}")
    public String VNP_RETURN_URL;
    @Value("${vnpay.platformFeeReturnUrl}")
    public String VNP_PLATFORM_FEE_RETURN_URL;
    @Value("${vnpay.tmnCode}")
    public String VNP_TMN_CODE;
    @Value("${vnpay.secretKey}")
    public String VNP_SECRET_KEY;
    public static final String VNP_API_URL = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
    public static final String VNP_VERSION = "2.1.0";
    public static final String VNP_COMMAND = "pay";
    public static final String VNP_ORDER_TYPE = "250000";
    public static final String VNP_CURRENCY_CODE = "VND";
    public static final String VNP_LOCALE = "vn";
    public static final int VNP_EXPIRE_MINUTES = 15;

    public String hashAllFields(Map<String, String> fields) {
        if (fields == null || fields.isEmpty()) {
            logger.error("Fields map is null or empty, cannot generate hash.");
            throw new IllegalArgumentException("Fields map cannot be null or empty.");
        }

        logger.info("Starting hash generation for {} fields (Reference Logic)", fields.size());

        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder dataToHash = new StringBuilder();

        try {
            for (String fieldName : fieldNames) {
                String fieldValue = fields.get(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty() && !fieldName.equals("vnp_SecureHash")) {
                    // Applying reference logic: URL-encode the value before hashing
                    String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString());
                    if (dataToHash.length() > 0) {
                        dataToHash.append("&");
                    }
                    dataToHash.append(fieldName).append("=").append(encodedValue);
                    logger.debug("Added field to hash: {}={}", fieldName, encodedValue);
                } else {
                    logger.debug("Skipped field: {} (value: {})", fieldName, fieldValue);
                }
            }

            String data = dataToHash.toString();
            logger.info("Data to hash ({} characters): {}", data.length(), data);

            if (data.isEmpty()) {
                logger.error("No valid fields found for hashing");
                throw new IllegalArgumentException("No valid fields found for hashing");
            }

            String hash = hmacSHA512(VNP_SECRET_KEY, data);
            logger.info("Hash generated successfully (Reference Logic): {}", hash);
            return hash;
        } catch (UnsupportedEncodingException e) {
            logger.error("Failed to URL-encode field values: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate hash due to encoding error: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Failed to generate hash: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate hash: " + e.getMessage(), e);
        }
    }

    public String hmacSHA512(String key, String data) {
        if (key == null || key.isEmpty()) {
            logger.error("HMAC-SHA512 key is null or empty.");
            throw new IllegalArgumentException("HMAC-SHA512 key cannot be null or empty.");
        }
        if (data == null) {
            logger.error("HMAC-SHA512 data is null.");
            throw new IllegalArgumentException("HMAC-SHA512 data cannot be null.");
        }

        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder hexString = new StringBuilder(result.length * 2);
            for (byte b : result) {
                hexString.append(String.format("%02x", b & 0xFF));
            }
            String hash = hexString.toString();
            logger.info("HMAC-SHA512 hash generated successfully: {}", hash);
            return hash;
        } catch (Exception e) {
            logger.error("Error generating HMAC-SHA512: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate HMAC-SHA512 hash: " + e.getMessage(), e);
        }
    }

    public String getIpAddress(HttpServletRequest request) {
        String ipAddress;
        try {
            ipAddress = request.getHeader("X-FORWARDED-FOR");
            if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getHeader("Proxy-Client-IP");
            }
            if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getHeader("WL-Proxy-Client-IP");
            }
            if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getRemoteAddr();
                if ("0:0:0:0:0:0:0:1".equals(ipAddress) || "::1".equals(ipAddress)) {
                    ipAddress = "127.0.0.1";
                }
            }
            // For multiple IPs in X-FORWARDED-FOR, take the first one
            if (ipAddress != null && ipAddress.contains(",")) {
                ipAddress = ipAddress.split(",")[0].trim();
            }
            logger.info("Client IP Address: {}", ipAddress);
        } catch (Exception e) {
            ipAddress = "127.0.0.1"; // Fallback IP
            logger.error("Error getting IP address: {}. Defaulting to {}", e.getMessage(), ipAddress, e);
        }
        return ipAddress;
    }

    public boolean validateParams(Map<String, String> params) {
        if (params == null || params.isEmpty()) {
            logger.warn("VNPAY parameters are null or empty.");
            return false;
        }

        String[] requiredParams = {
                "vnp_Version", "vnp_Command", "vnp_TmnCode", "vnp_Amount",
                "vnp_CurrCode", "vnp_TxnRef", "vnp_OrderInfo", "vnp_Locale",
                "vnp_ReturnUrl", "vnp_IpAddr", "vnp_CreateDate", "vnp_ExpireDate"
        };

        for (String param : requiredParams) {
            if (!params.containsKey(param) || params.get(param) == null || params.get(param).isEmpty()) {
                logger.warn("Missing or empty required parameter: {}", param);
                return false;
            }
        }

        try {
            long amount = Long.parseLong(params.get("vnp_Amount"));
            if (amount <= 0) {
                logger.warn("vnp_Amount must be greater than 0: {}", amount);
                return false;
            }
        } catch (NumberFormatException e) {
            logger.warn("Invalid vnp_Amount format: {}", params.get("vnp_Amount"));
            return false;
        }

        String vnp_TxnRef = params.get("vnp_TxnRef");
        if (vnp_TxnRef == null || vnp_TxnRef.trim().isEmpty()) {
            logger.warn("vnp_TxnRef must not be empty: {}", vnp_TxnRef);
            return false;
        }

        return true;
    }

    /**
     * Tạo URL thanh toán VNPay cho platform fee
     * @param request HttpServletRequest để lấy IP
     * @param paymentId ID của payment record
     * @param amount Số tiền platform fee (đơn vị VND)
     * @param confirmationId ID của cash payment confirmation
     * @param returnUrl URL callback sau khi thanh toán
     * @param cancelUrl URL callback khi hủy thanh toán
     * @return URL redirect đến VNPay
     */
    public String createPlatformFeePaymentUrl(HttpServletRequest request, String paymentId, 
                                            long amount, Integer confirmationId, 
                                            String returnUrl, String cancelUrl) {
        logger.info("Creating VNPay platform fee payment URL - PaymentId: {}, Amount: {}, ConfirmationId: {}", 
                   paymentId, amount, confirmationId);
        
        try {
            // Validate input parameters
            if (paymentId == null || paymentId.trim().isEmpty()) {
                throw new IllegalArgumentException("Payment ID cannot be null or empty");
            }
            if (amount <= 0) {
                throw new IllegalArgumentException("Amount must be greater than 0");
            }
            if (confirmationId == null) {
                throw new IllegalArgumentException("Confirmation ID cannot be null");
            }
            
            // Prepare VNPay parameters
            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", VNP_VERSION);
            vnp_Params.put("vnp_Command", VNP_COMMAND);
            vnp_Params.put("vnp_TmnCode", VNP_TMN_CODE);
            vnp_Params.put("vnp_Amount", String.valueOf(amount * 100)); // VNPay tính bằng xu
            vnp_Params.put("vnp_CurrCode", VNP_CURRENCY_CODE);
            vnp_Params.put("vnp_TxnRef", paymentId);
            vnp_Params.put("vnp_OrderInfo", "Thanh toan phi platform - Confirmation ID: " + confirmationId);
            vnp_Params.put("vnp_OrderType", VNP_ORDER_TYPE);
            vnp_Params.put("vnp_Locale", VNP_LOCALE);
            vnp_Params.put("vnp_ReturnUrl", returnUrl != null ? returnUrl : VNP_PLATFORM_FEE_RETURN_URL);
            vnp_Params.put("vnp_IpAddr", getIpAddress(request));
            
            // Set timestamps
            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
            
            cld.add(Calendar.MINUTE, VNP_EXPIRE_MINUTES);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
            
            // Validate parameters
            if (!validateParams(vnp_Params)) {
                throw new IllegalArgumentException("Invalid VNPay parameters");
            }
            
            logger.info("VNPay platform fee parameters prepared: {}", vnp_Params);
            
            // Generate secure hash
            String vnp_SecureHash = hashAllFields(vnp_Params);
            logger.info("VNPay platform fee SecureHash generated: {}", vnp_SecureHash);
            
            // Build query string
            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder query = new StringBuilder();
            
            for (int i = 0; i < fieldNames.size(); i++) {
                String fieldName = fieldNames.get(i);
                String fieldValue = vnp_Params.get(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString()));
                    query.append("=");
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    if (i < fieldNames.size() - 1) {
                        query.append("&");
                    }
                }
            }
            
            // Add secure hash to query
            query.append("&vnp_SecureHash=").append(vnp_SecureHash);
            
            // Build final payment URL
            String paymentUrl = VNP_PAY_URL + "?" + query.toString();
            logger.info("VNPay platform fee payment URL generated successfully: {}", paymentUrl);
            
            return paymentUrl;
            
        } catch (Exception e) {
            logger.error("Error creating VNPay platform fee payment URL: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create VNPay platform fee payment URL: " + e.getMessage(), e);
        }
    }

    /**
     * Validate VNPay callback cho platform fee payment
     * @param params VNPay callback parameters
     * @return true nếu callback hợp lệ
     */
    public boolean validatePlatformFeeCallback(Map<String, String> params) {
        logger.info("Validating VNPay platform fee callback parameters");
        
        try {
            if (params == null || params.isEmpty()) {
                logger.warn("Platform fee callback parameters are null or empty");
                return false;
            }
            
            // Kiểm tra các tham số bắt buộc
            String[] requiredParams = {
                "vnp_TmnCode", "vnp_Amount", "vnp_BankCode", "vnp_BankTranNo",
                "vnp_CardType", "vnp_OrderInfo", "vnp_PayDate", "vnp_ResponseCode",
                "vnp_TmnCode", "vnp_TransactionNo", "vnp_TxnRef", "vnp_SecureHash"
            };
            
            for (String param : requiredParams) {
                if (!params.containsKey(param) || params.get(param) == null || params.get(param).isEmpty()) {
                    logger.warn("Missing required platform fee callback parameter: {}", param);
                    return false;
                }
            }
            
            // Validate secure hash
            String vnp_SecureHash = params.get("vnp_SecureHash");
            Map<String, String> paramsCopy = new HashMap<>(params);
            paramsCopy.remove("vnp_SecureHash");
            
            String calculatedHash = hashAllFields(paramsCopy);
            boolean hashValid = vnp_SecureHash.equals(calculatedHash);
            
            if (!hashValid) {
                logger.warn("Platform fee callback secure hash validation failed. Expected: {}, Got: {}", 
                           calculatedHash, vnp_SecureHash);
                return false;
            }
            
            logger.info("Platform fee callback validation successful");
            return true;
            
        } catch (Exception e) {
            logger.error("Error validating platform fee callback: {}", e.getMessage(), e);
            return false;
        }
    }
}