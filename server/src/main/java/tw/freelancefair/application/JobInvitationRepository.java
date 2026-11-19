package tw.freelancefair.application;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobInvitationRepository extends JpaRepository<JobInvitation, Long> {

    boolean existsByJobIdAndInviteeId(Long jobId, Long inviteeId);

    List<JobInvitation> findByInviteeIdOrderByCreatedAtDescIdDesc(Long inviteeId);
}
