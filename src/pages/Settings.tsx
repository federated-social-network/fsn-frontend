import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, updateUser, uploadAvatar } from "../api/api";

export default function Settings() {
  const navigate = useNavigate();
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
      // if avatar file selected, upload it first
      if (avatarFile && username) {
        await uploadAvatar(username, avatarFile);
      }
      // update profile fields
      await updateUser(username, form);
      setSuccess("Settings saved.");
      // refresh user
      const res = await getUser(username);
      setUser(res.data);
      setAvatarPreview(res.data.avatar_url || avatarPreview);
    } catch (err: any) {
      setError(err?.response?.data || err?.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    // destructive action placeholder: actual API may differ and should require confirmation
    if (!confirm("Delete your account? This action cannot be undone.")) return;
    // If backend supports an endpoint, call it here. For now, just clear localStorage and redirect.
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        <div className="bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg p-6 shadow-md">
          <h1 className="text-2xl font-semibold mb-2">Settings</h1>
          <p className="text-sm text-surface-muted mb-6">Manage your account, privacy and profile settings.</p>

          {loading && <div className="text-sm text-surface-muted">Loading…</div>}
          {error && <div className="text-sm text-red-400 mb-3">{String(error)}</div>}
          {success && <div className="text-sm text-green-400 mb-3">{String(success)}</div>}

          {!loading && user && (
            <div className="grid gap-4">
              <section className="bg-[var(--bg-muted)] p-4 rounded-lg border border-[var(--muted-border)]">
                <h2 className="font-semibold mb-2">Profile</h2>
                <div className="grid gap-2">
                  <label className="text-xs text-surface-muted">Display name</label>
                  <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg px-3 py-2" />

                  <label className="text-xs text-surface-muted">Email</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg px-3 py-2" />

                  <label className="text-xs text-surface-muted">Bio</label>
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg px-3 py-2" />

                  <label className="text-xs text-surface-muted">Avatar</label>
                  <div className="flex items-center gap-3">
                    <input type="file" accept="image/*" onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setAvatarFile(f);
                      if (f) {
                        const reader = new FileReader();
                        reader.onload = () => setAvatarPreview(String(reader.result));
                        reader.readAsDataURL(f);
                      }
                    }} />
                    {avatarPreview && <img src={avatarPreview} alt="preview" className="w-12 h-12 rounded-full object-cover" />}
                  </div>
                </div>
              </section>

              <section className="bg-[var(--bg-muted)] p-4 rounded-lg border border-[var(--muted-border)]">
                <h2 className="font-semibold mb-2">Security</h2>
                <div className="grid gap-2">
                  <label className="text-xs text-surface-muted">Change password</label>
                  <input type="password" placeholder="New password" className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg px-3 py-2" />
                  <div className="text-xs text-surface-subtle">Password change requires backend support. Use the API endpoint for updating passwords.</div>
                </div>
              </section>

              <section className="bg-[var(--bg-muted)] p-4 rounded-lg border border-[var(--muted-border)]">
                <h2 className="font-semibold mb-2">Notifications</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email notifications</div>
                    <div className="text-xs text-surface-subtle">Receive email when someone follows you or comments on your post</div>
                  </div>
                  <input type="checkbox" checked={true} readOnly />
                </div>
              </section>

              <div className="flex items-center gap-3 mt-2">
                <button onClick={handleSave} disabled={saving} className="bg-[var(--primary)] hover:bg-[var(--primary-600)] text-white rounded-md px-4 py-2">
                  {saving ? "Saving…" : "Save settings"}
                </button>
                <button onClick={handleDeleteAccount} className="border border-red-600 text-red-400 rounded-md px-4 py-2">Delete account</button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
