import PostForm from "../components/PostForm";
import Navbar from "../components/Navbar";
import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getPosts, getRandomUsers, initiateConnection, acceptConnection, getPendingConnections, getFollowedPosts } from "../api/api";
import { INSTANCES } from "../config/instances";
import type { Post } from "../types/post";
import SketchCard from "../components/SketchCard";
import SkeletonPost from "../components/SkeletonPost";
import PostCard from "../components/PostCard";
import UserSearchModal from "../components/UserSearchModal";
import { AnimatePresence, motion } from "framer-motion";
import { FiSearch, FiRefreshCw, FiArrowUp, FiUsers, FiAlertTriangle } from "react-icons/fi";
import ConfirmationModal from "../components/ConfirmationModal";



/**
 * The main dashboard component.
 * Displays the user feed, suggested users, and allows creating new posts.
 * Handles switching between global and following feeds, and instance switching.
 *
 * @returns {JSX.Element} The rendered Dashboard.
 */
export default function Dashboard() {

  const [posts, setPosts] = useState<Post[]>([]);
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [pendingInstanceUrl, setPendingInstanceUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPosts();
      const postsData = res.data || [];
      const normalized = postsData.map((p: any) => ({
        ...p,
        avatar_url: p.avatar_url || p.profile_url || null,
        image_url: p.image_url || null,
      }));
      const sortedPosts = normalized.sort((a: Post, b: Post) => {
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
          instance: u.instance || 'local',
          avatar_url: u.avatar_url || null
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
  }, []);

  // Fetch Following Feed
  useEffect(() => {
    if (activeTab === 'following') {
      const loadFollowing = async () => {
        setLoadingFollowing(true);
        try {
          const res = await getFollowedPosts();
          const data = res.data || [];
          const normalized = data.map((p: any) => ({
            ...p,
            avatar_url: p.avatar_url || p.profile_url || null,
            image_url: p.image_url || null,
          }));
          const sorted = normalized.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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




  // Handle scroll to show buttons
  const handleScroll = () => {
    if (!mainRef.current) return;
    const scrollTop = mainRef.current.scrollTop;



    // Show "Scroll Top" button if scrolled down significantly
    if (scrollTop > 300) {
      setShowScrollTopBtn(true);
    } else {
      setShowScrollTopBtn(false);
    }
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
    // Clear auth tokens before switching instance
    localStorage.removeItem("AUTH_TOKEN");
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    // Set the new instance URL
    localStorage.setItem("INSTANCE_BASE_URL", pendingInstanceUrl);
    // Redirect to login page for the new instance
    window.location.href = "/auth/login";
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col">

      {/* --- Top Navigation Bar --- */}
      <Navbar />

      {/* --- Main Content Grid --- */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 h-full">

        {/* --- LEFT SIDEBAR: Available Users --- */}
        <aside className="md:col-span-3 hidden md:block h-full overflow-y-auto pb-4 scrollbar-hide space-y-6">
          <div className="relative rounded-xl border-2 border-black overflow-hidden" style={{ backgroundColor: '#fef9c3' }}>

            {/* Header */}
            <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b-2 border-black/10">
              <h3 className="font-sketch text-lg text-gray-900 flex items-center gap-2">
                <FiUsers className="text-base" />
                People nearby
              </h3>
              <button
                onClick={() => setShowSearchModal(true)}
                className="text-gray-500 hover:text-black hover:scale-110 active:scale-95 transition-all p-1 border-none shadow-none"
                title="Find users"
              >
                <FiSearch className="text-lg" />
              </button>
            </div>

            {/* User List */}
            <div className="p-3 space-y-2">
              {suggestedUsers.length > 0 ? (
                <>
                  <div className={`space-y-2 ${showAllUsers ? 'max-h-[320px] overflow-y-auto pr-1' : ''}`} style={{ scrollbarWidth: 'thin' }}>
                    {suggestedUsers.slice(0, showAllUsers ? undefined : 4).map((u: any, i: number) => (
                      <motion.div
                        key={u.username}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.05 }}
                      >
                        <Link to={`/profile/${u.username}`} className="block group border-none">
                          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/50 hover:bg-white/80 border border-black/5 hover:border-black/15 transition-all">
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full border-2 border-black bg-[var(--pastel-mint)] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                              {u.avatar_url ? (
                                <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-bold text-gray-700 font-sketch">
                                  {u.username[0].toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* Name & Instance */}
                            <div className="overflow-hidden flex-1 min-w-0">
                              <div className="font-bold text-sm text-gray-800 truncate leading-tight font-hand">
                                {u.username}
                              </div>
                              <div className="text-[10px] text-gray-500 truncate mt-0.5 font-hand">
                                {u.instance || 'local'}
                              </div>
                            </div>

                            {/* Connect Button */}
                            <div className="shrink-0">
                              {sentRequests.has(u.username) ? (
                                <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full border border-green-300 block text-center font-hand">
                                  Sent ✓
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => handleConnect(e, u.username)}
                                  className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-black text-white hover:bg-gray-800 active:scale-95 transition-all border-none shadow-[1px_1px_0px_rgba(0,0,0,0.3)] font-hand"
                                >
                                  Connect+
                                </button>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {suggestedUsers.length > 4 && (
                    <button
                      onClick={() => setShowAllUsers(!showAllUsers)}
                      className="w-full text-center text-xs font-bold text-gray-500 hover:text-black mt-2 py-1.5 transition-colors border-none shadow-none font-hand uppercase tracking-wider"
                    >
                      {showAllUsers ? "Show less" : "View all"}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-6 font-hand text-sm text-gray-500">
                  <FiSearch className="text-2xl mx-auto mb-2 opacity-40" />
                  Looking around...
                </div>
              )}
            </div>
          </div>
        </aside>


        {/* --- CENTER FEED --- */}
        <main
          ref={mainRef}
          onScroll={handleScroll}
          className="col-span-1 md:col-span-6 h-full overflow-y-auto px-1 sm:px-2 pb-36 sm:pb-32 no-scrollbar relative mobile-scroll"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="space-y-4">
            {/* Create Post Card (Desktop Only) */}
            <div className="relative z-10 hidden md:block">
              <PostForm onPosted={() => loadPosts()} />
            </div>

            {/* Refresh / Feed Header (Aligned Professional Toggle) */}
            <div className="flex flex-col gap-3 sm:gap-4 relative z-20 mt-2 px-1">
              <div className="relative flex justify-center items-center h-12">

                {/* Toggle Switch - Responsive width */}
                <div className="bg-white border border-gray-200 p-1 rounded-full grid grid-cols-2 gap-1 sm:gap-2 relative w-[220px] sm:w-[280px] shadow-sm">
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
                    className={`relative z-10 py-1.5 rounded-full font-bold text-xs sm:text-sm transition-colors duration-200 flex justify-center items-center ${activeTab === 'global' ? 'text-white' : 'text-gray-500 hover:text-black'}`}
                  >
                    Global
                  </button>
                  <button
                    onClick={() => setActiveTab('following')}
                    className={`relative z-10 py-1.5 rounded-full font-bold text-xs sm:text-sm transition-colors duration-200 flex justify-center items-center ${activeTab === 'following' ? 'text-white' : 'text-gray-500 hover:text-black'}`}
                  >
                    Following
                  </button>
                </div>

                {/* Extras Toggle (Mobile Only) - REMOVED AS IT IS IN BOTTOM NAV */}

                {/* Refresh Button */}
                <button
                  onClick={loadPosts}
                  className="w-10 h-10 sm:w-10 sm:h-10 ml-2 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white active:scale-95 transition-all shadow-sm text-lg"
                  title="Refresh Feed"
                >
                  <FiRefreshCw className="text-base" />
                </button>
              </div>
            </div>



            {/* Scroll to Top */}
            <AnimatePresence>
              {showScrollTopBtn && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={handleScrollToTop}
                  className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-30 bg-black text-white w-12 h-12 sm:w-10 sm:h-10 rounded-full shadow-xl flex items-center justify-center hover:bg-[var(--ink-blue)] active:scale-95 transition-all text-lg"
                >
                  <FiArrowUp />
                </motion.button>
              )}
            </AnimatePresence>



            {/* ERROR */}
            {error && (
              <div className="bg-[var(--pastel-pink)] border-2 border-red-400 p-4 rounded text-center font-hand text-red-800 flex items-center justify-center gap-2">
                <FiAlertTriangle /> {String(error)}
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
                {!loading && posts.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}

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

                {!loadingFollowing && followedPosts.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}

                {!loadingFollowing && followedPosts.length === 0 && (
                  <div className="text-center py-20 opacity-60">
                    <FiUsers className="text-5xl mx-auto mb-4" />
                    <div className="font-sketch text-2xl">Following Feed</div>
                    <p className="font-hand text-lg mt-2">No posts from your circle yet.</p>
                    <p className="font-hand text-sm text-gray-500">Connect with people to see their scribbles here!</p>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Spacer for bottom safe area */}
          <div className="h-20 sm:h-16" />
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
                    <div className="font-hand text-sm flex-1 break-all pr-2">
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

      <UserSearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />

    </div>
  );
}
