package tw.freelancefair.application.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InviteRequest(
        @NotNull(message = "請選擇要邀請的會員")
        Long freelancerId,

        @Size(max = 200, message = "訊息最多 200 字")
        String message
) {}
