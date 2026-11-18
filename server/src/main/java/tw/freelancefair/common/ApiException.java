package tw.freelancefair.common;

import org.springframework.http.HttpStatus;

/** 業務錯誤：帶 HTTP 狀態與給使用者看的訊息 */
public class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final String field;

    public ApiException(HttpStatus status, String message) {
        this(status, message, null);
    }

    public ApiException(HttpStatus status, String message, String field) {
        super(message);
        this.status = status;
        this.field = field;
    }

    public HttpStatus getStatus() { return status; }
    public String getField() { return field; }
}
