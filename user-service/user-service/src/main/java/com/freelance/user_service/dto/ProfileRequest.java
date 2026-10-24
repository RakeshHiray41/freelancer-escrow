package com.freelance.user_service.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProfileRequest {
    private String bio;
    private String skills;
    private BigDecimal hourlyRate;
    private String country;
}