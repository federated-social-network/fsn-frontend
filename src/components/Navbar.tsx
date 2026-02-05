import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { getInstanceName } from "../config/instances";
import { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";

export default function Navbar() {
    const username = localStorage.getItem("username") || "";
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const performLogout = () => {
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        localStorage.removeItem("access_token");
        localStorage.removeItem("AUTH_TOKEN");
        window.location.href = "/";
    };


    return (
        <div className="relative z-50">
            <div className="relative bg-gradient-to-b from-[var(--paper-white)] to-gray-50 pt-5 pb-7 px-6 shadow-lg">

                <div className="max-w-7xl mx-auto flex items-center justify-between relative">

                    {/* LOGO */}
                    <Link to="/" className="group relative">
                        <motion.div
                            whileHover={{ rotate: -2, scale: 1.05 }}
                            className="text-3xl md:text-4xl font-sketch font-bold text-[var(--ink-primary)] relative z-10"
                        >
                            HeliX...
                        </motion.div>
                        {/* Highlight effect behind logo */}
                        <div className="absolute -inset-2 bg-[var(--highlighter-yellow)] rotate-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity -z-0"></div>
                    </Link>

                    {/* INSTANCE BADGE */}
                    <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 transform -rotate-1">
                        <div className="bg-[var(--pastel-blue)] px-4 py-1.5 border-2 border-[var(--ink-primary)] shadow-[2px_2px_0px_rgba(0,0,0,0.2)] rounded-sm font-hand text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Connected to <strong>{getInstanceName(localStorage.getItem("INSTANCE_BASE_URL"))}</strong>
                        </div>
                    </div>

                    {/* USER CONTROLS (Desktop) */}
                    <div className="hidden md:flex items-center gap-6">
                        {/* Profile "Polaroid" */}
                        <Link to={`/profile/${username}`} className="group flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <div className="font-hand font-bold text-lg leading-none group-hover:text-[var(--primary)] transition-colors">
                                    {username}
                                </div>
                                <div className="text-[10px] font-marker text-gray-400 uppercase tracking-widest">
                                    Me
                                </div>
                            </div>

                            <div className="relative">
                                <motion.div
                                    whileHover={{ rotate: 3, scale: 1.1 }}
                                    className="w-12 h-12 bg-white p-1 border border-gray-200 shadow-md rotate-[-2deg] transition-all"
                                >
                                    <div className="w-full h-full bg-[var(--pastel-yellow)] border border-black/10 flex items-center justify-center font-sketch text-xl overflow-hidden">
                                        {username ? username[0].toUpperCase() : '?'}
                                    </div>
                                </motion.div>
                                {/* Tape on photo */}
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/40 border-l border-r border-white/60 rotate-2 shadow-sm pointer-events-none"></div>
                            </div>
                        </Link>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogoutClick}
                            className="bg-black/5 hover:bg-black/10 border-2 border-transparent hover:border-black/5 rounded-full px-4 py-2 flex items-center gap-2 transition-all"
                            title="Sign Out"
                        >
                            <span className="text-xl">🚪</span>
                            <span className="font-sketch font-bold text-sm text-[var(--ink-primary)]">Log Out</span>
                        </button>
                    </div>

                    {/* MOBILE MENU TOGGLE */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-2xl"
                    >
                        {isMenuOpen ? "✕" : "🍔"}
                    </button>
                </div>

                {/* MOBILE MENU DRAWER */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden overflow-hidden border-t-2 border-dashed border-gray-200 mt-4 pt-4"
                        >
                            <div className="flex flex-col gap-4 font-hand text-lg">
                                <Link
                                    to={`/profile/${username}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 p-2 bg-white/50 rounded hover:bg-white"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[var(--pastel-yellow)] border border-black flex items-center justify-center font-sketch text-sm">
                                        {username ? username[0].toUpperCase() : '?'}
                                    </div>
                                    <span>My Profile</span>
                                </Link>

                                <Link
                                    to="/"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 hover:bg-black/5 rounded"
                                >
                                    🏠 Home
                                </Link>
                                <Link
                                    to="/settings"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 hover:bg-black/5 rounded"
                                >
                                    ⚙️ Settings
                                </Link>

                                <div className="border-t border-dashed border-gray-300 my-1"></div>

                                {/* Mobile Instance Badge */}
                                <div className="p-2 text-sm bg-blue-50 border border-blue-100 rounded text-blue-800">
                                    Connected to: <strong>{getInstanceName(localStorage.getItem("INSTANCE_BASE_URL"))}</strong>
                                </div>

                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        handleLogoutClick();
                                    }}
                                    className="text-left text-red-600 p-2 hover:bg-red-50 rounded flex items-center gap-2"
                                >
                                    <span>🚪</span> Log Out
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Pipe-like structure with marquee effect at the end of navbar */}
            <div className="w-full h-12 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 overflow-hidden border-t-2 border-gray-900 border-b-2 shadow-inner">
                <div className="relative flex items-center h-full">
                    <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-white font-medium text-base">
                        <span>Connect by consent, not algorithms — a truly federated social network.</span>
                        <span className="text-blue-400">✦</span>
                        <span>Decentralized communities, mutual connections, and privacy-first social networking done right.</span>
                        <span className="text-purple-400">✦</span>
                        <span>Independent instances, trusted connections, and social networking without central control</span>
                        <span className="text-pink-400">✦</span>
                        <span>Connect by consent, not algorithms — a truly federated social network.</span>
                        <span className="text-blue-400">✦</span>
                        <span>Decentralized communities, mutual connections, and privacy-first social networking done right.</span>
                        <span className="text-purple-400">✦</span>
                        <span>Independent instances, trusted connections, and social networking without central control</span>
                        <span className="text-pink-400">✦</span>
                    </div>
                </div>
            </div>

            {/* Add marquee animation styles */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 25s linear infinite;
                }
            `}</style>

            <ConfirmationModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={performLogout}
                title="Leaving so soon?"
                message="Are you sure you want to log out? You'll need to sign in again to access your scribbles."
                confirmText="Yes, Log Out"
                confirmColor="bg-red-500"
            />
        </div>
    );
}