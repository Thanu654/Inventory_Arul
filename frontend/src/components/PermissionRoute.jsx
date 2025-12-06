import { Navigate } from 'react-router-dom';

export const PermissionRoute = ({ page, children }) => {
  const role = localStorage.getItem('role');
  const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');

  if (role === 'admin') return children;

  if (role === 'staff' && permissions.includes(page)) return children;

  // Redirect unauthorized staff to dashboard
  return <Navigate to="/dashboard" replace />;
};
