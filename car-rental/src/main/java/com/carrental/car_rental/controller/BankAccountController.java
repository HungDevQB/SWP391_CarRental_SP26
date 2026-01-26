package com.carrental.car_rental.controller;

import com.carrental.car_rental.entity.BankAccount;
import com.carrental.car_rental.service.BankAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.carrental.car_rental.mapper.BankAccountMapper;
import com.carrental.car_rental.dto.BankAccountDTO;
import com.carrental.car_rental.repository.UserRepository;

@RestController
@RequestMapping("/api/bank-accounts")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class BankAccountController {
    
    private final BankAccountService bankAccountService;
    private final BankAccountMapper bankAccountMapper;
    private final UserRepository userRepository;
    
    // Tạo tài khoản ngân hàng mới
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SUPPLIER')")
    public ResponseEntity<?> createBankAccount(@Valid @RequestBody BankAccount bankAccount, 
                                               Authentication authentication) {
        log.info("Yêu cầu tạo tài khoản ngân hàng mới từ user: {}", authentication.getName());
        try {
            Integer userId = getUserIdFromAuthentication(authentication);
            
            // Set user cho bank account
            bankAccount.getUser().setId(userId);
            
            BankAccount createdAccount = bankAccountService.createBankAccount(bankAccount);
            BankAccountDTO dto = bankAccountMapper.toDTO(createdAccount);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("success", true, "data", dto));
        } catch (Exception e) {
            log.error("Lỗi khi tạo tài khoản ngân hàng: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Lỗi khi tạo tài khoản ngân hàng: " + e.getMessage()));
        }
    }
    
    // Tạo tài khoản ngân hàng đơn giản
    @PostMapping("/simple")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SUPPLIER')")
    public ResponseEntity<?> createSimpleBankAccount(@RequestParam String accountNumber,
                                                     @RequestParam String accountHolderName,
                                                     @RequestParam String bankName,
                                                     @RequestParam(required = false, defaultValue = "checking") String accountType,
                                                     @RequestParam(required = false, defaultValue = "false") Boolean isPrimary,
                                                     Authentication authentication) {
        try {
            Integer userId = getUserIdFromAuthentication(authentication);
            BankAccount createdAccount = bankAccountService.createSimpleBankAccount(
                    userId, accountNumber, accountHolderName, bankName, accountType, isPrimary);
            BankAccountDTO dto = bankAccountMapper.toDTO(createdAccount);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("success", true, "data", dto));
        } catch (Exception e) {
            log.error("Lỗi khi tạo tài khoản ngân hàng đơn giản: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Lỗi khi tạo tài khoản ngân hàng: " + e.getMessage()));
        }
    }
    
    // Lấy tất cả tài khoản ngân hàng của user hiện tại
    @GetMapping("/my-accounts")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SUPPLIER')")
    public ResponseEntity<?> getMyBankAccounts(Authentication authentication) {
        try {
            Integer userId = getUserIdFromAuthentication(authentication);
            List<BankAccount> accounts = bankAccountService.getBankAccountsByUserId(userId);
            List<BankAccountDTO> dtos = accounts.stream().map(bankAccountMapper::toDTO).toList();
            return ResponseEntity.ok(Map.of("success", true, "data", dtos));
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách tài khoản: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy danh sách tài khoản: " + e.getMessage()));
        }
    }
    
    // Lấy tài khoản chính của user
    @GetMapping("/my-primary")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SUPPLIER')")
    public ResponseEntity<?> getMyPrimaryAccount(Authentication authentication) {
        try {
            Integer userId = getUserIdFromAuthentication(authentication);
            BankAccount account = bankAccountService.getPrimaryBankAccount(userId);
            BankAccountDTO dto = account != null ? bankAccountMapper.toDTO(account) : null;
            return ResponseEntity.ok(Map.of("success", true, "data", dto));
        } catch (Exception e) {
            log.error("Lỗi khi lấy tài khoản chính: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Lỗi khi lấy tài khoản chính: " + e.getMessage()));
        }
    }
    
    // Lấy tài khoản đã xác thực của user
    @GetMapping("/my-verified")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SUPPLIER')")
    public ResponseEntity<?> getMyVerifiedAccounts(Authentication authentication) {
        try {
            Integer userId = getUserIdFromAuthentication(authentication);
            List<BankAccount> accounts = bankAccountService.getVerifiedBankAccountsByUserId(userId);
            List<BankAccountDTO> dtos = accounts.stream().map(bankAccountMapper::toDTO).toList();
            return ResponseEntity.ok(Map.of("success", true, "data", dtos));
        } catch (Exception e) {
            log.error("Lỗi khi lấy tài khoản đã xác thực: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy tài khoản đã xác thực: " + e.getMessage()));
        }
    }
    
    // Lấy tài khoản theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SUPPLIER') or hasRole('ADMIN')")
    public ResponseEntity<?> getBankAccountById(@PathVariable Integer id, Authentication authentication) {
        try {
            Integer userId = getUserIdFromAuthentication(authentication);
            
            // Kiểm tra quyền truy cập (trừ admin)
            BankAccount account = bankAccountService.getBankAccountById(id);
            // Check quyền truy cập nếu không phải admin
            if (!hasRole(authentication, "ADMIN") && !account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(createErrorResponse("Không có quyền truy cập"));
            }
            BankAccountDTO dto = bankAccountMapper.toDTO(account);
            return ResponseEntity.ok(Map.of("success", true, "data", dto));
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin tài khoản: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Lỗi khi lấy thông tin tài khoản: " + e.getMessage()));
        }
    }
    
    // Cập nhật tài khoản ngân hàng
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SUPPLIER')")
    public ResponseEntity<?> updateBankAccount(@PathVariable Integer id,
                                               @Valid @RequestBody BankAccountDTO dto,
                                               Authentication authentication) {
        try {
            Integer userId = getUserIdFromAuthentication(authentication);
            BankAccountDTO updated = bankAccountService.updateBankAccount(id, dto, userId);
            return ResponseEntity.ok(createSuccessResponse("Cập nhật thành công", updated));
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật tài khoản: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(createErrorResponse("Cập nhật thất bại: " + e.getMessage()));
        }
    }
    
    // Đặt tài khoản làm tài khoản chính
    @PutMapping("/{id}/set-primary")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SUPPLIER')")
    public ResponseEntity<?> setPrimaryAccount(@PathVariable Integer id, Authentication authentication) {
        try {
            Integer userId = getUserIdFromAuthentication(authentication);
            BankAccount updated = bankAccountService.setPrimaryBankAccount(userId, id);
            BankAccountDTO dto = bankAccountMapper.toDTO(updated);
            return ResponseEntity.ok(Map.of("success", true, "data", dto));
        } catch (Exception e) {
            log.error("Lỗi khi đặt tài khoản chính: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Lỗi khi đặt tài khoản chính: " + e.getMessage()));
        }
    }
    
    // Bỏ đặt tài khoản chính
    @PutMapping("/remove-primary")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SUPPLIER')")
    public ResponseEntity<?> removePrimaryAccount(Authentication authentication) {
        try {
            Integer userId = getUserIdFromAuthentication(authentication);
            bankAccountService.removePrimaryBankAccount(userId);
            return ResponseEntity.ok(createSuccessResponse("Bỏ đặt tài khoản chính thành công", null));
        } catch (Exception e) {
            log.error("Lỗi khi bỏ tài khoản chính: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Lỗi khi bỏ tài khoản chính: " + e.getMessage()));
        }
    }
    
    // Xác thực tài khoản (chỉ admin)
    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> verifyBankAccount(@PathVariable Integer id) {
        try {
            BankAccount verifiedAccount = bankAccountService.verifyBankAccount(id);
            BankAccountDTO dto = bankAccountMapper.toDTO(verifiedAccount);
            return ResponseEntity.ok(Map.of("success", true, "data", dto));
        } catch (Exception e) {
            log.error("Lỗi khi xác thực tài khoản: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Lỗi khi xác thực tài khoản: " + e.getMessage()));
        }
    }
    
    // Xác thực nhiều tài khoản cùng lúc (admin)
    @PutMapping("/batch-verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> batchVerifyAccounts(@RequestBody List<Integer> accountIds) {
        try {
            bankAccountService.batchUpdateVerificationStatus(accountIds, true);
            return ResponseEntity.ok(createSuccessResponse("Xác thực hàng loạt thành công", null));
        } catch (Exception e) {
            log.error("Lỗi khi xác thực hàng loạt: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Lỗi khi xác thực hàng loạt: " + e.getMessage()));
        }
    }
    
    // Xóa tài khoản ngân hàng
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SUPPLIER')")
    public ResponseEntity<?> deleteBankAccount(@PathVariable Integer id, Authentication authentication) {
        try {
            Integer userId = getUserIdFromAuthentication(authentication);
            
            // Kiểm tra quyền truy cập
            BankAccount account = bankAccountService.getBankAccountById(id);
            if (!account.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(createErrorResponse("Không có quyền xóa tài khoản này"));
            }
            
            bankAccountService.deleteBankAccount(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("Lỗi khi xóa tài khoản: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Lỗi khi xóa tài khoản: " + e.getMessage()));
        }
    }
    
    // Khôi phục tài khoản đã xóa (admin)
    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> restoreBankAccount(@PathVariable Integer id) {
        try {
            BankAccount restoredAccount = bankAccountService.restoreBankAccount(id);
            BankAccountDTO dto = bankAccountMapper.toDTO(restoredAccount);
            return ResponseEntity.ok(Map.of("success", true, "data", dto));
        } catch (Exception e) {
            log.error("Lỗi khi khôi phục tài khoản: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Lỗi khi khôi phục tài khoản: " + e.getMessage()));
        }
    }
    
    // Tìm kiếm tài khoản ngân hàng
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchBankAccounts(@RequestParam String keyword) {
        try {
            List<BankAccount> accounts = bankAccountService.searchBankAccounts(keyword);
            List<BankAccountDTO> dtos = accounts.stream().map(bankAccountMapper::toDTO).toList();
            return ResponseEntity.ok(Map.of("success", true, "data", dtos));
        } catch (Exception e) {
            log.error("Lỗi khi tìm kiếm tài khoản: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi tìm kiếm tài khoản: " + e.getMessage()));
        }
    }
    
    // Admin: Lấy tài khoản theo trạng thái xác thực
    @GetMapping("/admin/by-verification")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getBankAccountsByVerification(@RequestParam Boolean isVerified) {
        try {
            List<BankAccount> accounts = bankAccountService.getBankAccountsByVerificationStatus(isVerified);
            List<BankAccountDTO> dtos = accounts.stream().map(bankAccountMapper::toDTO).toList();
            return ResponseEntity.ok(Map.of("success", true, "data", dtos));
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách tài khoản: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy danh sách tài khoản: " + e.getMessage()));
        }
    }
    
    // Admin: Lấy tất cả tài khoản với phân trang
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllBankAccounts(@RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "10") int size,
                                                @RequestParam(defaultValue = "createdAt") String sortBy,
                                                @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<BankAccount> accounts = bankAccountService.getAllBankAccounts(pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("accounts", accounts.getContent());
            response.put("currentPage", accounts.getNumber());
            response.put("totalItems", accounts.getTotalElements());
            response.put("totalPages", accounts.getTotalPages());
            response.put("hasNext", accounts.hasNext());
            response.put("hasPrevious", accounts.hasPrevious());
            
            return ResponseEntity.ok(createSuccessResponse("Lấy danh sách tài khoản thành công", response));
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách tài khoản: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy danh sách tài khoản: " + e.getMessage()));
        }
    }
    
    // Kiểm tra tài khoản tồn tại
    @GetMapping("/check-exists")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SUPPLIER') or hasRole('ADMIN')")
    public ResponseEntity<?> checkAccountExists(@RequestParam String accountNumber, @RequestParam String bankName) {
        try {
            boolean exists = bankAccountService.existsByAccountNumberAndBankName(accountNumber, bankName);
            Map<String, Object> data = new HashMap<>();
            data.put("exists", exists);
            return ResponseEntity.ok(createSuccessResponse("Kiểm tra thành công", data));
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra tài khoản: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi kiểm tra tài khoản: " + e.getMessage()));
        }
    }
    
    // Lấy thống kê tài khoản của user
    @GetMapping("/my-stats")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SUPPLIER')")
    public ResponseEntity<?> getMyAccountStats(Authentication authentication) {
        try {
            Integer userId = getUserIdFromAuthentication(authentication);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalAccounts", bankAccountService.countBankAccountsByUserId(userId));
            stats.put("verifiedAccounts", bankAccountService.getVerifiedBankAccountsByUserId(userId).size());
            stats.put("hasPrimary", bankAccountService.hasPrimaryBankAccount(userId));
            
            return ResponseEntity.ok(createSuccessResponse("Lấy thống kê thành công", stats));
        } catch (Exception e) {
            log.error("Lỗi khi lấy thống kê: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy thống kê: " + e.getMessage()));
        }
    }
    
    // Admin: Lấy thống kê hệ thống
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSystemStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalAccounts", bankAccountService.getAllBankAccounts(Pageable.unpaged()).getTotalElements());
            stats.put("verifiedAccounts", bankAccountService.countByVerificationStatus(true));
            stats.put("unverifiedAccounts", bankAccountService.countByVerificationStatus(false));
            
            return ResponseEntity.ok(createSuccessResponse("Lấy thống kê hệ thống thành công", stats));
        } catch (Exception e) {
            log.error("Lỗi khi lấy thống kê hệ thống: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi khi lấy thống kê hệ thống: " + e.getMessage()));
        }
    }
    
    // Utility methods
    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        response.put("timestamp", LocalDateTime.now());
        return response;
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", message);
        response.put("timestamp", LocalDateTime.now());
        return response;
    }
    
    // TODO: Implement these utility methods based on your authentication system
    private Integer getUserIdFromAuthentication(Authentication authentication) {
        String username = authentication.getName();
        // Hoặc nếu bạn có custom principal:
        // CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        // return principal.getId();
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username))
            .getId();
    }
    
    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }
}