package com.momentum.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class HabitDto {

    @Data
    public static class CreateRequest {
        @NotBlank
        private String name;
        private String frequency = "DAILY";
    }

    @Data
    public static class ToggleRequest {
        private int index;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String frequency;
        private boolean[] checked;
    }
}
