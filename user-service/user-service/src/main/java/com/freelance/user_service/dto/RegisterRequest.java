package com.freelance.user_service.dto;

import com.freelance.user_service.entity.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank private String name;
    @Email @NotBlank private String email;
    @Size(min = 6) private String password;
    @NotNull private Role role;
}