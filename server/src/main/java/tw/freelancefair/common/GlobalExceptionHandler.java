package tw.freelancefair.common;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApi(ApiException e) {
        List<ErrorResponse.FieldMessage> errors = e.getField() == null
                ? List.of()
                : List.of(new ErrorResponse.FieldMessage(e.getField(), e.getMessage()));
        return ResponseEntity.status(e.getStatus()).body(new ErrorResponse(e.getMessage(), errors));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        List<ErrorResponse.FieldMessage> errors = e.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ErrorResponse.FieldMessage(fe.getField(), fe.getDefaultMessage()))
                .toList();
        return ResponseEntity.badRequest().body(new ErrorResponse("輸入資料有誤", errors));
    }

    /** JSON 格式錯誤，或 role 不是合法的值 */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadable(HttpMessageNotReadableException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ErrorResponse.of("請求格式錯誤"));
    }
}
