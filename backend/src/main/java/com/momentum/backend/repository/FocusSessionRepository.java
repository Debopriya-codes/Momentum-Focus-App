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

    // Uses standard date-range instead of dialect-specific MONTH()/YEAR() functions
    @Query("SELECT f FROM FocusSession f WHERE f.user.id = :userId AND f.date >= :startDate AND f.date <= :endDate ORDER BY f.date ASC")
    List<FocusSession> findByUserIdAndDateBetween(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
