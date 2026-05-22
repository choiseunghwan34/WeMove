import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppModal from "../components/AppModal";
import DashboardShell from "../components/DashboardShell";
import RegionPickerModal from "../components/RegionPickerModal";
import { getMe, updateMe } from "../api/memberApi";
import { getRegions } from "../api/regionApi";
import defaultUserImage from "../assets/image/Default-user.png";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/MyPage.module.css";

const cx = (...names) =>
  names
    .filter(Boolean)
    .map((name) => styles[name])
    .join(" ");

const normalizeText = (value) => String(value ?? "").trim();
const ALL_SIDO = "전체 시도";
const ALL_SIGUNGU = "전체 시군구";
const ALL_DONG = "전체 읍면동";

export default function MyPage() {
  const { user, loading: authLoading, isAuthenticated, updateUserProfile } =
    useAuth();
  const [member, setMember] = useState(null);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [draftRegionSelection, setDraftRegionSelection] = useState({
    sido: ALL_SIDO,
    sigungu: ALL_SIGUNGU,
    dong: ALL_DONG,
  });
  const [form, setForm] = useState({
    email: "",
    nickname: "",
    phone: "",
    regionId: "",
  });

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user?.memberId) {
      setMember(null);
      setLoading(false);
      return;
    }

    let active = true;

    const fetchMyPageData = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const [memberResponse, regionsResponse] = await Promise.all([
          getMe(user.memberId),
          getRegions(),
        ]);

        if (!active) {
          return;
        }

        setMember(memberResponse.data ?? null);
        setRegions(Array.isArray(regionsResponse.data) ? regionsResponse.data : []);
      } catch {
        if (active) {
          setLoadError("회원 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchMyPageData();

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, user?.memberId]);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedImage]);

  const regionName = useMemo(() => {
    if (!member?.regionId) {
      return "미설정";
    }

    const matchedRegion = regions.find(
      (region) => Number(region.regionId) === Number(member.regionId),
    );

    if (!matchedRegion) {
      return "미설정";
    }

    return [matchedRegion.sido, matchedRegion.sigungu, matchedRegion.dong]
      .filter(Boolean)
      .join(" ");
  }, [member?.regionId, regions]);

  const regionHierarchy = useMemo(() => {
    const grouped = new Map();

    regions.forEach((region) => {
      const sido = normalizeText(region.sido);
      const sigungu = normalizeText(region.sigungu);
      const dong = normalizeText(region.dong);

      if (!sido || !sigungu || !dong) {
        return;
      }

      if (!grouped.has(sido)) {
        grouped.set(sido, new Map());
      }

      const sigunguMap = grouped.get(sido);
      if (!sigunguMap.has(sigungu)) {
        sigunguMap.set(sigungu, []);
      }

      sigunguMap.get(sigungu).push(dong);
    });

    return [...grouped.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], "ko"))
      .map(([sido, sigunguMap]) => ({
        sido,
        sigungus: [...sigunguMap.entries()]
          .sort((a, b) => a[0].localeCompare(b[0], "ko"))
          .map(([sigungu, dongs]) => ({
            sigungu,
            dongs: [...new Set(dongs)].sort((a, b) => a.localeCompare(b, "ko")),
          })),
      }));
  }, [regions]);

  const selectedFormRegion = useMemo(
    () =>
      regions.find((region) => Number(region.regionId) === Number(form.regionId)) ??
      null,
    [form.regionId, regions],
  );

  const formRegionLabel = selectedFormRegion
    ? [selectedFormRegion.sido, selectedFormRegion.sigungu, selectedFormRegion.dong]
        .filter(Boolean)
        .join(" > ")
    : "지역을 선택해주세요";

  const profileImage =
    imagePreview || normalizeText(member?.profileImage) || defaultUserImage;

  const detailItems = [
    { label: "닉네임", value: member?.nickname || "-" },
    { label: "이메일", value: member?.email || "-" },
    { label: "휴대폰 번호", value: member?.phone || "미등록" },
    { label: "관심 지역", value: regionName },
  ];

  const statItems = [
    { label: "내 닉네임", value: member?.nickname || "-" },
    { label: "이메일", value: member?.email || "-" },
    { label: "휴대폰 번호", value: member?.phone || "미등록" },
    { label: "관심 지역", value: regionName },
  ];

  const openEditModal = () => {
    if (!member) {
      return;
    }

    setForm({
      email: normalizeText(member.email),
      nickname: normalizeText(member.nickname),
      phone: normalizeText(member.phone),
      regionId: member.regionId ? String(member.regionId) : "",
    });
    setSelectedImage(null);
    setImagePreview("");
    setSaveError("");
    setDraftRegionSelection({
      sido: ALL_SIDO,
      sigungu: ALL_SIGUNGU,
      dong: ALL_DONG,
    });
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    if (saving) {
      return;
    }

    setIsEditOpen(false);
    setSelectedImage(null);
    setImagePreview("");
    setSaveError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openRegionModal = () => {
    if (selectedFormRegion) {
      setDraftRegionSelection({
        sido: normalizeText(selectedFormRegion.sido),
        sigungu: normalizeText(selectedFormRegion.sigungu),
        dong: normalizeText(selectedFormRegion.dong),
      });
    } else {
      setDraftRegionSelection({
        sido: ALL_SIDO,
        sigungu: ALL_SIGUNGU,
        dong: ALL_DONG,
      });
    }

    setIsRegionModalOpen(true);
  };

  const closeRegionModal = () => {
    setIsRegionModalOpen(false);
  };

  const applyRegionSelection = (selection) => {
    const matchedRegion = regions.find(
      (region) =>
        normalizeText(region.sido) === selection.sido &&
        normalizeText(region.sigungu) === selection.sigungu &&
        normalizeText(region.dong) === selection.dong,
    );

    if (!matchedRegion) {
      return;
    }

    setForm((current) => ({
      ...current,
      regionId: String(matchedRegion.regionId),
    }));
    setDraftRegionSelection(selection);
    setIsRegionModalOpen(false);
  };

  const handleImageChange = (event) => {
    const nextImage = event.target.files?.[0] ?? null;

    if (!nextImage) {
      setSelectedImage(null);
      return;
    }

    if (!nextImage.type.startsWith("image/")) {
      setSaveError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    if (nextImage.size > 5 * 1024 * 1024) {
      setSaveError("프로필 이미지는 5MB 이하만 업로드할 수 있습니다.");
      return;
    }

    setSaveError("");
    setSelectedImage(nextImage);
  };

  const handleSaveProfile = async () => {
    const email = normalizeText(form.email);
    const nickname = normalizeText(form.nickname);
    const phone = normalizeText(form.phone);
    const regionId = form.regionId ? Number(form.regionId) : null;

    if (!email || !nickname) {
      setSaveError("이메일과 닉네임을 입력해주세요.");
      return;
    }

    if (!user?.memberId) {
      setSaveError("로그인 정보를 확인할 수 없습니다.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      await updateMe(
        user.memberId,
        {
          email,
          nickname,
          phone,
          regionId,
        },
        selectedImage,
      );

      const refreshedMember = await getMe(user.memberId);
      setMember(refreshedMember.data ?? null);
      updateUserProfile?.({
        nickname,
        profileImage: refreshedMember.data?.profileImage ?? "",
      });
      setIsEditOpen(false);
      setSelectedImage(null);
      setImagePreview("");
    } catch (error) {
      setSaveError(
        error?.response?.data?.message || "프로필 수정 중 오류가 발생했습니다.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      active="마이페이지"
      title="마이페이지"
      description="내 계정 정보와 관심 지역을 확인하고 프로필을 수정할 수 있습니다."
      aside={
        <>
          <section className={styles.dashboardPanel}>
            <div className={styles.dashboardPanelHead}>
              <h3>프로필 요약</h3>
            </div>
            <div className={styles.dashboardSimpleList}>
              <div>
                <span>이메일</span>
                <strong>{member?.email || "-"}</strong>
              </div>
              <div>
                <span>휴대폰 번호</span>
                <strong>{member?.phone || "미등록"}</strong>
              </div>
              <div>
                <span>관심 지역</span>
                <strong>{regionName}</strong>
              </div>
            </div>
          </section>

          <section className={styles.dashboardPanel}>
            <div className={styles.dashboardPanelHead}>
              <h3>바로가기</h3>
            </div>
            <div className={styles.dashboardQuickLinks}>
              <Link to="/meetings/new">모임 만들기</Link>
              <Link to="/activity">내 활동 보기</Link>
              <Link to="/meetings">모임 찾기</Link>
            </div>
          </section>
        </>
      }
    >
      {!isAuthenticated && !authLoading ? (
        <section className={styles.noticeCard}>
          <h2>로그인이 필요합니다.</h2>
          <p>마이페이지는 로그인 후 내 정보를 확인할 수 있습니다.</p>
          <Link to="/login" className={styles.primaryAction}>
            로그인하러 가기
          </Link>
        </section>
      ) : null}

      {isAuthenticated ? (
        <>
          <section className={styles.profileCard}>
            <div className={styles.profileLeft}>
              <div className={styles.profileAvatar}>
                <img
                  src={profileImage}
                  alt={member?.nickname ? `${member.nickname} 프로필` : "기본 프로필"}
                  className={styles.profileImage}
                />
              </div>
              <div className={styles.profileCopy}>
                <h2>{member?.nickname || user?.nickname || "회원"}</h2>
                <p>
                  {regionName} · {member?.email || "이메일 미설정"}
                </p>
                <small>{member?.phone || "휴대폰 번호 미등록"}</small>
              </div>
            </div>
            <button type="button" onClick={openEditModal}>
              프로필 수정
            </button>
          </section>

          {loading ? (
            <section className={styles.noticeCard}>
              <h2>회원 정보를 불러오는 중입니다.</h2>
              <p>잠시만 기다리면 프로필과 계정 정보가 표시됩니다.</p>
            </section>
          ) : loadError ? (
            <section className={styles.noticeCard}>
              <h2>회원 정보를 불러오지 못했습니다.</h2>
              <p>{loadError}</p>
            </section>
          ) : (
            <>
              <section className={styles.dashboardStatGrid}>
                {statItems.map((item) => (
                  <article key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </section>

              <section className={styles.tabsPanel}>
                <div className={styles.pageTabs}>
                  <button
                    className={cx("tabButton", "tabButtonActive")}
                    type="button"
                  >
                    내 정보
                  </button>
                </div>

                <div className={styles.detailGrid}>
                  {detailItems.map((item) => (
                    <article key={item.label} className={styles.detailCard}>
                      <span className={styles.detailLabel}>{item.label}</span>
                      <strong className={styles.detailValue}>{item.value}</strong>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </>
      ) : null}

      <AppModal
        open={isEditOpen}
        title="프로필 수정"
        description="닉네임, 이메일, 휴대폰 번호, 관심 지역과 프로필 이미지를 수정할 수 있습니다."
        confirmText={saving ? "저장 중..." : "저장하기"}
        cancelText="닫기"
        onConfirm={handleSaveProfile}
        onClose={closeEditModal}
      >
        <div className={styles.editForm}>
          <div className={styles.imageEditor}>
            <img
              src={profileImage}
              alt="프로필 미리보기"
              className={styles.imagePreview}
            />
            <label className={styles.uploadButton}>
              이미지 선택
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.hiddenInput}
              />
            </label>
          </div>

          <label className={styles.formField}>
            <span>닉네임</span>
            <input
              name="nickname"
              value={form.nickname}
              onChange={handleFormChange}
              placeholder="닉네임을 입력하세요"
            />
          </label>

          <label className={styles.formField}>
            <span>이메일</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleFormChange}
              placeholder="이메일을 입력하세요"
            />
          </label>

          <label className={styles.formField}>
            <span>휴대폰 번호</span>
            <input
              name="phone"
              value={form.phone}
              onChange={handleFormChange}
              placeholder="휴대폰 번호를 입력하세요"
            />
          </label>

          <label className={styles.formField}>
            <span>관심 지역</span>
            <button
              type="button"
              className={styles.uploadButton}
              onClick={openRegionModal}
            >
              {formRegionLabel}
            </button>
          </label>

          {saveError ? <p className={styles.formError}>{saveError}</p> : null}
        </div>
      </AppModal>

      <RegionPickerModal
        open={isRegionModalOpen}
        regions={regionHierarchy}
        initialSelection={draftRegionSelection}
        onApply={applyRegionSelection}
        onClose={closeRegionModal}
      />
    </DashboardShell>
  );
}
