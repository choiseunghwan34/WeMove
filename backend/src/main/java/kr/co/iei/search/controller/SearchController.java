package kr.co.iei.search.controller;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import kr.co.iei.auth.util.JwtTokenProvider;
import kr.co.iei.search.model.service.SearchService;
import kr.co.iei.search.model.vo.SearchKeywordRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {
  private final SearchService searchService;
  private final JwtTokenProvider jwtTokenProvider;

  @PostMapping("/keywords")
  public ResponseEntity<Void> recordKeyword(
      @RequestBody SearchKeywordRequest request,
      @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
      HttpServletRequest httpServletRequest) {
    searchService.recordKeyword(request.getKeyword(), resolveActorKey(authorizationHeader, httpServletRequest));
    return ResponseEntity.ok().build();
  }

  @GetMapping("/popular")
  public ResponseEntity<List<String>> popularKeywords(
      @RequestParam(defaultValue = "8") int limit) {
    return ResponseEntity.ok(searchService.getPopularKeywords(limit));
  }

  private String resolveActorKey(
      String authorizationHeader, HttpServletRequest httpServletRequest) {
    String accessToken = extractBearerToken(authorizationHeader);

    if (accessToken != null && jwtTokenProvider.isValid(accessToken)) {
      return "user:" + jwtTokenProvider.parseUserId(accessToken);
    }

    String forwardedFor = httpServletRequest.getHeader("X-Forwarded-For");
    if (forwardedFor != null && !forwardedFor.isBlank()) {
      return "ip:" + forwardedFor.split(",")[0].trim();
    }

    return "ip:" + httpServletRequest.getRemoteAddr();
  }

  private String extractBearerToken(String authorizationHeader) {
    if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
      return null;
    }

    return authorizationHeader.substring(7);
  }
}
