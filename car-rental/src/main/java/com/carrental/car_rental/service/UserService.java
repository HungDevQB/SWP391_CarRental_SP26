package com.carrental.car_rental.service;

import com.carrental.car_rental.dto.CreateUserDTO;
import com.carrental.car_rental.dto.UpdateUserDTO;
import com.carrental.car_rental.dto.UserDTO;
import com.carrental.car_rental.dto.ToggleUserStatusRequest;
import com.carrental.car_rental.entity.*;
import com.carrental.car_rental.mapper.UserMapper;
import com.carrental.car_rental.mapper.UserDetailMapper;
import com.carrental.car_rental.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.carrental.car_rental.service.UserSessionService;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final UserDetailRepository userDetailRepository;
    private final RoleRepository roleRepository;
    private final StatusRepository statusRepository;
    private final CountryCodeRepository countryCodeRepository;
    private final LanguageRepository languageRepository;
    private final UserMapper userMapper;
    private final UserDetailMapper userDetailMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final UserSessionService userSessionService;
    

    public UserDTO findById(Integer id) {
        User user = userRepository.findById(id)
                .filter(u -> !u.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + id));
        UserDTO dto = userMapper.toDto(user);
        userDetailRepository.findByUserIdAndIsDeletedFalse(id)
                .ifPresent(ud -> dto.setUserDetail(userDetailMapper.toDTO(ud)));
        return dto;
    }

    public List<UserDTO> findAll() {
        return userRepository.findAllByIsDeletedFalse().stream()
                .map(user -> {
                    UserDTO dto = userMapper.toDto(user);
                    userDetailRepository.findByUserIdAndIsDeletedFalse(user.getId())
                            .ifPresent(ud -> dto.setUserDetail(userDetailMapper.toDTO(ud)));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<UserDTO> findByRoleId(Integer roleId) {
        return userRepository.findByRoleIdAndIsDeletedFalse(roleId).stream()
                .map(user -> {
                    UserDTO dto = userMapper.toDto(user);
                    userDetailRepository.findByUserIdAndIsDeletedFalse(user.getId())
                            .ifPresent(ud -> dto.setUserDetail(userDetailMapper.toDTO(ud)));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<UserDTO> findByCountryCode(String countryCode) {
        CountryCode code = countryCodeRepository.findById(countryCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid country code: " + countryCode));
        return userRepository.findByCountryCodeAndIsDeletedFalse(code).stream()
                .map(user -> {
                    UserDTO dto = userMapper.toDto(user);
                    userDetailRepository.findByUserIdAndIsDeletedFalse(user.getId())
                            .ifPresent(ud -> dto.setUserDetail(userDetailMapper.toDTO(ud)));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public Optional<UserDTO> findByEmail(String email) {
        return userRepository.findByEmailAndIsDeletedFalse(email)
                .map(user -> {
                    UserDTO dto = userMapper.toDto(user);
                    userDetailRepository.findByUserIdAndIsDeletedFalse(user.getId())
                            .ifPresent(ud -> dto.setUserDetail(userDetailMapper.toDTO(ud)));
                    return dto;
                });
    }  
      public Optional<UserDTO> findByUsername(String username) {
        return userRepository.findByUsername(username)
                .filter(user -> !user.getIsDeleted())
                .map(user -> {
                    UserDTO dto = userMapper.toDto(user);
                    userDetailRepository.findByUserIdAndIsDeletedFalse(user.getId())
                            .ifPresent(ud -> dto.setUserDetail(userDetailMapper.toDTO(ud)));
                    return dto;
                });
    }


    public UserDTO save(CreateUserDTO dto) {
        userRepository.findByEmailAndIsDeletedFalse(dto.getEmail())
                .ifPresent(u -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists: " + dto.getEmail());
                });
        validateRelations(dto.getRoleId(), dto.getStatusId(), dto.getCountryCode(), dto.getPreferredLanguage());
        User user = userMapper.toEntity(dto);

        user.setPasswordHash(passwordEncoder.encode(
                dto.getPassword() == null ? UUID.randomUUID().toString() : dto.getPassword()
        ));
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        user.setIsDeleted(false);

        // preferredLanguage
        if (dto.getPreferredLanguage() != null) {
            Language lang = languageRepository.findById(dto.getPreferredLanguage())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid preferredLanguage: " + dto.getPreferredLanguage()));
            user.setPreferredLanguage(lang);
        } else {
            user.setPreferredLanguage(null);
        }

        User savedUser = userRepository.save(user);

        // Tạo hoặc update UserDetail
        UserDetail userDetail = createOrUpdateUserDetail(savedUser, dto);

        // Map sang UserDTO & gắn UserDetailDTO
        UserDTO result = userMapper.toDto(savedUser);
        result.setUserDetail(userDetailMapper.toDTO(userDetail));
        return result;
    }

    private UserDetail createOrUpdateUserDetail(User user, CreateUserDTO dto) {
        Optional<UserDetail> userDetailOptional = userDetailRepository.findById(user.getId());
        UserDetail userDetail;
        if (userDetailOptional.isPresent()) {
            userDetail = userDetailOptional.get();
            log.info("[UserDetail] Updating EXISTING UserDetail: id={}, instance={}, hash={}", userDetail.getId(), System.identityHashCode(userDetail), userDetail);
        } else {
            userDetail = new UserDetail();
            userDetail.setId(user.getId());
            userDetail.setUser(user);
            userDetail.setIsDeleted(false);
            userDetail.setAddress("");
            log.info("[UserDetail] Creating NEW UserDetail: id={}, instance={}, hash={}", userDetail.getId(), System.identityHashCode(userDetail), userDetail);
        }
        userDetail.setName(dto.getUserDetail() != null && dto.getUserDetail().getFullName() != null
                ? dto.getUserDetail().getFullName() : dto.getUsername());
        userDetail.setAddress(dto.getUserDetail() != null && dto.getUserDetail().getAddress() != null
                ? dto.getUserDetail().getAddress() : "");
        userDetail.setTaxcode(dto.getUserDetail() != null ? dto.getUserDetail().getTaxcode() : null);
        userDetail.setIsDeleted(false);

        // Thêm log chi tiết trước khi save
        log.info("[UserDetail] Trước khi save: userId={}, userDetail instance={}, user instance={}, userDetail.getUser().getId()={}, userDetail.getId()={}, isDeleted={}, name={}, address={}, taxcode={}",
                user.getId(),
                System.identityHashCode(userDetail),
                System.identityHashCode(user),
                userDetail.getUser() != null ? userDetail.getUser().getId() : null,
                userDetail.getId(),
                userDetail.getIsDeleted(),
                userDetail.getName(),
                userDetail.getAddress(),
                userDetail.getTaxcode()
        );

        UserDetail saved = userDetailRepository.save(userDetail);

        // Thêm log chi tiết sau khi save
        log.info("[UserDetail] Sau khi save: userId={}, userDetail instance={}, user instance={}, userDetail.getUser().getId()={}, userDetail.getId()={}, isDeleted={}, name={}, address={}, taxcode={}",
                user.getId(),
                System.identityHashCode(saved),
                System.identityHashCode(user),
                saved.getUser() != null ? saved.getUser().getId() : null,
                saved.getId(),
                saved.getIsDeleted(),
                saved.getName(),
                saved.getAddress(),
                saved.getTaxcode()
        );
        return saved;
    }    public UserDTO update(Integer id, UpdateUserDTO dto) {
        log.info("Updating user with ID: {}", id);
        
        if (id == null) {
            log.error("Input ID is NULL");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The given id must not be null");
        }
        
        User existingUser = userRepository.findById(id)
                .filter(u -> !u.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + id));
        
        userRepository.findByEmailAndIsDeletedFalse(dto.getEmail())
                .filter(u -> !u.getId().equals(id))
                .ifPresent(u -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists: " + dto.getEmail());
                });
        validateRelations(dto.getRoleId(), dto.getStatusId(), dto.getCountryCode(), dto.getPreferredLanguage());

        
        // Use mapper to create updated entity, then set ID and other preserved fields
        User updatedUser = userMapper.toEntity(dto);
        updatedUser.setId(id);  // Ensure ID is set
        updatedUser.setPasswordHash(dto.getPassword() != null && !dto.getPassword().isBlank()
                ? passwordEncoder.encode(dto.getPassword())
                : existingUser.getPasswordHash());
        updatedUser.setCreatedAt(existingUser.getCreatedAt());
        updatedUser.setUpdatedAt(Instant.now());
        updatedUser.setLastLogin(existingUser.getLastLogin());
        updatedUser.setIsDeleted(false);

        log.info("[UserService][Update] Before save User: ID={}, instance={}, username={}", updatedUser.getId(), System.identityHashCode(updatedUser), updatedUser.getUsername());
        userRepository.save(updatedUser);
        log.info("[UserService][Update] After save User: ID={}, instance={}, username={}", updatedUser.getId(), System.identityHashCode(updatedUser), updatedUser.getUsername());
        
        Optional<UserDetail> userDetailOptional = userDetailRepository.findByUserIdAndIsDeletedFalse(id);
        log.info("[UserService][Update] UserDetail lookup for ID={}: found={}", id, userDetailOptional.isPresent());
        UserDetail userDetail;
        if (userDetailOptional.isPresent()) {
            userDetail = userDetailOptional.get();
            log.info("[UserService][Update] Updating EXISTING UserDetail: id={}, instance={}, hash={}", userDetail.getId(), System.identityHashCode(userDetail), userDetail);
        } else {
            userDetail = new UserDetail();
            userDetail.setUser(updatedUser);  // This will set the id via @MapsId
            userDetail.setId(updatedUser.getId());
            userDetail.setIsDeleted(false);
            log.info("[UserService][Update] Creating NEW UserDetail: id={}, instance={}, hash={}", userDetail.getId(), System.identityHashCode(userDetail), userDetail);
        }
        userDetail.setName(dto.getUserDetail() != null && dto.getUserDetail().getFullName() != null
                ? dto.getUserDetail().getFullName() : (userDetail.getName() != null ? userDetail.getName() : ""));
        userDetail.setAddress(dto.getUserDetail() != null && dto.getUserDetail().getAddress() != null
                ? dto.getUserDetail().getAddress() : (userDetail.getAddress() != null ? userDetail.getAddress() : ""));
        userDetail.setTaxcode(dto.getUserDetail() != null ? dto.getUserDetail().getTaxcode() : userDetail.getTaxcode());
        
        // Thêm log chi tiết trước khi save
        log.info("[UserService][Update] UserDetail trước khi save: userId={}, userDetail instance={}, user instance={}, userDetail.getUser().getId()={}, userDetail.getId()={}, isDeleted={}, name={}, address={}, taxcode={}",
                updatedUser.getId(),
                System.identityHashCode(userDetail),
                System.identityHashCode(updatedUser),
                userDetail.getUser() != null ? userDetail.getUser().getId() : null,
                userDetail.getId(),
                userDetail.getIsDeleted(),
                userDetail.getName(),
                userDetail.getAddress(),
                userDetail.getTaxcode()
        );
        
        UserDetail savedDetail = userDetailRepository.save(userDetail);
        
        // Thêm log chi tiết sau khi save
        log.info("[UserService][Update] UserDetail sau khi save: userId={}, userDetail instance={}, user instance={}, userDetail.getUser().getId()={}, userDetail.getId()={}, isDeleted={}, name={}, address={}, taxcode={}",
                updatedUser.getId(),
                System.identityHashCode(savedDetail),
                System.identityHashCode(updatedUser),
                savedDetail.getUser() != null ? savedDetail.getUser().getId() : null,
                savedDetail.getId(),
                savedDetail.getIsDeleted(),
                savedDetail.getName(),
                savedDetail.getAddress(),
                savedDetail.getTaxcode()
        );

        UserDTO result = userMapper.toDto(updatedUser);
        result.setUserDetail(userDetailMapper.toDTO(savedDetail));
        return result;
    }

    public void delete(Integer id) {
        User user = userRepository.findById(id)
                .filter(u -> !u.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + id));
        user.setIsDeleted(true);
        userRepository.save(user);
        userDetailRepository.findByUserIdAndIsDeletedFalse(id)
                .ifPresent(ud -> {
                    ud.setIsDeleted(true);
                    userDetailRepository.save(ud);
                });
    }
    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword) {
        try {
            log.info("Changing password for user: {}", username);
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with username: " + username));
            
            if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không đúng");
            }
            
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            
            log.info("Password changed successfully for user: {}", username);
        } catch (Exception e) {
            log.error("Error changing password for user {}: {}", username, e.getMessage());
            throw e;
        }
    }private void validateRelations(Integer roleId, Integer statusId, String countryCode, String preferredLanguage) {
        if (roleId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The given id must not be null - roleId is null");
        }
        roleRepository.findById(roleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid roleId: " + roleId));
        
        if (statusId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The given id must not be null - statusId is null");
        }
        statusRepository.findById(statusId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid statusId: " + statusId));
        
        if (countryCode == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The given id must not be null - countryCode is null");
        }
        countryCodeRepository.findById(countryCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid countryCode: " + countryCode));
        
        if (preferredLanguage != null) {
            languageRepository.findById(preferredLanguage)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid preferredLanguage: " + preferredLanguage));
        }
    }

    public void updateUserDetail(Integer userId, String fullName, String address, String taxCode) {
        // Tìm hoặc tạo UserDetail
        UserDetail userDetail = userDetailRepository.findById(userId)
                .orElse(new UserDetail());

        userDetail.setId(userId);
        userDetail.setName(fullName);
        userDetail.setAddress(address);
        userDetail.setTaxcode(taxCode);

        userDetailRepository.save(userDetail);
    }
    // Lấy danh sách người dùng có phân trang và lọc (của hoàng)
    public Page<UserDTO> findUsersWithFilters(String roleName, String statusName, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        
        // Nếu roleName là "all" hoặc null, chỉ lấy supplier và customer
        final String filterRoleName = (roleName != null && !roleName.equals("all")) ? roleName : null;
        
        // Lấy tất cả user trước để tính tổng số
        List<User> allUsers = userRepository.findAllByIsDeletedFalse();
        List<User> allFilteredUsers = allUsers.stream()
                .filter(user -> {
                    // Filter theo role nếu có
                    if (filterRoleName != null && !user.getRole().getRoleName().equals(filterRoleName)) {
                        return false;
                    }
                    // Filter theo status nếu có
                    if (statusName != null && !statusName.equals("all") && !user.getStatus().getStatusName().equals(statusName)) {
                        return false;
                    }
                    // Loại bỏ admin
                    if (user.getRole().getRoleName().equals("admin")) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
        
        // Tính toán phân trang
        int totalElements = allFilteredUsers.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        // Lấy user cho trang hiện tại
        int startIndex = (page - 1) * size;
        int endIndex = Math.min(startIndex + size, totalElements);
        List<User> pageUsers = allFilteredUsers.subList(startIndex, endIndex);
        
        // Tạo Page object
        Page<User> userPage = new PageImpl<>(pageUsers, pageable, totalElements);
        
        return userPage.map(user -> {
            UserDTO dto = userMapper.toDto(user);
            userDetailRepository.findByUserIdAndIsDeletedFalse(user.getId())
                    .ifPresent(ud -> dto.setUserDetail(userDetailMapper.toDTO(ud)));
            boolean isOnline = userSessionService.hasActiveSession(user);
            dto.setOnline(isOnline);
            return dto;
        });
    }

    // Chuyển đổi trạng thái người dùng (của hoàng)
    public UserDTO toggleUserStatus(Integer userId, ToggleUserStatusRequest request) {
        log.info("=== BẮT ĐẦU TOGGLE USER STATUS TRONG SERVICE ===");
        log.info("User ID: {}", userId);
        log.info("Request: reason={}", request.getReason());
        
        try {
            log.info("Tìm user trong database với ID: {}", userId);
            User user = userRepository.findById(userId)
                    .filter(u -> !u.getIsDeleted())
                    .orElseThrow(() -> {
                        log.error("Không tìm thấy user với ID: {} hoặc user đã bị xóa", userId);
                        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với id: " + userId);
                    });
            
            log.info("Tìm thấy user: username={}, currentStatus={}", user.getUsername(), user.getStatus().getStatusName());
            
            // Xác định status mới dựa trên status hiện tại
            String newStatusName;
            if (user.getStatus().getStatusName().equals("active")) {
                newStatusName = "blocked"; // Chặn user
            } else {
                newStatusName = "active"; // Mở chặn user
            }
            
            log.info("Tìm status mới trong database: {}", newStatusName);
            Status newStatus = statusRepository.findByStatusName(newStatusName)
                    .orElseThrow(() -> {
                        log.error("Không tìm thấy status: {}", newStatusName);
                        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên trạng thái không hợp lệ: " + newStatusName);
                    });
            
            log.info("Tìm thấy status mới: {}", newStatus.getStatusName());
            
            String oldStatusName = user.getStatus().getStatusName();
            log.info("Cập nhật status từ '{}' thành '{}'", oldStatusName, newStatus.getStatusName());
            
            user.setStatus(newStatus);
            user.setUpdatedAt(Instant.now());
            
            log.info("Lưu user vào database...");
            userRepository.save(user);
            log.info("Đã lưu user thành công");
            
            // Gửi email thông báo
            try {
                log.info("Bắt đầu gửi email thông báo...");
                String subject = newStatus.getStatusName().equals("blocked") ? "Tài khoản của bạn đã bị chặn" : "Tài khoản của bạn đã được mở chặn";
                String message = newStatus.getStatusName().equals("blocked") 
                    ? String.format("Tài khoản của bạn đã bị chặn. Lý do: %s", request.getReason() != null ? request.getReason() : "Không có lý do cụ thể")
                    : "Tài khoản của bạn đã được mở chặn và có thể sử dụng bình thường.";
                
                log.info("Email subject: {}", subject);
                log.info("Email message: {}", message);
                
                emailService.sendEmail(user.getEmail(), subject, message);
                log.info("Đã gửi email thành công đến: {}", user.getEmail());
            } catch (Exception emailException) {
                log.error("Lỗi khi gửi email: {}", emailException.getMessage());
                log.error("Stack trace email error:", emailException);
                // Không throw exception vì việc gửi email không quan trọng bằng việc cập nhật status
            }
            
            UserDTO result = userMapper.toDto(user);
            log.info("Chuyển đổi user thành DTO thành công");
            log.info("=== KẾT THÚC TOGGLE USER STATUS TRONG SERVICE (THÀNH CÔNG) ===");
            return result;
            
        } catch (ResponseStatusException e) {
            log.error("=== LỖI ResponseStatusException TRONG TOGGLE USER STATUS ===");
            log.error("User ID: {}", userId);
            log.error("Exception: {}", e.getMessage());
            log.error("HTTP Status: {}", e.getStatusCode());
            log.error("=== KẾT THÚC LỖI ResponseStatusException ===");
            throw e;
        } catch (Exception e) {
            log.error("=== LỖI KHÔNG XÁC ĐỊNH TRONG TOGGLE USER STATUS ===");
            log.error("User ID: {}", userId);
            log.error("Exception type: {}", e.getClass().getSimpleName());
            log.error("Exception message: {}", e.getMessage());
            log.error("Stack trace:", e);
            log.error("=== KẾT THÚC LỖI KHÔNG XÁC ĐỊNH ===");
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật trạng thái người dùng", e);
        }
    }

    // Lấy user role customer đăng ký trong tháng/năm (của hoàng)
    public List<UserDTO> findNewUsersByMonth(int month, int year) {
        return userRepository.findByRoleNameAndCreatedAtInMonth("customer", month, year)
            .stream()
            .map(userMapper::toDto)
            .collect(Collectors.toList());
    }

    public List<UserDTO> getRecentBookingUsers(int size) {
        // Use BookingRepository's findRecentBookingUsers query
        Pageable pageable = PageRequest.of(0, size);
        List<User> recentUsers = userRepository.findRecentBookingUsers(pageable);
        return recentUsers.stream()
                .map(user -> {
                    UserDTO dto = userMapper.toDto(user);
                    userDetailRepository.findByUserIdAndIsDeletedFalse(user.getId())
                        .ifPresent(ud -> dto.setUserDetail(userDetailMapper.toDTO(ud)));
                    return dto;
                })
                .collect(Collectors.toList());
    }
}