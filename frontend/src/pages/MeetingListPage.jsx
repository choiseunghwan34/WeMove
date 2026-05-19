import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppModal from "../components/AppModal";
import DashboardShell from "../components/DashboardShell";
import UiIcon from "../components/UiIcon";
import { meetings, regions, sports } from "../data/demoData";
import { meetingImages } from "../data/dashboardData";
import styles from "../styles/MeetingListPage.module.css";

const cx = (...names) =>
  names
    .filter(Boolean)
    .map((name) => styles[name])
    .join(" ");

const ALL_SPORT = "전체";
const ALL_REGION = "전체 지역";
const ALL_STATUS = "전체 상태";

const regionRanking = [
  { name: "운정동", count: 38 },
  { name: "야당동", count: 27 },
  { name: "금촌동", count: 19 },
  { name: "문산읍", count: 13 },
];

const weekdayLabels = ["오늘", "내일", "토", "일"];

export default function MeetingListPage() {
  const [sport, setSport] = useState(ALL_SPORT);
  const [region, setRegion] = useState(ALL_REGION);
  const [status, setStatus] = useState(ALL_STATUS);
  const [date, setDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
              {regionRanking.map((item, index) => (
                <div key={item.name}>
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
              className={cx("tabButton", sport === item && "tabButtonActive")}
              type="button"
              onClick={() => setSport(item)}
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
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>{ALL_STATUS}</option>
            <option>모집중</option>
            <option>모집마감</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="제목, 장소 검색"
          />
        </div>
      </section>

      <div className={styles.listHead}>
        <h2>파주시 주변 모임</h2>
        <span>총 {filteredMeetings.length}개</span>
      </div>

      <section className={styles.meetingList}>
        {filteredMeetings.map((meeting) => (
          <Link
            key={meeting.id}
            className={styles.listCard}
            to={`/meetings/${meeting.id}`}
          >
            <div className={styles.listCardBody}>
              <img
                src={meetingImages[meeting.id]}
                alt={meeting.title}
                className={styles.listCardImage}
              />
              <div className={styles.listCardContent}>
                <div className={styles.listTags}>
                  <span className={styles.badge}>{meeting.sport}</span>
                  <span
                    className={cx(
                      "badge",
                      meeting.status === "CLOSED" ? "warning" : "success",
                    )}
                  >
                    {meeting.statusText}
                  </span>
                </div>
                <h3>{meeting.title}</h3>
                <p>{meeting.desc}</p>
                <div className={styles.listMeta}>
                  <span>
                    <UiIcon
                      name="location"
                      className={styles.dashboardMetaIcon}
                    />
                    {meeting.region}
                  </span>
                  <span>
                    <UiIcon
                      name="calendar"
                      className={styles.dashboardMetaIcon}
                    />
                    {meeting.place}
                  </span>
                  <span>
                    <UiIcon name="user" className={styles.dashboardMetaIcon} />
                    {meeting.current}/{meeting.max}명
                  </span>
                </div>
                <div className={styles.host}>
                  <i>
                    <UiIcon name="user" className={styles.dashboardHostIcon} />
                  </i>
                  <span>{meeting.host} · 매너점수 4.8</span>
                </div>
              </div>
            </div>

            <aside>
              <div className={styles.dateBox}>
                <span>{meeting.displayDate}</span>
                <strong>{meeting.time}</strong>
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
        ))}
      </section>

      <AppModal
        open={isFilterOpen}
        variant="sheet"
        eyebrow="모임 필터"
        title="원하는 모임만 빠르게 볼까요?"
        description="모바일에서는 필터를 한 번에 펼쳐서 고르고, 목록은 넓게 보이도록 정리했습니다."
        confirmText="필터 적용"
        onClose={() => setIsFilterOpen(false)}
        onConfirm={() => setIsFilterOpen(false)}
      >
        <div className={styles.sheetSportGrid}>
          {[ALL_SPORT, ...sports.map((item) => item.name)].map((item) => (
            <button
              key={item}
              className={cx("sheetChip", sport === item && "sheetChipActive")}
              type="button"
              onClick={() => setSport(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className={styles.sheetFilterFields}>
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
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>{ALL_STATUS}</option>
            <option>모집중</option>
            <option>모집마감</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="제목, 장소 검색"
          />
        </div>
      </AppModal>
    </DashboardShell>
  );
}
