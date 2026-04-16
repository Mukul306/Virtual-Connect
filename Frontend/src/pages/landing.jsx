import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Video, Shield, Users, Zap, ArrowRight, Sparkles } from 'lucide-react';

// Reuse logic from your first reference for consistency
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: 'easeOut' },
    },
};

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white text-black overflow-hidden font-sans">

            {/* --- Hero Section --- */}
            <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
                {/* Background Decor (Orbs) */}
                <motion.div
                    className="absolute top-20 right-[-5%] w-96 h-96 bg-blue-100/50 rounded-full blur-[100px]"
                    animate={{ y: [0, 40, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-10 left-[-5%] w-96 h-96 bg-purple-100/50 rounded-full blur-[100px]"
                    animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
                    transition={{ duration: 12, repeat: Infinity }}
                />

                <motion.div
                    className="max-w-6xl mx-auto text-center relative z-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Security Badge */}
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/5 border border-black/10 text-sm font-bold mb-8 shadow-sm"
                    >
                        <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                        <span>Connect Safely. Meet Instantly</span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8"
                    >
                        Connect Seamlessly with <br />
                        <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Virtual Meetings
                        </span>
                    </motion.h1>

                    {/* Subtext */}
                    <motion.p
                        variants={itemVariants}
                        className="text-lg sm:text-xl text-black/60 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
                    >
                        Experience crystal clear video and total privacy. The simplest way to connect, collaborate, and build together from anywhere.
                    </motion.p>

                    {/* Action Buttons */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                        <button
                            onClick={() => navigate("/auth?mode=register")}
                            className="group relative w-full sm:w-auto px-10 py-5 bg-black text-white rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl"
                        >
                            <span className="flex items-center justify-center gap-2">
                                Get Started for Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                        <button
                            onClick={() => navigate("/guest-join")}
                            className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-black/10 text-black rounded-2xl font-black text-lg hover:bg-black/5 transition-all"
                        >
                            Join a Meeting
                        </button>
                    </motion.div>
                </motion.div>
            </section>

            {/* --- Features Section (Improved) --- */}
            <section id="features" className="relative py-32 px-6 bg-white overflow-hidden">
                {/* Background subtle mesh or grid - Optional visual depth */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        className="text-center mb-24 space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-black">
                            Bring Your Team Together, <span className="text-blue-600">Anywhere</span>
                        </h2>
                        <p className="text-black/40 text-lg font-medium max-w-xl mx-auto">
                            Built to ensure your communication is fast, secure, and clear.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                        {[
                            {
                                icon: Video,
                                title: 'Interactive Collaboration',
                                desc: 'Beyond just video—engage with integrated real-time messaging, file sharing, and instant reactions. Collaboration isnt just talking; its doing, all in one place.',
                                gradient: 'from-blue-500 via-cyan-400 to-blue-600',
                                border: 'hover:border-blue-500/50'
                            },
                            {
                                icon: Shield,
                                title: 'Seamless Guest Access',
                                desc: 'No account? No problem. Generate unique Meeting IDs and let guests join instantly through their browser. Experience high-performance collaboration without the friction of sign-ups.',
                                gradient: 'from-yellow-400 to-orange-500',
                                border: 'hover:border-purple-500/50'
                            },
                            {
                                icon: Zap,
                                title: 'Browser-Native Power',
                                desc: 'No downloads, no plugins, no hassle. Join meetings instantly from any modern browser. One click is all it takes to bridge the gap between you and your team.',
                                gradient: 'from-orange-500 via-red-500 to-pink-500',
                                border: 'hover:border-orange-500/50'
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2, duration: 0.6, ease: "easeOut" }}
                                whileHover={{ y: -15, scale: 1.02 }}
                                viewport={{ once: true }}
                                className={`relative p-8 rounded-[3rem] bg-white/70 backdrop-blur-xl border-2 border-transparent ${feature.border} transition-all duration-500 group shadow-sm hover:shadow-2xl overflow-hidden`}
                            >
                                {/* Background Accent Blur */}
                                <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-[80px] transition-opacity duration-700`} />

                                {/* Icon Container */}
                                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-500 shadow-xl bg-slate-900 group-hover:shadow-none group-hover:rotate-[10deg]`}>
                                    <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                    <feature.icon size={32} className="relative z-10 text-white group-hover:scale-110 transition-transform duration-500" />
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-black mb-4 tracking-tight text-slate-900">
                                    {feature.title}
                                </h3>

                                <p className="text-slate-600 font-medium leading-relaxed text-base group-hover:text-slate-800 transition-colors">
                                    {feature.desc}
                                </p>

                                {/* Premium Button Indicator */}
                                <div className="mt-10 flex items-center gap-3">
                                    <div className={`h-[2px] w-0 group-hover:w-12 bg-gradient-to-r ${feature.gradient} transition-all duration-500`} />
                                    <span className="text-sm font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-x-[-20px] group-hover:translate-x-0 transition-all duration-500 text-slate-900">
                                        Explore Tech
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}