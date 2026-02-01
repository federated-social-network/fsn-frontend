import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getInstanceName } from "../config/instances";
import { useState } from "react";
import ConfirmationModal from "./ConfirmationModal";

export default function Navbar() {
    const username = localStorage.getItem("username") || "";
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const performLogout = () => {
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        localStorage.removeItem("access_token");
        localStorage.removeItem("AUTH_TOKEN");
        window.location.href = "/login";
    };

    return (
        <div className="relative z-50">
            {/* Creative Background with Wavy Edge */}
            <div className="bg-[var(--paper-white)] pt-4 pb-6 px-6 relative shadow-sm">
                {/* Wavy bottom border effect using CSS clip-path or SVG */}
                <div
                    className="absolute bottom-0 left-0 w-full h-3 bg-[var(--paper-white)] translate-y-full"
                    style={{
                        maskImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='10' viewBox='0 0 20 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 Q 5 10 10 0 T 20 0 V 10 H 0 Z' fill='black'/%3E%3C/svg%3E\")",
                        maskSize: "20px 10px",
                        WebkitMaskImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='10' viewBox='0 0 20 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 Q 5 10 10 0 T 20 0 V 10 H 0 Z' fill='black'/%3E%3C/svg%3E\")",
                        WebkitMaskSize: "20px 10px",
                        background: "var(--paper-white)"
                    }}
                ></div>

                {/* Dashed border line just above the wave */}
                <div className="absolute bottom-0 left-0 w-full border-b-2 border-dashed border-[var(--ink-primary)] opacity-20"></div>

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

                    {/* USER CONTROLS */}
                    <div className="flex items-center gap-6">
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
                </div>
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
