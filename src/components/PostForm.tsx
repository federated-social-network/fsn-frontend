import { useState } from "react";
import { createPost } from "../api/api";

export default function PostForm({ onPosted }: { onPosted?: (newPost?: any) => void }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    setError("");

    const username = localStorage.getItem("username");
    const token = localStorage.getItem("AUTH_TOKEN") || localStorage.getItem("access_token");

    if (!username || !token) {
      setError("Not authenticated — please log in.");
      return;
    }

    if (!content.trim()) {
      setError("Post content cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      const res = await createPost(content, username);

      // show server feedback when available
      if (res?.status === 200 || res?.status === 201) {
        // clear input
        setContent("");
        // notify parent via callback
        try {
          if (onPosted) onPosted(res.data);
        } catch (e) {
          console.warn("onPosted callback threw", e);
        }

        // dispatch a global event so any listener can refresh
        try {
          window.dispatchEvent(new CustomEvent("post:created", { detail: res.data }));
        } catch (e) {
          // ignore if CustomEvent not supported
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

  return (
    <div className="bg-[var(--bg-muted)]/50 backdrop-blur-sm border-2 border-black rounded-2xl p-4 mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[5px_5px_0px_rgba(0,0,0,1)]">
      <textarea
        className="w-full bg-white border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all shadow-inner"
        rows={3}
        placeholder="What’s happening in your instance?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {error && <p className="text-red-500 font-bold text-sm mt-2 font-['Cabin_Sketch'] tracking-wide">{error}</p>}

      <div className="flex justify-end mt-3">
        <button
          onClick={handlePost}
          disabled={loading}
          className="bg-[var(--primary)] hover:bg-[var(--primary-600)] border-2 border-black text-white font-bold font-['Cabin_Sketch'] text-lg px-6 py-2 rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
        >
          {loading ? "Posting..." : "Post Update"}
        </button>
      </div>
    </div>
  );
}
