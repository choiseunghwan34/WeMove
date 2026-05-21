package kr.co.iei.meeting.model.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import kr.co.iei.meeting.model.dao.MeetingDao;
import kr.co.iei.meeting.model.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MeetingServiceImpl implements MeetingService {
  private final MeetingDao meetingDao;

  public List<MeetingListResponse> getMeetings(MeetingSearchCondition c) {
    return meetingDao.selectMeetingList(c);
  }

  public List<Map<String, Object>> getTopRegions() {
    return meetingDao.selectTopRegions();
  }

  public MeetingDetailResponse getMeeting(Long id) {
    return meetingDao.selectMeetingDetail(id);
  }
@Override
  public Long createMeeting(MeetingCreateRequest r, Long userId) {

    Meeting m = new Meeting();
    m.setHostUserId(userId);
    m.setSportId(r.getSportId());
    m.setRegionId(r.getRegionId());

    m.setTitle(r.getTitle());
    m.setContent(r.getContent());

    m.setPlaceName(r.getPlaceName());
    m.setAddress(r.getAddress());

    m.setMeetingDate(LocalDate.parse(r.getMeetingDate()));
    m.setStartTime(LocalTime.parse(r.getStartTime()));

    m.setMaxMembers(r.getMaxMembers());

    m.setMeetingType(r.getMeetingType());
    m.setRepeatType(r.getRepeatType());
    m.setStatus("RECRUITING");

    m.setSupplies(r.getSupplies());
    m.setGuideText(r.getGuideText());

    meetingDao.insertMeeting(m);
    return m.getMeetingId();
  }

  public void updateMeeting(Long id, MeetingUpdateRequest r) {
    meetingDao.updateMeeting(id, r);
  }

  public void deleteMeeting(Long id) {
    meetingDao.softDeleteMeeting(id);
  }

  public void updateMeetingStatus(Long id, MeetingStatusUpdateRequest r) {
    meetingDao.updateMeetingStatus(id, r.getStatus());
  }
}
