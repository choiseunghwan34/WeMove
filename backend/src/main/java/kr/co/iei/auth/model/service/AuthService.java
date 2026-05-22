package kr.co.iei.auth.model.service;

import kr.co.iei.auth.model.vo.*;

public interface AuthService {
  void signup(SignupRequest request);

  void checkLoginId(String loginId);

  void checkEmail(String email);

  void checkNickname(String nickname);

  AuthLoginResult login(LoginRequest request);

  AuthRefreshResult refresh(String refreshToken);

  void logout(String refreshToken);

  boolean isCurrentSession(String accessToken);
}
