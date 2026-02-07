import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUser, updateUser, uploadAvatar, deletePost, initiateConnection, getConnectionCount, getConnectionsList, removeConnection } from "../api/api";
import SketchCard from "../components/SketchCard";
import { timeAgo } from "../utils/time";
import { parseUsername } from "../utils/user";
import { getInstanceName, getInstanceColor } from "../config/instances";
import type { Post } from "../types/post";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiEdit2, FiUserPlus, FiUserMinus, FiX, FiGrid, FiFileText, FiAlertCircle } from "react-icons/fi";

export default function Profile() {
  const { identifier } = useParams<{ identifier: string }>();
  // Ensure we work with the clean username for logic, but might need the raw one for API calls?
  // Actually, usually API expects the raw one if it's a URL, but for display we want the short one.
  const rawUsername = identifier || "";
  const { username, instance } = parseUsername(rawUsername);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [connectionCount, setConnectionCount] = useState<number | null>(null);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [connectionsList, setConnectionsList] = useState<any[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ display_name: "", bio: "", email: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // isOwnProfile check needs to be robust. 
  // If local storage has "Harish" and profile is "Harish", match.
  // If local has "Harish" and profile is "url.../Harish", match.
  const myUsername = localStorage.getItem("username");
  const isOwnProfile = myUsername === rawUsername || myUsername === username;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!username) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch User (which now includes access to their posts)
        // Pass the raw username (identifier) to the API as it might need the full URL for remote lookup
        const userRes = await getUser(rawUsername);

        if (!mounted) return;
        const userData = userRes.data;
        setUser(userData);

        // Map backend posts to frontend Post type
        // Backend returns: { id, content, created_at, ... }
        const userPosts: Post[] = (userData.posts || []).map((p: any) => ({
          id: p.id,
          content: p.content,
          created_at: p.created_at,
          author: rawUsername, // implicit
          author_id: userData.id,
          origin_instance: userData.instance || instance || "", // implicit from URL if not in data
          is_remote: false
        }));

        setPosts(userPosts);

        // Fetch connection count if it's my own profile
        if (isOwnProfile) {
          try {
            const connRes = await getConnectionCount();
            setConnectionCount(connRes.data.connection_count);
          } catch (e) {
            console.error("Failed to fetch connection count", e);
          }
        }

      } catch (err: any) {
        console.error("Failed to load profile data", err);
        const serverMsg = err?.response?.data?.detail || err?.message || "User not found";
        setError(String(serverMsg));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    setRequestSent(false); // Reset state when profile changes
    load();
    return () => { mounted = false; };
  }, [rawUsername]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      if (avatarFile) {
        await uploadAvatar(rawUsername, avatarFile);
      }
      await updateUser(rawUsername, form);
      const res = await getUser(rawUsername);
      setUser(res.data);
      setEditMode(false);
    } catch (err: any) {
      setSaveError(err?.response?.data?.detail || err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Delete confirmation state
  const [postToDelete, setPostToDelete] = useState<string | number | null>(null);

  const handleDeleteClick = (postId: string | number) => {
    setPostToDelete(postId);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    // Optimistic UI Update
    const previousPosts = [...posts];
    const newPosts = posts.filter(p => p.id !== postToDelete);
    setPosts(newPosts);
    setPostToDelete(null); // Close modal immediately

    try {
      await deletePost(postToDelete);
    } catch (err: any) {
      // Rollback on error
      setPosts(previousPosts);
      alert("Failed to delete post: " + (err?.response?.data?.detail || err.message));
    }
  };

  // Request Sent State
  const [requestSent, setRequestSent] = useState(false);

  const handleConnect = async () => {
    try {
      await initiateConnection(rawUsername);
      setRequestSent(true);
      // alert(`Request sent to ${username}!`); // Removed alert in favor of button state
    } catch (err: any) {
      if (err?.response?.status === 400 && err?.response?.data?.detail === "Request already sent") {
        setRequestSent(true);
      } else {
        alert("Failed to connect: " + (err?.response?.data?.detail || "Unknown error"));
      }
    }
  };

  const fetchConnectionsList = async () => {
    setLoadingConnections(true);
    try {
      const res = await getConnectionsList();
      setConnectionsList(res.data);
    } catch (e) {
      console.error("Failed to fetch connections", e);
    } finally {
      setLoadingConnections(false);
    }
  };

  // Check if we are already connected
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (showConnectionsModal) {
      fetchConnectionsList();
    }
  }, [showConnectionsModal]);

  // Initial check for connection status
  useEffect(() => {
    const checkConnection = async () => {
      if (!isOwnProfile && myUsername) {
        try {
          const res = await getConnectionsList(); // This returns all accepted connections
          const connectedUsernames = res.data.map((c: any) => c.username);
          if (connectedUsernames.includes(username)) {
            setIsConnected(true);
          } else {
            setIsConnected(false);
          }
        } catch (e) {
          console.error("Failed to check connection status", e);
        }
      }
    };
    checkConnection();
  }, [username, isOwnProfile, myUsername]);

  // Connection Removal Confirmation State
  const [connectionToRemove, setConnectionToRemove] = useState<string | null>(null);

  const handleRemoveClick = (targetUsername: string) => {
    setConnectionToRemove(targetUsername);
  };

  const confirmRemoveConnection = async () => {
    if (!connectionToRemove) return;

    // Optimistic UI update or wait for API? Let's wait for API to be safe, but we can close modal 
    const target = connectionToRemove;
    setConnectionToRemove(null); // Close modal

    try {
      await removeConnection(target);
      setConnectionsList(prev => prev.filter(c => c.username !== target));
      setConnectionCount(prev => (prev ? prev - 1 : 0));
      if (target === username) {
        setIsConnected(false);
      }
    } catch (e: any) {
      alert("Failed to remove connection: " + (e?.response?.data?.detail || "Unknown error"));
      // potentially re-fetch if optimistic failed, but here we just deleted it from view 
      // if it failed, we might want to reload the list? 
      fetchConnectionsList();
    }
  };

  if (!rawUsername) {
    return <div className="p-8 text-center text-red-400 font-marker">Invalid profile URL</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile: Back button at very top */}
      <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <Link to="/dashboard" className="font-hand text-lg hover:text-[var(--primary)] transition-colors inline-flex items-center gap-2">
          <FiArrowLeft className="text-xl" /> Back to Feed
        </Link>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:grid md:grid-cols-12 h-full">

        {/* --- Delete Post Confirmation Modal --- */}
        <AnimatePresence>
          {postToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.8, rotate: 5, opacity: 0 }}
              >
                <SketchCard variant="sticky" className="max-w-md w-full p-6 text-center border-2 border-red-500 shadow-xl bg-[#fffec8]">
                  <h3 className="font-sketch text-3xl font-bold text-red-600 mb-4">Wait a sec!</h3>
                  <div className="font-hand text-xl mb-8 text-[var(--ink-secondary)]">
                    Are you sure you want to crumple up and throw away this scribble?
                  </div>
                  <div className="flex justify-center gap-4 font-heading">
                    <button
                      onClick={() => setPostToDelete(null)}
                      className="px-6 py-2 bg-white border-2 border-[var(--ink-secondary)] text-[var(--ink-secondary)] rounded shadow-[2px_2px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-y-px transition-all"
                    >
                      Nah, keep it
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-6 py-2 bg-red-500 border-2 border-black text-white rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-px transition-all"
                    >
                      Yes, trash it!
                    </button>
                  </div>
                </SketchCard>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- Remove Connection Confirmation Modal --- */}
        <AnimatePresence>
          {connectionToRemove && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" style={{ zIndex: 60 }}>
              <motion.div
                initial={{ scale: 0.8, rotate: 5, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.8, rotate: -5, opacity: 0 }}
              >
                <SketchCard variant="sticky" className="max-w-md w-full p-6 text-center border-2 border-orange-500 shadow-xl bg-[#fff0f0]">
                  <h3 className="font-sketch text-3xl font-bold text-orange-600 mb-4">Unfriend?</h3>
                  <div className="font-hand text-xl mb-8 text-[var(--ink-secondary)]">
                    Are you sure you want to cut ties with <strong>{connectionToRemove}</strong>?
                  </div>
                  <div className="flex justify-center gap-4 font-heading">
                    <button
                      onClick={() => setConnectionToRemove(null)}
                      className="px-6 py-2 bg-white border-2 border-[var(--ink-secondary)] text-[var(--ink-secondary)] rounded shadow-[2px_2px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-y-px transition-all"
                    >
                      No, stay friends
                    </button>
                    <button
                      onClick={confirmRemoveConnection}
                      className="px-6 py-2 bg-orange-500 border-2 border-black text-white rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-px transition-all"
                    >
                      Yes, disconnect
                    </button>
                  </div>
                </SketchCard>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- Connections List Modal --- */}
        <AnimatePresence>
          {showConnectionsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={() => setShowConnectionsModal(false)}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-md w-full"
              >
                <SketchCard variant="paper" className="p-0 overflow-hidden bg-white max-h-[80vh] flex flex-col">
                  <div className="p-4 border-b border-dashed border-gray-300 flex justify-between items-center bg-[var(--pastel-blue)]">
                    <h3 className="font-sketch text-xl">Connections</h3>
                    <button onClick={() => setShowConnectionsModal(false)} className="hover:bg-black/10 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
                  </div>

                  <div className="p-4 overflow-y-auto min-h-[200px]">
                    {loadingConnections ? (
                      <div className="text-center py-8 font-hand text-gray-500">Loading...</div>
                    ) : connectionsList.length > 0 ? (
                      <div className="space-y-3">
                        {connectionsList.map((conn) => (
                          <div key={conn.username} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-colors">
                            <Link to={`/profile/${conn.username}`} onClick={() => setShowConnectionsModal(false)} className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[var(--pastel-mint)] border border-black flex items-center justify-center font-sketch text-lg">
                                {conn.username[0].toUpperCase()}
                              </div>
                              <span className="font-hand font-bold text-lg">{conn.username}</span>
                            </Link>
                            <button
                              onClick={() => handleRemoveClick(conn.username)}
                              className="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded border border-transparent hover:border-red-200 transition-colors"
                            >
                              Unfriend
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 font-hand text-gray-500 italic">
                        No connections yet. Go make some friends!
                      </div>
                    )}
                  </div>
                </SketchCard>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- Left Sidebar (Desktop) / Top Profile Card (Mobile) --- */}
        <aside className="md:col-span-4 lg:col-span-3 md:h-full md:overflow-y-auto p-3 sm:p-4 md:border-r border-dashed border-gray-300 bg-white/30 backdrop-blur-sm">
          {/* Back button - Desktop only */}
          <div className="mb-4 sm:mb-6 hidden md:block">
            <Link to="/dashboard" className="font-hand text-lg sm:text-xl hover:text-[var(--primary)] transition-colors inline-flex items-center gap-2">
              <FiArrowLeft /> Back
            </Link>
          </div>

          <SketchCard variant="paper" pinned pinColor="#ef4444" className="p-4 sm:p-6 bg-[var(--pastel-blue)] mobile-flat">
            {/* Avatar & Name - Instagram Style on Mobile */}
            <div className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-0 md:text-center relative">
              {/* Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-[var(--bg-surface)] p-1 sm:p-1.5 shadow-xl border-2 border-[var(--ink-primary)] md:mb-4 shrink-0">
                {editMode && avatarPreview ? (
                  <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover rounded-full" />
                ) : (
                  user?.avatar_url ? (
                    <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[var(--bg-muted)] flex items-center justify-center text-[var(--primary)] text-3xl sm:text-4xl md:text-5xl font-sketch">
                      {(user?.username || username)[0].toUpperCase()}
                    </div>
                  )
                )}
                {editMode && (
                  <label className="absolute bottom-0 right-0 bg-[var(--primary)] text-white p-1.5 sm:p-2 rounded-full cursor-pointer shadow-sketch hover:scale-105 transition-transform text-xs font-bold font-heading border-2 border-black">
                    <FiEdit2 className="text-sm" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setAvatarFile(f);
                        const reader = new FileReader();
                        reader.onload = () => setAvatarPreview(String(reader.result));
                        reader.readAsDataURL(f);
                      }
                    }} />
                  </label>
                )}
              </div>

              {/* Name & Handle - Right of avatar on mobile, Below on desktop */}
              <div className="flex-1 md:flex-none text-left md:text-center min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-sketch mb-0.5 sm:mb-1 truncate md:break-all">{parseUsername(user?.username).username || username}</h1>
                <p className="text-sm sm:text-base md:text-lg font-hand text-[var(--ink-secondary)] truncate">@{parseUsername(user?.username).username || username}</p>
                {(user?.instance || instance) && (
                  <span className={`px-2 py-0.5 mt-1 sm:mt-2 inline-block font-hand rounded text-[10px] sm:text-xs border ${getInstanceColor(user?.instance || instance)}`}>
                    {getInstanceName(user?.instance || instance)}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons - Compact on mobile */}
            <div className="w-full mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2">
              {/* Edit Button */}
              {isOwnProfile && !editMode && !loading && (
                <button
                  onClick={() => {
                    setEditMode(true);
                    setForm({
                      display_name: user?.display_name || "",
                      bio: user?.bio || "",
                      email: user?.email || ""
                    });
                    setAvatarPreview(user?.avatar_url);
                  }}
                  className="flex-1 px-4 sm:px-6 py-2 bg-white hover:bg-[var(--highlighter-yellow)] text-black border-2 border-black font-heading rounded transition-colors shadow-sketch flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FiEdit2 /> Edit Profile
                </button>
              )}

              {/* Connect Button for Others */}
              {!isOwnProfile && !loading && (
                isConnected ? (
                  <button
                    onClick={() => handleRemoveClick(username || rawUsername)}
                    className="flex-1 px-4 sm:px-6 py-2 bg-white text-red-500 border-2 border-red-500 font-heading rounded transition-colors shadow-sketch hover:bg-red-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <FiUserMinus /> Unfriend
                  </button>
                ) : (
                  requestSent ? (
                    <button
                      disabled
                      className="flex-1 px-4 sm:px-6 py-2 bg-gray-200 text-gray-500 border-2 border-gray-300 font-heading rounded cursor-not-allowed shadow-none text-sm sm:text-base"
                    >
                      Request Sent
                    </button>
                  ) : (
                    <button
                      onClick={handleConnect}
                      className="flex-1 px-4 sm:px-6 py-2 bg-[var(--ink-blue)] text-white border-2 border-black font-heading rounded transition-colors shadow-sketch hover:scale-[1.02] hover:shadow-none flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <FiUserPlus /> Connect
                    </button>
                  )
                )
              )}
            </div>

            {loading && <div className="text-center py-6 sm:py-8 font-hand text-base sm:text-lg">Loading info...</div>}
            {error && (
              <div className="py-6 sm:py-8 px-3 sm:px-4 text-center">
                <FiAlertCircle className="text-4xl sm:text-5xl mx-auto mb-3 text-red-400" />
                <h3 className="font-sketch text-lg sm:text-xl font-bold text-red-500 mb-2">Whoops!</h3>
                <div className="font-hand text-base sm:text-lg text-[var(--ink-secondary)] bg-red-50 border-2 border-dashed border-red-300 p-3 rounded">
                  {error}
                </div>
                <p className="mt-4 font-hand text-xs sm:text-sm text-gray-500">
                  We couldn't find this scribbler. They might be on another instance!
                </p>
              </div>
            )}

            {/* Stats & Bio - Horizontal on mobile like Instagram */}

            {!loading && !error && !editMode && user && (
              <div className="mt-4 sm:mt-8 space-y-4 sm:space-y-6">
                {/* Stats Row - Always horizontal */}
                <div className="flex justify-around py-3 sm:py-4 border-y-2 border-dashed border-[var(--ink-secondary)]">
                  <div className="text-center flex-1">
                    <div className="text-lg sm:text-2xl font-sketch">{posts.length || user.post_count || 0}</div>
                    <div className="text-xs sm:text-sm font-hand text-[var(--ink-secondary)]">Posts</div>
                  </div>

                  {isOwnProfile && (
                    <div
                      className="text-center flex-1 border-l border-dashed border-gray-400 cursor-pointer hover:bg-black/5 active:bg-black/10 transition-colors rounded"
                      onClick={() => setShowConnectionsModal(true)}
                    >
                      <div className="text-lg sm:text-2xl font-sketch">{connectionCount ?? "-"}</div>
                      <div className="text-xs sm:text-sm font-hand text-[var(--ink-secondary)]">Connections</div>
                    </div>
                  )}
                </div>

                {/* Bio - Compact on mobile */}
                {user.bio && (
                  <div className="font-hand text-sm sm:text-lg leading-relaxed bg-[#fff] p-2.5 sm:p-3 border border-dashed border-gray-300 shadow-sm relative">
                    <span className="absolute -top-2.5 sm:-top-3 left-2 bg-white px-1 text-[10px] sm:text-xs font-marker text-gray-400">BIO</span>
                    {user.bio}
                  </div>
                )}
              </div>
            )}

            {/* Edit Form */}
            {editMode && (
              <div className="mt-6 space-y-4 border-t-2 border-dashed border-black pt-4">
                <div>
                  <label className="block text-sm font-heading mb-1">Display Name</label>
                  <input
                    value={form.display_name}
                    onChange={e => setForm({ ...form, display_name: e.target.value })}
                    className="w-full font-hand text-lg border-b-2 border-black px-1 focus:border-[var(--primary)] outline-none bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-heading mb-1">Bio</label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    className="w-full font-hand text-lg border-2 border-[var(--ink-secondary)] rounded p-2 focus:border-[var(--primary)] outline-none bg-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-heading mb-1">Email</label>
                  <input
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full font-hand text-lg border-b-2 border-black px-1 focus:border-[var(--primary)] outline-none bg-transparent"
                  />
                </div>
                {saveError && <p className="text-red-500 font-hand text-sm">{saveError}</p>}

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[var(--primary)] text-white border-2 border-black font-heading px-4 py-2 rounded shadow-sketch"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="text-[var(--ink-secondary)] font-hand hover:underline py-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </SketchCard>
        </aside>

        {/* --- Right Main: User Posts (Scrollable) --- */}
        <main className="md:col-span-8 lg:col-span-9 flex-1 md:h-full overflow-y-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          <h2 className="font-sketch text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 flex items-center gap-2">
            <FiGrid className="text-xl sm:text-2xl md:text-4xl" />
            {isOwnProfile ? "My Scribbles" : `${username}'s Scribbles`}
          </h2>

          {!loading && !error && posts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 pb-20">
              <AnimatePresence mode="popLayout">
                {posts.map((p, index) => (
                  <motion.div
                    layout
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="h-full"
                  >
                    <SketchCard
                      variant="paper"
                      className={`p-3 sm:p-4 relative group h-full flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300 mobile-flat ${index % 2 === 0 ? 'md:-rotate-1' : 'md:rotate-1'}`}
                    >
                      {/* Decorative Tape Removed */}

                      {/* Delete Button for Owner */}
                      {isOwnProfile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(p.id);
                          }}
                          className="absolute -top-2 -right-2 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-white text-rose-500 hover:text-white hover:bg-rose-500 active:bg-rose-600 border-2 border-rose-100 hover:border-rose-600 font-bold text-sm sm:text-lg rounded-full shadow-sm md:opacity-0 md:group-hover:opacity-100 transition-all z-20"
                          title="Delete Scribble"
                        >
                          <FiX />
                        </button>
                      )}

                      <div className="flex justify-between items-start mb-2 border-b border-dashed border-gray-300 pb-2">
                        <span className="font-hand text-xs text-[var(--ink-secondary)]">{timeAgo(p.created_at)}</span>
                        {p.origin_instance && <span className="font-marker text-[10px] bg-[var(--highlighter-yellow)] px-1 rounded-sm">@{p.origin_instance}</span>}
                      </div>

                      <div className="font-hand text-base whitespace-pre-wrap leading-snug flex-grow">
                        {p.content}
                      </div>

                      {/* Optional Footer/Action Area */}
                      <div className="mt-3 pt-2 border-t border-dotted border-gray-200 flex justify-end opacity-50 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-heading text-gray-400">#{p.id}</span>
                      </div>
                    </SketchCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="text-center py-12 sm:py-20 opacity-60">
              <FiFileText className="text-4xl sm:text-6xl mx-auto mb-4" />
              <div className="font-sketch text-xl sm:text-2xl">Blank Page</div>
              <p className="font-hand text-base sm:text-lg mt-2">No scribbles found for this user.</p>
            </div>
          )}
        </main>

      </div >
    </div >
  );
}
