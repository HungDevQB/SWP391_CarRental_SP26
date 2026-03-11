import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@/store/AuthContext.jsx';
import LoadingSpinner from '@/components/ui/Loading/LoadingSpinner.jsx';
import { toast } from 'react-hot-toast';

export const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user, isLoading } = useContext(AuthContext);
    const location = useLocation();

    console.log('[ProtectedRoute] Current state:', {
        isAuthenticated,
        user,
        isLoading,
        requiredRole,
        currentPath: location.pathname
    });

    if (isLoading) {
        console.log('[ProtectedRoute] Still loading, showing spinner');
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        console.log('[ProtectedRoute] Not authenticated, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        console.log('[ProtectedRoute] User role does not match required role');
        toast.error('You do not have permission to access this page');
        return <Navigate to="/" replace />;
    }

    console.log('[ProtectedRoute] User authenticated and authorized, rendering children');
    return children;
};