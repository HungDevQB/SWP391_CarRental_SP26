# Hướng dẫn khắc phục lỗi VNPay

## Các lỗi thường gặp và cách khắc phục

### 1. Lỗi tạo chữ ký VNPay

#### Triệu chứng:
- Lỗi "Invalid callback: hash validation failed"
- Lỗi "Failed to generate VNPay payment URL"
- Chữ ký không khớp giữa client và server

#### Nguyên nhân có thể:
1. **Secret Key không đúng**: Kiểm tra `vnpay.secretKey` trong `application.properties`
2. **Thứ tự tham số**: VNPay yêu cầu tham số phải được sắp xếp theo thứ tự alphabet
3. **Encoding**: Tham số phải được encode đúng cách
4. **Thiếu tham số bắt buộc**: Một số tham số VNPay là bắt buộc

#### Cách khắc phục:

##### Bước 1: Kiểm tra cấu hình
```properties
# application.properties
vnpay.url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
vnpay.returnUrl=http://localhost:8080/api/payments/callback
vnpay.tmnCode=TMA56MA9
vnpay.secretKey=MBM2KB31OKBW018SMJHBNMX2XMH1NEC8
```

##### Bước 2: Chạy test VNPay
```bash
# Chạy script test
./test-vnpay.bat

# Hoặc chạy trực tiếp
mvn spring-boot:run -Dspring-boot.run.profiles=test-vnpay
```

##### Bước 3: Kiểm tra logs
```bash
# Xem logs VNPay
Get-Content logs/carrental.log | Select-String "VNPay|vnpay|SecureHash|hash"
```

### 2. Lỗi callback VNPay

#### Triệu chứng:
- Callback không được xử lý
- Lỗi "Payment not found for TxnRef"
- Lỗi "Status not found"

#### Cách khắc phục:

##### Bước 1: Kiểm tra URL callback
- Đảm bảo `vnpay.returnUrl` trỏ đến endpoint đúng
- Kiểm tra endpoint `/api/payments/callback` có hoạt động

##### Bước 2: Kiểm tra database
```sql
-- Kiểm tra payment có tồn tại
SELECT * FROM Payment WHERE transaction_id = 'PAY_xxx';

-- Kiểm tra status
SELECT * FROM Status WHERE status_name IN ('pending', 'paid', 'failed');
```

### 3. Lỗi tham số VNPay

#### Các tham số bắt buộc:
- `vnp_Version`: "2.1.0"
- `vnp_Command`: "pay"
- `vnp_TmnCode`: Mã merchant
- `vnp_Amount`: Số tiền (nhân với 100)
- `vnp_CurrCode`: "VND"
- `vnp_TxnRef`: Mã giao dịch
- `vnp_OrderInfo`: Thông tin đơn hàng
- `vnp_Locale`: "vn"
- `vnp_ReturnUrl`: URL callback
- `vnp_IpAddr`: IP khách hàng
- `vnp_CreateDate`: Thời gian tạo (yyyyMMddHHmmss)
- `vnp_ExpireDate`: Thời gian hết hạn

### 4. Debug VNPay

#### Thêm logging chi tiết:
```java
// Trong PaymentService.java
logger.info("VNPay parameters: {}", vnp_Params);
logger.info("Generated hash: {}", vnp_SecureHash);
logger.info("Payment URL: {}", paymentUrl);
```

#### Kiểm tra request/response:
```bash
# Sử dụng curl để test
curl -X POST "http://localhost:8080/api/payments/process" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": 1,
    "amount": 180000,
    "currency": "VND",
    "paymentMethod": "vnpay"
  }'
```

### 5. Các lưu ý quan trọng

1. **Sandbox vs Production**: Đảm bảo sử dụng đúng URL và thông tin đăng nhập
2. **Timezone**: Sử dụng timezone "Etc/GMT+7" cho Việt Nam
3. **Amount**: Số tiền phải nhân với 100 (VNPay yêu cầu)
4. **Encoding**: Sử dụng UTF-8 cho tất cả tham số
5. **Hash**: Không bao gồm `vnp_SecureHash` trong dữ liệu hash

### 6. Kiểm tra nhanh

#### Script PowerShell để kiểm tra logs:
```powershell
# Tìm lỗi VNPay trong logs
Get-Content logs/carrental.log | Select-String "ERROR.*VNPay|ERROR.*vnpay" | Select-Object -Last 10

# Tìm thông tin hash
Get-Content logs/carrental.log | Select-String "SecureHash|hash" | Select-Object -Last 10
```

#### Kiểm tra cấu hình:
```bash
# Kiểm tra application.properties
Get-Content src/main/resources/application.properties | Select-String "vnpay"
```

### 7. Liên hệ hỗ trợ

Nếu vẫn gặp lỗi, hãy cung cấp:
1. Logs chi tiết từ `logs/carrental.log`
2. Thông tin cấu hình VNPay (không bao gồm secret key)
3. Request/response từ VNPay
4. Mô tả chi tiết lỗi gặp phải 