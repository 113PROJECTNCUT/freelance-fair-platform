package tw.freelancefair.application.dto;

import java.time.Instant;
import tw.freelancefair.application.JobInvitation;

/** 發案方送出邀請後的回應 */
public record InvitationResponse(Long id, Long jobId, Long inviteeId, String message, Instant createdAt) {
    public static InvitationResponse from(JobInvitation i) {
        return new InvitationResponse(i.getId(), i.getJob().getId(), i.getInvitee().getId(), i.getMessage(), i.getCreatedAt());
    }
}
