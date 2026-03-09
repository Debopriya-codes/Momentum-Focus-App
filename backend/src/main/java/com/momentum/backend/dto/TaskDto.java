package com.momentum.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

public class TaskDto {

    @Data
    public static class CreateRequest {
        @NotBlank
        private String title;
        private String priority = "LOW";
        private LocalDate date;
    }

    @Data
    public static class UpdateRequest {
        private String title;
        private String priority;
        private LocalDate date;
        private Boolean completed;
    }

    @Data
    public static class Response {
        private Long id;
        private String title;
        private boolean completed;
        private String priority;
        private LocalDate date;
    }
}
