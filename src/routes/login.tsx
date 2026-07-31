import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import logo from "@/assets/logo.jpeg.asset.json";
import logo1 from "@/assets/logo1.jpg"
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login | WebApps EMS" }] }),
  component: Login,
});

function Login() {
  const { login, session } = useAuth();
  const navigate = useNavigate();
  const [kind, setKind] = useState<"admin" | "employee">("admin");
  const [email, setEmail] = useState("admin@webapps.com");
  const [password, setPassword] = useState("admin123");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: session.kind === "admin" ? "/admin" : "/user", replace: true });
  }, [session, navigate]);

  function setRole(k: "admin" | "employee") {
    setKind(k);
    setErr(null);

    if (k === "admin") {
      setEmail("admin@webapps.com");
      setPassword("admin123");
    } else {
      setEmail("");
      setPassword("");
    }
  }

  // function submit(e: React.FormEvent) {
  //   e.preventDefault();
  //   const r = login(email, password, kind);
  //   if (r) setErr(r);
  // }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    setErr(null);
    setLoading(true);

    try {
      const r = await login(email, password);

      if (r) {
        setErr(r);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src={logo1} alt="WebApps" />
          <h1>WebApps EMS</h1>
          <p>Employee Management System</p>
        </div>
        <div className="role-tabs">
          <button
            type="button"
            className={kind === "admin" ? "active" : ""}
            onClick={() => setRole("admin")}
            disabled={loading}
          >
            Admin / Employer
          </button>
          <button
            type="button"
            className={kind === "employee" ? "active" : ""}
            onClick={() => setRole("employee")}
            disabled={loading}
          >
            Employee
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {err && (
            <div
              className="badge danger"
              style={{ display: "block", padding: ".5rem .75rem", marginBottom: ".75rem" }}
            >
              {err}
            </div>
          )}
          <button
            className="btn w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
