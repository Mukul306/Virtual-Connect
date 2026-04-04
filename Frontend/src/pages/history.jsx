import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext.js";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, Video, Copy, Check, Trash } from "lucide-react";

export default function History() {
    const { getHistoryOfUser, deleteFromHistory } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                // Ensure recent meetings are at the top
                const sortedHistory = (history || []).sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                setMeetings(sortedHistory);
            } catch {
                // Silently handle
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [getHistoryOfUser]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: 'short',
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCopy = (code, index) => {
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this meeting from your history?")) {
            try {
                await deleteFromHistory(id);
                setMeetings((prev) => prev.filter((m) => m._id !== id));
            } catch (err) {
                console.error("Deletion error:", err);
                alert("Failed to delete meeting. Please try again.");
            }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 lg:p-12 relative overflow-hidden bg-background">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/3 translate-x-1/3"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <button 
                    onClick={() => routeTo("/home")}
                    className="group mb-8 inline-flex items-center gap-2 text-textMuted hover:text-textMain transition-colors bg-white hover:bg-accent-lighter px-4 py-2 rounded-lg border border-accent shadow-sm"
                >
                    <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                <div className="flex items-center gap-3 mb-10">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shadow-sm">
                        <Clock size={24} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-textMain">Meeting History</h1>
                        <p className="text-textMuted">Review your previously generated meeting rooms.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <svg className="animate-spin h-8 w-8 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-textMuted font-medium">Loading history...</p>
                    </div>
                ) : meetings.length === 0 ? (
                    <div className="bg-white border border-accent shadow-sm rounded-2xl p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-background border border-accent rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                            <Video size={32} className="text-textMuted" />
                        </div>
                        <h3 className="text-xl font-bold text-textMain mb-2">No meetings yet</h3>
                        <p className="text-textMuted mb-6">You haven&apos;t generated any meetings. Head back to the dashboard to start one.</p>
                        <button 
                            onClick={() => routeTo("/home")}
                            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl shadow-sm transition-colors"
                        >
                            Generate a Meeting
                        </button>
                    </div>
                ) : (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        {meetings.map((meeting, i) => (
                            <motion.div 
                                key={meeting._id || i} 
                                variants={itemVariants}
                                className="bg-white border border-accent shadow-sm p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start sm:items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                                        <Video size={20} className="text-primary" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg font-bold text-textMain font-mono tracking-wide">
                                                {meeting.meetingCode}
                                            </span>
                                            <button 
                                                onClick={() => handleCopy(meeting.meetingCode, i)}
                                                className="p-1.5 text-textMuted hover:text-textMain hover:bg-accent rounded-md border border-transparent hover:border-accent-darker transition-colors"
                                                title="Copy Code"
                                            >
                                                {copiedIndex === i ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-textMuted font-medium">
                                            <div className="flex items-center gap-1.5 align-middle">
                                                <Calendar size={14} />
                                                <span>{formatDate(meeting.createdAt)}</span>
                                            </div>
                                            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-accent-darker"></div>
                                            <div className="flex items-center gap-1.5 align-middle">
                                                <Clock size={14} />
                                                <span>{formatTime(meeting.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex w-full sm:w-auto gap-3 mt-4 sm:mt-0">
                                    <button 
                                        onClick={() => routeTo(`/meeting/${meeting.meetingCode}`)}
                                        className="flex-1 sm:flex-none px-5 py-2.5 border border-primary text-primary hover:bg-primary hover:text-white font-bold rounded-xl shadow-sm transition-all text-center"
                                    >
                                        Rejoin Room
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(meeting._id)}
                                        className="px-4 py-2.5 border border-red-200 hover:border-red-500 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-bold shadow-sm rounded-xl transition-all flex justify-center items-center"
                                        title="Delete Meeting"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}