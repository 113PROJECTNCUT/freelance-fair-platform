package tw.freelancefair.job.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import tw.freelancefair.job.*;

public record JobResponse(
        Long id,
        String title,
        JobCategory category,
        String description,
        int budgetMin,
        int budgetMax,
        LocalDate deadline,
        int revisionLimit,
        IpOwnership ipOwnership,
        boolean portfolioAllowed,
        List<String> acceptanceCriteria,
        JobStatus status,
        ClientInfo client,
        Instant createdAt,
        /** 目前應徵人數（openspec: add-job-application） */
        long applicationCount
) {
    /** 公開顯示的發案方資訊：不含 Email */
    public record ClientInfo(Long id, String displayName) {}

    public static JobResponse from(Job j, long applicationCount) {
        return new JobResponse(j.getId(), j.getTitle(), j.getCategory(), j.getDescription(),
                j.getBudgetMin(), j.getBudgetMax(), j.getDeadline(), j.getRevisionLimit(),
                j.getIpOwnership(), j.isPortfolioAllowed(), List.copyOf(j.getAcceptanceCriteria()),
                j.getStatus(), new ClientInfo(j.getClient().getId(), j.getClient().getDisplayName()),
                j.getCreatedAt(), applicationCount);
    }
}
