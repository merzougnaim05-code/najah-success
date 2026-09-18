import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { api } from "../api";

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [meta, setMeta] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [toast, setToast] = useState(null);
  const toasting = useRef(null);

  useEffect(() => {
    api.get("/api/auth/me").then(setUser).catch(() => setUser(null));
    api.get("/api/meta").then(setMeta).catch(() => {});
    api.get("/api/catalog").then(setCatalog).catch(() => {});
  }, []);

  const notify = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    clearTimeout(toasting.current);
    toasting.current = setTimeout(() => setToast(null), 2400);
  }, []);

  const login = useCallback(async (username, password) => {
    const u = await api.post("/api/auth/login", { username, password });
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await api.post("/api/auth/logout").catch(() => {});
    setUser(null);
    window.location.href = "/";
  }, []);

  const refreshCatalog = useCallback(async () => {
    setCatalog(await api.get("/api/catalog"));
  }, []);

  return (
    <AppCtx.Provider value={{ user, meta, catalog, toast, notify, login, logout, refreshCatalog }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  return useContext(AppCtx);
}