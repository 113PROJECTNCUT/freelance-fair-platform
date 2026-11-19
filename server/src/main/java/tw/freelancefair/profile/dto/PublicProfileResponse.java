package tw.freelancefair.profile.dto;

import java.time.Instant;
import java.util.List;

/** 公開檔案：刻意不含 Email */
public record PublicProfileResponse(
        Long id, String displayName, String bio, List<String> skills, boolean openForWork,
        List<PortfolioItemResponse> portfolio, Instant createdAt) {}
