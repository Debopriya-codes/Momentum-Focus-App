package com.momentum.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

public class JournalDto {

    @Data
    public static class SaveRequest {
        private LocalDate date;
        private List<String> gratitude;      // 3 answers
        private List<String> productivity;   // 3 answers
        private List<String> reflection;     // 3 answers
    }

    @Data
    public static class Response {
        private Long id;
        private LocalDate date;
        private List<String> gratitude;
        private List<String> productivity;
        private List<String> reflection;
        private String savedAt;
    }
}
