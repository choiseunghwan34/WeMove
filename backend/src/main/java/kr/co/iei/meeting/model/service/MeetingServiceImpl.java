package kr.co.iei.meeting.model.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
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
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.redis.core.ZSetOperations.TypedTuple;

@Service
@RequiredArgsConstructor
public class MeetingServiceImpl implements MeetingService {
  private static final ZoneId KOREA_ZONE_ID = ZoneId.of("Asia/Seoul");
  private static final String POPULAR_KEY_PREFIX = "meeting:popular:";
  private static final String DEDUPE_KEY_PREFIX = "meeting:viewed:";
  private static final int MAIN_LIMIT = 10;

  private final MeetingDao meetingDao;
  private final ParticipantDao participantDao;
  private final CloudinaryImageService cloudinaryImageService;
  private final StringRedisTemplate stringRedisTemplate;

  @Override
  public Map<String, Object> getMeetings(MeetingSearchCondition c) {
    List<MeetingListResponse> list = meetingDao.selectMeetingList(c);
    int totalCount = meetingDao.selectMeetingCount(c);

    Map<String, Object> result = new HashMap<>();
    result.put("list", list);
    result.put("totalCount", totalCount);
    return result;
  }

  @Override
  public List<Map<String, Object>> getTopRegions() {
    return meetingDao.selectTopRegions();
  }

  @Override
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

    if (Boolean.TRUE.equals(request.getIsImageRemoved())) {
      request.setThumbnailImage(null);
    } else if (image != null && !image.isEmpty()) {
      request.setThumbnailImage(cloudinaryImageService.uploadMeetingThumbnail(image));
    }

    meetingDao.updateMeeting(request);
  }

  @Override
  public void deleteMeeting(Long meetingId) {
    meetingDao.softDeleteMeeting(meetingId);
  }

  @Override
  public void updateMeetingStatus(Long meetingId, MeetingStatusUpdateRequest request) {
    MeetingDetailResponse currentMeeting = meetingDao.selectMeetingDetail(meetingId);
    if (currentMeeting == null) {
      throw new IllegalArgumentException("紐⑥엫??李얠쓣 ???놁뒿?덈떎.");
    }

    String nextStatus = request.getStatus();

    if ("CLOSED".equals(nextStatus)) {
    // 1. 상태가 CLOSED(모집완료)로 변경될 때만 정원 체크
    if ("CLOSED".equals(request.getStatus())) {

      Integer approved = participantDao.countApprovedByMeetingId(meetingId);
      Integer max = meetingDao.selectMaxMembers(meetingId);
      if (approved == null || max == null || approved < max) {
        throw new IllegalArgumentException("紐⑥쭛?꾨즺???뺤썝??紐⑤몢 李?寃쎌슦?먮뭔 ?ㅼ젙?????덉뒿?덈떎.");
      }
    }


    if ("CANCELLED".equals(nextStatus) && !"RECRUITING".equals(currentMeeting.getStatus())) {
      throw new IllegalArgumentException("紐⑥쭛以묒씤 紐⑥엫留?痍⑥냼?????덉뒿?덈떎.");
    }

    if ("COMPLETED".equals(nextStatus) && !"ONGOING".equals(currentMeeting.getStatus())) {
      throw new IllegalArgumentException("吏꾪뻾以묒씤 紐⑥엫留??꾨즺濡?蹂寃쏀븷 ???덉뒿?덈떎.");
    }

    meetingDao.updateMeetingStatus(meetingId, nextStatus);
  }

  @Override
  public void recordMeetingView(Long meetingId, String actorKey) {
    MeetingDetailResponse meeting = meetingDao.selectMeetingDetail(meetingId);
    if (meeting == null || !"RECRUITING".equals(meeting.getStatus())) {
      return;
    }

    String normalizedActorKey = normalizeActorKey(actorKey);
    if (normalizedActorKey == null) {
      normalizedActorKey = "anonymous";
    }

    String dedupeKey = buildDedupeKey(meetingId, normalizedActorKey);
    Duration ttl = durationUntilTomorrow();
    Boolean firstView = stringRedisTemplate.opsForValue().setIfAbsent(dedupeKey, "1", ttl);
    if (!Boolean.TRUE.equals(firstView)) {
      return;
    }

    String popularKey = todayPopularKey();
    stringRedisTemplate.opsForZSet().incrementScore(popularKey, String.valueOf(meetingId), 1D);
    stringRedisTemplate.expire(popularKey, ttl);
  }

  @Override
  public List<MeetingListResponse> getMainMeetingList() {
    return getLatestRecruitingMeetings(MAIN_LIMIT);
  }

  @Override
  public List<MeetingListResponse> getPopularMeetingList() {
    return getRankedRecruitingMeetings(MAIN_LIMIT);
  }

  private List<MeetingListResponse> getLatestRecruitingMeetings(int limit) {
    Map<String, Object> result = new HashMap<>();
    result.put("limit", limit);
    result.put("offset", 0);
    return meetingDao.selectMainMeetingList(result);

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

  private List<MeetingListResponse> getRankedRecruitingMeetings(int limit) {
    Map<Long, Integer> rankedMeetingViews = getTodayRankedMeetingViews(limit);
    List<Long> rankedMeetingIds = new ArrayList<>(rankedMeetingViews.keySet());
    if (rankedMeetingIds.isEmpty()) {
      return getLatestRecruitingMeetings(limit);
    }

    List<MeetingListResponse> rankedMeetings =
        meetingDao.selectMainMeetingListByIds(rankedMeetingIds);
    Map<Long, MeetingListResponse> meetingMap = new LinkedHashMap<>();
    for (MeetingListResponse meeting : rankedMeetings) {
      meetingMap.put(meeting.getMeetingId(), meeting);
    }

    List<MeetingListResponse> result = new ArrayList<>();
    for (Long meetingId : rankedMeetingIds) {
      MeetingListResponse meeting = meetingMap.get(meetingId);
      if (meeting != null && "RECRUITING".equals(meeting.getStatus())) {
        meeting.setViewCount(rankedMeetingViews.getOrDefault(meetingId, 0));
        result.add(meeting);
      }
    }

    if (result.size() < limit) {
      Set<Long> existingIds =
          result.stream().map(MeetingListResponse::getMeetingId).collect(Collectors.toSet());

      for (MeetingListResponse meeting : getLatestRecruitingMeetings(limit * 2)) {
        if (result.size() >= limit) {
          break;
        }

        if (meeting != null && existingIds.add(meeting.getMeetingId())) {
          meeting.setViewCount(meeting.getViewCount() == null ? 0 : meeting.getViewCount());
          result.add(meeting);
        }
      }
    }

    return result;
  }

  private Map<Long, Integer> getTodayRankedMeetingViews(int limit) {
    Set<TypedTuple<String>> rankedEntries =
        stringRedisTemplate.opsForZSet().reverseRangeWithScores(todayPopularKey(), 0, limit - 1);

    if (rankedEntries == null || rankedEntries.isEmpty()) {
      return Map.of();
    }

    Map<Long, Integer> meetingViews = new LinkedHashMap<>();
    for (TypedTuple<String> rankedEntry : rankedEntries) {
      if (rankedEntry == null || rankedEntry.getValue() == null || rankedEntry.getScore() == null) {
        continue;
      }

      try {
        Long meetingId = Long.valueOf(rankedEntry.getValue());
        meetingViews.put(meetingId, rankedEntry.getScore().intValue());
      } catch (NumberFormatException ignored) {
        // Skip malformed redis entries.
      }
    }

    return meetingViews;
  }

  private String normalizeActorKey(String actorKey) {
    if (actorKey == null) {
      return null;
    }

    String normalized = actorKey.trim();
    return normalized.isBlank() ? null : normalized;
  }

  private String buildDedupeKey(Long meetingId, String actorKey) {
    return DEDUPE_KEY_PREFIX
        + LocalDate.now(KOREA_ZONE_ID)
        + ":"
        + meetingId
        + ":"
        + Integer.toHexString(actorKey.toLowerCase().hashCode());
  }

  private String todayPopularKey() {
    return POPULAR_KEY_PREFIX + LocalDate.now(KOREA_ZONE_ID);
  }

  private Duration durationUntilTomorrow() {
    ZonedDateTime now = ZonedDateTime.now(KOREA_ZONE_ID);
    ZonedDateTime tomorrowStart = now.toLocalDate().plusDays(1).atStartOfDay(KOREA_ZONE_ID);
    return Duration.between(now, tomorrowStart);
  }
}
