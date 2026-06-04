package kr.co.iei.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(DuplicateResourceException.class)
  public ResponseEntity<ApiErrorResponse> handleDuplicateResource(
      DuplicateResourceException exception) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(new ApiErrorResponse(exception.getMessage()));
  }

  @ExceptionHandler(AccountSuspendedException.class)
  public ResponseEntity<ApiErrorResponse> handleAccountSuspended(
      AccountSuspendedException exception) {
    return ResponseEntity.status(HttpStatus.LOCKED)
        .body(new ApiErrorResponse(exception.getMessage()));
  }

  @ExceptionHandler({
    IllegalArgumentException.class,
    MethodArgumentNotValidException.class
  })
  public ResponseEntity<ApiErrorResponse> handleBadRequest(Exception exception) {
    return ResponseEntity.badRequest().body(new ApiErrorResponse(exception.getMessage()));
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ApiErrorResponse> handleResponseStatus(ResponseStatusException exception) {
    return ResponseEntity.status(exception.getStatusCode())
        .body(new ApiErrorResponse(exception.getReason()));
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<ApiErrorResponse> handleMethodNotSupported(
      HttpRequestMethodNotSupportedException exception) {
    return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
        .body(new ApiErrorResponse(exception.getMessage()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception exception) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new ApiErrorResponse(exception.getMessage()));
  }
}
