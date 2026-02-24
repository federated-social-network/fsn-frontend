import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { parseUsername } from "../utils/user";
import { timeAgo } from "../utils/time";
import { likePost, unlikePost, initiateConnection } from "../api/api";
import { FiUserPlus } from "react-icons/fi";

interface PostCardProps {
    post: any;
    /** Set of usernames the current user is already connected to */
    connectedUsers?: Set<string>;
    /** Callback after a follow request is sent (so parent can update its state) */
    onFollowSent?: (username: string) => void;
}

/**
 * A professional LinkedIn/Instagram-style post card.
 * - Compact images with lightbox
 * - Truncated captions (3 lines) with "Show more" (like LinkedIn)
 * - Interactive like button with red heart when liked
 * - +Follow button for non-connected users
 * - Clean, modern UI
 */
// Helper: read/write liked post IDs from localStorage
const LIKED_KEY = "fsn_liked_posts";
const getLikedSet = (): Set<string> => {
    try {
        const raw = localStorage.getItem(LIKED_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
};
const setLikedSet = (s: Set<string>) => {
    localStorage.setItem(LIKED_KEY, JSON.stringify([...s]));
};

export default function PostCard({ post: p, connectedUsers, onFollowSent }: PostCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [isClamped, setIsClamped] = useState(false);
    const contentRef = useRef<HTMLParagraphElement>(null);

    // Like state — server truth wins when present, otherwise fall back to local cache
    const [isLiked, setIsLiked] = useState<boolean>(() => {
        if (p.is_liked === true) return true;
        if (p.is_liked === false) return false;
        return getLikedSet().has(p.id);
    });
    const [likeCount, setLikeCount] = useState<number>(p.like_count ?? 0);
    const [likeLoading, setLikeLoading] = useState(false);

    // Follow state
    const [followLoading, setFollowLoading] = useState(false);
    const [followSent, setFollowSent] = useState(false);

    const { username } = parseUsername(p.author);
    const currentUser = localStorage.getItem("username") || "";
    const avatarUrl = (p as any).avatar_url;
    const imageUrl = (p as any).image_url;
    const content = p.content || "";

    const isOwnPost = username.toLowerCase() === currentUser.toLowerCase();
    const isConnected = connectedUsers?.has(username) ?? true; // default to true (hide button) if not provided
    const showFollowBtn = !isOwnPost && !isConnected && !followSent;

    // Sync when props change — prefer server value, fallback to cache if undefined
    useEffect(() => {
        if (p.is_liked === true || p.is_liked === false) {
            setIsLiked(p.is_liked);
        } else {
            setIsLiked(getLikedSet().has(p.id));
        }
        setLikeCount(p.like_count ?? 0);
    }, [p.id, p.is_liked, p.like_count]);

    // Detect if text overflows 3 lines
    useEffect(() => {
        const el = contentRef.current;
        if (el) {
            setIsClamped(el.scrollHeight > el.clientHeight);
        }
    }, [content]);

    const handleLikeToggle = async () => {
        if (likeLoading) return;
        setLikeLoading(true);

        const wasLiked = isLiked;

        // Optimistic update — also persist to local cache immediately
        setIsLiked(!wasLiked);
        setLikeCount((prev) => (wasLiked ? Math.max(0, prev - 1) : prev + 1));
        const liked = getLikedSet();
        if (wasLiked) liked.delete(p.id); else liked.add(p.id);
        setLikedSet(liked);

        try {
            if (wasLiked) {
                await unlikePost(p.id);
            } else {
                await likePost(p.id);
            }
        } catch (err: any) {
            // Revert both state and cache on failure
            console.error(`[PostCard] Like toggle FAILED for post ${p.id}:`, err?.response?.data || err?.message || err);
            setIsLiked(wasLiked);
            setLikeCount((prev) => (wasLiked ? prev + 1 : Math.max(0, prev - 1)));
            const revert = getLikedSet();
            if (wasLiked) revert.add(p.id); else revert.delete(p.id);
            setLikedSet(revert);
        } finally {
            setLikeLoading(false);
        }
    };

    const handleFollow = async () => {
        if (followLoading) return;
        setFollowLoading(true);
        try {
            await initiateConnection(username);
            setFollowSent(true);
            onFollowSent?.(username);
        } catch (err: any) {
            console.error(`[PostCard] Follow FAILED for ${username}:`, err?.response?.data || err?.message || err);
        } finally {
            setFollowLoading(false);
        }
    };

    return (<>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
            className="mb-4"
        >
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link to={`/profile/${username}`} className="shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white shadow-sm flex items-center justify-center font-semibold text-sm overflow-hidden">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-600">{username[0]?.toUpperCase()}</span>
                                )}
                            </div>
                        </Link>
                        <div className="min-w-0">
                            <Link
                                to={`/profile/${username}`}
                                className="font-semibold text-sm text-gray-900 hover:text-blue-600 transition-colors truncate block"
                            >
                                {username}
                            </Link>
                            <div className="text-xs text-gray-500 mt-0.5">{timeAgo(p.created_at)}</div>
                        </div>
                    </div>

                    {/* +Follow button */}
                    {showFollowBtn && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleFollow}
                            disabled={followLoading}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors border-none shadow-none"
                            style={{ minHeight: 'auto', minWidth: 'auto', boxShadow: 'none' }}
                        >
                            <FiUserPlus className="text-xs" />
                            <span>{followLoading ? "..." : "Follow"}</span>
                        </motion.button>
                    )}
                    {followSent && (
                        <span className="text-xs text-emerald-600 font-medium px-2 py-1 bg-emerald-50 rounded-full">
                            Requested
                        </span>
                    )}
                </div>

                {/* ── Caption ── */}
                {content && (
                    <div className="px-4 pb-3">
                        <p
                            ref={contentRef}
                            className={`text-sm text-gray-800 leading-relaxed whitespace-pre-wrap ${!expanded ? "line-clamp-3" : ""}`}
                        >
                            {content}
                        </p>
                        {(isClamped || expanded) && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-1 transition-colors"
                            >
                                {expanded ? "Show less" : "...show more"}
                            </button>
                        )}
                    </div>
                )}

                {/* ── Image ── */}
                {imageUrl && (
                    <div
                        className="w-full overflow-hidden cursor-pointer group"
                        onClick={() => setLightboxOpen(true)}
                    >
                        <img
                            src={imageUrl}
                            alt="Post"
                            className="w-full object-contain max-h-[520px] group-hover:scale-[1.01] transition-transform duration-500"
                            loading="lazy"
                        />
                    </div>
                )}

                {/* ── Footer / Engagement bar ── */}
                <div className="px-4 py-2.5 border-t border-gray-100 flex items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLikeToggle}
                            disabled={likeLoading}
                            style={{
                                color: isLiked ? '#ef4444' : '#6b7280',
                                border: 'none',
                                boxShadow: 'none',
                                background: 'none',
                                padding: 0,
                                minHeight: 'auto',
                                minWidth: 'auto',
                            }}
                            className="flex items-center gap-1.5 transition-colors group cursor-pointer"
                        >
                            <motion.div
                                key={isLiked ? "liked" : "unliked"}
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            >
                                <svg
                                    className="w-5 h-5 group-hover:scale-110 transition-transform"
                                    viewBox="0 0 24 24"
                                    fill={isLiked ? "#ef4444" : "none"}
                                    stroke={isLiked ? "#ef4444" : "#6b7280"}
                                    strokeWidth="1.8"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </motion.div>
                            <span className="text-xs font-medium">
                                {likeCount > 0 ? likeCount : "Like"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* ── Lightbox Modal ── */}
        {
            imageUrl && createPortal(
                <AnimatePresence>
                    {lightboxOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
                            onClick={() => setLightboxOpen(false)}
                        >
                            {/* Close button */}
                            <button
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors z-10"
                                onClick={() => setLightboxOpen(false)}
                            >
                                ✕
                            </button>

                            {/* Full image */}
                            <motion.img
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ type: "spring", bounce: 0.2 }}
                                src={imageUrl}
                                alt="Post"
                                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )
        }
    </>);
}
