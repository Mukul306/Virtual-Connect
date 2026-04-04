import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-background border-t border-accent py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col items-center justify-center space-y-6">
                    
                    {/* Brand Mark with subtle hover interaction */}
                    <div className="group cursor-default">
                        <div className="text-textMain font-semibold tracking-[0.4em] text-[11px] uppercase opacity-90 transition-opacity duration-300 group-hover:opacity-100">
                            Virtual Connects
                        </div>
                    </div>

                    {/* Elegant Divider */}
                    <div className="h-px w-10 bg-accent/50" />

                    {/* Minimalist Copyright & Secondary Info */}
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-[9px] tracking-[0.2em] text-textMuted uppercase opacity-60">
                            &copy; {new Date().getFullYear()} — India
                        </p>
                        <p className="text-[9px] tracking-[0.15em] text-textMuted uppercase opacity-40">
                            All Rights Reserved
                        </p>
                    </div>
                    
                </div>
            </div>
        </footer>
    );
}