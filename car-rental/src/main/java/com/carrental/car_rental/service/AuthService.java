package com.carrental.car_rental.service;

import com.carrental.car_rental.config.JwtTokenProvider;
import com.carrental.car_rental.dto.AuthRequest;
import com.carrental.car_rental.dto.AuthResponse;
import com.carrental.car_rental.dto.CreateUserDTO;
import com.carrental.car_rental.dto.UserDTO;
import com.carrental.car_rental.entity.*;
import com.carrental.car_rental.mapper.UserMapper;
import com.carrental.car_rental.mapper.UserDetailMapper;
import com.carrental.car_rental.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.carrental.car_rental.service.UserSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import com.carrental.car_rental.entity.PhoneOtp;
import com.carrental.car_rental.repository.PhoneOtpRepository;
import com.carrental.car_rental.service.SmsService;

import java.time.Instant;
import java.sql.Timestamp;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@Transactional
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserDetailRepository userDetailRepository;
    private final RoleRepository roleRepository;
    private final StatusRepository statusRepository;
    private final CountryCodeRepository countryCodeRepository;
    private final LanguageRepository languageRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;
    private final UserDetailMapper userDetailMapper;
    private final UserSessionService userSessionService;
    private final PhoneOtpRepository phoneOtpRepository;
    private final SmsService smsService;

    @Autowired
    public AuthService(@Lazy AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       UserDetailRepository userDetailRepository,
                       RoleRepository roleRepository,
                       StatusRepository statusRepository,
                       CountryCodeRepository countryCodeRepository,
                       LanguageRepository languageRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       UserMapper userMapper,
                       UserDetailMapper userDetailMapper,
                       UserSessionService userSessionService,
                       PhoneOtpRepository phoneOtpRepository,
                       SmsService smsService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.userDetailRepository = userDetailRepository;
        this.roleRepository = roleRepository;
        this.statusRepository = statusRepository;
        this.countryCodeRepository = countryCodeRepository;
        this.languageRepository = languageRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userMapper = userMapper;
        this.userDetailMapper = userDetailMapper;
        this.userSessionService = userSessionService;
        this.phoneOtpRepository = phoneOtpRepository;
        this.smsService = smsService;
    }

    public AuthResponse login(AuthRequest authRequest) {
        logger.info("Xử lý đăng nhập cho username: {}", authRequest.getUsername());
        User user = userRepository.findByUsernameOrEmail(authRequest.getUsername(), authRequest.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));

        checkUserStatus(user);

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );
            user.setLastLogin(Instant.now());
            userRepository.save(user);

            String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole().getRoleName());
            long expiresAt = jwtTokenProvider.getExpirationDateFromToken(token).getTime();
            logger.info("Đăng nhập thành công cho username: {}", authRequest.getUsername());

            // Dọn dẹp session hết hạn trước khi kiểm tra đăng nhập đồng thời
            userSessionService.deactivateExpiredSessions(user);
            if (userSessionService.hasActiveSession(user)) {
                logger.warn("[LOGIN BLOCKED] Đăng nhập đồng thời bị chặn cho user: {}", user.getUsername());
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tài khoản đã đăng nhập ở nơi khác. Vui lòng đăng xuất trước khi đăng nhập mới.");
            }
            userSessionService.createOrUpdateSession(user, token, new Timestamp(expiresAt));

            return new AuthResponse(token, expiresAt, user.getRole().getRoleName(), user.getUsername(), user.getId());
        } catch (AuthenticationException e) {
            logger.warn("[LOGIN FAILED] Đăng nhập thất bại (sai mật khẩu?): {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tên người dùng hoặc mật khẩu không đúng");
        }
    }

    public UserDTO register(CreateUserDTO createUserDTO) {
        logger.info("Xử lý đăng ký cho username: {}", createUserDTO.getUsername());
        if (userRepository.existsByUsername(createUserDTO.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username đã tồn tại");
        }
        if (userRepository.existsByEmail(createUserDTO.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email đã tồn tại");
        }
        if (!PASSWORD_PATTERN.matcher(createUserDTO.getPassword()).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt");
        }

        User user = userMapper.toEntity(createUserDTO);
        user.setPasswordHash(passwordEncoder.encode(createUserDTO.getPassword()));
        user.setIsDeleted(false);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        Role role = roleRepository.findById(createUserDTO.getRoleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid roleId"));
        user.setRole(role);

        Status status = statusRepository.findById(createUserDTO.getStatusId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid statusId"));
        user.setStatus(status);

        Language language = languageRepository.findById(createUserDTO.getPreferredLanguage())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ngôn ngữ không hợp lệ"));
        user.setPreferredLanguage(language);

        // Lưu user trước
        User savedUser = userRepository.save(user);

        // Tạo và lưu UserDetail sau khi user đã được lưu
        UserDetail userDetail = new UserDetail();
        userDetail.setUser(savedUser);
        userDetail.setIsDeleted(false);
        if (createUserDTO.getUserDetail() != null) {
            userDetail.setName(createUserDTO.getUserDetail().getFullName() != null ? createUserDTO.getUserDetail().getFullName() : savedUser.getUsername());
            userDetail.setAddress(createUserDTO.getUserDetail().getAddress() != null ? createUserDTO.getUserDetail().getAddress() : "Unknown");
            userDetail.setTaxcode(createUserDTO.getUserDetail().getTaxcode());
        } else {
            userDetail.setName(savedUser.getUsername());
            userDetail.setAddress("Unknown");
            userDetail.setTaxcode(null);
        }
        userDetailRepository.save(userDetail);

        UserDTO result = userMapper.toDto(savedUser);
        result.setUserDetail(userDetailMapper.toDTO(userDetail));
        logger.info("Đăng ký thành công cho username: {}", createUserDTO.getUsername());
        return result;
    }

    public UserDTO findByEmail(String email) {
        logger.info("Tìm người dùng theo email: {}", email);
        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElse(null);
        if (user == null) {
            return null;
        }
        UserDTO dto = userMapper.toDto(user);
        userDetailRepository.findByUserIdAndIsDeletedFalse(user.getId())
                .ifPresent(ud -> dto.setUserDetail(userDetailMapper.toDTO(ud)));
        return dto;
    }

    public void updatePassword(String email, String newPassword) {
        logger.info("Cập nhật mật khẩu cho email: {}", email);
        if (!PASSWORD_PATTERN.matcher(newPassword).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt");
        }
        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        logger.info("Cập nhật mật khẩu thành công cho email: {}", email);
    }

    public synchronized AuthResponse loginWithGoogle(OAuth2User oAuth2User) {
        try {
            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");

            if (email == null) {
                logger.warn("Không tìm thấy email trong thông tin Google");
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email không được cung cấp bởi Google");
            }

            Optional<User> optionalUser = userRepository.findByEmailAndIsDeletedFalse(email);
            User user;

            if (optionalUser.isPresent()) {
                user = optionalUser.get();
                checkUserStatus(user);
            } else {
                logger.info("Đăng ký người dùng mới từ Google: {}", email);
                user = new User();
                String baseUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "") + "_" + UUID.randomUUID().toString().substring(0, 8);
                while (userRepository.existsByUsername(baseUsername)) {
                    baseUsername += "_" + UUID.randomUUID().toString().substring(0, 4);
                }
                user.setUsername(baseUsername);
                user.setEmail(email);
                user.setPasswordHash(UUID.randomUUID().toString());
                user.setIsDeleted(false);
                user.setCreatedAt(Instant.now());
                user.setUpdatedAt(Instant.now());
                user.setPhone("0000000000");

                CountryCode countryCode = countryCodeRepository.findById("+84")
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Country code +84 not found"));
                user.setCountryCode(countryCode);

                Language language = languageRepository.findById("vi")
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Language vi not found"));
                user.setPreferredLanguage(language);

                Role customerRole = roleRepository.findByRoleName("customer")
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role 'customer' not found"));
                user.setRole(customerRole);

                Status activeStatus = statusRepository.findByStatusName("active")
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status 'active' not found"));
                user.setStatus(activeStatus);

                user = userRepository.save(user);
                createUserDetail(user, name);
            }

            user.setLastLogin(Instant.now());
            userRepository.save(user);

            String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole().getRoleName());
            long expiresAt = jwtTokenProvider.getExpirationDateFromToken(token).getTime();
            logger.info("Đăng nhập Google thành công cho email: {}", email);
            return new AuthResponse(token, expiresAt, user.getRole().getRoleName(), user.getUsername(), user.getId());
        } catch (ResponseStatusException e) {
            logger.error("Lỗi xử lý đăng nhập Google: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Lỗi không xác định khi xử lý đăng nhập Google: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi xử lý đăng nhập Google", e);
        }
    }

    private void checkUserStatus(User user) {
        if (user.getIsDeleted() || !"active".equalsIgnoreCase(user.getStatus().getStatusName())) {
            logger.warn("Người dùng {} không hoạt động hoặc đã bị xóa", user.getUsername());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Người dùng không hoạt động hoặc đã bị xóa");
        }
    }

    private UserDetail createUserDetail(User user, String name) {
        UserDetail userDetail = new UserDetail();
        userDetail.setUser(user);
        userDetail.setIsDeleted(false);
        userDetail.setAddress("Unknown"); // Default address
        userDetail.setName(name != null ? name : user.getUsername());
        logger.info("Creating new UserDetail for userId: {}", user.getId());
        return userDetailRepository.save(userDetail);
    }

    public void logout(User user) {
        userSessionService.invalidateSessionByUser(user);
        // ... các thao tác khác nếu cần ...
    }

    public void sendPhoneOtp(String phone) {
    String otp = String.format("%06d", (int)(Math.random() * 1000000));
    logger.info("[OTP-DEBUG] Nhận request gửi OTP | Số điện thoại: {} | OTP: {} | Thời gian: {}", phone, otp, java.time.LocalDateTime.now());

    PhoneOtp phoneOtp = new PhoneOtp();
    phoneOtp.setPhone(phone);
    phoneOtp.setOtp(otp);
    phoneOtp.setCreatedAt(Instant.now());
    phoneOtp.setVerified(false);
    phoneOtpRepository.save(phoneOtp);
    smsService.sendOtp(phone, otp);
    }

    public boolean verifyPhoneOtp(String phone, String otp) {
        Optional<PhoneOtp> latestOtp = phoneOtpRepository.findTopByPhoneOrderByCreatedAtDesc(phone);
        if (latestOtp.isPresent()) {
            PhoneOtp phoneOtp = latestOtp.get();
            if (!phoneOtp.isVerified()
                && phoneOtp.getOtp().equals(otp)
                && phoneOtp.getCreatedAt().isAfter(Instant.now().minusSeconds(300))) {
                phoneOtp.setVerified(true);
                phoneOtpRepository.save(phoneOtp);
                return true;
            }
        }
        return false;
    }
}