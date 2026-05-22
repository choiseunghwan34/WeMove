package kr.co.iei.member.model.service;


import java.util.List;

import kr.co.iei.common.service.CloudinaryImageService;

import kr.co.iei.member.model.dao.MemberDao;
import kr.co.iei.member.model.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

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

  @Transactional
  public void updateSports(Long memberId, MemberSportsUpdateRequest req) {
    if (memberId == null) {
      throw new IllegalArgumentException("회원 정보가 없습니다.");
    }
    if (req == null || req.getSportIds() == null || req.getSportIds().isEmpty()) {
      throw new IllegalArgumentException("관심종목을 1개 이상 선택해주세요.");
    }

    List<Long> sportIds =
        req.getSportIds().stream()
            .filter((sportId) -> sportId != null && sportId > 0)
            .distinct()
            .toList();

    if (sportIds.isEmpty()) {
      throw new IllegalArgumentException("관심종목을 1개 이상 선택해주세요.");
    }

    memberDao.deleteMemberSports(memberId);
    sportIds.forEach((sportId) -> memberDao.insertMemberSport(memberId, sportId));
  }

  public MemberResponse getMember(Long memberId) {
    return memberDao.selectMemberById(memberId);
  }
}
