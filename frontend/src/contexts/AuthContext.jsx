import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppModal from "../components/AppModal";
import {
  checkSessionStatus,
  logout as logoutApi,
  refreshSession,
} from "../api/authApi";
import { getMe } from "../api/memberApi";
import { clearAccessToken, setAccessToken } from "../utils/authTokenStore";
import { parseUserFromAccessToken } from "../utils/jwtPayload";
import { WEMOVE_ACCOUNT_SUSPEND_EVENT } from "../utils/notificationEvents";

const AuthContext =
  globalThis.__WEMOVE_AUTH_CONTEXT__ ??
  (globalThis.__WEMOVE_AUTH_CONTEXT__ = createContext(null));

const DUPLICATE_LOGOUT_MESSAGE =
  "다른 곳에서 로그인 요청이 있어 로그아웃되었습니다.";
const SESSION_EXPIRED_MESSAGE =
  "로그인 시간이 만료되어 로그아웃되었습니다. 다시 로그인해주세요.";

const DEFAULT_FORCED_LOGOUT_MODAL = {
  title: "로그아웃 안내",
  message: "",
};

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [accessToken, setAccessTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forcedLogoutModal, setForcedLogoutModal] = useState(
    DEFAULT_FORCED_LOGOUT_MODAL,
  );
  const revocationHandledRef = useRef(false);

  useEffect(() => {
    let active = true;

    const bootstrapSession = async () => {
      try {
        const { data } = await refreshSession();
        const refreshedAccessToken = data?.accessToken ?? null;
        const parsedUser = parseUserFromAccessToken(refreshedAccessToken);

        if (active) {
          setAccessToken(refreshedAccessToken);
          setAccessTokenState(refreshedAccessToken);
          setUser(parsedUser);
        }
      } catch (error) {
        if (active) {
          clearAccessToken();
          setAccessTokenState(null);
          setUser(null);

          if (error?.response?.status === 423) {
            setForcedLogoutModal({
              title: "계정 정지 안내",
              message:
                error?.response?.data?.message ||
                "정지된 계정입니다. 관리자에게 문의해주세요.",
            });
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    bootstrapSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!accessToken || !user) {
      revocationHandledRef.current = false;
      return undefined;
    }

    let active = true;

    const handleRevokedSession = (
      message,
      title = DEFAULT_FORCED_LOGOUT_MODAL.title,
    ) => {
      if (!active || revocationHandledRef.current) {
        return;
      }

      revocationHandledRef.current = true;
      clearAccessToken();
      setAccessTokenState(null);
      setUser(null);
      setForcedLogoutModal({ title, message });
    };

    const verifySession = async () => {
      try {
        await checkSessionStatus();
      } catch (error) {
        const code = error?.response?.data?.code;

        if (code === "DUPLICATE_LOGIN_LOGOUT") {
          handleRevokedSession(
            error?.response?.data?.message || DUPLICATE_LOGOUT_MESSAGE,
          );
          return;
        }

        if (code === "SESSION_EXPIRED" || error?.response?.status === 401) {
          handleRevokedSession(
            error?.response?.data?.message || SESSION_EXPIRED_MESSAGE,
          );
          return;
        }

        if (error?.response?.status === 423) {
          handleRevokedSession(
            error?.response?.data?.message ||
              "정지된 계정입니다. 관리자에게 문의해주세요.",
            "계정 정지 안내",
          );
        }
      }
    };

    const handleAccountSuspend = async (event) => {
      try {
        await logoutApi();
      } catch {
        // Session may already be invalidated by the server.
      }

      handleRevokedSession(
        event?.detail?.message ||
          "계정이 정지되어 로그아웃됩니다. 관리자에게 문의해주세요.",
        event?.detail?.title || "계정 정지 안내",
      );
    };

    verifySession();

    const intervalId = window.setInterval(verifySession, 10000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        verifySession();
      }
    };

    window.addEventListener("focus", verifySession);
    window.addEventListener(WEMOVE_ACCOUNT_SUSPEND_EVENT, handleAccountSuspend);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", verifySession);
      window.removeEventListener(
        WEMOVE_ACCOUNT_SUSPEND_EVENT,
        handleAccountSuspend,
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [accessToken, user]);

  useEffect(() => {
    if (!accessToken || !user?.memberId) {
      return undefined;
    }

    let active = true;

    const hydrateUserProfile = async () => {
      try {
        const { data } = await getMe(user.memberId);

        if (!active || !data) {
          return;
        }

        setUser((current) =>
          current
            ? {
                ...current,
                nickname: data.nickname ?? current.nickname,
                profileImage: data.profileImage ?? current.profileImage ?? "",
                phone: data.phone ?? current.phone ?? "",
                email: data.email ?? current.email ?? "",
                regionId: data.regionId ?? current.regionId ?? null,
              }
            : current,
        );
      } catch {
        // Keep the token-derived user as-is when profile hydration fails.
      }
    };

    hydrateUserProfile();

    return () => {
      active = false;
    };
  }, [accessToken, user?.memberId]);

  const applyAccessToken = (nextAccessToken) => {
    const parsedUser = parseUserFromAccessToken(nextAccessToken);
    revocationHandledRef.current = false;
    setForcedLogoutModal(DEFAULT_FORCED_LOGOUT_MODAL);
    setAccessToken(nextAccessToken);
    setAccessTokenState(nextAccessToken);
    setUser(parsedUser);
  };

  const clearSession = () => {
    clearAccessToken();
    setAccessTokenState(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      accessToken,
      user,
      loading,
      isAuthenticated: Boolean(accessToken && user),
      setAuthenticatedAccessToken: applyAccessToken,
      updateUserProfile: (profilePatch) => {
        setUser((current) =>
          current
            ? {
                ...current,
                ...profilePatch,
              }
            : current,
        );
      },
      logout: async () => {
        try {
          await logoutApi();
        } finally {
          clearSession();
          revocationHandledRef.current = false;
          setForcedLogoutModal(DEFAULT_FORCED_LOGOUT_MODAL);
        }
      },
    }),
    [accessToken, user, loading],
  );

  const closeForcedLogoutModal = () => {
    setForcedLogoutModal(DEFAULT_FORCED_LOGOUT_MODAL);
    revocationHandledRef.current = false;
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AppModal
        open={Boolean(forcedLogoutModal.message)}
        title={forcedLogoutModal.title}
        description={forcedLogoutModal.message}
        confirmText="확인"
        onConfirm={closeForcedLogoutModal}
        onClose={closeForcedLogoutModal}
        hideCancel
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
