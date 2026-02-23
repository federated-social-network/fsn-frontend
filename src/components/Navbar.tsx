import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { getInstanceName } from "../config/instances";
import { useState, useEffect } from "react";
import ConfirmationModal from "./ConfirmationModal";
import { getUser } from "../api/api";

/**
 * The main integration navigation bar.
 * Handles user logout, displays the current instance, and provides navigation links.
 *
 * @returns {JSX.Element} The rendered Navbar.
 */
export default function Navbar() {
    const username = localStorage.getItem("username") || "";
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!username) return;
        getUser(username)
            .then((res) => {
                const data = res.data || {};
                const url = data.avatar_url || data.profile_url || data.user?.avatar_url || data.user?.profile_url || null;
                setAvatarUrl(url);
            })
            .catch(() => setAvatarUrl(null));
    }, [username]);

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
            <div className="relative bg-gradient-to-b from-[var(--paper-white)] to-gray-50 pt-3 sm:pt-5 pb-4 sm:pb-7 px-4 sm:px-6 shadow-lg">

                <div className="max-w-7xl mx-auto flex items-center justify-between relative">

                    {/* LOGO */}
                    <div className="group relative select-none">
                        <motion.div
                            whileHover={{ rotate: -2, scale: 1.05 }}
                            className="text-2xl sm:text-3xl md:text-4xl font-sketch font-bold text-[var(--ink-primary)] relative z-10"
                        >
                            HeliiX...


                        </motion.div>
                        {/* Highlight effect behind logo */}
                        <div className="absolute -inset-2 bg-[var(--highlighter-yellow)] rotate-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity -z-0"></div>
                    </div>

                    {/* INSTANCE BADGE - Hidden on mobile */}
                    <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 transform -rotate-1">
                        <div className="bg-[var(--pastel-blue)] px-4 py-1.5 border-2 border-[var(--ink-primary)] shadow-[2px_2px_0px_rgba(0,0,0,0.2)] rounded-sm font-hand text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Connected to <strong>{getInstanceName(localStorage.getItem("INSTANCE_BASE_URL"))}</strong>
                        </div>
                    </div>

                    {/* USER CONTROLS (Desktop) */}
                    <div className="hidden md:flex items-center gap-4 lg:gap-6">
                        {/* Profile "Polaroid" */}
                        <Link to={`/profile/${username}`} className="group flex items-center gap-3">
                            <div className="hidden lg:block text-right">
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
                                    className="w-10 h-10 md:w-12 md:h-12 bg-white p-1 border border-gray-200 shadow-md rotate-[-2deg] transition-all"
                                >
                                    <div className="w-full h-full bg-[var(--pastel-yellow)] border border-black/10 flex items-center justify-center font-sketch text-lg md:text-xl overflow-hidden">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                                        ) : (
                                            username ? username[0].toUpperCase() : '?'
                                        )}
                                    </div>
                                </motion.div>
                                {/* Tape on photo */}
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 md:w-8 h-2 md:h-3 bg-white/40 border-l border-r border-white/60 rotate-2 shadow-sm pointer-events-none"></div>
                            </div>
                        </Link>


                        {/* Logout Button */}
                        <button
                            onClick={handleLogoutClick}
                            className="bg-black/5 hover:bg-black/10 border-2 border-transparent hover:border-black/5 rounded-full px-3 md:px-4 py-2 flex items-center gap-2 transition-all"
                            title="Sign Out"
                        >
                            <span className="text-lg md:text-xl">🚪</span>
                            <span className="font-sketch font-bold text-xs md:text-sm text-[var(--ink-primary)] hidden lg:inline">Log Out</span>
                        </button>
                    </div>

                    {/* MOBILE MENU TOGGLE */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden w-12 h-12 flex items-center justify-center text-2xl rounded-lg hover:bg-black/5 active:bg-black/10 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? "✕" : "☰"}
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
                            <div className="flex flex-col gap-3 font-hand text-lg">
                                <Link
                                    to={`/profile/${username}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white active:bg-gray-100 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[var(--pastel-yellow)] border border-black flex items-center justify-center font-sketch text-lg overflow-hidden">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                                        ) : (
                                            username ? username[0].toUpperCase() : '?'
                                        )}
                                    </div>
                                    <div>
                                        <span className="font-bold block">{username}</span>
                                        <span className="text-sm text-gray-500">View Profile</span>
                                    </div>
                                </Link>

                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-3 hover:bg-black/5 active:bg-black/10 rounded-lg flex items-center gap-3 transition-colors"
                                >
                                    <span className="text-xl">📰</span>
                                    <span>Feed</span>
                                </Link>

                                <div className="border-t border-dashed border-gray-300 my-1"></div>

                                {/* Mobile Instance Badge */}
                                <div className="p-3 text-sm bg-blue-50 border border-blue-100 rounded-lg text-blue-800 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Connected to: <strong>{getInstanceName(localStorage.getItem("INSTANCE_BASE_URL"))}</strong>
                                </div>

                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        handleLogoutClick();
                                    }}
                                    className="text-left text-red-600 p-3 hover:bg-red-50 active:bg-red-100 rounded-lg flex items-center gap-3 transition-colors"
                                >
                                    <span className="text-xl">🚪</span>
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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