package kr.co.iei.auth.model.service;

import kr.co.iei.auth.model.vo.*;

public interface AuthService {
  void signup(SignupRequest request);

  AuthLoginResult login(LoginRequest request);

  AuthRefreshResult refresh(String refreshToken);

  void logout(String refreshToken);
}
