package kr.co.iei.auth.model.service;

import java.time.Duration;
import java.util.UUID;
import kr.co.iei.auth.exception.DuplicateLoginException;
import kr.co.iei.auth.model.dao.AuthDao;
import kr.co.iei.auth.model.vo.AuthLoginResult;
import kr.co.iei.auth.model.vo.AuthRefreshResult;
import kr.co.iei.auth.model.vo.LoginRequest;
import kr.co.iei.auth.model.vo.LoginResponse;
import kr.co.iei.auth.model.vo.SignupRequest;
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
  private static final String SESSION_KEY_PREFIX = "auth:session:";

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
    if (authDao.selectByLoginId(req.getLoginId()) != null) {
      throw new IllegalArgumentException("Login ID is already in use.");
    }
    if (authDao.selectByEmail(req.getEmail()) != null) {
      throw new IllegalArgumentException("Email is already in use.");
    }
    if (authDao.selectByNickname(req.getNickname()) != null) {
      throw new IllegalArgumentException("Nickname is already in use.");
    }

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
      throw new IllegalArgumentException("Invalid login credentials.");
    }

    boolean autoLogin = Boolean.TRUE.equals(req.getAutoLogin());
    boolean forceLogin = Boolean.TRUE.equals(req.getForceLogin());
    long effectiveRefreshSeconds =
        autoLogin ? autoLoginRefreshTokenSeconds : refreshTokenSeconds;

    String savedRefreshToken = stringRedisTemplate.opsForValue().get(refreshKey(member.getUserId()));
    String savedSessionId = stringRedisTemplate.opsForValue().get(sessionKey(member.getUserId()));
    if (hasText(savedRefreshToken) && hasText(savedSessionId) && !forceLogin) {
      throw new DuplicateLoginException("An existing login session was found.");
    }

    LoginResponse user =
        new LoginResponse(
            member.getUserId(), member.getLoginId(), member.getNickname(), member.getRole());

    String sessionId = UUID.randomUUID().toString();
    String accessToken = jwtTokenProvider.createAccessToken(user, sessionId);
    String refreshToken =
        jwtTokenProvider.createRefreshToken(member.getUserId(), sessionId, effectiveRefreshSeconds);

    Duration ttl = Duration.ofSeconds(effectiveRefreshSeconds);
    stringRedisTemplate.opsForValue().set(refreshKey(member.getUserId()), refreshToken, ttl);
    stringRedisTemplate.opsForValue().set(sessionKey(member.getUserId()), sessionId, ttl);

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
      throw new IllegalArgumentException("Refresh token is missing or invalid.");
    }

    Long userId = jwtTokenProvider.parseUserId(refreshToken);
    String sessionId = jwtTokenProvider.parseSessionId(refreshToken);
    String savedRefreshToken = stringRedisTemplate.opsForValue().get(refreshKey(userId));
    String savedSessionId = stringRedisTemplate.opsForValue().get(sessionKey(userId));
    if (!refreshToken.equals(savedRefreshToken) || !sessionMatches(sessionId, savedSessionId)) {
      throw new IllegalArgumentException("Refresh token is expired or does not match.");
    }

    Member member = authDao.selectByUserId(userId);
    if (member == null) {
      throw new IllegalArgumentException("User not found.");
    }

    LoginResponse user =
        new LoginResponse(
            member.getUserId(), member.getLoginId(), member.getNickname(), member.getRole());

    String renewedAccessToken = jwtTokenProvider.createAccessToken(user, sessionId);
    return new AuthRefreshResult(renewedAccessToken);
  }

  public void logout(String refreshToken) {
    if (!hasText(refreshToken) || !jwtTokenProvider.isValid(refreshToken)) {
      return;
    }

    Long userId = jwtTokenProvider.parseUserId(refreshToken);
    String sessionId = jwtTokenProvider.parseSessionId(refreshToken);
    String savedRefreshToken = stringRedisTemplate.opsForValue().get(refreshKey(userId));
    String savedSessionId = stringRedisTemplate.opsForValue().get(sessionKey(userId));

    if (refreshToken.equals(savedRefreshToken) && sessionMatches(sessionId, savedSessionId)) {
      stringRedisTemplate.delete(refreshKey(userId));
      stringRedisTemplate.delete(sessionKey(userId));
    }
  }

  public boolean isCurrentSession(String accessToken) {
    if (!hasText(accessToken) || !jwtTokenProvider.isValid(accessToken)) {
      return false;
    }

    Long userId = jwtTokenProvider.parseUserId(accessToken);
    String sessionId = jwtTokenProvider.parseSessionId(accessToken);
    String savedSessionId = stringRedisTemplate.opsForValue().get(sessionKey(userId));
    return sessionMatches(sessionId, savedSessionId);
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

  private String sessionKey(Long userId) {
    return SESSION_KEY_PREFIX + userId;
  }

  private boolean sessionMatches(String sessionId, String savedSessionId) {
    return hasText(sessionId) && sessionId.equals(savedSessionId);
  }
}
