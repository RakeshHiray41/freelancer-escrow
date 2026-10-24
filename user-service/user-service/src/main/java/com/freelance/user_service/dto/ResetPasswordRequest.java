package com.freelance.user_service.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String token;
    @Size(min = 6)
    private String newPassword;
}