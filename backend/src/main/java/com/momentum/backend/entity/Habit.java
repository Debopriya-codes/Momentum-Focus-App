package com.momentum.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "habits")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Frequency frequency = Frequency.DAILY;

    // Store check-in state as a comma-separated string of booleans (7 for daily, 4 for weekly)
    @Column(name = "checked_state", length = 64)
    private String checkedState = "false,false,false,false,false,false,false";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Frequency { DAILY, WEEKLY }

    public boolean[] getChecked() {
        String[] parts = checkedState.split(",");
        boolean[] result = new boolean[parts.length];
        for (int i = 0; i < parts.length; i++) {
            result[i] = Boolean.parseBoolean(parts[i].trim());
        }
        return result;
    }

    public void setChecked(boolean[] checked) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < checked.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(checked[i]);
        }
        this.checkedState = sb.toString();
    }
}
