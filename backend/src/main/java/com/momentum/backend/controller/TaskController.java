package com.momentum.backend.controller;

import com.momentum.backend.dto.TaskDto;
import com.momentum.backend.entity.Task;
import com.momentum.backend.entity.User;
import com.momentum.backend.repository.TaskRepository;
import com.momentum.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired private TaskRepository taskRepo;
    @Autowired private UserRepository userRepo;

    private User getUser(UserDetails principal) {
        return userRepo.findByEmail(principal.getUsername()).orElseThrow();
    }

    private TaskDto.Response toDto(Task t) {
        TaskDto.Response r = new TaskDto.Response();
        r.setId(t.getId());
        r.setTitle(t.getTitle());
        r.setCompleted(t.isCompleted());
        r.setPriority(t.getPriority().name());
        r.setDate(t.getDate());
        return r;
    }

    @GetMapping
    public List<TaskDto.Response> getAll(@AuthenticationPrincipal UserDetails principal) {
        return taskRepo.findByUserIdOrderByCreatedAtDesc(getUser(principal).getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<TaskDto.Response> create(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody TaskDto.CreateRequest req) {
        User user = getUser(principal);
        Task task = Task.builder()
                .user(user)
                .title(req.getTitle())
                .priority(Task.Priority.valueOf(req.getPriority().toUpperCase()))
                .date(req.getDate())
                .build();
        return ResponseEntity.ok(toDto(taskRepo.save(task)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskDto.Response> update(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @RequestBody TaskDto.UpdateRequest req) {
        Task task = taskRepo.findById(id).orElseThrow();
        if (!task.getUser().getId().equals(getUser(principal).getId()))
            return ResponseEntity.status(403).build();

        if (req.getTitle() != null)     task.setTitle(req.getTitle());
        if (req.getCompleted() != null) task.setCompleted(req.getCompleted());
        if (req.getDate() != null)      task.setDate(req.getDate());
        if (req.getPriority() != null)  task.setPriority(Task.Priority.valueOf(req.getPriority().toUpperCase()));

        return ResponseEntity.ok(toDto(taskRepo.save(task)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {
        Task task = taskRepo.findById(id).orElseThrow();
        if (!task.getUser().getId().equals(getUser(principal).getId()))
            return ResponseEntity.status(403).build();
        taskRepo.delete(task);
        return ResponseEntity.noContent().build();
    }
}
