package com.carrental.car_rental.service;

import com.carrental.car_rental.entity.BankAccount;
import com.carrental.car_rental.entity.User;
import com.carrental.car_rental.dto.BankAccountDTO;
import com.carrental.car_rental.mapper.BankAccountMapper;
import com.carrental.car_rental.repository.BankAccountRepository;
import com.carrental.car_rental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BankAccountService {
    
    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;
    private final BankAccountMapper bankAccountMapper;
    
    /**
     * Tạo tài khoản ngân hàng mới
     */
    public BankAccount createBankAccount(BankAccount bankAccount) {
        log.info("Tạo tài khoản ngân hàng mới cho user ID: {}", bankAccount.getUser().getId());
        
        // Kiểm tra user tồn tại
        User user = userRepository.findById(bankAccount.getUser().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy user"));
        
        // Kiểm tra số tài khoản đã tồn tại
        if (bankAccountRepository.findByAccountNumberAndBankNameAndIsDeletedFalse(
                bankAccount.getAccountNumber(), 
                bankAccount.getBankName()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số tài khoản đã tồn tại trong ngân hàng này");
        }
        
        // Nếu đặt làm tài khoản chính, kiểm tra user đã có tài khoản chính chưa
        if (bankAccount.getIsPrimary() && 
            bankAccountRepository.existsByUserIdAndIsPrimaryTrueAndIsDeletedFalse(user.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User đã có tài khoản chính");
        }
        
        bankAccount.setUser(user);
        BankAccount savedBankAccount = bankAccountRepository.save(bankAccount);
        log.info("Đã tạo tài khoản ngân hàng ID: {}", savedBankAccount.getBankAccountId());
        
        return savedBankAccount;
    }
    
    /**
     * Cập nhật thông tin tài khoản ngân hàng
     */
    @Transactional
    public BankAccountDTO updateBankAccount(Integer bankAccountId, BankAccountDTO dto, Integer userId) {
        BankAccount existing = bankAccountRepository.findById(bankAccountId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản ngân hàng"));

        if (!existing.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền cập nhật tài khoản này");
        }
        if (existing.getIsDeleted()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tài khoản đã bị xóa");
        }

        // Cập nhật các trường
        existing.setAccountNumber(dto.getAccountNumber());
        existing.setAccountHolderName(dto.getAccountHolderName());
        existing.setBankName(dto.getBankName());
        existing.setBankBranch(dto.getBankBranch());
        existing.setAccountType(dto.getAccountType());
        existing.setSwiftCode(dto.getSwiftCode());
        existing.setRoutingNumber(dto.getRoutingNumber());
        existing.setIsPrimary(dto.getIsPrimary());

        // ... các logic khác nếu cần

        BankAccount saved = bankAccountRepository.save(existing);
        // Map sang DTO ngay trong transaction
        return bankAccountMapper.toDTO(saved);
    }
    
    /**
     * Lấy tài khoản ngân hàng theo ID
     */
    @Transactional(readOnly = true)
    public BankAccount getBankAccountById(Integer bankAccountId) {
        BankAccount bankAccount = bankAccountRepository.findById(bankAccountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản ngân hàng"));
        
        if (bankAccount.getIsDeleted()) {
            throw new ResponseStatusException(HttpStatus.GONE, "Tài khoản ngân hàng đã bị xóa");
        }
        
        return bankAccount;
    }
    
    /**
     * Lấy tất cả tài khoản ngân hàng của user (dùng join fetch tránh LazyInitializationException)
     */
    @Transactional(readOnly = true)
    public List<BankAccount> getBankAccountsByUserId(Integer userId) {
        // Dùng join fetch để tránh LazyInitializationException khi map sang DTO
        return bankAccountRepository.findByUserIdAndIsDeletedFalseFetchUser(userId);
    }
    
    /**
     * Lấy tài khoản chính của user
     */
    @Transactional(readOnly = true)
    public BankAccount getPrimaryBankAccount(Integer userId) {
        return bankAccountRepository.findByUserIdAndIsPrimaryTrueAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản chính"));
    }
    
    /**
     * Đặt tài khoản làm tài khoản chính
     */
    public BankAccount setPrimaryBankAccount(Integer userId, Integer bankAccountId) {
        log.info("Đặt tài khoản {} làm tài khoản chính cho user {}", bankAccountId, userId);
        
        // Kiểm tra tài khoản thuộc về user
        BankAccount bankAccount = bankAccountRepository.findByIdAndUserId(bankAccountId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản ngân hàng"));
        
        // Bỏ primary của tài khoản hiện tại
        bankAccountRepository.findByUserIdAndIsPrimaryTrueAndIsDeletedFalse(userId)
                .ifPresent(currentPrimary -> {
                    currentPrimary.setIsPrimary(false);
                    bankAccountRepository.save(currentPrimary);
                });
        
        // Đặt tài khoản mới làm primary
        bankAccount.setIsPrimary(true);
        return bankAccountRepository.save(bankAccount);
    }
    
    /**
     * Xác thực tài khoản ngân hàng
     */
    public BankAccount verifyBankAccount(Integer bankAccountId) {
        log.info("Xác thực tài khoản ngân hàng ID: {}", bankAccountId);
        
        BankAccount bankAccount = bankAccountRepository.findById(bankAccountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản ngân hàng"));
        
        bankAccount.setIsVerified(true);
        return bankAccountRepository.save(bankAccount);
    }
    
    /**
     * Xóa tài khoản ngân hàng (soft delete)
     */
    public void deleteBankAccount(Integer bankAccountId) {
        log.info("Xóa tài khoản ngân hàng ID: {}", bankAccountId);
        
        BankAccount bankAccount = bankAccountRepository.findById(bankAccountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản ngân hàng"));
        
        if (bankAccount.getIsPrimary()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Không thể xóa tài khoản chính");
        }
        
        bankAccount.setIsDeleted(true);
        bankAccountRepository.save(bankAccount);
    }
    
    /**
     * Kiểm tra quyền truy cập tài khoản
     */
    @Transactional(readOnly = true)
    public boolean canAccessBankAccount(Integer userId, Integer bankAccountId) {
        return bankAccountRepository.findByIdAndUserId(bankAccountId, userId).isPresent();
    }
    
    /**
     * Lấy tất cả tài khoản theo trạng thái xác thực
     */
    @Transactional(readOnly = true)
    public List<BankAccount> getBankAccountsByVerificationStatus(Boolean isVerified) {
        return bankAccountRepository.findByIsVerifiedAndIsDeletedFalse(isVerified);
    }
    
    /**
     * Lấy tất cả tài khoản ngân hàng với phân trang
     */
    @Transactional(readOnly = true)
    public Page<BankAccount> getAllBankAccounts(Pageable pageable) {
        return bankAccountRepository.findAll(pageable);
    }
    
    /**
     * Đếm số lượng tài khoản của user
     */
    @Transactional(readOnly = true)
    public long countBankAccountsByUserId(Integer userId) {
        return bankAccountRepository.countByUserIdAndIsDeletedFalse(userId);
    }
    
    /**
     * Kiểm tra tài khoản ngân hàng tồn tại
     */
    @Transactional(readOnly = true)
    public boolean existsByAccountNumberAndBankName(String accountNumber, String bankName) {
        return bankAccountRepository.findByAccountNumberAndBankNameAndIsDeletedFalse(accountNumber, bankName).isPresent();
    }
    
    /**
     * Lấy tài khoản ngân hàng theo số tài khoản và tên ngân hàng
     */
    @Transactional(readOnly = true)
    public Optional<BankAccount> getBankAccountByAccountNumberAndBankName(String accountNumber, String bankName) {
        return bankAccountRepository.findByAccountNumberAndBankNameAndIsDeletedFalse(accountNumber, bankName);
    }
    
    /**
     * Lấy tất cả tài khoản đã xác thực của user
     */
    @Transactional(readOnly = true)
    public List<BankAccount> getVerifiedBankAccountsByUserId(Integer userId) {
        return bankAccountRepository.findByUserIdAndIsVerifiedTrueAndIsDeletedFalse(userId);
    }
    
    /**
     * Cập nhật trạng thái xác thực hàng loạt
     */
    public void batchUpdateVerificationStatus(List<Integer> bankAccountIds, Boolean isVerified) {
        log.info("Cập nhật trạng thái xác thực cho {} tài khoản", bankAccountIds.size());
        
        List<BankAccount> bankAccounts = bankAccountRepository.findAllById(bankAccountIds);
        bankAccounts.forEach(account -> account.setIsVerified(isVerified));
        bankAccountRepository.saveAll(bankAccounts);
    }
    
    /**
     * Tìm kiếm tài khoản ngân hàng theo từ khóa
     */
    @Transactional(readOnly = true)
    public List<BankAccount> searchBankAccounts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }
        
        String searchKeyword = "%" + keyword.toLowerCase().trim() + "%";
        return bankAccountRepository.findByAccountNumberContainingIgnoreCaseOrAccountHolderNameContainingIgnoreCaseOrBankNameContainingIgnoreCaseAndIsDeletedFalse(searchKeyword);
    }
    
    /**
     * Kiểm tra user có tài khoản chính không
     */
    @Transactional(readOnly = true)
    public boolean hasPrimaryBankAccount(Integer userId) {
        return bankAccountRepository.existsByUserIdAndIsPrimaryTrueAndIsDeletedFalse(userId);
    }
    
    /**
     * Lấy số lượng tài khoản theo từng trạng thái xác thực
     */
    @Transactional(readOnly = true)
    public long countByVerificationStatus(Boolean isVerified) {
        return bankAccountRepository.countByIsVerifiedAndIsDeletedFalse(isVerified);
    }
    
    /**
     * Tạo tài khoản ngân hàng từ dữ liệu đơn giản
     */
    public BankAccount createSimpleBankAccount(Integer userId, String accountNumber, 
                                               String accountHolderName, String bankName, 
                                               String accountType, Boolean isPrimary) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy user"));
        
        BankAccount bankAccount = new BankAccount();
        bankAccount.setUser(user);
        bankAccount.setAccountNumber(accountNumber);
        bankAccount.setAccountHolderName(accountHolderName);
        bankAccount.setBankName(bankName);
        bankAccount.setAccountType(accountType != null ? accountType : "checking");
        bankAccount.setIsPrimary(isPrimary != null ? isPrimary : false);
        bankAccount.setIsVerified(false);
        bankAccount.setIsDeleted(false);
        
        return createBankAccount(bankAccount);
    }
    
    /**
     * Bỏ đặt tài khoản chính (không có tài khoản chính nào)
     */
    public void removePrimaryBankAccount(Integer userId) {
        log.info("Bỏ đặt tài khoản chính cho user {}", userId);
        
        bankAccountRepository.findByUserIdAndIsPrimaryTrueAndIsDeletedFalse(userId)
                .ifPresent(primaryAccount -> {
                    primaryAccount.setIsPrimary(false);
                    bankAccountRepository.save(primaryAccount);
                });
    }
    
    /**
     * Khôi phục tài khoản đã xóa
     */
    public BankAccount restoreBankAccount(Integer bankAccountId) {
        log.info("Khôi phục tài khoản ngân hàng ID: {}", bankAccountId);
        
        BankAccount bankAccount = bankAccountRepository.findById(bankAccountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản ngân hàng"));
        
        if (!bankAccount.getIsDeleted()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tài khoản ngân hàng chưa bị xóa");
        }
        
        bankAccount.setIsDeleted(false);
        return bankAccountRepository.save(bankAccount);
    }
}