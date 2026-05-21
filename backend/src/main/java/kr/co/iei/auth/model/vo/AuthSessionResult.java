package kr.co.iei.auth.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthSessionResult {
  private LoginResponse user;
  private String renewedAccessToken;
  private long accessTokenSeconds;
}
