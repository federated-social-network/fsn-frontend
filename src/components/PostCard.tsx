import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { parseUsername } from "../utils/user";
import { timeAgo } from "../utils/time";
import { likePost, unlikePost } from "../api/api";

interface PostCardProps {
    post: any;
}

/**
 * A professional LinkedIn/Instagram-style post card.
 * - Double-tap to like with heart animation (web + mobile)
 * - Compact images with lightbox
 * - Truncated captions (3 lines) with "Show more"
 * - Interactive like button with red heart when liked
 * - +Follow button for non-connected users
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

export default function PostCard({ post: p }: PostCardProps) {
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

    // Double-tap heart animation state
    const [showHeartAnim, setShowHeartAnim] = useState(false);
    const lastTapRef = useRef<number>(0);
    const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);



    const { username, instance } = parseUsername(p.author);
    const avatarUrl = (p as any).avatar_url;
    const imageUrl = (p as any).image_url;
    const content = p.content || "";



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

    // Keep refs in sync so double-tap always reads fresh values
    const isLikedRef = useRef(isLiked);
    const likeLoadingRef = useRef(likeLoading);
    useEffect(() => { isLikedRef.current = isLiked; }, [isLiked]);
    useEffect(() => { likeLoadingRef.current = likeLoading; }, [likeLoading]);

    // ── Like-only action (for double-tap — never unlikes) ──
    const performLike = async () => {
        if (likeLoadingRef.current) return;
        if (isLikedRef.current) return; // already liked, just show heart

        setLikeLoading(true);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
        const liked = getLikedSet();
        liked.add(p.id);
        setLikedSet(liked);

        try {
            await likePost(p.id);
        } catch (err: any) {
            console.error(`[PostCard] Like FAILED for post ${p.id}:`, err?.response?.data || err?.message || err);
            setIsLiked(false);
            setLikeCount((prev) => Math.max(0, prev - 1));
            const revert = getLikedSet();
            revert.delete(p.id);
            setLikedSet(revert);
        } finally {
            setLikeLoading(false);
        }
    };

    const handleLikeToggle = async () => {
        if (likeLoading) return;
        setLikeLoading(true);

        const wasLiked = isLiked;

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

    // ── Tap handler: single-tap opens lightbox, double-tap likes (only if image exists) ──
    const handleTap = () => {
        // Only allow tap actions (like double-tap to like, single-tap to open image) if there is an image.
        // For text-only posts, this tap area does nothing.
        if (!imageUrl) return;

        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            // Double-tap → cancel pending single-tap, fire like
            lastTapRef.current = 0;
            if (singleTapTimerRef.current) {
                clearTimeout(singleTapTimerRef.current);
                singleTapTimerRef.current = null;
            }
            setShowHeartAnim(true);
            performLike();
            setTimeout(() => setShowHeartAnim(false), 1000);
        } else {
            // First tap → wait to see if a second tap follows
            lastTapRef.current = now;
            if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
            singleTapTimerRef.current = setTimeout(() => {
                // Single-tap confirmed → open lightbox if image exists
                if (imageUrl) setLightboxOpen(true);
                singleTapTimerRef.current = null;
            }, DOUBLE_TAP_DELAY);
        }
    };



    // Heart SVG path used in both the button and the double-tap animation
    const heartPath = "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z";

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

                    {/* Instance Indicator */}
                    {instance && (
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100/80 text-gray-700 text-[11px] font-semibold tracking-wide border border-gray-200">
                            <span>{instance}</span>
                        </div>
                    )}
                </div>

                {/* ── Tap area (caption + image): single-tap=view, double-tap=like ── */}
                <div
                    className="relative select-none"
                    onClick={handleTap}
                    style={{ cursor: 'pointer' }}
                >
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
                                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-1 transition-colors outline-none focus:outline-none bg-transparent p-0 m-0 border-none shadow-none"
                                >
                                    {expanded ? "Show less" : "...show more"}
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── Image ── */}
                    {imageUrl && (
                        <div className="w-full overflow-hidden group">
                            <img
                                src={imageUrl}
                                alt="Post"
                                className="w-full object-contain max-h-[520px] group-hover:scale-[1.01] transition-transform duration-500"
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* ── Double-tap Heart Animation Overlay ── */}
                    <AnimatePresence>
                        {showHeartAnim && (
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.4 } }}
                            >
                                {/* White flash */}
                                <motion.div
                                    className="absolute inset-0 bg-white"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 0.15, 0] }}
                                    transition={{ duration: 0.4 }}
                                />

                                {/* Expanding ring */}
                                <motion.div
                                    className="absolute rounded-full border-2 border-red-400"
                                    initial={{ width: 0, height: 0, opacity: 0.8 }}
                                    animate={{ width: 160, height: 160, opacity: 0 }}
                                    transition={{ duration: 0.7, ease: "easeOut" }}
                                />

                                {/* Main heart */}
                                <motion.svg
                                    viewBox="0 0 24 24"
                                    className="w-28 h-28 sm:w-32 sm:h-32"
                                    style={{ filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.6))' }}
                                    initial={{ scale: 0, rotate: -15 }}
                                    animate={{
                                        scale: [0, 1.4, 0.95, 1.1, 1],
                                        rotate: [-15, 10, -5, 0],
                                        opacity: [0, 1, 1, 1, 1],
                                    }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{
                                        duration: 0.7,
                                        times: [0, 0.35, 0.55, 0.75, 1],
                                        ease: "easeOut",
                                    }}
                                >
                                    <path
                                        d={heartPath}
                                        fill="#ef4444"
                                        stroke="white"
                                        strokeWidth="0.5"
                                    />
                                </motion.svg>

                                {/* Scattered particles */}
                                {[...Array(8)].map((_, i) => {
                                    const angle = (i * 45 * Math.PI) / 180;
                                    const distance = 55 + (i % 3) * 15;
                                    const colors = ['#ef4444', '#f97316', '#ec4899', '#f43f5e', '#fb923c', '#e11d48', '#f87171', '#fbbf24'];
                                    const size = i % 2 === 0 ? 8 : 6;
                                    return (
                                        <motion.div
                                            key={i}
                                            className="absolute rounded-full"
                                            style={{
                                                width: size,
                                                height: size,
                                                background: colors[i],
                                            }}
                                            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                                            animate={{
                                                scale: [0, 1.2, 0],
                                                x: Math.cos(angle) * distance,
                                                y: Math.sin(angle) * distance,
                                                opacity: [0, 1, 0],
                                            }}
                                            transition={{
                                                duration: 0.65,
                                                delay: 0.15 + i * 0.03,
                                                ease: "easeOut",
                                            }}
                                        />
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

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
                                        d={heartPath}
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
        </motion.div >

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
