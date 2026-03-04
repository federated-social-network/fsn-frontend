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
                const fetchedComments = res.data || [];
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
            avatar_url: "", // In a real app we'd have this from user context, but it's hard to get synchronously here
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
        <div className="border-t border-gray-100 bg-gray-50/50 p-4">
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
                        const userProfileLink = isOwnComment ? "/profile" : `/profile/${comment.username}`;

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
                                <div className="flex-1 min-w-0">
                                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2 shadow-sm border border-gray-100 relative group-hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-1 gap-2">
                                            <div className="min-w-0">
                                                <Link to={userProfileLink} className="font-bold text-sm text-gray-900 hover:underline hover:text-blue-600 truncate block">
                                                    {comment.display_name || comment.username}
                                                </Link>
                                                <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                                                    @{comment.username}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {isCreator && (
                                                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                                        CREATOR
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-400">
                                                    {timeAgo(comment.created_at)}
                                                </span>

                                                {/* Delete Button (visible on hover) */}
                                                {isOwnComment && (
                                                    <button
                                                        onClick={() => handleDelete(comment.id)}
                                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                        aria-label="Delete comment"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
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
            <div className="flex gap-3 items-center mt-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 overflow-hidden flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-500">
                        {currentUser ? currentUser[0].toUpperCase() : "?"}
                    </span>
                </div>
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a comment..."
                        className="w-full bg-white border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={submitting}
                    />
                    <button
                        onClick={() => handleSubmit()}
                        disabled={!newComment.trim() || submitting}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 disabled:opacity-50 disabled:hover:text-gray-400 transition-colors p-1"
                        aria-label="Send comment"
                    >
                        {submitting ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
