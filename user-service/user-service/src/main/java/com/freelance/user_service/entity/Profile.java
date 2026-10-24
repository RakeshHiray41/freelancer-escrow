package com.freelance.user_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Profile {
    @Id
    private Long userId;

    @Column(length = 1000)
    private String bio;

    private String skills;          // "java,react,spring"
    private BigDecimal hourlyRate;
    private String country;
    private String photoUrl;
}