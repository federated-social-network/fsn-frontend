import PostForm from "../components/PostForm";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getPosts, getUser } from "../api/api";
import { timeAgo } from "../utils/time";
import type { Post } from "../types/post";
import GlassCard from "../components/GlassCard";
import SkeletonPost from "../components/SkeletonPost";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";

export default function Dashboard() {
  const username = localStorage.getItem("username") || "";
  const userid = localStorage.getItem("userid") || "";
  const [posts, setPosts] = useState<Post[]>([]);
  const [userPostCount, setUserPostCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true); // Default to true for better initial UX
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPosts();
      const postsData = res.data || [];
      // Sort posts by created_at in descending order (newest first)
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
        // silent fail for stats
        if (mounted) setUserPostCount(null);
      }
    };
    loadUser();
    return () => { mounted = false; };
  }, [username]);

  // Background for the dashboard - Minimal Hybrid Pattern
  const background = (
    <div className="fixed inset-0 pointer-events-none -z-10 w-full h-full opacity-10"
      style={{
        backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
        backgroundSize: '24px 24px'
      }}
    />
  ); 

  return (
    <div className="min-h-screen relative text-surface">
      <ThemeToggle />
      {background}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* --- Left Sidebar: Profile --- */}
        <aside className="md:col-span-3 space-y-6 hidden md:block">
          <div className="sticky top-24 space-y-6">
            <GlassCard>
              <div className="h-24 bg-[var(--bg-muted)] border-b border-[var(--muted-border)]"></div>
              <div className="px-5 pb-5">
                <div className="-mt-12 mb-3">
                  <Link to={`/profile/${username}`} className="inline-block relative">
                    <div className="w-20 h-20 rounded-2xl bg-[var(--bg-surface)] p-1 shadow-lg border border-[var(--muted-border)]">
                      <div className="w-full h-full rounded-xl bg-[var(--bg-muted)] flex items-center justify-center text-[var(--primary)] text-2xl font-bold">
                        {username ? username[0].toUpperCase() : 'U'}
                      </div>
                    </div>
                  </Link>
                </div>

                <h3 className="text-xl font-bold truncate font-['Cabin_Sketch'] tracking-wide">{username || 'Guest'}</h3>
                <p className="text-sm text-surface-subtle mb-4">{userid ? `@user-${userid}` : 'Anonymous'}</p>

                <div className="flex items-center justify-between py-3 border-t border-[var(--muted-border)] text-sm">
                  <span className="text-surface-subtle">Posts</span>
                  <span className="font-semibold">{userPostCount ?? posts.filter(p => p.author === username).length}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-[var(--muted-border)] text-sm">
                  <span className="text-surface-subtle">Connections</span>
                  <span className="font-semibold">{Math.max(5, Math.floor(posts.length * 1.5))}</span>
                </div>

                <Link to={`/profile/${username}`} className="mt-4 block w-full py-2 bg-[var(--primary)] text-white font-medium text-center rounded-lg hover:bg-[var(--primary-600)] transition-colors">
                  View Profile
                </Link>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <nav className="flex flex-col space-y-1">
                <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-muted)] text-[var(--primary)] font-medium">
                  <span>Home</span>
                </Link>
                <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-muted)] transition-colors text-surface-muted hover:text-surface">
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem("username");
                    localStorage.removeItem("password");
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("AUTH_TOKEN");
                    window.location.href = "/login";
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-surface-muted hover:text-red-400 transition-colors text-left"
                >
                  <span>Sign Out</span>
                </button>
              </nav>
            </GlassCard>
          </div>
        </aside>

        {/* --- Main Feed --- */}
        <main className="md:col-span-6 space-y-6">
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-4 sm:p-6">
              <PostForm onPosted={() => loadPosts()} />
            </div>
          </GlassCard>

          <div className="flex items-center justify-between text-sm text-surface-subtle px-2">
            <p className="font-['Cabin_Sketch'] text-xl font-bold">Recent Updates</p>
            <button onClick={loadPosts} className="hover:text-[var(--primary)] transition-colors">
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            {/* Error State */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm">
                {String(error)}
                <button onClick={loadPosts} className="block mx-auto mt-2 text-[var(--primary)] hover:underline">Try Again</button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <>
                <SkeletonPost />
                <SkeletonPost />
                <SkeletonPost />
              </>
            )}

            {/* Empty State */}
            {!loading && !error && posts.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No posts yet</h3>
                <p className="text-surface-subtle">Be the first to share something.</p>
              </div>
            )}

            {/* Post List */}
            <AnimatePresence mode="popLayout">
              {!loading && posts.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  layout
                >
                  <GlassCard hoverEffect variant="note" className="relative group overflow-visible">
                    <div className="p-5 relative z-10">
                      <div className="flex items-start gap-4">
                        <Link to={`/profile/${p.author}`} className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-[var(--bg-muted)] border border-[var(--muted-border)] flex items-center justify-center font-bold text-[var(--primary)]">
                            {p.author ? p.author[0].toUpperCase() : '?'}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <Link to={`/profile/${p.author}`} className="font-semibold hover:text-[var(--primary)] transition-colors truncate">
                              {p.author}
                            </Link>
                            <span className="text-xs text-surface-subtle whitespace-nowrap ml-2">
                              {timeAgo(p.created_at)}
                            </span>
                          </div>
                          {p.origin_instance && (
                            <div className="text-xs text-surface-subtle mb-3 bg-white/5 inline-block px-2 py-0.5 rounded-full border border-white/5">
                              @{p.origin_instance}
                            </div>
                          )}
                          <p className="text-surface leading-relaxed whitespace-pre-wrap break-words">
                            {p.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>

        {/* --- Right Sidebar: Suggestions --- */}
        <aside className="md:col-span-3 hidden lg:block">
          <div className="sticky top-24 space-y-6 block">
            <GlassCard className="p-5">
              <h3 className="font-bold mb-4 text-xl uppercase tracking-wider text-surface font-['Cabin_Sketch']">Suggested</h3>
              <ul className="space-y-4">
                {[
                  { name: 'Alice', instance: 'instance-a' },
                  { name: 'Bob', instance: 'instance-b' },
                  { name: 'Charlie', instance: 'local' }
                ].map((u) => (
                  <li key={u.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-muted)] border border-[var(--muted-border)] flex items-center justify-center text-xs font-bold text-[var(--primary)]">
                        {u.name[0]}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-sm font-medium truncate">{u.name}</div>
                        <div className="text-[10px] text-surface-subtle truncate">{u.instance}</div>
                      </div>
                    </div>
                    <button className="text-xs text-[var(--primary)] hover:bg-[var(--primary)]/10 px-2 py-1 rounded transition-colors">
                      Connect
                    </button>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="font-bold mb-4 text-xl uppercase tracking-wider text-surface font-['Cabin_Sketch']">Trending</h3>
              <div className="flex flex-wrap gap-2">
                {['federation', 'tech', 'privacy', 'web3', 'opensource', 'future'].map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1.5 rounded-lg bg-[var(--bg-muted)] border border-[var(--muted-border)] hover:border-[var(--primary)]/50 cursor-pointer transition-colors text-surface-subtle hover:text-surface">
                    #{tag}
                  </span>
                ))}
              </div>
            </GlassCard>

            <div className="text-xs text-surface-subtle text-center px-4">
              <p>© 2025 Federated Social Network.</p>
              <p className="mt-1">Decentralized & Open Source.</p>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
