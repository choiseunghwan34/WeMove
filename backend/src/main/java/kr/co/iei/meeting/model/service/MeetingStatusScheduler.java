package kr.co.iei.meeting.model.service;

import kr.co.iei.meeting.model.dao.MeetingDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class MeetingStatusScheduler {
  private final MeetingDao meetingDao;

  @Scheduled(fixedDelay = 60_000)
  @Transactional
  public void updateTimeBasedMeetingStatuses() {
    int startedCount = meetingDao.startDueMeetings();
    if (startedCount > 0) {
      log.info("Auto-started {} meeting(s) whose schedule has passed.", startedCount);
    }

    int completedCount = meetingDao.completeOverdueOngoingMeetings();
    if (completedCount > 0) {
      log.info("Auto-completed {} ongoing meeting(s) older than 24 hours.", completedCount);
    }
  }
}
