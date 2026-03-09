import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBell, FiHeart, FiMessageCircle, FiUserPlus, FiUserCheck, FiAtSign } from "react-icons/fi";
import type { Notification } from "../types/notification";
import SketchCard from "./SketchCard";

/** Robust UTC parsing for naive backend strings. */
function parseDateUtc(dateStr: string): Date {
    if (!dateStr) return new Date();
    if (dateStr.endsWith("Z") || dateStr.includes("+")) {
        return new Date(dateStr);
    }
    let cleanStr = dateStr.replace(" ", "T");
    if (!cleanStr.endsWith("Z")) cleanStr += "Z";
    return new Date(cleanStr);
}

/** Human-readable relative time (e.g. "2m ago", "3h ago"). */
function timeAgo(dateStr: string): string {
    const now = Date.now();
    const date = parseDateUtc(dateStr);
    const then = date.getTime();
    const diff = Math.max(0, now - then);
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { timeZone: "Asia/Kolkata" });
}

/** Icon + color per notification type. */
function typeConfig(type: string) {
    switch (type) {
        case "like":
            return { icon: <FiHeart className="text-red-500" />, verb: "liked your post" };
        case "comment":
            return { icon: <FiMessageCircle className="text-blue-600" />, verb: "commented on your post" };
        case "follow_request":
            return { icon: <FiUserPlus className="text-purple-600" />, verb: "wants to connect with you" };
        case "follow_accept":
            return { icon: <FiUserCheck className="text-green-600" />, verb: "accepted your connection request" };
        case "mention":
            return { icon: <FiAtSign className="text-indigo-600" />, verb: "mentioned you in a post" };
        default:
            return { icon: <FiBell className="text-gray-600" />, verb: "sent you a notification" };
    }
}

interface NotificationsPanelProps {
    notifications: Notification[];
    loading?: boolean; // only true on initial fetch
}

/**
 * Displays recent notifications inside the dashboard sidebar.
 * Designed to replace the old "Explore Communities" section.
 */
export default function NotificationsPanel({ notifications, loading }: NotificationsPanelProps) {
    return (
        <SketchCard variant="paper" className="p-4" style={{ backgroundColor: "#fef9c3" }}>
            {/* Header */}
            <h3 className="font-sketch text-xl mb-3 border-b-2 border-black/10 pb-2 flex items-center gap-2">
                <FiBell className="text-base" />
                Notifications
            </h3>

            {/* Initial loading skeleton */}
            {loading && (
                <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/40">
                            <div className="w-9 h-9 rounded-full bg-gray-200" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 bg-gray-200 rounded w-3/4" />
                                <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Notifications list */}
            {!loading && notifications.length > 0 && (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                    {notifications.slice(0, 4).map((n, i) => {
                        const { icon, verb } = typeConfig(n.type);
                        return (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: i * 0.03 }}
                            >
                                <div
                                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all ${n.is_read
                                        ? "bg-white/40 border-black/5"
                                        : "bg-white/70 border-black/10 shadow-sm"
                                        }`}
                                >
                                    {/* Actor avatar */}
                                    <Link to={`/profile/${n.actor.username}`} className="shrink-0 border-none">
                                        <div className="w-9 h-9 rounded-full bg-[linear-gradient(135deg,#7c3aed,#0891b2)] p-[2px] flex items-center justify-center overflow-hidden shadow-sm">
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                                {n.actor.avatar_url ? (
                                                    <img src={n.actor.avatar_url} alt={n.actor.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-sm font-bold text-gray-700 font-sketch">
                                                        {n.actor.username[0]?.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-hand text-sm leading-snug text-gray-800">
                                            <Link to={`/profile/${n.actor.username}`} className="font-bold text-gray-900 border-none hover:underline">
                                                {n.actor.display_name || n.actor.username}
                                            </Link>{" "}
                                            {verb}
                                        </p>
                                        <span className="text-[10px] text-gray-500 font-hand mt-0.5 block">{timeAgo(n.created_at)}</span>
                                    </div>

                                    {/* Type icon */}
                                    <div className="shrink-0 mt-0.5 text-lg">{icon}</div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Empty state */}
            {!loading && notifications.length === 0 && (
                <div className="text-center py-6 font-hand text-sm text-gray-500">
                    <FiBell className="text-2xl mx-auto mb-2 opacity-40" />
                    No notifications yet
                </div>
            )}
        </SketchCard>
    );
}
