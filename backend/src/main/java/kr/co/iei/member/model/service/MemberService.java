package kr.co.iei.member.model.service;

import kr.co.iei.member.model.vo.*;
import org.springframework.web.multipart.MultipartFile;

public interface MemberService {
  MemberResponse getMe(Long memberId);

  void updateMe(Long memberId, MemberUpdateRequest request, MultipartFile image);

  void updateSports(Long memberId, MemberSportsUpdateRequest request);

  MemberResponse getMember(Long memberId);
}
