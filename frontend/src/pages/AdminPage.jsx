import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppModal from "../components/AppModal";
import Pagination from "../components/Pagination";
import RegionPickerModal from "../components/RegionPickerModal";
import {
  createAdminSport,
  deleteAdminSport,
  getAdminMeetings,
  getAdminMembers,
  getAdminRegions,
  getAdminReports,
  getAdminSports,
  getSummary,
  updateAdminMeetingStatus,
  updateAdminMemberStatus,
  updateAdminSport,
} from "../api/adminApi";
import styles from "../styles/AdminPage.module.css";

const cx = (...names) =>
  names
    .flat()
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

const summaryCards = [
  {
    key: "totalMembers",
    label: "전체 회원",
    toneClass: "summaryCardMembers",
    caption: "가입을 완료한 전체 회원 수",
  },
  {
    key: "totalMeetings",
    label: "등록 모임",
    toneClass: "summaryCardMeetings",
    caption: "현재 서비스에 등록된 전체 모임 수",
  },
  {
    key: "pendingReports",
    label: "대기 신고",
    toneClass: "summaryCardReports",
    caption: "빠른 확인이 필요한 미처리 신고 수",
  },
  {
    key: "totalSports",
    label: "운동 종목",
    toneClass: "summaryCardSports",
    caption: "서비스에서 관리 중인 전체 종목 수",
  },
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

const reportStatusText = {
  PENDING: "대기중",
  RESOLVED: "처리완료",
  REJECTED: "반려됨",
};

const memberStatusOptions = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "SUSPENDED", label: "SUSPENDED" },
  { value: "DELETED", label: "DELETED" },
];

const meetingStatusOptions = [
  { value: "RECRUITING", label: "모집중" },
  { value: "CLOSED", label: "모집마감" },
  { value: "COMPLETED", label: "모임완료" },
  { value: "CANCELLED", label: "취소됨" },
];

const sportStatusOptions = [
  { value: true, label: "사용중" },
  { value: false, label: "비활성" },
];

const normalizeText = (value = "") => String(value).trim();

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

const formatMeetingDate = (meetingDate) => {
  if (!meetingDate) return "-";
  return String(meetingDate);
};

const formatMeetingTime = (startTime) => {
  if (!startTime) return "--:--";
  return String(startTime).slice(0, 5);
};

const paginate = (items, page) => {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
};

const badgeToneByMemberStatus = (status) => {
  if (status === "SUSPENDED" || status === "DELETED") return "warning";
  return "success";
};

const badgeToneByMeetingStatus = (status) => {
  if (status === "CLOSED" || status === "CANCELLED") return "warning";
  return "success";
};

const badgeToneByReportStatus = (status) => {
  if (status === "PENDING") return "warning";
  if (status === "REJECTED") return "danger";
  return "success";
};

export default function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();
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
  const [selectedMeetingCategory, setSelectedMeetingCategory] =
    useState(ALL_CATEGORY);
  const [selectedSportCategory, setSelectedSportCategory] =
    useState(ALL_CATEGORY);
  const [memberKeyword, setMemberKeyword] = useState("");
  const [meetingKeyword, setMeetingKeyword] = useState("");
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [draftRegionSelection, setDraftRegionSelection] = useState({
    sido: ALL_SIDO,
    sigungu: ALL_SIGUNGU,
    dong: ALL_DONG,
  });
  const [isSportModalOpen, setIsSportModalOpen] = useState(false);
  const [sportForm, setSportForm] = useState(initialSportForm);
  const [sportFormError, setSportFormError] = useState("");
  const [updatingMemberId, setUpdatingMemberId] = useState(null);
  const [updatingMeetingId, setUpdatingMeetingId] = useState(null);
  const [updatingSportId, setUpdatingSportId] = useState(null);
  const [deletingSportId, setDeletingSportId] = useState(null);
  const [pages, setPages] = useState({
    members: 1,
    meetings: 1,
    reports: 1,
    sports: 1,
  });

  const updatePage = (tab, nextPage) => {
    setPages((current) => ({ ...current, [tab]: nextPage }));
  };

  const changeTab = (nextTab) => {
    setActiveTab(nextTab);
    navigate(`/admin#${nextTab}`);
    window.setTimeout(() => {
      document.getElementById(nextTab)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
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
          role: member.role ?? "USER",
          status: member.status ?? "ACTIVE",
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
          title: meeting.title ?? "-",
          sport: meeting.sportName ?? "-",
          sportCategory: meeting.sportCategory ?? "기타",
          region: meeting.regionName ?? "-",
          meetingDate: formatMeetingDate(meeting.meetingDate),
          startTime: formatMeetingTime(meeting.startTime),
          current: meeting.approvedCount ?? 0,
          max: meeting.maxMembers ?? 0,
          status: meeting.status ?? "RECRUITING",
          statusText:
            meetingStatusText[meeting.status] ?? meeting.status ?? "모집중",
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
          name: sport.name ?? "-",
          category: sport.category ?? "기타",
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
          reason: report.reason ?? "-",
          status: report.status ?? "PENDING",
          statusText:
            reportStatusText[report.status] ?? report.status ?? "대기중",
          createdAt: report.createdAt ? String(report.createdAt).slice(0, 10) : "-",
        })),
      );
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (tabs.some((tab) => tab.id === hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  const regionHierarchy = useMemo(() => {
    const grouped = new Map();

    regions.forEach((region) => {
      if (!grouped.has(region.sido)) {
        grouped.set(region.sido, new Map());
      }

      const sigunguMap = grouped.get(region.sido);
      if (!sigunguMap.has(region.sigungu)) {
        sigunguMap.set(region.sigungu, []);
      }

      sigunguMap.get(region.sigungu).push(region.dong);
    });

    return [...grouped.entries()]
      .sort((left, right) => left[0].localeCompare(right[0], "ko"))
      .map(([sido, sigunguMap]) => ({
        sido,
        sigungus: [...sigunguMap.entries()]
          .sort((left, right) => left[0].localeCompare(right[0], "ko"))
          .map(([sigungu, dongs]) => ({
            sigungu,
            dongs: [...new Set(dongs)].sort((left, right) =>
              left.localeCompare(right, "ko"),
            ),
          })),
      }));
  }, [regions]);

  const meetingCategoryOptions = useMemo(
    () =>
      [...new Set(meetings.map((meeting) => meeting.sportCategory))].sort(
        (left, right) => left.localeCompare(right, "ko"),
      ),
    [meetings],
  );

  const sportCategoryOptions = useMemo(
    () =>
      [...new Set(sports.map((sport) => sport.category))].sort((left, right) =>
        left.localeCompare(right, "ko"),
      ),
    [sports],
  );

  const normalizedSportNames = useMemo(
    () => new Set(sports.map((sport) => normalizeText(sport.name).toLowerCase())),
    [sports],
  );

  const filteredMembers = useMemo(() => {
    const keyword = normalizeText(memberKeyword).toLowerCase();

    return members.filter((member) => {
      const matchesRegion = matchesRegionSelection(
        member.region,
        selectedSido,
        selectedSigungu,
        selectedDong,
      );

      if (!keyword) {
        return matchesRegion;
      }

      const searchBase = [
        member.nickname,
        member.loginId,
        String(member.id),
        member.region,
      ]
        .join(" ")
        .toLowerCase();

      return matchesRegion && searchBase.includes(keyword);
    });
  }, [
    members,
    memberKeyword,
    selectedSido,
    selectedSigungu,
    selectedDong,
  ]);

  const filteredMeetings = useMemo(() => {
    const keyword = normalizeText(meetingKeyword).toLowerCase();

    return meetings.filter((meeting) => {
      const matchesRegion = matchesRegionSelection(
        meeting.region,
        selectedSido,
        selectedSigungu,
        selectedDong,
      );
      const matchesCategory =
        selectedMeetingCategory === ALL_CATEGORY ||
        meeting.sportCategory === selectedMeetingCategory;

      if (!keyword) {
        return matchesRegion && matchesCategory;
      }

      const searchBase = [
        meeting.title,
        meeting.hostNickname,
        meeting.sport,
        meeting.region,
        `M${String(meeting.id).padStart(3, "0")}`,
      ]
        .join(" ")
        .toLowerCase();

      return matchesRegion && matchesCategory && searchBase.includes(keyword);
    });
  }, [
    meetings,
    meetingKeyword,
    selectedSido,
    selectedSigungu,
    selectedDong,
    selectedMeetingCategory,
  ]);

  const filteredSports = useMemo(
    () =>
      sports.filter(
        (sport) =>
          selectedSportCategory === ALL_CATEGORY ||
          sport.category === selectedSportCategory,
      ),
    [sports, selectedSportCategory],
  );

  const memberPageCount = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const meetingPageCount = Math.max(
    1,
    Math.ceil(filteredMeetings.length / PAGE_SIZE),
  );
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
      ? `${
          selectedSportCategory === ALL_CATEGORY
            ? "전체 카테고리"
            : selectedSportCategory
        } 기준으로 종목을 보고 있습니다.`
      : `${regionSummary || "전체 지역"} 기준으로 목록을 보고 있습니다.`;

  const filterPanelTitle =
    activeTab === "sports" ? "카테고리별 조회" : "지역별 조회";

  const filterPanelDescription =
    activeTab === "sports"
      ? "운동 종목은 카테고리별로 나눠서 빠르게 확인할 수 있습니다."
      : "시도, 시군구, 읍면동을 차례대로 선택해 목록을 좁혀볼 수 있습니다.";

  const resetSelection = () => {
    setSelectedSido(ALL_SIDO);
    setSelectedSigungu(ALL_SIGUNGU);
    setSelectedDong(ALL_DONG);
    setDraftRegionSelection({
      sido: ALL_SIDO,
      sigungu: ALL_SIGUNGU,
      dong: ALL_DONG,
    });
    setSelectedMeetingCategory(ALL_CATEGORY);
    setSelectedSportCategory(ALL_CATEGORY);
    setMemberKeyword("");
    setMeetingKeyword("");
    setPages({
      members: 1,
      meetings: 1,
      reports: 1,
      sports: 1,
    });
  };

  const closeSportModal = () => {
    setIsSportModalOpen(false);
    setSportForm(initialSportForm);
    setSportFormError("");
  };

  const openRegionModal = () => {
    setDraftRegionSelection({
      sido: selectedSido,
      sigungu: selectedSigungu,
      dong: selectedDong,
    });
    setIsRegionModalOpen(true);
  };

  const closeRegionModal = () => {
    setDraftRegionSelection({
      sido: selectedSido,
      sigungu: selectedSigungu,
      dong: selectedDong,
    });
    setIsRegionModalOpen(false);
  };

  const applyRegionSelection = (selection) => {
    setSelectedSido(selection.sido);
    setSelectedSigungu(selection.sigungu);
    setSelectedDong(selection.dong);
    setDraftRegionSelection(selection);
    updatePage("members", 1);
    updatePage("meetings", 1);
    setIsRegionModalOpen(false);
  };

  const submitSport = async () => {
    const normalizedName = sportForm.name.trim();
    const normalizedCategory = sportForm.category.trim();

    if (!normalizedName) {
      setSportFormError("종목명을 입력해주세요.");
      return;
    }

    if (!normalizedCategory) {
      setSportFormError("카테고리를 선택해주세요.");
      return;
    }

    if (normalizedSportNames.has(normalizedName.toLowerCase())) {
      setSportFormError("이미 존재하는 종목명입니다.");
      return;
    }

    try {
      setSportFormError("");
      await createAdminSport({
        name: normalizedName,
        category: normalizedCategory,
        isActive: sportForm.isActive,
      });

      await loadAdminData();
      closeSportModal();
      updatePage("sports", 1);
    } catch (error) {
      setSportFormError(
        error?.response?.data?.message ?? "종목을 추가하지 못했습니다.",
      );
    }
  };

  const handleMemberStatusChange = async (userId, nextStatus) => {
    setUpdatingMemberId(userId);
    try {
      await updateAdminMemberStatus(userId, nextStatus);
      await loadAdminData();
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleMeetingStatusChange = async (meetingId, nextStatus) => {
    setUpdatingMeetingId(meetingId);
    try {
      await updateAdminMeetingStatus(meetingId, nextStatus);
      await loadAdminData();
    } finally {
      setUpdatingMeetingId(null);
    }
  };

  const handleSportStatusChange = async (sport, nextActive) => {
    setUpdatingSportId(sport.id);
    try {
      await updateAdminSport(sport.id, {
        name: sport.name,
        category: sport.category,
        isActive: nextActive,
      });
      await loadAdminData();
    } finally {
      setUpdatingSportId(null);
    }
  };

  const handleSportDelete = async (sportId) => {
    setDeletingSportId(sportId);
    try {
      await deleteAdminSport(sportId);
      await loadAdminData();
      updatePage("sports", 1);
    } finally {
      setDeletingSportId(null);
    }
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
        {summaryCards.map((card) => (
          <article key={card.key} className={styles[card.toneClass]}>
            <div className={styles.summaryEyebrow}>{card.label}</div>
            <strong>{summary[card.key]}</strong>
            <p className={styles.summaryCaption}>{card.caption}</p>
          </article>
        ))}
      </section>

      <div className={styles.pageTabsShell}>
        <div className={styles.pageTabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={cx(
                "tabButton",
                activeTab === tab.id && "tabButtonCurrent",
              )}
              onClick={() => changeTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <section className={styles.filterPanel}>
        <div className={styles.filterHead}>
          <div>
            <h2>{filterPanelTitle}</h2>
            <p>{filterPanelDescription}</p>
          </div>
          <button type="button" onClick={resetSelection}>
            전체 보기
          </button>
        </div>

        <div className={styles.filterSummaryBar}>
          <span className={styles.filterSummaryKicker}>조회 기준</span>
          <strong>{filterSummaryText}</strong>
        </div>

        {activeTab !== "sports" ? (
          <div className={styles.regionPickerRow}>
            <button
              type="button"
              className={styles.regionPickerButton}
              onClick={openRegionModal}
            >
              지역 조회
            </button>
            <div className={styles.regionPickerSummary}>
              <span className={styles.regionPickerLabel}>선택 지역</span>
              <strong>{regionSummary || "전체 지역"}</strong>
            </div>
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
                    "categoryChip",
                    selectedMeetingCategory === category &&
                      "categoryChipCurrent",
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
                    "categoryChip",
                    selectedSportCategory === category &&
                      "categoryChipCurrent",
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
        <section id="members" className={styles.tableCard}>
          <div className={styles.tableHead}>
            <div>
              <h2>회원 관리</h2>
              <p>닉네임, 로그인 ID로 검색하고 회원 상태를 바로 변경할 수 있습니다.</p>
            </div>
          </div>
          <div className={styles.tableToolbar}>
            <label className={styles.searchField}>
              <span>회원 검색</span>
              <input
                value={memberKeyword}
                onChange={(event) => {
                  setMemberKeyword(event.target.value);
                  updatePage("members", 1);
                }}
                placeholder="닉네임, 로그인 ID, 회원 ID 검색"
              />
            </label>
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
                <th>상태 변경</th>
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
                    <span className={cx("badge", badgeToneByMemberStatus(member.status))}>
                      {member.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className={styles.inlineSelect}
                      value={member.status}
                      disabled={updatingMemberId === member.id}
                      onChange={(event) =>
                        handleMemberStatusChange(member.id, event.target.value)
                      }
                    >
                      {memberStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {pagedMembers.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.emptyCell}>
                    선택한 조건에 해당하는 회원이 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          <Pagination
            currentPage={memberPage}
            totalPages={memberPageCount}
            totalItems={filteredMembers.length}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => updatePage("members", page)}
          />
        </section>
      ) : null}

      {activeTab === "meetings" ? (
        <section id="meetings" className={styles.tableCard}>
          <div className={styles.tableHead}>
            <div>
              <h2>모임 관리</h2>
              <p>제목, 주최자, 종목으로 검색하고 모임 상태를 바로 바꿀 수 있습니다.</p>
            </div>
          </div>
          <div className={styles.tableToolbar}>
            <label className={styles.searchField}>
              <span>모임 검색</span>
              <input
                value={meetingKeyword}
                onChange={(event) => {
                  setMeetingKeyword(event.target.value);
                  updatePage("meetings", 1);
                }}
                placeholder="제목, 주최자, 종목, 모임 ID 검색"
              />
            </label>
          </div>
          <table>
            <thead>
              <tr>
                <th>모임 ID</th>
                <th>제목</th>
                <th>종목</th>
                <th>카테고리</th>
                <th>지역</th>
                <th>일정</th>
                <th>참가 인원</th>
                <th>상태</th>
                <th>상태 변경</th>
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
                  <td>
                    <div className={styles.scheduleCell}>
                      <strong>{meeting.meetingDate}</strong>
                      <span>{meeting.startTime}</span>
                    </div>
                  </td>
                  <td>
                    {meeting.current}/{meeting.max}
                  </td>
                  <td>
                    <span className={cx("badge", badgeToneByMeetingStatus(meeting.status))}>
                      {meeting.statusText}
                    </span>
                  </td>
                  <td>
                    <select
                      className={styles.inlineSelect}
                      value={meeting.status}
                      disabled={updatingMeetingId === meeting.id}
                      onChange={(event) =>
                        handleMeetingStatusChange(meeting.id, event.target.value)
                      }
                    >
                      {meetingStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {pagedMeetings.length === 0 ? (
                <tr>
                  <td colSpan="9" className={styles.emptyCell}>
                    조건에 맞는 모임이 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          <Pagination
            currentPage={meetingPage}
            totalPages={meetingPageCount}
            totalItems={filteredMeetings.length}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => updatePage("meetings", page)}
          />
        </section>
      ) : null}

      {activeTab === "reports" ? (
        <section id="reports" className={styles.tableCard}>
          <div className={styles.tableHead}>
            <div>
              <h2>신고 내역</h2>
              <p>최근 신고를 10개씩 확인하면서 처리 상태를 볼 수 있습니다.</p>
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
                    <span className={cx("badge", badgeToneByReportStatus(report.status))}>
                      {report.statusText}
                    </span>
                  </td>
                  <td>{report.createdAt}</td>
                </tr>
              ))}
              {pagedReports.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.emptyCell}>
                    표시할 신고 내역이 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          <Pagination
            currentPage={reportPage}
            totalPages={reportPageCount}
            totalItems={reports.length}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => updatePage("reports", page)}
          />
        </section>
      ) : null}

      {activeTab === "sports" ? (
        <section id="sports" className={styles.tableCard}>
          <div className={styles.tableHead}>
            <div>
              <h2>운동 종목</h2>
              <p>카테고리별로 10개씩 확인하고 모달에서 새 종목을 추가할 수 있습니다.</p>
            </div>
            <button type="button" onClick={() => setIsSportModalOpen(true)}>
              종목 관리
            </button>
          </div>
          <div className={styles.sectionHint}>
            카테고리와 사용 상태를 함께 보면 현재 운영 중인 종목을 빠르게 정리할 수
            있습니다.
          </div>
          <table>
            <thead>
              <tr>
                <th>종목 ID</th>
                <th>이름</th>
                <th>카테고리</th>
                <th>사용 여부</th>
                <th>활성화 변경</th>
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
                  <td>
                    <select
                      className={styles.inlineSelect}
                      value={sport.isActive ? "true" : "false"}
                      disabled={updatingSportId === sport.id}
                      onChange={(event) =>
                        handleSportStatusChange(sport, event.target.value === "true")
                      }
                    >
                      {sportStatusOptions.map((option) => (
                        <option
                          key={String(option.value)}
                          value={String(option.value)}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {pagedSports.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.emptyCell}>
                    선택한 카테고리에 해당하는 종목이 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          <Pagination
            currentPage={sportPage}
            totalPages={sportPageCount}
            totalItems={filteredSports.length}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => updatePage("sports", page)}
          />
        </section>
      ) : null}

      <AppModal
        open={isSportModalOpen}
        eyebrow="운동 종목"
        title="운동 종목 관리"
        description="현재 종목 목록을 확인하고 새 종목을 바로 추가할 수 있습니다."
        confirmText="종목 추가"
        cancelText="닫기"
        onConfirm={submitSport}
        onClose={closeSportModal}
      >
        <div className={styles.modalPanel}>
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
                  placeholder="예: 클라이밍"
                />
              </label>
              <label className={styles.modalField}>
                <span>카테고리</span>
                <select
                  value={sportForm.category}
                  onChange={(event) =>
                    setSportForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                >
                  <option value="">카테고리 선택</option>
                  {sportCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
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
                <span>즉시 사용 가능한 상태로 추가</span>
              </label>
              {sportFormError ? (
                <p className={styles.modalErrorText}>{sportFormError}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className={styles.modalPanel}>
          <div className={styles.modalSection}>
            <h3 className={styles.modalTitle}>현재 종목 목록</h3>
            <div className={styles.sportList}>
              {sports.map((sport) => (
                <article key={sport.id} className={styles.sportCard}>
                  <div className={styles.sportCardBody}>
                    <strong>{sport.name}</strong>
                    <p>{sport.category}</p>
                  </div>
                  <div className={styles.sportCardControls}>
                    <select
                      className={styles.inlineSelect}
                      value={sport.isActive ? "true" : "false"}
                      disabled={
                        updatingSportId === sport.id || deletingSportId === sport.id
                      }
                      onChange={(event) =>
                        handleSportStatusChange(sport, event.target.value === "true")
                      }
                    >
                      {sportStatusOptions.map((option) => (
                        <option
                          key={String(option.value)}
                          value={String(option.value)}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      disabled={deletingSportId === sport.id}
                      onClick={() => handleSportDelete(sport.id)}
                    >
                      삭제
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </AppModal>

      <RegionPickerModal
        open={isRegionModalOpen}
        regions={regionHierarchy}
        initialSelection={draftRegionSelection}
        onApply={applyRegionSelection}
        onClose={closeRegionModal}
      />
    </div>
  );
}
