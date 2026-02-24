import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiImage, FiX } from "react-icons/fi";
import { createPost, getUser } from "../api/api";

/**
 * Full-screen mobile-first post creation page.
 * Navigated to from the + button in the mobile bottom nav.
 */
export default function CreatePostMobilePage() {
    const navigate = useNavigate();
    const username = localStorage.getItem("username") || "";
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_CHARS = 500;
    const charCount = content.length;
    const charPercent = Math.min((charCount / MAX_CHARS) * 100, 100);
    const isOverLimit = charCount > MAX_CHARS;
    const canPost = (content.trim().length > 0 || imageFile) && !isOverLimit && !loading;

    // Fetch avatar
    useEffect(() => {
        if (!username) return;
        getUser(username)
            .then((res) => {
                const data = res.data || {};
                setAvatarUrl(data.avatar_url || data.profile_url || null);
            })
            .catch(() => setAvatarUrl(null));
    }, [username]);

    // Auto-focus textarea
    useEffect(() => {
        setTimeout(() => textareaRef.current?.focus(), 200);
    }, []);

    // Auto-resize textarea
    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
        }
    }, [content]);

    // Cleanup preview URL
    useEffect(() => {
        return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
    }, [imagePreview]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validTypes.includes(file.type)) {
            setError("Invalid file type. Use JPEG, PNG, WEBP, or GIF.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Image too large. Max 5 MB.");
            return;
        }
        setError("");
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const clearImage = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handlePost = async () => {
        if (!canPost) return;
        setError("");
        setLoading(true);

        try {
            const res = await createPost(content, username, imageFile || undefined);
            if (res?.status === 200 || res?.status === 201) {
                try {
                    window.dispatchEvent(new CustomEvent("post:created", { detail: res.data }));
                } catch (_) { }
                navigate("/dashboard");
            } else {
                setError(`Server returned ${res?.status}`);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.detail || err?.response?.data || err?.message || "Something went wrong";
            setError(typeof msg === "string" ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    };

    const userInitial = username[0]?.toUpperCase() || "?";

    return (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col">
            {/* ── Header ── */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                >
                    <FiArrowLeft className="text-xl" />
                </button>

                <h1 className="text-base font-bold text-gray-900">Create Post</h1>

                {imageFile ? (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePost}
                        disabled={!canPost}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${canPost
                            ? "bg-blue-600 text-white shadow-md active:bg-blue-700"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                        style={{ border: 'none', boxShadow: canPost ? '0 2px 8px rgba(59,130,246,0.3)' : 'none' }}
                    >
                        {loading ? (
                            <span className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Posting
                            </span>
                        ) : "Post"}
                    </motion.button>
                ) : (
                    <div className="w-10" />
                )}
            </div>

            {/* ── Body ── */}
            <div className="flex-1 overflow-y-auto">
                {/* User info */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden shrink-0">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                        ) : (
                            userInitial
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 text-sm">{username}</div>
                        <div className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            Anyone
                        </div>
                    </div>
                </div>

                {/* Textarea */}
                <div className="px-4 py-2">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full text-[16px] text-gray-800 placeholder-gray-400 focus:outline-none resize-none bg-transparent leading-relaxed"
                        style={{ minHeight: "120px" }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handlePost();
                            }
                        }}
                    />
                </div>

                {/* Character count */}
                {charCount > 0 && (
                    <div className="px-4 pb-2 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${isOverLimit ? "bg-red-500" : charPercent > 80 ? "bg-amber-500" : "bg-blue-500"}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${charPercent}%` }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                        </div>
                        <span className={`text-xs font-medium tabular-nums ${isOverLimit ? "text-red-500" : charPercent > 80 ? "text-amber-500" : "text-gray-400"}`}>
                            {charCount}/{MAX_CHARS}
                        </span>
                    </div>
                )}

                {/* Action buttons — only visible when no image selected */}
                {!imageFile && (
                    <div className="px-4 pb-3 flex items-center justify-between">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={handleImageSelect}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-11 h-11 rounded-full hover:bg-blue-50 active:bg-blue-100 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors"
                        >
                            <FiImage className="text-xl" />
                        </button>

                        {!imageFile && (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handlePost}
                                disabled={!canPost}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${canPost
                                    ? "bg-blue-600 text-white shadow-md active:bg-blue-700"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    }`}
                                style={{ border: 'none', boxShadow: canPost ? '0 2px 8px rgba(59,130,246,0.3)' : 'none' }}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Posting...
                                    </span>
                                ) : "Post"}
                            </motion.button>
                        )}
                    </div>
                )}

                {/* Image preview */}
                {imagePreview && (
                    <div className="px-4 pb-3">
                        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full max-h-64 object-contain"
                            />
                            <button
                                onClick={clearImage}
                                className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                            >
                                <FiX className="text-base" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mx-4 mb-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
