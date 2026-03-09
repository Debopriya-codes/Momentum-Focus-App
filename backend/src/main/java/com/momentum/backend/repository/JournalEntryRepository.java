package com.momentum.backend.repository;

import com.momentum.backend.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    Optional<JournalEntry> findByUserIdAndDate(Long userId, LocalDate date);
    List<JournalEntry> findByUserIdOrderByDateDesc(Long userId);
}
