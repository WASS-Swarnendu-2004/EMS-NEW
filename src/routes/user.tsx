import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Shell, userNav } from "@/components/Layout";

export const Route = createFileRoute("/user")({ component: UserLayout });

function UserLayout() {
  const { session, ready } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!ready) return;
    if (!session) navigate({ to: "/login", replace: true });
    else if (session.kind !== "employee") navigate({ to: "/admin", replace: true });
  }, [session, ready, navigate]);

  if (!ready || !session || session.kind !== "employee") return null;
  return <Shell items={userNav} title="auto"><Outlet /></Shell>;
}
