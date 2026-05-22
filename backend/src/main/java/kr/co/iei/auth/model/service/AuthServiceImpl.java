package kr.co.iei.auth.model.service;

import java.time.Duration;
import java.time.Year;
import kr.co.iei.auth.model.dao.AuthDao;
import kr.co.iei.auth.model.vo.*;
import kr.co.iei.auth.util.JwtTokenProvider;
import kr.co.iei.common.exception.DuplicateResourceException;
import kr.co.iei.common.util.PasswordUtil;
import kr.co.iei.member.model.vo.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
  private static final String REFRESH_KEY_PREFIX = "auth:refresh:";
  private static final String LOGIN_ID_PATTERN = "^[a-z0-9]{7}$";
  private static final String PASSWORD_PATTERN =
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8}$";
  private static final String NICKNAME_PATTERN = "^[가-힣a-zA-Z0-9]+$";

  private final AuthDao authDao;
  private final PasswordUtil passwordUtil;
  private final JwtTokenProvider jwtTokenProvider;
  private final StringRedisTemplate stringRedisTemplate;
  private final EmailVerificationService emailVerificationService;

  @Value("${wemove.auth.access-token-seconds}")
  private long accessTokenSeconds;

  @Value("${wemove.auth.refresh-token-seconds}")
  private long refreshTokenSeconds;

  @Value("${wemove.auth.auto-login-refresh-token-seconds}")
  private long autoLoginRefreshTokenSeconds;

  @Transactional
  public void signup(SignupRequest req) {
    validateSignupRequest(req);
    checkLoginId(req.getLoginId());
    checkEmail(req.getEmail());
    if (authDao.selectByNickname(req.getNickname()) != null) {
      throw new DuplicateResourceException("이미 사용 중인 닉네임입니다.");
    }
    if (!emailVerificationService.isVerified(req.getEmail())) {
      throw new IllegalArgumentException("이메일 인증을 완료해주세요.");
    }

    Member member = new Member();
    member.setLoginId(req.getLoginId().trim());
    member.setEmail(req.getEmail().trim().toLowerCase());
    member.setPassword(passwordUtil.hash(req.getPassword()));
    member.setNickname(req.getNickname().trim());
    member.setGender(req.getGender());
    member.setBirthYear(req.getBirthYear());
    member.setPhone(normalizePhone(req.getPhone()));
    member.setRegionId(req.getRegionId());
    member.setRole("USER");
    member.setStatus("ACTIVE");
    authDao.insertMember(member);

    if (req.getSportIds() != null) {
      for (Long sportId : req.getSportIds()) {
        authDao.insertUserSport(member.getUserId(), sportId);
      }
    }
  }

  public void checkLoginId(String loginId) {
    if (loginId == null || !loginId.trim().matches(LOGIN_ID_PATTERN)) {
      throw new IllegalArgumentException("아이디는 소문자와 숫자를 조합해 정확히 7자리로 입력해주세요.");
    }

    if (authDao.selectByLoginId(loginId.trim()) != null) {
      throw new DuplicateResourceException("이미 사용 중인 아이디입니다.");
    }
  }

  public void checkEmail(String email) {
    if (!hasText(email) || !email.contains("@")) {
      throw new IllegalArgumentException("올바른 이메일 형식으로 입력해주세요.");
    }

    if (authDao.selectByEmail(email.trim().toLowerCase()) != null) {
      throw new DuplicateResourceException("이미 사용 중인 이메일입니다.");
    }
  }

  public AuthLoginResult login(LoginRequest req) {
    Member member = authDao.selectByLoginId(req.getLoginId());
    if (member == null || !isPasswordMatched(req.getPassword(), member.getPassword())) {
      throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
    }

    LoginResponse user =
        new LoginResponse(
            member.getUserId(), member.getLoginId(), member.getNickname(), member.getRole());

    boolean autoLogin = Boolean.TRUE.equals(req.getAutoLogin());
    long effectiveRefreshSeconds =
        autoLogin ? autoLoginRefreshTokenSeconds : refreshTokenSeconds;

    String accessToken = jwtTokenProvider.createAccessToken(user);
    String refreshToken =
        jwtTokenProvider.createRefreshToken(member.getUserId(), effectiveRefreshSeconds);

    stringRedisTemplate
        .opsForValue()
        .set(refreshKey(member.getUserId()), refreshToken, Duration.ofSeconds(effectiveRefreshSeconds));

    return new AuthLoginResult(
        user,
        accessToken,
        refreshToken,
        accessTokenSeconds,
        effectiveRefreshSeconds,
        autoLogin);
  }

  public AuthRefreshResult refresh(String refreshToken) {
    if (!hasText(refreshToken) || !jwtTokenProvider.isValid(refreshToken)) {
      throw new IllegalArgumentException("유효한 리프레시 토큰이 없습니다.");
    }

    Long userId = jwtTokenProvider.parseUserId(refreshToken);
    String savedRefreshToken = stringRedisTemplate.opsForValue().get(refreshKey(userId));
    if (!refreshToken.equals(savedRefreshToken)) {
      throw new IllegalArgumentException("리프레시 토큰이 만료되었거나 일치하지 않습니다.");
    }

    Member member = authDao.selectByUserId(userId);
    if (member == null) {
      throw new IllegalArgumentException("사용자 정보를 찾을 수 없습니다.");
    }

    LoginResponse user =
        new LoginResponse(
            member.getUserId(), member.getLoginId(), member.getNickname(), member.getRole());

    String renewedAccessToken = jwtTokenProvider.createAccessToken(user);
    return new AuthRefreshResult(renewedAccessToken);
  }

  public void logout(String refreshToken) {
    if (!hasText(refreshToken) || !jwtTokenProvider.isValid(refreshToken)) {
      return;
    }

    Long userId = jwtTokenProvider.parseUserId(refreshToken);
    stringRedisTemplate.delete(refreshKey(userId));
  }

  private boolean isPasswordMatched(String rawPassword, String savedPassword) {
    if (rawPassword == null || savedPassword == null) {
      return false;
    }
    return passwordUtil.matches(rawPassword, savedPassword) || rawPassword.equals(savedPassword);
  }

  private boolean hasText(String value) {
    return value != null && !value.isBlank();
  }

  private void validateSignupRequest(SignupRequest req) {
    if (req == null) {
      throw new IllegalArgumentException("회원가입 정보를 입력해주세요.");
    }
    if (req.getPassword() == null || !req.getPassword().matches(PASSWORD_PATTERN)) {
      throw new IllegalArgumentException("비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해 정확히 8자리로 입력해주세요.");
    }
    if (req.getNickname() == null || !req.getNickname().trim().matches(NICKNAME_PATTERN)) {
      throw new IllegalArgumentException("닉네임은 한글, 영문, 숫자만 입력해주세요.");
    }
    if (req.getGender() == null || (req.getGender() != 1 && req.getGender() != 2)) {
      throw new IllegalArgumentException("성별을 선택해주세요.");
    }
    if (req.getBirthYear() == null
        || req.getBirthYear() < 1900
        || req.getBirthYear() > Year.now().getValue()) {
      throw new IllegalArgumentException("출생년도는 4자리 연도로 입력해주세요.");
    }
    if (req.getRegionId() == null) {
      throw new IllegalArgumentException("지역을 선택해주세요.");
    }

    String phone = normalizePhone(req.getPhone());
    if (phone.length() < 9 || phone.length() > 11) {
      throw new IllegalArgumentException("연락처는 숫자 9자리에서 11자리까지 입력해주세요.");
    }
  }

  private String normalizePhone(String phone) {
    if (phone == null) {
      return "";
    }

    return phone.replaceAll("\\D", "");
  }

  private String refreshKey(Long userId) {
    return REFRESH_KEY_PREFIX + userId;
  }
}
