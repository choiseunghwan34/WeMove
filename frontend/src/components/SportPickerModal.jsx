import { useEffect, useMemo, useState } from "react";
import AppModal from "./AppModal";
import styles from "../styles/MeetingPickerModal.module.css";

export default function SportPickerModal({
  open,
  sports,
  selectedSportId,
  onApply,
  onClose,
}) {
  const [keyword, setKeyword] = useState("");
  const [draftSportId, setDraftSportId] = useState(selectedSportId ?? null);

  useEffect(() => {
    if (open) {
      setKeyword("");
      setDraftSportId(selectedSportId ?? null);
    }
  }, [open, selectedSportId]);

  const filteredSports = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return sports;
    }

    return sports.filter((sport) =>
      [sport.name, sport.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword),
    );
  }, [sports, keyword]);

  const selectedSport =
    sports.find((sport) => sport.sportId === draftSportId) ?? null;

  const applySelection = () => {
    onApply?.(selectedSport);
  };

  return (
    <AppModal
      open={open}
      eyebrow="운동 조회"
      title="운동 종목 선택"
      description="운동 이름이나 카테고리로 검색한 뒤 조회에 사용할 종목을 선택하세요."
      confirmText="적용"
      cancelText="닫기"
      onConfirm={applySelection}
      onClose={onClose}
    >
      <div className={styles.previewBar}>
        <span>현재 선택</span>
        <strong>
          {selectedSport
            ? `${selectedSport.name} · ${selectedSport.category || "기타"}`
            : "전체 종목"}
        </strong>
        <button
          type="button"
          className={styles.textButton}
          onClick={() => setDraftSportId(null)}
        >
          전체 종목으로 보기
        </button>
      </div>

      <label className={styles.searchField}>
        <span>종목 검색</span>
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="운동명 또는 카테고리 검색"
        />
      </label>

      <div className={styles.sportList}>
        {filteredSports.map((sport) => (
          <button
            key={sport.sportId}
            type="button"
            className={`${styles.sportCard} ${
              sport.sportId === draftSportId ? styles.sportCardCurrent : ""
            }`.trim()}
            onClick={() => setDraftSportId(sport.sportId)}
          >
            <strong>{sport.name}</strong>
            <span>{sport.category || "기타"}</span>
          </button>
        ))}
        {filteredSports.length === 0 ? (
          <div className={styles.emptyState}>검색 결과가 없습니다.</div>
        ) : null}
      </div>
    </AppModal>
  );
}
