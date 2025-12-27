import { useState } from "react";
import { createPost } from "../api/api";

export default function PostForm() {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handlePost = async () => {
    setError("");

    if (!content.trim()) return;

    try {
      await createPost(content);
      setContent("");
    } catch (err) {
      setError("Failed to create post");
    }
  };

  return (
    <div className="bg-[rgba(255,255,255,0.02)] border border-[var(--muted-border)] rounded-2xl p-4 mb-6">
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
          className="bg-[var(--primary)] hover:bg-[var(--primary-600)] px-4 py-1.5 rounded-lg text-white"
        >
          Post
        </button>
      </div>
    </div>
  );
}
