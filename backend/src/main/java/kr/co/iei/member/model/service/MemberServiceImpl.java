package kr.co.iei.member.model.service;

import kr.co.iei.common.service.CloudinaryImageService;
import kr.co.iei.member.model.dao.MemberDao;
import kr.co.iei.member.model.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {
  private final MemberDao memberDao;
  private final CloudinaryImageService cloudinaryImageService;

  public MemberResponse getMe(Long memberId) {
    return memberDao.selectMemberById(memberId);
  }

  public void updateMe(Long memberId, MemberUpdateRequest req, MultipartFile image) {
    String uploadedProfileImage = cloudinaryImageService.uploadProfileImage(image);
    if (uploadedProfileImage != null) {
      req.setProfileImage(uploadedProfileImage);
    }
    memberDao.updateMember(memberId, req);
  }

  public MemberResponse getMember(Long memberId) {
    return memberDao.selectMemberById(memberId);
  }
}
