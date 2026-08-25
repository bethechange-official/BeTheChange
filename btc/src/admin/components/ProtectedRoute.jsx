import { Navigate, useLocation } from 'react-router-dom';
import { adminAuth } from '../utils/adminAuth';

export function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!adminAuth.isAuthenticated()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
