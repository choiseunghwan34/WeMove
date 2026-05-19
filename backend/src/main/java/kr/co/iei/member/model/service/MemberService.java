package kr.co.iei.member.model.service;

import kr.co.iei.member.model.vo.*;

public interface MemberService {
  MemberResponse getMe(Long memberId);

  void updateMe(Long memberId, MemberUpdateRequest request);

  MemberResponse getMember(Long memberId);
}
