package tw.freelancefair.application.dto;

import jakarta.validation.constraints.*;

public record ApplyRequest(
        @NotBlank(message = "請輸入自我推薦")
        @Size(min = 10, max = 1000, message = "自我推薦需 10–1000 字")
        String message,

        @NotNull(message = "請輸入報價")
        @Min(value = 1, message = "報價至少 1 元")
        @Max(value = 10_000_000, message = "報價過高")
        Integer quotedPrice,

        @NotNull(message = "請輸入預計天數")
        @Min(value = 1, message = "預計天數需 1–365 天")
        @Max(value = 365, message = "預計天數需 1–365 天")
        Integer estimatedDays
) {}
