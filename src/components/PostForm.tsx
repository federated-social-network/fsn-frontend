import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { createPost } from "../api/api";
import { motion, AnimatePresence } from "framer-motion";

// Helper component for the Modal
const PostModal = ({
  isOpen,
  onClose,
  username,
  onPosted
}: {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onPosted?: (data: any) => void;
}) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handlePost = async () => {
    setError("");

    const token = localStorage.getItem("AUTH_TOKEN") || localStorage.getItem("access_token");
    if (!username || !token) {
      setError("Log in to post!");
      return;
    }

    if (!content.trim()) {
      setError("Please type a message!");
      return;
    }

    try {
      setLoading(true);
      const res = await createPost(content, username);

      if (res?.status === 200 || res?.status === 201) {
        setContent("");
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
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm text-sm sm:text-base">
                    {userInitial}
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
                  className="w-full h-full text-lg sm:text-xl text-gray-800 placeholder-gray-400 focus:outline-none resize-none bg-transparent leading-relaxed"
                  placeholder="What do you want to talk about?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ minHeight: '150px', fontSize: '16px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handlePost();
                    }
                  }}
                />

                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end items-center gap-2 sm:gap-3 safe-bottom">
                <button
                  onClick={onClose}
                  className="px-4 sm:px-5 py-2 text-gray-600 font-semibold hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePost}
                  disabled={!content.trim() || loading}
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
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default function PostForm({ onPosted }: { onPosted?: (newPost?: any) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const username = localStorage.getItem("username") || "?";
  const userInitial = username[0]?.toUpperCase();

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
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md">
            {userInitial}
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
        onPosted={onPosted}
      />
    </>
  );
}
