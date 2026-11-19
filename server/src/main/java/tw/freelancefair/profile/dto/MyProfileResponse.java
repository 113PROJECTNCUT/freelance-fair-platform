package tw.freelancefair.profile.dto;

import java.time.Instant;
import java.util.List;
import tw.freelancefair.user.Role;

/** 自己看的資料：含 Email */
public record MyProfileResponse(
        Long id, String email, String displayName, Role role, String bio, List<String> skills,
        boolean openForWork, List<PortfolioItemResponse> portfolio, Instant createdAt) {}
