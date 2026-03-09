package com.momentum.backend.controller;

import com.momentum.backend.dto.AuthDto;
import com.momentum.backend.entity.User;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuthenticationManager authManager;
    @Autowired private JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDto.RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            return ResponseEntity.badRequest().body("Email already registered.");
        if (userRepository.existsByUsername(req.getUsername()))
            return ResponseEntity.badRequest().body("Username already taken.");

        User user = User.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .build();
        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthDto.AuthResponse(token, user.getId(), user.getUsername(), user.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDto.LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtUtils.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthDto.AuthResponse(token, user.getId(), user.getUsername(), user.getEmail()));
    }
}
