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
      setError("Log in to scribble something!");
      return;
    }

    if (!content.trim()) {
      setError("You can't post an empty thoughts!");
      return;
    }

    try {
      setLoading(true);
      const res = await createPost(content, username);

      if (res?.status === 200 || res?.status === 201) {
        setContent("");
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

  return (
    <div className="relative mb-8">
      {/* Notebook binding effect (spirals) could go here but let's keep it simple for now */}
      <div className="bg-white border-2 border-[var(--ink-primary)] p-0 shadow-sketch -rotate-1 relative" style={{ borderRadius: '2px 10px 2px 10px' }}>
        {/* Header line */}
        <div className="h-12 border-b-2 border-red-300 flex items-center px-4 bg-[#fdfdfd]">
          <span className="text-gray-400 font-hand text-sm">Date: {new Date().toLocaleDateString()}</span>
          <div className="ml-auto font-sketch font-bold text-xl text-[var(--ink-primary)]">New Entry</div>
        </div>

        {/* Lined paper content */}
        <div className="relative">
          <div className="absolute left-10 top-0 bottom-0 w-px bg-red-300 z-10 opacity-50"></div> {/* Margin line */}

          <textarea
            className="w-full bg-transparent resize-none focus:outline-none font-hand text-xl text-[var(--ink-primary)] leading-[2rem] px-12 py-2"
            rows={4}
            placeholder="Dear diary..."
            style={{
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #a3c2e0 31px, #a3c2e0 32px)',
              lineHeight: '32px',
              backgroundAttachment: 'local'
            }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Footer action */}
        <div className="p-3 bg-[#fdfdfd] border-t border-gray-100 flex justify-between items-center">
          <div className="text-red-500 font-bold text-sm font-hand">{error}</div>
          <button
            onClick={handlePost}
            disabled={loading}
            className="bg-transparent hover:bg-black/5 text-[var(--ink-blue)] font-bold font-marker text-lg px-4 py-1 rounded border-2 border-transparent hover:border-[var(--ink-blue)] transition-all transform hover:-rotate-2 disabled:opacity-50"
          >
            {loading ? "Scribbling..." : "Pin It 📌"}
          </button>
        </div>
      </div>
    </div>
  );
}
