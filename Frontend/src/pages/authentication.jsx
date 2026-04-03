import React, { useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext.js";
import { Eye, EyeOff, Video, Mail, Lock, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Calculate password strength: 0=none, 1=weak, 2=medium, 3=strong
 */
function getPasswordStrength(password) {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++;
    return score;
}

const strengthLabels = ["", "Weak", "Medium", "Strong"];
const strengthColors = ["bg-accent", "bg-red-500", "bg-yellow-500", "bg-success"];

export default function Authentication() {
    const [searchParams] = useSearchParams();
    const [formState, setFormState] = useState(
        searchParams.get("mode") === "register" ? 1 : 0
    );
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const { handleRegister, handleLogin } = useContext(AuthContext);

    const strength = getPasswordStrength(password);

    const validateForm = () => {
        const errors = {};

        if (formState === 1 && !name.trim()) {
            errors.name = "Full name is required.";
        }

        if (!username.trim()) {
            errors.username = "Username is required.";
        } else if (formState === 1 && username.length < 3) {
            errors.username = "Username must be at least 3 characters.";
        }

        if (!password) {
            errors.password = "Password is required.";
        } else if (formState === 1 && password.length < 8) {
            errors.password = "Password must be at least 8 characters.";
        }

        if (formState === 1 && password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateForm()) return;

        setLoading(true);

        try {
            if (formState === 0) {
                await handleLogin(username, password);
            } else {
                await handleRegister(name, username, password);
            }
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.errors?.[0]?.message ||
                "Something went wrong. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const switchTab = (tab) => {
        setFormState(tab);
        setError("");
        setSuccess("");
        setFieldErrors({});
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-background">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white border border-accent shadow-sm hover:shadow-md transition-shadow rounded-2xl p-8 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 shadow-sm">
                                <Video size={24} />
                            </div>
                            <h1 className="text-2xl font-bold text-textMain mb-2">
                                {formState === 0 ? "Welcome Back" : "Create Account"}
                            </h1>
                            <p className="text-textMuted text-sm">
                                {formState === 0 
                                    ? "Sign in to access your dashboard" 
                                    : "Join VI Connects for secure video meetings"}
                            </p>
                        </div>

                        {/* Tab Toggle */}
                        <div className="flex p-1 bg-accent/50 border border-accent rounded-lg mb-8">
                            <button
                                onClick={() => switchTab(0)}
                                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                                    formState === 0 ? "bg-white text-textMain shadow-sm" : "text-textMuted hover:text-textMain"
                                }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => switchTab(1)}
                                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                                    formState === 1 ? "bg-white text-textMain shadow-sm" : "text-textMuted hover:text-textMain"
                                }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.form 
                                key={formState}
                                initial={{ opacity: 0, x: formState === 0 ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: formState === 0 ? 20 : -20 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleSubmit} 
                                className="space-y-5"
                                noValidate
                            >
                                {/* Error/Success Messages */}
                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="p-3 bg-teal/10 border border-teal/20 rounded-lg text-teal text-sm text-center">
                                        {success}
                                    </div>
                                )}

                                {/* Full Name (register only) */}
                                {formState === 1 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-textMain mb-1.5">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <UserIcon size={18} className="text-textMuted" />
                                            </div>
                                            <input
                                                type="text"
                                                className={`w-full pl-10 pr-4 py-2.5 bg-white border ${fieldErrors.name ? 'border-red-500' : 'border-accent'} rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-textMain placeholder-textMuted outline-none transition-all shadow-sm`}
                                                placeholder="John Doe"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                        {fieldErrors.name && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.name}</p>}
                                    </div>
                                )}

                                {/* Username */}
                                <div>
                                    <label className="block text-sm font-semibold text-textMain mb-1.5">Username</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail size={18} className="text-textMuted" />
                                        </div>
                                        <input
                                            type="text"
                                            className={`w-full pl-10 pr-4 py-2.5 bg-white border ${fieldErrors.username ? 'border-red-500' : 'border-accent'} rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-textMain placeholder-textMuted outline-none transition-all shadow-sm`}
                                            placeholder="Enter your username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                    {fieldErrors.username && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.username}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-textMain mb-1.5">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-textMuted" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className={`w-full pl-10 pr-10 py-2.5 bg-white border ${fieldErrors.password ? 'border-red-500' : 'border-accent'} rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-textMain placeholder-textMuted outline-none transition-all shadow-sm`}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-textMuted hover:text-textMain"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {fieldErrors.password && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.password}</p>}
                                    
                                    {/* Password Strength */}
                                    {formState === 1 && password && (
                                        <div className="mt-3">
                                            <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-accent-lighter">
                                                {[1, 2, 3].map((level) => (
                                                    <div 
                                                        key={level} 
                                                        className={`flex-1 transition-colors duration-300 ${strength >= level ? strengthColors[strength] : 'bg-transparent'}`} 
                                                    />
                                                ))}
                                            </div>
                                            <p className={`text-xs mt-1 font-semibold ${strength >= 3 ? 'text-success' : strength >= 2 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                {strengthLabels[strength]}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password (register only) */}
                                {formState === 1 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-textMain mb-1.5">Confirm Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-textMuted" />
                                            </div>
                                            <input
                                                type={showConfirm ? "text" : "password"}
                                                className={`w-full pl-10 pr-10 py-2.5 bg-white border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-accent'} rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-textMain placeholder-textMuted outline-none transition-all shadow-sm`}
                                                placeholder="Re-enter your password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-textMuted hover:text-textMain"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                            >
                                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.confirmPassword}</p>}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-6"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        formState === 0 ? "Sign In" : "Create Account"
                                    )}
                                </button>
                            </motion.form>
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}