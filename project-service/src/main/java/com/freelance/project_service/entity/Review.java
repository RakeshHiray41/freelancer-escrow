package com.freelance.project_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews", uniqueConstraints = @UniqueConstraint(columnNames = "projectId"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long projectId;
    private Long clientId;
    private Long freelancerId;
    private int rating;

    @Column(name = "review_comment", length = 1000)
    private String comment;

    private LocalDateTime createdAt;
}