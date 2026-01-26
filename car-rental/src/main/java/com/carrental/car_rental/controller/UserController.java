package com.carrental.car_rental.controller;

import com.carrental.car_rental.config.JwtTokenProvider;
import com.carrental.car_rental.dto.CreateUserDTO;
import com.carrental.car_rental.dto.BookingDTO;
import com.carrental.car_rental.dto.UpdateProfileDTO;
import com.carrental.car_rental.dto.UpdateUserDTO;
import com.carrental.car_rental.dto.UserDTO;
import com.carrental.car_rental.dto.UserDetailDTO;
import com.carrental.car_rental.entity.User;
import com.carrental.car_rental.entity.Car;
import com.carrental.car_rental.entity.Status;
import com.carrental.car_rental.repository.UserRepository;
import com.carrental.car_rental.dto.ToggleUserStatusRequest;
import com.carrental.car_rental.service.UserService;
import com.carrental.car_rental.service.BookingService;
import com.carrental.car_rental.service.PaymentService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

import java.util.stream.Collectors;

import com.carrental.car_rental.repository.CarRepository;
import com.carrental.car_rental.repository.StatusRepository;
import com.carrental.car_rental.repository.BookingRepository;
import com.carrental.car_rental.dto.CarDTO;
import com.carrental.car_rental.mapper.CarMapper;
import com.carrental.car_rental.service.UserService;
import com.carrental.car_rental.service.BookingService;
import jakarta.persistence.EntityNotFoundException;



@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#+\\-_])[A-Za-z\\d@$!%*?&#+\\-_]{8,}$");    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final BookingService bookingService;
    private final PaymentService paymentService;
    private final CarRepository carRepository;
    private final CarMapper carMapper;
    private final StatusRepository statusRepository;
    private final BookingRepository bookingRepository;

    @Autowired
    public UserController(UserService userService, JwtTokenProvider jwtTokenProvider, UserRepository userRepository, BookingService bookingService, CarRepository carRepository, CarMapper carMapper, StatusRepository statusRepository, BookingRepository bookingRepository, PaymentService paymentService) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
        this.bookingService = bookingService;
        this.carRepository = carRepository;
        this.carMapper = carMapper;
        this.statusRepository = statusRepository;
        this.bookingRepository = bookingRepository;
        this.paymentService = paymentService;
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SUPPLIER')")
    public ResponseEntity<?> getCurrentUserProfile(Authentication authentication) {
        logger.info("=== DEBUG PROFILE REQUEST ===");
        logger.info("Authentication: {}", authentication);
        logger.info("Authentication.getName(): {}", authentication != null ? authentication.getName() : "null");
        logger.info("Authentication.getAuthorities(): {}", authentication != null ? authentication.getAuthorities() : "null");
        logger.info("Authentication.isAuthenticated(): {}", authentication != null ? authentication.isAuthenticated() : "null");
        logger.info("=== END DEBUG ===");
        
        logger.info("Yêu cầu lấy thông tin hồ sơ người dùng hiện tại từ IP: {}", getClientIp(authentication));
        try {
            if (authentication == null) {
                logger.error("Authentication is null");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Không có thông tin xác thực"));
            }
            
            String username = authentication.getName();
            logger.info("Looking up user by username: {}", username);
            Optional<UserDTO> userDTO = userService.findByUsername(username); // Changed from findByEmail to findByUsername
            return userDTO.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body((UserDTO) createErrorResponse("Không tìm thấy thông tin người dùng hiện tại")));
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông tin hồ sơ người dùng hiện tại: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy thông tin người dùng: " + e.getMessage()));
        }
    }
    
//    @PostMapping("/send-email-verification")
//    @PreAuthorize("hasRole('CUSTOMER')")
//    public ResponseEntity<?> sendEmailVerification(Authentication authentication) {
//    try {
//        String username = authentication.getName();
//        userService.sendEmailVerification(username);
//
//        return ResponseEntity.ok(Map.of("success", true, "message", "Email xác thực đã được gửi"));
//    } catch (Exception e) {
//        logger.error("Error sending email verification", e);
//        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//            .body(Map.of("success", false, "error", "Lỗi khi gửi email xác thực"));
//    }
//}

    @PostMapping("/change-password")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        logger.info("Yêu cầu thay đổi mật khẩu từ user: {}", authentication != null ? authentication.getName() : "unknown");
        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Không có thông tin xác thực"));
            }
            
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Mật khẩu hiện tại không được để trống"));
            }
            
            if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Mật khẩu mới không được để trống"));
            }
            
            if (!PASSWORD_PATTERN.matcher(request.getNewPassword()).matches()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt"));
            }
            userService.changePassword(authentication.getName(), request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(createSuccessResponse("Thay đổi mật khẩu thành công."));
        } catch (Exception e) {
            logger.error("Lỗi khi thay đổi mật khẩu: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Lỗi khi thay đổi mật khẩu: " + e.getMessage()));
        }
    }
    @PutMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SUPPLIER')")
    public ResponseEntity<?> updateCurrentUserProfile(@Valid @RequestBody UpdateProfileDTO dto, Authentication authentication) {
        logger.info("=== UPDATE PROFILE REQUEST ===");
        logger.info("Request data: {}", dto);
        logger.info("UserDetail: {}", dto.getUserDetail());
        logger.info("Authentication: {}", authentication.getName());
        
        try {
            String username = authentication.getName();
            
            // Lấy user hiện tại để giữ nguyên statusId và roleId
            Optional<User> userOpt = userRepository.findByUsernameOrEmail(username, username);
            if (userOpt.isEmpty()) {
                logger.error("User not found: {}", username);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "Không tìm thấy người dùng"));
            }
            
            User currentUser = userOpt.get();
            
            // Tạo UpdateUserDTO với đầy đủ thông tin
            UpdateUserDTO updateUserDTO = new UpdateUserDTO();
            updateUserDTO.setUsername(dto.getUsername());
            updateUserDTO.setEmail(dto.getEmail());
            updateUserDTO.setPhone(dto.getPhone());
            updateUserDTO.setCountryCode(dto.getCountryCode());
            updateUserDTO.setPreferredLanguage(dto.getPreferredLanguage());
            
            // Kiểm tra method name trong Role và Status entity
            updateUserDTO.setRoleId(currentUser.getRole().getId()); // hoặc getId()
            updateUserDTO.setStatusId(currentUser.getStatus().getId()); // hoặc getId()
            
            // Sử dụng UserDetail từ request
            if (dto.getUserDetail() != null) {
                updateUserDTO.setUserDetail(dto.getUserDetail()); // Sử dụng trực tiếp object từ request
            }
            
            logger.info("Calling userService.update with userId: {}, updateUserDTO: {}", currentUser.getId(), updateUserDTO);
            
            UserDTO updatedUser = userService.update(currentUser.getId(), updateUserDTO);
            logger.info("Profile updated successfully for user: {}", username);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật thông tin thành công");
            response.put("data", updatedUser);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error updating profile for user: {}", authentication.getName(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Lỗi khi cập nhật thông tin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }



    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CUSTOMER') and @securityService.canAccessUser(authentication, #id))")
    public ResponseEntity<?> getUser(@PathVariable Integer id, Authentication authentication) {
        logger.info("Yêu cầu lấy thông tin người dùng ID: {} từ IP: {}", id, getClientIp(authentication));
        try {
            UserDTO userDTO = userService.findById(id);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông tin người dùng ID: {} - {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Không tìm thấy người dùng với ID: " + id));
        }
    }


    // Lấy danh sách tất cả người dùng (của hoàng)
    @GetMapping("/all")

    public ResponseEntity<?> getAllUsers(Authentication authentication) {
        logger.info("Yêu cầu lấy danh sách tất cả người dùng từ IP: {}", getClientIp(authentication));
        try {
            List<UserDTO> users = userService.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách người dùng: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy danh sách người dùng: " + e.getMessage()));
        }
    }

    // Lấy người dùng theo role ID (của hoàng)
    @GetMapping("/role/{roleId}")

    public ResponseEntity<?> getUsersByRoleId(@PathVariable Integer roleId, Authentication authentication) {
        logger.info("Yêu cầu lấy người dùng theo roleId: {} từ IP: {}", roleId, getClientIp(authentication));
        try {
            List<UserDTO> users = userService.findByRoleId(roleId);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy người dùng theo roleId: {} - {}", roleId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy người dùng theo roleId: " + e.getMessage()));
        }
    }

    // Lấy người dùng theo country code (của hoàng)
    @GetMapping("/country/{countryCode}")

    public ResponseEntity<?> getUsersByCountryCode(@PathVariable String countryCode, Authentication authentication) {
        logger.info("Yêu cầu lấy người dùng theo countryCode: {} từ IP: {}", countryCode, getClientIp(authentication));
        try {
            List<UserDTO> users = userService.findByCountryCode(countryCode);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy người dùng theo countryCode: {} - {}", countryCode, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy người dùng theo countryCode: " + e.getMessage()));
        }
    }

    // Lấy người dùng theo email (của hoàng)
    @GetMapping("/email")
    public ResponseEntity<?> getUserByEmail(@RequestParam String email, Authentication authentication) {
        logger.info("Yêu cầu lấy thông tin người dùng theo email: {} từ IP: {}", email, getClientIp(authentication));
        try {
            if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email không hợp lệ!"));
            }
            Optional<UserDTO> userDTO = userService.findByEmail(email);
            return userDTO.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body((UserDTO) createErrorResponse("Không tìm thấy người dùng với email: " + email)));
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông tin người dùng theo email: {} - {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy thông tin người dùng: " + e.getMessage()));
        }

    }

    @GetMapping("/user-profile")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SUPPLIER')")
    public ResponseEntity<?> getCurrentProfile(Authentication authentication) {
        logger.info("Yêu cầu lấy thông tin hồ sơ người dùng hiện tại từ IP: {}", getClientIp(authentication));
        try {
            String email = authentication.getName();
            Optional<UserDTO> userDTO = userService.findByEmail(email);
            return userDTO.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body((UserDTO) createErrorResponse("Không tìm thấy thông tin người dùng hiện tại")));
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông tin hồ sơ người dùng hiện tại: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy thông tin người dùng: " + e.getMessage()));
        }
    }

    // Tạo người dùng mới (của hoàng)
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserDTO dto, Authentication authentication) {
        logger.info("Yêu cầu tạo người dùng mới với email: {} từ IP: {}", dto.getEmail(), getClientIp(authentication));
        try {
            UserDTO createdUser = userService.save(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (Exception e) {
            logger.error("Lỗi khi tạo người dùng mới với email: {} - {}", dto.getEmail(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Lỗi khi tạo người dùng: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CUSTOMER') and @securityService.canAccessUser(authentication, #id))")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @Valid @RequestBody UpdateUserDTO dto, Authentication authentication) {
        logger.info("Yêu cầu cập nhật người dùng ID: {} từ IP: {}", id, getClientIp(authentication));
        try {
            UserDTO updatedUser = userService.update(id, dto);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            logger.error("Lỗi khi cập nhật người dùng ID: {} - {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Lỗi khi cập nhật người dùng: " + e.getMessage()));
        }
    }

    // Xóa người dùng (của hoàng)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id, Authentication authentication) {
        logger.info("Yêu cầu xóa người dùng ID: {} từ IP: {}", id, getClientIp(authentication));
        try {
            userService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Lỗi khi xóa người dùng ID: {} - {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Không tìm thấy người dùng để xóa: " + e.getMessage()));
        }
    }

    @GetMapping("/profile/bookings")
    @PreAuthorize("hasRole('CUSTOMER')")

    @Transactional(readOnly = true)
    public ResponseEntity<?> getUserBookingHistory(Authentication authentication) {
        logger.info("Getting booking history for user: {}", authentication.getName());
        
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsernameOrEmail(username, username);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "Không tìm thấy người dùng"));
            }
            
            // Sử dụng BookingService thay vì repository trực tiếp
            List<BookingDTO> bookingHistory = bookingService.findByUserId(userOpt.get().getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", bookingHistory);
            response.put("total", bookingHistory.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error getting booking history", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Lỗi khi tải lịch sử đặt xe: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    private String getClientIp(Authentication authentication) {
        String clientIp = "Unknown";
        if (org.springframework.web.context.request.RequestContextHolder.getRequestAttributes() != null) {
            jakarta.servlet.http.HttpServletRequest request = (jakarta.servlet.http.HttpServletRequest) org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes().resolveReference(org.springframework.web.context.request.RequestAttributes.REFERENCE_REQUEST);
            clientIp = request.getHeader("X-Forwarded-For");
            if (clientIp == null || clientIp.isEmpty()) {
                clientIp = request.getRemoteAddr();
            }
        }
        return clientIp;
    }

    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return response;
    }    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message); // Changed from "error" to "message" to match frontend expectations
        response.put("error", message);   // Keep both for compatibility
        return response;
    }

    @Data
    private static class ChangePasswordRequest {
        @NotBlank(message = "Current password is required")
        private String currentPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 8, message = "New password must be at least 8 characters")
        private String newPassword;
    }

    // Lấy danh sách người dùng có phân trang và lọc (của hoàng)
    @GetMapping
    public ResponseEntity<Page<UserDTO>> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        logger.info("Xử lý yêu cầu GET /api/users với params: page={}, size={}, role={}, status={}", page, size, role, status);
        Page<UserDTO> users = userService.findUsersWithFilters(role, status, page, size);
        return ResponseEntity.ok(users);
    }
    // Chuyển đổi trạng thái người dùng (của hoàng)
    @PutMapping("/{userId}/toggle-status")
    public ResponseEntity<UserDTO> toggleUserStatus(
            @PathVariable Integer userId,
            @Valid @RequestBody ToggleUserStatusRequest request) {
        logger.info("=== BẮT ĐẦU CHUYỂN ĐỔI TRẠNG THÁI NGƯỜI DÙNG ===");
        logger.info("User ID: {}", userId);
        logger.info("Request body: reason={}", request.getReason());
        logger.info("Authentication: {}", SecurityContextHolder.getContext().getAuthentication());
        
        try {
            logger.info("Gọi UserService.toggleUserStatus()...");
            UserDTO updatedUser = userService.toggleUserStatus(userId, request);
            logger.info("Chuyển đổi trạng thái thành công! User mới: {}", updatedUser);
            logger.info("=== KẾT THÚC CHUYỂN ĐỔI TRẠNG THÁI NGƯỜI DÙNG (THÀNH CÔNG) ===");
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            logger.error("=== LỖI KHI CHUYỂN ĐỔI TRẠNG THÁI NGƯỜI DÙNG ===");
            logger.error("User ID: {}", userId);
            logger.error("Request: {}", request);
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception message: {}", e.getMessage());
            logger.error("Stack trace:", e);
            logger.error("=== KẾT THÚC LỖI ===");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body((UserDTO) createErrorResponse("Lỗi khi cập nhật trạng thái: " + e.getMessage()));
        }
    }

    // Lấy user role customer đăng ký trong tháng/năm (của hoàng)
    @GetMapping("/new-by-month")
    public ResponseEntity<List<UserDTO>> getNewUsersByMonth(@RequestParam int month, @RequestParam int year) {
        List<UserDTO> users = userService.findNewUsersByMonth(month, year);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/recent-userbooking")
    public ResponseEntity<List<UserDTO>> getRecentBookingUsers(@RequestParam(defaultValue = "5") int size) {
        List<UserDTO> users = bookingService.findRecentBookingUsers(size);
        return ResponseEntity.ok(users);
    }

    // --- PUBLIC ENDPOINT: Lấy thông tin user public theo ID (không cần xác thực) ---
    @GetMapping("/public/{id}")
    public ResponseEntity<?> getUserPublic(@PathVariable Integer id) {
        try {
            UserDTO userDTO = userService.findById(id);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông tin user public ID: {} - {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Không tìm thấy người dùng với ID: " + id));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/bookings/{id}/refund")
    public ResponseEntity<?> refundDeposit(@PathVariable Integer id) {
        return paymentService.refundDeposit(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/bookings/{id}/payout")
    public ResponseEntity<?> payoutSupplier(@PathVariable Integer id) {
        return paymentService.payoutSupplier(id);
    }

    // API cho admin: Lấy danh sách xe chờ duyệt
    @GetMapping("/admin/pending-cars")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingCars(Authentication authentication) {
        logger.info("Admin yêu cầu lấy danh sách xe chờ duyệt từ IP: {}", getClientIp(authentication));
        try {
            List<Car> pendingCars = carRepository.findByStatus_StatusNameAndIsDeletedFalse("pending_approval");
            List<CarDTO> carDTOs = pendingCars.stream()
                    .map(carMapper::toDTO)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", carDTOs);
            response.put("total", carDTOs.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách xe chờ duyệt: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy danh sách xe chờ duyệt: " + e.getMessage()));
        }
    }

    // API cho admin: Duyệt xe (chuyển từ pending_approval sang available)
    @PutMapping("/admin/approve-car/{carId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveCar(@PathVariable Integer carId, Authentication authentication) {
        logger.info("Admin yêu cầu duyệt xe ID: {} từ IP: {}", carId, getClientIp(authentication));
        try {
            Car car = carRepository.findById(carId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy xe với ID: " + carId));
            
            if (!"pending_approval".equals(car.getStatus().getStatusName())) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Xe không ở trạng thái chờ duyệt"));
            }
            
            Status availableStatus = statusRepository.findByStatusName("available")
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy trạng thái available"));
            
            car.setStatus(availableStatus);
            carRepository.save(car);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã duyệt xe thành công");
            response.put("car", carMapper.toDTO(car));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Lỗi khi duyệt xe ID: {} - {}", carId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi duyệt xe: " + e.getMessage()));
        }
    }

    // API cho admin: Từ chối xe (chuyển từ pending_approval sang unavailable)
    @PutMapping("/admin/reject-car/{carId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectCar(@PathVariable Integer carId, @RequestParam(required = false) String reason, Authentication authentication) {
        logger.info("Admin yêu cầu từ chối xe ID: {} từ IP: {}", carId, getClientIp(authentication));
        try {
            Car car = carRepository.findById(carId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy xe với ID: " + carId));
            
            if (!"pending_approval".equals(car.getStatus().getStatusName())) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Xe không ở trạng thái chờ duyệt"));
            }
            
            Status unavailableStatus = statusRepository.findByStatusName("unavailable")
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy trạng thái unavailable"));
            
            car.setStatus(unavailableStatus);
            carRepository.save(car);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã từ chối xe thành công");
            response.put("reason", reason != null ? reason : "Không có lý do cụ thể");
            response.put("car", carMapper.toDTO(car));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Lỗi khi từ chối xe ID: {} - {}", carId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi từ chối xe: " + e.getMessage()));
        }
    }

    // API cho admin: Lấy thống kê dashboard
    @GetMapping("/admin/dashboard-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDashboardStats(Authentication authentication) {
        logger.info("Admin yêu cầu lấy thống kê dashboard từ IP: {}", getClientIp(authentication));
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Tổng số người dùng
            stats.put("totalUsers", userRepository.countByIsDeletedFalse());
            
            // Tổng số xe
            stats.put("totalCars", carRepository.countByIsDeletedFalse());
            
            // Tổng số đơn thuê
            stats.put("totalBookings", bookingService.count());
            
            // Tổng doanh thu
            stats.put("totalRevenue", bookingService.calculateTotalRevenue());
            
            // Số xe chờ duyệt
            stats.put("pendingApprovals", carRepository.countByStatus_StatusNameAndIsDeletedFalse("pending_approval"));
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thống kê dashboard: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy thống kê dashboard: " + e.getMessage()));
        }
    }
}