import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.js';
import { 
  Zap, 
  LogOut, 
  Menu, 
  X, 
  User, 
  Globe, 
  Home, 
  LayoutDashboard, 
  History, 
  HelpCircle, // Added for FAQ
  Video, 
  Users 
} from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { isAuthenticated, user, handleLogout } = useContext(AuthContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = isAuthenticated ? (
        <>
            <Link to="/" className="flex items-center gap-2 text-textMuted hover:text-primary transition-colors font-medium">
                <Home size={18} />
                <span>Home</span>
            </Link>
            
            <Link to="/home" className="flex items-center gap-2 text-textMuted hover:text-primary transition-colors font-medium">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
            </Link>
            
            <Link to="/history" className="flex items-center gap-2 text-textMuted hover:text-primary transition-colors font-medium">
                <History size={18} />
                <span>History</span>
            </Link>

            {/* Added FAQ Link for Authenticated Users */}
            <Link to="/support" className="flex items-center gap-2 text-textMuted hover:text-primary transition-colors font-medium">
                <HelpCircle size={18} />
                <span>FAQ</span>
            </Link>

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
        <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-textMuted hover:text-primary transition-colors font-medium">
                <Home size={18} />
                <span>Home</span>
            </Link>

            {/* Added FAQ Link for Guests */}
            <Link to="/support" className="flex items-center gap-2 text-textMuted hover:text-primary transition-colors font-medium">
                <HelpCircle size={18} />
                <span>FAQ</span>
            </Link>

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
                    {/* Logo Section */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Zap className="text-primary" size={28} fill="currentColor" fillOpacity="0.1" /> 
                        </div>
                        <span className="text-2xl font-black text-textMain tracking-tighter">Virtual Connects</span>
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
                                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-textMuted hover:text-primary py-2 font-medium flex items-center gap-2">
                                        <Home size={18} /> Home
                                    </Link>
                                    <Link to="/home" onClick={() => setIsMobileMenuOpen(false)} className="text-textMuted hover:text-primary py-2 font-medium flex items-center gap-2">
                                        <LayoutDashboard size={18} /> Dashboard
                                    </Link>
                                    <Link to="/history" onClick={() => setIsMobileMenuOpen(false)} className="text-textMuted hover:text-primary py-2 font-medium flex items-center gap-2">
                                        <History size={18} /> History
                                    </Link>
                                    {/* Mobile FAQ Link */}
                                    <Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className="text-textMuted hover:text-primary py-2 font-medium flex items-center gap-2">
                                        <HelpCircle size={18} /> FAQ
                                    </Link>
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
                                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-textMuted hover:text-primary py-2 font-medium flex items-center gap-2">
                                        <Home size={18} /> Home
                                    </Link>
                                    {/* Mobile FAQ Link for Guests */}
                                    <Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className="text-textMuted hover:text-primary py-2 font-medium flex items-center gap-2">
                                        <HelpCircle size={18} /> FAQ
                                    </Link>
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