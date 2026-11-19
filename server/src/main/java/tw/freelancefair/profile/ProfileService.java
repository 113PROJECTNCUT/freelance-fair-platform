package tw.freelancefair.profile;

import jakarta.persistence.criteria.Join;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tw.freelancefair.common.ApiException;
import tw.freelancefair.profile.dto.*;
import tw.freelancefair.user.User;
import tw.freelancefair.user.UserRepository;

@Service
public class ProfileService {

    static final int MAX_PORTFOLIO = 20;
    static final int MAX_RESULTS = 100;

    private final UserRepository users;
    private final PortfolioRepository portfolio;

    public ProfileService(UserRepository users, PortfolioRepository portfolio) {
        this.users = users;
        this.portfolio = portfolio;
    }

    // ── 自己的資料 ──

    @Transactional(readOnly = true)
    public MyProfileResponse myProfile(Long userId) {
        User u = load(userId, HttpStatus.UNAUTHORIZED);
        return new MyProfileResponse(u.getId(), u.getEmail(), u.getDisplayName(), u.getRole(), u.getBio(),
                List.copyOf(u.getSkills()), u.isOpenForWork(), portfolioOf(u.getId()), u.getCreatedAt());
    }

    @Transactional
    public MyProfileResponse update(Long userId, UpdateProfileRequest req) {
        User u = load(userId, HttpStatus.UNAUTHORIZED);
        u.updateProfile(req.displayName().trim(), blankToNull(req.bio()), normalizeSkills(req.skills()), req.openForWork());
        return myProfile(userId);
    }

    @Transactional
    public PortfolioItemResponse addPortfolio(Long userId, PortfolioRequest req) {
        User u = load(userId, HttpStatus.UNAUTHORIZED);
        if (portfolio.countByOwnerId(userId) >= MAX_PORTFOLIO) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "作品集最多 " + MAX_PORTFOLIO + " 項");
        }
        var item = new PortfolioItem(u, req.title().trim(), blankToNull(req.description()), blankToNull(req.link()));
        return PortfolioItemResponse.from(portfolio.save(item));
    }

    /** 只能刪自己的；別人的一律回 404，不透露是否存在 */
    @Transactional
    public void deletePortfolio(Long userId, Long itemId) {
        var item = portfolio.findByIdAndOwnerId(itemId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "找不到這個作品"));
        portfolio.delete(item);
    }

    // ── 公開 ──

    @Transactional(readOnly = true)
    public PublicProfileResponse publicProfile(Long id) {
        User u = load(id, HttpStatus.NOT_FOUND);
        return new PublicProfileResponse(u.getId(), u.getDisplayName(), u.getBio(), List.copyOf(u.getSkills()),
                u.isOpenForWork(), portfolioOf(u.getId()), u.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<MemberSummary> searchFreelancers(String keyword, String skill) {
        Specification<User> spec = openForWork().and(containsKeyword(keyword)).and(hasSkill(skill));
        var page = PageRequest.of(0, MAX_RESULTS, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return users.findAll(spec, page).map(u -> new MemberSummary(u.getId(), u.getDisplayName(), u.getBio(),
                List.copyOf(u.getSkills()), portfolio.countByOwnerId(u.getId()), u.getCreatedAt())).toList();
    }

    // ── 查詢條件 ──

    private static Specification<User> openForWork() {
        return (root, q, cb) -> cb.isTrue(root.get("openForWork"));
    }

    private static Specification<User> containsKeyword(String keyword) {
        return (root, q, cb) -> {
            if (keyword == null || keyword.isBlank()) return null;
            String like = "%" + keyword.trim().toLowerCase(Locale.ROOT).replace("%", "\\%").replace("_", "\\_") + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("displayName")), like, '\\'),
                    cb.like(cb.lower(root.get("bio")), like, '\\'));
        };
    }

    private static Specification<User> hasSkill(String skill) {
        return (root, q, cb) -> {
            if (skill == null || skill.isBlank()) return null;
            q.distinct(true);
            Join<User, String> s = root.join("skills");
            return cb.equal(cb.lower(s), skill.trim().toLowerCase(Locale.ROOT));
        };
    }

    // ── 工具 ──

    private User load(Long id, HttpStatus notFound) {
        return users.findById(id).orElseThrow(() -> new ApiException(notFound,
                notFound == HttpStatus.UNAUTHORIZED ? "請先登入" : "找不到這位會員"));
    }

    private List<PortfolioItemResponse> portfolioOf(Long ownerId) {
        return portfolio.findByOwnerIdOrderByCreatedAtDescIdDesc(ownerId).stream().map(PortfolioItemResponse::from).toList();
    }

    /** trim、去掉空白，大小寫不同視為同一個技能（保留第一次的寫法） */
    static List<String> normalizeSkills(List<String> skills) {
        if (skills == null) return List.of();
        Map<String, String> seen = new LinkedHashMap<>();
        for (String s : skills) {
            String t = s.trim();
            if (!t.isEmpty()) seen.putIfAbsent(t.toLowerCase(Locale.ROOT), t);
        }
        return List.copyOf(seen.values());
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
