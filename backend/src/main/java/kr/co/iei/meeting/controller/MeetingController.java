package kr.co.iei.meeting.controller;

import java.util.*;
import kr.co.iei.meeting.model.service.MeetingService;
import kr.co.iei.meeting.model.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {
  private final MeetingService meetingService;

  @GetMapping
  public ResponseEntity<List<MeetingListResponse>> list(MeetingSearchCondition c) {
    return ResponseEntity.ok(meetingService.getMeetings(c));
  }

  @GetMapping("/{meetingId}")
  public ResponseEntity<MeetingDetailResponse> detail(@PathVariable Long meetingId) {
    return ResponseEntity.ok(meetingService.getMeeting(meetingId));
  }

  //모임생성
  @PostMapping
  public ResponseEntity<Map<String, Long>> create(@RequestBody MeetingCreateRequest r, @RequestHeader("X-Member-Id") Long userId) {
    Long id = meetingService.createMeeting(r, userId);
    return ResponseEntity.ok(Map.of("meetingId", id));
  }

  @PutMapping("/{meetingId}")
  public ResponseEntity<Void> update(
      @PathVariable Long meetingId, @RequestBody MeetingUpdateRequest r) {
    meetingService.updateMeeting(meetingId, r);
    return ResponseEntity.ok().build();
  }

  @DeleteMapping("/{meetingId}")
  public ResponseEntity<Void> delete(@PathVariable Long meetingId) {
    meetingService.deleteMeeting(meetingId);
    return ResponseEntity.ok().build();
  }

  @PatchMapping("/{meetingId}/status")
  public ResponseEntity<Void> status(
      @PathVariable Long meetingId, @RequestBody MeetingStatusUpdateRequest r) {
    meetingService.updateMeetingStatus(meetingId, r);
    return ResponseEntity.ok().build();
  }
}
