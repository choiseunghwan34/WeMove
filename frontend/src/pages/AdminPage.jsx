import { useEffect, useMemo, useState } from "react";
import AppModal from "../components/AppModal";
import {
  createAdminSport,
  getAdminMeetings,
  getAdminMembers,
  getAdminRegions,
  getAdminReports,
  getAdminSports,
  getSummary,
} from "../api/adminApi";
import styles from "../styles/AdminPage.module.css";

const cx = (...names) =>
  names
    .filter(Boolean)
    .map((name) => styles[name] ?? name)
    .join(" ");

const PAGE_SIZE = 10;
const ALL_SIDO = "전체 시도";
const ALL_SIGUNGU = "전체 시군구";
const ALL_DONG = "전체 읍면동";
const ALL_CATEGORY = "전체 카테고리";

const tabs = [
  { id: "members", label: "회원 관리" },
  { id: "meetings", label: "모임 관리" },
  { id: "reports", label: "신고 내역" },
  { id: "sports", label: "운동 종목" },
];

const initialSummary = {
  totalMembers: 0,
  totalMeetings: 0,
  pendingReports: 0,
  totalSports: 0,
};

const initialSportForm = {
  name: "",
  category: "",
  isActive: true,
};

const meetingStatusText = {
  RECRUITING: "모집중",
  CLOSED: "모집마감",
  COMPLETED: "모임완료",
  CANCELLED: "취소됨",
};

const normalizeText = (value = "") => value.trim();

const parseRegionLabel = (label = "") => {
  const [sido = "", sigungu = "", dong = ""] = normalizeText(label).split(/\s+/);
  return { sido, sigungu, dong };
};

const matchesRegionSelection = (regionLabel, sido, sigungu, dong) => {
  const parsed = parseRegionLabel(regionLabel);

  return (
    (sido === ALL_SIDO || parsed.sido === sido) &&
    (sigungu === ALL_SIGUNGU || parsed.sigungu === sigungu) &&
    (dong === ALL_DONG || parsed.dong === dong)
  );
};

const formatMeetingSchedule = (meetingDate, startTime) => {
  const date = meetingDate ? String(meetingDate) : "-";
  const time = startTime ? String(startTime).slice(0, 5) : "--:--";
  return `${date} ${time}`;
};

const paginate = (items, page) => {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
};

const buildPageButtons = (currentPage, totalPages) => {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const first = Math.max(1, end - 4);
  const buttons = [];

  for (let page = first; page <= end; page += 1) {
    buttons.push(page);
  }

  return buttons;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("members");
  const [summary, setSummary] = useState(initialSummary);
  const [regions, setRegions] = useState([]);
  const [members, setMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [sports, setSports] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedSido, setSelectedSido] = useState(ALL_SIDO);
  const [selectedSigungu, setSelectedSigungu] = useState(ALL_SIGUNGU);
  const [selectedDong, setSelectedDong] = useState(ALL_DONG);
  const [selectedMeetingCategory, setSelectedMeetingCategory] = useState(ALL_CATEGORY);
  const [selectedSportCategory, setSelectedSportCategory] = useState(ALL_CATEGORY);
  const [isSportModalOpen, setIsSportModalOpen] = useState(false);
  const [sportForm, setSportForm] = useState(initialSportForm);
  const [pages, setPages] = useState({
    members: 1,
    meetings: 1,
    reports: 1,
    sports: 1,
  });

  const updatePage = (tab, nextPage) => {
    setPages((current) => ({ ...current, [tab]: nextPage }));
  };

  const loadAdminData = async () => {
    const [
      summaryResult,
      membersResult,
      regionsResult,
      meetingsResult,
      sportsResult,
      reportsResult,
    ] = await Promise.allSettled([
      getSummary(),
      getAdminMembers(),
      getAdminRegions(),
      getAdminMeetings(),
      getAdminSports(),
      getAdminReports(),
    ]);

    if (summaryResult.status === "fulfilled" && summaryResult.value.data) {
      setSummary({
        totalMembers: summaryResult.value.data.totalMembers ?? 0,
        totalMeetings: summaryResult.value.data.totalMeetings ?? 0,
        pendingReports: summaryResult.value.data.pendingReports ?? 0,
        totalSports: summaryResult.value.data.totalSports ?? 0,
      });
    }

    if (
      membersResult.status === "fulfilled" &&
      Array.isArray(membersResult.value.data)
    ) {
      setMembers(
        membersResult.value.data.map((member) => ({
          id: member.userId,
          loginId: member.loginId,
          nickname: member.nickname,
          region: member.regionName ?? "-",
          role: member.role,
          status: member.status,
        })),
      );
    }

    if (
      regionsResult.status === "fulfilled" &&
      Array.isArray(regionsResult.value.data)
    ) {
      setRegions(
        regionsResult.value.data
          .map((region) => ({
            regionId: region.regionId,
            sido: normalizeText(region.sido),
            sigungu: normalizeText(region.sigungu),
            dong: normalizeText(region.dong),
          }))
          .filter((region) => region.sido && region.sigungu && region.dong),
      );
    }

    if (
      meetingsResult.status === "fulfilled" &&
      Array.isArray(meetingsResult.value.data)
    ) {
      setMeetings(
        meetingsResult.value.data.map((meeting) => ({
          id: meeting.meetingId,
          title: meeting.title,
          sport: meeting.sportName ?? "-",
          sportCategory: meeting.sportCategory ?? "기타",
          region: meeting.regionName ?? "-",
          schedule: formatMeetingSchedule(meeting.meetingDate, meeting.startTime),
          current: meeting.approvedCount ?? 0,
          max: meeting.maxMembers ?? 0,
          status: meeting.status,
          statusText: meetingStatusText[meeting.status] ?? meeting.status,
          hostNickname: meeting.hostNickname ?? "-",
        })),
      );
    }

    if (
      sportsResult.status === "fulfilled" &&
      Array.isArray(sportsResult.value.data)
    ) {
      setSports(
        sportsResult.value.data.map((sport) => ({
          id: sport.sportId,
          name: sport.name,
          category: sport.category ?? "-",
          isActive: sport.isActive ?? true,
        })),
      );
    }

    if (
      reportsResult.status === "fulfilled" &&
      Array.isArray(reportsResult.value.data)
    ) {
      setReports(
        reportsResult.value.data.map((report) => ({
          id: report.reportId,
          target: `신고 #${report.reportId}`,
          reason: report.reason,
          status: report.status,
          createdAt: report.createdAt ? report.createdAt.slice(0, 10) : "-",
        })),
      );
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const sidoOptions = useMemo(() => {
    return [...new Set(regions.map((region) => region.sido))].sort((left, right) =>
      left.localeCompare(right, "ko"),
    );
  }, [regions]);

  const sigunguOptions = useMemo(() => {
    return [
      ...new Set(
        regions
          .filter(
            (region) => selectedSido === ALL_SIDO || region.sido === selectedSido,
          )
          .map((region) => region.sigungu),
      ),
    ].sort((left, right) => left.localeCompare(right, "ko"));
  }, [regions, selectedSido]);

  const dongOptions = useMemo(() => {
    return [
      ...new Set(
        regions
          .filter(
            (region) =>
              (selectedSido === ALL_SIDO || region.sido === selectedSido) &&
              (selectedSigungu === ALL_SIGUNGU ||
                region.sigungu === selectedSigungu),
          )
          .map((region) => region.dong),
      ),
    ].sort((left, right) => left.localeCompare(right, "ko"));
  }, [regions, selectedSido, selectedSigungu]);

  const meetingCategoryOptions = useMemo(() => {
    return [...new Set(meetings.map((meeting) => meeting.sportCategory))].sort(
      (left, right) => left.localeCompare(right, "ko"),
    );
  }, [meetings]);

  const sportCategoryOptions = useMemo(() => {
    return [...new Set(sports.map((sport) => sport.category))].sort((left, right) =>
      left.localeCompare(right, "ko"),
    );
  }, [sports]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) =>
      matchesRegionSelection(member.region, selectedSido, selectedSigungu, selectedDong),
    );
  }, [members, selectedSido, selectedSigungu, selectedDong]);

  const filteredMeetings = useMemo(() => {
    return meetings.filter(
      (meeting) =>
        matchesRegionSelection(
          meeting.region,
          selectedSido,
          selectedSigungu,
          selectedDong,
        ) &&
        (selectedMeetingCategory === ALL_CATEGORY ||
          meeting.sportCategory === selectedMeetingCategory),
    );
  }, [
    meetings,
    selectedSido,
    selectedSigungu,
    selectedDong,
    selectedMeetingCategory,
  ]);

  const filteredSports = useMemo(() => {
    return sports.filter(
      (sport) =>
        selectedSportCategory === ALL_CATEGORY ||
        sport.category === selectedSportCategory,
    );
  }, [sports, selectedSportCategory]);

  const memberPageCount = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const meetingPageCount = Math.max(1, Math.ceil(filteredMeetings.length / PAGE_SIZE));
  const reportPageCount = Math.max(1, Math.ceil(reports.length / PAGE_SIZE));
  const sportPageCount = Math.max(1, Math.ceil(filteredSports.length / PAGE_SIZE));

  const memberPage = Math.min(pages.members, memberPageCount);
  const meetingPage = Math.min(pages.meetings, meetingPageCount);
  const reportPage = Math.min(pages.reports, reportPageCount);
  const sportPage = Math.min(pages.sports, sportPageCount);

  const pagedMembers = paginate(filteredMembers, memberPage);
  const pagedMeetings = paginate(filteredMeetings, meetingPage);
  const pagedReports = paginate(reports, reportPage);
  const pagedSports = paginate(filteredSports, sportPage);

  const regionSummary = [selectedSido, selectedSigungu, selectedDong]
    .filter(
      (value) =>
        value !== ALL_SIDO && value !== ALL_SIGUNGU && value !== ALL_DONG,
    )
    .join(" · ");

  const filterSummaryText =
    activeTab === "sports"
      ? `${selectedSportCategory === ALL_CATEGORY ? "전체 카테고리" : selectedSportCategory} 기준으로 조회 중입니다.`
      : `${regionSummary || "전체 지역"} 기준으로 조회 중입니다.`;

  const resetRegionSelection = () => {
    setSelectedSido(ALL_SIDO);
    setSelectedSigungu(ALL_SIGUNGU);
    setSelectedDong(ALL_DONG);
    setSelectedMeetingCategory(ALL_CATEGORY);
    updatePage("members", 1);
    updatePage("meetings", 1);
  };

  const closeSportModal = () => {
    setIsSportModalOpen(false);
    setSportForm(initialSportForm);
  };

  const submitSport = async () => {
    if (!sportForm.name.trim()) {
      return;
    }

    await createAdminSport({
      name: sportForm.name.trim(),
      category: sportForm.category.trim(),
      isActive: sportForm.isActive,
    });

    await loadAdminData();
    closeSportModal();
    updatePage("sports", 1);
  };

  const renderPagination = (tab, currentPage, totalPages) => {
    if (totalPages <= 1) {
      return null;
    }

    const pageButtons = buildPageButtons(currentPage, totalPages);

    return (
      <div className={styles.pagination}>
        <button
          type="button"
          className={styles.paginationArrow}
          onClick={() => updatePage(tab, Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          이전
        </button>
        <div className={styles.paginationNumbers}>
          {pageButtons.map((page) => (
            <button
              key={page}
              type="button"
              className={cx(
                styles.paginationNumber,
                currentPage === page && styles.paginationNumberCurrent,
              )}
              onClick={() => updatePage(tab, page)}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.paginationArrow}
          onClick={() => updatePage(tab, Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          다음
        </button>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>
        <div>
          <h1>관리자 페이지</h1>
          <p>회원, 모임, 신고, 운동 종목 현황을 한 화면에서 관리합니다.</p>
        </div>
      </div>

      <section className={styles.statGrid}>
        <article>
          <span>전체 회원</span>
          <strong>{summary.totalMembers}</strong>
        </article>
        <article>
          <span>등록 모임</span>
          <strong>{summary.totalMeetings}</strong>
        </article>
        <article>
          <span>대기 신고</span>
          <strong>{summary.pendingReports}</strong>
        </article>
        <article>
          <span>운동 종목</span>
          <strong>{summary.totalSports}</strong>
        </article>
      </section>

      <div className={styles.pageTabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cx(styles.tabButton, activeTab === tab.id && styles.tabButtonCurrent)}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className={styles.filterPanel}>
        <div className={styles.filterHead}>
          <div>
            <h2>지역별 조회</h2>
            <p>
              {activeTab === "sports"
                ? "운동 종목은 카테고리 기준으로 깔끔하게 확인할 수 있습니다."
                : "시도, 시군구, 읍면동을 차례대로 선택해 목록을 좁혀볼 수 있습니다."}
            </p>
          </div>
          <button type="button" onClick={resetRegionSelection}>
            전체 보기
          </button>
        </div>

        {activeTab !== "sports" ? (
          <div className={styles.filterRow}>
            <select
              value={selectedSido}
              onChange={(event) => {
                setSelectedSido(event.target.value);
                setSelectedSigungu(ALL_SIGUNGU);
                setSelectedDong(ALL_DONG);
                updatePage("members", 1);
                updatePage("meetings", 1);
              }}
            >
              <option value={ALL_SIDO}>{ALL_SIDO}</option>
              {sidoOptions.map((sido) => (
                <option key={sido} value={sido}>
                  {sido}
                </option>
              ))}
            </select>

            <select
              value={selectedSigungu}
              onChange={(event) => {
                setSelectedSigungu(event.target.value);
                setSelectedDong(ALL_DONG);
                updatePage("members", 1);
                updatePage("meetings", 1);
              }}
              disabled={selectedSido === ALL_SIDO}
            >
              <option value={ALL_SIGUNGU}>{ALL_SIGUNGU}</option>
              {sigunguOptions.map((sigungu) => (
                <option key={sigungu} value={sigungu}>
                  {sigungu}
                </option>
              ))}
            </select>

            <select
              value={selectedDong}
              onChange={(event) => {
                setSelectedDong(event.target.value);
                updatePage("members", 1);
                updatePage("meetings", 1);
              }}
              disabled={selectedSigungu === ALL_SIGUNGU}
            >
              <option value={ALL_DONG}>{ALL_DONG}</option>
              {dongOptions.map((dong) => (
                <option key={dong} value={dong}>
                  {dong}
                </option>
              ))}
            </select>
          </div>
        ) : null}

      {activeTab === "meetings" ? (
        <div className={styles.categorySection}>
          <span className={styles.categoryLabel}>운동 카테고리</span>
            <div className={styles.categoryChips}>
              {[ALL_CATEGORY, ...meetingCategoryOptions].map((category) => (
                <button
                  key={category}
                  type="button"
                  className={cx(
                    styles.categoryChip,
                    selectedMeetingCategory === category &&
                      styles.categoryChipCurrent,
                  )}
                  onClick={() => {
                    setSelectedMeetingCategory(category);
                    updatePage("meetings", 1);
                  }}
                >
                  {category}
                </button>
              ))}
          </div>
        </div>
      ) : null}

      {activeTab === "sports" ? (
        <div className={styles.categorySection}>
          <span className={styles.categoryLabel}>운동 종목 카테고리</span>
          <div className={styles.categoryChips}>
            {[ALL_CATEGORY, ...sportCategoryOptions].map((category) => (
              <button
                key={category}
                type="button"
                className={cx(
                  styles.categoryChip,
                  selectedSportCategory === category &&
                    styles.categoryChipCurrent,
                )}
                onClick={() => {
                  setSelectedSportCategory(category);
                  updatePage("sports", 1);
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      ) : null}

        <div className={styles.filterMeta}>
          <span>{filterSummaryText}</span>
          <strong>
            {activeTab === "sports"
              ? `종목 ${filteredSports.length}개`
              : `회원 ${filteredMembers.length}명 · 모임 ${filteredMeetings.length}개`}
          </strong>
        </div>
      </section>

      {activeTab === "members" ? (
        <section className={styles.tableCard}>
          <div className={styles.tableHead}>
            <div>
              <h2>회원 관리</h2>
              <p>한 페이지에 10명씩 보여줍니다.</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>회원 ID</th>
                <th>닉네임</th>
                <th>로그인 ID</th>
                <th>지역</th>
                <th>권한</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {pagedMembers.map((member) => (
                <tr key={member.id}>
                  <td>{member.id}</td>
                  <td>{member.nickname}</td>
                  <td>{member.loginId}</td>
                  <td>{member.region}</td>
                  <td>{member.role}</td>
                  <td>
                    <span
                      className={cx(
                        "badge",
                        member.status === "SUSPENDED" ? "warning" : "success",
                      )}
                    >
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
              {pagedMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className={styles.emptyCell}>
                    선택한 지역에 해당하는 회원이 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          {renderPagination("members", memberPage, memberPageCount)}
        </section>
      ) : null}

      {activeTab === "meetings" ? (
        <section className={styles.tableCard}>
          <div className={styles.tableHead}>
            <div>
              <h2>모임 관리</h2>
              <p>카테고리, 지역, 일정과 시간대를 함께 확인할 수 있습니다.</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>모임 ID</th>
                <th>제목</th>
                <th>종목</th>
                <th>카테고리</th>
                <th>지역</th>
                <th>일자 / 시간</th>
                <th>참가 인원</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {pagedMeetings.map((meeting) => (
                <tr key={meeting.id}>
                  <td>M{String(meeting.id).padStart(3, "0")}</td>
                  <td>
                    <div className={styles.stackCell}>
                      <strong>{meeting.title}</strong>
                      <span>주최자: {meeting.hostNickname}</span>
                    </div>
                  </td>
                  <td>{meeting.sport}</td>
                  <td>
                    <span className={styles.categoryPill}>{meeting.sportCategory}</span>
                  </td>
                  <td>{meeting.region}</td>
                  <td>{meeting.schedule}</td>
                  <td>
                    {meeting.current}/{meeting.max}
                  </td>
                  <td>
                    <span
                      className={cx(
                        "badge",
                        meeting.status === "CLOSED" ? "warning" : "success",
                      )}
                    >
                      {meeting.statusText}
                    </span>
                  </td>
                </tr>
              ))}
              {pagedMeetings.length === 0 ? (
                <tr>
                  <td colSpan="8" className={styles.emptyCell}>
                    조건에 맞는 모임이 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          {renderPagination("meetings", meetingPage, meetingPageCount)}
        </section>
      ) : null}

      {activeTab === "reports" ? (
        <section className={styles.tableCard}>
          <div className={styles.tableHead}>
            <div>
              <h2>신고 내역</h2>
              <p>최근 신고를 10개씩 확인할 수 있습니다.</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>신고 ID</th>
                <th>대상</th>
                <th>사유</th>
                <th>상태</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {pagedReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.target}</td>
                  <td>{report.reason}</td>
                  <td>
                    <span
                      className={cx(
                        "badge",
                        report.status === "PENDING" ? "warning" : "success",
                      )}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td>{report.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination("reports", reportPage, reportPageCount)}
        </section>
      ) : null}

      {activeTab === "sports" ? (
        <section className={styles.tableCard}>
          <div className={styles.tableHead}>
            <div>
              <h2>운동 종목</h2>
              <p>카테고리별로 10개씩 확인하고 모달에서 새 종목을 추가할 수 있습니다.</p>
            </div>
            <button type="button" onClick={() => setIsSportModalOpen(true)}>
              종목 관리
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>종목 ID</th>
                <th>이름</th>
                <th>카테고리</th>
                <th>사용 여부</th>
              </tr>
            </thead>
            <tbody>
              {pagedSports.map((sport) => (
                <tr key={sport.id}>
                  <td>{sport.id}</td>
                  <td>{sport.name}</td>
                  <td>{sport.category}</td>
                  <td>
                    <span className={cx("badge", sport.isActive ? "success" : "warning")}>
                      {sport.isActive ? "사용중" : "비활성"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination("sports", sportPage, sportPageCount)}
        </section>
      ) : null}

      <AppModal
        open={isSportModalOpen}
        eyebrow="운동 종목"
        title="운동 종목 관리"
        description="현재 종목 목록을 확인하고 새 종목을 바로 추가할 수 있습니다."
        confirmText="종목 추가"
        onConfirm={submitSport}
        onClose={closeSportModal}
      >
        <div className={styles.modalSection}>
          <div className={styles.sportFormGrid}>
            <label className={styles.modalField}>
              <span>종목명</span>
              <input
                value={sportForm.name}
                onChange={(event) =>
                  setSportForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="예: 러닝"
              />
            </label>
            <label className={styles.modalField}>
              <span>카테고리</span>
              <input
                value={sportForm.category}
                onChange={(event) =>
                  setSportForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                placeholder="예: 유산소"
              />
            </label>
            <label className={styles.modalCheck}>
              <input
                type="checkbox"
                checked={sportForm.isActive}
                onChange={(event) =>
                  setSportForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
              />
              <span>즉시 사용 가능 상태로 추가</span>
            </label>
          </div>
        </div>

        <div className={styles.modalSection}>
          <h3 className={styles.modalTitle}>현재 종목 목록</h3>
          <div className={styles.sportList}>
            {sports.map((sport) => (
              <article key={sport.id} className={styles.sportCard}>
                <div>
                  <strong>{sport.name}</strong>
                  <p>{sport.category}</p>
                </div>
                <span className={cx("badge", sport.isActive ? "success" : "warning")}>
                  {sport.isActive ? "사용중" : "비활성"}
                </span>
              </article>
            ))}
          </div>
        </div>
      </AppModal>
    </div>
  );
}
