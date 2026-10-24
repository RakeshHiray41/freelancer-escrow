package com.freelance.dispute_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "disputes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Dispute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long milestoneId;
    private Long raisedBy;

    @Column(length = 2000)
    private String reason;

    @Enumerated(EnumType.STRING)
    private DisputeStatus status;

    @Enumerated(EnumType.STRING)
    private Decision decision;

    private Integer freelancerPercent;

    @Column(length = 2000)
    private String adminNote;

    private Long resolvedBy;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}