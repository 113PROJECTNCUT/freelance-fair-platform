package tw.freelancefair.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tw.freelancefair.user.User;

@Service
public class JwtService {

    private final SecretKey key;
    private final Duration ttl;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET 至少需要 32 個字元");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.ttl = Duration.ofMinutes(expirationMinutes);
    }

    public String generate(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .signWith(key)
                .compact();
    }

    /** 驗證簽章與到期時間，成功回傳使用者 id */
    public Optional<Long> parseUserId(String token) {
        try {
            String sub = Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(token).getPayload().getSubject();
            return Optional.of(Long.valueOf(sub));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
