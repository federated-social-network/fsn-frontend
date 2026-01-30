import PostForm from "../components/PostForm";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getPosts, getUser } from "../api/api";
import { timeAgo } from "../utils/time";
import type { Post } from "../types/post";
import SketchCard from "../components/SketchCard";
import SkeletonPost from "../components/SkeletonPost";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";

export default function Dashboard() {
  const username = localStorage.getItem("username") || "";

  const [posts, setPosts] = useState<Post[]>([]);
  const [userPostCount, setUserPostCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPosts();
      const postsData = res.data || [];
      const sortedPosts = postsData.sort((a: Post, b: Post) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      setPosts(sortedPosts);
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

    const handler = () => {
      loadPosts();
    };
    window.addEventListener("post:created", handler as EventListener);
    return () => {
      mounted = false;
      window.removeEventListener("post:created", handler as EventListener);
    };
  }, [loadPosts]);

  useEffect(() => {
    let mounted = true;
    if (!username) return;
    const loadUser = async () => {
      try {
        const res = await getUser(username);
        if (mounted) setUserPostCount(res.data?.post_count ?? 0);
      } catch (err) {
        if (mounted) setUserPostCount(null);
      }
    };
    loadUser();
    return () => { mounted = false; };
  }, [username]);

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <ThemeToggle />

      {/* Fixed Header/Nav could go here if we had one, but we have sidebar nav */}

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-12 gap-8 h-full">

        {/* --- Left Sidebar: Profile (Static) --- */}
        <aside className="md:col-span-3 space-y-8 hidden md:block h-full overflow-y-auto pb-4 scrollbar-hide">
          <SketchCard rotate={-1} pinned pinColor="#ef4444">
            <div className="p-4 text-center">
              <Link to={`/profile/${username}`} className="inline-block relative mb-2">
                <div className="w-24 h-24 mx-auto rounded-full border-4 border-[var(--ink-primary)] overflow-hidden shadow-sm bg-[var(--paper-cream)] flex items-center justify-center">
                  <span className="font-sketch text-4xl text-[var(--ink-blue)] font-bold">
                    {username ? username[0].toUpperCase() : 'U'}
                  </span>
                </div>
              </Link>

              <h3 className="text-2xl font-bold font-sketch truncate">{username || 'Guest'}</h3>

              <div className="grid grid-cols-2 gap-2 text-sm border-t-2 border-dashed border-[var(--ink-secondary)] pt-4 mt-2">
                <div className="flex flex-col">
                  <span className="font-bold  text-[var(--ink-primary)] text-lg">{userPostCount ?? posts.filter(p => p.author === username).length}</span>
                  <span className="font-hand text-[var(--ink-secondary)]">Posts</span>
                </div>
                <div className="flex flex-col border-l-2 border-dashed border-[var(--ink-secondary)]">
                  <span className="font-bold text-[var(--ink-primary)] text-lg">{Math.max(5, Math.floor(posts.length * 1.5))}</span>
                  <span className="font-hand text-[var(--ink-secondary)]">Karma</span>
                </div>
              </div>

              <Link to={`/profile/${username}`} className="mt-6 block w-full py-2 bg-[var(--ink-blue)] text-white font-sketch rounded shadow-[2px_2px_0px_rgba(0,0,0,0.8)] hover:translate-y-px hover:shadow-none transition-all">
                My Notebook
              </Link>
            </div>
          </SketchCard>

          <SketchCard variant="paper" rotate={1} className="p-4" pinned pinColor="#3b82f6">
            <nav className="flex flex-col space-y-2 font-hand text-lg">
              <Link to="/" className="flex items-center gap-2 px-2 hover:bg-black/5 rounded">
                <span className="text-2xl">🏠</span> Home
              </Link>
              <Link to="/settings" className="flex items-center gap-2 px-2 hover:bg-black/5 rounded">
                <span className="text-2xl">⚙️</span> Settings
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("username");
                  localStorage.removeItem("password");
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("AUTH_TOKEN");
                  window.location.href = "/login";
                }}
                className="flex items-center gap-2 px-2 text-red-600 hover:bg-red-500/10 rounded w-full text-left"
              >
                <span className="text-2xl">🚪</span> Sign Out
              </button>
            </nav>
          </SketchCard>
        </aside>

        {/* --- Main Feed (Scrollable) --- */}
        <main className="md:col-span-6 h-full overflow-y-auto px-2 pb-20 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="space-y-10">
            <div className="relative z-10 pt-2">
              <PostForm onPosted={() => loadPosts()} />
            </div>

            <div className="flex items-center justify-between px-2 pb-2 border-b-2 border-black sticky top-0 bg-[var(--bg-surface)]/95 backdrop-blur z-20">
              <h2 className="font-sketch text-3xl font-bold">Latest Scribbles</h2>
              <button onClick={loadPosts} className="font-hand text-lg hover:underline decoration-wavy">
                ↻ Refresh
              </button>
            </div>

            <div className="space-y-8">
              {/* Error State */}
              {error && (
                <SketchCard variant="sticky" className="bg-red-100 rotate-1">
                  <div className="p-4 text-center text-red-800 font-hand font-bold text-xl">
                    ⚠️ {String(error)}
                    <button onClick={loadPosts} className="block mx-auto mt-2 underline">Try Again</button>
                  </div>
                </SketchCard>
              )}

              {/* Loading State */}
              {loading && (
                <div className="space-y-12">
                  <SkeletonPost />
                  <SkeletonPost />
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && posts.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="font-sketch text-3xl mb-2 text-[var(--ink-secondary)]">Page is empty...</h3>
                  <p className="font-hand text-xl">Start writing something above!</p>
                </div>
              )}

              {/* Post List */}
              <AnimatePresence mode="popLayout">
                {!loading && posts.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 50, rotate: -2 }}
                    animate={{ opacity: 1, y: 0, rotate: idx % 2 === 0 ? 1 : -1 }}
                    transition={{ type: 'spring', bounce: 0.4 }}
                    className="mb-8"
                  >
                    <SketchCard className="group">
                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <Link to={`/profile/${p.author}`} className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full border-2 border-black bg-white flex items-center justify-center font-sketch font-bold text-xl hover:scale-110 transition-transform">
                              {p.author ? p.author[0].toUpperCase() : '?'}
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0 pt-1">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <Link to={`/profile/${p.author}`} className="font-bold font-hand text-xl hover:underline decoration-2 decoration-[var(--ink-blue)]">
                                {p.author}
                              </Link>
                              <span className="text-sm font-hand text-[var(--ink-secondary)]">wrote {timeAgo(p.created_at)}</span>
                            </div>
                            {p.origin_instance && (
                              <span className="inline-block bg-[var(--highlighter-yellow)] px-2 -rotate-1 text-xs font-heading mt-1">
                                via @{p.origin_instance}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="font-hand text-xl leading-relaxed whitespace-pre-wrap break-words border-l-4 border-[var(--ink-blue)] pl-4 py-1 ml-2">
                          {p.content}
                        </div>
                      </div>
                    </SketchCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* --- Right Sidebar: Suggestions (Static) --- */}
        <aside className="md:col-span-3 hidden lg:block h-full overflow-y-auto pb-4 space-y-8">
          <SketchCard variant="sticky" rotate={2} className="p-4" pinned pinColor="#10b981">
            <h3 className="font-sketch text-xl mb-4 text-center border-b-2 border-black pb-2">Cool People</h3>
            <ul className="space-y-3 font-hand text-lg">
              {[
                { name: 'Alice', instance: 'instance-a' },
                { name: 'Bob', instance: 'instance-b' },
                { name: 'Charlie', instance: 'local' }
              ].map((u) => (
                <li key={u.name} className="flex items-center justify-between border-b border-dashed border-gray-400 pb-2 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border border-black bg-white flex items-center justify-center text-sm font-bold">
                      {u.name[0]}
                    </div>
                    <span className="truncate max-w-[80px]">{u.name}</span>
                  </div>
                  <button className="text-sm text-[var(--ink-blue)] underline decoration-wavy hover:bg-white/50 px-1 rounded">
                    Add +
                  </button>
                </li>
              ))}
            </ul>
          </SketchCard>

          <SketchCard rotate={-2} className="p-5">
            <h3 className="font-sketch font-bold text-2xl mb-4">Trending #</h3>
            <div className="flex flex-wrap gap-2 font-hand">
              {['art', 'sketch', 'design', 'federation', 'wip'].map(tag => (
                <span key={tag} className="bg-black/5 px-2 py-1 rounded border border-black/20 hover:bg-[var(--highlighter-green)] hover:-rotate-2 transition-all cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          </SketchCard>

          <div className="text-center font-hand text-sm opacity-60">
            <p>Built with 🖊️ & ☕</p>
          </div>
        </aside>

      </div>
    </div>
  );
}
