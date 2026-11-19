package tw.freelancefair.application;

import jakarta.persistence.*;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import tw.freelancefair.job.Job;
import tw.freelancefair.user.User;

/** 應徵（openspec: add-job-application） */
@Entity
@Table(name = "job_applications",
        uniqueConstraints = @UniqueConstraint(name = "uk_application_job_applicant", columnNames = {"job_id", "applicant_id"}),
        indexes = @Index(name = "idx_application_applicant", columnList = "applicant_id"))
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    /** 自我推薦 */
    @Column(nullable = false, length = 1000)
    private String message;

    @Column(name = "quoted_price", nullable = false)
    private int quotedPrice;

    @Column(name = "estimated_days", nullable = false)
    private int estimatedDays;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected JobApplication() {
    }

    public JobApplication(Job job, User applicant, String message, int quotedPrice, int estimatedDays) {
        this.job = job;
        this.applicant = applicant;
        this.message = message;
        this.quotedPrice = quotedPrice;
        this.estimatedDays = estimatedDays;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public void accept() { this.status = ApplicationStatus.ACCEPTED; }
    public void reject() { this.status = ApplicationStatus.REJECTED; }

    public Long getId() { return id; }
    public Job getJob() { return job; }
    public User getApplicant() { return applicant; }
    public String getMessage() { return message; }
    public int getQuotedPrice() { return quotedPrice; }
    public int getEstimatedDays() { return estimatedDays; }
    public ApplicationStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
