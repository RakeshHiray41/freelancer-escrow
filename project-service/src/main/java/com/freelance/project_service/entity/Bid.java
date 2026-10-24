package com.freelance.project_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bids")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Bid {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long projectId;
    private Long freelancerId;
    private BigDecimal amount;

    @Column(length = 2000)
    private String proposal;

    @Enumerated(EnumType.STRING)
    private BidStatus status;

    private LocalDateTime createdAt;
}