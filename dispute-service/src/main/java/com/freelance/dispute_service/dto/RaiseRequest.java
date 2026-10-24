package com.freelance.dispute_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RaiseRequest {
    @NotNull private Long milestoneId;
    @NotBlank private String reason;
}