import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppModal from "../components/AppModal";
import DashboardShell from "../components/DashboardShell";
import UiIcon from "../components/UiIcon";
import { meetings, regions, sports } from "../data/demoData";
import { meetingImages } from "../data/dashboardData";
import styles from "../styles/MeetingListPage.module.css";
import { getMeeting, getMeetings, getTopRegions } from "../api/meetingApi";

const cx = (...names) =>
  names
    .filter(Boolean)
    .map((name) => styles[name])
    .join(" ");

const ALL_SPORT = "전체";
const ALL_REGION = "전체 지역";
const ALL_STATUS = "전체 상태";

const weekdayLabels = ["오늘", "내일", "토", "일"];

export default function MeetingListPage() {
  const [sport, setSport] = useState(ALL_SPORT);
  const [region, setRegion] = useState(ALL_REGION);
  const [status, setStatus] = useState(ALL_STATUS);
  const [meetingDate, setMeetingDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [sport2, setSport2] = useState("전체");
  const [region2, setRegion2] = useState(null);
  const [status2, setStatus2] = useState("");
  const [keyword2, setKeyword2] = useState("");
  const [meeting2, setMeeting2] = useState([]);
  const [statusText, setStatusText] = useState("모집중");
  const [meetingHost, setMeetingHost] = useState("민수");
  const [displayDate, setDisplayDate] = useState("05.16");
  const [time, setTime] = useState("20:00");
  const [topRegions, setTopRegions] = useState([]);

  const STATUS_MAP = {
    RECRUITING: "모집중",
    CLOSED: "모집마감",
    COMPLETED: "모임완료",
    CANCELLED: "취소됨",
  };

  const fixedSports = sports.map((sport) => sport.name);

  const searchParams = useMemo(() => {
    return {
      sportName: sport2,
      regionId: region2,
      status: status2,
      keyword: keyword2,
      fixedSports: fixedSports,
      meetingDate: meetingDate,
    };
  }, [sport2, region2, status2, keyword2, fixedSports, meetingDate]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await getMeetings(searchParams);
        setMeeting2(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMeetings();
  }, [searchParams]);

  useEffect(() => {
    const fetchTopRegions = async () => {
      try {
        const response = await getTopRegions();
        setTopRegions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(error);
        setTopRegions([]);
      }
    };

    fetchTopRegions();
  }, []);

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const q = keyword.trim();

      return (
        (sport === ALL_SPORT || meeting.sport === sport) &&
        (region === ALL_REGION || meeting.region === region) &&
        (status === ALL_STATUS || meeting.statusText === status) &&
        (!q ||
          meeting.title.includes(q) ||
          meeting.place.includes(q) ||
          meeting.desc.includes(q))
      );
    });
  }, [sport, region, status, keyword]);

  return (
    <DashboardShell
      active="모임 찾기"
      title="모임 찾기"
      description="지역과 운동 종목을 기준으로 지금 참여할 수 있는 모임을 빠르게 골라보세요."
      aside={
        <>
          <section className={styles.dashboardPanel}>
            <div className={styles.dashboardPanelHead}>
              <h3>인기 지역</h3>
            </div>
            <div className={styles.dashboardSimpleList}>
              {topRegions.map((item, index) => (
                <div key={`${item.name}-${index}`}>
                  <span>
                    {index + 1}. {item.name}
                  </span>
                  <strong>{item.count}개</strong>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.dashboardPanel}>
            <div className={styles.dashboardPanelHead}>
              <h3>이번 주 일정</h3>
            </div>
            <div className={styles.dashboardScheduleList}>
              {meetings.slice(0, 4).map((meeting, index) => (
                <div key={meeting.id} className={styles.dashboardScheduleItem}>
                  <span>{weekdayLabels[index]}</span>
                  <strong>{meeting.time}</strong>
                  <p>{meeting.title}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      }
    >
      <section className={styles.notice}>
        <div>
          <h1>이번 주말, 동네에서 같이 운동할 사람을 찾아보세요.</h1>
          <p>
            운동 종목과 지역을 선택하면 모집 중인 모임을 빠르게 확인할 수
            있습니다.
          </p>
        </div>
        <Link to="/meetings/new">모임 만들기</Link>
      </section>

      <div className={styles.mobileFilterBar}>
        <button type="button" onClick={() => setIsFilterOpen(true)}>
          필터 열기
        </button>
        <span>
          {sport} · {region} · {status}
        </span>
      </div>

      <section className={styles.filterPanel}>
        <div className={styles.tabs}>
          {[ALL_SPORT, ...sports.map((item) => item.name)].map((item) => (
            <button
              key={item}
              className={cx("tabButton", sport2 === item && "tabButtonActive")}
              type="button"
              onClick={() => setSport2(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className={styles.filterRow}>
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          >
            <option>{ALL_REGION}</option>
            {regions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={status2}
            onChange={(event) => {
              setStatus2(event.target.value);
            }}
          >
            <option value="">전체 상태</option>
            <option value="RECRUITING">모집중</option>
            <option value="CLOSED">모집마감</option>
            <option value="COMPLETED">모임완료</option>
            <option value="CANCELLED">취소됨</option>
          </select>
          <input
            type="date"
            value={meetingDate}
            onChange={(event) => setMeetingDate(event.target.value)}
          />
          <input
            value={keyword2}
            onChange={(event) => setKeyword2(event.target.value)}
            placeholder="운동명, 제목, 지역 검색"
          />
        </div>
      </section>

      <div className={styles.listHead}>
        <h2>파주시 주변 모임</h2>
        <span>총 {meeting2.length}개</span>
      </div>

      <section className={styles.meetingList}>
        {meeting2.length === 0 ? (
          <div
            style={{ padding: "80px 0", textAlign: "center", color: "#666" }}
          >
            <div style={{ marginRight: "0px" }}>
              <h3
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "8px",
                  color: "#333",
                }}
              >
                조건에 맞는 모임이 없습니다
              </h3>
              <p>선택하신 지역이나 종목, 날짜를 변경해 보세요.</p>
              <button
                type="button"
                onClick={() => {
                  // 검색 조건 초기화 버튼 기능
                  setSport2("전체");
                  setRegion2(null);
                  setStatus2("");
                  setKeyword2("");
                  setMeetingDate("");
                }}
                style={{
                  marginTop: "16px",
                  padding: "8px 16px",
                  backgroundColor: "#f0f0f0",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                검색 조건 초기화
              </button>
            </div>
          </div>
        ) : (
          meeting2.map((meeting) => (
            <Link
              key={meeting.meetingId}
              className={styles.listCard}
              to={`/meetings/${meeting.meetingId}`}
            >
              <div className={styles.listCardBody}>
                <img
                  src={meeting.thumbnailImage}
                  alt={meeting.title}
                  className={styles.listCardImage}
                />
                <div className={styles.listCardContent}>
                  <div className={styles.listTags}>
                    <span className={styles.badge}>{meeting.sportName}</span>
                    <span
                      className={cx(
                        "badge",
                        meeting.status === "CLOSED" ||
                          meeting.status === "CANCELLED"
                          ? "warning"
                          : "success",
                      )}
                    >
                      {STATUS_MAP[meeting.status] || "알 수 없음"}
                    </span>
                  </div>
                  <h3>{meeting.title}</h3>
                  <p>{meeting.content}</p>
                  <div className={styles.listMeta}>
                    <span>
                      <UiIcon
                        name="location"
                        className={styles.dashboardMetaIcon}
                      />
                      {meeting.regionName}
                    </span>
                    <span>
                      <UiIcon
                        name="calendar"
                        className={styles.dashboardMetaIcon}
                      />
                      {meeting.placeName}
                    </span>
                    <span>
                      <UiIcon
                        name="user"
                        className={styles.dashboardMetaIcon}
                      />
                      {meeting.approvedCount}/{meeting.maxMembers}명
                    </span>
                  </div>
                  <div className={styles.host}>
                    <i>
                      <UiIcon
                        name="user"
                        className={styles.dashboardHostIcon}
                      />
                    </i>
                    <span>{meeting.meetingHostName} · 매너점수 4.8</span>
                  </div>
                </div>
              </div>

              <aside>
                <div className={styles.dateBox}>
                  <span>
                    {meeting.meetingDate.split("-").slice(1).join(".")}
                  </span>
                  <strong>{meeting.startTime.slice(0, 5)}</strong>
                </div>
                <button
                  type="button"
                  className={
                    meeting.status === "CLOSED" ? styles.actionClosed : ""
                  }
                >
                  {meeting.status === "CLOSED" ? "마감" : "참가 신청"}
                </button>
              </aside>
            </Link>
          ))
        )}
      </section>

      <AppModal
        open={isFilterOpen}
        variant="sheet"
        eyebrow="모임 필터"
        title="원하는 모임만 빠르게 볼까요?"
        description="모바일에서도 필터를 한 번에 펼쳐서 고르고, 목록은 넓게 보이도록 정리했습니다."
        confirmText="필터 적용"
        onClose={() => setIsFilterOpen(false)}
        onConfirm={() => setIsFilterOpen(false)}
      >
        {/* 1. 운동 종목 선택 (sport2 연동) */}
        <div className={styles.sheetSportGrid}>
          {[ALL_SPORT, ...sports.map((item) => item.name)].map((item) => (
            <button
              key={item}
              className={cx("sheetChip", sport2 === item && "sheetChipActive")}
              type="button"
              onClick={() => setSport2(item)} // sport -> sport2로 변경
            >
              {item}
            </button>
          ))}
        </div>

        <div className={styles.sheetFilterFields}>
          {/* 2. 지역 선택 (region2 연동) */}
          <select
            value={region2 || ""}
            onChange={(event) => setRegion2(event.target.value)} // region -> region2로 변경
          >
            <option value="">{ALL_REGION}</option>
            {regions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          {/* 3. 모임 상태 선택 (status2 연동 및 영문 코드 매핑) */}
          <select
            value={status2}
            onChange={(event) => setStatus2(event.target.value)} // status -> status2로 변경
          >
            <option value="">전체 상태</option>
            <option value="RECRUITING">모집중</option>
            <option value="CLOSED">모집마감</option>
          </select>

          {/* 4. 날짜 선택 */}
          <input
            type="date"
            value={meetingDate}
            onChange={(event) => setMeetingDate(event.target.value)}
          />

          {/* 5. 키워드 검색 (keyword2 연동) */}
          <input
            value={keyword2}
            onChange={(event) => setKeyword2(event.target.value)} // keyword -> keyword2로 변경
            placeholder="제목, 장소 검색"
          />
        </div>
      </AppModal>
    </DashboardShell>
  );
}
