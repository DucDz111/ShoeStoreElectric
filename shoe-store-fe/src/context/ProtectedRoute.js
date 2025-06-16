import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute - User:', user, 'Loading:', loading, 'IsAuthenticated:', isAuthenticated);
    if (!loading && (!user || !allowedRoles.includes(user?.role))) {
      toast.error('Bạn không có quyền truy cập trang này!', { position: 'top-right', autoClose: 3000 });
    }
  }, [user, loading, allowedRoles, isAuthenticated]);

  if (loading) {
    return <div className="text-center mt-10">Đang kiểm tra quyền truy cập...</div>;
  }

  console.log('ProtectedRoute decision - User role:', user?.role, 'Allowed roles:', allowedRoles);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;