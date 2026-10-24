package com.freelance.ai_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

public class AiDtos {

    @Data
    public static class MilestoneGenRequest {
        @NotBlank private String description;
        private BigDecimal budget;
    }

    @Data
    public static class ProposalRequest {
        @NotBlank private String projectTitle;
        @NotBlank private String projectDescription;
        private String freelancerSkills;
        private BigDecimal bidAmount;
    }

    @Data
    public static class DisputeRequest {
        @NotBlank private String milestoneTitle;
        @NotBlank private String acceptanceCriteria;
        private String submissionNote;
        private String submissionLink;
        private String revisionNote;
        @NotBlank private String reason;
        private BigDecimal amount;
    }

    @Data
    public static class DeliverableRequest {
        @NotBlank private String acceptanceCriteria;
        @NotBlank private String submissionNote;
        private String submissionLink;
    }
}