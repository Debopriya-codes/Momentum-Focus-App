package com.momentum.backend.repository;

import com.momentum.backend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Task> findByUserIdAndDate(Long userId, LocalDate date);
    List<Task> findByUserIdAndDateGreaterThan(Long userId, LocalDate date);
    List<Task> findByUserIdAndDateLessThanAndCompletedFalse(Long userId, LocalDate date);
}
