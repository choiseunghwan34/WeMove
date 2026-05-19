package kr.co.iei.member.controller;

import kr.co.iei.member.model.service.MemberService;
import kr.co.iei.member.model.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {
  private final MemberService memberService;

  @GetMapping("/me")
  public ResponseEntity<MemberResponse> me(@RequestParam(defaultValue = "1") Long memberId) {
    return ResponseEntity.ok(memberService.getMe(memberId));
  }

  @PutMapping("/me")
  public ResponseEntity<Void> updateMe(
      @RequestParam(defaultValue = "1") Long memberId, @RequestBody MemberUpdateRequest req) {
    memberService.updateMe(memberId, req);
    return ResponseEntity.ok().build();
  }

  @GetMapping("/{memberId}")
  public ResponseEntity<MemberResponse> member(@PathVariable Long memberId) {
    return ResponseEntity.ok(memberService.getMember(memberId));
  }
}
