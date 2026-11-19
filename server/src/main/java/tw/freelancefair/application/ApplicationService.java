package tw.freelancefair.application;

import java.util.List;
import java.util.Objects;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tw.freelancefair.application.dto.*;
import tw.freelancefair.common.ApiException;
import tw.freelancefair.job.Job;
import tw.freelancefair.job.JobRepository;
import tw.freelancefair.job.JobStatus;
import tw.freelancefair.user.User;
import tw.freelancefair.user.UserRepository;

/**
 * 應徵、選定接案者、邀請（openspec: add-job-application）。
 * 權限依「與案件的關係」判斷：刊登者是發案方，不能應徵自己的案件。
 */
@Service
public class ApplicationService {

    private final JobApplicationRepository applications;
    private final JobInvitationRepository invitations;
    private final JobRepository jobs;
    private final UserRepository users;

    public ApplicationService(JobApplicationRepository applications, JobInvitationRepository invitations,
                              JobRepository jobs, UserRepository users) {
        this.applications = applications;
        this.invitations = invitations;
        this.jobs = jobs;
        this.users = users;
    }

    // ── 應徵 ──

    @Transactional
    public ApplicationResponse apply(Long userId, Long jobId, ApplyRequest req) {
        User applicant = users.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "請先登入"));
        Job job = loadJob(jobId);
        if (isClient(job, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "不能應徵自己刊登的案件");
        }
        requireOpen(job);
        if (applications.existsByJobIdAndApplicantId(jobId, userId)) {
            throw new ApiException(HttpStatus.CONFLICT, "你已經應徵過這個案件");
        }
        try {
            var saved = applications.saveAndFlush(new JobApplication(job, applicant, req.message().trim(),
                    req.quotedPrice(), req.estimatedDays()));
            return ApplicationResponse.from(saved);
        } catch (DataIntegrityViolationException e) {
            // 同時送出兩次時，由資料庫唯一約束擋下
            throw new ApiException(HttpStatus.CONFLICT, "你已經應徵過這個案件");
        }
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> listForJob(Long userId, Long jobId) {
        Job job = loadJob(jobId);
        requireClient(job, userId, "只有發案方可以查看應徵");
        return applications.findByJobIdOrderByCreatedAtAscIdAsc(jobId).stream().map(ApplicationResponse::from).toList();
    }

    /** 選定接案者：被選者錄取、其他待審者未錄取、案件改為進行中 */
    @Transactional
    public ApplicationResponse accept(Long userId, Long jobId, Long applicationId) {
        // 鎖住案件，避免兩個請求同時選定兩個人
        Job job = jobs.findForUpdate(jobId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "找不到這個案件"));
        requireClient(job, userId, "只有發案方可以選定接案者");
        if (job.getStatus() != JobStatus.OPEN) {
            throw new ApiException(HttpStatus.CONFLICT, "這個案件已經選定接案者或不在招募中");
        }
        JobApplication chosen = applications.findByIdAndJobId(applicationId, jobId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "找不到這筆應徵"));
        if (chosen.getStatus() != ApplicationStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT, "這筆應徵已經處理過");
        }
        for (JobApplication a : applications.findByJobIdOrderByCreatedAtAscIdAsc(jobId)) {
            if (a.getId().equals(chosen.getId())) a.accept();
            else if (a.getStatus() == ApplicationStatus.PENDING) a.reject();
        }
        job.startWork();
        return ApplicationResponse.from(chosen);
    }

    @Transactional(readOnly = true)
    public List<MyApplicationResponse> mine(Long userId) {
        return applications.findByApplicantIdOrderByCreatedAtDescIdDesc(userId).stream()
                .map(MyApplicationResponse::from).toList();
    }

    // ── 邀請 ──

    @Transactional
    public InvitationResponse invite(Long userId, Long jobId, InviteRequest req) {
        Job job = loadJob(jobId);
        requireClient(job, userId, "只能用自己刊登的案件邀請");
        requireOpen(job);
        User invitee = users.findById(req.freelancerId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "找不到這位會員"));
        if (invitee.getId().equals(userId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "不能邀請自己", "freelancerId");
        }
        if (!invitee.isOpenForWork()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "對方目前未開放接案", "freelancerId");
        }
        if (invitations.existsByJobIdAndInviteeId(jobId, invitee.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "已經邀請過這位會員");
        }
        if (applications.existsByJobIdAndApplicantId(jobId, invitee.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "對方已經應徵這個案件");
        }
        String message = req.message() == null || req.message().isBlank() ? null : req.message().trim();
        try {
            return InvitationResponse.from(invitations.saveAndFlush(new JobInvitation(job, invitee, message)));
        } catch (DataIntegrityViolationException e) {
            throw new ApiException(HttpStatus.CONFLICT, "已經邀請過這位會員");
        }
    }

    @Transactional(readOnly = true)
    public List<MyInvitationResponse> myInvitations(Long userId) {
        return invitations.findByInviteeIdOrderByCreatedAtDescIdDesc(userId).stream()
                .map(i -> MyInvitationResponse.from(i,
                        applications.existsByJobIdAndApplicantId(i.getJob().getId(), userId)))
                .toList();
    }

    // ── 工具 ──

    private Job loadJob(Long jobId) {
        return jobs.findById(jobId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "找不到這個案件"));
    }

    private static boolean isClient(Job job, Long userId) {
        return Objects.equals(job.getClient().getId(), userId);
    }

    private static void requireClient(Job job, Long userId, String message) {
        if (!isClient(job, userId)) throw new ApiException(HttpStatus.FORBIDDEN, message);
    }

    private static void requireOpen(Job job) {
        if (job.getStatus() != JobStatus.OPEN) {
            throw new ApiException(HttpStatus.CONFLICT, "這個案件已不在招募中");
        }
    }
}
