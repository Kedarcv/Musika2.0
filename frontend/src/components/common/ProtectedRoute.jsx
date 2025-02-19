import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, role }) => {
    console.log("ProtectedRoute rendered"); // Log when ProtectedRoute is rendered
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (role && user.role !== role) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'user':
        return <Navigate to="/" replace />;
      case 'restaurant':
        return <Navigate to="/restaurant" replace />;
      case 'rider':
        return <Navigate to="/rider" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.oneOf(['user', 'restaurant', 'rider', 'admin']),
};

export default ProtectedRoute;
