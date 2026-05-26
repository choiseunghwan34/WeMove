import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getMeetings } from "../api/meetingApi";
import { getRegions } from "../api/regionApi";
import { getSports } from "../api/sportApi";
import DashboardShell from "../components/DashboardShell";
import styles from "../styles/SearchPage.module.css";

const normalizeText = (value = "") => String(value).trim();

const meetingStatusText = {
  RECRUITING: "모집중",
  CLOSED: "모집완료",
  COMPLETED: "진행완료",
  CANCELLED: "취소됨",
};

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

const formatRegionName = (region) =>
  [region.sido, region.sigungu, region.dong]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");

const formatMeetingSchedule = (meetingDate, startTime) => {
  if (!meetingDate) {
    return "일정 정보 없음";
  }

  const date = new Date(`${meetingDate}T00:00:00`);
  const weekday = Number.isNaN(date.getTime()) ? "" : weekdayLabels[date.getDay()];
  const timeText = String(startTime ?? "").slice(0, 5) || "--:--";

  return `${meetingDate}${weekday ? ` (${weekday})` : ""} ${timeText}`;
};

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = normalizeText(searchParams.get("q"));
  const [keyword, setKeyword] = useState(query);
  const [meetingResults, setMeetingResults] = useState([]);
  const [meetingTotalCount, setMeetingTotalCount] = useState(0);
  const [regionResults, setRegionResults] = useState([]);
  const [sportResults, setSportResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setKeyword(query);
  }, [query]);

  useEffect(() => {
    let active = true;

    const loadResults = async () => {
      if (!query) {
        setMeetingResults([]);
        setMeetingTotalCount(0);
        setRegionResults([]);
        setSportResults([]);
        return;
      }

      setLoading(true);

      try {
        const [meetingResponse, regionResponse, sportResponse] = await Promise.all([
          getMeetings({ keyword: query, page: 1, size: 8 }),
          getRegions(),
          getSports(),
        ]);

        if (!active) {
          return;
        }

        const regionList = Array.isArray(regionResponse.data) ? regionResponse.data : [];
        const sportList = Array.isArray(sportResponse.data) ? sportResponse.data : [];
        const normalizedQuery = query.toLowerCase();

        setMeetingResults(meetingResponse.data?.list ?? []);
        setMeetingTotalCount(meetingResponse.data?.totalCount ?? 0);
        setRegionResults(
          regionList
            .map((region) => ({
              regionId: region.regionId,
              name: formatRegionName(region),
            }))
            .filter((region) => region.name.toLowerCase().includes(normalizedQuery))
            .filter(
              (region, index, array) =>
                array.findIndex((item) => item.name === region.name) === index,
            )
            .slice(0, 8),
        );
        setSportResults(
          sportList
            .filter((sport) => sport.isActive !== false)
            .filter((sport) =>
              [sport.name, sport.category].some((value) =>
                normalizeText(value).toLowerCase().includes(normalizedQuery),
              ),
            )
            .slice(0, 8),
        );
      } catch {
        if (!active) {
          return;
        }

        setMeetingResults([]);
        setMeetingTotalCount(0);
        setRegionResults([]);
        setSportResults([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadResults();
    return () => {
      active = false;
    };
  }, [query]);

  const totalResultCount = useMemo(
    () => meetingTotalCount + regionResults.length + sportResults.length,
    [meetingTotalCount, regionResults.length, sportResults.length],
  );

  const submitSearch = (nextKeyword) => {
    const normalizedKeyword = normalizeText(nextKeyword);
    if (!normalizedKeyword) {
      setSearchParams({});
      return;
    }

    setSearchParams({ q: normalizedKeyword });
  };

  return (
    <DashboardShell
      title="통합 검색"
      description="모임, 지역, 운동 종목을 한 번에 찾아보고 바로 이동할 수 있습니다."
      headerSearchValue={keyword}
      onHeaderSearchChange={(event) => setKeyword(event.target.value)}
      onHeaderSearchSubmit={submitSearch}
    >
      <section className={styles.heroCard}>
        <div>
          <span className={styles.eyebrow}>UNIFIED SEARCH</span>
          <h1>모임, 지역, 운동을 한 번에 찾아보세요</h1>
          <p>키워드를 입력하면 관련 모임과 지역, 운동 종목을 함께 보여줍니다.</p>
        </div>

        <form
          className={styles.searchForm}
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch(keyword);
          }}
        >
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="예: 파주 러닝, 야당역, 풋살"
          />
          <button type="submit">검색</button>
        </form>

        <div className={styles.searchMeta}>
          <strong>{query ? `"${query}" 검색 결과` : "검색어를 입력해보세요"}</strong>
          <span>
            {query
              ? `총 ${totalResultCount}개의 관련 결과를 찾았습니다.`
              : "모임명, 지역명, 운동 종목명으로 검색할 수 있습니다."}
          </span>
        </div>
      </section>

      {loading ? (
        <section className={styles.sectionCard}>
          <p className={styles.emptyState}>검색 결과를 불러오는 중입니다.</p>
        </section>
      ) : (
        <div className={styles.resultLayout}>
          <section className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <div>
                <h2>관련 모임</h2>
                <p>모임명, 내용, 지역, 운동 종목이 포함된 결과입니다.</p>
              </div>
              {query ? (
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => navigate(`/meetings?keyword=${encodeURIComponent(query)}`)}
                >
                  전체 모임 보기
                </button>
              ) : null}
            </div>

            <div className={styles.meetingList}>
              {meetingResults.length ? (
                meetingResults.map((meeting) => (
                  <Link
                    key={meeting.meetingId}
                    to={`/meetings/${meeting.meetingId}`}
                    className={styles.meetingCard}
                  >
                    <div className={styles.meetingTags}>
                      <span>{meeting.sportName}</span>
                      <span>{meetingStatusText[meeting.status] ?? "상태 확인 필요"}</span>
                    </div>
                    <strong>{meeting.title}</strong>
                    <p>{meeting.regionName}</p>
                    <small>{formatMeetingSchedule(meeting.meetingDate, meeting.startTime)}</small>
                  </Link>
                ))
              ) : (
                <p className={styles.emptyState}>관련 모임이 없습니다.</p>
              )}
            </div>
          </section>

          <section className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <div>
                <h2>관련 지역</h2>
                <p>검색어가 포함된 지역명입니다.</p>
              </div>
            </div>

            <div className={styles.chipList}>
              {regionResults.length ? (
                regionResults.map((region) => (
                  <button
                    key={`${region.regionId}-${region.name}`}
                    type="button"
                    className={styles.resultChip}
                    onClick={() =>
                      navigate(
                        `/meetings?keyword=${encodeURIComponent(region.name)}&global=1`,
                      )
                    }
                  >
                    {region.name}
                  </button>
                ))
              ) : (
                <p className={styles.emptyState}>관련 지역이 없습니다.</p>
              )}
            </div>
          </section>

          <section className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <div>
                <h2>관련 운동</h2>
                <p>운동명과 카테고리에 검색어가 포함된 결과입니다.</p>
              </div>
            </div>

            <div className={styles.chipList}>
              {sportResults.length ? (
                sportResults.map((sport) => (
                  <button
                    key={sport.sportId}
                    type="button"
                    className={styles.resultChip}
                    onClick={() =>
                      navigate(
                        `/meetings?sportName=${encodeURIComponent(sport.name)}&global=1`,
                      )
                    }
                  >
                    <strong>{sport.name}</strong>
                    <span>{sport.category || "기타"}</span>
                  </button>
                ))
              ) : (
                <p className={styles.emptyState}>관련 운동이 없습니다.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
