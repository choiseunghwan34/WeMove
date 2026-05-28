import { useEffect, useMemo, useRef, useState } from "react";
import { createChatMessage, getChatMessages, getChatRooms } from "../api/chatApi";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { getAccessToken } from "../utils/authTokenStore";
import styles from "../styles/GlobalMeetingChat.module.css";

const formatTime = (value) =>
  value ? String(value).replace("T", " ").slice(0, 16) : "";

const formatSchedule = (meetingDate, startTime) =>
  [meetingDate, startTime ? String(startTime).slice(0, 5) : ""]
    .filter(Boolean)
    .join(" ");

const PANEL_DEFAULT_WIDTH = 860;
const PANEL_DEFAULT_HEIGHT = 560;
const PANEL_MIN_WIDTH = 520;
const PANEL_MIN_HEIGHT = 360;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function GlobalMeetingChat() {
  const { user, isAuthenticated, loading } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [panelSize, setPanelSize] = useState(null);
  const [roomsCollapsed, setRoomsCollapsed] = useState(false);
  const panelRef = useRef(null);
  const listRef = useRef(null);
  const socketMapRef = useRef(new Map());
  const activeMeetingIdRef = useRef(null);
  const openRef = useRef(false);
  const latestMessageIdsRef = useRef(new Set());

  const selectedRoom = useMemo(
    () => rooms.find((room) => Number(room.meetingId) === Number(selectedMeetingId)) ?? null,
    [rooms, selectedMeetingId],
  );

  const appendMessage = (message, options = {}) => {
    if (!message?.messageId) {
      return;
    }

    const messageId = Number(message.messageId);
    if (latestMessageIdsRef.current.has(messageId)) {
      return;
    }

    latestMessageIdsRef.current.add(messageId);

    if (Number(message.meetingId) === Number(activeMeetingIdRef.current)) {
      setMessages((current) => [...current, message]);
    }

    setRooms((current) =>
      current.map((room) =>
        Number(room.meetingId) === Number(message.meetingId)
          ? {
              ...room,
              lastMessageId: message.messageId,
              lastMessage: message.content,
              lastMessageAt: message.createdAt,
            }
          : room,
      ),
    );

    const isMine = Number(message.userId) === Number(user?.memberId);
    const shouldNotify =
      !isMine &&
      options.notify !== false &&
      (!openRef.current ||
        Number(activeMeetingIdRef.current) !== Number(message.meetingId));

    if (shouldNotify) {
      const roomTitle =
        rooms.find((room) => Number(room.meetingId) === Number(message.meetingId))
          ?.title || "무브톡";
      toast.info(roomTitle, `${message.nickname || "참가자"}: ${message.content}`);
    }
  };

  const loadRooms = async () => {
    if (!isAuthenticated) {
      setRooms([]);
      setSelectedMeetingId(null);
      return;
    }

    setLoadingRooms(true);
    setError("");

    try {
      const { data } = await getChatRooms();
      const nextRooms = Array.isArray(data) ? data : [];
      setRooms(nextRooms);
      setSelectedMeetingId((current) =>
        nextRooms.some((room) => Number(room.meetingId) === Number(current))
          ? current
          : null,
      );
    } catch (requestError) {
      setRooms([]);
      setSelectedMeetingId(null);
      setError(requestError?.response?.data?.message || "무브톡 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (loading) {
      return;
    }

    loadRooms();
  }, [isAuthenticated, loading, user?.memberId]);

  useEffect(() => {
    activeMeetingIdRef.current = selectedMeetingId;
  }, [selectedMeetingId]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!selectedMeetingId || !open) {
      setMessages([]);
      return;
    }

    let active = true;
    setLoadingMessages(true);
    setError("");
    latestMessageIdsRef.current.clear();

    getChatMessages(selectedMeetingId)
      .then(({ data }) => {
        if (!active) {
          return;
        }

        const nextMessages = Array.isArray(data) ? data : [];
        nextMessages.forEach((message) => {
          if (message?.messageId) {
            latestMessageIdsRef.current.add(Number(message.messageId));
          }
        });
        setMessages(nextMessages);
      })
      .catch((requestError) => {
        if (active) {
          setMessages([]);
          setError(requestError?.response?.data?.message || "메시지를 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (active) {
          setLoadingMessages(false);
        }
      });

    return () => {
      active = false;
    };
  }, [open, selectedMeetingId]);

  useEffect(() => {
    if (!isAuthenticated || !rooms.length) {
      socketMapRef.current.forEach((socket) => socket.close());
      socketMapRef.current.clear();
      return undefined;
    }

    const token = getAccessToken();
    if (!token) {
      return undefined;
    }

    rooms.forEach((room) => {
      const meetingId = Number(room.meetingId);
      if (!meetingId || socketMapRef.current.has(meetingId)) {
        return;
      }

      const socket = new WebSocket(
        `ws://localhost:8456/ws/meeting-chat?meetingId=${encodeURIComponent(
          meetingId,
        )}&token=${encodeURIComponent(token)}`,
      );

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "CHAT_MESSAGE_CREATED") {
            appendMessage(payload.message);
          }
        } catch {
          // 채팅 메시지가 아니면 무시합니다.
        }
      };

      socket.onclose = () => {
        socketMapRef.current.delete(meetingId);
      };

      socketMapRef.current.set(meetingId, socket);
    });

    return undefined;
  }, [isAuthenticated, rooms, user?.memberId]);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const closeOnOutsidePointerDown = (event) => {
      if (panelRef.current?.contains(event.target)) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointerDown);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointerDown);
    };
  }, [open]);

  if (loading || !isAuthenticated) {
    return null;
  }

  const submitMessage = async (event) => {
    event.preventDefault();

    const content = messageInput.trim();
    if (!selectedMeetingId || !content || sending) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const { data } = await createChatMessage(selectedMeetingId, content);
      appendMessage(data, { notify: false });
      setMessageInput("");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "메시지 전송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  };

  const startPanelResize = (event, direction) => {
    event.preventDefault();

    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = rect.width;
    const startHeight = rect.height;

    const resizePanel = (moveEvent) => {
      const maxWidth = Math.min(PANEL_DEFAULT_WIDTH, window.innerWidth - 32);
      const maxHeight = Math.min(PANEL_DEFAULT_HEIGHT, window.innerHeight - 48);

      setPanelSize({
        width: direction.includes("left")
          ? clamp(startWidth + startX - moveEvent.clientX, PANEL_MIN_WIDTH, maxWidth)
          : startWidth,
        height: direction.includes("top")
          ? clamp(startHeight + startY - moveEvent.clientY, PANEL_MIN_HEIGHT, maxHeight)
          : startHeight,
      });
    };

    const stopResize = () => {
      window.removeEventListener("pointermove", resizePanel);
      window.removeEventListener("pointerup", stopResize);
    };

    window.addEventListener("pointermove", resizePanel);
    window.addEventListener("pointerup", stopResize);
  };

  return (
    <>
      {!open ? (
        <button
          type="button"
          className={styles.floatingButton}
          aria-label="무브톡 열기"
          onClick={() => {
            setOpen(true);
            loadRooms();
          }}
        >
          <span aria-hidden="true" className={styles.floatingIcon}>
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M5.5 5.7c1.5-1.4 3.7-2.2 6.5-2.2 5 0 8.5 2.9 8.5 7.1s-3.5 7.1-8.5 7.1c-.8 0-1.6-.1-2.3-.2l-4.1 2.7c-.5.3-1.1-.1-.9-.7l1.1-3.5c-1.5-1.3-2.3-3.2-2.3-5.4 0-1.9.7-3.6 2-4.9Z" />
            </svg>
          </span>
        </button>
      ) : null}

      {open ? (
        <section
          ref={panelRef}
          className={styles.panel}
          aria-label="무브톡"
          style={
            panelSize
              ? {
                  width: `${panelSize.width}px`,
                  height: `${panelSize.height}px`,
                }
              : undefined
          }
        >
          <button
            type="button"
            className={styles.resizeLeft}
            aria-label="무브톡 가로 크기 조절"
            onPointerDown={(event) => startPanelResize(event, "left")}
          />
          <button
            type="button"
            className={styles.resizeTop}
            aria-label="무브톡 세로 크기 조절"
            onPointerDown={(event) => startPanelResize(event, "top")}
          />
          <button
            type="button"
            className={styles.resizeTopLeft}
            aria-label="무브톡 크기 조절"
            onPointerDown={(event) => startPanelResize(event, "top-left")}
          />
          <header className={styles.panelHeader}>
            <div>
              <strong>무브톡</strong>
              <span>승인된 모임 대화방</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="무브톡 닫기">
              x
            </button>
          </header>

          <div
            className={
              roomsCollapsed
                ? `${styles.panelBody} ${styles.panelBodyCollapsed}`
                : styles.panelBody
            }
          >
            <aside className={styles.roomList}>
              {loadingRooms ? (
                <p>불러오는 중</p>
              ) : rooms.length ? (
                rooms.map((room) => (
                  <button
                    key={room.meetingId}
                    type="button"
                    className={
                      Number(room.meetingId) === Number(selectedMeetingId)
                        ? styles.roomActive
                        : styles.room
                    }
                    onClick={() => setSelectedMeetingId(room.meetingId)}
                  >
                    <strong>{room.title}</strong>
                    <span>
                      {[room.sportName, room.regionName, room.placeName]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    <small>
                      {room.lastMessage ||
                        formatSchedule(room.meetingDate, room.startTime) ||
                        room.address ||
                        "대화 내역 없음"}
                    </small>
                  </button>
                ))
              ) : (
                <p>참여 가능한 무브톡이 없습니다.</p>
              )}
            </aside>
            <button
              type="button"
              className={styles.roomToggle}
              aria-label={roomsCollapsed ? "모임방 모음 펼치기" : "모임방 모음 숨기기"}
              onClick={() => setRoomsCollapsed((current) => !current)}
            >
              {roomsCollapsed ? "›" : "‹"}
            </button>

            <main className={styles.chatArea}>
              <div className={styles.chatTitle}>
                <strong>{selectedRoom?.title || "무브톡을 선택해주세요"}</strong>
                {selectedRoom ? (
                  <span>
                    {[
                      selectedRoom.sportName,
                      selectedRoom.regionName,
                      selectedRoom.placeName,
                      formatSchedule(selectedRoom.meetingDate, selectedRoom.startTime),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                ) : (
                  <span>왼쪽 목록에서 대화할 모임을 선택해주세요.</span>
                )}
              </div>

              <div className={styles.messageList} ref={listRef}>
                {!selectedMeetingId ? (
                  <p className={styles.state}>무브톡 방을 선택하면 대화 내역을 볼 수 있습니다.</p>
                ) : loadingMessages ? (
                  <p className={styles.state}>메시지를 불러오는 중입니다.</p>
                ) : messages.length ? (
                  messages.map((message) => {
                    const isMine = Number(message.userId) === Number(user?.memberId);
                    return (
                      <article
                        key={message.messageId}
                        className={isMine ? styles.messageMine : styles.message}
                      >
                        <div>
                          <strong>{message.nickname || "알 수 없음"}</strong>
                          <span>{formatTime(message.createdAt)}</span>
                        </div>
                        <p>{message.content}</p>
                      </article>
                    );
                  })
                ) : (
                  <p className={styles.state}>아직 메시지가 없습니다.</p>
                )}
              </div>

              {error ? <p className={styles.error}>{error}</p> : null}

              <form className={styles.messageForm} onSubmit={submitMessage}>
                <input
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  placeholder="메시지 입력"
                  maxLength={1000}
                  disabled={!selectedMeetingId || sending}
                />
                <button type="submit" disabled={!selectedMeetingId || sending}>
                  전송
                </button>
              </form>
            </main>
          </div>
        </section>
      ) : null}
    </>
  );
}
