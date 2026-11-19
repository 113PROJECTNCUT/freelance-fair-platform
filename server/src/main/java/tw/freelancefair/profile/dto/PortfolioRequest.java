package tw.freelancefair.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PortfolioRequest(
        @NotBlank(message = "請輸入作品標題")
        @Size(max = 60, message = "作品標題最多 60 字")
        String title,

        @Size(max = 500, message = "作品說明最多 500 字")
        String description,

        @Size(max = 300, message = "連結最多 300 字")
        @Pattern(regexp = "^$|^https?://\\S+$", message = "連結需以 http:// 或 https:// 開頭")
        String link
) {}
