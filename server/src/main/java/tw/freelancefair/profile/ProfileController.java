package tw.freelancefair.profile;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tw.freelancefair.profile.dto.*;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final ProfileService profiles;

    public ProfileController(ProfileService profiles) {
        this.profiles = profiles;
    }

    @GetMapping("/me/profile")
    public MyProfileResponse myProfile(@AuthenticationPrincipal Long userId) {
        return profiles.myProfile(userId);
    }

    @PutMapping("/me/profile")
    public MyProfileResponse update(@AuthenticationPrincipal Long userId, @Valid @RequestBody UpdateProfileRequest req) {
        return profiles.update(userId, req);
    }

    @PostMapping("/me/portfolio")
    @ResponseStatus(HttpStatus.CREATED)
    public PortfolioItemResponse addPortfolio(@AuthenticationPrincipal Long userId, @Valid @RequestBody PortfolioRequest req) {
        return profiles.addPortfolio(userId, req);
    }

    @DeleteMapping("/me/portfolio/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePortfolio(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        profiles.deletePortfolio(userId, id);
    }

    /** 找接案者：只列出開放接案的會員 */
    @GetMapping("/members")
    public List<MemberSummary> search(@RequestParam(required = false) String keyword,
                                      @RequestParam(required = false) String skill) {
        return profiles.searchFreelancers(keyword, skill);
    }

    @GetMapping("/members/{id}")
    public PublicProfileResponse publicProfile(@PathVariable Long id) {
        return profiles.publicProfile(id);
    }
}
