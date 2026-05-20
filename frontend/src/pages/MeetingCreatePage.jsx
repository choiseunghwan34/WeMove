import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { regions, sports } from "../data/demoData";
import styles from "../styles/MeetingCreatePage.module.css";

//썸네일영역
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

export default function MeetingCreatePage() {
  //인풋정보
  const initialForm = {
    sportId: "",
    regionId: "",
    title: "",
    content: "",
    placeName: "",
    address: "",
    latitude: null,
    longitude: null,
    meetingDate: "",
    startTime: "",
    maxMembers: "",
    meetingType: "ONE_TIME",
    repeatType: "NONE",
    supplies: "",
    guideText: "",
    status: "RECRUITING",
  };
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  //썸네일
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
          <h1>모임 만들기</h1>
          <p>
            제목, 장소, 시간, 소개와 대표 사진까지 정리하면 훨씬 신뢰감 있는
            모임 페이지를 만들 수 있습니다.
          </p>
        </div>
      </div>

      <section className={styles.formIntro}>
        <h2>좋은 모임은 한눈에 이해되는 정보에서 시작됩니다.</h2>
        <p>
          참가자는 제목과 썸네일, 장소, 분위기를 먼저 봅니다. 처음 보는 사람도
          바로 감을 잡을 수 있게 간결하고 선명하게 구성해보세요.
        </p>
        <div className={styles.formHintGrid}>
          <article>
            <span>제목 작성 팁</span>
            <strong>지역 + 운동 + 시간대가 자연스럽게 보이도록 쓰기</strong>
          </article>
          <article>
            <span>사진 등록 팁</span>
            <strong>실제 분위기가 잘 보이는 밝은 운동 사진 1~4장 선택</strong>
          </article>
          <article>
            <span>소개 작성 팁</span>
            <strong>
              초보 가능 여부, 준비물, 진행 방식을 짧고 명확하게 안내
            </strong>
          </article>
        </div>
      </section>

      <form className={styles.formCard}>
        <label className={styles.full}>
          <span>모임 제목</span>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="예: 야당역 5km 러닝 크루 모집"
          />
        </label>
        <label>
          <span>운동 종목</span>
          <select name="sportId" value={form.sportId} onChange={handleChange}>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>지역</span>
          <select name="regionId" value={form.regionId} onChange={handleChange}>
            {regions.map((region) => (
              <option key={region}>{region}</option>
            ))}
          </select>
        </label>
        <label>
          <span>상세 장소</span>
          <input
            name="placeName"
            value={form.placeName}
            onChange={handleChange}
            placeholder="예: 야당역 2번 출구 앞"
          />
        </label>
        <label>
          <span>주소</span>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="예: 경기 파주시 경의로 000"
          />
        </label>
        <label>
          <span>날짜</span>
          <input
            name="meetingDate"
            value={form.meetingDate}
            onChange={handleChange}
            type="date"
          />
        </label>
        <label>
          <span>시작 시간</span>
          <input
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            type="time"
            defaultValue="20:00"
          />
        </label>
        <label>
          <span>모집 인원</span>
          <input
            name="maxMembers"
            value={form.maxMembers}
            onChange={handleChange}
            type="number"
            min="2"
          />
        </label>
        <label>
          <span>모집 상태</span>
          <select>
            <option value="RECRUITING">모집중</option>
            <option value="CLOSED">모집마감</option>
          </select>
        </label>
        {/*
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
            */}

        <label className={styles.full}>
          <span>준비물</span>
          <input
            name="supplies"
            value={form.supplies}
            onChange={handleChange}
            placeholder="편한 운동복, 물, 개인 이어폰"
          />
        </label>

        <label className={styles.full}>
          <span>진행 안내</span>
          <textarea
            name="guideText"
            value={form.guideText}
            onChange={handleChange}
            placeholder="시작 10분 전 집결을 권장합니다. 간단한 인사와 스트레칭 후 함께 이동합니다."
          />
        </label>

        <label className={styles.full}>
          <span>모임 소개</span>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="모임 분위기, 참가 대상, 준비물, 진행 방식, 초보 가능 여부를 적어주세요."
          />
        </label>

        <div className={`${styles.full} ${styles.uploadBlock}`}>
          <span className={styles.kicker}>대표 사진 등록</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className={styles.uploadInput}
            onChange={handleFileChange}
          />
          <small className={styles.uploadHint}>
            최대 4장까지 등록할 수 있습니다. 첫 번째 사진이 대표 썸네일처럼
            보입니다.
          </small>
        </div>

        {previews.length > 0 ? (
          <div className={`${styles.full} ${styles.reviewPreviewGrid}`}>
            {previews.map((preview) => (
              <article key={preview.name} className={styles.reviewPreviewCard}>
                <img
                  src={preview.url}
                  alt={preview.name}
                  className={styles.reviewPreviewImage}
                />
                <div className={styles.reviewPreviewMeta}>
                  <span>{preview.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(preview.name)}
                  >
                    삭제
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        <div className={`${styles.full} ${styles.formActions}`}>
          <Link to="/meetings">취소</Link>
          <button type="button">모임 등록</button>
        </div>
      </form>
    </div>
  );
}
