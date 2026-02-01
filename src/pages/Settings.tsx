import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUser, updateUser, uploadAvatar } from "../api/api";
import GlassCard from "../components/GlassCard";

export default function Settings() {
  const username = localStorage.getItem("username") || "";

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ display_name: "", email: "", bio: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!username) return;
      setLoading(true);
      try {
        const res = await getUser(username);
        if (!mounted) return;
        setUser(res.data);
        setForm({
          display_name: res.data.display_name || "",
          email: res.data.email || "",
          bio: res.data.bio || "",
        });
        setAvatarPreview(res.data.avatar_url || null);
      } catch (err: any) {
        setError(err?.response?.data || err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [username]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (avatarFile && username) {
        await uploadAvatar(username, avatarFile);
      }
      await updateUser(username, form);
      setSuccess("Success! Your settings have been saved.");
      const res = await getUser(username);
      setUser(res.data);
      setAvatarPreview(res.data.avatar_url || avatarPreview);
    } catch (err: any) {
      setError(err?.response?.data || err?.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSignOutDelete = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    localStorage.removeItem("access_token");
    localStorage.removeItem("AUTH_TOKEN");
    window.location.href = "/auth/login";
  }

  return (
    <div className="min-h-screen relative text-surface p-4 md:p-8">

      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link to="/dashboard" className="text-surface-subtle hover:text-[var(--primary)] transition-colors inline-flex items-center gap-2">
            Back to Dashboard
          </Link>
        </div>

        <GlassCard className="p-8">
          <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
          <p className="text-surface-muted mb-8 text-sm">Update your profile and manage your preferences.</p>

          {loading && <div className="text-center py-8">Loading settings...</div>}

          {!loading && user && (
            <div className="space-y-8">
              {/* Public Profile Section */}
              <section>
                <h2 className="text-sm uppercase tracking-wider text-surface-subtle font-semibold mb-4 border-b border-[var(--muted-border)] pb-2">
                  Public Profile
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-surface-muted">Display Name</label>
                    <input
                      value={form.display_name}
                      onChange={e => setForm({ ...form, display_name: e.target.value })}
                      className="w-full bg-[var(--bg-muted)]/50 border border-[var(--muted-border)] rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-surface-muted">About</label>
                    <textarea
                      rows={3}
                      value={form.bio}
                      onChange={e => setForm({ ...form, bio: e.target.value })}
                      className="w-full bg-[var(--bg-muted)]/50 border border-[var(--muted-border)] rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[var(--primary)]/50 outline-none transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-surface-muted">Avatar</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-[var(--bg-muted)] p-1 border border-[var(--muted-border)]">
                        {avatarPreview ? (
                          <img src={avatarPreview} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-white/5 rounded-lg text-surface-subtle">
                            {username[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <label className="px-4 py-2 bg-[var(--muted-border)] hover:bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg cursor-pointer transition-colors text-sm font-medium">
                        Upload New
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
                    </div>
                  </div>
                </div>
              </section>

              {/* Account Section */}
              <section>
                <h2 className="text-sm uppercase tracking-wider text-surface-subtle font-semibold mb-4 border-b border-[var(--muted-border)] pb-2">
                  Account Security
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-surface-muted">Email Address</label>
                    <input
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-[var(--bg-muted)]/50 border border-[var(--muted-border)] rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[var(--primary)]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-surface-muted">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      disabled
                      className="w-full bg-[var(--bg-muted)]/30 border border-[var(--muted-border)] rounded-xl px-4 py-2.5 text-surface-subtle cursor-not-allowed"
                    />
                    <p className="text-xs text-surface-subtle mt-1">To change your password, please contact your instance administrator.</p>
                  </div>
                </div>
              </section>

              {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">{error}</div>}
              {success && <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm text-center">{success}</div>}

              <div className="pt-4 flex items-center justify-between border-t border-[var(--muted-border)]">
                <button
                  onClick={handleSignOutDelete}
                  className="text-red-400 hover:text-red-300 text-sm font-medium px-2 py-1"
                >
                  Sign Out / Delete Account
                </button>

                <div className="flex gap-3">
                  <Link to="/dashboard" className="px-5 py-2.5 text-surface-muted hover:text-surface font-medium">Cancel</Link>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[var(--primary)] hover:bg-[var(--primary-600)] text-white px-8 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
