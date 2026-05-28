import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../components/DashboardShell";
import UiIcon from "../components/UiIcon";
import { useAuth } from "../contexts/AuthContext";
import { getMyActivity } from "../api/memberApi";
import { getMeetingThumbnail } from "../utils/meetingVisuals";
import styles from "../styles/ActivityPage.module.css";

const normalizeText = (value = "") => String(value).trim();

const formatMeetingDateTime = (meeting) => {
  const date = meeting.meetingDate
    ? String(meeting.meetingDate).slice(5).replaceAll("-", ".")
    : meeting.displayDate || "-";
  const time = meeting.startTime
    ? String(meeting.startTime).slice(0, 5)
    : meeting.time || "-";
  return `${date} ${time}`;
};

const getHostName = (meeting) =>
  normalizeText(meeting.hostNickname || meeting.meetingHostName || meeting.host);

const buildRelativeText = (dateValue) => {
  if (!dateValue) return "최근";

  const today = new Date();
  const target = new Date(dateValue);
  if (Number.isNaN(target.getTime())) {
    return String(dateValue).slice(0, 10);
  }

  const diffMs = target.setHours(0, 0, 0, 0) - new Date(today.setHours(0, 0, 0, 0));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "내일";
  if (diffDays > 1) return `${diffDays}일 후`;
  if (diffDays === -1) return "어제";
  return `${Math.abs(diffDays)}일 전`;
};

const normalizeMeeting = (meeting) => ({
  ...meeting,
  id: meeting.meetingId ?? meeting.id,
  title: meeting.title ?? "-",
  sport: meeting.sportName ?? meeting.sport ?? "-",
  place: meeting.placeName ?? meeting.place ?? "-",
  region: meeting.regionName ?? meeting.region ?? "-",
  hostName: getHostName(meeting),
  meetingDate: meeting.meetingDate ?? null,
  startTime: meeting.startTime ?? "",
  approvedCount: Number(meeting.approvedCount ?? meeting.current ?? 0),
  maxMembers: Number(meeting.maxMembers ?? meeting.max ?? 0),
  status: meeting.status ?? "RECRUITING",
  statusText: meeting.statusText ?? meeting.status ?? "",
  image: getMeetingThumbnail(meeting),
});

const buildFeedItems = ({ hostedMeetings, approvedMeetings, pendingMeetings }) => {
  const feed = [
    ...hostedMeetings.slice(0, 3).map((meeting) => ({
      key: `host-${meeting.id}`,
      title: `${meeting.title} 모임을 만들었어요.`,
      meta: `${meeting.sport} · ${meeting.region}`,
      time: buildRelativeText(meeting.createdAt || meeting.meetingDate),
    })),
    ...approvedMeetings.slice(0, 3).map((meeting) => ({
      key: `approved-${meeting.id}`,
      title: `${meeting.title} 참여가 확정되었어요.`,
      meta: `${meeting.sport} · ${formatMeetingDateTime(meeting)}`,
      time: buildRelativeText(meeting.meetingDate),
    })),
    ...pendingMeetings.slice(0, 2).map((meeting) => ({
      key: `pending-${meeting.id}`,
      title: `${meeting.title} 참여 요청을 기다리는 중이에요.`,
      meta: `${meeting.sport} · ${meeting.region}`,
      time: buildRelativeText(meeting.meetingDate),
    })),
  ];

  return feed.slice(0, 5);
};

const getMonthLabel = (date) =>
  `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, "0")}월`;

const getDateKey = (dateLike) => {
  if (!dateLike) return "";

  if (dateLike instanceof Date) {
    const year = dateLike.getFullYear();
    const month = String(dateLike.getMonth() + 1).padStart(2, "0");
    const day = String(dateLike.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return String(dateLike).slice(0, 10);
};

const buildCalendarDays = (monthDate, meetingsByDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const items = [];

  for (let i = 0; i < startOffset; i += 1) {
    items.push({ key: `empty-${i}`, isEmpty: true });
  }

  for (let day = 1; day <= lastDate; day += 1) {
    const date = new Date(year, month, day);
    const dateKey = getDateKey(date);
    items.push({
      key: dateKey,
      dateKey,
      day,
      hasMeetings: meetingsByDate.has(dateKey),
    });
  }

  return items;
};

const formatCalendarStamp = (dateLike, timeLike) => {
  const base = dateLike ? new Date(dateLike) : new Date();
  const [hours = "00", minutes = "00"] = String(timeLike || "00:00")
    .slice(0, 5)
    .split(":");
  base.setHours(Number(hours), Number(minutes), 0, 0);
  return base.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

const buildGoogleCalendarUrl = (meeting) => {
  const start = formatCalendarStamp(meeting.meetingDate, meeting.startTime);
  const endDate = new Date(meeting.meetingDate || new Date());
  const [hours = "00", minutes = "00"] = String(meeting.startTime || "00:00")
    .slice(0, 5)
    .split(":");
  endDate.setHours(Number(hours), Number(minutes), 0, 0);
  endDate.setHours(endDate.getHours() + 2);
  const end = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: meeting.title,
    dates: `${start}/${end}`,
    details: `${meeting.sport} · ${meeting.region}`,
    location: `${meeting.region} ${meeting.place}`.trim(),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export default function ActivityPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    getDateKey(new Date()),
  );
  const [activityData, setActivityData] = useState({
    hostedMeetings: [],
    approvedMeetings: [],
    pendingMeetings: [],
    completedMeetings: [],
  });

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user?.nickname) {
      setActivityData({
        hostedMeetings: [],
        approvedMeetings: [],
        pendingMeetings: [],
        completedMeetings: [],
      });
      setLoading(false);
      return;
    }

    let active = true;

    const fetchActivity = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await getMyActivity(user.memberId);
        const payload = response.data ?? {};

        if (!active) {
          return;
        }

        setActivityData({
          hostedMeetings: Array.isArray(payload.hostedMeetings)
            ? payload.hostedMeetings.map(normalizeMeeting)
            : [],
          approvedMeetings: Array.isArray(payload.approvedMeetings)
            ? payload.approvedMeetings.map(normalizeMeeting)
            : [],
          pendingMeetings: Array.isArray(payload.pendingMeetings)
            ? payload.pendingMeetings.map(normalizeMeeting)
            : [],
          completedMeetings: Array.isArray(payload.completedMeetings)
            ? payload.completedMeetings.map(normalizeMeeting)
            : [],
        });
      } catch (error) {
        console.error(error);
        if (active) {
          setLoadError("내 활동 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchActivity();

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, user?.memberId]);

  const activityItems = useMemo(
    () => [
      { label: "참여 예정", value: `${activityData.approvedMeetings.length}개` },
      { label: "참여 대기", value: `${activityData.pendingMeetings.length}개` },
      { label: "내가 만든 모임", value: `${activityData.hostedMeetings.length}개` },
      { label: "참여 완료", value: `${activityData.completedMeetings.length}개` },
    ],
    [activityData],
  );

  const activityFeed = useMemo(
    () => buildFeedItems(activityData),
    [activityData],
  );

  const scheduleItems = activityData.approvedMeetings.slice(0, 4);
  const visibleMeetings = activityData.approvedMeetings.length
    ? activityData.approvedMeetings
    : activityData.pendingMeetings;
  const calendarMeetings = useMemo(
    () => [...activityData.approvedMeetings, ...activityData.completedMeetings],
    [activityData],
  );
  const meetingsByDate = useMemo(() => {
    const grouped = new Map();
    calendarMeetings.forEach((meeting) => {
      const dateKey = getDateKey(meeting.meetingDate);
      if (!dateKey) {
        return;
      }

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }

      grouped.get(dateKey).push(meeting);
    });

    grouped.forEach((items) => {
      items.sort((left, right) =>
        String(left.startTime || "").localeCompare(String(right.startTime || "")),
      );
    });

    return grouped;
  }, [calendarMeetings]);
  const calendarDays = useMemo(
    () => buildCalendarDays(selectedMonth, meetingsByDate),
    [selectedMonth, meetingsByDate],
  );
  const todayKey = getDateKey(new Date());
  const selectedDateMeetings = meetingsByDate.get(selectedDateKey) ?? [];
  const selectedAgendaCalendarUrl = selectedDateMeetings.length
    ? buildGoogleCalendarUrl(selectedDateMeetings[0])
    : "";
  const selectedDateLabel = selectedDateKey
    ? selectedDateKey.replaceAll("-", ".")
    : "날짜를 선택해주세요";
  const weekLabels = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <DashboardShell
      active="내 활동"
      title="내 활동"
      description="참여 중인 모임, 승인 대기, 내가 만든 모임 흐름을 한곳에서 확인할 수 있습니다."
      aside={
        <>
          <section className={styles.dashboardPanel}>
            <div className={styles.dashboardPanelHead}>
              <h3>이번 주 일정</h3>
            </div>
            <div className={styles.dashboardSimpleList}>
              {scheduleItems.length ? (
                scheduleItems.map((meeting) => (
                  <div key={`schedule-${meeting.id}`}>
                    <span>{meeting.title}</span>
                    <strong>{formatMeetingDateTime(meeting)}</strong>
                  </div>
                ))
              ) : (
                <div>
                  <span>예정된 일정</span>
                  <strong>아직 없어요</strong>
                </div>
              )}
            </div>
          </section>

          <section className={styles.dashboardPanel}>
            <div className={styles.dashboardPanelHead}>
              <h3>최근 활동</h3>
            </div>
            <div className={styles.dashboardActivityList}>
              {activityFeed.length ? (
                activityFeed.map((item) => (
                  <div key={item.key} className={styles.dashboardActivityItem}>
                    <i>
                      <UiIcon
                        name="activity"
                        className={styles.dashboardActivityGlyph}
                      />
                    </i>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.meta}</p>
                    </div>
                    <span>{item.time}</span>
                  </div>
                ))
              ) : (
                <div className={styles.emptyMessage}>아직 쌓인 활동이 없습니다.</div>
              )}
            </div>
          </section>
        </>
      }
    >
      {!isAuthenticated && !authLoading ? (
        <section className={styles.emptyStateCard}>
          <h2>로그인 후 내 활동을 볼 수 있어요</h2>
          <p>참여 요청한 모임과 내가 만든 모임을 한 화면에서 확인할 수 있습니다.</p>
          <Link to="/login" className={styles.emptyStateAction}>
            로그인하러 가기
          </Link>
        </section>
      ) : null}

      {isAuthenticated ? (
        <>
          <section className={styles.dashboardStatGrid}>
            {activityItems.map((item) => (
              <article key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </section>

          <section className={styles.calendarPanel}>
            <div className={styles.calendarHead}>
              <div>
                <h2>내 일정 캘린더</h2>
                <p className={styles.dashboardSectionCopy}>
                  승인된 일정과 완료한 모임을 날짜별로 한눈에 확인할 수 있습니다.
                </p>
              </div>
              <div className={styles.calendarMonthControls}>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setSelectedMonth(
                      new Date(today.getFullYear(), today.getMonth(), 1),
                    );
                    setSelectedDateKey(todayKey);
                  }}
                >
                  오늘
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedMonth(
                      (current) =>
                        new Date(current.getFullYear(), current.getMonth() - 1, 1),
                    )
                  }
                >
                  이전
                </button>
                <strong>{getMonthLabel(selectedMonth)}</strong>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedMonth(
                      (current) =>
                        new Date(current.getFullYear(), current.getMonth() + 1, 1),
                    )
                  }
                >
                  다음
                </button>
              </div>
            </div>

            <div className={styles.calendarLayout}>
              <section className={styles.calendarCard}>
                <div className={styles.calendarWeekRow}>
                  {weekLabels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                <div className={styles.calendarGrid}>
                  {calendarDays.map((item) =>
                    item.isEmpty ? (
                      <span key={item.key} className={styles.calendarCellEmpty} />
                    ) : (
                      <button
                        key={item.key}
                        type="button"
                        className={
                          item.dateKey === selectedDateKey
                            ? styles.calendarCellActive
                            : item.dateKey === todayKey
                              ? styles.calendarCellToday
                              : styles.calendarCell
                        }
                        onClick={() => setSelectedDateKey(item.dateKey)}
                      >
                        <strong>{item.day}</strong>
                        {item.hasMeetings ? (
                          <i className={styles.calendarDot} />
                        ) : (
                          <i className={styles.calendarDotMuted} />
                        )}
                      </button>
                    ),
                  )}
                </div>
              </section>

              <section className={styles.calendarAgenda}>
                <div className={styles.calendarAgendaHead}>
                  <div>
                    <strong>{selectedDateLabel}</strong>
                    <span>{selectedDateMeetings.length}개 일정</span>
                  </div>
                  {selectedAgendaCalendarUrl ? (
                    <a
                      href={selectedAgendaCalendarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.calendarAgendaAction}
                    >
                      구글 캘린더 추가
                    </a>
                  ) : null}
                </div>
                <div className={styles.calendarAgendaList}>
                  {selectedDateMeetings.length ? (
                    selectedDateMeetings.map((meeting) => (
                      <Link
                        key={`agenda-${meeting.id}`}
                        to={`/meetings/${meeting.id}`}
                        className={styles.calendarAgendaItem}
                      >
                        <div>
                          <span>{meeting.sport}</span>
                          <strong>{meeting.title}</strong>
                          <p>
                            {meeting.place} · {String(meeting.startTime || "").slice(0, 5)}
                          </p>
                        </div>
                        <b>{meeting.status === "COMPLETED" ? "완료" : "예정"}</b>
                      </Link>
                    ))
                  ) : (
                    <div className={styles.emptyMessage}>
                      선택한 날짜에는 등록된 일정이 없습니다.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </section>

          {loadError ? (
            <section className={styles.emptyStateCard}>
              <h2>내 활동을 불러오지 못했습니다</h2>
              <p>{loadError}</p>
            </section>
          ) : loading ? (
            <section className={styles.emptyStateCard}>
              <h2>내 활동을 불러오는 중입니다</h2>
              <p>참여 정보와 생성한 모임을 정리하고 있어요.</p>
            </section>
          ) : (
            <section className={styles.dashboardPanel}>
              <div className={styles.dashboardSectionHead}>
                <div>
                  <h2>
                    {activityData.approvedMeetings.length
                      ? "참여 예정 모임"
                      : activityData.pendingMeetings.length
                        ? "참여 대기 모임"
                        : "최근 참여 모임"}
                  </h2>
                  <p className={styles.dashboardSectionCopy}>
                    실제 참여 상태를 기준으로 가장 먼저 확인해야 할 모임을 보여줍니다.
                  </p>
                </div>
                <Link to="/meetings">모임 더 보기</Link>
              </div>

              <div className={styles.dashboardCompactList}>
                {visibleMeetings.length ? (
                  visibleMeetings.slice(0, 4).map((meeting) => (
                    <Link
                      key={meeting.id}
                      to={`/meetings/${meeting.id}`}
                      className={styles.dashboardCompactCard}
                    >
                      <div className={styles.dashboardCompactBody}>
                        <img
                          src={meeting.image}
                          alt={meeting.title}
                          className={styles.dashboardMiniImage}
                        />
                        <div>
                          <div className={styles.dashboardMeetingBadges}>
                            <span>{meeting.sport}</span>
                            <span className={styles.dashboardStatusBadge}>
                              {meeting.participationStatus === "PENDING"
                                ? "승인 대기"
                                : meeting.statusText}
                            </span>
                          </div>
                          <h3>{meeting.title}</h3>
                          <p>
                            {meeting.place} · {formatMeetingDateTime(meeting)}
                          </p>
                        </div>
                      </div>
                      <strong>
                        {meeting.approvedCount}/{meeting.maxMembers}명
                      </strong>
                    </Link>
                  ))
                ) : (
                  <div className={styles.emptyMessage}>
                    아직 참여 중이거나 대기 중인 모임이 없습니다.
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      ) : null}
    </DashboardShell>
  );
}
