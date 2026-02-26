import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getInstanceName } from "../config/instances";
import { useState, useEffect } from "react";
import ConfirmationModal from "./ConfirmationModal";
import { getUser } from "../api/api";
import { FiLogOut, FiUser } from "react-icons/fi";

/**
 * The main navigation bar.
 * Clean, compact, professional design with the HeliiX branding.
 *
 * @returns {JSX.Element} The rendered Navbar.
 */
export default function Navbar() {
    const username = localStorage.getItem("username") || "";
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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

    const instanceName = getInstanceName(localStorage.getItem("INSTANCE_BASE_URL"));

    return (
        <div className="relative z-50">
            {/* Glassmorphism navbar */}
            <div className="relative bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between h-14 sm:h-16">

                    {/* LEFT: Logo + Brand */}
                    <Link to="/dashboard" className="flex items-center gap-2.5 group border-none">
                        <motion.div
                            whileHover={{ scale: 1.08, rotate: -3 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2.5"
                        >
                            <img
                                src="/logo.png"
                                alt="HeliiX"
                                className="w-10 h-10 sm:w-10 sm:h-10 -my-3 object-contain drop-shadow-sm"
                            />
                            <span className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                                HeliiX
                            </span>
                        </motion.div>
                    </Link>

                    {/* CENTER: Instance Badge — desktop only */}
                    {instanceName && (
                        <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-sm text-emerald-700" style={{ fontFamily: 'var(--font-body)' }}>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="font-medium">{instanceName}</span>
                            </div>
                        </div>
                    )}

                    {/* RIGHT: User Controls */}
                    <div className="flex items-center gap-2 sm:gap-3">

                        {/* Profile Link */}
                        <Link
                            to={`/profile/${username}`}
                            className="hidden sm:flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-100/80 transition-colors group border-none"
                        >
                            {/* Avatar */}
                            <motion.div
                                whileHover={{ scale: 1.08 }}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-white shadow-sm flex items-center justify-center"
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                                ) : (
                                    <FiUser className="text-gray-500 text-sm" />
                                )}
                            </motion.div>

                            {/* Username — hidden on small screens */}
                            <span className="hidden md:block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors max-w-[120px] truncate">
                                {username}
                            </span>
                        </Link>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-6 bg-gray-200"></div>

                        {/* Logout Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogoutClick}
                            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50/80 transition-all border-none shadow-none text-sm font-medium"
                            title="Sign Out"
                        >
                            <FiLogOut className="text-base" />
                            <span className="hidden sm:inline text-sm">Logout</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={performLogout}
                title="Leaving so soon?"
                message="Are you sure you want to log out? You'll need to sign in again to access your account."
                confirmText="Yes, Log Out"
                confirmColor="bg-red-500"
            />
        </div>
    );
}