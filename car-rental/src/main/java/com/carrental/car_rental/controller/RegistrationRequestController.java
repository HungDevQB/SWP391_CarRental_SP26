package com.carrental.car_rental.controller;

import com.carrental.car_rental.entity.RegistrationRequest;
import com.carrental.car_rental.service.RegistrationRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.carrental.car_rental.dto.CreateUserDTO;
import com.carrental.car_rental.dto.UserDetailDTO;
import com.carrental.car_rental.service.UserService;
import com.carrental.car_rental.service.EmailService;
import com.carrental.car_rental.repository.RoleRepository;
import com.carrental.car_rental.repository.StatusRepository;
import com.carrental.car_rental.repository.CountryCodeRepository;
import com.carrental.car_rental.repository.UserRepository;
import com.carrental.car_rental.repository.UserDetailRepository;
import com.carrental.car_rental.entity.Role;
import com.carrental.car_rental.entity.Status;
import com.carrental.car_rental.entity.CountryCode;
import com.carrental.car_rental.entity.User;
import com.carrental.car_rental.entity.UserDetail;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import com.carrental.car_rental.service.AuthService;


@RestController
@RequestMapping("/api/registration-requests")
public class RegistrationRequestController {
    @Autowired
    private RegistrationRequestService service;
    @Autowired
    private UserService userService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private AuthService authService;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private StatusRepository statusRepository;
    @Autowired
    private CountryCodeRepository countryCodeRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserDetailRepository userDetailRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private final String UPLOAD_DIR = "uploads/";

    @PostMapping
    public ResponseEntity<?> createRequest(
            @RequestParam String fullName,
            @RequestParam String idNumber,
            @RequestParam String address,
            @RequestParam String phoneNumber,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam MultipartFile carDocuments,
            @RequestParam MultipartFile businessLicense,
            @RequestParam MultipartFile driverLicense
    ) throws IOException {
        // Log các trường nhận được
        System.out.println("[RegistrationRequestController] Nhận đăng ký chủ xe:");
        System.out.println("  fullName: " + fullName);
        System.out.println("  idNumber: " + idNumber);
        System.out.println("  address: " + address);
        System.out.println("  phoneNumber: " + phoneNumber);
        System.out.println("  email: " + email);
        System.out.println("  password: " + password);
        System.out.println("  carDocuments: " + (carDocuments != null ? carDocuments.getOriginalFilename() : null));
        System.out.println("  businessLicense: " + (businessLicense != null ? businessLicense.getOriginalFilename() : null));
        System.out.println("  driverLicense: " + (driverLicense != null ? driverLicense.getOriginalFilename() : null));
        // Lưu file
        String carDocPath = saveFile(carDocuments);
        String businessLicensePath = saveFile(businessLicense);
        String driverLicensePath = saveFile(driverLicense);

        RegistrationRequest req = new RegistrationRequest();
        req.setFullName(fullName);
        req.setIdNumber(idNumber);
        req.setAddress(address);
        req.setPhoneNumber(phoneNumber);
        req.setEmail(email);
        req.setPassword(password);
        req.setCarDocuments(carDocPath);
        req.setBusinessLicense(businessLicensePath);
        req.setDriverLicense(driverLicensePath);
        req.setStatus("pending");

        service.save(req);
        return ResponseEntity.ok("Đã gửi yêu cầu đăng ký, chờ admin duyệt.");
    }

    @GetMapping
    public List<RegistrationRequest> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Optional<RegistrationRequest> req = service.findById(id);
        return req.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        Optional<RegistrationRequest> reqOpt = service.findById(id);
        if (reqOpt.isPresent()) {
            RegistrationRequest req = reqOpt.get();
            req.setStatus("approved");
            service.save(req);

            // Tạo user mới từ thông tin hồ sơ
            String passwordToUse = (req.getPassword() != null && !req.getPassword().isEmpty()) ? req.getPassword() : generateTempPassword();
            CreateUserDTO dto = new CreateUserDTO();
            dto.setUsername(req.getEmail());
            dto.setEmail(req.getEmail());
            dto.setPassword(passwordToUse);
            // Tách country code và số điện thoại
            String fullPhone = req.getPhoneNumber();
            String countryCode = "+84";
            if (fullPhone != null && fullPhone.startsWith("+") && fullPhone.length() > 3) {
                countryCode = fullPhone.substring(0, 3); // ví dụ: +84
            }
            dto.setCountryCode(countryCode);
            dto.setPhone(fullPhone);
            dto.setRoleId(2); // Chủ xe
            dto.setStatusId(8); // Đã duyệt
            dto.setPreferredLanguage("vi"); // hoặc null nếu không dùng
            UserDetailDTO detailDTO = new UserDetailDTO();
            detailDTO.setFullName(req.getFullName());
            detailDTO.setAddress(req.getAddress());
            dto.setUserDetail(detailDTO);

            // Gọi service tạo user mới (đã xử lý đúng transaction, mapping, cascade)
            try {
                authService.register(dto); // <-- Sửa lại gọi authService.register thay vì userService.save
            } catch (Exception e) {
                System.out.println("[RegistrationRequestController] LỖI khi tạo user: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(500).body("Lỗi khi tạo user: " + e.getMessage());
            }

            // Gửi email thông báo
            String subject = "Tài khoản chủ xe của bạn đã được duyệt";
            String body;
            if (req.getPassword() != null && !req.getPassword().isEmpty()) {
                body = "Xin chào " + req.getFullName() + ",\n\n" +
                        "Tài khoản chủ xe của bạn đã được duyệt. Bạn có thể đăng nhập bằng email và mật khẩu đã đăng ký.\n\n" +
                        "Trân trọng,\nĐội ngũ Car Rental";
            } else {
                body = "Xin chào " + req.getFullName() + ",\n\n" +
                        "Tài khoản chủ xe của bạn đã được duyệt.\n" +
                        "Thông tin đăng nhập:\n" +
                        "Email: " + req.getEmail() + "\n" +
                        "Vui lòng đăng nhập và đổi mật khẩu ngay sau khi đăng nhập.\n\n" +
                        "Trân trọng,\nĐội ngũ Car Rental";
            }
            emailService.sendEmail(req.getEmail(), subject, body);

            return ResponseEntity.ok("Đã duyệt và tạo tài khoản thành công!");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        Optional<RegistrationRequest> reqOpt = service.findById(id);
        if (reqOpt.isPresent()) {
            RegistrationRequest req = reqOpt.get();
            req.setStatus("rejected");
            service.save(req);
            // Gửi email thông báo từ chối
            String subject = "Yêu cầu đăng ký chủ xe bị từ chối";
            String body = "Xin chào " + req.getFullName() + ",\n\n" +
                    "Rất tiếc, yêu cầu đăng ký chủ xe của bạn đã bị từ chối.\n" +
                    "Nếu cần thêm thông tin, vui lòng liên hệ với chúng tôi.\n\n" +
                    "Trân trọng,\nĐội ngũ Car Rental";
            emailService.sendEmail(req.getEmail(), subject, body);
            return ResponseEntity.ok("Đã từ chối yêu cầu và gửi email thông báo.");
        }
        return ResponseEntity.notFound().build();
    }

    private String saveFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) return null;
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        // Lấy đường dẫn tuyệt đối tới thư mục uploads
        String uploadDir = new File("uploads").getAbsolutePath();
        File dest = new File(uploadDir, filename);
        System.out.println("Saving file to: " + dest.getAbsolutePath());
        dest.getParentFile().mkdirs();
        file.transferTo(dest);
        // Trả về đường dẫn tương đối để lưu vào DB
        return "uploads/" + filename;
    }

    private String generateTempPassword() {
        // Sinh mật khẩu tạm thời: 10 ký tự, có chữ hoa, số, ký tự đặc biệt
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
        StringBuilder sb = new StringBuilder();
        java.util.Random rand = new java.util.Random();
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(rand.nextInt(chars.length())));
        }
        return sb.toString();
    }
} 