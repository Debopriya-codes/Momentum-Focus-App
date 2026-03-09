package com.momentum.backend.controller;

import com.momentum.backend.dto.HabitDto;
import com.momentum.backend.entity.Habit;
import com.momentum.backend.entity.User;
import com.momentum.backend.repository.HabitRepository;
import com.momentum.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/habits")
public class HabitController {

    @Autowired private HabitRepository habitRepo;
    @Autowired private UserRepository userRepo;

    private User getUser(UserDetails p) {
        return userRepo.findByEmail(p.getUsername()).orElseThrow();
    }

    private HabitDto.Response toDto(Habit h) {
        HabitDto.Response r = new HabitDto.Response();
        r.setId(h.getId());
        r.setName(h.getName());
        r.setFrequency(h.getFrequency().name());
        r.setChecked(h.getChecked());
        return r;
    }

    @GetMapping
    public List<HabitDto.Response> getAll(@AuthenticationPrincipal UserDetails p) {
        return habitRepo.findByUserIdOrderByCreatedAtAsc(getUser(p).getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<HabitDto.Response> create(
            @AuthenticationPrincipal UserDetails p,
            @Valid @RequestBody HabitDto.CreateRequest req) {
        User user = getUser(p);
        Habit.Frequency freq = Habit.Frequency.valueOf(req.getFrequency().toUpperCase());
        int slots = freq == Habit.Frequency.DAILY ? 7 : 4;
        boolean[] checked = new boolean[slots];
        Arrays.fill(checked, false);

        Habit habit = new Habit();
        habit.setUser(user);
        habit.setName(req.getName());
        habit.setFrequency(freq);
        habit.setChecked(checked);

        return ResponseEntity.ok(toDto(habitRepo.save(habit)));
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<HabitDto.Response> toggle(
            @AuthenticationPrincipal UserDetails p,
            @PathVariable Long id,
            @RequestBody HabitDto.ToggleRequest req) {
        Habit habit = habitRepo.findById(id).orElseThrow();
        if (!habit.getUser().getId().equals(getUser(p).getId()))
            return ResponseEntity.status(403).build();

        boolean[] checked = habit.getChecked();
        if (req.getIndex() >= 0 && req.getIndex() < checked.length) {
            checked[req.getIndex()] = !checked[req.getIndex()];
            habit.setChecked(checked);
        }
        return ResponseEntity.ok(toDto(habitRepo.save(habit)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails p,
            @PathVariable Long id) {
        Habit habit = habitRepo.findById(id).orElseThrow();
        if (!habit.getUser().getId().equals(getUser(p).getId()))
            return ResponseEntity.status(403).build();
        habitRepo.delete(habit);
        return ResponseEntity.noContent().build();
    }
}
