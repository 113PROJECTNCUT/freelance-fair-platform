package tw.freelancefair.profile;

import jakarta.persistence.*;
import java.time.Instant;
import tw.freelancefair.user.User;

@Entity
@Table(name = "portfolio_items", indexes = @Index(name = "idx_portfolio_owner", columnList = "owner_id"))
public class PortfolioItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 60)
    private String title;

    @Column(length = 500)
    private String description;

    /** 只允許 http(s)，避免 javascript: 連結 */
    @Column(length = 300)
    private String link;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected PortfolioItem() {
    }

    public PortfolioItem(User owner, String title, String description, String link) {
        this.owner = owner;
        this.title = title;
        this.description = description;
        this.link = link;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public User getOwner() { return owner; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getLink() { return link; }
    public Instant getCreatedAt() { return createdAt; }
}
