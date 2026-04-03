import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Video, Shield, Users, Zap } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="w-full">
            {/* Hero Section */}
            <div className="relative overflow-hidden w-full pt-16 pb-24 lg:pt-32 lg:pb-40 bg-background">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-400 blur-[100px] rounded-full mix-blend-multiply" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div 
                        className="text-center max-w-4xl mx-auto"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-accent text-primary text-sm font-semibold mb-8 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                            </span>
                            Secure, encrypted, & instant communication
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-textMain tracking-tight mb-8">
                            Connect Instantly with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                                Secure Video Meetings
                            </span>
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-xl text-textMuted mb-12 max-w-2xl mx-auto leading-relaxed">
                            Distance means nothing when connection is this seamless. High quality video calls, instant messaging, and robust security for modern teams and loved ones.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button onClick={() => navigate("/auth?mode=register")} className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-1">
                                Get Started for Free
                            </button>
                            <button onClick={() => navigate("/guest-join")} className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-accent-lighter border border-accent text-textMain rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-sm">
                                Join a Meeting
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <div className="border-t border-accent bg-background pt-24 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-textMain mb-16">Everything you need for seamless communication</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="glass-panel p-8 rounded-2xl text-left hover:border-primary/30 transition-colors">
                            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                                <Video className="text-primary" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-textMain mb-3">HD Video Calls</h3>
                            <p className="text-textMuted">Crystal clear peer-to-peer video streaming optimized for low latency and high reliability across devices.</p>
                        </div>
                        
                        {/* Feature 2 */}
                        <div className="glass-panel p-8 rounded-2xl text-left hover:border-primary/30 transition-colors">
                            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                                <Shield className="text-primary" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-textMain mb-3">Secure & Private</h3>
                            <p className="text-textMuted">Your meetings stay yours. Secure room architecture with strictly authenticated identity protocols.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-panel p-8 rounded-2xl text-left hover:border-primary/30 transition-colors">
                            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                                <Zap className="text-primary" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-textMain mb-3">Instant Access</h3>
                            <p className="text-textMuted">Zero downloads required. Join meetings instantly directly through your browser using WebRTC.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}