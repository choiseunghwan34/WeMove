package kr.co.iei.auth.model.service;

import kr.co.iei.auth.model.vo.EmailVerificationSendResponse;

public interface EmailVerificationService {
  EmailVerificationSendResponse sendVerificationEmail(String email);

  String verify(String token);

  boolean isVerified(String email);
}
