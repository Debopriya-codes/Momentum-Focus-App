package com.momentum.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private boolean completed = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.LOW;

    @Column(name = "task_date")
    private LocalDate date;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Priority { LOW, MEDIUM, HIGH }
}
