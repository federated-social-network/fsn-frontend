import { useState, useRef, useEffect } from "react";
import { createPost } from "../api/api";
import { motion } from "framer-motion";

export default function PostForm({ onPosted }: { onPosted?: (newPost?: any) => void }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!content.trim()) {
          setIsExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [content]);

  const handlePost = async () => {
    setError("");

    const username = localStorage.getItem("username");
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
        setIsExpanded(false);
        try {
          if (onPosted) onPosted(res.data);
        } catch (e) {
          console.warn("onPosted callback threw", e);
        }

        try {
          window.dispatchEvent(new CustomEvent("post:created", { detail: res.data }));
        } catch (e) {
          // ignore
        }
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

  const username = localStorage.getItem("username") || "?";

  return (
    <motion.div
      ref={containerRef}
      layout
      className="bg-white rounded-xl shadow-md border border-gray-100 mb-8 overflow-hidden relative z-10"
    >
      <div className="p-4">
        {!isExpanded ? (
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-4 cursor-text group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-gray-200 flex-shrink-0 flex items-center justify-center text-indigo-500 font-bold text-lg shadow-inner">
              {username[0]?.toUpperCase()}
            </div>
            <div className="flex-grow">
              <div className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 px-5 text-gray-500 font-medium group-hover:bg-gray-100 group-hover:border-gray-300 transition-all text-left shadow-sm">
                What's on your mind, {username}?
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-gray-200 flex-shrink-0 flex items-center justify-center text-indigo-500 font-bold text-lg shadow-inner">
                {username[0]?.toUpperCase()}
              </div>
              <div className="flex-grow">
                <textarea
                  className="w-full min-h-[120px] p-0 text-xl text-gray-800 placeholder-gray-400 focus:outline-none resize-none bg-transparent leading-relaxed"
                  placeholder={`What do you want to talk about, ${username}?`}
                  autoFocus
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded px-3">{error}</div>}

            <div className="flex justify-end items-center pt-3 mt-2 border-t border-gray-100">
              <div className="flex gap-3">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePost}
                  disabled={loading || !content.trim()}
                  className="bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Posting...
                    </>
                  ) : (
                    <>
                      Post 📤
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
