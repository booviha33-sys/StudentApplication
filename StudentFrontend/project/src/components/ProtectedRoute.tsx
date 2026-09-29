import { Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { studentName } = useAuth();
  if (!studentName) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
