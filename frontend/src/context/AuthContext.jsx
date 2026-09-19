import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);
const tokenKey = "fireguard_token";

const DEFAULT_OPERATOR = {
  id: "operator_local",
  name: "Incident Commander",
  email: "commander@fireguard.ai",
  role: "operator",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_OPERATOR);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    if (!token) {
      setUser(DEFAULT_OPERATOR);
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then(({ data }) => setUser(data.user || DEFAULT_OPERATOR))
      .catch(() => {
        localStorage.removeItem(tokenKey);
        setUser(DEFAULT_OPERATOR);
      })
      .finally(() => setLoading(false));
  }, []);

  async function authenticate(endpoint, credentials) {
    const { data } = await api.post(endpoint, credentials);
    localStorage.setItem(tokenKey, data.token);
    setUser(data.user);
  }

  async function login(credentials) {
    return authenticate("/auth/login", credentials);
  }

  async function register(credentials) {
    return authenticate("/auth/register", credentials);
  }

  function logout() {
    localStorage.removeItem(tokenKey);
    setUser(DEFAULT_OPERATOR);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
