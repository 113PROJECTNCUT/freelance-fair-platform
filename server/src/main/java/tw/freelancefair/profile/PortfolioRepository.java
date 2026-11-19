package tw.freelancefair.profile;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioRepository extends JpaRepository<PortfolioItem, Long> {
    List<PortfolioItem> findByOwnerIdOrderByCreatedAtDescIdDesc(Long ownerId);
    long countByOwnerId(Long ownerId);
    Optional<PortfolioItem> findByIdAndOwnerId(Long id, Long ownerId);
}
