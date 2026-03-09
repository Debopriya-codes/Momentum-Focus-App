package com.momentum.backend.controller;

import com.momentum.backend.dto.FocusSessionDto;
import com.momentum.backend.entity.FocusSession;
import com.momentum.backend.entity.User;
import com.momentum.backend.repository.FocusSessionRepository;
import com.momentum.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/focus")
public class FocusController {

    @Autowired private FocusSessionRepository sessionRepo;
    @Autowired private UserRepository userRepo;

    private User getUser(UserDetails p) {
        return userRepo.findByEmail(p.getUsername()).orElseThrow();
    }

    private FocusSessionDto.Response toDto(FocusSession s) {
        FocusSessionDto.Response r = new FocusSessionDto.Response();
        r.setId(s.getId());
        r.setDuration(s.getDuration());
        r.setDate(s.getDate());
        r.setTime(s.getTime());
        return r;
    }

    @GetMapping
    public List<FocusSessionDto.Response> getAll(@AuthenticationPrincipal UserDetails p) {
        return sessionRepo.findByUserIdOrderByCreatedAtDesc(getUser(p).getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<FocusSessionDto.Response> create(
            @AuthenticationPrincipal UserDetails p,
            @Valid @RequestBody FocusSessionDto.CreateRequest req) {
        User user = getUser(p);
        FocusSession session = FocusSession.builder()
                .user(user)
                .duration(req.getDuration())
                .date(req.getDate())
                .time(req.getTime())
                .build();
        return ResponseEntity.ok(toDto(sessionRepo.save(session)));
    }

    @GetMapping("/today")
    public FocusSessionDto.DailySummary today(@AuthenticationPrincipal UserDetails p) {
        Long uid = getUser(p).getId();
        LocalDate today = LocalDate.now();
        int total = sessionRepo.sumDurationByUserIdAndDate(uid, today);
        int count = sessionRepo.findByUserIdAndDate(uid, today).size();
        FocusSessionDto.DailySummary s = new FocusSessionDto.DailySummary();
        s.setTotalMinutes(total);
        s.setSessionCount(count);
        return s;
    }

    @GetMapping("/yearly")
    public List<FocusSessionDto.MonthlyData> yearly(@AuthenticationPrincipal UserDetails p) {
        Long uid = getUser(p).getId();
        int year = LocalDate.now().getYear();
        List<Object[]> raw = sessionRepo.monthlyTotals(uid, year);

        // Build full 12-month list, fill in actual data
        List<FocusSessionDto.MonthlyData> result = new ArrayList<>();
        long[] totals = new long[13];
        for (Object[] row : raw) {
            int month = ((Number) row[0]).intValue();
            long mins = ((Number) row[1]).longValue();
            totals[month] = mins;
        }
        for (int m = 1; m <= 12; m++) {
            FocusSessionDto.MonthlyData md = new FocusSessionDto.MonthlyData();
            md.setMonth(Month.of(m).toString().substring(0, 3));
            md.setFocus((int) totals[m]);
            result.add(md);
        }
        return result;
    }
}
