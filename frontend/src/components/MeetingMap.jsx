import { useEffect, useRef, useState } from "react";
import { KAKAO_MAP_APP_KEY, loadKakaoMap } from "../utils/kakaoMap";
import styles from "../styles/MeetingMap.module.css";
import UiIcon from "./UiIcon";

const SEOUL_CENTER = { latitude: 37.5665, longitude: 126.978 };
const coordinateCache = new Map();
const GEOCODING_CONCURRENCY = 6;

const SPORT_MARKERS = [
  { terms: ["축구", "풋살"], icon: "⚽", color: "#2563eb" },
  { terms: ["농구"], icon: "🏀", color: "#f97316" },
  { terms: ["야구"], icon: "⚾", color: "#dc2626" },
  { terms: ["테니스", "배드민턴", "탁구"], icon: "🏸", color: "#7c3aed" },
  { terms: ["러닝", "달리기", "걷기"], icon: "🏃", color: "#16a34a" },
  { terms: ["헬스", "웨이트", "근력"], icon: "🏋", color: "#0f766e" },
  { terms: ["수영", "서핑"], icon: "🏊", color: "#0284c7" },
  { terms: ["등산", "클라이밍"], icon: "⛰", color: "#b45309" },
  { terms: ["볼링"], icon: "🎳", color: "#db2777" },
];

const getMarkerTheme = (sportName = "") =>
  SPORT_MARKERS.find(({ terms }) =>
    terms.some((term) => String(sportName).includes(term)),
  ) ?? { icon: "●", color: "#2563eb" };

const getAddressCandidates = (meeting) =>
  [
    meeting.address,
    [meeting.regionName, meeting.placeName].filter(Boolean).join(" "),
    meeting.regionName,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

const geocodeAddress = (geocoder, candidates) =>
  new Promise((resolve) => {
    const searchNext = (index) => {
      const address = candidates[index];
      if (!address) {
        resolve(null);
        return;
      }

      const cached = coordinateCache.get(address);
      if (cached) {
        resolve(cached);
        return;
      }

      geocoder.addressSearch(address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result[0]) {
          const coordinate = {
            latitude: Number(result[0].y),
            longitude: Number(result[0].x),
          };
          coordinateCache.set(address, coordinate);
          resolve(coordinate);
          return;
        }

        searchNext(index + 1);
      });
    };

    searchNext(0);
  });

const getCoordinate = async (meeting, geocoder) => {
  const latitude = Number(meeting.latitude);
  const longitude = Number(meeting.longitude);

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return { latitude, longitude };
  }

  return geocodeAddress(geocoder, getAddressCandidates(meeting));
};

const createMarkerImage = (kakao, meeting) => {
  const { icon, color } = getMarkerTheme(meeting.sportName);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="58" viewBox="0 0 48 58">
      <filter id="shadow" x="-30%" y="-20%" width="160%" height="170%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#0f172a" flood-opacity=".22"/>
      </filter>
      <path filter="url(#shadow)" fill="${color}" d="M24 2C11.85 2 2 11.85 2 24c0 16.5 22 32 22 32s22-15.5 22-32C46 11.85 36.15 2 24 2Z"/>
      <circle cx="24" cy="23" r="15" fill="white"/>
      <text x="24" y="29" text-anchor="middle" font-size="18" font-family="Arial, sans-serif">${icon}</text>
    </svg>
  `;

  return new kakao.maps.MarkerImage(
    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    new kakao.maps.Size(48, 58),
    { offset: new kakao.maps.Point(24, 56) },
  );
};

const createPopup = (meeting, onSelectMeeting) => {
  const popup = document.createElement("article");
  popup.className = styles.popup;

  const head = document.createElement("div");
  head.className = styles.popupHead;

  const sport = document.createElement("span");
  sport.className = styles.popupSport;
  sport.textContent = meeting.sportName || "운동 모임";

  const status = document.createElement("span");
  status.className = styles.popupStatus;
  status.textContent =
    meeting.status === "RECRUITING" ? "모집중" : "일정 확인";

  const title = document.createElement("strong");
  title.textContent = meeting.title || "모임 상세";

  const schedule = document.createElement("p");
  schedule.textContent = [
    meeting.meetingDate,
    String(meeting.startTime || "").slice(0, 5),
  ]
    .filter(Boolean)
    .join(" ");

  const place = document.createElement("small");
  place.textContent =
    meeting.placeName || meeting.address || meeting.regionName || "";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "상세 보기";
  button.addEventListener("click", () =>
    onSelectMeeting?.(meeting.meetingId),
  );

  head.append(sport, status);
  popup.append(head, title, schedule, place, button);
  return popup;
};

export default function MeetingMap({ meetings, onSelectMeeting }) {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const clustererRef = useRef(null);
  const infoOverlayRef = useRef(null);
  const [mapStatus, setMapStatus] = useState(
    KAKAO_MAP_APP_KEY ? "loading" : "missing-key",
  );
  const [mappedCount, setMappedCount] = useState(0);

  useEffect(() => {
    let active = true;

    loadKakaoMap()
      .then((kakao) => {
        if (!active || !mapElementRef.current) {
          return;
        }

        mapRef.current = new kakao.maps.Map(mapElementRef.current, {
          center: new kakao.maps.LatLng(
            SEOUL_CENTER.latitude,
            SEOUL_CENTER.longitude,
          ),
          level: 8,
        });
        clustererRef.current = new kakao.maps.MarkerClusterer({
          map: mapRef.current,
          averageCenter: true,
          minLevel: 6,
          disableClickZoom: false,
          styles: [
            {
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb, #60a5fa)",
              color: "#fff",
              textAlign: "center",
              lineHeight: "42px",
              fontSize: "13px",
              fontWeight: "900",
              boxShadow: "0 8px 20px rgba(37, 99, 235, .3)",
            },
          ],
        });
        setMapStatus("ready");
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        setMapStatus(
          error.message === "KAKAO_MAP_APP_KEY_MISSING"
            ? "missing-key"
            : "error",
        );
      });

    return () => {
      active = false;
      infoOverlayRef.current?.setMap(null);
      clustererRef.current?.clear();
      mapRef.current = null;
      clustererRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapStatus !== "ready" || !mapRef.current || !clustererRef.current) {
      return undefined;
    }

    let active = true;
    const eventListeners = [];
    const kakao = window.kakao;
    const geocoder = new kakao.maps.services.Geocoder();

    const renderMarkers = async () => {
      clustererRef.current.clear();
      infoOverlayRef.current?.setMap(null);
      setMappedCount(0);

      const positionedMeetings = [];
      let nextMeetingIndex = 0;
      const geocodeWorker = async () => {
        while (nextMeetingIndex < meetings.length) {
          const meetingIndex = nextMeetingIndex;
          nextMeetingIndex += 1;
          const meeting = meetings[meetingIndex];
          const coordinate = await getCoordinate(meeting, geocoder);

          if (coordinate) {
            positionedMeetings.push({
              meeting,
              coordinate,
              meetingIndex,
            });
          }
        }
      };

      await Promise.all(
        Array.from(
          { length: Math.min(GEOCODING_CONCURRENCY, meetings.length) },
          geocodeWorker,
        ),
      );
      positionedMeetings.sort(
        (left, right) => left.meetingIndex - right.meetingIndex,
      );

      if (!active || !mapRef.current || !clustererRef.current) {
        return;
      }

      const bounds = new kakao.maps.LatLngBounds();
      const markers = positionedMeetings.map(({ meeting, coordinate }) => {
        const position = new kakao.maps.LatLng(
          coordinate.latitude,
          coordinate.longitude,
        );
        const marker = new kakao.maps.Marker({
          position,
          image: createMarkerImage(kakao, meeting),
          title: meeting.title,
        });
        const clickHandler = () => {
          infoOverlayRef.current?.setMap(null);
          infoOverlayRef.current = new kakao.maps.CustomOverlay({
            map: mapRef.current,
            position,
            content: createPopup(meeting, onSelectMeeting),
            xAnchor: 0.5,
            yAnchor: 1.35,
            zIndex: 10,
          });
          mapRef.current.panTo(position);
        };

        kakao.maps.event.addListener(marker, "click", clickHandler);
        eventListeners.push({ marker, clickHandler });
        bounds.extend(position);
        return marker;
      });

      clustererRef.current.addMarkers(markers);
      setMappedCount(markers.length);

      if (markers.length === 1) {
        mapRef.current.setCenter(markers[0].getPosition());
        mapRef.current.setLevel(5);
      } else if (markers.length > 1) {
        mapRef.current.setBounds(bounds, 56, 56, 56, 56);
      }
    };

    renderMarkers();

    return () => {
      active = false;
      eventListeners.forEach(({ marker, clickHandler }) => {
        kakao.maps.event.removeListener(marker, "click", clickHandler);
      });
    };
  }, [mapStatus, meetings, onSelectMeeting]);

  return (
    <section className={styles.mapCard}>
      <div className={styles.mapHead}>
        <div>
          <span className={styles.eyebrow}>MEETING MAP</span>
          <h2>지도에서 가까운 모임을 찾아보세요</h2>
          <p>마커를 누르면 장소와 일정을 확인하고 상세 페이지로 이동할 수 있습니다.</p>
        </div>
        <span className={styles.mapCount}>
          <UiIcon name="location" className={styles.mapCountIcon} />
          {mappedCount}/{meetings.length}개 표시
        </span>
      </div>

      <div className={styles.mapViewport}>
        <div ref={mapElementRef} className={styles.mapCanvas} />

        {mapStatus === "loading" ? (
          <div className={styles.mapState}>
            <span className={styles.spinner} />
            <strong>지도를 불러오는 중입니다</strong>
          </div>
        ) : null}

        {mapStatus === "missing-key" ? (
          <div className={styles.mapState}>
            <UiIcon name="location" className={styles.stateIcon} />
            <strong>카카오 지도 키 설정이 필요합니다</strong>
            <p>Vercel에 VITE_KAKAO_MAP_APP_KEY를 등록하면 실제 지도가 표시됩니다.</p>
          </div>
        ) : null}

        {mapStatus === "error" ? (
          <div className={styles.mapState}>
            <UiIcon name="location" className={styles.stateIcon} />
            <strong>지도를 불러오지 못했습니다</strong>
            <p>카카오 개발자 콘솔의 JavaScript 키와 웹 도메인을 확인해주세요.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
