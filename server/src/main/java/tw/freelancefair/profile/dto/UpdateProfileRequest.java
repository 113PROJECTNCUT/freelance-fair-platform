package tw.freelancefair.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdateProfileRequest(
        @NotBlank(message = "請輸入顯示名稱")
        @Size(max = 30, message = "顯示名稱最多 30 字")
        String displayName,

        @Size(max = 500, message = "自我介紹最多 500 字")
        String bio,

        @Size(max = 10, message = "技能最多 10 個")
        List<@NotBlank(message = "技能不可空白") @Size(max = 20, message = "每個技能最多 20 字") String> skills,

        boolean openForWork
) {}
