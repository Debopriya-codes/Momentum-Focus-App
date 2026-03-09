package com.momentum.backend.repository;

import com.momentum.backend.entity.FocusSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface FocusSessionRepository extends JpaRepository<FocusSession, Long> {
    List<FocusSession> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<FocusSession> findByUserIdAndDate(Long userId, LocalDate date);

    @Query("SELECT COALESCE(SUM(f.duration), 0) FROM FocusSession f WHERE f.user.id = :userId AND f.date = :date")
    int sumDurationByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT MONTH(f.date) as month, SUM(f.duration) as total FROM FocusSession f WHERE f.user.id = :userId AND YEAR(f.date) = :year GROUP BY MONTH(f.date)")
    List<Object[]> monthlyTotals(@Param("userId") Long userId, @Param("year") int year);
}
