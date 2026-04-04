import { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext.js";
import { useNavigate } from "react-router-dom";

const withAuth = (Component) => {
    return function AuthenticatedComponent(props) {
        const { isAuthenticated, loading } = useContext(AuthContext);
        const navigate = useNavigate();

        useEffect(() => {
            if (!loading && !isAuthenticated) {
                navigate("/auth");
            }
        }, [isAuthenticated, loading, navigate]);

        if (loading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            );
        }

        return isAuthenticated ? <Component {...props} /> : null;
    };
};

export default withAuth;
