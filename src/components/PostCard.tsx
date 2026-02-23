import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { parseUsername } from "../utils/user";
import { getInstanceName, getInstanceColor } from "../config/instances";
import { timeAgo } from "../utils/time";

interface PostCardProps {
    post: any;
}

/**
 * A professional LinkedIn/Instagram-style post card.
 * - Compact images with lightbox
 * - Truncated captions (3 lines) with "Show more" (like LinkedIn)
 * - Clean, modern UI
 */
export default function PostCard({ post: p }: PostCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [isClamped, setIsClamped] = useState(false);
    const contentRef = useRef<HTMLParagraphElement>(null);

    const { username } = parseUsername(p.author);
    const avatarUrl = (p as any).avatar_url;
    const imageUrl = (p as any).image_url;
    const inst = p.origin_instance || parseUsername(p.author).instance || localStorage.getItem("INSTANCE_BASE_URL");
    const content = p.content || "";

    // Detect if text overflows 3 lines
    useEffect(() => {
        const el = contentRef.current;
        if (el) {
            setIsClamped(el.scrollHeight > el.clientHeight);
        }
    }, [content]);

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
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <Link
                                    to={`/profile/${username}`}
                                    className="font-semibold text-sm text-gray-900 hover:text-blue-600 transition-colors truncate"
                                >
                                    {username}
                                </Link>
                                {inst && (
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getInstanceColor(inst)}`}>
                                        {getInstanceName(inst)}
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">{timeAgo(p.created_at)}</div>
                        </div>
                    </div>
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
                        className="w-full max-h-[350px] bg-gray-50 overflow-hidden cursor-pointer"
                        onClick={() => setLightboxOpen(true)}
                    >
                        <img
                            src={imageUrl}
                            alt="Post"
                            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                            loading="lazy"
                        />
                    </div>
                )}

                {/* ── Footer / Engagement bar ── */}
                <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors group">
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-xs font-medium">Like</span>
                        </button>
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                        {inst ? getInstanceName(inst) : ""}
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
