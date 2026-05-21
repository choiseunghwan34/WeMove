package kr.co.iei.auth.model.service;

import java.time.Duration;
import kr.co.iei.auth.model.dao.AuthDao;
import kr.co.iei.auth.model.vo.*;
import kr.co.iei.auth.util.JwtTokenProvider;
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

  private final AuthDao authDao;
  private final PasswordUtil passwordUtil;
  private final JwtTokenProvider jwtTokenProvider;
  private final StringRedisTemplate stringRedisTemplate;

  @Value("${wemove.auth.access-token-seconds}")
  private long accessTokenSeconds;

  @Value("${wemove.auth.refresh-token-seconds}")
  private long refreshTokenSeconds;

  @Value("${wemove.auth.auto-login-refresh-token-seconds}")
  private long autoLoginRefreshTokenSeconds;

  @Transactional
  public void signup(SignupRequest req) {
    if (authDao.selectByLoginId(req.getLoginId()) != null)
      throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
    if (authDao.selectByEmail(req.getEmail()) != null)
      throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
    if (authDao.selectByNickname(req.getNickname()) != null)
      throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");

    Member member = new Member();
    member.setLoginId(req.getLoginId());
    member.setEmail(req.getEmail());
    member.setPassword(passwordUtil.hash(req.getPassword()));
    member.setNickname(req.getNickname());
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

  private String refreshKey(Long userId) {
    return REFRESH_KEY_PREFIX + userId;
  }
}
