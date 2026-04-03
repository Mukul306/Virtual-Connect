import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

/**
 * ProtectedRoute blocks unauthenticated access to internal pages 
 * and redirects users to landing or auth pages.
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-textMuted font-medium animate-pulse">Wait a moment...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Simple and robust: if NOT authenticated, go to landing/auth page
        // passing the current location so they can reach the same page after login
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
