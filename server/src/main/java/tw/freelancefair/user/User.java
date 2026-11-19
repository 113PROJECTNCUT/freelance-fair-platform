package tw.freelancefair.user;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 254)
    private String email;

    /** BCrypt 雜湊，絕不存明文 */
    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(name = "display_name", nullable = false, length = 30)
    private String displayName;

    /** 存成 VARCHAR 而非 MySQL ENUM，之後新增角色不必改欄位型別 */
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** 自我介紹（公開） */
    @Column(length = 500)
    private String bio;

    /** 打開後會出現在「找接案者」（openspec: add-member-profile） */
    @Column(name = "open_for_work", nullable = false)
    private boolean openForWork;

    @ElementCollection
    @CollectionTable(name = "user_skills", joinColumns = @JoinColumn(name = "user_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "skill", nullable = false, length = 20)
    private List<String> skills = new ArrayList<>();

    protected User() {
    }

    public User(String email, String passwordHash, String displayName) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
        this.role = Role.MEMBER;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getDisplayName() { return displayName; }
    public Role getRole() { return role; }
    public Instant getCreatedAt() { return createdAt; }
    public String getBio() { return bio; }
    public boolean isOpenForWork() { return openForWork; }
    public List<String> getSkills() { return skills; }

    public void updateProfile(String displayName, String bio, List<String> skills, boolean openForWork) {
        this.displayName = displayName;
        this.bio = bio;
        this.openForWork = openForWork;
        this.skills.clear();
        this.skills.addAll(skills);
    }
}
