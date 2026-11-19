package tw.freelancefair.application;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    boolean existsByJobIdAndApplicantId(Long jobId, Long applicantId);

    long countByJobId(Long jobId);

    Optional<JobApplication> findByIdAndJobId(Long id, Long jobId);

    List<JobApplication> findByJobIdOrderByCreatedAtAscIdAsc(Long jobId);

    List<JobApplication> findByApplicantIdOrderByCreatedAtDescIdDesc(Long applicantId);
}
