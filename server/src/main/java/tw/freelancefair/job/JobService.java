package tw.freelancefair.job;

import static tw.freelancefair.job.JobRepository.*;

import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tw.freelancefair.common.ApiException;
import tw.freelancefair.job.dto.CreateJobRequest;
import tw.freelancefair.job.dto.JobResponse;
import tw.freelancefair.user.Role;
import tw.freelancefair.user.User;
import tw.freelancefair.user.UserRepository;

@Service
public class JobService {

    static final int MAX_RESULTS = 100;

    private final JobRepository jobs;
    private final UserRepository users;

    public JobService(JobRepository jobs, UserRepository users) {
        this.jobs = jobs;
        this.users = users;
    }

    @Transactional
    public JobResponse create(Long userId, CreateJobRequest req) {
        User client = users.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "請先登入"));
        if (client.getRole() != Role.CLIENT) {
            throw new ApiException(HttpStatus.FORBIDDEN, "只有發案方可以刊登案件");
        }
        if (req.budgetMin() > req.budgetMax()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "預算上限不可低於下限", "budgetMax");
        }
        List<String> criteria = req.acceptanceCriteria().stream().map(String::trim).toList();
        Job job = new Job(client, req.title().trim(), req.category(), req.description().trim(),
                req.budgetMin(), req.budgetMax(), req.deadline(), req.revisionLimit(),
                req.ipOwnership(), req.portfolioAllowed(), criteria);
        return JobResponse.from(jobs.save(job));
    }

    @Transactional(readOnly = true)
    public List<JobResponse> search(JobCategory category, String keyword, Integer minBudget, Integer maxBudget) {
        var spec = hasStatus(JobStatus.OPEN)
                .and(inCategory(category))
                .and(containsKeyword(keyword))
                .and(budgetAtLeast(minBudget))
                .and(budgetAtMost(maxBudget));
        var page = PageRequest.of(0, MAX_RESULTS, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return jobs.findAll(spec, page).map(JobResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public JobResponse get(Long id) {
        return jobs.findById(id).map(JobResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "找不到這個案件"));
    }

    @Transactional(readOnly = true)
    public List<JobResponse> mine(Long userId) {
        return jobs.findByClientIdOrderByCreatedAtDesc(userId).stream().map(JobResponse::from).toList();
    }
}
