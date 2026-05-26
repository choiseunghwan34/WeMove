package kr.co.iei.auth.model.service;

import jakarta.mail.internet.MimeMessage;
import java.time.Duration;
import java.util.UUID;
import kr.co.iei.auth.model.dao.AuthDao;
import kr.co.iei.auth.model.vo.EmailVerificationEvent;
import kr.co.iei.auth.model.vo.EmailVerificationSendResponse;
import kr.co.iei.common.exception.DuplicateResourceException;
import kr.co.iei.common.websocket.WebSocketMessageBroadcaster;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailVerificationServiceImpl implements EmailVerificationService {
  private static final String VERIFY_TOKEN_KEY_PREFIX = "auth:email-verify-token:";
  private static final String VERIFIED_EMAIL_KEY_PREFIX = "auth:email-verified:";
  private static final String DEFAULT_PURPOSE = "DEFAULT";
  private static final String FIND_LOGIN_ID_PURPOSE = "FIND_LOGIN_ID";
  private static final String RESET_PASSWORD_PURPOSE = "RESET_PASSWORD";
  private static final Duration TOKEN_TTL = Duration.ofMinutes(15);
  private static final Duration VERIFIED_TTL = Duration.ofMinutes(30);

  private final AuthDao authDao;
  private final StringRedisTemplate stringRedisTemplate;
  private final WebSocketMessageBroadcaster webSocketMessageBroadcaster;
  private final ObjectProvider<JavaMailSender> mailSenderProvider;

  @Value("${wemove.email.verification-base-url:http://localhost:8456/api/auth/email/verify}")
  private String verificationBaseUrl;

  @Value("${wemove.email.from:no-reply@wemove.local}")
  private String fromEmail;

  @Override
  public EmailVerificationSendResponse sendVerificationEmail(String email) {
    String normalizedEmail = normalizeEmail(email);

    if (authDao.selectByEmail(normalizedEmail) != null) {
      throw new DuplicateResourceException("이미 사용 중인 이메일입니다.");
    }

    return sendVerification(normalizedEmail, DEFAULT_PURPOSE);
  }

  @Override
  public EmailVerificationSendResponse sendAccountRecoveryEmail(String email, String purpose) {
    String normalizedEmail = normalizeEmail(email);
    String normalizedPurpose = normalizePurpose(purpose);

    if (authDao.selectByEmail(normalizedEmail) == null) {
      throw new IllegalArgumentException("가입된 이메일이 없습니다.");
    }

    return sendVerification(normalizedEmail, normalizedPurpose);
  }

  private EmailVerificationSendResponse sendVerification(String normalizedEmail, String purpose) {
    String token = UUID.randomUUID().toString();
    String verificationUrl = verificationBaseUrl + "?token=" + token;

    stringRedisTemplate
            .opsForValue()
            .set(tokenKey(token), purpose + "|" + normalizedEmail, TOKEN_TTL);

    sendMailIfAvailable(normalizedEmail, verificationUrl);

    return new EmailVerificationSendResponse("인증 메일이 발송되었습니다.", verificationUrl);
  }

  @Override
  public String verify(String token) {
    if (token == null || token.isBlank()) {
      throw new IllegalArgumentException("이메일 인증 토큰이 없습니다.");
    }

    String tokenValue = stringRedisTemplate.opsForValue().get(tokenKey(token));
    if (tokenValue == null || tokenValue.isBlank()) {
      throw new IllegalArgumentException("이메일 인증 링크가 만료되었거나 올바르지 않습니다.");
    }

    String[] tokenParts = tokenValue.split("\\|", 2);
    String purpose = tokenParts.length == 2 ? tokenParts[0] : DEFAULT_PURPOSE;
    String email = tokenParts.length == 2 ? tokenParts[1] : tokenValue;

    stringRedisTemplate.delete(tokenKey(token));
    stringRedisTemplate.opsForValue().set(verifiedKey(email, purpose), "true", VERIFIED_TTL);
    webSocketMessageBroadcaster.broadcast(new EmailVerificationEvent("EMAIL_VERIFIED", email, true));
    return email;
  }

  @Override
  public boolean isVerified(String email) {
    String normalizedEmail = normalizeEmail(email);
    return "true".equals(
        stringRedisTemplate.opsForValue().get(verifiedKey(normalizedEmail, DEFAULT_PURPOSE)));
  }

  @Override
  public boolean isVerified(String email, String purpose) {
    String normalizedEmail = normalizeEmail(email);
    String normalizedPurpose = normalizePurpose(purpose);
    return "true".equals(
        stringRedisTemplate.opsForValue().get(verifiedKey(normalizedEmail, normalizedPurpose)));
  }

  private void sendMailIfAvailable(String email, String verificationUrl) {
    JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
    if (mailSender == null) {
      return;
    }

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
      helper.setFrom(fromEmail);
      helper.setTo(email);
      helper.setSubject("[WeMove] 이메일 인증을 완료해주세요");
      helper.setText(buildMailHtml(verificationUrl), true);
      mailSender.send(message);
    } catch (Exception e) {
      e.printStackTrace();
      // SMTP 설정이 없는 개발 환경에서는 응답의 verificationUrl로 인증 흐름을 확인합니다.
    }
  }

  private String buildMailHtml(String verificationUrl) {
    return """
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10233f">
          <h2>WeMove 이메일 인증</h2>
          <p>아래 버튼을 눌러 이메일 인증을 완료해주세요.</p>
          <p>
            <a href="%s" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">
              인증하기
            </a>
          </p>
          <p>버튼이 열리지 않으면 아래 주소를 브라우저에 붙여넣어 주세요.</p>
          <p>%s</p>
        </div>
        """
            .formatted(verificationUrl, verificationUrl);
  }

  private String normalizeEmail(String email) {
    if (email == null || email.isBlank()) {
      throw new IllegalArgumentException("이메일을 입력해주세요.");
    }

    return email.trim().toLowerCase();
  }

  private String normalizePurpose(String purpose) {
    String normalizedPurpose = purpose == null ? "" : purpose.trim().toUpperCase();
    if (FIND_LOGIN_ID_PURPOSE.equals(normalizedPurpose)
        || RESET_PASSWORD_PURPOSE.equals(normalizedPurpose)) {
      return normalizedPurpose;
    }

    throw new IllegalArgumentException("이메일 인증 목적이 올바르지 않습니다.");
  }

  private String tokenKey(String token) {
    return VERIFY_TOKEN_KEY_PREFIX + token;
  }

  private String verifiedKey(String email, String purpose) {
    return VERIFIED_EMAIL_KEY_PREFIX + purpose + ":" + email;
  }
}
