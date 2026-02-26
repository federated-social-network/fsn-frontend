import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { createPost, completePost, getUser } from "../api/api";
import { motion, AnimatePresence } from "framer-motion";

// Helper component for the Modal
/**
 * Modal component for creating a new post.
 * Handles the input, character count, image upload, and submission logic.
 */
const PostModal = ({
  isOpen,
  onClose,
  username,
  avatarUrl,
  onPosted
}: {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  avatarUrl?: string | null;
  onPosted?: (data: any) => void;
}) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [suggestedContent, setSuggestedContent] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Clean up preview URL on unmount or change
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload JPEG, PNG, WEBP, or GIF.");
      return;
    }

    // Validate size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image too large. Maximum size is 5 MB.");
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

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;

  const handleEnhance = async () => {
    if (wordCount < 5) return;
    setSuggestionError("");
    setIsSuggesting(true);
    try {
      const res = await completePost(content);
      if (res.data && res.data.completed) {
        setSuggestedContent(res.data.completed);
      } else {
        setSuggestionError("Failed to get suggestion.");
      }
    } catch (err: any) {
      console.error(err);
      setSuggestionError("Failed to get suggestion. Try again.");
    } finally {
      setIsSuggesting(false);
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
    setError("");

    const token = localStorage.getItem("AUTH_TOKEN") || localStorage.getItem("access_token");
    if (!username || !token) {
      setError("Log in to post!");
      return;
    }

    if (!content.trim() && !imageFile) {
      setError("Please type a message or add an image!");
      return;
    }

    try {
      setLoading(true);
      const res = await createPost(content, username, imageFile || undefined);

      if (res?.status === 200 || res?.status === 201) {
        setContent("");
        clearImage();
        if (onPosted) onPosted(res.data);

        try {
          window.dispatchEvent(new CustomEvent("post:created", { detail: res.data }));
        } catch (e) {
          // ignore
        }
        onClose(); // Close modal on success
      } else {
        setError(`Server returned ${res?.status}`);
      }
    } catch (err: any) {
      const serverMsg = err?.response?.data || err?.response?.data?.detail || err?.message;
      console.error("Post error:", err, serverMsg);
      setError(typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg));
    } finally {
      setLoading(false);
    }
  };

  const userInitial = username[0]?.toUpperCase();

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            {/* Modal Container - Full-screen on mobile, centered modal on desktop */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-xl rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh] fixed inset-0 sm:relative sm:inset-auto">

              {/* Header */}
              <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm text-sm sm:text-base overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-base sm:text-lg leading-tight">{username}</h3>
                    <span className="text-[10px] sm:text-xs text-gray-500 font-medium bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded-full">Anyone</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 sm:w-8 sm:h-8 rounded-full hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-[200px]">
                <textarea
                  ref={textareaRef}
                  className="w-full text-lg sm:text-xl text-gray-800 placeholder-gray-400 focus:outline-none resize-none bg-transparent leading-relaxed"
                  placeholder="What do you want to talk about?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ minHeight: imagePreview ? '80px' : '150px', fontSize: '16px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handlePost();
                    }
                  }}
                />

                {/* AI Suggestion Area */}
                <AnimatePresence>
                  {suggestedContent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold text-sm">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                          </svg>
                          AI Suggestion
                        </div>
                        <p className="text-gray-800 text-sm mb-3 whitespace-pre-wrap leading-relaxed">{suggestedContent}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleKeepSuggestion}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
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
                  <div className="mt-2 text-red-500 text-xs font-medium">
                    {suggestionError}
                  </div>
                )}


                {/* Image preview */}
                {imagePreview && (
                  <div className="mt-3 relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={imagePreview}
                      alt="Upload preview"
                      className="w-full max-h-72 object-contain rounded-xl"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                      title="Remove image"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center gap-2 sm:gap-3 safe-bottom">
                {/* Left side: toolbar icons */}
                <div className="flex items-center gap-1">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 rounded-full hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-colors"
                    title="Add image"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </button>

                  {/* AI Enhance Button */}
                  {!suggestedContent && (
                    <button
                      type="button"
                      onClick={handleEnhance}
                      disabled={isSuggesting || wordCount < 5}
                      className={`ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${wordCount >= 5
                        ? "bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      title={wordCount >= 5 ? "AI Enhance" : "Type at least 5 words to enhance"}
                    >
                      {isSuggesting ? (
                        <span className="w-4 h-4 border-2 border-indigo-700/30 border-t-indigo-700 rounded-full animate-spin"></span>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                      )}
                      Enhance
                    </button>
                  )}
                </div>


                {/* Right side: Post */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={handlePost}
                    disabled={(!content.trim() && !imageFile) || loading}
                    className="bg-indigo-600 text-white px-5 sm:px-6 py-2 rounded-full font-bold hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Posting
                      </>
                    ) : (
                      "Post"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

/**
 * Component that displays a trigger bar to open the post creation modal.
 */
export default function PostForm({ onPosted }: { onPosted?: (newPost?: any) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const username = localStorage.getItem("username") || "?";
  const userInitial = username[0]?.toUpperCase();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!username || username === "?") return;
    getUser(username)
      .then((res) => {
        const data = res.data || {};
        // Backend may return `profile_url` instead of `avatar_url`
        const url = data.avatar_url || data.profile_url || data.user?.avatar_url || data.user?.profile_url || null;
        setAvatarUrl(url);
      })
      .catch(() => setAvatarUrl(null));
  }, [username]);

  return (
    <>
      {/* Trigger Bar */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-8 p-3 sm:p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex gap-3 sm:gap-4 items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
            ) : (
              userInitial
            )}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-grow h-10 sm:h-12 bg-white border border-gray-300 rounded-full px-4 sm:px-6 flex items-center text-left hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm text-gray-500 font-medium hover:text-gray-600 hover:border-gray-400 text-sm sm:text-base"
          >
            Start a post...
          </button>
        </div>
      </motion.div>

      {/* The Modal */}
      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        username={username}
        avatarUrl={avatarUrl}
        onPosted={onPosted}
      />
    </>
  );
}
