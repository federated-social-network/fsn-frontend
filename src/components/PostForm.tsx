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
    <div className="bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-2xl p-4 mb-6">
      <textarea
        className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg p-3 resize-none"
        rows={3}
        placeholder="What’s happening in your instance?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

      <div className="flex justify-end mt-3">
        <button
          onClick={handlePost}
          disabled={loading}
          className="bg-[var(--primary)] hover:bg-[var(--primary-600)] px-6 py-2 rounded-xl text-white font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Posting..." : "Post Update"}
        </button>
      </div>
    </div>
  );
}
