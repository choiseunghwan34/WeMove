package kr.co.iei.auth.model.service;

import kr.co.iei.auth.model.dao.AuthDao;
import kr.co.iei.auth.model.vo.*;
import kr.co.iei.common.util.PasswordUtil;
import kr.co.iei.member.model.vo.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
  private final AuthDao authDao;
  private final PasswordUtil passwordUtil;

  @Transactional
  public void signup(SignupRequest req) {
    if (authDao.selectByLoginId(req.getLoginId()) != null)
      throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
    if (authDao.selectByEmail(req.getEmail()) != null)
      throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
    if (authDao.selectByNickname(req.getNickname()) != null)
      throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
    Member m = new Member();
    m.setLoginId(req.getLoginId());
    m.setEmail(req.getEmail());
    m.setPassword(passwordUtil.hash(req.getPassword()));
    m.setNickname(req.getNickname());
    m.setRegionId(req.getRegionId());
    m.setRole("USER");
    m.setStatus("ACTIVE");
    authDao.insertMember(m);
    if (req.getSportIds() != null) {
      for (Long sportId : req.getSportIds()) {
        authDao.insertUserSport(m.getUserId(), sportId);
      }
    }
  }

  public LoginResponse login(LoginRequest req) {
    Member m = authDao.selectByLoginId(req.getLoginId());
    if (m == null || !passwordUtil.matches(req.getPassword(), m.getPassword()))
      throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
    return new LoginResponse(m.getUserId(), m.getLoginId(), m.getNickname(), m.getRole());
  }
}
