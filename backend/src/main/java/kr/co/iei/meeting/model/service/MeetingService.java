package kr.co.iei.meeting.model.service;

import java.util.*;
import kr.co.iei.meeting.model.vo.*;

public interface MeetingService {
  Map<String, Object> getMeetings(MeetingSearchCondition condition);

  List<Map<String, Object>> getTopRegions();

  MeetingDetailResponse getMeeting(Long meetingId);

  Long createMeeting(MeetingCreateRequest request, Long userId);

  void updateMeeting(Long meetingId, MeetingUpdateRequest request);

  void deleteMeeting(Long meetingId);

  void updateMeetingStatus(Long meetingId, MeetingStatusUpdateRequest request);
}
