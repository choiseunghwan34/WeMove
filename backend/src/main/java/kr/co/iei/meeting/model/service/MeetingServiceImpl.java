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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class MeetingServiceImpl implements MeetingService {
  private final MeetingDao meetingDao;
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
    return meeting.getMeetingId();
  }

  @Override
  public void updateMeeting(Long meetingId, MeetingUpdateRequest request, MultipartFile image) {
    // 1. 수정용 객체(VO)를 생성하거나, 기존 데이터를 조회해서 set해도 됩니다.
    // 여기서는 request의 값을 담을 객체를 만듭니다.
    Meeting meeting = new Meeting();
    meeting.setMeetingId(meetingId);
    meeting.setTitle(request.getTitle());
    meeting.setContent(request.getContent());
    meeting.setPlaceName(request.getPlaceName());
    meeting.setAddress(request.getAddress());
    meeting.setMeetingDate(request.getMeetingDate());
    meeting.setStartTime(request.getStartTime());
    meeting.setMaxMembers(request.getMaxMembers());
    meeting.setStatus(request.getStatus());
    meeting.setSupplies(request.getSupplies());
    meeting.setGuideText(request.getGuideText());

    // 2. 이미지가 있을 때만 경로를 set
    if (image != null && !image.isEmpty()) {
      meeting.setThumbnailImage(cloudinaryImageService.uploadMeetingThumbnail(image));
    }

    // 3. DAO에 객체째로 던집니다.
    meetingDao.updateMeeting(meeting);
  }

  public void deleteMeeting(Long meetingId) {
    meetingDao.softDeleteMeeting(meetingId);
  }

  public void updateMeetingStatus(Long meetingId, MeetingStatusUpdateRequest request) {
    meetingDao.updateMeetingStatus(meetingId, request.getStatus());
  }
}
