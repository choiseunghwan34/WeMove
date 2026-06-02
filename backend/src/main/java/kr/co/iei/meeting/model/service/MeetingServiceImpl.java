package kr.co.iei.meeting.model.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import kr.co.iei.common.service.CloudinaryImageService;
import kr.co.iei.meeting.model.dao.MeetingDao;
import kr.co.iei.meeting.model.vo.Meeting;
import kr.co.iei.meeting.model.vo.MeetingCreateRequest;
import kr.co.iei.meeting.model.vo.MeetingDetailResponse;
import kr.co.iei.meeting.model.vo.MeetingListResponse;
import kr.co.iei.meeting.model.vo.MeetingSearchCondition;
import kr.co.iei.meeting.model.vo.MeetingStatusUpdateRequest;
import kr.co.iei.meeting.model.vo.MeetingUpdateRequest;
import kr.co.iei.participant.model.dao.ParticipantDao;
import kr.co.iei.participant.model.vo.MeetingParticipant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class MeetingServiceImpl implements MeetingService {
  private final MeetingDao meetingDao;
  private final ParticipantDao participantDao;
  private final CloudinaryImageService cloudinaryImageService;




  public Map<String, Object> getMeetings(MeetingSearchCondition c) {
    List<MeetingListResponse> list = meetingDao.selectMeetingList(c);
    int totalCount = meetingDao.selectMeetingCount(c);

    Map<String, Object> result = new HashMap<>();
    result.put("list", list);
    result.put("totalCount", totalCount);
    return result;
  }

  public List<Map<String, Object>> getTopRegions() {
    return meetingDao.selectTopRegions();
  }

  public MeetingDetailResponse getMeeting(Long meetingId) {
    return meetingDao.selectMeetingDetail(meetingId);
  }

  @Override
  public Long createMeeting(MeetingCreateRequest request, MultipartFile image, Long userId) {
    // 1. [추가] 모임 생성 전 날짜/시간 검증
    LocalDate meetingDate = LocalDate.parse(request.getMeetingDate());
    LocalTime startTime = LocalTime.parse(request.getStartTime());

    validateMeetingTime(meetingDate, startTime);

    Meeting meeting = new Meeting();
    meeting.setHostUserId(userId);
    meeting.setSportId(request.getSportId());
    meeting.setRegionId(request.getRegionId());
    meeting.setTitle(request.getTitle());
    meeting.setContent(request.getContent());
    meeting.setThumbnailImage(cloudinaryImageService.uploadMeetingThumbnail(image));
    meeting.setPlaceName(request.getPlaceName());
    meeting.setAddress(request.getAddress());

    meeting.setMeetingDate(LocalDate.parse(request.getMeetingDate()));
    meeting.setStartTime(LocalTime.parse(request.getStartTime()));
    meeting.setMaxMembers(request.getMaxMembers());
    meeting.setMeetingType(request.getMeetingType());
    meeting.setRepeatType(request.getRepeatType());
    meeting.setStatus("RECRUITING");
    meeting.setSupplies(request.getSupplies());
    meeting.setGuideText(request.getGuideText());

    meetingDao.insertMeeting(meeting);

    MeetingParticipant hostParticipant = new MeetingParticipant();
    hostParticipant.setMeetingId(meeting.getMeetingId());
    hostParticipant.setUserId(userId);
    hostParticipant.setStatus("APPROVED");
    participantDao.insertParticipant(hostParticipant);

    return meeting.getMeetingId();
  }

  @Override
  public void updateMeeting(Long meetingId, MeetingUpdateRequest request, MultipartFile image) {
    LocalDate meetingDate = request.getMeetingDate();
    LocalTime startTime = request.getStartTime();

    validateMeetingTime(meetingDate, startTime);

    //현재모임의 승인된 인원수 조회
    Integer approveCount = participantDao.countApprovedByMeetingId(meetingId);

    if(approveCount != null && request.getMaxMembers() < approveCount) {
      throw new IllegalArgumentException("모집 인원은 현재 승인된 인원 (" + approveCount + "명) 이상이어야 합니다.");
    }
    request.setMeetingId(meetingId);

    if(Boolean.TRUE.equals(request.getIsImageRemoved())){
      request.setThumbnailImage(null);
    }else if(image != null && !image.isEmpty()){
      request.setThumbnailImage(cloudinaryImageService.uploadMeetingThumbnail(image));
    }
    System.out.println("★ DB 호출 직전 request의 thumbnailImage 값: " + request.getThumbnailImage());
    meetingDao.updateMeeting(request);
  }
  @Override
  public void deleteMeeting(Long meetingId) {
    meetingDao.softDeleteMeeting(meetingId);
  }

  public void updateMeetingStatus(Long meetingId, MeetingStatusUpdateRequest request) {
    // 1. 상태가 CLOSED(모집완료)로 변경될 때만 정원 체크
    if ("CLOSED".equals(request.getStatus())) {
      Integer approved = participantDao.countApprovedByMeetingId(meetingId);
      Integer max = meetingDao.selectMaxMembers(meetingId);
      if (approved == null || max == null || approved < max) {
        throw new IllegalArgumentException("모집완료는 정원이 모두 찬 경우에만 설정할 수 있습니다.");
      }
    }
    // 2. [추가] 모임 상태를 RECRUITING으로 변경할 때, 이미 지난 시간인지 확인
    if ("RECRUITING".equals(request.getStatus())) {
      // DB에서 해당 모임의 날짜와 시간을 조회
      MeetingDetailResponse meeting = getMeeting(meetingId);
      if(meeting == null) {
        throw new IllegalArgumentException("존재하지 않는 모임입니다.");
      }
      //LocalDateTime 생성 (날짜와 시간 합치기)
      LocalDateTime meetingDateTime = LocalDateTime.of(meeting.getMeetingDate(), meeting.getStartTime());

      // 현재 시간보다 모임 시간이 과거라면 에러 발생
      if (meetingDateTime.isBefore(LocalDateTime.now())) {
        throw new IllegalArgumentException("이미 지난 시간의 모임은 다시 모집할 수 없습니다.");
      }
    }
    meetingDao.updateMeetingStatus(meetingId, request.getStatus());
  }

  @Override
  public List<MeetingListResponse> getMainMeetingList(String category) {
    return meetingDao.selectMainMeetingList(category);
  }
  // 공통으로 사용할 시간 검증 도우미 메서드
  private void validateMeetingTime(LocalDate date, LocalTime time) {
    LocalDateTime meetingDateTime = LocalDateTime.of(date, time);
    if (meetingDateTime.isBefore(LocalDateTime.now())) {
      throw new IllegalArgumentException("과거 시간으로는 모임을 생성하거나 수정할 수 없습니다.");
    }
  }
}
