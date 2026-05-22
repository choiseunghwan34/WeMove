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

const AuthContext = createContext(null);
const DUPLICATE_LOGOUT_MESSAGE = "다른 곳에서 로그인 요청이 있어 로그아웃되었습니다.";

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [accessToken, setAccessTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forcedLogoutMessage, setForcedLogoutMessage] = useState("");
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
      } catch {
        if (active) {
          clearAccessToken();
          setAccessTokenState(null);
          setUser(null);
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

    const handleRevokedSession = (message = DUPLICATE_LOGOUT_MESSAGE) => {
      if (!active || revocationHandledRef.current) {
        return;
      }

      revocationHandledRef.current = true;
      clearAccessToken();
      setAccessTokenState(null);
      setUser(null);
      setForcedLogoutMessage(message);
    };

    const verifySession = async () => {
      try {
        await checkSessionStatus();
      } catch (error) {
        const code = error?.response?.data?.code;
        if (code === "DUPLICATE_LOGIN_LOGOUT") {
          handleRevokedSession(error?.response?.data?.message);
        }
      }
    };

    verifySession();

    const intervalId = window.setInterval(verifySession, 10000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        verifySession();
      }
    };

    window.addEventListener("focus", verifySession);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", verifySession);
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
    setForcedLogoutMessage("");
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
          setForcedLogoutMessage("");
        }
      },
    }),
    [accessToken, user, loading],
  );

  const closeForcedLogoutModal = () => {
    setForcedLogoutMessage("");
    revocationHandledRef.current = false;
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AppModal
        open={Boolean(forcedLogoutMessage)}
        title="로그아웃 안내"
        description={forcedLogoutMessage}
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
