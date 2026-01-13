import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUser } from "../api/api";

export default function Profile() {
  const { identifier } = useParams<{ identifier: string }>();
  const username = identifier; // keep legacy variable name for display fallbacks
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ display_name: "", bio: "", email: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!identifier) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getUser(identifier!);
        if (!mounted) return;
        setUser(res.data);
      } catch (err: any) {
        console.error("Failed to load user", err);
        const serverBody = err?.response?.data;
        const serverMsg = serverBody && typeof serverBody === "object" ? JSON.stringify(serverBody) : serverBody || err?.message;
        setError(serverMsg || "User not found");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [username]);

  if (!username) {
    return (
      <div className="p-6">No username specified. Go back <Link to="/dashboard">Home</Link>.</div>
    );
  }

  function timeAgo(arg0: any): import("react").ReactNode {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        <div className="bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg p-6">
          {loading && <div className="text-sm text-surface-muted">Loading profile…</div>}
          {error && <div className="text-sm text-red-400">Error: {String(error)}</div>}

          {!loading && !error && user && (
            <div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[rgba(10,167,198,0.12)] overflow-hidden flex items-center justify-center text-[var(--primary)] font-bold">
                  {user.avatar_url ? (
                    // show avatar image when available
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    (user.username || username)[0]?.toUpperCase() || "U"
                  )}
                </div>
                <div>
                  <div className="text-2xl font-semibold">{user.display_name || user.username || username}</div>
                  <div className="text-sm text-surface-muted">@{user.username || username} • {user.instance || user.origin_instance || 'local'}</div>
                </div>
                <div className="ml-auto">
                  {localStorage.getItem("username") === user.username && (
                    <button
                      onClick={() => {
                        setEditMode((s) => !s);
                        // preload form
                        setForm({
                          display_name: user.display_name || "",
                          bio: user.bio || "",
                          email: user.email || "",
                        });
                        setAvatarPreview(user.avatar_url || null);
                      }}
                      className="bg-[var(--primary)] hover:bg-[var(--primary-600)] text-white rounded-md px-3 py-1 text-sm"
                    >
                      {editMode ? "Cancel" : "Edit profile"}
                    </button>
                  )}
                </div>
              </div>

              {user.bio && <p className="mt-4 text-surface">{user.bio}</p>}

              <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-surface-muted">
                <div>
                  <div className="text-xs text-surface-subtle">Email</div>
                  <div className="mt-1">{user.email || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-surface-subtle">Following</div>
                  <div className="mt-1">{user.following_count ?? user.following ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-surface-subtle">Followers</div>
                  <div className="mt-1">{user.followers_count ?? user.followers ?? "—"}</div>
                </div>
              </div>

              {/* Edit form */}
              {editMode && (
                <div className="mt-6 border-t pt-4">
                  <div className="grid gap-3">
                    <label className="text-xs text-surface-muted">Display name</label>
                    <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg px-3 py-2" />

                    <label className="text-xs text-surface-muted">Email</label>
                    <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg px-3 py-2" />

                    <label className="text-xs text-surface-muted">Bio</label>
                    <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg px-3 py-2" />

                    <label className="text-xs text-surface-muted">Avatar</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setAvatarFile(f);
                          if (f) {
                            const reader = new FileReader();
                            reader.onload = () => setAvatarPreview(String(reader.result));
                            reader.readAsDataURL(f);
                          } else {
                            setAvatarPreview(user.avatar_url || null);
                          }
                        }}
                      />
                      {avatarPreview && <img src={avatarPreview} alt="preview" className="w-12 h-12 rounded-full object-cover" />}
                    </div>

                    {saveError && <div className="text-sm text-red-400">{saveError}</div>}

                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={async () => {
                          setSaving(true);
                          setSaveError(null);
                          try {
                            // lazy import to avoid circular issues
                            // @ts-ignore
                            const api = await import("../api/api");
                            if (avatarFile) {
                              await api.uploadAvatar(user.username || username, avatarFile);
                            }
                            await api.updateUser(user.username || username, form);
                            // reload profile
                            const res = await api.getUser(user.username || username);
                            setUser(res.data);
                            setEditMode(false);
                          } catch (err: any) {
                            setSaveError(err?.response?.data || err?.message || String(err));
                          } finally {
                            setSaving(false);
                          }
                        }}
                        className="bg-[var(--primary)] hover:bg-[var(--primary-600)] text-white rounded-md px-4 py-1"
                        disabled={saving}
                      >
                        {saving ? "Saving…" : "Save changes"}
                      </button>

                      <button onClick={() => setEditMode(false)} className="border rounded-md px-4 py-1">Cancel</button>
                    </div>
                  </div>
                </div>
              )}

                          <div className="mt-4 text-sm text-surface-muted">
                            Joined: {timeAgo(user.created_at || user.joined)}
                          </div>
            </div>
          )}

          {!loading && !error && !user && (
            <div className="text-sm">No profile information available.</div>
          )}

        </div>
      </div>
    </div>
  );
}
