import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBell, FiHeart, FiMessageCircle, FiUserPlus, FiUserCheck, FiArrowLeft, FiAtSign } from "react-icons/fi";
import { getNotifications } from "../api/api";
import type { Notification } from "../types/notification";
import Navbar from "../components/Navbar";

const POLL_INTERVAL = 5000;

/** Human-readable relative time. */
function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.max(0, now - then);
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

function typeConfig(type: string) {
    switch (type) {
        case "like":
            return { icon: <FiHeart className="text-red-500" />, verb: "liked your post", bg: "bg-red-50" };
        case "comment":
            return { icon: <FiMessageCircle className="text-blue-600" />, verb: "commented on your post", bg: "bg-blue-50" };
        case "follow_request":
            return { icon: <FiUserPlus className="text-purple-600" />, verb: "wants to connect with you", bg: "bg-purple-50" };
        case "follow_accept":
            return { icon: <FiUserCheck className="text-green-600" />, verb: "accepted your connection request", bg: "bg-green-50" };
        case "mention":
            return { icon: <FiAtSign className="text-indigo-600" />, verb: "mentioned you in a post", bg: "bg-indigo-50" };
        default:
            return { icon: <FiBell className="text-gray-600" />, verb: "sent you a notification", bg: "bg-gray-50" };
    }
}

/**
 * Full-page notifications view — used primarily on mobile.
 * Polls every 5 seconds. Only shows loading skeleton on the very first fetch.
 */
export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const hasFetchedOnce = useRef(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await getNotifications();
            setNotifications(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            if (!hasFetchedOnce.current) {
                hasFetchedOnce.current = true;
                setInitialLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const id = setInterval(fetchNotifications, POLL_INTERVAL);
        return () => clearInterval(id);
    }, [fetchNotifications]);

    return (
        <div className="h-screen overflow-hidden flex flex-col">
            <Navbar />

            <main
                className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 overflow-y-auto pb-28"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <Link to="/dashboard" className="border-none text-gray-600 hover:text-black transition-colors">
                        <FiArrowLeft className="text-xl" />
                    </Link>
                    <h1 className="font-sketch text-2xl flex items-center gap-2">
                        <FiBell /> Notifications
                    </h1>
                </div>

                {/* Initial loading skeleton */}
                {initialLoading && (
                    <div className="space-y-3 animate-pulse">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
                                <div className="w-11 h-11 rounded-full bg-gray-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Notification list */}
                {!initialLoading && notifications.length > 0 && (
                    <div className="space-y-2.5">
                        {notifications.map((n, i) => {
                            const { icon, verb, bg } = typeConfig(n.type);
                            return (
                                <motion.div
                                    key={n.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.22, delay: i * 0.04 }}
                                >
                                    <div
                                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${n.is_read
                                            ? "bg-white/60 border-gray-100"
                                            : `${bg} border-gray-200 shadow-sm`
                                            }`}
                                    >
                                        {/* Avatar */}
                                        <Link to={`/profile/${n.actor.username}`} className="shrink-0 border-none">
                                            <div className="w-11 h-11 rounded-full bg-[linear-gradient(135deg,#7c3aed,#0891b2)] p-[2px] flex items-center justify-center overflow-hidden shadow-sm">
                                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                                    {n.actor.avatar_url ? (
                                                        <img src={n.actor.avatar_url} alt={n.actor.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-base font-bold text-gray-700 font-sketch">
                                                            {n.actor.username[0]?.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Body */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-hand text-[15px] leading-snug text-gray-800">
                                                <Link to={`/profile/${n.actor.username}`} className="font-bold text-gray-900 border-none hover:underline">
                                                    {n.actor.display_name || n.actor.username}
                                                </Link>{" "}
                                                {verb}
                                            </p>
                                            <span className="text-xs text-gray-500 font-hand mt-1 block">{timeAgo(n.created_at)}</span>
                                        </div>

                                        {/* Icon */}
                                        <div className="shrink-0 mt-1 text-xl">{icon}</div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Empty state */}
                {!initialLoading && notifications.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <FiBell className="text-5xl mx-auto mb-4" />
                        <div className="font-sketch text-2xl">All caught up!</div>
                        <p className="font-hand text-lg mt-2">No notifications yet.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
