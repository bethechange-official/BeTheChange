import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { adminAuth } from '../../services/admin/adminAuth';

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    let active = true;
    adminAuth.initializeAuth().then((admin) => {
      if (active) setAuthorized(Boolean(admin));
    });
    return () => { active = false; };
  }, []);

  if (authorized === null) {
    return <main className="min-h-screen flex items-center justify-center">Checking admin session…</main>;
  }

  if (!authorized) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
