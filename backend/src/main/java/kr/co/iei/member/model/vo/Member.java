package kr.co.iei.member.model.vo;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class Member {
  private Long userId;
  private String loginId;
  private String email;
  private String password;
  private String nickname;
  private String phone;
  private String profileImage;
  private Long regionId;
  private String role;
  private String status;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
