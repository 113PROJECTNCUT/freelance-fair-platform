package tw.freelancefair.job;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tw.freelancefair.job.dto.CreateJobRequest;
import tw.freelancefair.job.dto.JobResponse;

@RestController
@RequestMapping("/api")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping("/jobs")
    @ResponseStatus(HttpStatus.CREATED)
    public JobResponse create(@AuthenticationPrincipal Long userId, @Valid @RequestBody CreateJobRequest req) {
        return jobService.create(userId, req);
    }

    @GetMapping("/jobs")
    public List<JobResponse> search(@RequestParam(required = false) JobCategory category,
                                    @RequestParam(required = false) String keyword,
                                    @RequestParam(required = false) Integer minBudget,
                                    @RequestParam(required = false) Integer maxBudget) {
        return jobService.search(category, keyword, minBudget, maxBudget);
    }

    @GetMapping("/jobs/{id}")
    public JobResponse get(@PathVariable Long id) {
        return jobService.get(id);
    }

    @GetMapping("/me/jobs")
    public List<JobResponse> mine(@AuthenticationPrincipal Long userId) {
        return jobService.mine(userId);
    }
}
