package kr.co.iei.sport.model.dao;

import java.util.*;
import kr.co.iei.sport.model.vo.*;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class SportDao {
  private final SqlSession sqlSession;

  public List<Sport> selectSports() {
    return sqlSession.selectList("sport.selectSports");
  }

  public int insertSport(SportRequest req) {
    return sqlSession.insert("sport.insertSport", req);
  }

  public int updateSport(Long sportId, SportRequest req) {
    Map<String, Object> p = new HashMap<>();
    p.put("sportId", sportId);
    p.put("request", req);
    return sqlSession.update("sport.updateSport", p);
  }
}
