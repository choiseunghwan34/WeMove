package kr.co.iei.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.co.iei.auth.model.service.AuthService;
import kr.co.iei.auth.model.service.EmailVerificationService;
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
  private final EmailVerificationService emailVerificationService;
  private final AuthCookieUtil authCookieUtil;

  @GetMapping("/check-login-id")
  public ResponseEntity<Void> checkLoginId(@RequestParam String loginId) {
    authService.checkLoginId(loginId);
    return ResponseEntity.ok().build();
  }

  @GetMapping("/check-email")
  public ResponseEntity<Void> checkEmail(@RequestParam String email) {
    authService.checkEmail(email);
    return ResponseEntity.ok().build();
  }

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

  @PostMapping("/email/send")
  public ResponseEntity<EmailVerificationSendResponse> sendEmailVerification(
      @RequestBody EmailVerificationRequest request) {
    return ResponseEntity.ok(emailVerificationService.sendVerificationEmail(request.getEmail()));
  }

  @GetMapping(value = "/email/verify", produces = "text/html; charset=UTF-8")
  public ResponseEntity<String> verifyEmail(@RequestParam String token) {
    String email = emailVerificationService.verify(token);
    return ResponseEntity.ok(
        """
        <!doctype html>
        <html lang="ko">
          <head><meta charset="UTF-8"><title>WeMove 이메일 인증</title></head>
          <body style="font-family:Arial,sans-serif;padding:32px;color:#10233f">
            <h1>이메일 인증이 완료되었습니다.</h1>
            <p>%s 주소 인증이 완료되었습니다. 회원가입 화면으로 돌아가 진행해주세요.</p>
          </body>
        </html>
        """
            .formatted(email));
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
