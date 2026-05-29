import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../components/DashboardShell";
import UiIcon from "../components/UiIcon";
import { useAuth } from "../contexts/AuthContext";
import { meetings, regions, sports } from "../data/demoData";
import { categoryItems, meetingImages } from "../data/dashboardData";
import styles from "../styles/HomePage.module.css";
import {getMainMeetings} from "../api/meetingApi.js";

const heroSlides = [
  {
    title: "오늘 운동, 혼자 말고 같이",
    description: "내 주변 운동 모임을 찾고, 함께 땀 흘려보세요.",
    image: meetingImages[1],
  },
  {
    title: "가볍게 시작하는 5km 러닝",
    description: "러닝부터 헬스, 풋살까지 원하는 운동을 자연스럽게 이어가요.",
    image: meetingImages[2],
  },
  {
    title: "이번 주말엔 새로운 운동 모임으로",
    description:
      "관심 운동과 지역을 고르면 지금 바로 참여 가능한 모임을 빠르게 볼 수 있어요.",
    image: meetingImages[5],
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [activeSlide, setActiveSlide] = useState(0);
  const [meetings, setMeetings] = useState([]);
  const recruitingMeetings = Array.isArray(meetings)
      ? meetings.filter((meeting) => meeting.status === "RECRUITING")
      : [];
  const featuredMeetings = recruitingMeetings.slice(0, 10);
  const currentHero = heroSlides[activeSlide];

//메인페이지 모임목록조회
  useEffect(() => {
    getMainMeetings().then((res)=>{
      console.log(res.data);
      setMeetings(res.data?.list || []);
    }).catch((err)=>{
      console.log(err);
      alert("모임 데이터 로드 실패")
      setMeetings([]);
    })
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % heroSlides.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  const localStats = [
    { label: "모집중 모임", value: "24개", tone: "blue", icon: "spark" },
    { label: "참여 예정 인원", value: "128명", tone: "indigo", icon: "user" },
    { label: "오늘 진행 모임", value: "5개", tone: "green", icon: "calendar" },
    { label: "신규 댓글", value: "43개", tone: "mint", icon: "comment" },
  ];

  const weeklySchedule = [
    { day: "오늘", time: "20:00", title: "야당역 러닝 모임" },
    { day: "내일", time: "07:00", title: "운정 헬스 모임" },
    { day: "토", time: "18:00", title: "배드민턴 정기 모임" },
    { day: "일", time: "18:00", title: "풋살 매치" },
  ];

  const recentActivities = [
    { user: "러너지니님", detail: "댓글을 남겼어요.", time: "5분 전" },
    { user: "헬린이탈출님", detail: "모임을 생성했어요.", time: "15분 전" },
  ];

  const homeAside = isAdmin ? null : (
    <>
      <section className={styles.dashboardPanel}>
        <div className={styles.dashboardPanelHead}>
          <h3>실시간 인기 모임</h3>
        </div>
        <div className={styles.dashboardRankList}>
          {featuredMeetings.map((meeting, index) => (
            <Link
              key={meeting.id}
              to={`/meetings/${meeting.id}`}
              className={styles.dashboardRankItem}
            >
              <b>{index + 1}</b>
              <div>
                <strong>{meeting.title}</strong>
                <span>{18 - index * 4}</span>
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
          {weeklySchedule.map((item) => (
            <div
              key={`${item.day}-${item.time}`}
              className={styles.dashboardScheduleItem}
            >
              <span>{item.day}</span>
              <strong>{item.time}</strong>
              <p>{item.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.dashboardPanel}>
        <div className={styles.dashboardPanelHead}>
          <h3>최근 활동</h3>
        </div>
        <div className={styles.dashboardActivityList}>
          {recentActivities.map((activity) => (
            <div
              key={activity.user}
              className={styles.dashboardActivityItem}
            >
              <i>{activity.user.slice(0, 1)}</i>
              <div>
                <strong>{activity.user}</strong>
                <p>{activity.detail}</p>
              </div>
              <span>{activity.time}</span>
            </div>
          ))}
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
              <span className={styles.heroKicker}>Local Fitness Community</span>
              <h1>{currentHero.title}</h1>
              <p>{currentHero.description}</p>
            </div>

            <div className={styles.dashboardHeroFilters}>
              <label>
                <span>
                  <UiIcon
                    name="location"
                    className={styles.dashboardInlineIcon}
                  />
                </span>
                <select defaultValue={regions[0]}>
                  {regions.map((region) => (
                    <option key={region}>{region}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>
                  <UiIcon name="spark" className={styles.dashboardInlineIcon} />
                </span>
                <select defaultValue="전체 운동">
                  <option>전체 운동</option>
                  {sports.map((sport) => (
                    <option key={sport.id}>{sport.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>
                  <UiIcon
                    name="calendar"
                    className={styles.dashboardInlineIcon}
                  />
                </span>
                <select defaultValue="날짜 선택">
                  <option>날짜 선택</option>
                  <option>오늘</option>
                  <option>이번 주</option>
                  <option>주말</option>
                </select>
              </label>
              <Link to="/meetings" className={styles.dashboardHeroButton}>
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
            <span>{regions[0]}</span>
          </div>
          <div className={styles.dashboardSummaryGrid}>
            {localStats.map((stat) => (
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
            className={styles.dashboardCategoryItem}
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
            <h2>오늘의 추천 모임</h2>
            <div className={styles.dashboardPills}>
              <button type="button">전체</button>
              <button type="button">모집중</button>
              <button type="button">마감임박</button>
              <button type="button">초보 환영</button>
              <button type="button">정기 모임</button>
            </div>
          </div>
          <Link to="/meetings">전체 보기</Link>
        </div>

        <div className={styles.dashboardFeed}>
          {featuredMeetings.map((meeting) => (
            <article key={meeting.meetingId} className={styles.dashboardMeetingCard}>
              <img
                src={thumbnailImage[meeting.meetingId]}
                alt={meeting.title}
                className={styles.dashboardMeetingImage}
              />
              <div className={styles.dashboardMeetingBody}>
                <div className={styles.dashboardMeetingBadges}>
                  <span>{meeting.sportId}</span>
                  <span className={styles.dashboardStatusBadge}>
                    {meeting.status}
                  </span>
                  <span>
                    {meeting.current < meeting.maxMembers ? "초보 환영" : "정기 모임"}
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
                    {meeting.place}
                  </span>
                  <span>
                    <UiIcon
                      name="calendar"
                      className={styles.dashboardMetaIcon}
                    />{" "}
                    오늘(금) {meeting.time}
                  </span>
                  <span>
                    <UiIcon name="user" className={styles.dashboardMetaIcon} />{" "}
                    {meeting.current} / {meeting.max}명
                  </span>
                </div>
                <div className={styles.dashboardMeetingFooter}>
                  <div className={styles.dashboardHostMeta}>
                    <strong>{meeting.host}</strong>
                    <span>매너점수 4.8 (후기 18)</span>
                  </div>
                  <div className={styles.dashboardMeetingActions}>
                    <button type="button">
                      <UiIcon
                        name="heart"
                        className={styles.dashboardActionIcon}
                      />
                      18
                    </button>
                    <button type="button">
                      <UiIcon
                        name="comment"
                        className={styles.dashboardActionIcon}
                      />
                      6
                    </button>
                    <button type="button">
                      <UiIcon
                        name="share"
                        className={styles.dashboardActionIcon}
                      />
                    </button>
                    <Link to={`/meetings/${meeting.id}`}>참가 신청</Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
