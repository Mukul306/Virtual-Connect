import React from 'react';
import { Globe, Zap, Shield, Video, MessageSquare } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4 group cursor-pointer">
                            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform">
                                <Zap size={20} fill="currentColor" />
                            </div>
                            <span className="font-black text-xl tracking-tighter uppercase text-slate-900">
                                Virtual <span className="text-blue-600">Connects</span>
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Built for the modern web. High-performance video conferencing with zero lag and secure authentiaction.
                        </p>
                    </div>

                    {/* Features Quick Links */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6 uppercase text-[10px] tracking-[0.2em]">Features</h4>
                        <ul className="space-y-4">
                            <FooterItem icon={<Video size={14} />} label="Audio/Video Meetings" />
                            <FooterItem icon={<Shield size={14} />} label="Security" />
                            <FooterItem icon={<MessageSquare size={14} />} label="Real-time Chat" />
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6 uppercase text-[10px] tracking-[0.2em]">Resources</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm font-semibold transition-colors">Documentation</a></li>
                            <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm font-semibold transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm font-semibold transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>                    
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <p className="text-[10px] tracking-[0.25em] text-slate-400 uppercase font-black">
                            &copy; {currentYear} Virtual Connects
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest border-r border-gray-200 pr-4">
                            <Globe size={12} className="text-blue-600" />
                            <span>Global Network</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// Small helper for feature list items
function FooterItem({ icon, label }) {
    return (
        <li className="flex items-center gap-3 text-slate-500 text-sm font-semibold group cursor-pointer">
            <span className="text-slate-300 group-hover:text-blue-600 transition-colors">{icon}</span>
            <span className="group-hover:text-slate-900 transition-colors">{label}</span>
        </li>
    );
}