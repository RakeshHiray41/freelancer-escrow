package com.freelance.dispute_service.dto;

import com.freelance.dispute_service.entity.Decision;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResolveRequest {
    @NotNull private Decision decision;
    private Integer freelancerPercent;   // only for SPLIT (1-99)
    private String adminNote;
}