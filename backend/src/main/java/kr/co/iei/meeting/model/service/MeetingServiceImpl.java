package kr.co.iei.meeting.model.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
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

  public List<MeetingListResponse> getMeetings(MeetingSearchCondition condition) {
    return meetingDao.selectMeetingList(condition);
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

  public void updateMeeting(Long meetingId, MeetingUpdateRequest request) {
    meetingDao.updateMeeting(meetingId, request);
  }

  public void deleteMeeting(Long meetingId) {
    meetingDao.softDeleteMeeting(meetingId);
  }

  public void updateMeetingStatus(Long meetingId, MeetingStatusUpdateRequest request) {
    meetingDao.updateMeetingStatus(meetingId, request.getStatus());
  }
}
