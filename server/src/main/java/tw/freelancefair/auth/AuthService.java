package tw.freelancefair.auth;

import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tw.freelancefair.auth.dto.AuthResponse;
import tw.freelancefair.auth.dto.LoginRequest;
import tw.freelancefair.auth.dto.RegisterRequest;
import tw.freelancefair.auth.dto.UserResponse;
import tw.freelancefair.common.ApiException;
import tw.freelancefair.security.JwtService;
import tw.freelancefair.user.User;
import tw.freelancefair.user.UserRepository;

@Service
public class AuthService {

    /** 登入失敗一律回同一句，不透露是 Email 不存在還是密碼錯 */
    static final String BAD_CREDENTIALS = "Email 或密碼錯誤";

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public UserResponse register(RegisterRequest req) {
        String email = normalize(req.email());
        if (users.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "此 Email 已被註冊", "email");
        }
        User user = new User(email, passwordEncoder.encode(req.password()), req.displayName().trim());
        return UserResponse.from(users.save(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = users.findByEmail(normalize(req.email()))
                .filter(u -> passwordEncoder.matches(req.password(), u.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, BAD_CREDENTIALS));
        return new AuthResponse(jwtService.generate(user), UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public UserResponse me(Long userId) {
        return users.findById(userId)
                .map(UserResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "請先登入"));
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
