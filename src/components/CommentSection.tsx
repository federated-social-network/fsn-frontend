import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Send, X } from "lucide-react";
import { getComments, createComment, deleteComment } from "../api/api";
import { timeAgo } from "../utils/time";

export interface Comment {
    id: string;
    content: string;
    user_id: string;
    post_id: string;
    avatar_url: string;
    display_name: string;
    username: string;
    created_at: string;
}

interface CommentSectionProps {
    postId: string;
    postAuthorUsername: string;
    onCommentAdded?: () => void;
    onCommentDeleted?: () => void;
    onCommentsFetched?: (count: number) => void;
}

export default function CommentSection({ postId, postAuthorUsername, onCommentAdded, onCommentDeleted, onCommentsFetched }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentUser = localStorage.getItem("username");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            try {
                const res = await getComments(postId);
                // Reverse the array to show oldest comments first, newest at the bottom
                const fetchedComments = (res.data || []).map((c: any) => ({
                    ...c,
                    avatar_url: c.avatar_url || c.profile_url || "",
                }));
                setComments(fetchedComments.reverse());
                if (onCommentsFetched) {
                    onCommentsFetched(fetchedComments.length);
                }
            } catch (err) {
                console.error("Failed to fetch comments", err);
                setError("Failed to load comments");
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [postId]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!newComment.trim() || submitting) return;

        setSubmitting(true);
        const content = newComment.trim();

        // Optimistic UI Update
        const optimisticComment: Comment = {
            id: `temp-${Date.now()}`,
            content,
            user_id: "temp-user-id", // Not strictly needed for optimistic display, but good for type check
            post_id: postId,
            avatar_url: localStorage.getItem("user_avatar_url") || "",
            display_name: currentUser || "You",
            username: currentUser || "unknown",
            created_at: new Date().toISOString(),
        };

        setComments(prev => [...prev, optimisticComment]);
        setNewComment("");
        if (onCommentAdded) onCommentAdded();

        // Scroll to bottom
        setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
        }, 100);

        try {
            const res = await createComment(postId, content);
            // Replace optimistic comment with real one from backend, but keep the optimistic user info 
            // because the create endpoint only returns the comment entity without joined user data.
            if (res.data) {
                setComments(prev => prev.map(c => c.id === optimisticComment.id ? { ...optimisticComment, ...res.data } : c));
            }
        } catch (err) {
            console.error("Failed to post comment", err);
            // Revert optimistic
            setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
            if (onCommentDeleted) onCommentDeleted(); // revert the count
            setError("Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleDelete = async (commentId: string) => {
        // Optimistic UI Update
        const previousComments = [...comments];
        setComments(prev => prev.filter(c => c.id !== commentId));

        try {
            await deleteComment(commentId);
            if (onCommentDeleted) onCommentDeleted();
        } catch (err) {
            console.error("Failed to delete comment", err);
            // Revert on failure
            setComments(previousComments);
            if (onCommentAdded) onCommentAdded(); // revert the count decrement
            setError("Failed to delete comment");
        }
    };

    return (
        <div className="border-t border-gray-100 bg-gray-50/50 p-2 sm:p-4">
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

            {/* Comments List */}
            {loading ? (
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <div
                    ref={containerRef}
                    className={`space-y-4 mb-4 ${comments.length > 3 ? 'max-h-[240px] overflow-y-auto pr-2' : ''}`}
                    style={{ scrollbarWidth: 'thin' }}
                >
                    {comments.map(comment => {
                        const isCreator = comment.username === postAuthorUsername;
                        const isOwnComment = comment.username === currentUser;
                        const userProfileLink = `/profile/${comment.username}`;

                        return (
                            <div key={comment.id} className="flex gap-3 group">
                                {/* Avatar */}
                                <Link to={userProfileLink} className="shrink-0 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                                        {comment.avatar_url ? (
                                            <img src={comment.avatar_url} alt={comment.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold text-gray-500">
                                                {comment.username ? comment.username[0].toUpperCase() : "?"}
                                            </span>
                                        )}
                                    </div>
                                </Link>

                                {/* Comment Content */}
                                <div className="flex-1 min-w-0 max-w-full">
                                    <div className="bg-white rounded-2xl rounded-tl-none px-3 sm:px-4 py-1.5 shadow-sm border border-gray-100 relative group-hover:shadow-md transition-shadow overflow-hidden">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0 flex flex-col">
                                                <Link to={userProfileLink} className="font-bold text-sm text-gray-900 hover:underline hover:text-blue-600 border-none">
                                                    @{comment.username} <span className="font-normal text-gray-400 ml-1 text-[11px]">• {timeAgo(comment.created_at)}</span>
                                                </Link>
                                                {isCreator && (
                                                    <div className="flex mt-0.5">
                                                        <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm inline-block leading-none">
                                                            CREATOR
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs text-gray-400">

                                                </span>

                                                {/* Delete Button (Ultra-compact circular style) */}
                                                {isOwnComment && (
                                                    <button
                                                        onClick={() => handleDelete(comment.id)}
                                                        className="w-3.5 h-3.5 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 hover:border-red-100 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 shadow-sm"
                                                        aria-label="Delete comment"
                                                    >
                                                        <X className="w-2.5 h-2.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {!loading && comments.length === 0 && (
                        <div className="text-center text-gray-500 text-sm py-2">
                            No comments yet. Be the first to start the conversation!
                        </div>
                    )}
                </div>
            )}

            {/* Input Area */}
            <div className="flex gap-2 items-center mt-1.5">
                <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0 overflow-hidden flex items-center justify-center border border-gray-200 shadow-sm">
                    {localStorage.getItem("user_avatar_url") ? (
                        <img src={localStorage.getItem("user_avatar_url")!} alt={currentUser || ""} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-[10px] font-bold text-gray-500">
                            {currentUser ? currentUser[0].toUpperCase() : "?"}
                        </span>
                    )}
                </div>
                <div className="flex-1 flex gap-2 items-center min-w-0">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a comment..."
                        className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0891b2]/30 focus:border-[#0891b2] transition-all"
                        disabled={submitting}
                    />
                    <button
                        onClick={() => handleSubmit()}
                        disabled={!newComment.trim() || submitting}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${newComment.trim()
                            ? "bg-[#0891b2] text-white shadow-sm hover:scale-105 active:scale-95"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                        aria-label="Send comment"
                    >
                        {submitting ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Send className="w-3.5 h-3.5 fill-current" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
