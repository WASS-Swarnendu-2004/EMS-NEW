import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import logo from "@/assets/logo.jpeg.asset.json";

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

    const r = await login(email, password);

    if (r) {
        setErr(r);
    }
}

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src={logo.url} alt="WebApps" />
          <h1>WebApps EMS</h1>
          <p>Employee Management System</p>
        </div>
        <div className="role-tabs">
          <button type="button" className={kind === "admin" ? "active" : ""} onClick={() => setRole("admin")}>Admin / Employer</button>
          <button type="button" className={kind === "employee" ? "active" : ""} onClick={() => setRole("employee")}>Employee</button>
        </div>
        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {err && <div className="badge danger" style={{ display: "block", padding: ".5rem .75rem", marginBottom: ".75rem" }}>{err}</div>}
          <button className="btn w-full" type="submit">Sign in</button>
        </form>
        <div className="demo-creds">
          <strong>Demo credentials</strong><br />
          Admin: <code>admin@webapps.com</code> / <code>admin123</code><br />
          Employee: <code>alice@webapps.com</code> / <code>user</code> (also rahul@, priya@)
        </div>
      </div>
    </div>
  );
}
