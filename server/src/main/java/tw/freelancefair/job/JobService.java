package tw.freelancefair.job;

import static tw.freelancefair.job.JobRepository.*;

import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tw.freelancefair.application.JobApplicationRepository;
import tw.freelancefair.common.ApiException;
import tw.freelancefair.job.dto.CreateJobRequest;
import tw.freelancefair.job.dto.JobResponse;
import tw.freelancefair.user.User;
import tw.freelancefair.user.UserRepository;

@Service
public class JobService {

    static final int MAX_RESULTS = 100;

    private final JobRepository jobs;
    private final UserRepository users;
    private final JobApplicationRepository applications;

    public JobService(JobRepository jobs, UserRepository users, JobApplicationRepository applications) {
        this.jobs = jobs;
        this.users = users;
        this.applications = applications;
    }

    private JobResponse toResponse(Job job) {
        return JobResponse.from(job, applications.countByJobId(job.getId()));
    }

    @Transactional
    public JobResponse create(Long userId, CreateJobRequest req) {
        // 任何會員都能刊登，刊登者就是這個案件的發案方
        User client = users.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "請先登入"));
        if (req.budgetMin() > req.budgetMax()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "預算上限不可低於下限", "budgetMax");
        }
        List<String> criteria = req.acceptanceCriteria().stream().map(String::trim).toList();
        Job job = new Job(client, req.title().trim(), req.category(), req.description().trim(),
                req.budgetMin(), req.budgetMax(), req.deadline(), req.revisionLimit(),
                req.ipOwnership(), req.portfolioAllowed(), criteria);
        return JobResponse.from(jobs.save(job), 0);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> search(JobCategory category, String keyword, Integer minBudget, Integer maxBudget) {
        var spec = hasStatus(JobStatus.OPEN)
                .and(inCategory(category))
                .and(containsKeyword(keyword))
                .and(budgetAtLeast(minBudget))
                .and(budgetAtMost(maxBudget));
        var page = PageRequest.of(0, MAX_RESULTS, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return jobs.findAll(spec, page).map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public JobResponse get(Long id) {
        return jobs.findById(id).map(this::toResponse)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "找不到這個案件"));
    }

    @Transactional(readOnly = true)
    public List<JobResponse> mine(Long userId) {
        return jobs.findByClientIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }
}
