import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.js';
import { Video, LogOut, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { isAuthenticated, user, handleLogout } = useContext(AuthContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = isAuthenticated ? (
        <>
            <Link to="/home" className="text-textMuted hover:text-primary transition-colors font-medium">Dashboard</Link>
            <Link to="/history" className="text-textMuted hover:text-primary transition-colors font-medium">History</Link>
            <div className="relative group">
                <button className="flex items-center gap-2 text-textMuted hover:text-primary transition-colors font-medium">
                    <User size={18} />
                    <span>{user?.name || "Profile"}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-accent rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                    <button
                        onClick={() => {
                            if (handleLogout) handleLogout();
                            else {
                                localStorage.removeItem("accessToken");
                                window.location.href = "/";
                            }
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>
        </>
    ) : (
        <div className="flex items-center gap-3">
            <Link
                to="/guest-join"
                className="text-[#1F2937] hover:text-[#0052FF] transition-colors font-medium"
            >
                Join as Guest
            </Link>

            <Link
                to="/auth"
                className="px-5 py-2.5 rounded-xl font-semibold bg-[#0052FF]/90 text-white hover:bg-[#0052FF] transition-all shadow-sm"
            >
                Login
            </Link>

            <Link
                to="/auth?mode=register"
                className="px-5 py-2.5 rounded-xl font-semibold bg-[#0052FF] text-white hover:bg-[#003FCC] transition-all shadow-sm"
            >
                Sign Up
            </Link>
        </div>
    );

    return (
        <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-accent shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to={isAuthenticated ? "/home" : "/"} className="flex items-center gap-2 group">
                        <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Video className="text-primary" size={24} />
                        </div>
                        <span className="text-xl font-extrabold text-textMain tracking-tight">VI Connects</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-textMuted hover:text-textMain"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-accent shadow-lg"
                    >
                        <div className="px-4 pt-2 pb-4 flex flex-col gap-4">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/home" onClick={() => setIsMobileMenuOpen(false)} className="text-textMuted hover:text-primary py-2 font-medium">Dashboard</Link>
                                    <Link to="/history" onClick={() => setIsMobileMenuOpen(false)} className="text-textMuted hover:text-primary py-2 font-medium">History</Link>
                                    <button
                                        onClick={() => {
                                            if (handleLogout) handleLogout();
                                            else {
                                                localStorage.removeItem("accessToken");
                                                window.location.href = "/";
                                            }
                                        }}
                                        className="text-left text-red-600 py-2 flex items-center gap-2 font-medium"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/guest-join" onClick={() => setIsMobileMenuOpen(false)} className="text-textMuted hover:text-primary py-2 font-medium">Join as Guest</Link>
                                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="bg-white border border-accent hover:bg-accent-lighter text-textMain px-4 py-3 rounded-xl font-semibold text-center transition-all shadow-sm">Login</Link>
                                    <Link to="/auth?mode=register" onClick={() => setIsMobileMenuOpen(false)} className="bg-primary hover:bg-primary-hover text-white px-4 py-3 rounded-xl font-semibold text-center transition-all shadow-sm">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
