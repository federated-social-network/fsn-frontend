import PostForm from "../components/PostForm";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getPosts, getUser } from "../api/api";
import { timeAgo } from "../utils/time";
import type { Post } from "../types/post";

export default function Dashboard() {
  const username = localStorage.getItem("username") || "";
  const userid = localStorage.getItem("userid") || "";
  const [posts, setPosts] = useState<Post[]>([]);
  const [userPostCount, setUserPostCount] = useState<number | null>(null);
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

  // load post count for the logged-in user (so sidebar shows that user's post count,
  // not the total posts in the feed)
  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      if (!username) return;
      try {
        const res = await getUser(username);
        if (!mounted) return;
        setUserPostCount(res.data?.post_count ?? 0);
      } catch (err) {
        console.warn("Failed to load user stats", err);
        setUserPostCount(null);
      }
    };
    loadUser();
    return () => { mounted = false; };
  }, [username]);

  return (
    <div className="min-h-screen bg-[transparent]">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Left sidebar: profile card */}
        <aside className="md:col-span-3">
          <div className="sticky top-6">
            <div className="bg-gradient-to-b from-[rgba(10,167,198,0.12)] to-transparent rounded-xl overflow-hidden shadow-lg">
              <div className="h-20 bg-[linear-gradient(90deg,var(--primary),rgba(10,167,198,0.25))]"></div>
              <div className="bg-[var(--bg-muted)] p-4 border-t border-[var(--muted-border)]">
                <div className="-mt-12 flex items-center gap-3">
                  <Link to={`/profile/${username}`} className="block">
                    <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-[var(--primary)] font-bold text-lg ring-4 ring-[rgba(0,0,0,0.25)]">{username ? username[0].toUpperCase() : 'U'}</div>
                  </Link>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{username || 'Your Name'}</div>
                    <div className="text-xs text-[rgba(255,255,255,0.6)]">Member • {userid ? `ID ${userid}` : "—"}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-sm font-semibold">{userPostCount ?? posts.filter(p => p.author === username).length}</div>
                      <div className="text-xs text-[rgba(255,255,255,0.6)]">Posts</div>
                    </div>
                  <div>
                    <div className="text-sm font-semibold">{Math.max(5, Math.floor(posts.length * 1.5))}</div>
                    <div className="text-xs text-[rgba(255,255,255,0.6)]">Connections</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{Math.max(2, Math.floor(posts.length * 0.8))}</div>
                    <div className="text-xs text-[rgba(255,255,255,0.6)]">Views</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Link to={`/profile/${username}`} className="w-full block text-center px-3 py-2 rounded-md bg-[var(--primary)] text-white hover:opacity-95">View profile</Link>
                  <button className="w-full block text-center px-3 py-2 rounded-md border border-[var(--muted-border)] hover:bg-[rgba(255,255,255,0.02)]">My network</button>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold mb-2">Quick actions</h4>
              <div className="flex flex-col gap-2">
                <Link to="/" className="text-sm px-3 py-2 rounded hover:bg-[rgba(255,255,255,0.02)]">Create post</Link>
                  <Link to="/settings" className="text-sm px-3 py-2 rounded hover:bg-[rgba(255,255,255,0.02)]">Settings</Link>
                <button
                  onClick={() => {
                    localStorage.removeItem("username");
                    localStorage.removeItem("password");
                    window.location.href = "/login";
                  }}
                  className="text-sm px-3 py-2 rounded border border-[var(--muted-border)] hover:bg-[rgba(255,255,255,0.02)]"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main feed */}
        <main className="md:col-span-6">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Home</h2>
            <p className="text-sm text-[rgba(255,255,255,0.7)]">Welcome back{username ? `, ${username}` : ""} — catch up with your network.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-xl p-4 shadow-md">
              <PostForm onPosted={() => loadPosts()} />
            </div>

            {loading && <div className="text-sm text-[rgba(255,255,255,0.7)]">Loading posts…</div>}
            {error && <div className="text-sm text-red-400">Error: {String(error)}</div>}

            {!loading && posts.length === 0 && (
              <div className="p-4 bg-[var(--bg-muted)] rounded-lg border border-[var(--muted-border)]">No posts yet — start the conversation.</div>
            )}

            {posts.map((p) => (
              <article key={p.id} className="bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <Link to={`/profile/${p.author}`} className="w-12 h-12 flex-shrink-0 block">
                    <div className="w-12 h-12 rounded-full bg-[rgba(10,167,198,0.12)] flex items-center justify-center text-[var(--primary)] font-bold">{p.author ? p.author[0].toUpperCase() : 'U'}</div>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link to={`/profile/${p.author}`} className="font-semibold hover:underline">{p.author}</Link>
                        <div className="text-xs text-[rgba(255,255,255,0.6)]">{p.origin_instance || 'local'}</div>
                      </div>
                      <div className="text-xs text-[rgba(255,255,255,0.6)]">{timeAgo(p.created_at)}</div>
                    </div>
                      <p className="mt-2 text-[rgba(255,255,255,0.9)]">{p.content}</p>

                    <div className="mt-3 flex items-center gap-4 text-sm text-[rgba(255,255,255,0.7)]">
                      <button className="px-2 py-1 rounded-md hover:bg-[rgba(255,255,255,0.02)]">Like</button>
                      <button className="px-2 py-1 rounded-md hover:bg-[rgba(255,255,255,0.02)]">Comment</button>
                      <button className="px-2 py-1 rounded-md hover:bg-[rgba(255,255,255,0.02)]">Share</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>

        {/* Right sidebar: suggestions, trends */}
        <aside className="md:col-span-3">
          <div className="sticky top-6 space-y-4">
            <div className="bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-3">People you may know</h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[rgba(10,167,198,0.12)] flex items-center justify-center text-[var(--primary)] font-bold">C</div>
                    <div>
                      <div className="font-medium">charlie</div>
                      <div className="text-xs text-[rgba(255,255,255,0.6)]">instance-a</div>
                    </div>
                  </div>
                  <button className="text-sm text-[var(--primary)] border border-[var(--muted-border)] rounded px-3 py-1">Connect</button>
                </li>

                <li className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[rgba(10,167,198,0.12)] flex items-center justify-center text-[var(--primary)] font-bold">D</div>
                    <div>
                      <div className="font-medium">diana</div>
                      <div className="text-xs text-[rgba(255,255,255,0.6)]">instance-b</div>
                    </div>
                  </div>
                  <button className="text-sm text-[var(--primary)] border border-[var(--muted-border)] rounded px-3 py-1">Connect</button>
                </li>
              </ul>
            </div>

            <div className="bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold mb-2">Trends</h4>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded bg-[rgba(255,255,255,0.02)]">#federation</span>
                <span className="text-xs px-2 py-1 rounded bg-[rgba(255,255,255,0.02)]">#privacy</span>
                <span className="text-xs px-2 py-1 rounded bg-[rgba(255,255,255,0.02)]">#opensource</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
