import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
// import { store } from "./store";
import { loginUser } from "@/api/auth";

export interface Session {
  id: string;
  name: string;
  email: string;
  kind: "admin" | "employee";
  token: string;
}

const KEY = "ems_session_v1";

// const ADMIN = { email: "admin@webapps.com", password: "admin", name: "Admin" };

interface Ctx {
  session: Session | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const login: Ctx["login"] = async (
    email,
    password
) => {
    try {
        const res = await loginUser({
            email,
            password,
        });

        const session: Session = {
            id: res.user.id,
            name: res.user.name,
            email: res.user.email,
            kind: res.user.role as "admin" | "employee",
            token: res.token,
        };


        localStorage.setItem(KEY, JSON.stringify(session));

        setSession(session);

        return null;
    } catch (error) {
        return "Invalid email or password";
    }
};
  //   const db = store.get();
  //   const emp = db.employees.find((e) => e.email.trim().toLowerCase() === email.trim().toLowerCase() && e.password === password);
  //   if (!emp) return "Invalid employee credentials";
  //   const s: Session = { kind: "employee", id: emp.id, name: emp.name, email: emp.email };
  //   localStorage.setItem(KEY, JSON.stringify(s));
  //   setSession(s);
  //   return null;
  // };

  const logout = () => {
    localStorage.removeItem(KEY);
    localStorage.removeItem("token");
    setSession(null);
};
  return <AuthCtx.Provider value={{ session, ready, login, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
