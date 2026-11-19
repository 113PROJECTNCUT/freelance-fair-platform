package tw.freelancefair.application;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tw.freelancefair.application.dto.*;

@RestController
@RequestMapping("/api")
public class ApplicationController {

    private final ApplicationService service;

    public ApplicationController(ApplicationService service) {
        this.service = service;
    }

    @PostMapping("/jobs/{jobId}/applications")
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse apply(@AuthenticationPrincipal Long userId, @PathVariable Long jobId,
                                     @Valid @RequestBody ApplyRequest req) {
        return service.apply(userId, jobId, req);
    }

    @GetMapping("/jobs/{jobId}/applications")
    public List<ApplicationResponse> listForJob(@AuthenticationPrincipal Long userId, @PathVariable Long jobId) {
        return service.listForJob(userId, jobId);
    }

    @PostMapping("/jobs/{jobId}/applications/{applicationId}/accept")
    public ApplicationResponse accept(@AuthenticationPrincipal Long userId, @PathVariable Long jobId,
                                      @PathVariable Long applicationId) {
        return service.accept(userId, jobId, applicationId);
    }

    @GetMapping("/me/applications")
    public List<MyApplicationResponse> mine(@AuthenticationPrincipal Long userId) {
        return service.mine(userId);
    }

    @PostMapping("/jobs/{jobId}/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    public InvitationResponse invite(@AuthenticationPrincipal Long userId, @PathVariable Long jobId,
                                     @Valid @RequestBody InviteRequest req) {
        return service.invite(userId, jobId, req);
    }

    @GetMapping("/me/invitations")
    public List<MyInvitationResponse> myInvitations(@AuthenticationPrincipal Long userId) {
        return service.myInvitations(userId);
    }
}
