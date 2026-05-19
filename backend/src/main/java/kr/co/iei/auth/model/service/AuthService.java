package kr.co.iei.auth.model.service;

import kr.co.iei.auth.model.vo.*;

public interface AuthService {
  void signup(SignupRequest request);

  LoginResponse login(LoginRequest request);
}
