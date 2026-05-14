import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { meetings, regions, sports } from "../data/demoData";
import { meetingImages } from "../data/dashboardData";
import styles from "../styles/MeetingEditPage.module.css";

function useImagePreviews(files) {
  const previews = useMemo(() => {
    return files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
  }, [files]);

  useEffect(() => {
    return () => {
      previews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previews]);

  return previews;
}

export default function MeetingEditPage() {
  const { meetingId } = useParams();
  const meeting = meetings.find((item) => String(item.id) === meetingId) ?? meetings[0];
  const [files, setFiles] = useState([]);
  const previews = useImagePreviews(files);

  const handleFileChange = (event) => {
    const nextFiles = Array.from(event.target.files ?? []).slice(0, 4);
    setFiles(nextFiles);
  };

  const removeFile = (targetName) => {
    setFiles((current) => current.filter((file) => file.name !== targetName));
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>
        <div>
          <h1>모임 수정</h1>
          <p>참가 예정인 사람들도 헷갈리지 않도록, 바뀐 정보가 한눈에 보이게 정리해두세요.</p>
        </div>
      </div>

      <section className={styles.formIntro}>
        <h2>기존 흐름은 유지하고, 필요한 부분만 정확하게 다듬어보세요.</h2>
        <p>시간, 장소, 사진, 소개 문구만 잘 정리해도 모임 페이지의 신뢰감이 크게 올라갑니다.</p>
      </section>

      <form className={styles.formCard}>
        <label className={styles.full}>
          <span>모임 제목</span>
          <input defaultValue={meeting.title} />
        </label>
        <label>
          <span>운동 종목</span>
          <select defaultValue={meeting.sport}>{sports.map((sport) => <option key={sport.id}>{sport.name}</option>)}</select>
        </label>
        <label>
          <span>지역</span>
          <select defaultValue={meeting.region}>{regions.map((region) => <option key={region}>{region}</option>)}</select>
        </label>
        <label>
          <span>상세 장소</span>
          <input defaultValue={meeting.place} />
        </label>
        <label>
          <span>날짜</span>
          <input type="date" defaultValue="2026-05-16" />
        </label>
        <label>
          <span>시작 시간</span>
          <input type="time" defaultValue={meeting.time} />
        </label>
        <label>
          <span>모집 인원</span>
          <input type="number" min="2" defaultValue={meeting.max} />
        </label>
        <label>
          <span>모집 상태</span>
          <select defaultValue={meeting.status}>
            <option value="RECRUITING">모집중</option>
            <option value="CLOSED">모집마감</option>
            <option value="COMPLETED">종료</option>
            <option value="CANCELLED">취소</option>
          </select>
        </label>

        <div className={`${styles.full} ${styles.choiceGroup}`}>
          <span>모임 방식</span>
          <div>
            <label><input type="radio" name="meetingType" defaultChecked /> 1회성 모임</label>
            <label><input type="radio" name="meetingType" /> 정기 모임</label>
          </div>
        </div>

        <label>
          <span>반복 주기</span>
          <select defaultValue="NONE">
            <option value="NONE">없음</option>
            <option value="WEEKLY">매주</option>
            <option value="BIWEEKLY">격주</option>
            <option value="MONTHLY">매월</option>
          </select>
        </label>

        <label className={styles.full}>
          <span>준비물</span>
          <input defaultValue="편한 운동복, 물, 개인 이어폰" />
        </label>

        <label className={styles.full}>
          <span>진행 안내</span>
          <textarea
            defaultValue="시작 10분 전 집결을 권장합니다. 간단한 인사와 스트레칭 후 함께 이동합니다."
          />
        </label>

        <label className={styles.full}>
          <span>모임 소개</span>
          <textarea defaultValue={meeting.desc} />
        </label>

        <div className={`${styles.full} ${styles.uploadBlock}`}>
          <span className={styles.kicker}>현재 대표 사진</span>
          <div className={styles.reviewPreviewGrid}>
            <article className={styles.reviewPreviewCard}>
              <img src={meetingImages[meeting.id]} alt={meeting.title} className={styles.reviewPreviewImage} />
              <div className={styles.reviewPreviewMeta}>
                <span>현재 사용 중인 대표 사진</span>
                <button type="button">유지</button>
              </div>
            </article>
          </div>
        </div>

        <div className={`${styles.full} ${styles.uploadBlock}`}>
          <span className={styles.kicker}>새 사진 업로드</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className={styles.uploadInput}
            onChange={handleFileChange}
          />
          <small className={styles.uploadHint}>새 사진을 올리면 기존 대표 사진 대신 사용할 후보로 보여집니다.</small>
        </div>

        {previews.length > 0 ? (
          <div className={`${styles.full} ${styles.reviewPreviewGrid}`}>
            {previews.map((preview) => (
              <article key={preview.name} className={styles.reviewPreviewCard}>
                <img src={preview.url} alt={preview.name} className={styles.reviewPreviewImage} />
                <div className={styles.reviewPreviewMeta}>
                  <span>{preview.name}</span>
                  <button type="button" onClick={() => removeFile(preview.name)}>삭제</button>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        <div className={`${styles.full} ${styles.formActions}`}>
          <Link to={`/meetings/${meeting.id}`}>취소</Link>
          <button type="button">수정 저장</button>
        </div>
      </form>
    </div>
  );
}
