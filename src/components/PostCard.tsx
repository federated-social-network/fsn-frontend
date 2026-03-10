import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { parseUsername } from "../utils/user";
import { timeAgo } from "../utils/time";
import { useLikeStore } from "../store/useLikeStore";
import { likePost, unlikePost } from "../api/api";
import { FaRegComment } from "react-icons/fa6";
import CommentSection from "./CommentSection";

/**
 * Renders post content with @mentions as bold, clickable profile links.
 * Splits text on @username patterns and returns a React fragment.
 */
function renderContentWithMentions(text: string) {
    // Match @username (word chars, dots, hyphens — common in usernames)
    const mentionRegex = /@([\w.-]+)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = mentionRegex.exec(text)) !== null) {
        // Push text before the match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        const mentionedUser = match[1];
        parts.push(
            <Link
                key={`mention-${match.index}`}
                to={`/profile/${mentionedUser}`}
                className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline border-none"
                onClick={(e) => e.stopPropagation()}
            >
                @{mentionedUser}
            </Link>
        );
        lastIndex = mentionRegex.lastIndex;
    }

    // Push remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
}

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
    const [showComments, setShowComments] = useState(false);
    const [isClamped, setIsClamped] = useState(false);
    const [commentCount, setCommentCount] = useState<number>(p.comment_count ?? 0);
    const contentRef = useRef<HTMLParagraphElement>(null);

    const storeLikeCount = useLikeStore(state => state.likes[p.id]);
    const storeIsLiked = useLikeStore(state => state.isLiked[p.id]);
    const storeLikedByAvatars = useLikeStore(state => state.likedByAvatars[p.id]);
    const setLikeData = useLikeStore(state => state.setLikeData);
    const setLikedByAvatars = useLikeStore(state => state.setLikedByAvatars);
    const addLikeAvatar = useLikeStore(state => state.addLikeAvatar);
    const removeLikeAvatar = useLikeStore(state => state.removeLikeAvatar);

    const initialLiked = storeIsLiked !== undefined ? storeIsLiked : (p.is_liked === true ? true : (p.is_liked === false ? false : getLikedSet().has(p.id)));
    const initialLikeCount = storeLikeCount !== undefined ? storeLikeCount : Number(p.like_count || 0);

    const [isLiked, setIsLiked] = useState<boolean>(initialLiked);
    const [likeCount, setLikeCount] = useState<number>(initialLikeCount);
    const [likeLoading, setLikeLoading] = useState(false);

    // Double-tap heart animation state
    const [showHeartAnim, setShowHeartAnim] = useState(false);
    const lastTapRef = useRef<number>(0);
    const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);



    const { username, instance } = parseUsername(p.author);
    const avatarUrl = (p as any).avatar_url;
    const imageUrl = (p as any).image_url;
    const content = p.content || "";
    const propLikedBy: string[] = (p as any).liked_by || [];
    const likedByAvatars: string[] = storeLikedByAvatars ?? propLikedBy;

    // Current user's avatar for optimistic updates
    const myAvatarUrl = localStorage.getItem("user_avatar_url") || "";



    // Sync when props change — prefer server value, fallback to cache if undefined
    useEffect(() => {
        if (storeIsLiked !== undefined && storeLikeCount !== undefined) {
            setIsLiked(storeIsLiked);
            setLikeCount(storeLikeCount);
            return;
        }

        const serverLiked = p.is_liked === true ? true : (p.is_liked === false ? false : getLikedSet().has(p.id));
        const serverCount = Number(p.like_count || 0);

        setIsLiked(serverLiked);
        setLikeCount(serverCount);
        setLikeData(p.id, serverCount, serverLiked);
    }, [p.id, p.is_liked, p.like_count, storeIsLiked, storeLikeCount, setLikeData]);

    // Sync liked-by avatars from prop into store on mount / prop change
    useEffect(() => {
        if (storeLikedByAvatars === undefined && propLikedBy.length > 0) {
            setLikedByAvatars(p.id, propLikedBy);
        }
    }, [p.id, propLikedBy, storeLikedByAvatars, setLikedByAvatars]);

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

        const nextCount = Number(likeCount || 0) + 1;
        setLikeCount(nextCount);
        setLikeData(p.id, nextCount, true);

        // Optimistically add current user's avatar
        if (myAvatarUrl) {
            addLikeAvatar(p.id, myAvatarUrl);
        }

        const liked = getLikedSet();
        liked.add(p.id);
        setLikedSet(liked);

        try {
            await likePost(p.id);
        } catch (err: any) {
            console.error(`[PostCard] Like FAILED for post ${p.id}:`, err?.response?.data || err?.message || err);
            setIsLiked(false);

            const prevCount = Math.max(0, Number(likeCount || 0) - 1);
            setLikeCount(prevCount);
            setLikeData(p.id, prevCount, false);

            // Revert avatar
            if (myAvatarUrl) {
                removeLikeAvatar(p.id, myAvatarUrl);
            }

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

        const current = Number(likeCount || 0);
        const nextCount = wasLiked ? Math.max(0, current - 1) : current + 1;
        setLikeCount(nextCount);

        // Optimistically update avatars
        if (myAvatarUrl) {
            if (wasLiked) {
                removeLikeAvatar(p.id, myAvatarUrl);
            } else {
                addLikeAvatar(p.id, myAvatarUrl);
            }
        }
        setLikeData(p.id, nextCount, !wasLiked);

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

            const current = Number(likeCount || 0);
            const revertCount = wasLiked ? current + 1 : Math.max(0, current - 1);
            setLikeCount(revertCount);
            setLikeData(p.id, revertCount, wasLiked);

            // Revert avatar change
            if (myAvatarUrl) {
                if (wasLiked) {
                    addLikeAvatar(p.id, myAvatarUrl);
                } else {
                    removeLikeAvatar(p.id, myAvatarUrl);
                }
            }

            const revert = getLikedSet();
            if (wasLiked) revert.add(p.id); else revert.delete(p.id);
            setLikedSet(revert);
        } finally {
            setLikeLoading(false);
        }
    };

    const isMastodon = instance?.toLowerCase().includes("mastodon") || p.origin_instance?.toLowerCase().includes("mastodon");
    const isPixelfed = instance?.toLowerCase().includes("pixelfed") || p.origin_instance?.toLowerCase().includes("pixelfed");
    const isExternal = isMastodon || isPixelfed;




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
                        {isExternal ? (
                            <a href={isMastodon ? `https://mastodon.social/@${username}` : `https://pixelfed.social/${username}`} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#7c3aed,#0891b2)] p-[2px] shadow-sm flex items-center justify-center shrink-0">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-semibold text-sm overflow-hidden">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-600">{username[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                </div>
                            </a>

                        ) : (
                            <Link to={`/profile/${username}`} className="shrink-0">
                                <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#7c3aed,#0891b2)] p-[2px] shadow-sm flex items-center justify-center shrink-0">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-semibold text-sm overflow-hidden">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-600">{username[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )}
                        <div className="min-w-0 flex-1">
                            {isExternal ? (
                                <a
                                    href={isMastodon ? `https://mastodon.social/@${username}` : `https://pixelfed.social/${username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-[15px] text-gray-900 hover:underline truncate leading-snug border-b-0 block"
                                >
                                    {p.display_name || username}
                                </a>
                            ) : (
                                <Link
                                    to={`/profile/${username}`}
                                    className="font-bold text-[15px] text-gray-900 hover:underline"
                                >
                                    {p.display_name || username}
                                </Link>
                            )}
                            <div className="flex items-center gap-1.5 text-[13px] text-gray-500 truncate leading-snug mt-0.5 sm:mt-0">
                                <span className="truncate">@{username}</span>
                                <span className="flex-shrink-0">•</span>
                                <span className="flex-shrink-0">{timeAgo(p.created_at)}</span>
                            </div>
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
                                {renderContentWithMentions(content)}
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
                                    className="absolute rounded-full"
                                    style={{ border: '2px solid #7c3aed' }}
                                    initial={{ width: 0, height: 0, opacity: 0.8 }}
                                    animate={{ width: 160, height: 160, opacity: 0 }}
                                    transition={{ duration: 0.7, ease: "easeOut" }}
                                />

                                {/* Main heart */}
                                <motion.svg
                                    viewBox="0 0 24 24"
                                    className="w-28 h-28 sm:w-32 sm:h-32"
                                    style={{ filter: 'drop-shadow(0 0 20px rgba(124, 58, 237, 0.5))' }}
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
                                    <defs>
                                        <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="50%" stopColor="#7c3aed" />
                                            <stop offset="50%" stopColor="#0891b2" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={heartPath}
                                        fill="url(#heart-gradient)"
                                        stroke="white"
                                        strokeWidth="0.5"
                                    />
                                </motion.svg>

                                {/* Scattered particles */}
                                {[...Array(8)].map((_, i) => {
                                    const angle = (i * 45 * Math.PI) / 180;
                                    const distance = 55 + (i % 3) * 15;
                                    const colors = ['#7c3aed', '#8b5cf6', '#0891b2', '#06b6d4', '#7c3aed', '#a78bfa', '#0e7490', '#22d3ee'];
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
                <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {!isExternal && (
                            <button
                                onClick={handleLikeToggle}
                                disabled={likeLoading}
                                style={{
                                    color: isLiked ? '#7c3aed' : '#6b7280',
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
                                        className="w-5 h-5 group-hover:scale-110 transition-transform relative"
                                        viewBox="0 0 24 24"
                                    >
                                        <defs>
                                            <linearGradient id={`like-btn-gradient-${p.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="50%" stopColor="#7c3aed" />
                                                <stop offset="50%" stopColor="#0891b2" />
                                            </linearGradient>
                                        </defs>
                                        {/* Outline always shown, colored if liked */}
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            stroke={(isLiked || (likeLoading && !isLiked)) ? "#7c3aed" : "#6b7280"}
                                            strokeWidth="1.8"
                                            fill="none"
                                            d={heartPath}
                                        />
                                        {/* Filled inner - animated while loading, fully shown when liked & not loading */}
                                        <path
                                            className={`${(likeLoading && isLiked) ? "animate-paint-fill" : (likeLoading && !isLiked) ? "animate-paint-drain" : ""}`}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            stroke="none"
                                            fill={(isLiked || (likeLoading && !isLiked)) ? `url(#like-btn-gradient-${p.id})` : "none"}
                                            d={heartPath}
                                        />
                                    </svg>
                                </motion.div>
                                <span className="text-xs font-medium">
                                    {likeCount > 0 ? likeCount : "Like"}
                                </span>
                            </button>
                        )}
                        {!isExternal && (
                            <button
                                onClick={() => setShowComments(!showComments)}
                                className="flex items-center gap-1.5 transition-colors group cursor-pointer text-gray-500 hover:text-blue-600 outline-none focus:outline-none bg-transparent p-0 m-0 border-none shadow-none"
                                title="Comment"
                            >
                                <FaRegComment className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {commentCount > 0 && (
                                    <span className="text-xs font-medium">{commentCount}</span>
                                )}
                            </button>
                        )}
                    </div>

                    {/* ── Liked-by avatar circles (right corner) ── */}
                    {likedByAvatars.length > 0 && (
                        <div className="flex items-center">
                            {likedByAvatars.slice(0, 5).map((url, i) => (
                                <div
                                    key={i}
                                    className="relative"
                                    style={{ marginLeft: i === 0 ? 0 : -6, zIndex: 5 - i }}
                                >
                                    <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-100">
                                        <img
                                            src={url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                    {/* Tiny heart badge */}
                                    <div
                                        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm"
                                        style={{ background: 'linear-gradient(135deg, #7c3aed, #0891b2)' }}
                                    >
                                        <svg viewBox="0 0 24 24" className="w-2 h-2" fill="white">
                                            <path d={heartPath} />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                            {likeCount > likedByAvatars.length && (
                                <span className="text-[11px] font-semibold text-gray-500 ml-1.5">
                                    +{likeCount - likedByAvatars.length}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                {/* ── Comment Section ── */}
                <AnimatePresence>
                    {showComments && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <CommentSection
                                postId={p.id}
                                postAuthorUsername={username}
                                onCommentAdded={() => setCommentCount(prev => prev + 1)}
                                onCommentDeleted={() => setCommentCount(prev => Math.max(0, prev - 1))}
                                onCommentsFetched={(count) => setCommentCount(count)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
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
