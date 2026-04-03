import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { AuthContext } from "./AuthContext.js";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    /**
     * On mount — check if user has a valid session
     */
    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const { data } = await api.get("/api/auth/me");
            setUser(data.data.user);
            setIsAuthenticated(true);
        } catch {
            localStorage.removeItem("accessToken");
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    /**
     * Register a new user
     */
    const handleRegister = async (name, username, password) => {
        await api.post("/api/auth/register", {
            name,
            username,
            password,
        });
        // Auto-login after successful registration
        await handleLogin(username, password);
    };

    /**
     * Login — stores access token, sets user state
     */
    const handleLogin = async (username, password) => {
        const { data } = await api.post("/api/auth/login", {
            username,
            password,
        });

        localStorage.setItem("accessToken", data.data.accessToken);
        setUser(data.data.user);
        setIsAuthenticated(true);
        navigate("/home");
    };

    /**
     * Logout — clears everything
     */
    const handleLogout = async () => {
        try {
            await api.post("/api/auth/logout");
        } catch {
            // Even if API call fails, clear local state
        } finally {
            localStorage.removeItem("accessToken");
            setUser(null);
            setIsAuthenticated(false);
            navigate("/auth");
        }
    };

    /**
     * Get meeting history
     */
    const getHistoryOfUser = async () => {
        const { data } = await api.get("/api/meeting/my-meetings");
        return data.data;
    };

    /**
     * Add to meeting history (legacy, disabled for new architecture)
     */
    const addToUserHistory = async (_meetingCode) => {
        return { success: true };
    };

    /**
     * Delete meeting from history
     */
    const deleteFromHistory = async (id) => {
        const { data } = await api.delete(`/api/meeting/${id}`);
        return data;
    };

    /**
     * Generate a new meeting (authenticated only)
     */
    const generateMeeting = async () => {
        const { data } = await api.post("/api/meeting/generate");
        return data.data.meetingCode;
    };

    /**
     * Validate a meeting code exists on backend
     */
    const joinMeeting = async (meetingCode) => {
        const { data } = await api.post("/api/meeting/join", { meetingCode });
        return data.data;
    };

    const contextValue = {
        user,
        isAuthenticated,
        loading,
        handleRegister,
        handleLogin,
        handleLogout,
        getHistoryOfUser,
        addToUserHistory,
        deleteFromHistory,
        generateMeeting,
        joinMeeting,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};