package kr.co.iei.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
  public ResponseEntity<AccessTokenResponse> login(
      @RequestBody LoginRequest request, HttpServletResponse response) {
    AuthLoginResult result = authService.login(request);

    authCookieUtil.addRefreshTokenCookie(
        response,
        result.getRefreshToken(),
        result.getRefreshTokenSeconds(),
        result.isPersistentLogin());

    return ResponseEntity.ok(new AccessTokenResponse(result.getAccessToken()));
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
}
