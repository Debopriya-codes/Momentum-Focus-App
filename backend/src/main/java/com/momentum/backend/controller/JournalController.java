package com.momentum.backend.controller;

import com.momentum.backend.dto.JournalDto;
import com.momentum.backend.entity.JournalEntry;
import com.momentum.backend.entity.User;
import com.momentum.backend.repository.JournalEntryRepository;
import com.momentum.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/journal")
public class JournalController {

    @Autowired private JournalEntryRepository journalRepo;
    @Autowired private UserRepository userRepo;

    private User getUser(UserDetails p) {
        return userRepo.findByEmail(p.getUsername()).orElseThrow();
    }

    private JournalDto.Response toDto(JournalEntry e) {
        JournalDto.Response r = new JournalDto.Response();
        r.setId(e.getId());
        r.setDate(e.getDate());
        r.setGratitude(Arrays.asList(e.getGratitude1(), e.getGratitude2(), e.getGratitude3()));
        r.setProductivity(Arrays.asList(e.getProductivity1(), e.getProductivity2(), e.getProductivity3()));
        r.setReflection(Arrays.asList(e.getReflection1(), e.getReflection2(), e.getReflection3()));
        r.setSavedAt(e.getSavedAt() != null ? e.getSavedAt().toString() : null);
        return r;
    }

    @GetMapping
    public List<JournalDto.Response> getAll(@AuthenticationPrincipal UserDetails p) {
        return journalRepo.findByUserIdOrderByDateDesc(getUser(p).getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @GetMapping("/{date}")
    public ResponseEntity<JournalDto.Response> getByDate(
            @AuthenticationPrincipal UserDetails p,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return journalRepo.findByUserIdAndDate(getUser(p).getId(), date)
                .map(e -> ResponseEntity.ok(toDto(e)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<JournalDto.Response> save(
            @AuthenticationPrincipal UserDetails p,
            @RequestBody JournalDto.SaveRequest req) {
        User user = getUser(p);
        LocalDate date = req.getDate() != null ? req.getDate() : LocalDate.now();

        JournalEntry entry = journalRepo.findByUserIdAndDate(user.getId(), date)
                .orElse(new JournalEntry());

        entry.setUser(user);
        entry.setDate(date);
        setSectionAnswers(entry, req);
        entry.setSavedAt(LocalDateTime.now());
        if (entry.getCreatedAt() == null) entry.setCreatedAt(LocalDateTime.now());

        return ResponseEntity.ok(toDto(journalRepo.save(entry)));
    }

    private void setSectionAnswers(JournalEntry e, JournalDto.SaveRequest req) {
        if (req.getGratitude() != null && req.getGratitude().size() >= 3) {
            e.setGratitude1(req.getGratitude().get(0));
            e.setGratitude2(req.getGratitude().get(1));
            e.setGratitude3(req.getGratitude().get(2));
        }
        if (req.getProductivity() != null && req.getProductivity().size() >= 3) {
            e.setProductivity1(req.getProductivity().get(0));
            e.setProductivity2(req.getProductivity().get(1));
            e.setProductivity3(req.getProductivity().get(2));
        }
        if (req.getReflection() != null && req.getReflection().size() >= 3) {
            e.setReflection1(req.getReflection().get(0));
            e.setReflection2(req.getReflection().get(1));
            e.setReflection3(req.getReflection().get(2));
        }
    }
}
