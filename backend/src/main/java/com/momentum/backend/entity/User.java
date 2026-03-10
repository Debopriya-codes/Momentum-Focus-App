package com.momentum.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Email
    @Column(nullable = false, unique = true)
    private String email;

    // Nullable – Google-OAuth users don't have a local password
    @Column(nullable = true)
    private String password;

    // OAuth provider: "LOCAL" or "GOOGLE"
    // columnDefinition sets a DB-level DEFAULT so Hibernate's ddl-auto=update
    // can safely ADD this column to an existing table without violating NOT NULL.
    @Column(nullable = false, columnDefinition = "VARCHAR(10) DEFAULT 'LOCAL'")
    @Builder.Default
    private String provider = "LOCAL";

    // Google's unique subject ID (null for local accounts)
    @Column(name = "google_id", unique = true, nullable = true)
    private String googleId;

    // Profile picture from Google
    @Column(name = "avatar_url", length = 1024, nullable = true)
    private String avatarUrl;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
