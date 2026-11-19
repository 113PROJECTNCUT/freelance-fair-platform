package tw.freelancefair.application.dto;

import java.time.Instant;
import tw.freelancefair.application.ApplicationStatus;
import tw.freelancefair.application.JobApplication;

/** 應徵資料（應徵者本人與該案發案方看得到）；不含 Email */
public record ApplicationResponse(
        Long id,
        Long jobId,
        ApplicantInfo applicant,
        String message,
        int quotedPrice,
        int estimatedDays,
        ApplicationStatus status,
        Instant createdAt
) {
    public record ApplicantInfo(Long id, String displayName) {}

    public static ApplicationResponse from(JobApplication a) {
        return new ApplicationResponse(a.getId(), a.getJob().getId(),
                new ApplicantInfo(a.getApplicant().getId(), a.getApplicant().getDisplayName()),
                a.getMessage(), a.getQuotedPrice(), a.getEstimatedDays(), a.getStatus(), a.getCreatedAt());
    }
}
