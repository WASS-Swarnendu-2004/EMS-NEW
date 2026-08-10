import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import logo from "@/assets/logo.jpeg.asset.json";
import logo1 from "@/assets/logo1.jpg";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

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
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: session.kind === "admin" ? "/admin" : "/user", replace: true });
  }, [session, navigate]);

  useEffect(() => {
  const preventCopyPaste = (e: ClipboardEvent) => {
    e.preventDefault();
  };

  const preventContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  document.addEventListener("copy", preventCopyPaste);
  document.addEventListener("cut", preventCopyPaste);
  document.addEventListener("paste", preventCopyPaste);
  document.addEventListener("contextmenu", preventContextMenu);

  return () => {
    document.removeEventListener("copy", preventCopyPaste);
    document.removeEventListener("cut", preventCopyPaste);
    document.removeEventListener("paste", preventCopyPaste);
    document.removeEventListener("contextmenu", preventContextMenu);
  };
}, []);

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    setErr(null);
    setLoading(true);

    try {
      const r = await login(email, password);

      if (r) {
        setErr(r);
        toast.error(r);
      } else {
        toast.success("Login successful");
      }
    } catch (err: any) {
      console.error(err);

      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src={logo1} alt="WebApps" />
          <h1>Webapps EMS</h1>
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

            <div style={{ position: "relative" }}>
              <input
                className="input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={{ paddingRight: "2.8rem" }}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
