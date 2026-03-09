package com.momentum.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

public class FocusSessionDto {

    @Data
    public static class CreateRequest {
        @Min(1)
        private int duration;
        @NotNull
        private LocalDate date;
        private String time;
    }

    @Data
    public static class Response {
        private Long id;
        private int duration;
        private LocalDate date;
        private String time;
    }

    @Data
    public static class DailySummary {
        private int totalMinutes;
        private int sessionCount;
    }

    @Data
    public static class MonthlyData {
        private String month;
        private int focus;
    }
}
