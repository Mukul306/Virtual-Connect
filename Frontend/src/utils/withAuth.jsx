import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext.js";

/**
 * HOC to protect routes — redirects to /auth if not authenticated.
 * Waits for AuthContext loading to complete before checking.
 */
const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const navigate = useNavigate();
        const { isAuthenticated, loading } = useContext(AuthContext);

        useEffect(() => {
            if (!loading && !isAuthenticated) {
                navigate("/auth");
            }
        }, [loading, isAuthenticated, navigate]);

        // Show nothing while checking auth
        if (loading) {
            return (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    color: "#888",
                    fontSize: "1rem",
                }}>
                    Loading...
                </div>
            );
        }

        if (!isAuthenticated) return null;

        return <WrappedComponent {...props} />;
    };

    AuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

    return AuthComponent;
};

export default withAuth;