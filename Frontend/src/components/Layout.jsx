import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Global layout wrapper for standard pages (Landing, Auth, Dashboard).
 * Do NOT use this for VideoMeet to fully utilize exact viewport height without scrolling navigation.
 */
export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-background text-textMain pt-16 font-sans">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}
