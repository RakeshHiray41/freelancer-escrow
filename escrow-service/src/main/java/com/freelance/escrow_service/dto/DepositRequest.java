package com.freelance.escrow_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class DepositRequest {
    @NotNull @Positive private BigDecimal amount;
}