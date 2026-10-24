package com.freelance.chat_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SendRequest {
    @NotBlank
    @Size(max = 2000)
    private String content;
}