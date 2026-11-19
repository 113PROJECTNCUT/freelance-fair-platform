package tw.freelancefair.application.dto;

import java.time.Instant;
import tw.freelancefair.application.ApplicationStatus;
import tw.freelancefair.application.JobApplication;
import tw.freelancefair.job.JobStatus;

/** 我送出的應徵 */
public record MyApplicationResponse(
        Long id,
        Long jobId,
        String jobTitle,
        JobStatus jobStatus,
        int quotedPrice,
        int estimatedDays,
        ApplicationStatus status,
        Instant createdAt
) {
    public static MyApplicationResponse from(JobApplication a) {
        return new MyApplicationResponse(a.getId(), a.getJob().getId(), a.getJob().getTitle(), a.getJob().getStatus(),
                a.getQuotedPrice(), a.getEstimatedDays(), a.getStatus(), a.getCreatedAt());
    }
}
