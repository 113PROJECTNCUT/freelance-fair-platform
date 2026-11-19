package tw.freelancefair.application;

import jakarta.persistence.*;
import java.time.Instant;
import tw.freelancefair.job.Job;
import tw.freelancefair.user.User;

/** 發案方邀請某位會員應徵（openspec: add-job-application） */
@Entity
@Table(name = "job_invitations",
        uniqueConstraints = @UniqueConstraint(name = "uk_invitation_job_invitee", columnNames = {"job_id", "invitee_id"}),
        indexes = @Index(name = "idx_invitation_invitee", columnList = "invitee_id"))
public class JobInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invitee_id", nullable = false)
    private User invitee;

    @Column(length = 200)
    private String message;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected JobInvitation() {
    }

    public JobInvitation(Job job, User invitee, String message) {
        this.job = job;
        this.invitee = invitee;
        this.message = message;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Job getJob() { return job; }
    public User getInvitee() { return invitee; }
    public String getMessage() { return message; }
    public Instant getCreatedAt() { return createdAt; }
}
