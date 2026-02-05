import PostForm from "../components/PostForm";
import Navbar from "../components/Navbar";
import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getPosts, getRandomUsers, initiateConnection, acceptConnection, getPendingConnections, getFollowedPosts } from "../api/api";
import { timeAgo } from "../utils/time";
import { parseUsername } from "../utils/user";
import { INSTANCES, getInstanceName, getInstanceColor } from "../config/instances";
import type { Post } from "../types/post";
import SketchCard from "../components/SketchCard";
import SkeletonPost from "../components/SkeletonPost";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../components/ConfirmationModal";

export default function Dashboard() {

  const [posts, setPosts] = useState<Post[]>([]);
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const [pendingInstanceUrl, setPendingInstanceUrl] = useState<string | null>(null);
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
  const [showMobileExtras, setShowMobileExtras] = useState(false);

  const handleConnect = async (e: React.MouseEvent, targetUsername: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic Update: Assume success immediately
    setSentRequests(prev => {
      const next = new Set(prev);
      next.add(targetUsername);
      return next;
    });

    try {
      await initiateConnection(targetUsername);
    } catch (err) {
      console.error("Failed to connect", err);
      // Revert if failed
      setSentRequests(prev => {
        const next = new Set(prev);
        next.delete(targetUsername);
        return next;
      });
      // Optional: You could add a toast notification here
      setError("Failed to connect. Please try again.");
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

  // Fetch Pending Invites (with Polling)
  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const res = await getPendingConnections();
        setPendingInvites(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to fetch pending invites", e);
      }
    };

    fetchInvites(); // Initial fetch
    const interval = setInterval(fetchInvites, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
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



  const handleSwitchInstance = (url: string) => {
    setPendingInstanceUrl(url);
    setShowSwitchConfirm(true);
  };

  const performSwitchInstance = () => {
    if (!pendingInstanceUrl) return;
    localStorage.setItem("INSTANCE_BASE_URL", pendingInstanceUrl);
    window.location.href = "/"; // Force reload to landing page on new instance
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col">

      {/* --- Top Navigation Bar --- */}
      <Navbar />

      {/* --- Main Content Grid --- */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-12 gap-8 h-full">

        {/* --- LEFT SIDEBAR: Available Users & Nav --- */}
        <aside className="md:col-span-3 hidden md:block h-full overflow-y-auto pb-4 scrollbar-hide space-y-6">
          {/* Navigation Links */}
          <SketchCard variant="paper" className="p-3 bg-white">
            <nav className="flex flex-col gap-2 font-hand text-lg">
              <Link to="/" className="flex items-center gap-3 px-3 py-2 hover:bg-black/5 rounded-lg transition-colors">
                <span>🏠</span> Home
              </Link>
              <Link to="/settings" className="flex items-center gap-3 px-3 py-2 hover:bg-black/5 rounded-lg transition-colors">
                <span>⚙️</span> Settings
              </Link>
            </nav>
          </SketchCard>

          <SketchCard variant="paper" className="p-4 bg-[var(--pastel-yellow)]">
            <h3 className="font-sketch text-xl mb-3 border-b-2 border-black/10 pb-2 flex justify-between items-center">
              Available Users
            </h3>
            <div className="space-y-2">
              {suggestedUsers.length > 0 ? (
                <>
                  {suggestedUsers.slice(0, showAllUsers ? undefined : 3).map((u: any) => (
                    <Link key={u.username} to={`/profile/${u.username}`} className="block group">
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/60 transition-colors border border-transparent hover:border-black/5 bg-white/30">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-[var(--pastel-mint)] border border-black flex items-center justify-center font-sketch text-md shrink-0 shadow-sm">
                          {u.username[0].toUpperCase()}
                        </div>

                        {/* Name & Instance */}
                        <div className="overflow-hidden flex-1 min-w-0 flex flex-col justify-center">
                          <div className="font-bold font-hand truncate text-sm leading-tight text-gray-800">
                            {u.username}
                          </div>
                          <div className="text-[10px] bg-black/5 px-1.5 py-0.5 rounded-full inline-block truncate w-fit max-w-full text-gray-600 mt-0.5 border border-black/5">
                            {u.instance || 'local'}
                          </div>
                        </div>

                        {/* Connect Button (Always visible, no overlap) */}
                        <div className="shrink-0 ml-1">
                          {sentRequests.has(u.username) ? (
                            <span className="text-[10px] font-hand text-green-600 bg-green-100 px-2 py-1 rounded-full border border-green-200 block text-center min-w-[50px]">
                              Sent
                            </span>
                          ) : (
                            <button
                              onClick={(e) => handleConnect(e, u.username)}
                              className="bg-[var(--ink-blue)] text-white text-[11px] px-2.5 py-1 rounded-md font-hand shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all flex items-center gap-1 active:scale-95"
                            >
                              Connect
                            </button>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}

                  {suggestedUsers.length > 3 && (
                    <button
                      onClick={() => setShowAllUsers(!showAllUsers)}
                      className="w-full text-center text-xs font-bold font-hand text-gray-500 hover:text-black mt-2 uppercase tracking-wide transition-colors"
                    >
                      {showAllUsers ? "Show Less" : "Show More"}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-6 font-hand opacity-50 text-sm">
                  <div>🔭</div>
                  Searching for signs...
                </div>
              )}
            </div>
          </SketchCard>
        </aside>


        {/* --- CENTER FEED --- */}
        <main
          ref={mainRef}
          onScroll={handleScroll}
          className="md:col-span-6 h-full overflow-y-auto px-2 pb-20 no-scrollbar relative"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="space-y-4">
            {/* Create Post Card */}
            <div className="relative z-10">
              <PostForm onPosted={() => loadPosts()} />
            </div>

            {/* Refresh / Feed Header (Aligned Professional Toggle) */}
            <div className="flex flex-col gap-4 relative z-20 mt-2 px-1">
              <div className="relative flex justify-center items-center h-12">

                {/* Toggle Switch - Centered & Fixed Width for perfect alignment */}
                <div className="bg-white border border-gray-200 p-1 rounded-full grid grid-cols-2 gap-2 relative w-[280px] shadow-sm">
                  {/* Sliding Background */}
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 bottom-1 rounded-full bg-black shadow-sm"
                    style={{
                      left: activeTab === 'global' ? '4px' : 'calc(50% + 4px)',
                      width: 'calc(50% - 8px)'
                    }}
                  />

                  <button
                    onClick={() => setActiveTab('global')}
                    className={`relative z-10 py-1.5 rounded-full font-bold text-sm transition-colors duration-200 flex justify-center items-center ${activeTab === 'global' ? 'text-white' : 'text-gray-500 hover:text-black'}`}
                  >
                    Global
                  </button>
                  <button
                    onClick={() => setActiveTab('following')}
                    className={`relative z-10 py-1.5 rounded-full font-bold text-sm transition-colors duration-200 flex justify-center items-center ${activeTab === 'following' ? 'text-white' : 'text-gray-500 hover:text-black'}`}
                  >
                    Following
                  </button>
                </div>

                {/* Extras Toggle (Mobile Only) */}
                <button
                  onClick={() => setShowMobileExtras(true)}
                  className="md:hidden w-10 h-10 ml-2 rounded-full bg-[var(--pastel-yellow)] border border-black flex items-center justify-center hover:scale-105 transition-transform font-bold text-xl relative"
                  title="Show Info"
                >
                  ℹ️
                  {pendingInvites.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white animate-pulse"></span>
                  )}
                </button>

                {/* Refresh Button - Absolute Right (Desktop) or next to toggle */}
                <button
                  onClick={loadPosts}
                  className="w-10 h-10 ml-2 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-sm"
                  title="Refresh Feed"
                >
                  ↻
                </button>
              </div>
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
              <div className="bg-[var(--pastel-pink)] border-2 border-red-400 p-4 rounded text-center font-hand text-red-800">
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
                      className="mb-1"
                    >
                      <SketchCard className="group transition-transform bg-white relative">
                        {/* Tape effect removed from top center for straight look */}

                        <div className="p-5">
                          {/* Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <Link to={`/profile/${parseUsername(p.author).username}`}>
                                <div className="w-10 h-10 rounded-full bg-gray-100 border border-black flex items-center justify-center font-bold font-marker text-sm">
                                  {parseUsername(p.author).username[0].toUpperCase()}
                                </div>
                              </Link>
                              <div>
                                <div className="font-bold font-sketch text-lg leading-none">
                                  <Link to={`/profile/${parseUsername(p.author).username}`} className="hover:underline">
                                    {parseUsername(p.author).username}
                                  </Link>
                                </div>
                                <div className="text-xs font-hand text-gray-500">{timeAgo(p.created_at)}</div>
                              </div>
                            </div>
                            {(p.origin_instance || parseUsername(p.author).instance) && (
                              <span className={`px-2 py-0.5 rounded text-xs border font-hand ${getInstanceColor(p.origin_instance || parseUsername(p.author).instance)}`}>
                                {getInstanceName(p.origin_instance || parseUsername(p.author).instance)}
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
                      className="mb-2"
                    >
                      <SketchCard className="group transition-transform bg-white relative">
                        {/* Tape effect removed */}

                        <div className="p-5">
                          {/* Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <Link to={`/profile/${parseUsername(p.author).username}`}>
                                <div className="w-10 h-10 rounded-full bg-gray-100 border border-black flex items-center justify-center font-bold font-marker text-sm">
                                  {parseUsername(p.author).username[0].toUpperCase()}
                                </div>
                              </Link>
                              <div>
                                <div className="font-bold font-sketch text-lg leading-none">
                                  <Link to={`/profile/${parseUsername(p.author).username}`} className="hover:underline">
                                    {parseUsername(p.author).username}
                                  </Link>
                                </div>
                                <div className="text-xs font-hand text-gray-500">{timeAgo(p.created_at)}</div>
                              </div>
                            </div>
                            {(p.origin_instance || parseUsername(p.author).instance) && (
                              <span className={`px-2 py-0.5 rounded text-xs border font-hand ${getInstanceColor(p.origin_instance || parseUsername(p.author).instance)}`}>
                                {getInstanceName(p.origin_instance || parseUsername(p.author).instance)}
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
          <SketchCard variant="paper" className="p-4 bg-[var(--pastel-pink)]">
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

          {/* Available Instances - New Card */}
          <SketchCard variant="paper" className="p-4 bg-[var(--pastel-blue)]">
            <h3 className="font-sketch text-xl mb-3 border-b-2 border-black/10 pb-2">Available Instances</h3>
            <div className="space-y-3">
              {INSTANCES.map((inst, index) => {
                const currentUrl = localStorage.getItem("INSTANCE_BASE_URL");
                // flexible check: match exact string or if current is null/empty assume A (if on A) or simply check if currentUrl contains the instance domain
                // For safety, let's normalize by removing trailing slash
                const normalize = (u: string | null) => u?.replace(/\/$/, "") || "";
                const isCurrent = normalize(currentUrl) === normalize(inst.url);

                return (
                  <div key={index} className={`p-3 rounded-lg border flex flex-col gap-1 ${inst.color} bg-white/50`}>
                    <div className="flex justify-between items-center">
                      <div className="font-bold font-sketch text-md">{inst.name}</div>
                      {isCurrent && <span className="text-[10px] font-bold bg-black/10 px-1.5 rounded-full text-black/60">CURRENT</span>}
                    </div>

                    {!isCurrent ? (
                      <button
                        onClick={() => handleSwitchInstance(inst.url)}
                        className="mt-2 text-xs bg-white border border-black/20 hover:bg-black/5 py-1 px-2 rounded font-bold self-start"
                      >
                        Switch to Instance
                      </button>
                    ) : (
                      <div className="mt-2 text-xs font-bold text-gray-400 select-none">
                        You are here
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SketchCard>

        </aside>

      </div>

      {/* Instance Switch Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSwitchConfirm}
        onClose={() => setShowSwitchConfirm(false)}
        onConfirm={performSwitchInstance}
        title="Switching Instance?"
        message="You will be logged out first and redirected to the new instance. Are you sure you want to proceed?"
        confirmText="Yes, Switch"
        confirmColor="bg-blue-600"
      />

      {/* MOBILE EXTRAS DRAWER (Available Users / Invites) */}
      <AnimatePresence>
        {showMobileExtras && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileExtras(false)}
              className="md:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 h-full w-4/5 max-w-sm bg-[var(--paper-white)] z-50 shadow-2xl overflow-y-auto p-4 border-l-2 border-black"
            >
              <div className="flex justify-between items-center mb-6 border-b-2 border-dashed border-gray-300 pb-4">
                <h2 className="font-sketch text-2xl">Extras</h2>
                <button
                  onClick={() => setShowMobileExtras(false)}
                  className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Mobile: Pending Invites */}
                <SketchCard variant="paper" className="p-4 bg-[var(--pastel-pink)]">
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

                {/* Mobile: Available Users */}
                <SketchCard variant="paper" className="p-4 bg-[var(--pastel-yellow)]">
                  <h3 className="font-sketch text-xl mb-3 border-b-2 border-black/10 pb-2">Available Users</h3>
                  <div className="space-y-2">
                    {suggestedUsers.slice(0, 5).map((u: any) => (
                      <Link key={u.username} to={`/profile/${u.username}`} onClick={() => setShowMobileExtras(false)} className="block group">
                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/60 transition-colors border border-transparent hover:border-black/5 bg-white/30">
                          <div className="w-8 h-8 rounded-full bg-[var(--pastel-mint)] border border-black flex items-center justify-center font-sketch text-sm shrink-0 shadow-sm">
                            {u.username[0].toUpperCase()}
                          </div>
                          <div className="overflow-hidden flex-1 min-w-0 flex flex-col justify-center">
                            <div className="font-bold font-hand truncate text-sm leading-tight text-gray-800">{u.username}</div>
                            <div className="text-[10px] bg-black/5 px-1.5 py-0.5 rounded-full inline-block truncate w-fit max-w-full text-gray-600 mt-0.5 border border-black/5">
                              {u.instance || 'local'}
                            </div>
                          </div>
                          {/* Connect Button */}
                          <div className="shrink-0 ml-1">
                            {sentRequests.has(u.username) ? (
                              <span className="text-[10px] font-hand text-green-600 bg-green-100 px-2 py-1 rounded-full border border-green-200 block text-center min-w-[30px]">✓</span>
                            ) : (
                              <button
                                onClick={(e) => handleConnect(e, u.username)}
                                className="bg-[var(--ink-blue)] text-white text-[10px] px-2 py-1 rounded-md font-hand shadow-sm active:scale-95"
                              >
                                Connect
                              </button>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </SketchCard>

                {/* Mobile: Available Instances */}
                <SketchCard variant="paper" className="p-4 bg-[var(--pastel-blue)]">
                  <h3 className="font-sketch text-xl mb-3 border-b-2 border-black/10 pb-2">Available Instances</h3>
                  <div className="space-y-3">
                    {INSTANCES.map((inst, index) => {
                      const currentUrl = localStorage.getItem("INSTANCE_BASE_URL");
                      const normalize = (u: string | null) => u?.replace(/\/$/, "") || "";
                      const isCurrent = normalize(currentUrl) === normalize(inst.url);
                      return (
                        <div key={index} className={`p-3 rounded-lg border flex flex-col gap-1 ${inst.color} bg-white/50`}>
                          <div className="flex justify-between items-center">
                            <div className="font-bold font-sketch text-md">{inst.name}</div>
                            {isCurrent && <span className="text-[10px] font-bold bg-black/10 px-1.5 rounded-full text-black/60">CURRENT</span>}
                          </div>
                          <div className="text-xs font-hand break-all opacity-70">{inst.url}</div>
                          {!isCurrent && (
                            <button
                              onClick={() => handleSwitchInstance(inst.url)}
                              className="mt-2 text-xs bg-white border border-black/20 hover:bg-black/5 py-1 px-2 rounded font-bold self-start"
                            >
                              Switch to Instance
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </SketchCard>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
