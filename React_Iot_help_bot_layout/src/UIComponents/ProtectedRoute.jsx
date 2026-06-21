import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const currentUserStr = localStorage.getItem('currentUser');

  if (!currentUserStr) {
    return <Navigate to="/login" replace />;
  }

  const currentUser = JSON.parse(currentUserStr);

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // If user role is not in the allowed list, redirect to a safe page like dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
