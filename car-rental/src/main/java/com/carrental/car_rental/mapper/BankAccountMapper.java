package com.carrental.car_rental.mapper;

import com.carrental.car_rental.dto.BankAccountDTO;
import com.carrental.car_rental.dto.CreateBankAccountDTO;
import com.carrental.car_rental.entity.BankAccount;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BankAccountMapper {
    
    // MapStruct mapping (works if user is eagerly fetched)
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.username", target = "userName")
    @Mapping(source = "user.email", target = "userEmail")
    BankAccountDTO toDTO(BankAccount bankAccount);

    // Fallback: Safe manual mapping to avoid LazyInitializationException
    default BankAccountDTO toDTO_safe(BankAccount bankAccount) {
        if (bankAccount == null) return null;
        BankAccountDTO dto = new BankAccountDTO();
        dto.setBankAccountId(bankAccount.getBankAccountId());
        dto.setUserId(bankAccount.getUser() != null ? bankAccount.getUser().getId() : null);
        dto.setUserName(bankAccount.getUser() != null ? bankAccount.getUser().getUsername() : null);
        dto.setUserEmail(bankAccount.getUser() != null ? bankAccount.getUser().getEmail() : null);
        dto.setAccountNumber(bankAccount.getAccountNumber());
        dto.setAccountHolderName(bankAccount.getAccountHolderName());
        dto.setBankName(bankAccount.getBankName());
        dto.setBankBranch(bankAccount.getBankBranch());
        dto.setSwiftCode(bankAccount.getSwiftCode());
        dto.setRoutingNumber(bankAccount.getRoutingNumber());
        dto.setAccountType(bankAccount.getAccountType());
        dto.setIsPrimary(bankAccount.getIsPrimary());
        dto.setIsVerified(bankAccount.getIsVerified());
        dto.setCreatedAt(bankAccount.getCreatedAt());
        dto.setUpdatedAt(bankAccount.getUpdatedAt());
        dto.setIsDeleted(bankAccount.getIsDeleted());
        return dto;
    }
    
    @Mapping(target = "bankAccountId", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    BankAccount toEntity(CreateBankAccountDTO createBankAccountDTO);
    
    @Mapping(target = "bankAccountId", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    void updateEntity(@MappingTarget BankAccount bankAccount, BankAccountDTO bankAccountDTO);
}