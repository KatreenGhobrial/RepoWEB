import { Navigate } from 'react-router-dom';

// Guards a route: redirects to login if not authenticated, or to dashboard if the user's role is not allowed
export default function ProtectedRoute({ children, allowedRoles }) {
  // Check if a user session exists in localStorage
  const currentUserStr = localStorage.getItem('currentUser');

  // No session found – send the user to the login page
  if (!currentUserStr) {
    return <Navigate to="/login" replace />;
  }

  let currentUser = null;
  try {
    currentUser = JSON.parse(currentUserStr);
  } catch (e) {
    // Corrupted data in localStorage – force re-login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // If user role is not in the allowed list, redirect to a safe page like dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
