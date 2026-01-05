import PostForm from "../components/PostForm";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "../api/api";
import type { Post } from "../types/post";

export default function Dashboard() {
  const username = localStorage.getItem("username") || "";
  const userid = localStorage.getItem("userid") || "";
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPosts();
      // expect backend to return array in res.data
      setPosts(res.data || []);
    } catch (err: any) {
      console.error("Failed to fetch posts", err);
      const serverBody = err?.response?.data;
      const serverMsg = serverBody && typeof serverBody === "object" ? JSON.stringify(serverBody) : serverBody || err?.message;
      setError(serverMsg || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (mounted) loadPosts();
    // listen for global post events in case PostForm dispatches one
    const handler = () => {
      loadPosts();
    };
    window.addEventListener("post:created", handler as EventListener);
    return () => {
      mounted = false;
      window.removeEventListener("post:created", handler as EventListener);
    };
  }, [loadPosts]);

  return (
    <div className="min-h-screen bg-[transparent]">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Left sidebar: profile card */}
        <aside className="md:col-span-3">
          <div className="bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg p-4 sticky top-6">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${username}`} className="block">
                <div className="w-14 h-14 rounded-full bg-[rgba(10,167,198,0.12)] flex items-center justify-center text-[var(--primary)] font-bold">{username ? username[0].toUpperCase() : 'U'}</div>
              </Link>
              <div>
                <div className="font-semibold">{username || 'Your Name'}</div>
                <div className="text-xs text-[rgba(255,255,255,0.6)]">Member</div>
              </div>
            </div>

            <div className="mt-4 text-sm text-[rgba(255,255,255,0.75)]">Quick actions</div>
            <div className="mt-3 space-y-2">
              <Link to={`/profile/${username}`} className="w-full block text-left px-3 py-2 rounded hover:bg-[rgba(255,255,255,0.02)]">View profile</Link>
              <button className="w-full text-left px-3 py-2 rounded hover:bg-[rgba(255,255,255,0.02)]">My network</button>
              <button className="w-full text-left px-3 py-2 rounded hover:bg-[rgba(255,255,255,0.02)]">Settings</button>
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  localStorage.removeItem("username");
                  localStorage.removeItem("password");
                  window.location.href = "/login";
                }}
                className="w-full bg-[rgba(255,255,255,0.02)] border border-[var(--muted-border)] px-3 py-2 rounded-lg mt-2"
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Main feed */}
        <main className="md:col-span-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Home</h2>
            <p className="text-sm text-[rgba(255,255,255,0.7)]">Welcome back{username ? `, ${username}` : ""} — here's your feed.</p>
          </div>

          <div className="space-y-4">
            <PostForm onPosted={() => loadPosts()} />

            {loading && <div className="text-sm text-[rgba(255,255,255,0.7)]">Loading posts…</div>}
            {error && <div className="text-sm text-red-400">Error: {String(error)}</div>}

            {!loading && posts.length === 0 && (
              <div className="p-4 bg-[var(--bg-muted)] rounded-lg border border-[var(--muted-border)]">No posts yet — start the conversation.</div>
            )}

            {posts.map((p) => (
              <article key={p.id} className="bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Link to={`/profile/${p.author}`} className="w-10 h-10 flex-shrink-0 block">
                      <div className="w-10 h-10 rounded-full bg-[rgba(10,167,198,0.12)] flex items-center justify-center text-[var(--primary)] font-bold">{p.author ? p.author[0].toUpperCase() : 'U'}</div>
                    </Link>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link to={`/profile/${p.author}`} className="font-semibold hover:underline">{p.author}</Link>
                        <div className="text-xs text-[rgba(255,255,255,0.6)]">{p.origin_instance || 'local'}</div>
                      </div>
                    </div>
                    <p className="mt-2 text-[rgba(255,255,255,0.9)]">{p.content}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>

        {/* Right sidebar: suggestions, trends */}
        <aside className="md:col-span-3">
          <div className="bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg p-4 sticky top-6">
            <h3 className="font-semibold mb-3">People you may know</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[rgba(10,167,198,0.12)] flex items-center justify-center text-[var(--primary)] font-bold">C</div>
                  <div>
                    <div className="font-medium">charlie</div>
                    <div className="text-xs text-[rgba(255,255,255,0.6)]">instance-a</div>
                  </div>
                </div>
                <button className="text-sm text-[var(--primary)]">Connect</button>
              </li>

              <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[rgba(10,167,198,0.12)] flex items-center justify-center text-[var(--primary)] font-bold">D</div>
                  <div>
                    <div className="font-medium">diana</div>
                    <div className="text-xs text-[rgba(255,255,255,0.6)]">instance-b</div>
                  </div>
                </div>
                <button className="text-sm text-[var(--primary)]">Connect</button>
              </li>
            </ul>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Trends</h4>
              <div className="text-sm text-[rgba(255,255,255,0.7)]">#federation</div>
              <div className="text-sm text-[rgba(255,255,255,0.7)]">#privacy</div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
