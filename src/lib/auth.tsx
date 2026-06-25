import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { store } from "./store";

export interface Session {
  kind: "admin" | "employee";
  id: string;
  name: string;
  email: string;
}

const KEY = "ems_session_v1";

const ADMIN = { email: "admin@webapps.com", password: "admin", name: "Admin" };

interface Ctx {
  session: Session | null;
  login: (email: string, password: string, kind: "admin" | "employee") => string | null;
  logout: () => void;
}

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch {}
  }, []);

  const login: Ctx["login"] = (email, password, kind) => {
    if (kind === "admin") {
      if (email.trim().toLowerCase() === ADMIN.email && password === ADMIN.password) {
        const s: Session = { kind: "admin", id: "admin", name: ADMIN.name, email: ADMIN.email };
        localStorage.setItem(KEY, JSON.stringify(s));
        setSession(s);
        return null;
      }
      return "Invalid admin credentials";
    }
    const db = store.get();
    const emp = db.employees.find((e) => e.email.trim().toLowerCase() === email.trim().toLowerCase() && e.password === password);
    if (!emp) return "Invalid employee credentials";
    const s: Session = { kind: "employee", id: emp.id, name: emp.name, email: emp.email };
    localStorage.setItem(KEY, JSON.stringify(s));
    setSession(s);
    return null;
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setSession(null);
  };

  return <AuthCtx.Provider value={{ session, login, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
