package tw.freelancefair.auth.dto;

import java.time.Instant;
import tw.freelancefair.user.Role;
import tw.freelancefair.user.User;

/** 回給前端的使用者資料：刻意不含密碼雜湊 */
public record UserResponse(Long id, String email, String displayName, Role role, Instant createdAt) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getEmail(), u.getDisplayName(), u.getRole(), u.getCreatedAt());
    }
}
