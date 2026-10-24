package com.freelance.escrow_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class HoldRequest {
    @NotNull private Long milestoneId;
    @NotNull private Long clientId;
    @NotNull private Long freelancerId;
    @NotNull @Positive private BigDecimal amount;
}