package com.momentum.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "focus_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FocusSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int duration; // in minutes

    @Column(name = "session_date", nullable = false)
    private LocalDate date;

    @Column(name = "session_time")
    private String time; // e.g. "09:30 AM"

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
