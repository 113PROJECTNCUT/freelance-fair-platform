package tw.freelancefair.profile.dto;

import java.time.Instant;
import tw.freelancefair.profile.PortfolioItem;

public record PortfolioItemResponse(Long id, String title, String description, String link, Instant createdAt) {
    public static PortfolioItemResponse from(PortfolioItem p) {
        return new PortfolioItemResponse(p.getId(), p.getTitle(), p.getDescription(), p.getLink(), p.getCreatedAt());
    }
}
