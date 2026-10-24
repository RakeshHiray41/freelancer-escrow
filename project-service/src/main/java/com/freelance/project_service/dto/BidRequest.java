package com.freelance.project_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BidRequest {
    @NotNull @Positive private BigDecimal amount;
    @NotBlank private String proposal;
}