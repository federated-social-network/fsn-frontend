import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiImage, FiX, FiMic, FiMicOff } from "react-icons/fi";
import { createPost, completePost, elaboratePost, getUser, moderateImage } from "../api/api";
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
    const [isValidatingImage, setIsValidatingImage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [suggestedContent, setSuggestedContent] = useState<string | null>(null);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isElaborating, setIsElaborating] = useState(false);
    const [suggestionError, setSuggestionError] = useState("");

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognitionAPI) {
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let newFinalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        newFinalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (newFinalTranscript) {
                    setContent(prev => {
                        const baseContent = prev.trim();
                        const addition = newFinalTranscript.trim();
                        return baseContent ? `${baseContent} ${addition}` : addition;
                    });
                }
                setTranscript(interimTranscript);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                if (event.error === 'not-allowed') {
                    setError("Microphone access denied. Please allow permissions.");
                } else if (event.error === 'network') {
                    setError("Network error. Speech recognition might not be supported on this browser (e.g. Linux Chromium). Check browser settings.");
                } else if (event.error !== 'no-speech') {
                    setError(`Microphone error: ${event.error}`);
                }
                setIsListening(false);
            };

            // When recognition ends, we check if there's any leftover interim transcript
            // and append it to content if it exists, then reset transcript.
            recognition.onend = () => {
                setIsListening(false);
                setTranscript(prevTranscript => {
                    if (prevTranscript.trim()) {
                        setContent(prev => {
                            const baseContent = prev.trim();
                            const addition = prevTranscript.trim();
                            return baseContent ? `${baseContent} ${addition}` : addition;
                        });
                    }
                    return "";
                });
            };
            recognitionRef.current = recognition;
        }
    }, []);

    const handleMicClick = () => {
        if (!recognitionRef.current) {
            setError("Speech recognition is not natively supported in this browser. Please try Chrome.");
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
            // onend handler now takes care of appending leftover transcript and resetting it
        } else {
            setTranscript("");
            setError("");
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            setTranscript("");
        }
        setContent(e.target.value);
    };

    const displayContent = isListening && transcript ? `${content} ${transcript}`.trim() : content;

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_CHARS = 500;
    const charCount = displayContent.length;
    const charPercent = Math.min((charCount / MAX_CHARS) * 100, 100);
    const isOverLimit = charCount > MAX_CHARS;
    const canPost = (displayContent.trim().length > 0 || imageFile) && !isOverLimit && !loading && !isValidatingImage;

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
    }, [displayContent]);

    // Cleanup preview URL
    useEffect(() => {
        return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
    }, [imagePreview]);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);

        // Call moderation API immediately
        setIsValidatingImage(true);
        try {
            const res = await moderateImage(file);
            const data = res.data;

            const isUnsafe = data.adult === "POSSIBLE" || data.adult === "LIKELY" || data.adult === "VERY_LIKELY" ||
                data.violence === "POSSIBLE" || data.violence === "LIKELY" || data.violence === "VERY_LIKELY" ||
                data.racy === "POSSIBLE" || data.racy === "LIKELY" || data.racy === "VERY_LIKELY";

            if (isUnsafe) {
                setError("Explicit content detected. This image cannot be uploaded.");
                setImageFile(null);
                setImagePreview(null);
                URL.revokeObjectURL(objectUrl);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        } catch (err) {
            console.error("Image moderation failed:", err);
            setError("Image validation failed. Please try again.");
            setImageFile(null);
            setImagePreview(null);
            URL.revokeObjectURL(objectUrl);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } finally {
            setIsValidatingImage(false);
        }
    };

    const clearImage = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImageFile(null);
        setImagePreview(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const wordCount = displayContent.trim().split(/\s+/).filter(word => word.length > 0).length;

    const handleEnhance = async () => {
        if (wordCount < 5) return;
        setSuggestionError("");
        setIsEnhancing(true);
        try {
            const res = await completePost(displayContent);
            if (res.data && res.data.completed) {
                setSuggestedContent(res.data.completed);
            } else {
                setSuggestionError("Failed to get suggestion.");
            }
        } catch (err: any) {
            console.error(err);
            setSuggestionError("Failed to get suggestion.");
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleElaborate = async () => {
        if (wordCount < 5) return;
        setSuggestionError("");
        setIsElaborating(true);
        try {
            const res = await elaboratePost(displayContent);
            if (res.data && res.data.completed) {
                setSuggestedContent(res.data.completed);
            } else {
                setSuggestionError("Failed to get suggestion.");
            }
        } catch (err: any) {
            console.error(err);
            setSuggestionError("Failed to get suggestion.");
        } finally {
            setIsElaborating(false);
        }
    };

    const handleKeepSuggestion = () => {
        if (suggestedContent) {
            setContent(suggestedContent);
            setSuggestedContent(null);
        }
    };

    const handleDiscardSuggestion = () => {
        setSuggestedContent(null);
    };

    const handlePost = async () => {
        if (!canPost) return;
        setError("");
        setLoading(true);

        let finalContent = displayContent;
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            setContent(finalContent);
            setTranscript("");
        }

        try {
            const res = await createPost(finalContent, username, imageFile || undefined);
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
                        ) : isValidatingImage ? (
                            <span className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Scanning
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
                        value={displayContent}
                        onChange={handleTextareaChange}
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

                {/* AI Suggestion Area */}
                <div className="px-4">
                    <AnimatePresence>
                        {suggestedContent && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: "auto", marginTop: 8, marginBottom: 16 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold text-sm">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                        </svg>
                                        AI Suggestion
                                    </div>
                                    <div className="max-h-[122px] overflow-y-auto pr-2 custom-scrollbar mb-3">
                                        <p className="text-gray-800 text-[15px] whitespace-pre-wrap leading-relaxed">
                                            {suggestedContent}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleKeepSuggestion}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                                        >
                                            Keep
                                        </button>
                                        <button
                                            onClick={handleDiscardSuggestion}
                                            className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                                        >
                                            Discard
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {suggestionError && (
                        <div className="mt-2 mb-2 text-red-500 text-xs font-medium">
                            {suggestionError}
                        </div>
                    )}
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

                {/* Action buttons area — only visible when no image selected */}
                {!imageFile && (
                    <div className="px-4 pb-3 flex flex-col gap-3">

                        {/* Top row: AI Helpers */}
                        {!suggestedContent && (
                            <div className="flex justify-end gap-2 border-b border-gray-100 pb-3">
                                {/* AI Enhance Button */}
                                <button
                                    type="button"
                                    onClick={handleEnhance}
                                    disabled={isEnhancing || isElaborating || wordCount < 5}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${wordCount >= 5
                                        ? "bg-blue-100 hover:bg-blue-200 text-blue-700"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    {isEnhancing ? (
                                        <span className="w-4 h-4 border-2 border-blue-700/30 border-t-blue-700 rounded-full animate-spin"></span>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                        </svg>
                                    )}
                                    Enhance
                                </button>

                                {/* AI Elaborate Button */}
                                <button
                                    type="button"
                                    onClick={handleElaborate}
                                    disabled={isEnhancing || isElaborating || wordCount < 5}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${wordCount >= 5
                                        ? "bg-purple-100 hover:bg-purple-200 text-purple-700"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    {isElaborating ? (
                                        <span className="w-4 h-4 border-2 border-purple-700/30 border-t-purple-700 rounded-full animate-spin"></span>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                    )}
                                    Elaborate
                                </button>
                            </div>
                        )}

                        {/* Bottom Row: Image Upload & Post */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
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
                                <button
                                    type="button"
                                    onClick={handleMicClick}
                                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isListening
                                        ? "bg-red-100 text-red-600 hover:bg-red-200 animate-pulse"
                                        : "hover:bg-blue-50 active:bg-blue-100 text-gray-500 hover:text-blue-600"
                                        }`}
                                    title={isListening ? "Stop recording" : "Dictate"}
                                >
                                    {isListening ? <FiMicOff className="text-xl" /> : <FiMic className="text-xl" />}
                                </button>
                            </div>

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
                                ) : isValidatingImage ? (
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Scanning...
                                    </span>
                                ) : (
                                    "Post"
                                )}
                            </motion.button>
                        </div>
                    </div>
                )}

                {/* Image preview */}
                {imagePreview && (
                    <div className="px-4 pb-3">
                        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full max-h-64 object-contain"
                            />
                            {isValidatingImage ? (
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
                                    <span className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3"></span>
                                    <p className="text-sm font-semibold tracking-wide">Scanning image for safety...</p>
                                </div>
                            ) : (
                                <button
                                    onClick={clearImage}
                                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                                >
                                    <FiX className="text-base" />
                                </button>
                            )}
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
