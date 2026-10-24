package com.freelance.project_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "milestones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Milestone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long projectId;
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(length = 2000)
    private String acceptanceCriteria;

    private BigDecimal amount;
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private MilestoneStatus status;

    @Column(length = 2000)
    private String submissionNote;
    private String submissionLink;

    @Column(length = 1000)
    private String revisionNote;

    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;
}