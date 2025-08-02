import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null; // or a loading spinner

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}