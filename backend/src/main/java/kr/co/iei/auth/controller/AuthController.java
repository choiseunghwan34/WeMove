package kr.co.iei.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import kr.co.iei.auth.exception.DuplicateLoginException;
import kr.co.iei.auth.model.service.AuthService;
import kr.co.iei.auth.model.vo.*;
import kr.co.iei.auth.util.AuthCookieUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
  private final AuthService authService;
  private final AuthCookieUtil authCookieUtil;

  @PostMapping("/signup")
  public ResponseEntity<Void> signup(@RequestBody SignupRequest request) {
    authService.signup(request);
    return ResponseEntity.ok().build();
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(
      @RequestBody LoginRequest request, HttpServletResponse response) {
    try {
      AuthLoginResult result = authService.login(request);

      authCookieUtil.addRefreshTokenCookie(
          response,
          result.getRefreshToken(),
          result.getRefreshTokenSeconds(),
          result.isPersistentLogin());

      return ResponseEntity.ok(new AccessTokenResponse(result.getAccessToken()));
    } catch (DuplicateLoginException exception) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body(
              Map.of(
                  "code", "DUPLICATE_LOGIN_REQUIRED",
                  "message", "이미 로그인 중인 사용자가 있습니다. 계속 로그인하시겠습니까?"));
    }
  }

  @PostMapping("/refresh")
  public ResponseEntity<AccessTokenResponse> refresh(
      HttpServletRequest request, HttpServletResponse response) {
    try {
      String refreshToken =
          authCookieUtil.getCookieValue(request, AuthCookieUtil.REFRESH_TOKEN_COOKIE);
      AuthRefreshResult result = authService.refresh(refreshToken);
      return ResponseEntity.ok(new AccessTokenResponse(result.getAccessToken()));
    } catch (IllegalArgumentException exception) {
      authCookieUtil.clearRefreshTokenCookie(response);
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(
      HttpServletRequest request, HttpServletResponse response) {
    String refreshToken =
        authCookieUtil.getCookieValue(request, AuthCookieUtil.REFRESH_TOKEN_COOKIE);
    authService.logout(refreshToken);
    authCookieUtil.clearRefreshTokenCookie(response);
    return ResponseEntity.ok().build();
  }

  @GetMapping("/session-status")
  public ResponseEntity<?> sessionStatus(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
    String accessToken = extractBearerToken(authorizationHeader);
    if (!authService.isCurrentSession(accessToken)) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body(
              Map.of(
                  "code", "DUPLICATE_LOGIN_LOGOUT",
                  "message", "다른 곳에서 로그인 요청이 있어 로그아웃되었습니다."));
    }

    return ResponseEntity.ok().build();
  }

  private String extractBearerToken(String authorizationHeader) {
    if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
      return null;
    }
    return authorizationHeader.substring(7);
  }
}
