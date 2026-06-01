package kr.co.iei.meeting.model.service;

import java.time.LocalDate;
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
    if ("CLOSED".equals(request.getStatus())) {
      Integer approved = participantDao.countApprovedByMeetingId(meetingId);
      Integer max = meetingDao.selectMaxMembers(meetingId);
      if (approved == null || max == null || approved < max) {
        throw new IllegalArgumentException("모집완료는 정원이 모두 찬 경우에만 설정할 수 있습니다.");
      }
    }
    meetingDao.updateMeetingStatus(meetingId, request.getStatus());
  }

  @Override
  public List<MeetingListResponse> getMainMeetingList() {
    Map<String, Object> result = new HashMap<>();
    result.put("limit", 10);
    result.put("offset", 0);
    return meetingDao.selectMainMeetingList(result);
  }
}
