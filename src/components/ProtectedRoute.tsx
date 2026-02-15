import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

/**
 * A wrapper component that restricts access to authenticated users only.
 * Redirects to the login page or landing page if the user is not authenticated or no instance is selected.
 *
 * @param {Object} props - The component props.
 * @param {ReactNode} props.children - The child components to render if authorized.
 * @returns {JSX.Element} The children or a Navigate component.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("AUTH_TOKEN") || localStorage.getItem("access_token");
  const base = localStorage.getItem("INSTANCE_BASE_URL");

  if (!base) {
    // No instance selected -> send to landing
    return <Navigate to="/" replace />;
  }

  if (!username || !token) {
    // Not logged in -> send to login
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}
