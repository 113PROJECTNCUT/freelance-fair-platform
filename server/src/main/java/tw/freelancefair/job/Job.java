package tw.freelancefair.job;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import tw.freelancefair.user.User;

@Entity
@Table(name = "jobs", indexes = {
        @Index(name = "idx_jobs_status_created", columnList = "status, created_at"),
        @Index(name = "idx_jobs_client", columnList = "client_id")
})
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @Column(nullable = false, length = 60)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobCategory category;

    @Column(nullable = false, length = 3000)
    private String description;

    @Column(name = "budget_min", nullable = false)
    private int budgetMin;

    @Column(name = "budget_max", nullable = false)
    private int budgetMax;

    @Column(nullable = false)
    private LocalDate deadline;

    @Column(name = "revision_limit", nullable = false)
    private int revisionLimit;

    @Enumerated(EnumType.STRING)
    @Column(name = "ip_ownership", nullable = false, length = 30)
    private IpOwnership ipOwnership;

    @Column(name = "portfolio_allowed", nullable = false)
    private boolean portfolioAllowed;

    @ElementCollection
    @CollectionTable(name = "job_acceptance_items", joinColumns = @JoinColumn(name = "job_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "item", nullable = false, length = 200)
    private List<String> acceptanceCriteria = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobStatus status = JobStatus.OPEN;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Job() {
    }

    public Job(User client, String title, JobCategory category, String description, int budgetMin, int budgetMax,
               LocalDate deadline, int revisionLimit, IpOwnership ipOwnership, boolean portfolioAllowed,
               List<String> acceptanceCriteria) {
        this.client = client;
        this.title = title;
        this.category = category;
        this.description = description;
        this.budgetMin = budgetMin;
        this.budgetMax = budgetMax;
        this.deadline = deadline;
        this.revisionLimit = revisionLimit;
        this.ipOwnership = ipOwnership;
        this.portfolioAllowed = portfolioAllowed;
        this.acceptanceCriteria = new ArrayList<>(acceptanceCriteria);
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    /** 選定接案者後改為進行中（openspec: add-job-application） */
    public void startWork() {
        this.status = JobStatus.IN_PROGRESS;
    }

    public Long getId() { return id; }
    public User getClient() { return client; }
    public String getTitle() { return title; }
    public JobCategory getCategory() { return category; }
    public String getDescription() { return description; }
    public int getBudgetMin() { return budgetMin; }
    public int getBudgetMax() { return budgetMax; }
    public LocalDate getDeadline() { return deadline; }
    public int getRevisionLimit() { return revisionLimit; }
    public IpOwnership getIpOwnership() { return ipOwnership; }
    public boolean isPortfolioAllowed() { return portfolioAllowed; }
    public List<String> getAcceptanceCriteria() { return acceptanceCriteria; }
    public JobStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
