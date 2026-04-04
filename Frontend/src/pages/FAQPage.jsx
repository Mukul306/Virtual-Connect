import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from 'lucide-react';

const allQuestions = [
    {
        q: "How do I start a meeting?",
        a: "Once you log in to your dashboard, click the 'Create Meeting' button. You will receive a unique meeting code or link to share with your participants."
    },
    {
        q: "Do I need to download an app?",
        a: "No. Virtual Connects works directly in your web browser like Chrome, Safari, or Firefox. You don’t need to install any software to start or join a call."
    },
    {
        q: "Is Virtual Connects really free?",
        a: "Yes! The platform is free to use for high-quality video meetings and real-time chat. There are no hidden costs for standard meeting features."
    },
    {
        q: "Can I use it on mobile?",
        a: "Yes. You don't need a mobile app. Just open the meeting link in your phone's browser. The interface is fully responsive and fits mobile screens perfectly."
    },
    {
        q: "Are my calls encrypted?",
        a: "Every call is protected with industry-standard encryption. We use WebRTC protocols to ensure your data is sent securely between participants."
    },
    {
        q: "Do you store recordings?",
        a: "No. We do not record or store any video or audio data on our servers. Your private conversations stay strictly between you and your participants."
    },
    {
        q: "Is my personal data safe?",
        a: "Absolutely. We use professional-grade security like JWT to protect your account and prevent unauthorized access to the platform."
    },
    {
        q: "My video or audio is lagging.",
        a: "Lag is usually caused by a slow internet connection. Try moving closer to your router or turn off your camera to use 'Audio Only' mode to save bandwidth."
    },
    {
        q: "I can't see or hear other participants.",
        a: "Check if your browser has permission to use your camera and microphone. Click the 'lock' icon in your browser's address bar to manage permissions."
    },
    {
        q: "I can't share my screen.",
        a: "Screen sharing requires a modern desktop browser. If you are on a Mac, ensure you have allowed 'Screen Recording' for your browser in System Settings."
    },
    {
        q: "The meeting link is not working.",
        a: "Meeting codes are case-sensitive. Double-check the exact code or ask the host to resend the link to verify if the meeting is still active."
    },
];

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-white text-black font-sans pt-24 pb-20">
            {/* Header Area */}
            <header className="max-w-4xl mx-auto px-6 text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 text-black">
                        Common <span className="text-blue-600">Questions</span>
                    </h1>
                    <p className="text-lg md:text-xl text-black/60 font-medium max-w-2xl mx-auto leading-relaxed">
                        We've got you covered. From starting your first meeting
                        to fixing a laggy video, here is a quick guide to help you use
                        Virtual Connects.
                    </p>
                </motion.div>
            </header>

            {/* Smooth FAQ List */}
            <section className="max-w-5xl mx-auto px-4 md:px-6 space-y-5">
                {allQuestions.map((faq, i) => (
                    <FAQItem key={i} faq={faq} index={i} />
                ))}
            </section>
        </div>
    );
}

// Sub-component for smooth animation
function FAQItem({ faq, index }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="border border-black/5 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
            >
                <span className="font-bold text-lg pr-4">{faq.q}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="text-blue-600 shrink-0"
                >
                    <ChevronDown size={22} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="px-6 pb-6 text-black/60 font-medium leading-relaxed border-t border-black/5 pt-4">
                            {faq.a}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}