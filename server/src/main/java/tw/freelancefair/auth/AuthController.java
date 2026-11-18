package tw.freelancefair.auth;

import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tw.freelancefair.auth.dto.AuthResponse;
import tw.freelancefair.auth.dto.LoginRequest;
import tw.freelancefair.auth.dto.RegisterRequest;
import tw.freelancefair.auth.dto.UserResponse;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** 前端用來判斷後端有沒有開 */
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @PostMapping("/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/auth/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/auth/me")
    public UserResponse me(@AuthenticationPrincipal Long userId) {
        return authService.me(userId);
    }
}
