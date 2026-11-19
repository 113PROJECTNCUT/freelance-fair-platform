package tw.freelancefair.job;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    List<Job> findByClientIdOrderByCreatedAtDesc(Long clientId);

    /** 選定接案者時使用：SELECT … FOR UPDATE */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select j from Job j where j.id = :id")
    Optional<Job> findForUpdate(@Param("id") Long id);

    static Specification<Job> hasStatus(JobStatus status) {
        return (root, q, cb) -> cb.equal(root.get("status"), status);
    }

    static Specification<Job> inCategory(JobCategory category) {
        return (root, q, cb) -> category == null ? null : cb.equal(root.get("category"), category);
    }

    /** 標題或描述包含關鍵字（不分大小寫） */
    static Specification<Job> containsKeyword(String keyword) {
        return (root, q, cb) -> {
            if (keyword == null || keyword.isBlank()) return null;
            String like = "%" + keyword.trim().toLowerCase(java.util.Locale.ROOT).replace("%", "\\%").replace("_", "\\_") + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), like, '\\'),
                    cb.like(cb.lower(root.get("description")), like, '\\'));
        };
    }

    /** 發案方預算上限至少到 min（接案者希望至少拿到 min） */
    static Specification<Job> budgetAtLeast(Integer min) {
        return (root, q, cb) -> min == null ? null : cb.greaterThanOrEqualTo(root.get("budgetMax"), min);
    }

    /** 預算下限不超過 max（找 max 以內的案件） */
    static Specification<Job> budgetAtMost(Integer max) {
        return (root, q, cb) -> max == null ? null : cb.lessThanOrEqualTo(root.get("budgetMin"), max);
    }
}
