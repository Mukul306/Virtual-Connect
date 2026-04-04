import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { motion } from "framer-motion";
import { User, Link as LinkIcon, Users } from "lucide-react";

/**
 * Guest Join Page — allows unauthenticated users to join a meeting
 * by entering a display name and meeting code.
 */
export default function GuestJoin() {
    const [guestName, setGuestName] = useState("");
    const [meetingCode, setMeetingCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleJoin = async (e) => {
        e.preventDefault();
        setError("");

        if (!guestName.trim()) {
            setError("Please enter your name.");
            return;
        }
        if (!meetingCode.trim()) {
            setError("Please enter a meeting code.");
            return;
        }

        setLoading(true);
        try {
            // Validate meeting exists on backend
            await api.post("/api/meeting/join", {
                meetingCode: meetingCode.trim(),
            });

            // Redirect to meeting room with guest name
            navigate(
                `/meeting/${meetingCode.trim()}?guest=${encodeURIComponent(guestName.trim())}`
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Meeting not found. Please check the code."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-background">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <div className="bg-white border border-accent shadow-sm hover:shadow-md transition-shadow rounded-2xl p-8 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 shadow-sm">
                                <Users size={24} />
                            </div>
                            <h1 className="text-2xl font-bold text-textMain mb-2">Join as Guest</h1>
                            <p className="text-textMuted text-sm">
                                Enter your name and the meeting code to join instantly without an account.
                            </p>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleJoin} className="space-y-5" noValidate>
                            {/* Guest Name */}
                            <div>
                                <label className="block text-sm font-semibold text-textMain mb-1.5" htmlFor="guestName">Your Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={18} className="text-textMuted" />
                                    </div>
                                    <input
                                        id="guestName"
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-accent rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-textMain placeholder-textMuted outline-none transition-all shadow-sm"
                                        placeholder="Enter your name"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        autoComplete="name"
                                    />
                                </div>
                            </div>

                            {/* Meeting Code */}
                            <div>
                                <label className="block text-sm font-semibold text-textMain mb-1.5" htmlFor="guestCode">Meeting Code</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LinkIcon size={18} className="text-textMuted" />
                                    </div>
                                    <input
                                        id="guestCode"
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-accent rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-textMain placeholder-textMuted outline-none transition-all shadow-sm font-mono tracking-wider"
                                        placeholder="e.g. abc-defg-hij"
                                        value={meetingCode}
                                        onChange={(e) => setMeetingCode(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-8"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Validating...
                                    </>
                                ) : (
                                    "Join Meeting"
                                )}
                            </button>
                        </form>

                        <p className="text-center mt-6 text-sm text-textMuted">
                            Have an account?{" "}
                            <button
                                type="button"
                                className="text-primary hover:text-primary-hover font-medium transition-colors"
                                onClick={() => navigate("/auth")}
                            >
                                Sign In
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
