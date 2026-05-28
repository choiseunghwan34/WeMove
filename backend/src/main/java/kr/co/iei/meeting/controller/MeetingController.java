package kr.co.iei.meeting.controller;

import java.util.List;
import java.util.Map;
import kr.co.iei.auth.util.JwtTokenProvider;
import kr.co.iei.meeting.model.service.MeetingService;
import kr.co.iei.meeting.model.vo.MeetingCreateRequest;
import kr.co.iei.meeting.model.vo.MeetingDetailResponse;
import kr.co.iei.meeting.model.vo.MeetingListResponse;
import kr.co.iei.meeting.model.vo.MeetingSearchCondition;
import kr.co.iei.meeting.model.vo.MeetingStatusUpdateRequest;
import kr.co.iei.meeting.model.vo.MeetingUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {
  private final MeetingService meetingService;
  private final JwtTokenProvider jwtTokenProvider;

  @GetMapping

  public ResponseEntity<Map<String, Object>> list(MeetingSearchCondition c) {
    return ResponseEntity.ok(meetingService.getMeetings(c));
  }

  @GetMapping("/top-regions")
  public ResponseEntity<List<Map<String, Object>>> topRegions() {
    return ResponseEntity.ok(meetingService.getTopRegions());
  }

  @GetMapping("/{meetingId}")
  public ResponseEntity<MeetingDetailResponse> detail(@PathVariable Long meetingId) {
    return ResponseEntity.ok(meetingService.getMeeting(meetingId));
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<Map<String, Long>> create(
      @RequestPart("request") MeetingCreateRequest request,
      @RequestPart(value = "image", required = false) MultipartFile image,
      @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
    Long userId = jwtTokenProvider.parseUserId(extractBearerToken(authorizationHeader));
    Long meetingId = meetingService.createMeeting(request, image, userId);
    return ResponseEntity.ok(Map.of("meetingId", meetingId));
  }

  @PutMapping("/{meetingId}")
  public ResponseEntity<Void> update(
      @PathVariable Long meetingId,
      @RequestPart(value = "request") MeetingUpdateRequest request,
      @RequestPart(value = "image", required = false) MultipartFile image) {
    meetingService.updateMeeting(meetingId, request, image);
    return ResponseEntity.ok().build();
  }

  @DeleteMapping("/{meetingId}")
  public ResponseEntity<Void> delete(@PathVariable Long meetingId) {
    meetingService.deleteMeeting(meetingId);
    return ResponseEntity.ok().build();
  }

  @PatchMapping("/{meetingId}/status")
  public ResponseEntity<Void> status(
      @PathVariable Long meetingId, @RequestBody MeetingStatusUpdateRequest request) {
    meetingService.updateMeetingStatus(meetingId, request);
    return ResponseEntity.ok().build();
  }

  private String extractBearerToken(String authorizationHeader) {
    if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
      throw new IllegalArgumentException("유효한 인증 토큰이 없습니다.");
    }
    return authorizationHeader.substring(7);
  }
}
