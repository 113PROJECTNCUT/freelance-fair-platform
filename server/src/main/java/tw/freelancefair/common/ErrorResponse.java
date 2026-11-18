package tw.freelancefair.common;

import java.util.List;

/** 統一錯誤格式：{ message, errors: [{ field, message }] } */
public record ErrorResponse(String message, List<FieldMessage> errors) {
    public record FieldMessage(String field, String message) {}

    public static ErrorResponse of(String message) {
        return new ErrorResponse(message, List.of());
    }
}
