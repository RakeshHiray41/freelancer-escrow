package com.freelance.project_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MilestoneRequest {
    @NotBlank private String title;
    private String description;
    private String acceptanceCriteria;
    @NotNull @Positive private BigDecimal amount;
    private LocalDate dueDate;
}