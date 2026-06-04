import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../components/DashboardShell";
import MeetingRegionPickerModal from "../components/MeetingRegionPickerModal";
import SportPickerModal from "../components/SportPickerModal2";
import UiIcon from "../components/UiIcon";
import { useAuth } from "../contexts/AuthContext";
import { categoryItems, meetingImages } from "../data/dashboardData";
import { getComments } from "../api/commentApi";
import {
  getMainMeetings,
  getMeetings,
  getPopularMeetings,
} from "../api/meetingApi";
import { getMyActivity } from "../api/memberApi";
import { getParticipants } from "../api/participantApi";
import { getRegions } from "../api/regionApi";
import { getSports } from "../api/sportApi";
import { getMeetingThumbnail } from "../utils/meetingVisuals";
import styles from "../styles/HomePage.module.css";

const heroSlides = [
  {
    title: "가볍게 시작하는 5km 러닝",
    description: "러닝부터 헬스, 풋살까지 원하는 운동을 자연스럽게 이어가요.",
    image: meetingImages[1],
  },
  {
    title: "오늘도 힘내는 웨이트 루틴",
    description: "운동 메이트가 있으면 루틴 유지가 훨씬 쉬워져요.",
    image: meetingImages[2],
  },
  {
    title: "이번 주말, 동네에서 운동할 사람 찾기",
    description:
      "지역과 날짜를 먼저 고르고, 그다음 운동을 더하면 딱 맞는 모임만 보여요.",
    image: meetingImages[5],
  },
];

const STATUS_LABELS = {
  RECRUITING: "모집중",
  CLOSED: "모집완료",
  ONGOING: "진행중",
  COMPLETED: "모임완료",
  CANCELLED: "취소됨",
};

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const pad2 = (value) => String(value).padStart(2, "0");

const toDateKey = (value) => {
  if (!value) return "";
  const date =
    value instanceof Date ? value : new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

const formatRegionLabel = (region) => {
  if (!region) return "";
  return [region.sido, region.sigungu, region.dong].filter(Boolean).join(" ");
};

const formatMeetingDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return "-";
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "-";

  const hour = Number.parseInt(String(timeStr).slice(0, 2), 10);
  const minute = String(timeStr).slice(3, 5);
  const ampm = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const dayLabel = DAY_LABELS[date.getDay()] ?? "";

  return `${date.getMonth() + 1}.${date.getDate()}(${dayLabel}) ${ampm} ${displayHour}:${minute}`;
};

const normalizeRegion = (region) => ({
  regionId: region.regionId,
  sido: region.sido ?? "",
  sigungu: region.sigungu ?? "",
  dong: region.dong ?? "",
});

const normalizeSport = (sport) => ({
  sportId: sport.sportId,
  name: sport.name ?? "",
  category: sport.category ?? "",
  isActive: sport.isActive ?? true,
});

const normalizeActivityMeeting = (meeting) => ({
  ...meeting,
  id: meeting.meetingId ?? meeting.id,
  title: meeting.title ?? "-",
  sport: meeting.sportName ?? meeting.sport ?? "-",
  region: meeting.regionName ?? meeting.region ?? "-",
  hostName:
    meeting.meetingHostName ?? meeting.hostNickname ?? meeting.host ?? "",
  meetingDate: meeting.meetingDate ?? null,
  startTime: meeting.startTime ?? "",
  status: meeting.status ?? "RECRUITING",
});

const buildRelativeText = (dateValue) => {
  if (!dateValue) return "최근";
  const today = new Date();
  const target = new Date(dateValue);
  if (Number.isNaN(target.getTime())) return String(dateValue).slice(0, 10);

  const diffMs =
    target.setHours(0, 0, 0, 0) - new Date(today.setHours(0, 0, 0, 0));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "내일";
  if (diffDays > 1) return `${diffDays}일 후`;
  if (diffDays === -1) return "어제";
  return `${Math.abs(diffDays)}일 전`;
};

const getWeekdayLabel = (dateValue) => {
  if (!dateValue) return "";
  const parsedDate = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return "";
  return DAY_LABELS[parsedDate.getDay()];
};

export default function HomePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [activeSlide, setActiveSlide] = useState(0);
  const [meetings, setMeetings] = useState([]);
  const [popularMeetings, setPopularMeetings] = useState([]);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [activityData, setActivityData] = useState({
    hostedMeetings: [],
    approvedMeetings: [],
    pendingMeetings: [],
    completedMeetings: [],
  });
  const [regionOptions, setRegionOptions] = useState([]);
  const [sportOptions, setSportOptions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isExplicitAllRegion, setIsExplicitAllRegion] = useState(false);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isSportModalOpen, setIsSportModalOpen] = useState(false);
  const [neighborhoodStats, setNeighborhoodStats] = useState({
    recruitingCount: 0,
    applicantCount: 0,
    todayCount: 0,
    newCommentCount: 0,
  });

  const memberRegion = useMemo(() => {
    if (!user?.regionId) return null;
    return (
      regionOptions.find(
        (region) => Number(region.regionId) === Number(user.regionId),
      ) ?? null
    );
  }, [regionOptions, user?.regionId]);

  const effectiveRegion = isExplicitAllRegion
    ? null
    : (selectedRegion ?? memberRegion ?? null);
  const heroRegionLabel = effectiveRegion
    ? formatRegionLabel(effectiveRegion)
    : "전체 지역";
  const heroSportLabel = selectedSport
    ? selectedSport.name || "전체 운동"
    : "전체 운동";
  const neighborhoodRegionLabel = memberRegion
    ? formatRegionLabel(memberRegion)
    : "내 동네";

  const currentHero = heroSlides[activeSlide];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 6);

  const scheduleItems = [...activityData.approvedMeetings]
    .filter((meeting) => {
      if (!meeting?.meetingDate) return false;
      const meetingDay = new Date(`${meeting.meetingDate}T00:00:00`);
      if (Number.isNaN(meetingDay.getTime())) return false;
      return meetingDay >= today && meetingDay <= nextWeek;
    })
    .sort((left, right) => {
      const leftDate = `${left.meetingDate ?? ""} ${left.startTime ?? ""}`;
      const rightDate = `${right.meetingDate ?? ""} ${right.startTime ?? ""}`;
      return leftDate.localeCompare(rightDate);
    })
    .slice(0, 4);

  const recentActivities = [
    ...activityData.hostedMeetings.slice(0, 3).map((meeting) => ({
      key: `host-${meeting.id}`,
      user: meeting.hostName || "내가",
      detail: `${meeting.title} 모임을 만들었어요.`,
      time: buildRelativeText(meeting.createdAt || meeting.meetingDate),
    })),
    ...activityData.approvedMeetings.slice(0, 2).map((meeting) => ({
      key: `approved-${meeting.id}`,
      user: meeting.hostName || "참여 예정",
      detail: `${meeting.title} 참여가 확정됐어요.`,
      time: buildRelativeText(meeting.meetingDate),
    })),
    ...activityData.pendingMeetings.slice(0, 2).map((meeting) => ({
      key: `pending-${meeting.id}`,
      user: meeting.hostName || "참여 대기",
      detail: `${meeting.title} 승인 결과를 기다리는 중이에요.`,
      time: buildRelativeText(meeting.meetingDate),
    })),
  ].slice(0, 4);

  // 메인페이지 카테고리별 모임목록조회
  useEffect(() => {
    const params =
      !activeCategory || activeCategory === "전체" || activeCategory === "?꾩껜"
        ? undefined
        : { category: activeCategory };

    getMainMeetings(params)
      .then((res) => {
        setMeetings(Array.isArray(res.data) ? res.data.slice(0, 5) : []);
      })
      .catch((err) => {
        console.error(err);
        setMeetings([]);
      });
  }, [activeCategory]);

  // 히어로 슬라이드 타이머
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % heroSlides.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  // 필터 옵션 로드
  useEffect(() => {
    let active = true;
    const fetchFilterOptions = async () => {
      try {
        const [regionsResponse, sportsResponse] = await Promise.all([
          getRegions(),
          getSports(),
        ]);
        if (!active) return;

        setRegionOptions(
          Array.isArray(regionsResponse.data)
            ? regionsResponse.data
                .map(normalizeRegion)
                .filter((region) => region.sido && region.sigungu)
            : [],
        );

        setSportOptions(
          Array.isArray(sportsResponse.data)
            ? sportsResponse.data
                .map(normalizeSport)
                .filter((sport) => sport.isActive !== false && sport.name)
            : [],
        );
      } catch (error) {
        console.error(error);
        if (active) {
          setRegionOptions([]);
          setSportOptions([]);
        }
      }
    };
    fetchFilterOptions();
    return () => {
      active = false;
    };
  }, []);

  // 인기 모임 로드
  useEffect(() => {
    let active = true;
    let intervalId = null;
    let midnightTimeoutId = null;

    const fetchPopularMeetings = async () => {
      try {
        const response = await getPopularMeetings();
        if (!active) return;

        const popularList = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : Array.isArray(response.data?.list)
              ? response.data.list
              : [];

        setPopularMeetings(popularList.slice(0, 5));
      } catch (error) {
        console.error(error);
        if (active) setPopularMeetings([]);
      }
    };

    const scheduleMidnightRefresh = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);

      midnightTimeoutId = window.setTimeout(
        () => {
          fetchPopularMeetings();
          scheduleMidnightRefresh();
        },
        Math.max(nextMidnight.getTime() - now.getTime(), 0),
      );
    };

    fetchPopularMeetings();
    intervalId = window.setInterval(fetchPopularMeetings, 60 * 1000);
    scheduleMidnightRefresh();

    return () => {
      active = false;
      if (intervalId) window.clearInterval(intervalId);
      if (midnightTimeoutId) window.clearTimeout(midnightTimeoutId);
    };
  }, []);

  // 내 활동 데이터 로드
  useEffect(() => {
    if (!user?.memberId) {
      setActivityData({
        hostedMeetings: [],
        approvedMeetings: [],
        pendingMeetings: [],
        completedMeetings: [],
      });
      return undefined;
    }
    let active = true;
    const fetchActivity = async () => {
      try {
        const response = await getMyActivity(user.memberId);
        const payload = response.data ?? {};
        if (!active) return;

        setActivityData({
          hostedMeetings: Array.isArray(payload.hostedMeetings)
            ? payload.hostedMeetings.map(normalizeActivityMeeting)
            : [],
          approvedMeetings: Array.isArray(payload.approvedMeetings)
            ? payload.approvedMeetings.map(normalizeActivityMeeting)
            : [],
          pendingMeetings: Array.isArray(payload.pendingMeetings)
            ? payload.pendingMeetings.map(normalizeActivityMeeting)
            : [],
          completedMeetings: Array.isArray(payload.completedMeetings)
            ? payload.completedMeetings.map(normalizeActivityMeeting)
            : [],
        });
      } catch (error) {
        console.error(error);
        if (active) {
          setActivityData({
            hostedMeetings: [],
            approvedMeetings: [],
            pendingMeetings: [],
            completedMeetings: [],
          });
        }
      }
    };
    fetchActivity();
    return () => {
      active = false;
    };
  }, [user?.memberId]);

  // 우리 동네 현황 통계 데이터 계산
  useEffect(() => {
    if (!user?.regionId) {
      setNeighborhoodStats({
        recruitingCount: 0,
        applicantCount: 0,
        todayCount: 0,
        newCommentCount: 0,
      });
      return undefined;
    }
    let active = true;
    const fetchNeighborhoodStats = async () => {
      try {
        const todayKey = toDateKey(new Date());
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setHours(0, 0, 0, 0);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        const { data } = await getMeetings({
          regionId: user.regionId,
          page: 1,
          size: 100,
        });
        const regionMeetings = Array.isArray(data?.list) ? data.list : [];

        const recruitingCount = regionMeetings.filter(
          (meeting) => meeting.status === "RECRUITING",
        ).length;
        const todayCount = regionMeetings.filter(
          (meeting) =>
            toDateKey(meeting.meetingDate) === todayKey &&
            meeting.status !== "CANCELLED",
        ).length;
        const activeMeetings = regionMeetings.filter((meeting) =>
          ["RECRUITING", "CLOSED", "ONGOING"].includes(meeting.status),
        );

        const [participantsResult, commentsResult] = await Promise.all([
          Promise.allSettled(
            activeMeetings.map((meeting) => getParticipants(meeting.meetingId)),
          ),
          Promise.allSettled(
            activeMeetings.map((meeting) => getComments(meeting.meetingId)),
          ),
        ]);

        if (!active) return;

        const applicantCount = participantsResult.reduce((sum, result) => {
          const participants = Array.isArray(result.value?.data)
            ? result.value.data
            : [];
          return sum + participants.length;
        }, 0);

        const newCommentCount = commentsResult.reduce((sum, result) => {
          const comments = Array.isArray(result.value?.data)
            ? result.value.data
            : [];
          return (
            sum +
            comments.filter((comment) => {
              const createdAt = comment?.createdAt
                ? new Date(String(comment.createdAt).replace(" ", "T"))
                : null;
              return (
                createdAt &&
                !Number.isNaN(createdAt.getTime()) &&
                createdAt >= sevenDaysAgo
              );
            }).length
          );
        }, 0);

        setNeighborhoodStats({
          recruitingCount,
          applicantCount,
          todayCount,
          newCommentCount,
        });
      } catch (error) {
        console.error(error);
        if (active) {
          setNeighborhoodStats({
            recruitingCount: 0,
            applicantCount: 0,
            todayCount: 0,
            newCommentCount: 0,
          });
        }
      }
    };
    fetchNeighborhoodStats();
    return () => {
      active = false;
    };
  }, [user?.regionId]);

  const statsCards = [
    {
      label: "모집중 모임",
      value: `${neighborhoodStats.recruitingCount}개`,
      tone: "blue",
      icon: "spark",
    },
    {
      label: "참여 예정 인원",
      value: `${neighborhoodStats.applicantCount}명`,
      tone: "indigo",
      icon: "user",
    },
    {
      label: "오늘 진행 모임",
      value: `${neighborhoodStats.todayCount}개`,
      tone: "green",
      icon: "calendar",
    },
    {
      label: "신규 댓글",
      value: `${neighborhoodStats.newCommentCount}개`,
      tone: "mint",
      icon: "comment",
    },
  ];

  const buildMeetingSearchUrl = () => {
    const params = new URLSearchParams();
    if (effectiveRegion)
      params.set("regionLabel", formatRegionLabel(effectiveRegion));
    else params.set("global", "1");
    if (selectedSport?.name) params.set("sportName", selectedSport.name);
    if (selectedDate) params.set("meetingDate", selectedDate);
    return `/meetings${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const handleApplyRegion = (selection) => {
    const hasSelection = Boolean(
      selection?.regionId ||
      selection?.sido ||
      selection?.sigungu ||
      selection?.dong,
    );
    if (!hasSelection) {
      setSelectedRegion(null);
      setIsExplicitAllRegion(true);
      setIsRegionModalOpen(false);
      return;
    }
    setSelectedRegion(selection);
    setIsExplicitAllRegion(false);
    setIsRegionModalOpen(false);
  };

  const handleApplySport = (sport) => {
    setSelectedSport(sport ?? null);
    setIsSportModalOpen(false);
  };

  const topRegionLabel = memberRegion ? neighborhoodRegionLabel : "전체 지역";

  const homeAside = isAdmin ? null : (
    <>
      <section className={styles.dashboardPanel}>
        <div className={styles.dashboardPanelHead}>
          <div>
            <h3>실시간 인기 모임</h3>
            <span className={styles.dashboardPanelHint}>
              기준: 오늘 조회수 · 0시 자동 초기화
            </span>
          </div>
        </div>
        <div className={styles.dashboardRankList}>
          {popularMeetings.slice(0, 5).map((meeting, index) => (
            <Link
              key={meeting.meetingId}
              to={`/meetings/${meeting.meetingId}`}
              className={styles.dashboardRankItem}
            >
              <b>{index + 1}</b>
              <div>
                <strong>{meeting.title}</strong>
                <span>{meeting.viewCount ?? meeting.views ?? 0}회 조회</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.dashboardPanel}>
        <div className={styles.dashboardPanelHead}>
          <h3>이번 주 일정</h3>
          <Link to="/meetings">전체 일정 보기</Link>
        </div>
        <div className={styles.dashboardScheduleList}>
          {scheduleItems.length ? (
            scheduleItems.map((meeting) => {
              const relativeDate = buildRelativeText(meeting.meetingDate);
              const weekday = getWeekdayLabel(meeting.meetingDate);
              const displayDate =
                relativeDate.includes("일 전") || relativeDate.includes("일 후")
                  ? `${String(meeting.meetingDate).slice(5).replace("-", "")}${weekday ? ` (${weekday})` : ""}`
                  : `${relativeDate}${weekday ? ` (${weekday})` : ""}`;

              return (
                <div
                  key={`schedule-${meeting.id}`}
                  className={styles.dashboardScheduleItem}
                >
                  <span>{displayDate}</span>
                  <strong>
                    {String(meeting.startTime ?? "").slice(0, 5) || "--:--"}
                  </strong>
                  <p>{meeting.title}</p>
                </div>
              );
            })
          ) : (
            <div className={styles.dashboardScheduleItem}>
              <span>-</span>
              <strong>-</strong>
              <p>예정된 일정이 아직 없어요.</p>
            </div>
          )}
        </div>
      </section>

      <section className={styles.dashboardPanel}>
        <div className={styles.dashboardPanelHead}>
          <h3>최근 활동</h3>
        </div>
        <div className={styles.dashboardActivityList}>
          {recentActivities.length ? (
            recentActivities.map((activity) => (
              <div key={activity.key} className={styles.dashboardActivityItem}>
                <i>{activity.user.slice(0, 1)}</i>
                <div>
                  <strong>{activity.user}</strong>
                  <p>{activity.detail}</p>
                </div>
                <span>{activity.time}</span>
              </div>
            ))
          ) : (
            <div className={styles.dashboardActivityItem}>
              <i>i</i>
              <div>
                <strong>최근 활동이 없어요</strong>
                <p>모임에 참여하거나 만들면 이곳에 표시됩니다.</p>
              </div>
              <span>-</span>
            </div>
          )}
        </div>
      </section>
    </>
  );

  return (
    <DashboardShell active="홈" aside={homeAside}>
      <section className={styles.dashboardHeroRow}>
        <div className={styles.dashboardHeroCard}>
          <div className={styles.heroCarousel} aria-hidden="true">
            {heroSlides.map((slide, index) => (
              <img
                key={slide.title}
                src={slide.image}
                alt=""
                className={
                  index === activeSlide
                    ? styles.heroSlideActive
                    : styles.heroSlide
                }
              />
            ))}
          </div>

          <div className={styles.dashboardHeroContent}>
            <div>
              <span className={styles.heroKicker}>LOCAL FITNESS COMMUNITY</span>
              <h1>{currentHero.title}</h1>
              <p>{currentHero.description}</p>
            </div>

            <div className={styles.dashboardHeroFilters}>
              <button
                type="button"
                className={styles.dashboardHeroChoiceButton}
                onClick={() => setIsRegionModalOpen(true)}
              >
                <span>
                  <UiIcon
                    name="location"
                    className={styles.dashboardInlineIcon}
                  />
                </span>
                <div className={styles.dashboardHeroChoiceText}>
                  <small>지역</small>
                  <strong>{heroRegionLabel}</strong>
                </div>
                <UiIcon
                  name="chevronDown"
                  className={styles.dashboardHeroChoiceChevron}
                />
              </button>

              <button
                type="button"
                className={styles.dashboardHeroChoiceButton}
                onClick={() => setIsSportModalOpen(true)}
              >
                <span>
                  <UiIcon name="spark" className={styles.dashboardInlineIcon} />
                </span>
                <div className={styles.dashboardHeroChoiceText}>
                  <small>운동</small>
                  <strong>{heroSportLabel}</strong>
                </div>
                <UiIcon
                  name="chevronDown"
                  className={styles.dashboardHeroChoiceChevron}
                />
              </button>

              <label className={styles.dashboardHeroDateField}>
                <span>
                  <UiIcon
                    name="calendar"
                    className={styles.dashboardInlineIcon}
                  />
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                />
              </label>

              <Link
                to={buildMeetingSearchUrl()}
                className={styles.dashboardHeroButton}
              >
                모임 찾기
              </Link>
            </div>

            <div className={styles.heroDots} aria-label="메인 배너 슬라이드">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  className={
                    index === activeSlide
                      ? styles.heroDotActive
                      : styles.heroDot
                  }
                  onClick={() => setActiveSlide(index)}
                  aria-label={`${index + 1}번째 배너 보기`}
                />
              ))}
            </div>
          </div>
        </div>

        <section className={styles.dashboardSummaryCard}>
          <div className={styles.dashboardSidebarHead}>
            <strong>우리 동네 현황</strong>
            <span>{topRegionLabel}</span>
          </div>
          <div className={styles.dashboardSummaryGrid}>
            {statsCards.map((stat) => (
              <article key={stat.label}>
                <i
                  className={
                    styles[
                      `dashboardTone${stat.tone[0].toUpperCase()}${stat.tone.slice(1)}`
                    ]
                  }
                >
                  <UiIcon
                    name={stat.icon}
                    className={styles.dashboardStatIcon}
                  />
                </i>
                <div>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className={styles.dashboardCategoryStrip}>
        {categoryItems.map((item) => (
          <button
            key={item.name}
            type="button"
            className={`${styles.dashboardCategoryItem} ${activeCategory === item.name ? styles.active : ""}`}
            onClick={() => setActiveCategory(item.name)}
            style={{ flex: "1", minWidth: "0", padding: "6px 2px" }}
          >
            <i
              className={
                styles[
                  `dashboardTone${item.accent[0].toUpperCase()}${item.accent.slice(1)}`
                ]
              }
            >
              <UiIcon
                name={item.icon}
                className={styles.dashboardCategoryGlyph}
              />
            </i>
            <span>{item.name}</span>
          </button>
        ))}
      </section>

      <section className={styles.dashboardSection}>
        <div className={styles.dashboardSectionHead}>
          <div>
            <h2>신규 생성 모임</h2>
          </div>
        </div>

        <div className={styles.dashboardFeed}>
          {meetings.length > 0 ? (
            meetings.slice(0, 5).map((meeting, index) => (
              <article
                key={meeting.meetingId}
                className={styles.dashboardMeetingCard}
              >
                <img
                  src={getMeetingThumbnail(meeting)}
                  alt={meeting.title}
                  className={styles.dashboardMeetingImage}
                />
                <div className={styles.dashboardMeetingBody}>
                  <div className={styles.dashboardMeetingBadges}>
                    <span>{meeting.sportName}</span>
                    <span className={styles.dashboardStatusBadge}>
                      {STATUS_LABELS[meeting.status] ?? meeting.status}
                    </span>
                  </div>
                  <h3>{meeting.title}</h3>
                  <p>{meeting.content}</p>
                  <div className={styles.dashboardMeetingMeta}>
                    <span>
                      <UiIcon
                        name="location"
                        className={styles.dashboardMetaIcon}
                      />{" "}
                      {meeting.regionName}
                    </span>
                    <span>
                      <UiIcon
                        name="calendar"
                        className={styles.dashboardMetaIcon}
                      />{" "}
                      {formatMeetingDateTime(
                        meeting.meetingDate,
                        meeting.startTime,
                      )}
                    </span>
                    <span>
                      <UiIcon
                        name="user"
                        className={styles.dashboardMetaIcon}
                      />{" "}
                      {meeting.approvedCount ?? 0} / {meeting.maxMembers}명
                    </span>
                  </div>
                  <div className={styles.dashboardMeetingFooter}>
                    <div className={styles.dashboardMeetingActions}>
                      <button type="button">
                        <UiIcon
                          name="comment"
                          className={styles.dashboardActionIcon}
                        />{" "}
                        6
                      </button>
                      <button type="button">
                        <UiIcon
                          name="share"
                          className={styles.dashboardActionIcon}
                        />
                      </button>
                      <Link to={`/meetings/${meeting.meetingId}`}>
                        상세 보기
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className={styles.emptyContainer}>
              <h3>해당 카테고리의 모임이 없습니다.</h3>
              <p>
                새로운 모임을 직접 만들어보거나 다른 카테고리를 확인해보세요!
              </p>
              <Link to="/meetings/new" className={styles.dashboardHeroButton}>
                모임만들기
              </Link>
            </div>
          )}
        </div>
      </section>

      <MeetingRegionPickerModal
        open={isRegionModalOpen}
        regions={regionOptions}
        initialSelection={
          selectedRegion ??
          (isExplicitAllRegion
            ? { regionId: null, sido: "", sigungu: "", dong: "" }
            : (memberRegion ?? {
                regionId: null,
                sido: "",
                sigungu: "",
                dong: "",
              }))
        }
        onApply={handleApplyRegion}
        onClose={() => setIsRegionModalOpen(false)}
      />

      <SportPickerModal
        open={isSportModalOpen}
        sports={sportOptions}
        selectedSportId={selectedSport?.sportId ?? null}
        onApply={handleApplySport}
        onClose={() => setIsSportModalOpen(false)}
      />
    </DashboardShell>
  );
}
