import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

/**
 * PublicRoute prevents authenticated users from accessing public pages 
 * like Landing and Auth, automatically redirecting them to /home.
 */
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-textMuted font-medium animate-pulse">Checking session...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default PublicRoute;
