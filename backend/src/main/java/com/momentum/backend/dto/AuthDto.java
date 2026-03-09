package com.momentum.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank
        private String username;
        @Email @NotBlank
        private String email;
        @NotBlank @Size(min = 6)
        private String password;
    }

    @Data
    public static class LoginRequest {
        @Email @NotBlank
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String type = "Bearer";
        private Long id;
        private String username;
        private String email;

        public AuthResponse(String token, Long id, String username, String email) {
            this.token = token;
            this.id = id;
            this.username = username;
            this.email = email;
        }
    }
}
