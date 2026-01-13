import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");
  const base = localStorage.getItem("INSTANCE_BASE_URL");

  if (!base) {
    // No instance selected -> send to landing
    return <Navigate to="/" replace />;
  }

  if (!username || !password) {
    // Not logged in -> send to login
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
