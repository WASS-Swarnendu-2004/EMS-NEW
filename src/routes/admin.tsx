import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Shell, adminNav } from "@/components/Layout";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const { session, ready } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!ready) return;
    if (!session) navigate({ to: "/login", replace: true });
    else if (session.kind !== "admin") navigate({ to: "/user", replace: true });
  }, [session, ready, navigate]);

  if (!ready || !session || session.kind !== "admin") return null;
  return <Shell items={adminNav} title="auto"><Outlet /></Shell>;
}
