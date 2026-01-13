import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUser, updateUser, uploadAvatar } from "../api/api";
import GlassCard from "../components/GlassCard";
import { timeAgo } from "../utils/time";

export default function Profile() {
  const { identifier } = useParams<{ identifier: string }>();
  // Fallback if identifier is missing provided by router
  const username = identifier || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

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
        const res = await getUser(username);
        if (!mounted) return;
        setUser(res.data);
      } catch (err: any) {
        console.error("Failed to load user", err);
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
      // reload profile
      const res = await getUser(username);
      setUser(res.data);
      setEditMode(false);
    } catch (err: any) {
      setSaveError(err?.response?.data?.detail || err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Background style - simplified
  const background = (
    <div className="fixed inset-0 pointer-events-none -z-10 w-full h-full opacity-20">
      <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="dashGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0aa7c6" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#0f1720" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx="90%" cy="10%" r="400" fill="url(#dashGrad)" opacity="0.3" />
        <circle cx="10%" cy="90%" r="300" fill="#0aa7c6" opacity="0.1" />
      </svg>
    </div>
  );

  if (!username) {
    return <div className="p-8 text-center text-red-400">Invalid profile URL</div>;
  }

  return (
    <div className="min-h-screen relative text-surface p-4 md:p-8">
      {background}

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/dashboard" className="text-surface-subtle hover:text-[var(--primary)] transition-colors inline-flex items-center gap-2">
            Back to Dashboard
          </Link>
        </div>

        <GlassCard className="p-0 overflow-hidden">
          {/* Cover Banner Placeholder */}
          <div className="h-48 bg-[var(--bg-muted)] border-b border-[var(--muted-border)] w-full"></div>

          <div className="px-8 pb-8">
            {/* Header Section with Avatar */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 mb-8 relative">
              <div className="w-32 h-32 rounded-3xl bg-[var(--bg-surface)] p-1.5 shadow-xl border border-[var(--muted-border)]">
                {editMode && avatarPreview ? (
                  <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  user?.avatar_url ? (
                    <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-[var(--bg-muted)] flex items-center justify-center text-[var(--primary)] text-4xl font-bold">
                      {(user?.username || username)[0].toUpperCase()}
                    </div>
                  )
                )}
                {editMode && (
                  <label className="absolute bottom-0 right-0 bg-[var(--primary)] text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-[var(--primary-600)] transition-colors text-xs font-bold">
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

              <div className="flex-1 mt-4 md:mt-0">
                <h1 className="text-3xl font-bold">{user?.display_name || user?.username || username}</h1>
                <p className="text-surface-subtle">@{user?.username || username}</p>
                {user?.instance && <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/5 mt-1 inline-block">instance: {user.instance}</span>}
              </div>

              {isOwnProfile && !editMode && !loading && (
                <button
                  onClick={() => {
                    setEditMode(true);
                    setForm({
                      display_name: user.display_name || "",
                      bio: user.bio || "",
                      email: user.email || ""
                    });
                    setAvatarPreview(user.avatar_url);
                  }}
                  className="mt-4 md:mt-0 px-4 py-2 bg-[var(--muted-border)] hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] text-surface rounded-xl transition-colors font-medium border border-[var(--muted-border)]"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {loading && <div className="text-center py-12 text-surface-subtle">Loading profile data...</div>}
            {error && <div className="text-center py-12 text-red-400">Error: {error}</div>}

            {/* View Mode Content */}
            {!loading && !error && !editMode && user && (
              <div className="space-y-8">
                {user.bio && (
                  <div className="max-w-2xl">
                    <h3 className="text-sm font-semibold uppercase text-surface-subtle mb-2">About</h3>
                    <p className="text-lg leading-relaxed">{user.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-[var(--muted-border)]">
                  <div className="text-center sm:text-left">
                    <div className="text-2xl font-bold">{user.post_count || 0}</div>
                    <div className="text-sm text-surface-subtle">Posts</div>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-2xl font-bold">{user.followers_count || user.followers || 0}</div>
                    <div className="text-sm text-surface-subtle">Followers</div>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-2xl font-bold">{user.following_count || user.following || 0}</div>
                    <div className="text-sm text-surface-subtle">Following</div>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-2xl font-bold text-surface-subtle">{timeAgo(user.created_at || user.joined)}</div>
                    <div className="text-sm text-surface-subtle">Joined</div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Mode Form */}
            {editMode && (
              <div className="space-y-6 max-w-2xl animate-in fade-in zoom-in-95 duration-200">
                <div>
                  <label className="block text-sm font-medium mb-1 text-surface-muted">Display Name</label>
                  <input
                    value={form.display_name}
                    onChange={e => setForm({ ...form, display_name: e.target.value })}
                    className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-xl px-4 py-2 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-surface-muted">Bio</label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-xl px-4 py-2 focus:ring-2 focus:ring-[var(--primary)] outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-surface-muted">Email (Private)</label>
                  <input
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-xl px-4 py-2 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                  />
                </div>

                {saveError && <p className="text-red-400 text-sm">{saveError}</p>}

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[var(--primary)] hover:bg-[var(--primary-600)] text-white rounded-xl px-6 py-2 font-medium hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="text-surface-muted hover:text-surface px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
