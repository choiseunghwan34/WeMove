package kr.co.iei.auth.model.service;

import kr.co.iei.auth.model.vo.*;

public interface AuthService {
  void signup(SignupRequest request);

  AuthLoginResult login(LoginRequest request);

  AuthSessionResult getSession(String accessToken, String refreshToken);

  AuthSessionResult refresh(String refreshToken);

  void logout(String refreshToken);
}
