import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUser, updateUser, uploadAvatar, deletePost } from "../api/api";
import SketchCard from "../components/SketchCard";
import { timeAgo } from "../utils/time";
import type { Post } from "../types/post";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const { identifier } = useParams<{ identifier: string }>();
  const username = identifier || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ display_name: "", bio: "", email: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isOwnProfile = localStorage.getItem("username") === username;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!username) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch User (which now includes access to their posts)
        const userRes = await getUser(username);

        if (!mounted) return;
        const userData = userRes.data;
        setUser(userData);

        // Map backend posts to frontend Post type
        // Backend returns: { id, content, created_at, ... }
        const userPosts: Post[] = (userData.posts || []).map((p: any) => ({
          id: p.id,
          content: p.content,
          created_at: p.created_at,
          author: username, // implicit
          author_id: userData.id,
          origin_instance: userData.instance || "", // implicit
          is_remote: false
        }));

        setPosts(userPosts);

      } catch (err: any) {
        console.error("Failed to load profile data", err);
        const serverMsg = err?.response?.data?.detail || err?.message || "User not found";
        setError(String(serverMsg));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [username]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      if (avatarFile) {
        await uploadAvatar(username, avatarFile);
      }
      await updateUser(username, form);
      const res = await getUser(username);
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

  if (!username) {
    return <div className="p-8 text-center text-red-400 font-marker">Invalid profile URL</div>;
  }

  
  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row">
      <div className="flex-1 max-w-7xl mx-auto w-full md:grid md:grid-cols-12 h-full">

        {/* --- Delete Confirmation Modal --- */}
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

        {/* --- Left Sidebar: Profile Info (Static on JS, Scrollable if content too long) --- */}
        <aside className="md:col-span-4 lg:col-span-3 h-full overflow-y-auto p-4 border-r border-dashed border-gray-300 bg-white/30 backdrop-blur-sm">
          <div className="mb-6">
            <Link to="/dashboard" className="font-hand text-xl hover:text-[var(--primary)] transition-colors inline-flex items-center gap-2">
              ← Back
            </Link>
          </div>

          <SketchCard variant="paper" pinned pinColor="#ef4444" className="p-6">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center text-center relative">
              <div className="w-32 h-32 rounded-full bg-[var(--bg-surface)] p-1.5 shadow-xl border-2 border-[var(--ink-primary)] mb-4">
                {editMode && avatarPreview ? (
                  <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover rounded-full" />
                ) : (
                  user?.avatar_url ? (
                    <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[var(--bg-muted)] flex items-center justify-center text-[var(--primary)] text-5xl font-sketch">
                      {(user?.username || username)[0].toUpperCase()}
                    </div>
                  )
                )}
                {editMode && (
                  <label className="absolute bottom-0 right-0 bg-[var(--primary)] text-white p-2 rounded-full cursor-pointer shadow-sketch hover:scale-105 transition-transform text-xs font-bold font-heading border-2 border-black">
                    EDIT
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

              <h1 className="text-3xl font-bold font-sketch mb-1 break-all">{user?.display_name || user?.username || username}</h1>
              <p className="text-lg font-hand text-[var(--ink-secondary)]">@{user?.username || username}</p>
              {user?.instance && <span className="text-xs px-2 py-0.5 mt-2 inline-block font-hand bg-black/5 rounded">instance: {user.instance}</span>}

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
                  className="mt-6 px-6 py-2 bg-white hover:bg-[var(--highlighter-yellow)] text-black border-2 border-black font-heading rounded transition-colors shadow-sketch w-full"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {loading && <div className="text-center py-8 font-hand text-lg">Loading info...</div>}
            {error && <div className="text-center py-8 text-red-500 font-heading">Error: {error}</div>}

            {/* Stats & Bio */}
            {!loading && !error && !editMode && user && (
              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-3 gap-2 py-4 border-y-2 border-dashed border-[var(--ink-secondary)]">
                  <div className="text-center">
                    <div className="text-2xl font-sketch">{posts.length || user.post_count || 0}</div>
                    <div className="text-sm font-hand text-[var(--ink-secondary)]">Posts</div>
                  </div>
                  <div className="text-center border-l border-dashed border-gray-400">
                    <div className="text-2xl font-sketch">{user.followers_count || 0}</div>
                    <div className="text-sm font-hand text-[var(--ink-secondary)]">Followers</div>
                  </div>
                  <div className="text-center border-l border-dashed border-gray-400">
                    <div className="text-2xl font-sketch">{user.following_count || 0}</div>
                    <div className="text-sm font-hand text-[var(--ink-secondary)]">Following</div>
                  </div>
                </div>

                {user.bio && (
                  <div className="font-hand text-lg leading-relaxed bg-[#fff] p-3 border border-dashed border-gray-300 shadow-sm relative">
                    <span className="absolute -top-3 left-2 bg-white px-1 text-xs font-marker text-gray-400">BIO</span>
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
        <main className="md:col-span-8 lg:col-span-9 h-full overflow-y-auto px-4 md:px-8 py-6 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          <h2 className="font-sketch text-3xl font-bold mb-8 flex items-center gap-2">
            <span className="text-4xl">📝</span>
            {isOwnProfile ? "My Scribbles" : `${username}'s Scribbles`}
          </h2>

          {!loading && !error && posts.length > 0 && (
            <div className="space-y-8 pb-20">
              <AnimatePresence mode="popLayout">
                {posts.map((p, idx) => (
                  <motion.div
                    layout
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 200, transition: { duration: 0.3 } }}
                    transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
                  >
                    <SketchCard className="p-6 relative group hover:scale-[1.01] transition-transform">
                      <div className="absolute -left-2 top-4 w-1 h-12 bg-[var(--ink-blue)] rounded-r opacity-50"></div>

                      {/* Delete Button for Owner */}
                      {isOwnProfile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent modal or other clicks
                            handleDeleteClick(p.id);
                          }}
                          className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 text-rose-500 hover:text-white hover:bg-rose-500 font-bold text-xl rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                          title="Delete Scribble"
                        >
                          ✕
                        </button>
                      )}

                      <div className="flex justify-between items-start mb-3 border-b border-dashed border-gray-300 pb-2">
                        <span className="font-hand text-sm text-[var(--ink-secondary)]">{timeAgo(p.created_at)}</span>
                        {p.origin_instance && <span className="font-marker text-xs bg-[var(--highlighter-yellow)] px-1 -rotate-1">@{p.origin_instance}</span>}
                      </div>
                      <div className="font-hand text-xl whitespace-pre-wrap leading-relaxed">
                        {p.content}
                      </div>
                    </SketchCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="text-center py-20 opacity-60">
              <div className="text-6xl mb-4">📄</div>
              <div className="font-sketch text-2xl">Blank Page</div>
              <p className="font-hand text-lg mt-2">No scribbles found for this user.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
