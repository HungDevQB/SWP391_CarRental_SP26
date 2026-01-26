# Cập nhật thông tin chủ xe trong Car Detail Page

## Các thay đổi đã thực hiện:

### Backend Changes:

1. **CarDTO.java** - Thêm trường supplier
   - Thêm `private UserDTO supplier;` để chứa thông tin chi tiết chủ xe

2. **CarMapper.java** - Cập nhật mapping
   - Thêm UserMapper vào uses annotation
   - Thêm mapping cho supplier: `@Mapping(source = "supplier", target = "supplier")`
   - Thêm ignore cho rentalCount: `@Mapping(target = "rentalCount", ignore = true)`

3. **CarRepository.java** - Cập nhật queries
   - Cập nhật `findByIdWithRelations()` để fetch supplier và userDetail
   - Cập nhật `findAllWithRelations()` để fetch supplier và userDetail

### Frontend Changes:

4. **CarDetailPage.jsx** - Thêm hiển thị thông tin chủ xe
   - Thêm section "Thông tin chủ xe" sau phần "Mô tả"
   - Hiển thị avatar chủ xe (dựa trên chữ cái đầu)
   - Hiển thị tên, username, email, phone
   - Hiển thị ngày tham gia và trạng thái
   - Thêm nút "Liên hệ chủ xe" và "Email"

## Cấu trúc dữ liệu supplier:
```javascript
car.supplier = {
  userId: Integer,
  username: String,
  email: String,
  phone: String,
  statusName: String,
  createdAt: Date,
  userDetail: {
    fullName: String,
    // ... other user detail fields
  }
}
```

## Hiển thị frontend:
- Section thông tin chủ xe với design đẹp mắt
- Avatar gradient dựa trên chữ cái đầu
- Thông tin được sắp xếp trong grid responsive
- Nút liên hệ với gradient styling
- Badge trạng thái có màu sắc phù hợp

## Testing:
- Tạo file test-supplier.js để kiểm tra API response
- Backend cần được khởi động để test đầy đủ
- Frontend sẽ hiển thị thông tin chủ xe khi có dữ liệu

## Lưu ý:
- Đảm bảo UserMapper và UserDetailMapper hoạt động đúng
- Kiểm tra performance với JOIN FETCH nhiều bảng
- Xử lý trường hợp supplier null trong frontend
