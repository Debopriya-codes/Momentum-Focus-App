package com.momentum.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "journal_entries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "entry_date", nullable = false)
    private LocalDate date;

    // Gratitude answers (3 questions)
    @Column(name = "gratitude_1", columnDefinition = "TEXT")
    private String gratitude1;
    @Column(name = "gratitude_2", columnDefinition = "TEXT")
    private String gratitude2;
    @Column(name = "gratitude_3", columnDefinition = "TEXT")
    private String gratitude3;

    // Productivity answers
    @Column(name = "productivity_1", columnDefinition = "TEXT")
    private String productivity1;
    @Column(name = "productivity_2", columnDefinition = "TEXT")
    private String productivity2;
    @Column(name = "productivity_3", columnDefinition = "TEXT")
    private String productivity3;

    // Reflection answers
    @Column(name = "reflection_1", columnDefinition = "TEXT")
    private String reflection1;
    @Column(name = "reflection_2", columnDefinition = "TEXT")
    private String reflection2;
    @Column(name = "reflection_3", columnDefinition = "TEXT")
    private String reflection3;

    @Column(name = "saved_at")
    private LocalDateTime savedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
