package com.freelance.project_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProjectRequest {
    @NotBlank private String title;
    @NotBlank private String description;
    private String skills;
    @NotNull @Positive private BigDecimal budget;
}