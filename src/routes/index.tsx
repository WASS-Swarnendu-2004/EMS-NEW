import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const { session } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!session) navigate({ to: "/login", replace: true });
    else if (session.kind === "admin") navigate({ to: "/admin", replace: true });
    else navigate({ to: "/user", replace: true });
  }, [session, navigate]);
  return <div style={{ padding: 40, textAlign: "center" }}>Loading…</div>;
}
