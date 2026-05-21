package kr.co.iei.sport.model.service;

import java.util.List;
import kr.co.iei.sport.model.dao.SportDao;
import kr.co.iei.sport.model.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SportServiceImpl implements SportService {
  private final SportDao sportDao;

  public List<Sport> getSports() {
    return sportDao.selectSports();
  }

  public void createSport(SportRequest req) {
    sportDao.insertSport(req);
  }

  public void updateSport(Long sportId, SportRequest req) {
    sportDao.updateSport(sportId, req);
  }

  public void deleteSport(Long sportId) {
    sportDao.deleteSport(sportId);
  }
}
