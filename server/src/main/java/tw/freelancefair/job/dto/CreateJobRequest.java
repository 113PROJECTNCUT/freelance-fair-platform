package tw.freelancefair.job.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
import tw.freelancefair.job.IpOwnership;
import tw.freelancefair.job.JobCategory;

public record CreateJobRequest(
        @NotBlank(message = "請輸入案件標題")
        @Size(min = 5, max = 60, message = "標題需 5–60 字")
        String title,

        @NotNull(message = "請選擇類別")
        JobCategory category,

        @NotBlank(message = "請輸入需求描述")
        @Size(min = 20, max = 3000, message = "需求描述需 20–3000 字")
        String description,

        @NotNull(message = "請輸入預算下限")
        @Min(value = 1, message = "預算至少 1 元")
        @Max(value = 10_000_000, message = "預算過高")
        Integer budgetMin,

        @NotNull(message = "請輸入預算上限")
        @Min(value = 1, message = "預算至少 1 元")
        @Max(value = 10_000_000, message = "預算過高")
        Integer budgetMax,

        @NotNull(message = "請選擇截止日")
        @Future(message = "截止日需在今天之後")
        LocalDate deadline,

        @NotNull(message = "請輸入修改次數上限")
        @Min(value = 0, message = "修改次數需 0–10 次")
        @Max(value = 10, message = "修改次數需 0–10 次")
        Integer revisionLimit,

        @NotNull(message = "請選擇權利歸屬")
        IpOwnership ipOwnership,

        boolean portfolioAllowed,

        @NotNull(message = "請至少填寫一項驗收標準")
        @Size(min = 1, max = 20, message = "驗收標準需 1–20 項")
        List<@NotBlank(message = "驗收標準不可空白") @Size(max = 200, message = "每項驗收標準最多 200 字") String>
                acceptanceCriteria
) {}
