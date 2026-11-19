package tw.freelancefair.application.dto;

import java.time.Instant;
import tw.freelancefair.application.JobInvitation;
import tw.freelancefair.job.JobStatus;

/** 我收到的邀請；applied 表示自己是否已應徵該案件 */
public record MyInvitationResponse(
        Long id,
        Long jobId,
        String jobTitle,
        JobStatus jobStatus,
        ClientInfo client,
        String message,
        boolean applied,
        Instant createdAt
) {
    public record ClientInfo(Long id, String displayName) {}

    public static MyInvitationResponse from(JobInvitation i, boolean applied) {
        var job = i.getJob();
        return new MyInvitationResponse(i.getId(), job.getId(), job.getTitle(), job.getStatus(),
                new ClientInfo(job.getClient().getId(), job.getClient().getDisplayName()),
                i.getMessage(), applied, i.getCreatedAt());
    }
}
