package tw.freelancefair.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import tw.freelancefair.user.Role;

public record RegisterRequest(
        @NotBlank(message = "請輸入 Email")
        @Email(message = "Email 格式不正確")
        @Size(max = 254, message = "Email 太長")
        String email,

        @NotBlank(message = "請輸入密碼")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,72}$",
                message = "密碼需 8–72 碼，且同時包含英文字母與數字")
        String password,

        @NotBlank(message = "請輸入顯示名稱")
        @Size(max = 30, message = "顯示名稱最多 30 字")
        String displayName,

        @NotNull(message = "請選擇身分")
        Role role
) {}
