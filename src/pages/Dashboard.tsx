import PostForm from "../components/PostForm";
import Navbar from "../components/Navbar";
import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getPosts, getUser, getRandomUsers, initiateConnection, acceptConnection, getPendingConnections, getFollowedPosts } from "../api/api";
import { timeAgo } from "../utils/time";
import type { Post } from "../types/post";
import SketchCard from "../components/SketchCard";
import SkeletonPost from "../components/SkeletonPost";
import { motion, AnimatePresence } from "framer-motion";
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

  const mainRef = useRef<HTMLElement>(null);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [showNewPostsBtn, setShowNewPostsBtn] = useState(false);
  const [showScrollTopBtn, setShowScrollTopBtn] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'following'>('global');
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [followedPosts, setFollowedPosts] = useState<Post[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  const handleConnect = async (e: React.MouseEvent, targetUsername: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await initiateConnection(targetUsername);
      setSentRequests(prev => {
        const next = new Set(prev);
        next.add(targetUsername);
        return next;
      });
    } catch (err) {
      console.error("Failed to connect", err);
    }
  };

  const handleAccept = async (connectionId: string) => {
    try {
      await acceptConnection(connectionId);
      setPendingInvites(prev => prev.filter(i => i.connection_id !== connectionId));
    } catch (err) {
      console.error("Failed to accept", err);
    }
  };

  // Fetch users for sidebar
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getRandomUsers();
        const usersData = Array.isArray(res.data) ? res.data : (res.data?.users || []);
        const mappedUsers = usersData.map((u: any) => ({
          username: u.username || u,
          instance: u.instance || 'local'
        }));
        setSuggestedUsers(mappedUsers);
      } catch (e) {
        console.error("Failed to fetch users", e);
        setSuggestedUsers([]);
      }
    };
    fetchUsers();
  }, []);

  // Fetch Pending Invites
  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const res = await getPendingConnections();
        setPendingInvites(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to fetch pending invites", e);
      }
    };
    fetchInvites();
  }, []);

  // Fetch Following Feed
  useEffect(() => {
    if (activeTab === 'following') {
      const loadFollowing = async () => {
        setLoadingFollowing(true);
        try {
          const res = await getFollowedPosts();
          const data = res.data || [];
          const sorted = data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setFollowedPosts(sorted);
        } catch (e) {
          console.error("Failed to load following feed", e);
        } finally {
          setLoadingFollowing(false);
        }
      };
      loadFollowing();
    }
  }, [activeTab]);


  // Poll for new posts
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await getPosts(1); // Fetch just the latest
        const latestInfo = res.data?.[0];
        // If we have posts and the latest fetched post is newer than our top post
        if (latestInfo && posts.length > 0 && latestInfo.id !== posts[0].id) {
          setHasNewPosts(true);
        }
      } catch (err) {
        // ignore polling errors
      }
    }, 15000); // Check every 15s

    return () => clearInterval(interval);
  }, [posts]);

  // Handle scroll to show buttons
  const handleScroll = () => {
    if (!mainRef.current) return;
    const scrollTop = mainRef.current.scrollTop;

    // Show "New Posts" button if we have new posts AND we are scrolled down a bit
    if (scrollTop > 100 && hasNewPosts) {
      setShowNewPostsBtn(true);
    } else {
      setShowNewPostsBtn(false);
    }

    // Show "Scroll Top" button if scrolled down significantly
    if (scrollTop > 300) {
      setShowScrollTopBtn(true);
    } else {
      setShowScrollTopBtn(false);
    }
  };

  const handleRefreshClick = () => {
    loadPosts();
    setHasNewPosts(false);
    setShowNewPostsBtn(false);
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[var(--bg-surface)]">

      {/* --- Top Navigation Bar --- */}
      <Navbar />

      {/* --- Main Content Grid --- */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-12 gap-8 h-full">

        {/* --- LEFT SIDEBAR: Available Users --- */}
        <aside className="md:col-span-3 hidden md:block h-full overflow-y-auto pb-4 scrollbar-hide space-y-6">
          <SketchCard variant="sticky" rotate={-1} className="p-4" pinned pinColor="#ef4444">
            <h3 className="font-sketch text-xl mb-3 border-b-2 border-black/10 pb-2">Available Users</h3>
            <div className="space-y-3">
              {suggestedUsers.length > 0 ? (
                <>
                  {suggestedUsers.slice(0, showAllUsers ? undefined : 2).map((u: any) => (
                    <Link key={u.username} to={`/profile/${u.username}`} className="block group relative">
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 transition-colors border border-transparent hover:border-black/10">
                        <div className="w-10 h-10 rounded-full bg-[var(--pastel-mint)] border border-black flex items-center justify-center font-sketch text-lg shrink-0">
                          {u.username[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden flex-1">
                          <div className="font-bold font-hand truncate">{u.username}</div>
                          <div className="text-xs bg-black/10 px-1.5 rounded-full inline-block truncate max-w-full">
                            {u.instance || 'local'}
                          </div>
                        </div>

                        {/* Connect Button */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2">
                          {sentRequests.has(u.username) ? (
                            <span className="text-xs font-hand text-green-600 bg-green-100 px-2 py-1 rounded-full border border-green-200">
                              Sent ✓
                            </span>
                          ) : (
                            <button
                              onClick={(e) => handleConnect(e, u.username)}
                              className="bg-[var(--ink-blue)] text-white text-xs px-2 py-1.5 rounded font-hand shadow-sm hover:scale-105 hover:shadow-md transition-all flex items-center gap-1"
                            >
                              <span>+</span> Connect
                            </button>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}

                  {suggestedUsers.length > 2 && (
                    <button
                      onClick={() => setShowAllUsers(!showAllUsers)}
                      className="w-full text-center text-sm font-hand text-[var(--ink-blue)] hover:underline mt-1 bg-transparent border-none shadow-none"
                    >
                      {showAllUsers ? "Show Less" : "Show More"}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-4 font-hand opacity-50">Searching for signs of life...</div>
              )}
            </div>
          </SketchCard>

          {/* Navigation Links moved to small sticky note */}
          <SketchCard variant="paper" rotate={1} className="p-3 bg-[var(--pastel-yellow)]">
            <nav className="flex flex-col gap-2 font-hand text-lg">
              <Link to="/" className="hover:underline">🏠 Home</Link>
              <Link to="/settings" className="hover:underline">⚙️ Settings</Link>
            </nav>
          </SketchCard>
        </aside>


        {/* --- CENTER FEED --- */}
        <main
          ref={mainRef}
          onScroll={handleScroll}
          className="md:col-span-6 h-full overflow-y-auto px-2 pb-20 no-scrollbar relative"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="space-y-8">
            {/* Create Post Card */}
            <div className="relative z-10">
              <PostForm onPosted={() => loadPosts()} />
            </div>

            {/* Refresh / Feed Header (Folder Tabs Style) */}
            <div className="flex flex-col gap-2 relative z-20 mt-4 px-2">
              <div className="flex justify-between items-end">
                <div className="flex items-end gap-0 relative top-[2px]">
                  {/* GLOBAL TAB */}
                  <button
                    onClick={() => setActiveTab('global')}
                    className={`
                        relative px-6 py-2 rounded-t-lg border-2 border-b-0 transition-all duration-200
                        ${activeTab === 'global'
                        ? 'bg-[var(--paper-white)] border-black font-sketch font-bold text-xl z-20 pb-3'
                        : 'bg-black/5 border-transparent text-gray-500 font-hand text-lg hover:bg-black/10 z-10 mb-1'}
                     `}
                  >
                    Global
                    {/* Tab highlight/shine */}
                    {activeTab === 'global' && <div className="absolute top-1 left-2 right-2 h-[2px] bg-white/50 rounded-full"></div>}
                  </button>

                  {/* FOLLOWING TAB */}
                  <button
                    onClick={() => setActiveTab('following')}
                    className={`
                        relative px-6 py-2 rounded-t-lg border-2 border-b-0 transition-all duration-200 -ml-1
                        ${activeTab === 'following'
                        ? 'bg-[var(--paper-white)] border-black font-sketch font-bold text-xl z-20 pb-3'
                        : 'bg-black/5 border-transparent text-gray-500 font-hand text-lg hover:bg-black/10 z-10 mb-1'}
                     `}
                  >
                    Following
                  </button>
                </div>

                {/* Refresh Button (moved to right) */}
                <button onClick={loadPosts} className="font-hand text-sm hover:text-[var(--ink-blue)] mb-2 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                  <span>↻</span> Refresh
                </button>
              </div>

              {/* Divider Line connecting tabs */}
              <div className="w-full h-0 border-b-2 border-black relative z-10"></div>
            </div>

            {/* New Posts Indicator */}
            <AnimatePresence>
              {showNewPostsBtn && activeTab === 'global' && (
                <motion.button
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  onClick={handleRefreshClick}
                  className="sticky top-4 left-1/2 -translate-x-1/2 z-30 bg-[var(--pastel-blue)] text-black font-sketch px-5 py-2 rounded-full shadow-lg border-2 border-black flex items-center gap-2 hover:scale-105 transition-transform mx-auto"
                >
                  <span className="text-xl">↑</span> New Notes!
                </motion.button>
              )}
            </AnimatePresence>

            {/* Scroll to Top */}
            <AnimatePresence>
              {showScrollTopBtn && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={handleScrollToTop}
                  className="sticky bottom-6 left-[90%] z-30 bg-black text-white w-10 h-10 rounded-full shadow-xl flex items-center justify-center hover:bg-[var(--ink-blue)] transition-colors"
                >
                  ↑
                </motion.button>
              )}
            </AnimatePresence>

            {/* ERROR */}
            {error && (
              <div className="bg-[var(--pastel-pink)] border-2 border-red-400 p-4 rounded text-center font-hand text-red-800 rotate-1">
                ⚠️ {String(error)}
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="space-y-8">
                <SkeletonPost />
                <SkeletonPost />
              </div>
            )}

            {/* POSTS - GLOBAL */}
            {activeTab === 'global' && (
              <>
                <AnimatePresence mode="popLayout">
                  {!loading && posts.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', bounce: 0.3 }}
                      className="mb-8"
                    >
                      <SketchCard className="group hover:-translate-y-1 transition-transform bg-white relative">
                        {/* Tape effect top center */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-100/50 border-l border-r border-white/40 rotate-1 shadow-sm opacity-80 backdrop-blur-sm pointer-events-none"></div>

                        <div className="p-5">
                          {/* Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <Link to={`/profile/${p.author}`}>
                                <div className="w-10 h-10 rounded-full bg-gray-100 border border-black flex items-center justify-center font-bold font-marker text-sm">
                                  {p.author ? p.author[0].toUpperCase() : '?'}
                                </div>
                              </Link>
                              <div>
                                <div className="font-bold font-sketch text-lg leading-none">
                                  <Link to={`/profile/${p.author}`} className="hover:underline">{p.author}</Link>
                                </div>
                                <div className="text-xs font-hand text-gray-500">{timeAgo(p.created_at)}</div>
                              </div>
                            </div>
                            {p.origin_instance && (
                              <span className="bg-[var(--pastel-lavender)] px-2 py-0.5 rounded text-xs border border-black/10 font-hand">
                                {p.origin_instance}
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="font-hand text-xl leading-relaxed whitespace-pre-wrap pl-1">
                            {p.content}
                          </div>
                        </div>
                      </SketchCard>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {!loading && posts.length === 0 && (
                  <div className="text-center py-20 opacity-50 font-hand text-xl">
                    No scribbles here yet. Be the first!
                  </div>
                )}
              </>
            )}

            {/* POSTS - FOLLOWING */}
            {activeTab === 'following' && (
              <>
                {loadingFollowing && (
                  <div className="space-y-8">
                    <SkeletonPost />
                    <SkeletonPost />
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {!loadingFollowing && followedPosts.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', bounce: 0.3 }}
                      className="mb-8"
                    >
                      <SketchCard className="group hover:-translate-y-1 transition-transform bg-white relative">
                        {/* Tape effect top center */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-100/50 border-l border-r border-white/40 rotate-1 shadow-sm opacity-80 backdrop-blur-sm pointer-events-none"></div>

                        <div className="p-5">
                          {/* Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <Link to={`/profile/${p.author}`}>
                                <div className="w-10 h-10 rounded-full bg-gray-100 border border-black flex items-center justify-center font-bold font-marker text-sm">
                                  {p.author ? p.author[0].toUpperCase() : '?'}
                                </div>
                              </Link>
                              <div>
                                <div className="font-bold font-sketch text-lg leading-none">
                                  <Link to={`/profile/${p.author}`} className="hover:underline">{p.author}</Link>
                                </div>
                                <div className="text-xs font-hand text-gray-500">{timeAgo(p.created_at)}</div>
                              </div>
                            </div>
                            {p.origin_instance && (
                              <span className="bg-[var(--pastel-lavender)] px-2 py-0.5 rounded text-xs border border-black/10 font-hand">
                                {p.origin_instance}
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="font-hand text-xl leading-relaxed whitespace-pre-wrap pl-1">
                            {p.content}
                          </div>
                        </div>
                      </SketchCard>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {!loadingFollowing && followedPosts.length === 0 && (
                  <div className="text-center py-20 opacity-60">
                    <div className="text-6xl mb-4">👥</div>
                    <div className="font-sketch text-2xl">Following Feed</div>
                    <p className="font-hand text-lg mt-2">No posts from your circle yet.</p>
                    <p className="font-hand text-sm text-gray-500">Connect with people to see their scribbles here!</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>


        {/* --- RIGHT SIDEBAR: Info / Status --- */}
        <aside className="md:col-span-3 hidden lg:block h-full overflow-y-auto p-4 no-scrollbar space-y-6">
          {/* Pending Invites */}
          <SketchCard variant="sticky" rotate={-2} className="p-4 bg-[var(--pastel-pink)]" pinned pinColor="#ec4899">
            <h3 className="font-sketch text-xl mb-3 border-b-2 border-black/10 pb-2">Pending Invites</h3>
            <div className="space-y-3">
              {pendingInvites.length > 0 ? (
                pendingInvites.map((invite: any) => (
                  <div key={invite.connection_id} className="bg-white/50 p-2 rounded border border-black/5 flex items-center justify-between">
                    <div className="font-hand text-sm truncate w-24">
                      {invite.from_username || "Unknown"}
                    </div>
                    <button
                      onClick={() => handleAccept(invite.connection_id)}
                      className="bg-white border border-black/20 hover:bg-green-100 text-xs px-2 py-1 rounded font-bold text-green-700 shadow-sm"
                    >
                      Accept
                    </button>
                  </div>
                ))
              ) : (
                <div className="font-hand text-sm text-center opacity-60 italic py-2">
                  No pending invites...
                </div>
              )}
            </div>
          </SketchCard>

          <SketchCard variant="sticky" rotate={2} className="p-5 bg-[var(--pastel-blue)]" pinned pinColor="#2563eb">
            <h3 className="font-sketch text-xl mb-4 text-center">Network Status</h3>
            <div className="space-y-4 font-hand">
              <div className="flex items-center justify-between">
                <span>Target Instance:</span>
                <span className="font-bold">Instance A</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Federation:</span>
                <span className="text-green-700 font-bold bg-green-100 px-2 rounded-full">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sync:</span>
                <span className="animate-pulse">● Live</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-dashed border-black/20 text-xs text-center">
              v1.2.0 • Federated
            </div>
          </SketchCard>

          <SketchCard rotate={-1} className="p-4">
            <h3 className="font-sketch font-bold text-lg mb-2">Activity Log</h3>
            <ul className="text-sm font-hand space-y-2 opacity-80">
              <li>• New user joined from Local</li>
              <li>• Instance B federated 2m ago</li>
              <li>• System update pending</li>
            </ul>
          </SketchCard>

          {/* Decorative Doodles moved here or kept simple */}
          <div className="text-center">
            <div className="inline-block p-4 border-2 border-dashed border-gray-300 rounded-full rotate-3 bg-white">
              ✒️ 📸 📌
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
