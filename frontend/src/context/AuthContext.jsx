import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";

const TOKEN_KEY = "jobflow_token";
const USER_KEY = "jobflow_username";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [username, setUsername] = useState(
    () => localStorage.getItem(USER_KEY) || "",
  );

  const persist = (nextToken, nextUsername) => {
    setToken(nextToken);
    setUsername(nextUsername);
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      localStorage.setItem(USER_KEY, nextUsername);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  const login = async (credentials) => {
    const response = await api.post("/auth/login/", credentials);
    persist(response.data.token, response.data.username);
  };

  const register = async (credentials) => {
    const response = await api.post("/auth/register/", credentials);
    persist(response.data.token, response.data.username);
  };

  const logout = () => {
    persist("", "");
  };

  const value = useMemo(
    () => ({
      token,
      username,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, username],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
