import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { logout as logoutApi, refreshSession } from "../api/authApi";
import {
  clearAccessToken,
  setAccessToken,
} from "../utils/authTokenStore";
import { parseUserFromAccessToken } from "../utils/jwtPayload";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const applyAccessToken = (nextAccessToken) => {
    const parsedUser = parseUserFromAccessToken(nextAccessToken);
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
      logout: async () => {
        try {
          await logoutApi();
        } finally {
          clearSession();
        }
      },
    }),
    [accessToken, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
