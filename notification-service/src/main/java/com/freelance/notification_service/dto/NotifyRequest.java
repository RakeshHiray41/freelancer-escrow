package com.freelance.notification_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotifyRequest {
    @NotNull private Long userId;
    @NotBlank private String type;
    @NotBlank private String message;
    private String email;      // jar dila tar mail jato
    private String subject;
}