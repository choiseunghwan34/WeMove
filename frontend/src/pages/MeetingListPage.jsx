import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import AppModal from "../components/AppModal";
import DashboardShell from "../components/DashboardShell";
import Pagination from "../components/Pagination";
import UiIcon from "../components/UiIcon";
import { meetings, regions, sports } from "../data/demoData";
import { meetingImages } from "../data/dashboardData";
import styles from "../styles/MeetingListPage.module.css";
import { getMeeting, getMeetings, getTopRegions } from "../api/meetingApi";

const cx = (...names) =>
  names
    .filter(Boolean)
    .map((name) => styles[name] || name)
    .join(" ");

const ALL_SPORT = "전체";
const ALL_REGION = "전체 지역";
const ALL_STATUS = "전체 상태";

const PAGE_SIZE = 10;
const weekdayLabels = ["오늘", "내일", "토", "일"];

export default function MeetingListPage() {
  const listStartRef = useRef(null);
  const [meetingDate, setMeetingDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [sport2, setSport2] = useState("전체");
  const [region2, setRegion2] = useState("");
  const [status2, setStatus2] = useState("");
  const [keyword2, setKeyword2] = useState("");
  const [meeting2, setMeeting2] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
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
      regionId: region2 || null,
      status: status2,
      keyword: keyword2,
      fixedSports: fixedSports,
      meetingDate: meetingDate,
      page: currentPage,
      size: PAGE_SIZE,
    };
  }, [
    sport2,
    region2,
    status2,
    keyword2,
    fixedSports,
    meetingDate,
    currentPage,
  ]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await getMeetings(searchParams);
        if (response.data) {
          setMeeting2(response.data.list || []);
          setTotalCount(response.data.totalCount || 0);
        }
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

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handlePageChange = (page) => {
    setCurrentPage(page);

    if (!listStartRef.current) {
      return;
    }

    const listTop =
      listStartRef.current.getBoundingClientRect().top + window.scrollY - 8;

    window.scrollTo({ top: listTop, behavior: "smooth" });
  };

  const resetFilters = () => {
    setSport2("전체");
    setRegion2("");
    setStatus2("");
    setKeyword2("");
    setMeetingDate("");
    setCurrentPage(1);
  };

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
          {sport2} · {region2 || ALL_REGION} · {status2 || "전체 상태"}
        </span>
      </div>

      <section className={styles.filterPanel} ref={listStartRef}>
        <div className={styles.tabs}>
          {[ALL_SPORT, ...sports.map((item) => item.name)].map((item) => (
            <button
              key={item}
              className={cx("tabButton", sport2 === item && "tabButtonActive")}
              type="button"
              onClick={() => {
                setSport2(item);
                setCurrentPage(1);
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className={styles.filterRow}>
          <select
            value={region2}
            onChange={(event) => {
              setRegion2(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">{ALL_REGION}</option>
            {regions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={status2}
            onChange={(event) => {
              setStatus2(event.target.value);
              setCurrentPage(1);
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
            onChange={(event) => {
              setMeetingDate(event.target.value);
              setCurrentPage(1);
            }}
          />
          <input
            value={keyword2}
            onChange={(event) => {
              setKeyword2(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="운동명, 제목, 지역 검색"
          />
          <button
            type="button"
            className={styles.resetButton}
            onClick={resetFilters}
          >
            <UiIcon name="refresh" className={styles.resetIcon} />
            초기화
          </button>
        </div>
      </section>

      <div className={styles.listHead}>
        <h2>파주시 주변 모임</h2>
        <span>총 {totalCount}개</span>
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
                onClick={resetFilters}
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

      {totalCount > 0 && (
        <div className={styles.paginationWrapper}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
            variant="centered"
          />
        </div>
      )}

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
        <div className={styles.sheetSportGrid}>
          {[ALL_SPORT, ...sports.map((item) => item.name)].map((item) => (
            <button
              key={item}
              className={cx("sheetChip", sport2 === item && "sheetChipActive")}
              type="button"
              onClick={() => {
                setSport2(item);
                setCurrentPage(1);
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className={styles.sheetFilterFields}>
          <select
            value={region2 || ""}
            onChange={(event) => {
              setRegion2(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">{ALL_REGION}</option>
            {regions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={status2}
            onChange={(event) => {
              setStatus2(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">전체 상태</option>
            <option value="RECRUITING">모집중</option>
            <option value="CLOSED">모집마감</option>
          </select>

          <input
            type="date"
            value={meetingDate}
            onChange={(event) => {
              setMeetingDate(event.target.value);
              setCurrentPage(1);
            }}
          />

          <input
            value={keyword2}
            onChange={(event) => {
              setKeyword2(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="제목, 장소 검색"
          />
        </div>
      </AppModal>
    </DashboardShell>
  );
}
