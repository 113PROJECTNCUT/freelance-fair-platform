package tw.freelancefair.profile.dto;

import java.time.Instant;
import java.util.List;

/** 找接案者列表用的精簡資料 */
public record MemberSummary(
        Long id, String displayName, String bio, List<String> skills, long portfolioCount, Instant createdAt) {}
