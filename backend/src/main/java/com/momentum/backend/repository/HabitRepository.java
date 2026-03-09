package com.momentum.backend.repository;

import com.momentum.backend.entity.Habit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUserIdOrderByCreatedAtAsc(Long userId);
    List<Habit> findByUserIdAndFrequency(Long userId, Habit.Frequency frequency);
}
