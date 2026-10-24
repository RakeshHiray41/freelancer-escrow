package com.freelance.project_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubmitRequest {
    @NotBlank private String note;
    private String link;
}